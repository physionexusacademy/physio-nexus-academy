import { z } from "zod";

/** Validation for ReviewForm (loaded when the form is first used). */
export const schema = z.object({
  name: z.string().trim().min(2, "Please enter your name").max(80, "Name is too long"),
  email: z
    .string()
    .trim()
    .refine((value) => value === "" || z.string().email().safeParse(value).success, {
      message: "Please enter a valid email",
    }),
  rating: z.number().int().min(1, "Please select a star rating").max(5),
  feedback: z.string().trim().max(1500, "Please keep feedback under 1500 characters"),
  website: z.string().max(0).optional(),
});

export type FormValues = z.infer<typeof schema>;
