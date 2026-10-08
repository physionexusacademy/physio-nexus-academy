"use client";

import { useState } from "react";
import { ArrowRight, CheckCircle2, RotateCcw, XCircle } from "lucide-react";
import type { WorldManualApproach } from "@/lib/manual-therapy-world";

export function WorldApproachChallenge({ lesson }: { lesson: WorldManualApproach }) {
  const [choice, setChoice] = useState<number | null>(null);
  const correct = choice === lesson.answer;

  return (
    <section data-pna-world-challenge="v1" className="mt-8 overflow-hidden rounded-3xl border border-indigo-200 bg-white shadow-sm" aria-labelledby="world-quiz-title">
      <div className="border-b border-indigo-100 bg-gradient-to-r from-indigo-50 to-teal-50 p-6 sm:p-8">
        <p className="text-xs font-bold uppercase tracking-[0.16em] text-indigo-700">Your turn · The clinical plot twist</p>
        <h2 id="world-quiz-title" className="mt-2 font-serif text-2xl font-bold leading-tight text-slate-900">
          You are the clinician. What would you do?
        </h2>
        <p className="mt-4 max-w-3xl text-base font-semibold leading-8 text-slate-800">{lesson.question}</p>
      </div>
      <div className="space-y-3 p-5 sm:p-8">
        {lesson.options.map((option, i) => (
          <button
            key={option}
            type="button"
            disabled={choice !== null}
            aria-pressed={choice === i}
            onClick={() => setChoice(i)}
            className={`flex w-full items-start gap-3 rounded-2xl border px-4 py-4 text-left text-sm font-medium leading-7 transition focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-700 ${choice === i ? correct ? "border-emerald-400 bg-emerald-50 text-emerald-950" : "border-amber-400 bg-amber-50 text-amber-950" : "border-slate-200 bg-white text-slate-800 enabled:hover:border-indigo-400 enabled:hover:bg-indigo-50 disabled:opacity-80"}`}
          >
            <span className="flex h-7 w-7 flex-none items-center justify-center rounded-full bg-indigo-50 text-xs font-bold text-indigo-900">{String.fromCharCode(65 + i)}</span>
            {option}
          </button>
        ))}
        {choice === null ? (
          <p className="text-xs leading-6 text-slate-500">Pick one. Think like a clinician, not a technique collector.</p>
        ) : (
          <div role="status" aria-live="polite" className={`rounded-2xl border p-5 ${correct ? "border-emerald-200 bg-emerald-50/70" : "border-amber-200 bg-amber-50/70"}`}>
            <p className="flex items-center gap-2 font-bold text-slate-900">
              {correct ? <CheckCircle2 className="h-5 w-5 text-emerald-700" aria-hidden="true" /> : <XCircle className="h-5 w-5 text-amber-700" aria-hidden="true" />}
              {correct ? "Brilliant clinical reasoning!" : "Plot twist! Let's revisit the evidence."}
            </p>
            <p className="mt-3 text-sm leading-7 text-slate-800">{lesson.explanation}</p>
            <p className="mt-2 text-sm font-semibold text-slate-700">Best answer: {String.fromCharCode(65 + lesson.answer)}</p>
            <button type="button" onClick={() => setChoice(null)} className="mt-4 inline-flex items-center gap-2 text-sm font-bold text-indigo-800 underline underline-offset-4">
              <RotateCcw className="h-4 w-4" aria-hidden="true" /> Try again
            </button>
          </div>
        )}
      </div>
      <a href="#world-evidence" className="mx-5 mb-6 inline-flex items-center gap-2 text-sm font-bold text-indigo-800 hover:underline sm:mx-8">
        See what the research actually says <ArrowRight className="h-4 w-4" aria-hidden="true" />
      </a>
    </section>
  );
}
