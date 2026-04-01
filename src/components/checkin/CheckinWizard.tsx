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
import {
  getPropertyInstructionsAction,
  type PropertyInstructions,
} from "@/actions/instructions";
import { StepIndicator } from "./StepIndicator";
import { StepReservation } from "./StepReservation";
import { StepGuestDetails } from "./StepGuestDetails";
import { StepReview } from "./StepReview";
import { Button } from "@/components/ui/button";
import {
  ChevronLeft,
  ChevronRight,
  CheckCircle2,
  Loader2,
  MapPin,
  Key,
  Wifi,
  ScrollText,
  Phone,
  Mail,
  ShieldCheck,
  Copy,
  Check,
} from "lucide-react";
import type { CheckinReservation } from "./types";
import { createEmptyGuest } from "./types";
import { MAX_GUESTS } from "@/lib/constants";

interface CheckinWizardProps {
  readonly reservation: CheckinReservation;
}

export function CheckinWizard({ reservation }: CheckinWizardProps) {
  const t = useTranslations("CheckinForm");
  const [step, setStep] = useState(0);
  const [activeGuestTab, setActiveGuestTab] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [submitted, setSubmitted] = useState(false);
  const [instructions, setInstructions] = useState<PropertyInstructions | null>(
    null,
  );

  // Parse initial guest name from reservation
  const nameParts = reservation.guest_names?.split(" ") || [];
  const initialFirstName = nameParts[0] || "";
  const initialLastName = nameParts.slice(1).join(" ") || "";

  const form = useForm<CheckinFormData>({
    resolver: zodResolver(checkinFormSchema),
    defaultValues: {
      guests: [createEmptyGuest(0, initialFirstName, initialLastName)],
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
      if (!valid) {
        // scroll to first error
        const errorEl = document.querySelector("[data-error]");
        errorEl?.scrollIntoView({ behavior: "smooth", block: "center" });
        return;
      }
    }
    setStep((s) => Math.min(s + 1, 2));
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, [step, form]);

  const goBack = useCallback(() => {
    setStep((s) => Math.max(s - 1, 0));
    window.scrollTo({ top: 0, behavior: "smooth" });
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
      // Fetch property instructions after successful check-in
      if (reservation.book_number) {
        const instrResult = await getPropertyInstructionsAction(
          String(reservation.book_number),
        );
        if (instrResult.success) {
          setInstructions(instrResult.data);
        }
      }
    } else {
      setSubmitError(result.error);
    }
    setIsSubmitting(false);
  };

  // -----------------------------------------------------------------------
  // Success screen with instructions
  // -----------------------------------------------------------------------
  if (submitted) {
    return (
      <SuccessScreen
        reservation={reservation}
        instructions={instructions}
        t={t}
      />
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white">
      {/* Header */}
      <header className="border-b bg-white/80 backdrop-blur-sm sticky top-0 z-10">
        <div className="max-w-2xl mx-auto px-4 py-4 flex items-center justify-center gap-2">
          <ShieldCheck className="h-5 w-5 text-primary" />
          <span className="text-base font-semibold text-foreground tracking-tight">
            DeeCheckIn
          </span>
        </div>
      </header>

      <div className="max-w-2xl mx-auto px-4 py-8">
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
            <div className="flex items-start gap-3 rounded-xl border border-destructive/20 bg-destructive/5 p-4 animate-slide-up">
              <p className="text-sm text-destructive">{submitError}</p>
            </div>
          )}

          {/* Navigation buttons */}
          <div className="flex justify-between pt-2 pb-8">
            {step > 0 ? (
              <Button
                type="button"
                variant="outline"
                onClick={goBack}
                className="h-11 px-5"
              >
                <ChevronLeft className="w-4 h-4 mr-1.5" />
                {t("button.back")}
              </Button>
            ) : (
              <div />
            )}

            {step < 2 ? (
              <Button type="button" onClick={goNext} className="h-11 px-6">
                {t("button.continue")}
                <ChevronRight className="w-4 h-4 ml-1.5" />
              </Button>
            ) : (
              <Button
                type="submit"
                disabled={isSubmitting}
                className="h-11 px-6"
              >
                {isSubmitting && (
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                )}
                {isSubmitting ? t("button.submitting") : t("button.submit")}
              </Button>
            )}
          </div>
        </form>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Success Screen — extracted for clarity
// ---------------------------------------------------------------------------

function CopyButton({ text }: Readonly<{ text: string }>) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    await navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <button
      type="button"
      onClick={handleCopy}
      className="ml-2 p-1 rounded hover:bg-muted transition-colors"
      title="Copy"
    >
      {copied ? (
        <Check className="h-3.5 w-3.5 text-green-500" />
      ) : (
        <Copy className="h-3.5 w-3.5 text-muted-foreground" />
      )}
    </button>
  );
}

function SuccessScreen({
  reservation,
  instructions,
  t,
}: Readonly<{
  reservation: CheckinReservation;
  instructions: PropertyInstructions | null;
  t: ReturnType<typeof useTranslations>;
}>) {
  const hasInstructions =
    instructions &&
    (instructions.checkin_instructions ||
      instructions.access_code ||
      instructions.wifi_name ||
      instructions.house_rules ||
      instructions.contact_phone ||
      instructions.contact_email);

  return (
    <div className="min-h-screen bg-gradient-to-b from-green-50 to-white">
      {/* Header */}
      <header className="border-b bg-white/80 backdrop-blur-sm">
        <div className="max-w-lg mx-auto px-4 py-4 flex items-center justify-center gap-2">
          <ShieldCheck className="h-5 w-5 text-primary" />
          <span className="text-base font-semibold text-foreground tracking-tight">
            DeeCheckIn
          </span>
        </div>
      </header>

      <div className="max-w-lg mx-auto px-4 pt-12 pb-16 space-y-8">
        {/* Success header */}
        <div className="text-center space-y-4">
          <div className="flex justify-center animate-check-bounce">
            <div className="w-20 h-20 rounded-full bg-green-100 flex items-center justify-center">
              <CheckCircle2 className="w-10 h-10 text-green-500" />
            </div>
          </div>
          <div
            className="space-y-2 animate-slide-up"
            style={{ animationDelay: "0.2s" }}
          >
            <h2 className="text-2xl font-bold text-foreground">
              {t("success.title")}
            </h2>
            <p className="text-muted-foreground text-sm max-w-sm mx-auto">
              {t("success.message", {
                reservationId: reservation.book_number ?? "",
              })}
            </p>
          </div>
        </div>

        {/* Instructions */}
        {hasInstructions && (
          <div
            className="space-y-4 animate-slide-up"
            style={{ animationDelay: "0.4s" }}
          >
            <h3 className="text-lg font-semibold text-center">
              {t("instructions.title")}
            </h3>

            <div className="rounded-2xl border bg-white shadow-sm divide-y">
              {instructions.address && (
                <div className="flex items-start gap-3.5 p-5">
                  <div className="w-9 h-9 rounded-lg bg-blue-50 flex items-center justify-center shrink-0">
                    <MapPin className="h-4.5 w-4.5 text-blue-600" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                      {t("instructions.address")}
                    </p>
                    <p className="text-sm text-foreground mt-0.5">
                      {instructions.address}
                    </p>
                  </div>
                </div>
              )}

              {instructions.access_code && (
                <div className="flex items-start gap-3.5 p-5">
                  <div className="w-9 h-9 rounded-lg bg-amber-50 flex items-center justify-center shrink-0">
                    <Key className="h-4.5 w-4.5 text-amber-600" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                      {t("instructions.accessCode")}
                    </p>
                    <div className="flex items-center mt-1">
                      <span className="text-base font-mono font-semibold bg-amber-50 px-3 py-1.5 rounded-lg text-amber-900 tracking-widest">
                        {instructions.access_code}
                      </span>
                      <CopyButton text={instructions.access_code} />
                    </div>
                  </div>
                </div>
              )}

              {(instructions.wifi_name || instructions.wifi_password) && (
                <div className="flex items-start gap-3.5 p-5">
                  <div className="w-9 h-9 rounded-lg bg-indigo-50 flex items-center justify-center shrink-0">
                    <Wifi className="h-4.5 w-4.5 text-indigo-600" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                      {t("instructions.wifi")}
                    </p>
                    <div className="mt-1 space-y-1">
                      {instructions.wifi_name && (
                        <p className="text-sm text-foreground">
                          <span className="text-muted-foreground">
                            {t("instructions.wifiNetwork")}:
                          </span>{" "}
                          <span className="font-medium">
                            {instructions.wifi_name}
                          </span>
                        </p>
                      )}
                      {instructions.wifi_password && (
                        <div className="flex items-center">
                          <p className="text-sm text-foreground">
                            <span className="text-muted-foreground">
                              {t("instructions.wifiPassword")}:
                            </span>{" "}
                            <span className="font-mono bg-muted px-2 py-0.5 rounded text-sm">
                              {instructions.wifi_password}
                            </span>
                          </p>
                          <CopyButton text={instructions.wifi_password} />
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )}

              {instructions.house_rules && (
                <div className="flex items-start gap-3.5 p-5">
                  <div className="w-9 h-9 rounded-lg bg-purple-50 flex items-center justify-center shrink-0">
                    <ScrollText className="h-4.5 w-4.5 text-purple-600" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                      {t("instructions.houseRules")}
                    </p>
                    <p className="text-sm text-foreground mt-1 whitespace-pre-line leading-relaxed">
                      {instructions.house_rules}
                    </p>
                  </div>
                </div>
              )}

              {instructions.checkin_instructions && (
                <div className="flex items-start gap-3.5 p-5">
                  <div className="w-9 h-9 rounded-lg bg-green-50 flex items-center justify-center shrink-0">
                    <MapPin className="h-4.5 w-4.5 text-green-600" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                      {t("instructions.checkinInfo")}
                    </p>
                    <p className="text-sm text-foreground mt-1 whitespace-pre-line leading-relaxed">
                      {instructions.checkin_instructions}
                    </p>
                  </div>
                </div>
              )}

              {(instructions.contact_phone || instructions.contact_email) && (
                <div className="flex items-start gap-3.5 p-5">
                  <div className="w-9 h-9 rounded-lg bg-slate-100 flex items-center justify-center shrink-0">
                    <Phone className="h-4.5 w-4.5 text-slate-600" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                      {t("instructions.contact")}
                    </p>
                    <div className="mt-1 space-y-1">
                      {instructions.contact_phone && (
                        <a
                          href={`tel:${instructions.contact_phone}`}
                          className="text-sm text-primary hover:underline flex items-center gap-1.5"
                        >
                          <Phone className="h-3.5 w-3.5" />
                          {instructions.contact_phone}
                        </a>
                      )}
                      {instructions.contact_email && (
                        <a
                          href={`mailto:${instructions.contact_email}`}
                          className="text-sm text-primary hover:underline flex items-center gap-1.5"
                        >
                          <Mail className="h-3.5 w-3.5" />
                          {instructions.contact_email}
                        </a>
                      )}
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Fallback when no instructions */}
        {!hasInstructions && (
          <div
            className="rounded-2xl border bg-white shadow-sm p-6 text-center animate-slide-up"
            style={{ animationDelay: "0.4s" }}
          >
            <p className="text-sm text-muted-foreground">
              {t("instructions.noInstructions")}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
