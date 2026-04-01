# DeeCheckIn — Produkční architektura

> Tento dokument definuje architekturu aplikace DeeCheckIn.
> Popisuje jak aktuální implementaci (vrstvy, data flow, Supabase), tak cílové vzory a best practices.
>
> **Stav migrace (březen 2026):** Většina Fáze 1–3 je hotová (repositories, services, actions, auth, RLS, Server Components). Zustand stores a route groups nejsou implementovány — stav se řeší přes props + useState + revalidatePath.
>
> **⚠️ POZOR:** Některé sekce tohoto dokumentu popisují CÍLOVÝ stav, ne aktuální implementaci.
> Pro aktuální stav viz `PROJECT_STATUS.md`. Hlavní rozdíly:
>
> - Route groups `(auth)`, `(admin)`, `(public)` NEJSOU implementovány — routes jsou flat pod `[locale]/admin/`
> - Zustand stores NEEXISTUJÍ — stav se řeší props + useState
> - Folder struktura v sekci 2 je CÍLOVÁ — aktuální viz `PROJECT_STATUS.md` sekce 9
> - Sekce 1 "Analýza problémů" popisuje stav PŘED migrací — většina je opravena

---

## Obsah

1. [Analýza současných problémů](#1-analýza-současných-problémů)
2. [Cílová folder struktura](#2-cílová-folder-struktura)
3. [Architektonická rozhodnutí](#3-architektonická-rozhodnutí)
4. [Vrstvy a jejich odpovědnosti](#4-vrstvy-a-jejich-odpovědnosti)
5. [Data flow — příklad: Vytvoření rezervace](#5-data-flow--příklad-vytvoření-rezervace)
6. [Supabase — klient, Auth, RLS](#6-supabase--klient-auth-rls)
7. [Typy a databázová typová bezpečnost](#7-typy-a-databázová-typová-bezpečnost)
8. [Best practices pro tento stack](#8-best-practices-pro-tento-stack)
9. [Čemu se vyhnout (anti-patterns)](#9-čemu-se-vyhnout-anti-patterns)
10. [Migrační plán (fáze)](#10-migrační-plán-fáze)

---

## 1. Analýza současných problémů

| Problém                         | Kde                                                       | Dopad                                          |
| ------------------------------- | --------------------------------------------------------- | ---------------------------------------------- |
| Vše je `"use client"`           | Všechny stránky a komponenty                              | Žádné SSR, žádné SEO, zbytečně velký JS bundle |
| Supabase anon klíč v browseru   | `supabaseClient.ts` → `NEXT_PUBLIC_*`                     | Bez RLS může kdokoliv číst/měnit DB            |
| React Context pro globální stav | `PropertiesContext`, `ReservationsContext`                | Zbytečné re-rendery, nelze persist, neškáluje  |
| Duplicované typy                | `types/BookingRowProps.ts` vs `PropertiesContext.tsx`     | Rozchody, maintenance burden                   |
| Custom UI bez systému           | Inline Tailwind třídy, vlastní `Modal`                    | Nekonzistentní design, pomalý vývoj            |
| Žádná autentizace               | Chybí kompletně                                           | Kdokoliv má přístup k admin sekcím             |
| Žádné RLS politiky              | Supabase                                                  | Data přístupná komukoliv s anon klíčem         |
| Business logika v komponentách  | `properties/page.tsx`, `checkin/[reservationId]/page.tsx` | Netestovatelné, duplikace                      |
| `console.log` v produkci        | `db.ts`, checkin stránka                                  | Únik informací, šum v konzoli                  |

---

## 2. Cílová folder struktura

> **Poznámka:** Níže je cílová struktura. Aktuální stav se liší v detailech:
>
> - `stores/` a `hooks/` neexistují (stav se řeší props + useState)
> - Route groups `(auth)`, `(admin)`, `(public)` nejsou implementovány (flat structure pod `[locale]/`)
> - `src/lib/ical/` obsahuje iCal parser + adaptéry (Booking.com, Airbnb)
> - `src/app/api/cron/ical-sync/` obsahuje cron endpoint pro synchronizaci kalendářů
> - `src/schemas/` (ne `validators/`) obsahuje Zod schémata

```
src/
├── app/
│   ├── globals.css
│   ├── [locale]/
│   │   ├── layout.tsx                    # Server Component — providers wrapper
│   │   ├── page.tsx                      # Landing / redirect
│   │   ├── (auth)/                       # Route group — veřejné auth stránky
│   │   │   ├── login/page.tsx
│   │   │   └── layout.tsx                # Minimální layout bez sidebaru
│   │   ├── (admin)/                      # Route group — chráněné admin stránky
│   │   │   ├── layout.tsx                # AdminShell (sidebar + auth guard)
│   │   │   ├── dashboard/page.tsx
│   │   │   ├── properties/page.tsx
│   │   │   └── reservations/page.tsx
│   │   └── (public)/                     # Route group — veřejné stránky
│   │       └── checkin/
│   │           ├── page.tsx              # Vyhledání rezervace
│   │           └── [reservationId]/
│   │               └── page.tsx          # Check-in formulář
│   └── messages/
│       ├── cs.json
│       └── en.json
│
├── actions/                              # Server Actions (vstupní bod pro mutace)
│   ├── properties.ts                     # createProperty, updateProperty, deleteProperty
│   ├── reservations.ts                   # createReservation, checkoutReservation, ...
│   ├── guests.ts                         # createGuest, ...
│   └── auth.ts                           # login, logout, signup
│
├── services/                             # Business logika (čisté funkce, testovatelné)
│   ├── properties.service.ts
│   ├── reservations.service.ts
│   ├── guests.service.ts
│   └── auth.service.ts
│
├── repositories/                         # Datová vrstva — JEDINÉ místo volající Supabase
│   ├── properties.repository.ts
│   ├── reservations.repository.ts
│   └── guests.repository.ts
│
├── lib/
│   ├── supabase/
│   │   ├── client.ts                     # Browser Supabase klient (pro auth listener)
│   │   ├── server.ts                     # Server-side Supabase klient (cookies)
│   │   └── middleware.ts                 # Supabase Auth middleware helper
│   └── utils.ts                          # Utility funkce (cn, formatDate, ...)
│
├── stores/                               # Zustand stores
│   ├── properties.store.ts
│   ├── reservations.store.ts
│   └── ui.store.ts                       # Sidebar stav, modály, toasty, ...
│
├── components/
│   ├── ui/                               # shadcn/ui komponenty (generované)
│   │   ├── button.tsx
│   │   ├── input.tsx
│   │   ├── dialog.tsx
│   │   ├── table.tsx
│   │   ├── card.tsx
│   │   ├── badge.tsx
│   │   ├── select.tsx
│   │   ├── form.tsx
│   │   ├── dropdown-menu.tsx
│   │   ├── sheet.tsx                     # Mobile sidebar
│   │   ├── toast.tsx
│   │   ├── toaster.tsx
│   │   └── sonner.tsx
│   ├── layout/
│   │   ├── AdminShell.tsx                # Sidebar + topbar + main content area
│   │   ├── Sidebar.tsx                   # Navigace (server-aware)
│   │   ├── TopBar.tsx                    # User menu, language switcher
│   │   └── MobileSidebar.tsx             # Sheet-based sidebar pro mobily
│   ├── properties/
│   │   ├── PropertiesTable.tsx           # Tabulka s akcemi
│   │   ├── PropertyForm.tsx              # Formulář (add/edit) s react-hook-form + zod
│   │   └── PropertyDeleteDialog.tsx      # Potvrzení smazání
│   ├── reservations/
│   │   ├── ReservationsTable.tsx
│   │   ├── ReservationDetail.tsx
│   │   └── CheckoutDialog.tsx
│   ├── checkin/
│   │   ├── CheckinSearchForm.tsx
│   │   ├── CheckinGuestForm.tsx          # Hlavní check-in formulář
│   │   └── CheckinSuccess.tsx
│   ├── dashboard/
│   │   ├── StatsCards.tsx
│   │   └── RecentActivity.tsx
│   └── shared/
│       ├── LanguageSwitcher.tsx
│       ├── DataTable.tsx                 # Generická tabulka (@tanstack/react-table)
│       ├── LoadingSpinner.tsx
│       ├── EmptyState.tsx
│       └── ErrorBoundary.tsx
│
├── hooks/                                # Custom React hooks
│   ├── useAuth.ts                        # Auth stav + guard
│   ├── useProperties.ts                  # Wrapper nad Zustand store
│   └── useReservations.ts
│
├── types/
│   ├── database.ts                       # Auto-generované Supabase typy (supabase gen types)
│   ├── domain.ts                         # Aplikační doménové typy
│   └── forms.ts                          # Zod schémata + inferred typy pro formuláře
│
├── i18n/
│   ├── routing.ts
│   ├── request.ts
│   └── navigation.ts
│
├── middleware.ts                          # Kombinovaný: next-intl + Supabase Auth
│
└── schemas/                           # Zod schémata (sdílená mezi client + server)
    ├── property.schema.ts
    ├── reservation.schema.ts
    ├── guest.schema.ts
    └── auth.schema.ts
```

### Proč tato struktura?

- **Route groups** `(auth)`, `(admin)`, `(public)` — sdílení layoutů bez ovlivnění URL
- **Feature-based components** (`components/properties/`, `components/reservations/`) — snadná navigace
- **Separation of concerns** — akce → služby → repozitáře, každá vrstva má jednu odpovědnost
- **Validátory ve vlastní složce** — Zod schémata sdílená mezi Server Actions (server) a formuláři (client)

---

## 3. Architektonická rozhodnutí

### 3.1 Server Actions místo API Routes

| Rozhodnutí                            | Důvod                                                                                        |
| ------------------------------------- | -------------------------------------------------------------------------------------------- |
| **Server Actions** pro všechny mutace | Type-safe, automatická serializace, progressive enhancement, žádné manuální `fetch()` volání |
| **Server Components** jako default    | Menší JS bundle, přímý přístup k DB, lepší initial load                                      |
| `"use client"` jen kde je to nutné    | Formuláře, interaktivní tabulky, modály — ne celé stránky                                    |

**Proč NE API Routes:**

- API Routes vyžadují manuální serializaci request/response
- Nelze jednoduše typovat end-to-end bez extra nástrojů (tRPC)
- Server Actions jsou nativní Next.js řešení pro mutace v App Router
- Progressive enhancement — fungují i bez JS

### 3.2 Zustand místo React Context

| Rozhodnutí                                                | Důvod                                                            |
| --------------------------------------------------------- | ---------------------------------------------------------------- |
| **Zustand** pro client state                              | Žádné extra re-rendery, selektory, minimální boilerplate         |
| **Odstranit** `PropertiesContext` a `ReservationsContext` | Nahrazeny Zustand stores                                         |
| Server Component data jako **initial props**              | Data se načtou na serveru a předají jako initialState do Zustand |

**Vzor: Server → Client hydratace**

```tsx
// app/[locale]/(admin)/properties/page.tsx — SERVER COMPONENT
import { getProperties } from "@/repositories/properties.repository";
import { PropertiesPageClient } from "@/components/properties/PropertiesPageClient";

export default async function PropertiesPage() {
  const properties = await getProperties();
  return <PropertiesPageClient initialProperties={properties} />;
}
```

```tsx
// components/properties/PropertiesPageClient.tsx — CLIENT COMPONENT
"use client";
import { useEffect } from "react";
import { usePropertiesStore } from "@/stores/properties.store";

export function PropertiesPageClient({ initialProperties }) {
  const setProperties = usePropertiesStore((s) => s.setProperties);

  useEffect(() => {
    setProperties(initialProperties);
  }, [initialProperties, setProperties]);

  // ... render
}
```

### 3.3 shadcn/ui místo vlastních komponent

| Rozhodnutí                        | Důvod                                                                                |
| --------------------------------- | ------------------------------------------------------------------------------------ |
| **shadcn/ui** jako základ         | Copy-paste komponenty (plná kontrola), Radix UI primitiva (a11y), Tailwind native    |
| **Odstranit** vlastní `Modal.tsx` | Nahrazena `Dialog` z shadcn/ui                                                       |
| **@tanstack/react-table**         | Výkonné tabulky s řazením, filtrováním, stránkováním — shadcn/ui `DataTable` pattern |

### 3.4 Supabase Auth + server-side klient

| Rozhodnutí                               | Důvod                                                        |
| ---------------------------------------- | ------------------------------------------------------------ |
| **`@supabase/ssr`**                      | Cookies-based auth pro server components a Server Actions    |
| **Server-side klient** v repozitářích    | Data nikdy neprocházejí přes browser                         |
| **Browser klient** jen pro auth listener | `onAuthStateChange` pro real-time auth stav                  |
| **RLS politiky** na všech tabulkách      | Databázová úroveň zabezpečení — i kdyby se obešel middleware |

---

## 4. Vrstvy a jejich odpovědnosti

```
┌─────────────────────────────────────────────────────┐
│                    UI VRSTVA                         │
│  Server Components (stránky) + Client Components    │
│  shadcn/ui + Zustand stores + react-hook-form       │
│  → Zobrazuje data, zachytává uživatelské akce       │
└───────────────────────┬─────────────────────────────┘
                        │ volá
                        ▼
┌─────────────────────────────────────────────────────┐
│                 SERVER ACTIONS                        │
│  src/actions/*.ts                                    │
│  "use server"                                        │
│  → Validuje vstup (Zod), volá service, revaliduje   │
│  → NEOBSAHUJE business logiku                        │
└───────────────────────┬─────────────────────────────┘
                        │ volá
                        ▼
┌─────────────────────────────────────────────────────┐
│                   SERVICES                           │
│  src/services/*.service.ts                           │
│  → Business logika, orchestrace                      │
│  → Čisté funkce, snadno testovatelné                │
│  → Může volat více repozitářů                        │
└───────────────────────┬─────────────────────────────┘
                        │ volá
                        ▼
┌─────────────────────────────────────────────────────┐
│                 REPOSITORIES                         │
│  src/repositories/*.repository.ts                    │
│  → JEDINÉ místo, které volá Supabase                │
│  → CRUD operace, žádná logika                        │
│  → Vrací typované doménové objekty                   │
└───────────────────────┬─────────────────────────────┘
                        │ volá
                        ▼
┌─────────────────────────────────────────────────────┐
│                   SUPABASE                           │
│  PostgreSQL + RLS + Auth                             │
└─────────────────────────────────────────────────────┘
```

### Pravidla vrstev

1. **UI** nikdy nevolá repozitáře ani Supabase přímo
2. **Server Actions** neobsahují business logiku — jen validace + delegace
3. **Services** neznají Supabase — pracují s abstrakcemi (repozitáři)
4. **Repositories** nic nevalidují — to dělají akce/služby
5. **Typy** tečou shora dolů: `database.ts` → `domain.ts` → `forms.ts`

---

## 5. Data flow — příklad: Vytvoření rezervace

### 5.1 Uživatelský scénář

Admin vyplní formulář nové rezervace a klikne "Uložit".

### 5.2 Průchod vrstvami

```
[1] ReservationForm.tsx (client)
    │  - react-hook-form + zodResolver(createReservationSchema)
    │  - Lokální validace proběhne PŘED odesláním
    │  - Volá: createReservationAction(formData)
    ▼
[2] src/actions/reservations.ts (server)
    │  "use server"
    │  export async function createReservationAction(input: CreateReservationInput) {
    │    // 1. Validace na serveru (Zod — nikdy nevěř klientovi)
    │    const parsed = createReservationSchema.safeParse(input);
    │    if (!parsed.success) return { error: parsed.error.flatten() };
    │
    │    // 2. Delegace na service
    │    const result = await reservationsService.create(parsed.data);
    │
    │    // 3. Revalidace cache
    │    revalidatePath("/[locale]/(admin)/reservations");
    │    return { data: result };
    │  }
    ▼
[3] src/services/reservations.service.ts
    │  export async function create(data: CreateReservationData) {
    │    // Business logika:
    │    // - Ověření, že property existuje
    │    const property = await propertiesRepo.findById(data.propertyId);
    │    if (!property) throw new AppError("PROPERTY_NOT_FOUND");
    │
    │    // - Kontrola kolize termínů
    │    const conflicts = await reservationsRepo.findOverlapping(
    │      data.propertyId, data.checkIn, data.checkOut
    │    );
    │    if (conflicts.length > 0) throw new AppError("DATE_CONFLICT");
    │
    │    // - Vytvoření rezervace
    │    return reservationsRepo.create({
    │      property_id: data.propertyId,
    │      guest_name: data.guestName,
    │      check_in: data.checkIn,
    │      check_out: data.checkOut,
    │      status: "pending",
    │      source: data.source ?? "manual",
    │    });
    │  }
    ▼
[4] src/repositories/reservations.repository.ts
    │  import { createServerClient } from "@/lib/supabase/server";
    │
    │  export async function create(data: InsertReservation) {
    │    const supabase = await createServerClient();
    │    const { data: result, error } = await supabase
    │      .from("reservations")
    │      .insert(data)
    │      .select()
    │      .single();
    │    if (error) throw new DatabaseError(error);
    │    return result;
    │  }
    ▼
[5] Supabase PostgreSQL
    - RLS policy: INSERT povolený jen pro authenticated uživatele
    - Trigger: automatické nastavení created_at
```

### 5.3 Návrat dat zpět

```
[5] Supabase → vrátí nový řádek s UUID
[4] Repository → mapuje na doménový typ Reservation
[3] Service → vrátí Reservation
[2] Action → revalidatePath + return { data: reservation }
[1] Client → useActionState nebo startTransition callback
    → Zustand store se aktualizuje (optimistic update nebo refetch)
    → Toast "Rezervace vytvořena"
    → Dialog se zavře
```

### 5.4 Kód klienta (jak volat Server Action)

```tsx
"use client";
import { useActionState } from "react";
import { createReservationAction } from "@/actions/reservations";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  createReservationSchema,
  type CreateReservationInput,
} from "@/schemas/reservation.schema";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";

export function ReservationForm({ onSuccess }: { onSuccess: () => void }) {
  const form = useForm<CreateReservationInput>({
    resolver: zodResolver(createReservationSchema),
  });

  async function onSubmit(data: CreateReservationInput) {
    const result = await createReservationAction(data);

    if (result.error) {
      toast.error("Nepodařilo se vytvořit rezervaci");
      return;
    }

    toast.success("Rezervace vytvořena");
    onSuccess();
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="guestName"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Jméno hosta</FormLabel>
              <FormControl>
                <Input {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        {/* ... další pole */}
        <Button type="submit" disabled={form.formState.isSubmitting}>
          {form.formState.isSubmitting ? "Ukládám..." : "Uložit"}
        </Button>
      </form>
    </Form>
  );
}
```

---

## 6. Supabase — klient, Auth, RLS

### 6.1 Dva Supabase klienti

```ts
// src/lib/supabase/server.ts — pro Server Components, Server Actions, middleware
import { createServerClient as createSupabaseServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

export async function createServerClient() {
  const cookieStore = await cookies();

  return createSupabaseServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) => {
            cookieStore.set(name, value, options);
          });
        },
      },
    },
  );
}
```

```ts
// src/lib/supabase/client.ts — POUZE pro auth listener v browseru
"use client";
import { createBrowserClient } from "@supabase/ssr";

export function createBrowserSupabaseClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
  );
}
```

### 6.2 Middleware (Auth + i18n)

```ts
// src/middleware.ts
import { NextRequest, NextResponse } from "next/server";
import { createServerClient } from "@supabase/ssr";
import createIntlMiddleware from "next-intl/middleware";
import { locales, defaultLocale } from "./i18n/routing";

const intlMiddleware = createIntlMiddleware({ locales, defaultLocale });

// Cesty, které vyžadují autentizaci
const protectedPaths = ["/dashboard", "/properties", "/reservations"];

export async function middleware(request: NextRequest) {
  // 1. Spustit i18n middleware
  const intlResponse = intlMiddleware(request);

  // 2. Zkontrolovat, zda cesta vyžaduje auth
  const { pathname } = request.nextUrl;
  const pathWithoutLocale = pathname.replace(/^\/(cs|en)/, "");
  const isProtected = protectedPaths.some((p) =>
    pathWithoutLocale.startsWith(p),
  );

  if (!isProtected) return intlResponse;

  // 3. Ověřit session přes Supabase
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) => {
            intlResponse.cookies.set(name, value, options);
          });
        },
      },
    },
  );

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    const locale = pathname.match(/^\/(cs|en)/)?.[1] ?? defaultLocale;
    return NextResponse.redirect(new URL(`/${locale}/login`, request.url));
  }

  return intlResponse;
}

export const config = {
  matcher: ["/", "/(cs|en)/:path*"],
};
```

### 6.3 RLS politiky (příklad)

```sql
-- Zapnout RLS na všech tabulkách
ALTER TABLE properties ENABLE ROW LEVEL SECURITY;
ALTER TABLE reservations ENABLE ROW LEVEL SECURITY;
ALTER TABLE guests ENABLE ROW LEVEL SECURITY;

-- Properties: autentizovaní uživatelé mohou vše
CREATE POLICY "Authenticated users can manage properties"
  ON properties FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- Reservations: autentizovaní mohou vše
CREATE POLICY "Authenticated users can manage reservations"
  ON reservations FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- Guests: autentizovaní mohou vše
CREATE POLICY "Authenticated users can manage guests"
  ON guests FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- Guests: anon může INSERT (pro self-service check-in)
CREATE POLICY "Anon can create guests for checkin"
  ON guests FOR INSERT
  TO anon
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM reservations r
      WHERE r.id = reservation_id
      AND r.status IN ('pending', 'confirmed')
    )
  );

-- Reservations: anon může SELECT + UPDATE (pro check-in flow)
CREATE POLICY "Anon can read reservations for checkin"
  ON reservations FOR SELECT
  TO anon
  USING (true);

CREATE POLICY "Anon can update reservation status for checkin"
  ON reservations FOR UPDATE
  TO anon
  USING (status IN ('pending', 'confirmed'))
  WITH CHECK (status = 'checked_in');
```

---

## 7. Typy a databázová typová bezpečnost

### 7.1 Generování typů z DB

```bash
# Jednorázové nastavení
npx supabase gen types typescript --project-id <ID> > src/types/database.ts
```

Výstup:

```ts
// src/types/database.ts (auto-generováno)
export type Database = {
  public: {
    Tables: {
      properties: {
        Row: {
          id: string;
          name: string;
          address: string | null;
          created_at: string;
        };
        Insert: { id?: string; name: string; address?: string | null };
        Update: { id?: string; name?: string; address?: string | null };
      };
      reservations: {
        Row: {
          /* ... */
        };
        Insert: {
          /* ... */
        };
        Update: {
          /* ... */
        };
      };
      guests: {
        Row: {
          /* ... */
        };
        Insert: {
          /* ... */
        };
        Update: {
          /* ... */
        };
      };
    };
  };
};
```

### 7.2 Doménové typy

```ts
// src/types/domain.ts
import type { Database } from "./database";

// Odvozené z DB typů — single source of truth
type Tables = Database["public"]["Tables"];

export type Property = Tables["properties"]["Row"];
export type PropertyInsert = Tables["properties"]["Insert"];
export type PropertyUpdate = Tables["properties"]["Update"];

export type Reservation = Tables["reservations"]["Row"];
export type ReservationInsert = Tables["reservations"]["Insert"];
export type ReservationUpdate = Tables["reservations"]["Update"];

export type Guest = Tables["guests"]["Row"];
export type GuestInsert = Tables["guests"]["Insert"];
export type GuestUpdate = Tables["guests"]["Update"];

// Enriched typy (s joiny)
export type ReservationWithProperty = Reservation & {
  property: Property;
};

export type ReservationWithGuests = Reservation & {
  guests: Guest[];
};
```

### 7.3 Formulářové typy (Zod)

```ts
// src/schemas/property.schema.ts
import { z } from "zod";

export const createPropertySchema = z.object({
  name: z.string().min(1, "Název je povinný").max(200),
  address: z.string().max(500).optional(),
});

export const updatePropertySchema = createPropertySchema.partial();

export type CreatePropertyInput = z.infer<typeof createPropertySchema>;
export type UpdatePropertyInput = z.infer<typeof updatePropertySchema>;
```

---

## 8. Best practices pro tento stack

### 8.1 Server Components jako default

```tsx
// SPRÁVNĚ — Server Component (default)
// app/[locale]/(admin)/properties/page.tsx
import { getProperties } from "@/repositories/properties.repository";
import { PropertiesTable } from "@/components/properties/PropertiesTable";

export default async function PropertiesPage() {
  const properties = await getProperties();
  return <PropertiesTable properties={properties} />;
}
```

```tsx
// ŠPATNĚ — zbytečně "use client" na stránce
"use client";
import { useEffect, useState } from "react";
// ... fetch v useEffect
```

### 8.2 Validace na OBOU stranách

```
Client (UX):    react-hook-form + zodResolver → okamžitá zpětná vazba
Server (bezpečnost): action parsuje STEJNÉ zod schéma → nikdy nevěř klientovi
```

### 8.3 Error handling pattern

```ts
// src/actions/properties.ts
"use server";

import { createPropertySchema } from "@/schemas/property.schema";
import * as propertiesService from "@/services/properties.service";
import { revalidatePath } from "next/cache";

type ActionResult<T> =
  | { success: true; data: T }
  | { success: false; error: string; fieldErrors?: Record<string, string[]> };

export async function createPropertyAction(
  input: unknown,
): Promise<ActionResult<{ id: string }>> {
  // 1. Validace
  const parsed = createPropertySchema.safeParse(input);
  if (!parsed.success) {
    return {
      success: false,
      error: "Neplatný vstup",
      fieldErrors: parsed.error.flatten().fieldErrors,
    };
  }

  // 2. Business logika
  try {
    const property = await propertiesService.create(parsed.data);
    revalidatePath("/[locale]/(admin)/properties");
    return { success: true, data: { id: property.id } };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "Neočekávaná chyba",
    };
  }
}
```

### 8.4 Zustand store pattern

```ts
// src/stores/properties.store.ts
import { create } from "zustand";
import type { Property } from "@/types/domain";

interface PropertiesState {
  properties: Property[];
  setProperties: (properties: Property[]) => void;
  addProperty: (property: Property) => void;
  updateProperty: (id: string, data: Partial<Property>) => void;
  removeProperty: (id: string) => void;
}

export const usePropertiesStore = create<PropertiesState>((set) => ({
  properties: [],
  setProperties: (properties) => set({ properties }),
  addProperty: (property) =>
    set((state) => ({ properties: [...state.properties, property] })),
  updateProperty: (id, data) =>
    set((state) => ({
      properties: state.properties.map((p) =>
        p.id === id ? { ...p, ...data } : p,
      ),
    })),
  removeProperty: (id) =>
    set((state) => ({
      properties: state.properties.filter((p) => p.id !== id),
    })),
}));
```

### 8.5 Optimistic updates

```tsx
"use client";
import { useTransition } from "react";
import { deletePropertyAction } from "@/actions/properties";
import { usePropertiesStore } from "@/stores/properties.store";
import { toast } from "sonner";

function DeleteButton({ propertyId }: { propertyId: string }) {
  const [isPending, startTransition] = useTransition();
  const removeProperty = usePropertiesStore((s) => s.removeProperty);
  const addProperty = usePropertiesStore((s) => s.addProperty);

  function handleDelete() {
    // Uložit pro rollback
    const backup = usePropertiesStore
      .getState()
      .properties.find((p) => p.id === propertyId);

    // Optimistický update
    removeProperty(propertyId);

    startTransition(async () => {
      const result = await deletePropertyAction(propertyId);
      if (!result.success) {
        // Rollback
        if (backup) addProperty(backup);
        toast.error(result.error);
      } else {
        toast.success("Jednotka smazána");
      }
    });
  }

  return (
    <Button variant="destructive" onClick={handleDelete} disabled={isPending}>
      Smazat
    </Button>
  );
}
```

### 8.6 Revalidace stránkových dat

```ts
// V Server Action po mutaci:
import { revalidatePath } from "next/cache";

// Revaliduje konkrétní stránku (její Server Component se znovu spustí)
revalidatePath("/[locale]/(admin)/properties");

// Nebo revaliduje tag (pokud používáte fetch s cache tags)
import { revalidateTag } from "next/cache";
revalidateTag("properties");
```

### 8.7 Sdílení layoutu s AdminShell

```tsx
// app/[locale]/(admin)/layout.tsx — Server Component
import { createServerClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { AdminShell } from "@/components/layout/AdminShell";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  return <AdminShell user={user}>{children}</AdminShell>;
}
```

---

## 9. Čemu se vyhnout (anti-patterns)

### 9.1 NIKDY: Supabase přímo z komponenty

```tsx
// ❌ ŠPATNĚ
"use client";
import { supabase } from "@/lib/supabaseClient";

function MyComponent() {
  useEffect(() => {
    supabase.from("properties").select("*").then(/* ... */);
  }, []);
}
```

```tsx
// ✅ SPRÁVNĚ — data ze Server Component nebo přes Server Action
export default async function Page() {
  const properties = await getProperties(); // repository na serveru
  return <MyClientComponent properties={properties} />;
}
```

### 9.2 NIKDY: Business logika v Server Action

```ts
// ❌ ŠPATNĚ — akce dělá příliš mnoho
"use server";
export async function createReservation(input) {
  const parsed = schema.safeParse(input);
  // ... 50 řádků business logiky ...
  // ... kontrola kolizí ...
  // ... email notifikace ...
  // ... audit log ...
  const supabase = await createServerClient();
  await supabase.from("reservations").insert(/* ... */);
}
```

```ts
// ✅ SPRÁVNĚ — akce jen validuje a deleguje
"use server";
export async function createReservation(input) {
  const parsed = schema.safeParse(input);
  if (!parsed.success) return { error: parsed.error };
  const result = await reservationsService.create(parsed.data);
  revalidatePath("...");
  return { data: result };
}
```

### 9.3 NIKDY: `"use client"` na stránce

```tsx
// ❌ ŠPATNĚ
"use client"; // celá stránka je client component
export default function PropertiesPage() {
  /* ... */
}
```

```tsx
// ✅ SPRÁVNĚ — stránka je Server Component, interaktivní části jsou client
export default async function PropertiesPage() {
  const data = await getProperties(); // server-side fetch
  return <InteractiveTable data={data} />; // "use client" jen na tabulce
}
```

### 9.4 NIKDY: NEXT_PUBLIC pro service role key

```env
# ❌ ŠPATNĚ — nikdy neexponovat service role do browseru
NEXT_PUBLIC_SUPABASE_SERVICE_ROLE_KEY=...

# ✅ SPRÁVNĚ — service role jen na serveru (bez NEXT_PUBLIC prefix)
SUPABASE_SERVICE_ROLE_KEY=...
```

### 9.5 NIKDY: Ignorovat loading a error states

```tsx
// ❌ ŠPATNĚ
{
  properties.map((p) => <div>{p.name}</div>);
}

// ✅ SPRÁVNĚ
{
  loading ? <Skeleton /> : null;
}
{
  error ? <ErrorMessage error={error} /> : null;
}
{
  properties.length === 0 ? <EmptyState /> : null;
}
{
  properties.map((p) => <PropertyCard key={p.id} property={p} />);
}
```

### 9.6 NIKDY: Míchání Zustand store s prop drilling

```tsx
// ❌ ŠPATNĚ — store + props duplikace
<Component properties={properties} /> // props
// a zároveň uvnitř: usePropertiesStore()

// ✅ SPRÁVNĚ — jedno NEBO druhé
// Server Component → předat jako props
// Client Component potřebuje real-time → Zustand store
```

### 9.7 NIKDY: Přímý import mezi vrstvami přeskočením

```
// ❌ ŠPATNĚ — UI volá přímo repository
UI Component → repositories/properties.repository.ts

// ❌ ŠPATNĚ — Action volá přímo Supabase
Server Action → supabase.from("properties")...

// ✅ SPRÁVNĚ — každá vrstva volá jen tu pod sebou
UI → Action → Service → Repository → Supabase
```

---

## 10. Migrační plán (fáze) — stav

### Fáze 0: Příprava ✅ HOTOVO

Dependencies nainstalované: `@supabase/ssr`, `react-hook-form`, `zod`, `sonner`, Radix UI primitiva, `next-intl`.
Zustand je v dependencies ale nepoužívá se (stav řešen props + revalidatePath).

### Fáze 1: Infrastruktura ✅ HOTOVO

1. ✅ `src/lib/supabase/server.ts` — `createServerClient()`, `createAdminClient()`, `getUser()`, `requireUser()`
2. ✅ `src/lib/supabase/client.ts` — browser klient
3. ✅ `src/types/` — manuálně definované typy (property, reservation, guest, action)
4. ✅ `src/schemas/` — Zod schémata (property, reservation, guest)
5. ✅ `src/repositories/` — properties, reservations, guests
6. ✅ `src/services/` — properties, reservations, guests, ical-sync
7. ✅ `src/actions/` — auth, properties, reservations, guests, checkin, instructions

### Fáze 2: Auth + RLS ✅ HOTOVO

1. ✅ RLS politiky na všech tabulkách (user_id based)
2. ✅ Supabase Auth (email + heslo)
3. ✅ Middleware (auth guard + next-intl routing)
4. ✅ Login + register stránky
5. ✅ Admin layout s DashboardShell

### Fáze 3: Migrace stránek ✅ HOTOVO

1. ✅ Properties — Server Component + Client CRUD + nastavení (9 polí)
2. ✅ Reservations — Server Component + Client tabulka + inline edit
3. ✅ Dashboard — Server Component se statistikami
4. ✅ Check-in — veřejná stránka, čistý guest UI, 3-krokový wizard
5. ✅ iCal synchronizace — parser, adaptéry, cron endpoint, admin client

### Fáze 4: Design systém — ČÁSTEČNĚ

1. ✅ Dialog komponenty (Radix UI base)
2. ✅ DataTable (vlastní implementace)
3. ✅ Formuláře s react-hook-form + zodResolver
4. ✅ AdminSidebar + DashboardShell layout
5. ✅ Toast notifikace
6. ❌ Responsivní design (mobilní sidebar) — CHYBÍ
7. ❌ Zustand stores — NEIMPLEMENTOVÁNO (není potřeba v aktuálním rozsahu)

---

## Technologický stack — shrnutí

| Vrstva         | Technologie                     | Verze     |
| -------------- | ------------------------------- | --------- |
| Framework      | Next.js (App Router)            | 15.x      |
| Runtime        | React                           | 19.x      |
| Jazyk          | TypeScript                      | 5.x       |
| Databáze       | Supabase (PostgreSQL)           | -         |
| Auth           | Supabase Auth + `@supabase/ssr` | 0.5.x     |
| State (client) | Zustand                         | 5.x       |
| Formuláře      | react-hook-form + Zod           | 7.x / 3.x |
| UI komponenty  | shadcn/ui (Radix + Tailwind)    | latest    |
| Styling        | Tailwind CSS                    | 4.x       |
| Tabulky        | @tanstack/react-table           | 8.x       |
| Toasty         | sonner                          | 2.x       |
| i18n           | next-intl                       | 4.x       |

---

## Závěr

Tato architektura řeší všechny identifikované problémy:

- **Bezpečnost**: Server-side Supabase klient + RLS + Auth
- **Výkon**: Server Components jako default, minimální client JS
- **Údržitelnost**: Čisté vrstvy, single responsibility, testovatelné služby
- **Škálovatelnost**: Zustand místo Context, feature-based organizace
- **DX**: shadcn/ui pro rychlý vývoj, auto-generované typy, sdílená Zod schémata

Migrace je navržena tak, aby mohla probíhat inkrementálně — stránku po stránce — bez nutnosti "velkého třesku".
