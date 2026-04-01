import { User, Plus, Trash2, CalendarDays, Users, Info } from "lucide-react";
import { Button } from "@/components/ui/button";
import { MAX_GUESTS } from "@/lib/constants";
import type { CheckinReservation, TranslationFn } from "./types";

export function StepReservation({
  reservation,
  guestCount,
  onAddGuest,
  onRemoveGuest,
  t,
}: Readonly<{
  reservation: CheckinReservation;
  guestCount: number;
  onAddGuest: () => void;
  onRemoveGuest: (i: number) => void;
  t: TranslationFn;
}>) {
  return (
    <div className="space-y-6">
      {/* Reservation details card */}
      <div className="rounded-2xl border border-border bg-white shadow-sm overflow-hidden">
        <div className="px-5 py-4 border-b bg-slate-50/50">
          <h2 className="text-base font-semibold text-foreground">
            {t("reservationSummary")}
          </h2>
        </div>
        <div className="p-5 space-y-4">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
              <CalendarDays className="h-4 w-4 text-primary" />
            </div>
            <div className="text-sm">
              <p className="font-medium text-foreground">
                {reservation.check_in} → {reservation.check_out}
              </p>
              <p className="text-muted-foreground">
                {t("field.bookNumber")}: {reservation.book_number}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
              <Users className="h-4 w-4 text-primary" />
            </div>
            <div className="text-sm">
              <p className="font-medium text-foreground">
                {reservation.guest_names}
              </p>
              <p className="text-muted-foreground">
                {reservation.people ?? "-"} {t("field.guests")}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Guest count selector */}
      <div className="rounded-2xl border border-border bg-white shadow-sm overflow-hidden">
        <div className="px-5 py-4 border-b bg-slate-50/50">
          <h2 className="text-base font-semibold text-foreground">
            {t("guestCount")}
          </h2>
          <p className="text-sm text-muted-foreground mt-0.5">
            {t("guestCountHint")}
          </p>
        </div>
        <div className="p-5">
          <div className="flex flex-wrap items-center gap-2">
            {Array.from({ length: guestCount }).map((_, i) => (
              <div
                key={`guest-badge-${i}`}
                className="flex items-center gap-1.5 rounded-full bg-primary/5 border border-primary/10 px-3 py-1.5 text-sm transition-colors"
              >
                <User className="w-3.5 h-3.5 text-primary" />
                <span className="font-medium text-foreground">
                  {t("guestLabel", { number: i + 1 })}
                </span>
                {guestCount > 1 && (
                  <button
                    type="button"
                    onClick={() => onRemoveGuest(i)}
                    className="ml-0.5 p-0.5 rounded-full text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors"
                  >
                    <Trash2 className="w-3 h-3" />
                  </button>
                )}
              </div>
            ))}
            {guestCount < MAX_GUESTS && (
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={onAddGuest}
                className="rounded-full"
              >
                <Plus className="w-4 h-4 mr-1" />
                {t("addGuest")}
              </Button>
            )}
          </div>
        </div>
      </div>

      {/* Legal notice */}
      <div className="rounded-2xl border border-blue-100 bg-blue-50/50 dark:bg-blue-950/20 dark:border-blue-800 p-5">
        <div className="flex items-start gap-3">
          <div className="w-8 h-8 rounded-lg bg-blue-100 dark:bg-blue-900/50 flex items-center justify-center shrink-0">
            <Info className="h-4 w-4 text-blue-600 dark:text-blue-400" />
          </div>
          <div className="space-y-1.5">
            <h3 className="text-sm font-semibold text-blue-800 dark:text-blue-300">
              {t("dataCollectionNotice.title")}
            </h3>
            <p className="text-xs text-blue-700 dark:text-blue-400 leading-relaxed">
              {t("dataCollectionNotice.text")}
            </p>
            <p className="text-xs text-blue-500/70 dark:text-blue-500">
              {t("dataCollectionNotice.legalBasis")}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
