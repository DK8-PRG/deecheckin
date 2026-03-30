// ---------------------------------------------------------------------------
// Domain types for the Guest / Check-in feature
// ---------------------------------------------------------------------------

export interface Guest {
  id: string;
  reservation_id: string;
  guest_index: number;
  first_name: string;
  last_name: string;
  birth_date: string;
  nationality: string;
  document_type: string;
  document_number: string;
  address_street: string;
  address_city: string;
  address_zip: string;
  address_country: string;
  stay_purpose: string;
  phone: string | null;
  email: string | null;
  consent: boolean;
  document_photo_url: string | null;
  created_at: string | null;
}

export interface GuestInsert {
  reservation_id: string;
  guest_index: number;
  first_name: string;
  last_name: string;
  birth_date: string;
  nationality: string;
  document_type: string;
  document_number: string;
  address_street: string;
  address_city: string;
  address_zip: string;
  address_country: string;
  stay_purpose: string;
  phone?: string;
  email?: string;
  consent: boolean;
}

export interface CheckinSubmission {
  book_number: string;
  guests: Omit<GuestInsert, "reservation_id">[];
  consent: boolean;
}
