import type { CameraSpec } from "./spec-types.ts";
import type { Metric } from "./types.ts";
import { CUE, FRONT_UPRIGHT, LYING_SIDE, MID_SHOULDERS, SIDE_UPRIGHT, head, headTilt, incline, joint, shoulderLevel, trunkLean } from "./spec-parts.ts";

/**
 * The nine cervical exercises. Upright ones use the front view (turns and side bends) or the side view (the chin tuck, the shoulder blades), with the face model
 * for the head's own rotation and nod; the two lying ones (the nod and the nod with a head lift) are position, count and timer only unless validated.
 */
const forwardEar = (id: string): Metric => ({ id, kind: "offset", a: "near:shoulder", b: "near:ear", scale: ["near:shoulder", "near:hip"], axis: "x", byFacing: true });

export const CERVICAL_SPECS: CameraSpec[] = [
  {
    id: "chin-tuck", region: "cervical", tier: "A", posture: "seated", feasibility: "standard", sided: false,
    placement: SIDE_UPRIGHT,
    need: ["near:ear", "near:shoulder", "near:hip"],
    needFace: "optional",
    metrics: [
      forwardEar("ear_fwd"),
      incline("cva", "near:shoulder", "near:ear", "vertical", { byFacing: true }),
      head("nod", "pitch", true),
      trunkLean(),
    ],
    primary: { metric: "ear_fwd", mode: "reps", reference: "baseline", rest: 0, target: -0.03, holdMs: 5000 },
    joints: [
      { joint: "neck", axes: ["flex"], role: "mover", coverage: "measured", metric: "cva", why: "The head glide shows as the ear moving back over the shoulder (side view). The neck's own joint angles are not read: the head and the neck move by about 13 degrees in opposite directions and nearly cancel in a picture." },
      { joint: "head", axes: ["flex"], role: "mover", coverage: "tracked", metric: "nod", why: "A nod (chin dropping) is watched through the face model so the movement stays a glide; its angle is only a watch." },
      { joint: "trunk", axes: ["flex"], role: "watch", coverage: "measured", metric: "trunk_lean", why: "Leaning the whole body instead of gliding the head back." },
    ],
    cues: [
      { id: "chin-tuck-eyes", metric: "nod", when: "change_over", value: 8, forMs: 600, text: CUE.eyesLevel },
      { id: "chin-tuck-tall", metric: "trunk_lean", when: "change_over", value: 6, forMs: 600, text: CUE.sitTall },
    ],
    provisional: true,
    limits: {
      en: "The movement is only a few centimetres, so the repetition count and the hold timer are the dependable results; an angle is shown only if this movement passes the validation rules.",
      ru: "Harkat sirf chand centimetre ki hai, isliye ginti aur hold ka timer qabil-e-aitmaad nateeje hain; angle tab hi dikhaya jata hai jab yeh harkat validation ke usool par poori utre.",
    },
  },
  {
    id: "neck-rotation", region: "cervical", tier: "A", posture: "seated", feasibility: "standard", sided: false,
    placement: FRONT_UPRIGHT,
    need: ["nose", "leftEar", "rightEar", "leftShoulder", "rightShoulder", "leftHip", "rightHip"],
    needFace: "required",
    metrics: [
      head("yaw", "yaw", true),
      { id: "trunk_turn", kind: "rotation", a: "leftShoulder", b: "rightShoulder", abs: true },
      { id: "nose_shift", kind: "offset", a: MID_SHOULDERS, b: "nose", scale: ["leftShoulder", "rightShoulder"], axis: "x", abs: true },
    ],
    primary: { metric: "yaw", mode: "reps", reference: "baseline", rest: 0, target: 45, abs: true },
    joints: [
      { joint: "neck", axes: ["rot"], role: "mover", coverage: "measured", metric: "yaw", why: "The face model gives the head's turn against the camera; with the trunk held still this is the neck's rotation." },
      { joint: "trunk", axes: ["rot"], role: "watch", coverage: "measured", metric: "trunk_turn", why: "A turning trunk would be counted as neck rotation, so the shoulder line is watched too." },
    ],
    cues: [
      { id: "neck-rotation-head-only", metric: "trunk_turn", when: "change_over", value: 10, forMs: 600, text: CUE.turnHeadOnly },
      { id: "neck-rotation-enough", metric: "yaw", when: "change_over", value: 75, forMs: 300, text: CUE.enoughRange },
    ],
    provisional: true,
    limits: {
      en: "Needs the face model. If the face model cannot find the face the tool counts turns from the nose position only (no angle).",
      ru: "Face model chahiye. Agar face model chehra na dhoondh sake to tool sirf naak ki position se turns ginta hai (angle nahi).",
    },
  },
  {
    id: "neck-side-bend", region: "cervical", tier: "A", posture: "seated", feasibility: "standard", sided: false,
    placement: FRONT_UPRIGHT,
    need: ["leftEar", "rightEar", "leftShoulder", "rightShoulder", "leftHip", "rightHip"],
    needFace: "optional",
    metrics: [headTilt(), shoulderLevel(), head("roll", "roll", true)],
    primary: { metric: "head_tilt", mode: "reps", reference: "baseline", rest: 0, target: 20, abs: true, holdMs: 5000 },
    joints: [
      { joint: "neck", axes: ["abd"], role: "mover", coverage: "measured", metric: "head_tilt", why: "The line through the two ears against the line through the two shoulders: the head tilted on the trunk, seen from the front (the plane of the movement)." },
      { joint: "shoulder", axes: ["elev"], role: "watch", coverage: "measured", metric: "shoulder_level", why: "A raised shoulder is the usual way a side bend is faked." },
    ],
    cues: [
      { id: "neck-side-bend-level", metric: "shoulder_level", when: "change_over", value: 5, forMs: 500, text: CUE.shouldersLevel },
      { id: "neck-side-bend-enough", metric: "head_tilt", when: "change_over", value: 45, forMs: 300, text: CUE.enoughRange },
    ],
    provisional: true,
    limits: {
      en: "The ear line is a stand-in for the neck's own angle; the face model's roll is shown as a second opinion when it is on.",
      ru: "Kaan ki line gardan ke apne angle ka badal hai; face model chalu ho to uska roll doosri raaye ke taur par dikhaya jata hai.",
    },
  },
  {
    id: "upper-trapezius-stretch", region: "cervical", tier: "A", posture: "seated", feasibility: "standard", sided: true,
    placement: FRONT_UPRIGHT,
    need: ["leftEar", "rightEar", "leftShoulder", "rightShoulder", "leftHip", "rightHip"],
    needFace: "optional",
    metrics: [headTilt(), shoulderLevel(), head("nod", "pitch", true)],
    primary: { metric: "head_tilt", mode: "hold-reach", reference: "baseline", rest: 0, target: 15, abs: true, holdMs: 30000 },
    joints: [
      { joint: "neck:a", axes: ["abd"], role: "mover", coverage: "measured", metric: "head_tilt", why: "Head tilted away from the stretched side, seen from the front." },
      { joint: "neck:a", axes: ["flex"], role: "mover", coverage: "tracked", metric: "nod", why: "The forward component (about 12 degrees) is followed through the face model's nod; it is near the limit of what the camera reads." },
      { joint: "shoulder", axes: ["flex"], role: "mover", coverage: "tracked", metric: "shoulder_level", why: "The arm is held behind and low; the front view sees only whether the shoulder stays down, not the arm's own angle." },
      { joint: "elbow", axes: ["flex"], role: "mover", coverage: "not_measurable", why: "The elbow bends in the direction pointing away from a front camera; it cannot be read from the front." },
    ],
    cues: [
      { id: "upper-trapezius-level", metric: "shoulder_level", when: "change_over", value: 5, forMs: 500, text: CUE.shouldersLevel },
      { id: "upper-trapezius-enough", metric: "head_tilt", when: "change_over", value: 45, forMs: 300, text: CUE.enoughRange },
    ],
    provisional: true,
    limits: {
      en: "Times how long the head stays tilted; the stretch sensation itself, and the arm's position, are not measured.",
      ru: "Yeh sirf yeh naapta hai ke sar kitni der jhuka raha; stretch ka ehsaas aur bazu ki position nahi naapi jati.",
    },
  },
  {
    id: "supine-nod", region: "cervical", tier: "B", posture: "supine", feasibility: "to-confirm", sided: false,
    placement: LYING_SIDE,
    need: ["near:ear", "nose", "near:shoulder", "near:hip"],
    metrics: [incline("nod_line", "near:ear", "nose", "horizontal", { byFacing: true, abs: true })],
    primary: { metric: "nod_line", mode: "reps", reference: "baseline", rest: 0, target: 8, abs: true, holdMs: 10000 },
    joints: [
      { joint: "head", axes: ["flex"], role: "mover", coverage: "measured", metric: "nod_line", why: "The ear-to-nose line against the horizontal, from the side. The nod is small (about 17 degrees) and the head rests on a pillow, so this is a count and timer first; an angle only if validated." },
      { joint: "neck", axes: ["flex"], role: "watch", coverage: "not_measurable", why: "The point of the exercise, the deep neck flexor muscles working, is not visible in a picture, and the head must not lift (that is the next exercise)." },
    ],
    cues: [],
    provisional: true,
    limits: {
      en: "Counts and times the nod only. It cannot see whether the right muscles are working. If the model cannot find a lying face from the side, the tool offers no count for this exercise.",
      ru: "Yeh sirf nod ginta aur waqt naapta hai. Yeh nahi dekh sakta ke sahi muscles kaam kar rahe hain ya nahi. Agar model lete hue chehra side se na dhoondh sake to is exercise ki ginti nahi di jaegi.",
    },
  },
  {
    id: "chin-tuck-head-lift", region: "cervical", tier: "B", posture: "supine", feasibility: "to-confirm", sided: false,
    placement: LYING_SIDE,
    need: ["near:ear", "nose", "near:shoulder", "near:hip"],
    metrics: [
      incline("nod_line", "near:ear", "nose", "horizontal", { byFacing: true, abs: true }),
      { id: "head_rise", kind: "offset", a: "near:shoulder", b: "near:ear", scale: ["near:shoulder", "near:hip"], axis: "y" },
    ],
    primary: { metric: "head_rise", mode: "reps", reference: "baseline", rest: 0, target: 0.05, holdMs: 10000 },
    joints: [
      { joint: "head", axes: ["flex"], role: "mover", coverage: "measured", metric: "nod_line", why: "Ear-to-nose line against the horizontal: the chin staying tucked while the head lifts." },
      { joint: "neck", axes: ["flex"], role: "mover", coverage: "measured", metric: "head_rise", why: "How far the head rises above the shoulders (as a fraction of the trunk length), the visible result of the neck's flexion; the neck's own angle is not read." },
    ],
    cues: [
      { id: "head-lift-enough", metric: "head_rise", when: "change_over", value: 0.15, forMs: 300, text: CUE.enoughRange },
    ],
    provisional: true,
    limits: {
      en: "Times the lift and counts it; the angle is shown only if validated. If the model cannot find a lying face from the side, the tool offers no count for this exercise.",
      ru: "Yeh uthne ka waqt aur ginti deta hai; angle tab dikhaya jata hai jab validate ho. Agar model lete hue chehra side se na dhoondh sake to is exercise ki ginti nahi di jaegi.",
    },
  },
  {
    id: "shoulder-blade-squeeze", region: "cervical", tier: "A", posture: "seated", feasibility: "standard", sided: false,
    placement: SIDE_UPRIGHT,
    need: ["near:ear", "near:shoulder", "near:elbow", "near:hip"],
    metrics: [
      { id: "shoulder_fwd", kind: "offset", a: "near:ear", b: "near:shoulder", scale: ["near:shoulder", "near:hip"], axis: "x", byFacing: true },
      joint("arm_angle", "near:hip", "near:shoulder", "near:elbow"),
      trunkLean(),
    ],
    primary: { metric: "shoulder_fwd", mode: "reps", reference: "baseline", rest: 0, target: -0.04, holdMs: 5000 },
    joints: [
      { joint: "shoulder", axes: ["flex"], role: "mover", coverage: "measured", metric: "arm_angle", why: "The angle between the trunk and the upper arm on the near side." },
      { joint: "shoulder", axes: ["abd"], role: "mover", coverage: "tracked", metric: "shoulder_fwd", why: "The blade's retraction shows as the shoulder moving back under the ear; the sideways component (about 6 degrees) is not read." },
      { joint: "shoulder:o", axes: ["flex", "abd"], role: "mover", coverage: "tracked", metric: "shoulder_span", pass: 2, why: "The far shoulder is hidden behind the near one in a side view; the second, front view watches both shoulders together." },
      { joint: "trunk", axes: ["flex"], role: "watch", coverage: "measured", metric: "trunk_lean", why: "Leaning back instead of squeezing." },
    ],
    cues: [
      { id: "blade-squeeze-tall", metric: "trunk_lean", when: "change_over", value: 6, forMs: 600, text: CUE.sitTall },
      { id: "blade-squeeze-level", metric: "shoulder_level", when: "change_over", value: 5, forMs: 500, text: CUE.shouldersLevel, pass: 2 },
    ],
    second: {
      placement: FRONT_UPRIGHT,
      why: { en: "A short second pass facing the phone: both shoulder blades together, and whether the shoulders stay level.", ru: "Phone ke samne ek chhota doosra round: dono kandhe saath, aur kya woh barabar rehte hain." },
      need: ["leftShoulder", "rightShoulder", "leftHip", "rightHip"],
      metrics: [{ id: "shoulder_span", kind: "dist", a: "leftShoulder", b: "rightShoulder", scale: [MID_SHOULDERS, { mid: ["leftHip", "rightHip"] }] }, shoulderLevel()],
    },
    provisional: true,
    limits: {
      en: "A squeeze of the shoulder blades is a small movement; the count and hold timer are the dependable results, the shoulder position is shown as a position, and the angle only if validated.",
      ru: "Shoulder blade squeeze chhoti harkat hai; ginti aur hold timer qabil-e-aitmaad hain, kandhe ki position dikhayi jati hai, aur angle tab jab validate ho.",
    },
  },
  {
    id: "levator-scapulae-stretch", region: "cervical", tier: "A", posture: "seated", feasibility: "standard", sided: true,
    placement: FRONT_UPRIGHT,
    need: ["nose", "leftEar", "rightEar", "leftShoulder", "rightShoulder", "leftHip", "rightHip"],
    needFace: "required",
    metrics: [head("yaw", "yaw", true), head("nod", "pitch", true), headTilt(), shoulderLevel()],
    primary: { metric: "yaw", mode: "hold-reach", reference: "baseline", rest: 0, target: 30, abs: true, holdMs: 30000 },
    joints: [
      { joint: "neck:a", axes: ["rot"], role: "mover", coverage: "measured", metric: "yaw", why: "The face model's turn of the head." },
      { joint: "neck:a", axes: ["flex"], role: "mover", coverage: "measured", metric: "nod", why: "The face model's nod (chin towards the chest), a large movement here (about 38 degrees)." },
      { joint: "neck:a", axes: ["abd"], role: "mover", coverage: "measured", metric: "head_tilt", why: "A small side tilt (about 8 degrees), seen as the ear line against the shoulder line." },
      { joint: "shoulder", axes: ["flex", "abd"], role: "mover", coverage: "tracked", metric: "shoulder_level", why: "The arm is held low and behind; the front view sees only whether the shoulder stays down." },
      { joint: "elbow", axes: ["flex"], role: "mover", coverage: "not_measurable", why: "The elbow bends in the direction pointing away from a front camera." },
    ],
    cues: [
      { id: "levator-level", metric: "shoulder_level", when: "change_over", value: 5, forMs: 500, text: CUE.shouldersLevel },
      { id: "levator-enough", metric: "nod", when: "change_over", value: 60, forMs: 300, text: CUE.enoughRange },
    ],
    provisional: true,
    limits: {
      en: "Needs the face model. Times how long the head stays turned and bent; the stretch sensation and the arm's position are not measured.",
      ru: "Face model chahiye. Yeh naapta hai ke sar kitni der ghuma aur jhuka raha; stretch ka ehsaas aur bazu ki position nahi naapi jati.",
    },
  },
  {
    id: "scalene-stretch", region: "cervical", tier: "A", posture: "seated", feasibility: "standard", sided: true,
    placement: FRONT_UPRIGHT,
    need: ["leftEar", "rightEar", "leftShoulder", "rightShoulder", "leftHip", "rightHip"],
    needFace: "optional",
    metrics: [headTilt(), shoulderLevel(), head("yaw", "yaw", true), head("nod", "pitch", true)],
    primary: { metric: "head_tilt", mode: "hold-reach", reference: "baseline", rest: 0, target: 20, abs: true, holdMs: 30000 },
    joints: [
      { joint: "neck:a", axes: ["abd"], role: "mover", coverage: "measured", metric: "head_tilt", why: "Head tilted away from the stretched side, seen from the front." },
      { joint: "neck:a", axes: ["rot"], role: "mover", coverage: "measured", metric: "yaw", why: "The face model's turn of the head (about 14 degrees)." },
      { joint: "neck:a", axes: ["flex"], role: "mover", coverage: "tracked", metric: "nod", why: "About 6 degrees, at the limit of what the camera can read; followed, not trusted." },
      { joint: "shoulder", axes: ["flex", "abd"], role: "mover", coverage: "tracked", metric: "shoulder_level", why: "The arm is held low and behind; the front view sees only whether the shoulder stays down." },
      { joint: "elbow", axes: ["flex"], role: "mover", coverage: "not_measurable", why: "The elbow bends in the direction pointing away from a front camera." },
    ],
    cues: [
      { id: "scalene-level", metric: "shoulder_level", when: "change_over", value: 5, forMs: 500, text: CUE.shouldersLevel },
      { id: "scalene-enough", metric: "head_tilt", when: "change_over", value: 45, forMs: 300, text: CUE.enoughRange },
    ],
    provisional: true,
    limits: {
      en: "Times how long the head stays tilted; the stretch sensation and the arm's position are not measured.",
      ru: "Yeh naapta hai ke sar kitni der jhuka raha; stretch ka ehsaas aur bazu ki position nahi naapi jati.",
    },
  },
];
