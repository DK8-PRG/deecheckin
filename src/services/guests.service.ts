import type { Guest, GuestInsert } from "@/types/guest";
import type { Reservation } from "@/types/reservation";
import type {
  CheckinSubmissionData,
  IndependentCheckinSubmissionData,
} from "@/schemas/guest.schema";
import * as guestsRepo from "@/repositories/guests.repository";
import * as reservationsRepo from "@/repositories/reservations.repository";
import { ELIGIBLE_CHECKIN_STATUSES } from "@/lib/constants";

// ---------------------------------------------------------------------------
// Guest / Check-in service — business logic
// ---------------------------------------------------------------------------

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
  const status = reservation.status;
  if (!ELIGIBLE_CHECKIN_STATUSES.has(status ?? "")) {
    if (status === "checked_in") {
      throw new Error("Check-in pro tuto rezervaci již byl proveden");
    }
    if (status === "cancelled" || status?.startsWith("cancelled")) {
      throw new Error("Tato rezervace byla zrušena");
    }
    throw new Error("Tato rezervace není způsobilá pro online check-in");
  }

  // 3. Check no guests already exist for this reservation
  const existingGuests = await guestsRepo.findByReservationIdPublic(
    reservation.id,
  );
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
    document_type: g.document_type || "OP",
    document_number: g.document_number || "",
    issuing_country: g.issuing_country || undefined,
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
  const createdGuests = await guestsRepo.createManyPublic(guestInserts);

  // 6. Update reservation status to checked_in
  await reservationsRepo.updateStatusByBookNumber(
    input.book_number,
    "checked_in",
  );

  return createdGuests;
}

// ---------------------------------------------------------------------------
// Independent check-in (no reservation required)
// ---------------------------------------------------------------------------

export async function performIndependentCheckin(
  input: IndependentCheckinSubmissionData,
): Promise<Guest[]> {
  const checkinGroupId = crypto.randomUUID();

  const guestInserts: GuestInsert[] = input.guests.map((g) => ({
    property_id: input.property_id,
    check_in_date: input.check_in_date,
    check_out_date: input.check_out_date,
    checkin_group_id: checkinGroupId,
    guest_index: g.guest_index,
    first_name: g.first_name,
    last_name: g.last_name,
    birth_date: g.birth_date,
    nationality: g.nationality,
    document_type: g.document_type || "OP",
    document_number: g.document_number || "",
    issuing_country: g.issuing_country || undefined,
    address_street: g.address_street,
    address_city: g.address_city,
    address_zip: g.address_zip,
    address_country: g.address_country,
    stay_purpose: g.stay_purpose,
    phone: g.phone || undefined,
    email: g.email || undefined,
    consent: input.consent,
  }));

  return guestsRepo.createManyPublic(guestInserts);
}

export async function getGuestsByReservation(
  reservationId: string,
): Promise<Guest[]> {
  return guestsRepo.findByReservationId(reservationId);
}

// ---------------------------------------------------------------------------
// Admin: Unpaired guest groups
// ---------------------------------------------------------------------------

export interface CheckinGroup {
  checkin_group_id: string;
  property_id: string | null;
  check_in_date: string | null;
  check_out_date: string | null;
  created_at: string | null;
  guests: Guest[];
}

/**
 * Get all unpaired check-in groups for the current user.
 * Groups guests by checkin_group_id.
 */
export async function listUnpairedGroups(): Promise<CheckinGroup[]> {
  const guests = await guestsRepo.findAllUnpaired();

  const groupMap = new Map<string, CheckinGroup>();
  for (const guest of guests) {
    const gid = guest.checkin_group_id;
    if (!gid) continue; // skip guests without group ID

    if (!groupMap.has(gid)) {
      groupMap.set(gid, {
        checkin_group_id: gid,
        property_id: guest.property_id,
        check_in_date: guest.check_in_date,
        check_out_date: guest.check_out_date,
        created_at: guest.created_at,
        guests: [],
      });
    }
    groupMap.get(gid)!.guests.push(guest);
  }

  return Array.from(groupMap.values());
}

/**
 * Find reservation candidates that could match an unpaired guest group.
 * Matching criteria: same property, overlapping dates, not cancelled.
 */
export async function findMatchingReservations(
  propertyId: string,
  checkInDate: string,
  checkOutDate: string,
): Promise<Reservation[]> {
  return reservationsRepo.findOverlapping(
    propertyId,
    checkInDate,
    checkOutDate,
  );
}

/**
 * Pair a check-in group with a reservation.
 * Sets reservation_id and paired_at on all guests in the group.
 */
export async function pairGroupWithReservation(
  checkinGroupId: string,
  reservationId: string,
): Promise<void> {
  // Verify reservation exists
  const reservation = await reservationsRepo.findById(reservationId);
  if (!reservation) {
    throw new Error("Rezervace nebyla nalezena");
  }

  await guestsRepo.pairWithReservation(checkinGroupId, reservationId);
}
