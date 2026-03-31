import type { Property, PropertyInsert } from "@/types/property";
import type {
  CreatePropertyInput,
  UpdatePropertyInput,
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

export async function remove(id: string): Promise<void> {
  const existing = await propertiesRepo.findById(id);
  if (!existing) throw new Error("Ubytovací jednotka nenalezena");

  return propertiesRepo.remove(id);
}
