"use client";

import React, { useState, useTransition } from "react";
import { useTranslations } from "next-intl";
import { useRouter } from "@/i18n/navigation";
import { findReservationByBookNumberAction } from "@/actions/reservations";
import type { Reservation } from "@/types/reservation";
import { DashboardShell } from "@/components/DashboardShell";
import { DashboardHeader } from "@/components/DashboardHeader";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Search } from "lucide-react";

export default function CheckinPage() {
  const t = useTranslations();
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [reservationNumber, setReservationNumber] = useState("");
  const [foundReservation, setFoundReservation] = useState<Reservation | null>(
    null,
  );
  const [error, setError] = useState<string | null>(null);

  const handleSearch = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);
    setFoundReservation(null);

    if (!reservationNumber.trim()) {
      setError(t("enterReservationNumber"));
      return;
    }

    startTransition(async () => {
      const result = await findReservationByBookNumberAction(
        reservationNumber.trim(),
      );

      if (!result.success) {
        setError(t("reservationNotFound"));
        return;
      }

      const found = result.data;
      setFoundReservation(found);

      if (
        found.reservation_status === "cancelled_by_guest" ||
        found.reservation_status === "cancelled_by_hotel" ||
        found.reservation_status === "CANCELLED"
      ) {
        setError(t("reservationCancelled"));
      } else if (found.guest_id) {
        setError(t("checkinAlreadyCompleted"));
      }
    });
  };

  const handleCheckInNow = () => {
    if (foundReservation?.book_number) {
      router.push(`/checkin/${foundReservation.book_number}`);
    }
  };

  return (
    <DashboardShell>
      <DashboardHeader title={t("checkinTitle")} />
      <main className="flex-1 p-6 flex items-start justify-center">
        <div className="w-full max-w-md space-y-6 mt-8">
          {/* Search card */}
          <div className="rounded-lg border border-border bg-card p-6 space-y-4">
            <h2 className="text-lg font-semibold text-foreground">
              {t("checkinTitle")}
            </h2>
            <form onSubmit={handleSearch} className="space-y-4">
              <div>
                <label
                  htmlFor="reservationNumber"
                  className="block text-sm font-medium text-foreground mb-1.5"
                >
                  {t("reservationNumberLabel")}
                </label>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <input
                    id="reservationNumber"
                    name="reservationNumber"
                    type="text"
                    required
                    className="w-full pl-9 pr-3 py-2 text-sm bg-background border border-input rounded-md focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-1 placeholder:text-muted-foreground"
                    value={reservationNumber}
                    onChange={(e) => setReservationNumber(e.target.value)}
                    placeholder={t("reservationNumberPlaceholder")}
                  />
                </div>
              </div>
              <Button type="submit" disabled={isPending} className="w-full">
                {isPending ? t("searching") : t("search")}
              </Button>
            </form>
          </div>

          {/* Error */}
          {error && (
            <p className="text-sm text-destructive text-center">{error}</p>
          )}

          {/* Result */}
          {foundReservation && !error && (
            <div className="rounded-lg border border-border bg-card p-6 space-y-4">
              <h3 className="text-sm font-semibold text-foreground">
                {t("reservationDetails")}
              </h3>
              <div className="grid grid-cols-2 gap-x-4 gap-y-2 text-sm">
                <span className="text-muted-foreground">{t("guest")}</span>
                <span className="font-medium text-foreground">
                  {foundReservation.guest_names}
                </span>
                <span className="text-muted-foreground">{t("checkIn")}</span>
                <span className="font-medium text-foreground">
                  {foundReservation.check_in}
                </span>
                <span className="text-muted-foreground">{t("checkOut")}</span>
                <span className="font-medium text-foreground">
                  {foundReservation.check_out}
                </span>
                <span className="text-muted-foreground">{t("rooms")}</span>
                <span className="font-medium text-foreground">
                  {foundReservation.rooms}
                </span>
                <span className="text-muted-foreground">{t("people")}</span>
                <span className="font-medium text-foreground">
                  {foundReservation.people}
                </span>
                <span className="text-muted-foreground">{t("status")}</span>
                <Badge variant="secondary">
                  {foundReservation.reservation_status ||
                    foundReservation.status}
                </Badge>
              </div>
              {!(
                foundReservation.guest_id ||
                foundReservation.reservation_status?.startsWith("cancelled") ||
                foundReservation.reservation_status === "CANCELLED"
              ) && (
                <Button onClick={handleCheckInNow} className="w-full">
                  {t("checkInNow")}
                </Button>
              )}
            </div>
          )}
        </div>
      </main>
    </DashboardShell>
  );
}
