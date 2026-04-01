import {
  createServerClient,
  createAdminClient,
  getUser,
} from "@/lib/supabase/server";
import type {
  Property,
  PropertyInsert,
  PropertyUpdate,
} from "@/types/property";

// ---------------------------------------------------------------------------
// Properties repository — SOLE place that talks to Supabase for properties
// ---------------------------------------------------------------------------

export async function findAll(): Promise<Property[]> {
  const supabase = await createServerClient();
  const { data, error } = await supabase
    .from("properties")
    .select("*")
    .order("name");

  if (error) throw new Error(error.message);
  return (data ?? []) as Property[];
}

export async function findById(id: string): Promise<Property | null> {
  const supabase = await createServerClient();
  const { data, error } = await supabase
    .from("properties")
    .select("*")
    .eq("id", id)
    .single();

  if (error && error.code !== "PGRST116") throw new Error(error.message);
  return (data as Property) ?? null;
}

/**
 * Public variant — bypasses RLS for guest-facing flows (e.g. post-checkin instructions).
 */
export async function findByIdPublic(id: string): Promise<Property | null> {
  const supabase = createAdminClient();
  const { data, error } = await supabase
    .from("properties")
    .select("*")
    .eq("id", id)
    .single();

  if (error && error.code !== "PGRST116") throw new Error(error.message);
  return (data as Property) ?? null;
}

export async function create(input: PropertyInsert): Promise<Property> {
  const supabase = await createServerClient();
  const user = await getUser();
  if (!user) throw new Error("Nepřihlášen");

  const { data, error } = await supabase
    .from("properties")
    .insert({ ...input, user_id: user.id })
    .select()
    .single();

  if (error) throw new Error(error.message);
  return data as Property;
}

export async function update(
  id: string,
  input: PropertyUpdate,
): Promise<Property> {
  const supabase = await createServerClient();
  const { data, error } = await supabase
    .from("properties")
    .update(input)
    .eq("id", id)
    .select()
    .single();

  if (error) throw new Error(error.message);
  return data as Property;
}

export async function remove(id: string): Promise<void> {
  const supabase = await createServerClient();
  const { error } = await supabase.from("properties").delete().eq("id", id);

  if (error) throw new Error(error.message);
}

/**
 * List all public properties (for main landing page).
 * Uses admin client to bypass RLS since this is a public page.
 */
export async function findPublicProperties(): Promise<Property[]> {
  const supabase = createAdminClient();
  const { data, error } = await supabase
    .from("properties")
    .select("*")
    .eq("public_page_enabled", true)
    .order("name");

  if (error) throw new Error(error.message);
  return (data ?? []) as Property[];
}

/**
 * Find a property by its public slug. Uses admin client to bypass RLS
 * only returning properties with public_page_enabled = true.
 */
export async function findBySlug(slug: string): Promise<Property | null> {
  const supabase = createAdminClient();
  const { data, error } = await supabase
    .from("properties")
    .select("*")
    .eq("slug", slug)
    .eq("public_page_enabled", true)
    .single();

  if (error && error.code !== "PGRST116") throw new Error(error.message);
  return (data as Property) ?? null;
}

/**
 * Get occupied date ranges for a property (for availability calendar).
 * Returns only check_in/check_out — no personal data.
 */
export async function findOccupiedDates(
  propertyId: string,
  from: string,
  to: string,
): Promise<{ check_in: string; check_out: string }[]> {
  // Use admin client — this is called from public pages but only exposes dates
  const supabase = createAdminClient();
  const { data, error } = await supabase
    .from("reservations")
    .select("check_in, check_out")
    .eq("property_id", propertyId)
    .not("status", "eq", "cancelled")
    .lt("check_in", to)
    .gt("check_out", from);

  if (error) throw new Error(error.message);
  return (data ?? []) as { check_in: string; check_out: string }[];
}
