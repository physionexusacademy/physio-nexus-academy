import {
  ArrowDown,
  ArrowLeft,
  ArrowRight,
  ArrowUp,
  Crosshair,
  Maximize2,
  MoveHorizontal,
  RotateCw,
  ScanLine,
} from "lucide-react";
import type { ManualRegion } from "@/lib/manual-therapy-regional";

type AnatomyPoint = {
  x: number;
  y: number;
  label: string;
};

const anatomyPoints: Record<ManualRegion, AnatomyPoint> = {
  "TMJ & Craniofacial": { x: 50, y: 13, label: "Jaw / face" },
  Cervical: { x: 50, y: 22, label: "Neck" },
  Thoracic: { x: 50, y: 36, label: "Thoracic spine" },
  "Ribs & Chest Wall": { x: 50, y: 39, label: "Chest wall" },
  Lumbar: { x: 50, y: 50, label: "Lumbar spine" },
  Shoulder: { x: 33, y: 30, label: "Shoulder" },
  Elbow: { x: 24, y: 44, label: "Elbow" },
  "Wrist & Hand": { x: 18, y: 57, label: "Wrist / hand" },
  "Hip & Pelvis": { x: 50, y: 62, label: "Hip / pelvis" },
  Knee: { x: 42, y: 79, label: "Knee" },
  "Ankle & Foot": { x: 42, y: 94, label: "Ankle / foot" },
  "Upper Limb Neural": { x: 24, y: 46, label: "Upper-limb neural" },
  "Lower Limb Neural": { x: 42, y: 78, label: "Lower-limb neural" },
};

function forceKind(direction: string) {
  const d = direction.toLowerCase();

  if (d.includes("posterior-to-anterior") || d.includes("posterior to anterior")) {
    return { label: "P → A", icon: ArrowRight };
  }
  if (d.includes("anterior-to-posterior") || d.includes("anterior to posterior")) {
    return { label: "A → P", icon: ArrowLeft };
  }
  if (d.includes("inferior")) {
    return { label: "Inferior", icon: ArrowDown };
  }
  if (d.includes("superior")) {
    return { label: "Superior", icon: ArrowUp };
  }
  if (d.includes("distraction") || d.includes("traction")) {
    return { label: "Distraction", icon: Maximize2 };
  }
  if (d.includes("transverse") || d.includes("side-to-side") || d.includes("side to side")) {
    return { label: "Transverse", icon: MoveHorizontal };
  }
  if (d.includes("rotation") || d.includes("rotate")) {
    return { label: "Rotation", icon: RotateCw };
  }
  if (d.includes("lateral") || d.includes("medial")) {
    return { label: "Glide", icon: MoveHorizontal };
  }

  return { label: "Directed force", icon: ScanLine };
}

export function AnatomyMiniMap({
  region,
  target,
}: {
  region: ManualRegion;
  target: string;
}) {
  const point = anatomyPoints[region];

  return (
    <div className="overflow-hidden rounded-2xl border border-slate-200 bg-gradient-to-br from-slate-50 to-white p-4">
      <div className="flex items-center justify-between gap-2">
        <div>
          <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-slate-500">
            Mini anatomy map
          </p>
          <p className="mt-1 text-sm font-bold text-navy-900">{point.label}</p>
        </div>
        <Crosshair className="h-5 w-5 text-violet-600" />
      </div>

      <div className="relative mx-auto mt-3 h-28 w-24">
        <svg viewBox="0 0 100 120" className="h-full w-full" aria-hidden="true">
          <circle cx="50" cy="10" r="8" fill="none" stroke="currentColor" strokeWidth="3" className="text-slate-300" />
          <path d="M50 18 L50 58" stroke="currentColor" strokeWidth="4" strokeLinecap="round" className="text-slate-300" />
          <path d="M28 32 L72 32" stroke="currentColor" strokeWidth="4" strokeLinecap="round" className="text-slate-300" />
          <path d="M28 32 L18 58" stroke="currentColor" strokeWidth="4" strokeLinecap="round" className="text-slate-300" />
          <path d="M72 32 L82 58" stroke="currentColor" strokeWidth="4" strokeLinecap="round" className="text-slate-300" />
          <path d="M50 58 L35 88" stroke="currentColor" strokeWidth="4" strokeLinecap="round" className="text-slate-300" />
          <path d="M50 58 L65 88" stroke="currentColor" strokeWidth="4" strokeLinecap="round" className="text-slate-300" />
          <path d="M35 88 L31 112" stroke="currentColor" strokeWidth="4" strokeLinecap="round" className="text-slate-300" />
          <path d="M65 88 L69 112" stroke="currentColor" strokeWidth="4" strokeLinecap="round" className="text-slate-300" />
          <circle cx={point.x} cy={point.y} r="7" className="fill-violet-500/20 stroke-violet-600" strokeWidth="2.5" />
          <circle cx={point.x} cy={point.y} r="2.5" className="fill-violet-700" />
        </svg>
      </div>

      <p className="mt-2 line-clamp-2 text-center text-xs font-semibold leading-5 text-navy-700">
        {target}
      </p>
    </div>
  );
}

export function ForceDirectionMiniMap({
  direction,
}: {
  direction: string;
}) {
  const kind = forceKind(direction);
  const Icon = kind.icon;

  return (
    <div className="overflow-hidden rounded-2xl border border-cyan-200 bg-gradient-to-br from-cyan-50 to-white p-4">
      <div className="flex items-center justify-between gap-2">
        <div>
          <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-cyan-700">
            Force direction
          </p>
          <p className="mt-1 text-sm font-bold text-navy-900">{kind.label}</p>
        </div>
        <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-cyan-100 text-cyan-700">
          <Icon className="h-5 w-5" />
        </span>
      </div>

      <div className="mt-4 flex items-center gap-3 rounded-xl border border-cyan-100 bg-white px-3 py-4">
        <span className="h-3 w-3 rounded-full bg-violet-600" />
        <div className="relative h-0.5 flex-1 bg-gradient-to-r from-violet-500 to-cyan-500">
          <span className="absolute -right-1 -top-[5px] h-0 w-0 border-y-[6px] border-l-[9px] border-y-transparent border-l-cyan-500" />
        </div>
        <span className="rounded-full bg-cyan-100 px-2 py-1 text-[10px] font-bold text-cyan-800">
          force
        </span>
      </div>

      <p className="mt-3 line-clamp-3 text-xs leading-5 text-navy-600">
        {direction}
      </p>
    </div>
  );
}

export function ClinicalCompareStrip({
  patientFocus,
  therapistCheck,
}: {
  patientFocus: string;
  therapistCheck: string;
}) {
  return (
    <div className="grid gap-3 sm:grid-cols-2">
      <div className="rounded-2xl border border-violet-100 bg-violet-50/70 p-4">
        <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-violet-700">
          Patient focus
        </p>
        <p className="mt-2 text-sm font-semibold leading-6 text-navy-800">
          {patientFocus}
        </p>
      </div>

      <div className="rounded-2xl border border-emerald-100 bg-emerald-50/70 p-4">
        <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-emerald-700">
          Therapist verifies
        </p>
        <p className="mt-2 text-sm font-semibold leading-6 text-navy-800">
          {therapistCheck}
        </p>
      </div>
    </div>
  );
}
