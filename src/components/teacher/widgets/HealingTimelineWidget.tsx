"use client";

import { useState } from "react";
import type { TeacherLang } from "@/lib/teacher/types";
import { cn } from "@/lib/utils";
import { t } from "../ui";

type Phase = {
  id: string;
  name: { en: string; ur: string };
  start: number;
  end: number;
  color: string;
  inside: { en: string; ur: string };
  see: { en: string; ur: string };
  physio: { en: string; ur: string };
};

/** Approximate soft-tissue timelines in days; they overlap and vary by tissue and person. */
const phases: Phase[] = [
  {
    id: "inflammation",
    name: { en: "Inflammation", ur: "Inflammation" },
    start: 0,
    end: 6,
    color: "bg-rose-400",
    inside: {
      en: "Bleeding stops, a clot forms and immune cells clear damaged tissue. Chemical signals call in the repair crew.",
      ur: "Khoon rukta hai, clot banta hai aur immune cells kharab tissue saaf karte hain. Chemical signals marammat wali team ko bulate hain.",
    },
    see: { en: "Swelling, warmth, redness, pain even at rest.", ur: "Sojan, garmi, surkhi, aaraam mein bhi dard." },
    physio: {
      en: "Protect (not total rest), elevate, compress, gentle pain-free movement, reassurance — and screen for red flags.",
      ur: "Hifazat (mukammal aaraam nahi), elevate, compress, bina dard naram movement, tasalli — aur red flags screen karein.",
    },
  },
  {
    id: "proliferation",
    name: { en: "Proliferation (repair)", ur: "Proliferation (marammat)" },
    start: 3,
    end: 42,
    color: "bg-amber-400",
    inside: {
      en: "Fibroblasts lay down new collagen (mostly the weaker type III at first) in a messy pattern; new capillaries grow.",
      ur: "Fibroblasts naya collagen (shuru mein zyada tar kamzor type III) be-tarteeb tareeqe se bichhate hain; nayi capillaries banti hain.",
    },
    see: { en: "Swelling settles; pain mainly with stretch or load. Tissue is still fragile.", ur: "Sojan kam; dard zyada tar stretch ya load par. Tissue abhi nazuk hai." },
    physio: {
      en: "Controlled, progressive loading; restore range; early strength and balance work. Load helps the new collagen line up.",
      ur: "Controlled, aahista barhta load; range wapas; shuru ki strength aur balance training. Load naye collagen ko seedha karta hai.",
    },
  },
  {
    id: "remodelling",
    name: { en: "Remodelling", ur: "Remodelling" },
    start: 21,
    end: 365,
    color: "bg-teal-500",
    inside: {
      en: "Collagen matures towards stronger type I and aligns along lines of stress. Strength keeps rising for months.",
      ur: "Collagen pakka ho kar mazboot type I ki taraf jata hai aur stress ki lines ke saath seedha hota hai. Mahinon tak mazbooti barhti hai.",
    },
    see: { en: "Little or no pain — but the tissue is not yet at full strength.", ur: "Dard kam ya bilkul nahi — lekin tissue abhi poori taqat par nahi." },
    physio: {
      en: "Progressive heavy loading, sport- or work-specific training, and criteria-based return to activity.",
      ur: "Barhta hua bhaari load, sport ya kaam ke mutabiq training, aur criteria ke mutabiq activity mein wapsi.",
    },
  },
];

/** Slider 0–100 mapped non-linearly so the first days get enough room. */
function toDay(position: number): number {
  if (position <= 30) return Math.round((position / 30) * 7);
  if (position <= 65) return Math.round(7 + ((position - 30) / 35) * 35);
  return Math.round(42 + ((position - 65) / 35) * 323);
}
function toPosition(day: number): number {
  if (day <= 7) return (day / 7) * 30;
  if (day <= 42) return 30 + ((day - 7) / 35) * 35;
  return 65 + ((Math.min(day, 365) - 42) / 323) * 35;
}

function formatDay(day: number, lang: TeacherLang) {
  if (day <= 13) return t(lang, `Day ${day}`, `Din ${day}`);
  if (day <= 84) return t(lang, `Week ${Math.round(day / 7)}`, `Hafta ${Math.round(day / 7)}`);
  return t(lang, `Month ${Math.round(day / 30)}`, `Mahina ${Math.round(day / 30)}`);
}

export function HealingTimelineWidget({ lang }: { lang: TeacherLang }) {
  const [position, setPosition] = useState(12);
  const day = toDay(position);
  const active = phases.filter((phase) => day >= phase.start && day <= phase.end);
  const main = active[active.length - 1] ?? phases[2];

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-3 sm:p-4" data-pna-widget="healing-timeline">
      <div className="relative space-y-1.5" aria-hidden="true">
        {phases.map((phase) => (
          <div key={phase.id} className="relative h-6 rounded-full bg-slate-100">
            <div
              className={cn("absolute inset-y-0 rounded-full opacity-80", phase.color)}
              style={{ left: `${toPosition(phase.start)}%`, width: `${toPosition(phase.end) - toPosition(phase.start)}%` }}
            />
            <span className="absolute left-2 top-1/2 -translate-y-1/2 text-[11px] font-extrabold text-navy-800">
              {lang === "ur" ? phase.name.ur : phase.name.en}
            </span>
          </div>
        ))}
        <div className="pointer-events-none absolute -bottom-1 -top-1 w-0.5 -translate-x-1/2 rounded bg-navy-800" style={{ left: `${position}%` }} />
      </div>

      <label className="mt-4 block">
        <span className="flex items-baseline justify-between gap-2">
          <span className="text-sm font-bold text-navy-800">{t(lang, "Time since injury", "Injury ke baad waqt")}</span>
          <span className="rounded-full bg-navy-800 px-3 py-1 text-xs font-extrabold text-white">{formatDay(day, lang)}</span>
        </span>
        <input
          type="range"
          min={0}
          max={100}
          value={position}
          onChange={(event) => setPosition(Number(event.target.value))}
          className="mt-2 w-full accent-teal-700"
          aria-valuetext={formatDay(day, lang)}
        />
        <span className="flex justify-between text-[11px] font-semibold text-slate-500">
          <span>{t(lang, "Injury", "Injury")}</span>
          <span>{t(lang, "1 week", "1 hafta")}</span>
          <span>{t(lang, "6 weeks", "6 hafte")}</span>
          <span>{t(lang, "1 year", "1 saal")}</span>
        </span>
      </label>

      <div className="mt-3 rounded-xl border border-slate-100 bg-slate-50 p-3" aria-live="polite">
        <p className="text-xs font-extrabold uppercase tracking-wider text-slate-500">
          {active.length > 1
            ? t(lang, `Overlap: ${active.map((p) => p.name.en).join(" + ")}`, `Overlap: ${active.map((p) => p.name.ur).join(" + ")}`)
            : t(lang, "Main phase", "Asal phase")}
          {": "}
          <span className="text-navy-800">{lang === "ur" ? main.name.ur : main.name.en}</span>
        </p>
        <dl className="mt-2 grid gap-2 sm:grid-cols-3">
          <div className="rounded-lg bg-white p-2.5">
            <dt className="text-[11px] font-extrabold uppercase tracking-wider text-slate-500">{t(lang, "Inside the tissue", "Tissue ke andar")}</dt>
            <dd className="mt-1 text-sm leading-6 text-slate-700">{lang === "ur" ? main.inside.ur : main.inside.en}</dd>
          </div>
          <div className="rounded-lg bg-white p-2.5">
            <dt className="text-[11px] font-extrabold uppercase tracking-wider text-slate-500">{t(lang, "What you see", "Kya nazar aata hai")}</dt>
            <dd className="mt-1 text-sm leading-6 text-slate-700">{lang === "ur" ? main.see.ur : main.see.en}</dd>
          </div>
          <div className="rounded-lg bg-teal-50 p-2.5">
            <dt className="text-[11px] font-extrabold uppercase tracking-wider text-teal-700">{t(lang, "What the physio does", "Physio kya kare")}</dt>
            <dd className="mt-1 text-sm font-semibold leading-6 text-teal-900">{lang === "ur" ? main.physio.ur : main.physio.en}</dd>
          </div>
        </dl>
      </div>
      <p className="mt-2 text-xs text-slate-500">
        {t(lang, "Timings are approximate and vary by tissue, injury size, age and health.", "Waqt andaazan hai aur tissue, injury, umar aur sehat ke mutabiq badalta hai.")}
      </p>
    </div>
  );
}
