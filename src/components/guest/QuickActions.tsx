"use client";

import React from "react";
import { useTranslations } from "next-intl";
import { ClipboardCheck, Calendar, Phone } from "lucide-react";
import { Link } from "@/i18n/navigation";

interface QuickActionsProps {
  readonly slug: string;
}

export function QuickActions({ slug }: QuickActionsProps) {
  const t = useTranslations("guestLanding");

  return (
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
      {/* Check-in — link to dedicated page */}
      <Link
        href={`/${slug}/checkin`}
        className="group block rounded-xl border border-slate-200 bg-white p-5 shadow-sm hover:shadow-md hover:border-slate-300 hover:-translate-y-0.5 transition-all duration-200"
      >
        <div className="inline-flex items-center justify-center w-10 h-10 rounded-lg bg-gradient-to-br from-blue-500 to-blue-600 text-white mb-3">
          <ClipboardCheck className="h-5 w-5" />
        </div>
        <h3 className="font-semibold text-slate-900 group-hover:text-blue-600 transition-colors">
          {t("actionCheckin")}
        </h3>
        <p className="text-sm text-slate-500 mt-1">{t("actionCheckinDesc")}</p>
      </Link>

      {/* Availability — anchor */}
      <a
        href="#availability"
        className="group block rounded-xl border border-slate-200 bg-white p-5 shadow-sm hover:shadow-md hover:border-slate-300 hover:-translate-y-0.5 transition-all duration-200"
      >
        <div className="inline-flex items-center justify-center w-10 h-10 rounded-lg bg-gradient-to-br from-emerald-500 to-emerald-600 text-white mb-3">
          <Calendar className="h-5 w-5" />
        </div>
        <h3 className="font-semibold text-slate-900 group-hover:text-blue-600 transition-colors">
          {t("actionAvailability")}
        </h3>
        <p className="text-sm text-slate-500 mt-1">
          {t("actionAvailabilityDesc")}
        </p>
      </a>

      {/* Contact — anchor */}
      <a
        href="#contact"
        className="group block rounded-xl border border-slate-200 bg-white p-5 shadow-sm hover:shadow-md hover:border-slate-300 hover:-translate-y-0.5 transition-all duration-200"
      >
        <div className="inline-flex items-center justify-center w-10 h-10 rounded-lg bg-gradient-to-br from-amber-500 to-amber-600 text-white mb-3">
          <Phone className="h-5 w-5" />
        </div>
        <h3 className="font-semibold text-slate-900 group-hover:text-blue-600 transition-colors">
          {t("actionContact")}
        </h3>
        <p className="text-sm text-slate-500 mt-1">{t("actionContactDesc")}</p>
      </a>
    </div>
  );
}
