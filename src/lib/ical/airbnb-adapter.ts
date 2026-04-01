import type { ICalEvent, NormalizedReservation } from "./types";

// ---------------------------------------------------------------------------
// Airbnb iCal adapter
//
// Airbnb iCal SUMMARY format: "Guest Name (HMXXXXXX)"
// or "Reserved" / "Not available" for blocked dates.
// DESCRIPTION is typically minimal.
// ---------------------------------------------------------------------------

/**
 * Convert an Airbnb iCal event to a NormalizedReservation.
 * Returns null if the event is not a real reservation (blocked dates).
 */
export function airbnbEventToReservation(
  event: ICalEvent,
): NormalizedReservation | null {
  // Skip non-reservation events
  const summary = event.summary?.trim() ?? "";
  if (
    !summary ||
    summary.toLowerCase() === "reserved" ||
    summary.toLowerCase() === "not available" ||
    summary.toLowerCase() === "airbnb (not available)"
  ) {
    return null;
  }

  // Parse "Guest Name (HMXXXXXX)" pattern
  const { guestName, reference } = parseAirbnbSummary(summary);
  if (!guestName) return null;

  return {
    ical_uid: event.uid,
    guest_names: guestName,
    check_in: event.dtstart,
    check_out: event.dtend,
    source: "airbnb",
    external_reference: reference,
    adults: null,
    phone_number: "",
    status: "confirmed",
  };
}

/**
 * Parse Airbnb SUMMARY to extract guest name and confirmation code.
 * Format: "John Smith (HMXXXXXX)" or just "John Smith"
 */
function parseAirbnbSummary(summary: string): {
  guestName: string;
  reference: string;
} {
  // Try pattern: "Name (HMXXXXXX)"
  const match = summary.match(/^(.+?)\s*\(([A-Z0-9]+)\)$/);
  if (match) {
    return {
      guestName: match[1].trim(),
      reference: match[2],
    };
  }

  // No confirmation code — just use the whole summary as guest name
  return {
    guestName: summary,
    reference: "",
  };
}
