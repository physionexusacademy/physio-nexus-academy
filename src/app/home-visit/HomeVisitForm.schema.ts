import { z } from "zod";

/** Validation for HomeVisitForm (loaded when the form is first used). */
export const schema = z.object({
  fullName: z.string().min(2, "Please enter your full name"),
  phone: z.string().min(7, "Please enter a valid phone / WhatsApp number"),
  email: z.string().email("Please enter a valid email address").optional().or(z.literal("")),
  city: z.string().min(2, "Please enter your city"),
  area: z.string().min(2, "Please enter your area / neighborhood"),
  address: z.string().min(5, "Please enter the full visit address"),
  preferredDate: z.string().min(1, "Please select a preferred date"),
  preferredTime: z.string().min(1, "Please select a preferred time"),
  mobilitySummary: z.string().min(3, "Please briefly describe the condition"),
  accessibilityNotes: z.string().optional(),
  specialInstructions: z.string().optional(),
  consent: z.literal(true, {
    error: "Consent is required to submit this request",
  }),
});

export type FormValues = z.infer<typeof schema>;
