import type { UseFormReturn } from "react-hook-form";
import type { CheckinFormData } from "@/schemas/guest.schema";
import { User } from "lucide-react";
import type { Reservation, TranslationFn } from "./types";

export function StepReview({
  form,
  reservation,
  t,
}: Readonly<{
  form: UseFormReturn<CheckinFormData>;
  reservation: Reservation;
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
      <h2 className="text-lg font-semibold">{t("reviewTitle")}</h2>
      <p className="text-sm text-muted-foreground">{t("reviewDescription")}</p>

      {/* Reservation summary line */}
      <div className="text-sm p-3 rounded-lg bg-muted">
        <span className="font-medium">
          {t("completingForReservation", {
            reservationId: reservation.book_number ?? "",
          })}
        </span>
      </div>

      {/* Guest summaries */}
      {guests.map((guest, i) => (
        <div
          key={`review-guest-${guest.guest_index}`}
          className="rounded-lg border border-border p-4 space-y-3"
        >
          <h3 className="text-sm font-semibold flex items-center gap-2">
            <User className="w-4 h-4" />
            {t("guestLabel", { number: i + 1 })}
            {" — "}
            {guest.first_name} {guest.last_name}
          </h3>
          <div className="grid grid-cols-2 gap-x-4 gap-y-1.5 text-sm">
            <span className="text-muted-foreground">
              {t("field.birthDate.label")}
            </span>
            <span>{guest.birth_date}</span>
            <span className="text-muted-foreground">
              {t("field.nationality.label")}
            </span>
            <span>{guest.nationality}</span>
            <span className="text-muted-foreground">
              {t("field.documentType.label")}
            </span>
            <span>{docTypeLabel(guest.document_type)}</span>
            <span className="text-muted-foreground">
              {t("field.documentNumber.label")}
            </span>
            <span>{guest.document_number}</span>
            <span className="text-muted-foreground">
              {t("section.address")}
            </span>
            <span>
              {guest.address_street}, {guest.address_city}, {guest.address_zip},{" "}
              {guest.address_country}
            </span>
            <span className="text-muted-foreground">
              {t("field.stayPurpose.label")}
            </span>
            <span>{purposeLabel(guest.stay_purpose)}</span>
            {guest.phone && (
              <>
                <span className="text-muted-foreground">
                  {t("field.phone.label")}
                </span>
                <span>{guest.phone}</span>
              </>
            )}
            {guest.email && (
              <>
                <span className="text-muted-foreground">
                  {t("field.email.label")}
                </span>
                <span>{guest.email}</span>
              </>
            )}
          </div>
        </div>
      ))}

      {/* Consent */}
      <div className="rounded-lg border border-border p-4">
        <label className="flex items-start gap-3 cursor-pointer">
          <input
            type="checkbox"
            {...register("consent")}
            className="mt-0.5 h-4 w-4 rounded border-input text-primary focus:ring-primary"
          />
          <div>
            <span className="text-sm font-medium">
              {t("field.consent.label")}
            </span>
            <p className="text-xs text-muted-foreground mt-1">
              {t("field.consent.text")}
            </p>
          </div>
        </label>
        {errors.consent?.message && (
          <p className="mt-2 text-sm text-destructive">
            {t(errors.consent.message)}
          </p>
        )}
      </div>
    </div>
  );
}
