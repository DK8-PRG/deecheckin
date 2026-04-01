# DeeCheckIn — Use Cases

> Tento dokument definuje use cases pro DeeCheckIn systém.
> Slouží jako základ pro návrh architektury, DB schématu a implementačního plánu.

---

## Aktéři

| Aktér           | Popis                                          |
| --------------- | ---------------------------------------------- |
| **Majitel**     | OSVČ s 1–2 byty, spravuje rezervace a check-in |
| **Host**        | Osoba, která si rezervovala ubytování          |
| **Systém**      | DeeCheckIn backend (sync, notifikace)          |
| **Booking.com** | Externí platforma (iCal feed)                  |
| **Airbnb**      | Externí platforma (iCal feed)                  |

---

## Data dostupná z iCal feedů

### Booking.com iCal

| Pole                  | Dostupnost | Kde v iCal                                                    |
| --------------------- | ---------- | ------------------------------------------------------------- |
| **Jméno hosta**       | ⚠️ ne vždy | `SUMMARY`: `CLOSED - Name` nebo `CLOSED - Not available`      |
| **Check-in datum**    | ✅         | `DTSTART`                                                     |
| **Check-out datum**   | ✅         | `DTEND`                                                       |
| **Booking reference** | ⚠️ ne vždy | `DESCRIPTION` (číslo rezervace)                               |
| **Počet hostů**       | ⚠️ ne vždy | `DESCRIPTION`                                                 |
| **Telefon**           | ⚠️ ne vždy | `DESCRIPTION` (ne vždy)                                       |
| **Status**            | ⚠️         | Všechny eventy = `CLOSED`, nelze rozlišit confirmed/cancelled |
| **UID**               | ✅         | `UID` (unikátní ID pro deduplikaci)                           |
| Email hosta           | ❌         | Booking nesdílí přes iCal                                     |
| Cena                  | ❌         | Ne                                                            |
| Národnost             | ❌         | Ne                                                            |

> **Reálné zjištění:** Většina Booking.com iCal exportů obsahuje pouze `CLOSED - Not available`
> bez jména hosta, tel. čísla nebo reference. Rezervace se importují jako anonymní blokované termíny.
> Majitel pak doplní jméno hosta ručně v admin panelu.

### Airbnb iCal

| Pole                 | Dostupnost | Kde v iCal              |
| -------------------- | ---------- | ----------------------- |
| **Jméno hosta**      | ✅         | `SUMMARY`               |
| **Check-in datum**   | ✅         | `DTSTART`               |
| **Check-out datum**  | ✅         | `DTEND`                 |
| **Airbnb reference** | ✅         | `UID`                   |
| **Telefon**          | ⚠️         | `DESCRIPTION` (ne vždy) |
| Email hosta          | ❌         | Ne                      |
| Počet hostů          | ❌         | Ne                      |
| Cena                 | ❌         | Ne                      |

### Klíčové omezení

- **Email hosta z iCal nedostaneme** → automatický email check-in linku není možný přímo
- **Property se nedá stáhnout** → iCal URL je per-property, majitel ho zadá ručně (má 1-2 byty, trvá 30s)
- **Booking reference** je primární matchovací klíč pro párování host ↔ rezervace

---

## UC-01: Registrace majitele

|                |                                                                                                                |
| -------------- | -------------------------------------------------------------------------------------------------------------- |
| **Aktér**      | Majitel                                                                                                        |
| **Předpoklad** | Majitel má email                                                                                               |
| **Flow**       | 1. Majitel se registruje (email + heslo / Google OAuth) → 2. Vytvoří profil → 3. Přidá svůj první objekt (byt) |
| **Výstup**     | Účet vytvořen, objekt založen, prázdný kalendář                                                                |
| **Status**     | ✅ Implementováno (email + heslo)                                                                              |

---

## UC-02: Přidání objektu (property)

|                |                                                                                  |
| -------------- | -------------------------------------------------------------------------------- |
| **Aktér**      | Majitel                                                                          |
| **Předpoklad** | Majitel je přihlášen                                                             |
| **Flow**       | 1. Klikne "Přidat objekt" → 2. Vyplní: název, adresa, kapacita, popis → 3. Uloží |
| **Výstup**     | Objekt vytvořen, připraven na napojení kalendářů                                 |
| **Status**     | ✅ Implementováno                                                                |

---

## UC-03: Napojení Booking.com kalendáře

|                      |                                                                                                                                                                    |
| -------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| **Aktér**            | Majitel                                                                                                                                                            |
| **Předpoklad**       | Objekt existuje, majitel má Booking účet                                                                                                                           |
| **Flow**             | 1. Majitel jde do nastavení objektu → 2. Vloží iCal URL z Booking extranetu → 3. Systém provede první sync → 4. Zobrazí importované rezervace → 5. Majitel potvrdí |
| **Výstup**           | Rezervace z Booking importovány, nastaveno pravidelné pollování                                                                                                    |
| **Alternativa**      | Neplatný URL → chybová hláška                                                                                                                                      |
| **Technický detail** | iCal feed obsahuje: jméno hosta, check-in/out datum, booking reference. Polling každých 15–30 min.                                                                 |
| **Status**           | 🔨 K implementaci                                                                                                                                                  |

---

## UC-04: Napojení Airbnb kalendáře

|                      |                                                                 |
| -------------------- | --------------------------------------------------------------- |
| **Aktér**            | Majitel                                                         |
| **Předpoklad**       | Objekt existuje, majitel má Airbnb účet                         |
| **Flow**             | Stejný jako UC-03, ale s Airbnb iCal URL                        |
| **Výstup**           | Rezervace z Airbnb importovány                                  |
| **Technický detail** | Airbnb iCal formát je mírně odlišný od Booking — nutný adapter. |
| **Status**           | 🔨 K implementaci                                               |

---

## UC-05: Vytvoření ruční rezervace

|                |                                                                                                                                                                                                                                           |
| -------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Aktér**      | Majitel                                                                                                                                                                                                                                   |
| **Předpoklad** | Objekt existuje                                                                                                                                                                                                                           |
| **Flow**       | 1. Majitel klikne "Nová rezervace" → 2. Vyplní: host (jméno, email, telefon), check-in/out datum, počet hostů, poznámky → 3. Systém zkontroluje kolizi s existujícími rezervacemi → 4. Pokud volno → uloží → 5. Pokud obsazeno → varování |
| **Výstup**     | Rezervace vytvořena, zobrazena v kalendáři                                                                                                                                                                                                |
| **Export**     | Systém vygeneruje iCal blokaci → Booking/Airbnb vidí obsazený termín                                                                                                                                                                      |
| **Status**     | ✅ Implementováno (bez kontroly kolize a exportu)                                                                                                                                                                                         |

---

## UC-06: Unified kalendář / přehled rezervací

|                |                                                                                                                                                                                                                               |
| -------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Aktér**      | Majitel                                                                                                                                                                                                                       |
| **Předpoklad** | Alespoň 1 objekt s rezervacemi                                                                                                                                                                                                |
| **Flow**       | 1. Majitel otevře dashboard → 2. Vidí unified timeline/calendar view → 3. Každá rezervace barevně odlišena podle zdroje (Booking = modrá, Airbnb = červená, vlastní = zelená) → 4. Může filtrovat podle objektu, zdroje, data |
| **Výstup**     | Přehledný pohled na všechny rezervace napříč platformami                                                                                                                                                                      |
| **Status**     | 🔨 K implementaci (teď existuje jen tabulkový view)                                                                                                                                                                           |

---

## UC-07: Automatická synchronizace kalendářů

|                |                                                                                                                                                                                      |
| -------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| **Aktér**      | Systém                                                                                                                                                                               |
| **Trigger**    | Každých 15–30 minut (cron)                                                                                                                                                           |
| **Flow**       | 1. Pro každý objekt s napojeným iCal → 2. Stáhni iCal feed → 3. Porovnej s existujícími rezervacemi → 4. Nové → vytvoř → 5. Zrušené → označ jako cancelled → 6. Změněné → aktualizuj |
| **Výstup**     | Rezervace aktuální, majitel notifikován o změnách                                                                                                                                    |
| **Edge cases** | Feed nedostupný → retry za 5 min, log chyby                                                                                                                                          |
| **Status**     | 🔨 K implementaci                                                                                                                                                                    |

---

## UC-08: Prevence double-bookingu

|              |                                                                                                                                                            |
| ------------ | ---------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Aktér**    | Systém                                                                                                                                                     |
| **Trigger**  | Nová rezervace (import nebo ruční)                                                                                                                         |
| **Flow**     | 1. Kontrola překryvu datumů pro stejný objekt → 2. Pokud kolize → označ jako konflikt → notifikuj majitele → 3. Majitel rozhodne (zruší jednu z rezervací) |
| **Výstup**   | Konflikt detekován a zobrazen                                                                                                                              |
| **Prevence** | Export vlastních rezervací zpět do Booking/Airbnb iCal → platformy blokují termín                                                                          |
| **Status**   | 🔨 K implementaci (Fáze 2)                                                                                                                                 |

---

## UC-09: Doručení check-in odkazu hostovi

|                                          |                                                                                                                                                           |
| ---------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Aktér**                                | Majitel / Systém                                                                                                                                          |
| **Předpoklad**                           | Rezervace existuje v systému                                                                                                                              |
| **Problém**                              | Z iCal nemáme email hosta → nelze poslat email automaticky                                                                                                |
| **Flow — Cesta A (Booking/Airbnb chat)** | 1. Sync vytvoří rezervaci → 2. Systém připraví zprávu se check-in linkem → 3. Majitel jedním klikem zkopíruje → 4. Vloží do Booking/Airbnb chatu s hostem |
| **Flow — Cesta B (ruční email)**         | U ručních rezervací email máme → systém může poslat automaticky X dní před check-in                                                                       |
| **Flow — Cesta C (QR kód)**              | Systém vygeneruje QR kód s check-in URL → majitel ho může vytisknout / dát do bytu                                                                        |
| **Check-in URL formát**                  | `deecheckin.com/cs/checkin?ref={booking_reference}` nebo generický `deecheckin.com/cs/checkin`                                                            |
| **Šablona zprávy**                       | "Dobrý den [jméno], prosím vyplňte online check-in před příjezdem: [link]. Děkujeme!"                                                                     |
| **Výstup**                               | Host obdrží check-in odkaz jednou z výše uvedených cest                                                                                                   |
| **Status**                               | 🔨 K implementaci                                                                                                                                         |

---

## UC-10: Self check-in hosta

|                                  |                                                                                                       |
| -------------------------------- | ----------------------------------------------------------------------------------------------------- |
| **Aktér**                        | Host                                                                                                  |
| **Předpoklad**                   | Host má check-in link nebo ví číslo rezervace                                                         |
| **Krok 1 — Vyhledání rezervace** | Host otevře check-in stránku a najde svou rezervaci jedním ze způsobů:                                |
|                                  | **A) Přímý link** — URL obsahuje booking reference → rovnou zobrazí rezervaci                         |
|                                  | **B) Číslo rezervace** — host zadá booking/airbnb reference číslo (má ho v potvrzovacím emailu)       |
|                                  | **C) Příjmení + datum** — host zadá příjmení + check-in datum → systém vyhledá match                  |
| **Krok 2 — Potvrzení**           | Host vidí: název objektu, datumy, své jméno → potvrdí "To jsem já"                                    |
| **Krok 3 — Formulář**            | Vyplní údaje za každého hosta: jméno, příjmení, datum narození, národnost, číslo dokladu, typ dokladu |
| **Krok 4 — Doklad**              | Vyfotí doklad (volitelné)                                                                             |
| **Krok 5 — GDPR**                | Odsouhlasí zpracování osobních údajů                                                                  |
| **Krok 6 — Odeslání**            | Data uložena, status = "checked-in"                                                                   |
| **Krok 7 — Instrukce**           | Ihned po odeslání zobrazí příjezdové instrukce (→ UC-11)                                              |
| **Bez přihlášení**               | Host NEPOTŘEBUJE účet — formulář je veřejný                                                           |
| **Matchovací klíče**             | Primární: booking reference (přesný match). Záložní: příjmení + datum (fuzzy).                        |
| **Status**                       | ✅ Částečně implementováno (chybí lookup by reference, instrukce po check-inu)                        |

---

## UC-11: Instrukce po check-inu

|                 |                                                                                                                                                                                                |
| --------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Aktér**       | Systém                                                                                                                                                                                         |
| **Trigger**     | Host dokončí check-in (UC-10)                                                                                                                                                                  |
| **Flow**        | 1. Systém zobrazí stránku s instrukcemi → 2. Obsahuje: adresa, jak se dostat, kód ke dveřím/klíčenka, WiFi heslo, domovní řád, kontakt na majitele → 3. Volitelně pošle email se stejnými info |
| **Výstup**      | Host má vše potřebné pro příjezd                                                                                                                                                               |
| **Konfigurace** | Majitel nastaví instrukce per objekt (šablona)                                                                                                                                                 |
| **Status**      | 🔨 K implementaci                                                                                                                                                                              |

---

## UC-12: Přehled hostů a kniha hostů

|                |                                                                                                                                                  |
| -------------- | ------------------------------------------------------------------------------------------------------------------------------------------------ |
| **Aktér**      | Majitel                                                                                                                                          |
| **Předpoklad** | Hosté vyplnili check-in                                                                                                                          |
| **Flow**       | 1. Majitel otevře rezervaci → 2. Vidí seznam hostů s vyplněnými údaji → 3. Může exportovat pro úřady (domovní kniha / hlášení cizinecké policii) |
| **Výstup**     | Přehled hostů, možnost exportu                                                                                                                   |
| **Status**     | 🔨 K implementaci (Fáze 2)                                                                                                                       |

---

## UC-13: Nastavení instrukcí pro objekt

|            |                                                                                                                              |
| ---------- | ---------------------------------------------------------------------------------------------------------------------------- |
| **Aktér**  | Majitel                                                                                                                      |
| **Flow**   | 1. Majitel jde do nastavení objektu → 2. Vyplní: příjezdové instrukce, přístupový kód, WiFi, domovní řád, kontakt → 3. Uloží |
| **Výstup** | Instrukce uloženy, zobrazí se hostům po check-inu (UC-11)                                                                    |
| **Status** | 🔨 K implementaci                                                                                                            |

---

## Prioritizace

### MVP (Fáze 1)

- [x] UC-01 Registrace majitele
- [x] UC-02 Přidání objektu
- [ ] UC-03 Napojení Booking.com iCal
- [ ] UC-04 Napojení Airbnb iCal
- [x] UC-05 Ruční rezervace
- [ ] UC-06 Unified kalendář
- [ ] UC-07 Auto sync
- [x] UC-10 Self check-in
- [ ] UC-11 Instrukce po check-inu

### Fáze 2

- [ ] UC-08 Double-booking prevence
- [ ] UC-09 Automatické posílání check-in emailů
- [ ] UC-12 Export knihy hostů
- [ ] UC-13 Nastavení instrukcí per objekt

### Fáze 3

- [ ] iCal export (zpětný sync do Booking/Airbnb)
- [ ] SMS notifikace
- [ ] Multi-language instrukce pro hosty
