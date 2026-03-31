import { User, Plus, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { MAX_GUESTS } from "@/lib/constants";
import type { Reservation, TranslationFn } from "./types";

export function StepReservation({
  reservation,
  guestCount,
  onAddGuest,
  onRemoveGuest,
  t,
}: Readonly<{
  reservation: Reservation;
  guestCount: number;
  onAddGuest: () => void;
  onRemoveGuest: (i: number) => void;
  t: TranslationFn;
}>) {
  return (
    <div className="space-y-6">
      {/* Reservation details card */}
      <div className="rounded-lg border border-border bg-card p-5 space-y-3">
        <h2 className="text-lg font-semibold">{t("reservationSummary")}</h2>
        <div className="grid grid-cols-2 gap-x-4 gap-y-2 text-sm">
          <span className="text-muted-foreground">{t("field.bookNumber")}</span>
          <span className="font-medium">{reservation.book_number}</span>
          <span className="text-muted-foreground">{t("field.guestName")}</span>
          <span className="font-medium">{reservation.guest_names}</span>
          <span className="text-muted-foreground">{t("field.checkIn")}</span>
          <span className="font-medium">{reservation.check_in}</span>
          <span className="text-muted-foreground">{t("field.checkOut")}</span>
          <span className="font-medium">{reservation.check_out}</span>
          <span className="text-muted-foreground">{t("field.guests")}</span>
          <span className="font-medium">{reservation.people ?? "-"}</span>
        </div>
      </div>

      {/* Guest count selector */}
      <div className="rounded-lg border border-border bg-card p-5 space-y-3">
        <h2 className="text-lg font-semibold">{t("guestCount")}</h2>
        <p className="text-sm text-muted-foreground">{t("guestCountHint")}</p>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            {Array.from({ length: guestCount }).map((_, i) => (
              <div
                key={`guest-badge-${i}`}
                className="flex items-center gap-1 rounded-full bg-primary/10 px-3 py-1 text-sm"
              >
                <User className="w-3.5 h-3.5" />
                <span>{t("guestLabel", { number: i + 1 })}</span>
                {guestCount > 1 && (
                  <button
                    type="button"
                    onClick={() => onRemoveGuest(i)}
                    className="ml-1 text-muted-foreground hover:text-destructive"
                  >
                    <Trash2 className="w-3 h-3" />
                  </button>
                )}
              </div>
            ))}
          </div>
          {guestCount < MAX_GUESTS && (
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={onAddGuest}
            >
              <Plus className="w-4 h-4 mr-1" />
              {t("addGuest")}
            </Button>
          )}
        </div>
      </div>

      {/* Legal notice */}
      <div className="rounded-lg border border-blue-200 bg-blue-50 dark:bg-blue-950/30 dark:border-blue-800 p-4 space-y-2">
        <h3 className="text-sm font-semibold text-blue-800 dark:text-blue-300">
          {t("dataCollectionNotice.title")}
        </h3>
        <p className="text-xs text-blue-700 dark:text-blue-400">
          {t("dataCollectionNotice.text")}
        </p>
        <p className="text-xs text-muted-foreground">
          {t("dataCollectionNotice.legalBasis")}
        </p>
      </div>
    </div>
  );
}
