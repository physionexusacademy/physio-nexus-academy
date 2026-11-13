"use client";

import { AlertTriangle, BookOpen, ChevronDown, Wind } from "lucide-react";
import { CATEGORY_LABEL, LEVEL_LABEL, REGION_LABEL, type Dosage, type ExerciseDef } from "@/lib/rehabverse/types";
import { REFERENCES } from "@/lib/rehabverse/references";
import type { Lang } from "./ExercisePlayer";

const t = (lang: Lang, v: { en: string; ru: string }) => (lang === "ru" ? v.ru : v.en);

const COPY = {
  setup: { en: "Starting position", ru: "Shuru ki position" },
  steps: { en: "How to do it", ru: "Kaise karein" },
  breathing: { en: "Breathing", ru: "Saans" },
  safety: { en: "Stay safe", ru: "Hifazat" },
  mistakes: { en: "Common mistakes", ru: "Aam ghaltiyan" },
  dosage: { en: "Your dose", ru: "Aap ki dose" },
  clinical: { en: "For your physiotherapist", ru: "Physiotherapist ke liye" },
  equipment: { en: "You need", ru: "Cheez chahiye" },
};

export function dosageChips(d: Dosage, lang: Lang, over?: { sets?: number | null; reps?: number | null; hold?: number | null; rest?: number | null; duration?: number | null; frequency?: string | null; side?: string }) {
  const sets = over?.sets ?? d.sets;
  const reps = over?.reps ?? d.reps;
  const hold = over?.hold ?? d.holdSeconds;
  const rest = over?.rest ?? d.restSeconds;
  const duration = over?.duration ?? d.durationSeconds;
  const frequency = over?.frequency ?? d.frequency;
  const side = over?.side ?? d.side;
  const chips: { label: string; value: string }[] = [];
  if (sets) chips.push({ label: lang === "ru" ? "Sets" : "Sets", value: String(sets) });
  if (reps) chips.push({ label: lang === "ru" ? "Reps" : "Reps", value: String(reps) });
  if (hold) chips.push({ label: lang === "ru" ? "Hold" : "Hold", value: `${hold}s` });
  if (duration) chips.push({ label: lang === "ru" ? "Waqt" : "Time", value: duration >= 60 ? `${Math.round(duration / 60)} min` : `${duration}s` });
  if (rest) chips.push({ label: lang === "ru" ? "Rest" : "Rest", value: `${rest}s` });
  if (frequency) chips.push({ label: lang === "ru" ? "Kitni baar" : "How often", value: frequency });
  if (side && side !== "both") chips.push({ label: lang === "ru" ? "Side" : "Side", value: side === "each" ? (lang === "ru" ? "Har side" : "Each side") : side === "alternate" ? (lang === "ru" ? "Baari baari" : "Alternate") : side });
  return chips;
}

export function ExerciseDetails({ exercise, lang, clinical = false, dose, compact = false }: { exercise: ExerciseDef; lang: Lang; clinical?: boolean; dose?: Parameters<typeof dosageChips>[2]; compact?: boolean }) {
  const chips = dosageChips(exercise.dosage, lang, dose);
  return (
    <div className="space-y-4">
      {compact ? (
        <p className="text-[15px] leading-7 text-slate-700">{t(lang, exercise.summary)}</p>
      ) : (
        <div>
          <div className="flex flex-wrap items-center gap-1.5">
            {exercise.regions.map((r) => (
              <span key={r} className="rv-chip rv-chip-teal">{t(lang, REGION_LABEL[r])}</span>
            ))}
            <span className="rv-chip">{t(lang, LEVEL_LABEL[exercise.level])}</span>
            <span className="rv-chip">{t(lang, CATEGORY_LABEL[exercise.category])}</span>
          </div>
          <h3 className="mt-2 font-heading text-xl font-bold text-navy-800">{t(lang, exercise.name)}</h3>
          <p className="mt-1 text-[15px] leading-7 text-slate-700">{t(lang, exercise.summary)}</p>
        </div>
      )}

      <div className="rv-glass p-4">
        <h4 className="rv-h">{t(lang, COPY.dosage)}</h4>
        <div className="mt-2 flex flex-wrap gap-2">
          {chips.map((c) => (
            <span key={c.label} className="rounded-2xl bg-[#0a1f3d] px-3 py-1.5 text-center text-white">
              <span className="block text-[10px] font-bold uppercase tracking-wider text-teal-300">{c.label}</span>
              <span className="block text-sm font-extrabold">{c.value}</span>
            </span>
          ))}
        </div>
        {exercise.equipment ? (
          <p className="mt-3 text-sm text-slate-600"><strong>{t(lang, COPY.equipment)}:</strong> {exercise.equipment}</p>
        ) : null}
      </div>

      <div className="rv-glass p-4">
        <h4 className="rv-h">{t(lang, COPY.setup)}</h4>
        <p className="mt-1.5 text-[15px] leading-7 text-slate-700">{t(lang, exercise.setup)}</p>
        <h4 className="rv-h mt-4">{t(lang, COPY.steps)}</h4>
        <ol className="mt-1.5 space-y-2">
          {exercise.steps.map((step, i) => (
            <li key={i} className="flex gap-3 text-[15px] leading-7 text-slate-700">
              <span className="mt-0.5 flex h-6 w-6 flex-none items-center justify-center rounded-full bg-teal-100 text-xs font-extrabold text-teal-800">{i + 1}</span>
              <span>{t(lang, step)}</span>
            </li>
          ))}
        </ol>
        <p className="mt-4 flex gap-2 rounded-2xl bg-sky-50 px-3 py-2 text-sm leading-6 text-sky-900">
          <Wind className="mt-0.5 h-4 w-4 flex-none" aria-hidden="true" />
          <span><strong>{t(lang, COPY.breathing)}:</strong> {t(lang, exercise.breathing)}</span>
        </p>
      </div>

      <div className="rounded-3xl border border-amber-200 bg-amber-50 p-4">
        <h4 className="flex items-center gap-1.5 text-sm font-extrabold text-amber-900"><AlertTriangle className="h-4 w-4" aria-hidden="true" /> {t(lang, COPY.safety)}</h4>
        <ul className="mt-2 space-y-1.5 text-sm leading-6 text-amber-950">
          {exercise.safety.map((s, i) => (
            <li key={i} className="flex gap-2"><span className="mt-2 h-1.5 w-1.5 flex-none rounded-full bg-amber-500" aria-hidden="true" />{t(lang, s)}</li>
          ))}
        </ul>
      </div>

      <div className="rv-glass p-4">
        <h4 className="rv-h">{t(lang, COPY.mistakes)}</h4>
        <ul className="mt-2 space-y-1.5 text-[15px] leading-7 text-slate-700">
          {exercise.mistakes.map((m, i) => (
            <li key={i} className="flex gap-2"><span className="mt-2.5 h-1.5 w-1.5 flex-none rounded-full bg-rose-400" aria-hidden="true" />{t(lang, m)}</li>
          ))}
        </ul>
      </div>

      {clinical ? (
        <details className="group rv-glass p-4 open:shadow-md">
          <summary className="flex cursor-pointer list-none items-center justify-between">
            <span className="rv-h flex items-center gap-1.5"><BookOpen className="h-4 w-4" aria-hidden="true" /> {t(lang, COPY.clinical)}</span>
            <ChevronDown className="h-4 w-4 text-slate-400 transition group-open:rotate-180" aria-hidden="true" />
          </summary>
          <dl className="mt-3 space-y-3 text-sm leading-6 text-slate-700">
            <div><dt className="font-bold text-navy-800">Target</dt><dd>{exercise.targets}</dd></div>
            <div><dt className="font-bold text-navy-800">Indications</dt><dd><ul className="list-disc pl-5">{exercise.indications.map((x) => <li key={x}>{x}</li>)}</ul></dd></div>
            <div><dt className="font-bold text-rose-800">Contraindications / precautions</dt><dd><ul className="list-disc pl-5">{exercise.contraindications.map((x) => <li key={x}>{x}</li>)}</ul></dd></div>
            <div><dt className="font-bold text-navy-800">Progressions</dt><dd><ul className="list-disc pl-5">{exercise.progressions.map((x) => <li key={x}>{x}</li>)}</ul></dd></div>
            <div><dt className="font-bold text-navy-800">Regressions</dt><dd><ul className="list-disc pl-5">{exercise.regressions.map((x) => <li key={x}>{x}</li>)}</ul></dd></div>
            <div>
              <dt className="font-bold text-navy-800">Evidence</dt>
              <dd><ul className="list-disc pl-5">{exercise.evidence.map((k) => <li key={k}>{REFERENCES[k]?.text ?? k}</li>)}</ul>
                <p className="mt-1 text-xs text-slate-500">Draft content — the supervising physiotherapist should confirm each reference and dosage before use.</p></dd>
            </div>
          </dl>
        </details>
      ) : null}
    </div>
  );
}
