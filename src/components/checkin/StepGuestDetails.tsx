import type { UseFormReturn } from "react-hook-form";
import type { CheckinFormData } from "@/schemas/guest.schema";
import { User, Plus, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { MAX_GUESTS } from "@/lib/constants";
import { FormField } from "./FormField";
import type { TranslationFn } from "./types";

export function StepGuestDetails({
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
  t: TranslationFn;
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
