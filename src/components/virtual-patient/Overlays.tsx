"use client";

import { useEffect, useState } from "react";
import * as THREE from "three";
import { motion as motionDef, readMotion, type MotionId } from "@/lib/virtual-patient/exam";
import type { ExamRoom, Side } from "@/lib/virtual-patient/engine";
import type { OverlayState } from "./ExamContext";

/** Re-renders whenever the 3D view renders (camera move, animation). */
function useRoomFrame(room: ExamRoom) {
  const [, setTick] = useState(0);
  useEffect(() => {
    const off = room.onChange(() => setTick((t) => (t + 1) % 1_000_000));
    return () => {
      off();
    };
  }, [room]);
}

const other = (side: Side): Side => (side === "left" ? "right" : "left");
function bonePoint(room: ExamRoom, spec: string, side: Side) {
  const [name, flag] = spec.split(":");
  return room.boneWorld(name, flag === "other" ? other(side) : side);
}

export function SpeechBubble({ room, text }: { room: ExamRoom; text: string | null }) {
  useRoomFrame(room);
  if (!text) return null;
  const head = room.project(room.headWorld().add(new THREE.Vector3(0, 0.06, 0)));
  if (!head.visible) return null;
  const width = room.renderer.domElement.clientWidth || 600;
  // Above his head when there is room under the toolbar; otherwise beside it (on the roomier
  // side, narrowed on phones), so it never covers his face.
  const rightSpace = width - head.x - 36;
  const leftSpace = head.x - 36;
  const sideWidth = Math.min(260, Math.max(rightSpace, leftSpace) - 8);
  const minTop = Math.max(52, room.viewInsetTop + 6);
  const above = head.y - 86 >= minTop || sideWidth < 140;
  const bubbleWidth = above ? Math.min(260, width - 16) : sideWidth;
  const beside = rightSpace >= leftSpace ? head.x + 36 : head.x - 36 - bubbleWidth;
  const left = Math.max(8, Math.min(above ? head.x - 20 : beside, width - bubbleWidth - 8));
  const top = above ? Math.max(minTop, head.y - 86) : Math.max(minTop, head.y - 24);
  return (
    <div className="vp-bubble pointer-events-none absolute z-10" style={{ left, top, width: bubbleWidth }} role="status" aria-live="polite">
      <div className="rounded-2xl rounded-bl-sm bg-white px-3.5 py-2.5 text-[13px] font-semibold leading-5 text-[#0a1f3d] shadow-[0_18px_40px_-18px_rgba(5,20,45,0.8)]">{text}</div>
    </div>
  );
}

/** A 2D goniometer drawn over the joint, arms along the two segments, live reading. */
function Goniometer({ room, spec }: { room: ExamRoom; spec: NonNullable<OverlayState["gonio"]> }) {
  const axis = room.project(bonePoint(room, spec.axis, spec.side));
  const prox = room.project(bonePoint(room, spec.proximal, spec.side));
  const dist = room.project(bonePoint(room, spec.distal, spec.side));
  if (!axis.visible) return null;
  const def = motionDef(spec.motion as MotionId);
  const reading = Math.round(Math.max(0, readMotion(def, room.getPose(), spec.side)));
  const arm = (p: { x: number; y: number }) => {
    const dx = p.x - axis.x, dy = p.y - axis.y;
    const l = Math.hypot(dx, dy) || 1;
    const len = Math.min(150, Math.max(70, l));
    return { x: axis.x + (dx / l) * len, y: axis.y + (dy / l) * len };
  };
  const a = arm(prox), b = arm(dist);
  return (
    <svg className="pointer-events-none absolute inset-0 h-full w-full" aria-hidden="true">
      <line x1={axis.x} y1={axis.y} x2={a.x} y2={a.y} stroke="#e8f1f8" strokeWidth="9" strokeLinecap="round" opacity="0.85" />
      <line x1={axis.x} y1={axis.y} x2={a.x} y2={a.y} stroke="#0a1f3d" strokeWidth="2" strokeLinecap="round" />
      <line x1={axis.x} y1={axis.y} x2={b.x} y2={b.y} stroke="#2ee6d6" strokeWidth="9" strokeLinecap="round" opacity="0.85" />
      <line x1={axis.x} y1={axis.y} x2={b.x} y2={b.y} stroke="#0a1f3d" strokeWidth="2" strokeDasharray="5 4" strokeLinecap="round" />
      <circle cx={axis.x} cy={axis.y} r="17" fill="rgba(255,255,255,0.9)" stroke="#0a1f3d" strokeWidth="2" />
      <circle cx={axis.x} cy={axis.y} r="3" fill="#0a1f3d" />
      <g transform={`translate(${axis.x + 22}, ${axis.y - 26})`}>
        <rect width="64" height="30" rx="10" fill="#0a1f3d" />
        <text x="32" y="20" textAnchor="middle" fontSize="15" fontWeight="800" fill="#2ee6d6">{reading}°</text>
      </g>
    </svg>
  );
}

function Hammer({ room, spec }: { room: ExamRoom; spec: NonNullable<OverlayState["hammer"]> }) {
  const p = room.project(spec.at());
  if (!p.visible) return null;
  return (
    <svg key={spec.key} className="pointer-events-none absolute inset-0 h-full w-full" aria-hidden="true">
      <g className="vp-hammer" style={{ transformOrigin: `${p.x}px ${p.y}px` }}>
        <line x1={p.x + 70} y1={p.y - 58} x2={p.x + 10} y2={p.y - 8} stroke="#6b4a2b" strokeWidth="6" strokeLinecap="round" />
        <ellipse cx={p.x + 6} cy={p.y - 4} rx="16" ry="9" fill="#e5484d" transform={`rotate(-40 ${p.x + 6} ${p.y - 4})`} />
      </g>
      <circle cx={p.x} cy={p.y} r="9" fill="none" stroke="#f5c542" strokeWidth="3" className="vp-ping" />
    </svg>
  );
}

function PushArrow({ room, spec }: { room: ExamRoom; spec: NonNullable<OverlayState["push"]> }) {
  const p = room.project(room.boneWorld(spec.bone, spec.side));
  if (!p.visible) return null;
  return (
    <svg className="pointer-events-none absolute inset-0 h-full w-full" aria-hidden="true">
      <defs>
        <marker id="vp-arrow" viewBox="0 0 10 10" refX="5" refY="5" markerWidth="5" markerHeight="5" orient="auto-start-reverse">
          <path d="M 0 0 L 10 5 L 0 10 z" fill="#f5c542" />
        </marker>
      </defs>
      <line x1={p.x} y1={p.y - 70} x2={p.x} y2={p.y - 14} stroke="#f5c542" strokeWidth="6" markerEnd="url(#vp-arrow)" className="vp-push" />
      <text x={p.x + 12} y={p.y - 52} fontSize="12" fontWeight="800" fill="#0a1f3d" stroke="white" strokeWidth="3" paintOrder="stroke">Resist</text>
    </svg>
  );
}

function TapeLabel({ room, spec }: { room: ExamRoom; spec: NonNullable<OverlayState["tape"]> }) {
  const p = room.project(spec.at());
  if (!p.visible) return null;
  return (
    <div className="pointer-events-none absolute z-10 -translate-x-1/2 -translate-y-full rounded-xl bg-[#f5c542] px-2.5 py-1 text-sm font-extrabold text-[#2a1d00] shadow" style={{ left: p.x, top: p.y - 10 }}>
      {spec.text}
    </div>
  );
}

export function Overlays({ room, state }: { room: ExamRoom; state: OverlayState }) {
  useRoomFrame(room);
  return (
    <>
      {state.gonio ? <Goniometer room={room} spec={state.gonio} /> : null}
      {state.hammer ? <Hammer room={room} spec={state.hammer} /> : null}
      {state.push ? <PushArrow room={room} spec={state.push} /> : null}
      {state.tape ? <TapeLabel room={room} spec={state.tape} /> : null}
    </>
  );
}
