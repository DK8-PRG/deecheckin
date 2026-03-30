import type { Guest, GuestInsert } from "@/types/guest";
import type { CheckinSubmissionData } from "@/validators/guest.schema";
import * as guestsRepo from "@/repositories/guests.repository";
import * as reservationsRepo from "@/repositories/reservations.repository";

// ---------------------------------------------------------------------------
// Guest / Check-in service — business logic
// ---------------------------------------------------------------------------

const ELIGIBLE_STATUSES = new Set([
  "CONFIRMED",
  "PENDING",
  "pending_checkin",
  "confirmed",
  "pending",
]);

export async function performCheckin(
  input: CheckinSubmissionData,
): Promise<Guest[]> {
  // 1. Find reservation by book_number
  const reservation = await reservationsRepo.findByBookNumber(
    input.book_number,
  );
  if (!reservation) {
    throw new Error("Rezervace nebyla nalezena");
  }

  // 2. Check reservation status eligibility
  const status = reservation.reservation_status ?? reservation.status;
  if (!ELIGIBLE_STATUSES.has(status ?? "")) {
    if (status === "CHECKED_IN") {
      throw new Error("Check-in pro tuto rezervaci již byl proveden");
    }
    if (status === "CANCELLED" || status?.startsWith("cancelled")) {
      throw new Error("Tato rezervace byla zrušena");
    }
    throw new Error("Tato rezervace není způsobilá pro online check-in");
  }

  // 3. Check no guests already exist for this reservation
  const existingGuests = await guestsRepo.findByReservationId(reservation.id);
  if (existingGuests.length > 0) {
    throw new Error("Pro tuto rezervaci již existují záznamy hostů");
  }

  // 4. Prepare guest inserts
  const guestInserts: GuestInsert[] = input.guests.map((g) => ({
    reservation_id: reservation.id,
    guest_index: g.guest_index,
    first_name: g.first_name,
    last_name: g.last_name,
    birth_date: g.birth_date,
    nationality: g.nationality,
    document_type: g.document_type,
    document_number: g.document_number,
    address_street: g.address_street,
    address_city: g.address_city,
    address_zip: g.address_zip,
    address_country: g.address_country,
    stay_purpose: g.stay_purpose,
    phone: g.phone || undefined,
    email: g.email || undefined,
    consent: input.consent,
  }));

  // 5. Insert all guests
  const createdGuests = await guestsRepo.createMany(guestInserts);

  // 6. Update reservation status to CHECKED_IN
  await reservationsRepo.updateStatusByBookNumber(
    input.book_number,
    "CHECKED_IN",
  );

  return createdGuests;
}

export async function getGuestsByReservation(
  reservationId: string,
): Promise<Guest[]> {
  return guestsRepo.findByReservationId(reservationId);
}
