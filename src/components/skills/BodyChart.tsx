"use client";

import type { BodyPoint } from "@/lib/skills/types";

export type ChartMarker = BodyPoint & { id: string; label?: string; tone?: "default" | "active" | "correct" | "wrong" };

const toneFill: Record<NonNullable<ChartMarker["tone"]>, string> = {
  default: "#0db3aa",
  active: "#f59e0b",
  correct: "#16a34a",
  wrong: "#e5484d",
};

/** Stylised male figure (front or back) with clickable key points. viewBox 200 × 440. */
export function BodyChart({
  view,
  markers = [],
  onPick,
  onMarker,
  className,
  label,
}: {
  view: "front" | "back";
  markers?: ChartMarker[];
  onPick?: (point: { x: number; y: number }) => void;
  onMarker?: (id: string) => void;
  className?: string;
  label?: string;
}) {
  const limb = { stroke: "#cfe0ec", strokeLinecap: "round" as const, fill: "none" };
  return (
    <svg
      viewBox="0 0 200 440"
      className={"h-auto w-full touch-manipulation select-none " + (className ?? "")}
      role="img"
      aria-label={label ?? `Body chart, ${view} view`}
      onClick={(event) => {
        if (!onPick) return;
        const svg = event.currentTarget;
        const box = svg.getBoundingClientRect();
        onPick({ x: ((event.clientX - box.left) / box.width) * 200, y: ((event.clientY - box.top) / box.height) * 440 });
      }}
    >
      <rect x="0" y="0" width="200" height="440" rx="18" fill="#f5fbff" />
      {/* arms */}
      <path d="M62 72 L44 150 L34 226" strokeWidth="19" {...limb} />
      <path d="M138 72 L156 150 L166 226" strokeWidth="19" {...limb} />
      {/* hands */}
      <ellipse cx="31" cy="244" rx="10" ry="16" fill="#cfe0ec" />
      <ellipse cx="169" cy="244" rx="10" ry="16" fill="#cfe0ec" />
      {/* legs */}
      <path d="M84 198 L80 318 L78 410" strokeWidth="24" {...limb} />
      <path d="M116 198 L120 318 L122 410" strokeWidth="24" {...limb} />
      {/* feet */}
      <ellipse cx={view === "front" ? 74 : 80} cy="426" rx="14" ry="8" fill="#cfe0ec" />
      <ellipse cx={view === "front" ? 126 : 120} cy="426" rx="14" ry="8" fill="#cfe0ec" />
      {/* torso */}
      <path d="M62 66 Q100 56 138 66 L134 130 Q132 170 128 206 L72 206 Q68 170 66 130 Z" fill="#dbe9f3" />
      {/* neck + head */}
      <rect x="92" y="48" width="16" height="16" rx="5" fill="#dbe9f3" />
      <ellipse cx="100" cy="30" rx="18" ry="22" fill="#dbe9f3" />
      {view === "front" ? (
        <g stroke="#9fb3c8" strokeWidth="1.2" fill="none">
          <path d="M80 84 Q100 92 120 84" />
          <circle cx="100" cy="166" r="2" fill="#9fb3c8" />
          <path d="M80 196 L100 208 L120 196" />
        </g>
      ) : (
        <g stroke="#9fb3c8" strokeWidth="1.2" fill="none">
          <path d="M100 62 V200" strokeDasharray="3 3" />
          <path d="M74 92 Q86 104 96 96 M126 92 Q114 104 104 96" />
          <path d="M84 206 Q100 214 116 206" />
        </g>
      )}
      <text x="100" y="434" textAnchor="middle" fontSize="9" fontWeight="700" fill="#7690ad">{view === "front" ? "FRONT" : "BACK"}</text>

      {markers
        .filter((marker) => marker.view === view)
        .map((marker) => (
          <g
            key={marker.id}
            role={onMarker ? "button" : undefined}
            tabIndex={onMarker ? 0 : undefined}
            aria-label={marker.label ?? "Key point"}
            onClick={(event) => {
              if (!onMarker) return;
              event.stopPropagation();
              onMarker(marker.id);
            }}
            onKeyDown={(event) => {
              if (onMarker && (event.key === "Enter" || event.key === " ")) {
                event.preventDefault();
                onMarker(marker.id);
              }
            }}
            className={onMarker ? "cursor-pointer" : undefined}
          >
            <circle cx={marker.x} cy={marker.y} r="9" fill={toneFill[marker.tone ?? "default"]} opacity="0.22" />
            <circle cx={marker.x} cy={marker.y} r="4.5" fill={toneFill[marker.tone ?? "default"]} stroke="#fff" strokeWidth="1.5" />
            {marker.label ? (
              <text x={marker.x + (marker.x > 100 ? 9 : -9)} y={marker.y + 3.5} textAnchor={marker.x > 100 ? "start" : "end"} fontSize="9" fontWeight="800" fill="#0a1f3d">
                {marker.label}
              </text>
            ) : null}
          </g>
        ))}
    </svg>
  );
}
