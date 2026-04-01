import type { UseFormReturn } from "react-hook-form";
import type { GuestFormData } from "@/schemas/guest.schema";
import { isCzechNationality } from "@/schemas/guest.schema";
import { User, Plus, Trash2, AlertTriangle, UserCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { MAX_GUESTS } from "@/lib/constants";
import { FormField } from "./FormField";
import type { TranslationFn } from "./types";

/** Any form that contains a `guests` array + `consent` boolean */
interface GuestFormBase {
  guests: GuestFormData[];
  consent: boolean;
}

export function StepGuestDetails<T extends GuestFormBase>({
  form,
  fields,
  activeTab,
  onTabChange,
  onAddGuest,
  onRemoveGuest,
  t,
}: Readonly<{
  form: UseFormReturn<T>;
  fields: { id: string }[];
  activeTab: number;
  onTabChange: (i: number) => void;
  onAddGuest: () => void;
  onRemoveGuest: (i: number) => void;
  t: TranslationFn;
}>) {
  // Cast to the base form to simplify field access — the shapes are identical
  const baseForm = form as unknown as UseFormReturn<GuestFormBase>;
  const {
    register,
    watch,
    formState: { errors },
  } = baseForm;

  return (
    <div className="space-y-5">
      {/* Guest tabs */}
      {fields.length > 1 && (
        <div className="flex gap-2 overflow-x-auto pb-1 -mx-1 px-1 scrollbar-none">
          {fields.map((field, i) => (
            <button
              key={field.id}
              type="button"
              onClick={() => onTabChange(i)}
              className={`
                flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-sm font-medium whitespace-nowrap
                transition-all duration-200 border
                ${
                  activeTab === i
                    ? "bg-primary text-primary-foreground border-primary shadow-sm shadow-primary/20"
                    : "bg-white text-muted-foreground border-border hover:border-primary/30 hover:text-foreground"
                }
              `}
            >
              <User className="w-3.5 h-3.5" />
              {t("guestLabel", { number: i + 1 })}
              {errors.guests?.[i] && (
                <span className="w-2 h-2 rounded-full bg-destructive animate-pulse" />
              )}
            </button>
          ))}
          {fields.length < MAX_GUESTS && (
            <button
              type="button"
              onClick={onAddGuest}
              className="flex items-center gap-1 px-3 py-2.5 rounded-xl text-sm text-muted-foreground border border-dashed border-border hover:border-primary/30 hover:text-foreground transition-colors"
            >
              <Plus className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      )}

      {/* Active guest form */}
      {fields.map((field, index) => {
        const nationality = watch(`guests.${index}.nationality`);
        const isCZ = nationality ? isCzechNationality(nationality) : true;

        return (
          <div key={field.id} className={index === activeTab ? "" : "hidden"}>
            <div className="space-y-5">
              {/* Header with remove option */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <UserCircle className="w-5 h-5 text-primary" />
                  <h2 className="text-lg font-semibold">
                    {t("guestLabel", { number: index + 1 })}
                    {index === 0 && (
                      <span className="ml-2 text-xs font-normal text-muted-foreground">
                        ({t("primaryGuest")})
                      </span>
                    )}
                  </h2>
                </div>
                {fields.length > 1 && (
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => onRemoveGuest(index)}
                    className="text-muted-foreground hover:text-destructive hover:bg-destructive/10"
                  >
                    <Trash2 className="w-4 h-4 mr-1" />
                    {t("removeGuest")}
                  </Button>
                )}
              </div>

              {/* Personal Information */}
              <fieldset className="rounded-2xl border border-border bg-white shadow-sm p-5 space-y-4">
                <legend className="text-sm font-semibold px-2 text-foreground">
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
                      max={new Date().toISOString().split("T")[0]}
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
                      placeholder={t("field.nationality.placeholder")}
                    />
                  </FormField>
                </div>
              </fieldset>

              {/* Identity Document — shown only for non-Czech nationals */}
              {!isCZ && (
                <fieldset
                  className="rounded-2xl border border-amber-200 bg-amber-50/30 dark:border-amber-800 dark:bg-amber-950/20 p-5 space-y-4"
                  data-error={
                    errors.guests?.[index]?.document_type ? "" : undefined
                  }
                >
                  <legend className="text-sm font-semibold px-2 flex items-center gap-1.5 text-amber-700 dark:text-amber-400">
                    <AlertTriangle className="w-3.5 h-3.5" />
                    {t("section.identityDocument")}
                  </legend>
                  <p className="text-xs text-amber-600 dark:text-amber-400 bg-amber-100/60 dark:bg-amber-900/30 rounded-lg px-3 py-2">
                    {t("foreignerDocumentNotice")}
                  </p>
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
                        <option value="">
                          {t("field.documentType.select")}
                        </option>
                        <option value="OP">{t("field.documentType.op")}</option>
                        <option value="PAS">
                          {t("field.documentType.pas")}
                        </option>
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
                    <FormField
                      label={t("field.issuingCountry.label")}
                      error={errors.guests?.[index]?.issuing_country?.message}
                      t={t}
                    >
                      <input
                        {...register(`guests.${index}.issuing_country`)}
                        className="input w-full"
                        placeholder={t("field.issuingCountry.placeholder")}
                      />
                    </FormField>
                  </div>
                </fieldset>
              )}

              {/* Address */}
              <fieldset className="rounded-2xl border border-border bg-white shadow-sm p-5 space-y-4">
                <legend className="text-sm font-semibold px-2 text-foreground">
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
              <fieldset className="rounded-2xl border border-border bg-white shadow-sm p-5 space-y-4">
                <legend className="text-sm font-semibold px-2 text-foreground">
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
                      <option value="other">
                        {t("field.stayPurpose.jine")}
                      </option>
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
        );
      })}
    </div>
  );
}
