/**
 * Virtual Patient — what can be examined, and how a case answers each test.
 * A case only lists what is abnormal; everything else falls back to a healthy adult.
 */
import type { JointAngles, JointId, PatientPosition, Pose, Side } from "./engine";
import type { CutaneousNerve, Dermatome, SurfaceInfo } from "./anatomy";

/* ------------------------------------------------------------------ */
/* Goniometry                                                          */
/* ------------------------------------------------------------------ */

export type MotionId =
  | "shoulder-flexion" | "shoulder-extension" | "shoulder-abduction" | "shoulder-er" | "shoulder-ir"
  | "elbow-flexion" | "wrist-flexion" | "wrist-extension"
  | "hip-flexion" | "hip-extension" | "hip-abduction" | "hip-ir" | "hip-er"
  | "knee-flexion" | "knee-extension" | "ankle-df" | "ankle-pf";

export type MotionDef = {
  id: MotionId;
  label: string;
  joint: JointId;
  position: PatientPosition;
  normal: number;
  endFeel: string;
  /** Pose for a given angle (degrees of this motion). */
  pose: (side: Side, angle: number) => Pose;
  /** Goniometer: axis bone and the bones the two arms point to (":other" = opposite side). */
  gonio: { axis: string; proximal: string; distal: string };
};

/** Reads the current angle of a motion back from the pose (for the goniometer display). */
export function readMotion(def: MotionDef, pose: Pose, side: Side) {
  const angles = (pose[`${def.joint}.${side}` as keyof Pose] ?? {}) as JointAngles;
  switch (def.id) {
    case "shoulder-flexion": case "elbow-flexion": case "hip-flexion": case "knee-flexion": return angles.flex ?? 0;
    case "shoulder-extension": case "hip-extension": case "knee-extension": return -(angles.flex ?? 0);
    case "wrist-flexion": return (pose[`wrist.${side}`] as JointAngles | undefined)?.flex ?? 0;
    case "wrist-extension": return -((pose[`wrist.${side}`] as JointAngles | undefined)?.flex ?? 0);
    case "shoulder-abduction": case "hip-abduction": return angles.abd ?? 0;
    case "shoulder-er": case "hip-er": return -(angles.rot ?? 0);
    case "shoulder-ir": case "hip-ir": return angles.rot ?? 0;
    case "ankle-df": return angles.flex ?? 0;
    case "ankle-pf": return -(angles.flex ?? 0);
  }
}

const k = <T extends string>(joint: T, side: Side) => `${joint}.${side}` as `${T}.${Side}`;

export const MOTIONS: MotionDef[] = [
  { id: "shoulder-flexion", label: "Shoulder flexion", joint: "shoulder", position: "supine", normal: 180, endFeel: "Firm (tissue stretch)", pose: (s, a) => ({ [k("shoulder", s)]: { flex: a } }), gonio: { axis: "upperarm01", proximal: "spine02", distal: "lowerarm01" } },
  { id: "shoulder-extension", label: "Shoulder extension", joint: "shoulder", position: "prone", normal: 60, endFeel: "Firm (tissue stretch)", pose: (s, a) => ({ [k("shoulder", s)]: { flex: -a } }), gonio: { axis: "upperarm01", proximal: "spine02", distal: "lowerarm01" } },
  { id: "shoulder-abduction", label: "Shoulder abduction", joint: "shoulder", position: "supine", normal: 180, endFeel: "Firm (tissue stretch)", pose: (s, a) => ({ [k("shoulder", s)]: { abd: a, rot: a > 90 ? -(a - 90) * 0.5 : 0 } }), gonio: { axis: "upperarm01", proximal: "spine02", distal: "lowerarm01" } },
  { id: "shoulder-er", label: "Shoulder external rotation (90° abduction)", joint: "shoulder", position: "supine", normal: 90, endFeel: "Firm (capsular)", pose: (s, a) => ({ [k("shoulder", s)]: { abd: 90, rot: -a }, [k("elbow", s)]: { flex: 90 } }), gonio: { axis: "lowerarm01", proximal: "upperarm01", distal: "wrist" } },
  { id: "shoulder-ir", label: "Shoulder internal rotation (90° abduction)", joint: "shoulder", position: "supine", normal: 70, endFeel: "Firm (capsular)", pose: (s, a) => ({ [k("shoulder", s)]: { abd: 90, rot: a }, [k("elbow", s)]: { flex: 90 } }), gonio: { axis: "lowerarm01", proximal: "upperarm01", distal: "wrist" } },
  { id: "elbow-flexion", label: "Elbow flexion", joint: "elbow", position: "supine", normal: 150, endFeel: "Soft (muscle approximation)", pose: (s, a) => ({ [k("elbow", s)]: { flex: a } }), gonio: { axis: "lowerarm01", proximal: "upperarm01", distal: "wrist" } },
  { id: "wrist-flexion", label: "Wrist flexion", joint: "wrist", position: "sitting", normal: 80, endFeel: "Firm", pose: (s, a) => ({ [k("elbow", s)]: { flex: 80 }, [k("wrist", s)]: { flex: a } }), gonio: { axis: "wrist", proximal: "lowerarm01", distal: "finger3-1" } },
  { id: "wrist-extension", label: "Wrist extension", joint: "wrist", position: "sitting", normal: 70, endFeel: "Firm", pose: (s, a) => ({ [k("elbow", s)]: { flex: 80 }, [k("wrist", s)]: { flex: -a } }), gonio: { axis: "wrist", proximal: "lowerarm01", distal: "finger3-1" } },
  { id: "hip-flexion", label: "Hip flexion (knee bent)", joint: "hip", position: "supine", normal: 120, endFeel: "Soft (thigh on abdomen)", pose: (s, a) => ({ [k("hip", s)]: { flex: a }, [k("knee", s)]: { flex: Math.min(130, a + 10) } }), gonio: { axis: "upperleg01", proximal: "upperarm01", distal: "lowerleg01" } },
  { id: "hip-extension", label: "Hip extension", joint: "hip", position: "prone", normal: 30, endFeel: "Firm", pose: (s, a) => ({ [k("hip", s)]: { flex: -a } }), gonio: { axis: "upperleg01", proximal: "upperarm01", distal: "lowerleg01" } },
  { id: "hip-abduction", label: "Hip abduction", joint: "hip", position: "supine", normal: 45, endFeel: "Firm", pose: (s, a) => ({ [k("hip", s)]: { abd: a } }), gonio: { axis: "upperleg01", proximal: "upperleg01:other", distal: "lowerleg01" } },
  { id: "hip-ir", label: "Hip internal rotation (sitting)", joint: "hip", position: "sitting", normal: 45, endFeel: "Firm", pose: (s, a) => ({ [k("hip", s)]: { flex: 88, rot: a } }), gonio: { axis: "lowerleg01", proximal: "upperleg01", distal: "foot" } },
  { id: "hip-er", label: "Hip external rotation (sitting)", joint: "hip", position: "sitting", normal: 45, endFeel: "Firm", pose: (s, a) => ({ [k("hip", s)]: { flex: 88, rot: -a } }), gonio: { axis: "lowerleg01", proximal: "upperleg01", distal: "foot" } },
  { id: "knee-flexion", label: "Knee flexion", joint: "knee", position: "supine", normal: 135, endFeel: "Soft (calf on thigh)", pose: (s, a) => ({ [k("knee", s)]: { flex: a }, [k("hip", s)]: { flex: a * 0.6 } }), gonio: { axis: "lowerleg01", proximal: "upperleg01", distal: "foot" } },
  { id: "knee-extension", label: "Knee extension", joint: "knee", position: "supine", normal: 0, endFeel: "Firm", pose: (s, a) => ({ [k("knee", s)]: { flex: -a } }), gonio: { axis: "lowerleg01", proximal: "upperleg01", distal: "foot" } },
  { id: "ankle-df", label: "Ankle dorsiflexion", joint: "ankle", position: "supine", normal: 20, endFeel: "Firm", pose: (s, a) => ({ [k("ankle", s)]: { flex: a } }), gonio: { axis: "foot", proximal: "lowerleg01", distal: "toe5-1" } },
  { id: "ankle-pf", label: "Ankle plantarflexion", joint: "ankle", position: "supine", normal: 50, endFeel: "Firm", pose: (s, a) => ({ [k("ankle", s)]: { flex: -a } }), gonio: { axis: "foot", proximal: "lowerleg01", distal: "toe5-1" } },
];
export const motion = (id: MotionId) => MOTIONS.find((m) => m.id === id)!;

/* ------------------------------------------------------------------ */
/* Manual muscle testing                                              */
/* ------------------------------------------------------------------ */

export type MuscleTestId =
  | "shoulder-abd" | "elbow-flex" | "wrist-ext" | "elbow-ext" | "grip" | "finger-abd"
  | "hip-flex" | "hip-abd" | "knee-ext" | "knee-flex" | "ankle-df" | "ehl" | "ankle-pf";

export type MuscleTestDef = {
  id: MuscleTestId;
  label: string;
  muscles: string;
  root: string;
  nerve: string;
  position: PatientPosition;
  /** side-lying tests are done lying on the other side */
  down?: "other";
  /** Rest pose, test (held) pose, and how far the limb gives way under resistance. */
  rest: (side: Side) => Pose;
  hold: (side: Side) => Pose;
  give: (side: Side, fraction: number) => Pose;
  /** Where the examiner pushes (bone), and the direction in words. */
  push: { bone: string; text: string };
};

const blendAngles = (a: JointAngles, b: JointAngles, t: number): JointAngles => ({
  flex: (a.flex ?? 0) + ((b.flex ?? 0) - (a.flex ?? 0)) * t,
  abd: (a.abd ?? 0) + ((b.abd ?? 0) - (a.abd ?? 0)) * t,
  rot: (a.rot ?? 0) + ((b.rot ?? 0) - (a.rot ?? 0)) * t,
});
/** Builds rest/hold/give from one joint's rest and hold angles (plus fixed extras). */
function mmt(joint: JointId, rest: JointAngles, hold: JointAngles, extras: (s: Side) => Pose = () => ({})) {
  return {
    rest: (s: Side) => ({ ...extras(s), [k(joint, s)]: rest }),
    hold: (s: Side) => ({ ...extras(s), [k(joint, s)]: hold }),
    give: (s: Side, t: number) => ({ ...extras(s), [k(joint, s)]: blendAngles(hold, rest, t) }),
  };
}

export const MUSCLE_TESTS: MuscleTestDef[] = [
  { id: "shoulder-abd", label: "Shoulder abduction", muscles: "Deltoid (middle), supraspinatus", root: "C5", nerve: "Axillary", position: "sitting", ...mmt("shoulder", { abd: 5, flex: 18 }, { abd: 88 }), push: { bone: "lowerarm01", text: "down on the arm just above the elbow" } },
  { id: "elbow-flex", label: "Elbow flexion", muscles: "Biceps brachii, brachialis", root: "C5–C6", nerve: "Musculocutaneous", position: "sitting", ...mmt("elbow", { flex: 30 }, { flex: 90 }, (s) => ({ [k("shoulder", s)]: { flex: 5 } })), push: { bone: "wrist", text: "the forearm into extension" } },
  { id: "wrist-ext", label: "Wrist extension", muscles: "Extensor carpi radialis longus/brevis", root: "C6", nerve: "Radial", position: "sitting", ...mmt("wrist", { flex: 20 }, { flex: -40 }, (s) => ({ [k("elbow", s)]: { flex: 85 } })), push: { bone: "finger3-1", text: "the back of the hand into flexion" } },
  { id: "elbow-ext", label: "Elbow extension", muscles: "Triceps", root: "C7", nerve: "Radial", position: "supine", ...mmt("elbow", { flex: 110 }, { flex: 10 }, (s) => ({ [k("shoulder", s)]: { flex: 90 } })), push: { bone: "wrist", text: "the forearm into flexion" } },
  { id: "grip", label: "Finger flexion (grip)", muscles: "Flexor digitorum profundus/superficialis", root: "C8", nerve: "Median and ulnar", position: "sitting", ...mmt("hand", { flex: 0 }, { flex: 85 }, (s) => ({ [k("elbow", s)]: { flex: 85 } })), push: { bone: "finger3-2", text: "the fingers open from his grip" } },
  { id: "finger-abd", label: "Finger abduction", muscles: "Dorsal interossei", root: "T1", nerve: "Ulnar", position: "sitting", ...mmt("hand", { flex: 0 }, { flex: 0 }, (s) => ({ [k("elbow", s)]: { flex: 85 }, [k("wrist", s)]: { flex: -10 } })), push: { bone: "finger5-1", text: "the spread fingers together" } },
  { id: "hip-flex", label: "Hip flexion", muscles: "Iliopsoas", root: "L2", nerve: "Femoral (and lumbar plexus)", position: "sitting", ...mmt("hip", { flex: 88 }, { flex: 112 }), push: { bone: "lowerleg01", text: "down on the thigh above the knee" } },
  { id: "hip-abd", label: "Hip abduction", muscles: "Gluteus medius and minimus", root: "L5", nerve: "Superior gluteal", position: "sidelying", down: "other", ...mmt("hip", { flex: 10, abd: 0 }, { flex: 0, abd: 30 }), push: { bone: "lowerleg01", text: "down on the outer thigh" } },
  { id: "knee-ext", label: "Knee extension", muscles: "Quadriceps", root: "L3–L4", nerve: "Femoral", position: "sitting", ...mmt("knee", { flex: 85 }, { flex: 5 }), push: { bone: "foot", text: "the shin into flexion" } },
  { id: "knee-flex", label: "Knee flexion", muscles: "Hamstrings", root: "S1–S2", nerve: "Sciatic (tibial part)", position: "prone", ...mmt("knee", { flex: 0 }, { flex: 75 }), push: { bone: "foot", text: "the back of the ankle into extension" } },
  { id: "ankle-df", label: "Ankle dorsiflexion", muscles: "Tibialis anterior", root: "L4", nerve: "Deep fibular", position: "supine", ...mmt("ankle", { flex: -25 }, { flex: 18 }), push: { bone: "toe3-1", text: "the top of the foot into plantarflexion" } },
  { id: "ehl", label: "Great toe extension", muscles: "Extensor hallucis longus", root: "L5", nerve: "Deep fibular", position: "supine", ...mmt("toe", { flex: 0 }, { flex: 40 }), push: { bone: "toe1-2", text: "the big toe down" } },
  { id: "ankle-pf", label: "Ankle plantarflexion", muscles: "Gastrocnemius, soleus", root: "S1–S2", nerve: "Tibial", position: "supine", ...mmt("ankle", { flex: 5 }, { flex: -40 }), push: { bone: "toe3-1", text: "the sole of the foot into dorsiflexion" } },
];
export const muscleTest = (id: MuscleTestId) => MUSCLE_TESTS.find((t) => t.id === id)!;

/* ------------------------------------------------------------------ */
/* Reflexes and UMN signs                                             */
/* ------------------------------------------------------------------ */

export type ReflexId = "biceps" | "brachioradialis" | "triceps" | "patellar" | "achilles" | "babinski" | "hoffmann" | "clonus";
export type ReflexGrade = "0" | "1+" | "2+" | "3+" | "4+";
export type ReflexDef = {
  id: ReflexId;
  label: string;
  root: string;
  position: PatientPosition;
  kind: "dtr" | "sign";
  base: (side: Side) => Pose;
  /** Response pose for an amplitude 0–1 (deep tendon reflexes) or a sign present/absent. */
  jerk: (side: Side, amplitude: number) => Pose;
  /** Where the hammer (or stimulus) goes. */
  target: { landmark?: string; bone?: string; between?: [string, string] };
  how: string;
};

export const REFLEXES: ReflexDef[] = [
  { id: "biceps", label: "Biceps reflex", root: "C5–C6", position: "sitting", kind: "dtr", base: (s) => ({ [k("elbow", s)]: { flex: 80 } }), jerk: (s, a) => ({ [k("elbow", s)]: { flex: 80 + 22 * a } }), target: { bone: "lowerarm01" }, how: "Thumb on the biceps tendon at the elbow crease; tap your thumb." },
  { id: "brachioradialis", label: "Brachioradialis reflex", root: "C6", position: "sitting", kind: "dtr", base: (s) => ({ [k("elbow", s)]: { flex: 80 } }), jerk: (s, a) => ({ [k("elbow", s)]: { flex: 80 + 18 * a } }), target: { between: ["lowerarm02", "wrist"] }, how: "Tap the radius about 5 cm above the wrist." },
  { id: "triceps", label: "Triceps reflex", root: "C7", position: "sitting", kind: "dtr", base: (s) => ({ [k("shoulder", s)]: { abd: 60 }, [k("elbow", s)]: { flex: 90 } }), jerk: (s, a) => ({ [k("shoulder", s)]: { abd: 60 }, [k("elbow", s)]: { flex: 90 - 25 * a } }), target: { landmark: "olecranon" }, how: "Support the arm, tap the triceps tendon just above the olecranon." },
  { id: "patellar", label: "Patellar (knee) reflex", root: "L3–L4", position: "sitting", kind: "dtr", base: () => ({}), jerk: (s, a) => ({ [k("knee", s)]: { flex: 85 - 38 * a } }), target: { between: ["lowerleg01", "lowerleg01"], landmark: "tibial-tuberosity" }, how: "Legs hanging free; tap the patellar tendon below the kneecap." },
  { id: "achilles", label: "Achilles (ankle) reflex", root: "S1", position: "sitting", kind: "dtr", base: (s) => ({ [k("ankle", s)]: { flex: 10 } }), jerk: (s, a) => ({ [k("ankle", s)]: { flex: 10 - 30 * a } }), target: { landmark: "calcaneus" }, how: "Slightly dorsiflex the foot, tap the Achilles tendon." },
  { id: "babinski", label: "Plantar response (Babinski)", root: "UMN sign", position: "supine", kind: "sign", base: () => ({}), jerk: (s, a) => ({ [k("toe", s)]: { flex: a > 0 ? 35 : -18 } }), target: { landmark: "calcaneus" }, how: "Stroke the outer sole from heel to little toe, then across the ball of the foot." },
  { id: "hoffmann", label: "Hoffmann's sign", root: "UMN sign", position: "sitting", kind: "sign", base: (s) => ({ [k("elbow", s)]: { flex: 80 } }), jerk: (s, a) => ({ [k("elbow", s)]: { flex: 80 }, [k("hand", s)]: { abd: a > 0 ? 80 : 0 } }), target: { bone: "finger3-3" }, how: "Hold the middle finger and flick its nail downwards; watch the thumb." },
  { id: "clonus", label: "Ankle clonus", root: "UMN sign", position: "supine", kind: "sign", base: (s) => ({ [k("knee", s)]: { flex: 20 }, [k("hip", s)]: { flex: 15 } }), jerk: (s, a) => ({ [k("knee", s)]: { flex: 20 }, [k("hip", s)]: { flex: 15 }, [k("ankle", s)]: { flex: 15 - 20 * a } }), target: { bone: "foot" }, how: "Knee slightly bent; briskly dorsiflex the foot and hold it." },
];
export const reflex = (id: ReflexId) => REFLEXES.find((r) => r.id === id)!;
export const REFLEX_AMPLITUDE: Record<ReflexGrade, number> = { "0": 0, "1+": 0.25, "2+": 0.6, "3+": 1, "4+": 1 };

/* ------------------------------------------------------------------ */
/* Special tests                                                       */
/* ------------------------------------------------------------------ */

export type SpecialTestId =
  | "slr" | "slump" | "spurling" | "phalen" | "tinel-wrist" | "empty-can" | "hawkins" | "drop-arm"
  | "lachman" | "anterior-drawer-knee" | "mcmurray" | "valgus-stress" | "ankle-anterior-drawer" | "talar-tilt" | "romberg";

export type SpecialTestDef = {
  id: SpecialTestId;
  label: string;
  purpose: string;
  position: PatientPosition;
  bilateral?: false;
  /** Poses played in order; the last is held while the patient answers. */
  sequence: (side: Side) => Pose[];
  negative: string;
};

export const SPECIAL_TESTS: SpecialTestDef[] = [
  { id: "slr", label: "Straight leg raise", purpose: "Lumbosacral nerve root (L4–S1) sensitivity", position: "supine", sequence: (s) => [{ [k("hip", s)]: { flex: 40 } }, { [k("hip", s)]: { flex: 75 }, [k("ankle", s)]: { flex: 15 } }], negative: "Only a stretch at the back of the thigh at about 80°. Negative." },
  { id: "slump", label: "Slump test", purpose: "Neural tension (spinal canal to sciatic nerve)", position: "sitting", sequence: (s) => [{ trunk: { flex: 25 }, neck: { flex: 35 } }, { trunk: { flex: 25 }, neck: { flex: 35 }, [k("knee", s)]: { flex: 10 }, [k("ankle", s)]: { flex: 12 } }], negative: "A pull behind the knee that eases when he lifts his head. Negative." },
  { id: "spurling", label: "Spurling's test", purpose: "Cervical radiculopathy", position: "sitting", sequence: (s) => [{ neck: { flex: -15, abd: s === "right" ? 25 : -25, rot: s === "right" ? 15 : -15 } }], negative: "Some neck stiffness, no arm symptoms. Negative." },
  { id: "phalen", label: "Phalen's test", purpose: "Carpal tunnel syndrome (median nerve)", position: "sitting", bilateral: false, sequence: () => [{ "shoulder.left": { flex: 70, abd: 10 }, "shoulder.right": { flex: 70, abd: 10 }, "elbow.left": { flex: 95 }, "elbow.right": { flex: 95 }, "wrist.left": { flex: 80 }, "wrist.right": { flex: 80 } }], negative: "After 60 seconds: no tingling. Negative." },
  { id: "tinel-wrist", label: "Tinel's sign at the wrist", purpose: "Median nerve irritability at the carpal tunnel", position: "sitting", sequence: (s) => [{ [k("elbow", s)]: { flex: 85 }, [k("wrist", s)]: { flex: -20 } }], negative: "Tapping is felt locally only. Negative." },
  { id: "empty-can", label: "Empty can (Jobe) test", purpose: "Supraspinatus pain or weakness", position: "sitting", sequence: (s) => [{ [k("shoulder", s)]: { flex: 70, abd: 40, rot: 60 } }], negative: "Holds firmly against resistance, no pain. Negative." },
  { id: "hawkins", label: "Hawkins–Kennedy test", purpose: "Subacromial pain", position: "sitting", sequence: (s) => [{ [k("shoulder", s)]: { flex: 90 }, [k("elbow", s)]: { flex: 90 } }, { [k("shoulder", s)]: { flex: 90, rot: 60 }, [k("elbow", s)]: { flex: 90 } }], negative: "No pain on internal rotation. Negative." },
  { id: "drop-arm", label: "Drop arm test", purpose: "Full-thickness rotator cuff tear", position: "sitting", sequence: (s) => [{ [k("shoulder", s)]: { abd: 90 } }, { [k("shoulder", s)]: { abd: 20 } }], negative: "Lowers the arm slowly and smoothly. Negative." },
  { id: "lachman", label: "Lachman test", purpose: "ACL integrity", position: "supine", sequence: (s) => [{ [k("knee", s)]: { flex: 20 }, [k("hip", s)]: { flex: 10 } }], negative: "Minimal anterior glide with a firm end point. Negative." },
  { id: "anterior-drawer-knee", label: "Anterior drawer (knee)", purpose: "ACL integrity", position: "supine", sequence: (s) => [{ [k("hip", s)]: { flex: 45 }, [k("knee", s)]: { flex: 90 } }], negative: "No excess forward glide of the tibia. Negative." },
  { id: "mcmurray", label: "McMurray's test", purpose: "Meniscal tear", position: "supine", sequence: (s) => [{ [k("hip", s)]: { flex: 90 }, [k("knee", s)]: { flex: 130 } }, { [k("hip", s)]: { flex: 60 }, [k("knee", s)]: { flex: 60 } }], negative: "No click or joint-line pain. Negative." },
  { id: "valgus-stress", label: "Valgus stress test", purpose: "MCL integrity", position: "supine", sequence: (s) => [{ [k("knee", s)]: { flex: 25 }, [k("hip", s)]: { flex: 10, abd: 8 } }], negative: "Firm end-feel, no medial gapping or pain. Negative." },
  { id: "ankle-anterior-drawer", label: "Anterior drawer (ankle)", purpose: "ATFL integrity", position: "supine", sequence: (s) => [{ [k("knee", s)]: { flex: 30 }, [k("hip", s)]: { flex: 15 }, [k("ankle", s)]: { flex: -15 } }], negative: "No excess forward glide of the talus. Negative." },
  { id: "talar-tilt", label: "Talar tilt test", purpose: "Calcaneofibular ligament", position: "supine", sequence: (s) => [{ [k("ankle", s)]: { flex: 0, rot: 25 } }], negative: "Equal to the other side. Negative." },
  { id: "romberg", label: "Romberg test", purpose: "Proprioception (dorsal columns)", position: "standing", bilateral: false, sequence: () => [{}], negative: "Steady with eyes closed for 30 seconds. Negative." },
];
export const specialTest = (id: SpecialTestId) => SPECIAL_TESTS.find((t) => t.id === id)!;

/* ------------------------------------------------------------------ */
/* Tape measurements                                                    */
/* ------------------------------------------------------------------ */

export type TapeId = "true-leg-length" | "apparent-leg-length" | "thigh-girth" | "knee-girth" | "calf-girth";
export const TAPE: { id: TapeId; label: string; how: string; base: number; from?: string; to?: string; position: PatientPosition }[] = [
  { id: "true-leg-length", label: "True leg length", how: "ASIS to medial malleolus", base: 88.5, from: "asis", to: "medial-malleolus", position: "supine" },
  { id: "apparent-leg-length", label: "Apparent leg length", how: "Umbilicus to medial malleolus", base: 95, to: "medial-malleolus", position: "supine" },
  { id: "thigh-girth", label: "Thigh girth (10 cm above patella)", how: "Around the thigh, 10 cm above the superior pole of the patella", base: 47.5, position: "supine" },
  { id: "knee-girth", label: "Knee girth (joint line)", how: "Around the knee at mid-patella", base: 37, position: "supine" },
  { id: "calf-girth", label: "Calf girth (10 cm below tibial tuberosity)", how: "Around the calf, 10 cm below the tibial tuberosity", base: 36, position: "supine" },
];

/* ------------------------------------------------------------------ */
/* History taking                                                      */
/* ------------------------------------------------------------------ */

export type HistoryId =
  | "consent" | "complaint" | "onset" | "location" | "behaviour" | "night" | "severity" | "neuro" | "bladder"
  | "redflags" | "pmh" | "previous" | "social" | "goals";

export const HISTORY: { id: HistoryId; group: string; en: string; ur: string; keywords: RegExp }[] = [
  { id: "consent", group: "Introduction", en: "Hello, I'm your physiotherapist. Is it okay if I ask some questions and examine you?", ur: "Assalam-o-alaikum, main aap ka physiotherapist hoon. Kya main aap se kuch questions pooch sakta hoon aur examination kar sakta hoon?", keywords: /\b(hello|hi|introduc|consent|okay if|permission|ijazat|assalam|salam)\b/i },
  { id: "complaint", group: "Presenting complaint", en: "What brings you in today?", ur: "Aaj aap kis problem ki wajah se aaye hain?", keywords: /\b(bring|problem|wrong|complain|help|wajah|masla|takleef|issue)\b/i },
  { id: "onset", group: "Presenting complaint", en: "When and how did it start?", ur: "Yeh kab aur kaise start hua?", keywords: /\b(start|began|when|how long|injur|onset|kab|shuru)\b/i },
  { id: "location", group: "Pain", en: "Where exactly is it? Does it spread anywhere?", ur: "Pain exactly kahan hai? Kahin aur bhi spread hota hai?", keywords: /\b(where|location|spread|radiat|travel|kahan|jaata|jata)\b/i },
  { id: "behaviour", group: "Pain", en: "What makes it worse, and what eases it?", ur: "Kis cheez se pain barhta hai, aur kis se relief milta hai?", keywords: /\b(worse|better|ease|aggravat|relie|relief|barh|aaram)\b/i },
  { id: "night", group: "Pain", en: "How is it at night and first thing in the morning?", ur: "Raat ko aur subah uthte waqt kaisa hota hai?", keywords: /\b(night|morning|sleep|stiff|raat|subah|neend)\b/i },
  { id: "severity", group: "Pain", en: "How bad is it, from 0 to 10?", ur: "0 se 10 mein pain kitna hai?", keywords: /\b(severe|bad|score|scale|rate|0|10|kitna)\b/i },
  { id: "neuro", group: "Nerves", en: "Any numbness, tingling or weakness?", ur: "Koi numbness, tingling ya weakness?", keywords: /\b(numb|tingl|pins|weak|sunn|jhunjhun|kamzor)\b/i },
  { id: "bladder", group: "Red flags", en: "Any change in bladder or bowel control, or numbness around the saddle area?", ur: "Urine ya toilet control mein koi change, ya saddle area mein numbness?", keywords: /\b(bladder|bowel|urine|toilet|saddle|peshab|pakhan)\b/i },
  { id: "redflags", group: "Red flags", en: "Any fever, weight loss, night sweats or history of cancer?", ur: "Fever, weight loss, raat ko paseena, ya cancer ki koi history?", keywords: /\b(fever|weight|sweat|cancer|bukhar|wazan|paseen)\b/i },
  { id: "pmh", group: "Background", en: "Any other medical problems, or medicines you take?", ur: "Koi aur medical problem hai, ya koi medicines lete hain?", keywords: /\b(medical|diabet|pressure|medic|tablet|drug|bimar|dawai)\b/i },
  { id: "previous", group: "Background", en: "Have you had this before, or any treatment so far?", ur: "Pehle kabhi hua hai, ya ab tak koi treatment liya?", keywords: /\b(before|previous|treat|tried|scan|x-?ray|pehle|ilaj)\b/i },
  { id: "social", group: "Background", en: "What is your work, and how are daily activities?", ur: "Aap kya kaam karte hain, aur daily activities kaisi chal rahi hain?", keywords: /\b(work|job|occupation|daily|activit|kaam|naukri)\b/i },
  { id: "goals", group: "Background", en: "What would you most like to get back to?", ur: "Aap sab se zyada kya dobara karna chahte hain?", keywords: /\b(goal|want|hope|back to|chahte)\b/i },
];

/* ------------------------------------------------------------------ */
/* Case findings                                                        */
/* ------------------------------------------------------------------ */

type SideKey<T extends string> = `${T}.${Side}`;
export type SensoryChange = "reduced" | "absent" | "tingling";
export type CaseFindings = {
  rom?: Partial<Record<SideKey<MotionId>, { active?: number; passive?: number; endFeel?: string; pain?: string }>>;
  strength?: Partial<Record<SideKey<MuscleTestId>, number>>;
  /** What the patient does when a weak muscle is tested (substitution / comment). */
  strengthNote?: Partial<Record<SideKey<MuscleTestId>, string>>;
  painOnResistance?: Partial<Record<SideKey<MuscleTestId>, string>>;
  reflexes?: Partial<Record<SideKey<"biceps" | "brachioradialis" | "triceps" | "patellar" | "achilles">, ReflexGrade>>;
  signs?: Partial<Record<SideKey<"babinski" | "hoffmann" | "clonus">, boolean>>;
  sensation?: { sides: Side[]; dermatomes?: Dermatome[]; nerves?: CutaneousNerve[]; change: SensoryChange }[];
  tender?: { side: Side | "both"; landmarks?: string[]; regions?: string[]; text: string }[];
  special?: Partial<Record<SideKey<SpecialTestId> | SpecialTestId, { positive: boolean; text: string }>>;
  tape?: Partial<Record<SideKey<TapeId>, number>>; // cm added to the healthy value
  vitals?: { hr: number; bp: string; rr: number; spo2: number; temp: number };
  observation?: string;
  /** How the patient holds himself in each position (e.g. a flexed arm after stroke, a dropped foot). */
  posture?: Partial<Record<PatientPosition, Pose>>;
};

export const HEALTHY_VITALS = { hr: 74, bp: "122/78", rr: 14, spo2: 98, temp: 36.8 };

export function romFor(findings: CaseFindings, id: MotionId, side: Side) {
  const def = motion(id);
  const f = findings.rom?.[`${id}.${side}`] ?? {};
  const passive = f.passive ?? f.active ?? def.normal;
  return { active: f.active ?? passive, passive, endFeel: f.endFeel ?? def.endFeel, pain: f.pain ?? null };
}
export const strengthFor = (findings: CaseFindings, id: MuscleTestId, side: Side) => findings.strength?.[`${id}.${side}`] ?? 5;
export const reflexFor = (findings: CaseFindings, id: "biceps" | "brachioradialis" | "triceps" | "patellar" | "achilles", side: Side): ReflexGrade => findings.reflexes?.[`${id}.${side}`] ?? "2+";
export const signFor = (findings: CaseFindings, id: "babinski" | "hoffmann" | "clonus", side: Side) => findings.signs?.[`${id}.${side}`] ?? false;

export function sensationFor(findings: CaseFindings, surface: SurfaceInfo): SensoryChange | "normal" {
  for (const rule of findings.sensation ?? []) {
    if (!rule.sides.includes(surface.side)) continue;
    if (surface.dermatome && rule.dermatomes?.includes(surface.dermatome)) return rule.change;
    if (surface.nerve && rule.nerves?.includes(surface.nerve)) return rule.change;
  }
  return "normal";
}

export function tenderFor(findings: CaseFindings, side: Side, landmark: string | null, region: string) {
  for (const rule of findings.tender ?? []) {
    if (rule.side !== "both" && rule.side !== side) continue;
    if (landmark && rule.landmarks?.includes(landmark)) return rule.text;
    if (rule.regions?.includes(region)) return rule.text;
  }
  return null;
}

export function specialFor(findings: CaseFindings, id: SpecialTestId, side: Side) {
  const def = specialTest(id);
  return findings.special?.[`${id}.${side}`] ?? findings.special?.[id] ?? { positive: false, text: def.negative };
}

export const tapeFor = (findings: CaseFindings, id: TapeId, side: Side) =>
  +(TAPE.find((t) => t.id === id)!.base + (findings.tape?.[`${id}.${side}`] ?? 0)).toFixed(1);
