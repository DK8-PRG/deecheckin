-- =============================================================================
-- DeeCheckIn — Supabase Auth + Multi-tenant RLS Migration
-- =============================================================================
-- Run this AFTER enabling Supabase Auth in your project dashboard.
-- This migration:
--   1. Adds user_id (FK → auth.users) to properties, reservations, guests
--   2. Enables RLS on all three tables
--   3. Creates strict RLS policies so each user sees ONLY their own data
-- =============================================================================

-- ---------------------------------------------------------------------------
-- 1. ADD user_id COLUMN TO EACH TABLE
-- ---------------------------------------------------------------------------

-- properties
ALTER TABLE properties
  ADD COLUMN IF NOT EXISTS user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE;

-- reservations
ALTER TABLE reservations
  ADD COLUMN IF NOT EXISTS user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE;

-- guests
ALTER TABLE guests
  ADD COLUMN IF NOT EXISTS user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE;

-- ---------------------------------------------------------------------------
-- 2. BACKFILL existing rows (optional — set to a specific user if needed)
--    Uncomment and replace '<YOUR-USER-UUID>' with the owner's auth.users.id
-- ---------------------------------------------------------------------------
-- UPDATE properties    SET user_id = '<YOUR-USER-UUID>' WHERE user_id IS NULL;
-- UPDATE reservations  SET user_id = '<YOUR-USER-UUID>' WHERE user_id IS NULL;
-- UPDATE guests        SET user_id = '<YOUR-USER-UUID>' WHERE user_id IS NULL;

-- ---------------------------------------------------------------------------
-- 3. MAKE user_id NOT NULL (run AFTER backfill)
--    Uncomment once all existing rows have a valid user_id.
-- ---------------------------------------------------------------------------
-- ALTER TABLE properties    ALTER COLUMN user_id SET NOT NULL;
-- ALTER TABLE reservations  ALTER COLUMN user_id SET NOT NULL;
-- ALTER TABLE guests        ALTER COLUMN user_id SET NOT NULL;

-- ---------------------------------------------------------------------------
-- 4. INDEXES for performance (RLS filter on user_id is used on every query)
-- ---------------------------------------------------------------------------

CREATE INDEX IF NOT EXISTS idx_properties_user_id   ON properties(user_id);
CREATE INDEX IF NOT EXISTS idx_reservations_user_id ON reservations(user_id);
CREATE INDEX IF NOT EXISTS idx_guests_user_id       ON guests(user_id);

-- ---------------------------------------------------------------------------
-- 5. ENABLE RLS
-- ---------------------------------------------------------------------------

ALTER TABLE properties   ENABLE ROW LEVEL SECURITY;
ALTER TABLE reservations ENABLE ROW LEVEL SECURITY;
ALTER TABLE guests       ENABLE ROW LEVEL SECURITY;

-- ---------------------------------------------------------------------------
-- 6. DROP old policies if re-running
-- ---------------------------------------------------------------------------

DROP POLICY IF EXISTS "Users can view own properties"    ON properties;
DROP POLICY IF EXISTS "Users can insert own properties"   ON properties;
DROP POLICY IF EXISTS "Users can update own properties"   ON properties;
DROP POLICY IF EXISTS "Users can delete own properties"   ON properties;

DROP POLICY IF EXISTS "Users can view own reservations"   ON reservations;
DROP POLICY IF EXISTS "Users can insert own reservations"  ON reservations;
DROP POLICY IF EXISTS "Users can update own reservations"  ON reservations;
DROP POLICY IF EXISTS "Users can delete own reservations"  ON reservations;

DROP POLICY IF EXISTS "Users can view own guests"         ON guests;
DROP POLICY IF EXISTS "Users can insert own guests"        ON guests;
DROP POLICY IF EXISTS "Users can update own guests"        ON guests;
DROP POLICY IF EXISTS "Users can delete own guests"        ON guests;

-- ---------------------------------------------------------------------------
-- 7. RLS POLICIES — properties
-- ---------------------------------------------------------------------------

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

-- ---------------------------------------------------------------------------
-- 8. RLS POLICIES — reservations
-- ---------------------------------------------------------------------------

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

-- ---------------------------------------------------------------------------
-- 9. RLS POLICIES — guests
-- ---------------------------------------------------------------------------

CREATE POLICY "Users can view own guests"
  ON guests FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own guests"
  ON guests FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own guests"
  ON guests FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own guests"
  ON guests FOR DELETE
  USING (auth.uid() = user_id);

-- ---------------------------------------------------------------------------
-- 10. EXAMPLE QUERIES (these automatically respect RLS)
-- ---------------------------------------------------------------------------

-- List all properties for the currently authenticated user:
--   SELECT * FROM properties;
--   → RLS silently adds WHERE user_id = auth.uid()

-- Insert a new property (user_id MUST match auth.uid()):
--   INSERT INTO properties (name, address, user_id)
--   VALUES ('Apartment Praha 1', 'Staroměstské náměstí 1', auth.uid());

-- List reservations with property name:
--   SELECT r.*, p.name AS property_name
--   FROM reservations r
--   JOIN properties p ON p.id = r.property_id
--   WHERE r.status = 'pending';
--   → Both tables filtered by auth.uid() automatically

-- Insert a guest (user_id must match):
--   INSERT INTO guests (reservation_id, first_name, last_name, birth_date,
--                       nationality, document_type, document_number,
--                       address_street, address_city, address_zip,
--                       address_country, stay_purpose, consent, user_id)
--   VALUES ('...', 'Jan', 'Novák', '1990-06-15', 'CZ', 'OP', 'AB123456',
--           'Vodičkova 1', 'Praha', '11000', 'CZ', 'rekreace', true, auth.uid());

-- Cross-table: Get guest count per reservation for the user:
--   SELECT r.id, r.guest_names, COUNT(g.id) AS guest_count
--   FROM reservations r
--   LEFT JOIN guests g ON g.reservation_id = r.id
--   GROUP BY r.id, r.guest_names;
