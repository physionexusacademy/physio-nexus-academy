import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import {
  ArrowLeft,
  CheckCircle2,
  Hand,
  Move,
  ShieldAlert,
  Target,
  UserRound,
  UsersRound,
  Gauge,
  RotateCcw,
} from "lucide-react";
import {
  completeRegionalManualApplications,
  getRegionalManualApplication,
} from "@/lib/manual-therapy-regional";

type PageProps = {
  params: Promise<{ slug: string }>;
};

export function generateStaticParams() {
  return completeRegionalManualApplications.map((item) => ({ slug: item.slug }));
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const item = getRegionalManualApplication(slug);
  if (!item) return {};

  return {
    title: item.title + " | Regional Manual Therapy",
    description: item.clinicalUse[0],
    alternates: {
      canonical: "https://physionexusacademy.com/manual-therapy/regions/" + item.slug,
    },
  };
}

function Section({
  title,
  items,
  icon: Icon,
  tone,
}: {
  title: string;
  items: string[];
  icon: typeof Hand;
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

export default async function RegionalManualDetailPage({ params }: PageProps) {
  const { slug } = await params;
  const item = getRegionalManualApplication(slug);
  if (!item) notFound();

  return (
    <div className="container-content section-padding">
      <Link
        href="/manual-therapy/regions"
        className="inline-flex items-center gap-1 text-sm font-bold text-violet-700"
      >
        <ArrowLeft className="h-4 w-4" />
        Regional Manual Therapy
      </Link>

      <section className="mt-5 overflow-hidden rounded-3xl bg-gradient-to-br from-violet-700 via-indigo-800 to-navy-900 p-7 text-white shadow-xl sm:p-10">
        <div className="flex flex-wrap gap-2">
          <span className="rounded-full bg-white/10 px-3 py-1 text-xs font-bold">
            {item.region}
          </span>
          <span className="rounded-full bg-white/10 px-3 py-1 text-xs font-bold">
            {item.techniqueName}
          </span>
          <span className="rounded-full bg-white/10 px-3 py-1 text-xs font-bold">
            {item.applicability ?? "Detailed"}
          </span>
        </div>
        <h1 className="mt-4 max-w-4xl text-3xl font-bold text-white sm:text-5xl">
          {item.title}
        </h1>
      </section>

      {item.applicability === "Not routine" ? (
        <section className="mt-8 rounded-3xl border border-amber-200 bg-amber-50 p-6 sm:p-8">
          <p className="text-xs font-bold uppercase tracking-[0.2em] text-amber-700">
            Clinical applicability
          </p>
          <h2 className="mt-2 text-xl font-bold text-navy-800">
            Not a routine first-choice application in this region
          </h2>
          <p className="mt-2 text-sm leading-6 text-navy-600">
            This page is included so every body region has clear guidance. Do not force the
            technique into this region; use it only when examination identifies a relevant
            target and the clinician has appropriate training.
          </p>
        </section>
      ) : null}

      <section className="mt-8 rounded-3xl border border-violet-200 bg-gradient-to-r from-violet-50 to-cyan-50 p-6 sm:p-8">
        <p className="text-xs font-bold uppercase tracking-[0.2em] text-violet-700">
          Visual Force Map
        </p>
        <div className="mt-4 rounded-2xl border border-white bg-white p-5 shadow-sm">
          <p className="font-mono text-sm font-semibold leading-7 text-navy-800">
            {item.visualCue}
          </p>
        </div>
        <p className="mt-3 text-xs leading-5 text-navy-500">
          This quick map is a memory aid only. Use the full positioning and safety instructions below before applying the technique.
        </p>
      </section>

      <div className="mt-8 grid gap-5 lg:grid-cols-2">
        <Section title="When to Use It" items={item.clinicalUse} icon={Target} tone="border-emerald-100 bg-emerald-50/70" />
        <Section title="Patient Position" items={item.patientPosition} icon={UserRound} tone="border-cyan-100 bg-cyan-50/70" />
        <Section title="Therapist Position" items={item.therapistPosition} icon={UsersRound} tone="border-indigo-100 bg-indigo-50/70" />
        <Section title="Stabilization" items={item.stabilization} icon={Hand} tone="border-blue-100 bg-blue-50/70" />
        <Section title="Exact Contact / Hand Placement" items={item.contact} icon={Hand} tone="border-violet-100 bg-violet-50/70" />
        <Section title="Force Direction" items={item.forceDirection} icon={Move} tone="border-fuchsia-100 bg-fuchsia-50/70" />
        <Section title="Dosage" items={item.dosage} icon={Gauge} tone="border-amber-100 bg-amber-50/70" />
        <Section title="Reassessment" items={item.reassess} icon={RotateCcw} tone="border-teal-100 bg-teal-50/70" />
      </div>

      <section className="mt-6 rounded-3xl border border-emerald-200 bg-emerald-50/70 p-6 sm:p-8">
        <h2 className="text-2xl font-bold text-navy-800">Complete Applying Method</h2>
        <div className="mt-5 space-y-3">
          {item.steps.map((step) => (
            <div key={step} className="flex gap-3 rounded-2xl border border-emerald-100 bg-white p-4">
              <CheckCircle2 className="mt-0.5 h-5 w-5 flex-none text-emerald-700" />
              <p className="text-sm leading-6 text-navy-700">{step}</p>
            </div>
          ))}
        </div>
      </section>

      <div className="mt-6 grid gap-5 lg:grid-cols-2">
        <Section title="Common Practical Mistakes" items={item.mistakes} icon={ShieldAlert} tone="border-rose-100 bg-rose-50/70" />
        <Section title="Safety / Do Not Apply When…" items={item.safety} icon={ShieldAlert} tone="border-orange-100 bg-orange-50/70" />
      </div>

      <section className="mt-8 rounded-2xl border border-grey-200 bg-white p-6">
        <h2 className="font-bold text-navy-800">Clinical rule</h2>
        <p className="mt-2 text-sm leading-6 text-navy-600">
          A technically correct mobilization is not automatically a useful mobilization.
          Keep the technique only when the patient’s pain, range or function improves in a
          clinically meaningful way, then transfer that gain into active movement or loading.
        </p>
      </section>

      <div className="mt-8 flex flex-wrap gap-3">
        <Link
          href={"/manual-therapy/" + item.techniqueSlug}
          className="rounded-xl bg-violet-700 px-5 py-3 text-sm font-bold text-white"
        >
          Study parent technique
        </Link>
        <Link
          href="/manual-therapy/regions"
          className="rounded-xl border border-grey-200 px-5 py-3 text-sm font-bold text-navy-700"
        >
          Browse other regions
        </Link>
      </div>
    </div>
  );
}
