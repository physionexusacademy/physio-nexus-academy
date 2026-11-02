"use client";

import {useState} from "react";
import {ChevronDown} from "lucide-react";

type Props = {
  /** Roman Urdu patient-style line */
  text: string;
  /** Compact label for library cards */
  compact?: boolean;
  className?: string;
};

/**
 * Collapsible Roman Urdu help — hidden by default so pages stay short.
 * Click to reveal the patient-style meaning under the English line.
 */
export function RomanUrduHelp({text, compact = false, className = ""}: Props) {
  const [open, setOpen] = useState(false);
  if (!text?.trim()) return null;

  return (
    <div className={className}>
      <button
        type="button"
        onClick={(e) => {
          e.preventDefault();
          e.stopPropagation();
          setOpen((v) => !v);
        }}
        aria-expanded={open}
        className={
          compact
            ? "mt-2 inline-flex items-center gap-1 rounded-full border border-slate-200 bg-slate-50 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wide text-slate-600 hover:border-teal-300 hover:bg-teal-50 hover:text-teal-800"
            : "mt-3 inline-flex items-center gap-1.5 rounded-full border border-slate-200 bg-white px-3 py-1.5 text-xs font-bold text-slate-600 hover:border-teal-300 hover:bg-teal-50 hover:text-teal-800"
        }
      >
        Roman Urdu
        <ChevronDown className={`h-3.5 w-3.5 transition ${open ? "rotate-180" : ""}`} />
      </button>
      {open && (
        <p
          className={
            compact
              ? "mt-1.5 line-clamp-3 text-[11px] leading-4 text-slate-500 italic"
              : "mt-2 rounded-xl border border-teal-100 bg-teal-50/60 px-3 py-2.5 text-sm leading-6 text-slate-700 italic"
          }
        >
          {text}
        </p>
      )}
    </div>
  );
}
