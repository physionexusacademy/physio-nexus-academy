import { BadgeCheck } from "lucide-react";

/**
 * The clinical sign-off shown on teaching and patient content: PNA's clinical lead has checked the content and its references.
 * Server-safe (no hooks), so it costs nothing on static pages.
 */
export const CLINICAL_REVIEWER = "Dr. Sajjad Raza PT";

export function ReviewedBy({ tone = "light", className = "" }: { tone?: "light" | "dark"; className?: string }) {
  const look = tone === "dark" ? "border-teal-300/40 bg-teal-300/10 text-teal-100" : "border-teal-200 bg-teal-50 text-teal-800";
  return (
    <span className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-[12px] font-bold ${look} ${className}`} data-pna-reviewed="clinical">
      <BadgeCheck className="h-3.5 w-3.5" aria-hidden="true" />
      Reviewed by {CLINICAL_REVIEWER}
    </span>
  );
}
