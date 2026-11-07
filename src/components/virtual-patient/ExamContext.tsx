"use client";

import { createContext, useContext } from "react";
import type * as THREE from "three";
import type { ExamRoom, Side } from "@/lib/virtual-patient/engine";
import type { VirtualCase } from "@/lib/virtual-patient/cases";
import type { ExamEvent } from "@/lib/virtual-patient/session";

export type Lang = "en" | "ur";
export type ExamMode = "guided" | "osce";

/** What is drawn over the 3D view. */
export type OverlayState = {
  gonio?: { axis: string; proximal: string; distal: string; side: Side; motion: string };
  hammer?: { at: () => THREE.Vector3; key: number };
  push?: { bone: string; side: Side; text: string };
  tape?: { at: () => THREE.Vector3; text: string };
};

export type ExamApi = {
  room: ExamRoom;
  caseData: VirtualCase;
  mode: ExamMode;
  lang: Lang;
  events: ExamEvent[];
  log: (event: ExamEvent) => void;
  /** The patient speaks (speech bubble over his head). */
  say: (text: string) => void;
  setOverlay: (next: OverlayState | ((current: OverlayState) => OverlayState)) => void;
};

export const ExamContext = createContext<ExamApi | null>(null);
export function useExam() {
  const api = useContext(ExamContext);
  if (!api) throw new Error("useExam outside ExamContext");
  return api;
}
