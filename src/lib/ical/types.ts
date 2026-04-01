// ---------------------------------------------------------------------------
// Types for iCal parsing and sync
// ---------------------------------------------------------------------------

/** A single parsed VEVENT from an iCal feed. */
export interface ICalEvent {
  uid: string;
  summary: string;
  dtstart: string; // YYYY-MM-DD
  dtend: string; // YYYY-MM-DD
  description: string;
  location: string;
}

/** Normalized reservation data extracted from an iCal event. */
export interface NormalizedReservation {
  ical_uid: string;
  guest_names: string;
  check_in: string; // YYYY-MM-DD
  check_out: string; // YYYY-MM-DD
  source: "booking" | "airbnb";
  external_reference: string;
  adults: number | null;
  phone_number: string;
  status: string;
}

/** Result of a sync operation for a single property. */
export interface SyncResult {
  property_id: string;
  property_name: string;
  created: number;
  updated: number;
  cancelled: number;
  errors: string[];
}
