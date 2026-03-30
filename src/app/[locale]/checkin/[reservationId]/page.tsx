import { getTranslations } from "next-intl/server";
import * as reservationsRepo from "@/repositories/reservations.repository";
import { CheckinWizard } from "@/components/checkin/CheckinWizard";

// ---------------------------------------------------------------------------
// SERVER COMPONENT — fetches reservation on the server by book_number
// ---------------------------------------------------------------------------

const ELIGIBLE_STATUSES = new Set([
  "CONFIRMED",
  "PENDING",
  "pending_checkin",
  "confirmed",
  "pending",
]);

interface CheckinFormPageProps {
  params: Promise<{ reservationId: string }>;
}

export default async function CheckinFormPage({
  params,
}: CheckinFormPageProps) {
  const { reservationId } = await params;
  const t = await getTranslations("CheckinForm");

  const reservation = await reservationsRepo.findByBookNumber(reservationId);

  if (!reservation) {
    return (
      <div className="max-w-md mx-auto mt-16 p-6 rounded-lg border border-destructive/30 bg-destructive/5 text-center">
        <p className="text-destructive font-medium">
          {t("error.reservationNotFound")}
        </p>
      </div>
    );
  }

  const status = reservation.reservation_status ?? reservation.status;

  if (status === "CHECKED_IN") {
    return (
      <div className="max-w-md mx-auto mt-16 p-6 rounded-lg border border-destructive/30 bg-destructive/5 text-center">
        <p className="text-destructive font-medium">
          {t("error.alreadyCheckedIn")}
        </p>
      </div>
    );
  }

  if (status === "CANCELLED" || status?.startsWith("cancelled")) {
    return (
      <div className="max-w-md mx-auto mt-16 p-6 rounded-lg border border-destructive/30 bg-destructive/5 text-center">
        <p className="text-destructive font-medium">
          {t("error.reservationCancelled")}
        </p>
      </div>
    );
  }

  if (!ELIGIBLE_STATUSES.has(status ?? "")) {
    return (
      <div className="max-w-md mx-auto mt-16 p-6 rounded-lg border border-destructive/30 bg-destructive/5 text-center">
        <p className="text-destructive font-medium">
          {t("error.reservationNotEligible")}
        </p>
      </div>
    );
  }

  return (
    <CheckinWizard
      reservation={{
        book_number: reservation.book_number,
        guest_names: reservation.guest_names,
        check_in: reservation.check_in,
        check_out: reservation.check_out,
        rooms: reservation.rooms,
        people: reservation.people,
        adults: reservation.adults,
        reservation_status: reservation.reservation_status ?? null,
        status: reservation.status,
      }}
    />
  );
}
