"use client";

import React, { useState, useTransition } from "react";
import { useTranslations } from "next-intl";
import { useRouter } from "@/i18n/navigation";
import { findReservationByBookNumberAction } from "@/actions/reservations";
import { Button } from "@/components/ui/button";
import { Search, Loader2 } from "lucide-react";

interface GuestCheckinSectionProps {
  onVerified: (bookNumber: string) => void;
}

export function GuestCheckinSection({
  onVerified,
}: Readonly<GuestCheckinSectionProps>) {
  const t = useTranslations("guestLanding");
  const tCheckin = useTranslations();
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [bookNumber, setBookNumber] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [verified, setVerified] = useState(false);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!bookNumber.trim()) {
      setError(tCheckin("enterReservationNumber"));
      return;
    }

    startTransition(async () => {
      const result = await findReservationByBookNumberAction(bookNumber.trim());

      if (!result.success || !result.data) {
        setError(tCheckin("reservationNotFound"));
        return;
      }

      const reservation = result.data;

      if (reservation.status === "checked_in") {
        // Already checked in — unlock the info section
        setVerified(true);
        onVerified(bookNumber.trim());
        return;
      }

      if (
        reservation.status === "pending" ||
        reservation.status === "confirmed"
      ) {
        // Redirect to check-in wizard
        router.push(`/checkin/${reservation.book_number}`);
        return;
      }

      setError(tCheckin("reservationCancelled"));
    });
  };

  return (
    <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm">
      {verified ? (
        <div className="text-center space-y-2">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-emerald-100 text-emerald-600 mb-2">
            <svg
              className="h-6 w-6"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M5 13l4 4L19 7"
              />
            </svg>
          </div>
          <p className="font-semibold text-emerald-700">
            {t("checkinVerified")}
          </p>
          <p className="text-sm text-slate-500">{t("checkinVerifiedDesc")}</p>
        </div>
      ) : (
        <form onSubmit={handleSearch} className="space-y-4">
          <p className="text-slate-600">{t("checkinDescription")}</p>
          <div className="flex gap-2">
            <input
              type="text"
              value={bookNumber}
              onChange={(e) => setBookNumber(e.target.value)}
              placeholder={tCheckin("reservationNumberPlaceholder")}
              className="flex-1 px-3 py-2 text-sm bg-background border border-input rounded-md focus:outline-none focus:ring-2 focus:ring-ring"
            />
            <Button type="submit" disabled={isPending}>
              {isPending ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <>
                  <Search className="h-4 w-4 mr-1" />
                  {tCheckin("search")}
                </>
              )}
            </Button>
          </div>
          {error && <p className="text-sm text-destructive">{error}</p>}
        </form>
      )}
    </div>
  );
}
