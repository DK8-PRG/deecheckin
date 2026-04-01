"use client";

import React, { useState } from "react";
import { useTranslations } from "next-intl";
import type { Property } from "@/types/property";
import { PropertyHero } from "./PropertyHero";
import { QuickActions } from "./QuickActions";
import { AvailabilityCalendar } from "./AvailabilityCalendar";
import { BookingForm } from "./BookingForm";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { GuestCheckinSection } from "./GuestCheckinSection";
import { GuestInfoSection } from "./GuestInfoSection";
import { ContactSection } from "./ContactSection";
import LanguageSwitcher from "@/components/LanguageSwitcher";

interface GuestLandingProps {
  property: Property;
  occupiedDates: { check_in: string; check_out: string }[];
}

export function GuestLanding({
  property,
  occupiedDates,
}: Readonly<GuestLandingProps>) {
  const t = useTranslations("guestLanding");
  const [unlockedBookNumber, setUnlockedBookNumber] = useState<string | null>(
    null,
  );
  const [bookingOpen, setBookingOpen] = useState(false);
  const [bookingSuccess, setBookingSuccess] = useState(false);

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white scroll-smooth">
      {/* Top bar with section nav */}
      <div className="sticky top-0 z-10 bg-white/80 backdrop-blur-sm border-b border-slate-200">
        <div className="max-w-4xl mx-auto px-4 py-2 flex items-center justify-between">
          <span className="text-sm font-medium text-slate-600">
            {property.name}
          </span>
          <div className="flex items-center gap-4">
            <nav className="hidden sm:flex items-center gap-1">
              {[
                { href: "#availability", label: t("availabilityTitle") },
                { href: "#checkin", label: t("checkinTitle") },
                { href: "#contact", label: t("contactTitle") },
              ].map((item) => (
                <a
                  key={item.href}
                  href={item.href}
                  className="px-2.5 py-1 text-xs font-medium text-slate-500 hover:text-slate-900 hover:bg-slate-100 rounded-md transition-colors"
                >
                  {item.label}
                </a>
              ))}
            </nav>
            <LanguageSwitcher />
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 py-8 space-y-12">
        <div className="animate-fade-in-up">
          <PropertyHero property={property} />
        </div>

        <div className="animate-fade-in-up" style={{ animationDelay: "100ms" }}>
          <QuickActions slug={property.slug!} />
        </div>

        {/* Availability Calendar */}
        <section
          id="availability"
          className="scroll-mt-16 animate-fade-in-up"
          style={{ animationDelay: "200ms" }}
        >
          <h2 className="text-xl font-semibold text-slate-900 mb-4">
            {t("availabilityTitle")}
          </h2>
          <AvailabilityCalendar occupiedDates={occupiedDates} />
          <div className="mt-6 flex justify-end">
            <button
              className="px-6 py-2 rounded-lg bg-blue-600 text-white font-semibold shadow hover:bg-blue-700 transition-colors"
              onClick={() => setBookingOpen(true)}
            >
              {t("bookNow", { defaultValue: "Rezervovat" })}
            </button>
          </div>
          <Dialog open={bookingOpen} onOpenChange={setBookingOpen}>
            <DialogContent className="max-w-md">
              <DialogHeader>
                <DialogTitle>
                  {t("bookNow", { defaultValue: "Rezervovat" })}
                </DialogTitle>
              </DialogHeader>
              <BookingForm
                propertyId={property.id}
                onSuccess={() => {
                  setBookingOpen(false);
                  setBookingSuccess(true);
                }}
                onCancel={() => setBookingOpen(false)}
              />
            </DialogContent>
          </Dialog>
          <Dialog open={bookingSuccess} onOpenChange={setBookingSuccess}>
            <DialogContent className="max-w-md text-center">
              <div className="py-8">
                <div className="text-2xl mb-2">🎉</div>
                <div className="font-semibold mb-2">{t("bookingSuccess")}</div>
                <button
                  className="mt-4 px-4 py-2 rounded bg-blue-600 text-white font-medium"
                  onClick={() => setBookingSuccess(false)}
                >
                  OK
                </button>
              </div>
            </DialogContent>
          </Dialog>
        </section>

        {/* Check-in */}
        <section id="checkin" className="scroll-mt-16">
          <h2 className="text-xl font-semibold text-slate-900 mb-4">
            {t("checkinTitle")}
          </h2>
          <GuestCheckinSection onVerified={setUnlockedBookNumber} />
        </section>

        {/* Guest Info (instructions — unlocked after check-in verification) */}
        <section id="info" className="scroll-mt-16">
          <h2 className="text-xl font-semibold text-slate-900 mb-4">
            {t("infoTitle")}
          </h2>
          <GuestInfoSection
            property={property}
            unlocked={!!unlockedBookNumber}
          />
        </section>

        {/* Contact */}
        {(property.contact_phone || property.contact_email) && (
          <section id="contact" className="scroll-mt-16">
            <h2 className="text-xl font-semibold text-slate-900 mb-4">
              {t("contactTitle")}
            </h2>
            <ContactSection property={property} />
          </section>
        )}

        {/* Footer */}
        <footer className="pt-8 border-t border-slate-200 text-center text-sm text-slate-400">
          © {new Date().getFullYear()} · {t("poweredBy")}
        </footer>
      </div>

      {/* Mobile floating CTA */}
      {!unlockedBookNumber && (
        <div className="fixed bottom-0 left-0 right-0 sm:hidden z-10 p-3 bg-gradient-to-t from-white via-white to-white/0">
          <a
            href="#checkin"
            className="flex items-center justify-center gap-2 w-full py-3 px-4 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-semibold shadow-lg shadow-blue-500/25 active:scale-[0.98] transition-transform"
          >
            {t("actionCheckin")}
          </a>
        </div>
      )}
    </div>
  );
}
