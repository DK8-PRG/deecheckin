"use server";

import { revalidatePath } from "next/cache";
import {
  createReservationSchema,
  updateReservationSchema,
} from "@/validators/reservation.schema";
import * as reservationsService from "@/services/reservations.service";
import * as reservationsRepo from "@/repositories/reservations.repository";
import type { ActionResult, Reservation } from "@/types/reservation";

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
    const reservation = await reservationsService.create(parsed.data);
    revalidatePath("/[locale]/reservations", "page");
    return { success: true, data: reservation };
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
    const reservation = await reservationsService.update(id, parsed.data);
    revalidatePath("/[locale]/reservations", "page");
    return { success: true, data: reservation };
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
    revalidatePath("/[locale]/reservations", "page");
    return { success: true, data: undefined };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "Neočekávaná chyba",
    };
  }
}
