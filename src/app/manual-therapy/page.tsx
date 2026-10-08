import type { Metadata } from "next";
import {
  ArrowRight,
  BookOpenCheck,
  Brain,
  Hand,
  ShieldCheck,
  Sparkles,
} from "lucide-react";
import { manualTherapyTechniques } from "@/lib/all-manual-therapy";
import { getManualTherapyStory } from "@/lib/manual-therapy-stories";
import { manualTherapyLessonWeaves } from "@/lib/manual-therapy-lesson-weave";
import { worldManualApproaches } from "@/lib/manual-therapy-world";

const worldLibraryFamily: Record<string, string> = {
  "paris-approach": "Orthopedic Assessment & Reasoning",
  "mckenzie-mdt": "Orthopedic Assessment & Reasoning",
  "mennell-joint-play": "Orthopedic Assessment & Reasoning",
  "fascial-distortion-model": "Fascial & Soft-Tissue",
  "balanced-ligamentous-tension": "Osteopathic & Neuromuscular",
  "spencer-shoulder-sequence": "Osteopathic & Neuromuscular",
  "still-technique": "Osteopathic & Neuromuscular",
  "osteopathic-articulatory": "Osteopathic & Neuromuscular",
  "osteopathic-lymphatic-pump": "Specialized Manual Therapy",
  "rolfing-structural-integration": "Fascial & Soft-Tissue",
  "bowen-technique": "Soft-Tissue Mobilization",
  "visceral-manipulation": "Specialized Manual Therapy",
  "craniosacral-therapy": "Specialized Manual Therapy",
};

const libraryItems = [
  ...manualTherapyTechniques.map((technique) => ({
    slug: technique.slug,
    href: "/manual-therapy/" + technique.slug,
    family: technique.family,
    name: technique.name,
    summary: technique.summary,
    tag: technique.level,
    story: getManualTherapyStory(technique.slug)?.headline ?? "",
    scene: getManualTherapyStory(technique.slug)?.scene ?? "",
    closer: manualTherapyLessonWeaves[technique.slug]?.closer ?? "",
    evidence: "",
  })),
  ...worldManualApproaches.map((approach) => ({
    slug: approach.slug,
    href: "/manual-therapy/" + approach.slug,
    family: worldLibraryFamily[approach.slug] ?? "Specialized Manual Therapy",
    name: approach.title,
    summary: approach.summary,
    tag: "World approach",
    story: approach.headline,
    scene: approach.scene,
    closer: approach.aha,
    evidence: approach.evidenceLabel,
  })),
];
const libraryFamilies = Array.from(new Set(libraryItems.map((item) => item.family)));


export const metadata: Metadata = {
  title: "World Manual Therapy Encyclopedia",
  description:
    "Explore 35 Manual Therapy techniques and approaches in one encyclopedia through entertaining clinical stories, assessment, practical skills, clinical reasoning and evidence-aware safety guidance.",
  alternates: {
    canonical: "https://physionexusacademy.com/manual-therapy",
  },
};

export default function ManualTherapyPage() {
  return (
    <div className="container-content section-padding">
      <section data-pna-content-revision="storytelling-v1" className="overflow-hidden rounded-3xl bg-gradient-to-br from-indigo-700 via-violet-700 to-navy-900 p-7 text-white shadow-xl sm:p-10">
        <div className="max-w-4xl">
          <p className="text-xs font-bold uppercase tracking-[0.22em] text-violet-100">
            PNA Clinical Mastery
          </p>
          <h1 className="mt-3 text-3xl font-bold leading-tight text-white sm:text-5xl">
            World Manual Therapy Encyclopedia
          </h1>
          <p className="mt-5 max-w-3xl text-base leading-7 text-violet-50 sm:text-lg">
            One clinical library, 35 chapters and countless patient stories. Follow the clues,
            laugh at the clinic conversations, understand the science and learn what to do next.
            Some entries describe assessment frameworks or historical approaches rather than
            hands-on techniques, and their evidence is explained clearly.
          </p>
          <div className="mt-7 flex flex-wrap gap-3 text-sm font-semibold">
            <span className="rounded-full bg-white/10 px-4 py-2">
              {libraryItems.length} techniques & approaches
            </span>
            <span className="rounded-full bg-white/10 px-4 py-2">
              {libraryFamilies.length} clinical groups
            </span>
            <span className="rounded-full bg-white/10 px-4 py-2">
              Evidence-informed clinical reasoning
            </span>
          </div>
        </div>
      </section>

      <section className="mt-8 grid gap-4 md:grid-cols-3">
        <div className="rounded-2xl border border-violet-100 bg-violet-50 p-5">
          <Brain className="h-6 w-6 text-violet-700" />
          <h2 className="mt-3 font-bold text-navy-800">Follow the clinical mystery</h2>
          <p className="mt-2 text-sm leading-6 text-navy-600">
            Start with a patient and a question worth answering. Then uncover what the
            science might explain—and where certainty ends.
          </p>
        </div>
        <div className="rounded-2xl border border-cyan-100 bg-cyan-50 p-5">
          <Hand className="h-6 w-6 text-cyan-700" />
          <h2 className="mt-3 font-bold text-navy-800">Walk into the treatment room</h2>
          <p className="mt-2 text-sm leading-6 text-navy-600">
            Picture the patient, the movement and the therapist's next decision.
            Then follow exact positioning, force and dosage step by step.
          </p>
        </div>
        <div className="rounded-2xl border border-emerald-100 bg-emerald-50 p-5">
          <ShieldCheck className="h-6 w-6 text-emerald-700" />
          <h2 className="mt-3 font-bold text-navy-800">Know when the story must change</h2>
          <p className="mt-2 text-sm leading-6 text-navy-600">
            The best clinical decision is not always a manual technique.
            Red flags, contraindications and reassessment guide every chapter.
          </p>
        </div>
      </section>

      <section className="mt-12">
        <div className="flex flex-wrap items-end justify-between gap-3">
          <div>
            <p className="text-sm font-bold uppercase tracking-widest text-violet-700">
              Complete Library · One Place
            </p>
            <h2 className="mt-1 text-2xl font-bold text-navy-800 sm:text-3xl">
              Choose from all 35 clinical stories
            </h2>
          </div>
          <div className="flex flex-wrap gap-4">
            <a
              href="/manual-therapy/regions"
              className="inline-flex items-center gap-1 text-sm font-bold text-violet-700"
            >
              Open regional applications <ArrowRight className="h-4 w-4" />
            </a>
            <a
              href="/treatment-plans"
              className="inline-flex items-center gap-1 text-sm font-bold text-teal-700"
            >
              Apply techniques in treatment plans <ArrowRight className="h-4 w-4" />
            </a>
          </div>
        </div>

        <div className="mt-8 space-y-8">
          {libraryFamilies.map((family) => {
            const techniques = libraryItems.filter(
              (technique) => technique.family === family
            );
            return (
              <div key={family}>
                <div className="flex items-center gap-2">
                  <BookOpenCheck className="h-5 w-5 text-violet-600" />
                  <h3 className="text-xl font-bold text-navy-800">{family}</h3>
                </div>
                <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                  {techniques.map((technique) => (
                    <a
                      key={technique.slug}
                      href={technique.href}
                      className="group rounded-2xl border border-grey-200 bg-white p-5 transition hover:-translate-y-1 hover:border-violet-200 hover:shadow-lg"
                    >
                      <div className="flex items-center justify-between gap-3">
                        <span className="rounded-full bg-violet-50 px-3 py-1 text-[11px] font-bold uppercase tracking-wide text-violet-700">
                          {technique.tag}
                        </span>
                        <Sparkles className="h-4 w-4 text-violet-300" />
                      </div>
                      <h4 className="mt-4 text-lg font-bold text-navy-800">
                        {technique.name}
                      </h4>
                      {technique.story ? (
                        <>
                          <p className="mt-3 text-base font-bold leading-6 text-navy-900">
                            {technique.story}
                          </p>
                          <p className="mt-2 line-clamp-3 text-sm leading-6 text-navy-600">
                            {technique.scene}
                          </p>
                           {technique.closer ? (
                             <p className="mt-3 border-l-2 border-teal-400 pl-3 font-serif text-sm italic leading-6 text-teal-900">
                               {technique.closer}
                             </p>
                           ) : null}
                        </>
                      ) : (
                        <p className="mt-2 line-clamp-3 text-sm leading-6 text-navy-600">{technique.summary}</p>
                      )}
                      {technique.evidence ? (
                        <p className="mt-3 rounded-lg bg-amber-50 px-3 py-2 text-xs font-medium leading-5 text-amber-900">
                          Evidence: {technique.evidence}
                        </p>
                      ) : null}
                      <span className="mt-4 inline-flex items-center gap-1 text-sm font-bold text-violet-700">
                        Explore this story
                        <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                      </span>
                    </a>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </section>

      <section className="mt-12 overflow-hidden rounded-3xl border border-violet-200 bg-gradient-to-br from-violet-50 via-white to-cyan-50 p-6 sm:p-8">
        <p className="text-xs font-bold uppercase tracking-[0.2em] text-violet-700">
          Regional Encyclopedia
        </p>
        <h2 className="mt-2 text-2xl font-bold text-navy-800 sm:text-3xl">
          See how the story changes across the body
        </h2>
        <p className="mt-3 max-w-3xl text-sm leading-6 text-navy-600">
          Open cervical, thoracic, lumbar, shoulder, elbow, hip, knee, ankle and neural applications
          with exact positioning, stabilization, contact, force direction, dosage and reassessment.
        </p>
        <a
          href="/manual-therapy/regions"
          className="mt-5 inline-flex items-center gap-2 rounded-xl bg-violet-700 px-5 py-3 text-sm font-bold text-white"
        >
          Browse regional applications <ArrowRight className="h-4 w-4" />
        </a>
      </section>

      <section className="mt-12 rounded-3xl border border-amber-200 bg-amber-50 p-6">
        <h2 className="font-bold text-navy-800">Clinical safety note</h2>
        <p className="mt-2 text-sm leading-6 text-navy-600">
          This section is for physiotherapy education. Manual techniques, especially thrust
          manipulation, cervical techniques, lymphatic work and post-operative treatment,
          require appropriate clinical training, screening, consent and scope of practice.
          Technique selection never replaces an individual assessment.
        </p>
      </section>
    </div>
  );
}
