"use client";

import React, { useState, useTransition, useEffect } from "react";
import { useTranslations } from "next-intl";
import { useRouter } from "@/i18n/navigation";
import { useSearchParams } from "next/navigation";
import { findReservationByBookNumberAction } from "@/actions/reservations";
import type { Reservation } from "@/types/reservation";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Search,
  CalendarDays,
  Users,
  ArrowRight,
  ShieldCheck,
  AlertCircle,
} from "lucide-react";

export default function CheckinPage() {
  const t = useTranslations();
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();
  const [reservationNumber, setReservationNumber] = useState("");
  const [foundReservation, setFoundReservation] = useState<Reservation | null>(
    null,
  );
  const [error, setError] = useState<string | null>(null);

  // Auto-fill from URL query params (?book=42 or ?ref=HMXXXXXX)
  useEffect(() => {
    const book = searchParams.get("book");
    const ref = searchParams.get("ref");
    const value = book || ref;
    if (value) {
      setReservationNumber(value);
    }
  }, [searchParams]);

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
        found.status === "cancelled_by_guest" ||
        found.status === "cancelled_by_hotel" ||
        found.status === "CANCELLED"
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

  const canCheckin =
    foundReservation &&
    !error &&
    !(
      foundReservation.guest_id ||
      foundReservation.status?.startsWith("cancelled") ||
      foundReservation.status === "CANCELLED"
    );

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white">
      {/* Header */}
      <header className="border-b bg-white/80 backdrop-blur-sm">
        <div className="max-w-lg mx-auto px-4 py-4 flex items-center justify-center gap-2">
          <ShieldCheck className="h-5 w-5 text-primary" />
          <span className="text-base font-semibold text-foreground tracking-tight">
            DeeCheckIn
          </span>
        </div>
      </header>

      <main className="flex-1 flex items-start justify-center px-4 pt-12 pb-16">
        <div className="w-full max-w-md space-y-6">
          {/* Hero */}
          <div className="text-center space-y-2">
            <h1 className="text-2xl font-bold text-foreground tracking-tight">
              {t("checkinTitle")}
            </h1>
            <p className="text-sm text-muted-foreground max-w-xs mx-auto">
              {t("CheckinForm.dataCollectionNotice.legalBasis")}
            </p>
          </div>

          {/* Search card */}
          <div className="rounded-2xl border border-border bg-white shadow-sm p-6 space-y-4">
            <form onSubmit={handleSearch} className="space-y-4">
              <div>
                <label
                  htmlFor="reservationNumber"
                  className="block text-sm font-medium text-foreground mb-2"
                >
                  {t("reservationNumberLabel")}
                </label>
                <div className="relative">
                  <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <input
                    id="reservationNumber"
                    name="reservationNumber"
                    type="text"
                    required
                    className="input pl-10"
                    value={reservationNumber}
                    onChange={(e) => setReservationNumber(e.target.value)}
                    placeholder={t("reservationNumberPlaceholder")}
                    autoFocus
                  />
                </div>
              </div>
              <Button
                type="submit"
                disabled={isPending}
                className="w-full h-11 text-sm font-medium"
              >
                {isPending ? (
                  <div className="flex items-center gap-2">
                    <div className="h-4 w-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    {t("searching")}
                  </div>
                ) : (
                  <div className="flex items-center gap-2">
                    <Search className="h-4 w-4" />
                    {t("search")}
                  </div>
                )}
              </Button>
            </form>
          </div>

          {/* Error */}
          {error && (
            <div className="flex items-start gap-3 rounded-xl border border-destructive/20 bg-destructive/5 p-4 animate-slide-up">
              <AlertCircle className="h-5 w-5 text-destructive shrink-0 mt-0.5" />
              <p className="text-sm text-destructive">{error}</p>
            </div>
          )}

          {/* Result */}
          {foundReservation && !error && (
            <div className="rounded-2xl border border-border bg-white shadow-sm overflow-hidden animate-slide-up">
              <div className="p-6 space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-semibold text-foreground">
                    {t("reservationDetails")}
                  </h3>
                  <Badge variant="secondary" className="text-xs">
                    {foundReservation.status}
                  </Badge>
                </div>

                <div className="space-y-3">
                  <div className="flex items-center gap-3 text-sm">
                    <Users className="h-4 w-4 text-muted-foreground shrink-0" />
                    <div>
                      <p className="font-medium text-foreground">
                        {foundReservation.guest_names}
                      </p>
                      <p className="text-muted-foreground">
                        {foundReservation.people}{" "}
                        {foundReservation.people === 1
                          ? t("guest")
                          : t("people")}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 text-sm">
                    <CalendarDays className="h-4 w-4 text-muted-foreground shrink-0" />
                    <div>
                      <p className="font-medium text-foreground">
                        {foundReservation.check_in} →{" "}
                        {foundReservation.check_out}
                      </p>
                      <p className="text-muted-foreground">
                        {foundReservation.rooms}{" "}
                        {(foundReservation.rooms ?? 0) === 1
                          ? t("room")
                          : t("rooms")}
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {canCheckin && (
                <div className="border-t px-6 py-4 bg-slate-50/50">
                  <Button
                    onClick={handleCheckInNow}
                    className="w-full h-11 text-sm font-medium"
                  >
                    {t("checkInNow")}
                    <ArrowRight className="h-4 w-4 ml-2" />
                  </Button>
                </div>
              )}
            </div>
          )}
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t bg-white/50">
        <div className="max-w-lg mx-auto px-4 py-3 text-center">
          <p className="text-xs text-muted-foreground">
            DeeCheckIn · {t("CheckinForm.dataCollectionNotice.title")}
          </p>
        </div>
      </footer>
    </div>
  );
}
