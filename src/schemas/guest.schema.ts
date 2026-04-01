import { z } from "zod";

// ---------------------------------------------------------------------------
// Nationality helper — detect Czech citizens (document not required)
// ---------------------------------------------------------------------------

const CZECH_VALUES = new Set([
  "cz",
  "cze",
  "czech",
  "česká republika",
  "česko",
  "czech republic",
  "czechia",
  "ceska republika",
]);

export function isCzechNationality(value: string): boolean {
  return CZECH_VALUES.has(value.toLowerCase().trim());
}

// ---------------------------------------------------------------------------
// Single guest Zod schema
// ---------------------------------------------------------------------------

export const guestSchema = z
  .object({
    guest_index: z.number().int().min(0),
    first_name: z.string().min(2, "validation.required"),
    last_name: z.string().min(2, "validation.required"),
    birth_date: z
      .string()
      .regex(/^\d{4}-\d{2}-\d{2}$/, "validation.dateFormat"),
    nationality: z.string().min(1, "validation.required"),
    document_type: z
      .enum(["OP", "PAS", "OTHER", ""])
      .optional()
      .or(z.literal("")),
    document_number: z.string().optional().or(z.literal("")),
    issuing_country: z.string().optional().or(z.literal("")),
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
  })
  .superRefine((data, ctx) => {
    // Document fields are required for non-Czech nationals
    if (!isCzechNationality(data.nationality)) {
      if (!data.document_type) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "validation.required",
          path: ["document_type"],
        });
      }
      if (!data.document_number?.trim()) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "validation.required",
          path: ["document_number"],
        });
      }
      if (!data.issuing_country?.trim()) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "validation.required",
          path: ["issuing_country"],
        });
      }
    }
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
// Independent check-in form schema (dates + guests, no reservation)
// ---------------------------------------------------------------------------

export const independentCheckinFormSchema = z
  .object({
    check_in_date: z
      .string()
      .regex(/^\d{4}-\d{2}-\d{2}$/, "validation.dateFormat"),
    check_out_date: z
      .string()
      .regex(/^\d{4}-\d{2}-\d{2}$/, "validation.dateFormat"),
    guests: z.array(guestSchema).min(1, "validation.atLeastOneGuest"),
    consent: z.boolean().refine((val) => val === true, {
      message: "validation.consentRequired",
    }),
  })
  .refine(
    (data) => {
      if (data.check_in_date && data.check_out_date) {
        return data.check_out_date > data.check_in_date;
      }
      return true;
    },
    { message: "validation.checkOutAfterCheckIn", path: ["check_out_date"] },
  );

export const independentCheckinSubmissionSchema = z
  .object({
    property_id: z.string().uuid(),
    check_in_date: z
      .string()
      .regex(/^\d{4}-\d{2}-\d{2}$/, "validation.dateFormat"),
    check_out_date: z
      .string()
      .regex(/^\d{4}-\d{2}-\d{2}$/, "validation.dateFormat"),
    guests: z.array(guestSchema).min(1),
    consent: z.boolean().refine((val) => val === true, {
      message: "validation.consentRequired",
    }),
  })
  .refine(
    (data) => {
      if (data.check_in_date && data.check_out_date) {
        return data.check_out_date > data.check_in_date;
      }
      return true;
    },
    { message: "validation.checkOutAfterCheckIn", path: ["check_out_date"] },
  );

// ---------------------------------------------------------------------------
// Inferred types
// ---------------------------------------------------------------------------

export type GuestFormData = z.infer<typeof guestSchema>;
export type CheckinFormData = z.infer<typeof checkinFormSchema>;
export type CheckinSubmissionData = z.infer<typeof checkinSubmissionSchema>;
export type IndependentCheckinFormData = z.infer<
  typeof independentCheckinFormSchema
>;
export type IndependentCheckinSubmissionData = z.infer<
  typeof independentCheckinSubmissionSchema
>;
