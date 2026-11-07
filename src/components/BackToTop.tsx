"use client";

import { ArrowUp } from "lucide-react";

export function BackToTop() {
  return (
    <button
      type="button"
      onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
      className="inline-flex items-center gap-1.5 rounded-full border border-[var(--nx-line)] px-3 py-1.5 font-semibold text-[#c4d6e8] hover:border-[var(--nx-aqua)] hover:text-white"
      aria-label="Back to top"
    >
      <ArrowUp className="h-3.5 w-3.5" aria-hidden="true" /> Back to top
    </button>
  );
}
