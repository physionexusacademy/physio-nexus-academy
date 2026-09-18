"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/Button";
import { Field } from "@/components/ui/Field";
import { submitAppointment } from "./actions";

const schema = z.object({
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
    errorMap: () => ({ message: "Consent is required to submit this request" }),
  }),
});

type FormValues = z.infer<typeof schema>;

export function AppointmentForm() {
  const [status, setStatus] = useState<"idle" | "success" | "error">("idle");
  const [referenceId, setReferenceId] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset,
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { appointmentType: "in-person" },
  });

  const onSubmit = async (values: FormValues) => {
    try {
      const ref = await submitAppointment(values);
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
          contact you shortly to confirm your appointment.
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
        <Field label="Age (optional)" error={errors.age?.message}>
          <input {...register("age")} className="input" />
        </Field>
      </div>

      <div className="grid gap-5 sm:grid-cols-2">
        <Field label="Gender (optional)" error={errors.gender?.message}>
          <select {...register("gender")} className="input">
            <option value="">Prefer not to say</option>
            <option value="female">Female</option>
            <option value="male">Male</option>
            <option value="other">Other</option>
          </select>
        </Field>
        <Field label="Phone / WhatsApp number" error={errors.phone?.message}>
          <input {...register("phone")} className="input" />
        </Field>
      </div>

      <Field label="Email (optional)" error={errors.email?.message}>
        <input {...register("email")} type="email" className="input" />
      </Field>

      <Field label="City / area" error={errors.city?.message}>
        <input {...register("city")} className="input" />
      </Field>

      <Field label="Reason for consultation / main complaint" error={errors.reason?.message}>
        <textarea {...register("reason")} rows={4} className="input" />
      </Field>

      <div className="grid gap-5 sm:grid-cols-2">
        <Field label="Preferred date" error={errors.preferredDate?.message}>
          <input {...register("preferredDate")} type="date" className="input" />
        </Field>
        <Field label="Preferred time slot" error={errors.preferredTime?.message}>
          <select {...register("preferredTime")} className="input">
            <option value="">Select a time slot</option>
            <option value="morning">Morning</option>
            <option value="afternoon">Afternoon</option>
            <option value="evening">Evening</option>
          </select>
        </Field>
      </div>

      <Field label="Appointment type" error={errors.appointmentType?.message}>
        <select {...register("appointmentType")} className="input">
          <option value="in-person">In-person</option>
          <option value="online">Online consultation (if enabled)</option>
        </select>
      </Field>

      <div>
        <label htmlFor="attachment" className="mb-1.5 block text-sm font-medium text-navy-700">
          Attach a relevant report or image (optional)
        </label>
        <input
          id="attachment"
          type="file"
          accept=".pdf,.jpg,.jpeg,.png"
          className="block w-full text-sm text-navy-500"
        />
        <p className="mt-1.5 text-xs text-navy-400">
          PDF, JPG or PNG, up to 5MB. Please avoid sharing sensitive personal details you are
          not comfortable transmitting online.
        </p>
      </div>

      <label className="flex items-start gap-2.5 text-sm text-navy-600">
        <input type="checkbox" {...register("consent")} className="mt-0.5 h-4 w-4" />
        <span>
          I consent to Physio Nexus Academy using these details to contact me about this
          appointment request.
          {errors.consent && (
            <span className="mt-1 block text-xs text-red-600">{errors.consent.message}</span>
          )}
        </span>
      </label>

      <Button type="submit" size="lg" disabled={isSubmitting} className="w-full sm:w-auto">
        {isSubmitting ? "Submitting..." : "Submit Appointment Request"}
      </Button>

      {status === "error" && (
        <p className="text-sm text-red-600" role="alert">
          Something went wrong submitting your request. Please try again or contact us directly.
        </p>
      )}
    </form>
  );
}

