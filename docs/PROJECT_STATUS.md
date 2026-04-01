# DeeCheckIn — Stav projektu & Produkční roadmapa

> Poslední aktualizace: 31. března 2026
> Po dokončení Fáze 0, 1 a 2 — připraveno k deploy.

---

## 1. Co je DeeCheckIn

Online check-in systém pro malé ubytovatele (OSVČ) s 1–2 byty na Airbnb/Booking.
Hosté vyplní zákonně požadované údaje online → ubytovatel má přehled v admin panelu.

**MVP scope**: Jeden vlastník s více apartmány. Landing page zobrazuje apartmány, hosté provedou check-in, majitel spravuje přes admin panel.

---

## 2. Tech stack

| Vrstva     | Technologie                         | Verze       |
| ---------- | ----------------------------------- | ----------- |
| Framework  | Next.js (App Router, Turbopack)     | 15.3.3      |
| UI         | React + TypeScript                  | 19 / 5      |
| Styling    | Tailwind CSS 4 + Radix UI primitiva | 4.x         |
| Backend/DB | Supabase (PostgreSQL + Auth + RLS)  | 2.49.8      |
| Formuláře  | React Hook Form + Zod               | 7.56 / 3.25 |
| i18n       | next-intl (cs/en)                   | 4.1.0       |
| Auth       | Supabase Auth (email+password, SSR) |             |
| iCal       | Vlastní parser + adaptéry           |             |

---

## 3. Aktuální architektura

```
Page (Server Component)
  → Server Actions (src/actions/)
    → Services (src/services/)
      → Repositories (src/repositories/)
        → Supabase DB (PostgreSQL + RLS)
```

**Klíčová pravidla:**

- UI nikdy nevolá Supabase přímo
- Server Actions NEobsahují business logiku — jen validace + delegace
- Services neznají Supabase — pracují s repozitáři
- Repositories nic nevalidují

---

## 4. Aktuální URL struktura

### Veřejné routes (bez přihlášení)

| URL                        | Stav      | Popis                                          |
| -------------------------- | --------- | ---------------------------------------------- |
| `/[locale]/`               | ✅ Hotovo | Landing page — seznam apartmánů + check-in CTA |
| `/[locale]/[slug]`         | ✅ Hotovo | Guest landing page pro konkrétní apartmán      |
| `/[locale]/[slug]/checkin` | ✅ Hotovo | Nezávislý check-in formulář (bez rezervace)    |
| `/[locale]/checkin`        | ✅ Hotovo | Vyhledání rezervace podle čísla (legacy)       |
| `/[locale]/checkin/[id]`   | ✅ Hotovo | Check-in wizard pro nalezenou rezervaci        |

### Admin routes (vyžaduje přihlášení)

| URL                            | Stav      | Popis                                  |
| ------------------------------ | --------- | -------------------------------------- |
| `/[locale]/admin`              | ✅ Hotovo | Redirect na dashboard                  |
| `/[locale]/admin/dashboard`    | ✅ Hotovo | Stats karty                            |
| `/[locale]/admin/properties`   | ✅ Hotovo | CRUD správa apartmánů                  |
| `/[locale]/admin/reservations` | ✅ Hotovo | CRUD správa rezervací                  |
| `/[locale]/admin/login`        | ✅ Hotovo | Přihlášení                             |
| `/[locale]/admin/register`     | ✅ Hotovo | Registrace                             |
| `/[locale]/admin/guests`       | ✅ Hotovo | Přehled hostů + párování s rezervacemi |

---

## 5. Stav funkcionality

### ✅ Hotovo a funkční

| Oblast                      | Detaily                                                                               |
| --------------------------- | ------------------------------------------------------------------------------------- |
| Auth (email+password)       | Login, registrace, logout. Supabase Auth SSR s cookies.                               |
| RLS politiky                | Všechny 3 tabulky mají RLS. Viz sekce bezpečnostních problémů.                        |
| Správa properties           | Plný CRUD. Nastavení (WiFi, přístup, iCal URL, slug, popis).                          |
| Správa rezervací            | Plný CRUD. Inline quick-edit jména pro anonymní iCal rezervace.                       |
| Check-in vyhledání (legacy) | Host zadá číslo rezervace → nalezení → wizard.                                        |
| Check-in wizard             | 3-krokový wizard. React Hook Form + Zod. Max 10 hostů.                                |
| Nezávislý check-in          | Host vyplní údaje bez rezervace přes `/[slug]/checkin`.                               |
| Domovní kniha (compliance)  | Jméno, narození, národnost, adresa, účel. Pro cizince: doklad.                        |
| Post check-in instrukce     | WiFi, přístupový kód, domovní řád, kontakt.                                           |
| iCal synchronizace          | Parser + adaptéry (Booking/Airbnb). Cron job.                                         |
| Guest landing page          | Veřejná stránka pro každý apartmán (`/[slug]`).                                       |
| Landing page (hlavní)       | Seznam apartmánů + check-in CTA + login.                                              |
| i18n (cs/en)                | ~400 řádků překladů.                                                                  |
| Dashboard                   | Stats karty: properties, reservations, checked-in, guests.                            |
| Admin párování hostů        | `/admin/guests` — seznam nepárovaných skupin + smart matching + párování s rezervací. |

### ⚠️ Částečně hotovo

| Oblast           | Detaily                    |
| ---------------- | -------------------------- |
| Error monitoring | Sentry zatím neintegrován. |

### ❌ Chybí

| Oblast            | Priorita   | Popis                                |
| ----------------- | ---------- | ------------------------------------ |
| Upload dokladů    | 🟡 Střední | `document_photo_url` v DB existuje   |
| E-mail notifikace | 🟡 Střední | Automatický mail s check-in odkazem  |
| PDF export        | 🟡 Střední | Kniha hostů pro úřady                |
| OG images         | 🟢 Nízká   | Open Graph images pro social sharing |
| Testy             | 🟢 Nízká   | Žádné unit/e2e                       |
| CI/CD             | 🟢 Nízká   | Žádný deploy                         |

---

## 6. ~~KRITICKÉ BUGY~~ — OPRAVENO (31. března 2026)

### 6.1 Bezpečnost — RLS politiky ✅ OPRAVENO

- ~~reservations: Anon SELECT čte VŠECHNA data~~ → Policy SMAZÁNA, všechny veřejné operace používají admin client
- ~~reservations: Public UPDATE bez omezení~~ → Policy SMAZÁNA, check-in flow používá admin client
- ~~guests: Public INSERT volný~~ → Policy opravena: `WITH CHECK (user_id IS NULL)`, role `anon`

### 6.2 Route bugy ✅ OPRAVENO

- ~~admin/page.tsx — relativní redirect~~ → Absolutní `/admin/dashboard`
- ~~auth callback → neexistující route~~ → Opraveno na `/${locale}/admin/login`
- ~~CRON endpoint bez autentizace~~ → `if (!cronSecret || ...)` — vyžaduje CRON_SECRET
- ~~GuestCheckinSection route~~ → Opraveno na `reservation.book_number`

### 6.3 Code quality ✅ OPRAVENO

- ~~console.log v PropertiesTable.tsx~~ → Nahrazeno no-op handlery
- ~~Smíšené statusy v constants.ts~~ → Normalizováno na lowercase (`checked_in`, `checked_out`, `cancelled`)
- Prázdné adresáře (auth/callback, dashboard, properties, reservations) — K SMAZÁNÍ

---

## 7. Mrtvý kód (vyčistit)

Prázdné adresáře (zůstaly po migraci routes):

- `src/app/[locale]/auth/callback/` (prázdný)
- `src/app/[locale]/dashboard/` (prázdný)
- `src/app/[locale]/properties/` (prázdný)
- `src/app/[locale]/reservations/` (prázdný)

`GuestCheckinSection.tsx` — zvážit odstranění (máme nezávislý check-in přes `/[slug]/checkin`).

---

## 8. Databázové schéma (aktuální stav v Supabase)

### properties (17 sloupců)

```
id, name, address, checkin_instructions, access_code, wifi_name,
wifi_password, house_rules, contact_phone, contact_email,
ical_booking_url, ical_airbnb_url, slug (UNIQUE), description,
public_page_enabled (DEFAULT true), user_id (FK auth.users), created_at
```

### reservations (34+ sloupců)

```
id, property_id (FK), book_number (serial), booked_by, guest_names,
check_in, check_out, booked_on, status (DEFAULT 'pending'),
reservation_status, rooms, people, num_guests, adults, children,
children_ages, price, commission_percent, commission_amount,
payment_status, payment_method, payment_type, remarks, special_requests,
booker_group, booker_country, travel_purpose, device, duration_nights,
cancellation_date, address, phone_number, guest_id, source,
early_checkin, late_checkout, early_checkin_time, late_checkout_time,
pet, pin_code, last_status_update, ical_uid (UNIQUE),
external_reference, user_id (FK), created_at
```

### guests (26 sloupců)

```
id, reservation_id (FK, NULLABLE), property_id (FK), guest_index,
first_name, last_name, birth_date, nationality, document_type,
document_number, issuing_country, address_street, address_city,
address_zip, address_country, stay_purpose, phone, email, consent,
document_photo_url, check_in_date, check_out_date, paired_at,
checkin_group_id (DEFAULT gen_random_uuid()), user_id (FK), created_at
```

### RLS politiky (po opravě 31. března 2026)

- **properties**: CRUD pro `auth.uid() = user_id` + anon SELECT WHERE `public_page_enabled = true`
- **reservations**: CRUD pro `auth.uid() = user_id` (žádný veřejný přístup — veřejné operace přes admin client)
- **guests**: CRUD pro `auth.uid() = user_id` + anon INSERT WHERE `user_id IS NULL`

---

## 9. Souborová struktura (aktuální)

```
src/
├── app/[locale]/
│   ├── layout.tsx, page.tsx (landing)
│   ├── [slug]/ (page.tsx, checkin/page.tsx)
│   ├── checkin/ (page.tsx, [reservationId]/page.tsx)
│   └── admin/ (layout, page, dashboard/, properties/, reservations/, login/, register/, auth/)
├── actions/ (auth, checkin, guests, properties, reservations)
├── services/ (properties, reservations, guests, ical-sync)
├── repositories/ (properties, reservations, guests)
├── components/
│   ├── ui/ (badge, button, dialog, input, label, select, skeleton, stats-card, toast, DataTable, Modal)
│   ├── guest/ (GuestLanding, PropertyHero, QuickActions, AvailabilityCalendar, GuestCheckinSection, GuestInfoSection, ContactSection)
│   ├── checkin/ (CheckinWizard, IndependentCheckinWizard, StepIndicator, StepReservation, StepGuestDetails, StepReview, FormField, types)
│   ├── properties/ (PropertiesPageClient, PropertiesTable)
│   └── reservations/ (ReservationsPageClient, ReservationForm, DeleteReservationDialog)
├── schemas/ (guest, property, reservation)
├── types/ (action, guest, property, reservation)
├── lib/ (constants, utils, supabase/, ical/)
├── i18n/ (routing, request, navigation)
└── middleware.ts
```

---

## 10. 🚀 PRODUKČNÍ ROADMAPA

### Fáze 0: Kritické opravy (BLOKUJE PRODUKCI)

- [x] RLS: Omezit anon SELECT na reservations — SMAZÁNO, public flow používá admin client
- [x] RLS: Opravit public UPDATE na reservations — SMAZÁNO, check-in používá admin client
- [x] RLS: Omezit public INSERT guests (user_id IS NULL) — OPRAVENO
- [x] Fix: admin/page.tsx redirect — absolutní cesta
- [x] Fix: auth callback error redirect — `/admin/login`
- [x] Fix: CRON_SECRET kontrola — require secret
- [x] Fix: GuestCheckinSection route (UUID vs book_number) — opraveno
- [ ] Smazat mrtvé adresáře (auth/callback, dashboard, properties, reservations)
- [x] Odstranit console.log z PropertiesTable
- [x] Normalizovat statusy na lowercase

### Fáze 1: Párování hostů (MVP feature) ✅ HOTOVO

- [x] `/admin/guests` — seznam nepárovaných check-in skupin
- [x] Smart matching dialog (overlapping dates + property)
- [x] Párování: `reservation_id` + `paired_at` na celou skupinu
- [x] Odkaz v AdminSidebar

### Fáze 2: Deploy — ✅ PŘIPRAVENO

- [x] SEO metadata + favicon (layout.tsx metadata export, favicon.svg)
- [x] Error boundaries pro všechny routes (10 error.tsx souborů)
- [x] Loading states pro všechny routes (10 loading.tsx souborů)
- [x] Mobilní responsivita (hamburger menu, overlay sidebar)
- [x] vercel.json s cron konfigurací (iCal sync každých 15 min)
- [ ] Vercel deploy + environment variables (manuální krok)
- [ ] CRON_SECRET nastavit ve Vercel env vars
- [ ] Error monitoring (Sentry) — volitelné post-launch

### Fáze 3: Post-launch

- [ ] E-mail notifikace
- [ ] PDF export Knihy hostů
- [ ] Upload dokladů
- [ ] Kalendářový pohled
- [ ] Testy + CI/CD

---

## 11. Testovací účet

- **Email**: `test@test.cz`
- **Heslo**: `asdfasdf`
- Vzdálený Supabase: `https://vsuvatnkoxgiqtiaqwae.supabase.co`
