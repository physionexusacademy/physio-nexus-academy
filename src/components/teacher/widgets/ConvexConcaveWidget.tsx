"use client";

import { useId, useState } from "react";
import type { TeacherLang } from "@/lib/teacher/types";
import { cn } from "@/lib/utils";
import { t } from "../ui";

type Mode = "shoulder" | "knee-open" | "knee-closed";

const BONE = "#f6efe2";
const BONE_STROKE = "#9a8466";
const ROLL = "#d97706";
const GLIDE = "#0f766e";

function polar(cx: number, cy: number, r: number, deg: number) {
  const a = (deg * Math.PI) / 180;
  return { x: +(cx + r * Math.cos(a)).toFixed(1), y: +(cy + r * Math.sin(a)).toFixed(1) };
}

/** Arc between two angles (SVG degrees, y-down). sweep 0 = counter-clockwise on screen. */
function arc(cx: number, cy: number, r: number, from: number, to: number, sweep: 0 | 1) {
  const a = polar(cx, cy, r, from);
  const b = polar(cx, cy, r, to);
  return `M ${a.x} ${a.y} A ${r} ${r} 0 0 ${sweep} ${b.x} ${b.y}`;
}

export function ConvexConcaveWidget({ lang }: { lang: TeacherLang }) {
  const rawId = useId().replace(/[^a-zA-Z0-9]/g, "");
  const rollMarker = `cc-roll-${rawId}`;
  const glideMarker = `cc-glide-${rawId}`;
  const [mode, setMode] = useState<Mode>("shoulder");
  const [angle, setAngle] = useState(35);
  const [rollOnly, setRollOnly] = useState(false);

  const arrowOpacity = Math.min(1, angle / 15);
  const lift = mode === "shoulder" && rollOnly ? (angle / 90) * 30 : 0;
  const impinging = mode === "shoulder" && rollOnly && lift >= 10;

  const modes: { id: Mode; label: string }[] = [
    { id: "shoulder", label: t(lang, "Shoulder abduction", "Shoulder abduction") },
    { id: "knee-open", label: t(lang, "Knee — sitting (open chain)", "Knee — baith kar (open chain)") },
    { id: "knee-closed", label: t(lang, "Knee — standing up (closed chain)", "Knee — uthte hue (closed chain)") },
  ];

  const info: Record<Mode, { moving: string; roll: string; glide: string; rule: string; slider: string }> = {
    shoulder: {
      moving: t(lang, "Moving surface: convex humeral head on a fixed concave glenoid", "Move karne wali surface: convex humeral head, fixed concave glenoid par"),
      roll: t(lang, "Roll: superior ↑", "Roll: superior (upar) ↑"),
      glide: t(lang, "Glide: inferior ↓", "Glide: inferior (neeche) ↓"),
      rule: t(lang, "Convex moving → roll and glide OPPOSITE", "Convex move kare → roll aur glide ULTI direction"),
      slider: t(lang, `Abduction: ${angle}°`, `Abduction: ${angle}°`),
    },
    "knee-open": {
      moving: t(lang, "Moving surface: concave tibia on a fixed convex femur", "Move karne wali surface: concave tibia, fixed convex femur par"),
      roll: t(lang, "Roll: anterior →", "Roll: anterior (aage) →"),
      glide: t(lang, "Glide: anterior →", "Glide: anterior (aage) →"),
      rule: t(lang, "Concave moving → roll and glide SAME direction", "Concave move kare → roll aur glide EK HI direction"),
      slider: t(lang, `Knee extension: ${angle}° (from 90° flexion)`, `Knee extension: ${angle}° (90° flexion se)`),
    },
    "knee-closed": {
      moving: t(lang, "Moving surface: convex femur on a fixed concave tibia", "Move karne wali surface: convex femur, fixed concave tibia par"),
      roll: t(lang, "Roll: anterior →", "Roll: anterior (aage) →"),
      glide: t(lang, "Glide: posterior ←", "Glide: posterior (peeche) ←"),
      rule: t(lang, "Convex moving → roll and glide OPPOSITE", "Convex move kare → roll aur glide ULTI direction"),
      slider: t(lang, `Rising from squat: ${angle}° of knee extension`, `Squat se uthna: ${angle}° knee extension`),
    },
  };
  const current = info[mode];

  const ariaLabel =
    mode === "shoulder"
      ? `Shoulder diagram at ${angle} degrees of abduction. ${rollOnly ? "Roll only: the humeral head rises toward the acromion." : "The head rolls up and glides down, staying centred."}`
      : mode === "knee-open"
        ? `Knee diagram, tibia moving on the femur, ${angle} degrees of extension. Roll and glide both anterior.`
        : `Knee diagram, femur moving on the tibia, ${angle} degrees of extension. Roll anterior, glide posterior.`;

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-3 sm:p-4" data-pna-widget="convex-concave">
      <div className="flex flex-wrap gap-2" role="group" aria-label={t(lang, "Choose a joint", "Joint chunein")}>
        {modes.map((item) => (
          <button
            key={item.id}
            type="button"
            aria-pressed={mode === item.id}
            onClick={() => {
              setMode(item.id);
              setRollOnly(false);
            }}
            className={cn(
              "rounded-full px-3 py-1.5 text-xs font-bold transition",
              mode === item.id ? "bg-navy-800 text-white" : "bg-slate-100 text-slate-700 hover:bg-teal-50 hover:text-teal-800",
            )}
          >
            {item.label}
          </button>
        ))}
      </div>

      <svg viewBox="0 0 320 240" className="mx-auto mt-3 block h-auto w-full max-w-md rounded-xl bg-gradient-to-b from-slate-50 to-white" role="img" aria-label={ariaLabel}>
        <defs>
          <marker id={rollMarker} viewBox="0 0 10 10" refX="7" refY="5" markerWidth="5" markerHeight="5" orient="auto-start-reverse">
            <path d="M0,0 L10,5 L0,10 z" fill={ROLL} />
          </marker>
          <marker id={glideMarker} viewBox="0 0 10 10" refX="7" refY="5" markerWidth="5" markerHeight="5" orient="auto-start-reverse">
            <path d="M0,0 L10,5 L0,10 z" fill={GLIDE} />
          </marker>
        </defs>

        {mode === "shoulder" ? (
          <g>
            {/* Scapula + concave glenoid (fixed) */}
            <path d="M146 84 L70 40 L44 176 L146 156 Z" fill="#e2e8f0" stroke="#94a3b8" strokeWidth="1.5" />
            <path d={arc(170, 120, 42, 235, 125, 0)} fill="none" stroke="#475569" strokeWidth="6" strokeLinecap="round" />
            <text x="52" y="198" fontSize="11" fill="#475569" fontWeight="700">
              {t(lang, "Glenoid (concave, fixed)", "Glenoid (concave, fixed)")}
            </text>
            {/* Acromion */}
            <rect x="96" y="58" width="150" height="14" rx="7" fill={impinging ? "#fecdd3" : "#e2e8f0"} stroke={impinging ? "#e11d48" : "#94a3b8"} strokeWidth="1.5" />
            <text x="200" y="52" fontSize="11" fill="#475569" fontWeight="700">
              {t(lang, "Acromion", "Acromion")}
            </text>
            {/* Humerus (moves) */}
            <g transform={`translate(0 ${-lift}) rotate(${-angle} 170 120)`}>
              <rect x="157" y="140" width="26" height="160" rx="10" fill={BONE} stroke={BONE_STROKE} strokeWidth="1.5" />
              <circle cx="170" cy="120" r="38" fill={BONE} stroke={BONE_STROKE} strokeWidth="1.5" />
            </g>
            {!rollOnly ? (
              <g opacity={arrowOpacity}>
                <path d={arc(170, 120, 50, 30, -40, 0)} fill="none" stroke={ROLL} strokeWidth="4" markerEnd={`url(#${rollMarker})`} />
                <line x1="150" y1="98" x2="150" y2="142" stroke={GLIDE} strokeWidth="4" markerEnd={`url(#${glideMarker})`} />
              </g>
            ) : null}
            {impinging ? (
              <text x="160" y="232" textAnchor="middle" fontSize="12" fontWeight="800" fill="#e11d48">
                {t(lang, "⚠ Roll only: the head jams under the acromion!", "⚠ Sirf roll: head acromion ke neeche phans gaya!")}
              </text>
            ) : null}
          </g>
        ) : null}

        {mode === "knee-open" ? (
          <g>
            {/* Femur (fixed, horizontal) */}
            <rect x="-10" y="76" width="185" height="28" rx="10" fill={BONE} stroke={BONE_STROKE} strokeWidth="1.5" />
            <circle cx="175" cy="90" r="34" fill={BONE} stroke={BONE_STROKE} strokeWidth="1.5" />
            <text x="12" y="66" fontSize="11" fill="#475569" fontWeight="700">
              {t(lang, "Femur (convex, fixed)", "Femur (convex, fixed)")}
            </text>
            {/* Tibia (moves) */}
            <g transform={`rotate(${-angle} 175 90)`}>
              <path
                d={`${arc(175, 90, 36, 130, 50, 0)} L 205 124 L 196 140 L 194 290 L 156 290 L 154 140 L 145 124 Z`}
                fill="#e0f2f1"
                stroke="#0f766e"
                strokeWidth="1.5"
              />
              <g opacity={arrowOpacity}>
                <path d={arc(175, 90, 54, 78, 28, 0)} fill="none" stroke={ROLL} strokeWidth="4" markerEnd={`url(#${rollMarker})`} />
                <line x1="208" y1="150" x2="246" y2="150" stroke={GLIDE} strokeWidth="4" markerEnd={`url(#${glideMarker})`} />
              </g>
            </g>
            <text x="12" y="228" fontSize="11" fill="#0f766e" fontWeight="700">
              {t(lang, "Tibia (concave, moving) · front of leg = right", "Tibia (concave, move ho rahi) · leg ka aage = right")}
            </text>
          </g>
        ) : null}

        {mode === "knee-closed" ? (
          <g>
            {/* Tibia (fixed, vertical) */}
            <path
              d={`${arc(160, 120, 36, 130, 50, 0)} L 190 154 L 181 170 L 179 300 L 141 300 L 139 170 L 130 154 Z`}
              fill="#e0f2f1"
              stroke="#0f766e"
              strokeWidth="1.5"
            />
            <text x="196" y="226" fontSize="11" fill="#0f766e" fontWeight="700">
              {t(lang, "Tibia (fixed)", "Tibia (fixed)")}
            </text>
            {/* Femur (moves) */}
            <g transform={`rotate(${-90 + angle} 160 120)`}>
              <rect x="146" y="-60" width="28" height="180" rx="10" fill={BONE} stroke={BONE_STROKE} strokeWidth="1.5" />
              <circle cx="160" cy="120" r="34" fill={BONE} stroke={BONE_STROKE} strokeWidth="1.5" />
            </g>
            <g opacity={arrowOpacity}>
              <path d={arc(160, 120, 48, -62, -12, 1)} fill="none" stroke={ROLL} strokeWidth="4" markerEnd={`url(#${rollMarker})`} />
              <line x1="138" y1="162" x2="96" y2="162" stroke={GLIDE} strokeWidth="4" markerEnd={`url(#${glideMarker})`} />
            </g>
            <text x="12" y="22" fontSize="11" fill="#475569" fontWeight="700">
              {t(lang, "Femur (convex, moving) · front = right", "Femur (convex, move ho rahi) · aage = right")}
            </text>
          </g>
        ) : null}
      </svg>

      <label className="mt-3 block">
        <span className="text-sm font-bold text-navy-800">{current.slider}</span>
        <input
          type="range"
          min={0}
          max={90}
          step={1}
          value={angle}
          onChange={(event) => setAngle(Number(event.target.value))}
          className="mt-2 w-full accent-teal-700"
          aria-label={t(lang, "Move the bone", "Bone ko move karein")}
        />
      </label>

      <div className="mt-3 grid gap-2 text-sm sm:grid-cols-2">
        <p className="rounded-xl bg-amber-50 px-3 py-2 font-bold text-amber-800">● {current.roll}</p>
        <p className="rounded-xl bg-teal-50 px-3 py-2 font-bold text-teal-800">● {current.glide}</p>
      </div>
      <p className="mt-2 text-sm leading-6 text-slate-600">{current.moving}</p>
      <p className="mt-1 text-sm font-extrabold text-navy-800">{current.rule}</p>

      {mode === "shoulder" ? (
        <button
          type="button"
          aria-pressed={rollOnly}
          onClick={() => setRollOnly((value) => !value)}
          className={cn(
            "mt-3 rounded-full border px-3 py-1.5 text-xs font-bold transition",
            rollOnly ? "border-rose-300 bg-rose-50 text-rose-700" : "border-slate-200 bg-white text-slate-700 hover:border-teal-300",
          )}
        >
          {rollOnly
            ? t(lang, "Turn the glide back on", "Glide dobara on karein")
            : t(lang, "What if it only rolled? (switch off the glide)", "Agar sirf roll hota? (glide off karein)")}
        </button>
      ) : null}
    </div>
  );
}
