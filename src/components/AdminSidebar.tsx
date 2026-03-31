"use client";

import React, { useState } from "react";
import { Link, usePathname } from "../i18n/navigation";
import { useTranslations, useLocale } from "next-intl";
import LanguageSwitcher from "./LanguageSwitcher";
import { cn } from "@/lib/utils";
import { signOut } from "@/actions/auth";
import {
  LayoutDashboard,
  Building2,
  CalendarCheck,
  ClipboardCheck,
  Menu,
  X,
  LogOut,
} from "lucide-react";

const navItems = [
  { href: "/dashboard", labelKey: "dashboard", icon: LayoutDashboard },
  { href: "/properties", labelKey: "accommodationUnits", icon: Building2 },
  { href: "/reservations", labelKey: "reservations", icon: CalendarCheck },
  { href: "/checkin", labelKey: "checkin", icon: ClipboardCheck },
];

const AdminSidebar = () => {
  const t = useTranslations();
  const locale = useLocale();
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);

  const isActive = (href: string) =>
    pathname === href || pathname.startsWith(href + "/");

  const sidebar = (
    <>
      {/* Logo */}
      <div className="px-4 py-6 border-b border-sidebar-border">
        <Link href="/dashboard" className="flex items-center gap-2.5" replace>
          <div className="h-8 w-8 rounded-lg bg-primary flex items-center justify-center">
            <span className="text-sm font-bold text-primary-foreground">D</span>
          </div>
          <span className="text-base font-semibold text-foreground tracking-tight">
            DeeCheckIn
          </span>
        </Link>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-3 py-4 space-y-1">
        {navItems.map((item) => {
          const Icon = item.icon;
          const active = isActive(item.href);
          return (
            <Link
              key={item.href}
              href={item.href}
              replace
              onClick={() => setMobileOpen(false)}
              className={cn(
                "flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors",
                active
                  ? "bg-primary text-primary-foreground"
                  : "text-sidebar-foreground hover:bg-accent hover:text-accent-foreground",
              )}
            >
              <Icon className="h-4 w-4 shrink-0" />
              {t(item.labelKey)}
            </Link>
          );
        })}
      </nav>

      {/* Bottom */}
      <div className="px-4 py-4 border-t border-sidebar-border space-y-3">
        <LanguageSwitcher />
        <button
          onClick={() => signOut(locale)}
          className="flex items-center gap-2 w-full rounded-md px-3 py-2 text-sm font-medium text-sidebar-foreground hover:bg-accent hover:text-accent-foreground transition-colors"
        >
          <LogOut className="h-4 w-4 shrink-0" />
          {t("auth.logout")}
        </button>
      </div>
    </>
  );

  return (
    <>
      {/* Mobile toggle */}
      <button
        onClick={() => setMobileOpen(true)}
        className="lg:hidden fixed top-4 left-4 z-50 p-2 rounded-md bg-card border border-border shadow-sm"
        aria-label="Open menu"
      >
        <Menu className="h-5 w-5 text-foreground" />
      </button>

      {/* Mobile overlay */}
      {mobileOpen && (
        <div
          className="lg:hidden fixed inset-0 z-40 bg-black/40 backdrop-blur-sm"
          role="presentation"
          onClick={() => setMobileOpen(false)}
          onKeyDown={(e) => {
            if (e.key === "Enter" || e.key === " ") setMobileOpen(false);
          }}
        />
      )}

      {/* Mobile sidebar */}
      <aside
        className={cn(
          "lg:hidden fixed inset-y-0 left-0 z-50 w-64 bg-sidebar border-r border-sidebar-border flex flex-col transition-transform duration-200",
          mobileOpen ? "translate-x-0" : "-translate-x-full",
        )}
      >
        <button
          onClick={() => setMobileOpen(false)}
          className="absolute top-4 right-4 p-1 rounded-md text-muted-foreground hover:text-foreground"
          aria-label="Close menu"
        >
          <X className="h-5 w-5" />
        </button>
        {sidebar}
      </aside>

      {/* Desktop sidebar */}
      <aside className="hidden lg:flex lg:w-64 lg:flex-col lg:fixed lg:inset-y-0 bg-sidebar border-r border-sidebar-border">
        {sidebar}
      </aside>
    </>
  );
};

export default AdminSidebar;
