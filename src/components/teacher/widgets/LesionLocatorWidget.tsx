"use client";

import { useState } from "react";
import type { TeacherLang } from "@/lib/teacher/types";
import { cn } from "@/lib/utils";
import { t } from "../ui";

type SiteId = "cortex" | "cord" | "horn" | "nerve";

const sites: Record<
  SiteId,
  {
    label: { en: string; ur: string };
    example: { en: string; ur: string };
    type: "UMN" | "LMN" | "UMN+LMN";
    note: { en: string; ur: string };
    point: { x: number; y: number };
  }
> = {
  cortex: {
    label: { en: "Motor cortex / internal capsule", ur: "Motor cortex / internal capsule" },
    example: { en: "e.g. stroke", ur: "maslan stroke" },
    type: "UMN",
    note: {
      en: "UMN signs on the OPPOSITE side of the body — the pathway crosses in the medulla.",
      ur: "Body ki ULTI side par UMN signs — rasta medulla mein cross karta hai.",
    },
    point: { x: 60, y: 34 },
  },
  cord: {
    label: { en: "Spinal cord", ur: "Spinal cord" },
    example: { en: "e.g. cervical cord injury", ur: "maslan cervical cord injury" },
    type: "UMN+LMN",
    note: {
      en: "UMN signs BELOW the level of injury; LMN signs can appear AT the level (damaged anterior horn cells/roots).",
      ur: "Injury ke level se NEECHE UMN signs; level PAR LMN signs aa sakte hain (anterior horn cells/roots ka nuqsan).",
    },
    point: { x: 60, y: 110 },
  },
  horn: {
    label: { en: "Anterior horn cell", ur: "Anterior horn cell" },
    example: { en: "e.g. poliomyelitis", ur: "maslan polio" },
    type: "LMN",
    note: {
      en: "The worker's cell body is damaged → LMN signs in the muscles it supplies.",
      ur: "Worker ka cell body kharab → jin muscles ko supply karta hai un mein LMN signs.",
    },
    point: { x: 72, y: 160 },
  },
  nerve: {
    label: { en: "Peripheral nerve", ur: "Peripheral nerve" },
    example: { en: "e.g. common fibular nerve injury", ur: "maslan common fibular nerve injury" },
    type: "LMN",
    note: {
      en: "LMN signs only in that nerve's muscles — plus sensory loss in its area.",
      ur: "Sirf usi nerve ke muscles mein LMN signs — aur us ke ilaqay mein sensation ki kami.",
    },
    point: { x: 168, y: 160 },
  },
};

const signs = {
  UMN: [
    { en: "Tone ↑ (spastic)", ur: "Tone ↑ (spastic)" },
    { en: "Reflexes ↑", ur: "Reflexes ↑" },
    { en: "Babinski +", ur: "Babinski +" },
    { en: "Clonus possible", ur: "Clonus mumkin" },
    { en: "Little early wasting", ur: "Shuru mein kam wasting" },
  ],
  LMN: [
    { en: "Tone ↓ (flaccid)", ur: "Tone ↓ (flaccid)" },
    { en: "Reflexes ↓ / absent", ur: "Reflexes ↓ / ghayab" },
    { en: "Marked wasting", ur: "Wazeh wasting" },
    { en: "Fasciculations possible", ur: "Fasciculations mumkin" },
    { en: "Plantar flexor / absent", ur: "Plantar flexor / ghayab" },
  ],
};

export function LesionLocatorWidget({ lang }: { lang: TeacherLang }) {
  const [site, setSite] = useState<SiteId>("cortex");
  const info = sites[site];
  const showUmn = info.type !== "LMN";
  const showLmn = info.type !== "UMN";

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-3 sm:p-4" data-pna-widget="lesion-locator">
      <div className="grid gap-3 sm:grid-cols-[220px_1fr] sm:items-start">
        <svg viewBox="0 0 220 200" className="h-auto w-full rounded-xl bg-slate-50" role="img" aria-label={`Motor pathway. Damage at: ${info.label.en}.`}>
          {/* Brain */}
          <ellipse cx="60" cy="34" rx="44" ry="26" fill="#ede9fe" stroke="#7c3aed" strokeWidth="1.5" />
          <text x="60" y="38" textAnchor="middle" fontSize="10" fontWeight="700" fill="#5b21b6">
            {t(lang, "Brain", "Dimagh")}
          </text>
          {/* Spinal cord */}
          <rect x="50" y="58" width="20" height="120" rx="8" fill="#e0f2fe" stroke="#0284c7" strokeWidth="1.5" />
          <text x="34" y="122" textAnchor="middle" fontSize="9" fontWeight="700" fill="#075985" transform="rotate(-90 34 122)">
            {t(lang, "Spinal cord", "Spinal cord")}
          </text>
          {/* UMN pathway */}
          <path d="M60 40 L60 160" stroke="#7c3aed" strokeWidth="3" strokeDasharray="5 4" />
          {/* Anterior horn + LMN */}
          <circle cx="72" cy="160" r="6" fill="#0f766e" />
          <path d="M72 160 L196 160" stroke="#0f766e" strokeWidth="3" />
          {/* Muscle */}
          <ellipse cx="200" cy="160" rx="12" ry="20" fill="#fee2e2" stroke="#dc2626" strokeWidth="1.5" />
          <text x="196" y="192" textAnchor="middle" fontSize="9" fontWeight="700" fill="#991b1b">
            {t(lang, "Muscle", "Muscle")}
          </text>
          <text x="120" y="152" textAnchor="middle" fontSize="9" fontWeight="700" fill="#0f766e">
            LMN
          </text>
          <text x="84" y="94" fontSize="9" fontWeight="700" fill="#6d28d9">
            UMN
          </text>
          {/* Lesion marker */}
          <g transform={`translate(${info.point.x} ${info.point.y})`}>
            <circle r="13" fill="#fff" fillOpacity="0.7" stroke="#e11d48" strokeWidth="2.5" />
            <path d="M-6 -6 L6 6 M6 -6 L-6 6" stroke="#e11d48" strokeWidth="3" strokeLinecap="round" />
          </g>
        </svg>

        <div>
          <div className="grid gap-2" role="group" aria-label={t(lang, "Where is the damage?", "Nuqsan kahan hai?")}>
            {(Object.keys(sites) as SiteId[]).map((id) => (
              <button
                key={id}
                type="button"
                aria-pressed={site === id}
                onClick={() => setSite(id)}
                className={cn(
                  "rounded-xl border px-3 py-2 text-left text-sm transition",
                  site === id ? "border-navy-800 bg-navy-800 text-white" : "border-slate-200 bg-white text-slate-700 hover:border-teal-300",
                )}
              >
                <span className="font-bold">{lang === "ur" ? sites[id].label.ur : sites[id].label.en}</span>
                <span className={cn("ml-1.5 text-xs", site === id ? "text-white/80" : "text-slate-500")}>
                  ({lang === "ur" ? sites[id].example.ur : sites[id].example.en})
                </span>
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="mt-3 rounded-xl bg-slate-50 p-3" aria-live="polite">
        <p className="text-sm font-extrabold text-navy-800">
          {t(lang, "Lesion type:", "Lesion type:")} <span className="text-rose-700">{info.type === "UMN+LMN" ? "UMN + LMN" : info.type}</span>
        </p>
        <p className="mt-1 text-sm leading-6 text-slate-600">{lang === "ur" ? info.note.ur : info.note.en}</p>
        <div className="mt-2 flex flex-wrap gap-1.5">
          {showUmn
            ? signs.UMN.map((sign) => (
                <span key={sign.en} className="rounded-full bg-violet-100 px-2.5 py-1 text-xs font-bold text-violet-800">
                  {lang === "ur" ? sign.ur : sign.en}
                </span>
              ))
            : null}
          {showLmn
            ? signs.LMN.map((sign) => (
                <span key={sign.en} className="rounded-full bg-teal-100 px-2.5 py-1 text-xs font-bold text-teal-800">
                  {lang === "ur" ? sign.ur : sign.en}
                </span>
              ))
            : null}
        </div>
      </div>
    </div>
  );
}
