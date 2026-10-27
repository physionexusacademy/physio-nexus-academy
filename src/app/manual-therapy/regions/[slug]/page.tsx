import type { Metadata } from "next";
import { notFound } from "next/navigation";
import {
  AlertTriangle,
  ArrowLeft,
  ArrowRight,
  CircleDot,
  ClipboardCheck,
  Lightbulb,
  RotateCcw,
  ShieldAlert,
  ShieldCheck,
  Sparkles,
  Target,
} from "lucide-react";
import {
  completeRegionalManualApplications,
  getRegionalManualApplication,
  isTechniqueSpecificRegionalApplication,
  type ManualRegion,
} from "@/lib/manual-therapy-regional";
import {
  getRegionalSubTechniques,
  type RegionalSubTechnique,
} from "@/lib/manual-therapy-subtechniques";
import {
  ClinicalCompareStrip,
} from "@/components/manual-therapy/ClinicalMiniVisuals";
import OnDemand3DAnatomy from "@/components/clinical/OnDemand3DAnatomy";
import {
  getManualTherapy3DAlt,
  getManualTherapy3DAssetPublicId,
  cloudinary3DEnabled,
} from "@/lib/manual-therapy-3d-assets";
import { getManualTherapyVisuals } from "@/lib/manual-therapy-visuals";
import { regionalClinicalStories, regionalClinicalChallenges } from "@/lib/manual-therapy-regional-stories";
import { manualTherapyLessonWeaves } from "@/lib/manual-therapy-lesson-weave";
import { regionalManualVignettes } from "@/lib/manual-therapy-regional-vignettes";
import { RegionalAttentionReset } from "@/components/manual-therapy/AttentionReset";
import { RegionalLearningLab } from "@/components/manual-therapy/RegionalLearningLab";

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
    robots: { index: isTechniqueSpecificRegionalApplication(item), follow: true },
    title: item.title + " | Regional Manual Therapy",
    description: item.clinicalUse[0],
    alternates: {
      canonical:
        "https://physionexusacademy.com/manual-therapy/regions/" + item.slug,
    },
  };
}

function TechniqueStep({
  number,
  title,
  text,
}: {
  number: string;
  title: string;
  text: string;
}) {
  return (
    <div className="relative flex gap-3 rounded-xl border border-slate-200 bg-slate-50/60 p-4">
      <span className="flex h-7 w-7 flex-none items-center justify-center rounded-full bg-teal-700 text-xs font-bold text-white">
        {number}
      </span>
      <div>
        <p className="text-sm font-bold text-slate-800">{title}</p>
        <p className="mt-1 text-sm leading-6 text-slate-600">{text}</p>
      </div>
    </div>
  );
}

function DeepTechniqueCard({
  sub,
  index,
  region,
  techniqueSlug,
}: {
  sub: RegionalSubTechnique;
  index: number;
  region: ManualRegion;
  techniqueSlug: string;
}) {
  const image3DPublicId = getManualTherapy3DAssetPublicId({
    techniqueSlug,
    region,
    subTechniqueName: sub.name,
  });
  const image3DAlt = getManualTherapy3DAlt({
    techniqueName: techniqueSlug,
    region,
    subTechniqueName: sub.name,
    target: sub.target,
  });

  return (
    <article className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
      <div className="p-5 sm:p-6">
        <div className="flex items-start gap-4">
          <span className="flex h-10 w-10 flex-none items-center justify-center rounded-xl bg-teal-700 text-sm font-bold text-white">
            {String(index + 1).padStart(2, "0")}
          </span>

          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap gap-2">
              <span className="rounded-full border border-slate-200 bg-slate-50 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wide text-slate-600">
                {region}
              </span>
              <span className="rounded-full border border-teal-100 bg-teal-50 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wide text-teal-700">
                {sub.target}
              </span>
            </div>

            <h3 className="mt-3 text-xl font-bold leading-tight text-slate-900 sm:text-2xl">
              {sub.name}
            </h3>
            <p className="mt-3 text-[15px] leading-7 text-slate-600">
              One question matters more than the name of this variation: will the patient notice
              a useful change in <strong className="text-slate-900">{sub.reassess}</strong>?
              The careful re-test gets the final word.
            </p>
          </div>
        </div>

        <div className="mt-5 rounded-xl border border-slate-200 bg-slate-50 p-4">
          <div className="flex items-start gap-3">
            <Target className="mt-0.5 h-5 w-5 flex-none text-teal-700" />
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.14em] text-slate-500">
                The change we are looking for
              </p>
              <p className="mt-1 text-sm font-semibold leading-6 text-slate-800">
                {sub.clinicalGoal}
              </p>
            </div>
          </div>
        </div>

        {cloudinary3DEnabled ? (
          <OnDemand3DAnatomy
            publicId={image3DPublicId}
            alt={image3DAlt}
            title={sub.name}
            target={sub.target}
            caption="Realistic 3D anatomy is delivered on demand from Cloudinary only after you open this panel, keeping the main page lightweight."
          />
        ) : null}

        <div className="mt-4 grid gap-3 sm:grid-cols-2">
          <div className="rounded-xl border border-slate-200 bg-white p-4">
            <div className="flex items-center gap-2 text-slate-700">
              <CircleDot className="h-4 w-4" />
              <p className="text-xs font-bold uppercase tracking-wide">Primary target</p>
            </div>
            <p className="mt-2 text-sm font-semibold leading-6 text-slate-800">{sub.target}</p>
          </div>

          <div className="rounded-xl border border-slate-200 bg-white p-4">
            <div className="flex items-center gap-2 text-slate-700">
              <RotateCcw className="h-4 w-4" />
              <p className="text-xs font-bold uppercase tracking-wide">The movement that tells us</p>
            </div>
            <p className="mt-2 text-sm font-semibold leading-6 text-slate-800">{sub.reassess}</p>
          </div>
        </div>

        <div className="mt-4">
          <ClinicalCompareStrip
            patientFocus={sub.clinicalGoal}
            therapistCheck={sub.reassess}
          />
        </div>

        <div className="mt-4 rounded-xl border border-slate-200 bg-slate-50 p-4">
          <div className="flex items-start gap-3">
            <Sparkles className="mt-0.5 h-5 w-5 flex-none text-teal-700" />
            <div>
              <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-slate-600">
                Success signal
              </p>
              <p className="mt-1 text-sm font-semibold leading-6 text-slate-800">
                Keep the technique only if the re-test shows a meaningful improvement in {sub.reassess.toLowerCase()} without symptom worsening.
              </p>
            </div>
          </div>
        </div>

        <details className="group mt-5 overflow-hidden rounded-xl border border-slate-200 bg-white" open={index === 0}>
          <summary className="flex cursor-pointer list-none items-center justify-between gap-3 px-4 py-4 text-sm font-bold text-slate-800">
            <span className="flex items-center gap-2">
              <ClipboardCheck className="h-5 w-5 text-teal-700" />
              Full clinical application
            </span>
            <ArrowRight className="h-4 w-4 transition-transform group-open:rotate-90" />
          </summary>

          <div className="border-t border-slate-100 p-4">
            <div className="grid gap-3">
              <TechniqueStep number="1" title="Position the patient" text={sub.patientSetup} />
              <TechniqueStep number="2" title="Set the contact" text={sub.contact} />
              <TechniqueStep number="3" title="Apply the technique" text={sub.direction} />
              <TechniqueStep
                number="4"
                title="Dose & re-test"
                text={sub.dosage + " Re-test: " + sub.reassess}
              />
            </div>

            {sub.clinicalPearl ? (
              <div className="mt-4 rounded-xl border border-emerald-200 bg-emerald-50/70 p-4">
                <div className="flex items-start gap-3">
                  <Lightbulb className="mt-0.5 h-5 w-5 flex-none text-emerald-700" />
                  <div>
                    <p className="text-xs font-bold uppercase tracking-wide text-emerald-800">Clinical pearl</p>
                    <p className="mt-1 text-sm leading-6 text-slate-700">{sub.clinicalPearl}</p>
                  </div>
                </div>
              </div>
            ) : null}

            {sub.safetyNote ? (
              <div className="mt-3 rounded-xl border border-amber-200 bg-amber-50/70 p-4">
                <div className="flex items-start gap-3">
                  <AlertTriangle className="mt-0.5 h-5 w-5 flex-none text-amber-700" />
                  <div>
                    <p className="text-xs font-bold uppercase tracking-wide text-amber-800">Safety / avoid</p>
                    <p className="mt-1 text-sm leading-6 text-slate-700">{sub.safetyNote}</p>
                  </div>
                </div>
              </div>
            ) : null}
          </div>
        </details>
      </div>
    </article>
  );
}

export default async function RegionalManualDetailPage({ params }: PageProps) {
  const { slug } = await params;
  const item = getRegionalManualApplication(slug);
  if (!item) notFound();

  const isTechniqueSpecific = isTechniqueSpecificRegionalApplication(item);
  const clinicalStory = regionalClinicalStories[item.slug];
  const lessonVoice = manualTherapyLessonWeaves[item.techniqueSlug];
  const vignette = regionalManualVignettes[item.slug];
  const subTechniques = clinicalStory
    ? []
    : getRegionalSubTechniques(item.techniqueSlug, item.region);
  const techniqueVisuals = getManualTherapyVisuals(item.slug);

  return (
    <div className="container-content section-padding pb-20">
      <a
        href="/manual-therapy/regions"
        className="inline-flex items-center gap-1 text-sm font-bold text-violet-700"
      >
        <ArrowLeft className="h-4 w-4" />
        Regional Manual Therapy
      </a>

      {/* Hero - cleaner */}
      <section className="mt-5 overflow-hidden rounded-3xl bg-gradient-to-br from-violet-700 via-indigo-800 to-slate-950 p-7 text-white shadow-xl sm:p-10">
        <div className="flex flex-wrap gap-2">
          <span className="rounded-full border border-white/15 bg-white/10 px-3 py-1 text-xs font-bold">
            {item.region}
          </span>
          <span className="rounded-full border border-white/15 bg-white/10 px-3 py-1 text-xs font-bold">
            {item.techniqueName}
          </span>
          <span className="rounded-full border border-white/15 bg-white/10 px-3 py-1 text-xs font-bold">
            {isTechniqueSpecific ? "Technique-specific guide" : "General regional overview"}
          </span>
        </div>

        <p className="mt-5 text-xs font-bold uppercase tracking-[0.2em] text-cyan-100">
          {isTechniqueSpecific ? "PNA Clinical Application Guide" : "PNA Regional Principles · Overview"}
        </p>

        <h1 className="mt-2 max-w-4xl text-3xl font-bold leading-tight text-white sm:text-5xl">
          {item.title}
        </h1>
        <p className="mt-5 max-w-3xl text-base leading-8 text-indigo-50 sm:text-lg">
          {clinicalStory
            ? clinicalStory.title + " — Step into the treatment room, follow the clinical clues, and discover what deserves the next decision."
            : "What changes when " + item.techniqueName + " meets the " + item.region.toLowerCase() + "? Start with the patient's movement, assess safely, and see what the re-test reveals."}
        </p>

        <div className="mt-6 flex flex-wrap gap-3 text-sm font-semibold">
          <span className="inline-flex items-center gap-2 rounded-full bg-white/10 px-4 py-2">
            <Sparkles className="h-4 w-4" />
            {clinicalStory ? "A complete region-specific lesson" : subTechniques.length + " specific variations"}
          </span>
          <span className="inline-flex items-center gap-2 rounded-full bg-white/10 px-4 py-2">
            <ShieldCheck className="h-4 w-4" />
            Clinical re-test built in
          </span>
          {techniqueVisuals.length ? (
            <a
              href={"/visual-lab/manual-therapy/" + item.slug}
              className="inline-flex items-center gap-2 rounded-full bg-white px-4 py-2 font-bold text-violet-800"
            >
              See optional technique visuals
              <ArrowRight className="h-4 w-4" />
            </a>
          ) : null}
        </div>
      </section>

      {/* Important notice for general overviews */}
      {!isTechniqueSpecific ? (
        <section className="mt-8 rounded-2xl border border-amber-200 bg-amber-50/70 p-5 sm:p-6">
          <div className="flex items-start gap-3">
            <AlertTriangle className="mt-1 h-5 w-5 flex-none text-amber-800" />
            <div>
              <h2 className="text-lg font-bold text-slate-900">Important: this is a clinical framework, not a complete technique protocol.</h2>
              <p className="mt-2 text-[15px] leading-7 text-slate-700">
                This page was generated from broader regional principles. It can help you frame assessment, patient comfort, safety and reassessment, but its generic positioning, contact and dosage text must not be treated as technique-specific hands-on instruction. Study a detailed, individually authored procedure and use supervised practical training.
              </p>
              <a href={"/manual-therapy/" + item.techniqueSlug} className="mt-3 inline-flex text-sm font-bold text-teal-800 underline underline-offset-4">
                Read the parent technique and its specific clinical methods
              </a>
            </div>
          </div>
        </section>
      ) : null}

      {item.applicability === "Not routine" ? (
        <section className="mt-8 rounded-2xl border border-amber-200 bg-amber-50/70 p-5 sm:p-6">
          <div className="flex items-start gap-3">
            <AlertTriangle className="mt-0.5 h-6 w-6 flex-none text-amber-700" />
            <div>
              <p className="font-bold text-slate-900">Not a routine first-line choice for this region</p>
              <p className="mt-2 text-[15px] leading-7 text-slate-700">
                Use only after screening, with a clear clinical rationale, and stop if the response is not useful or symptoms worsen.
              </p>
            </div>
          </div>
        </section>
      ) : null}

      {/* Sub-techniques / variations */}
      {subTechniques.length > 0 ? (
        <section className="mt-12">
          <div className="mb-6">
            <p className="text-xs font-bold uppercase tracking-[0.18em] text-teal-700">Specific variations</p>
            <h2 className="mt-2 font-serif text-2xl font-bold text-slate-900 sm:text-3xl">
              How this technique is applied in the {item.region.toLowerCase()}
            </h2>
            <p className="mt-3 max-w-3xl text-[15px] leading-7 text-slate-600">
              Each variation below is written so you can follow patient setup, contact, direction, dose and the re-test that decides whether the technique earned a place in the plan.
            </p>
          </div>

          <div className="grid gap-6">
            {subTechniques.map((sub, index) => (
              <DeepTechniqueCard
                key={sub.name}
                sub={sub}
                index={index}
                region={item.region}
                techniqueSlug={item.techniqueSlug}
              />
            ))}
          </div>
        </section>
      ) : null}

      {/* Clinical story / learning lab if present */}
      {clinicalStory ? (
        <section className="mt-12">
          <RegionalLearningLab
            story={clinicalStory}
            challenge={regionalClinicalChallenges[item.slug]}
            lessonVoice={lessonVoice}
            vignette={vignette}
          />
        </section>
      ) : null}

      {/* Safety */}
      {item.safety?.length ? (
        <section className="mt-12 rounded-2xl border border-slate-200 bg-white">
          <div className="border-b border-slate-100 p-5">
            <h2 className="flex items-center gap-2 text-lg font-bold text-slate-900">
              <ShieldAlert className="h-5 w-5 text-amber-600" />
              Safety / do not apply when…
            </h2>
          </div>
          <div className="space-y-3 p-5">
            {item.safety.map((entry) => (
              <div key={entry} className="flex gap-3 rounded-xl bg-amber-50/50 p-3">
                <ShieldAlert className="mt-1 h-4 w-4 flex-none text-amber-600" />
                <p className="text-sm leading-6 text-slate-700">{entry}</p>
              </div>
            ))}
          </div>
        </section>
      ) : null}

      {/* Clinical rule */}
      <section className="mt-10 rounded-2xl border border-slate-200 bg-slate-50 p-6">
        <div className="flex items-start gap-3">
          <Lightbulb className="mt-0.5 h-5 w-5 flex-none text-teal-700" />
          <div>
            <h2 className="font-bold text-slate-900">Clinical rule</h2>
            <p className="mt-2 text-[15px] leading-7 text-slate-600">
              A technically correct technique is not automatically a useful technique. Keep it only when the patient's pain, range or function improves in a clinically meaningful way, then transfer that gain into active movement, loading or self-management.
            </p>
          </div>
        </div>
      </section>

      {/* Bottom nav */}
      <div className="mt-12 flex flex-wrap gap-3">
        <a
          href={"/manual-therapy/" + item.techniqueSlug}
          className="inline-flex items-center gap-2 rounded-xl bg-teal-700 px-5 py-3 text-sm font-bold text-white hover:bg-teal-800"
        >
          Study parent technique
          <ArrowRight className="h-4 w-4" />
        </a>
        <a
          href="/manual-therapy/regions"
          className="rounded-xl border border-slate-200 bg-white px-5 py-3 text-sm font-bold text-slate-700 hover:bg-slate-50"
        >
          Browse other regions
        </a>
      </div>
    </div>
  );
}
