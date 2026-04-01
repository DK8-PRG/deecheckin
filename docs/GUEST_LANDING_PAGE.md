# DeeCheckIn — Architektura v2

> Kompletní přepracování URL struktury, check-in flow a párování hostů.
> Verze: 2.0 | Datum: 2026-03-31
> **Stav implementace**: Fáze 1 ✅ + Fáze 2 ✅ hotovy. Fáze 3 (párování) neimplementována.

---

## 1. Klíčové změny oproti v1

| Oblast                  | v1 (současný stav)                    | v2 (nový návrh)                             |
| ----------------------- | ------------------------------------- | ------------------------------------------- |
| **Hlavní stránka**      | `/` = admin dashboard                 | `/[slug]` = guest landing page              |
| **Admin**               | `/dashboard`, `/properties`... (flat) | `/admin/dashboard`, `/admin/properties`...  |
| **Check-in**            | Vyžaduje `book_number`                | Nezávislý — host vyplní údaje bez rezervace |
| **Párování**            | Automatické přes `book_number`        | Ruční/smart v admin panelu                  |
| **URL prefix**          | `/p/[slug]`                           | `/[slug]` (přímo pod locale)                |
| **Guest → Reservation** | `reservation_id` povinný              | `reservation_id` volitelný (nullable)       |

---

## 2. URL struktura

### Veřejné routes (host — bez přihlášení)

| URL                             | Popis                                          |
| ------------------------------- | ---------------------------------------------- |
| `/[locale]/[slug]`              | Guest Landing Page — hlavní vstup pro hosty    |
| `/[locale]/[slug]/checkin`      | Nezávislý check-in formulář pro danou property |
| `/[locale]/[slug]#availability` | Scroll na kalendář dostupnosti                 |
| `/[locale]/[slug]#contact`      | Scroll na kontakt                              |

### Admin routes (ubytovatel — vyžaduje přihlášení)

| URL                            | Popis                                          |
| ------------------------------ | ---------------------------------------------- |
| `/[locale]/admin`              | Admin dashboard (redirect na /admin/dashboard) |
| `/[locale]/admin/dashboard`    | Dashboard se statistikami                      |
| `/[locale]/admin/properties`   | CRUD správa ubytování                          |
| `/[locale]/admin/reservations` | CRUD správa rezervací                          |
| `/[locale]/admin/guests`       | Přehled hostů + párování s rezervacemi         |
| `/[locale]/admin/login`        | Přihlášení                                     |
| `/[locale]/admin/register`     | Registrace                                     |

### Routing logika (Next.js App Router)

```
src/app/[locale]/
├── [slug]/
│   ├── page.tsx              # Guest Landing (veřejná)
│   └── checkin/
│       └── page.tsx          # Nezávislý check-in (veřejná)
├── admin/
│   ├── layout.tsx            # Admin layout s DashboardShell
│   ├── page.tsx              # Redirect na dashboard
│   ├── dashboard/page.tsx    # Dashboard
│   ├── properties/page.tsx   # Správa properties
│   ├── reservations/page.tsx # Správa rezervací
│   ├── guests/page.tsx       # Hosté + párování
│   ├── login/page.tsx        # Login
│   └── register/page.tsx     # Registrace
```

**Konflikty**: Statické routes (`admin/`) mají v Next.js prioritu před dynamickými (`[slug]/`), takže `/admin` NIKDY nebude interpretován jako slug.

---

## 3. Nový check-in flow (bez závislosti na rezervaci)

### Současný flow (v1) — NAHRADIT

```
Host zná book_number → hledá rezervaci → vyplní formulář → automatické spárování
```

### Nový flow (v2)

```
Host přijde na /[slug]/checkin → vyplní:
  1. Datum příjezdu + odjezdu + počet hostů
  2. Pro každého hosta: jméno, doklad, adresa... (domovní kniha)
  3. GDPR souhlas + review
→ Uloží se jako "nepárovaný check-in" na danou property
→ Ubytovatel v admin panelu spáruje s rezervací
```

### Check-in formulář — kroky

**Krok 1: Základní info**

- Datum příjezdu (date picker, default = dnes)
- Datum odjezdu (date picker)
- Počet hostů (1–10, stepper)
- "Další" →

**Krok 2: Údaje hostů**

- Pro KAŽDÉHO hosta (dle počtu z kroku 1):
  - Jméno, příjmení
  - Datum narození
  - Národnost
  - Doklad (typ + číslo + stát vydání) — jen pro ne-české hosty (superRefine)
  - Adresa (ulice, město, PSČ, stát)
  - Účel pobytu
- Tab/accordion pro přepínání mezi hosty
- "Další" →

**Krok 3: Review + souhlas**

- Souhrn všech údajů
- GDPR checkbox
- "Odeslat check-in" →

**Krok 4: Potvrzení**

- ✅ Check-in přijat
- Zobrazí pokyny: WiFi, přístupový kód, domovní řád, kontakt
- (Citlivé údaje se zobrazí hned — host právě dokončil check-in)

---

## 4. Databázové změny

### 4.1 Tabulka `guests` — úpravy

```sql
-- reservation_id se stane NULLABLE (nepárovaný check-in)
ALTER TABLE guests ALTER COLUMN reservation_id DROP NOT NULL;

-- Přidat přímý odkaz na property (pro nepárované check-iny)
ALTER TABLE guests ADD COLUMN property_id UUID REFERENCES properties(id);

-- Check-in datumy (host zadá sám)
ALTER TABLE guests ADD COLUMN check_in_date DATE;
ALTER TABLE guests ADD COLUMN check_out_date DATE;

-- Kdy byl spárován s rezervací
ALTER TABLE guests ADD COLUMN paired_at TIMESTAMPTZ;

-- Skupina hostů — hosté ze stejného check-inu sdílejí checkin_group_id
ALTER TABLE guests ADD COLUMN checkin_group_id UUID DEFAULT gen_random_uuid();

-- Index pro rychlé hledání nepárovaných
CREATE INDEX idx_guests_unpaired
  ON guests (property_id)
  WHERE reservation_id IS NULL;
```

### 4.2 Napojení

| guest.reservation_id | guest.property_id | Stav                           |
| -------------------- | ----------------- | ------------------------------ |
| `NULL`               | UUID              | Nepárovaný — čeká na spárování |
| UUID                 | UUID              | Spárovaný s rezervací          |

### 4.3 `checkin_group_id`

Všichni hosté ze stejného check-in formuláře sdílejí `checkin_group_id`:

- Zobrazit hosty jako skupinu v admin panelu
- Spárovat celou skupinu najednou s jednou rezervací

---

## 5. Párovací flow v admin panelu

### Stránka: `/admin/guests`

**Zobrazení:**

1. **Nepárovaní hosté** — seznam skupin čekajících na spárování
   - Zobrazí: jména hostů, datum příjezdu/odjezdu, property, počet ve skupině
   - Akce: "Spárovat s rezervací"

2. **Spárovaní hosté** — přehled blokově (grouped by reservation)

**Smart párování (dialog):**

1. Systém navrhne matching rezervace na základě:
   - Stejná property
   - Překrývající se datumy (check-in/out ±1 den tolerance)
   - Podobné jméno (guest_names ↔ first_name + last_name)
2. Ubytovatel vybere správnou rezervaci nebo vytvoří novou
3. "Spárovat" → nastaví `reservation_id` + `paired_at` na všechny hosty ve skupině
4. Status rezervace se změní na `checked_in`

---

## 6. Guest Landing Page — stávající komponenty

Existující `src/components/guest/` zůstávají s úpravami:

- `GuestLanding.tsx` — orchestrátor
- `PropertyHero.tsx` — hero sekce
- `QuickActions.tsx` — CTA "Check-in" → `/[slug]/checkin`
- `AvailabilityCalendar.tsx` — kalendář (beze změn)
- `GuestInfoSection.tsx` — pokyny (zobrazí se po check-inu)
- `ContactSection.tsx` — kontakt (beze změn)

**Hlavní změna v CTA**: "Online Check-in" bude odkazovat na `/[slug]/checkin` (nový nezávislý formulář) místo hledání přes book_number.

---

## 7. Implementační plán

### Fáze 1: Route refaktor ✅ HOTOVO

1. ✅ Přesunout admin stránky pod `src/app/[locale]/admin/`
2. ✅ Přesunout guest landing z `/p/[slug]` na `/[slug]`
3. ✅ Aktualizovat middleware (public/private paths)
4. ✅ Aktualizovat navigaci (sidebar, odkazy)
5. ⚠️ Starý `/checkin` route ponechán jako legacy (funguje paralelně)

### Fáze 2: Nezávislý check-in ✅ HOTOVO

1. ✅ DB migrace: guests tabulka (nullable reservation_id, property_id, dates, group_id)
2. ✅ Nový route `/[slug]/checkin/page.tsx`
3. ✅ Nový check-in wizard (IndependentCheckinWizard — 3 kroky)
4. ✅ Server actions + service pro ukládání nepárovaných check-inů
5. ✅ Zobrazení pokynů po úspěšném check-inu

### Fáze 3: Admin párování ❌ NEIMPLEMENTOVÁNO

1. ❌ Nová stránka `/admin/guests`
2. ❌ Přehled nepárovaných check-inů (grouped by checkin_group_id)
3. ❌ Smart matching algoritmus (property + datumy + jméno)
4. ❌ Párovací dialog
5. ❌ Aktualizace reservation status při spárování

---

## 8. Bezpečnost

- **Veřejné routes** (`/[slug]`, `/[slug]/checkin`): žádná auth, anon RLS
- **Admin routes** (`/admin/*` kromě login/register): vyžadují přihlášení
- **Citlivé údaje** (WiFi, access code): zobrazí se po dokončení check-inu
- **RLS**: guests INSERT pro anon (check-in bez přihlášení), property_id povinný
- **Slug validace**: regex `/^[a-z0-9-]+$/`, max 100 znaků
- **GDPR**: souhlas povinný, data jen pro zákonné účely (domovní kniha)
