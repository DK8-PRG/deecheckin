"use server";

import { createBookingSchema } from "@/schemas/booking.schema";
import { revalidatePath } from "next/cache";
// ---------------------------------------------------------------------------
// Public booking action (for guest-side booking)
// ---------------------------------------------------------------------------
/**
 * Vytvoří veřejnou rezervaci (bez přihlášení, pouze základní údaje)
 */
export async function createPublicBookingAction(input: unknown) {
  const parsed = createBookingSchema.safeParse(input);
  if (!parsed.success) {
    return {
      success: false,
      error: "Neplatný vstup",
      fieldErrors: parsed.error.flatten().fieldErrors as Record<
        string,
        string[]
      >,
    };
  }
  // TODO: call service for public booking (with overlap check)
  // const result = await reservationsService.createPublic(parsed.data);
  // return result;
  return { success: false, error: "Not implemented" };
}

import {
  createReservationSchema,
  updateReservationSchema,
} from "@/schemas/reservation.schema";
import * as reservationsService from "@/services/reservations.service";
import * as reservationsRepo from "@/repositories/reservations.repository";
import type { Reservation } from "@/types/reservation";
import type { ActionResult } from "@/types/action";

// ---------------------------------------------------------------------------
// Server Actions — entry point for all reservation mutations & queries
// ---------------------------------------------------------------------------

export async function findReservationByBookNumberAction(
  bookNumber: string,
): Promise<ActionResult<Reservation>> {
  if (!bookNumber || typeof bookNumber !== "string") {
    return { success: false, error: "Chybí číslo rezervace" };
  }

  try {
    const reservation = await reservationsRepo.findByBookNumber(bookNumber);
    if (!reservation) {
      return { success: false, error: "Rezervace nenalezena" };
    }
    return { success: true, data: reservation };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "Neočekávaná chyba",
    };
  }
}

// ---------------------------------------------------------------------------
// Server Actions — entry point for all reservation mutations
// ---------------------------------------------------------------------------

export async function createReservationAction(
  input: unknown,
): Promise<ActionResult<Reservation>> {
  const parsed = createReservationSchema.safeParse(input);
  if (!parsed.success) {
    return {
      success: false,
      error: "Neplatný vstup",
      fieldErrors: parsed.error.flatten().fieldErrors as Record<
        string,
        string[]
      >,
    };
  }

  try {
    const { reservation, overlaps } = await reservationsService.create(
      parsed.data,
    );
    revalidatePath("/[locale]/admin/reservations", "page");
    const warnings =
      overlaps.length > 0
        ? [`Překryv s ${overlaps.length} existující(mi) rezervací(mi)`]
        : undefined;
    return { success: true, data: reservation, warnings };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "Neočekávaná chyba",
    };
  }
}

export async function updateReservationAction(
  id: string,
  input: unknown,
): Promise<ActionResult<Reservation>> {
  if (!id || typeof id !== "string") {
    return { success: false, error: "Chybí ID rezervace" };
  }

  const parsed = updateReservationSchema.safeParse(input);
  if (!parsed.success) {
    return {
      success: false,
      error: "Neplatný vstup",
      fieldErrors: parsed.error.flatten().fieldErrors as Record<
        string,
        string[]
      >,
    };
  }

  try {
    const { reservation, overlaps } = await reservationsService.update(
      id,
      parsed.data,
    );
    revalidatePath("/[locale]/admin/reservations", "page");
    const warnings =
      overlaps.length > 0
        ? [`Překryv s ${overlaps.length} existující(mi) rezervací(mi)`]
        : undefined;
    return { success: true, data: reservation, warnings };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "Neočekávaná chyba",
    };
  }
}

export async function quickUpdateGuestNameAction(
  id: string,
  guestNames: string,
): Promise<ActionResult<Reservation>> {
  if (!id || typeof id !== "string") {
    return { success: false, error: "Chybí ID rezervace" };
  }
  const trimmed = guestNames.trim();
  if (!trimmed || trimmed.length > 300) {
    return { success: false, error: "Neplatné jméno hosta" };
  }

  try {
    const reservation = await reservationsService.update(id, {
      guest_names: trimmed,
    });
    revalidatePath("/[locale]/admin/reservations", "page");
    return { success: true, data: reservation.reservation };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "Neočekávaná chyba",
    };
  }
}

export async function deleteReservationAction(
  id: string,
): Promise<ActionResult> {
  if (!id || typeof id !== "string") {
    return { success: false, error: "Chybí ID rezervace" };
  }

  try {
    await reservationsService.remove(id);
    revalidatePath("/[locale]/admin/reservations", "page");
    return { success: true, data: undefined };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "Neočekávaná chyba",
    };
  }
}
