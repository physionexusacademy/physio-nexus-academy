"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/Button";
import { Field } from "@/components/ui/Field";
import { submitContactMessage } from "./actions";

const schema = z.object({
  name: z.string().min(2, "Please enter your name"),
  email: z.string().email("Please enter a valid email"),
  message: z.string().min(10, "Please write a short message"),
});

type FormValues = z.infer<typeof schema>;

export function ContactForm() {
  const [sent, setSent] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset,
  } = useForm<FormValues>({ resolver: zodResolver(schema) });

  const onSubmit = async (values: FormValues) => {
    try {
      await submitContactMessage(values);
      setSent(true);
      reset();
    } catch {
      setError("Something went wrong sending your message. Please try again.");
    }
  };

  if (sent) {
    return (
      <div className="rounded-xl border border-teal-200 bg-teal-50 p-6 text-center" role="status" aria-live="polite">
        <p className="font-heading font-semibold text-teal-800">Message sent</p>
        <p className="mt-2 text-sm text-teal-700">We&apos;ll get back to you soon.</p>
        <Button className="mt-4" onClick={() => setSent(false)}>
          Send another message
        </Button>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
      <Field label="Name" error={errors.name?.message}>
        <input {...register("name")} className="input" />
      </Field>
      <Field label="Email" error={errors.email?.message}>
        <input {...register("email")} type="email" className="input" />
      </Field>
      <Field label="Message" error={errors.message?.message}>
        <textarea {...register("message")} rows={5} className="input" />
      </Field>
      {error && (
        <p className="text-sm text-red-600" role="alert">
          {error}
        </p>
      )}
      <Button type="submit" disabled={isSubmitting} className="w-full sm:w-auto">
        {isSubmitting ? "Sending..." : "Send Message"}
      </Button>
    </form>
  );
}
