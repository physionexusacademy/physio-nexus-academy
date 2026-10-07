import type { Metadata } from "next";
import {
  Activity,
  AlertTriangle,
  Brain,
  CheckCircle2,
  ShieldCheck,
  Sparkles,
  Stethoscope,
} from "lucide-react";
import { SymptomCheckerClient } from "./SymptomCheckerClient";
import { siteConfig } from "@/lib/site-config";

export const metadata: Metadata = {
  title: "MSK Symptom Checker | Musculoskeletal Screening",
  description:
    "Use the Physio Nexus Academy musculoskeletal symptom checker to screen common neck, shoulder, back, hip, knee, ankle and other MSK symptom patterns and decide the next step.",
  alternates: {
    canonical: "https://physionexusacademy.com/symptom-checker",
  },
};

const highlights = [
  {
    icon: Brain,
    title: "Clinical reasoning",
    text: "107 structured MSK patterns",
  },
  {
    icon: ShieldCheck,
    title: "Safety-first",
    text: "Red-flag screening built in",
  },
  {
    icon: Activity,
    title: "Patient friendly",
    text: "Simple questions, clinical logic",
  },
];

export default function SymptomCheckerPage() {
  return (
    <main className="relative overflow-hidden bg-[linear-gradient(180deg,#f7fbfc_0%,#ffffff_42%,#f8fbfc_100%)]">
      <div className="pointer-events-none absolute left-1/2 top-0 h-[560px] w-[900px] -translate-x-1/2 rounded-full bg-teal-100/40 blur-3xl" />

      <div className="container-content relative max-w-6xl py-10 sm:py-14 lg:py-16">
        <section className="relative overflow-hidden rounded-[2rem] border border-white/10 bg-navy-900 px-6 py-8 text-white shadow-2xl shadow-navy-900/15 sm:px-9 sm:py-10 lg:px-12 lg:py-12">
          <div className="pointer-events-none absolute -right-24 -top-24 h-72 w-72 rounded-full bg-teal-400/20 blur-3xl" />
          <div className="pointer-events-none absolute -bottom-28 left-1/3 h-64 w-64 rounded-full bg-cyan-300/10 blur-3xl" />
          <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(45,212,191,0.16),transparent_34%)]" />

          <div className="relative grid items-end gap-9 lg:grid-cols-[1.35fr_0.65fr]">
            <div>
              <div className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-3.5 py-2 text-xs font-bold uppercase tracking-[0.18em] text-cyan-100 backdrop-blur">
                <Sparkles className="h-3.5 w-3.5" />
                PNA Clinical Screening
              </div>

              <h1 className="mt-5 max-w-4xl text-3xl font-bold leading-[1.08] text-white sm:text-5xl lg:text-[3.35rem]">
                Understand your MSK symptoms with a smarter clinical screening flow.
              </h1>

              <p className="mt-5 max-w-3xl text-base leading-7 text-slate-200 sm:text-lg">
                Answer a short series of simple questions. The PNA screening engine organizes your symptoms into
                possible musculoskeletal patterns, checks important safety warnings, and guides you toward the
                right next step.
              </p>

              <div className="mt-7 flex flex-wrap gap-2.5">
                {["Adults 18+", "107 MSK patterns", "Safety-screened", "Appointment integrated"].map((label) => (
                  <span
                    key={label}
                    className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.07] px-3.5 py-2 text-xs font-semibold text-slate-100 backdrop-blur"
                  >
                    <CheckCircle2 className="h-3.5 w-3.5 text-teal-300" />
                    {label}
                  </span>
                ))}
              </div>
            </div>

            <div className="grid gap-3 sm:grid-cols-3 lg:grid-cols-1">
              {highlights.map((item) => {
                const Icon = item.icon;
                return (
                  <div
                    key={item.title}
                    className="rounded-2xl border border-white/10 bg-white/[0.075] p-4 backdrop-blur-md"
                  >
                    <div className="flex items-start gap-3">
                      <span className="flex h-10 w-10 flex-none items-center justify-center rounded-xl border border-teal-300/20 bg-teal-300/10 text-teal-200">
                        <Icon className="h-5 w-5" />
                      </span>
                      <div>
                        <p className="font-bold text-white">{item.title}</p>
                        <p className="mt-1 text-sm leading-5 text-slate-300">{item.text}</p>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </section>

        <div className="mx-auto mt-5 max-w-5xl">
          <div className="flex items-start gap-3 rounded-2xl border border-amber-200/80 bg-amber-50/90 px-4 py-3.5 text-sm leading-6 text-amber-950 shadow-sm">
            <span className="mt-0.5 flex h-8 w-8 flex-none items-center justify-center rounded-lg bg-amber-100 text-amber-700">
              <AlertTriangle className="h-4.5 w-4.5" />
            </span>
            <p>
              <strong>Clinical note:</strong> This is a screening tool for adults aged 18+ and does not provide a
              confirmed diagnosis. Severe, sudden, progressive, or emergency symptoms require appropriate medical
              assessment. {siteConfig.medicalDisclaimer}
            </p>
          </div>
        </div>

        <div className="mx-auto max-w-5xl">
          <SymptomCheckerClient />
        </div>

        <section className="mx-auto mt-8 max-w-5xl overflow-hidden rounded-2xl border border-slate-200/80 bg-white shadow-sm">
          <div className="grid gap-0 md:grid-cols-[0.7fr_1.3fr]">
            <div className="bg-navy-900 p-6 text-white sm:p-7">
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-teal-400/10 text-teal-300">
                <Stethoscope className="h-5 w-5" />
              </div>
              <h2 className="mt-4 text-xl font-bold text-white">How to read your result</h2>
              <p className="mt-2 text-sm leading-6 text-slate-300">
                Compatibility reflects how closely your answers fit a clinical pattern.
              </p>
            </div>
            <div className="p-6 sm:p-7">
              <p className="text-sm leading-6 text-navy-600">
                “High compatibility” is not a diagnostic probability. Musculoskeletal conditions often overlap,
                and examination findings, neurologic or vascular testing, imaging when indicated, and clinician
                judgement may change the final diagnosis.
              </p>
              <div className="mt-4 inline-flex items-center gap-2 rounded-full bg-teal-50 px-3 py-1.5 text-xs font-bold text-teal-700">
                <ShieldCheck className="h-3.5 w-3.5" />
                Screening, not diagnosis
              </div>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}
