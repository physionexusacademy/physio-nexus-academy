import type { Need } from "./quality.ts";
import type { Bi, Metric } from "./types.ts";

/**
 * A camera specification: everything the Form Check needs to know about ONE exercise, as data. One per neck and back exercise of the library
 * (cervical, thoracic, lumbar), checked against the library by scripts/validate-formcheck.ts: every joint that moves in the exercise's own 3D
 * motion must be listed here with how the camera covers it, so a joint cannot be forgotten, and an exercise cannot be added without a decision.
 *
 * Every number in a spec is PROVISIONAL: it is a starting value taken from the exercise's own demonstration. The validation study (docs/camera-form-check)
 * sets what the tool may show; until a movement type passes its pre-specified rules, patients see no angle for it, only counts, timers and position cues.
 */
export type Region = "cervical" | "thoracic" | "lumbar";
/** A: the person sits or stands (angles can be offered once validated). B: lying, prone, side-lying or on all fours (counts, timers and position cues; an angle only if validated). */
export type Tier = "A" | "B";
export type Posture = "seated" | "standing" | "supine" | "prone" | "side-lying" | "quadruped";
/**
 * "standard": an upright person seen from the front or the side, the view the pose model was trained on.
 * "to-confirm": a lying, prone, all-fours or end-on view: the choice is a design hypothesis until the feasibility trial (docs/camera-form-check) shows the model
 * finds the person there; the fall-back is stated in the spec's `limits`.
 */
export type Feasibility = "standard" | "to-confirm";

/**
 * Where the phone goes. Side = the person's side to the camera (flexion and extension are seen); front = facing the camera (side bends and rotations);
 * feet = from the feet end of a person lying down, looking towards the head; head = from the head end of a person lying down (the axis of rotation
 * points at the camera, so a turn of the trunk about its long axis shows as the shoulder line turning in the picture).
 */
export type Placement = {
  view: "side" | "front" | "feet" | "head";
  orientation: "portrait" | "landscape";
  /** metres from the person to the phone: [nearest, farthest] */
  distanceM: [number, number];
  /** height of the lens above the floor in cm: [lowest, highest] (the lens should be level with the middle of what is being watched) */
  heightCm: [number, number];
  subject: "head-to-hips" | "head-to-knees" | "full-body" | "full-body-lying" | "shoulders-to-hands";
  /** what the set-up screen says, one or two short sentences */
  how: Bi;
};

/**
 * How the camera covers one joint of the exercise:
 *  - measured: a metric reads the joint's own angle (or a direct, simple stand-in for it, said in `why`); a number is shown only once the movement type has passed validation;
 *  - tracked: the movement is seen and followed, but the joint's own angle is not read (a position or a count instead);
 *  - not_measurable: one camera cannot see it (said in `why`); the tool says so instead of guessing.
 * role "mover": the joint moves in the exercise's demonstration; "watch": the joint is watched for a compensation (a shoulder shrug, a leaning trunk).
 * `joint` is the library's own key ("neck", "neck:a", "shoulder:o", "trunk:t": a = away from the tested side, t = towards it, o = the other limb), `axes` its axes of movement.
 * `pass` 2: covered by the second view only.
 */
export type Coverage = "measured" | "tracked" | "not_measurable";
export type JointCover = { joint: string; axes: string[]; role: "mover" | "watch"; coverage: Coverage; metric?: string; pass?: 1 | 2; why?: string };

/**
 * A short cue, spoken and shown while the person exercises. `change_over`: the SIZE of the change from the person's own start position stays above `value` for
 * `forMs` (degrees, or a fraction of the stated length for ratios); `below`: the reading stays under `value`. Wording is checked by lintCue. A cue may keep a
 * position or keep the movement inside a comfortable range; it never asks for more.
 */
export type CueRule = { id: string; metric: string; when: "change_over" | "below"; value: number; forMs: number; text: Bi; pass?: 1 | 2 };

/**
 * What drives the repetition count or the hold timer.
 *  - reps: a repetition counts when the metric goes `enter` of the way from rest to target and back (see RepCounter); `holdMs` is a hold needed at the end;
 *  - hold-reach: a stretch or a lifted position: the time during which the change from the start position stays at or beyond `target` (HoldTimer);
 *  - hold-steady: a position that must not change (a plank): the time during which the change from the start position stays within `target` (the band).
 * `reference: "baseline"`: the zero is the person's own neutral position (taken by the Calibrator) and `target` is the CHANGE from it (a small movement cannot
 * be judged against a fixed number); "absolute": rest and target are readings of the metric. `abs`: a movement to either side counts the same.
 * `movementsPerRep`: how many counted movements make one repetition (2 for cat-camel: one to each end).
 */
export type Primary = {
  metric: string;
  mode: "reps" | "hold-reach" | "hold-steady";
  reference: "baseline" | "absolute";
  rest: number;
  target: number;
  abs?: boolean;
  holdMs?: number;
  movementsPerRep?: number;
};

/** A second short pass from another side or end, for what the first view cannot see (a pelvis that drops, knees that fall in, the other limb). */
export type SecondPass = { placement: Placement; why: Bi; need: Need[]; metrics: Metric[] };

export type CameraSpec = {
  id: string;
  region: Region;
  tier: Tier;
  posture: Posture;
  feasibility: Feasibility;
  /** one side at a time (the person says which side they exercise; "tested:" and "other:" references follow it) */
  sided: boolean;
  placement: Placement;
  second?: SecondPass;
  need: Need[];
  /** the face model gives the head's rotation, tilt and nod: "required" when the primary metric uses it, "optional" where only a watch or an extra reading does */
  needFace?: "required" | "optional";
  metrics: Metric[];
  primary: Primary;
  joints: JointCover[];
  cues: CueRule[];
  provisional: true;
  /** what the camera does not do for this exercise, in plain words (shown in the summary and used in the committee documents) */
  limits: Bi;
};
