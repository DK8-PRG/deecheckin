# DeeCheckIn — Stav projektu & Produkční roadmapa

> Poslední aktualizace: 31. března 2026
> Kompletní audit kódu, DB, RLS, routes a bezpečnosti.

---

## 1. Co je DeeCheckIn

Online check-in systém pro malé ubytovatele (OSVČ) s 1–2 byty na Airbnb/Booking.
Hosté vyplní zákonně požadované údaje online → ubytovatel má přehled v admin panelu.
Klíčová hodnota: **digitální domovní kniha** dle české legislativy (zákon č. 565/1990 Sb., zákon č. 326/1999 Sb.).

Cílová skupina: drobní pronajímatelé v ČR (česká legislativa pro hlášení cizinců).

---

## 2. Tech stack (aktuální)

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

**Admin klient:** `createAdminClient()` — service-role key pro cron/webhook bypass RLS.

---

## 4. Stav funkcionality

### ✅ Hotovo a funkční

| Oblast                         | Stav              | Detaily                                                                                                            |
| ------------------------------ | ----------------- | ------------------------------------------------------------------------------------------------------------------ |
| **Auth (email+password)**      | ✅ Funkční        | Login, registrace, logout. Supabase Auth SSR s cookies. Middleware chrání private routes.                          |
| **RLS politiky**               | ✅ Zapnuté        | Všechny 3 tabulky mají RLS. Users vidí jen vlastní data. Guests má veřejný INSERT pro check-in.                    |
| **Správa properties**          | ✅ Plný CRUD      | Vytvoření, editace, smazání přes dialogy. Nastavení (WiFi, přístup, iCal URL, kontakty).                           |
| **Správa rezervací**           | ✅ Plný CRUD      | Tabulka s 15+ sloupci. Vytvoření/editace/smazání přes dialogy.                                                     |
| **Inline quick-edit jména**    | ✅ Funkční        | Anonymní iCal rezervace se zvýrazní žlutě → klik "Doplňte jméno" → inline input přímo v tabulce.                   |
| **Check-in vyhledání**         | ✅ Funkční        | Host zadá číslo rezervace → nalezení → přesměrování na wizard. Veřejná stránka (bez admin UI).                     |
| **Check-in wizard**            | ✅ Funkční        | 3-krokový wizard (info, guest data, review). React Hook Form + Zod. Max 10 hostů.                                  |
| **Domovní kniha (compliance)** | ✅ Funkční        | Sbírá: jméno, datum narození, národnost, adresu, účel pobytu. Pro cizince: typ dokladu, číslo, stát vydání.        |
| **Podmínkové doklady**         | ✅ Funkční        | Sekce "Doklady" se zobrazí jen pro ne-české hosty (detekce národnosti CZ/CZE/Česko atd.).                          |
| **Post check-in instrukce**    | ✅ Funkční        | Po úspěšném check-inu se hostovi zobrazí: adresa, přístupový kód, WiFi, domovní řád, kontakt.                      |
| **Check-in link + šablona**    | ✅ Funkční        | Zkopírování check-in odkazu, šablona zprávy pro hosta.                                                             |
| **iCal synchronizace**         | ✅ Funkční        | Parser + adaptéry pro Booking.com a Airbnb. Automatický cron job (`/api/cron/ical-sync`). Admin klient bypass RLS. |
| **Double-booking prevence**    | ✅ Funkční        | Překryv s existující rezervací → warning toast.                                                                    |
| **Check-out**                  | ✅ Funkční        | Potvrzovací dialog → změna statusu na CHECKED_OUT.                                                                 |
| **Zobrazení hosta**            | ✅ Funkční        | GuestInfoCard s detaily hosta po check-inu.                                                                        |
| **Dashboard**                  | ✅ Základní       | Stats karty: celkový počet properties, reservations, checked-in, guests. Server Component.                         |
| **i18n (cs/en)**               | ✅ Plně přeloženo | ~390 řádků překladů. LanguageSwitcher v sidebaru.                                                                  |
| **Navigace**                   | ✅ Funkční        | AdminSidebar s links: Dashboard, Properties, Reservations, Check-in. Logout.                                       |
| **Validace**                   | ✅ Client+Server  | Zod schémata sdílená mezi formuláři a Server Actions.                                                              |

### ⚠️ Částečně hotovo

| Oblast                   | Stav        | Detaily                                                                                 |
| ------------------------ | ----------- | --------------------------------------------------------------------------------------- |
| **Mobilní responsivita** | ⚠️ Částečná | Tabulky mají overflow-x, sidebar je fixní 256px. Chybí hamburger menu.                  |
| **Error handling**       | ⚠️ Základní | Server Actions vrací ActionResult s error messages. Chybí error boundaries (error.tsx). |
| **Loading states**       | ⚠️ Základní | Jen text "Načítání…". Zlepšit na loading.tsx skeleton.                                  |

### ❌ Chybí / Neimplementováno

| Oblast                       | Priorita   | Popis                                                                               |
| ---------------------------- | ---------- | ----------------------------------------------------------------------------------- |
| **Guest landing page**       | 🔴 Vysoká  | Veřejná stránka pro hosty: popis ubytování, dostupnost, check-in, správa rezervace. |
| **Upload dokladů**           | 🟡 Střední | `document_photo_url` pole v DB existuje, Supabase Storage neimplementován.          |
| **E-mail notifikace**        | 🟡 Střední | Automatický mail hostům s check-in odkazem.                                         |
| **Kalendářový pohled**       | 🟡 Střední | Vizuální přehled obsazenosti properties.                                            |
| **PDF export (Kniha hostů)** | 🟡 Střední | Export dat hostů pro úřady dle české legislativy.                                   |
| **QR kód pro check-in**      | 🟢 Nízká   | Generování QR s odkazem na check-in stránku.                                        |
| **SEO metadata**             | 🟢 Nízká   | Meta tagy, OG images, favicon.                                                      |
| **Testy**                    | 🟢 Nízká   | Žádné unit/e2e testy.                                                               |
| **CI/CD**                    | 🟢 Nízká   | Žádný automatický deploy.                                                           |

---

## 5. Databázové schéma

Vzdálený Supabase: `https://vsuvatnkoxgiqtiaqwae.supabase.co`

### properties (14 sloupců)

```
id                  UUID PK (gen_random_uuid)
name                text NOT NULL
address             text
wifi_name           text
wifi_password       text
access_code         text
house_rules         text
contact_phone       text
contact_email       text
post_checkin_note   text
checkin_message_tpl text
ical_url            text
user_id             uuid FK → auth.users
created_at          timestamptz (now())
```

### reservations (44+ sloupců)

```
id                  UUID PK
property_id         uuid FK → properties
book_number         serial (auto-increment)
booked_by           text
guest_names         text
check_in            date
check_out           date
booked_on           date
status              text DEFAULT 'pending'
reservation_status  text
rooms, people, num_guests, adults, children  integer
children_ages       text
price               text
commission_percent  numeric
commission_amount   text
payment_status, payment_method, payment_type  text
remarks, special_requests  text
booker_group, booker_country, travel_purpose  text
device, source      text
early_checkin, late_checkout, pet  boolean
early_checkin_time, late_checkout_time  text
pin_code, phone_number, address  text
cancellation_date, last_status_update  text
guest_id            integer
ical_uid            text           -- iCal event UID (pro deduplikaci syncu)
external_reference  text           -- reference z externího systému
user_id             uuid FK → auth.users
created_at          timestamptz
```

### guests (21 sloupců)

```
id                  UUID PK
reservation_id      uuid FK → reservations
guest_index         integer DEFAULT 0
first_name          text NOT NULL
last_name           text NOT NULL
birth_date          date NOT NULL
nationality         text NOT NULL
document_type       text NOT NULL ('OP', 'PAS', 'OTHER')
document_number     text NOT NULL
issuing_country     text           -- Stát vydání dokladu (jen pro cizince)
address_street      text NOT NULL
address_city        text NOT NULL
address_zip         text NOT NULL
address_country     text NOT NULL
stay_purpose        text NOT NULL
phone               text
email               text
consent             boolean NOT NULL (GDPR)
document_photo_url  text
user_id             uuid FK → auth.users
created_at          timestamptz
```

### Indexy

```
idx_properties_user_id
idx_reservations_user_id
idx_reservations_book_number
idx_reservations_property_id
idx_guests_user_id
idx_guests_reservation_id
reservations_ical_uid_unique   -- UNIQUE index na ical_uid (deduplikace syncu)
```

### RLS politiky

- **properties**: SELECT/INSERT/UPDATE/DELETE jen pro `auth.uid() = user_id`
- **reservations**: SELECT/INSERT/UPDATE/DELETE jen pro `auth.uid() = user_id`
- **guests**: SELECT/UPDATE/DELETE pro `auth.uid() = user_id` + **PUBLIC INSERT** (check-in bez přihlášení)

---

## 6. Souborová struktura (aktuální)

```
src/
├── app/
│   ├── globals.css
│   ├── [locale]/
│   │   ├── layout.tsx              # Root layout + providers (Toaster)
│   │   ├── page.tsx                # Landing → redirect na dashboard
│   │   ├── login/page.tsx          # Email+password login form
│   │   ├── register/page.tsx       # Registration form
│   │   ├── auth/callback/route.ts  # Auth callback handler
│   │   ├── dashboard/page.tsx      # Stats cards (Server Component)
│   │   ├── properties/page.tsx     # Properties CRUD (Server → Client)
│   │   ├── reservations/page.tsx   # Reservations CRUD (Server → Client)
│   │   ├── checkin/page.tsx        # Public search by book_number (clean guest UI)
│   │   └── checkin/[reservationId]/page.tsx  # Check-in wizard (3 steps)
│   ├── api/
│   │   └── cron/
│   │       └── ical-sync/route.ts  # Cron endpoint pro iCal synchronizaci (admin client)
│   └── messages/
│       ├── cs.json                 # ~390 klíčů
│       └── en.json                 # ~390 klíčů
├── actions/
│   ├── auth.ts                     # signIn, signUp, signOut
│   ├── checkin.ts                  # checkinAction (validates + creates guests)
│   ├── guests.ts                   # getGuestsByBookNumberAction
│   ├── instructions.ts             # getInstructionsAction (post check-in info)
│   ├── properties.ts               # create/update/deletePropertyAction
│   └── reservations.ts             # find/create/update/delete/quickUpdateGuestNameAction
├── services/
│   ├── properties.service.ts       # list, getById, create, update, remove
│   ├── reservations.service.ts     # list, getById, create, update, remove, checkOverlap
│   ├── guests.service.ts           # performCheckin, getGuestsByReservation
│   └── ical-sync.service.ts        # syncPropertyCalendar — iCal fetch + upsert
├── repositories/
│   ├── properties.repository.ts    # findAll, findById, create, update, remove
│   ├── reservations.repository.ts  # findAll, findById, create, update, remove, findByBookNumber, updateStatusByBookNumber, resolveClient()
│   └── guests.repository.ts        # findByReservationId, createMany
├── lib/
│   ├── constants.ts                # Globální konstanty
│   ├── utils.ts                    # cn() helper
│   ├── supabase/
│   │   ├── client.ts               # createClient() — browser
│   │   ├── server.ts               # createServerClient(), createAdminClient(), getUser(), requireUser()
│   │   └── middleware.ts           # updateSession() — refreshes auth cookies
│   └── ical/
│       ├── index.ts                # re-export
│       ├── types.ts                # ICalEvent, ICalParseResult
│       ├── parser.ts               # parseICal() — generic iCal parser
│       ├── booking-adapter.ts      # toReservation() — Booking.com iCal → Reservation
│       └── airbnb-adapter.ts       # toReservation() — Airbnb iCal → Reservation
├── components/
│   ├── ui/                          # badge, button, DataTable, dialog, input, label, Modal, select, skeleton, stats-card, toast
│   ├── checkin/
│   │   ├── CheckinWizard.tsx        # 3-step form, field array, max 10 guests
│   │   ├── StepIndicator.tsx        # Visual progress indicator
│   │   ├── StepReservation.tsx      # Step 1: reservation info
│   │   ├── StepGuestDetails.tsx     # Step 2: guest data (conditional docs for foreigners)
│   │   ├── StepReview.tsx           # Step 3: review + submit
│   │   ├── FormField.tsx            # Reusable form field wrapper
│   │   └── types.ts                 # Checkin component types
│   ├── properties/
│   │   ├── PropertiesPageClient.tsx  # Client wrapper for CRUD dialogs + settings
│   │   └── PropertiesTable.tsx       # Properties data table
│   ├── reservations/
│   │   ├── ReservationsPageClient.tsx # Client wrapper: table + dialogs + inline name edit
│   │   ├── ReservationForm.tsx       # Create/edit form (React Hook Form)
│   │   └── DeleteReservationDialog.tsx
│   ├── AdminSidebar.tsx             # Navigation + logo + logout + LanguageSwitcher
│   ├── DashboardShell.tsx           # Layout: sidebar + main content
│   ├── DashboardHeader.tsx          # Sticky header with title
│   └── LanguageSwitcher.tsx         # cs/en toggle
├── schemas/
│   ├── property.schema.ts           # createPropertySchema, updatePropertySchema
│   ├── reservation.schema.ts        # createReservationSchema, updateReservationSchema
│   └── guest.schema.ts              # guestSchema (superRefine — conditional docs), checkinFormSchema
├── types/
│   ├── action.ts                    # ActionResult<T> generic type
│   ├── property.ts                  # Property, PropertyInsert, PropertyUpdate
│   ├── reservation.ts               # Reservation, ReservationInsert, ReservationUpdate
│   └── guest.ts                     # Guest, GuestInsert, CheckinSubmission
├── i18n/
│   ├── routing.ts                   # locales: ["cs","en"], defaultLocale: "cs"
│   ├── request.ts                   # getRequestConfig → loads messages
│   └── navigation.ts               # Link, redirect, usePathname, useRouter
└── middleware.ts                    # Auth guard + next-intl routing + cookie merge
```

---

## 7. Auth flow

```
Registration:
  /register → signUp(email, password) → supabase.auth.signUp() → success → /login

Login:
  /login → signIn(email, password) → supabase.auth.signInWithPassword() → cookie session → /dashboard

Session:
  middleware.ts → updateSession() → refresh Supabase auth tokens v cookies → getUser() (server-verified)

Protection:
  Private routes: vše kromě /login, /register, /auth/callback, /checkin/*
  No user + private route → redirect /login?redirectTo=<original_path>

Logout:
  AdminSidebar → signOut(locale) → supabase.auth.signOut() → redirect /login

Admin bypass:
  createAdminClient() → service_role key → pro cron joby a webhooky (bez cookie session)
```

---

## 8. Stav management

- **Server Components** načítají data přímo přes services/repositories
- **Client Components** dostávají data jako props z Server Components
- **Mutace** přes Server Actions s `revalidatePath()` pro cache invalidaci
- **Lokální stav** přes React `useState`, `useTransition`
- Zustand je v dependencies ale **aktivně se nepoužívá**

---

## 9. Infrastruktura & Tooling

| Nástroj               | Konfigurace                                | Poznámka                                 |
| --------------------- | ------------------------------------------ | ---------------------------------------- |
| **Supabase (remote)** | `https://vsuvatnkoxgiqtiaqwae.supabase.co` | IPv6-only DB, REST API funguje           |
| **Supabase MCP**      | `.vscode/mcp.json`                         | Přímá správa DB z VS Code (SQL, migrace) |
| **Dev server**        | `npm run dev` (Turbopack)                  | Výchozí port 3000                        |
| **Build**             | `npm run build`                            | Next.js production build                 |
| **ESLint**            | `eslint.config.mjs`                        | next lint config                         |
| **TypeScript**        | `tsconfig.json`                            | Strict mode, `@/*` alias                 |
| **iCal cron**         | `/api/cron/ical-sync`                      | Periodická synchronizace kalendářů       |

---

## 10. Roadmapa (co dělat dál)

### Fáze 2: Guest Experience (Priorita: VYSOKÁ)

- [ ] Guest landing page — veřejná stránka pro hosty (popis, dostupnost, check-in, správa rezervace)
- [ ] E-mail notifikace hostům s check-in odkazem
- [ ] QR kód generátor pro check-in URL

### Fáze 3: Admin vylepšení (Priorita: STŘEDNÍ)

- [ ] Kalendářový pohled obsazenosti (vizuální)
- [ ] PDF export Knihy hostů (česká legislativa)
- [ ] Upload dokladů (Supabase Storage)
- [ ] Error boundaries — `error.tsx`, `not-found.tsx` pro každou route
- [ ] Loading states — `loading.tsx` se skeleton komponentami
- [ ] Mobilní responsivita — hamburger menu, responsive sidebar

### Fáze 4: Produkce & Škálování (Priorita: NÍZKÁ)

- [ ] Testy (Jest unit + Playwright e2e)
- [ ] CI/CD (GitHub Actions → Vercel)
- [ ] SEO metadata, OG images
- [ ] Error monitoring (Sentry)
- [ ] Analytics (Plausible/PostHog)
- [ ] Multi-tenant optimalizace

---

## 11. Testovací účet

- **Email**: `test@test.cz`
- **Heslo**: `asdfasdf`
- Uživatel je registrovaný na vzdáleném Supabase, email potvrzený
