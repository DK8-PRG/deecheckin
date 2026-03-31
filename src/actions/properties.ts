"use server";

import { revalidatePath } from "next/cache";
import {
  createPropertySchema,
  updatePropertySchema,
} from "@/schemas/property.schema";
import * as propertiesService from "@/services/properties.service";
import type { ActionResult } from "@/types/reservation";
import type { Property } from "@/types/property";

// ---------------------------------------------------------------------------
// Server Actions — entry point for all property mutations
// ---------------------------------------------------------------------------

export async function createPropertyAction(
  input: unknown,
): Promise<ActionResult<Property>> {
  const parsed = createPropertySchema.safeParse(input);
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
    const property = await propertiesService.create(parsed.data);
    revalidatePath("/[locale]/properties", "page");
    revalidatePath("/[locale]/dashboard", "page");
    return { success: true, data: property };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "Neočekávaná chyba",
    };
  }
}

export async function updatePropertyAction(
  id: string,
  input: unknown,
): Promise<ActionResult<Property>> {
  if (!id || typeof id !== "string") {
    return { success: false, error: "Chybí ID jednotky" };
  }

  const parsed = updatePropertySchema.safeParse(input);
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
    const property = await propertiesService.update(id, parsed.data);
    revalidatePath("/[locale]/properties", "page");
    revalidatePath("/[locale]/dashboard", "page");
    return { success: true, data: property };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "Neočekávaná chyba",
    };
  }
}

export async function deletePropertyAction(id: string): Promise<ActionResult> {
  if (!id || typeof id !== "string") {
    return { success: false, error: "Chybí ID jednotky" };
  }

  try {
    await propertiesService.remove(id);
    revalidatePath("/[locale]/properties", "page");
    revalidatePath("/[locale]/dashboard", "page");
    return { success: true, data: undefined };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "Neočekávaná chyba",
    };
  }
}
