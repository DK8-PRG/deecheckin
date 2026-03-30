-- Add missing columns to reservations table
ALTER TABLE reservations ADD COLUMN IF NOT EXISTS book_number serial;
ALTER TABLE reservations ADD COLUMN IF NOT EXISTS reservation_status text;
ALTER TABLE reservations ADD COLUMN IF NOT EXISTS guest_names text;
ALTER TABLE reservations ADD COLUMN IF NOT EXISTS booked_by text;
ALTER TABLE reservations ADD COLUMN IF NOT EXISTS booked_on date;
ALTER TABLE reservations ADD COLUMN IF NOT EXISTS num_guests integer DEFAULT 1;

-- Create indexes for the new columns
CREATE INDEX IF NOT EXISTS idx_reservations_book_number ON reservations(book_number);

-- Re-create the guest checkin RLS policy that failed
DROP POLICY IF EXISTS "Allow public check-in status update" ON reservations;
CREATE POLICY "Allow public check-in status update"
  ON reservations FOR UPDATE
  USING (true)
  WITH CHECK (reservation_status = 'CHECKED_IN');
