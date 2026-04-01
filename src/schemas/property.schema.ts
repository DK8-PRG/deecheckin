import { z } from "zod";

// ---------------------------------------------------------------------------
// Property Zod Schemas
// ---------------------------------------------------------------------------

export const createPropertySchema = z.object({
  name: z.string().min(1, "Název je povinný").max(200),
  address: z.string().max(500).optional(),
});

export const updatePropertySchema = createPropertySchema.partial();

/** Schema for property settings (instructions, WiFi, iCal URLs, etc.) */
export const propertySettingsSchema = z.object({
  checkin_instructions: z.string().max(5000).optional().or(z.literal("")),
  access_code: z.string().max(200).optional().or(z.literal("")),
  wifi_name: z.string().max(200).optional().or(z.literal("")),
  wifi_password: z.string().max(200).optional().or(z.literal("")),
  house_rules: z.string().max(5000).optional().or(z.literal("")),
  contact_phone: z.string().max(50).optional().or(z.literal("")),
  contact_email: z.string().email().optional().or(z.literal("")),
  ical_booking_url: z
    .string()
    .url()
    .refine((v) => v.startsWith("https://"), "URL musí začínat https://")
    .optional()
    .or(z.literal("")),
  ical_airbnb_url: z
    .string()
    .url()
    .refine((v) => v.startsWith("https://"), "URL musí začínat https://")
    .optional()
    .or(z.literal("")),
  slug: z
    .string()
    .max(100)
    .regex(
      /^[a-z0-9-]*$/,
      "Slug může obsahovat jen malá písmena, čísla a pomlčky",
    )
    .optional()
    .or(z.literal("")),
  description: z.string().max(5000).optional().or(z.literal("")),
  public_page_enabled: z.boolean().optional(),
});

// ---------------------------------------------------------------------------
// Inferred TypeScript types from Zod
// ---------------------------------------------------------------------------

export type CreatePropertyInput = z.infer<typeof createPropertySchema>;
export type UpdatePropertyInput = z.infer<typeof updatePropertySchema>;
export type PropertySettingsInput = z.infer<typeof propertySettingsSchema>;
