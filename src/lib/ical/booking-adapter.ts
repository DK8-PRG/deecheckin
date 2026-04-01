import type { ICalEvent, NormalizedReservation } from "./types";

// ---------------------------------------------------------------------------
// Booking.com iCal adapter
//
// Real-world Booking.com iCal format:
//   SUMMARY: "CLOSED - Not available"   (most common — blocked dates = real reservations without guest name)
//   SUMMARY: "CLOSED - Guest Name"      (sometimes includes the guest name)
//   DESCRIPTION may contain: "Phone: ...", "Number of guests: ..."
// ---------------------------------------------------------------------------

/**
 * Convert a Booking.com iCal event to a NormalizedReservation.
 * Imports both named ("CLOSED - Name") and unnamed ("CLOSED - Not available") events.
 * Returns null only for events without the "CLOSED -" prefix.
 */
export function bookingEventToReservation(
  event: ICalEvent,
): NormalizedReservation | null {
  if (!event.summary || !event.summary.startsWith("CLOSED - ")) {
    return null;
  }

  const rawName = event.summary.replace("CLOSED - ", "").trim();

  // "Not available" means Booking blocked the dates (real reservation, but no guest name shared)
  const isAnonymous = !rawName || rawName.toLowerCase() === "not available";

  const guestName = isAnonymous ? "" : rawName;

  // Extract data from DESCRIPTION
  const phone = extractField(event.description, "Phone") ?? "";
  const guestsStr = extractField(event.description, "Number of guests");
  const adults = guestsStr ? parseInt(guestsStr, 10) || null : null;

  // Extract Booking reference from UID
  const externalRef = extractBookingReference(event.uid);

  return {
    ical_uid: event.uid,
    guest_names: guestName,
    check_in: event.dtstart,
    check_out: event.dtend,
    source: "booking",
    external_reference: externalRef,
    adults,
    phone_number: phone,
    status: "confirmed",
  };
}

/** Extract a field from Booking.com DESCRIPTION text. */
function extractField(description: string, fieldName: string): string | null {
  if (!description) return null;
  const pattern = new RegExp(`${fieldName}:\\s*(.+)`, "i");
  const match = description.match(pattern);
  return match?.[1]?.trim() ?? null;
}

/** Extract Booking.com reservation reference from UID. */
function extractBookingReference(uid: string): string {
  // UID patterns observed in the wild:
  // "booking-1234567890@booking.com" → "1234567890"
  // "38ca8d23262ccd5d006855e45b6a4b32@booking.com" → hash (use as-is, strip @domain)
  const match = uid.match(/booking[-_]?(\d+)/i);
  if (match) return match[1];

  // Strip @booking.com domain, keep the hash or ID part
  return uid.replace(/@.*$/, "");
}
