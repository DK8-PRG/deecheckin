import { createServerClient } from "@/lib/supabase/server";
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

export async function createMany(guests: GuestInsert[]): Promise<Guest[]> {
  const supabase = await createServerClient();
  const { data, error } = await supabase.from("guests").insert(guests).select();

  if (error) throw new Error(error.message);
  return (data ?? []) as Guest[];
}
