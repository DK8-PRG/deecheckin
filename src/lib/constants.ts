// ---------------------------------------------------------------------------
// Shared constants used across services and pages
// ---------------------------------------------------------------------------

/** Reservation statuses eligible for online check-in. */
export const ELIGIBLE_CHECKIN_STATUSES = new Set([
  "pending",
  "confirmed",
  "pending_checkin",
]);

/** All valid reservation status values. */
export const RESERVATION_STATUSES = [
  "pending",
  "confirmed",
  "checked_in",
  "checked_out",
  "cancelled",
  "cancelled_by_guest",
  "cancelled_by_hotel",
] as const;

/** Maximum number of guests per check-in. */
export const MAX_GUESTS = 10;

/** Minimum password length (OWASP recommendation). */
export const MIN_PASSWORD_LENGTH = 8;
