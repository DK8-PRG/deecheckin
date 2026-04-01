import { getTranslations } from "next-intl/server";
import * as reservationsRepo from "@/repositories/reservations.repository";
import { CheckinWizard } from "@/components/checkin/CheckinWizard";
import { ELIGIBLE_CHECKIN_STATUSES } from "@/lib/constants";
import { ShieldCheck, AlertCircle, CheckCircle2, XCircle } from "lucide-react";

interface CheckinFormPageProps {
  params: Promise<{ reservationId: string }>;
}

function ErrorLayout({
  icon,
  title,
  message,
}: Readonly<{
  icon: React.ReactNode;
  title: string;
  message: string;
}>) {
  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white">
      <header className="border-b bg-white/80 backdrop-blur-sm">
        <div className="max-w-lg mx-auto px-4 py-4 flex items-center justify-center gap-2">
          <ShieldCheck className="h-5 w-5 text-primary" />
          <span className="text-base font-semibold text-foreground tracking-tight">
            DeeCheckIn
          </span>
        </div>
      </header>
      <div className="max-w-md mx-auto mt-16 px-4">
        <div className="rounded-2xl border bg-white shadow-sm p-8 text-center space-y-4">
          <div className="flex justify-center">{icon}</div>
          <h2 className="text-lg font-semibold text-foreground">{title}</h2>
          <p className="text-sm text-muted-foreground">{message}</p>
        </div>
      </div>
    </div>
  );
}

export default async function CheckinFormPage({
  params,
}: Readonly<CheckinFormPageProps>) {
  const { reservationId } = await params;
  const t = await getTranslations("CheckinForm");

  const reservation = await reservationsRepo.findByBookNumber(reservationId);

  if (!reservation) {
    return (
      <ErrorLayout
        icon={<AlertCircle className="w-12 h-12 text-muted-foreground" />}
        title={t("error.reservationNotFound")}
        message={t("error.unknownError")}
      />
    );
  }

  const status = reservation.status;

  if (status === "CHECKED_IN") {
    return (
      <ErrorLayout
        icon={<CheckCircle2 className="w-12 h-12 text-green-500" />}
        title={t("error.alreadyCheckedIn")}
        message={t("success.message", {
          reservationId: reservation.book_number ?? "",
        })}
      />
    );
  }

  if (status === "CANCELLED" || status?.startsWith("cancelled")) {
    return (
      <ErrorLayout
        icon={<XCircle className="w-12 h-12 text-destructive" />}
        title={t("error.reservationCancelled")}
        message={t("error.unknownError")}
      />
    );
  }

  if (!ELIGIBLE_CHECKIN_STATUSES.has(status ?? "")) {
    return (
      <ErrorLayout
        icon={<AlertCircle className="w-12 h-12 text-amber-500" />}
        title={t("error.reservationNotEligible")}
        message={t("error.unknownError")}
      />
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
        status: reservation.status,
      }}
    />
  );
}
