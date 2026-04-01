# DeeCheckIn — Produkční Roadmapa

> **Účel**: Rozfázovaný plán implementace k produkčnímu nasazení.
> **Stav**: ZASTARALÉ — Fáze 1.0–1.5 jsou hotové. Aktuální roadmapa je v `PROJECT_STATUS.md` sekce 10.
> **Datum**: 31. března 2026

---

## Obsah

1. [Aktuální stav](#1-aktuální-stav)
2. [Známé bugy a tech debt](#2-známé-bugy-a-tech-debt)
3. [Fáze 1.0 — Stabilizace](#3-fáze-10--stabilizace)
4. [Fáze 1.1 — Property Settings](#4-fáze-11--property-settings)
5. [Fáze 1.2 — iCal Sync (Booking + Airbnb)](#5-fáze-12--ical-sync)
6. [Fáze 1.3 — Post-check-in instrukce](#6-fáze-13--post-check-in-instrukce)
7. [Fáze 1.4 — Check-in link a šablona zprávy](#7-fáze-14--check-in-link-a-šablona-zprávy)
8. [Fáze 1.5 — Double-booking prevence](#8-fáze-15--double-booking-prevence)
9. [Fáze 1.6 — Pre-launch checklist](#9-fáze-16--pre-launch-checklist)
10. [Fáze 2 — Profesionální produkt](#10-fáze-2--profesionální-produkt)
11. [Fáze 3 — Škálování](#11-fáze-3--škálování)
12. [DB změny — přehled](#12-db-změny--přehled)
13. [Rozhodnutí k diskuzi](#13-rozhodnutí-k-diskuzi)

---

## 1. Aktuální stav

### ✅ Funguje

| Feature            | Detaily                                                        |
| ------------------ | -------------------------------------------------------------- |
| Auth (email+heslo) | Login, registrace, logout, session refresh, middleware ochrana |
| Properties CRUD    | Vytvoření, editace, smazání přes dialogy                       |
| Reservations CRUD  | Tabulka, vytvoření/editace/smazání, status badges              |
| Check-in wizard    | 3-krokový formulář (info → hosté → review), Zod validace       |
| Check-in vyhledání | Host zadá book_number → nalezení rezervace                     |
| Dashboard          | 4 stats karty, posledních 8 rezervací                          |
| i18n (cs/en)       | ~170 klíčů, LanguageSwitcher                                   |
| RLS                | Všechny tabulky, veřejný INSERT pro check-in                   |

### ❌ Chybí

| Feature                                  | Use Case     |
| ---------------------------------------- | ------------ |
| Booking/Airbnb iCal sync                 | UC-03, UC-04 |
| Property settings (instrukce, WiFi, kód) | UC-13        |
| Post-check-in instrukce                  | UC-11        |
| Šablona check-in zprávy pro majitele     | UC-09        |
| Kalendářový view                         | UC-06        |
| Double-booking prevence (UI)             | UC-08        |
| Email notifikace                         | UC-09        |
| Export knihy hostů                       | UC-12        |

---

## 2. Známé bugy a tech debt

### Bugy k opravě

| #    | Bug                                                                    | Soubor                                   | Závažnost       |
| ---- | ---------------------------------------------------------------------- | ---------------------------------------- | --------------- |
| B-01 | Duplicitní import z `reservations.repository`                          | `src/app/[locale]/reservations/page.tsx` | 🟡 Warning      |
| B-02 | Dvě pole pro status (`status` + `reservation_status`) — nekonzistentní | `reservations` tabulka                   | 🟡 Konfuze      |
| B-03 | `findOverlapping()` existuje v repo ale nikde se nepoužívá             | `reservations.repository.ts`             | 🟡 Mrtvý kód    |
| B-04 | Silent catch v `server.ts` při cookie chybě                            | `src/lib/supabase/server.ts`             | 🟢 Minor        |
| B-05 | Zustand v `package.json` ale nepoužívá se                              | `package.json`                           | 🟢 Zbytečná dep |

### Tech debt

| #     | Položka                                                   | Detaily                                |
| ----- | --------------------------------------------------------- | -------------------------------------- |
| TD-01 | Žádné `error.tsx` soubory                                 | Neošetřená chyba crashne celou stránku |
| TD-02 | Žádné `loading.tsx` soubory                               | Jen text "Načítání…", žádné skeletony  |
| TD-03 | Hardcoded české chybové hlášky v repositories             | Nejsou přes i18n                       |
| TD-04 | Žádné testy                                               | Zero unit/integration/e2e              |
| TD-05 | `guest_id` integer v `reservations` je legacy/redundantní | Zbytečný sloupec                       |

### Rozhodnutí ke statusu (`status` vs `reservation_status`)

**Současný stav:**

- `status` — výchozí `'pending'`, používá se v service vrstvě
- `reservation_status` — `'CHECKED_IN'`, `'CHECKED_OUT'`, používá se v check-in flow
- Kód často dělá `reservation_status ?? status`

**Návrh:** Sjednotit na jedno pole `status` s hodnotami:

```
pending → confirmed → checked_in → checked_out → cancelled
```

> ⚠️ **ROZHODNUTÍ**: Sjednotit teď ve Fázi 1.0, nebo později? (viz sekce 13)

---

## 3. Fáze 1.0 — Stabilizace

> **Cíl**: Opravit bugy, přidat error boundaries, stabilní základ před novými features.

### Úkoly

| #     | Úkol                                    | Detaily                                                              | Use Case |
| ----- | --------------------------------------- | -------------------------------------------------------------------- | -------- |
| 1.0.1 | Fix B-01: import warning                | Sloučit importy v `reservations/page.tsx`                            | —        |
| 1.0.2 | Přidat `error.tsx`                      | Pro routes: `/dashboard`, `/properties`, `/reservations`, `/checkin` | —        |
| 1.0.3 | Přidat `loading.tsx`                    | Skeleton loading pro hlavní stránky                                  | —        |
| 1.0.4 | Sjednotit status pole                   | Rozhodnout a migrovat `status`/`reservation_status` → jedno pole     | —        |
| 1.0.5 | Odstranit Zustand z dependencies        | `npm uninstall zustand`                                              | —        |
| 1.0.6 | Přidat source pole do ReservationInsert | Aby se při iCal importu mohlo nastavit `source: 'booking'`           | UC-03    |

### DB migrace (Fáze 1.0)

```sql
-- Pokud se rozhodneš sjednotit status:
-- 1. Přenést data z reservation_status do status
UPDATE reservations
  SET status = reservation_status
  WHERE reservation_status IS NOT NULL;

-- 2. Smazat starý sloupec (POZOR: až po úpravě kódu!)
-- ALTER TABLE reservations DROP COLUMN reservation_status;
```

### Acceptance criteria

- [ ] Build projde bez warnings
- [ ] Chyba na stránce zobrazí error boundary, ne bílou stránku
- [ ] Stránky mají skeleton loading
- [ ] Jedno pole `status` s jasnými hodnotami

---

## 4. Fáze 1.1 — Property Settings

> **Cíl**: Majitel může ke každé property nastavit příjezdové instrukce, WiFi, kód, pravidla.
> **Závisí na**: Fáze 1.0

### Nové sloupce v `properties` tabulce

| Sloupec                | Typ  | Popis                              |
| ---------------------- | ---- | ---------------------------------- |
| `checkin_instructions` | text | Jak se dostat, kde vyzvednout klíč |
| `access_code`          | text | Kód ke dveřím / číslo klíčenky     |
| `wifi_name`            | text | Název WiFi sítě                    |
| `wifi_password`        | text | Heslo k WiFi                       |
| `house_rules`          | text | Domovní řád, pravidla              |
| `contact_phone`        | text | Telefon na majitele                |
| `contact_email`        | text | Email na majitele                  |
| `ical_booking_url`     | text | iCal feed URL z Booking.com        |
| `ical_airbnb_url`      | text | iCal feed URL z Airbnb             |

### Úkoly

| #     | Úkol                                        | Detaily                                                  |
| ----- | ------------------------------------------- | -------------------------------------------------------- |
| 1.1.1 | DB migrace — přidat sloupce do `properties` | SQL ALTER TABLE                                          |
| 1.1.2 | Aktualizovat typy                           | `Property`, `PropertyInsert`, `PropertyUpdate`           |
| 1.1.3 | Aktualizovat Zod schema                     | `property.schema.ts`                                     |
| 1.1.4 | Property settings UI                        | Nový tab/sekce v property editaci: instrukce + iCal URLs |
| 1.1.5 | Server Action pro update settings           | Rozšířit `updatePropertyAction`                          |
| 1.1.6 | i18n klíče pro nová pole                    | cs.json + en.json                                        |

### DB migrace (Fáze 1.1)

```sql
ALTER TABLE properties
  ADD COLUMN checkin_instructions text,
  ADD COLUMN access_code text,
  ADD COLUMN wifi_name text,
  ADD COLUMN wifi_password text,
  ADD COLUMN house_rules text,
  ADD COLUMN contact_phone text,
  ADD COLUMN contact_email text,
  ADD COLUMN ical_booking_url text,
  ADD COLUMN ical_airbnb_url text;
```

### Acceptance criteria

- [ ] Majitel vidí v editaci property záložku "Nastavení"
- [ ] Může vyplnit instrukce, WiFi, kód, pravidla, kontakt
- [ ] Může vložit iCal URL pro Booking a Airbnb
- [ ] Data se ukládají a zobrazují správně
- [ ] iCal URLs se validují (začínají `https://`)

---

## 5. Fáze 1.2 — iCal Sync

> **Cíl**: Import rezervací z Booking.com a Airbnb přes iCal feed.
> **Závisí na**: Fáze 1.1 (iCal URLs uloženy v properties)
> **Toto je největší nový feature.**

### Architektura

```
                    ┌──────────────┐
                    │  properties  │
                    │  (iCal URLs) │
                    └──────┬───────┘
                           │
              ┌────────────┼────────────┐
              ▼                         ▼
     Booking iCal URL            Airbnb iCal URL
     (HTTP GET .ics)             (HTTP GET .ics)
              │                         │
              ▼                         ▼
     ┌────────────────┐        ┌────────────────┐
     │ Booking Parser │        │ Airbnb Parser  │
     └───────┬────────┘        └───────┬────────┘
             │                         │
             ▼                         ▼
     ┌─────────────────────────────────────┐
     │     Normalized Reservation          │
     │  { uid, guest_name, check_in,       │
     │    check_out, source, reference }   │
     └──────────────────┬──────────────────┘
                        │
                        ▼
     ┌─────────────────────────────────────┐
     │          Sync Service               │
     │  - deduplikace (by UID)             │
     │  - upsert do DB                     │
     │  - detekce cancelled                │
     └─────────────────────────────────────┘
```

### Nový sloupec v `reservations`

| Sloupec              | Typ         | Popis                          |
| -------------------- | ----------- | ------------------------------ |
| `ical_uid`           | text UNIQUE | UID z iCal pro deduplikaci     |
| `external_reference` | text        | Booking/Airbnb číslo rezervace |

### Nové soubory

| Soubor                                | Účel                                              |
| ------------------------------------- | ------------------------------------------------- |
| `src/lib/ical/parser.ts`              | Generický iCal parser (.ics → strukturovaná data) |
| `src/lib/ical/booking-adapter.ts`     | Booking-specifické mapování                       |
| `src/lib/ical/airbnb-adapter.ts`      | Airbnb-specifické mapování                        |
| `src/lib/ical/types.ts`               | Typy pro iCal události                            |
| `src/services/ical-sync.service.ts`   | Sync logika (fetch → parse → upsert)              |
| `src/actions/ical-sync.ts`            | Server Action pro manuální sync                   |
| `src/app/api/cron/ical-sync/route.ts` | API route pro automatický cron (Vercel Cron)      |

### Úkoly

| #      | Úkol                                                 | Detaily                                                                                 |
| ------ | ---------------------------------------------------- | --------------------------------------------------------------------------------------- |
| 1.2.1  | DB migrace — přidat `ical_uid`, `external_reference` | ALTER TABLE reservations                                                                |
| 1.2.2  | iCal parser                                          | Parse `.ics` formátu → pole VEVENT objektů                                              |
| 1.2.3  | Booking adapter                                      | Extrakce: jméno, datumy, booking reference, počet hostů z Booking formátu               |
| 1.2.4  | Airbnb adapter                                       | Extrakce: jméno, datumy, Airbnb reference z Airbnb formátu                              |
| 1.2.5  | Sync service                                         | Fetch feed → parse → porovnání s DB → upsert nových, update změněných, cancel zrušených |
| 1.2.6  | Deduplikace                                          | Matchování přes `ical_uid` — pokud existuje, update; pokud ne, insert                   |
| 1.2.7  | Server Action pro manuální sync                      | Tlačítko "Synchronizovat" v UI                                                          |
| 1.2.8  | Cron route                                           | `POST /api/cron/ical-sync` volaný každých 15 min přes Vercel Cron                       |
| 1.2.9  | UI — sync tlačítko                                   | Na property stránce indikátor posledního syncu + tlačítko "Sync teď"                    |
| 1.2.10 | UI — zdroj rezervace                                 | Badge "Booking" / "Airbnb" / "Vlastní" u każdé rezervace                                |
| 1.2.11 | Aktualizovat typy + schema                           | `Reservation`, `ReservationInsert` — nové sloupce                                       |
| 1.2.12 | i18n klíče                                           | Texty pro sync UI, zdroje, status hlášky                                                |

### DB migrace (Fáze 1.2)

```sql
ALTER TABLE reservations
  ADD COLUMN ical_uid text,
  ADD COLUMN external_reference text;

-- Unique index pro deduplikaci
CREATE UNIQUE INDEX idx_reservations_ical_uid
  ON reservations(ical_uid)
  WHERE ical_uid IS NOT NULL;
```

### Sync logika (pseudokód)

```
function syncProperty(property):
  for each icalUrl in [property.ical_booking_url, property.ical_airbnb_url]:
    if !icalUrl: continue

    events = fetch(icalUrl) → parseIcal()
    source = detectSource(icalUrl)  // 'booking' | 'airbnb'

    for each event in events:
      existing = findByIcalUid(event.uid)

      if !existing:
        // Nová rezervace
        createReservation({
          property_id: property.id,
          user_id: property.user_id,
          ical_uid: event.uid,
          external_reference: event.bookingReference,
          guest_names: event.guestName,
          check_in: event.startDate,
          check_out: event.endDate,
          source: source,
          status: mapStatus(event.status),  // confirmed | cancelled
          people: event.guestCount,
          phone_number: event.phone,
        })
      else if hasChanges(existing, event):
        // Aktualizace
        updateReservation(existing.id, changedFields)

    // Detekce smazaných: rezervace v DB které nejsou ve feedu
    // → označ jako cancelled (ne smazat!)
```

### Vercel Cron konfigurace

```json
// vercel.json
{
  "crons": [
    {
      "path": "/api/cron/ical-sync",
      "schedule": "*/15 * * * *"
    }
  ]
}
```

### Acceptance criteria

- [ ] Majitel vloží Booking iCal URL → klikne Sync → vidí importované rezervace
- [ ] Majitel vloží Airbnb iCal URL → klikne Sync → vidí importované rezervace
- [ ] Importované rezervace mají badge zdroje (Booking/Airbnb)
- [ ] Duplicitní import nevytvoří duplikáty (deduplikace přes `ical_uid`)
- [ ] Zrušené rezervace se označí jako cancelled
- [ ] Automatický sync běží každých 15 minut
- [ ] Neplatný iCal URL → jasná chybová hláška

---

## 6. Fáze 1.3 — Post-check-in instrukce

> **Cíl**: Po dokončení check-inu host vidí příjezdové instrukce.
> **Závisí na**: Fáze 1.1 (property settings obsahují instrukce)

### Úkoly

| #     | Úkol                         | Detaily                                                        |
| ----- | ---------------------------- | -------------------------------------------------------------- |
| 1.3.1 | Success stránka po check-inu | Po odeslání formuláře → zobrazit stránku s instrukcemi         |
| 1.3.2 | Načtení instrukcí z property | Check-in wizard po úspěšném odeslání → fetch property settings |
| 1.3.3 | Layout instrukční stránky    | Zobrazit: adresa, jak se dostat, kód, WiFi, pravidla, kontakt  |
| 1.3.4 | Fallback bez instrukcí       | Pokud majitel nenastavil instrukce → "Kontaktujte majitele"    |
| 1.3.5 | i18n                         | Překlady pro instrukční stránku                                |

### UI návrh — instrukční stránka

```
┌──────────────────────────────────────────┐
│  ✅ Check-in dokončen!                   │
│                                          │
│  Instrukce k příjezdu                    │
│  ─────────────────────                   │
│                                          │
│  📍 Adresa                               │
│  Dlouhá 123, Praha 1                    │
│                                          │
│  🔑 Přístupový kód                       │
│  1234#                                   │
│                                          │
│  📶 WiFi                                 │
│  Síť: ApartmentWifi                      │
│  Heslo: welcome2024                      │
│                                          │
│  📋 Domovní řád                          │
│  • Klid po 22:00                         │
│  • Nekuřácký byt                         │
│                                          │
│  📞 Kontakt na majitele                  │
│  +420 123 456 789                        │
│  host@email.cz                           │
│                                          │
│  ℹ️  Další instrukce                      │
│  Klíč najdete v klíčovém boxu vedle...  │
│                                          │
└──────────────────────────────────────────┘
```

### Acceptance criteria

- [ ] Po úspěšném check-inu host vidí instrukční stránku
- [ ] Zobrazují se data z property settings (kód, WiFi, pravidla...)
- [ ] Pokud instrukce nejsou nastaveny → smysluplný fallback
- [ ] Stránka je čitelná na mobilu (responzivní)
- [ ] Texty jsou v jazyce, který host zvolil (cs/en)

---

## 7. Fáze 1.4 — Check-in link a šablona zprávy

> **Cíl**: Majitel může snadno sdílet check-in link s hostem.  
> **Závisí na**: Fáze 1.2 (importované rezervace mají `external_reference`)

### Úkoly

| #     | Úkol                                | Detaily                                             |
| ----- | ----------------------------------- | --------------------------------------------------- |
| 1.4.1 | Tlačítko "Zkopírovat check-in link" | U každé rezervace v tabulce                         |
| 1.4.2 | Šablona check-in zprávy             | Dialog s předvyplněnou zprávou pro hosta            |
| 1.4.3 | Konfigurovatelná šablona            | Majitel si může upravit výchozí text                |
| 1.4.4 | Lookup by `external_reference`      | Rozšířit check-in vyhledávání (nejen `book_number`) |
| 1.4.5 | Lookup by příjmení + datum          | Fallback vyhledávání (UC-10 varianta C)             |
| 1.4.6 | i18n pro šablony                    | Zpráva v češtině i angličtině                       |

### Check-in link formáty

```
# Přímý link na check-in search (host zadá číslo):
https://deecheckin.com/cs/checkin

# Link s předvyplněným číslem:
https://deecheckin.com/cs/checkin?ref=4051234567

# Link s book_number (zpětná kompatibilita):
https://deecheckin.com/cs/checkin?book=42
```

### Šablona zprávy (výchozí)

```
🇨🇿 Česky:
Dobrý den [guest_name],
děkujeme za Vaši rezervaci. Prosím vyplňte online check-in před příjezdem:
[check-in-link]
Děkujeme a těšíme se na Vás!

🇬🇧 English:
Dear [guest_name],
Thank you for your reservation. Please complete your online check-in before arrival:
[check-in-link]
Thank you and we look forward to welcoming you!
```

### UI — tlačítko u rezervace

```
┌─────────────────────────────────────────────────────┐
│ Rezervace #42 | Jan Novák | 15.4. → 18.4. | Booking│
│                                                     │
│ [📋 Zkopírovat check-in link]  [💬 Šablona zprávy] │
└─────────────────────────────────────────────────────┘
```

### Acceptance criteria

- [ ] U každé rezervace je tlačítko "Zkopírovat check-in link"
- [ ] Kliknutí zkopíruje link do schránky + toast "Zkopírováno"
- [ ] Tlačítko "Šablona zprávy" otevře dialog s předvyplněnou zprávou
- [ ] Zpráva obsahuje jméno hosta a link
- [ ] Host může najít rezervaci i přes booking reference (nejen book_number)
- [ ] Host může najít rezervaci přes příjmení + datum check-in

---

## 8. Fáze 1.5 — Double-booking prevence

> **Cíl**: Varování při překrývajících se rezervacích.
> **Závisí na**: Fáze 1.2 (importované rezervace z různých zdrojů)

### Úkoly

| #     | Úkol                                  | Detaily                                                                   |
| ----- | ------------------------------------- | ------------------------------------------------------------------------- |
| 1.5.1 | Napojit `findOverlapping()` na create | Při vytváření ruční rezervace kontrolovat kolizi                          |
| 1.5.2 | Napojit `findOverlapping()` na sync   | Při importu z iCal detekovat kolizi                                       |
| 1.5.3 | Warning banner                        | Na dashboard zobrazit varování pokud existuje kolize                      |
| 1.5.4 | Overlap indikátor v tabulce           | Zvýrazněná / červená rezervace pokud koliduje                             |
| 1.5.5 | Rozhodovací dialog                    | Při ruční tvorbě: "Pozor, na tyto dny už existuje rezervace. Pokračovat?" |

### Overlap detekce (SQL)

```sql
-- Existující funkce v repositories, jen napojit:
SELECT * FROM reservations
WHERE property_id = $1
  AND id != $2  -- vyloučit sám sebe (při editaci)
  AND status != 'cancelled'
  AND check_in < $check_out   -- new.check_out
  AND check_out > $check_in   -- new.check_in
```

### Acceptance criteria

- [ ] Při vytvoření ruční rezervace → warning pokud kolize
- [ ] Při iCal importu → kolize se označí (neblokuje import)
- [ ] Na dashboard je viditelné varování pokud existují kolize
- [ ] Zrušené (`cancelled`) rezervace se nepočítají

---

## 9. Fáze 1.6 — Pre-launch checklist

> **Cíl**: Vše potřebné před zveřejněním.

### Povinné (právní požadavky)

| #     | Položka                       | Detaily                                             |
| ----- | ----------------------------- | --------------------------------------------------- |
| 1.6.1 | GDPR / Privacy Policy stránka | Zpracování osobních údajů hostů. Povinné ze zákona. |
| 1.6.2 | Obchodní podmínky             | VOP pro uživatele služby                            |
| 1.6.3 | Souhlas s cookies             | Cookie banner (pokud budeme mít analytics)          |

### Technické

| #     | Položka                    | Detaily                                          |
| ----- | -------------------------- | ------------------------------------------------ |
| 1.6.4 | Produkční Supabase projekt | Oddělený od development, s vlastními credentials |
| 1.6.5 | Doména + DNS               | Registrace domény (deecheckin.cz / .com)         |
| 1.6.6 | Vercel deploy              | Production deployment, environment variables     |
| 1.6.7 | SSL certifikát             | Automaticky přes Vercel                          |
| 1.6.8 | DB zálohy                  | Supabase Point-in-Time Recovery zapnuté          |
| 1.6.9 | Environment variables      | Separate `.env.production`                       |

### Vizuální

| #      | Položka        | Detaily                                                     |
| ------ | -------------- | ----------------------------------------------------------- |
| 1.6.10 | Favicon + logo | Branding assety                                             |
| 1.6.11 | SEO meta tagy  | Title, description, OG image                                |
| 1.6.12 | 404 stránka    | Custom `not-found.tsx`                                      |
| 1.6.13 | Landing page   | Veřejná stránka pro nepřihlášné (teď jen redirect na login) |

### Monitoring

| #      | Položka           | Detaily                                          |
| ------ | ----------------- | ------------------------------------------------ |
| 1.6.14 | Error tracking    | Sentry nebo podobný pro logování chyb v produkci |
| 1.6.15 | Uptime monitoring | Ping služba (UptimeRobot / Vercel Analytics)     |

### Acceptance criteria

- [ ] GDPR stránka existuje a je linkovaná z check-in formuláře
- [ ] Aplikace běží na vlastní doméně s HTTPS
- [ ] Produkční DB je oddělená od dev
- [ ] Error tracking zachytí nečekané chyby

---

## 10. Fáze 2 — Profesionální produkt

> **Po launchi.** Vylepšení na základě reálného feedbacku.

| #   | Feature                | Popis                                                                          | Use Case |
| --- | ---------------------- | ------------------------------------------------------------------------------ | -------- |
| 2.1 | **Kalendářový view**   | Timeline/calendar view místo jen tabulky, barevně podle zdroje                 | UC-06    |
| 2.2 | **Email notifikace**   | Automatický check-in email X dní před příjezdem (pro rezervace kde máme email) | UC-09    |
| 2.3 | **Export knihy hostů** | CSV/PDF pro úřady (domovní kniha, hlášení cizinecké policii)                   | UC-12    |
| 2.4 | **iCal export ven**    | Zpětný export: blokace termínů z vlastních rezervací → URL pro Booking/Airbnb  | UC-08    |
| 2.5 | **Upload dokladů**     | Foto dokladu při check-inu (Supabase Storage)                                  | UC-10    |
| 2.6 | **Filtry a řazení**    | Pokročilé filtry: datum, zdroj, status, property                               | —        |
| 2.7 | **Paginace**           | Dashboard zobrazuje jen 8 položek, potřeba "load more" / paginace              | —        |

---

## 11. Fáze 3 — Škálování

> **Budoucnost.** Jen pokud bude poptávka.

| #   | Feature             | Popis                                    |
| --- | ------------------- | ---------------------------------------- |
| 3.1 | Google OAuth login  | Alternativní přihlášení přes Google      |
| 3.2 | QR kód pro check-in | Vytisknutelný QR v bytě                  |
| 3.3 | SMS notifikace      | Volitelný kanál pro check-in link        |
| 3.4 | Multi-tenant SaaS   | Billing, plány, omezení per tier         |
| 3.5 | Testy + CI/CD       | Automatizované testování, GitHub Actions |
| 3.6 | Monitoring (Sentry) | Plný error tracking                      |
| 3.7 | Mobilní app (PWA)   | Progressive Web App pro majitele         |

---

## 12. DB změny — přehled

### Fáze 1.0

```sql
-- Sjednocení statusu (volitelné, viz sekce 13)
UPDATE reservations SET status = reservation_status WHERE reservation_status IS NOT NULL;
-- Po úpravě kódu:
-- ALTER TABLE reservations DROP COLUMN reservation_status;
```

### Fáze 1.1

```sql
ALTER TABLE properties
  ADD COLUMN checkin_instructions text,
  ADD COLUMN access_code text,
  ADD COLUMN wifi_name text,
  ADD COLUMN wifi_password text,
  ADD COLUMN house_rules text,
  ADD COLUMN contact_phone text,
  ADD COLUMN contact_email text,
  ADD COLUMN ical_booking_url text,
  ADD COLUMN ical_airbnb_url text;
```

### Fáze 1.2

```sql
ALTER TABLE reservations
  ADD COLUMN ical_uid text,
  ADD COLUMN external_reference text;

CREATE UNIQUE INDEX idx_reservations_ical_uid
  ON reservations(ical_uid)
  WHERE ical_uid IS NOT NULL;
```

---

## 13. Rozhodnutí k diskuzi

> ⚠️ Před implementací potřebuji tvůj názor na tyto body:

### R-01: Sjednotit `status` a `reservation_status`?

**Současný stav**: Dvě pole, matoucí.
**Návrh**: Jedno pole `status` s hodnotami `pending | confirmed | checked_in | checked_out | cancelled`.
**Risk**: Potřeba migrace existujících dat. Nutná změna v service vrstvě + check-in flow.
**Doporučení**: ANO, sjednotit ve Fáze 1.0.

```
[ ] Souhlasím — sjednotit
[ ] Nesouhlasím — nechat jak je
[ ] Jinak: _______________
```

### R-02: Property settings — jedná stránka nebo tab v editaci?

**Varianta A**: Nová záložka "Nastavení" v existujícím property editačním dialogu.
**Varianta B**: Samostatná stránka `/properties/[id]/settings`.
**Doporučení**: Varianta A (méně práce, vše na jednom místě).

```
[ ] A — záložka v dialogu
[ ] B — samostatná stránka
[ ] Jinak: _______________
```

### R-03: iCal sync — knihovna nebo vlastní parser?

**Varianta A**: Použít npm knihovnu `ical.js` nebo `node-ical` (800B–5KB).
**Varianta B**: Vlastní regex parser (menší, ale křehčí).
**Doporučení**: Varianta A (`node-ical`) — prověřené, edge cases ošetřené.

```
[ ] A — npm knihovna
[ ] B — vlastní parser
[ ] Jinak: _______________
```

### R-04: Cron pro sync — Vercel Cron nebo jiný?

**Varianta A**: Vercel Cron Jobs (zdarma do 1/den na Hobby, na Pro neomezené).
**Varianta B**: Supabase Edge Functions + pg_cron.
**Varianta C**: Pouze manuální sync (tlačítko) — žádný cron.
**Doporučení**: Varianta A (Vercel Cron) + Varianta C jako fallback (vždy manual sync tlačítko).

> **Pozor**: Vercel Hobby plan = max 1 cron job/den. Pro 15min interval potřebuješ Pro plan ($20/mo) nebo Supabase cron.

```
[ ] A — Vercel Cron (potřeba Pro plan pro 15min interval)
[ ] B — Supabase cron
[ ] C — Jen manuální sync
[ ] A+C — Vercel Cron + manuální jako záloha
[ ] Jinak: _______________
```

### R-05: Check-in lookup — jaké metody vyhledávání?

**Současný stav**: Pouze `book_number` (interní auto-increment číslo).
**Návrh**: Přidat vyhledávání přes:

- A) `external_reference` (Booking/Airbnb číslo) — host ho má v emailu
- B) Příjmení + check-in datum — fallback

**Doporučení**: Implementovat A + B.

```
[ ] Jen A (external reference)
[ ] A + B (external reference + příjmení/datum)
[ ] Nechat jen book_number
[ ] Jinak: _______________
```

### R-06: Doména?

```
[ ] deecheckin.cz
[ ] deecheckin.com
[ ] Jiná: _______________
[ ] Zatím nevím — rozhodnu později
```

---

## Pořadí implementace (shrnutí)

```
Fáze 1.0  Stabilizace          → B-01–B-05, TD-01–TD-02, status sjednocení
  ↓
Fáze 1.1  Property Settings     → DB migrace, UI, instrukce + iCal URL pole
  ↓
Fáze 1.2  iCal Sync             → Parser, adaptery, sync service, cron, UI
  ↓
Fáze 1.3  Post-check-in         → Instrukční stránka po check-inu
  ↓
Fáze 1.4  Check-in link         → Kopírování linku, šablona, rozšířený lookup
  ↓
Fáze 1.5  Double-booking        → Overlap detekce, warning UI
  ↓
Fáze 1.6  Pre-launch            → GDPR, doména, deploy, monitoring
  ↓
🚀 LAUNCH
  ↓
Fáze 2    Profesionální produkt  → Kalendář, email, export, iCal export
  ↓
Fáze 3    Škálování              → OAuth, QR, SMS, billing, testy
```

---

> **DALŠÍ KROK**: Projdi si tento dokument, zodpověz rozhodnutí v sekci 13, a dej vědět co chceš změnit. Jakmile schválíš, začneme implementovat Fázi 1.0.
