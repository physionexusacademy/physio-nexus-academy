"use client";

import { useState } from "react";
import {
  ArrowDown,
  BookOpenText,
  Brain,
  CheckCircle2,
  CircleHelp,
  Clapperboard,
  HeartPulse,
  Lightbulb,
  RotateCcw,
  ShieldAlert,
  Sparkles,
  Stethoscope,
  XCircle,
} from "lucide-react";
import type { MSKStory } from "@/lib/msk-clinical-stories";

type ReadingMode = "patient" | "clinician";

export function MSKStoryExperience({ story }: { story: MSKStory }) {
  const [mode, setMode] = useState<ReadingMode>("patient");
  const [selection, setSelection] = useState<number | null>(null);
  const isCorrect = selection === story.answer;

  return (
    <article
      id="msk-clinical-story"
      data-pna-msk-story="cinematic-v1"
      className="mt-9 overflow-hidden rounded-[2rem] border border-slate-200 bg-white shadow-sm"
      aria-labelledby="msk-story-heading"
    >
      <div className="bg-gradient-to-br from-slate-900 via-indigo-950 to-teal-900 px-6 py-8 text-white sm:px-9 sm:py-10">
        <div className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-3 py-1.5 text-xs font-bold tracking-widest text-teal-100">
          <Clapperboard className="h-4 w-4" aria-hidden="true" />
          THE MSK CLINICAL STORY
        </div>
        <h2 id="msk-story-heading" className="mt-5 max-w-4xl font-serif text-2xl font-bold leading-tight text-white sm:text-4xl">
          {story.headline}
        </h2>
        <p className="mt-4 max-w-3xl text-sm leading-7 text-slate-200">
          A fictional teaching case. Follow the clues, enjoy the conversation, and make the decisions
          a thoughtful clinician would make—not an instant diagnosis from a single symptom.
        </p>
      </div>

      <div className="space-y-8 px-5 py-7 sm:px-9 sm:py-9">
        <section aria-label="Patient arrival">
          <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-[0.17em] text-teal-800">
            <BookOpenText className="h-4 w-4" aria-hidden="true" />
            Scene 01 · The patient walks in
          </div>
          <p className="mt-3 max-w-4xl font-serif text-lg leading-9 text-slate-800">{story.scene}</p>
          <div className="mt-5 rounded-2xl border-l-4 border-violet-500 bg-violet-50 px-5 py-4">
            <p className="text-xs font-bold uppercase tracking-[0.16em] text-violet-800">A little clinic conversation</p>
            <p className="mt-2 text-[15px] leading-8 text-slate-800">{story.dialogue}</p>
          </div>
        </section>

        <section className="relative rounded-2xl border border-cyan-100 bg-cyan-50/70 p-5 sm:p-6" aria-label="Clinical clues">
          <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-[0.17em] text-cyan-800">
            <Brain className="h-4 w-4" aria-hidden="true" />
            Scene 02 · Follow the clues
          </div>
          <p className="mt-3 text-[15px] leading-8 text-slate-800">{story.clue}</p>
          <details className="group mt-4 rounded-xl border border-cyan-200 bg-white p-4">
            <summary className="cursor-pointer text-sm font-bold text-cyan-900 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-cyan-700">
              Plot twist · What could fool us?
            </summary>
            <p className="mt-3 border-t border-cyan-100 pt-3 text-sm leading-7 text-slate-700">{story.twist}</p>
          </details>
        </section>

        <aside className="rounded-2xl border border-amber-200 bg-gradient-to-r from-amber-50 to-white p-5 sm:p-6">
          <p className="flex items-center gap-2 text-xs font-bold uppercase tracking-[0.17em] text-amber-800">
            <Lightbulb className="h-5 w-5" aria-hidden="true" />
            The Aha Moment
          </p>
          <p className="mt-3 font-serif text-lg font-semibold leading-8 text-slate-900">{story.aha}</p>
        </aside>

        <section aria-label="Choose reading depth">
          <div className="flex flex-wrap items-center gap-2">
            <Sparkles className="h-5 w-5 text-teal-700" aria-hidden="true" />
            <h3 className="font-serif text-xl font-bold text-slate-900">Choose your learning lens</h3>
          </div>
          <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-600">
            Same clinical case, two ways to understand it. The complete examination and treatment
            guide is still available below.
          </p>
          <div className="mt-4 flex flex-wrap gap-2" role="group" aria-label="Reading mode">
            <button
              type="button"
              aria-pressed={mode === "patient"}
              onClick={() => setMode("patient")}
              className={`inline-flex items-center gap-2 rounded-full px-4 py-2.5 text-sm font-bold transition focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-teal-700 ${mode === "patient" ? "bg-teal-800 text-white shadow-sm" : "border border-slate-200 bg-white text-slate-700 hover:bg-slate-50"}`}
            >
              <HeartPulse className="h-4 w-4" aria-hidden="true" />
              For patients
            </button>
            <button
              type="button"
              aria-pressed={mode === "clinician"}
              onClick={() => setMode("clinician")}
              className={`inline-flex items-center gap-2 rounded-full px-4 py-2.5 text-sm font-bold transition focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-teal-700 ${mode === "clinician" ? "bg-indigo-800 text-white shadow-sm" : "border border-slate-200 bg-white text-slate-700 hover:bg-slate-50"}`}
            >
              <Stethoscope className="h-4 w-4" aria-hidden="true" />
              For students & clinicians
            </button>
          </div>
          <div className="mt-4 rounded-2xl border border-slate-200 bg-slate-50/70 p-5 sm:p-6">
            <p className="text-xs font-bold uppercase tracking-[0.16em] text-slate-600">
              {mode === "patient" ? "In everyday words" : "Clinical reasoning & differential lens"}
            </p>
            <p className="mt-3 text-[15px] leading-8 text-slate-800">
              {mode === "patient" ? story.patientTranslation : story.clinicianReasoning}
            </p>
          </div>
        </section>

        <section aria-label="Rehabilitation journey" className="rounded-2xl border border-emerald-200 bg-emerald-50/60 p-5 sm:p-6">
          <p className="flex items-center gap-2 text-xs font-bold uppercase tracking-[0.17em] text-emerald-800">
            <CheckCircle2 className="h-5 w-5" aria-hidden="true" />
            Scene 03 · The rehabilitation journey
          </p>
          <p className="mt-3 text-[15px] leading-8 text-slate-800">{story.rehabBridge}</p>
          <a href="#msk-rehab" className="mt-4 inline-flex items-center gap-2 text-sm font-bold text-emerald-900 underline underline-offset-4">
            See the full phased rehabilitation plan
            <ArrowDown className="h-4 w-4" aria-hidden="true" />
          </a>
        </section>

        <section aria-labelledby="msk-case-challenge" className="overflow-hidden rounded-2xl border border-indigo-200 bg-white">
          <div className="border-b border-indigo-100 bg-indigo-50 p-5 sm:p-6">
            <p className="flex items-center gap-2 text-xs font-bold uppercase tracking-[0.17em] text-indigo-800">
              <CircleHelp className="h-5 w-5" aria-hidden="true" />
              You are the clinician · Interactive challenge
            </p>
            <h3 id="msk-case-challenge" className="mt-3 text-lg font-bold leading-7 text-slate-900">{story.question}</h3>
          </div>
          <div className="space-y-3 p-5 sm:p-6">
            {story.options.map((option, index) => {
              const chosen = selection === index;
              return (
                <button
                  key={option}
                  type="button"
                  disabled={selection !== null}
                  onClick={() => setSelection(index)}
                  aria-pressed={chosen}
                  className={`flex w-full items-start gap-3 rounded-xl border px-4 py-3 text-left text-sm leading-6 transition focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-700 ${chosen ? isCorrect ? "border-emerald-500 bg-emerald-50 text-emerald-900" : "border-amber-500 bg-amber-50 text-amber-900" : "border-slate-200 bg-white text-slate-800 enabled:hover:border-indigo-300 enabled:hover:bg-indigo-50 disabled:opacity-80"}`}
                >
                  <span className="flex h-6 w-6 flex-none items-center justify-center rounded-full bg-slate-100 text-xs font-bold text-slate-700">{String.fromCharCode(65 + index)}</span>
                  <span>{option}</span>
                </button>
              );
            })}
            {selection !== null ? (
              <div role="status" aria-live="polite" className={`mt-4 rounded-xl border p-4 ${isCorrect ? "border-emerald-200 bg-emerald-50" : "border-amber-200 bg-amber-50"}`}>
                <p className="flex items-center gap-2 font-bold text-slate-900">
                  {isCorrect ? <CheckCircle2 className="h-5 w-5 text-emerald-700" aria-hidden="true" /> : <XCircle className="h-5 w-5 text-amber-700" aria-hidden="true" />}
                  {isCorrect ? "Great clinical call!" : "Plot twist—follow the evidence."}
                </p>
                <p className="mt-2 text-sm leading-7 text-slate-800">{story.explanation}</p>
                <p className="mt-2 text-xs font-semibold text-slate-700">Best answer: {String.fromCharCode(65 + story.answer)}.</p>
                <button onClick={() => setSelection(null)} type="button" className="mt-4 inline-flex items-center gap-2 text-sm font-bold text-indigo-800 underline underline-offset-4">
                  <RotateCcw className="h-4 w-4" aria-hidden="true" />
                  Try again
                </button>
              </div>
            ) : (
              <p className="text-xs text-slate-500">Choose one answer to reveal the explanation. No score, no pressure—just better clinical reasoning.</p>
            )}
          </div>
        </section>

        <p className="flex items-start gap-2 border-t border-slate-100 pt-5 text-xs leading-6 text-slate-600">
          <ShieldAlert className="mt-0.5 h-4 w-4 flex-none text-slate-500" aria-hidden="true" />
          These cases teach reasoning; they do not provide a diagnosis for an individual patient.
          Always consider red flags, contraindications, comorbidities and local referral pathways.
        </p>
      </div>
    </article>
  );
}
