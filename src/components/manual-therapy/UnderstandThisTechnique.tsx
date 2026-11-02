"use client";

import { useState } from "react";
import { BookOpenText, ChevronDown, ChevronUp, Languages } from "lucide-react";

export type TechniqueUrduSection = { heading: string; text: string };
export type TechniqueUrduContent = { short: string; details: TechniqueUrduSection[] };

export function UnderstandThisTechnique({ content, extraDetails = [] }: { content: TechniqueUrduContent; extraDetails?: TechniqueUrduSection[] }) {
  const [introOpen, setIntroOpen] = useState(false);
  const [expanded, setExpanded] = useState(false);

  const closePanel = () => {
    setIntroOpen(false);
    setExpanded(false);
  };

  return (
    <section aria-labelledby="pna-understand-technique-title" className="mx-auto mt-6 w-full max-w-5xl rounded-2xl border border-teal-200 bg-white shadow-sm">
      <button
        type="button"
        aria-expanded={introOpen}
        aria-controls="pna-understand-technique-content"
        onClick={() => {
          setIntroOpen(open => !open);
          setExpanded(false);
        }}
        className="flex min-h-14 w-full items-center gap-3 rounded-2xl px-4 py-4 text-left transition hover:bg-teal-50/70 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-600 focus-visible:ring-offset-2 sm:px-5"
      >
        <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-teal-100 text-teal-800">
          <Languages className="h-5 w-5" aria-hidden="true" />
        </span>
        <span className="min-w-0 flex-1">
          <span id="pna-understand-technique-title" className="block text-base font-bold text-teal-900">Understand in Roman Urdu</span>
          <span className="mt-0.5 block text-xs text-slate-500">Asaan alfaaz mein samjhein</span>
        </span>
        {introOpen ? <ChevronUp className="h-5 w-5 shrink-0 text-teal-800" aria-hidden="true" /> : <ChevronDown className="h-5 w-5 shrink-0 text-teal-800" aria-hidden="true" />}
      </button>

      {introOpen ? (
        <div id="pna-understand-technique-content" className="border-t border-teal-100 bg-gradient-to-br from-white via-teal-50/50 to-cyan-50/40 p-4 sm:p-6">
          <p className="text-xs font-bold uppercase tracking-[0.14em] text-teal-800">Mukhtasar samjh</p>
          <p className="mt-2 whitespace-pre-line text-[15px] leading-8 text-slate-700">{content.short}</p>

          {expanded ? (
            <div id="pna-understand-technique-details" className="mt-4 space-y-3">
              {[...content.details, ...extraDetails].map((section, index) => (
                <section key={section.heading} className="rounded-2xl border border-slate-200 bg-white p-4 sm:p-5">
                  <h3 className="font-bold text-slate-900">{index + 1}. {section.heading}</h3>
                  <p className="mt-2 whitespace-pre-line text-sm leading-7 text-slate-700">{section.text}</p>
                </section>
              ))}
              <p className="rounded-xl bg-amber-50 px-4 py-3 text-xs leading-6 text-amber-900">Yeh Roman Urdu learning aid hai. English source content original aur unchanged rehta hai. Misalein sirf samjhane ke liye hain; patient ka assessment aur clinical judgement zaroori hai.</p>
            </div>
          ) : null}

          <div className="mt-4 flex flex-wrap gap-2">
            <button
              type="button"
              aria-expanded={expanded}
              aria-controls="pna-understand-technique-details"
              onClick={() => setExpanded(value => !value)}
              className="inline-flex min-h-11 items-center justify-center gap-2 rounded-xl bg-teal-700 px-4 py-3 text-sm font-bold text-white transition hover:bg-teal-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-600 focus-visible:ring-offset-2"
            >
              <BookOpenText className="h-4 w-4" aria-hidden="true" />
              {expanded ? "Mukhtasar samjh par wapas" : "Depth mein samjhein"}
              {expanded ? <ChevronUp className="h-4 w-4" aria-hidden="true" /> : <ChevronDown className="h-4 w-4" aria-hidden="true" />}
            </button>
            <button type="button" onClick={closePanel} className="min-h-11 rounded-xl border border-teal-200 bg-white px-4 py-3 text-sm font-semibold text-teal-900 transition hover:bg-teal-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-600 focus-visible:ring-offset-2">
              Band karein
            </button>
          </div>
        </div>
      ) : null}
    </section>
  );
}
