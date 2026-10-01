import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import {
  Activity,
  ArrowLeft,
  BookOpen,
  CheckCircle2,
  Dumbbell,
  Gauge,
  Hand,
  HeartPulse,
  Search,
  ShieldAlert,
  Stethoscope,
  ClipboardCheck,
} from "lucide-react";
import { mskConditions, type MSKTest } from "@/lib/msk-injury-hub";

type PageProps = { params: Promise<{ slug: string }> };

export const dynamic = "force-static";
export const dynamicParams = false;
export const revalidate = false;

export function generateStaticParams() {
  return mskConditions.map((item) => ({ slug: item.slug }));
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const item = mskConditions.find((condition) => condition.slug === slug);
  if (!item) return {};
  return {
    title: item.name + " | MSK Clinical Injury & Rehabilitation",
    description: item.summary,
    alternates: { canonical: "https://physionexusacademy.com/msk-injuries/" + item.slug },
  };
}

function ListSection({
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

function TestCard({ test }: { test: MSKTest }) {
  return (
    <article className="rounded-2xl border border-cyan-200 bg-white p-5 shadow-sm sm:p-6">
      <div className="flex items-start gap-3">
        <ClipboardCheck className="mt-1 h-6 w-6 flex-none text-cyan-700" />
        <div>
          <h3 className="text-xl font-bold text-navy-800">{test.name}</h3>
          <p className="mt-1 text-sm leading-6 text-navy-600">{test.purpose}</p>
        </div>
      </div>
      <div className="mt-5 grid gap-3 md:grid-cols-3">
        {[
          ["Patient position", test.patientPosition],
          ["Therapist position", test.therapistPosition],
          ["Hand placement", test.handPlacement],
        ].map(([label, value]) => (
          <div key={label} className="rounded-xl bg-cyan-50 p-4">
            <p className="text-xs font-bold uppercase tracking-wider text-cyan-800">{label}</p>
            <p className="mt-2 text-sm leading-6 text-navy-600">{value}</p>
          </div>
        ))}
      </div>
      <div className="mt-5 rounded-xl border border-grey-200 p-4">
        <p className="text-sm font-bold text-navy-800">How to perform</p>
        <ol className="mt-3 space-y-2">
          {test.procedure.map((step, index) => (
            <li key={step} className="flex gap-3 text-sm leading-6 text-navy-600">
              <span className="flex h-6 w-6 flex-none items-center justify-center rounded-full bg-navy-800 text-xs font-bold text-white">{index + 1}</span>
              <span>{step}</span>
            </li>
          ))}
        </ol>
      </div>
      <div className="mt-4 grid gap-3 md:grid-cols-2">
        <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-4">
          <p className="text-xs font-bold uppercase tracking-wider text-emerald-800">Positive sign</p>
          <p className="mt-2 text-sm leading-6 text-navy-700">{test.positive}</p>
        </div>
        <div className="rounded-xl border border-indigo-200 bg-indigo-50 p-4">
          <p className="text-xs font-bold uppercase tracking-wider text-indigo-800">Interpretation</p>
          <p className="mt-2 text-sm leading-6 text-navy-700">{test.interpretation}</p>
        </div>
      </div>
      {test.clinicalNote && (
        <p className="mt-4 rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm leading-6 text-navy-700">
          <strong>Clinical note:</strong> {test.clinicalNote}
        </p>
      )}
    </article>
  );
}

export default async function MSKConditionPage({ params }: PageProps) {
  const { slug } = await params;
  const item = mskConditions.find((condition) => condition.slug === slug);
  if (!item) notFound();

  return (
    <div className="container-content section-padding">
      <Link href="/msk-injuries" prefetch={false} className="inline-flex items-center gap-1 text-sm font-bold text-orange-700">
        <ArrowLeft className="h-4 w-4" />
        MSK Injury & Rehabilitation Hub
      </Link>

      <section className="mt-5 overflow-hidden rounded-3xl bg-gradient-to-br from-rose-700 via-orange-600 to-navy-900 p-7 text-white shadow-xl sm:p-10">
        <div className="flex flex-wrap gap-2">
          <span className="rounded-full bg-white/10 px-3 py-1 text-xs font-bold">{item.region}</span>
          <span className="rounded-full bg-white/10 px-3 py-1 text-xs font-bold">{item.category}</span>
          <span className="rounded-full bg-white/10 px-3 py-1 text-xs font-bold">{item.evidenceLevel} evidence</span>
        </div>
        <h1 className="mt-4 text-3xl font-bold text-white sm:text-5xl">{item.name}</h1>
        <p className="mt-4 max-w-4xl text-base leading-7 text-orange-50">{item.summary}</p>
      </section>

      <div className="mt-8 grid gap-5 lg:grid-cols-2">
        <ListSection title="Structures Involved" items={item.involvedStructures} icon={Search} tone="border-cyan-100 bg-cyan-50/70" />
        <ListSection title="Mechanism / Why It Happens" items={item.mechanism} icon={Activity} tone="border-orange-100 bg-orange-50/70" />
        <ListSection title="Classification / Grades" items={item.classification} icon={Gauge} tone="border-indigo-100 bg-indigo-50/70" />
        <ListSection title="Symptoms" items={item.symptoms} icon={HeartPulse} tone="border-amber-100 bg-amber-50/70" />
        <ListSection title="Clinical Signs" items={item.signs} icon={Stethoscope} tone="border-emerald-100 bg-emerald-50/70" />
        <ListSection title="Red Flags & Referral Clues" items={item.redFlags} icon={ShieldAlert} tone="border-rose-100 bg-rose-50/70" />
      </div>

      <section className="mt-10">
        <p className="text-sm font-bold uppercase tracking-widest text-cyan-700">Diagnostic Examination</p>
        <h2 className="mt-1 text-2xl font-bold text-navy-800 sm:text-3xl">How to perform the tests — step by step</h2>
        <p className="mt-3 max-w-3xl text-sm leading-6 text-navy-600">
          Each test includes patient setup, therapist position, hand placement, exact performance,
          positive finding and clinical interpretation.
        </p>
        <div className="mt-6 space-y-5">
          {item.tests.map((test) => <TestCard key={test.name} test={test} />)}
        </div>
      </section>

      <div className="mt-8 grid gap-5 lg:grid-cols-2">
        <ListSection title="Differential Diagnosis" items={item.differentials} icon={Search} tone="border-violet-100 bg-violet-50/70" />
        <ListSection title="Investigations / Imaging" items={item.investigations} icon={Stethoscope} tone="border-blue-100 bg-blue-50/70" />
      </div>

      <section className="mt-10 overflow-hidden rounded-3xl border border-emerald-200 bg-gradient-to-br from-emerald-50 via-white to-cyan-50">
        <div className="border-b border-emerald-100 p-6 sm:p-8">
          <p className="text-xs font-bold uppercase tracking-[0.2em] text-emerald-700">Complete Rehabilitation Plan</p>
          <h2 className="mt-2 text-2xl font-bold text-navy-800 sm:text-3xl">From protection to full function</h2>
        </div>
        <div className="space-y-5 p-5 sm:p-8">
          {item.treatmentPhases.map((phase) => (
            <article key={phase.phase} className="rounded-2xl border border-emerald-100 bg-white p-5 sm:p-6">
              <h3 className="text-xl font-bold text-navy-800">{phase.phase}</h3>
              <p className="mt-2 text-sm font-semibold text-emerald-800">{phase.goal}</p>
              <div className="mt-5 grid gap-5 lg:grid-cols-3">
                <ListSection title="What to do" items={phase.interventions} icon={Activity} tone="border-grey-200 bg-grey-50/70" />
                <ListSection title="Exercise dosage" items={phase.exerciseDose} icon={Dumbbell} tone="border-emerald-100 bg-emerald-50/70" />
                <ListSection title="Progress when" items={phase.progression} icon={Gauge} tone="border-indigo-100 bg-indigo-50/70" />
              </div>
            </article>
          ))}
        </div>
      </section>

      <div className="mt-8 grid gap-5 lg:grid-cols-2">
        <ListSection title="Manual Therapy — Role & Application" items={item.manualTherapy} icon={Hand} tone="border-violet-100 bg-violet-50/70" />
        <ListSection title="Modalities — Use / Avoid" items={item.modalities} icon={Activity} tone="border-amber-100 bg-amber-50/70" />
        <ListSection title="Return / Discharge Criteria" items={item.returnCriteria} icon={Gauge} tone="border-emerald-100 bg-emerald-50/70" />
        <ListSection title="Common Clinical Mistakes" items={item.commonMistakes} icon={ShieldAlert} tone="border-rose-100 bg-rose-50/70" />
        <ListSection title="Clinical Pearls" items={item.clinicalPearls} icon={HeartPulse} tone="border-teal-100 bg-teal-50/70" />
      </div>

      <section className="mt-8 rounded-2xl border border-grey-200 bg-white p-6">
        <div className="flex items-center gap-2">
          <BookOpen className="h-5 w-5 text-navy-700" />
          <h2 className="font-bold text-navy-800">Evidence sources</h2>
        </div>
        <ul className="mt-4 space-y-3">
          {item.references.map((reference) => (
            <li key={reference.url}>
              <a className="text-sm font-semibold text-teal-700 hover:underline" href={reference.url} target="_blank" rel="noreferrer">
                {reference.title}
              </a>
            </li>
          ))}
        </ul>
        <p className="mt-5 text-xs leading-5 text-navy-500">
          Educational resource only. Tests and treatment plans must be adapted to the individual patient,
          irritability, comorbidities, surgical restrictions and local scope-of-practice requirements.
        </p>
      </section>
    </div>
  );
}
