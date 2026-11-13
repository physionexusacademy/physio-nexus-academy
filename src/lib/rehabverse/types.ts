/**
 * PNA RehabVerse — exercise library data model.
 *
 * Every exercise carries (1) the clinical information a physiotherapist needs to choose it,
 * (2) patient-friendly instructions in English and Roman Urdu (natural spoken Urdu–English mix),
 * and (3) a real 3D movement: poses over time for the Virtual Patient model.
 * Content is a DRAFT for clinical review by the supervising physiotherapist before patient use.
 */
import type { PatientPosition } from "../virtual-patient/engine.ts";
import type { Parts } from "../virtual-patient/parts.ts";

/** English and Roman Urdu (a natural spoken mix, as people actually talk in Pakistan). */
export type Bi = { en: string; ru: string };

export type Region = "cervical" | "thoracic" | "lumbar" | "shoulder" | "elbow_hand" | "hip" | "knee" | "ankle_foot";
export const REGIONS: Region[] = ["cervical", "thoracic", "lumbar", "shoulder", "elbow_hand", "hip", "knee", "ankle_foot"];
export const REGION_LABEL: Record<Region, Bi> = {
  cervical: { en: "Neck (cervical)", ru: "Gardan (cervical)" },
  thoracic: { en: "Mid-back (thoracic)", ru: "Peeth ka upar wala hissa (thoracic)" },
  lumbar: { en: "Low back & core", ru: "Kamar aur core" },
  shoulder: { en: "Shoulder", ru: "Kandha (shoulder)" },
  elbow_hand: { en: "Elbow, wrist & hand", ru: "Kohni, kalai aur haath" },
  hip: { en: "Hip & pelvis", ru: "Kulha (hip) aur pelvis" },
  knee: { en: "Knee", ru: "Ghutna (knee)" },
  ankle_foot: { en: "Ankle & foot", ru: "Takhna aur paon" },
};

export type Level = "beginner" | "intermediate" | "advanced";
export const LEVELS: Level[] = ["beginner", "intermediate", "advanced"];
export const LEVEL_LABEL: Record<Level, Bi> = {
  beginner: { en: "Beginner", ru: "Beginner (shuru ke)" },
  intermediate: { en: "Intermediate", ru: "Intermediate (darmiyani)" },
  advanced: { en: "Advanced", ru: "Advanced (mushkil)" },
};

export type Category =
  | "mobility" | "stretch" | "strength" | "stabilisation" | "endurance" | "balance" | "functional"
  | "postural" | "tendon_gliding" | "proprioception" | "gait";
export const CATEGORY_LABEL: Record<Category, Bi> = {
  mobility: { en: "Mobility", ru: "Mobility (harkat)" },
  stretch: { en: "Flexibility / stretch", ru: "Stretch (lachak)" },
  strength: { en: "Strengthening", ru: "Strengthening (taaqat)" },
  stabilisation: { en: "Stabilisation / control", ru: "Stabilisation (control)" },
  endurance: { en: "Endurance", ru: "Endurance (stamina)" },
  balance: { en: "Balance", ru: "Balance (tawazun)" },
  functional: { en: "Functional training", ru: "Functional (rozmarra ki harkat)" },
  postural: { en: "Posture & scapular control", ru: "Posture aur scapula control" },
  tendon_gliding: { en: "Tendon / nerve gliding", ru: "Tendon gliding" },
  proprioception: { en: "Proprioception", ru: "Proprioception (jism ka ehsaas)" },
  gait: { en: "Gait-related", ru: "Chalne se mutaliq" },
};

/** Where the patient is, as the demonstrator. The first five are the engine's own positions. */
export type ExPosition = PatientPosition | "quadruped" | "kneeling";
export type Surface = "floor" | "plinth";

/** One stage of a repetition: move to a pose, then optionally hold. The body returns to the start afterwards. */
export type Move = {
  to: Parts;
  ms: number;
  /** Hold at the end of this stage (ms). */
  hold?: number;
  /** Breathing cue during this stage. */
  breath?: "in" | "out" | "hold";
  /** What the guide says at this stage (shown as a subtitle). */
  say?: Bi;
};

export type Prop =
  | { kind: "wall"; gap?: number; at?: "back" | "front" }                  // behind (default) or in front of the patient
  | { kind: "step"; height: number; at?: "front" | "side"; gap?: number }   // height 0 = just under the tested foot
  | { kind: "chair" }                                                   // seat under the pelvis (sit-to-stand)
  | { kind: "weight"; at: "wrist" | "ankle"; kg?: number }
  | { kind: "ball"; at: "hand" | "knees" }                              // squeeze ball (hand grip, or held between the knees)
  | { kind: "table"; height?: number; reach?: number }                                  // in front of the patient (leaning, forearm rest)
  | { kind: "wand" }                                                    // stick held in both hands
  | { kind: "bolster" }                                                 // rolled towel under the tested knee
  | { kind: "roller"; along: "thoracic" | "lumbar" }                    // foam roller under the spine
  | { kind: "band"; from: "wrist" | "ankle" | "thigh" | "knee"; anchor: [number, number, number]; both?: boolean }
  | { kind: "towel" };

export type View = "front" | "side" | "back" | "angle" | "feet";

export type Motion = {
  position: ExPosition;
  surface?: Surface;
  /** Pose at the start. Parts are named for the tested side ("knee") and the other side ("knee:o"). */
  start: Parts;
  moves: Move[];
  /** Time to come back to the start (ms). */
  returnMs?: number;
  /** Pause between repetitions (ms). */
  restMs?: number;
  /** One-sided exercises can be shown on either side. */
  sided: boolean;
  /**
   * What stays planted while the body moves. Standing exercises default to both feet (ankles held in
   * place, so squats, lunges and step-ups look planted); "bone" can be the ball of the foot for a heel raise.
   * stance: "both" (default), "other" (the non-tested leg) or "tested".
   */
  anchor?: false | { bone?: string; stance?: "both" | "other" | "tested" };
  /** Lifts the demonstrator onto a raised surface (metres), e.g. standing on a step. */
  raise?: number;
  /** Slides a lying demonstrator towards the foot end (metres), e.g. hips at the edge of the plinth. */
  shift?: number;
  /** "start": rest on the surface once, then stay put (a leg may hang over the edge). Default: re-settle every frame. */
  settle?: "frame" | "start";
  /** Close-up: camera distance in metres, centred on `focus` (hands, neck). */
  close?: number;
  props?: Prop[];
  /** Muscles worked: bones that glow while the muscle works (e.g. "upperleg01" for the quadriceps). */
  glow?: { bones: string[]; sides?: "tested" | "other" | "both" };
  /** Force or resistance arrows (direction in the patient's frame: [towards the tested side, up, front]). */
  arrows?: { bone: string; dir: [number, number, number]; side?: "tested" | "other"; when?: "move" | "hold" | "always" }[];
  /** Camera aim (a point in the Skills Lab point syntax), distance multiplier and best view. */
  focus?: string;
  zoom?: number;
  view?: View;
  /** Optional faulty version for "common mistakes". */
  mistake?: { text: Bi; moves: Move[]; start?: Parts };
};

export type Dosage = {
  sets: number;
  reps?: number;
  holdSeconds?: number;
  restSeconds: number;
  durationSeconds?: number;
  frequency: string;
  side: "both" | "each" | "alternate";
};

export type ExerciseDef = {
  id: string;
  name: Bi;
  regions: Region[];
  category: Category;
  level: Level;
  /** Target muscles or movement function. */
  targets: string;
  summary: Bi;
  indications: string[];
  /** Clinician-facing. Exercise is not suitable (or needs modification) if any of these apply. */
  contraindications: string[];
  /** Patient-facing safety lines. */
  safety: Bi[];
  equipment?: string;
  setup: Bi;
  steps: Bi[];
  breathing: Bi;
  mistakes: Bi[];
  dosage: Dosage;
  progressions: string[];
  regressions: string[];
  /** Keys into REFERENCES (src/lib/rehabverse/references.ts). */
  evidence: string[];
  motion: Motion;
};

/** A rehabilitation prescription line chosen by the clinician (stored in the database). */
export type PrescribedExercise = {
  exercise_id: string;
  exercise_title: string;
  sets?: number | null;
  reps?: number | null;
  hold_seconds?: number | null;
  rest_seconds?: number | null;
  duration_seconds?: number | null;
  side: "both" | "left" | "right" | "alternate";
  frequency?: string | null;
  precautions?: string | null;
  notes?: string | null;
};
