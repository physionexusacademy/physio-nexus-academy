import { Activity, Bone, Dumbbell, ScanSearch, Stethoscope } from "lucide-react";
import type { AtlasCategory } from "@/lib/clinical-visual-atlas";

const iconMap = {
  Anatomy: Bone,
  Pathology: Activity,
  Mechanism: ScanSearch,
  Assessment: Stethoscope,
  Rehabilitation: Dumbbell,
} satisfies Record<AtlasCategory, typeof Bone>;

const toneMap = {
  Anatomy: "from-cyan-500/20 via-white to-blue-500/10 text-cyan-800",
  Pathology: "from-rose-500/20 via-white to-orange-500/10 text-rose-800",
  Mechanism: "from-amber-500/20 via-white to-orange-500/10 text-amber-800",
  Assessment: "from-violet-500/20 via-white to-cyan-500/10 text-violet-800",
  Rehabilitation: "from-emerald-500/20 via-white to-teal-500/10 text-emerald-800",
} satisfies Record<AtlasCategory, string>;

export default function AtlasPlaceholder({
  category,
  title,
  compact = false,
}: {
  category: AtlasCategory;
  title: string;
  compact?: boolean;
}) {
  const Icon = iconMap[category];

  return (
    <div
      className={
        "relative overflow-hidden bg-gradient-to-br " +
        toneMap[category] +
        (compact ? " aspect-[4/3] rounded-2xl" : " min-h-[360px] rounded-3xl")
      }
    >
      <div className="absolute -right-12 -top-12 h-40 w-40 rounded-full border-[28px] border-white/50" />
      <div className="absolute -bottom-16 -left-10 h-44 w-44 rounded-full border-[32px] border-white/50" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_30%,rgba(255,255,255,0.9),transparent_38%)]" />

      <div className="relative flex h-full min-h-[inherit] flex-col items-center justify-center p-6 text-center">
        <div className="flex h-20 w-20 items-center justify-center rounded-3xl border border-white/80 bg-white/80 shadow-lg backdrop-blur">
          <Icon className="h-10 w-10" />
        </div>
        <p className="mt-5 text-[11px] font-black uppercase tracking-[0.2em] opacity-70">
          PNA Clinical Visual Atlas
        </p>
        <p className="mt-2 max-w-sm text-lg font-black text-navy-900">{title}</p>
        {!compact ? (
          <p className="mt-3 max-w-md text-sm leading-6 text-navy-600">
            Optimized 3D render slot — served from ImageKit only when the final asset is approved.
          </p>
        ) : null}
      </div>
    </div>
  );
}
