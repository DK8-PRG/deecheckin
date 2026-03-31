"use client";

import React from "react";
import { useTranslations } from "next-intl";
import { Bell } from "lucide-react";

interface DashboardHeaderProps {
  title?: string;
  children?: React.ReactNode;
}

export function DashboardHeader({
  title,
  children,
}: Readonly<DashboardHeaderProps>) {
  const t = useTranslations();

  return (
    <header className="sticky top-0 z-30 flex h-14 items-center gap-4 border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 px-6">
      {/* Spacer for mobile hamburger */}
      <div className="lg:hidden w-10" />

      <h1 className="text-lg font-semibold text-foreground truncate">
        {title ?? t("dashboard")}
      </h1>

      <div className="ml-auto flex items-center gap-3">
        {children}
        <button className="relative p-2 rounded-md text-muted-foreground hover:text-foreground hover:bg-accent transition-colors">
          <Bell className="h-4 w-4" />
          <span className="absolute top-1.5 right-1.5 h-2 w-2 rounded-full bg-primary" />
        </button>
      </div>
    </header>
  );
}
