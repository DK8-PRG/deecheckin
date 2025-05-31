import React from "react";
import AdminSidebar from "../../../../components/AdminSidebar";
import { useTranslations } from "next-intl";
import LanguageSwitcher from "@/components/LanguageSwitcher";

const DashboardPage = () => {
  const t = useTranslations();
  return (
    <div className="flex min-h-screen">
      <AdminSidebar />
      <main className="flex-1 p-8">
        <div className="w-full flex justify-end mb-4">
          <LanguageSwitcher />
        </div>
        <h1 className="text-2xl font-bold mb-4">{t("dashboard")}</h1>
        {/* TODO: Přehled rezervací, hostů a statusů check-inu */}
        <div className="border rounded p-4 text-gray-500">
          Zde bude přehled rezervací, hostů a statusů check-inu.
        </div>
      </main>
    </div>
  );
};

export default DashboardPage;
