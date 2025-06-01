"use client";

import React from "react";
import AdminSidebar from "../../../../components/AdminSidebar";
import { useTranslations } from "next-intl";
import { useReservationsContext } from "@/context/ReservationsContext";

const ReservationsPage = () => {
  const t = useTranslations();
  const { reservations, loading, error } = useReservationsContext();
  console.log("Reservations:", reservations);

  return (
    <div className="flex min-h-screen">
      <AdminSidebar />
      <main className="flex-1 p-8">
        <h1 className="text-2xl font-bold mb-4">{t("reservations")}</h1>
        <div className="border rounded p-4 bg-white dark:bg-gray-900 shadow">
          {loading && (
            <div className="text-gray-500 animate-pulse">Načítání…</div>
          )}
          {error && <div className="text-red-500 font-semibold">{error}</div>}
          <ul className="divide-y divide-gray-200">
            {reservations.length ? (
              reservations.map((r) => {
                // Dynamický přístup ke všem polím bez TS chyb pomocí indexace objektu
                const obj = r as unknown as { [key: string]: unknown };
                const guest = obj["guestName"] || obj["guest_name"];
                const start = obj["startDate"] || obj["checkin_date"];
                const end = obj["endDate"] || obj["checkout_date"];
                const property = obj["propertyId"] || obj["property_id"];
                const source = typeof obj["source"] === "string" ? obj["source"] : undefined;
                const pinCode = typeof obj["pin_code"] === "string" ? obj["pin_code"] : undefined;
                const pinStatus = typeof obj["pin_status"] === "string" ? obj["pin_status"] : undefined;
                return (
                  <li
                    key={String(obj["id"])}
                    className="py-4 flex flex-col md:flex-row md:items-center md:justify-between gap-2"
                  >
                    <div>
                      <span className="font-semibold text-lg text-blue-700 dark:text-blue-300">
                        {guest as string}
                      </span>
                      <span className="ml-2 text-gray-500">
                        ({start as string} – {end as string})
                      </span>
                    </div>
                    <div className="text-sm text-gray-400">
                      ID jednotky: {property as string}
                    </div>
                    {source && (
                      <div className="text-xs text-gray-400">Zdroj: {source}</div>
                    )}
                    {typeof pinStatus !== 'undefined' && (
                      <div className="text-xs text-gray-400">PIN: {(pinCode || "-") as string} ({pinStatus})</div>
                    )}
                  </li>
                );
              })
            ) : (
              <li className="text-gray-500 py-4 text-center">
                Žádné rezervace
              </li>
            )}
          </ul>
        </div>
      </main>
    </div>
  );
};

export default ReservationsPage;
