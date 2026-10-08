import type { Metadata } from "next";
import { notFound } from "next/navigation";
import {
  Activity,
  AlertTriangle,
  ArrowLeft,
  ArrowRight,
  CheckCircle2,
  CircleDot,
  ClipboardCheck,
  Gauge,
  Hand,
  Lightbulb,
  Move,
  RotateCcw,
  ShieldAlert,
  ShieldCheck,
  Sparkles,
  Target,
  UserRound,
  UsersRound,
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
import CloudinaryClinicalImage from "@/components/clinical/CloudinaryClinicalImage";
import {
  getManualTherapy3DAlt,
  getManualTherapy3DAssetPublicId,
  cloudinary3DEnabled,
} from "@/lib/manual-therapy-3d-assets";
import { getManualTherapyVisuals } from "@/lib/manual-therapy-visuals";
import { EditorialBlock } from "@/components/manual-therapy/EditorialBlock";
import { regionalClinicalStories, regionalClinicalChallenges } from "@/lib/manual-therapy-regional-stories";
import { manualTherapyLessonWeaves } from "@/lib/manual-therapy-lesson-weave";
import { regionalManualVignettes } from "@/lib/manual-therapy-regional-vignettes";
import { RegionalAttentionReset } from "@/components/manual-therapy/AttentionReset";
import { RegionalLearningLab } from "@/components/manual-therapy/RegionalLearningLab";
import { generalRegionStoryPrompts } from "@/lib/manual-therapy-general-region-scenes";

type PageProps = {
  params: Promise<{ slug: string }>;
};

const deepCardThemes = [
  {
    band: "from-violet-600 to-indigo-600",
    chip: "border-violet-100 bg-violet-50 text-violet-700",
    number: "bg-violet-600",
    soft: "border-violet-100 bg-violet-50/70",
  },
  {
    band: "from-cyan-600 to-teal-600",
    chip: "border-cyan-100 bg-cyan-50 text-cyan-700",
    number: "bg-cyan-600",
    soft: "border-cyan-100 bg-cyan-50/70",
  },
  {
    band: "from-emerald-600 to-teal-600",
    chip: "border-emerald-100 bg-emerald-50 text-emerald-700",
    number: "bg-emerald-600",
    soft: "border-emerald-100 bg-emerald-50/70",
  },
  {
    band: "from-fuchsia-600 to-violet-600",
    chip: "border-fuchsia-100 bg-fuchsia-50 text-fuchsia-700",
    number: "bg-fuchsia-600",
    soft: "border-fuchsia-100 bg-fuchsia-50/70",
  },
];

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

function SnapshotCard({
  label,
  value,
  icon: Icon,
  tone,
}: {
  label: string;
  value: string;
  icon: typeof Target;
  tone: string;
}) {
  return (
    <div className={"rounded-2xl border p-4 shadow-sm " + tone}>
      <div className="flex items-center gap-2">
        <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-white shadow-sm">
          <Icon className="h-4 w-4" />
        </span>
        <p className="text-[11px] font-bold uppercase tracking-[0.15em] text-navy-500">
          {label}
        </p>
      </div>
      <p className="mt-3 text-sm font-semibold leading-6 text-navy-800">
        {value}
      </p>
    </div>
  );
}

function TechniqueStep({
  number,
  title,
  text,
  numberTone,
}: {
  number: string;
  title: string;
  text: string;
  numberTone: string;
}) {
  return (
    <div className="relative flex gap-3 rounded-2xl border border-grey-100 bg-grey-50/60 p-4">
      <span
        className={
          "flex h-8 w-8 flex-none items-center justify-center rounded-full text-xs font-bold text-white shadow-sm " +
          numberTone
        }
      >
        {number}
      </span>
      <div>
        <p className="text-sm font-bold text-navy-800">{title}</p>
        <p className="mt-1 text-sm leading-6 text-navy-600">{text}</p>
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
  const theme = deepCardThemes[index % deepCardThemes.length];
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
    <article className="overflow-hidden rounded-3xl border border-grey-200 bg-white shadow-sm transition hover:-translate-y-0.5 hover:shadow-lg">
      <div className={"h-1.5 bg-gradient-to-r " + theme.band} />

      <div className="p-5 sm:p-6">
        <div className="flex items-start gap-4">
          <span
            className={
              "flex h-12 w-12 flex-none items-center justify-center rounded-2xl text-sm font-bold text-white shadow-sm " +
              theme.number
            }
          >
            {String(index + 1).padStart(2, "0")}
          </span>

          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap gap-2">
              <span
                className={
                  "rounded-full border px-2.5 py-1 text-[10px] font-bold uppercase tracking-wide " +
                  theme.chip
                }
              >
                {region}
              </span>
              <span className="rounded-full border border-teal-100 bg-teal-50 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wide text-teal-700">
                {sub.target}
              </span>
            </div>

            <h3 className="mt-3 text-xl font-bold leading-tight text-navy-900 sm:text-2xl">
              {sub.name}
            </h3>
            <p className="mt-3 text-sm leading-7 text-navy-600">
              One question matters more than the name of this variation: will the patient notice
              a useful change in <strong className="text-navy-900">{sub.reassess}</strong>?
              The careful re-test gets the final word.
            </p>
          </div>
        </div>

        <div className={"mt-5 rounded-2xl border p-4 " + theme.soft}>
          <div className="flex items-start gap-3">
            <Target className="mt-0.5 h-5 w-5 flex-none" />
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.14em] text-navy-500">
                The change we are looking for
              </p>
              <p className="mt-1 text-sm font-semibold leading-6 text-navy-800">
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
          <div className="rounded-2xl border border-blue-100 bg-blue-50/70 p-4">
            <div className="flex items-center gap-2 text-blue-800">
              <CircleDot className="h-4 w-4" />
              <p className="text-xs font-bold uppercase tracking-wide">
                Primary target
              </p>
            </div>
            <p className="mt-2 text-sm font-semibold leading-6 text-navy-800">
              {sub.target}
            </p>
          </div>

          <div className="rounded-2xl border border-teal-100 bg-teal-50/70 p-4">
            <div className="flex items-center gap-2 text-teal-800">
              <RotateCcw className="h-4 w-4" />
              <p className="text-xs font-bold uppercase tracking-wide">
                The movement that tells us
              </p>
            </div>
            <p className="mt-2 text-sm font-semibold leading-6 text-navy-800">
              {sub.reassess}
            </p>
          </div>
        </div>

        <div className="mt-4">
          <ClinicalCompareStrip
            patientFocus={sub.clinicalGoal}
            therapistCheck={sub.reassess}
          />
        </div>

        <div className="mt-4 rounded-2xl border border-indigo-100 bg-gradient-to-r from-indigo-50 to-violet-50 p-4">
          <div className="flex items-start gap-3">
            <Sparkles className="mt-0.5 h-5 w-5 flex-none text-indigo-700" />
            <div>
              <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-indigo-700">
                Success signal
              </p>
              <p className="mt-1 text-sm font-semibold leading-6 text-navy-800">
                Keep the technique only if the re-test shows a meaningful improvement in {sub.reassess.toLowerCase()} without symptom worsening.
              </p>
            </div>
          </div>
        </div>

        <details className="group mt-5 overflow-hidden rounded-2xl border border-grey-200 bg-white" open={index === 0}>
          <summary className="flex cursor-pointer list-none items-center justify-between gap-3 px-4 py-4 text-sm font-bold text-navy-800">
            <span className="flex items-center gap-2">
              <ClipboardCheck className="h-5 w-5 text-violet-700" />
              Full clinical application
            </span>
            <ArrowRight className="h-4 w-4 transition-transform group-open:rotate-90" />
          </summary>

          <div className="border-t border-grey-100 p-4">
            <div className="grid gap-3">
              <TechniqueStep
                number="1"
                title="Position the patient"
                text={sub.patientSetup}
                numberTone={theme.number}
              />
              <TechniqueStep
                number="2"
                title="Set the contact"
                text={sub.contact}
                numberTone={theme.number}
              />
              <TechniqueStep
                number="3"
                title="Apply the technique"
                text={sub.direction}
                numberTone={theme.number}
              />
              <TechniqueStep
                number="4"
                title="Dose & re-test"
                text={sub.dosage + " Re-test: " + sub.reassess}
                numberTone={theme.number}
              />
            </div>

            {sub.clinicalPearl ? (
              <div className="mt-4 rounded-2xl border border-emerald-200 bg-emerald-50 p-4">
                <div className="flex items-start gap-3">
                  <Lightbulb className="mt-0.5 h-5 w-5 flex-none text-emerald-700" />
                  <div>
                    <p className="text-xs font-bold uppercase tracking-wide text-emerald-800">
                      Clinical pearl
                    </p>
                    <p className="mt-1 text-sm leading-6 text-navy-700">
                      {sub.clinicalPearl}
                    </p>
                  </div>
                </div>
              </div>
            ) : null}

            {sub.safetyNote ? (
              <div className="mt-3 rounded-2xl border border-amber-200 bg-amber-50 p-4">
                <div className="flex items-start gap-3">
                  <AlertTriangle className="mt-0.5 h-5 w-5 flex-none text-amber-700" />
                  <div>
                    <p className="text-xs font-bold uppercase tracking-wide text-amber-800">
                      Safety / avoid
                    </p>
                    <p className="mt-1 text-sm leading-6 text-navy-700">
                      {sub.safetyNote}
                    </p>
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
    <div className="container-content section-padding pb-28">
      <a
        href="/manual-therapy/regions"
        className="inline-flex items-center gap-1 text-sm font-bold text-violet-700 transition hover:gap-2"
      >
        <ArrowLeft className="h-4 w-4" />
        Regional Manual Therapy
      </a>

      <section className="relative mt-5 overflow-hidden rounded-[2rem] bg-gradient-to-br from-violet-700 via-indigo-800 to-slate-950 p-7 text-white shadow-xl sm:p-10">
        <div className="pointer-events-none absolute -right-16 -top-16 h-48 w-48 rounded-full bg-cyan-400/15 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-20 -left-12 h-52 w-52 rounded-full bg-violet-300/15 blur-3xl" />

        <div className="relative">
          <div className="flex flex-wrap gap-2">
            <span className="rounded-full border border-white/15 bg-white/10 px-3 py-1 text-xs font-bold">
              {item.region}
            </span>
            <span className="rounded-full border border-white/15 bg-white/10 px-3 py-1 text-xs font-bold">
              {item.techniqueName}
            </span>
            <span className="rounded-full border border-cyan-200/20 bg-cyan-300/10 px-3 py-1 text-xs font-bold text-cyan-50">
              {isTechniqueSpecific ? "Technique-specific guide" : "General regional overview"}
            </span>
          </div>

          <p className="mt-5 text-xs font-bold uppercase tracking-[0.22em] text-cyan-100">
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
                className="inline-flex items-center gap-2 rounded-full bg-white px-4 py-2 font-bold text-violet-800 shadow-sm transition hover:bg-violet-50"
              >
                See optional technique visuals
                <ArrowRight className="h-4 w-4" />
              </a>
            ) : null}
          </div>
        </div>
      </section>
      {!isTechniqueSpecific ? (
        <section data-pna-content-depth="general-overview" className="mt-6 rounded-3xl border border-amber-200 bg-amber-50 p-5 sm:p-6">
          <div className="flex items-start gap-3">
            <AlertTriangle className="mt-1 h-5 w-5 flex-none text-amber-800" />
            <div>
              <h2 className="text-lg font-bold text-slate-900">Important: this is a clinical framework, not a complete technique protocol.</h2>
              <p className="mt-2 text-sm leading-7 text-slate-700">
                This page was generated from broader regional principles. It can help you frame
                assessment, patient comfort, safety and reassessment, but its generic positioning,
                contact and dosage text must not be treated as technique-specific hands-on instruction.
                Study a detailed, individually authored procedure and use supervised practical training.
              </p>
              <a href={"/manual-therapy/" + item.techniqueSlug} className="mt-3 inline-flex text-sm font-bold text-teal-800 underline underline-offset-4">
                Read the parent technique and its specific clinical methods
              </a>
            </div>
          </div>
        </section>
      ) : null}

      {item.applicability === "Not routine" ? (
        <section className="mt-6 rounded-3xl border border-amber-200 bg-gradient-to-r from-amber-50 to-orange-50 p-5 shadow-sm sm:p-6">
          <div className="flex items-start gap-3">
            <AlertTriangle className="mt-0.5 h-6 w-6 flex-none text-amber-700" />
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.2em] text-amber-700">
                Clinical applicability
              </p>
              <h2 className="mt-1 text-xl font-bold text-navy-800">
                Not a routine first-choice application in this region
              </h2>
              <p className="mt-2 text-sm leading-6 text-navy-600">
                This guide is included for completeness. Do not force the
                technique into this region; use it only when examination
                identifies a relevant target and the clinician has appropriate
                training.
              </p>
            </div>
          </div>
        </section>
      ) : null}

      {item.region === "Cervical" || item.region === "Lumbar" ? (
        <aside className="mt-7 rounded-2xl border border-indigo-200 bg-indigo-50/60 p-5 sm:p-6">
          <h2 className="text-base font-bold text-slate-900">Evidence & screening: read this before the technique</h2>
          <p className="mt-2 text-sm leading-7 text-slate-700">
            Clinical practice guidelines address patient presentations and the wider care plan.
            They are not proof that every named manual technique or automatically generated
            regional contact is effective. Use individual examination and current safety screening.
          </p>
          {item.region === "Cervical" ? (
            <div className="mt-3 flex flex-wrap gap-4">
              <a href="https://www.ifompt.org/news-resources/resources/frameworks-research-and-clinical-resources/"
                target="_blank" rel="noopener noreferrer" className="text-sm font-bold text-indigo-800 underline underline-offset-4">
                IFOMPT cervical vascular-screening framework
              </a>
              <a href="https://pubmed.ncbi.nlm.nih.gov/28666405/"
                target="_blank" rel="noopener noreferrer" className="text-sm font-bold text-indigo-800 underline underline-offset-4">
                Neck Pain clinical practice guideline
              </a>
            </div>
          ) : (
            <a href="https://pubmed.ncbi.nlm.nih.gov/34719942/"
              target="_blank" rel="noopener noreferrer" className="mt-3 inline-flex text-sm font-bold text-indigo-800 underline underline-offset-4">
              2021 Low Back Pain clinical practice guideline
            </a>
          )}
        </aside>
      ) : null}

      {clinicalStory ? (
        <article data-pna-content-depth="authored-clinical-story" className="mt-8 overflow-hidden rounded-3xl border border-teal-200 bg-white shadow-sm">
          <div className="border-b border-teal-100 bg-gradient-to-r from-teal-50 via-white to-indigo-50 px-6 py-7 sm:px-9">
            <p className="text-xs font-bold uppercase tracking-[0.18em] text-teal-800">Inside the clinic · Learn it, see it, remember it</p>
            <h2 className="mt-3 font-serif text-2xl font-bold leading-snug text-slate-900 sm:text-3xl">{clinicalStory.title}</h2>
            <p className="mt-3 text-sm leading-7 text-slate-600">A fictional clinical teaching case. The reasoning matters more than any single expected outcome.</p>
          </div>
          <div className="grid gap-7 px-6 py-7 sm:px-9 sm:py-9">
            <section aria-label="First clinical clue">
              <p className="text-xs font-bold uppercase tracking-[0.15em] text-teal-700">01 · The patient arrives</p>
              <p className="mt-2 text-base leading-8 text-slate-800">{clinicalStory.scene}</p>
            </section>
            <section aria-label="Therapist's decision">
              <p className="text-xs font-bold uppercase tracking-[0.15em] text-teal-700">02 · The therapist's decision</p>
              <p className="mt-2 text-base leading-8 text-slate-800">{clinicalStory.clinicalDecision}</p>
            </section>
            <section aria-label="Reassessment">
              <p className="text-xs font-bold uppercase tracking-[0.15em] text-teal-700">03 · After the hands leave</p>
              <p className="mt-2 text-base leading-8 text-slate-800">{clinicalStory.retest}</p>
            </section>
            <p className="border-l-4 border-teal-400 pl-5 font-serif text-lg italic leading-8 text-slate-800">{clinicalStory.punchline}</p>
            {regionalClinicalChallenges[item.slug] ? (
              <section className="rounded-2xl border border-teal-200 bg-teal-50/50 p-5" aria-label="Clinical reasoning challenge">
                <p className="text-xs font-bold uppercase tracking-[0.16em] text-teal-800">Your clinical curveball</p>
                <p className="mt-3 text-sm font-semibold leading-7 text-slate-800">
                  {regionalClinicalChallenges[item.slug].question}
                </p>
                <details className="group mt-4 border-t border-teal-200 pt-4">
                  <summary className="cursor-pointer font-bold text-teal-900 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-teal-600">
                    Think first, then reveal the reasoning
                  </summary>
                  <p className="mt-3 rounded-xl bg-white p-4 text-sm leading-7 text-slate-700">
                    <strong className="text-teal-900">Clinical reasoning:</strong> {regionalClinicalChallenges[item.slug].answer}
                  </p>
                </details>
              </section>
            ) : null}
            <aside className="rounded-2xl border border-indigo-200 bg-indigo-50/60 p-5">
              <p className="text-xs font-bold uppercase tracking-[0.14em] text-indigo-800">The evidence reality check</p>
              <p className="mt-2 text-sm leading-7 text-slate-700">{clinicalStory.evidenceCaveat}</p>
              <a className="mt-3 inline-flex text-sm font-bold text-indigo-800 underline underline-offset-4"
                href={clinicalStory.evidenceUrl} target="_blank" rel="noopener noreferrer">
                Read the supporting publication or guideline
              </a>
            </aside>
          </div>
        </article>
      ) : null}
      {!clinicalStory && !vignette ? (
      <aside data-pna-story="regional-overview-v1" className="mt-8 rounded-3xl border border-cyan-200 bg-gradient-to-r from-white via-cyan-50 to-indigo-50 p-6 shadow-sm sm:p-8">
        <p className="text-xs font-bold uppercase tracking-[0.18em] text-teal-700">The first question</p>
        <h2 className="mt-2 text-xl font-bold leading-8 text-navy-900 sm:text-2xl">
          Would this approach change what the patient can actually do?
        </h2>
        <p className="mt-3 text-sm leading-8 text-navy-700">{generalRegionStoryPrompts[item.region].scene}</p>
        <p className="mt-3 text-sm leading-7 text-navy-700">
          Bring the general principles back to this presentation: {item.clinicalUse[0]}
        </p>
        <p className="mt-3 text-sm font-semibold leading-7 text-teal-900">
          {generalRegionStoryPrompts[item.region].question}
        </p>
        {lessonVoice ? (
          <p className="mt-4 border-l-4 border-cyan-500 pl-4 font-serif text-base italic leading-8 text-teal-900">
            {lessonVoice.closer}
          </p>
        ) : null}
      </aside>
      ) : null}

      {isTechniqueSpecific && !clinicalStory && vignette ? (
        <article className="mt-8 overflow-hidden rounded-3xl border border-teal-200 bg-white shadow-sm" data-pna-engagement="regional-reading-v3">
          <div className="border-b border-teal-100 bg-gradient-to-r from-teal-50 to-white p-6 sm:p-8">
            <p className="text-xs font-bold uppercase tracking-[0.17em] text-teal-800">The clinical scene · Not just another list of steps</p>
            <h2 className="mt-3 font-serif text-2xl font-bold leading-snug text-slate-900">{vignette.title}</h2>
            <p className="mt-2 text-xs leading-6 text-slate-500">A fictional situation used to teach clinical judgment, not a reported treatment result.</p>
          </div>
          <div className="space-y-5 p-6 sm:p-8">
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.16em] text-teal-700">Scene 1 · The patient's problem</p>
              <p className="mt-2 text-[15px] leading-8 text-slate-700">{vignette.scene}</p>
            </div>
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.16em] text-teal-700">Scene 2 · What the clinician considers</p>
              <p className="mt-2 text-[15px] leading-8 text-slate-700">{vignette.decision}</p>
            </div>
            <p className="border-l-4 border-cyan-500 pl-4 font-serif text-lg italic leading-8 text-slate-800">{vignette.sticky}</p>
            {lessonVoice ? (
              <aside className="rounded-xl border border-indigo-100 bg-indigo-50/60 p-5">
                <p className="text-xs font-bold uppercase tracking-[0.16em] text-indigo-800">Behind the technique · The clever part</p>
                <p className="mt-2 text-[15px] leading-8 text-slate-700">{lessonVoice.method}</p>
              </aside>
            ) : null}
            <div className="rounded-xl border border-teal-100 bg-teal-50/60 p-5">
              <p className="text-xs font-bold uppercase tracking-[0.16em] text-teal-800">Scene 3 · The patient gets the final say</p>
              <p className="mt-2 text-[15px] leading-8 text-slate-700">
                The chosen comparable sign is <strong>{item.reassess[0]}</strong>.
                After the trial, repeat it under similar conditions and let the response guide the next clinical decision.
              </p>
            </div>
            <a href={"/manual-therapy/" + item.techniqueSlug + "#clinical-story"}
              className="inline-flex text-sm font-bold text-indigo-800 underline underline-offset-4">
              Explore the complete story behind this manual therapy family
            </a>
          </div>
        </article>
      ) : null}

      {isTechniqueSpecific && clinicalStory && lessonVoice ? (
        <aside className="mt-6 rounded-2xl border-l-4 border-indigo-500 bg-indigo-50/70 px-5 py-5">
          <p className="text-xs font-bold uppercase tracking-[0.18em] text-indigo-800">One more scientific plot twist</p>
          <p className="mt-3 text-[15px] leading-8 text-slate-700">{lessonVoice.science}</p>
        </aside>
      ) : null}

      <section className="mt-8">
        <div className="flex items-end justify-between gap-4">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.2em] text-violet-700">
              Quick Clinical Snapshot
            </p>
            <h2 className="mt-2 text-2xl font-bold text-navy-900">
              Read this before you touch the patient
            </h2>
          </div>
        </div>

        <div className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          <SnapshotCard
            label="Best used when"
            value={item.clinicalUse[0]}
            icon={Target}
            tone="border-emerald-100 bg-emerald-50/70"
          />
          <SnapshotCard
            label="Primary force"
            value={item.forceDirection[0]}
            icon={Move}
            tone="border-violet-100 bg-violet-50/70"
          />
          <SnapshotCard
            label="Typical dose"
            value={item.dosage[0]}
            icon={Gauge}
            tone="border-amber-100 bg-amber-50/70"
          />
          <SnapshotCard
            label="Main re-test"
            value={item.reassess[0]}
            icon={RotateCcw}
            tone="border-cyan-100 bg-cyan-50/70"
          />
        </div>
      </section>

      <section className="mt-8 rounded-3xl border border-indigo-100 bg-white p-5 shadow-sm sm:p-6">
        <div className="flex items-center gap-3">
          <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-indigo-50 text-indigo-700">
            <Activity className="h-5 w-5" />
          </span>
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.18em] text-indigo-600">
              Clinical Flow
            </p>
            <h2 className="text-xl font-bold text-navy-900">
              Screen → Position → Apply → Re-test
            </h2>
          </div>
        </div>

        <div className="mt-5 grid gap-3 sm:grid-cols-4">
          {[
            ["01", "Screen", "Confirm indication, red flags and comparable sign."],
            ["02", "Position", "Stabilize the patient and isolate the target."],
            ["03", "Apply", "Use the lowest effective force and correct direction."],
            ["04", "Re-test", "Keep it only if pain, movement or function improves."],
          ].map(([number, label, text]) => (
            <div
              key={number}
              className="rounded-2xl border border-indigo-100 bg-indigo-50/50 p-4"
            >
              <span className="text-xs font-bold text-indigo-500">{number}</span>
              <p className="mt-1 font-bold text-navy-800">{label}</p>
              <p className="mt-1 text-xs leading-5 text-navy-600">{text}</p>
            </div>
          ))}
        </div>
      </section>

      {techniqueVisuals.length ? (
        <section className="mt-8">
          <div className="flex flex-wrap items-end justify-between gap-4">
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.2em] text-violet-700">
                Verified Clinical Visuals
              </p>
              <h2 className="mt-2 text-2xl font-bold text-navy-900">
                See the exact contact, anatomy and force direction
              </h2>
              <p className="mt-2 max-w-3xl text-sm leading-6 text-navy-600">
                These images are published only after the illustrated patient position,
                therapist contact, target anatomy and force direction have been checked
                against the technique description.
              </p>
            </div>
            <span className="rounded-full border border-violet-100 bg-violet-50 px-4 py-2 text-xs font-bold text-violet-700">
              Cloudinary optimized · lazy loaded
            </span>
          </div>

          <div className="mt-5 grid gap-5 lg:grid-cols-2">
            {techniqueVisuals.map((visual, index) => (
              <CloudinaryClinicalImage
                key={visual.id}
                publicId={visual.path}
                alt={visual.alt}
                caption={visual.caption}
                label={visual.title}
                crop={visual.crop}
                eager={index === 0}
                className={visual.group === "Overview" ? "lg:col-span-2" : ""}
              />
            ))}
          </div>
        </section>
      ) : null}

      {subTechniques.length ? (
        <section className="mt-10">
          <div className="rounded-[2rem] bg-gradient-to-r from-indigo-950 via-violet-900 to-indigo-950 p-6 text-white shadow-lg sm:p-8">
            <div className="flex flex-wrap items-end justify-between gap-5">
              <div>
                <p className="text-xs font-bold uppercase tracking-[0.2em] text-cyan-200">
                  Deep Technique Library
                </p>
                <h2 className="mt-2 text-2xl font-bold text-white sm:text-3xl">
                  Every variation changes the clinical story
                </h2>
                <p className="mt-3 max-w-3xl text-sm leading-6 text-indigo-100">
                  Explore the variations for {item.region} one by one. Each starts with a clinical
                  decision, then reveals its target, positioning, direction, dose, safety and
                  the movement you must recheck afterward.
                </p>
              </div>

              <span className="rounded-full border border-white/15 bg-white/10 px-4 py-2 text-sm font-bold">
                {subTechniques.length} variations
              </span>
            </div>
          </div>

          <div className="mt-5 grid gap-5 lg:grid-cols-2">
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

      <section className="mt-10 overflow-hidden rounded-3xl border border-violet-200 bg-gradient-to-r from-violet-50 via-white to-cyan-50 p-6 shadow-sm sm:p-8">
        <div className="flex items-start gap-3">
          <span className="flex h-11 w-11 flex-none items-center justify-center rounded-2xl bg-violet-700 text-white shadow-sm">
            <Move className="h-5 w-5" />
          </span>
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.2em] text-violet-700">
              Visual Force Map
            </p>
            <h2 className="mt-1 text-xl font-bold text-navy-900">
              Remember the treatment pathway
            </h2>
          </div>
        </div>

        <div className="mt-5 rounded-2xl border border-violet-100 bg-white p-5 shadow-sm">
          <p className="text-sm font-semibold leading-7 text-navy-800">
            {item.visualCue}
          </p>
        </div>
        <p className="mt-3 text-xs leading-5 text-navy-500">
          Memory aid only. Use the full positioning and safety instructions
          before applying the technique.
        </p>
      </section>

      <section className="mt-10">
        <p className="text-xs font-bold uppercase tracking-[0.2em] text-violet-700">
          Regional Setup
        </p>
        <h2 className="mt-2 text-2xl font-bold text-navy-900">
          Position, stabilize and deliver the force correctly
        </h2>

        <div className="mt-5 grid gap-5 lg:grid-cols-2">
          <EditorialBlock
            title="When to Use It"
            items={item.clinicalUse}
            icon={Target}
            tone="border-emerald-100 bg-emerald-50/30"
          />
          <EditorialBlock
            title="Patient Position"
            items={item.patientPosition}
            icon={UserRound}
            tone="border-cyan-100 bg-cyan-50/30"
          />
          <EditorialBlock
            title="Therapist Position"
            items={item.therapistPosition}
            icon={UsersRound}
            tone="border-indigo-100 bg-indigo-50/30"
          />
          <EditorialBlock
            title="Stabilization"
            items={item.stabilization}
            icon={Hand}
            tone="border-blue-100 bg-blue-50/30"
          />
          <EditorialBlock
            title={isTechniqueSpecific ? "Exact Contact / Hand Placement" : "General Contact Considerations"}
            items={item.contact}
            icon={Hand}
            tone="border-violet-100 bg-violet-50/30"
          />
          <EditorialBlock
            title={isTechniqueSpecific ? "Force Direction" : "Force Principles — Not a Specific Technique"}
            items={item.forceDirection}
            icon={Move}
            tone="border-fuchsia-100 bg-fuchsia-50/30"
          />
          <EditorialBlock
            title={isTechniqueSpecific ? "Dosage" : "Conservative Dosing Principles"}
            items={item.dosage}
            icon={Gauge}
            tone="border-amber-100 bg-amber-50/30"
          />
          <EditorialBlock
            title="Reassessment"
            items={item.reassess}
            icon={RotateCcw}
            tone="border-teal-100 bg-teal-50/30"
          />
        </div>
      </section>

      {isTechniqueSpecific ? (
        <RegionalAttentionReset techniqueSlug={item.techniqueSlug}
          region={item.region} comparableSign={item.reassess[0] ?? "the original movement"}
          simpleStory={vignette?.sticky} />
      ) : null}

      <section className="mt-8 overflow-hidden rounded-3xl border border-emerald-200 bg-gradient-to-br from-emerald-50 via-white to-teal-50 shadow-sm">
        <div className="border-b border-emerald-100 p-6 sm:p-8">
          <div className="flex items-center gap-3">
            <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-emerald-700 text-white">
              <ClipboardCheck className="h-5 w-5" />
            </span>
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.18em] text-emerald-700">
                Application Sequence
              </p>
              <h2 className="text-2xl font-bold text-navy-900">
                {isTechniqueSpecific ? "Detailed applying method" : "General clinical reasoning sequence · not a technique-specific protocol"}
              </h2>
            </div>
          </div>
        </div>

        <div className="space-y-3 p-5 sm:p-8">
          {item.steps.map((step, index) => (
            <div
              key={step}
              className="flex gap-4 rounded-2xl border border-emerald-100 bg-white p-4 shadow-sm"
            >
              <span className="flex h-9 w-9 flex-none items-center justify-center rounded-full bg-emerald-700 text-xs font-bold text-white">
                {index + 1}
              </span>
              <p className="text-sm leading-6 text-navy-700">{step}</p>
            </div>
          ))}
        </div>
      </section>

      {isTechniqueSpecific ? <RegionalLearningLab slug={item.slug} /> : null}

      <section className="mt-8 grid gap-5 lg:grid-cols-2">
        <div className="overflow-hidden rounded-3xl border border-rose-200 bg-white shadow-sm">
          <div className="flex items-center gap-3 border-b border-rose-100 bg-rose-50 p-5">
            <ShieldAlert className="h-5 w-5 text-rose-700" />
            <h2 className="text-lg font-bold text-navy-900">
              Common practical mistakes
            </h2>
          </div>
          <div className="space-y-3 p-5">
            {item.mistakes.map((entry) => (
              <div
                key={entry}
                className="flex gap-3 rounded-2xl bg-rose-50/50 p-3"
              >
                <AlertTriangle className="mt-1 h-4 w-4 flex-none text-rose-600" />
                <p className="text-sm leading-6 text-navy-700">{entry}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="overflow-hidden rounded-3xl border border-orange-200 bg-white shadow-sm">
          <div className="flex items-center gap-3 border-b border-orange-100 bg-orange-50 p-5">
            <ShieldCheck className="h-5 w-5 text-orange-700" />
            <h2 className="text-lg font-bold text-navy-900">
              Safety / do not apply when…
            </h2>
          </div>
          <div className="space-y-3 p-5">
            {item.safety.map((entry) => (
              <div
                key={entry}
                className="flex gap-3 rounded-2xl bg-orange-50/50 p-3"
              >
                <ShieldAlert className="mt-1 h-4 w-4 flex-none text-orange-600" />
                <p className="text-sm leading-6 text-navy-700">{entry}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="mt-8 rounded-3xl border border-indigo-100 bg-gradient-to-r from-indigo-50 to-violet-50 p-6 shadow-sm">
        <div className="flex items-start gap-3">
          <Lightbulb className="mt-0.5 h-5 w-5 flex-none text-indigo-700" />
          <div>
            <h2 className="font-bold text-navy-900">Clinical rule</h2>
            <p className="mt-2 text-sm leading-6 text-navy-600">
              A technically correct technique is not automatically a useful
              technique. Keep it only when the patient's pain, range or function
              improves in a clinically meaningful way, then transfer that gain
              into active movement, loading or self-management.
            </p>
          </div>
        </div>
      </section>

      <div className="mt-8 flex flex-wrap gap-3">
        <a
          href={"/manual-therapy/" + item.techniqueSlug}
          className="inline-flex items-center gap-2 rounded-xl bg-violet-700 px-5 py-3 text-sm font-bold text-white shadow-sm transition hover:bg-violet-800"
        >
          Study parent technique
          <ArrowRight className="h-4 w-4" />
        </a>
        <a
          href="/manual-therapy/regions"
          className="rounded-xl border border-grey-200 bg-white px-5 py-3 text-sm font-bold text-navy-700 shadow-sm"
        >
          Browse other regions
        </a>
      </div>
    </div>
  );
}
