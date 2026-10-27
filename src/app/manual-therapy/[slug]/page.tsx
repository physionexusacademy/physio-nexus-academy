import type { Metadata } from "next";
import { notFound } from "next/navigation";
import {
  ArrowLeft,
  ArrowRight,
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
import { worldManualApproaches } from "@/lib/manual-therapy-world";
import { WorldApproachChapter } from "@/components/manual-therapy/WorldApproachChapter";
import { getManualTherapyStory } from "@/lib/manual-therapy-stories";
import { getClinicalEpisode } from "@/lib/manual-therapy-episodes";
import { ClinicalStoryChapter } from "@/components/manual-therapy/ClinicalStoryChapter";
import { AttentionReset } from "@/components/manual-therapy/AttentionReset";
import { getManualTherapyAhaMoment } from "@/lib/manual-therapy-aha-moments";
import { manualTherapyLessonWeaves } from "@/lib/manual-therapy-lesson-weave";
import { manualApplicationGuides } from "@/lib/all-manual-therapy-guides";
import { getApplicationsForTechnique } from "@/lib/manual-therapy-regional";
import {
  manualTherapyMechanisms,
  manualTherapyMechanismEvidence,
} from "@/lib/all-manual-therapy-mechanisms";
import { getManualTherapyExpertProfile } from "@/lib/manual-therapy-expert";
import ClinicalImage from "@/components/clinical/ClinicalImage";
import { getManualTherapyVisuals } from "@/lib/manual-therapy-visuals";
import { getRegionalSubTechniques } from "@/lib/manual-therapy-subtechniques";
import { EditorialBlock } from "@/components/manual-therapy/EditorialBlock";
import { MasteryGuide } from "@/components/manual-therapy/MasteryGuide";
import { getMasteryGuide } from "@/lib/manual-therapy-mastery";
import { TechniqueReadingNav } from "@/components/manual-therapy/TechniqueReadingNav";

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
    title: worldLesson.title + " | Physio Nexus Academy",
    description: worldLesson.summary,
    keywords: [worldLesson.title, "manual therapy", "physiotherapy", "clinical techniques", "Physio Nexus Academy"],
    alternates: { canonical: "https://physionexusacademy.com/manual-therapy/" + slug },
    openGraph: {
      title: worldLesson.title + " | Physio Nexus Academy",
      description: worldLesson.summary,
      url: "https://physionexusacademy.com/manual-therapy/" + slug,
      type: "article",
    },
  };
  if (!technique) return {};

  const pageTitle = technique.name + " | Physio Nexus Academy";
  const pageDescription = technique.summary;

  return {
    title: pageTitle,
    description: pageDescription,
    keywords: [
      technique.name,
      technique.name + " physiotherapy",
      technique.name + " technique",
      "manual therapy techniques",
      "clinical application",
      "physiotherapy education",
      "Physio Nexus Academy",
    ],
    alternates: {
      canonical: "https://physionexusacademy.com/manual-therapy/" + technique.slug,
    },
    openGraph: {
      title: pageTitle,
      description: pageDescription,
      url: "https://physionexusacademy.com/manual-therapy/" + technique.slug,
      type: "article",
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
  const mastery = getMasteryGuide(slug);
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

      {/* Hero */}
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
        <p className="mt-5 max-w-3xl text-lg font-semibold leading-8 text-white">
          {mastery?.oneLine ?? technique.summary}
        </p>
        <div className="mt-6 flex flex-wrap gap-3 text-sm font-bold">
          <a href="#mastery" className="rounded-full bg-white px-4 py-2 text-violet-800">Start the lesson</a>
          <a href="#clinical-method" className="rounded-full border border-white/30 px-4 py-2 text-white">Hands-on detail</a>
          <a href="#clinical-essentials" className="rounded-full border border-white/30 px-4 py-2 text-white">Safety & dose</a>
        </div>
      </section>

      {/* Sticky reading navigation */}
      <div className="mt-6">
        <TechniqueReadingNav />
      </div>

      {/* 1. Mastery / Start here */}
      <MasteryGuide slug={slug} />

      {/* Optional story - collapsed by default */}
      {episode ? (
        <details className="mt-10 rounded-2xl border border-slate-200 bg-slate-50/50">
          <summary className="cursor-pointer p-5 text-sm font-semibold text-slate-700 sm:p-6">
            Optional · Short patient story to help remember
            {story ? <span className="mt-1 block text-sm font-normal text-slate-500">{story.headline}</span> : null}
          </summary>
          <div className="border-t border-slate-100 p-2 sm:p-4">
            <ClinicalStoryChapter slug={slug} episode={episode} challenge={aha} weave={weave} />
          </div>
        </details>
      ) : null}

      {/* 2. Practical Application */}
      <section id="clinical-method" className="mt-12 scroll-mt-28">
        <div className="mb-6">
          <p className="text-xs font-bold uppercase tracking-[0.18em] text-teal-700">Practical Application</p>
          <h2 className="mt-2 font-serif text-2xl font-bold text-slate-900 sm:text-3xl">
            How the technique is actually applied
          </h2>
          <p className="mt-3 max-w-3xl text-[15px] leading-7 text-slate-600">
            Patient setup, therapist position, hand placement, force direction, what to expect, when to stop, and common mistakes.
          </p>
        </div>

        <div className="grid gap-5 lg:grid-cols-2">
          <EditorialBlock title="Patient Position" items={guide.patientPosition} icon={Hand} />
          <EditorialBlock title="Therapist Position" items={guide.therapistPosition} icon={Hand} />
          <EditorialBlock title="Exact Hand Placement" items={guide.handPlacement} icon={Hand} />
          <EditorialBlock title="Direction & Type of Force" items={guide.forceDirection} icon={Gauge} />
        </div>

        <div className="mt-6"><AttentionReset slug={slug} moment="wake" /></div>

        {weave ? (
          <aside className="mt-6 rounded-2xl border-l-4 border-teal-500 bg-white px-5 py-5 shadow-sm sm:px-7">
            <p className="text-xs font-bold uppercase tracking-[0.16em] text-teal-800">The subtle move · What textbook shorthand misses</p>
            <p className="mt-3 text-[15px] leading-8 text-slate-700">{weave.method}</p>
          </aside>
        ) : null}

        <div className="mt-8">
          <EditorialBlock title="Complete Applying Method — Step by Step" items={guide.applicationSteps} icon={ClipboardCheck} />
        </div>

        <div className="mt-6"><AttentionReset slug={slug} moment="think" /></div>

        <div className="mt-8 grid gap-5 lg:grid-cols-2">
          <EditorialBlock title="What Would Count as Progress?" items={guide.expectedResponse} icon={ShieldCheck} />
          <EditorialBlock title="Stop / Modify Immediately If…" items={guide.stopCriteria} icon={ShieldAlert} />
          <EditorialBlock title="Where Good Intentions Go Wrong" items={guide.commonMistakes} icon={ShieldAlert} />
        </div>

        <details className="mt-6 rounded-2xl border border-slate-200 bg-white">
          <summary className="cursor-pointer p-5 text-sm font-semibold text-slate-700 hover:bg-slate-50">
            Another worked clinical example · Open when you want more practice
          </summary>
          <div className="border-t border-slate-100 p-4 sm:p-5">
            <EditorialBlock title="See It Through a Patient's Eyes" items={guide.clinicalExample} icon={Lightbulb} />
          </div>
        </details>
      </section>

      {/* Clinical curveball */}
      {weave ? (
        <section className="mt-12 rounded-2xl border border-slate-200 bg-slate-50/60 p-6 sm:p-8">
          <p className="text-xs font-bold uppercase tracking-[0.16em] text-slate-600">Clinical curveball · Your turn</p>
          <h2 className="mt-2 font-serif text-xl font-bold text-slate-900 sm:text-2xl">The technique is over. But did it work?</h2>
          <p className="mt-4 text-[15px] font-medium leading-8 text-slate-800">{weave.question}</p>
          <details className="mt-5 rounded-xl border border-slate-200 bg-white p-4">
            <summary className="cursor-pointer text-sm font-bold text-teal-800">Think first, then reveal the reasoning</summary>
            <p className="mt-4 border-t border-slate-100 pt-4 text-[15px] leading-8 text-slate-700">{weave.answer}</p>
          </details>
          <p className="mt-3 text-xs leading-6 text-slate-500">An educational scenario, not a replacement for individual clinical assessment.</p>
        </section>
      ) : null}

      <div className="mt-8"><AttentionReset slug={slug} moment="remember" /></div>

      {/* 3. Safety & Essentials */}
      <section id="clinical-essentials" className="mt-12 scroll-mt-28" aria-labelledby="clinical-essentials-heading">
        <p className="text-xs font-bold uppercase tracking-[0.17em] text-teal-700">The non-negotiables</p>
        <h2 id="clinical-essentials-heading" className="mt-2 font-serif text-2xl font-bold text-slate-900">
          Useful, safe and worth repeating?
        </h2>
        <p className="mt-3 max-w-3xl text-[15px] leading-7 text-slate-600">
          Indications, dosage, precautions and contraindications — kept clear and easy to find.
        </p>

        <div className="mt-6 grid gap-5 lg:grid-cols-2">
          <EditorialBlock title="How Much Is Enough?" items={technique.dosage} icon={Gauge} />
          <EditorialBlock title="Indications" items={technique.indications} icon={ClipboardCheck} />
          <EditorialBlock title="Precautions" items={technique.precautions} icon={ShieldAlert} />
          <EditorialBlock title="Contraindications" items={technique.contraindications} icon={ShieldAlert} />
          <EditorialBlock title="Small Details That Change Everything" items={technique.pearls} icon={Lightbulb} />
        </div>
      </section>

      {/* Visuals */}
      {visuals.length ? (
        <section className="mt-12">
          <div className="mb-6">
            <p className="text-xs font-bold uppercase tracking-[0.18em] text-teal-700">Clinical Visual Atlas</p>
            <h2 className="mt-2 font-serif text-2xl font-bold text-slate-900 sm:text-3xl">
              From the story to the treatment room
            </h2>
            <p className="mt-3 max-w-3xl text-[15px] leading-7 text-slate-600">
              Teaching visuals showing positioning, contact, force direction and safety cues.
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

      {/* 4. Mechanism / Science */}
      <section id="mechanism" className="mt-12 scroll-mt-28 overflow-hidden rounded-2xl border border-slate-200 bg-white">
        <div className="border-b border-slate-100 p-6 sm:p-8">
          <div className="flex items-start gap-3">
            <span className="flex h-11 w-11 flex-none items-center justify-center rounded-xl bg-indigo-50 text-indigo-700">
              <Brain className="h-5 w-5" />
            </span>
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.18em] text-indigo-700">Mechanism & Physiology</p>
              <h2 className="mt-2 font-serif text-2xl font-bold text-slate-900 sm:text-3xl">
                Why might this technique work — and what is still uncertain?
              </h2>
              <p className="mt-3 max-w-4xl text-[15px] leading-7 text-slate-600">
                {mechanism.simpleExplanation}
              </p>
              {weave ? (
                <div className="mt-5 max-w-4xl rounded-xl border-l-4 border-indigo-400 bg-slate-50 p-5">
                  <p className="text-xs font-bold uppercase tracking-[0.15em] text-indigo-800">Science without the snooze button</p>
                  <p className="mt-2 text-[15px] leading-8 text-slate-700">{weave.science}</p>
                </div>
              ) : null}
            </div>
          </div>
        </div>

        <div className="p-5 sm:p-8">
          <div className="rounded-xl border border-slate-200 bg-slate-50 p-5">
            <p className="text-xs font-bold uppercase tracking-[0.15em] text-slate-600">Mechanism in one line</p>
            <p className="mt-3 font-mono text-sm font-semibold leading-7 text-slate-800">
              {mechanism.mechanismMap}
            </p>
          </div>
        </div>

        <details className="border-t border-slate-100">
          <summary className="cursor-pointer px-5 py-5 text-sm font-semibold text-slate-700 hover:bg-slate-50 sm:px-8">
            Want the full science? Open mechanisms, physiology and limits of the evidence
          </summary>
          <div className="grid gap-5 border-t border-slate-100 p-5 sm:p-8 lg:grid-cols-2">
            <EditorialBlock title="The Response: What Could Be Happening" items={mechanism.stepByStep} icon={Brain} />
            <EditorialBlock title="Under the Surface: The Science" items={mechanism.physiology} icon={Microscope} />
            <EditorialBlock title="Bring the Science Back to the Patient" items={mechanism.clinicalTranslation} icon={Lightbulb} />
            <EditorialBlock title="What the Evidence Does Not Let Us Promise" items={mechanism.myths} icon={ShieldAlert} />
          </div>
        </details>

        <div className="border-t border-slate-100 p-5 sm:p-8">
          <div className="rounded-xl border border-amber-200 bg-amber-50/70 p-5">
            <p className="font-bold text-slate-800">Evidence note</p>
            <p className="mt-2 text-sm leading-6 text-slate-600">{mechanism.evidenceNote}</p>
            <p className="mt-3 text-xs leading-5 text-slate-500">
              Across manual therapy as a whole, current evidence supports interacting peripheral, spinal, supraspinal, neurovascular, neuromuscular and contextual responses rather than one universal mechanism.
            </p>
            <a
              href={manualTherapyMechanismEvidence.sourceUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-4 inline-flex items-center gap-1 text-sm font-bold text-indigo-700"
            >
              Read the source <ExternalLink className="h-3.5 w-3.5" />
            </a>
          </div>
        </div>
      </section>

      {/* Bottom navigation */}
      <div className="mt-12 flex flex-wrap gap-3">
        <a
          href="/manual-therapy"
          className="rounded-xl border border-slate-200 px-5 py-3 text-sm font-bold text-slate-700 hover:bg-slate-50"
        >
          Browse more techniques
        </a>
        <a
          href="/treatment-plans"
          className="rounded-xl bg-teal-700 px-5 py-3 text-sm font-bold text-white hover:bg-teal-800"
        >
          Apply in treatment plans
        </a>
      </div>
    </div>
  );
}
