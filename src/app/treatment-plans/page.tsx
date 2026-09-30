import type { Metadata } from "next";
import Link from "next/link";
import {
  Activity,
  ArrowRight,
  ClipboardList,
  Dumbbell,
  HeartPulse,
  ShieldCheck,
  Stethoscope,
} from "lucide-react";
import {
  treatmentPlanCategories,
  treatmentPlans,
} from "@/lib/treatment-plans";

export const metadata: Metadata = {
  title: "Physiotherapy Treatment Plans",
  description:
    "Condition-based physiotherapy treatment plans covering assessment, red flags, modalities, manual therapy, exercise, progression and referral criteria.",
  alternates: {
    canonical: "https://physionexusacademy.com/treatment-plans",
  },
};

export default function TreatmentPlansPage() {
  return (
    <div className="container-content section-padding">
      <section className="overflow-hidden rounded-3xl bg-gradient-to-br from-emerald-700 via-teal-700 to-navy-900 p-7 text-white shadow-xl sm:p-10">
        <p className="text-xs font-bold uppercase tracking-[0.22em] text-emerald-100">
          PNA Clinical Pathways
        </p>
        <h1 className="mt-3 max-w-4xl text-3xl font-bold leading-tight text-white sm:text-5xl">
          Condition-Based Physiotherapy Treatment Plans
        </h1>
        <p className="mt-5 max-w-3xl text-base leading-7 text-emerald-50 sm:text-lg">
          Start with assessment and red flags, then build a complete management pathway:
          outcome measures, modalities, manual therapy, exercise prescription, home program,
          progression and escalation criteria.
        </p>
        <div className="mt-7 flex flex-wrap gap-3 text-sm font-semibold">
          <span className="rounded-full bg-white/10 px-4 py-2">
            {treatmentPlans.length} detailed clinical pathways
          </span>
          <span className="rounded-full bg-white/10 px-4 py-2">
            {treatmentPlanCategories.length} clinical categories
          </span>
          <span className="rounded-full bg-white/10 px-4 py-2">
            Active-care first approach
          </span>
        </div>
      </section>

      <section className="mt-8 grid gap-4 md:grid-cols-4">
        {[
          { icon: Stethoscope, title: "Assess", text: "History, objective testing, function and differential screening." },
          { icon: ShieldCheck, title: "Screen", text: "Red flags, precautions and referral thresholds before treatment." },
          { icon: Activity, title: "Treat", text: "Select useful modalities and manual therapy only when they support the goal." },
          { icon: Dumbbell, title: "Progress", text: "Build exercise, load, function and self-management step by step." },
        ].map((item) => {
          const Icon = item.icon;
          return (
            <div key={item.title} className="rounded-2xl border border-emerald-100 bg-emerald-50/60 p-5">
              <Icon className="h-6 w-6 text-emerald-700" />
              <h2 className="mt-3 font-bold text-navy-800">{item.title}</h2>
              <p className="mt-2 text-sm leading-6 text-navy-600">{item.text}</p>
            </div>
          );
        })}
      </section>

      <section className="mt-12">
        <div className="flex flex-wrap items-end justify-between gap-3">
          <div>
            <p className="text-sm font-bold uppercase tracking-widest text-teal-700">
              Clinical Library
            </p>
            <h2 className="mt-1 text-2xl font-bold text-navy-800 sm:text-3xl">
              Browse by condition category
            </h2>
          </div>
          <Link
            href="/manual-therapy"
            className="inline-flex items-center gap-1 text-sm font-bold text-violet-700"
          >
            Open Manual Therapy Mastery <ArrowRight className="h-4 w-4" />
          </Link>
        </div>

        <div className="mt-8 space-y-8">
          {treatmentPlanCategories.map((category) => {
            const plans = treatmentPlans.filter((plan) => plan.category === category);
            return (
              <div key={category}>
                <div className="flex items-center gap-2">
                  <ClipboardList className="h-5 w-5 text-teal-600" />
                  <h3 className="text-xl font-bold text-navy-800">{category}</h3>
                </div>
                <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                  {plans.map((plan) => (
                    <Link
                      key={plan.slug}
                      href={"/treatment-plans/" + plan.slug}
                      className="group rounded-2xl border border-grey-200 bg-white p-5 transition hover:-translate-y-1 hover:border-teal-200 hover:shadow-lg"
                    >
                      <HeartPulse className="h-5 w-5 text-teal-500" />
                      <h4 className="mt-3 text-lg font-bold text-navy-800">{plan.name}</h4>
                      <p className="mt-2 line-clamp-3 text-sm leading-6 text-navy-600">
                        {plan.summary}
                      </p>
                      <span className="mt-4 inline-flex items-center gap-1 text-sm font-bold text-teal-700">
                        Open treatment plan
                        <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                      </span>
                    </Link>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </section>

      <section className="mt-12 rounded-3xl border border-amber-200 bg-amber-50 p-6">
        <h2 className="font-bold text-navy-800">How to use these plans</h2>
        <p className="mt-2 text-sm leading-6 text-navy-600">
          These are educational clinical pathways, not automatic prescriptions. A real patient
          may need a different diagnosis, dosage, exercise choice, referral or medical treatment.
          Red flags, comorbidities, post-operative restrictions, age, irritability and patient goals
          always take priority over a template.
        </p>
      </section>
    </div>
  );
}
