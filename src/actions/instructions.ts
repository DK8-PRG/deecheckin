"use server";

import * as reservationsRepo from "@/repositories/reservations.repository";
import * as propertiesRepo from "@/repositories/properties.repository";
import type { ActionResult } from "@/types/action";

// ---------------------------------------------------------------------------
// Types for the instructions page
// ---------------------------------------------------------------------------

export interface PropertyInstructions {
  property_name: string;
  address: string | null;
  checkin_instructions: string | null;
  access_code: string | null;
  wifi_name: string | null;
  wifi_password: string | null;
  house_rules: string | null;
  contact_phone: string | null;
  contact_email: string | null;
}

// ---------------------------------------------------------------------------
// Server Action — fetch property instructions by book number (public)
// ---------------------------------------------------------------------------

export async function getPropertyInstructionsAction(
  bookNumber: string,
): Promise<ActionResult<PropertyInstructions>> {
  if (!bookNumber) {
    return { success: false, error: "Chybí číslo rezervace" };
  }

  try {
    const reservation = await reservationsRepo.findByBookNumber(bookNumber);
    if (!reservation) {
      return { success: false, error: "Rezervace nenalezena" };
    }

    const property = await propertiesRepo.findByIdPublic(
      reservation.property_id,
    );
    if (!property) {
      return { success: false, error: "Jednotka nenalezena" };
    }

    return {
      success: true,
      data: {
        property_name: property.name,
        address: property.address,
        checkin_instructions: property.checkin_instructions,
        access_code: property.access_code,
        wifi_name: property.wifi_name,
        wifi_password: property.wifi_password,
        house_rules: property.house_rules,
        contact_phone: property.contact_phone,
        contact_email: property.contact_email,
      },
    };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "Neočekávaná chyba",
    };
  }
}
