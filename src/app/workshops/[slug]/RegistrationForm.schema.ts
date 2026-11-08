import { z } from "zod";

/** Validation for RegistrationForm (loaded when the form is first used). */
export const schema = z.object({
  fullName: z.string().min(2, "Please enter your full name"),
  email: z.string().email("Please enter a valid email"),
  phone: z.string().min(7, "Please enter a valid phone number"),
  professionalStatus: z.enum(["Student", "Graduate", "Physiotherapist", "Other"]),
  institute: z.string().optional(),
  city: z.string().min(2, "Please enter your city"),
  groupRegistration: z.boolean().optional(),
  consent: z.literal(true, {
    error: "Consent is required to register",
  }),
});

export type FormValues = z.infer<typeof schema>;
