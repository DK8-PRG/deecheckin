import React from "react";
import AdminSidebar from "../../../../components/AdminSidebar";
import { useTranslations } from "next-intl";
import LanguageSwitcher from "@/components/LanguageSwitcher";

const PropertiesPage = () => {
  const t = useTranslations();
  return (
    <div className="flex min-h-screen">
      <AdminSidebar />
      <main className="flex-1 p-8">
        <div className="w-full flex justify-end mb-4">
          <LanguageSwitcher />
        </div>
        <h1 className="text-2xl font-bold mb-4">{t("accommodationUnits")}</h1>
        {/* TODO: Výpis a přidání ubytovacích jednotek */}
        <div className="border rounded p-4 text-gray-500">
          Zde bude výpis a přidání ubytovacích jednotek.
        </div>
      </main>
    </div>
  );
};

export default PropertiesPage;
