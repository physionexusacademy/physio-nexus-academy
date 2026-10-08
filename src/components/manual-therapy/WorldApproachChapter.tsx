import {
  ArrowLeft, ArrowRight, BookOpenText, Brain, CheckCircle2, Clapperboard,
  ClipboardCheck, ExternalLink, HeartPulse, Lightbulb, Microscope, ShieldAlert, Sparkles,
  Stethoscope,
} from "lucide-react";
import { worldManualApproaches, type WorldManualApproach } from "@/lib/manual-therapy-world";
import { WorldApproachChallenge } from "@/components/manual-therapy/WorldApproachChallenge";

/** Shared full chapter for the unified Manual Therapy Encyclopedia. */
export function WorldApproachChapter({ lesson }: { lesson: WorldManualApproach }) {
  const next = worldManualApproaches[(worldManualApproaches.findIndex((x) => x.slug === lesson.slug) + 1) % worldManualApproaches.length];
  return (
    <main className="container-content section-padding" data-pna-world-story="v1">
      <a href="/manual-therapy" className="inline-flex items-center gap-2 text-sm font-bold text-indigo-700">
        <ArrowLeft className="h-4 w-4" aria-hidden="true" /> World Manual Therapy Encyclopedia
      </a>

      <header className="mt-5 overflow-hidden rounded-[2rem] bg-gradient-to-br from-indigo-950 via-violet-900 to-teal-900 p-7 text-white shadow-xl sm:p-10">
        <div className="flex flex-wrap gap-2 text-xs font-bold">
          <span className="rounded-full border border-white/20 bg-white/10 px-3 py-1.5">{lesson.category}</span>
          <span className="rounded-full border border-white/20 bg-white/10 px-3 py-1.5">{lesson.kind}</span>
        </div>
        <h1 className="mt-5 max-w-4xl font-serif text-3xl font-bold leading-tight text-white sm:text-5xl">{lesson.title}</h1>
        <p className="mt-5 max-w-4xl text-[16px] leading-8 text-indigo-50">{lesson.summary}</p>
        <p className="mt-5 max-w-4xl border-l-4 border-teal-300 pl-4 text-sm font-semibold leading-7 text-white">
          Evidence position: {lesson.evidenceLabel}
        </p>
      </header>

      <article className="mt-8 overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">
        <div className="border-b border-slate-100 bg-gradient-to-r from-indigo-50/70 to-teal-50/70 p-6 sm:p-8">
          <p className="flex items-center gap-2 text-xs font-bold uppercase tracking-[0.18em] text-teal-800">
            <Clapperboard className="h-5 w-5" aria-hidden="true" /> Scene 01 · Inside the clinic
          </p>
          <h2 className="mt-3 max-w-4xl font-serif text-2xl font-bold leading-tight text-slate-900 sm:text-3xl">{lesson.headline}</h2>
          <p className="mt-3 text-xs leading-6 text-slate-500">Fictional teaching scenario. Real patients always require individual assessment.</p>
        </div>
        <div className="space-y-7 p-6 sm:p-9">
          <div className="border-l-2 border-teal-200 pl-6">
            <p className="text-xs font-bold uppercase tracking-[0.15em] text-teal-800">The arrival · Picture the moment</p>
            <p className="mt-3 font-serif text-lg leading-9 text-slate-800">{lesson.scene}</p>
          </div>
          <div className="rounded-2xl border-l-4 border-violet-500 bg-violet-50/70 p-5">
            <p className="text-xs font-bold uppercase tracking-[0.17em] text-violet-800">The conversation · Humor belongs in the lesson</p>
            <p className="mt-3 text-[15px] leading-8 text-slate-800">{lesson.dialogue}</p>
          </div>
          <section className="rounded-2xl border border-cyan-100 bg-cyan-50/70 p-5 sm:p-6" aria-label="Clinical clues">
            <h3 className="flex items-center gap-2 font-serif text-xl font-bold text-slate-900"><Brain className="h-5 w-5 text-cyan-700" aria-hidden="true" /> Scene 02 · Detective work</h3>
            <p className="mt-3 text-[15px] leading-8 text-slate-800">{lesson.clue}</p>
            <details className="mt-5 rounded-xl border border-cyan-200 bg-white p-4">
              <summary className="cursor-pointer text-sm font-bold text-cyan-900 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-cyan-700">
                Plot twist: What is the hidden catch?
              </summary>
              <p className="mt-3 border-t border-cyan-100 pt-4 text-sm leading-8 text-slate-700">{lesson.plotTwist}</p>
            </details>
          </section>
          <section className="rounded-2xl border border-amber-200 bg-gradient-to-br from-amber-50 to-white p-5" aria-label="Aha moment">
            <p className="flex items-center gap-2 text-xs font-bold uppercase tracking-[0.17em] text-amber-800">
              <Lightbulb className="h-5 w-5" aria-hidden="true" /> Aha Moment
            </p>
            <p className="mt-3 font-serif text-lg font-bold leading-8 text-slate-900">{lesson.aha}</p>
          </section>
        </div>
      </article>

      <section className="mt-8 overflow-hidden rounded-3xl border border-indigo-200 bg-gradient-to-br from-indigo-50/60 via-white to-teal-50/60">
        <div className="border-b border-indigo-100 p-6 sm:p-8">
          <p className="flex items-center gap-2 text-xs font-bold uppercase tracking-[0.16em] text-indigo-800">
            <Stethoscope className="h-5 w-5" aria-hidden="true" /> Scene 03 · How the clinician thinks
          </p>
          <h2 className="mt-3 font-serif text-2xl font-bold text-slate-900">From a memorable scene to a real clinical decision</h2>
          <p className="mt-3 max-w-4xl text-sm leading-7 text-slate-700">{lesson.approach}</p>
          <p className="mt-3 text-xs font-medium leading-6 text-slate-600">{lesson.origin}</p>
        </div>
        <div className="grid gap-4 p-5 sm:p-8 lg:grid-cols-2">
          {lesson.clinicFlow.map((step, i) => (
            <div key={step} className="rounded-2xl border border-slate-200 bg-white p-5">
              <p className="flex items-center gap-2 text-xs font-bold uppercase tracking-[0.16em] text-teal-800">
                <span className="flex h-7 w-7 items-center justify-center rounded-full bg-teal-800 text-white">{i + 1}</span>
                {["Before any hands-on contact", "What to assess", "A responsible clinical trial", "Reassess and integrate"][i]}
              </p>
              <p className="mt-3 text-sm leading-8 text-slate-700">{step}</p>
            </div>
          ))}
        </div>
        <div className="border-t border-teal-100 bg-teal-50/50 p-6 sm:p-8">
          <p className="flex items-center gap-2 text-xs font-bold uppercase tracking-[0.18em] text-teal-800">
            <HeartPulse className="h-4 w-4" aria-hidden="true" /> For patients · In human words
          </p>
          <p className="mt-3 max-w-4xl text-[15px] leading-8 text-slate-800">{lesson.patientExplanation}</p>
        </div>
      </section>

      <WorldApproachChallenge lesson={lesson} />

      <section id="world-evidence" className="mt-8 scroll-mt-24 rounded-3xl border border-slate-200 bg-white p-6 sm:p-8">
        <p className="flex items-center gap-2 text-xs font-bold uppercase tracking-[0.16em] text-indigo-700">
          <Microscope className="h-5 w-5" aria-hidden="true" /> Evidence reality check
        </p>
        <h2 className="mt-2 font-serif text-2xl font-bold text-slate-900">What research supports—and what it does not</h2>
        <p className="mt-4 text-[15px] leading-8 text-slate-700">{lesson.evidence}</p>
        <div className="mt-6 grid gap-4 md:grid-cols-2">
          <div className="rounded-2xl border border-violet-200 bg-violet-50/60 p-5">
            <h3 className="flex items-center gap-2 text-sm font-bold text-violet-900"><Sparkles className="h-4 w-4" aria-hidden="true" /> Myth vs fact</h3>
            <p className="mt-3 text-sm leading-7 text-slate-800">{lesson.myth}</p>
          </div>
          <div className="rounded-2xl border border-rose-200 bg-rose-50/70 p-5">
            <h3 className="flex items-center gap-2 text-sm font-bold text-rose-900"><ShieldAlert className="h-4 w-4" aria-hidden="true" /> Stop, screen or refer</h3>
            <p className="mt-3 text-sm leading-7 text-slate-800">{lesson.stop}</p>
          </div>
        </div>

        <div className="mt-6 border-t border-slate-100 pt-5">
          <h3 className="flex items-center gap-2 text-sm font-bold text-slate-900"><BookOpenText className="h-4 w-4 text-indigo-700" aria-hidden="true" /> Reading and source material</h3>
          <ul className="mt-3 space-y-3">
            {lesson.sources.map((source) => (
              <li key={source.url}>
                <a className="inline-flex items-start gap-2 text-sm font-semibold leading-7 text-teal-800 underline underline-offset-4" href={source.url} rel="noopener noreferrer" target="_blank">
                  {source.label} <ExternalLink className="mt-1.5 h-4 w-4 flex-none" aria-hidden="true" />
                </a>
              </li>
            ))}
          </ul>
          <p className="mt-4 text-xs leading-6 text-slate-500">
            Where a source addresses broader manual therapy rather than this exact named approach,
            it is contextual reading—not proof of the named method. Clinical teaching does not replace certified technique training, consent or personalized care.
          </p>
        </div>
      </section>

      <nav className="mt-9 flex flex-wrap justify-between gap-4 rounded-3xl border border-teal-200 bg-teal-50/70 p-5 sm:p-6" aria-label="More manual therapy chapters">
        <a className="inline-flex items-center gap-2 text-sm font-bold text-teal-900" href="/manual-therapy">
          <ArrowLeft className="h-4 w-4" aria-hidden="true" /> All manual therapy approaches
        </a>
        <a className="inline-flex items-center gap-2 text-sm font-bold text-teal-900" href={"/manual-therapy/" + next.slug}>
          Next story: {next.title} <ArrowRight className="h-4 w-4" aria-hidden="true" />
        </a>
      </nav>
    </main>
  );
}
