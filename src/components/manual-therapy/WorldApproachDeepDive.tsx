import {
  ArrowRight, BookMarked, BrainCircuit, ClipboardCheck, HeartPulse,
  Lightbulb, Microscope, ShieldAlert, Sparkles, Stethoscope,
} from "lucide-react";
import type { WorldDeepChapter } from "@/lib/manual-therapy-world-depth-types";
import { AttentionReset } from "@/components/manual-therapy/AttentionReset";

export function WorldApproachDeepDive({ chapter, slug }: { chapter: WorldDeepChapter; slug: string }) {
  return (
    <article data-pna-world-depth="full-chapter-v2" className="mt-9 space-y-8" aria-label="In-depth approach chapter">
      <header className="overflow-hidden rounded-3xl border border-indigo-200 bg-gradient-to-br from-indigo-50 via-white to-teal-50 p-6 sm:p-9">
        <p className="flex items-center gap-2 text-xs font-bold uppercase tracking-[0.16em] text-indigo-800">
          <BookMarked className="h-5 w-5" aria-hidden="true" /> Beyond the introduction · Your complete deep dive
        </p>
        <h2 className="mt-3 font-serif text-2xl font-bold leading-tight text-slate-900 sm:text-3xl">
          Learn the thinking. Picture the hands. Remember the lesson.
        </h2>
        <p className="mt-5 max-w-4xl text-[16px] leading-9 text-slate-800">{chapter.opening}</p>
        <nav className="mt-6 flex flex-wrap gap-2 text-xs font-bold" aria-label="Deep chapter sections">
          {[
            ["Core ideas", "#world-deep-ideas"],
            ["Assessment", "#world-deep-assessment"],
            ["Clinical pathway", "#world-deep-method"],
            ["Patient story", "#world-deep-case"],
            ["Safety and evidence", "#world-deep-safety"],
          ].map(([label, href]) => (
            <a key={href} href={href} className="rounded-full border border-indigo-200 bg-white px-3 py-2 text-indigo-800 transition hover:bg-indigo-100">
              {label}
            </a>
          ))}
        </nav>
      </header>

      <section id="world-deep-ideas" className="scroll-mt-24 rounded-3xl border border-slate-200 bg-white p-6 shadow-sm sm:p-9">
        <p className="flex items-center gap-2 text-xs font-bold uppercase tracking-[0.17em] text-violet-700">
          <BrainCircuit className="h-5 w-5" aria-hidden="true" /> Chapter I · The ideas that make the method different
        </p>
        <h2 className="mt-3 font-serif text-2xl font-bold text-slate-900">Understand the why before the how</h2>
        <div className="mt-7 grid gap-5 md:grid-cols-2">
          {chapter.principles.map((item, i) => (
            <section key={item.title} className="rounded-2xl border border-violet-100 bg-violet-50/40 p-5">
              <p className="text-xs font-bold uppercase tracking-[0.12em] text-violet-700">Concept {i+1}</p>
              <h3 className="mt-2 font-serif text-lg font-bold leading-7 text-slate-900">{item.title}</h3>
              <p className="mt-3 text-[15px] leading-8 text-slate-700">{item.body}</p>
            </section>
          ))}
        </div>
      </section>

      <AttentionReset slug={slug} moment="wake" />
      <section id="world-deep-assessment" className="scroll-mt-24 overflow-hidden rounded-3xl border border-cyan-200 bg-white shadow-sm">
        <div className="bg-cyan-50/60 p-6 sm:p-8">
          <p className="flex items-center gap-2 text-xs font-bold uppercase tracking-[0.16em] text-cyan-800">
            <Stethoscope className="h-5 w-5" aria-hidden="true" /> Chapter II · The clinical detective's notebook
          </p>
          <h2 className="mt-3 font-serif text-2xl font-bold text-slate-900">What to notice before touching the patient</h2>
          <p className="mt-2 text-sm leading-7 text-slate-600">The first clue is rarely hiding under the therapist's thumb.</p>
        </div>
        <div className="grid gap-6 p-6 sm:grid-cols-2 sm:p-8">
          {chapter.assessment.map((part,i) => (
            <section key={part.title} className="border-l-[3px] border-cyan-400 pl-5">
              <p className="text-xs font-bold uppercase tracking-[0.15em] text-cyan-700">Observation {i+1}</p>
              <h3 className="mt-2 font-serif text-lg font-bold text-slate-900">{part.title}</h3>
              <p className="mt-3 text-[15px] leading-8 text-slate-700">{part.body}</p>
            </section>
          ))}
        </div>
      </section>

      <section id="world-deep-method" className="scroll-mt-24 overflow-hidden rounded-3xl border border-teal-200 bg-white shadow-sm">
        <div className="border-b border-teal-100 bg-teal-50/60 p-6 sm:p-8">
          <p className="flex items-center gap-2 text-xs font-bold uppercase tracking-[0.16em] text-teal-800">
            <ClipboardCheck className="h-5 w-5" aria-hidden="true" /> Chapter III · Inside the method
          </p>
          <h2 className="mt-3 font-serif text-2xl font-bold text-slate-900">Follow the clinical sequence, not a memorized ritual</h2>
          <p className="mt-3 max-w-4xl text-sm leading-7 text-slate-700">
            These are conceptual stages for professional learning. Region-specific manual contacts, clinical indications and supervised training
            remain essential; especially uncertain or higher-risk methods are not instructions for self-treatment.
          </p>
        </div>
        <div className="relative ml-8 border-l-2 border-teal-100 px-6 py-7 sm:ml-10 sm:px-9">
          {chapter.application.map((step, i) => (
            <section key={step.title} className={i+1===chapter.application.length?"relative":"relative pb-8"}>
              <div className="absolute -left-[37px] top-0 flex h-7 w-7 items-center justify-center rounded-full bg-teal-700 text-xs font-bold text-white ring-4 ring-white sm:-left-[45px]">
                {i+1}
              </div>
              <h3 className="font-serif text-lg font-bold leading-7 text-slate-900">{step.title}</h3>
              <p className="mt-3 max-w-4xl text-[15px] leading-8 text-slate-700">{step.body}</p>
            </section>
          ))}
        </div>
      </section>

      <AttentionReset slug={slug} moment="think" />
      <section id="world-deep-case" className="scroll-mt-24 overflow-hidden rounded-3xl border border-indigo-200 bg-white shadow-sm">
        <div className="bg-gradient-to-r from-indigo-900 to-teal-900 p-6 text-white sm:p-8">
          <p className="flex items-center gap-2 text-xs font-bold uppercase tracking-[0.17em] text-indigo-100">
            <Sparkles className="h-5 w-5" aria-hidden="true" /> Chapter IV · A day inside the treatment room
          </p>
          <h2 className="mt-3 font-serif text-2xl font-bold text-white sm:text-3xl">One patient's story, five moments that matter</h2>
          <p className="mt-3 text-sm leading-7 text-indigo-100">
            Fictional educational case, not a real patient record or proof that the method works.
          </p>
        </div>
        <div className="space-y-7 p-6 sm:p-9">
          {[
            ["The arrival", chapter.caseStudy.scene],
            ["The clues", chapter.caseStudy.findings],
            ["The decision", chapter.caseStudy.decision],
            ["The plot twist", chapter.caseStudy.twist],
            ["The next chapter", chapter.caseStudy.finish],
          ].map(([title, body],i)=>(
            <section key={title} className="border-l-[3px] border-indigo-200 pl-5">
              <p className="text-xs font-bold uppercase tracking-[0.14em] text-indigo-700">Scene {i+1} · {title}</p>
              <p className="mt-3 font-serif text-base leading-9 text-slate-800">{body}</p>
            </section>
          ))}
          <div className="rounded-2xl border border-amber-200 bg-amber-50/70 p-5">
            <p className="flex items-center gap-2 text-xs font-bold uppercase tracking-[0.17em] text-amber-800">
              <Lightbulb className="h-5 w-5" aria-hidden="true" /> The unforgettable line
            </p>
            <p className="mt-2 font-serif text-lg font-bold italic leading-8 text-slate-900">{chapter.memoryHook}</p>
          </div>
        </div>
      </section>

      <AttentionReset slug={slug} moment="remember" />
      <section id="world-deep-safety" className="scroll-mt-24 rounded-3xl border border-slate-200 bg-white p-6 shadow-sm sm:p-9">
        <p className="flex items-center gap-2 text-xs font-bold uppercase tracking-[0.16em] text-indigo-700">
          <Microscope className="h-5 w-5" aria-hidden="true" /> Chapter V · Claims under the microscope
        </p>
        <h2 className="mt-2 font-serif text-2xl font-bold text-slate-900">What is known, what is uncertain, and what we should say</h2>
        <div className="mt-6 space-y-5">
          <div className="rounded-2xl border border-teal-200 bg-teal-50/60 p-5">
            <h3 className="text-sm font-bold text-teal-900">What can reasonably be said</h3>
            <p className="mt-2 text-[15px] leading-8 text-slate-800">{chapter.evidence.known}</p>
          </div>
          <div className="rounded-2xl border border-violet-200 bg-violet-50/60 p-5">
            <h3 className="text-sm font-bold text-violet-900">Where certainty ends</h3>
            <p className="mt-2 text-[15px] leading-8 text-slate-800">{chapter.evidence.unknown}</p>
          </div>
          <div className="rounded-2xl border border-slate-200 p-5">
            <h3 className="flex items-center gap-2 text-sm font-bold text-slate-900">
              <HeartPulse className="h-4 w-4" aria-hidden="true" /> Explain it to the patient without jargon
            </h3>
            <p className="mt-2 text-[15px] leading-8 text-slate-700">{chapter.evidence.communication}</p>
          </div>
          <div className="grid gap-4 lg:grid-cols-2">
            <aside className="rounded-2xl border border-amber-200 bg-amber-50/70 p-5">
              <h3 className="text-sm font-bold text-amber-950">Dosage and realistic scope</h3>
              <p className="mt-2 text-[15px] leading-8 text-slate-800">{chapter.dose}</p>
            </aside>
            <aside className="rounded-2xl border border-rose-200 bg-rose-50/70 p-5">
              <h3 className="flex items-center gap-2 text-sm font-bold text-rose-900">
                <ShieldAlert className="h-4 w-4" aria-hidden="true" /> Stop, screen or refer
              </h3>
              <p className="mt-2 text-[15px] leading-8 text-slate-800">{chapter.caution}</p>
            </aside>
          </div>
        </div>
      </section>

      <section className="rounded-3xl border border-cyan-200 bg-gradient-to-br from-white to-cyan-50/60 p-6 sm:p-8" aria-label="Two clinical reasoning self checks">
        <p className="text-xs font-bold uppercase tracking-[0.16em] text-cyan-800">The final two plot twists · Test yourself</p>
        <h2 className="mt-2 font-serif text-2xl font-bold text-slate-900">Would you make the same decision?</h2>
        <div className="mt-6 space-y-4">
          {chapter.checks.map((check,i)=>(
            <section key={check.question} className="rounded-2xl border border-slate-200 bg-white p-5">
              <p className="text-xs font-bold uppercase tracking-widest text-indigo-800">Challenge {i+1}</p>
              <p className="mt-3 text-[15px] font-semibold leading-8 text-slate-900">{check.question}</p>
              <details className="mt-4 border-t border-slate-100 pt-3">
                <summary className="cursor-pointer text-sm font-bold text-teal-800 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-teal-600">
                  Think first · Reveal the clinical reasoning
                </summary>
                <p className="mt-3 text-[15px] leading-8 text-slate-700">{check.answer}</p>
              </details>
            </section>
          ))}
        </div>
        <p className="mt-5 text-xs leading-6 text-slate-500">Practical education is not a substitute for supervised skill training, differential diagnosis or professional guidelines.</p>
      </section>

      <section className="rounded-3xl border border-slate-200 bg-white p-6 sm:p-8">
        <h2 className="font-serif text-xl font-bold text-slate-900">Further reading for the curious clinician</h2>
        <p className="mt-2 text-sm leading-7 text-slate-600">Some sources describe a historical model or wider clinical guidelines. Neither should be mistaken for proof that the named method works for every patient.</p>
        <ul className="mt-4 space-y-3">
          {chapter.sources.map((source)=>(
            <li key={source.url}>
              <a href={source.url} target="_blank" rel="noopener noreferrer" className="inline-flex items-start gap-2 text-sm font-semibold leading-7 text-indigo-800 underline underline-offset-4">
                {source.label} <ArrowRight className="mt-1.5 h-4 w-4 flex-none" aria-hidden="true" />
              </a>
            </li>
          ))}
        </ul>
      </section>
    </article>
  );
}
