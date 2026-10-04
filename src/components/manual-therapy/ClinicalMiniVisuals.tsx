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

type CueType =
  | "glide"
  | "traction"
  | "transverse-friction"
  | "pressure"
  | "position-of-ease"
  | "contraction"
  | "neural-slider"
  | "fascial-load"
  | "rotation"
  | "directed";

const anatomyPoints: Record<ManualRegion, AnatomyPoint> = {
  "TMJ & Craniofacial": { x: 50, y: 13, label: "Craniofacial" },
  Cervical: { x: 50, y: 22, label: "Cervical" },
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

function targetKey(target: string) {
  return target.toLowerCase();
}

function cueMeta(techniqueSlug: string | undefined, direction: string) {
  const d = direction.toLowerCase();

  if (techniqueSlug === "strain-counterstrain") {
    return { title: "Position of Ease", label: "Comfort / shortening", type: "position-of-ease" as CueType };
  }
  if (techniqueSlug === "muscle-energy-technique") {
    return { title: "Contraction Direction", label: "Isometric effort", type: "contraction" as CueType };
  }
  if (techniqueSlug === "cyriax-deep-transverse-friction") {
    return { title: "Cross-Fiber Direction", label: "Transverse", type: "transverse-friction" as CueType };
  }
  if (techniqueSlug === "neurodynamic-mobilization") {
    return { title: "Neural Slider Path", label: "Load ↔ unload", type: "neural-slider" as CueType };
  }
  if (techniqueSlug === "trigger-point-compression") {
    return { title: "Pressure Cue", label: "Sustained pressure", type: "pressure" as CueType };
  }
  if (techniqueSlug === "myofascial-release") {
    return { title: "Fascial Load Direction", label: "Sustained tissue load", type: "fascial-load" as CueType };
  }
  if (
    techniqueSlug === "maitland-joint-mobilization" ||
    techniqueSlug === "kaltenborn-evjenth-mobilization" ||
    techniqueSlug === "mulligan-mobilization-with-movement" ||
    techniqueSlug === "mulligan-snags-nags"
  ) {
    if (d.includes("traction") || d.includes("distraction")) {
      return { title: "Traction Direction", label: "Distraction", type: "traction" as CueType };
    }
    if (d.includes("rotation") || d.includes("rotate")) {
      return { title: "Mobilization Direction", label: "Rotation", type: "rotation" as CueType };
    }
    return { title: "Glide Direction", label: "Joint glide", type: "glide" as CueType };
  }

  if (d.includes("traction") || d.includes("distraction")) {
    return { title: "Traction Direction", label: "Distraction", type: "traction" as CueType };
  }
  if (d.includes("transverse") || d.includes("side-to-side") || d.includes("side to side")) {
    return { title: "Movement Direction", label: "Transverse", type: "transverse-friction" as CueType };
  }
  if (d.includes("rotation") || d.includes("rotate")) {
    return { title: "Movement Direction", label: "Rotation", type: "rotation" as CueType };
  }

  return { title: "Direction Cue", label: "Directed force", type: "directed" as CueType };
}

function CraniofacialMap({ target }: { target: string }) {
  const t = targetKey(target);
  const isMasseter = t.includes("masseter");
  const isTemporalis = t.includes("temporalis");
  const isSuboccipital = t.includes("suboccipital");
  const isTMJ = t.includes("temporomandibular") || t.includes("tmj") || t.includes("mandibular condyle");

  return (
    <svg viewBox="0 0 180 150" className="h-full w-full" aria-hidden="true">
      <ellipse cx="88" cy="53" rx="42" ry="48" className="fill-slate-100 stroke-slate-300" strokeWidth="3" />
      <path d="M61 81 Q88 105 116 79 L108 119 Q88 136 67 118 Z" className="fill-slate-100 stroke-slate-300" strokeWidth="3" />
      <path d="M78 57 Q88 62 98 57" fill="none" className="stroke-slate-300" strokeWidth="2.5" strokeLinecap="round" />
      <path d="M88 58 L86 74 L94 77" fill="none" className="stroke-slate-300" strokeWidth="2" strokeLinecap="round" />
      <circle cx="70" cy="50" r="3" className="fill-slate-300" />
      <circle cx="106" cy="50" r="3" className="fill-slate-300" />

      {isMasseter ? (
        <>
          <path d="M108 66 Q121 76 116 105 Q108 119 98 108 Q103 84 101 70 Z" className="fill-emerald-400/35 stroke-emerald-600" strokeWidth="3" />
          <ellipse cx="109" cy="88" rx="18" ry="29" className="fill-emerald-400/10" />
        </>
      ) : null}

      {isTemporalis ? (
        <>
          <path d="M100 17 Q128 24 128 52 Q124 69 108 72 Q103 49 93 31 Z" className="fill-cyan-400/30 stroke-cyan-600" strokeWidth="3" />
          <path d="M107 26 Q121 39 116 59" fill="none" className="stroke-cyan-500" strokeWidth="2" strokeLinecap="round" />
        </>
      ) : null}

      {isSuboccipital ? (
        <>
          <path d="M52 69 Q47 50 54 35" fill="none" className="stroke-slate-400" strokeWidth="3" strokeDasharray="4 4" />
          <path d="M48 73 Q62 92 78 94" className="fill-violet-400/30 stroke-violet-600" strokeWidth="3" />
          <circle cx="62" cy="85" r="12" className="fill-violet-500/10 stroke-violet-500" strokeWidth="2" />
        </>
      ) : null}

      {isTMJ ? (
        <>
          <circle cx="119" cy="66" r="10" className="fill-violet-500/20 stroke-violet-600" strokeWidth="3" />
          <circle cx="119" cy="66" r="3.5" className="fill-violet-700" />
          <path d="M127 59 Q136 67 127 76" fill="none" className="stroke-violet-500" strokeWidth="2.5" strokeLinecap="round" />
        </>
      ) : null}

      {!isMasseter && !isTemporalis && !isSuboccipital && !isTMJ ? (
        <circle cx="119" cy="66" r="9" className="fill-violet-500/20 stroke-violet-600" strokeWidth="3" />
      ) : null}

      <path d="M50 133 Q88 143 126 133" fill="none" className="stroke-slate-200" strokeWidth="2" />
    </svg>
  );
}

function ShoulderMap({ target }: { target: string }) {
  const t = targetKey(target);
  const isJoint = t.includes("humeral head") || t.includes("glenohumeral") || t.includes("shoulder joint");
  const isPec = t.includes("pector");
  const isCuff = t.includes("cuff") || t.includes("infraspinatus") || t.includes("teres");
  const isBiceps = t.includes("biceps");

  return (
    <svg viewBox="0 0 180 150" className="h-full w-full" aria-hidden="true">
      <path d="M48 36 Q75 18 103 31 L125 44 Q135 69 128 116" fill="none" className="stroke-slate-300" strokeWidth="12" strokeLinecap="round" />
      <path d="M96 38 Q110 43 116 57" fill="none" className="stroke-slate-400" strokeWidth="5" strokeLinecap="round" />
      <circle cx="112" cy="54" r="18" className="fill-slate-100 stroke-slate-300" strokeWidth="3" />
      <path d="M123 68 L139 127" fill="none" className="stroke-slate-300" strokeWidth="12" strokeLinecap="round" />

      {isJoint ? (
        <>
          <circle cx="112" cy="54" r="15" className="fill-violet-400/25 stroke-violet-600" strokeWidth="3" />
          <circle cx="112" cy="54" r="5" className="fill-violet-700" />
        </>
      ) : null}

      {isPec ? (
        <path d="M76 39 Q101 43 110 63 L87 86 Q64 67 57 49 Z" className="fill-emerald-400/30 stroke-emerald-600" strokeWidth="3" />
      ) : null}

      {isCuff ? (
        <path d="M92 44 Q111 35 126 52 Q125 75 105 84 Q89 70 92 44 Z" className="fill-cyan-400/30 stroke-cyan-600" strokeWidth="3" />
      ) : null}

      {isBiceps ? (
        <path d="M119 63 Q128 85 132 119" fill="none" className="stroke-amber-500" strokeWidth="6" strokeLinecap="round" />
      ) : null}

      {!isJoint && !isPec && !isCuff && !isBiceps ? (
        <circle cx="112" cy="54" r="13" className="fill-violet-400/20 stroke-violet-600" strokeWidth="3" />
      ) : null}
    </svg>
  );
}

function KneeMap({ target }: { target: string }) {
  const t = targetKey(target);
  const isPatellarTendon = t.includes("patellar tendon");
  const isQuadTendon = t.includes("quadriceps tendon");
  const isHamstring = t.includes("hamstring");
  const isQuad = t.includes("quadriceps") && !isQuadTendon;
  const isJoint = t.includes("tibia") || t.includes("tibiofemoral") || t.includes("patellofemoral") || t.includes("patella");

  return (
    <svg viewBox="0 0 180 150" className="h-full w-full" aria-hidden="true">
      <path d="M77 12 L82 62" className="stroke-slate-300" strokeWidth="18" strokeLinecap="round" />
      <path d="M103 12 L98 62" className="stroke-slate-300" strokeWidth="18" strokeLinecap="round" />
      <ellipse cx="90" cy="72" rx="27" ry="18" className="fill-slate-100 stroke-slate-300" strokeWidth="3" />
      <circle cx="90" cy="69" r="11" className="fill-slate-200 stroke-slate-400" strokeWidth="2.5" />
      <path d="M84 86 L78 140" className="stroke-slate-300" strokeWidth="16" strokeLinecap="round" />
      <path d="M101 86 L106 140" className="stroke-slate-300" strokeWidth="12" strokeLinecap="round" />

      {isPatellarTendon ? (
        <path d="M90 79 L90 106" className="stroke-amber-500" strokeWidth="7" strokeLinecap="round" />
      ) : null}
      {isQuadTendon ? (
        <path d="M90 29 L90 58" className="stroke-cyan-500" strokeWidth="8" strokeLinecap="round" />
      ) : null}
      {isHamstring ? (
        <>
          <path d="M68 25 Q65 53 72 72" fill="none" className="stroke-emerald-500" strokeWidth="7" strokeLinecap="round" />
          <path d="M112 25 Q116 53 108 72" fill="none" className="stroke-emerald-500" strokeWidth="7" strokeLinecap="round" />
        </>
      ) : null}
      {isQuad ? (
        <path d="M90 15 L90 56" className="stroke-emerald-500" strokeWidth="12" strokeLinecap="round" />
      ) : null}
      {isJoint ? (
        <ellipse cx="90" cy="72" rx="31" ry="21" className="fill-violet-400/15 stroke-violet-600" strokeWidth="3" />
      ) : null}
    </svg>
  );
}

function AnkleFootMap({ target }: { target: string }) {
  const t = targetKey(target);
  const isAchilles = t.includes("achilles");
  const isPlantar = t.includes("plantar");
  const isTalus = t.includes("talus") || t.includes("talocrural");
  const isCalf = t.includes("gastrocnemius") || t.includes("soleus") || t.includes("calf");
  const isPeroneal = t.includes("peroneal") || t.includes("fibularis");

  return (
    <svg viewBox="0 0 180 150" className="h-full w-full" aria-hidden="true">
      <path d="M84 5 L83 94" className="stroke-slate-300" strokeWidth="17" strokeLinecap="round" />
      <path d="M100 5 L99 94" className="stroke-slate-300" strokeWidth="11" strokeLinecap="round" />
      <path d="M82 94 Q91 109 121 110 Q143 112 157 123 Q143 139 110 136 L72 127 Z" className="fill-slate-100 stroke-slate-300" strokeWidth="3" />

      {isAchilles ? (
        <path d="M78 55 Q72 91 78 112" fill="none" className="stroke-amber-500" strokeWidth="7" strokeLinecap="round" />
      ) : null}
      {isPlantar ? (
        <path d="M78 126 Q112 137 151 124" fill="none" className="stroke-emerald-500" strokeWidth="6" strokeLinecap="round" />
      ) : null}
      {isTalus ? (
        <ellipse cx="91" cy="100" rx="18" ry="12" className="fill-violet-400/20 stroke-violet-600" strokeWidth="3" />
      ) : null}
      {isCalf ? (
        <path d="M74 15 Q56 45 70 82 Q82 91 92 76 Q102 42 91 15 Z" className="fill-emerald-400/25 stroke-emerald-600" strokeWidth="3" />
      ) : null}
      {isPeroneal ? (
        <path d="M106 27 Q115 58 108 93" fill="none" className="stroke-cyan-500" strokeWidth="7" strokeLinecap="round" />
      ) : null}
    </svg>
  );
}

function CervicalMap({ target }: { target: string }) {
  const t = targetKey(target);
  const isUpperTrap = t.includes("upper trapezius");
  const isLevator = t.includes("levator");
  const isScalene = t.includes("scalene");
  const isJoint = t.includes("cervical") || t.includes("articular") || t.includes("spinous");

  return (
    <svg viewBox="0 0 180 150" className="h-full w-full" aria-hidden="true">
      <circle cx="90" cy="28" r="23" className="fill-slate-100 stroke-slate-300" strokeWidth="3" />
      <path d="M80 51 L75 86 M100 51 L105 86" className="stroke-slate-300" strokeWidth="8" strokeLinecap="round" />
      <path d="M46 93 Q90 71 134 93" fill="none" className="stroke-slate-300" strokeWidth="12" strokeLinecap="round" />
      <path d="M90 48 L90 100" className="stroke-slate-400" strokeWidth="5" strokeLinecap="round" />

      {isUpperTrap ? (
        <path d="M73 63 Q59 70 45 90 Q69 91 90 78 Q109 91 134 90 Q118 69 105 63 Z" className="fill-emerald-400/30 stroke-emerald-600" strokeWidth="3" />
      ) : null}
      {isLevator ? (
        <path d="M101 57 Q115 67 124 93" fill="none" className="stroke-cyan-500" strokeWidth="7" strokeLinecap="round" />
      ) : null}
      {isScalene ? (
        <>
          <path d="M82 56 L72 89" className="stroke-amber-500" strokeWidth="5" strokeLinecap="round" />
          <path d="M98 56 L108 89" className="stroke-amber-500" strokeWidth="5" strokeLinecap="round" />
        </>
      ) : null}
      {isJoint ? (
        <rect x="83" y="56" width="14" height="39" rx="7" className="fill-violet-400/20 stroke-violet-600" strokeWidth="3" />
      ) : null}
    </svg>
  );
}

function GenericBodyMap({
  region,
}: {
  region: ManualRegion;
}) {
  const point = anatomyPoints[region];

  return (
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
  );
}

export function AnatomyMiniMap({
  region,
  target,
}: {
  region: ManualRegion;
  target: string;
}) {
  const label = anatomyPoints[region].label;

  return (
    <div className="overflow-hidden rounded-2xl border border-slate-200 bg-gradient-to-br from-slate-50 via-white to-violet-50/40 p-4 shadow-sm">
      <div className="flex items-center justify-between gap-2">
        <div>
          <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-slate-500">
            Structure-specific map
          </p>
          <p className="mt-1 text-sm font-bold text-navy-900">{label}</p>
        </div>
        <Crosshair className="h-5 w-5 text-violet-600" />
      </div>

      <div className="relative mx-auto mt-3 h-36 w-full max-w-[220px] rounded-2xl bg-white/80 p-2 shadow-inner ring-1 ring-slate-100">
        {region === "TMJ & Craniofacial" ? (
          <CraniofacialMap target={target} />
        ) : region === "Shoulder" ? (
          <ShoulderMap target={target} />
        ) : region === "Knee" ? (
          <KneeMap target={target} />
        ) : region === "Ankle & Foot" ? (
          <AnkleFootMap target={target} />
        ) : region === "Cervical" ? (
          <CervicalMap target={target} />
        ) : (
          <GenericBodyMap region={region} />
        )}
      </div>

      <div className="mt-3 flex items-center justify-center">
        <span className="rounded-full border border-violet-100 bg-violet-50 px-3 py-1 text-center text-xs font-bold leading-5 text-violet-800">
          {target}
        </span>
      </div>
    </div>
  );
}

function CueGraphic({ type }: { type: CueType }) {
  if (type === "traction") {
    return (
      <div className="relative flex h-16 items-center justify-center">
        <ArrowLeft className="h-7 w-7 text-violet-600" />
        <div className="mx-2 h-2 w-16 rounded-full bg-gradient-to-r from-violet-500 via-indigo-400 to-cyan-500 shadow-sm" />
        <ArrowRight className="h-7 w-7 text-cyan-600" />
      </div>
    );
  }

  if (type === "transverse-friction") {
    return (
      <div className="relative flex h-16 items-center justify-center gap-3">
        <div className="h-12 w-2 rounded-full bg-slate-300 shadow-inner" />
        <div className="space-y-2">
          {[0, 1, 2].map((n) => (
            <div key={n} className="flex items-center">
              <ArrowLeft className="h-4 w-4 text-violet-600" />
              <div className="h-1.5 w-14 rounded-full bg-gradient-to-r from-violet-500 to-cyan-500" />
              <ArrowRight className="h-4 w-4 text-cyan-600" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (type === "pressure") {
    return (
      <div className="relative flex h-16 items-center justify-center">
        <div className="absolute h-12 w-12 rounded-full bg-violet-400/15 shadow-[0_0_24px_rgba(124,58,237,0.25)]" />
        <div className="absolute h-7 w-7 rounded-full bg-violet-500/25" />
        <div className="h-3 w-3 rounded-full bg-violet-700 shadow-lg" />
      </div>
    );
  }

  if (type === "position-of-ease") {
    return (
      <div className="relative flex h-16 items-center justify-center">
        <div className="h-12 w-12 rounded-full border-4 border-violet-300 border-r-transparent shadow-sm" />
        <ArrowDown className="-ml-4 mt-7 h-5 w-5 rotate-45 text-violet-700" />
        <span className="ml-3 rounded-full bg-emerald-50 px-2.5 py-1 text-[10px] font-bold text-emerald-700">
          ease
        </span>
      </div>
    );
  }

  if (type === "contraction") {
    return (
      <div className="flex h-16 items-center justify-center">
        <ArrowRight className="h-6 w-6 text-violet-600" />
        <div className="mx-2 h-4 w-20 rounded-full bg-gradient-to-r from-violet-400 via-indigo-500 to-cyan-400 shadow-md" />
        <ArrowLeft className="h-6 w-6 text-cyan-600" />
      </div>
    );
  }

  if (type === "neural-slider") {
    return (
      <div className="flex h-16 items-center justify-center gap-1">
        <ArrowLeft className="h-5 w-5 text-violet-600" />
        <div className="h-2 w-20 rounded-full bg-gradient-to-r from-violet-500 via-cyan-400 to-emerald-400 shadow-sm" />
        <ArrowRight className="h-5 w-5 text-emerald-600" />
        <span className="ml-2 text-[10px] font-bold uppercase tracking-wide text-cyan-700">
          slide
        </span>
      </div>
    );
  }

  if (type === "rotation") {
    return (
      <div className="flex h-16 items-center justify-center">
        <RotateCw className="h-11 w-11 text-violet-600 drop-shadow-sm" />
      </div>
    );
  }

  if (type === "fascial-load") {
    return (
      <div className="relative flex h-16 items-center justify-center">
        <div className="h-12 w-24 -skew-x-12 rounded-2xl bg-gradient-to-br from-violet-100 to-cyan-100 shadow-inner" />
        <ArrowRight className="absolute right-[30%] h-6 w-6 -rotate-12 text-violet-700" />
      </div>
    );
  }

  return (
    <div className="flex h-16 items-center justify-center">
      <span className="h-3 w-3 rounded-full bg-violet-600 shadow-md" />
      <div className="mx-2 h-2 flex-1 max-w-28 rounded-full bg-gradient-to-r from-violet-500 via-indigo-500 to-cyan-500 shadow-sm" />
      <ArrowRight className="h-6 w-6 text-cyan-600 drop-shadow-sm" />
    </div>
  );
}

export function ForceDirectionMiniMap({
  direction,
  techniqueSlug,
}: {
  direction: string;
  techniqueSlug?: string;
}) {
  const cue = cueMeta(techniqueSlug, direction);

  return (
    <div className="overflow-hidden rounded-2xl border border-cyan-200 bg-gradient-to-br from-cyan-50 via-white to-violet-50/40 p-4 shadow-sm">
      <div className="flex items-center justify-between gap-2">
        <div>
          <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-cyan-700">
            {cue.title}
          </p>
          <p className="mt-1 text-sm font-bold text-navy-900">{cue.label}</p>
        </div>
        <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-cyan-100 text-cyan-700 shadow-sm">
          {cue.type === "traction" ? (
            <Maximize2 className="h-5 w-5" />
          ) : cue.type === "rotation" ? (
            <RotateCw className="h-5 w-5" />
          ) : cue.type === "transverse-friction" ? (
            <MoveHorizontal className="h-5 w-5" />
          ) : (
            <ScanLine className="h-5 w-5" />
          )}
        </span>
      </div>

      <div className="mt-4 rounded-xl border border-cyan-100 bg-white px-3 py-2 shadow-inner">
        <CueGraphic type={cue.type} />
      </div>

      <p className="mt-3 line-clamp-4 text-xs leading-5 text-navy-600">
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
