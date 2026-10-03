import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import {
  ArrowLeft,
  CheckCircle2,
  ClipboardCheck,
  Gauge,
  Hand,
  Lightbulb,
  ShieldAlert,
  ShieldCheck,
  Brain,
  Microscope,
  ExternalLink,
} from "lucide-react";
import { manualTherapyTechniques } from "@/lib/all-manual-therapy";
import { manualApplicationGuides } from "@/lib/all-manual-therapy-guides";
import { getApplicationsForTechnique } from "@/lib/manual-therapy-regional";
import {
  manualTherapyMechanisms,
  manualTherapyMechanismEvidence,
} from "@/lib/all-manual-therapy-mechanisms";
import { getManualTherapyExpertProfile } from "@/lib/manual-therapy-expert";

type PageProps = {
  params: Promise<{ slug: string }>;
};

export function generateStaticParams() {
  return manualTherapyTechniques.map((technique) => ({ slug: technique.slug }));
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const technique = manualTherapyTechniques.find((item) => item.slug === slug);

  if (!technique) return {};

  return {
    title: technique.name + " | Manual Therapy Mastery",
    description: technique.summary,
    alternates: {
      canonical: "https://physionexusacademy.com/manual-therapy/" + technique.slug,
    },
  };
}

function ListBlock({
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

export default async function ManualTherapyDetailPage({ params }: PageProps) {
  const { slug } = await params;
  const technique = manualTherapyTechniques.find((item) => item.slug === slug);
  const guide = manualApplicationGuides[slug];
  const mechanism = manualTherapyMechanisms[slug];
  const expert = getManualTherapyExpertProfile(slug);
  const regionalApplications = getApplicationsForTechnique(slug);

  if (!technique || !guide || !mechanism || !expert) notFound();

  return (
    <div className="container-content section-padding">
      <Link
        href="/manual-therapy"
        className="inline-flex items-center gap-1 text-sm font-bold text-violet-700"
      >
        <ArrowLeft className="h-4 w-4" />
        Manual Therapy Mastery
      </Link>

      <section className="mt-5 overflow-hidden rounded-3xl bg-gradient-to-br from-violet-700 via-indigo-700 to-navy-900 p-7 text-white shadow-xl sm:p-10">
        <div className="flex flex-wrap gap-2">
          <span className="rounded-full bg-white/10 px-3 py-1 text-xs font-bold">
            {technique.family}
          </span>
          <span className="rounded-full bg-white/10 px-3 py-1 text-xs font-bold">
            {technique.level}
          </span>
        </div>
        <h1 className="mt-4 text-3xl font-bold text-white sm:text-5xl">
          {technique.name}
        </h1>
        <p className="mt-4 max-w-3xl text-base leading-7 text-violet-50">
          {technique.summary}
        </p>
      </section>

      <section className="mt-8 overflow-hidden rounded-3xl border border-indigo-200 bg-gradient-to-br from-indigo-50 via-white to-violet-50">
        <div className="border-b border-indigo-100 p-6 sm:p-8">
          <div className="flex items-start gap-3">
            <span className="flex h-12 w-12 flex-none items-center justify-center rounded-2xl bg-indigo-700 text-white">
              <Brain className="h-6 w-6" />
            </span>
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.2em] text-indigo-700">
                Mechanism & Physiology
              </p>
              <h2 className="mt-2 text-2xl font-bold text-navy-800 sm:text-3xl">
                How does this technique actually work?
              </h2>
              <p className="mt-3 max-w-4xl text-sm leading-7 text-navy-600">
                {mechanism.simpleExplanation}
              </p>
            </div>
          </div>
        </div>

        <div className="p-5 sm:p-8">
          <div className="rounded-2xl border border-indigo-100 bg-white p-5 shadow-sm">
            <p className="text-xs font-bold uppercase tracking-[0.18em] text-indigo-600">
              Mechanism in one line
            </p>
            <p className="mt-3 font-mono text-sm font-semibold leading-7 text-navy-800">
              {mechanism.mechanismMap}
            </p>
          </div>
        </div>

        <div className="grid gap-5 border-t border-indigo-100 p-5 sm:p-8 lg:grid-cols-2">
          <ListBlock
            title="Step-by-Step Physiological Pathway"
            items={mechanism.stepByStep}
            icon={Brain}
            tone="border-indigo-100 bg-indigo-50/70"
          />
          <ListBlock
            title="Deep Physiology — What Happens in the Body"
            items={mechanism.physiology}
            icon={Microscope}
            tone="border-cyan-100 bg-cyan-50/70"
          />
          <ListBlock
            title="What This Means Clinically"
            items={mechanism.clinicalTranslation}
            icon={Lightbulb}
            tone="border-emerald-100 bg-emerald-50/70"
          />
          <ListBlock
            title="What You Should NOT Claim"
            items={mechanism.myths}
            icon={ShieldAlert}
            tone="border-rose-100 bg-rose-50/70"
          />
        </div>

        <div className="border-t border-indigo-100 p-5 sm:p-8">
          <div className="rounded-2xl border border-amber-200 bg-amber-50 p-5">
            <p className="font-bold text-navy-800">Evidence note</p>
            <p className="mt-2 text-sm leading-6 text-navy-600">
              {mechanism.evidenceNote}
            </p>
            <p className="mt-3 text-xs leading-5 text-navy-500">
              Across manual therapy as a whole, current evidence supports interacting peripheral,
              spinal, supraspinal, neurovascular, neuromuscular and contextual responses rather than
              one universal mechanism.
            </p>
            <a
              href={manualTherapyMechanismEvidence.sourceUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-4 inline-flex items-center gap-1 text-sm font-bold text-indigo-700"
            >
              Read the {manualTherapyMechanismEvidence.sourceYear} living review
              <ExternalLink className="h-4 w-4" />
            </a>
          </div>
        </div>
      </section>

      <section className="mt-8 overflow-hidden rounded-3xl border border-slate-200 bg-gradient-to-br from-slate-50 via-white to-indigo-50">
        <div className="border-b border-slate-200 p-6 sm:p-8">
          <p className="text-xs font-bold uppercase tracking-[0.2em] text-indigo-700">
            Expert Clinical Layer
          </p>
          <h2 className="mt-2 text-2xl font-bold text-navy-800 sm:text-3xl">
            Selection, dosing, progression and documentation
          </h2>
          <p className="mt-3 max-w-3xl text-sm leading-6 text-navy-600">
            This layer goes beyond memorizing the maneuver. It shows how an experienced clinician
            selects, modifies, progresses, integrates and documents the technique while keeping
            claims aligned with current evidence.
          </p>
        </div>
        <div className="grid gap-5 p-5 sm:p-8 lg:grid-cols-2">
          <ListBlock title="Variants & Classifications" items={expert.variants} icon={Microscope} tone="border-violet-100 bg-violet-50/70" />
          <ListBlock title="Clinical Selection Rules" items={expert.selectionRules} icon={Brain} tone="border-cyan-100 bg-cyan-50/70" />
          <ListBlock title="Technical Variables That Change the Dose" items={expert.technicalVariables} icon={Gauge} tone="border-blue-100 bg-blue-50/70" />
          <ListBlock title="Progression & Regression" items={expert.progressionRegression} icon={ShieldCheck} tone="border-emerald-100 bg-emerald-50/70" />
          <ListBlock title="Integration With Active Rehabilitation" items={expert.integration} icon={Lightbulb} tone="border-teal-100 bg-teal-50/70" />
          <ListBlock title="Documentation Standard" items={expert.documentation} icon={ClipboardCheck} tone="border-slate-200 bg-slate-50/70" />
        </div>
        <div className="border-t border-slate-200 p-5 sm:p-8">
          <ListBlock title="Evidence Position — What We Can and Cannot Claim" items={expert.evidencePosition} icon={Microscope} tone="border-amber-100 bg-amber-50/70" />
        </div>
      </section>

      <section className="mt-8 overflow-hidden rounded-3xl border border-violet-200 bg-gradient-to-br from-violet-50 via-white to-cyan-50">
        <div className="border-b border-violet-100 p-6 sm:p-8">
          <p className="text-xs font-bold uppercase tracking-[0.2em] text-violet-700">
            Practical Application
          </p>
          <h2 className="mt-2 text-2xl font-bold text-navy-800 sm:text-3xl">
            Exactly how to apply this technique
          </h2>
          <p className="mt-3 max-w-3xl text-sm leading-6 text-navy-600">
            Read this section in order. It is written like a practical class: patient setup,
            therapist setup, hand placement, force direction, step-by-step application,
            what you should expect, when to stop and the mistakes that commonly spoil the technique.
          </p>
        </div>
        <div className="grid gap-5 p-5 sm:p-8 lg:grid-cols-2">
          <ListBlock title="Patient Position" items={guide.patientPosition} icon={Hand} tone="border-cyan-100 bg-cyan-50/70" />
          <ListBlock title="Therapist Position" items={guide.therapistPosition} icon={Hand} tone="border-indigo-100 bg-indigo-50/70" />
          <ListBlock title="Exact Hand Placement" items={guide.handPlacement} icon={Hand} tone="border-violet-100 bg-violet-50/70" />
          <ListBlock title="Direction & Type of Force" items={guide.forceDirection} icon={Gauge} tone="border-blue-100 bg-blue-50/70" />
        </div>
        <div className="border-t border-violet-100 p-5 sm:p-8">
          <ListBlock title="Complete Applying Method — Step by Step" items={guide.applicationSteps} icon={ClipboardCheck} tone="border-emerald-100 bg-emerald-50/70" />
        </div>
        <div className="grid gap-5 border-t border-violet-100 p-5 sm:p-8 lg:grid-cols-2">
          <ListBlock title="What a Good Response Looks Like" items={guide.expectedResponse} icon={ShieldCheck} tone="border-teal-100 bg-teal-50/70" />
          <ListBlock title="Stop / Modify Immediately If…" items={guide.stopCriteria} icon={ShieldAlert} tone="border-rose-100 bg-rose-50/70" />
          <ListBlock title="Common Practical Mistakes" items={guide.commonMistakes} icon={ShieldAlert} tone="border-amber-100 bg-amber-50/70" />
          <ListBlock title="Clinical Example" items={guide.clinicalExample} icon={Lightbulb} tone="border-purple-100 bg-purple-50/70" />
        </div>
      </section>

      <div className="mt-8 grid gap-5 lg:grid-cols-2">
        <ListBlock
          title="Science & Clinical Rationale"
          items={technique.science}
          icon={Lightbulb}
          tone="border-violet-100 bg-violet-50/70"
        />
        <ListBlock
          title="Step-by-Step Process"
          items={technique.procedure}
          icon={Hand}
          tone="border-cyan-100 bg-cyan-50/70"
        />
        <ListBlock
          title="Dosage & Application"
          items={technique.dosage}
          icon={Gauge}
          tone="border-blue-100 bg-blue-50/70"
        />
        <ListBlock
          title="Indications"
          items={technique.indications}
          icon={ClipboardCheck}
          tone="border-emerald-100 bg-emerald-50/70"
        />
        <ListBlock
          title="Precautions"
          items={technique.precautions}
          icon={ShieldAlert}
          tone="border-amber-100 bg-amber-50/70"
        />
        <ListBlock
          title="Contraindications"
          items={technique.contraindications}
          icon={ShieldAlert}
          tone="border-rose-100 bg-rose-50/70"
        />
        <ListBlock
          title="Reassessment"
          items={technique.reassessment}
          icon={ShieldCheck}
          tone="border-teal-100 bg-teal-50/70"
        />
        <ListBlock
          title="Clinical Pearls"
          items={technique.pearls}
          icon={Lightbulb}
          tone="border-indigo-100 bg-indigo-50/70"
        />
      </div>

      {regionalApplications.length ? (
        <section className="mt-8 overflow-hidden rounded-3xl border border-violet-200 bg-gradient-to-br from-violet-50 via-white to-cyan-50 p-6 sm:p-8">
          <p className="text-xs font-bold uppercase tracking-[0.2em] text-violet-700">
            Region-Wise Applications
          </p>
          <h2 className="mt-2 text-2xl font-bold text-navy-800">
            Apply {technique.name} in specific body regions
          </h2>
          <p className="mt-3 max-w-3xl text-sm leading-6 text-navy-600">
            Open a regional application to see the exact patient position, therapist position,
            stabilization, contact point, direction of force, dosage, steps and reassessment.
          </p>
          <div className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {regionalApplications.map((application) => (
              <Link
                key={application.slug}
                href={"/manual-therapy/regions/" + application.slug}
                className="rounded-2xl border border-violet-100 bg-white p-4 transition hover:-translate-y-0.5 hover:shadow-md"
              >
                <p className="text-xs font-bold uppercase tracking-wide text-violet-600">
                  {application.region}
                </p>
                <p className="mt-1 font-bold text-navy-800">{application.title}</p>
              </Link>
            ))}
          </div>
        </section>
      ) : null}

      <section className="mt-8 rounded-2xl border border-grey-200 bg-white p-6">
        <h2 className="font-bold text-navy-800">Mastery sequence</h2>
        <p className="mt-2 text-sm leading-6 text-navy-600">
          Screen → identify a meaningful comparable sign → choose the lowest-risk technique
          likely to help → obtain consent → apply an appropriate dose → reassess immediately
          → keep only techniques that improve pain, movement or function → transfer the gain
          into active exercise and self-management.
        </p>
      </section>

      <div className="mt-8 flex flex-wrap gap-3">
        <Link
          href="/manual-therapy"
          className="rounded-xl border border-grey-200 px-5 py-3 text-sm font-bold text-navy-700"
        >
          Browse more techniques
        </Link>
        <Link
          href="/treatment-plans"
          className="rounded-xl bg-teal-600 px-5 py-3 text-sm font-bold text-white"
        >
          Apply in treatment plans
        </Link>
      </div>
    </div>
  );
}
