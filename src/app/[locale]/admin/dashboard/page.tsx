"use client";

import React from "react";
import AdminSidebar from "../../../../components/AdminSidebar";
import { useTranslations } from "next-intl";
import { usePropertiesContext } from "@/context/PropertiesContext";

const DashboardPage = () => {
  const t = useTranslations();
  const { properties, loading, error } = usePropertiesContext();
  // Později zde lze napojit i ReservationsContext

  return (
    <div className="flex min-h-screen">
      <AdminSidebar />
      <main className="flex-1 p-8">
        <h1 className="text-2xl font-bold mb-4">{t("dashboard")}</h1>
        <div className="border rounded p-4">
          <div className="font-semibold mb-2">{t("accommodationUnits")}</div>
          {loading && <div className="text-gray-500">Načítání…</div>}
          {error && <div className="text-red-500">{error}</div>}
          <ul className="list-disc pl-6">
            {properties.length ? (
              properties.map((p) => <li key={p.id}>{p.name}</li>)
            ) : (
              <li className="text-gray-500">Žádné jednotky</li>
            )}
          </ul>
        </div>
      </main>
    </div>
  );
};

export default DashboardPage;
