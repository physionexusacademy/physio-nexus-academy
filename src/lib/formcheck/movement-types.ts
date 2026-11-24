import type { CameraSpec } from "./spec-types.ts";

/**
 * A movement TYPE is one way of measuring one kind of movement from one kind of view (for example "the head's turn from the face model, seen from the front").
 * The validation study decides, per type, whether a number may be shown to a patient (protocol section 10.7). Exercises that measure the same type share the decision,
 * so the eight-movement study battery covers many exercises, and the types it does not contain stay at counts, timers and position cues until a later study.
 *
 * `battery`: the number of the movement in the protocol's battery (section 6) that measures this type directly, or null when the battery does not contain it.
 * `reference`: what the blinded assessor measures against.
 */
export type MovementType = { label: string; battery: number | null; reference: string };

export const MOVEMENT_TYPES = {
  "head-trunk-sagittal": { label: "Head over trunk, side view (ear against shoulder)", battery: 1, reference: "CROM device, or a digital inclinometer" },
  "head-yaw": { label: "Head turn from the face model, front view", battery: 2, reference: "CROM device or goniometer" },
  "head-pitch": { label: "Head nod from the face model, front view", battery: null, reference: "CROM device or inclinometer" },
  "head-roll": { label: "Head tilt from the face model, front view", battery: 3, reference: "CROM device or inclinometer" },
  "head-tilt-front": { label: "Head tilt on the shoulder line, front view (ear line against shoulder line)", battery: 3, reference: "CROM device or inclinometer" },
  "head-lying-line": { label: "Head nod or lift while lying, side view (ear-to-nose line, head height)", battery: null, reference: "Digital inclinometer on the forehead, and a ruler for the lift" },
  "head-incline-low-side": { label: "Head against shoulder on all fours, side view", battery: null, reference: "Digital inclinometer" },
  "head-trunk-low-side": { label: "Head in line with the trunk while lying, side view", battery: null, reference: "Digital inclinometer" },
  "nose-on-trunk": { label: "Nose against the middle of the shoulders, front view (head turn on the trunk)", battery: null, reference: "Goniometer / rotation gauge" },
  "shoulder-level-front": { label: "Shoulder line against the horizontal, front view", battery: null, reference: "Digital inclinometer on the shoulder line" },
  "trunk-rotation-width": { label: "Trunk rotation from the shoulder (or hip) width ratio, front view of a seated or standing person", battery: 6, reference: "Goniometer / rotation gauge (exploratory)" },
  "trunk-rotation-end-on": { label: "Trunk rotation seen along its long axis, from the head or feet end (shoulder line, hip against shoulder line)", battery: null, reference: "Digital inclinometer on the shoulder line, supine or side-lying" },
  "knee-line-end-on": { label: "Knee line against the horizontal, from the feet end", battery: null, reference: "Digital inclinometer across the knees" },
  "pelvis-level-end-on": { label: "Hip line against the horizontal, from the feet end or from behind", battery: null, reference: "Digital inclinometer across the iliac crests" },
  "knee-gap-end-on": { label: "Gap between the knees against hip width, from the feet end", battery: null, reference: "Ruler" },
  "arm-open-end-on": { label: "Arm angle against the horizontal, from the head end", battery: null, reference: "Goniometer" },
  "trunk-side-bend-front": { label: "Trunk side bend, front view of a standing person", battery: 4, reference: "Digital inclinometer" },
  "trunk-incline-side-upright": { label: "Trunk inclination, side view of a seated or standing person", battery: 5, reference: "Digital inclinometer" },
  "trunk-incline-low-side": { label: "Trunk inclination while lying, prone or on all fours, side view from a low phone", battery: null, reference: "Digital inclinometer on the sternum" },
  "limb-joint-front-upright": { label: "Limb joint angle, front view of a standing person", battery: null, reference: "Goniometer" },
  "limb-joint-upright-side": { label: "Limb joint angle, side view of a seated person", battery: null, reference: "Goniometer" },
  "limb-joint-lying-side": { label: "Limb joint angle while lying, side view from a low phone", battery: 7, reference: "Goniometer" },
  "limb-joint-quadruped-side": { label: "Limb joint angle on all fours or in a plank, side view from a low phone", battery: 8, reference: "Goniometer and a level" },
  "limb-joint-quadruped-front": { label: "Limb joint angle on all fours, front view from a low phone", battery: null, reference: "Goniometer" },
  "elbow-height-quadruped-front": { label: "Elbow height above the shoulder on all fours, front view", battery: null, reference: "Ruler" },
  "body-line-side": { label: "Hip against the shoulder-to-ankle line, side view of a plank", battery: null, reference: "Digital inclinometer and a ruler" },
  "head-line-lying": { label: "Ear-to-nose line while lying, side view", battery: null, reference: "Digital inclinometer on the forehead" },
} as const satisfies Record<string, MovementType>;
export type MovementTypeId = keyof typeof MOVEMENT_TYPES;

const UPRIGHT = new Set(["seated", "standing"]);

/**
 * The movement type a metric of a spec belongs to. Metric ids are chosen so that the same id means the same measurement everywhere, except the limb joint
 * angles, whose type follows the posture and the view (lying, on all fours, seated, standing).
 */
export function movementTypeOf(spec: CameraSpec, metricId: string): MovementTypeId | null {
  const limb = (): MovementTypeId => {
    if (spec.id === "quadruped-thoracic-rotation") return "limb-joint-quadruped-front";
    if (spec.id === "standing-side-bend") return "limb-joint-front-upright";
    if (UPRIGHT.has(spec.posture)) return "limb-joint-upright-side";
    return spec.posture === "quadruped" || spec.id === "front-plank" ? "limb-joint-quadruped-side" : "limb-joint-lying-side";
  };
  switch (metricId) {
    case "cva": case "ear_fwd": case "shoulder_fwd": return "head-trunk-sagittal";
    case "yaw": return "head-yaw";
    case "nod": return "head-pitch";
    case "roll": return "head-roll";
    case "head_tilt": return "head-tilt-front";
    case "nod_line": case "head_rise": return "head-lying-line";
    case "head_incline": return "head-incline-low-side";
    case "head_line": return "head-line-lying";
    case "neck_on_trunk": return "head-trunk-low-side";
    case "nose_shift": return "nose-on-trunk";
    case "shoulder_level": return "shoulder-level-front";
    case "trunk_turn": case "hip_turn": case "chest_turn": return "trunk-rotation-width";
    case "shoulder_turn": case "lumbar_twist": return "trunk-rotation-end-on";
    case "knee_tilt": return "knee-line-end-on";
    case "pelvis_level": return "pelvis-level-end-on";
    case "knee_gap": return "knee-gap-end-on";
    case "arm_open": return "arm-open-end-on";
    case "trunk_tilt": return "trunk-side-bend-front";
    case "trunk_lean": return "trunk-incline-side-upright";
    case "trunk_incline": case "trunk_lift": case "back_level": return "trunk-incline-low-side";
    case "elbow_up": return "elbow-height-quadruped-front";
    case "hip_line": return "body-line-side";
    case "hip_angle": case "knee_angle": case "shoulder_angle": case "elbow_angle": case "ankle_angle": case "arm_angle": case "arm_reach": case "leg_hip": case "leg_knee": case "foot_angle":
    case "shoulder_angle_t": case "shoulder_angle_o": return limb();
    default: return null;
  }
}

/**
 * The movement types whose numbers have passed the validation study's pre-specified rules (protocol section 10.7) and may be shown to a patient as an angle.
 * It is EMPTY until the study has been run and the principal investigator has recorded the decision here (type, date, reference to the report). Until then every
 * exercise shows counts, timers and position cues only.
 */
export const VALIDATED_TYPES: Partial<Record<MovementTypeId, { decidedOn: string; report: string }>> = {};

export const mayShowAngle = (type: MovementTypeId | null): boolean => type !== null && type in VALIDATED_TYPES;
