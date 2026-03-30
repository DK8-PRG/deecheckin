# DeeCheckIn — Dokumentace projektu & Roadmapa

> Poslední aktualizace: 30. března 2026

---

## 1. Co je DeeCheckIn

Online check-in systém pro malé ubytovatele (OSVČ) s 1–2 byty na Airbnb/Booking.  
Hosté vyplní zákonně požadované údaje online → ubytovatel má přehled v admin panelu.

---

## 2. Tech stack

| Vrstva     | Technologie           | Verze       |
| ---------- | --------------------- | ----------- |
| Framework  | Next.js (App Router)  | 15.3.3      |
| UI         | React + TypeScript    | 19.0 / 5.x  |
| Styling    | Tailwind CSS          | 4.x         |
| Backend/DB | Supabase (PostgreSQL) | 2.49.8      |
| Formuláře  | React Hook Form + Zod | 7.56 / 3.25 |
| i18n       | next-intl             | 4.1.0       |
| Auth       | **Zatím žádná**       | —           |

---

## 3. Architektura

```
┌──────────────────────────────────────────────────────┐
│                     Next.js App Router               │
│  ┌────────────┐  ┌────────────┐  ┌────────────────┐ │
│  │  [locale]   │  │ middleware  │  │  i18n (cs/en)  │ │
│  │  /dashboard │  │ (routing)  │  │                │ │
│  │  /properties│  └────────────┘  └────────────────┘ │
│  │  /reserv.   │                                     │
│  │  /checkin   │  ┌──────────────────────────────┐   │
│  │  /checkin/  │  │       React Context           │   │
│  │   [id]      │  │  PropertiesCtx + ReservCtx    │   │
│  └────────────┘  └──────────┬───────────────────┘   │
│                              │                        │
│                   ┌──────────▼───────────────────┐   │
│                   │       lib/db.ts               │   │
│                   │  getProperties, CRUD, guests  │   │
│                   └──────────┬───────────────────┘   │
│                              │                        │
└──────────────────────────────┼────────────────────────┘
                               │
                    ┌──────────▼───────────────┐
                    │     Supabase (PostgreSQL) │
                    │  properties / reservations│
                    │  guests                   │
                    └──────────────────────────┘
```

---

## 4. Aktuální stav funkcionality

### ✅ Hotovo a funkční

| Oblast                 | Stav                | Detaily                                                            |
| ---------------------- | ------------------- | ------------------------------------------------------------------ |
| **Správa properties**  | ✅ Plný CRUD        | Vytvoření, editace, smazání, zobrazení detailu — vše přes modály   |
| **Výpis rezervací**    | ✅ Funkční          | Tabulka s 15+ sloupci, řazení, filtrování, paginace                |
| **Check-in vyhledání** | ✅ Funkční          | Zadání čísla rezervace → nalezení → přesměrování na formulář       |
| **Check-in formulář**  | ✅ Funkční          | Validovaný formulář (Zod), sběr osobních dat dle české legislativy |
| **Check-out**          | ✅ Funkční          | Potvrzovací modál → změna statusu na CHECKED_OUT                   |
| **Zobrazení hosta**    | ✅ Funkční          | GuestInfoCard v modálu s detaily hosta po check-inu                |
| **i18n (cs/en)**       | ✅ Plně přeloženo   | Kompletní překlady obou jazyků                                     |
| **Dark mode**          | ✅ Základní podpora | CSS proměnné + Tailwind `dark:` třídy                              |
| **Responsivita**       | ⚠️ Částečná         | Tabulky mají overflow-x, sidebar je fixní 256px                    |

### ⚠️ Chybí / Nedokončeno

| Oblast                   | Priorita    | Popis                                                      |
| ------------------------ | ----------- | ---------------------------------------------------------- |
| **Autentizace**          | 🔴 Kritická | Admin panel volně přístupný, žádný login                   |
| **RLS politiky**         | 🔴 Kritická | Supabase tabulky bez Row Level Security                    |
| **Dashboard statistiky** | 🟡 Střední  | Pouze výpis properties, žádné grafy/KPI                    |
| **Import rezervací**     | 🟡 Střední  | `importReservations.ts` prázdný                            |
| **Upload dokladů**       | 🟡 Střední  | `document_photo_url` pole existuje, upload neimplementován |
| **Error boundaries**     | 🟡 Střední  | Žádné — app padne na neočekávaná data                      |
| **Mobilní navigace**     | 🟡 Střední  | Sidebar se neschová na mobilu                              |
| **Loading skeletony**    | 🟢 Nízká    | Pouze text "Načítání..."                                   |
| **Fakturace**            | 🟢 Nízká    | `wants_invoice` pole existuje, logika ne                   |
| **Notifikace/toasty**    | 🟢 Nízká    | Žádný feedback po akcích (save, delete)                    |
| **SEO & metadata**       | 🟢 Nízká    | Chybí meta tagy, OG image                                  |

---

## 5. Databázové schéma

### Aktuální tabulky v Supabase:

```
properties
├─ id (UUID, PK)
├─ name (TEXT)
├─ address (TEXT)
└─ created_at (TIMESTAMPTZ)

reservations
├─ id (UUID, PK)
├─ property_id (UUID → properties)
├─ book_number, guest_names, check_in, check_out
├─ booked_by, booked_on, status, reservation_status
├─ rooms, people, adults, children, children_ages
├─ price, commission_percent, commission_amount
├─ payment_status, payment_method, payment_type
├─ remarks, source, device, booker_country, travel_purpose
├─ guest_id, pin_code, phone_number
└─ created_at (TIMESTAMPTZ)

guests
├─ id (UUID, PK)
├─ reservation_id (UUID → reservations)
├─ full_name, birth_date, nationality
├─ document_type, document_number
├─ address_street, address_city, address_zip, address_country
├─ stay_purpose, phone, email, consent
├─ document_photo_url
├─ company_name, company_vat, company_address, wants_invoice
└─ created_at (TIMESTAMPTZ)
```

---

## 6. Souborová struktura

```
src/
├── app/
│   ├── globals.css                    # Tailwind + CSS proměnné
│   ├── messages/cs.json               # České překlady (~170 klíčů)
│   ├── messages/en.json               # Anglické překlady
│   └── [locale]/
│       ├── layout.tsx                 # Root layout + Context Providers
│       ├── page.tsx                   # Úvodní stránka
│       ├── dashboard/page.tsx         # Dashboard
│       ├── properties/page.tsx        # Správa properties (CRUD modály)
│       ├── reservations/page.tsx      # Správa rezervací + checkout
│       ├── checkin/page.tsx           # Vyhledání rezervace
│       └── checkin/[reservationId]/page.tsx  # Check-in formulář
├── components/
│   ├── AdminSidebar.tsx               # Navigace + branding
│   ├── LanguageSwitcher.tsx           # Přepínač cs/en
│   ├── ReservationsTable.tsx          # Wrapper pro DataTable
│   ├── PropertiesTable.tsx            # Wrapper pro DataTable
│   ├── DatabaseDebugger.tsx           # Debug utility
│   └── ui/
│       ├── DataTable.tsx              # Generická tabulka (sort/filter/page)
│       ├── Modal.tsx                  # Znovupoužitelný modál
│       └── GuestInfoCard.tsx          # Karta hosta
├── context/
│   ├── PropertiesContext.tsx           # CRUD + stav properties
│   └── ReservationsContext.tsx         # CRUD + stav rezervací
├── i18n/
│   ├── routing.ts                     # Locale konfigurace
│   ├── navigation.ts                  # i18n Link, useRouter
│   └── request.ts                     # Server-side i18n
├── lib/
│   ├── supabaseClient.ts             # Supabase init
│   └── db.ts                          # Všechny DB operace
└── middleware.ts                       # i18n routing middleware

types/
└── BookingRowProps.ts                 # Centralizované typy (Property, Reservation, Guest)
```

---

## 7. Roadmapa — Co zbývá pro produkční aplikaci

### Fáze 1: Bezpečnost & Stabilita (Priorita: KRITICKÁ)

- [ ] **Supabase Auth** — přihlášení pro admina (email/magic link)
- [ ] **Chráněné routes** — middleware kontrola session pro /dashboard, /properties, /reservations
- [ ] **RLS politiky** — Row Level Security na všech tabulkách
- [ ] **Error boundaries** — `error.tsx` + `not-found.tsx` pro každou route
- [ ] **API routes** — přesun citlivých DB operací z klienta na server (Route Handlers / Server Actions)
- [ ] **Rate limiting** — ochrana check-in formuláře

### Fáze 2: UX & Design (Priorita: VYSOKÁ)

- [ ] **Design systém** — konzistentní barvy, typografie, spacing
- [ ] **Mobilní sidebar** — hamburger menu, overlay navigace
- [ ] **Loading skeletony** — Skeleton komponenty místo textu "Načítání..."
- [ ] **Toast notifikace** — potvrzení akcí (uloženo, smazáno, chyba)
- [ ] **Dashboard KPI** — počet rezervací dnes/tento týden, obsazenost, check-in status graf
- [ ] **Animace** — přechody stránek, modály s framer-motion
- [ ] **Vstupní formuláře** — lepší inputy s ikonami, floating labels, autocomplete zemí
- [ ] **Empty states** — ilustrace pro prázdné tabulky
- [ ] **Breadcrumbs** — navigační drobečky

### Fáze 3: Funkce (Priorita: STŘEDNÍ)

- [ ] **Import rezervací** — CSV/JSON import z Booking/Airbnb
- [ ] **Upload dokladů** — Supabase Storage pro fotky dokladů
- [ ] **Kalendářový pohled** — vizuální přehled obsazenosti
- [ ] **E-mail notifikace** — automatický mail hostům s odkazem na check-in
- [ ] **QR kód** — generování QR pro check-in odkaz
- [ ] **PDF export** — export dat hostů pro úřady (Kniha hostů)
- [ ] **Multi-host check-in** — více hostů na jednu rezervaci
- [ ] **Fakturace** — generování dokladu pro hosta

### Fáze 4: Polish & Produkce (Priorita: NÍZKÁ)

- [ ] **SEO metadata** — meta tagy, OG images, favicon
- [ ] **PWA** — progressive web app, offline podpora
- [ ] **CI/CD** — GitHub Actions, automatický deploy na Vercel
- [ ] **Testy** — Jest + Playwright (unit + e2e)
- [ ] **Monitoring** — Sentry pro error tracking
- [ ] **Analytics** — Plausible/PostHog pro usage tracking
- [ ] **Dokumentace API** — OpenAPI spec pro budoucí integraci
- [ ] **Supabase schema migration** — sjednotit SQL soubor s reálným schématem

---

## 8. Designový koncept — Na co cílit

### Inspirace

| App                  | Co vzít                                      |
| -------------------- | -------------------------------------------- |
| **Cal.com**          | Čistý minimální design, sidebar navigace     |
| **Linear**           | Rychlost, keyboard shortcuts, smooth animace |
| **Stripe Dashboard** | Přehledné karty, grafy, tabulky              |
| **Airbnb Host**      | Kalendář obsazenosti, detaily rezervací      |

### Barevná paleta (návrh)

```
Primary:    #2563EB (blue-600)   — akce, linky, active state
Secondary:  #059669 (emerald-600) — check-in, success
Danger:     #DC2626 (red-600)    — smazat, chyby
Warning:    #D97706 (amber-600)  — check-out, upozornění
Surface:    #F8FAFC (slate-50)   — pozadí karet
Border:     #E2E8F0 (slate-200)  — ohraničení
Text:       #0F172A (slate-900)  — hlavní text
Muted:      #64748B (slate-500)  — sekundární text
```

### Typografie

```
Headings:   Inter (700) nebo Geist Sans
Body:       Inter (400)
Mono:       Geist Mono (pro čísla, kódy)
```

### Komponenty k vylepšení

- **Sidebar**: ikony (Lucide React), collapse na mobilu, active state s barvou
- **Tabulky**: sticky hlavička, row hover, alternující barvy, kompaktnější spacing
- **Formuláře**: floating labels, inline validace, progress indikátor
- **Karty**: subtle shadow, border-radius 12px, konzistentní padding
- **Tlačítka**: 3 velikosti (sm/md/lg), icon support, loading spinner

---

## 9. Příkazy

```bash
npm run dev      # Vývojový server (Turbopack)
npm run build    # Produkční build
npm run start    # Produkční server
npm run lint     # ESLint kontrola
```

---

## 10. Prostředí

```env
NEXT_PUBLIC_SUPABASE_URL=https://xxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...
```

---

_Tento dokument aktualizuj při každé větší změně._
