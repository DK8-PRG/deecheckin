import { createServerClient, createAdminClient } from "@/lib/supabase/server";
import type { Guest, GuestInsert } from "@/types/guest";

// ---------------------------------------------------------------------------
// Guests repository — SOLE place that talks to Supabase for guests
// ---------------------------------------------------------------------------

export async function findByReservationId(
  reservationId: string,
): Promise<Guest[]> {
  const supabase = await createServerClient();
  const { data, error } = await supabase
    .from("guests")
    .select("*")
    .eq("reservation_id", reservationId)
    .order("guest_index", { ascending: true });

  if (error) throw new Error(error.message);
  return (data ?? []) as Guest[];
}

/**
 * Public variant — bypasses RLS for guest check-in flow.
 */
export async function findByReservationIdPublic(
  reservationId: string,
): Promise<Guest[]> {
  const supabase = createAdminClient();
  const { data, error } = await supabase
    .from("guests")
    .select("*")
    .eq("reservation_id", reservationId)
    .order("guest_index", { ascending: true });

  if (error) throw new Error(error.message);
  return (data ?? []) as Guest[];
}

export async function findUnpairedByProperty(
  propertyId: string,
): Promise<Guest[]> {
  const supabase = await createServerClient();
  const { data, error } = await supabase
    .from("guests")
    .select("*")
    .eq("property_id", propertyId)
    .is("reservation_id", null)
    .order("created_at", { ascending: false });

  if (error) throw new Error(error.message);
  return (data ?? []) as Guest[];
}

export async function pairWithReservation(
  checkinGroupId: string,
  reservationId: string,
): Promise<void> {
  const supabase = await createServerClient();
  const { error } = await supabase
    .from("guests")
    .update({
      reservation_id: reservationId,
      paired_at: new Date().toISOString(),
    })
    .eq("checkin_group_id", checkinGroupId);

  if (error) throw new Error(error.message);
}

export async function createMany(guests: GuestInsert[]): Promise<Guest[]> {
  const supabase = await createServerClient();
  const { data, error } = await supabase.from("guests").insert(guests).select();

  if (error) throw new Error(error.message);
  return (data ?? []) as Guest[];
}

/**
 * Public variant — bypasses RLS for guest check-in flow.
 */
export async function createManyPublic(
  guests: GuestInsert[],
): Promise<Guest[]> {
  const supabase = createAdminClient();
  const { data, error } = await supabase.from("guests").insert(guests).select();

  if (error) throw new Error(error.message);
  return (data ?? []) as Guest[];
}

/**
 * Find all unpaired guests for the current user (across all properties).
 */
export async function findAllUnpaired(): Promise<Guest[]> {
  const supabase = await createServerClient();
  const { data, error } = await supabase
    .from("guests")
    .select("*")
    .is("reservation_id", null)
    .order("created_at", { ascending: false });

  if (error) throw new Error(error.message);
  return (data ?? []) as Guest[];
}
