import { z } from "zod";

/** Validation for AppointmentForm (loaded when the form is first used). */
export const schema = z.object({
  fullName: z.string().min(2, "Please enter your full name"),
  age: z.string().optional(),
  gender: z.string().optional(),
  phone: z.string().min(7, "Please enter a valid phone / WhatsApp number"),
  email: z.string().email("Please enter a valid email").optional().or(z.literal("")),
  city: z.string().min(2, "Please enter your city / area"),
  reason: z.string().min(5, "Please briefly describe the reason for consultation"),
  preferredDate: z.string().min(1, "Please select a preferred date"),
  preferredTime: z.string().min(1, "Please select a preferred time slot"),
  appointmentType: z.enum(["in-person", "online"]),
  consent: z.literal(true, {
    error: "Consent is required to submit this request",
  }),
});

export type FormValues = z.infer<typeof schema>;
