import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import {
  Activity,
  ArrowLeft,
  CheckCircle2,
  ClipboardCheck,
  Dumbbell,
  Gauge,
  Hand,
  HeartPulse,
  Home,
  ShieldAlert,
  Stethoscope,
} from "lucide-react";
import { treatmentPlans } from "@/lib/treatment-plans";

type PageProps = {
  params: Promise<{ slug: string }>;
};

export function generateStaticParams() {
  return treatmentPlans.map((plan) => ({ slug: plan.slug }));
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const plan = treatmentPlans.find((item) => item.slug === slug);

  if (!plan) return {};

  return {
    title: plan.name + " | Physiotherapy Treatment Plan",
    description: plan.summary,
    alternates: {
      canonical: "https://physionexusacademy.com/treatment-plans/" + plan.slug,
    },
  };
}

function PlanSection({
  title,
  items,
  icon: Icon,
  tone,
}: {
  title: string;
  items: string[];
  icon: typeof Stethoscope;
  tone: string;
}) {
  return (
    <section className={"rounded-2xl border p-5 sm:p-6 " + tone}>
      <div className="flex items-center gap-2">
        <Icon className="h-5 w-5" />
        <h2 className="text-lg font-bold text-navy-800">{title}</h2>
      </div>
      <ul className="mt-4 space-y-3">
        {items.map((item) => (
          <li key={item} className="flex gap-3 text-sm leading-6 text-navy-600">
            <CheckCircle2 className="mt-1 h-4 w-4 flex-none" />
            <span>{item}</span>
          </li>
        ))}
      </ul>
    </section>
  );
}

export default async function TreatmentPlanDetailPage({ params }: PageProps) {
  const { slug } = await params;
  const plan = treatmentPlans.find((item) => item.slug === slug);

  if (!plan) notFound();

  return (
    <div className="container-content section-padding">
      <Link
        href="/treatment-plans"
        className="inline-flex items-center gap-1 text-sm font-bold text-teal-700"
      >
        <ArrowLeft className="h-4 w-4" />
        Treatment Plans
      </Link>

      <section className="mt-5 overflow-hidden rounded-3xl bg-gradient-to-br from-emerald-700 via-teal-700 to-navy-900 p-7 text-white shadow-xl sm:p-10">
        <span className="rounded-full bg-white/10 px-3 py-1 text-xs font-bold">
          {plan.category}
        </span>
        <h1 className="mt-4 text-3xl font-bold text-white sm:text-5xl">{plan.name}</h1>
        <p className="mt-4 max-w-3xl text-base leading-7 text-emerald-50">{plan.summary}</p>
      </section>

      <div className="mt-8 grid gap-5 lg:grid-cols-2">
        <PlanSection title="Assessment" items={plan.assessment} icon={Stethoscope} tone="border-cyan-100 bg-cyan-50/70" />
        <PlanSection title="Red Flags & Safety" items={plan.redFlags} icon={ShieldAlert} tone="border-rose-100 bg-rose-50/70" />
        <PlanSection title="Outcome Measures" items={plan.outcomeMeasures} icon={ClipboardCheck} tone="border-blue-100 bg-blue-50/70" />
        <PlanSection title="Modalities" items={plan.modalities} icon={Activity} tone="border-amber-100 bg-amber-50/70" />
        <PlanSection title="Manual Therapy" items={plan.manualTherapy} icon={Hand} tone="border-violet-100 bg-violet-50/70" />
        <PlanSection title="Exercise Prescription" items={plan.exercises} icon={Dumbbell} tone="border-emerald-100 bg-emerald-50/70" />
        <PlanSection title="Home Program" items={plan.homePlan} icon={Home} tone="border-teal-100 bg-teal-50/70" />
        <PlanSection title="Progression Criteria" items={plan.progression} icon={Gauge} tone="border-indigo-100 bg-indigo-50/70" />
        <PlanSection title="Referral / Escalation" items={plan.escalation} icon={HeartPulse} tone="border-orange-100 bg-orange-50/70" />
      </div>

      <section className="mt-8 rounded-2xl border border-grey-200 bg-white p-6">
        <h2 className="font-bold text-navy-800">Clinical reasoning rule</h2>
        <p className="mt-2 text-sm leading-6 text-navy-600">
          Do not use every intervention on this page. Select the smallest set that matches the
          patient's diagnosis, irritability, impairments and goals. Reassess after each meaningful
          intervention and progress toward active self-management.
        </p>
      </section>

      <div className="mt-8 flex flex-wrap gap-3">
        <Link
          href="/treatment-plans"
          className="rounded-xl border border-grey-200 px-5 py-3 text-sm font-bold text-navy-700"
        >
          Browse more conditions
        </Link>
        <Link
          href="/manual-therapy"
          className="rounded-xl bg-violet-700 px-5 py-3 text-sm font-bold text-white"
        >
          Study manual techniques
        </Link>
      </div>
    </div>
  );
}
