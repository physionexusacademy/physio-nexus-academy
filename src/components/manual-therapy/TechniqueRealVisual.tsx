import Image from "next/image";
import {
  ArrowDown,
  ArrowLeft,
  ArrowRight,
  ArrowUp,
  MoveDown,
  MoveHorizontal,
  MoveUpRight,
  RotateCw,
  Target,
} from "lucide-react";
import { getCloudinaryUrl } from "@/lib/cloudinary";
import type {
  ManualTherapyVisualSpec,
  TechniqueVector,
} from "@/lib/manual-therapy-visual-specs";

function DirectionGlyph({ vector }: { vector: TechniqueVector }) {
  if (vector === "pa") {
    return (
      <div className="flex items-center justify-center gap-2">
        <span className="rounded-lg bg-violet-50 px-2 py-1 text-[10px] font-black text-violet-800">P</span>
        <div className="h-2 w-24 rounded-full bg-gradient-to-r from-violet-600 to-cyan-500" />
        <ArrowRight className="h-8 w-8 text-cyan-700" />
        <span className="rounded-lg bg-cyan-50 px-2 py-1 text-[10px] font-black text-cyan-800">A</span>
      </div>
    );
  }

  if (vector === "ap") {
    return (
      <div className="flex items-center justify-center gap-2">
        <span className="rounded-lg bg-cyan-50 px-2 py-1 text-[10px] font-black text-cyan-800">A</span>
        <ArrowLeft className="h-8 w-8 text-violet-700" />
        <div className="h-2 w-24 rounded-full bg-gradient-to-l from-violet-600 to-cyan-500" />
        <span className="rounded-lg bg-violet-50 px-2 py-1 text-[10px] font-black text-violet-800">P</span>
      </div>
    );
  }

  if (vector === "ap-pa" || vector === "slider" || vector === "multidirectional") {
    return (
      <div className="flex items-center justify-center gap-2">
        <ArrowLeft className="h-8 w-8 text-violet-700" />
        <div className="h-2 w-24 rounded-full bg-gradient-to-r from-violet-600 via-indigo-500 to-cyan-500" />
        <ArrowRight className="h-8 w-8 text-cyan-700" />
      </div>
    );
  }

  if (vector === "posterior") {
    return (
      <div className="flex items-center justify-center gap-2">
        <ArrowLeft className="h-9 w-9 text-violet-700" />
        <span className="text-xs font-black uppercase tracking-wide text-violet-800">Posterior</span>
      </div>
    );
  }

  if (vector === "inferior") {
    return (
      <div className="flex flex-col items-center justify-center gap-1">
        <ArrowDown className="h-10 w-10 text-cyan-700" />
        <span className="text-xs font-black uppercase tracking-wide text-cyan-800">Inferior</span>
      </div>
    );
  }

  if (vector === "traction") {
    return (
      <div className="flex items-center justify-center gap-2">
        <ArrowLeft className="h-8 w-8 text-violet-700" />
        <div className="h-2 w-20 rounded-full bg-gradient-to-r from-violet-600 to-cyan-500" />
        <ArrowRight className="h-8 w-8 text-cyan-700" />
        <span className="ml-1 text-xs font-black uppercase tracking-wide text-slate-700">Distraction</span>
      </div>
    );
  }

  if (vector === "rotation") {
    return (
      <div className="flex items-center justify-center gap-3">
        <RotateCw className="h-11 w-11 text-violet-700" />
        <span className="text-xs font-black uppercase tracking-wide text-violet-800">Rotation + sustained glide</span>
      </div>
    );
  }

  if (vector === "lateral") {
    return (
      <div className="flex items-center justify-center gap-2">
        <MoveHorizontal className="h-10 w-10 text-cyan-700" />
        <span className="text-xs font-black uppercase tracking-wide text-cyan-800">Lateral glide</span>
      </div>
    );
  }

  if (vector === "diagonal") {
    return (
      <div className="flex items-center justify-center gap-3">
        <MoveUpRight className="h-11 w-11 text-violet-700" />
        <span className="text-xs font-black uppercase tracking-wide text-violet-800">Diagonal pattern</span>
      </div>
    );
  }

  if (vector === "isometric") {
    return (
      <div className="flex items-center justify-center gap-1">
        <ArrowRight className="h-7 w-7 text-violet-700" />
        <div className="h-10 w-10 rounded-xl border-2 border-violet-300 bg-violet-50" />
        <ArrowLeft className="h-7 w-7 text-cyan-700" />
        <span className="ml-2 text-xs font-black uppercase tracking-wide text-slate-700">Isometric hold</span>
      </div>
    );
  }

  if (vector === "longitudinal" || vector === "active-lengthening") {
    return (
      <div className="flex items-center justify-center gap-3">
        <div className="flex flex-col items-center">
          <ArrowUp className="h-7 w-7 text-violet-700" />
          <div className="h-9 w-2 rounded-full bg-gradient-to-b from-violet-600 to-cyan-500" />
          <ArrowDown className="h-7 w-7 text-cyan-700" />
        </div>
        <span className="text-xs font-black uppercase tracking-wide text-slate-700">
          {vector === "active-lengthening" ? "Active lengthening" : "Longitudinal tissue load"}
        </span>
      </div>
    );
  }

  if (vector === "friction") {
    return (
      <div className="flex items-center justify-center gap-2">
        <ArrowLeft className="h-7 w-7 text-violet-700" />
        <div className="h-6 w-12 rounded-lg border-2 border-rose-300 bg-rose-50" />
        <ArrowRight className="h-7 w-7 text-cyan-700" />
        <span className="ml-2 text-xs font-black uppercase tracking-wide text-slate-700">Short transverse strokes</span>
      </div>
    );
  }

  if (vector === "pressure") {
    return (
      <div className="flex items-center justify-center gap-3">
        <MoveDown className="h-10 w-10 text-violet-700" />
        <div className="h-8 w-8 rounded-full border-4 border-rose-300 bg-rose-100" />
        <span className="text-xs font-black uppercase tracking-wide text-slate-700">Localized pressure</span>
      </div>
    );
  }

  if (vector === "drainage") {
    return (
      <div className="flex items-center justify-center gap-3">
        <ArrowUp className="h-8 w-8 text-cyan-700" />
        <ArrowUp className="h-8 w-8 text-cyan-500" />
        <ArrowUp className="h-8 w-8 text-cyan-300" />
        <span className="text-xs font-black uppercase tracking-wide text-slate-700">Gentle drainage sequence</span>
      </div>
    );
  }

  return null;
}

export default function TechniqueRealVisual({
  spec,
  eager = false,
}: {
  spec: ManualTherapyVisualSpec;
  eager?: boolean;
}) {
  const src = getCloudinaryUrl(spec.basePublicId, {
    width: 1600,
    quality: 88,
    format: "auto",
  });

  return (
    <figure className="overflow-hidden rounded-[2rem] border border-grey-200 bg-white shadow-[0_16px_40px_rgba(15,23,42,0.08)]">
      <div className="flex items-start justify-between gap-3 border-b border-grey-100 px-5 py-4 sm:px-6">
        <div>
          <p className="text-[10px] font-black uppercase tracking-[0.2em] text-violet-700">
            PNA Clinical Visual
          </p>
          <h2 className="mt-1 text-xl font-bold leading-7 text-navy-900">{spec.title}</h2>
        </div>
        <div className="flex h-12 w-12 flex-none items-center justify-center rounded-2xl border border-grey-200 bg-white p-1.5 shadow-sm">
          <Image src="/images/pna-logo.png" alt="PNA" width={44} height={44} className="h-full w-full object-contain" />
        </div>
      </div>

      <div className="relative bg-white p-3 sm:p-5">
        <div className="relative overflow-hidden rounded-3xl border border-slate-200 bg-slate-50">
          <img
            src={src}
            alt={spec.title}
            loading={eager ? "eager" : "lazy"}
            decoding="async"
            className="mx-auto block max-h-[760px] w-full object-contain"
          />

          <div
            className="pointer-events-none absolute -translate-x-1/2 -translate-y-1/2"
            style={{ left: spec.targetX + "%", top: spec.targetY + "%" }}
          >
            <div className="relative h-16 w-16 rounded-full border-[3px] border-rose-500 bg-rose-400/10 shadow-[0_0_28px_rgba(244,63,94,0.32)] sm:h-20 sm:w-20">
              <div className="absolute left-1/2 top-1/2 h-3 w-3 -translate-x-1/2 -translate-y-1/2 rounded-full bg-rose-500 shadow" />
            </div>
          </div>

          <div className="absolute bottom-3 left-3 right-3 rounded-2xl border border-white/90 bg-white/94 px-3 py-2 shadow-md backdrop-blur-sm sm:left-auto sm:right-4 sm:w-[360px]">
            <div className="flex items-center gap-2 text-rose-700">
              <Target className="h-4 w-4 flex-none" />
              <p className="text-[9px] font-black uppercase tracking-[0.15em]">Technique target</p>
            </div>
            <p className="mt-1 text-xs font-semibold leading-5 text-navy-800">{spec.target}</p>
          </div>
        </div>

        <div className="mt-4 rounded-2xl border border-cyan-100 bg-gradient-to-br from-cyan-50 via-white to-violet-50 px-4 py-4">
          <p className="text-[9px] font-black uppercase tracking-[0.16em] text-cyan-700">
            Force / movement direction
          </p>
          <div className="mt-2 min-h-16 rounded-xl border border-cyan-100 bg-white px-3 py-3 shadow-inner">
            <DirectionGlyph vector={spec.vector} />
          </div>
          <p className="mt-2 text-sm font-semibold leading-6 text-navy-800">{spec.force}</p>
        </div>

        {spec.note ? (
          <p className="mt-3 rounded-xl border border-violet-100 bg-violet-50/60 px-3 py-2 text-xs leading-5 text-violet-900">
            {spec.note}
          </p>
        ) : null}
      </div>
    </figure>
  );
}
