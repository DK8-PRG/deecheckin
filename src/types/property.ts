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
}

/** Data shape for inserting a new property row. */
export interface PropertyInsert {
  name: string;
  address?: string;
  user_id?: string;
}

/** Data shape for updating an existing property row. */
export type PropertyUpdate = Partial<Omit<PropertyInsert, "user_id">>;
