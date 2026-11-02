"use client";

import { useState } from "react";
import { Check, Copy, ExternalLink, Star } from "lucide-react";
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
  const [submittedReview, setSubmittedReview] = useState("");
  const [copied, setCopied] = useState(false);
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
      const reviewText =
        values.feedback.trim() || "Rated Physio Nexus Academy " + values.rating + "/5 stars.";
      setSubmittedReview(reviewText);
      setCopied(false);
      setSent(true);
      reset();
    } catch {
      setSubmitError("We couldn't send your feedback right now. Please try again.");
    }
  };

  const copySubmittedReview = async () => {
    if (!submittedReview) return;

    try {
      await navigator.clipboard.writeText(submittedReview);
    } catch {
      const textArea = document.createElement("textarea");
      textArea.value = submittedReview;
      textArea.setAttribute("readonly", "");
      textArea.style.position = "fixed";
      textArea.style.opacity = "0";
      document.body.appendChild(textArea);
      textArea.select();
      document.execCommand("copy");
      document.body.removeChild(textArea);
    }

    setCopied(true);
    window.setTimeout(() => setCopied(false), 2500);
  };

  if (sent) {
    return (
      <div
        className="rounded-2xl border border-teal-200 bg-gradient-to-br from-teal-50 to-white p-6 shadow-sm sm:p-8"
        role="status"
        aria-live="polite"
      >
        <div className="flex h-12 w-12 items-center justify-center rounded-full bg-teal-100">
          <Check className="h-6 w-6 text-teal-700" aria-hidden="true" />
        </div>

        <h2 className="mt-4 text-xl font-bold text-teal-900">Thank You for Your Feedback! ❤️</h2>
        <p className="mt-2 text-sm leading-6 text-teal-800">
          Your website review has been submitted successfully and sent to the PNA team for review.
        </p>

        <div className="mt-5 rounded-xl border border-grey-200 bg-white p-4">
          <p className="text-xs font-bold uppercase tracking-widest text-navy-400">Your review</p>
          <p className="mt-2 whitespace-pre-wrap text-sm leading-6 text-navy-700">{submittedReview}</p>
        </div>

        <div className="mt-6">
          <h3 className="font-semibold text-navy-800">Help others discover Physio Nexus Academy</h3>
          <p className="mt-1 text-sm leading-6 text-navy-500">
            You can also share the same experience on Google. This is completely optional and available for every
            rating.
          </p>
        </div>

        <div className="mt-5 flex flex-col gap-3 sm:flex-row sm:flex-wrap">
          <Button type="button" variant="outline" onClick={copySubmittedReview}>
            {copied ? <Check className="mr-2 h-4 w-4" /> : <Copy className="mr-2 h-4 w-4" />}
            {copied ? "Review Copied!" : "Copy My Review"}
          </Button>

          <a
            href={googleReviewUrl}
            target="_blank"
            rel="noopener noreferrer"
            className={
              "inline-flex items-center justify-center gap-2 rounded-md bg-navy-800 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-navy-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-teal-500 " +
              (copied ? "ring-4 ring-amber-200" : "")
            }
          >
            Share on Google ⭐ <ExternalLink className="h-4 w-4" aria-hidden="true" />
          </a>
        </div>

        {copied && (
          <p className="mt-3 text-sm font-medium text-teal-700">
            Review copied! You can now paste it on Google.
          </p>
        )}

        <div className="mt-6 border-t border-teal-100 pt-4">
          <button
            type="button"
            onClick={() => {
              setSent(false);
              setSubmittedReview("");
              setCopied(false);
            }}
            className="text-sm font-semibold text-navy-500 underline-offset-4 hover:text-navy-800 hover:underline"
          >
            Send another website review
          </button>
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
