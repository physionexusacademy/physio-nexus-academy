"use client";

import { useState } from "react";
import { Star } from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/Button";
import { submitReview } from "./actions";

const schema = z.object({
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

type FormValues = z.infer<typeof schema>;

export function ReviewForm({ googleReviewUrl }: { googleReviewUrl: string }) {
  const [sent, setSent] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      name: "",
      email: "",
      rating: 0,
      feedback: "",
      website: "",
    },
  });

  const rating = watch("rating");

  const onSubmit = async (values: FormValues) => {
    setSubmitError(null);

    try {
      await submitReview(values);
      setSent(true);
      reset();
    } catch {
      setSubmitError("We couldn't send your feedback right now. Please try again.");
    }
  };

  if (sent) {
    return (
      <div
        className="rounded-2xl border border-teal-200 bg-teal-50 p-6 sm:p-8"
        role="status"
        aria-live="polite"
      >
        <h2 className="text-xl font-bold text-teal-900">Thank you for your feedback</h2>
        <p className="mt-2 text-sm leading-6 text-teal-800">
          Your website review has been received by the PNA team and queued for admin review.
        </p>
        <p className="mt-3 text-sm leading-6 text-teal-800">
          A Google review is submitted separately. If you want your rating to affect our Google Business Profile,
          use the button below.
        </p>
        <div className="mt-5 flex flex-wrap gap-3">
          <a
            href={googleReviewUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center justify-center rounded-md bg-navy-800 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-navy-700"
          >
            Leave a Google Review
          </a>
          <Button variant="outline" onClick={() => setSent(false)}>
            Send another review
          </Button>
        </div>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-5" noValidate>
      <div>
        <label htmlFor="review-name" className="label">
          Your name
        </label>
        <input
          id="review-name"
          {...register("name")}
          autoComplete="name"
          className="input"
          placeholder="Your name"
        />
        {errors.name && <p className="mt-1 text-sm text-red-600">{errors.name.message}</p>}
      </div>

      <div>
        <label htmlFor="review-email" className="label">
          Email <span className="font-normal text-navy-400">(optional)</span>
        </label>
        <input
          id="review-email"
          {...register("email")}
          type="email"
          autoComplete="email"
          className="input"
          placeholder="name@example.com"
        />
        <p className="mt-1 text-xs text-navy-400">
          Used only for acknowledgement/reply. It is not shown publicly.
        </p>
        {errors.email && <p className="mt-1 text-sm text-red-600">{errors.email.message}</p>}
      </div>

      <div>
        <span className="label">Your rating</span>
        <div className="mt-2 flex items-center gap-1" role="radiogroup" aria-label="Rating out of five stars">
          {[1, 2, 3, 4, 5].map((value) => {
            const selected = rating >= value;
            return (
              <button
                key={value}
                type="button"
                role="radio"
                aria-checked={rating === value}
                aria-label={`${value} star${value === 1 ? "" : "s"}`}
                onClick={() => setValue("rating", value, { shouldValidate: true })}
                className="rounded-md p-1.5 transition hover:scale-105 focus:outline-none focus-visible:ring-2 focus-visible:ring-teal-500"
              >
                <Star
                  className={`h-9 w-9 ${selected ? "fill-amber-400 text-amber-400" : "text-grey-300"}`}
                />
              </button>
            );
          })}
        </div>
        {errors.rating && <p className="mt-1 text-sm text-red-600">{errors.rating.message}</p>}
      </div>

      <div>
        <label htmlFor="review-feedback" className="label">
          Feedback <span className="font-normal text-navy-400">(optional)</span>
        </label>
        <textarea
          id="review-feedback"
          {...register("feedback")}
          rows={5}
          className="input"
          placeholder="Tell us about your experience with PNA..."
        />
        {errors.feedback && <p className="mt-1 text-sm text-red-600">{errors.feedback.message}</p>}
      </div>

      <div className="absolute -left-[9999px] top-auto h-px w-px overflow-hidden" aria-hidden="true">
        <label htmlFor="review-website">Website</label>
        <input id="review-website" {...register("website")} tabIndex={-1} autoComplete="off" />
      </div>

      {submitError && (
        <p className="text-sm text-red-600" role="alert">
          {submitError}
        </p>
      )}

      <Button type="submit" disabled={isSubmitting} size="lg" className="w-full sm:w-auto">
        {isSubmitting ? "Sending..." : "Submit Website Rating"}
      </Button>

      <p className="text-xs leading-5 text-navy-400">
        Website ratings are reviewed before publication. Submitting here does not automatically create a Google
        review.
      </p>
    </form>
  );
}
