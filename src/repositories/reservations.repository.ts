import { createServerClient, getUser } from "@/lib/supabase/server";
import type {
  Reservation,
  ReservationInsert,
  ReservationUpdate,
  PropertyOption,
} from "@/types/reservation";

// ---------------------------------------------------------------------------
// Reservations repository — SOLE place that talks to Supabase
// ---------------------------------------------------------------------------

export async function findAll(): Promise<Reservation[]> {
  const supabase = await createServerClient();
  const { data, error } = await supabase
    .from("reservations")
    .select("*")
    .order("check_in", { ascending: false });

  if (error) throw new Error(error.message);
  return (data ?? []) as Reservation[];
}

export async function findById(id: string): Promise<Reservation | null> {
  const supabase = await createServerClient();
  const { data, error } = await supabase
    .from("reservations")
    .select("*")
    .eq("id", id)
    .single();

  if (error && error.code !== "PGRST116") throw new Error(error.message);
  return (data as Reservation) ?? null;
}

export async function create(input: ReservationInsert): Promise<Reservation> {
  const supabase = await createServerClient();
  const user = await getUser();
  if (!user) throw new Error("Nepřihlášen");

  const { data, error } = await supabase
    .from("reservations")
    .insert({ ...input, user_id: user.id })
    .select()
    .single();

  if (error) throw new Error(error.message);
  return data as Reservation;
}

export async function update(
  id: string,
  input: ReservationUpdate,
): Promise<Reservation> {
  const supabase = await createServerClient();
  const { data, error } = await supabase
    .from("reservations")
    .update(input)
    .eq("id", id)
    .select()
    .single();

  if (error) throw new Error(error.message);
  return data as Reservation;
}

export async function remove(id: string): Promise<void> {
  const supabase = await createServerClient();
  const { error } = await supabase.from("reservations").delete().eq("id", id);

  if (error) throw new Error(error.message);
}

export async function findByBookNumber(
  bookNumber: string,
): Promise<Reservation | null> {
  const supabase = await createServerClient();
  const { data, error } = await supabase
    .from("reservations")
    .select("*")
    .eq("book_number", bookNumber)
    .single();

  if (error && error.code !== "PGRST116") throw new Error(error.message);
  return (data as Reservation) ?? null;
}

export async function updateStatusByBookNumber(
  bookNumber: string,
  status: string,
): Promise<void> {
  const supabase = await createServerClient();
  const { error } = await supabase
    .from("reservations")
    .update({ reservation_status: status })
    .eq("book_number", bookNumber);

  if (error) throw new Error(error.message);
}

export async function findOverlapping(
  propertyId: string,
  checkIn: string,
  checkOut: string,
  excludeId?: string,
): Promise<Reservation[]> {
  const supabase = await createServerClient();
  let query = supabase
    .from("reservations")
    .select("*")
    .eq("property_id", propertyId)
    .lt("check_in", checkOut)
    .gt("check_out", checkIn)
    .not("status", "eq", "cancelled");

  if (excludeId) {
    query = query.not("id", "eq", excludeId);
  }

  const { data, error } = await query;
  if (error) throw new Error(error.message);
  return (data ?? []) as Reservation[];
}

// ---------------------------------------------------------------------------
// Properties (read-only, for dropdowns)
// ---------------------------------------------------------------------------

export async function findAllProperties(): Promise<PropertyOption[]> {
  const supabase = await createServerClient();
  const { data, error } = await supabase
    .from("properties")
    .select("id, name")
    .order("name");

  if (error) throw new Error(error.message);
  return (data ?? []) as PropertyOption[];
}
