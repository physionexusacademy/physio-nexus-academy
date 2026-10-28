import {
  ArrowLeft, ArrowRight, BookOpenText, Brain, ExternalLink, Lightbulb,
  Microscope, ShieldAlert, Sparkles, Stethoscope, Clapperboard,
} from "lucide-react";
import { worldManualApproaches, type WorldManualApproach } from "@/lib/manual-therapy-world";
import { WorldApproachChallenge } from "@/components/manual-therapy/WorldApproachChallenge";
import { WorldApproachDeepDive } from "@/components/manual-therapy/WorldApproachDeepDive";
import { worldManualDeepChapters } from "@/lib/manual-therapy-world-depth";
import { MasteryGuide } from "@/components/manual-therapy/MasteryGuide";
import { getMasteryGuide } from "@/lib/manual-therapy-mastery";
import { TechniqueReadingNav } from "@/components/manual-therapy/TechniqueReadingNav";

/** Shared full chapter for the unified Manual Therapy Encyclopedia. */
export function WorldApproachChapter({ lesson }: { lesson: WorldManualApproach }) {
  const next = worldManualApproaches[(worldManualApproaches.findIndex((x) => x.slug === lesson.slug) + 1) % worldManualApproaches.length];
  const deep = worldManualDeepChapters[lesson.slug];
  const mastery = getMasteryGuide(lesson.slug);

  return (
    <main data-pna-world-final="v1" className="container-content section-padding">
      <a href="/manual-therapy" className="inline-flex items-center gap-2 text-sm font-bold text-violet-700">
        <ArrowLeft className="h-4 w-4" aria-hidden="true" /> World Manual Therapy Encyclopedia
      </a>

      {/* Hero */}
      <header className="mt-5 overflow-hidden rounded-3xl bg-gradient-to-br from-indigo-950 via-violet-900 to-teal-900 p-7 text-white shadow-xl sm:p-10">
        <div className="flex flex-wrap gap-2 text-xs font-bold">
          <span className="rounded-full border border-white/20 bg-white/10 px-3 py-1.5">{lesson.category}</span>
          <span className="rounded-full border border-white/20 bg-white/10 px-3 py-1.5">{lesson.kind}</span>
        </div>
        <h1 className="mt-5 max-w-4xl font-serif text-3xl font-bold leading-tight text-white sm:text-5xl">{lesson.title}</h1>
        <p className="mt-5 max-w-4xl text-lg font-semibold leading-8 text-white">{mastery?.oneLine ?? lesson.summary}</p>
        <p className="mt-5 max-w-4xl border-l-4 border-teal-300 pl-4 text-sm font-semibold leading-7 text-white">
          Evidence position: {lesson.evidenceLabel}
        </p>
      </header>

      {/* Sticky nav */}
      <div className="mt-6">
        <TechniqueReadingNav />
      </div>

      {/* 1. Mastery */}
      <div id="mastery">
        <MasteryGuide slug={lesson.slug} />
      </div>

      {/* Optional story - collapsed */}
      <details className="mt-10 rounded-2xl border border-slate-200 bg-slate-50/50">
        <summary className="cursor-pointer p-5 text-sm font-semibold text-slate-700 sm:p-6">
          Optional · Short patient story to help remember
          <span className="mt-1 block text-sm font-normal text-slate-500">{lesson.headline}</span>
        </summary>
        <div className="border-t border-slate-100 p-4 sm:p-6">
          <article className="overflow-hidden rounded-2xl border border-slate-200 bg-white">
            <div className="border-b border-slate-100 bg-slate-50 p-5 sm:p-6">
              <p className="flex items-center gap-2 text-xs font-bold uppercase tracking-[0.16em] text-teal-800">
                <Clapperboard className="h-4 w-4" aria-hidden="true" /> Inside the clinic
              </p>
              <h2 className="mt-3 max-w-4xl font-serif text-xl font-bold leading-tight text-slate-900 sm:text-2xl">{lesson.headline}</h2>
              <p className="mt-2 text-xs leading-6 text-slate-500">Fictional teaching scenario. Real patients always require individual assessment.</p>
            </div>
            <div className="space-y-6 p-5 sm:p-7">
              <div className="border-l-2 border-teal-300 pl-5">
                <p className="text-xs font-bold uppercase tracking-[0.14em] text-teal-800">The arrival</p>
                <p className="mt-2 font-serif text-[16px] leading-8 text-slate-800">{lesson.scene}</p>
              </div>
              <div className="rounded-xl border-l-4 border-violet-400 bg-slate-50 p-4">
                <p className="text-xs font-bold uppercase tracking-[0.14em] text-violet-800">The conversation</p>
                <p className="mt-2 text-[15px] leading-8 text-slate-800">{lesson.dialogue}</p>
              </div>
              <section className="rounded-xl border border-slate-200 bg-white p-4 sm:p-5" aria-label="Clinical clues">
                <h3 className="flex items-center gap-2 font-serif text-lg font-bold text-slate-900">
                  <Brain className="h-4 w-4 text-cyan-700" aria-hidden="true" /> Detective work
                </h3>
                <p className="mt-3 text-[15px] leading-8 text-slate-800">{lesson.clue}</p>
                <details className="mt-4 rounded-lg border border-slate-200 bg-slate-50 p-3">
                  <summary className="cursor-pointer text-sm font-bold text-slate-800">Plot twist: What is the hidden catch?</summary>
                  <p className="mt-3 border-t border-slate-100 pt-3 text-sm leading-7 text-slate-700">{lesson.plotTwist}</p>
                </details>
              </section>
              <section className="rounded-xl border border-amber-200 bg-amber-50/60 p-4" aria-label="Aha moment">
                <p className="flex items-center gap-2 text-xs font-bold uppercase tracking-[0.14em] text-amber-800">
                  <Lightbulb className="h-4 w-4" aria-hidden="true" /> Aha Moment
                </p>
                <p className="mt-2 font-serif text-[16px] font-bold leading-8 text-slate-900">{lesson.aha}</p>
              </section>
            </div>
          </article>
        </div>
      </details>

      {/* Quick clinical recap - optional */}
      <details className="mt-8 rounded-2xl border border-slate-200 bg-white">
        <summary className="flex cursor-pointer items-center gap-3 p-5 text-sm font-semibold text-slate-700 sm:p-6">
          <Stethoscope className="h-5 w-5 flex-none text-teal-700" aria-hidden="true" />
          Already familiar? Open the four-step clinical recap
          <span className="ml-auto text-xs font-medium text-slate-500">Optional</span>
        </summary>
        <div className="border-t border-slate-100 p-5 sm:p-7">
          <p className="max-w-4xl text-[15px] leading-8 text-slate-700">{lesson.approach}</p>
          <p className="mt-2 text-xs font-medium leading-6 text-slate-500">{lesson.origin}</p>
          <div className="mt-5 grid gap-3 sm:grid-cols-2">
            {lesson.clinicFlow.map((step, i) => (
              <section key={step} className="rounded-xl border border-slate-200 bg-slate-50 p-4">
                <h3 className="text-xs font-bold uppercase tracking-[0.12em] text-teal-800">
                  {i + 1} · {["Screen first", "Assess the real task", "Choose a safe clinical trial", "Retest and integrate"][i]}
                </h3>
                <p className="mt-2 text-sm leading-7 text-slate-700">{step}</p>
              </section>
            ))}
          </div>
          <p className="mt-5 text-xs font-bold uppercase tracking-[0.14em] text-teal-800">Explain it to the patient</p>
          <p className="mt-2 text-[15px] leading-8 text-slate-700">{lesson.patientExplanation}</p>
        </div>
      </details>

      {/* Deeper chapter - optional */}
      {deep ? (
        <details className="mt-8 rounded-2xl border border-slate-200 bg-white">
          <summary className="cursor-pointer p-5 text-sm font-semibold text-slate-700 sm:p-6">
            Go deeper · Full chapter with extra cases and clinical reasoning (optional)
          </summary>
          <div className="border-t border-slate-100 p-2 sm:p-4">
            <WorldApproachDeepDive chapter={deep} slug={lesson.slug} />
          </div>
        </details>
      ) : null}

      <div className="mt-10">
        <WorldApproachChallenge lesson={lesson} />
      </div>

      {/* Evidence - optional */}
      <details id="mechanism" className="mt-10 scroll-mt-28 rounded-2xl border border-slate-200 bg-white">
        <summary className="cursor-pointer p-5 text-sm font-semibold text-slate-700 sm:p-6">
          Evidence context, myths and source links · Optional appendix
        </summary>
        <div className="border-t border-slate-100 p-5 sm:p-8">
          <p className="flex items-center gap-2 text-xs font-bold uppercase tracking-[0.16em] text-indigo-700">
            <Microscope className="h-4 w-4" aria-hidden="true" /> Evidence reality check
          </p>
          <h2 className="mt-2 font-serif text-2xl font-bold text-slate-900">What research supports — and what it does not</h2>
          <p className="mt-4 text-[15px] leading-8 text-slate-700">{lesson.evidence}</p>
          <div className="mt-6 grid gap-4 md:grid-cols-2">
            <div className="rounded-xl border border-slate-200 bg-slate-50 p-5">
              <h3 className="flex items-center gap-2 text-sm font-bold text-slate-900">
                <Sparkles className="h-4 w-4 text-violet-700" aria-hidden="true" /> Myth vs fact
              </h3>
              <p className="mt-3 text-sm leading-7 text-slate-700">{lesson.myth}</p>
            </div>
            <div className="rounded-xl border border-rose-200 bg-rose-50/60 p-5">
              <h3 className="flex items-center gap-2 text-sm font-bold text-rose-900">
                <ShieldAlert className="h-4 w-4" aria-hidden="true" /> Stop, screen or refer
              </h3>
              <p className="mt-3 text-sm leading-7 text-slate-700">{lesson.stop}</p>
            </div>
          </div>

          <div className="mt-6 border-t border-slate-100 pt-5">
            <h3 className="flex items-center gap-2 text-sm font-bold text-slate-900">
              <BookOpenText className="h-4 w-4 text-indigo-700" aria-hidden="true" /> Reading and source material
            </h3>
            <ul className="mt-3 space-y-3">
              {lesson.sources.map((source) => (
                <li key={source.url}>
                  <a
                    className="inline-flex items-start gap-2 text-sm font-semibold leading-7 text-teal-800 underline underline-offset-4"
                    href={source.url}
                    rel="noopener noreferrer"
                    target="_blank"
                  >
                    {source.label} <ExternalLink className="mt-1.5 h-3.5 w-3.5 flex-none" aria-hidden="true" />
                  </a>
                </li>
              ))}
            </ul>
            <p className="mt-4 text-xs leading-6 text-slate-500">
              Where a source addresses broader manual therapy rather than this exact named approach, it is contextual reading—not proof of the named method. Clinical teaching does not replace certified technique training, consent or personalized care.
            </p>
          </div>
        </div>
      </details>

      {/* Bottom nav */}
      <nav className="mt-12 flex flex-wrap justify-between gap-4 rounded-2xl border border-slate-200 bg-slate-50 p-5 sm:p-6" aria-label="More manual therapy chapters">
        <a className="inline-flex items-center gap-2 text-sm font-bold text-slate-700" href="/manual-therapy">
          <ArrowLeft className="h-4 w-4" aria-hidden="true" /> All manual therapy approaches
        </a>
        <a className="inline-flex items-center gap-2 text-sm font-bold text-teal-800" href={"/manual-therapy/" + next.slug}>
          Next: {next.title} <ArrowRight className="h-4 w-4" aria-hidden="true" />
        </a>
      </nav>
    </main>
  );
}
