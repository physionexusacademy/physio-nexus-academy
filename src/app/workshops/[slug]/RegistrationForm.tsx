"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/Button";
import { registerForWorkshop } from "../actions";

const schema = z.object({
  fullName: z.string().min(2, "Please enter your full name"),
  email: z.string().email("Please enter a valid email"),
  phone: z.string().min(7, "Please enter a valid phone number"),
  professionalStatus: z.enum(["Student", "Graduate", "Physiotherapist", "Other"]),
  institute: z.string().optional(),
  city: z.string().min(2, "Please enter your city"),
  groupRegistration: z.boolean().optional(),
  consent: z.literal(true, {
    errorMap: () => ({ message: "Consent is required to register" }),
  }),
});

type FormValues = z.infer<typeof schema>;

export function RegistrationForm({ workshopId }: { workshopId: string }) {
  const [status, setStatus] = useState<"idle" | "success" | "error">("idle");
  const [referenceId, setReferenceId] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset,
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { professionalStatus: "Student" },
  });

  const onSubmit = async (values: FormValues) => {
    try {
      const ref = await registerForWorkshop({
        workshopId,
        fullName: values.fullName,
        email: values.email,
        phone: values.phone,
        professionalStatus: values.professionalStatus,
        institute: values.institute,
        city: values.city,
        groupRegistration: !!values.groupRegistration,
      });
      setReferenceId(ref);
      setStatus("success");
      reset();
    } catch {
      setStatus("error");
    }
  };

  if (status === "success") {
    return (
      <div className="rounded-lg border border-teal-200 bg-teal-50 p-4 text-center" role="status" aria-live="polite">
        <p className="font-semibold text-teal-800">Registration received</p>
        <p className="mt-1 text-sm text-teal-700">
          Reference: <span className="font-mono">{referenceId}</span>. We'll confirm your seat
          shortly.
        </p>
        <Button className="mt-3" size="md" onClick={() => setStatus("idle")}>
          Register another person
        </Button>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-3" noValidate>
      <div>
        <input {...register("fullName")} placeholder="Full name" aria-label="Full name" aria-invalid={!!errors.fullName} className="input" />
        {errors.fullName && <p className="mt-1 text-xs text-red-600">{errors.fullName.message}</p>}
      </div>
      <div>
        <input {...register("email")} type="email" placeholder="Email" aria-label="Email" aria-invalid={!!errors.email} className="input" />
        {errors.email && <p className="mt-1 text-xs text-red-600">{errors.email.message}</p>}
      </div>
      <div>
        <input {...register("phone")} placeholder="Phone / WhatsApp" aria-label="Phone or WhatsApp number" aria-invalid={!!errors.phone} className="input" />
        {errors.phone && <p className="mt-1 text-xs text-red-600">{errors.phone.message}</p>}
      </div>
      <select {...register("professionalStatus")} aria-label="Professional status" className="input">
        <option value="Student">Student</option>
        <option value="Graduate">Graduate</option>
        <option value="Physiotherapist">Physiotherapist</option>
        <option value="Other">Other</option>
      </select>
      <input {...register("institute")} placeholder="Institute / workplace (optional)" aria-label="Institute or workplace (optional)" className="input" />
      <div>
        <input {...register("city")} placeholder="City" aria-label="City" aria-invalid={!!errors.city} className="input" />
        {errors.city && <p className="mt-1 text-xs text-red-600">{errors.city.message}</p>}
      </div>
      <label className="flex items-center gap-2 text-sm text-navy-600">
        <input type="checkbox" {...register("groupRegistration")} className="h-4 w-4" />
        Registering as part of a group
      </label>
      <label className="flex items-start gap-2 text-xs text-navy-500">
        <input type="checkbox" {...register("consent")} className="mt-0.5 h-4 w-4" />
        <span>
          I consent to being contacted about this registration.
          {errors.consent && <span className="mt-1 block text-red-600">{errors.consent.message}</span>}
        </span>
      </label>
      <Button type="submit" disabled={isSubmitting} className="w-full">
        {isSubmitting ? "Submitting..." : "Register Now"}
      </Button>
      {status === "error" && (
        <p className="text-xs text-red-600" role="alert">Something went wrong. Please try again.</p>
      )}
    </form>
  );
}
