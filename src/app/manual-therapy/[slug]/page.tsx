import type { Metadata } from "next";
import { notFound } from "next/navigation";
import {
  ArrowLeft,
  ArrowRight,
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
  Layers3,
  MapPinned,
} from "lucide-react";
import { manualTherapyTechniques } from "@/lib/all-manual-therapy";
import { worldManualApproaches } from "@/lib/manual-therapy-world";
import { WorldApproachChapter } from "@/components/manual-therapy/WorldApproachChapter";
import { getManualTherapyStory } from "@/lib/manual-therapy-stories";
import { getClinicalEpisode } from "@/lib/manual-therapy-episodes";
import { ClinicalStoryChapter } from "@/components/manual-therapy/ClinicalStoryChapter";
import { getManualTherapyAhaMoment } from "@/lib/manual-therapy-aha-moments";
import { manualTherapyLessonWeaves } from "@/lib/manual-therapy-lesson-weave";
import { manualApplicationGuides } from "@/lib/all-manual-therapy-guides";
import { getApplicationsForTechnique, isTechniqueSpecificRegionalApplication } from "@/lib/manual-therapy-regional";
import {
  manualTherapyMechanisms,
  manualTherapyMechanismEvidence,
} from "@/lib/all-manual-therapy-mechanisms";
import { getManualTherapyExpertProfile } from "@/lib/manual-therapy-expert";
import ClinicalImage from "@/components/clinical/ClinicalImage";
import { getManualTherapyVisuals } from "@/lib/manual-therapy-visuals";
import { getRegionalSubTechniques } from "@/lib/manual-therapy-subtechniques";
import { EditorialBlock } from "@/components/manual-therapy/EditorialBlock";

type PageProps = {
  params: Promise<{ slug: string }>;
};

export function generateStaticParams() {
  return [
    ...manualTherapyTechniques.map((technique) => ({ slug: technique.slug })),
    ...worldManualApproaches.map((approach) => ({ slug: approach.slug })),
  ];
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const technique = manualTherapyTechniques.find((item) => item.slug === slug);
  const worldLesson = worldManualApproaches.find((item) => item.slug === slug);

  if (worldLesson) return {
    title: worldLesson.title + " | World Manual Therapy Encyclopedia",
    description: worldLesson.summary,
    alternates: { canonical: "https://physionexusacademy.com/manual-therapy/" + slug },
  };
  if (!technique) return {};

  return {
    title: technique.name + " | World Manual Therapy Encyclopedia",
    description: technique.summary,
    alternates: {
      canonical: "https://physionexusacademy.com/manual-therapy/" + technique.slug,
    },
  };
}

export default async function ManualTherapyDetailPage({ params }: PageProps) {
  const { slug } = await params;
  const worldLesson = worldManualApproaches.find((item) => item.slug === slug);
  if (worldLesson) return <WorldApproachChapter lesson={worldLesson} />;
  const technique = manualTherapyTechniques.find((item) => item.slug === slug);
  const story = getManualTherapyStory(slug);
  const episode = getClinicalEpisode(slug);
  const aha = getManualTherapyAhaMoment(slug);
  const weave = manualTherapyLessonWeaves[slug];
  const guide = manualApplicationGuides[slug];
  const mechanism = manualTherapyMechanisms[slug];
  const expert = getManualTherapyExpertProfile(slug);
  const visuals = getManualTherapyVisuals(slug);
  const regionalApplications = getApplicationsForTechnique(slug);
  const totalRegionalVariations = regionalApplications.reduce(
    (total, application) =>
      total + getRegionalSubTechniques(slug, application.region).length,
    0,
  );

  if (!technique || !guide || !mechanism || !expert) notFound();

  return (
    <div className="container-content section-padding">
      <a
        href="/manual-therapy"
        className="inline-flex items-center gap-1 text-sm font-bold text-violet-700"
      >
        <ArrowLeft className="h-4 w-4" />
        World Manual Therapy Encyclopedia
      </a>

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
        {story ? (
          <div className="mt-7 max-w-4xl">
            <p className="text-xs font-bold uppercase tracking-[0.2em] text-teal-200">The clinical story</p>
            <h2 className="mt-3 text-2xl font-bold leading-snug text-white sm:text-3xl">{story.headline}</h2>
            <p className="mt-4 max-w-3xl text-base leading-8 text-indigo-50 sm:text-lg">{technique.summary}</p>
            <p className="mt-5 border-l-4 border-teal-300 pl-4 text-base font-semibold leading-7 text-white">
              {story.question}
            </p>
          </div>
        ) : (
          <p className="mt-4 max-w-3xl text-base leading-7 text-violet-50">{technique.summary}</p>
        )}

      </section>

      {episode ? <ClinicalStoryChapter slug={slug} episode={episode} challenge={aha} weave={weave} /> : null}

      <section id="clinical-method" className="mt-8 scroll-mt-28 overflow-hidden rounded-3xl border border-violet-200 bg-gradient-to-br from-violet-50 via-white to-cyan-50">
        <div className="border-b border-violet-100 p-6 sm:p-8">
          <p className="text-xs font-bold uppercase tracking-[0.2em] text-violet-700">
            Practical Application
          </p>
          <h2 className="mt-2 text-2xl font-bold text-navy-800 sm:text-3xl">
            Here is how the technique is actually applied
          </h2>
          <p className="mt-3 max-w-3xl text-sm leading-6 text-navy-600">
            Follow the scene into the clinic. Start with patient setup,
            therapist setup, hand placement, force direction, step-by-step application,
            what you should expect, when to stop and the mistakes that commonly spoil the technique.
          </p>
        </div>
        <div className="grid gap-5 p-5 sm:p-8 lg:grid-cols-2">
          <EditorialBlock title="Patient Position" items={guide.patientPosition} icon={Hand} tone="border-cyan-100 bg-cyan-50/70" />
          <EditorialBlock title="Therapist Position" items={guide.therapistPosition} icon={Hand} tone="border-indigo-100 bg-indigo-50/70" />
          <EditorialBlock title="Exact Hand Placement" items={guide.handPlacement} icon={Hand} tone="border-violet-100 bg-violet-50/70" />
          <EditorialBlock title="Direction & Type of Force" items={guide.forceDirection} icon={Gauge} tone="border-blue-100 bg-blue-50/70" />
        </div>
        {weave ? (
          <aside className="mx-5 mt-1 rounded-2xl border-l-4 border-teal-500 bg-white px-5 py-5 sm:mx-8 sm:px-7">
            <p className="text-xs font-bold uppercase tracking-[0.19em] text-teal-800">The subtle move · What textbook shorthand misses</p>
            <p className="mt-3 text-base leading-8 text-slate-700">{weave.method}</p>
          </aside>
        ) : null}
        <div className="border-t border-violet-100 p-5 sm:p-8">
          <EditorialBlock title="Complete Applying Method — Step by Step" items={guide.applicationSteps} icon={ClipboardCheck} tone="border-emerald-100 bg-emerald-50/70" />
        </div>
        <div className="grid gap-5 border-t border-violet-100 p-5 sm:p-8 lg:grid-cols-2">
          <EditorialBlock title="What Would Count as Progress?" items={guide.expectedResponse} icon={ShieldCheck} tone="border-teal-100 bg-teal-50/70" />
          <EditorialBlock title="Stop / Modify Immediately If…" items={guide.stopCriteria} icon={ShieldAlert} tone="border-rose-100 bg-rose-50/70" />
          <EditorialBlock title="Where Good Intentions Go Wrong" items={guide.commonMistakes} icon={ShieldAlert} tone="border-amber-100 bg-amber-50/70" />
        </div>
<details className="mx-5 mb-6 rounded-2xl border border-violet-200 bg-white sm:mx-8">
          <summary className="cursor-pointer p-5 text-sm font-semibold text-violet-800 hover:bg-violet-50">
            Another worked clinical example · Open when you want more practice
          </summary>
          <div className="border-t border-violet-100 p-4 sm:p-5">
            <EditorialBlock title="See It Through a Patient's Eyes" items={guide.clinicalExample} icon={Lightbulb} />
          </div>
        </details>
      </section>

      {weave ? (
        <section data-pna-engagement="clinical-curveball-v1" className="mt-8 rounded-3xl border border-cyan-200 bg-gradient-to-r from-white via-cyan-50/70 to-white p-6 sm:p-8">
          <p className="text-xs font-bold uppercase tracking-[0.19em] text-cyan-800">Clinical curveball · Your turn</p>
          <h2 className="mt-2 font-serif text-xl font-bold text-slate-900 sm:text-2xl">The technique is over. But did it work?</h2>
          <p className="mt-4 text-base font-medium leading-8 text-slate-800">{weave.question}</p>
          <details className="mt-5 rounded-xl border border-teal-200 bg-white p-4">
            <summary className="cursor-pointer text-sm font-bold text-teal-800 focus-visible:outline focus-visible:outline-2 focus-visible:outline-teal-700">Think first, then reveal the reasoning</summary>
            <p className="mt-4 border-t border-slate-100 pt-4 text-[15px] leading-8 text-slate-700">{weave.answer}</p>
          </details>
          <p className="mt-3 text-xs leading-6 text-slate-500">An educational scenario, not a replacement for individual clinical assessment.</p>
        </section>
      ) : null}

      <section className="mt-8" aria-labelledby="clinical-essentials">
        <p className="text-xs font-bold uppercase tracking-[0.17em] text-teal-700">The non-negotiables</p>
        <h2 id="clinical-essentials" className="mt-2 font-serif text-2xl font-bold text-slate-900">Useful, safe and worth repeating?</h2>
        <p className="mt-3 max-w-3xl text-[15px] leading-7 text-slate-600">
          Indications, dosage, precautions and contraindications deserve to be easy to find.
          The story makes them memorable; this section keeps them unmistakably clear.
        </p>
      <div className="mt-5 grid gap-5 lg:grid-cols-2">
        <EditorialBlock
          title="How Much Is Enough?"
          items={technique.dosage}
          icon={Gauge}
          tone="border-blue-100 bg-blue-50/70"
        />
        <EditorialBlock
          title="Indications"
          items={technique.indications}
          icon={ClipboardCheck}
          tone="border-emerald-100 bg-emerald-50/70"
        />
        <EditorialBlock
          title="Precautions"
          items={technique.precautions}
          icon={ShieldAlert}
          tone="border-amber-100 bg-amber-50/70"
        />
        <EditorialBlock
          title="Contraindications"
          items={technique.contraindications}
          icon={ShieldAlert}
          tone="border-rose-100 bg-rose-50/70"
        />
        <EditorialBlock
          title="Small Details That Change Everything"
          items={technique.pearls}
          icon={Lightbulb}
          tone="border-indigo-100 bg-indigo-50/70"
        />
      </div>

      </section>

      <section className="mt-9 rounded-3xl border border-slate-200 bg-slate-50/70 p-6 sm:p-8">
        <p className="text-xs font-bold uppercase tracking-[0.2em] text-teal-800">Evidence compass</p>
        <h2 className="mt-2 font-serif text-xl font-bold text-slate-900">What can science actually support?</h2>
        <p className="mt-3 text-sm leading-7 text-slate-700">
          The 2025 living review describes several possible mechanisms of manual therapy,
          but cautions that we cannot confidently say which one produced an individual
          patient's improvement. Do not turn a useful clinical response into an unsupported
          claim that tissue was permanently repositioned or adhesions were broken.
          A review of general manual therapy mechanisms does not establish the
          effectiveness of this exact named technique for every diagnosis.
        </p>
        <a href="https://pubmed.ncbi.nlm.nih.gov/40100908/" target="_blank" rel="noopener noreferrer"
          className="mt-3 inline-flex text-sm font-bold text-indigo-800 underline underline-offset-4">
          Read the 2025 living review of manual therapy mechanisms
        </a>
      </section>

      {visuals.length ? (
        <section className="mt-8 overflow-hidden rounded-3xl border border-cyan-200 bg-gradient-to-br from-cyan-50 via-white to-violet-50 p-5 sm:p-8">
          <div className="mb-6">
            <p className="text-xs font-bold uppercase tracking-[0.2em] text-cyan-700">
              Clinical Visual Atlas
            </p>
            <h2 className="mt-2 text-2xl font-bold text-navy-800 sm:text-3xl">
              From the story to the treatment room
            </h2>
            <p className="mt-3 max-w-3xl text-sm leading-6 text-navy-600">
              These PNA teaching visuals show positioning, contact, force direction and safety cues.
              Images are delivered directly from the external image CDN and load only when needed.
            </p>
          </div>
          <div className="grid gap-6">
            {visuals.map((visual, index) => (
              <ClinicalImage
                key={visual.id}
                path={visual.path}
                alt={visual.alt}
                caption={visual.caption}
                label={visual.group + " · " + visual.title}
                eager={index === 0}
              />
            ))}
          </div>
        </section>
      ) : null}

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
                Why might this technique work—and what is still uncertain?
              </h2>
              <p className="mt-3 max-w-4xl text-sm leading-7 text-navy-600">
                {mechanism.simpleExplanation}
              </p>
              {weave ? (
                <div className="mt-5 max-w-4xl rounded-xl border-l-4 border-indigo-500 bg-white p-5">
                  <p className="text-xs font-bold uppercase tracking-[0.17em] text-indigo-800">Science without the snooze button</p>
                  <p className="mt-2 text-[15px] leading-8 text-slate-700">{weave.science}</p>
                </div>
              ) : null}
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

        <details className="border-t border-indigo-100">
          <summary className="cursor-pointer px-5 py-5 text-sm font-bold text-indigo-800 hover:bg-indigo-50 focus-visible:outline focus-visible:outline-2 focus-visible:outline-indigo-500 sm:px-8">
            Want the full science? Open mechanisms, physiology and what we still cannot claim
          </summary>
          <div className="grid gap-5 border-t border-indigo-100 p-5 sm:p-8 lg:grid-cols-2">
          <EditorialBlock
            title="The Response: What Could Be Happening"
            items={mechanism.stepByStep}
            icon={Brain}
            tone="border-indigo-100 bg-indigo-50/70"
          />
          <EditorialBlock
            title="Under the Surface: The Science"
            items={mechanism.physiology}
            icon={Microscope}
            tone="border-cyan-100 bg-cyan-50/70"
          />
          <EditorialBlock
            title="Bring the Science Back to the Patient"
            items={mechanism.clinicalTranslation}
            icon={Lightbulb}
            tone="border-emerald-100 bg-emerald-50/70"
          />
          <EditorialBlock
            title="What the Evidence Does Not Let Us Promise"
            items={mechanism.myths}
            icon={ShieldAlert}
            tone="border-rose-100 bg-rose-50/70"
          />
        </div>

        </details>

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

      <details id="advanced-clinician" className="mt-9 rounded-3xl border border-slate-200 bg-white shadow-sm">
        <summary className="cursor-pointer p-6 text-base font-bold leading-7 text-slate-900 hover:bg-slate-50 focus-visible:outline focus-visible:outline-2 focus-visible:outline-teal-600 sm:p-8">
          For the curious clinician · Open the advanced decision-making notes
          <span className="mt-1 block text-sm font-normal text-slate-600">
            Classification, dosing, progression, documentation and evidence—available whenever you are ready.
          </span>
        </summary>
        <div className="border-t border-slate-200 p-4 sm:p-5">
      <section className="mt-8 overflow-hidden rounded-3xl border border-slate-200 bg-gradient-to-br from-slate-50 via-white to-indigo-50">
        <div className="border-b border-slate-200 p-6 sm:p-8">
          <p className="text-xs font-bold uppercase tracking-[0.2em] text-indigo-700">
            Expert Clinical Layer
          </p>
          <h2 className="mt-2 text-2xl font-bold text-navy-800 sm:text-3xl">
            The decisions that separate a technique from a treatment plan
          </h2>
          <p className="mt-3 max-w-3xl text-sm leading-6 text-navy-600">
            This layer goes beyond memorizing the maneuver. It shows how an experienced clinician
            selects, modifies, progresses, integrates and documents the technique while keeping
            claims aligned with current evidence.
          </p>
        </div>
        <div className="grid gap-5 p-5 sm:p-8 lg:grid-cols-2">
          <EditorialBlock title="Variants & Classifications" items={expert.variants} icon={Microscope} tone="border-violet-100 bg-violet-50/70" />
          <EditorialBlock title="When Would You Choose This?" items={expert.selectionRules} icon={Brain} tone="border-cyan-100 bg-cyan-50/70" />
          <EditorialBlock title="Technical Variables That Change the Dose" items={expert.technicalVariables} icon={Gauge} tone="border-blue-100 bg-blue-50/70" />
          <EditorialBlock title="Progression & Regression" items={expert.progressionRegression} icon={ShieldCheck} tone="border-emerald-100 bg-emerald-50/70" />
          <EditorialBlock title="Turn the Gain Into Real Movement" items={expert.integration} icon={Lightbulb} tone="border-teal-100 bg-teal-50/70" />
          <EditorialBlock title="Documentation Standard" items={expert.documentation} icon={ClipboardCheck} tone="border-slate-200 bg-slate-50/70" />
        </div>
        <div className="border-t border-slate-200 p-5 sm:p-8">
          <EditorialBlock title="Where Evidence Supports Us—and Where It Does Not" items={expert.evidencePosition} icon={Microscope} tone="border-amber-100 bg-amber-50/70" />
        </div>
      </section>

        </div>
      </details>

      <details className="mt-7 rounded-3xl border border-slate-200 bg-white p-5 shadow-sm sm:p-7">
        <summary className="cursor-pointer text-sm font-bold text-teal-800 focus-visible:outline focus-visible:outline-2 focus-visible:outline-teal-700">
          Need a quick technical recap? Open the complete original reference notes
        </summary>
        <div className="mt-5 grid gap-5 border-t border-slate-100 pt-5 lg:grid-cols-2">
        <EditorialBlock
          title="The Science: What May Explain the Response"
          items={technique.science}
          icon={Lightbulb}
          tone="border-violet-100 bg-violet-50/70"
        />
        <EditorialBlock
          title="The Method: From First Contact to Reassessment"
          items={technique.procedure}
          icon={Hand}
          tone="border-cyan-100 bg-cyan-50/70"
        />
        <EditorialBlock
          title="Did It Make a Meaningful Difference?"
          items={technique.reassessment}
          icon={ShieldCheck}
          tone="border-teal-100 bg-teal-50/70"
        />
        </div>
      </details>

      {regionalApplications.length ? (
        <section className="mt-10">
          <div className="overflow-hidden rounded-[2rem] bg-gradient-to-r from-slate-950 via-indigo-950 to-violet-900 p-6 text-white shadow-xl sm:p-8">
            <div className="flex flex-wrap items-end justify-between gap-5">
              <div className="max-w-3xl">
                <div className="flex items-center gap-2 text-cyan-200">
                  <MapPinned className="h-5 w-5" />
                  <p className="text-xs font-bold uppercase tracking-[0.2em]">
                    Region-Wise Applications
                  </p>
                </div>
                <h2 className="mt-2 text-2xl font-bold text-white sm:text-3xl">
                  Apply {technique.name} across the body
                </h2>
                <p className="mt-3 text-sm leading-6 text-indigo-100">
                  Explore independently authored clinical procedures first. General regional overviews
                  offer orientation only; they are not replacements for exact technique training.
                </p>
              </div>

              <div className="flex flex-wrap gap-2">
                <span className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-4 py-2 text-xs font-bold">
                  <Layers3 className="h-4 w-4" />
                  {regionalApplications.length} regions
                </span>
                {totalRegionalVariations > 0 ? (
                  <span className="inline-flex items-center gap-2 rounded-full border border-cyan-200/20 bg-cyan-300/10 px-4 py-2 text-xs font-bold text-cyan-50">
                    {totalRegionalVariations} deep variations
                  </span>
                ) : null}
              </div>
            </div>
          </div>

          <div className="mt-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {[...regionalApplications].sort((a, b) => Number(isTechniqueSpecificRegionalApplication(b)) - Number(isTechniqueSpecificRegionalApplication(a))).map((application, index) => {
              const variationCount = getRegionalSubTechniques(
                slug,
                application.region,
              ).length;

              return (
                <a
                  key={application.slug}
                  href={"/manual-therapy/regions/" + application.slug}
                  className="group relative overflow-hidden rounded-3xl border border-grey-200 bg-white p-5 shadow-sm transition hover:-translate-y-1 hover:border-violet-200 hover:shadow-lg"
                >
                  <div
                    className={
                      "absolute inset-x-0 top-0 h-1.5 " +
                      (index % 3 === 0
                        ? "bg-gradient-to-r from-violet-600 to-indigo-600"
                        : index % 3 === 1
                          ? "bg-gradient-to-r from-cyan-600 to-teal-600"
                          : "bg-gradient-to-r from-emerald-600 to-cyan-600")
                    }
                  />

                  <div className="flex items-start justify-between gap-3 pt-1">
                    <span className="flex h-11 w-11 flex-none items-center justify-center rounded-2xl bg-violet-50 text-violet-700">
                      <MapPinned className="h-5 w-5" />
                    </span>

                    <span
                      className={
                        "rounded-full px-2.5 py-1 text-[10px] font-bold uppercase tracking-wide " +
                        (application.applicability === "Not routine"
                          ? "bg-amber-50 text-amber-700"
                          : "bg-violet-50 text-violet-700")
                      }
                    >
                      {isTechniqueSpecificRegionalApplication(application) ? "Technique-specific" : "Regional overview"}
                    </span>
                  </div>

                  <p className="mt-4 text-xs font-bold uppercase tracking-[0.16em] text-violet-600">
                    {application.region}
                  </p>
                  <h3 className="mt-1 text-lg font-bold leading-snug text-navy-900">
                    {application.title}
                  </h3>

                  <p className="mt-3 line-clamp-2 text-sm leading-6 text-navy-600">
                    {application.clinicalUse[0]}
                  </p>

                  <div className="mt-4 flex flex-wrap gap-2">
                    {variationCount ? (
                      <span className="rounded-full border border-cyan-100 bg-cyan-50 px-2.5 py-1 text-xs font-bold text-cyan-700">
                        {variationCount} specific variations
                      </span>
                    ) : (
                      <span className="rounded-full border border-grey-200 bg-grey-50 px-2.5 py-1 text-xs font-bold text-navy-500">
                        Regional guidance
                      </span>
                    )}
                  </div>

                  <div className="mt-5 flex items-center justify-between border-t border-grey-100 pt-4">
                    <span className="text-sm font-bold text-violet-700">
                      Open clinical guide
                    </span>
                    <span className="flex h-9 w-9 items-center justify-center rounded-full bg-violet-50 text-violet-700 transition group-hover:translate-x-1 group-hover:bg-violet-700 group-hover:text-white">
                      <ArrowRight className="h-4 w-4" />
                    </span>
                  </div>
                </a>
              );
            })}
          </div>
        </section>
      ) : null}

      <div className="mt-8 flex flex-wrap gap-3">
        <a
          href="/manual-therapy"
          className="rounded-xl border border-grey-200 px-5 py-3 text-sm font-bold text-navy-700"
        >
          Browse more techniques
        </a>
        <a
          href="/treatment-plans"
          className="rounded-xl bg-teal-600 px-5 py-3 text-sm font-bold text-white"
        >
          Apply in treatment plans
        </a>
      </div>
    </div>
  );
}
