"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/Button";
import { Field } from "@/components/ui/Field";
import { submitHomeVisit } from "./actions";

const schema = z.object({
  fullName: z.string().min(2, "Please enter your full name"),
  phone: z.string().min(7, "Please enter a valid phone / WhatsApp number"),
  email: z.string().email("Please enter a valid email address"),
  city: z.string().min(2, "Please enter your city"),
  area: z.string().min(2, "Please enter your area / neighborhood"),
  address: z.string().min(5, "Please enter the full visit address"),
  preferredDate: z.string().min(1, "Please select a preferred date"),
  preferredTime: z.string().min(1, "Please select a preferred time"),
  mobilitySummary: z.string().min(3, "Please briefly describe mobility / condition"),
  accessibilityNotes: z.string().optional(),
  specialInstructions: z.string().optional(),
  consent: z.literal(true, {
    errorMap: () => ({ message: "Consent is required to submit this request" }),
  }),
});

type FormValues = z.infer<typeof schema>;

export function HomeVisitForm() {
  const [status, setStatus] = useState<"idle" | "success" | "error">("idle");
  const [referenceId, setReferenceId] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset,
  } = useForm<FormValues>({ resolver: zodResolver(schema) });

  const onSubmit = async (values: FormValues) => {
    try {
      const ref = await submitHomeVisit(values);
      setReferenceId(ref);
      setStatus("success");
      reset();
    } catch {
      setStatus("error");
    }
  };

  if (status === "success") {
    return (
      <div className="rounded-xl border border-teal-200 bg-teal-50 p-6 text-center" role="status" aria-live="polite">
        <p className="font-heading text-lg font-semibold text-teal-800">Request received</p>
        <p className="mt-2 text-sm text-teal-700">
          Your reference ID is <span className="font-mono">{referenceId}</span>. Our team will
          contact you to confirm availability for your area.
        </p>
        <Button className="mt-4" onClick={() => setStatus("idle")}>
          Submit another request
        </Button>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-5" noValidate>
      <div className="grid gap-5 sm:grid-cols-2">
        <Field label="Full name" error={errors.fullName?.message}>
          <input {...register("fullName")} className="input" />
        </Field>
        <Field label="Phone / WhatsApp number" error={errors.phone?.message}>
          <input {...register("phone")} className="input" />
        </Field>
            <Field label="Email address" error={errors.email?.message}>
              <input {...register("email")} type="email" className="input" />
            </Field>
      </div>

      <div className="grid gap-5 sm:grid-cols-2">
        <Field label="City" error={errors.city?.message}>
          <input {...register("city")} className="input" />
        </Field>
        <Field label="Area / neighborhood" error={errors.area?.message}>
          <input {...register("area")} className="input" />
        </Field>
      </div>

      <Field label="Full visit address" error={errors.address?.message}>
        <textarea {...register("address")} rows={2} className="input" />
      </Field>

      <div className="grid gap-5 sm:grid-cols-2">
        <Field label="Preferred date" error={errors.preferredDate?.message}>
          <input {...register("preferredDate")} type="date" className="input" />
        </Field>
        <Field label="Preferred time" error={errors.preferredTime?.message}>
          <select {...register("preferredTime")} className="input">
            <option value="">Select a time slot</option>
            <option value="morning">Morning</option>
            <option value="afternoon">Afternoon</option>
            <option value="evening">Evening</option>
          </select>
        </Field>
      </div>

      <Field label="Patient mobility / condition summary" error={errors.mobilitySummary?.message}>
        <textarea {...register("mobilitySummary")} rows={3} className="input" />
      </Field>

      <Field label="Stairs / lift / accessibility notes (optional)">
        <input {...register("accessibilityNotes")} className="input" />
      </Field>

      <Field label="Special instructions (optional)">
        <textarea {...register("specialInstructions")} rows={2} className="input" />
      </Field>

      <label className="flex items-start gap-2.5 text-sm text-navy-600">
        <input type="checkbox" {...register("consent")} className="mt-0.5 h-4 w-4" />
        <span>
          I consent to Physio Nexus Academy using these details, including my address, to
          arrange this home visit.
          {errors.consent && (
            <span className="mt-1 block text-xs text-red-600">{errors.consent.message}</span>
          )}
        </span>
      </label>

      <Button type="submit" size="lg" disabled={isSubmitting} className="w-full sm:w-auto">
        {isSubmitting ? "Submitting..." : "Submit Home Visit Request"}
      </Button>

      {status === "error" && (
        <p className="text-sm text-red-600" role="alert">
          Something went wrong submitting your request. Please try again or contact us directly.
        </p>
      )}
    </form>
  );
}

