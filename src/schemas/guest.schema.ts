import { z } from "zod";

// ---------------------------------------------------------------------------
// Single guest Zod schema
// ---------------------------------------------------------------------------

export const guestSchema = z.object({
  guest_index: z.number().int().min(0),
  first_name: z.string().min(2, "validation.required"),
  last_name: z.string().min(2, "validation.required"),
  birth_date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "validation.dateFormat"),
  nationality: z.string().min(1, "validation.required"),
  document_type: z.enum(["OP", "PAS", "OTHER"], {
    errorMap: () => ({ message: "validation.required" }),
  }),
  document_number: z.string().min(1, "validation.required"),
  address_street: z.string().min(1, "validation.required"),
  address_city: z.string().min(1, "validation.required"),
  address_zip: z.string().min(1, "validation.required"),
  address_country: z.string().min(1, "validation.required"),
  stay_purpose: z.enum(["recreation", "business", "other"], {
    errorMap: () => ({ message: "validation.required" }),
  }),
  phone: z.string().optional().or(z.literal("")),
  email: z
    .string()
    .email("validation.invalidEmail")
    .optional()
    .or(z.literal("")),
});

// ---------------------------------------------------------------------------
// Full check-in form schema (multiple guests + consent)
// ---------------------------------------------------------------------------

export const checkinFormSchema = z.object({
  guests: z.array(guestSchema).min(1, "validation.atLeastOneGuest"),
  consent: z.boolean().refine((val) => val === true, {
    message: "validation.consentRequired",
  }),
});

// ---------------------------------------------------------------------------
// Server action submission schema (includes book_number)
// ---------------------------------------------------------------------------

export const checkinSubmissionSchema = z.object({
  book_number: z.string().min(1),
  guests: z.array(guestSchema).min(1),
  consent: z.boolean().refine((val) => val === true, {
    message: "validation.consentRequired",
  }),
});

// ---------------------------------------------------------------------------
// Inferred types
// ---------------------------------------------------------------------------

export type GuestFormData = z.infer<typeof guestSchema>;
export type CheckinFormData = z.infer<typeof checkinFormSchema>;
export type CheckinSubmissionData = z.infer<typeof checkinSubmissionSchema>;
