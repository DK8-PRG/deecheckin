"use client";

import React, { useState, useCallback } from "react";
import {
  useForm,
  useFieldArray,
  type SubmitHandler,
  type UseFormReturn,
} from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useTranslations } from "next-intl";
import {
  checkinFormSchema,
  type CheckinFormData,
} from "@/validators/guest.schema";
import { checkinAction } from "@/actions/checkin";
import { StepIndicator } from "./StepIndicator";
import { Button } from "@/components/ui/button";
import {
  ChevronLeft,
  ChevronRight,
  CheckCircle2,
  User,
  Plus,
  Trash2,
  Loader2,
} from "lucide-react";

interface Reservation {
  book_number: number | null;
  guest_names: string | null;
  check_in: string;
  check_out: string;
  rooms: number | null;
  people: number | null;
  adults: number | null;
  reservation_status: string | null;
  status: string;
}

interface CheckinWizardProps {
  readonly reservation: Reservation;
}

const MAX_GUESTS = 10;

const emptyGuest = (index: number, firstName = "", lastName = "") => ({
  guest_index: index,
  first_name: firstName,
  last_name: lastName,
  birth_date: "",
  nationality: "",
  document_type: "OP" as const,
  document_number: "",
  address_street: "",
  address_city: "",
  address_zip: "",
  address_country: "",
  stay_purpose: "recreation" as const,
  phone: "",
  email: "",
});

export function CheckinWizard({ reservation }: CheckinWizardProps) {
  const t = useTranslations("CheckinForm");
  const [step, setStep] = useState(0);
  const [activeGuestTab, setActiveGuestTab] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [submitted, setSubmitted] = useState(false);

  // Parse initial guest name from reservation
  const nameParts = reservation.guest_names?.split(" ") || [];
  const initialFirstName = nameParts[0] || "";
  const initialLastName = nameParts.slice(1).join(" ") || "";

  const form = useForm<CheckinFormData>({
    resolver: zodResolver(checkinFormSchema),
    defaultValues: {
      guests: [emptyGuest(0, initialFirstName, initialLastName)],
      consent: false,
    },
    mode: "onTouched",
  });

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: "guests",
  });

  const stepLabels = [
    t("step.reservation"),
    t("step.guestData"),
    t("step.review"),
  ];

  // -----------------------------------------------------------------------
  // Navigation
  // -----------------------------------------------------------------------
  const goNext = useCallback(async () => {
    if (step === 1) {
      // Validate all guest fields before proceeding to review
      const valid = await form.trigger("guests");
      if (!valid) return;
    }
    setStep((s) => Math.min(s + 1, 2));
  }, [step, form]);

  const goBack = useCallback(() => {
    setStep((s) => Math.max(s - 1, 0));
  }, []);

  // -----------------------------------------------------------------------
  // Guest management
  // -----------------------------------------------------------------------
  const addGuest = useCallback(() => {
    if (fields.length < MAX_GUESTS) {
      append(emptyGuest(fields.length));
      setActiveGuestTab(fields.length);
    }
  }, [fields.length, append]);

  const removeGuest = useCallback(
    (index: number) => {
      if (fields.length > 1) {
        remove(index);
        // Reindex remaining guests
        const current = form.getValues("guests");
        current.forEach((_, i) => {
          form.setValue(`guests.${i}.guest_index`, i);
        });
        setActiveGuestTab(Math.max(0, index - 1));
      }
    },
    [fields.length, remove, form],
  );

  // -----------------------------------------------------------------------
  // Submit
  // -----------------------------------------------------------------------
  const onSubmit: SubmitHandler<CheckinFormData> = async (data) => {
    setIsSubmitting(true);
    setSubmitError(null);

    const result = await checkinAction({
      book_number: String(reservation.book_number),
      guests: data.guests,
      consent: data.consent,
    });

    if (result.success) {
      setSubmitted(true);
    } else {
      setSubmitError(result.error);
    }
    setIsSubmitting(false);
  };

  // -----------------------------------------------------------------------
  // Success screen
  // -----------------------------------------------------------------------
  if (submitted) {
    return (
      <div className="max-w-lg mx-auto mt-12 p-8 text-center space-y-4">
        <div className="flex justify-center">
          <CheckCircle2 className="w-16 h-16 text-green-500" />
        </div>
        <h2 className="text-2xl font-bold">{t("success.title")}</h2>
        <p className="text-muted-foreground">
          {t("success.message", {
            reservationId: reservation.book_number ?? "",
          })}
        </p>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto px-4 py-6">
      <StepIndicator steps={stepLabels} currentStep={step} />

      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        {/* Step 0: Reservation Info */}
        {step === 0 && (
          <StepReservation
            reservation={reservation}
            guestCount={fields.length}
            onAddGuest={addGuest}
            onRemoveGuest={removeGuest}
            t={t}
          />
        )}

        {/* Step 1: Guest Details */}
        {step === 1 && (
          <StepGuestDetails
            form={form}
            fields={fields}
            activeTab={activeGuestTab}
            onTabChange={setActiveGuestTab}
            onAddGuest={addGuest}
            onRemoveGuest={removeGuest}
            t={t}
          />
        )}

        {/* Step 2: Review & Submit */}
        {step === 2 && (
          <StepReview form={form} reservation={reservation} t={t} />
        )}

        {/* Error display */}
        {submitError && (
          <p className="text-sm text-destructive text-center p-3 rounded-md bg-destructive/10">
            {submitError}
          </p>
        )}

        {/* Navigation */}
        <div className="flex justify-between pt-4">
          {step > 0 ? (
            <Button type="button" variant="outline" onClick={goBack}>
              <ChevronLeft className="w-4 h-4 mr-1" />
              {t("button.back")}
            </Button>
          ) : (
            <div />
          )}

          {step < 2 ? (
            <Button type="button" onClick={goNext}>
              {t("button.continue")}
              <ChevronRight className="w-4 h-4 ml-1" />
            </Button>
          ) : (
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting && (
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              )}
              {isSubmitting ? t("button.submitting") : t("button.submit")}
            </Button>
          )}
        </div>
      </form>
    </div>
  );
}

// ===========================================================================
// Step 0: Reservation Summary
// ===========================================================================

function StepReservation({
  reservation,
  guestCount,
  onAddGuest,
  onRemoveGuest,
  t,
}: Readonly<{
  reservation: Reservation;
  guestCount: number;
  onAddGuest: () => void;
  onRemoveGuest: (i: number) => void;
  t: ReturnType<typeof useTranslations>;
}>) {
  return (
    <div className="space-y-6">
      {/* Reservation details card */}
      <div className="rounded-lg border border-border bg-card p-5 space-y-3">
        <h2 className="text-lg font-semibold">{t("reservationSummary")}</h2>
        <div className="grid grid-cols-2 gap-x-4 gap-y-2 text-sm">
          <span className="text-muted-foreground">{t("field.bookNumber")}</span>
          <span className="font-medium">{reservation.book_number}</span>
          <span className="text-muted-foreground">{t("field.guestName")}</span>
          <span className="font-medium">{reservation.guest_names}</span>
          <span className="text-muted-foreground">{t("field.checkIn")}</span>
          <span className="font-medium">{reservation.check_in}</span>
          <span className="text-muted-foreground">{t("field.checkOut")}</span>
          <span className="font-medium">{reservation.check_out}</span>
          <span className="text-muted-foreground">{t("field.guests")}</span>
          <span className="font-medium">{reservation.people ?? "-"}</span>
        </div>
      </div>

      {/* Guest count selector */}
      <div className="rounded-lg border border-border bg-card p-5 space-y-3">
        <h2 className="text-lg font-semibold">{t("guestCount")}</h2>
        <p className="text-sm text-muted-foreground">{t("guestCountHint")}</p>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            {Array.from({ length: guestCount }).map((_, i) => (
              <div
                key={`guest-badge-${i}`}
                className="flex items-center gap-1 rounded-full bg-primary/10 px-3 py-1 text-sm"
              >
                <User className="w-3.5 h-3.5" />
                <span>{t("guestLabel", { number: i + 1 })}</span>
                {guestCount > 1 && (
                  <button
                    type="button"
                    onClick={() => onRemoveGuest(i)}
                    className="ml-1 text-muted-foreground hover:text-destructive"
                  >
                    <Trash2 className="w-3 h-3" />
                  </button>
                )}
              </div>
            ))}
          </div>
          {guestCount < MAX_GUESTS && (
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={onAddGuest}
            >
              <Plus className="w-4 h-4 mr-1" />
              {t("addGuest")}
            </Button>
          )}
        </div>
      </div>

      {/* Legal notice */}
      <div className="rounded-lg border border-blue-200 bg-blue-50 dark:bg-blue-950/30 dark:border-blue-800 p-4 space-y-2">
        <h3 className="text-sm font-semibold text-blue-800 dark:text-blue-300">
          {t("dataCollectionNotice.title")}
        </h3>
        <p className="text-xs text-blue-700 dark:text-blue-400">
          {t("dataCollectionNotice.text")}
        </p>
        <p className="text-xs text-muted-foreground">
          {t("dataCollectionNotice.legalBasis")}
        </p>
      </div>
    </div>
  );
}

// ===========================================================================
// Step 1: Guest Details Form (tabbed)
// ===========================================================================

function StepGuestDetails({
  form,
  fields,
  activeTab,
  onTabChange,
  onAddGuest,
  onRemoveGuest,
  t,
}: Readonly<{
  form: UseFormReturn<CheckinFormData>;
  fields: { id: string }[];
  activeTab: number;
  onTabChange: (i: number) => void;
  onAddGuest: () => void;
  onRemoveGuest: (i: number) => void;
  t: ReturnType<typeof useTranslations>;
}>) {
  const {
    register,
    formState: { errors },
  } = form;

  return (
    <div className="space-y-4">
      {/* Guest tabs */}
      {fields.length > 1 && (
        <div className="flex gap-2 overflow-x-auto pb-2">
          {fields.map((field, i) => (
            <button
              key={field.id}
              type="button"
              onClick={() => onTabChange(i)}
              className={`
                flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium whitespace-nowrap
                transition-colors
                ${
                  activeTab === i
                    ? "bg-primary text-primary-foreground"
                    : "bg-muted text-muted-foreground hover:bg-muted/80"
                }
              `}
            >
              <User className="w-3.5 h-3.5" />
              {t("guestLabel", { number: i + 1 })}
              {errors.guests?.[i] && (
                <span className="w-2 h-2 rounded-full bg-destructive" />
              )}
            </button>
          ))}
          {fields.length < MAX_GUESTS && (
            <button
              type="button"
              onClick={onAddGuest}
              className="flex items-center gap-1 px-3 py-2 rounded-lg text-sm text-muted-foreground hover:bg-muted"
            >
              <Plus className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      )}

      {/* Active guest form */}
      {fields.map((field, index) => (
        <div key={field.id} className={index === activeTab ? "" : "hidden"}>
          <div className="space-y-5">
            {/* Header with remove option */}
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold">
                {t("guestLabel", { number: index + 1 })}
                {index === 0 && (
                  <span className="ml-2 text-xs font-normal text-muted-foreground">
                    ({t("primaryGuest")})
                  </span>
                )}
              </h2>
              {fields.length > 1 && (
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => onRemoveGuest(index)}
                  className="text-destructive hover:text-destructive"
                >
                  <Trash2 className="w-4 h-4 mr-1" />
                  {t("removeGuest")}
                </Button>
              )}
            </div>

            {/* Personal Information */}
            <fieldset className="rounded-lg border border-border p-4 space-y-4">
              <legend className="text-sm font-medium px-1">
                {t("section.personalInfo")}
              </legend>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <FormField
                  label={t("field.firstName.label")}
                  error={errors.guests?.[index]?.first_name?.message}
                  t={t}
                >
                  <input
                    {...register(`guests.${index}.first_name`)}
                    className="input w-full"
                    autoComplete="given-name"
                  />
                </FormField>
                <FormField
                  label={t("field.lastName.label")}
                  error={errors.guests?.[index]?.last_name?.message}
                  t={t}
                >
                  <input
                    {...register(`guests.${index}.last_name`)}
                    className="input w-full"
                    autoComplete="family-name"
                  />
                </FormField>
                <FormField
                  label={t("field.birthDate.label")}
                  error={errors.guests?.[index]?.birth_date?.message}
                  t={t}
                >
                  <input
                    type="date"
                    {...register(`guests.${index}.birth_date`)}
                    className="input w-full"
                    autoComplete="bday"
                  />
                </FormField>
                <FormField
                  label={t("field.nationality.label")}
                  error={errors.guests?.[index]?.nationality?.message}
                  t={t}
                >
                  <input
                    {...register(`guests.${index}.nationality`)}
                    className="input w-full"
                    autoComplete="country-name"
                  />
                </FormField>
              </div>
            </fieldset>

            {/* Identity Document */}
            <fieldset className="rounded-lg border border-border p-4 space-y-4">
              <legend className="text-sm font-medium px-1">
                {t("section.identityDocument")}
              </legend>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <FormField
                  label={t("field.documentType.label")}
                  error={errors.guests?.[index]?.document_type?.message}
                  t={t}
                >
                  <select
                    {...register(`guests.${index}.document_type`)}
                    className="input w-full"
                  >
                    <option value="">{t("field.documentType.select")}</option>
                    <option value="OP">{t("field.documentType.op")}</option>
                    <option value="PAS">{t("field.documentType.pas")}</option>
                    <option value="OTHER">
                      {t("field.documentType.jine")}
                    </option>
                  </select>
                </FormField>
                <FormField
                  label={t("field.documentNumber.label")}
                  error={errors.guests?.[index]?.document_number?.message}
                  t={t}
                >
                  <input
                    {...register(`guests.${index}.document_number`)}
                    className="input w-full"
                  />
                </FormField>
              </div>
            </fieldset>

            {/* Address */}
            <fieldset className="rounded-lg border border-border p-4 space-y-4">
              <legend className="text-sm font-medium px-1">
                {t("section.address")}
              </legend>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <FormField
                  label={t("field.addressStreet.label")}
                  error={errors.guests?.[index]?.address_street?.message}
                  t={t}
                  className="sm:col-span-2"
                >
                  <input
                    {...register(`guests.${index}.address_street`)}
                    className="input w-full"
                    autoComplete="street-address"
                  />
                </FormField>
                <FormField
                  label={t("field.addressCity.label")}
                  error={errors.guests?.[index]?.address_city?.message}
                  t={t}
                >
                  <input
                    {...register(`guests.${index}.address_city`)}
                    className="input w-full"
                    autoComplete="address-level2"
                  />
                </FormField>
                <FormField
                  label={t("field.addressZip.label")}
                  error={errors.guests?.[index]?.address_zip?.message}
                  t={t}
                >
                  <input
                    {...register(`guests.${index}.address_zip`)}
                    className="input w-full"
                    autoComplete="postal-code"
                  />
                </FormField>
                <FormField
                  label={t("field.addressCountry.label")}
                  error={errors.guests?.[index]?.address_country?.message}
                  t={t}
                >
                  <input
                    {...register(`guests.${index}.address_country`)}
                    className="input w-full"
                    autoComplete="country-name"
                  />
                </FormField>
              </div>
            </fieldset>

            {/* Stay Details & Contact */}
            <fieldset className="rounded-lg border border-border p-4 space-y-4">
              <legend className="text-sm font-medium px-1">
                {t("section.stayDetails")}
              </legend>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <FormField
                  label={t("field.stayPurpose.label")}
                  error={errors.guests?.[index]?.stay_purpose?.message}
                  t={t}
                >
                  <select
                    {...register(`guests.${index}.stay_purpose`)}
                    className="input w-full"
                  >
                    <option value="">{t("field.stayPurpose.select")}</option>
                    <option value="recreation">
                      {t("field.stayPurpose.rekreace")}
                    </option>
                    <option value="business">
                      {t("field.stayPurpose.sluzebni")}
                    </option>
                    <option value="other">{t("field.stayPurpose.jine")}</option>
                  </select>
                </FormField>
                <FormField
                  label={t("field.phone.label")}
                  error={errors.guests?.[index]?.phone?.message}
                  t={t}
                >
                  <input
                    type="tel"
                    {...register(`guests.${index}.phone`)}
                    className="input w-full"
                    autoComplete="tel"
                  />
                </FormField>
                <FormField
                  label={t("field.email.label")}
                  error={errors.guests?.[index]?.email?.message}
                  t={t}
                  className="sm:col-span-2"
                >
                  <input
                    type="email"
                    {...register(`guests.${index}.email`)}
                    className="input w-full"
                    autoComplete="email"
                  />
                </FormField>
              </div>
            </fieldset>
          </div>
        </div>
      ))}
    </div>
  );
}

// ===========================================================================
// Step 2: Review & Submit
// ===========================================================================

function StepReview({
  form,
  reservation,
  t,
}: Readonly<{
  form: UseFormReturn<CheckinFormData>;
  reservation: Reservation;
  t: ReturnType<typeof useTranslations>;
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

// ===========================================================================
// Reusable FormField wrapper
// ===========================================================================

function FormField({
  label,
  error,
  t,
  className,
  children,
}: Readonly<{
  label: string;
  error?: string;
  t: ReturnType<typeof useTranslations>;
  className?: string;
  children: React.ReactNode;
}>) {
  return (
    <div className={className}>
      <label className="block text-sm font-medium text-foreground mb-1">
        {label}
      </label>
      {children}
      {error && <p className="mt-1 text-xs text-destructive">{t(error)}</p>}
    </div>
  );
}
