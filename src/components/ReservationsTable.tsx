"use client";

import React, { useState } from "react";
import { useTranslations } from "next-intl";
import { useRouter } from "@/i18n/navigation";
import { DataTable, ColumnDef, ActionButton } from "@/components/ui/DataTable";
import { Modal } from "@/components/ui/Modal";
import { GuestInfoCard } from "@/components/ui/GuestInfoCard";
import { getGuestsByBookNumberAction } from "@/actions/guests";
import type { Reservation } from "@/types/reservation";

interface GuestInfo {
  id?: string;
  full_name: string;
  birth_date: string;
  nationality: string;
  document_type: string;
  document_number: string;
  address_street: string;
  address_city: string;
  address_zip: string;
  address_country: string;
  stay_purpose: string;
  phone?: string;
  email?: string;
  consent: boolean;
  created_at: string;
}

interface ReservationsTableProps {
  reservations: Reservation[];
  loading?: boolean;
  error?: string | null;
  onCheckin?: (bookNumber: string) => void;
  onCheckout?: (bookNumber: string) => void;
}

export function ReservationsTable({
  reservations,
  loading = false,
  error = null,
  onCheckin,
  onCheckout,
}: Readonly<ReservationsTableProps>) {
  const t = useTranslations();
  const router = useRouter();

  const [selectedGuest, setSelectedGuest] = useState<{
    guest: GuestInfo;
    bookNumber: string;
  } | null>(null);
  const [loadingGuests, setLoadingGuests] = useState<Record<string, boolean>>(
    {},
  );

  // Výchozí handlery
  const handleCheckin =
    onCheckin ||
    ((bookNumber: string) => {
      router.push(`/checkin/${bookNumber}`);
    });

  const handleCheckout =
    onCheckout ||
    ((bookNumber: string) => {
      console.log("Checkout for booking:", bookNumber);
    });

  // Funkce pro načtení informací o hostovi
  const handleViewGuest = async (reservation: Reservation) => {
    const bookNumber = String(reservation.book_number);

    if (loadingGuests[bookNumber]) return;

    setLoadingGuests((prev) => ({ ...prev, [bookNumber]: true }));

    try {
      const result = await getGuestsByBookNumberAction(bookNumber);
      if (result.success && result.data.length > 0) {
        const guest = result.data[0];
        setSelectedGuest({
          guest: {
            full_name: `${guest.first_name} ${guest.last_name}`,
            birth_date: guest.birth_date,
            nationality: guest.nationality,
            document_type: guest.document_type,
            document_number: guest.document_number,
            address_street: guest.address_street,
            address_city: guest.address_city,
            address_zip: guest.address_zip,
            address_country: guest.address_country,
            stay_purpose: guest.stay_purpose,
            phone: guest.phone ?? undefined,
            email: guest.email ?? undefined,
            consent: guest.consent,
            created_at: guest.created_at ?? "",
          },
          bookNumber,
        });
      }
    } catch (err) {
      console.error("Error loading guest:", err);
    } finally {
      setLoadingGuests((prev) => ({ ...prev, [bookNumber]: false }));
    }
  };

  // Funkce pro kliknutí na řádek - zobrazí informace o hostovi pokud je checked in
  const handleRowClick = (reservation: Reservation) => {
    if (
      reservation.reservation_status === "CHECKED_IN" ||
      reservation.guest_id
    ) {
      handleViewGuest(reservation);
    }
  };

  // Definice sloupců
  const columns: ColumnDef<Reservation>[] = [
    {
      key: "guest_names",
      header: t("guest"),
      accessor: (item) => item.guest_names,
      sortable: true,
      filterable: true,
    },
    {
      key: "check_in",
      header: t("checkIn"),
      accessor: (item) => item.check_in,
      sortable: true,
      filterable: true,
    },
    {
      key: "check_out",
      header: t("checkOut"),
      accessor: (item) => item.check_out,
      sortable: true,
      filterable: true,
    },
    {
      key: "property_id",
      header: t("propertyId"),
      accessor: (item) => String(item.property_id),
      sortable: true,
      filterable: true,
    },
    {
      key: "book_number",
      header: t("bookNumber"),
      accessor: (item) => String(item.book_number),
      sortable: true,
      filterable: true,
    },
    {
      key: "booked_by",
      header: t("bookedBy"),
      accessor: (item) => item.booked_by,
      sortable: true,
      filterable: true,
    },
    {
      key: "booked_on",
      header: t("bookedOn"),
      accessor: (item) => item.booked_on,
      sortable: true,
      filterable: true,
    },
    {
      key: "price",
      header: t("price"),
      accessor: (item) => item.price,
      sortable: true,
      filterable: true,
    },
    {
      key: "people",
      header: t("people"),
      accessor: (item) => String(item.people),
      sortable: true,
      filterable: true,
    },
    {
      key: "payment_status",
      header: t("paymentStatus"),
      accessor: (item) => item.payment_status,
      sortable: true,
      filterable: true,
    },
    {
      key: "duration_nights",
      header: t("durationNights"),
      accessor: (item) => String(item.duration_nights),
      sortable: true,
      filterable: true,
    },
    {
      key: "rooms",
      header: t("rooms"),
      accessor: (item) => String(item.rooms),
      sortable: true,
      filterable: true,
    },
    {
      key: "source",
      header: t("source"),
      accessor: (item) => item.source || "-",
      sortable: true,
      filterable: true,
    },
    {
      key: "pin_code",
      header: "PIN",
      accessor: (item) => item.pin_code || "-",
      sortable: true,
      filterable: true,
    },
    {
      key: "reservation_status",
      header: t("status"),
      accessor: (item) => item.reservation_status || "-",
      sortable: true,
      filterable: true,
      render: (value: unknown) => {
        const status = typeof value === "string" ? value : "";
        return (
          <span
            className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
              status === "CHECKED_IN"
                ? "bg-green-100 text-green-800 dark:bg-green-800 dark:text-green-100"
                : status === "CONFIRMED"
                  ? "bg-blue-100 text-blue-800 dark:bg-blue-800 dark:text-blue-100"
                  : "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-100"
            }`}
          >
            {status}
          </span>
        );
      },
    },
  ];

  // Definice akcí
  const actions: ActionButton<Reservation>[] = [
    {
      label: t("checkin"),
      onClick: (reservation) => handleCheckin(String(reservation.book_number)),
      variant: "success",
      condition: (reservation) =>
        reservation.reservation_status !== "CHECKED_IN" &&
        !reservation.guest_id,
    },
    {
      label: t("checkout"),
      onClick: (reservation) => handleCheckout(String(reservation.book_number)),
      variant: "primary",
      condition: (reservation) =>
        reservation.reservation_status === "CHECKED_IN" ||
        !!reservation.guest_id,
    },
    {
      label: t("guestInfo"),
      onClick: (reservation) => handleViewGuest(reservation),
      variant: "warning",
      condition: (reservation) =>
        reservation.reservation_status === "CHECKED_IN" ||
        !!reservation.guest_id,
      loading: (reservation) =>
        loadingGuests[String(reservation.book_number)] || false,
    },
  ];

  return (
    <>
      <DataTable
        data={reservations}
        columns={columns}
        actions={actions}
        onRowClick={handleRowClick}
        loading={loading}
        error={error}
        emptyMessage={t("noReservations")}
        pageSize={10}
      />

      {/* Modal pro zobrazení informací o hostovi */}
      <Modal
        isOpen={!!selectedGuest}
        onClose={() => setSelectedGuest(null)}
        title={t("guestInfo")}
        size="xl"
      >
        {selectedGuest && (
          <GuestInfoCard
            guest={selectedGuest.guest}
            reservationNumber={selectedGuest.bookNumber}
          />
        )}
      </Modal>
    </>
  );
}
