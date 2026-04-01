"use client";

import React from "react";
import { useTranslations } from "next-intl";
import type { Property } from "@/types/property";
import { Phone, Mail } from "lucide-react";

interface ContactSectionProps {
  property: Property;
}

export function ContactSection({ property }: Readonly<ContactSectionProps>) {
  const t = useTranslations("guestLanding");

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
      {property.contact_phone && (
        <a
          href={`tel:${property.contact_phone}`}
          className="flex items-center gap-3 bg-white rounded-lg border border-slate-200 p-4 hover:border-blue-300 hover:shadow-sm transition-all"
        >
          <div className="flex items-center justify-center w-10 h-10 rounded-full bg-blue-50 text-blue-600">
            <Phone className="h-5 w-5" />
          </div>
          <div>
            <p className="text-sm font-medium text-slate-700">
              {t("phoneLabel")}
            </p>
            <p className="text-sm text-blue-600">{property.contact_phone}</p>
          </div>
        </a>
      )}

      {property.contact_email && (
        <a
          href={`mailto:${property.contact_email}`}
          className="flex items-center gap-3 bg-white rounded-lg border border-slate-200 p-4 hover:border-blue-300 hover:shadow-sm transition-all"
        >
          <div className="flex items-center justify-center w-10 h-10 rounded-full bg-blue-50 text-blue-600">
            <Mail className="h-5 w-5" />
          </div>
          <div>
            <p className="text-sm font-medium text-slate-700">
              {t("emailLabel")}
            </p>
            <p className="text-sm text-blue-600">{property.contact_email}</p>
          </div>
        </a>
      )}
    </div>
  );
}
