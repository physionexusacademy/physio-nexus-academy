"use client";

import { Fragment, type ReactNode } from "react";
import { GraduationCap, Languages, Volume2, VolumeX } from "lucide-react";
import type { BiText, TeacherLang } from "@/lib/teacher/types";
import { cn } from "@/lib/utils";

export function pick(text: BiText, lang: TeacherLang): string {
  return lang === "ur" ? text.ur || text.en : text.en;
}

/** Removes the lightweight markup so the text can be read aloud. */
export function plainText(value: string): string {
  return value.replace(/\*\*/g, "").replace(/\s*\n\s*/g, ". ").replace(/\.\s*\./g, ".");
}

/** Renders `**bold**` and line breaks from lesson copy. No HTML is ever injected. */
export function RichText({ text, className }: { text: string; className?: string }) {
  const lines = text.split("\n");
  return (
    <span className={className}>
      {lines.map((line, lineIndex) => (
        <Fragment key={lineIndex}>
          {lineIndex > 0 ? <br /> : null}
          {line.split("**").map((part, partIndex) =>
            partIndex % 2 === 1 ? (
              <strong key={partIndex} className="font-bold text-navy-800">
                {part}
              </strong>
            ) : (
              <Fragment key={partIndex}>{part}</Fragment>
            ),
          )}
        </Fragment>
      ))}
    </span>
  );
}

export function TeacherAvatar({ size = "md" }: { size?: "sm" | "md" | "lg" }) {
  const dims = size === "lg" ? "h-14 w-14" : size === "sm" ? "h-8 w-8" : "h-10 w-10";
  const icon = size === "lg" ? "h-7 w-7" : size === "sm" ? "h-4 w-4" : "h-5 w-5";
  return (
    <span
      className={cn(
        "relative flex flex-none items-center justify-center rounded-2xl bg-gradient-to-br from-teal-600 to-navy-700 text-white shadow-sm",
        dims,
      )}
      aria-hidden="true"
    >
      <GraduationCap className={icon} />
      <span className="absolute -bottom-0.5 -right-0.5 h-3 w-3 rounded-full border-2 border-white bg-emerald-400" />
    </span>
  );
}

export type BubbleTone =
  | "plain"
  | "analogy"
  | "memory"
  | "mistake"
  | "clinic"
  | "check"
  | "try"
  | "correct"
  | "retry"
  | "simpler"
  | "safety"
  | "evidence";

const toneStyles: Record<BubbleTone, { box: string; label: string }> = {
  plain: { box: "border-slate-200 bg-white", label: "text-teal-700" },
  analogy: { box: "border-amber-200 bg-amber-50", label: "text-amber-800" },
  memory: { box: "border-violet-200 bg-violet-50", label: "text-violet-800" },
  mistake: { box: "border-rose-200 bg-rose-50", label: "text-rose-800" },
  clinic: { box: "border-teal-200 bg-teal-50", label: "text-teal-800" },
  check: { box: "border-sky-200 bg-sky-50", label: "text-sky-800" },
  try: { box: "border-emerald-200 bg-emerald-50", label: "text-emerald-800" },
  correct: { box: "border-emerald-300 bg-emerald-50", label: "text-emerald-800" },
  retry: { box: "border-amber-300 bg-amber-50", label: "text-amber-800" },
  simpler: { box: "border-cyan-200 bg-cyan-50", label: "text-cyan-800" },
  safety: { box: "border-red-200 bg-red-50/80", label: "text-red-800" },
  evidence: { box: "border-indigo-200 bg-indigo-50/70", label: "text-indigo-800" },
};

export function TeacherBubble({
  children,
  label,
  tone = "plain",
  wide = false,
  onListen,
  listening = false,
  showAvatar = true,
}: {
  children: ReactNode;
  label?: string;
  tone?: BubbleTone;
  wide?: boolean;
  onListen?: () => void;
  listening?: boolean;
  showAvatar?: boolean;
}) {
  const style = toneStyles[tone];
  return (
    <div className="flex animate-fadeUp items-start gap-2.5 sm:gap-3">
      <div className="w-8 flex-none sm:w-10">{showAvatar ? <TeacherAvatar size="sm" /> : null}</div>
      <div
        className={cn(
          "relative min-w-0 rounded-2xl rounded-tl-md border px-4 py-3 shadow-sm sm:px-5 sm:py-4",
          style.box,
          wide ? "w-full" : "max-w-[min(42rem,100%)]",
        )}
      >
        {label || onListen ? (
          <div className="mb-1.5 flex items-center justify-between gap-3">
            {label ? (
              <p className={cn("text-[11px] font-extrabold uppercase tracking-[0.14em]", style.label)}>{label}</p>
            ) : (
              <span />
            )}
            {onListen ? (
              <button
                type="button"
                onClick={onListen}
                className="inline-flex h-7 w-7 flex-none items-center justify-center rounded-full text-slate-500 transition hover:bg-white hover:text-teal-700"
                aria-label={listening ? "Stop reading aloud" : "Read this message aloud"}
              >
                {listening ? <VolumeX className="h-4 w-4" /> : <Volume2 className="h-4 w-4" />}
              </button>
            ) : null}
          </div>
        ) : null}
        <div className="text-[15px] leading-7 text-slate-700 sm:text-base sm:leading-8">{children}</div>
      </div>
    </div>
  );
}

export function StudentBubble({ children }: { children: ReactNode }) {
  return (
    <div className="flex animate-fadeUp justify-end">
      <div className="max-w-[85%] rounded-2xl rounded-tr-md bg-teal-700 px-4 py-2.5 text-[15px] font-semibold leading-6 text-white shadow-sm">
        {children}
      </div>
    </div>
  );
}

export function TypingBubble() {
  return (
    <div className="flex items-start gap-2.5 sm:gap-3" aria-hidden="true">
      <div className="w-8 flex-none sm:w-10">
        <TeacherAvatar size="sm" />
      </div>
      <div className="pna-typing rounded-2xl rounded-tl-md border border-slate-200 bg-white px-4 py-3.5 shadow-sm">
        <span />
        <span />
        <span />
      </div>
    </div>
  );
}

export function Chip({
  children,
  onClick,
  variant = "primary",
  disabled = false,
}: {
  children: ReactNode;
  onClick: () => void;
  variant?: "primary" | "soft" | "ghost";
  disabled?: boolean;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className={cn(
        "inline-flex min-h-11 items-center justify-center gap-2 rounded-full px-4 py-2.5 text-left text-sm font-bold transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-600 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50",
        variant === "primary" && "bg-teal-700 text-white shadow-sm hover:bg-teal-800",
        variant === "soft" && "border border-teal-200 bg-white text-teal-800 hover:border-teal-400 hover:bg-teal-50",
        variant === "ghost" && "text-slate-600 hover:bg-slate-100 hover:text-navy-800",
      )}
    >
      {children}
    </button>
  );
}

export function LangToggle({ lang, onChange }: { lang: TeacherLang; onChange: (lang: TeacherLang) => void }) {
  return (
    <div
      role="group"
      aria-label="Teaching language"
      className="inline-flex items-center gap-1 rounded-full border border-slate-200 bg-white p-1 shadow-sm"
    >
      <Languages className="ml-1.5 h-4 w-4 text-teal-700" aria-hidden="true" />
      {(
        [
          ["en", "English"],
          ["ur", "Roman Urdu"],
        ] as const
      ).map(([value, label]) => (
        <button
          key={value}
          type="button"
          aria-pressed={lang === value}
          onClick={() => onChange(value)}
          className={cn(
            "rounded-full px-3 py-1.5 text-xs font-bold transition",
            lang === value ? "bg-teal-700 text-white" : "text-slate-600 hover:bg-teal-50 hover:text-teal-800",
          )}
        >
          {label}
        </button>
      ))}
    </div>
  );
}

/** Tiny bilingual helper for interface strings that are not lesson content. */
export function t(lang: TeacherLang, en: string, ur: string) {
  return lang === "ur" ? ur : en;
}
