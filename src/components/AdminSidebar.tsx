import React from "react";
import Link from "next/link";
import { useTranslations } from "next-intl";

const navItems = [
  { href: "/admin/dashboard", labelKey: "dashboard" },
  { href: "/admin/properties", labelKey: "accommodationUnits" },
  { href: "/admin/reservations", labelKey: "reservations" },
];

const AdminSidebar = () => {
  const t = useTranslations();
  return (
    <aside className="w-64 bg-gray-100 h-screen p-6 border-r flex flex-col">
      <div className="text-xl font-bold mb-8">DeeCheckIn Admin</div>
      <nav className="flex flex-col gap-4">
        {navItems.map((item) => (
          <Link
            key={item.href}
            href={item.href}
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
