// ---------------------------------------------------------------------------
// Shared constants used across services and pages
// ---------------------------------------------------------------------------

/** Reservation statuses eligible for online check-in. */
export const ELIGIBLE_CHECKIN_STATUSES = new Set([
  "CONFIRMED",
  "PENDING",
  "pending_checkin",
  "confirmed",
  "pending",
]);

/** Maximum number of guests per check-in. */
export const MAX_GUESTS = 10;

/** Minimum password length (OWASP recommendation). */
export const MIN_PASSWORD_LENGTH = 8;
