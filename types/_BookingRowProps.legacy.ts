// Centralizované typy pro celou aplikaci
export interface Property extends Record<string, unknown> {
  id: string;
  name: string;
  address?: string;
}

export interface Reservation extends Record<string, unknown> {
  book_number: number;
  booked_by: string;
  guest_names: string;
  check_in: string;
  check_out: string;
  booked_on: string;
  status: string;
  rooms: number;
  people: number;
  adults: number;
  children: number;
  children_ages: string;
  price: string;
  commission_percent: number;
  commission_amount: string;
  payment_status: string;
  payment_method: string;
  remarks: string;
  booker_group: string;
  booker_country: string;
  travel_purpose: string;
  device: string;
  property_id: number;
  duration_nights: number;
  cancellation_date: string | null;
  address: string;
  phone_number: string;
  guest_id: number | null;
  source?: string;
  reservation_status?: string;
  special_requests?: string;
  early_checkin?: boolean;
  late_checkout?: boolean;
  early_checkin_time?: string;
  late_checkout_time?: string;
  pet?: boolean;
  payment_type?: string;
  pin_code?: string;
  last_status_update?: string;
}

export interface Guest {
  id: number;
  reservation_id: number;
  full_name: string;
  birth_date: string;
  nationality: string;
  document_type: string;
  document_number: string;
  address_street: string;
  address_city: string;
  address_zip: string;
  address_country: string;
  stay_purpose: string;
  phone: string;
  email: string;
  consent: boolean;
  document_photo_url: string;
  created_at: string;
  company_name?: string;
  company_vat?: string;
  company_address?: string;
  wants_invoice?: boolean;
}

// interface BookingRowProps byl odstraněn, používejte Reservation
