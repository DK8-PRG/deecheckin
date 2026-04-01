"use client";

import React, { useState, useTransition } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useTranslations } from "next-intl";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  createBookingSchema,
  type CreateBookingInput,
} from "@/schemas/booking.schema";

interface BookingFormProps {
  propertyId: string;
  defaultCheckIn?: string;
  defaultCheckOut?: string;
  onSuccess: () => void;
  onCancel: () => void;
}

export function BookingForm({
  propertyId,
  defaultCheckIn,
  defaultCheckOut,
  onSuccess,
  onCancel,
}: Readonly<BookingFormProps>) {
  const t = useTranslations("guestLanding");
  const [isPending, startTransition] = useTransition();
  const [serverError, setServerError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<CreateBookingInput>({
    resolver: zodResolver(createBookingSchema),
    defaultValues: {
      property_id: propertyId,
      check_in: defaultCheckIn ?? "",
      check_out: defaultCheckOut ?? "",
      guest_name: "",
      email: "",
      phone: "",
    },
  });

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const onSubmit = (data: CreateBookingInput) => {
    setServerError(null);
    startTransition(async () => {
      // TODO: call public booking action
      // const result = await createPublicBookingAction(data);
      // if (!result.success) {
      //   setServerError(result.error);
      //   return;
      // }
      onSuccess();
    });
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      {serverError && (
        <div className="rounded-md bg-destructive/10 p-3 text-sm text-destructive">
          {serverError}
        </div>
      )}
      <div className="space-y-2">
        <Label htmlFor="check_in">{t("checkIn")}</Label>
        <Input id="check_in" type="date" {...register("check_in")} />
        {errors.check_in && (
          <p className="text-sm text-destructive">{errors.check_in.message}</p>
        )}
      </div>
      <div className="space-y-2">
        <Label htmlFor="check_out">{t("checkOut")}</Label>
        <Input id="check_out" type="date" {...register("check_out")} />
        {errors.check_out && (
          <p className="text-sm text-destructive">{errors.check_out.message}</p>
        )}
      </div>
      <div className="space-y-2">
        <Label htmlFor="guest_name">{t("guestName")}</Label>
        <Input id="guest_name" {...register("guest_name")} />
        {errors.guest_name && (
          <p className="text-sm text-destructive">
            {errors.guest_name.message}
          </p>
        )}
      </div>
      <div className="space-y-2">
        <Label htmlFor="email">{t("emailLabel")}</Label>
        <Input id="email" type="email" {...register("email")} />
        {errors.email && (
          <p className="text-sm text-destructive">{errors.email.message}</p>
        )}
      </div>
      <div className="space-y-2">
        <Label htmlFor="phone">{t("phoneLabel")}</Label>
        <Input id="phone" type="tel" {...register("phone")} />
        {errors.phone && (
          <p className="text-sm text-destructive">{errors.phone.message}</p>
        )}
      </div>
      <div className="flex justify-end gap-2 pt-4">
        <Button type="button" variant="outline" onClick={onCancel}>
          {t("cancel")}
        </Button>
        <Button type="submit" disabled={isPending}>
          {isPending ? "..." : t("bookNow", { defaultValue: "Rezervovat" })}
        </Button>
      </div>
    </form>
  );
}
