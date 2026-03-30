"use client";

import React from "react";
import AdminSidebar from "./AdminSidebar";

interface DashboardShellProps {
  children: React.ReactNode;
}

export function DashboardShell({ children }: DashboardShellProps) {
  return (
    <div className="min-h-screen bg-background">
      <AdminSidebar />
      <div className="lg:pl-64 flex flex-col min-h-screen">{children}</div>
    </div>
  );
}
