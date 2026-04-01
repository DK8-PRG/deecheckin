"use server";

import * as guestsService from "@/services/guests.service";
import * as reservationsRepo from "@/repositories/reservations.repository";
import type { ActionResult } from "@/types/action";
import type { Guest } from "@/types/guest";
import type { Reservation } from "@/types/reservation";
import type { CheckinGroup } from "@/services/guests.service";
import { revalidatePath } from "next/cache";

// ---------------------------------------------------------------------------
// Server Action — guest lookups (used by client components)
// ---------------------------------------------------------------------------

export async function getGuestsByBookNumberAction(
  bookNumber: string,
): Promise<ActionResult<Guest[]>> {
  if (!bookNumber) {
    return { success: false, error: "Chybí číslo rezervace" };
  }

  try {
    const reservation = await reservationsRepo.findByBookNumber(bookNumber);
    if (!reservation) {
      return { success: false, error: "Rezervace nenalezena" };
    }

    const guests = await guestsService.getGuestsByReservation(reservation.id);
    return { success: true, data: guests };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "Neočekávaná chyba",
    };
  }
}

// ---------------------------------------------------------------------------
// Admin — unpaired guest groups
// ---------------------------------------------------------------------------

export async function listUnpairedGroupsAction(): Promise<
  ActionResult<CheckinGroup[]>
> {
  try {
    const groups = await guestsService.listUnpairedGroups();
    return { success: true, data: groups };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "Neočekávaná chyba",
    };
  }
}

export async function findMatchingReservationsAction(
  propertyId: string,
  checkInDate: string,
  checkOutDate: string,
): Promise<ActionResult<Reservation[]>> {
  try {
    const reservations = await guestsService.findMatchingReservations(
      propertyId,
      checkInDate,
      checkOutDate,
    );
    return { success: true, data: reservations };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "Neočekávaná chyba",
    };
  }
}

export async function pairGroupAction(
  checkinGroupId: string,
  reservationId: string,
): Promise<ActionResult<null>> {
  try {
    await guestsService.pairGroupWithReservation(checkinGroupId, reservationId);
    revalidatePath("/admin/guests");
    return { success: true, data: null };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "Neočekávaná chyba",
    };
  }
}
