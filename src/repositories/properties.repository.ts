import { createServerClient, getUser } from "@/lib/supabase/server";
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
