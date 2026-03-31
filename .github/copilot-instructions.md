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
│   │   ├── page.tsx                # Landing (chráněná)
│   │   ├── login/page.tsx          # Přihlášení (veřejná)
│   │   ├── register/page.tsx       # Registrace (veřejná)
│   │   ├── dashboard/page.tsx      # Dashboard se statistikami
│   │   ├── properties/page.tsx     # CRUD správa ubytovacích jednotek
│   │   ├── reservations/page.tsx   # CRUD správa rezervací
│   │   ├── checkin/page.tsx        # Veřejné vyhledání rezervace
│   │   └── checkin/[reservationId]/page.tsx  # Check-in wizard
│   └── messages/
│       ├── cs.json                 # České překlady
│       └── en.json                 # Anglické překlady
├── actions/                        # Server Actions
│   ├── auth.ts                     # signIn, signUp, signOut
│   ├── checkin.ts                  # checkinAction
│   ├── guests.ts                   # getGuestsByBookNumberAction
│   ├── properties.ts               # CRUD akce properties
│   └── reservations.ts             # CRUD akce reservations
├── services/                       # Business logika
│   ├── properties.service.ts
│   ├── reservations.service.ts
│   └── guests.service.ts
├── repositories/                   # Datová vrstva (Supabase queries)
│   ├── properties.repository.ts
│   ├── reservations.repository.ts
│   └── guests.repository.ts
├── lib/
│   ├── supabase/
│   │   ├── client.ts               # Browser Supabase klient
│   │   ├── server.ts               # Server-side klient (cookies)
│   │   └── middleware.ts            # Auth session refresh
│   └── utils.ts                    # cn() a utility funkce
├── components/
│   ├── ui/                          # Radix UI + Tailwind komponenty (badge, button, dialog, input...)
│   ├── checkin/                     # CheckinWizard, StepIndicator
│   ├── properties/                  # PropertiesPageClient, PropertiesTable
│   ├── reservations/                # ReservationsPageClient, ReservationForm
│   ├── AdminSidebar.tsx             # Navigační sidebar
│   ├── DashboardShell.tsx           # Layout wrapper admin stránek
│   ├── DashboardHeader.tsx          # Sticky header
│   └── LanguageSwitcher.tsx         # Přepínač cs/en
├── types/
│   ├── property.ts                  # Property, PropertyInsert
│   ├── reservation.ts               # Reservation, ReservationInsert, ActionResult
│   └── guest.ts                     # Guest, GuestInsert, CheckinSubmission
├── validators/                      # Zod schémata (sdílená client+server)
│   ├── property.schema.ts
│   ├── reservation.schema.ts
│   └── guest.schema.ts
├── i18n/
│   ├── routing.ts                   # locales: ["cs", "en"], defaultLocale: "cs"
│   ├── request.ts                   # getRequestConfig
│   └── navigation.ts               # Link, redirect, usePathname, useRouter
└── middleware.ts                    # Auth guard + next-intl routing
```

---

## Databáze (3 tabulky)

### properties

- `id` (UUID PK), `name` (text), `address` (text), `user_id` (FK auth.users), `created_at`

### reservations

- `id` (UUID PK), `property_id` (FK properties), `book_number` (serial)
- 40+ sloupců pro: guest info, check-in/out dates, status, payment, source (booking/airbnb/manual), remarks...
- `user_id` (FK auth.users), `created_at`

### guests

- `id` (UUID PK), `reservation_id` (FK reservations), `guest_index` (int)
- Osobní údaje: jméno, příjmení, datum narození, národnost, doklad (typ + číslo), adresa, účel pobytu
- `consent` (boolean — GDPR souhlas), `document_photo_url`, `user_id`, `created_at`

### RLS

- Všechny tabulky mají RLS zapnuté
- Properties, reservations: CRUD jen pro vlastní záznamy (`auth.uid() = user_id`)
- Guests: vlastní záznamy + **veřejný INSERT pro check-in** (hosté mohou vyplnit formulář bez přihlášení)

---

## Auth flow

- **Přihlášení**: email + heslo → `signInWithPassword` → cookie session
- **Registrace**: email + heslo → `signUp`
- **Middleware**: na každém requestu refreshuje session, chrání privátní routes
- **Veřejné cesty**: `/login`, `/register`, `/auth/callback`, `/checkin/*`
- **Chráněné cesty**: vše ostatní → redirect na login

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
5. **Validace**: Zod schémata v `src/validators/`, sdílená mezi client a server
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
- Legacy context soubory existují jako `_*.legacy.tsx` (vyloučené z tsconfig)
- Import rezervací z Booking.com/Airbnb není implementován
- Upload dokladů (document_photo_url) není implementován
- Mobilní responsivita je částečná
