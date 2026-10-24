"use client";

import { useState } from "react";
import { BookOpenText, ChevronDown, ChevronUp, Languages } from "lucide-react";

export type TechniqueUrduSection = { heading: string; text: string };
export type TechniqueUrduContent = { short: string; details: TechniqueUrduSection[] };

export function UnderstandThisTechnique({ content }: { content: TechniqueUrduContent }) {
  const [expanded, setExpanded] = useState(false);
  return (
    <section aria-labelledby="pna-understand-technique-title" className="mx-auto mt-6 w-full max-w-5xl rounded-3xl border border-teal-200 bg-gradient-to-br from-white via-teal-50/70 to-cyan-50/50 p-5 shadow-sm sm:p-7">
      <div className="flex items-start gap-3">
        <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-teal-100 text-teal-800"><Languages className="h-5 w-5" aria-hidden="true" /></span>
        <div className="min-w-0 flex-1">
          <p className="text-xs font-bold uppercase tracking-[0.14em] text-teal-800">PNA Learning Companion</p>
          <h2 id="pna-understand-technique-title" className="mt-1 text-xl font-bold text-navy-800 sm:text-2xl">Understand This Technique</h2>
          <p className="mt-2 text-sm leading-7 text-navy-600">Pehle asaan Roman Urdu mein khulasa parhein; phir zaroorat ho to tafseeli tarjuma kholein.</p>
        </div>
      </div>
      <div className="mt-5 rounded-2xl border border-teal-100 bg-white p-4 sm:p-5">
        <p className="text-sm font-bold text-teal-900">Short explanation · Mukhtasar samjh</p>
        <p className="mt-2 whitespace-pre-line text-[15px] leading-8 text-slate-700">{content.short}</p>
      </div>
      {expanded ? <div id="pna-understand-technique-details" className="mt-4 space-y-3">
        {content.details.map((section, index) => <section key={section.heading} className="rounded-2xl border border-slate-200 bg-white p-4 sm:p-5">
          <h3 className="font-bold text-navy-800">{index + 1}. {section.heading}</h3>
          <p className="mt-2 whitespace-pre-line text-sm leading-7 text-slate-700">{section.text}</p>
        </section>)}
        <p className="rounded-xl bg-amber-50 px-4 py-3 text-xs leading-6 text-amber-900">Yeh Roman Urdu learning aid hai. English source content original aur unchanged rehta hai. Misalein sirf samjhane ke liye hain; patient ka assessment aur clinical judgement zaroori hai.</p>
      </div> : null}
      <button type="button" aria-expanded={expanded} aria-controls="pna-understand-technique-details" onClick={() => setExpanded(v => !v)} className="mt-4 inline-flex min-h-11 w-full items-center justify-center gap-2 rounded-xl bg-teal-700 px-4 py-3 text-sm font-bold text-white transition hover:bg-teal-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-600 focus-visible:ring-offset-2 sm:w-auto">
        <BookOpenText className="h-4 w-4" aria-hidden="true" />{expanded ? "Mukhtasar samjh par wapas" : "Detail mein samjhao"}{expanded ? <ChevronUp className="h-4 w-4" aria-hidden="true" /> : <ChevronDown className="h-4 w-4" aria-hidden="true" />}
      </button>
    </section>
  );
}
