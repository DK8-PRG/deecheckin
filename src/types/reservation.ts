// ---------------------------------------------------------------------------
// Domain types for the Reservation feature
// ---------------------------------------------------------------------------

/** Row type as returned from Supabase `reservations` table. */
export interface Reservation {
  id: string;
  property_id: string;
  book_number: number | null;
  booked_by: string | null;
  guest_names: string | null;
  check_in: string;
  check_out: string;
  booked_on: string | null;
  status: string;
  rooms: number | null;
  people: number | null;
  adults: number | null;
  children: number | null;
  children_ages: string | null;
  price: string | null;
  commission_percent: number | null;
  commission_amount: string | null;
  payment_status: string | null;
  payment_method: string | null;
  remarks: string | null;
  booker_group: string | null;
  booker_country: string | null;
  travel_purpose: string | null;
  device: string | null;
  duration_nights: number | null;
  cancellation_date: string | null;
  address: string | null;
  phone_number: string | null;
  guest_id: number | null;
  source: string | null;
  reservation_status: string | null;
  special_requests: string | null;
  early_checkin: boolean | null;
  late_checkout: boolean | null;
  early_checkin_time: string | null;
  late_checkout_time: string | null;
  pet: boolean | null;
  payment_type: string | null;
  pin_code: string | null;
  last_status_update: string | null;
  created_at: string | null;
}

/** Data shape for inserting a new reservation row. */
export interface ReservationInsert {
  property_id: string;
  guest_names?: string;
  check_in: string;
  check_out: string;
  source?: string;
  status?: string;
  rooms?: number;
  adults?: number;
  children?: number;
  price?: string;
  remarks?: string;
  phone_number?: string;
  special_requests?: string;
  /** Set automatically by the repository from the auth session. */
  user_id?: string;
}

/** Data shape for updating an existing reservation row. */
export type ReservationUpdate = Partial<ReservationInsert>;

/** Property type (minimal, for the dropdown). */
export interface PropertyOption {
  id: string;
  name: string;
}

/** Generic action result wrapper. */
export type ActionResult<T = void> =
  | { success: true; data: T }
  | {
      success: false;
      error: string;
      fieldErrors?: Record<string, string[]>;
    };
