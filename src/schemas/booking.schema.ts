import { z } from "zod";

// Schema for public booking (guest-side)
export const createBookingSchema = z.object({
  property_id: z.string().uuid("Neplatné ID ubytování"),
  check_in: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, "Datum musí být ve formátu YYYY-MM-DD"),
  check_out: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, "Datum musí být ve formátu YYYY-MM-DD"),
  guest_name: z.string().min(1, "Jméno je povinné").max(200),
  email: z.string().email("Neplatný e-mail"),
  phone: z.string().max(50).optional(),
});

export type CreateBookingInput = z.infer<typeof createBookingSchema>;
