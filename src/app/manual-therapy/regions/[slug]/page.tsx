import type { Metadata } from "next";
import Link from "next/link";
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
  type ManualRegion,
} from "@/lib/manual-therapy-regional";
import {
  getRegionalSubTechniques,
  type RegionalSubTechnique,
} from "@/lib/manual-therapy-subtechniques";
import {
  AnatomyMiniMap,
  ClinicalCompareStrip,
  ForceDirectionMiniMap,
} from "@/components/manual-therapy/ClinicalMiniVisuals";
import OnDemand3DAnatomy from "@/components/clinical/OnDemand3DAnatomy";
import {
  getManualTherapy3DAlt,
  getManualTherapy3DAssetPublicId,
  cloudinary3DEnabled,
} from "@/lib/manual-therapy-3d-assets";

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
    title: item.title + " | Regional Manual Therapy",
    description: item.clinicalUse[0],
    alternates: {
      canonical:
        "https://physionexusacademy.com/manual-therapy/regions/" + item.slug,
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
    <section
      className={
        "overflow-hidden rounded-3xl border bg-white shadow-sm " + tone
      }
    >
      <div className="flex items-center gap-3 border-b border-black/5 px-5 py-4 sm:px-6">
        <span className="flex h-10 w-10 flex-none items-center justify-center rounded-2xl bg-white shadow-sm ring-1 ring-black/5">
          <Icon className="h-5 w-5" />
        </span>
        <h2 className="text-lg font-bold text-navy-800">{title}</h2>
      </div>
      <ul className="space-y-3 p-5 sm:p-6">
        {items.map((entry) => (
          <li
            key={entry}
            className="flex gap-3 rounded-2xl bg-white/80 p-3 text-sm leading-6 text-navy-600"
          >
            <CheckCircle2 className="mt-1 h-4 w-4 flex-none" />
            <span>{entry}</span>
          </li>
        ))}
      </ul>
    </section>
  );
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
          </div>
        </div>

        <div className={"mt-5 rounded-2xl border p-4 " + theme.soft}>
          <div className="flex items-start gap-3">
            <Target className="mt-0.5 h-5 w-5 flex-none" />
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.14em] text-navy-500">
                Clinical goal
              </p>
              <p className="mt-1 text-sm font-semibold leading-6 text-navy-800">
                {sub.clinicalGoal}
              </p>
            </div>
          </div>
        </div>

        <div className="mt-4 grid gap-3 sm:grid-cols-2">
          <AnatomyMiniMap region={region} target={sub.target} />
          <ForceDirectionMiniMap
            direction={sub.direction}
            techniqueSlug={techniqueSlug}
          />
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
                Best reassessment
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

  const subTechniques = getRegionalSubTechniques(
    item.techniqueSlug,
    item.region,
  );

  return (
    <div className="container-content section-padding pb-28">
      <Link
        href="/manual-therapy/regions"
        className="inline-flex items-center gap-1 text-sm font-bold text-violet-700 transition hover:gap-2"
      >
        <ArrowLeft className="h-4 w-4" />
        Regional Manual Therapy
      </Link>

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
              {item.applicability ?? "Detailed"}
            </span>
          </div>

          <p className="mt-5 text-xs font-bold uppercase tracking-[0.22em] text-cyan-100">
            PNA Clinical Application Guide
          </p>

          <h1 className="mt-2 max-w-4xl text-3xl font-bold leading-tight text-white sm:text-5xl">
            {item.title}
          </h1>

          <div className="mt-6 flex flex-wrap gap-3 text-sm font-semibold">
            <span className="inline-flex items-center gap-2 rounded-full bg-white/10 px-4 py-2">
              <Sparkles className="h-4 w-4" />
              {subTechniques.length} specific variations
            </span>
            <span className="inline-flex items-center gap-2 rounded-full bg-white/10 px-4 py-2">
              <ShieldCheck className="h-4 w-4" />
              Clinical re-test built in
            </span>
          </div>
        </div>
      </section>

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

      {subTechniques.length ? (
        <section className="mt-10">
          <div className="rounded-[2rem] bg-gradient-to-r from-indigo-950 via-violet-900 to-indigo-950 p-6 text-white shadow-lg sm:p-8">
            <div className="flex flex-wrap items-end justify-between gap-5">
              <div>
                <p className="text-xs font-bold uppercase tracking-[0.2em] text-cyan-200">
                  Deep Technique Library
                </p>
                <h2 className="mt-2 text-2xl font-bold text-white sm:text-3xl">
                  Specific variations for {item.region}
                </h2>
                <p className="mt-3 max-w-3xl text-sm leading-6 text-indigo-100">
                  Each card now combines a mini anatomy target map, force-direction
                  cue, best reassessment, patient focus and therapist check before
                  opening into the full four-step application sequence.
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
          <Section
            title="When to Use It"
            items={item.clinicalUse}
            icon={Target}
            tone="border-emerald-100 bg-emerald-50/30"
          />
          <Section
            title="Patient Position"
            items={item.patientPosition}
            icon={UserRound}
            tone="border-cyan-100 bg-cyan-50/30"
          />
          <Section
            title="Therapist Position"
            items={item.therapistPosition}
            icon={UsersRound}
            tone="border-indigo-100 bg-indigo-50/30"
          />
          <Section
            title="Stabilization"
            items={item.stabilization}
            icon={Hand}
            tone="border-blue-100 bg-blue-50/30"
          />
          <Section
            title="Exact Contact / Hand Placement"
            items={item.contact}
            icon={Hand}
            tone="border-violet-100 bg-violet-50/30"
          />
          <Section
            title="Force Direction"
            items={item.forceDirection}
            icon={Move}
            tone="border-fuchsia-100 bg-fuchsia-50/30"
          />
          <Section
            title="Dosage"
            items={item.dosage}
            icon={Gauge}
            tone="border-amber-100 bg-amber-50/30"
          />
          <Section
            title="Reassessment"
            items={item.reassess}
            icon={RotateCcw}
            tone="border-teal-100 bg-teal-50/30"
          />
        </div>
      </section>

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
                Complete applying method
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
        <Link
          href={"/manual-therapy/" + item.techniqueSlug}
          className="inline-flex items-center gap-2 rounded-xl bg-violet-700 px-5 py-3 text-sm font-bold text-white shadow-sm transition hover:bg-violet-800"
        >
          Study parent technique
          <ArrowRight className="h-4 w-4" />
        </Link>
        <Link
          href="/manual-therapy/regions"
          className="rounded-xl border border-grey-200 bg-white px-5 py-3 text-sm font-bold text-navy-700 shadow-sm"
        >
          Browse other regions
        </Link>
      </div>
    </div>
  );
}
