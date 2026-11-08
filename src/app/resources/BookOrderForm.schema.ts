import { z } from "zod";

/** Validation for BookOrderForm (loaded when the form is first used). */
export const schema = z.object({
  bookId: z.string().min(1, "Please choose a book"),
  fullName: z.string().min(2, "Please enter your full name"),
  phone: z.string().min(7, "Please enter a valid phone / WhatsApp number"),
  email: z.string().email("Please enter a valid email").optional().or(z.literal("")),
  city: z.string().min(2, "Please enter your city"),
  deliveryAddress: z.string().min(10, "Please enter your complete delivery address"),
  quantity: z.number().int().min(1).max(5),
  customerNotes: z.string().max(500, "Please keep notes under 500 characters").optional(),
  consent: z.literal(true, { error: "Please confirm your order details" }),
});

export type FormValues = z.infer<typeof schema>;
