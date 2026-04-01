import type { useTranslations } from "next-intl";
import type { Reservation as FullReservation } from "@/types/reservation";

/** Subset of Reservation fields needed by the check-in wizard UI. */
export type CheckinReservation = Pick<
  FullReservation,
  | "book_number"
  | "guest_names"
  | "check_in"
  | "check_out"
  | "rooms"
  | "people"
  | "adults"
  | "status"
>;

export type TranslationFn = ReturnType<typeof useTranslations>;

/** Creates a blank guest form entry for the given index. */
export const createEmptyGuest = (
  index: number,
  firstName = "",
  lastName = "",
) => ({
  guest_index: index,
  first_name: firstName,
  last_name: lastName,
  birth_date: "",
  nationality: "",
  document_type: "" as const,
  document_number: "",
  issuing_country: "",
  address_street: "",
  address_city: "",
  address_zip: "",
  address_country: "",
  stay_purpose: "recreation" as const,
  phone: "",
  email: "",
});
