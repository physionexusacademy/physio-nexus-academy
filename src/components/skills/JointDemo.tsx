"use client";

import { useEffect, useRef, useState } from "react";
import type { JointDemoSpec, SkillPose } from "@/lib/skills/types";

const CX = 180;
const CY = 128;
const PROX = 108;
const DIST = 98;

const rad = (deg: number) => (deg * Math.PI) / 180;
const pt = (deg: number, r: number) => [CX + r * Math.cos(rad(deg)), CY - r * Math.sin(rad(deg))] as const;

function arcPath(from: number, to: number, r: number) {
  const [x1, y1] = pt(from, r);
  const [x2, y2] = pt(to, r);
  const delta = to - from;
  const large = Math.abs(delta) > 180 ? 1 : 0;
  const sweep = delta > 0 ? 0 : 1;
  return `M ${x1.toFixed(1)} ${y1.toFixed(1)} A ${r} ${r} 0 ${large} ${sweep} ${x2.toFixed(1)} ${y2.toFixed(1)}`;
}

const poseLabel: Record<SkillPose, string> = {
  supine: "Supine",
  prone: "Prone",
  sitting: "Sitting",
  sidelying: "Side-lying",
  standing: "Standing",
  hooklying: "Hook-lying",
};

/** Tiny stick-figure showing the patient position. */
export function PoseGlyph({ pose, className }: { pose: SkillPose; className?: string }) {
  const stroke = { stroke: "currentColor", strokeWidth: 3, strokeLinecap: "round" as const, fill: "none" };
  const figure = (() => {
    switch (pose) {
      case "standing":
        return (
          <g {...stroke}>
            <circle cx="24" cy="7" r="4" />
            <path d="M24 11 V27 M24 15 L17 23 M24 15 L31 23 M24 27 L19 40 M24 27 L29 40" />
          </g>
        );
      case "sitting":
        return (
          <g {...stroke}>
            <circle cx="16" cy="7" r="4" />
            <path d="M16 11 V26 H30 V40 M16 15 L25 21 M8 40 H40" />
          </g>
        );
      case "prone":
        return (
          <g {...stroke}>
            <circle cx="8" cy="22" r="4" />
            <path d="M12 26 H42 M4 33 H44 M16 26 L18 31" />
          </g>
        );
      case "sidelying":
        return (
          <g {...stroke}>
            <circle cx="8" cy="22" r="4" />
            <path d="M12 25 H30 L42 21 M30 25 L42 29 M4 33 H44" />
          </g>
        );
      case "hooklying":
        return (
          <g {...stroke}>
            <circle cx="8" cy="26" r="4" />
            <path d="M12 29 H26 L33 19 L40 29 M4 33 H44" />
          </g>
        );
      default:
        return (
          <g {...stroke}>
            <circle cx="8" cy="26" r="4" />
            <path d="M12 29 H42 M4 33 H44" />
          </g>
        );
    }
  })();
  return (
    <svg viewBox="0 0 48 44" className={className} role="img" aria-label={`Patient position: ${poseLabel[pose]}`}>
      {figure}
    </svg>
  );
}

function usePrefersReducedMotion() {
  const [reduced, setReduced] = useState(false);
  useEffect(() => {
    const query = window.matchMedia("(prefers-reduced-motion: reduce)");
    setReduced(query.matches);
    const onChange = () => setReduced(query.matches);
    query.addEventListener?.("change", onChange);
    return () => query.removeEventListener?.("change", onChange);
  }, []);
  return reduced;
}

/**
 * Animated close-up of one joint: the proximal segment stays still while the
 * distal segment sweeps through its range. Shows axis, goniometer arms,
 * stabilisation, gravity and resistance where relevant.
 */
export function JointDemo({
  spec,
  fraction = 1,
  resistance = "auto",
  gravityOverride,
  caption,
  className,
}: {
  spec: JointDemoSpec;
  /** Portion of the range shown (MMT grading: partial range). */
  fraction?: number;
  resistance?: "auto" | "max" | "moderate" | "minimal" | "none";
  gravityOverride?: "against" | "minimized";
  caption?: string;
  className?: string;
}) {
  const reduced = usePrefersReducedMotion();
  const [t, setT] = useState(reduced ? 1 : 0);
  const frame = useRef<number | null>(null);

  useEffect(() => {
    if (reduced) {
      setT(1);
      return;
    }
    const start = performance.now();
    const period = 3200;
    const loop = (now: number) => {
      const phase = ((now - start) % period) / period;
      const tri = phase < 0.5 ? phase * 2 : 2 - phase * 2;
      const eased = tri < 0.5 ? 2 * tri * tri : 1 - Math.pow(-2 * tri + 2, 2) / 2;
      setT(Math.min(1, eased * 1.08));
      frame.current = requestAnimationFrame(loop);
    };
    frame.current = requestAnimationFrame(loop);
    return () => {
      if (frame.current) cancelAnimationFrame(frame.current);
    };
  }, [reduced, spec]);

  const travel = spec.rom * Math.max(0, Math.min(1, fraction)) * Math.min(t, 1);
  const current = spec.from + travel;
  const gravity = gravityOverride ?? spec.gravity;
  const showResist = resistance === "auto" ? Boolean(spec.resist) : resistance !== "none";
  const resistLength = resistance === "max" ? 46 : resistance === "moderate" ? 34 : resistance === "minimal" ? 22 : 36;
  const sign = spec.rom >= 0 ? 1 : -1;
  const [px, py] = pt(spec.prox, PROX);
  const [dx, dy] = pt(current, DIST);
  const [sx, sy] = pt(spec.from, DIST);
  // Resistance is applied ahead of the moving segment and pushes against the motion.
  const tangent = current + 90 * sign;
  const [rx1, ry1] = [dx + 9 * Math.cos(rad(tangent)), dy - 9 * Math.sin(rad(tangent))];
  const [rx2, ry2] = [dx + (9 + resistLength) * Math.cos(rad(tangent)), dy - (9 + resistLength) * Math.sin(rad(tangent))];
  const [mx, my] = pt(spec.prox, PROX * 0.55);
  const degrees = Math.round(Math.abs(travel));

  return (
    <figure className={"overflow-hidden rounded-2xl border border-slate-200 bg-gradient-to-b from-[#f5fbff] to-white " + (className ?? "")}>
      <svg viewBox="0 0 360 250" className="block h-auto w-full" role="img" aria-label={`${spec.distLabel} moving about the ${spec.axis}, ${Math.abs(spec.rom)} degrees`}>
        <defs>
          <marker id="jd-arrow-red" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
            <path d="M0 0 L10 5 L0 10 z" fill="#e5484d" />
          </marker>
          <marker id="jd-arrow-amber" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
            <path d="M0 0 L10 5 L0 10 z" fill="#d97706" />
          </marker>
          <linearGradient id="jd-distal" x1="0" x2="1">
            <stop offset="0" stopColor="#0db3aa" />
            <stop offset="1" stopColor="#1a9ee6" />
          </linearGradient>
        </defs>

        {/* grid */}
        <g stroke="#e3edf5" strokeWidth="1">
          {Array.from({ length: 9 }, (_, i) => (
            <line key={"v" + i} x1={i * 45} y1="0" x2={i * 45} y2="250" />
          ))}
          {Array.from({ length: 6 }, (_, i) => (
            <line key={"h" + i} x1="0" y1={i * 50} x2="360" y2={i * 50} />
          ))}
        </g>

        {/* start position ghost + range arc */}
        <line x1={CX} y1={CY} x2={sx} y2={sy} stroke="#9fb3c8" strokeWidth="14" strokeLinecap="round" opacity="0.25" />
        <path d={arcPath(spec.from, spec.from + spec.rom * Math.max(0, Math.min(1, fraction)), 52)} fill="none" stroke="#c7d6e4" strokeWidth="2" strokeDasharray="4 5" />
        {Math.abs(travel) > 1 ? <path d={arcPath(spec.from, current, 52)} fill="none" stroke="#0db3aa" strokeWidth="4" strokeLinecap="round" /> : null}

        {/* segments */}
        <line x1={CX} y1={CY} x2={px} y2={py} stroke="#7d93ab" strokeWidth="20" strokeLinecap="round" />
        <line x1={CX} y1={CY} x2={dx} y2={dy} stroke="url(#jd-distal)" strokeWidth="18" strokeLinecap="round" />

        {/* goniometer */}
        {spec.goniometer ? (
          <g>
            <circle cx={CX} cy={CY} r="24" fill="rgba(255,255,255,0.75)" stroke="#0a1f3d" strokeWidth="1.5" />
            <line x1={CX} y1={CY} x2={pt(spec.prox, PROX * 0.95)[0]} y2={pt(spec.prox, PROX * 0.95)[1]} stroke="#0a1f3d" strokeWidth="3" />
            <line x1={CX} y1={CY} x2={pt(current, DIST * 0.95)[0]} y2={pt(current, DIST * 0.95)[1]} stroke="#0a1f3d" strokeWidth="3" strokeDasharray="7 3" />
          </g>
        ) : null}

        {/* axis */}
        <circle cx={CX} cy={CY} r="6" fill="#fff" stroke="#0a1f3d" strokeWidth="3" />

        {/* stabilisation */}
        <g>
          <circle cx={mx} cy={my} r="11" fill="#3b82f6" opacity="0.18" />
          <circle cx={mx} cy={my} r="6" fill="#3b82f6" />
          <text x={mx} y={my + 24} textAnchor="middle" fontSize="9.5" fontWeight="700" fill="#1d4ed8">stabilise</text>
        </g>

        {/* resistance */}
        {showResist && Math.abs(travel) > 2 ? (
          <g>
            <line x1={rx2} y1={ry2} x2={rx1} y2={ry1} stroke="#e5484d" strokeWidth={resistance === "max" ? 5 : resistance === "minimal" ? 2.5 : 3.5} markerEnd="url(#jd-arrow-red)" />
            <text x={rx2} y={ry2 - 6} textAnchor="middle" fontSize="9.5" fontWeight="700" fill="#c4262c">resistance</text>
          </g>
        ) : null}

        {/* gravity */}
        {gravity ? (
          <g>
            {gravity === "against" ? (
              <>
                <line x1="330" y1="24" x2="330" y2="62" stroke="#d97706" strokeWidth="3" markerEnd="url(#jd-arrow-amber)" />
                <text x="330" y="78" textAnchor="middle" fontSize="9.5" fontWeight="700" fill="#b45309">gravity</text>
              </>
            ) : (
              <text x="350" y="20" textAnchor="end" fontSize="9.5" fontWeight="700" fill="#b45309">gravity minimised</text>
            )}
          </g>
        ) : null}

        {/* readout */}
        <g>
          <rect x="12" y="12" width="74" height="30" rx="9" fill="#0a1f3d" />
          <text x="49" y="32" textAnchor="middle" fontSize="15" fontWeight="800" fill="#2ee6d6">{degrees}°</text>
        </g>
        <foreignObject x="12" y="196" width="46" height="44">
          <div style={{ color: "#0a1f3d" }}>
            <PoseGlyph pose={spec.pose} className="h-10 w-11" />
          </div>
        </foreignObject>

        {/* labels */}
        <text x={pt(spec.prox, PROX * 0.7)[0] + 16 * Math.cos(rad(spec.prox + 90))} y={pt(spec.prox, PROX * 0.7)[1] - 16 * Math.sin(rad(spec.prox + 90)) + 4} textAnchor="middle" fontSize="10.5" fontWeight="700" fill="#45607a">{spec.proxLabel}</text>
        <text x={pt(current, DIST + 18)[0]} y={pt(current, DIST + 18)[1] + 4} textAnchor="middle" fontSize="10.5" fontWeight="700" fill="#047a85">{spec.distLabel}</text>
        <text x={CX} y={CY + 30} textAnchor="middle" fontSize="9.5" fill="#0a1f3d">axis</text>
      </svg>
      <figcaption className="flex flex-wrap items-center gap-x-3 gap-y-1 border-t border-slate-200 bg-white px-3 py-2 text-[11.5px] text-slate-600">
        <span><strong className="text-navy-800">{poseLabel[spec.pose]}</strong></span>
        <span>Axis: <strong className="text-navy-800">{spec.axis}</strong></span>
        <span>Range shown: <strong className="text-navy-800">{Math.round(Math.abs(spec.rom * fraction))}°</strong></span>
        {spec.goniometer ? <span>Goniometer: <strong className="text-navy-800">solid</strong> = stationary arm, <strong className="text-navy-800">dashed</strong> = moving arm</span> : null}
        {caption ? <span className="w-full text-slate-500">{caption}</span> : null}
      </figcaption>
    </figure>
  );
}
