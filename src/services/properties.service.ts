import type { Property, PropertyInsert } from "@/types/property";
import type {
  CreatePropertyInput,
  UpdatePropertyInput,
  PropertySettingsInput,
} from "@/schemas/property.schema";
import * as propertiesRepo from "@/repositories/properties.repository";

// ---------------------------------------------------------------------------
// Properties service — business logic
// ---------------------------------------------------------------------------

export async function list(): Promise<Property[]> {
  return propertiesRepo.findAll();
}

export async function getById(id: string): Promise<Property | null> {
  return propertiesRepo.findById(id);
}

export async function create(input: CreatePropertyInput): Promise<Property> {
  const insertData: PropertyInsert = {
    name: input.name,
    address: input.address,
  };
  return propertiesRepo.create(insertData);
}

export async function update(
  id: string,
  input: UpdatePropertyInput,
): Promise<Property> {
  const existing = await propertiesRepo.findById(id);
  if (!existing) throw new Error("Ubytovací jednotka nenalezena");

  return propertiesRepo.update(id, {
    name: input.name,
    address: input.address,
  });
}

export async function updateSettings(
  id: string,
  input: PropertySettingsInput,
): Promise<Property> {
  const existing = await propertiesRepo.findById(id);
  if (!existing) throw new Error("Ubytovací jednotka nenalezena");

  // Convert empty strings to null for DB storage (skip booleans)
  const settingsData: Record<string, string | boolean | null> = {};
  for (const [key, value] of Object.entries(input)) {
    if (typeof value === "boolean") {
      settingsData[key] = value;
    } else {
      settingsData[key] = value && value.trim() !== "" ? value.trim() : null;
    }
  }

  return propertiesRepo.update(id, settingsData);
}

export async function remove(id: string): Promise<void> {
  const existing = await propertiesRepo.findById(id);
  if (!existing) throw new Error("Ubytovací jednotka nenalezena");

  return propertiesRepo.remove(id);
}

export async function listPublic(): Promise<Property[]> {
  return propertiesRepo.findPublicProperties();
}

export async function getBySlug(slug: string): Promise<Property | null> {
  return propertiesRepo.findBySlug(slug);
}

export async function getOccupiedDates(
  propertyId: string,
  from: string,
  to: string,
): Promise<{ check_in: string; check_out: string }[]> {
  return propertiesRepo.findOccupiedDates(propertyId, from, to);
}
