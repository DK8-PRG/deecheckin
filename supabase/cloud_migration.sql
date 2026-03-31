-- =============================================================================
-- DeeCheckIn — Kompletní cloud migrace pro projekt deecheckin2
-- Spustit v Supabase Dashboard → SQL Editor
-- =============================================================================

-- 1. SMAZÁNÍ STARÝCH TABULEK (pokud existují)
DROP TABLE IF EXISTS guests CASCADE;
DROP TABLE IF EXISTS reservations CASCADE;
DROP TABLE IF EXISTS properties CASCADE;

-- =============================================================================
-- 2. VYTVOŘENÍ TABULEK
-- =============================================================================

CREATE TABLE properties (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  address text,
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at timestamp with time zone DEFAULT now()
);

CREATE TABLE reservations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  property_id uuid REFERENCES properties(id) ON DELETE CASCADE,
  book_number serial,
  booked_by text,
  guest_names text,
  check_in date,
  check_out date,
  booked_on date,
  status text DEFAULT 'pending',
  reservation_status text,
  rooms integer,
  people integer,
  num_guests integer DEFAULT 1,
  adults integer,
  children integer,
  children_ages text,
  price text,
  commission_percent numeric,
  commission_amount text,
  payment_status text,
  payment_method text,
  payment_type text,
  remarks text,
  special_requests text,
  booker_group text,
  booker_country text,
  travel_purpose text,
  device text,
  duration_nights integer,
  cancellation_date text,
  address text,
  phone_number text,
  guest_id integer,
  source text,
  early_checkin boolean,
  late_checkout boolean,
  early_checkin_time text,
  late_checkout_time text,
  pet boolean,
  pin_code text,
  last_status_update text,
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at timestamp with time zone DEFAULT now()
);

CREATE TABLE guests (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  reservation_id uuid REFERENCES reservations(id) ON DELETE CASCADE,
  guest_index integer NOT NULL DEFAULT 0,
  first_name text NOT NULL,
  last_name text NOT NULL,
  birth_date date NOT NULL,
  nationality text NOT NULL,
  document_type text NOT NULL,
  document_number text NOT NULL,
  address_street text NOT NULL,
  address_city text NOT NULL,
  address_zip text NOT NULL,
  address_country text NOT NULL,
  stay_purpose text NOT NULL,
  phone text,
  email text,
  consent boolean NOT NULL,
  document_photo_url text,
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at timestamp with time zone DEFAULT now()
);

-- =============================================================================
-- 3. INDEXY
-- =============================================================================

CREATE INDEX idx_properties_user_id ON properties(user_id);
CREATE INDEX idx_reservations_user_id ON reservations(user_id);
CREATE INDEX idx_reservations_book_number ON reservations(book_number);
CREATE INDEX idx_reservations_property_id ON reservations(property_id);
CREATE INDEX idx_guests_user_id ON guests(user_id);
CREATE INDEX idx_guests_reservation_id ON guests(reservation_id);

-- =============================================================================
-- 4. ROW LEVEL SECURITY
-- =============================================================================

ALTER TABLE properties ENABLE ROW LEVEL SECURITY;
ALTER TABLE reservations ENABLE ROW LEVEL SECURITY;
ALTER TABLE guests ENABLE ROW LEVEL SECURITY;

-- Properties RLS
CREATE POLICY "Users can view own properties"
  ON properties FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own properties"
  ON properties FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own properties"
  ON properties FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own properties"
  ON properties FOR DELETE
  USING (auth.uid() = user_id);

-- Reservations RLS
CREATE POLICY "Users can view own reservations"
  ON reservations FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own reservations"
  ON reservations FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own reservations"
  ON reservations FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own reservations"
  ON reservations FOR DELETE
  USING (auth.uid() = user_id);

-- Guests RLS — authenticated users can CRUD own, public can insert (check-in)
CREATE POLICY "Users can view own guests"
  ON guests FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own guests"
  ON guests FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Allow public guest check-in inserts"
  ON guests FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Users can update own guests"
  ON guests FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own guests"
  ON guests FOR DELETE
  USING (auth.uid() = user_id);

-- Allow anonymous check-in status update
CREATE POLICY "Allow public check-in status update"
  ON reservations FOR UPDATE
  USING (true)
  WITH CHECK (reservation_status = 'CHECKED_IN');

-- =============================================================================
-- HOTOVO! Tabulky properties, reservations, guests jsou vytvořeny s RLS.
-- =============================================================================
