"use client";

import type { ReactNode } from "react";
import type { TeacherLang } from "@/lib/teacher/types";
import { cn } from "@/lib/utils";

export type Bi = { en: string; ur: string };
/** Pick the English or Roman Urdu side of a bilingual pair. */
export const bi = (lang: TeacherLang, text: Bi) => (lang === "ur" ? text.ur : text.en);

/** Segmented buttons used by the interactive teaching widgets (one option pressed at a time). */
export function Seg<T extends string>({
  value,
  options,
  onChange,
  label,
  className,
}: {
  value: T;
  options: { id: T; label: ReactNode }[];
  onChange: (id: T) => void;
  label: string;
  className?: string;
}) {
  return (
    <div role="group" aria-label={label} className={cn("flex flex-wrap gap-1.5", className)}>
      {options.map((option) => (
        <button
          key={option.id}
          type="button"
          aria-pressed={value === option.id}
          onClick={() => onChange(option.id)}
          className={cn(
            "min-h-10 rounded-xl border px-3 py-1.5 text-left text-sm font-bold transition",
            value === option.id ? "border-navy-800 bg-navy-800 text-white" : "border-slate-200 bg-white text-slate-700 hover:border-teal-300",
          )}
        >
          {option.label}
        </button>
      ))}
    </div>
  );
}

export function Pill({ children, tone = "slate" }: { children: ReactNode; tone?: "slate" | "red" | "violet" | "sky" | "teal" | "amber" | "green" }) {
  const tones = {
    slate: "bg-slate-100 text-slate-700",
    red: "bg-rose-100 text-rose-800",
    violet: "bg-violet-100 text-violet-800",
    sky: "bg-sky-100 text-sky-800",
    teal: "bg-teal-100 text-teal-800",
    amber: "bg-amber-100 text-amber-900",
    green: "bg-emerald-100 text-emerald-800",
  } as const;
  return <span className={cn("inline-flex items-center rounded-full px-2.5 py-1 text-xs font-bold", tones[tone])}>{children}</span>;
}

/** The standard outer frame of a widget. */
export function WidgetFrame({ id, children }: { id: string; children: ReactNode }) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-3 text-slate-700 sm:p-4" data-pna-widget={id}>
      {children}
    </div>
  );
}
