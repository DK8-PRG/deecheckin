"use server";

import { revalidatePath } from "next/cache";
import * as propertiesService from "@/services/properties.service";
import * as icalSyncService from "@/services/ical-sync.service";
import type { ActionResult } from "@/types/action";
import type { SyncResult } from "@/lib/ical/types";

// ---------------------------------------------------------------------------
// Server Actions for iCal sync
// ---------------------------------------------------------------------------

/** Sync a single property's iCal feeds. */
export async function syncPropertyAction(
  propertyId: string,
): Promise<ActionResult<SyncResult>> {
  if (!propertyId || typeof propertyId !== "string") {
    return { success: false, error: "Chybí ID jednotky" };
  }

  try {
    const property = await propertiesService.getById(propertyId);
    if (!property) {
      return { success: false, error: "Jednotka nenalezena" };
    }

    if (!property.ical_booking_url && !property.ical_airbnb_url) {
      return {
        success: false,
        error:
          "Žádná iCal URL není nastavena. Nastavte ji v nastavení jednotky.",
      };
    }

    const result = await icalSyncService.syncProperty(property);
    revalidatePath("/[locale]/admin/reservations", "page");
    revalidatePath("/[locale]/admin/dashboard", "page");
    return { success: true, data: result };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "Neočekávaná chyba",
    };
  }
}

/** Sync all properties for the current user (used by cron). */
export async function syncAllPropertiesAction(): Promise<
  ActionResult<SyncResult[]>
> {
  try {
    const properties = await propertiesService.list();
    const results: SyncResult[] = [];

    for (const property of properties) {
      if (property.ical_booking_url || property.ical_airbnb_url) {
        const result = await icalSyncService.syncProperty(property);
        results.push(result);
      }
    }

    revalidatePath("/[locale]/admin/reservations", "page");
    revalidatePath("/[locale]/admin/dashboard", "page");
    return { success: true, data: results };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "Neočekávaná chyba",
    };
  }
}
