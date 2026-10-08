import type { Metadata } from "next";
import {
  ArrowRight,
  BookOpenCheck,
  Brain,
  Hand,
  ShieldCheck,
  Sparkles,
} from "lucide-react";
import {
  manualTherapyFamilies,
  manualTherapyTechniques,
} from "@/lib/all-manual-therapy";
import { getManualTherapyStory } from "@/lib/manual-therapy-stories";
import { manualTherapyLessonWeaves } from "@/lib/manual-therapy-lesson-weave";
import { worldManualApproaches } from "@/lib/manual-therapy-world";

export const metadata: Metadata = {
  title: "Manual Therapy Mastery",
  description:
    "Explore 22 manual therapy techniques through memorable clinical stories, clear science, practical application, and safety-first reasoning with Physio Nexus Academy.",
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
            Manual Therapy Mastery
          </h1>
          <p className="mt-5 max-w-3xl text-base leading-7 text-violet-50 sm:text-lg">
            Every technique begins with a clinical mystery. Meet the patient, question the first
            assumption, understand what might be happening, and follow the reasoning all the
            way from the first examination to the final reassessment.
          </p>
          <div className="mt-7 flex flex-wrap gap-3 text-sm font-semibold">
            <span className="rounded-full bg-white/10 px-4 py-2">
              {manualTherapyTechniques.length} detailed techniques
            </span>
            <span className="rounded-full bg-white/10 px-4 py-2">
              {manualTherapyFamilies.length} technique families
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

      <section data-pna-world-entry="v1" className="mt-10 overflow-hidden rounded-3xl border border-teal-200 bg-gradient-to-br from-teal-50 via-white to-indigo-50 p-6 shadow-sm sm:p-8">
        <p className="flex items-center gap-2 text-xs font-bold uppercase tracking-[0.17em] text-teal-800">
          <Sparkles className="h-5 w-5" aria-hidden="true" /> New · Beyond the original library
        </p>
        <h2 className="mt-3 font-serif text-2xl font-bold leading-tight text-navy-900 sm:text-3xl">
          Welcome to the World Manual Therapy Encyclopedia
        </h2>
        <p className="mt-4 max-w-4xl text-[15px] leading-8 text-navy-700">
          There are more approaches in the world than our original technique list. Meet {worldManualApproaches.length}
          additional orthopedic, osteopathic and bodywork traditions through funny clinic dialogues,
          genuine clinical puzzles, Aha Moments, safety warnings and honest research summaries.
          Some systems focus on self-management, not manual contact. Others are interesting history
          but have limited evidence. Learn the difference without losing the fun.
        </p>
        <div className="mt-5 flex flex-wrap gap-2 text-xs font-semibold text-indigo-800">
          <span className="rounded-full border border-indigo-100 bg-white px-3 py-2">Unique patient stories</span>
          <span className="rounded-full border border-indigo-100 bg-white px-3 py-2">Clinical plot twists</span>
          <span className="rounded-full border border-indigo-100 bg-white px-3 py-2">Interactive reasoning</span>
          <span className="rounded-full border border-indigo-100 bg-white px-3 py-2">Evidence without exaggeration</span>
        </div>
        <a href="/manual-therapy/world-approaches" className="mt-6 inline-flex items-center gap-2 rounded-full bg-teal-800 px-5 py-3 text-sm font-bold text-white transition hover:bg-teal-900">
          Explore the worldwide collection <ArrowRight className="h-4 w-4" aria-hidden="true" />
        </a>
      </section>

      <section className="mt-12">
        <div className="flex flex-wrap items-end justify-between gap-3">
          <div>
            <p className="text-sm font-bold uppercase tracking-widest text-violet-700">
              Technique Library
            </p>
            <h2 className="mt-1 text-2xl font-bold text-navy-800 sm:text-3xl">
              Choose a clinical story worth exploring
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
          {manualTherapyFamilies.map((family) => {
            const techniques = manualTherapyTechniques.filter(
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
                      href={"/manual-therapy/" + technique.slug}
                      className="group rounded-2xl border border-grey-200 bg-white p-5 transition hover:-translate-y-1 hover:border-violet-200 hover:shadow-lg"
                    >
                      <div className="flex items-center justify-between gap-3">
                        <span className="rounded-full bg-violet-50 px-3 py-1 text-[11px] font-bold uppercase tracking-wide text-violet-700">
                          {technique.level}
                        </span>
                        <Sparkles className="h-4 w-4 text-violet-300" />
                      </div>
                      <h4 className="mt-4 text-lg font-bold text-navy-800">
                        {technique.name}
                      </h4>
                      {getManualTherapyStory(technique.slug) ? (
                        <>
                          <p className="mt-3 text-base font-bold leading-6 text-navy-900">
                            {getManualTherapyStory(technique.slug)?.headline}
                          </p>
                          <p className="mt-2 line-clamp-3 text-sm leading-6 text-navy-600">
                            {getManualTherapyStory(technique.slug)?.scene}
                          </p>
                           {manualTherapyLessonWeaves[technique.slug] ? (
                             <p className="mt-3 border-l-2 border-teal-400 pl-3 font-serif text-sm italic leading-6 text-teal-900">
                               {manualTherapyLessonWeaves[technique.slug].closer}
                             </p>
                           ) : null}
                        </>
                      ) : (
                        <p className="mt-2 line-clamp-3 text-sm leading-6 text-navy-600">{technique.summary}</p>
                      )}
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
