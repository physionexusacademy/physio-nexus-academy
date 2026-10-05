import type { Metadata } from "next";
import { ArrowRight, BrainCircuit, ClipboardCheck, Stethoscope } from "lucide-react";
import { clinicalCases } from "@/lib/all-clinical-cases";

export const metadata: Metadata = {
  title: "Clinical Case Lab",
  description:
    "Case-based physiotherapy learning with presentation, differential diagnosis, clinical reasoning, management and evidence sources.",
  alternates: {
    canonical: "https://physionexusacademy.com/case-lab",
  },
};

export default function CaseLabPage() {
  return (
    <div className="container-content section-padding">
      <div className="overflow-hidden rounded-3xl bg-gradient-to-br from-violet-700 via-indigo-700 to-navy-800 p-7 text-white shadow-xl sm:p-10">
        <div className="flex items-center gap-3">
          <span className="rounded-2xl bg-white/10 p-3">
            <BrainCircuit className="h-7 w-7 text-violet-100" />
          </span>
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.22em] text-violet-100">
              Clinical Reasoning
            </p>
            <h1 className="mt-1 text-3xl font-bold text-white sm:text-4xl">PNA Clinical Case Lab</h1>
          </div>
        </div>
        <p className="mt-5 max-w-3xl text-base leading-7 text-indigo-50 sm:text-lg">
          Read the presentation, think through the differential diagnosis, then compare your reasoning
          with an evidence-informed assessment and management pathway.
        </p>
      </div>

      <div className="mt-8 grid gap-4 sm:grid-cols-3">
        <div className="rounded-2xl border border-violet-100 bg-violet-50 p-5">
          <Stethoscope className="h-6 w-6 text-violet-700" />
          <p className="mt-3 font-semibold text-navy-800">Symptoms → Differential</p>
          <p className="mt-1 text-sm leading-6 text-navy-500">Learn what findings actually change your clinical hypothesis.</p>
        </div>
        <div className="rounded-2xl border border-amber-100 bg-amber-50 p-5">
          <ClipboardCheck className="h-6 w-6 text-amber-700" />
          <p className="mt-3 font-semibold text-navy-800">Reasoning → Diagnosis</p>
          <p className="mt-1 text-sm leading-6 text-navy-500">See why alternatives are kept, downgraded or urgently escalated.</p>
        </div>
        <div className="rounded-2xl border border-emerald-100 bg-emerald-50 p-5">
          <BrainCircuit className="h-6 w-6 text-emerald-700" />
          <p className="mt-3 font-semibold text-navy-800">Plan → Progression</p>
          <p className="mt-1 text-sm leading-6 text-navy-500">Connect examination findings to treatment dose and progression.</p>
        </div>
      </div>

      <div className="mt-10 grid gap-6 lg:grid-cols-3">
        {clinicalCases.map((item, index) => {
          const tones = [
            "from-rose-50 to-orange-50 border-rose-100",
            "from-indigo-50 to-cyan-50 border-indigo-100",
            "from-emerald-50 to-teal-50 border-emerald-100",
          ];
          return (
            <a
              key={item.slug}
              href={"/case-lab/" + item.slug}
              className={"group flex h-full flex-col rounded-3xl border bg-gradient-to-br p-6 transition hover:-translate-y-1 hover:shadow-lg " + tones[index % tones.length]}
            >
              <div className="flex flex-wrap gap-2">
                <span className="rounded-full bg-white/80 px-3 py-1 text-xs font-bold text-violet-700">
                  {item.specialty}
                </span>
                <span className="rounded-full bg-white/80 px-3 py-1 text-xs font-bold text-navy-500">
                  {item.difficulty}
                </span>
              </div>
              <h2 className="mt-5 text-xl font-bold leading-snug text-navy-800">{item.title}</h2>
              <p className="mt-3 flex-1 text-sm leading-6 text-navy-600">{item.summary}</p>
              <div className="mt-5 flex items-center justify-between text-sm font-semibold">
                <span className="text-navy-400">{item.estimatedTime}</span>
                <span className="inline-flex items-center gap-1 text-violet-700">
                  Open case <ArrowRight className="h-4 w-4" />
                </span>
              </div>
            </a>
          );
        })}
      </div>

      <p className="mt-8 rounded-2xl border border-grey-200 bg-grey-50 p-5 text-sm leading-6 text-navy-500">
        Cases are clearly labelled educational simulations built from guideline-supported clinical patterns.
        They are not presented as identifiable real patients.
      </p>
    </div>
  );
}
