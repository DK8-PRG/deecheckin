"use client";

import React, { useState, useCallback } from "react";
import { useForm, useFieldArray, type SubmitHandler } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useTranslations } from "next-intl";
import {
  checkinFormSchema,
  type CheckinFormData,
} from "@/schemas/guest.schema";
import { checkinAction } from "@/actions/checkin";
import { StepIndicator } from "./StepIndicator";
import { StepReservation } from "./StepReservation";
import { StepGuestDetails } from "./StepGuestDetails";
import { StepReview } from "./StepReview";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight, CheckCircle2, Loader2 } from "lucide-react";
import type { Reservation } from "./types";

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
        {step === 0 && (
          <StepReservation
            reservation={reservation}
            guestCount={fields.length}
            onAddGuest={addGuest}
            onRemoveGuest={removeGuest}
            t={t}
          />
        )}

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

        {step === 2 && (
          <StepReview form={form} reservation={reservation} t={t} />
        )}

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
