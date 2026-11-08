import { z } from "zod";

/** Validation for ContactForm (loaded when the form is first used). */
export const schema = z.object({
  name: z.string().min(2, "Please enter your name"),
  email: z.string().email("Please enter a valid email"),
  message: z.string().min(10, "Please write a short message"),
});

export type FormValues = z.infer<typeof schema>;
