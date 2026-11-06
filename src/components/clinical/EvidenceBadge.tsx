import {ShieldCheck} from "lucide-react";

export type EvidenceLevel =
  | "case-report"
  | "limited"
  | "moderate"
  | "strong"
  | "expert-opinion";

const LABELS: Record<
  EvidenceLevel,
  {label: string; short: string; className: string; title: string}
> = {
  "case-report": {
    label: "Case report only",
    short: "Case only",
    className:
      "border-amber-200 bg-amber-50 text-amber-900",
    title:
      "Based on a single published case. Useful for clinical reasoning, not proof that a treatment works for everyone.",
  },
  limited: {
    label: "Limited evidence",
    short: "Limited",
    className: "border-orange-200 bg-orange-50 text-orange-900",
    title: "Small studies or mixed findings. Use with clinical judgment.",
  },
  moderate: {
    label: "Moderate evidence",
    short: "Moderate",
    className: "border-sky-200 bg-sky-50 text-sky-900",
    title: "Supported by several studies, still not universal.",
  },
  strong: {
    label: "Strong evidence",
    short: "Strong",
    className: "border-emerald-200 bg-emerald-50 text-emerald-900",
    title: "Consistent support from higher-quality evidence.",
  },
  "expert-opinion": {
    label: "Expert opinion",
    short: "Opinion",
    className: "border-slate-200 bg-slate-50 text-slate-700",
    title: "Clinical experience or consensus; not high-level trial evidence.",
  },
};

export function EvidenceBadge({
  level = "case-report",
  compact = false,
  className = "",
}: {
  level?: EvidenceLevel;
  compact?: boolean;
  className?: string;
}) {
  const meta = LABELS[level];
  return (
    <span
      className={`inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide ${meta.className} ${className}`}
      title={meta.title}
    >
      <ShieldCheck className="h-3 w-3 shrink-0" aria-hidden="true" />
      {compact ? meta.short : meta.label}
    </span>
  );
}
