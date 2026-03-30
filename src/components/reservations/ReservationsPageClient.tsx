"use client";

import React, { useState } from "react";
import { useRouter } from "@/i18n/navigation";
import { useTranslations } from "next-intl";
import type { Reservation, PropertyOption } from "@/types/reservation";
import { ReservationForm } from "./ReservationForm";
import { DeleteReservationDialog } from "./DeleteReservationDialog";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Plus, Pencil, Trash2, Eye } from "lucide-react";

// ---------------------------------------------------------------------------
// Props
// ---------------------------------------------------------------------------

interface ReservationsPageClientProps {
  initialReservations: Reservation[];
  properties: PropertyOption[];
}

// ---------------------------------------------------------------------------
// Status badge helper
// ---------------------------------------------------------------------------

function StatusBadge({ status }: Readonly<{ status: string | null }>) {
  const colorMap: Record<string, string> = {
    pending: "bg-yellow-100 text-yellow-800",
    confirmed: "bg-blue-100 text-blue-800",
    checked_in: "bg-green-100 text-green-800",
    CHECKED_IN: "bg-green-100 text-green-800",
    checked_out: "bg-gray-100 text-gray-800",
    cancelled: "bg-red-100 text-red-800",
  };

  const color = colorMap[status ?? ""] ?? "bg-gray-100 text-gray-700";

  return (
    <span
      className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${color}`}
    >
      {status ?? "—"}
    </span>
  );
}

// ---------------------------------------------------------------------------
// Main client component
// ---------------------------------------------------------------------------

export function ReservationsPageClient({
  initialReservations,
  properties,
}: Readonly<ReservationsPageClientProps>) {
  const t = useTranslations();
  const router = useRouter();

  // Dialog state
  const [formOpen, setFormOpen] = useState(false);
  const [editingReservation, setEditingReservation] =
    useState<Reservation | null>(null);
  const [deletingReservation, setDeletingReservation] =
    useState<Reservation | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [viewReservation, setViewReservation] = useState<Reservation | null>(
    null,
  );

  // Property name lookup
  const propertyName = (id: string | null) =>
    properties.find((p) => p.id === id)?.name ?? "—";

  // After mutation — refresh server data
  const handleMutationSuccess = () => {
    setFormOpen(false);
    setEditingReservation(null);
    // Trigger Next.js router refresh to re-run the server component
    router.refresh();
    // Also update local state eagerly via a re-fetch will happen from the
    // revalidatePath in the action, but router.refresh() ensures it.
  };

  const openCreate = () => {
    setEditingReservation(null);
    setFormOpen(true);
  };

  const openEdit = (r: Reservation) => {
    setEditingReservation(r);
    setFormOpen(true);
  };

  const openDelete = (r: Reservation) => {
    setDeletingReservation(r);
    setDeleteDialogOpen(true);
  };

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">{t("reservations")}</h1>
        <Button onClick={openCreate}>
          <Plus className="h-4 w-4" />
          {t("addReservation")}
        </Button>
      </div>

      {/* Table */}
      <div className="rounded-md border overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-muted/50">
            <tr>
              <th className="px-4 py-3 text-left font-medium">
                {t("guestName")}
              </th>
              <th className="px-4 py-3 text-left font-medium">
                {t("accommodationUnit")}
              </th>
              <th className="px-4 py-3 text-left font-medium">
                {t("checkIn")}
              </th>
              <th className="px-4 py-3 text-left font-medium">
                {t("checkOut")}
              </th>
              <th className="px-4 py-3 text-left font-medium">{t("source")}</th>
              <th className="px-4 py-3 text-left font-medium">{t("status")}</th>
              <th className="px-4 py-3 text-left font-medium">{t("price")}</th>
              <th className="px-4 py-3 text-right font-medium">
                {t("actions")}
              </th>
            </tr>
          </thead>
          <tbody>
            {initialReservations.length === 0 && (
              <tr>
                <td
                  colSpan={8}
                  className="px-4 py-8 text-center text-muted-foreground"
                >
                  {t("noReservations")}
                </td>
              </tr>
            )}
            {initialReservations.map((r) => (
              <tr
                key={r.id}
                className="border-t hover:bg-muted/30 transition-colors"
              >
                <td className="px-4 py-3 font-medium">
                  {r.guest_names ?? "—"}
                </td>
                <td className="px-4 py-3">{propertyName(r.property_id)}</td>
                <td className="px-4 py-3">{r.check_in}</td>
                <td className="px-4 py-3">{r.check_out}</td>
                <td className="px-4 py-3">{r.source ?? "—"}</td>
                <td className="px-4 py-3">
                  <StatusBadge status={r.reservation_status ?? r.status} />
                </td>
                <td className="px-4 py-3">{r.price ?? "—"}</td>
                <td className="px-4 py-3">
                  <div className="flex items-center justify-end gap-1">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => setViewReservation(r)}
                      title={t("view")}
                    >
                      <Eye className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => openEdit(r)}
                      title={t("edit")}
                    >
                      <Pencil className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => openDelete(r)}
                      title={t("delete")}
                    >
                      <Trash2 className="h-4 w-4 text-destructive" />
                    </Button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Create / Edit Dialog */}
      <Dialog
        open={formOpen}
        onOpenChange={(open) => {
          setFormOpen(open);
          if (!open) setEditingReservation(null);
        }}
      >
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {editingReservation ? t("editReservation") : t("addReservation")}
            </DialogTitle>
          </DialogHeader>
          <ReservationForm
            properties={properties}
            reservation={editingReservation}
            onSuccess={handleMutationSuccess}
            onCancel={() => {
              setFormOpen(false);
              setEditingReservation(null);
            }}
          />
        </DialogContent>
      </Dialog>

      {/* Delete Dialog */}
      <DeleteReservationDialog
        reservation={deletingReservation}
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
        onDeleted={handleMutationSuccess}
      />

      {/* View Dialog */}
      <Dialog
        open={!!viewReservation}
        onOpenChange={(open) => {
          if (!open) setViewReservation(null);
        }}
      >
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>{t("reservationDetail")}</DialogTitle>
          </DialogHeader>
          {viewReservation && (
            <div className="grid grid-cols-2 gap-x-4 gap-y-2 text-sm">
              <DetailRow
                label={t("guestName")}
                value={viewReservation.guest_names}
              />
              <DetailRow
                label={t("accommodationUnit")}
                value={propertyName(viewReservation.property_id)}
              />
              <DetailRow
                label={t("checkIn")}
                value={viewReservation.check_in}
              />
              <DetailRow
                label={t("checkOut")}
                value={viewReservation.check_out}
              />
              <DetailRow label={t("source")} value={viewReservation.source} />
              <DetailRow
                label={t("status")}
                value={
                  viewReservation.reservation_status ?? viewReservation.status
                }
              />
              <DetailRow
                label={t("rooms")}
                value={String(viewReservation.rooms ?? "—")}
              />
              <DetailRow
                label={t("adults")}
                value={String(viewReservation.adults ?? "—")}
              />
              <DetailRow
                label={t("children")}
                value={String(viewReservation.children ?? "—")}
              />
              <DetailRow label={t("price")} value={viewReservation.price} />
              <DetailRow
                label={t("phone")}
                value={viewReservation.phone_number}
              />
              <DetailRow label={t("remarks")} value={viewReservation.remarks} />
              <DetailRow
                label={t("specialRequests")}
                value={viewReservation.special_requests}
              />
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Tiny helper
// ---------------------------------------------------------------------------

function DetailRow({
  label,
  value,
}: Readonly<{
  label: string;
  value: string | null | undefined;
}>) {
  return (
    <>
      <dt className="text-muted-foreground">{label}</dt>
      <dd className="font-medium">{value || "—"}</dd>
    </>
  );
}
