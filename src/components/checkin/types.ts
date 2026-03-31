import type { useTranslations } from "next-intl";

export interface Reservation {
  book_number: number | null;
  guest_names: string | null;
  check_in: string;
  check_out: string;
  rooms: number | null;
  people: number | null;
  adults: number | null;
  reservation_status: string | null;
  status: string;
}

export type TranslationFn = ReturnType<typeof useTranslations>;
