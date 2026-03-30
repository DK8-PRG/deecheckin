-- Migration: Add guest_index column and update guests table for multi-guest check-in
-- Run this AFTER the base schema (supabase_schema.sql)

-- Add guest_index to track primary (0) vs additional guests (1, 2, ...)
ALTER TABLE guests ADD COLUMN IF NOT EXISTS guest_index integer NOT NULL DEFAULT 0;

-- Create index for faster lookups by reservation
CREATE INDEX IF NOT EXISTS idx_guests_reservation_id ON guests(reservation_id);

-- Create index for reservation lookup by book_number (used in public check-in)
CREATE INDEX IF NOT EXISTS idx_reservations_book_number ON reservations(book_number);

-- RLS policy: Allow anonymous inserts into guests table (public check-in flow)
-- The server action validates reservation eligibility before inserting.
ALTER TABLE guests ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow public guest check-in inserts"
  ON guests FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Allow authenticated users to read guests"
  ON guests FOR SELECT
  USING (auth.role() = 'authenticated');

-- RLS policy: Allow anonymous to update reservation status during check-in
-- Restricted to only setting reservation_status = 'CHECKED_IN'
CREATE POLICY "Allow public check-in status update"
  ON reservations FOR UPDATE
  USING (true)
  WITH CHECK (reservation_status = 'CHECKED_IN');
