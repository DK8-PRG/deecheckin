"use client";

import React from "react";
import AdminSidebar from "../../../../components/AdminSidebar";
import { useTranslations } from "next-intl";
import { usePropertiesContext } from "@/context/PropertiesContext";

const PropertiesPage = () => {
  const t = useTranslations();
  const { properties, loading, error } = usePropertiesContext();

  return (
    <div className="flex min-h-screen">
      <AdminSidebar />
      <main className="flex-1 p-8">
        <h1 className="text-2xl font-bold mb-4">{t("accommodationUnits")}</h1>
        <div className="border rounded p-4">
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

export default PropertiesPage;
