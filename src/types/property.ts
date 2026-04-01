// ---------------------------------------------------------------------------
// Domain types for the Property feature
// ---------------------------------------------------------------------------

/** Row type as returned from Supabase `properties` table. */
export interface Property {
  id: string;
  name: string;
  address: string | null;
  user_id: string | null;
  created_at: string | null;
  // Settings (Phase 1.1)
  checkin_instructions: string | null;
  access_code: string | null;
  wifi_name: string | null;
  wifi_password: string | null;
  house_rules: string | null;
  contact_phone: string | null;
  contact_email: string | null;
  ical_booking_url: string | null;
  ical_airbnb_url: string | null;
  // Guest landing page
  slug: string | null;
  description: string | null;
  public_page_enabled: boolean;
}

/** Data shape for inserting a new property row. */
export interface PropertyInsert {
  name: string;
  address?: string;
  user_id?: string;
}

/** Data shape for updating an existing property row. */
export type PropertyUpdate = Partial<
  Omit<Property, "id" | "user_id" | "created_at">
>;
