import type { Metadata } from "next";
import { AlertTriangle, Brain, ShieldCheck, Stethoscope } from "lucide-react";
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

export default function SymptomCheckerPage() {
  return (
    <div className="container-content section-padding max-w-5xl">
      <section className="overflow-hidden rounded-3xl bg-gradient-to-br from-teal-700 via-cyan-700 to-navy-900 p-7 text-white shadow-xl sm:p-10">
        <p className="text-xs font-bold uppercase tracking-[0.2em] text-cyan-100">Patient Care · PNA</p>
        <h1 className="mt-3 max-w-4xl text-3xl font-bold leading-tight text-white sm:text-5xl">
          Musculoskeletal Symptom Checker
        </h1>
        <p className="mt-5 max-w-3xl text-base leading-7 text-cyan-50 sm:text-lg">
          Answer simple questions about where you hurt, how it started and what makes it better or worse.
          The checker ranks possible musculoskeletal patterns and tells you when medical assessment should come first.
        </p>
        <div className="mt-7 grid gap-3 sm:grid-cols-3">
          {[
            { icon: Brain, title: "Plain language", text: "Patient wording first, medical terms second." },
            { icon: Stethoscope, title: "Clinical reasoning", text: "Structured history and differential pattern matching." },
            { icon: ShieldCheck, title: "Safety first", text: "Red-flag screening before MSK results are shown." },
          ].map((item) => {
            const Icon = item.icon;
            return (
              <div key={item.title} className="rounded-2xl border border-white/15 bg-white/10 p-4">
                <Icon className="h-5 w-5 text-cyan-100" />
                <p className="mt-2 font-bold text-white">{item.title}</p>
                <p className="mt-1 text-sm leading-5 text-cyan-50">{item.text}</p>
              </div>
            );
          })}
        </div>
      </section>

      <div className="mt-6 flex items-start gap-3 rounded-2xl border border-amber-200 bg-amber-50 p-4 text-sm leading-6 text-amber-900">
        <AlertTriangle className="mt-0.5 h-5 w-5 flex-none" />
        <p>
          <strong>Important:</strong> This tool is for adults aged 18+ and provides screening patterns, not a confirmed diagnosis.
          It cannot replace examination by a qualified clinician. If symptoms are severe, sudden or emergency in nature,
          seek appropriate medical care. {siteConfig.medicalDisclaimer}
        </p>
      </div>

      <SymptomCheckerClient />

      <section className="mt-8 rounded-2xl border border-grey-200 bg-grey-50 p-5">
        <h2 className="text-lg font-bold text-navy-800">How to interpret your result</h2>
        <p className="mt-2 text-sm leading-6 text-navy-600">
          “High compatibility” means your answers share several features with that clinical pattern. It is not a probability
          or diagnostic percentage. Conditions can overlap, and examination findings, neurologic/vascular screening,
          imaging when indicated and clinician judgement may change the final diagnosis.
        </p>
      </section>
    </div>
  );
}
