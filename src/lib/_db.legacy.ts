import { supabase } from "./supabaseClient";

// ---------------------------------------------------------------------------
// Helper: get current authenticated user's ID
// ---------------------------------------------------------------------------
async function requireAuthUserId(): Promise<string> {
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error("Nepřihlášen");
  return user.id;
}

// --- PROPERTIES ---
export async function getProperties() {
  const { data, error } = await supabase.from("properties").select("*");
  if (error) throw error;
  return data;
}
export async function createProperty(data: { name: string; address?: string }) {
  const userId = await requireAuthUserId();
  const { error } = await supabase
    .from("properties")
    .insert([{ ...data, user_id: userId }]);
  if (error) throw error;
}

export async function updateProperty(
  id: string,
  data: { name?: string; address?: string },
) {
  const { error } = await supabase.from("properties").update(data).eq("id", id);
  if (error) throw error;
}

export async function deleteProperty(id: string) {
  const { error } = await supabase.from("properties").delete().eq("id", id);
  if (error) throw error;
}

// --- RESERVATIONS ---
export async function getReservations() {
  const { data, error } = await supabase.from("reservations").select("*");
  if (error) throw error;
  return data;
}
export interface ReservationData {
  property_id: string;
  guest_id: string;
  check_in: string;
  check_out: string;
  book_number?: string;
  booked_by?: string;
  guest_names?: string;
  booked_on?: string;
  status?: string;
  rooms?: number;
  people?: number;
  adults?: number;
  children?: number;
  children_ages?: string;
  price?: string;
  commission_percent?: number;
  commission_amount?: string;
  payment_status?: string;
  payment_method?: string;
  remarks?: string;
  booker_group?: string;
  booker_country?: string;
  travel_purpose?: string;
  device?: string;
  phone_number?: string;
}

export async function createReservation(data: ReservationData) {
  const userId = await requireAuthUserId();
  const { error } = await supabase
    .from("reservations")
    .insert([{ ...data, user_id: userId }]);
  if (error) throw error;
}
export async function updateReservation(
  id: string,
  data: Partial<ReservationData>,
) {
  const { error } = await supabase
    .from("reservations")
    .update(data)
    .eq("id", id);
  if (error) throw error;
}

// Nová funkce pro aktualizaci rezervace podle book_number
export async function updateReservationByBookNumber(
  bookNumber: string,
  updates: { reservation_status?: string; guest_id?: number },
) {
  console.log("Updating reservation:", bookNumber, "with:", updates);
  try {
    const { data, error } = await supabase
      .from("reservations")
      .update(updates)
      .eq("book_number", bookNumber)
      .select();

    if (error) {
      console.error("Error updating reservation:", error);
      throw error;
    }

    console.log("Reservation updated successfully:", data);
    return data;
  } catch (err) {
    console.error("Error in updateReservationByBookNumber:", err);
    throw err;
  }
}

// --- GUESTS ---
export interface GuestData {
  reservation_id: string; // vazba na rezervaci
  full_name: string; // Změněno z first_name a last_name na full_name
  birth_date: string; // ISO string (např. 1990-01-01)
  nationality: string; // Změněno z citizenship na nationality
  document_type: "OP" | "PAS" | "JINÉ";
  document_number: string;
  address_street: string;
  address_city: string;
  address_zip: string; // Změněno z address_postal_code na address_zip
  address_country: string;
  stay_purpose: "rekreace" | "služební" | "jiné";
  // Volitelná pole
  phone?: string;
  email?: string;
  consent?: boolean; // souhlas se zpracováním údajů
  document_photo_url?: string; // URL na uploadovanou fotku dokladu
  // Dodatečná pole z databáze
  company_name?: string;
  company_vat?: string;
  company_address?: string;
  wants_invoice?: boolean;
}

export async function createGuest(data: GuestData) {
  console.log("Creating guest with data:", data);

  // Check if Supabase is properly configured
  if (
    !process.env.NEXT_PUBLIC_SUPABASE_URL ||
    !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  ) {
    throw new Error(
      "Supabase is not configured. Please set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY environment variables.",
    );
  }

  try {
    const userId = await requireAuthUserId();
    const { data: result, error } = await supabase
      .from("guests")
      .insert([{ ...data, user_id: userId }])
      .select();
    if (error) {
      console.error("Supabase error:", error);
      throw error;
    }
    console.log("Guest created successfully:", result);
    return result?.[0]; // Vrátit první vytvořený záznam
  } catch (err) {
    console.error("Error in createGuest:", err);
    throw err;
  }
}

export async function getGuestsByReservation(reservationId: string) {
  const { data, error } = await supabase
    .from("guests")
    .select("*")
    .eq("reservation_id", reservationId);
  if (error) throw error;
  return data;
}

// Nová funkce pro získání hosta podle book_number rezervace
export async function getGuestByReservationBookNumber(bookNumber: string) {
  console.log("Getting guest for reservation:", bookNumber);
  try {
    // Nejdřív najdu rezervaci podle book_number
    const { data: reservationData, error: reservationError } = await supabase
      .from("reservations")
      .select("id")
      .eq("book_number", bookNumber)
      .single();

    if (reservationError) {
      console.error("Error finding reservation:", reservationError);
      return null;
    }

    if (!reservationData) {
      console.log("Reservation not found for book_number:", bookNumber);
      return null;
    }

    // Pak najdu hosta podle reservation_id (UUID)
    const { data, error } = await supabase
      .from("guests")
      .select("*")
      .eq("reservation_id", reservationData.id)
      .single();

    if (error && error.code !== "PGRST116") {
      // PGRST116 = no rows returned
      console.error("Error getting guest:", error);
      throw error;
    }

    console.log("Guest found:", data);
    return data;
  } catch (err) {
    console.error("Error in getGuestByReservationBookNumber:", err);
    return null; // Vrátit null pokud host nebyl nalezen
  }
}

// --- CHECKOUT ---
export async function checkoutReservationByBookNumber(bookNumber: string) {
  const { data, error } = await supabase
    .from("reservations")
    .update({ reservation_status: "CHECKED_OUT" })
    .eq("book_number", bookNumber)
    .select();
  if (error) throw error;
  return data;
}
