import type { UseFormReturn } from "react-hook-form";
import type { CheckinFormData } from "@/schemas/guest.schema";
import { isCzechNationality } from "@/schemas/guest.schema";
import {
  User,
  MapPin,
  Briefcase,
  Phone,
  Mail,
  FileText,
  Globe,
} from "lucide-react";
import type { CheckinReservation, TranslationFn } from "./types";

export function StepReview({
  form,
  reservation,
  t,
}: Readonly<{
  form: UseFormReturn<CheckinFormData>;
  reservation: CheckinReservation;
  t: TranslationFn;
}>) {
  const guests = form.watch("guests");
  const {
    register,
    formState: { errors },
  } = form;

  const docTypeLabel = (type: string) => {
    const map: Record<string, string> = {
      OP: t("field.documentType.op"),
      PAS: t("field.documentType.pas"),
      OTHER: t("field.documentType.jine"),
    };
    return map[type] || type;
  };

  const purposeLabel = (purpose: string) => {
    const map: Record<string, string> = {
      recreation: t("field.stayPurpose.rekreace"),
      business: t("field.stayPurpose.sluzebni"),
      other: t("field.stayPurpose.jine"),
    };
    return map[purpose] || purpose;
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-lg font-semibold">{t("reviewTitle")}</h2>
        <p className="text-sm text-muted-foreground mt-1">
          {t("reviewDescription")}
        </p>
      </div>

      {/* Reservation summary */}
      <div className="text-sm p-4 rounded-xl bg-primary/5 border border-primary/10">
        <span className="font-medium text-primary">
          {t("completingForReservation", {
            reservationId: reservation.book_number ?? "",
          })}
        </span>
      </div>

      {/* Guest summaries */}
      {guests.map((guest, i) => (
        <div
          key={`review-guest-${guest.guest_index}`}
          className="rounded-2xl border border-border bg-white shadow-sm overflow-hidden"
        >
          {/* Guest header */}
          <div className="px-5 py-3 bg-slate-50/50 border-b flex items-center gap-2">
            <User className="w-4 h-4 text-primary" />
            <h3 className="text-sm font-semibold">
              {t("guestLabel", { number: i + 1 })}
              {" — "}
              <span className="text-foreground">
                {guest.first_name} {guest.last_name}
              </span>
            </h3>
          </div>

          <div className="p-5 space-y-3">
            {/* Personal info row */}
            <div className="flex items-start gap-3 text-sm">
              <Globe className="h-4 w-4 text-muted-foreground mt-0.5 shrink-0" />
              <div>
                <p className="text-foreground">
                  {guest.birth_date} · {guest.nationality}
                </p>
              </div>
            </div>

            {/* Document info */}
            {!isCzechNationality(guest.nationality) && guest.document_type && (
              <div className="flex items-start gap-3 text-sm">
                <FileText className="h-4 w-4 text-muted-foreground mt-0.5 shrink-0" />
                <div>
                  <p className="text-foreground">
                    {docTypeLabel(guest.document_type)}: {guest.document_number}
                  </p>
                  {guest.issuing_country && (
                    <p className="text-muted-foreground text-xs">
                      {t("field.issuingCountry.label")}: {guest.issuing_country}
                    </p>
                  )}
                </div>
              </div>
            )}

            {/* Address */}
            <div className="flex items-start gap-3 text-sm">
              <MapPin className="h-4 w-4 text-muted-foreground mt-0.5 shrink-0" />
              <p className="text-foreground">
                {guest.address_street}, {guest.address_city} {guest.address_zip}
                , {guest.address_country}
              </p>
            </div>

            {/* Purpose */}
            <div className="flex items-start gap-3 text-sm">
              <Briefcase className="h-4 w-4 text-muted-foreground mt-0.5 shrink-0" />
              <p className="text-foreground">
                {purposeLabel(guest.stay_purpose)}
              </p>
            </div>

            {/* Contact */}
            {(guest.phone || guest.email) && (
              <div className="flex items-start gap-3 text-sm">
                {guest.phone ? (
                  <Phone className="h-4 w-4 text-muted-foreground mt-0.5 shrink-0" />
                ) : (
                  <Mail className="h-4 w-4 text-muted-foreground mt-0.5 shrink-0" />
                )}
                <div>
                  {guest.phone && (
                    <p className="text-foreground">{guest.phone}</p>
                  )}
                  {guest.email && (
                    <p className="text-foreground">{guest.email}</p>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      ))}

      {/* Consent */}
      <div className="rounded-2xl border border-border bg-white shadow-sm p-5">
        <label className="flex items-start gap-3 cursor-pointer group">
          <input
            type="checkbox"
            {...register("consent")}
            className="mt-1 h-5 w-5 rounded border-input text-primary focus:ring-primary accent-primary"
          />
          <div>
            <span className="text-sm font-medium group-hover:text-primary transition-colors">
              {t("field.consent.label")}
            </span>
            <p className="text-xs text-muted-foreground mt-1 leading-relaxed">
              {t("field.consent.text")}
            </p>
          </div>
        </label>
        {errors.consent?.message && (
          <p className="mt-3 text-sm text-destructive flex items-center gap-1.5">
            <span className="inline-block w-1.5 h-1.5 rounded-full bg-destructive shrink-0" />
            {t(errors.consent.message)}
          </p>
        )}
      </div>
    </div>
  );
}
