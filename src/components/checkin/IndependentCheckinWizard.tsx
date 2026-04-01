"use client";

import React, { useState, useCallback } from "react";
import { useForm, useFieldArray, type SubmitHandler } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useTranslations } from "next-intl";
import {
  independentCheckinFormSchema,
  type IndependentCheckinFormData,
} from "@/schemas/guest.schema";
import { independentCheckinAction } from "@/actions/checkin";
import { StepIndicator } from "./StepIndicator";
import { StepGuestDetails } from "./StepGuestDetails";
import { Button } from "@/components/ui/button";
import {
  ChevronLeft,
  ChevronRight,
  CheckCircle2,
  Loader2,
  Calendar,
  Users,
  AlertTriangle,
} from "lucide-react";
import { Link } from "@/i18n/navigation";
import { createEmptyGuest } from "./types";
import { MAX_GUESTS } from "@/lib/constants";

interface IndependentCheckinWizardProps {
  readonly propertyId: string;
  readonly propertyName: string;
  readonly slug: string;
}

export function IndependentCheckinWizard({
  propertyId,
  propertyName,
  slug,
}: IndependentCheckinWizardProps) {
  const t = useTranslations("IndependentCheckin");
  const [step, setStep] = useState(0);
  const [activeGuestTab, setActiveGuestTab] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [submitted, setSubmitted] = useState(false);

  const form = useForm<IndependentCheckinFormData>({
    resolver: zodResolver(independentCheckinFormSchema),
    defaultValues: {
      check_in_date: "",
      check_out_date: "",
      guests: [createEmptyGuest(0)],
      consent: false,
    },
    mode: "onTouched",
  });

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: "guests",
  });

  const stepLabels = [
    t("step.stayInfo"),
    t("step.guestData"),
    t("step.review"),
  ];

  // -----------------------------------------------------------------------
  // Navigation
  // -----------------------------------------------------------------------
  const goNext = useCallback(async () => {
    if (step === 0) {
      const valid = await form.trigger(["check_in_date", "check_out_date"]);
      if (!valid) return;
      // Also check date order
      const cin = form.getValues("check_in_date");
      const cout = form.getValues("check_out_date");
      if (cin && cout && cout <= cin) {
        form.setError("check_out_date", {
          message: "validation.checkOutAfterCheckIn",
        });
        return;
      }
    }
    if (step === 1) {
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
      append(createEmptyGuest(fields.length));
      setActiveGuestTab(fields.length);
    }
  }, [fields.length, append]);

  const removeGuest = useCallback(
    (index: number) => {
      if (fields.length > 1) {
        remove(index);
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
  const onSubmit: SubmitHandler<IndependentCheckinFormData> = async (data) => {
    setIsSubmitting(true);
    setSubmitError(null);

    const result = await independentCheckinAction({
      property_id: propertyId,
      check_in_date: data.check_in_date,
      check_out_date: data.check_out_date,
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
      <div className="max-w-lg mx-auto mt-8 space-y-6">
        <div className="p-6 text-center space-y-3">
          <div className="flex justify-center">
            <CheckCircle2 className="w-16 h-16 text-green-500" />
          </div>
          <h2 className="text-2xl font-bold">{t("success.title")}</h2>
          <p className="text-muted-foreground">{t("success.message")}</p>
        </div>
        <div className="text-center">
          <Link
            href={`/${slug}`}
            className="inline-flex items-center gap-2 text-sm text-primary hover:underline"
          >
            <ChevronLeft className="w-4 h-4" />
            {t("success.backToProperty")}
          </Link>
        </div>
      </div>
    );
  }

  // -----------------------------------------------------------------------
  // Step 0 — Stay dates + guest count
  // -----------------------------------------------------------------------
  const renderStayInfo = () => {
    const {
      register,
      formState: { errors },
    } = form;

    return (
      <div className="space-y-6">
        {/* Dates */}
        <fieldset className="rounded-lg border border-border p-4 space-y-4">
          <legend className="text-sm font-medium px-1 flex items-center gap-1.5">
            <Calendar className="w-4 h-4 text-muted-foreground" />
            {t("stayDates")}
          </legend>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-foreground mb-1">
                {t("checkInDate")}
              </label>
              <input
                type="date"
                {...register("check_in_date")}
                className="input w-full"
              />
              {errors.check_in_date && (
                <p className="mt-1 text-xs text-destructive">
                  {t(errors.check_in_date.message as string)}
                </p>
              )}
            </div>
            <div>
              <label className="block text-sm font-medium text-foreground mb-1">
                {t("checkOutDate")}
              </label>
              <input
                type="date"
                {...register("check_out_date")}
                className="input w-full"
              />
              {errors.check_out_date && (
                <p className="mt-1 text-xs text-destructive">
                  {t(errors.check_out_date.message as string)}
                </p>
              )}
            </div>
          </div>
        </fieldset>

        {/* Guest count */}
        <fieldset className="rounded-lg border border-border p-4 space-y-4">
          <legend className="text-sm font-medium px-1 flex items-center gap-1.5">
            <Users className="w-4 h-4 text-muted-foreground" />
            {t("guestCount")}
          </legend>
          <p className="text-sm text-muted-foreground">{t("guestCountHint")}</p>
          <div className="flex items-center gap-3">
            <span className="text-sm font-medium">{fields.length}</span>
            <div className="flex gap-2">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => {
                  if (fields.length > 1) removeGuest(fields.length - 1);
                }}
                disabled={fields.length <= 1}
              >
                −
              </Button>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={addGuest}
                disabled={fields.length >= MAX_GUESTS}
              >
                +
              </Button>
            </div>
          </div>
        </fieldset>
      </div>
    );
  };

  // -----------------------------------------------------------------------
  // Step 2 — Review
  // -----------------------------------------------------------------------
  const renderReview = () => {
    const values = form.getValues();

    return (
      <div className="space-y-6">
        <div>
          <h3 className="text-lg font-semibold">{t("reviewTitle")}</h3>
          <p className="text-sm text-muted-foreground mt-1">
            {t("reviewDescription")}
          </p>
        </div>

        {/* Stay dates summary */}
        <div className="rounded-lg border bg-card p-4 space-y-2">
          <p className="text-sm font-medium">{t("reviewDates")}</p>
          <p className="text-sm text-muted-foreground">
            {values.check_in_date} → {values.check_out_date}
          </p>
          <p className="text-sm text-muted-foreground">
            {t("reviewGuests", { count: values.guests.length })}
          </p>
        </div>

        {/* Guests summary */}
        {values.guests.map((guest, i) => (
          <div key={i} className="rounded-lg border bg-card p-4 space-y-1">
            <p className="text-sm font-medium">
              {t("guestLabel", { number: i + 1 })}
              {i === 0 && (
                <span className="ml-2 text-xs text-muted-foreground">
                  ({t("primaryGuest")})
                </span>
              )}
            </p>
            <p className="text-sm text-muted-foreground">
              {guest.first_name} {guest.last_name}
            </p>
            <p className="text-sm text-muted-foreground">
              {guest.birth_date} · {guest.nationality}
            </p>
            <p className="text-sm text-muted-foreground">
              {guest.address_street}, {guest.address_city} {guest.address_zip},{" "}
              {guest.address_country}
            </p>
          </div>
        ))}

        {/* GDPR consent */}
        <div className="rounded-lg border border-amber-200 bg-amber-50/50 p-4 space-y-3">
          <div className="flex items-start gap-2">
            <AlertTriangle className="w-4 h-4 text-amber-600 mt-0.5 shrink-0" />
            <div>
              <p className="text-sm font-medium">
                {t("dataCollectionNotice.title")}
              </p>
              <p className="text-xs text-muted-foreground mt-1">
                {t("dataCollectionNotice.text")}
              </p>
            </div>
          </div>
          <label className="flex items-start gap-2 cursor-pointer">
            <input
              type="checkbox"
              {...form.register("consent")}
              className="mt-1"
            />
            <span className="text-sm">{t("field.consent.text")}</span>
          </label>
          {form.formState.errors.consent && (
            <p className="text-xs text-destructive">
              {t(form.formState.errors.consent.message as string)}
            </p>
          )}
        </div>
      </div>
    );
  };

  return (
    <div className="max-w-2xl mx-auto px-4 py-6">
      <div className="text-center mb-8">
        <h1 className="text-2xl font-bold text-slate-900">{t("pageTitle")}</h1>
        <p className="text-sm text-muted-foreground mt-1">{propertyName}</p>
        <p className="text-sm text-muted-foreground mt-1">
          {t("pageSubtitle")}
        </p>
      </div>

      <StepIndicator steps={stepLabels} currentStep={step} />

      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        {step === 0 && renderStayInfo()}

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

        {step === 2 && renderReview()}

        {submitError && (
          <p className="text-sm text-destructive text-center p-3 rounded-md bg-destructive/10">
            {submitError}
          </p>
        )}

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
