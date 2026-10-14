import { z } from "zod";

const optionalEmail = z
  .string()
  .trim()
  .max(254)
  .email("Invalid email")
  .optional()
  .or(z.literal(""));

const phone = z
  .string()
  .trim()
  .min(7)
  .max(30)
  .regex(/^[+()\d\s.-]+$/, "Invalid phone number");

const date = z
  .string()
  .regex(/^\d{4}-\d{2}-\d{2}$/, "Invalid date")
  .refine((value) => {
    const parsed = new Date(`${value}T00:00:00.000Z`);
    return !Number.isNaN(parsed.getTime()) && parsed.toISOString().slice(0, 10) === value;
  }, "Invalid date");

const consent = z.literal(true);

export const appointmentSubmissionSchema = z.object({
  fullName: z.string().trim().min(2).max(100),
  age: z.string().trim().max(3).optional().or(z.literal("")),
  gender: z.string().trim().max(40).optional().or(z.literal("")),
  phone,
  email: optionalEmail,
  city: z.string().trim().min(2).max(120),
  reason: z.string().trim().min(5).max(2_000),
  preferredDate: date,
  preferredTime: z.enum(["morning", "afternoon", "evening"]),
  appointmentType: z.enum(["in-person", "online"]),
  consent,
});

export const homeVisitSubmissionSchema = z.object({
  fullName: z.string().trim().min(2).max(100),
  phone,
  email: optionalEmail,
  city: z.string().trim().min(2).max(120),
  area: z.string().trim().min(2).max(160),
  address: z.string().trim().min(5).max(500),
  preferredDate: date,
  preferredTime: z.enum(["morning", "afternoon", "evening"]),
  mobilitySummary: z.string().trim().min(3).max(2_000),
  accessibilityNotes: z.string().trim().max(1_500).optional().or(z.literal("")),
  specialInstructions: z.string().trim().max(1_500).optional().or(z.literal("")),
  consent,
});
