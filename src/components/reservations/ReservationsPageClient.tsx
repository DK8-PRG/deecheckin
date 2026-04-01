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
import {
  Plus,
  Pencil,
  Trash2,
  Eye,
  Link2,
  MessageSquare,
  AlertTriangle,
  Check,
  X,
} from "lucide-react";
import { quickUpdateGuestNameAction } from "@/actions/reservations";

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

function SourceBadge({ source }: Readonly<{ source: string | null }>) {
  const colorMap: Record<string, string> = {
    booking: "bg-blue-600 text-white",
    airbnb: "bg-rose-500 text-white",
    manual: "bg-gray-100 text-gray-700",
  };

  const labelMap: Record<string, string> = {
    booking: "Booking",
    airbnb: "Airbnb",
  };

  if (!source) return <span className="text-muted-foreground">—</span>;

  const color = colorMap[source] ?? "bg-gray-100 text-gray-700";
  const label = labelMap[source] ?? source;

  return (
    <span
      className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${color}`}
    >
      {label}
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
  const [messageReservation, setMessageReservation] =
    useState<Reservation | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [editingNameId, setEditingNameId] = useState<string | null>(null);
  const [nameValue, setNameValue] = useState("");
  const [savingName, setSavingName] = useState(false);

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

  const copyCheckinLink = async (r: Reservation) => {
    const baseUrl = globalThis.location.origin;
    const locale = globalThis.location.pathname.split("/")[1] || "cs";
    // Use book_number as the primary identifier
    const link = r.book_number
      ? `${baseUrl}/${locale}/checkin?book=${r.book_number}`
      : `${baseUrl}/${locale}/checkin`;
    await navigator.clipboard.writeText(link);
    setCopiedId(r.id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const getMessageTemplate = (r: Reservation) => {
    const baseUrl = globalThis.location.origin;
    const locale = globalThis.location.pathname.split("/")[1] || "cs";
    const link = r.book_number
      ? `${baseUrl}/${locale}/checkin?book=${r.book_number}`
      : `${baseUrl}/${locale}/checkin`;
    const guestName = r.guest_names ?? t("guest");
    return t("checkinMessageTemplate", { guestName, link });
  };

  const startNameEdit = (r: Reservation) => {
    setEditingNameId(r.id);
    setNameValue(r.guest_names ?? "");
  };

  const cancelNameEdit = () => {
    setEditingNameId(null);
    setNameValue("");
  };

  const saveNameEdit = async (id: string) => {
    if (!nameValue.trim()) return;
    setSavingName(true);
    const result = await quickUpdateGuestNameAction(id, nameValue);
    setSavingName(false);
    if (result.success) {
      setEditingNameId(null);
      setNameValue("");
      router.refresh();
    }
  };

  // Is this an anonymous iCal import (has ical_uid but no guest name)?
  const isAnonymous = (r: Reservation) =>
    (!r.guest_names || r.guest_names.trim() === "") && !!r.ical_uid;

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
                className={`border-t transition-colors ${isAnonymous(r) ? "bg-amber-50/50 hover:bg-amber-50" : "hover:bg-muted/30"}`}
              >
                <td className="px-4 py-3 font-medium">
                  {editingNameId === r.id ? (
                    <div className="flex items-center gap-1">
                      <input
                        type="text"
                        value={nameValue}
                        onChange={(e) => setNameValue(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === "Enter") saveNameEdit(r.id);
                          if (e.key === "Escape") cancelNameEdit();
                        }}
                        className="h-7 w-40 rounded border border-input bg-background px-2 text-sm focus:outline-none focus:ring-1 focus:ring-ring"
                        placeholder={t("guestNamePlaceholder")}
                        autoFocus
                        disabled={savingName}
                      />
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-7 w-7"
                        onClick={() => saveNameEdit(r.id)}
                        disabled={savingName || !nameValue.trim()}
                      >
                        <Check className="h-3.5 w-3.5 text-green-600" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-7 w-7"
                        onClick={cancelNameEdit}
                        disabled={savingName}
                      >
                        <X className="h-3.5 w-3.5 text-muted-foreground" />
                      </Button>
                    </div>
                  ) : isAnonymous(r) ? (
                    <button
                      onClick={() => startNameEdit(r)}
                      className="inline-flex items-center gap-1.5 rounded-md bg-amber-50 px-2 py-1 text-xs font-medium text-amber-700 ring-1 ring-amber-200 hover:bg-amber-100 transition-colors cursor-pointer"
                    >
                      <AlertTriangle className="h-3.5 w-3.5" />
                      {t("addGuestName")}
                    </button>
                  ) : (
                    (r.guest_names ?? "—")
                  )}
                </td>
                <td className="px-4 py-3">{propertyName(r.property_id)}</td>
                <td className="px-4 py-3">{r.check_in}</td>
                <td className="px-4 py-3">{r.check_out}</td>
                <td className="px-4 py-3">
                  <SourceBadge source={r.source} />
                </td>
                <td className="px-4 py-3">
                  <StatusBadge status={r.status} />
                </td>
                <td className="px-4 py-3">{r.price ?? "—"}</td>
                <td className="px-4 py-3">
                  <div className="flex items-center justify-end gap-1">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => copyCheckinLink(r)}
                      title={
                        copiedId === r.id ? t("copied") : t("copyCheckinLink")
                      }
                    >
                      <Link2
                        className={`h-4 w-4 ${copiedId === r.id ? "text-green-500" : ""}`}
                      />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => setMessageReservation(r)}
                      title={t("messageTemplate")}
                    >
                      <MessageSquare className="h-4 w-4" />
                    </Button>
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
              <DetailRow label={t("status")} value={viewReservation.status} />
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

      {/* Message Template Dialog */}
      <Dialog
        open={!!messageReservation}
        onOpenChange={(open) => {
          if (!open) setMessageReservation(null);
        }}
      >
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>{t("messageTemplate")}</DialogTitle>
          </DialogHeader>
          {messageReservation && (
            <div className="space-y-3">
              <textarea
                readOnly
                value={getMessageTemplate(messageReservation)}
                rows={6}
                className="w-full rounded-md border border-input bg-muted px-3 py-2 text-sm"
              />
              <div className="flex justify-end">
                <Button
                  onClick={async () => {
                    await navigator.clipboard.writeText(
                      getMessageTemplate(messageReservation),
                    );
                  }}
                  size="sm"
                >
                  {t("copyToClipboard")}
                </Button>
              </div>
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
