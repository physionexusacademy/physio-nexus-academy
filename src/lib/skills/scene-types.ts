/**
 * Skills Lab "scenes": 3D demonstrations that are not a joint movement with a goniometer (see demo3d.ts for those) —
 * a glowing dermatome, a nerve's course, a reflex hammer strike, a pulse being taken, a plumb line, a tape measure,
 * a palpated landmark, a balance test. A scene is pure data plus small functions of the loop position `u` (0–1);
 * the player (components/skills/Scene3DPlayer.tsx) poses the patient, glows the zone and draws the overlays.
 * No three.js import here, so the skills build and validator can read it.
 */
import type { FaceState, PatientPosition, Pose, Side } from "../virtual-patient/engine.ts";

export type Tone = "cyan" | "amber" | "magenta" | "green" | "red" | "white";

/** What a scene's functions are told: the tested side, the loop position, elapsed time and the chosen options. */
export type Ctx = { side: Side; u: number; ms: number; opt: Record<string, string> };
export type Fn<T> = T | ((c: Ctx) => T);
/** Visible from u0 to u1 (fades at the edges). Omitted = always. */
export type When = [number, number];

export type Overlay =
  /** A pulsing ring on a point. */
  | { t: "beacon"; at: string; label?: Fn<string>; tone?: Tone; when?: When }
  /** A fingertip touching a point: tap, press or stroke towards `to`. */
  | { t: "touch"; at: string; style?: "tap" | "press" | "stroke"; to?: string; label?: Fn<string>; tone?: Tone; when?: When }
  /** A glowing ribbon through points (a nerve's course, a muscle's line). `flow` animates a pulse along it. */
  | { t: "path"; pts: string[]; label?: Fn<string>; tone?: Tone; flow?: boolean; width?: number; when?: When }
  /** A straight line between points: a tape, a plumb line or a reference. `grow` draws it out from `from`. */
  | { t: "line"; from: string; to: string; label?: string | ((c: Ctx, metres: number) => string); tone?: Tone; dashed?: boolean; grow?: boolean; when?: When }
  /** An arrow from `at` towards `to`. */
  | { t: "arrow"; at: string; to: string; label?: Fn<string>; tone?: Tone; when?: When }
  /** The angle at `vertex` between two points, with a live reading. */
  | { t: "angle"; vertex: string; a: string; b: string; label?: string | ((c: Ctx, degrees: number) => string); tone?: Tone; when?: When }
  /** A reflex hammer swinging in and striking `at` when the window ends. */
  | { t: "hammer"; at: string; when: When }
  /** A ring round a limb or the trunk at `at`, in the plane across the axis `along[0] → along[1]` (girth). `r` is its radius in metres. */
  | { t: "ring"; at: string; along: [string, string]; r: Fn<number>; label?: string | ((c: Ctx, circumference: number) => string); tone?: Tone; when?: When }
  /** A small device drawn on a point: a pulse-oximeter clip, a thermometer, a BP cuff band along two points, a Doppler probe. */
  | { t: "device"; kind: "clip" | "thermo" | "probe" | "cuff" | "meter"; at: string; to?: string; label?: Fn<string>; when?: When }
  /** A plumb line from the floor through reference points, with each point's offset from the line. */
  | { t: "plumb"; from: string; marks: { at: string; label: string }[]; when?: When };

/** On-screen read-outs (HTML panels over the 3D view). */
export type Hud =
  | { t: "stat"; label: string; value: Fn<string>; sub?: Fn<string>; tone?: Tone; when?: When; at?: "tl" | "tr" | "bl" | "br" }
  | { t: "bar"; label: string; value: (c: Ctx) => number; min: number; max: number; unit?: string; marks?: { at: number; label: string }[]; goodFrom?: number; goodTo?: number; when?: When; at?: "tl" | "tr" | "bl" | "br" }
  | { t: "wave"; kind: "ecg" | "pulse" | "resp" | "spo2"; bpm: Fn<number>; label?: string; when?: When; at?: "tl" | "tr" | "bl" | "br" }
  | { t: "scale"; label: string; min: number; max: number; step?: number; value: (c: Ctx) => number; words?: Record<number, string>; when?: When; at?: "tl" | "tr" | "bl" | "br" }
  | { t: "timer"; label: string; seconds: (c: Ctx) => number; target?: number; when?: When; at?: "tl" | "tr" | "bl" | "br" }
  | { t: "curve"; label: string; resist: (a: number, c: Ctx) => number; angle: (c: Ctx) => number; when?: When; at?: "tl" | "tr" | "bl" | "br" };

export type SceneOption = { id: string; label: string; choices: { id: string; label: string }[]; initial?: string };

/** Simple 3D props placed in the room (chair, wall, foam pad, cones, a walkway, a dynamometer). */
export type Prop = { kind: "chair" | "wall" | "foam" | "cones" | "walkway" | "block"; at?: [number, number, number]; size?: number };

export type Scene = {
  /** Theme and header label only. */
  kind: "zone" | "nerve" | "reflex" | "tone" | "coordination" | "vitals" | "posture" | "measure" | "landmark" | "task";
  /** Label top-left (default: the item's title). */
  title?: string;
  position: PatientPosition;
  down?: "tested" | "other";
  /** Slides a lying patient towards the foot end (metres). */
  shift?: number;
  /** A point that stays where it started on the floor (standing tests). */
  planted?: string;
  /** Loop windows in which `planted` holds (default: the whole loop). The body stays where each window leaves it. */
  plantedWhen?: [number, number][];
  /** Hide the treatment plinth (walking and standing tests). */
  hidePlinth?: boolean;
  /** Length of one loop. */
  loopMs: number;
  /** Camera: aim, distance (metres) and direction [towards the tested side, towards the head, towards the front]. `zone: true` aims at the glowing zone. */
  frame: { focus: string; zoom: number; view: [number, number, number]; zone?: boolean; around?: string[] };
  /** Pose over the loop, merged over the position's resting posture. */
  pose?: (side: Side, u: number, c: Ctx) => Pose;
  /** Moves the whole patient (walking): metres in the patient's x (left) / z (front) and a turn in degrees. */
  root?: (side: Side, u: number, c: Ctx) => { dx?: number; dz?: number; ry?: number };
  /** Face (jaw, blink) over the loop. */
  face?: (u: number, c: Ctx) => Partial<FaceState>;
  /** A dermatome or nerve territory glowing on the skin of the tested side. */
  zone?: { dermatomes?: string[]; nerves?: string[]; color?: string; when?: When };
  /** What is happening, by stage (shown as the caption and as step chips). */
  beats: { to: number; text: Fn<string>; chip?: string }[];
  overlays?: Overlay[];
  hud?: Hud[];
  options?: SceneOption[];
  props?: Prop[];
  /** Show the loop slider as a scrubber with this label (default "Move through it yourself"). */
  scrub?: string;
};
