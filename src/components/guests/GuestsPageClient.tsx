"use client";

import React, { useState, useTransition } from "react";
import { useTranslations } from "next-intl";
import { useRouter } from "@/i18n/navigation";
import type { CheckinGroup } from "@/services/guests.service";
import type { Reservation } from "@/types/reservation";
import type { Property } from "@/types/property";
import {
  findMatchingReservationsAction,
  pairGroupAction,
} from "@/actions/guests";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { useToast } from "@/components/ui/toast";
import { Users, Link2, CalendarDays, Building2 } from "lucide-react";

// ---------------------------------------------------------------------------
// Props
// ---------------------------------------------------------------------------

interface GuestsPageClientProps {
  initialGroups: CheckinGroup[];
  properties: Property[];
}

// ---------------------------------------------------------------------------
// Main component
// ---------------------------------------------------------------------------

export function GuestsPageClient({
  initialGroups,
  properties,
}: Readonly<GuestsPageClientProps>) {
  const t = useTranslations("adminGuests");
  const { toast } = useToast();
  const router = useRouter();

  const [selectedGroup, setSelectedGroup] = useState<CheckinGroup | null>(null);
  const [candidates, setCandidates] = useState<Reservation[]>([]);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [loadingCandidates, setLoadingCandidates] = useState(false);
  const [isPairing, startPairing] = useTransition();

  const propertyMap = new Map(properties.map((p) => [p.id, p.name]));

  const handleOpenPairing = async (group: CheckinGroup) => {
    setSelectedGroup(group);
    setDialogOpen(true);
    setCandidates([]);

    if (!group.property_id || !group.check_in_date || !group.check_out_date) {
      return;
    }

    setLoadingCandidates(true);
    const result = await findMatchingReservationsAction(
      group.property_id,
      group.check_in_date,
      group.check_out_date,
    );
    if (result.success) {
      setCandidates(result.data);
    }
    setLoadingCandidates(false);
  };

  const handlePair = (reservationId: string) => {
    if (!selectedGroup) return;

    startPairing(async () => {
      const result = await pairGroupAction(
        selectedGroup.checkin_group_id,
        reservationId,
      );
      if (result.success) {
        toast({ title: t("pairSuccess"), variant: "success" });
        setDialogOpen(false);
        router.refresh();
      } else {
        toast({
          title: t("pairError"),
          description: result.error,
          variant: "destructive",
        });
      }
    });
  };

  if (initialGroups.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-center">
        <Users className="h-12 w-12 text-muted-foreground/50 mb-4" />
        <p className="text-muted-foreground">{t("noUnpaired")}</p>
      </div>
    );
  }

  return (
    <>
      <div className="space-y-4">
        {initialGroups.map((group) => (
          <div
            key={group.checkin_group_id}
            className="rounded-lg border bg-card p-4 shadow-sm"
          >
            <div className="flex items-start justify-between gap-4">
              {/* Group info */}
              <div className="flex-1 space-y-2">
                {/* Property + dates */}
                <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-sm">
                  {group.property_id && (
                    <span className="inline-flex items-center gap-1.5 text-muted-foreground">
                      <Building2 className="h-3.5 w-3.5" />
                      {propertyMap.get(group.property_id) ?? "—"}
                    </span>
                  )}
                  {group.check_in_date && (
                    <span className="inline-flex items-center gap-1.5 text-muted-foreground">
                      <CalendarDays className="h-3.5 w-3.5" />
                      {group.check_in_date} → {group.check_out_date}
                    </span>
                  )}
                  <span className="inline-flex items-center gap-1.5 text-muted-foreground">
                    <Users className="h-3.5 w-3.5" />
                    {t("guestCount", { count: group.guests.length })}
                  </span>
                </div>

                {/* Guest names */}
                <div className="flex flex-wrap gap-1.5">
                  {group.guests.map((guest) => (
                    <span
                      key={guest.id}
                      className="inline-flex items-center rounded-full bg-slate-100 px-2.5 py-0.5 text-xs font-medium text-slate-700"
                    >
                      {guest.first_name} {guest.last_name}
                    </span>
                  ))}
                </div>

                {/* Created at */}
                {group.created_at && (
                  <p className="text-xs text-muted-foreground">
                    {t("createdAt")}:{" "}
                    {new Date(group.created_at).toLocaleDateString("cs-CZ")}
                  </p>
                )}
              </div>

              {/* Pair button */}
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleOpenPairing(group)}
                className="shrink-0"
              >
                <Link2 className="h-4 w-4 mr-1.5" />
                {t("pair")}
              </Button>
            </div>
          </div>
        ))}
      </div>

      {/* Pairing dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>{t("pairDialogTitle")}</DialogTitle>
            <DialogDescription>{t("pairDialogDescription")}</DialogDescription>
          </DialogHeader>

          {/* Selected group summary */}
          {selectedGroup && (
            <div className="rounded-md bg-slate-50 p-3 text-sm space-y-1">
              <p className="font-medium">{t("guestNames")}:</p>
              <p className="text-muted-foreground">
                {selectedGroup.guests
                  .map((g) => `${g.first_name} ${g.last_name}`)
                  .join(", ")}
              </p>
              {selectedGroup.check_in_date && (
                <p className="text-muted-foreground">
                  {selectedGroup.check_in_date} → {selectedGroup.check_out_date}
                </p>
              )}
            </div>
          )}

          {/* Candidates */}
          <div className="space-y-2 max-h-64 overflow-y-auto">
            {loadingCandidates ? (
              <div className="py-8 text-center text-sm text-muted-foreground">
                …
              </div>
            ) : candidates.length === 0 ? (
              <p className="py-4 text-center text-sm text-muted-foreground">
                {t("noMatchingReservations")}
              </p>
            ) : (
              candidates.map((res) => (
                <button
                  key={res.id}
                  type="button"
                  disabled={isPairing}
                  onClick={() => handlePair(res.id)}
                  className="w-full text-left rounded-md border p-3 hover:bg-accent transition-colors disabled:opacity-50"
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium">
                        #{res.book_number} —{" "}
                        {res.guest_names ?? res.booked_by ?? "—"}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {res.check_in} → {res.check_out}
                      </p>
                    </div>
                    <span className="text-xs text-muted-foreground">
                      {res.status}
                    </span>
                  </div>
                </button>
              ))
            )}
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
