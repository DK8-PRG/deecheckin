"use server";

import * as guestsService from "@/services/guests.service";
import * as reservationsRepo from "@/repositories/reservations.repository";
import type { ActionResult } from "@/types/reservation";
import type { Guest } from "@/types/guest";

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
