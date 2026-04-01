"use server";

import { revalidatePath } from "next/cache";
import {
  checkinSubmissionSchema,
  independentCheckinSubmissionSchema,
} from "@/schemas/guest.schema";
import * as guestsService from "@/services/guests.service";
import type { ActionResult } from "@/types/reservation";
import type { Guest } from "@/types/guest";

// ---------------------------------------------------------------------------
// Server Action — public guest check-in (no auth required)
// ---------------------------------------------------------------------------

export async function checkinAction(
  input: unknown,
): Promise<ActionResult<Guest[]>> {
  const parsed = checkinSubmissionSchema.safeParse(input);
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
    const guests = await guestsService.performCheckin(parsed.data);
    revalidatePath("/[locale]/admin/reservations", "page");
    revalidatePath("/[locale]/admin/checkin", "page");
    return { success: true, data: guests };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "Neočekávaná chyba",
    };
  }
}

// ---------------------------------------------------------------------------
// Server Action — independent check-in (without reservation, public)
// ---------------------------------------------------------------------------

export async function independentCheckinAction(
  input: unknown,
): Promise<ActionResult<Guest[]>> {
  const parsed = independentCheckinSubmissionSchema.safeParse(input);
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
    const guests = await guestsService.performIndependentCheckin(parsed.data);
    revalidatePath("/[locale]/admin/reservations", "page");
    return { success: true, data: guests };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "Neočekávaná chyba",
    };
  }
}
