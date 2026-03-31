import { z } from "zod";

// ---------------------------------------------------------------------------
// Reservation Zod Schemas
// ---------------------------------------------------------------------------

/** Schema for creating a new reservation (admin manual entry). */
export const createReservationSchema = z.object({
  property_id: z.string().uuid("Neplatné ID ubytovací jednotky"),
  guest_names: z.string().min(1, "Jméno hosta je povinné").max(300),
  check_in: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, "Datum musí být ve formátu YYYY-MM-DD"),
  check_out: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, "Datum musí být ve formátu YYYY-MM-DD"),
  source: z.enum(["booking", "airbnb", "manual", "other"]).optional(),
  status: z
    .enum(["pending", "confirmed", "checked_in", "checked_out", "cancelled"])
    .optional(),
  rooms: z.coerce.number().int().min(1).optional(),
  adults: z.coerce.number().int().min(1).optional(),
  children: z.coerce.number().int().min(0).optional(),
  price: z.string().optional(),
  remarks: z.string().max(2000).optional(),
  phone_number: z.string().max(50).optional(),
  special_requests: z.string().max(2000).optional(),
});

/** Schema for updating an existing reservation (all fields optional). */
export const updateReservationSchema = createReservationSchema.partial();

// ---------------------------------------------------------------------------
// Inferred TypeScript types from Zod
// ---------------------------------------------------------------------------

export type CreateReservationInput = z.infer<typeof createReservationSchema>;
export type UpdateReservationInput = z.infer<typeof updateReservationSchema>;
