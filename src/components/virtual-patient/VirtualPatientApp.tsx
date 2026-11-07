"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { Armchair, BedDouble, Crosshair, PersonStanding, RotateCcw } from "lucide-react";
import { ExamRoom, webglAvailable, type PatientPosition, type PickResult } from "@/lib/virtual-patient/engine";
import { NERVE_LABEL } from "@/lib/virtual-patient/anatomy";

const POSITIONS: { id: PatientPosition; label: string; icon: typeof BedDouble }[] = [
  { id: "standing", label: "Standing", icon: PersonStanding },
  { id: "supine", label: "Supine", icon: BedDouble },
  { id: "prone", label: "Prone", icon: BedDouble },
  { id: "sitting", label: "Sitting", icon: Armchair },
  { id: "sidelying", label: "Side-lying", icon: BedDouble },
];

export function VirtualPatientApp() {
  const mountRef = useRef<HTMLDivElement>(null);
  const roomRef = useRef<ExamRoom | null>(null);
  const [progress, setProgress] = useState(0);
  const [ready, setReady] = useState(false);
  const [failed, setFailed] = useState<string | null>(null);
  const [position, setPosition] = useState<PatientPosition>("standing");
  const [picked, setPicked] = useState<PickResult | null>(null);

  useEffect(() => {
    const mount = mountRef.current;
    if (!mount) return;
    if (!webglAvailable()) {
      setFailed("This device or browser can't show 3D graphics. Try Chrome or Edge on a recent phone or computer.");
      return;
    }
    const room = new ExamRoom(mount);
    roomRef.current = room;
    room
      .load("/virtual-patient/patient.glb", setProgress)
      .then(() => setReady(true))
      .catch(() => setFailed("The patient model could not be loaded. Check your connection and refresh the page."));
    return () => {
      room.dispose();
      roomRef.current = null;
    };
  }, []);

  const changePosition = useCallback((next: PatientPosition) => {
    roomRef.current?.setPosition(next);
    setPosition(next);
    setPicked(null);
  }, []);

  // A tap (not a drag) on the patient identifies what was touched.
  const down = useRef<{ x: number; y: number } | null>(null);
  const onPointerDown = (event: React.PointerEvent) => {
    down.current = { x: event.clientX, y: event.clientY };
  };
  const onPointerUp = (event: React.PointerEvent) => {
    const start = down.current;
    down.current = null;
    if (!start || Math.hypot(event.clientX - start.x, event.clientY - start.y) > 6) return;
    setPicked(roomRef.current?.pick(event.clientX, event.clientY) ?? null);
  };

  return (
    <div className="vp-shell overflow-hidden rounded-[28px] border border-[#1d3a5f] bg-[#0a1f3d] shadow-[0_40px_90px_-50px_rgba(5,20,45,0.9)]">
      <div className="relative h-[68vh] min-h-[420px] w-full sm:h-[72vh]">
        <div
          ref={mountRef}
          className="absolute inset-0"
          onPointerDown={onPointerDown}
          onPointerUp={onPointerUp}
          role="img"
          aria-label={`3D patient, ${position}. Drag to turn the view, pinch or scroll to zoom, tap the body to examine.`}
        />
        {!ready && !failed ? (
          <div className="absolute inset-0 grid place-items-center bg-[#0a1f3d]/80 text-white">
            <div className="w-64 text-center">
              <p className="text-sm font-semibold">Bringing the patient in…</p>
              <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-white/10">
                <div className="h-full rounded-full bg-gradient-to-r from-[#2ee6d6] to-[#3cc8ff]" style={{ width: `${Math.max(8, progress * 100)}%` }} />
              </div>
            </div>
          </div>
        ) : null}
        {failed ? (
          <div className="absolute inset-0 grid place-items-center bg-[#0a1f3d] p-6 text-center text-white">
            <div className="max-w-md">
              <p className="text-base font-bold">3D exam room unavailable</p>
              <p className="mt-2 text-sm text-[#a9bfd6]">{failed}</p>
              <a href="/skills" className="nx-btn nx-btn-primary mt-4">Practise in the Clinical Skills Lab</a>
            </div>
          </div>
        ) : null}

        {/* Positions */}
        <div className="pointer-events-none absolute inset-x-0 top-0 flex flex-wrap items-center gap-1.5 p-3">
          {POSITIONS.map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              type="button"
              disabled={!ready}
              onClick={() => changePosition(id)}
              aria-pressed={position === id}
              className={
                "pointer-events-auto inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-bold backdrop-blur transition " +
                (position === id ? "bg-[#2ee6d6] text-[#04263a]" : "bg-[#0a1f3d]/70 text-white hover:bg-[#0a1f3d]/90")
              }
            >
              <Icon className="h-3.5 w-3.5" aria-hidden="true" /> {label}
            </button>
          ))}
          <button
            type="button"
            disabled={!ready}
            onClick={() => roomRef.current?.frameCamera()}
            className="pointer-events-auto ml-auto inline-flex items-center gap-1.5 rounded-full bg-[#0a1f3d]/70 px-3 py-1.5 text-xs font-bold text-white backdrop-blur hover:bg-[#0a1f3d]/90"
          >
            <RotateCcw className="h-3.5 w-3.5" aria-hidden="true" /> Reset view
          </button>
        </div>

        {picked ? (
          <div className="absolute bottom-3 left-3 max-w-sm rounded-2xl bg-[#0a1f3d]/85 p-3 text-xs text-white backdrop-blur" role="status">
            <p className="flex items-center gap-1.5 text-sm font-bold">
              <Crosshair className="h-4 w-4 text-[#2ee6d6]" aria-hidden="true" />
              {picked.landmark ? picked.landmark.id.replace(/-/g, " ") : picked.region} {picked.side !== undefined ? `(${picked.side})` : ""}
            </p>
            <p className="mt-1 text-[#a9bfd6]">
              {picked.covered ? "Under the shorts" : [picked.dermatome ? `Dermatome ${picked.dermatome}` : null, picked.nerve ? NERVE_LABEL[picked.nerve] : null].filter(Boolean).join(" · ")}
            </p>
          </div>
        ) : null}
      </div>
    </div>
  );
}
