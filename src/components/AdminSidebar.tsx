"use client";
import React from "react";
import { Link, usePathname } from "../i18n/navigation";
import { useTranslations } from "next-intl";

const navItems = [
  { href: "/dashboard", labelKey: "dashboard" },
  { href: "/properties", labelKey: "accommodationUnits" },
  { href: "/reservations", labelKey: "reservations" },
];

const AdminSidebar = () => {
  const t = useTranslations();
  const pathname = usePathname();
  const locale = pathname.split("/")[1];
  return (
    <aside className="w-64 bg-gray-100 h-screen p-6 border-r flex flex-col">
      <div className="text-xl font-bold mb-8">DeeCheckIn Admin</div>
      <nav className="flex flex-col gap-4">
        {navItems.map((item) => (
          <Link
            key={item.href}
            href={`/${locale}${item.href}`}
            className="hover:text-blue-600"
          >
            {t(item.labelKey)}
          </Link>
        ))}
      </nav>
    </aside>
  );
};

export default AdminSidebar;
