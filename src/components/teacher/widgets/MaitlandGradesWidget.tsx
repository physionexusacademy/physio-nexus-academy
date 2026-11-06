"use client";

import { useState, type CSSProperties } from "react";
import { Zap } from "lucide-react";
import type { TeacherLang } from "@/lib/teacher/types";
import { cn } from "@/lib/utils";
import { t } from "../ui";

type Grade = "I" | "II" | "III" | "IV" | "V";

/** Positions are % of the available range. Resistance (R1) starts at 60%, limit (L) at 100%. */
const grades: Record<Grade, { from: number; to: number; speed: string; size: { en: string; ur: string }; where: { en: string; ur: string }; use: { en: string; ur: string } }> = {
  I: {
    from: 6,
    to: 16,
    speed: "0.7s",
    size: { en: "Small amplitude", ur: "Chhoti movement" },
    where: { en: "At the beginning of the range — far from resistance.", ur: "Range ke shuru mein — resistance se door." },
    use: { en: "Very painful, irritable joints — mainly to ease pain.", ur: "Bohat dard wale, irritable joints — zyada tar dard kam karne ke liye." },
  },
  II: {
    from: 14,
    to: 54,
    speed: "1.3s",
    size: { en: "Large amplitude", ur: "Bari movement" },
    where: { en: "Within the range, stopping before resistance begins.", ur: "Range ke andar, resistance shuru hone se pehle ruk jati hai." },
    use: { en: "Pain-dominant joints; gentle movement without provoking stiffness.", ur: "Dard-dominant joints; stiffness ko chhede baghair naram movement." },
  },
  III: {
    from: 48,
    to: 97,
    speed: "1.4s",
    size: { en: "Large amplitude", ur: "Bari movement" },
    where: { en: "Moves into resistance, up to the limit.", ur: "Resistance mein ja kar limit tak." },
    use: { en: "Stiffness-dominant joints — working into the resistance.", ur: "Stiffness-dominant joints — resistance mein kaam." },
  },
  IV: {
    from: 86,
    to: 97,
    speed: "0.7s",
    size: { en: "Small amplitude", ur: "Chhoti movement" },
    where: { en: "At the limit, into resistance.", ur: "Limit par, resistance ke andar." },
    use: { en: "Stiffness at end of range, when the joint isn't irritable.", ur: "Range ke end par stiffness, jab joint irritable na ho." },
  },
  V: {
    from: 97,
    to: 100,
    speed: "0.3s",
    size: { en: "Small amplitude, high velocity (thrust)", ur: "Chhoti magar tez (thrust)" },
    where: { en: "A single quick thrust at the end of available range — manipulation.", ur: "Available range ke end par ek tez thrust — manipulation." },
    use: { en: "Selected cases only, after specific screening and training.", ur: "Sirf chune hue cases, khaas screening aur training ke baad." },
  },
};

export function MaitlandGradesWidget({ lang }: { lang: TeacherLang }) {
  const [grade, setGrade] = useState<Grade>("I");
  const info = grades[grade];
  const dotStyle = {
    "--pna-osc-from": `${info.from}%`,
    "--pna-osc-to": `${info.to}%`,
    "--pna-osc-speed": info.speed,
  } as CSSProperties;

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-3 sm:p-4" data-pna-widget="maitland-grades">
      <div className="flex flex-wrap gap-2" role="group" aria-label={t(lang, "Choose a grade", "Grade chunein")}>
        {(Object.keys(grades) as Grade[]).map((value) => (
          <button
            key={value}
            type="button"
            aria-pressed={grade === value}
            onClick={() => setGrade(value)}
            className={cn(
              "min-w-14 rounded-xl px-3 py-2 text-sm font-extrabold transition",
              grade === value ? "bg-navy-800 text-white shadow-sm" : "bg-slate-100 text-slate-700 hover:bg-teal-50 hover:text-teal-800",
            )}
          >
            {t(lang, "Grade", "Grade")} {value}
          </button>
        ))}
      </div>

      <div className="mt-6 px-1">
        <div className="relative h-14" aria-hidden="true">
          {/* the road */}
          <div className="absolute inset-x-0 top-1/2 h-5 -translate-y-1/2 overflow-hidden rounded-full bg-teal-100">
            <div className="absolute inset-y-0 right-0 bg-gradient-to-r from-amber-200 to-amber-400" style={{ left: "60%" }} />
          </div>
          {/* active band */}
          <div
            className="absolute top-1/2 h-9 -translate-y-1/2 rounded-xl border-2 border-navy-800/70 bg-navy-800/10"
            style={{ left: `${info.from}%`, width: `${Math.max(info.to - info.from, 2)}%` }}
          />
          {grade === "V" ? (
            <span className="pna-thrust absolute top-1/2 -translate-y-1/2 text-rose-600" style={{ left: "calc(97% - 12px)" }}>
              <Zap className="h-7 w-7 fill-rose-500" />
            </span>
          ) : (
            <span className="pna-osc-dot" style={dotStyle} />
          )}
          {/* the wall */}
          <div className="absolute -right-1 top-0 h-full w-2 rounded bg-navy-800" />
        </div>
        <div className="relative mt-2 h-10 text-[11px] font-bold text-slate-500">
          <span className="absolute left-0">{t(lang, "Start of range", "Range ka shuru")}</span>
          <span className="absolute -translate-x-1/2 text-amber-700" style={{ left: "60%" }}>
            R1 · {t(lang, "resistance begins", "resistance shuru")}
          </span>
          <span className="absolute right-0 text-navy-800">L · {t(lang, "limit", "limit")}</span>
        </div>
      </div>

      <div className="mt-1 grid gap-2 sm:grid-cols-3" aria-live="polite">
        <div className="rounded-xl bg-slate-50 p-3">
          <p className="text-[11px] font-extrabold uppercase tracking-wider text-slate-500">{t(lang, "How big", "Kitni bari")}</p>
          <p className="mt-1 text-sm font-bold text-navy-800">{lang === "ur" ? info.size.ur : info.size.en}</p>
        </div>
        <div className="rounded-xl bg-slate-50 p-3">
          <p className="text-[11px] font-extrabold uppercase tracking-wider text-slate-500">{t(lang, "Where", "Kahan")}</p>
          <p className="mt-1 text-sm font-bold text-navy-800">{lang === "ur" ? info.where.ur : info.where.en}</p>
        </div>
        <div className="rounded-xl bg-teal-50 p-3">
          <p className="text-[11px] font-extrabold uppercase tracking-wider text-teal-700">{t(lang, "Typical use", "Aam istemal")}</p>
          <p className="mt-1 text-sm font-bold text-teal-900">{lang === "ur" ? info.use.ur : info.use.en}</p>
        </div>
      </div>
    </div>
  );
}
