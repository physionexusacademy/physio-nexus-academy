/**
 * Teaching choreography: what Dr. Sajjad does, step by step, while he teaches one manual-therapy technique on the 3D patient.
 *
 * A choreography is DATA. It never contains clinical wording of its own: every line he says, and every label drawn on the
 * patient, is a *reference* (`TextRef`) to text that already exists in a PNA Teacher lesson (English + Roman Urdu) or in the
 * regional technique guide. `npm run build:avatar-data` resolves the references into static JSON (public/teacher/choreo/<slug>.json),
 * which the browser fetches; `npm run validate:avatar` fails if a reference does not resolve, a landmark is unknown, or the JSON is stale.
 * Adding a technique = adding one file here that exports a `Choreo`, registering it in index.ts, and running the build.
 *
 * Relative imports with ".ts" so the Node build/validate scripts can load this file. No three.js import: pure data.
 */
import type { PatientPosition, Pose, Side } from "../../virtual-patient/engine.ts";
import type { Overlay } from "../../skills/scene-types.ts";

export type V3 = [number, number, number];
export type Hand = "L" | "R";

/** The fields of a regional technique application (lib/manual-therapy-regional.ts) a line can come from. */
export type RegionalField =
  | "clinicalUse" | "patientPosition" | "therapistPosition" | "stabilization" | "contact" | "forceDirection"
  | "dosage" | "steps" | "reassess" | "mistakes" | "safety";

/**
 * Where an existing line of text lives.
 *  - lesson: a beat of the technique's PNA Teacher lesson (English + Roman Urdu). `step` picks one item of a "steps" beat.
 *  - regional: one line of the regional guide (English only; Roman Urdu mode keeps the clinical wording in English, as the Teacher does).
 */
export type TextRef =
  | { src: "lesson"; beat: number; step?: number }
  | { src: "regional"; field: RegionalField; index?: number };

/**
 * A hand placed on the patient. `at` uses the point syntax of lib/skills/points3d.ts (landmarks, bone heads, offsets in the patient's frame).
 * `palm` and `fingers` are directions in the patient's frame (x: towards the tested side, y: towards the head, z: to the front/anterior),
 * so they stay right whichever way the patient lies.
 */
export type Contact = {
  hand: Hand;
  at: string;
  palm: V3;
  fingers: V3;
  shape?: "flat" | "relaxed" | "cupped";
};

/** A repeated, small movement of the contact (the patient's body follows a little): a glide in a patient-frame direction. */
export type Move = { kind: "glide"; dir: V3; amplitudeMm: number; hz: number };

/**
 * An overlay from the Skills Lab scene system. Its own `label` is a short interface word ("Contact", "Dose"); `note`, when present,
 * points at the existing guide line that explains it, and is shown beside the stage while the step plays (never truncated).
 */
export type LabeledOverlay = Overlay & { note?: { tag: string; ref: TextRef } };

export type Gesture = "none" | "open" | "point" | "care" | "nod";

export type DoctorStep = {
  /** Short name for the step chips (UI wording, not clinical text). */
  chip: string;
  /** What he says, in order. Existing text only. */
  say: TextRef[];
  /** Where he stands. Omit to stay where he is. */
  stand?: { side: "tested" | "other"; at: string; distance: number; face: "patient" | "camera" };
  /** The patient's pose for this step (merged over the starting pose). */
  patient?: Pose;
  /** Hands on the patient. Omit = hands free. */
  contacts?: Contact[];
  /** Trunk lean (degrees) he adds when his hands are on the patient (the data may leave it out: reach is solved automatically). */
  lean?: number;
  move?: Move;
  overlays?: LabeledOverlay[];
  gesture?: Gesture;
  look?: "patient" | "camera" | "hands";
  /** Minimum seconds on this step after he has finished speaking. */
  holdSec?: number;
};

export type Choreo = {
  /** Same as the regional application slug, which is the source of the technique's position/contact/direction text. */
  slug: string;
  lessonSlug: string;
  /** Title shown on the stage (UI wording). */
  title: { en: string; ur: string };
  side: Side;
  position: PatientPosition;
  /** The patient's starting pose. */
  patient: Pose;
  /** Where he walks in from, relative to his first standing place: metres away from the plinth and towards the foot end. */
  enter: { away: number; towardFeet: number };
  /** Clinical review gate. Draft choreography is shown with a visible "draft" badge until the supervising physiotherapist signs it off. */
  review: { status: "draft" | "reviewed"; by?: string; date?: string };
  steps: DoctorStep[];
};
