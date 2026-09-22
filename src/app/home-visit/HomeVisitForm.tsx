"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
  ArrowLeft,
  ArrowRight,
  CheckCircle2,
  Clock3,
  MapPin,
  MessageCircle,
} from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Field } from "@/components/ui/Field";
import { submitHomeVisit } from "./actions";

const schema = z.object({
  fullName: z.string().min(2, "Please enter your full name"),
  phone: z.string().min(7, "Please enter a valid phone / WhatsApp number"),
  email: z.string().email("Please enter a valid email address").optional().or(z.literal("")),
  city: z.string().min(2, "Please enter your city"),
  area: z.string().min(2, "Please enter your area / neighborhood"),
  address: z.string().min(5, "Please enter the full visit address"),
  preferredDate: z.string().min(1, "Please select a preferred date"),
  preferredTime: z.string().min(1, "Please select a preferred time"),
  mobilitySummary: z.string().min(3, "Please briefly describe the condition"),
  accessibilityNotes: z.string().optional(),
  specialInstructions: z.string().optional(),
  consent: z.literal(true, {
    errorMap: () => ({ message: "Consent is required to submit this request" }),
  }),
});

type FormValues = z.infer<typeof schema>;
type Step = 1 | 2;

const timeSlots = [
  { value: "morning", label: "Morning", hint: "9 AM – 12 PM" },
  { value: "afternoon", label: "Afternoon", hint: "12 PM – 4 PM" },
  { value: "evening", label: "Evening", hint: "4 PM – 8 PM" },
] as const;

export function HomeVisitForm() {
  const [step, setStep] = useState<Step>(1);
  const [status, setStatus] = useState<"idle" | "success" | "error">("idle");
  const [referenceId, setReferenceId] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset,
    setValue,
    watch,
    trigger,
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { preferredTime: "" },
  });

  const preferredTime = watch("preferredTime");

  const goToDetails = async () => {
    const valid = await trigger(["city", "area", "preferredDate", "preferredTime"]);
    if (valid) setStep(2);
  };

  const onSubmit = async (values: FormValues) => {
    try {
      const ref = await submitHomeVisit(values);
      setReferenceId(ref);
      setStatus("success");
      reset();
      setStep(1);
    } catch {
      setStatus("error");
    }
  };

  if (status === "success") {
    const whatsappMessage = encodeURIComponent(
      \`Hello Physio Nexus Academy, I submitted a home visit request. Reference ID: ${referenceId}\`,
    );

    return (
      <div
        className="rounded-2xl border border-teal-200 bg-gradient-to-b from-teal-50 to-white p-6 text-center shadow-sm sm:p-8"
        role="status"
        aria-live="polite"
      >
        <span className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-teal-100 text-teal-700">
          <CheckCircle2 className="h-7 w-7" />
        </span>
        <p className="mt-4 font-heading text-2xl font-semibold text-navy-800">Home visit request received</p>
        <p className="mt-2 text-sm leading-6 text-navy-600">
          Your reference ID is <span className="font-mono font-semibold text-navy-800">{referenceId}</span>.
          We will contact you to confirm service availability for your area.
        </p>
        <div className="mt-6 flex flex-col justify-center gap-3 sm:flex-row">
          <a
            href={\`https://wa.me/923489009028?text=${whatsappMessage}\`}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center justify-center gap-2 rounded-md bg-[#25D366] px-5 py-3 text-sm font-semibold text-white transition hover:bg-[#20bd5a]"
          >
            <MessageCircle className="h-4 w-4" />
            Confirm on WhatsApp
          </a>
          <Button variant="outline" onClick={() => setStatus("idle")}>
            Submit another request
          </Button>
        </div>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6" noValidate>
      <div className="rounded-2xl border border-grey-200 bg-white p-5 shadow-sm sm:p-7">
        <div className="mb-7 flex items-center gap-3">
          {[1, 2].map((item) => (
            <div key={item} className="flex flex-1 items-center gap-3">
              <div
                className={\`flex h-9 w-9 flex-none items-center justify-center rounded-full text-sm font-bold ${
                  step >= item ? "bg-teal-500 text-white" : "bg-grey-100 text-navy-400"
                }\`}
              >
                {item}
              </div>
              <div className="min-w-0">
                <p className={\`text-sm font-semibold ${step >= item ? "text-navy-800" : "text-navy-400"}\`}>
                  {item === 1 ? "Location & time" : "Patient details"}
                </p>
                <p className="hidden text-xs text-navy-400 sm:block">
                  {item === 1 ? "Area, date & slot" : "Contact, address & condition"}
                </p>
              </div>
              {item === 1 && <div className="hidden h-px flex-1 bg-grey-200 sm:block" />}
            </div>
          ))}
        </div>

        {step === 1 ? (
          <div className="space-y-6">
            <div className="grid gap-5 sm:grid-cols-2">
              <Field label="City" error={errors.city?.message}>
                <input {...register("city")} autoComplete="address-level2" className="input min-h-12" />
              </Field>
              <Field label="Area / neighborhood" error={errors.area?.message}>
                <input {...register("area")} autoComplete="address-level3" className="input min-h-12" />
              </Field>
            </div>

            <Field label="Preferred date" error={errors.preferredDate?.message}>
              <input {...register("preferredDate")} type="date" className="input min-h-12" />
            </Field>

            <div>
              <p className="label">Preferred time</p>
              <div className="grid gap-3 sm:grid-cols-3">
                {timeSlots.map((slot) => (
                  <button
                    key={slot.value}
                    type="button"
                    onClick={() => setValue("preferredTime", slot.value, { shouldValidate: true })}
                    className={\`rounded-xl border px-4 py-3 text-left transition ${
                      preferredTime === slot.value
                        ? "border-teal-500 bg-teal-50 ring-1 ring-teal-500"
                        : "border-grey-200 bg-white hover:border-teal-300"
                    }\`}
                  >
                    <Clock3 className="h-5 w-5 text-teal-600" />
                    <span className="mt-2 block text-sm font-semibold text-navy-800">{slot.label}</span>
                    <span className="block text-xs text-navy-400">{slot.hint}</span>
                  </button>
                ))}
              </div>
              {errors.preferredTime && (
                <p className="mt-1 text-xs text-red-600" role="alert">
                  {errors.preferredTime.message}
                </p>
              )}
            </div>

            <Button type="button" size="lg" onClick={goToDetails} className="w-full sm:w-auto">
              Continue
              <ArrowRight className="h-4 w-4" />
            </Button>
          </div>
        ) : (
          <div className="space-y-5">
            <div className="grid gap-5 sm:grid-cols-2">
              <Field label="Full name" error={errors.fullName?.message}>
                <input {...register("fullName")} autoComplete="name" className="input min-h-12" />
              </Field>
              <Field label="Phone / WhatsApp number" error={errors.phone?.message}>
                <input
                  {...register("phone")}
                  type="tel"
                  inputMode="tel"
                  autoComplete="tel"
                  placeholder="e.g. 0348 9009028"
                  className="input min-h-12"
                />
              </Field>
            </div>

            <Field label="Email (optional)" error={errors.email?.message}>
              <input {...register("email")} type="email" autoComplete="email" className="input min-h-12" />
            </Field>

            <Field label="Full visit address" error={errors.address?.message}>
              <textarea
                {...register("address")}
                rows={3}
                autoComplete="street-address"
                placeholder="House / flat, street and nearby landmark"
                className="input"
              />
            </Field>

            <Field label="Patient condition / mobility summary" error={errors.mobilitySummary?.message}>
              <textarea
                {...register("mobilitySummary")}
                rows={3}
                placeholder="Briefly tell us what help the patient needs."
                className="input"
              />
            </Field>

            <details className="rounded-xl border border-grey-200 bg-grey-50 p-4">
              <summary className="cursor-pointer text-sm font-semibold text-navy-700">
                Add optional visit notes
              </summary>
              <div className="mt-4 space-y-4">
                <Field label="Stairs / lift / accessibility notes">
                  <input {...register("accessibilityNotes")} className="input" />
                </Field>
                <Field label="Special instructions">
                  <textarea {...register("specialInstructions")} rows={2} className="input" />
                </Field>
              </div>
            </details>

            <label className="flex items-start gap-3 rounded-xl bg-grey-50 p-4 text-sm text-navy-600">
              <input type="checkbox" {...register("consent")} className="mt-0.5 h-4 w-4 accent-teal-600" />
              <span>
                I consent to Physio Nexus Academy using these details, including my address, to arrange this home visit.
                {errors.consent && (
                  <span className="mt-1 block text-xs text-red-600">{errors.consent.message}</span>
                )}
              </span>
            </label>

            <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-between">
              <Button type="button" variant="outline" size="lg" onClick={() => setStep(1)} className="w-full sm:w-auto">
                <ArrowLeft className="h-4 w-4" />
                Back
              </Button>
              <Button type="submit" size="lg" disabled={isSubmitting} className="w-full sm:w-auto">
                {isSubmitting ? "Submitting..." : "Request Home Visit"}
              </Button>
            </div>
          </div>
        )}
      </div>

      {status === "error" && (
        <p className="rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700" role="alert">
          Something went wrong submitting your request. Please try again or contact us on WhatsApp.
        </p>
      )}

      <div className="flex items-start gap-3 rounded-xl bg-navy-50 p-4 text-sm text-navy-600">
        <MapPin className="mt-0.5 h-5 w-5 flex-none text-teal-600" />
        <p>Home visit availability depends on your area and schedule. We will confirm before any visit is finalized.</p>
      </div>
    </form>
  );
}
