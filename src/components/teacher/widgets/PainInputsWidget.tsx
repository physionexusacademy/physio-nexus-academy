"use client";

import { useState } from "react";
import type { TeacherLang } from "@/lib/teacher/types";
import { cn } from "@/lib/utils";
import { t } from "../ui";

type Factor = { id: string; label: { en: string; ur: string }; weight: number };

const factors: Factor[] = [
  { id: "sleep", label: { en: "Poor sleep this week", ur: "Is hafte neend kharab" }, weight: 12 },
  { id: "stress", label: { en: "Exam / work stress", ur: "Exam / kaam ka stress" }, weight: 12 },
  { id: "fear", label: { en: "Believes \"my knee is damaged\"", ur: "Yaqeen ke \"mera knee kharab hai\"" }, weight: 15 },
  { id: "past", label: { en: "A bad past injury experience", ur: "Pehle injury ka bura tajurba" }, weight: 10 },
  { id: "safe", label: { en: "Feels safe & understood by the physio", ur: "Physio ke saath mehfooz aur samjha hua" }, weight: -12 },
  { id: "active", label: { en: "Staying active & confident", ur: "Active aur pur-aitmaad" }, weight: -10 },
  { id: "distracted", label: { en: "Absorbed in a cricket match", ur: "Cricket match mein magan" }, weight: -8 },
];

const TISSUE_SIGNAL = 35;

export function PainInputsWidget({ lang }: { lang: TeacherLang }) {
  const [on, setOn] = useState<Record<string, boolean>>({});
  const level = Math.max(5, Math.min(100, TISSUE_SIGNAL + factors.reduce((sum, factor) => sum + (on[factor.id] ? factor.weight : 0), 0)));
  const band =
    level >= 65
      ? { label: t(lang, "High protection — more pain", "Zyada protection — zyada dard"), color: "bg-rose-500", text: "text-rose-700" }
      : level >= 40
        ? { label: t(lang, "Moderate protection", "Darmiyani protection"), color: "bg-amber-500", text: "text-amber-700" }
        : { label: t(lang, "Low protection — less pain", "Kam protection — kam dard"), color: "bg-emerald-500", text: "text-emerald-700" };

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-3 sm:p-4" data-pna-widget="pain-inputs">
      <div className="rounded-xl bg-slate-50 p-3">
        <p className="text-xs font-extrabold uppercase tracking-wider text-slate-500">{t(lang, "Tissue signal (unchanged)", "Tissue signal (wohi)")}</p>
        <div className="mt-2 h-3 overflow-hidden rounded-full bg-slate-200">
          <div className="h-full rounded-full bg-slate-500" style={{ width: `${TISSUE_SIGNAL}%` }} />
        </div>
      </div>

      <fieldset className="mt-3">
        <legend className="text-sm font-bold text-navy-800">{t(lang, "What else is going on?", "Aur kya chal raha hai?")}</legend>
        <div className="mt-2 grid gap-2 sm:grid-cols-2">
          {factors.map((factor) => (
            <label
              key={factor.id}
              className={cn(
                "flex cursor-pointer items-center gap-2.5 rounded-xl border px-3 py-2.5 text-sm font-semibold transition",
                on[factor.id]
                  ? factor.weight > 0
                    ? "border-rose-300 bg-rose-50 text-rose-800"
                    : "border-emerald-300 bg-emerald-50 text-emerald-800"
                  : "border-slate-200 bg-white text-slate-700 hover:border-teal-300",
              )}
            >
              <input
                type="checkbox"
                checked={Boolean(on[factor.id])}
                onChange={(event) => setOn((current) => ({ ...current, [factor.id]: event.target.checked }))}
                className="h-4 w-4 accent-teal-700"
              />
              <span className="flex-1">{lang === "ur" ? factor.label.ur : factor.label.en}</span>
              <span aria-hidden="true" className="text-base">
                {factor.weight > 0 ? "▲" : "▼"}
              </span>
            </label>
          ))}
        </div>
      </fieldset>

      <div className="mt-4 rounded-xl border border-slate-100 p-3" aria-live="polite">
        <div className="flex items-baseline justify-between gap-2">
          <p className="text-sm font-bold text-navy-800">{t(lang, "Brain's protection level (pain)", "Dimagh ka protection level (dard)")}</p>
          <p className={cn("text-sm font-extrabold", band.text)}>{band.label}</p>
        </div>
        <div className="mt-2 h-4 overflow-hidden rounded-full bg-slate-100">
          <div className={cn("h-full rounded-full transition-all duration-500", band.color)} style={{ width: `${level}%` }} />
        </div>
        <p className="mt-2 text-sm leading-6 text-slate-600">
          {t(
            lang,
            "Same knee, same tissue signal — different pain. That's why two patients with the same injury can hurt very differently.",
            "Wohi knee, wohi tissue signal — dard alag. Isi liye ek jaisi injury wale do patients ko bilkul alag dard ho sakta hai.",
          )}
        </p>
      </div>
      <p className="mt-2 text-xs text-slate-500">
        {t(lang, "A teaching illustration, not a scoring formula.", "Samjhane ke liye misaal hai, scoring formula nahi.")}
      </p>
    </div>
  );
}
