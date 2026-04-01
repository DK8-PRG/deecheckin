# DeeCheckIn — Copilot Instructions

> Tento soubor definuje kontext a pravidla pro AI asistenta pracujícího na tomto projektu.

---

## Co je DeeCheckIn

Online check-in systém pro malé ubytovatele (OSVČ) s 1–2 byty na Airbnb/Booking.
Hosté vyplní zákonně požadované údaje online → ubytovatel má přehled v admin panelu.

Cílová skupina: drobní pronajímatelé v ČR (česká legislativa pro hlášení cizinců).

---

## Tech stack

| Vrstva     | Technologie                         | Verze       |
| ---------- | ----------------------------------- | ----------- |
| Framework  | Next.js (App Router, Turbopack)     | 15.3.3      |
| UI         | React + TypeScript                  | 19 / 5      |
| Styling    | Tailwind CSS 4 + Radix UI primitiva | 4.x         |
| Backend/DB | Supabase (PostgreSQL + Auth + RLS)  | 2.49.8      |
| Formuláře  | React Hook Form + Zod               | 7.56 / 3.25 |
| i18n       | next-intl (cs/en)                   | 4.1.0       |
| Auth       | Supabase Auth (email+password)      | SSR         |
| Toasty     | Vlastní toast (ui/toast.tsx)        | —           |

---

## Architektura (vrstvy)

```
Page (Server Component) → Server Actions → Services → Repositories → Supabase DB
```

1. **UI vrstva**: Server Components načítají data, Client Components pro interakce
2. **Server Actions** (`src/actions/`): Validace Zod + delegace na service + `revalidatePath`
3. **Services** (`src/services/`): Business logika, orchestrace
4. **Repositories** (`src/repositories/`): JEDINÉ místo volající Supabase, CRUD
5. **Supabase**: PostgreSQL + RLS + Auth

### Pravidla

- UI nikdy nevolá Supabase přímo
- Server Actions NEobsahují business logiku
- Services neznají Supabase — pracují s repozitáři
- Repositories nic nevalidují

---

## Folder struktura

```
src/
├── app/
│   ├── globals.css
│   ├── [locale]/
│   │   ├── layout.tsx              # Root layout s providers
│   │   ├── page.tsx                # Landing — seznam apartmánů (veřejná)
│   │   ├── [slug]/
│   │   │   ├── page.tsx            # Guest landing pro apartmán (veřejná)
│   │   │   └── checkin/page.tsx    # Nezávislý check-in (veřejná)
│   │   ├── checkin/
│   │   │   ├── page.tsx            # Vyhledání rezervace (legacy, veřejná)
│   │   │   └── [reservationId]/page.tsx  # Check-in wizard
│   │   └── admin/
│   │       ├── layout.tsx          # Admin layout
│   │       ├── page.tsx            # Redirect → dashboard
│   │       ├── dashboard/page.tsx  # Dashboard se statistikami
│   │       ├── properties/page.tsx # CRUD správa apartmánů
│   │       ├── reservations/page.tsx # CRUD správa rezervací│   │   │   ├── guests/page.tsx      # Nepárovaní hosté + párování│   │       ├── login/page.tsx      # Přihlášení
│   │       ├── register/page.tsx   # Registrace
│   │       └── auth/callback/route.ts  # Auth callback
│   ├── api/
│   │   └── cron/
│   │       └── ical-sync/route.ts  # Cron endpoint pro iCal synchronizaci
│   └── messages/
│       ├── cs.json                 # České překlady (~400 klíčů)
│       └── en.json                 # Anglické překlady
├── actions/                        # Server Actions
│   ├── auth.ts                     # signIn, signUp, signOut
│   ├── checkin.ts                  # checkinAction, independentCheckinAction
│   ├── guests.ts                   # getGuestsByBookNumberAction
│   ├── properties.ts               # CRUD akce properties
│   └── reservations.ts             # CRUD akce + quickUpdateGuestNameAction
├── services/                       # Business logika
│   ├── properties.service.ts       # list, listPublic, getById, getBySlug, create, update, remove, getOccupiedDates
│   ├── reservations.service.ts
│   ├── guests.service.ts           # performCheckin, performIndependentCheckin
│   └── ical-sync.service.ts        # iCal synchronizace
├── repositories/                   # Datová vrstva (Supabase queries)
│   ├── properties.repository.ts    # findAll, findById, findBySlug, findPublicProperties, create, update, remove
│   ├── reservations.repository.ts
│   └── guests.repository.ts        # findByReservationId, createMany, createManyPublic
├── lib/
│   ├── constants.ts                # Globální konstanty
│   ├── utils.ts                    # cn() a utility funkce
│   ├── supabase/
│   │   ├── client.ts               # Browser Supabase klient
│   │   ├── server.ts               # Server-side klient + createAdminClient()
│   │   └── middleware.ts           # Auth session refresh
│   └── ical/                       # iCal parser + adaptéry
│       ├── parser.ts, booking-adapter.ts, airbnb-adapter.ts, types.ts, index.ts
├── components/
│   ├── ui/                          # Radix UI + Tailwind (badge, button, dialog, input, label, select, skeleton, stats-card, toast, DataTable, Modal)
│   ├── guest/                       # GuestLanding, PropertyHero, QuickActions, AvailabilityCalendar, GuestCheckinSection, GuestInfoSection, ContactSection
│   ├── checkin/                     # CheckinWizard, IndependentCheckinWizard, StepIndicator, StepReservation, StepGuestDetails, StepReview, FormField, types
│   ├── guests/                      # GuestsPageClient (párování nepárovaných check-inů)
│   ├── properties/                  # PropertiesPageClient, PropertiesTable
│   ├── reservations/                # ReservationsPageClient, ReservationForm, DeleteReservationDialog
│   ├── AdminSidebar.tsx             # Navigační sidebar
│   ├── DashboardShell.tsx           # Layout wrapper admin stránek
│   ├── DashboardHeader.tsx          # Sticky header
│   └── LanguageSwitcher.tsx         # Přepínač cs/en
├── types/
│   ├── action.ts                    # ActionResult<T>
│   ├── property.ts                  # Property (+ slug, description, public_page_enabled), PropertyInsert, PropertyUpdate
│   ├── reservation.ts               # Reservation, ReservationInsert, ReservationUpdate
│   └── guest.ts                     # Guest (reservation_id nullable, + property_id, check_in/out_date, paired_at, checkin_group_id)
├── schemas/                         # Zod schémata (sdílená client+server)
│   ├── property.schema.ts
│   ├── reservation.schema.ts
│   └── guest.schema.ts             # guestSchema + independentCheckinFormSchema + independentCheckinSubmissionSchema
├── i18n/
│   ├── routing.ts                   # locales: ["cs", "en"], defaultLocale: "cs"
│   ├── request.ts                   # getRequestConfig
│   └── navigation.ts               # Link, redirect, usePathname, useRouter
└── middleware.ts                    # Auth guard (admin/*) + next-intl routing
```

---

## Databáze (3 tabulky)

### properties

- `id` (UUID PK), `name`, `address`, `checkin_instructions`, `access_code`, `wifi_name`, `wifi_password`, `house_rules`, `contact_phone`, `contact_email`, `ical_booking_url`, `ical_airbnb_url`, `slug` (UNIQUE), `description`, `public_page_enabled` (DEFAULT true), `user_id` (FK auth.users), `created_at`

### reservations

- `id` (UUID PK), `property_id` (FK properties), `book_number` (serial)
- 34+ sloupců pro: guest info, check-in/out dates, status (DEFAULT 'pending'), payment, source (booking/airbnb/manual), remarks...
- `ical_uid` (UNIQUE — deduplikace syncu), `external_reference`
- `user_id` (FK auth.users), `created_at`

### guests

- `id` (UUID PK), `reservation_id` (FK reservations, **NULLABLE** — nepárovaný check-in), `property_id` (FK properties), `guest_index` (int)
- Osobní údaje: jméno, příjmení, datum narození, národnost, doklad (typ + číslo + `issuing_country`), adresa, účel pobytu
- Doklady jsou povinné jen pro ne-české hosty (superRefine validace)
- `check_in_date`, `check_out_date` (host zadá sám při nezávislém check-inu)
- `paired_at` (kdy byl spárován s rezervací), `checkin_group_id` (UUID — sdílí hosté z jednoho check-inu)
- `consent` (boolean — GDPR souhlas), `document_photo_url`, `user_id`, `created_at`

### RLS

- Všechny tabulky mají RLS zapnuté
- Properties: CRUD pro vlastní záznamy (`auth.uid() = user_id`) + anon SELECT WHERE `public_page_enabled = true`
- Reservations: CRUD pro vlastní záznamy (žádný veřejný přístup — veřejné operace přes admin client)
- Guests: vlastní záznamy + **veřejný INSERT pro check-in** (omezeno na `user_id IS NULL`)

---

## Auth flow

- **Přihlášení**: email + heslo → `signInWithPassword` → cookie session
- **Registrace**: email + heslo → `signUp`
- **Middleware**: na každém requestu refreshuje session, chrání admin routes
- **Veřejné cesty**: `/[slug]`, `/[slug]/checkin`, `/checkin/*`, `/admin/login`, `/admin/register`, `/admin/auth/callback`
- **Chráněné cesty**: `/admin/*` (kromě login/register/callback) → redirect na `/admin/login`

---

## Supabase připojení

- **Vzdálený Supabase**: `https://vsuvatnkoxgiqtiaqwae.supabase.co`
- **MCP Server**: nakonfigurován v `.vscode/mcp.json` pro přímou správu DB z VS Code
- **DB je IPv6-only** — přímé připojení přes `pg` z macOS nefunguje, používej MCP nebo Dashboard

---

## Konvence pro kód

1. **Jazyk kódu**: angličtina (proměnné, funkce, komentáře)
2. **Jazyk UI**: čeština + angličtina (přes i18n)
3. **Jazyk komunikace s uživatelem**: čeština
4. **Server Components** jako výchozí — `"use client"` jen tam kde je třeba interakce
5. **Validace**: Zod schémata v `src/schemas/`, sdílená mezi client a server
6. **Typy**: v `src/types/`, mapují DB schéma
7. **Styling**: Tailwind CSS utility třídy, Radix UI pro a11y
8. **Imports**: `@/` alias pro `src/`
9. **Formuláře**: React Hook Form + zodResolver
10. **Mutace**: Server Actions s `revalidatePath()`

---

## Testovací účet

- **Email**: `test@test.cz`
- **Heslo**: `asdfasdf`

---

## Známé omezení

- Zustand je v dependencies ale zatím se nepoužívá (stav řešen React hooks + Server Components)
- iCal sync importuje pouze check-in/out datum a jméno hosta — ne cenu, email, telefon
- Upload dokladů (document_photo_url) není implementován
- Admin párování nepárovaných check-inů s rezervacemi není implementováno
- Mobilní responsivita je částečná
- Error/loading boundaries existují jen u některých admin stránek
