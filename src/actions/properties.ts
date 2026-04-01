"use server";

import { revalidatePath } from "next/cache";
import {
  createPropertySchema,
  updatePropertySchema,
  propertySettingsSchema,
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
    revalidatePath("/[locale]/admin/properties", "page");
    revalidatePath("/[locale]/admin/dashboard", "page");
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
    revalidatePath("/[locale]/admin/properties", "page");
    revalidatePath("/[locale]/admin/dashboard", "page");
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
    revalidatePath("/[locale]/admin/properties", "page");
    revalidatePath("/[locale]/admin/dashboard", "page");
    return { success: true, data: undefined };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "Neočekávaná chyba",
    };
  }
}

export async function updatePropertySettingsAction(
  id: string,
  input: unknown,
): Promise<ActionResult<Property>> {
  if (!id || typeof id !== "string") {
    return { success: false, error: "Chybí ID jednotky" };
  }

  const parsed = propertySettingsSchema.safeParse(input);
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
    const property = await propertiesService.updateSettings(id, parsed.data);
    revalidatePath("/[locale]/admin/properties", "page");
    return { success: true, data: property };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "Neočekávaná chyba",
    };
  }
}
