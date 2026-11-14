/** The resolved (built) form of a choreography, as stored in public/teacher/choreo/<slug>.json. Types only. */
import type { Choreo, DoctorStep, LabeledOverlay } from "./types.ts";

export type Line = { en: string; ur: string; src: string; urFallback?: true };
export type Note = { tag: string; text: Line };
export type BuiltLink = { href: string; label: { en: string; ur: string } };
export type BuiltStep = Omit<DoctorStep, "say" | "overlays" | "link"> & { say: Line[]; overlays: Omit<LabeledOverlay, "note">[]; notes: Note[]; link?: BuiltLink };
export type BuiltChoreo = Omit<Choreo, "steps"> & { lessonTitle: string; steps: BuiltStep[] };
