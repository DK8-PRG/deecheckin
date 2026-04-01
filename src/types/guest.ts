// ---------------------------------------------------------------------------
// Domain types for the Guest / Check-in feature
// ---------------------------------------------------------------------------

export interface Guest {
  id: string;
  reservation_id: string | null;
  property_id: string | null;
  guest_index: number;
  first_name: string;
  last_name: string;
  birth_date: string;
  nationality: string;
  document_type: string;
  document_number: string;
  issuing_country: string | null;
  address_street: string;
  address_city: string;
  address_zip: string;
  address_country: string;
  stay_purpose: string;
  phone: string | null;
  email: string | null;
  consent: boolean;
  document_photo_url: string | null;
  check_in_date: string | null;
  check_out_date: string | null;
  paired_at: string | null;
  checkin_group_id: string | null;
  created_at: string | null;
}

export interface GuestInsert {
  reservation_id?: string;
  property_id?: string;
  guest_index: number;
  first_name: string;
  last_name: string;
  birth_date: string;
  nationality: string;
  document_type: string;
  document_number: string;
  issuing_country?: string;
  address_street: string;
  address_city: string;
  address_zip: string;
  address_country: string;
  stay_purpose: string;
  phone?: string;
  email?: string;
  consent: boolean;
  check_in_date?: string;
  check_out_date?: string;
  checkin_group_id?: string;
}

/** Legacy check-in (with book_number) */
export interface CheckinSubmission {
  book_number: string;
  guests: Omit<GuestInsert, "reservation_id">[];
  consent: boolean;
}

/** New independent check-in (without reservation) */
export interface IndependentCheckinSubmission {
  property_id: string;
  check_in_date: string;
  check_out_date: string;
  guests: Omit<
    GuestInsert,
    | "reservation_id"
    | "property_id"
    | "check_in_date"
    | "check_out_date"
    | "checkin_group_id"
    | "consent"
  >[];
  consent: boolean;
}
