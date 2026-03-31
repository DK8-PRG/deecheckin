import { z } from "zod";

// ---------------------------------------------------------------------------
// Property Zod Schemas
// ---------------------------------------------------------------------------

export const createPropertySchema = z.object({
  name: z.string().min(1, "Název je povinný").max(200),
  address: z.string().max(500).optional(),
});

export const updatePropertySchema = createPropertySchema.partial();

// ---------------------------------------------------------------------------
// Inferred TypeScript types from Zod
// ---------------------------------------------------------------------------

export type CreatePropertyInput = z.infer<typeof createPropertySchema>;
export type UpdatePropertyInput = z.infer<typeof updatePropertySchema>;
