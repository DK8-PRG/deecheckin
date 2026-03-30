"use client";

import React, { useState, useTransition } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useTranslations } from "next-intl";
import {
  createReservationSchema,
  type CreateReservationInput,
  type UpdateReservationInput,
} from "@/validators/reservation.schema";
import {
  createReservationAction,
  updateReservationAction,
} from "@/actions/reservations";
import type { Reservation, PropertyOption } from "@/types/reservation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface ReservationFormProps {
  properties: PropertyOption[];
  reservation?: Reservation | null;
  onSuccess: () => void;
  onCancel: () => void;
}

export function ReservationForm({
  properties,
  reservation,
  onSuccess,
  onCancel,
}: Readonly<ReservationFormProps>) {
  const t = useTranslations();
  const isEdit = !!reservation;
  const [isPending, startTransition] = useTransition();
  const [serverError, setServerError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<CreateReservationInput>({
    resolver: zodResolver(createReservationSchema),
    defaultValues: {
      property_id: reservation?.property_id ?? "",
      guest_names: reservation?.guest_names ?? "",
      check_in: reservation?.check_in ?? "",
      check_out: reservation?.check_out ?? "",
      source:
        (reservation?.source as CreateReservationInput["source"]) ?? "manual",
      status:
        (reservation?.status as CreateReservationInput["status"]) ?? "pending",
      rooms: reservation?.rooms ?? 1,
      adults: reservation?.adults ?? 1,
      children: reservation?.children ?? 0,
      price: reservation?.price ?? "",
      remarks: reservation?.remarks ?? "",
      phone_number: reservation?.phone_number ?? "",
      special_requests: reservation?.special_requests ?? "",
    },
  });

  const onSubmit = (data: CreateReservationInput) => {
    setServerError(null);

    startTransition(async () => {
      const result = isEdit
        ? await updateReservationAction(
            reservation!.id,
            data as UpdateReservationInput,
          )
        : await createReservationAction(data);

      if (!result.success) {
        setServerError(result.error);
        return;
      }

      onSuccess();
    });
  };

  const selectedPropertyId = watch("property_id");
  const selectedSource = watch("source");
  const selectedStatus = watch("status");

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      {serverError && (
        <div className="rounded-md bg-destructive/10 p-3 text-sm text-destructive">
          {serverError}
        </div>
      )}

      {/* Property */}
      <div className="space-y-2">
        <Label htmlFor="property_id">{t("accommodationUnit")} *</Label>
        <Select
          value={selectedPropertyId}
          onValueChange={(val) =>
            setValue("property_id", val, { shouldValidate: true })
          }
        >
          <SelectTrigger>
            <SelectValue placeholder={t("selectProperty")} />
          </SelectTrigger>
          <SelectContent>
            {properties.map((p) => (
              <SelectItem key={p.id} value={p.id}>
                {p.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        {errors.property_id && (
          <p className="text-sm text-destructive">
            {errors.property_id.message}
          </p>
        )}
      </div>

      {/* Guest name */}
      <div className="space-y-2">
        <Label htmlFor="guest_names">{t("guestName")} *</Label>
        <Input id="guest_names" {...register("guest_names")} />
        {errors.guest_names && (
          <p className="text-sm text-destructive">
            {errors.guest_names.message}
          </p>
        )}
      </div>

      {/* Dates row */}
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="check_in">{t("checkIn")} *</Label>
          <Input id="check_in" type="date" {...register("check_in")} />
          {errors.check_in && (
            <p className="text-sm text-destructive">
              {errors.check_in.message}
            </p>
          )}
        </div>
        <div className="space-y-2">
          <Label htmlFor="check_out">{t("checkOut")} *</Label>
          <Input id="check_out" type="date" {...register("check_out")} />
          {errors.check_out && (
            <p className="text-sm text-destructive">
              {errors.check_out.message}
            </p>
          )}
        </div>
      </div>

      {/* Source + Status row */}
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label>{t("source")}</Label>
          <Select
            value={selectedSource}
            onValueChange={(val) =>
              setValue("source", val as CreateReservationInput["source"], {
                shouldValidate: true,
              })
            }
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="manual">Manual</SelectItem>
              <SelectItem value="booking">Booking.com</SelectItem>
              <SelectItem value="airbnb">Airbnb</SelectItem>
              <SelectItem value="other">{t("other")}</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-2">
          <Label>{t("status")}</Label>
          <Select
            value={selectedStatus}
            onValueChange={(val) =>
              setValue("status", val as CreateReservationInput["status"], {
                shouldValidate: true,
              })
            }
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="pending">{t("pending")}</SelectItem>
              <SelectItem value="confirmed">{t("confirmed")}</SelectItem>
              <SelectItem value="checked_in">{t("checkedIn")}</SelectItem>
              <SelectItem value="checked_out">{t("checkedOut")}</SelectItem>
              <SelectItem value="cancelled">{t("cancelled")}</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Rooms + Adults + Children */}
      <div className="grid grid-cols-3 gap-4">
        <div className="space-y-2">
          <Label htmlFor="rooms">{t("rooms")}</Label>
          <Input id="rooms" type="number" min={1} {...register("rooms")} />
        </div>
        <div className="space-y-2">
          <Label htmlFor="adults">{t("adults")}</Label>
          <Input id="adults" type="number" min={1} {...register("adults")} />
        </div>
        <div className="space-y-2">
          <Label htmlFor="children">{t("children")}</Label>
          <Input
            id="children"
            type="number"
            min={0}
            {...register("children")}
          />
        </div>
      </div>

      {/* Price + Phone */}
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="price">{t("price")}</Label>
          <Input
            id="price"
            {...register("price")}
            placeholder="e.g. 1500 CZK"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="phone_number">{t("phone")}</Label>
          <Input id="phone_number" type="tel" {...register("phone_number")} />
        </div>
      </div>

      {/* Remarks */}
      <div className="space-y-2">
        <Label htmlFor="remarks">{t("remarks")}</Label>
        <textarea
          id="remarks"
          {...register("remarks")}
          rows={2}
          className="flex w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
        />
      </div>

      {/* Special requests */}
      <div className="space-y-2">
        <Label htmlFor="special_requests">{t("specialRequests")}</Label>
        <textarea
          id="special_requests"
          {...register("special_requests")}
          rows={2}
          className="flex w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
        />
      </div>

      {/* Actions */}
      <div className="flex justify-end gap-2 pt-4">
        <Button type="button" variant="outline" onClick={onCancel}>
          {t("cancel")}
        </Button>
        <Button type="submit" disabled={isPending}>
          {isPending ? "..." : isEdit ? t("save") : t("addReservation")}
        </Button>
      </div>
    </form>
  );
}
