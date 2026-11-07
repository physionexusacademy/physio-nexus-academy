"use client";

import { useState } from "react";
import type { TeacherLang } from "@/lib/teacher/types";
import { cn } from "@/lib/utils";
import { t } from "../ui";

/** Borg 6–20 verbal anchors. */
const anchors: Record<number, { en: string; ur: string }> = {
  6: { en: "No exertion at all", ur: "Bilkul koi mehnat nahi" },
  7: { en: "Extremely light", ur: "Intehai halka" },
  9: { en: "Very light", ur: "Bohat halka" },
  11: { en: "Light", ur: "Halka" },
  13: { en: "Somewhat hard", ur: "Kuch mushkil" },
  15: { en: "Hard (heavy)", ur: "Mushkil (bhaari)" },
  17: { en: "Very hard", ur: "Bohat mushkil" },
  19: { en: "Extremely hard", ur: "Intehai mushkil" },
  20: { en: "Maximal exertion", ur: "Intehai had tak mehnat" },
};

function anchorFor(value: number) {
  let best = 6;
  for (const key of Object.keys(anchors).map(Number)) if (key <= value) best = key;
  return anchors[best];
}

function zoneFor(value: number) {
  if (value <= 11)
    return {
      zone: { en: "Light", ur: "Halka" },
      talk: { en: "Could easily sing", ur: "Asaani se gaa sakte hain" },
      use: { en: "Warm-up, recovery, very deconditioned patients", ur: "Warm-up, recovery, bohat weak patients" },
      color: "bg-emerald-500",
    };
  if (value <= 13)
    return {
      zone: { en: "Moderate", ur: "Darmiyani" },
      talk: { en: "Can talk in sentences, but can't sing", ur: "Jumlon mein baat kar sakte hain, gaa nahi sakte" },
      use: { en: "Most health-focused aerobic work", ur: "Sehat ke liye zyada tar aerobic kaam" },
      color: "bg-lime-500",
    };
  if (value <= 16)
    return {
      zone: { en: "Vigorous", ur: "Shadeed" },
      talk: { en: "Only a few words at a time", ur: "Ek waqt mein sirf chand alfaaz" },
      use: { en: "Fitness training in people who are ready for it", ur: "Tayyar logon ki fitness training" },
      color: "bg-amber-500",
    };
  return {
    zone: { en: "Very hard to maximal", ur: "Bohat mushkil se intehai" },
    talk: { en: "Can't talk", ur: "Baat nahi kar sakte" },
    use: { en: "Short intervals or testing only — rarely in early rehab", ur: "Sirf chhote intervals ya testing — early rehab mein shayad hi" },
    color: "bg-rose-500",
  };
}

export function RpeScaleWidget({ lang }: { lang: TeacherLang }) {
  const [value, setValue] = useState(12);
  const anchor = anchorFor(value);
  const zone = zoneFor(value);

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-3 sm:p-4" data-pna-widget="rpe-scale">
      <div className="flex items-end justify-between gap-3">
        <div>
          <p className="text-xs font-extrabold uppercase tracking-wider text-slate-500">{t(lang, "Borg RPE (6–20)", "Borg RPE (6–20)")}</p>
          <p className="mt-1 text-4xl font-black tabular-nums text-navy-800">{value}</p>
        </div>
        <p className="text-right text-lg font-extrabold text-navy-800">{lang === "ur" ? anchor.ur : anchor.en}</p>
      </div>
      <input
        type="range"
        min={6}
        max={20}
        value={value}
        onChange={(event) => setValue(Number(event.target.value))}
        className="mt-3 w-full accent-teal-700"
        aria-label={t(lang, "Rating of perceived exertion", "Rating of perceived exertion")}
        aria-valuetext={`${value} — ${anchor.en}`}
      />
      <div className="mt-1 h-2.5 overflow-hidden rounded-full bg-gradient-to-r from-emerald-400 via-amber-400 to-rose-500" aria-hidden="true" />

      <div className="mt-4 grid gap-2 sm:grid-cols-3" aria-live="polite">
        <div className="rounded-xl bg-slate-50 p-3">
          <p className="text-[11px] font-extrabold uppercase tracking-wider text-slate-500">{t(lang, "Zone", "Zone")}</p>
          <p className="mt-1 flex items-center gap-2 text-sm font-bold text-navy-800">
            <span className={cn("h-2.5 w-2.5 rounded-full", zone.color)} aria-hidden="true" />
            {lang === "ur" ? zone.zone.ur : zone.zone.en}
          </p>
        </div>
        <div className="rounded-xl bg-slate-50 p-3">
          <p className="text-[11px] font-extrabold uppercase tracking-wider text-slate-500">{t(lang, "Talk test", "Talk test")}</p>
          <p className="mt-1 text-sm font-bold text-navy-800">{lang === "ur" ? zone.talk.ur : zone.talk.en}</p>
        </div>
        <div className="rounded-xl bg-teal-50 p-3">
          <p className="text-[11px] font-extrabold uppercase tracking-wider text-teal-700">{t(lang, "Typical use", "Aam istemal")}</p>
          <p className="mt-1 text-sm font-bold text-teal-900">{lang === "ur" ? zone.use.ur : zone.use.en}</p>
        </div>
      </div>
      <p className="mt-2 text-xs text-slate-500">
        {t(
          lang,
          "Perceived effort is personal: it works best when you explain the scale first. Beta-blockers and some conditions change heart rate, but RPE still helps.",
          "Mehsoos hone wali mehnat zaati hoti hai: pehle scale samjhane se behtar kaam karta hai. Beta-blockers aur kuch conditions heart rate badalti hain, lekin RPE phir bhi madad karta hai.",
        )}
      </p>
    </div>
  );
}
