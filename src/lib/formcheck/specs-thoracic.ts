import type { CameraSpec } from "./spec-types.ts";
import { CUE, FRONT_UPRIGHT, HEAD_END, LYING_SIDE, MID_HIPS, MID_SHOULDERS, QUADRUPED_FRONT, QUADRUPED_SIDE, SIDE_UPRIGHT, head, incline, joint, tilt, trunkLean } from "./spec-parts.ts";

/**
 * The six thoracic exercises. Rotations are read where the axis of the turn points at the camera (a front view of a seated person; the head end of a person lying
 * or on all fours), flexion and extension from the side. One camera cannot see the thoracic spine's own curve, so every thoracic movement here is measured through
 * the whole trunk's inclination or the shoulder line, and the spec says so.
 */
export const THORACIC_SPECS: CameraSpec[] = [
  {
    id: "open-book", region: "thoracic", tier: "B", posture: "side-lying", feasibility: "to-confirm", sided: true,
    placement: HEAD_END,
    need: ["leftShoulder", "rightShoulder", "tested:shoulder", "tested:wrist"],
    metrics: [
      tilt("shoulder_turn", "leftShoulder", "rightShoulder", true),
      incline("arm_open", "tested:shoulder", "tested:wrist", "horizontal", { abs: true }),
    ],
    primary: { metric: "shoulder_turn", mode: "reps", reference: "baseline", rest: 0, target: 30, abs: true, holdMs: 3000 },
    joints: [
      { joint: "trunk:t", axes: ["rot"], role: "mover", coverage: "measured", metric: "shoulder_turn", why: "Seen from the head end the trunk's turn about its long axis is the shoulder line turning in the picture; it assumes the hips stay where they are (the knees stay stacked)." },
      { joint: "shoulder", axes: ["abd"], role: "mover", coverage: "measured", metric: "arm_open", why: "The opening arm's angle against the horizontal, from the head end." },
      { joint: "neck:t", axes: ["rot"], role: "mover", coverage: "not_measurable", why: "The head turns to follow the hand, seen from above and behind; the face model cannot read it. The count follows the shoulder line." },
    ],
    cues: [
      { id: "open-book-enough", metric: "shoulder_turn", when: "change_over", value: 70, forMs: 300, text: CUE.enoughRange },
    ],
    provisional: true,
    limits: {
      en: "A head-end view of a person lying on their side is the least familiar picture for the pose model. If the model cannot find the shoulders there, the fall-back is a count from the wrist's path seen from the front at floor level, with no angle.",
      ru: "Karwat par lete hue sar ki taraf se view pose model ke liye sab se kam jaana-pehchana hai. Agar model wahan kandhe na dhoondh sake to fall-back samne se zameen ki unchai par kalai ke raaste se ginti hai, angle ke baghair.",
    },
  },
  {
    id: "seated-thoracic-rotation", region: "thoracic", tier: "A", posture: "seated", feasibility: "standard", sided: true,
    placement: FRONT_UPRIGHT,
    need: ["nose", "leftEar", "rightEar", "leftShoulder", "rightShoulder", "leftHip", "rightHip"],
    metrics: [
      { id: "trunk_turn", kind: "rotation", a: "leftShoulder", b: "rightShoulder", abs: true },
      { id: "hip_turn", kind: "rotation", a: "leftHip", b: "rightHip", abs: true },
      { id: "nose_shift", kind: "offset", a: MID_SHOULDERS, b: "nose", scale: [MID_SHOULDERS, MID_HIPS], axis: "x", abs: true },
    ],
    primary: { metric: "trunk_turn", mode: "reps", reference: "baseline", rest: 0, target: 30 },
    joints: [
      { joint: "trunk:t", axes: ["rot"], role: "mover", coverage: "measured", metric: "trunk_turn", why: "How much narrower the shoulders look than they did in the person's own neutral sitting position (acos of the width ratio). The size of the turn only; the person says which way they turn." },
      { joint: "neck:t", axes: ["rot"], role: "mover", coverage: "measured", metric: "nose_shift", why: "The nose's position against the middle of the shoulders: when the head turns further than the trunk the nose leaves the chest's midline (a stand-in for the head's turn on the trunk; needs no face model)." },
      { joint: "pelvis", axes: ["rot"], role: "watch", coverage: "measured", metric: "hip_turn", why: "The hips turning with the trunk would make the exercise a hip turn." },
    ],
    cues: [
      { id: "seated-rotation-hips", metric: "hip_turn", when: "change_over", value: 8, forMs: 600, text: CUE.hipsFacing },
      { id: "seated-rotation-enough", metric: "trunk_turn", when: "change_over", value: 60, forMs: 300, text: CUE.enoughRange },
    ],
    provisional: true,
    limits: {
      en: "The width-ratio method cannot tell a turn to the left from a turn to the right, so the person says which side; and it is least accurate for small turns.",
      ru: "Width-ratio tareeqa left aur right ka farq nahi bata sakta, isliye aap side batate hain; aur chhote turns mein yeh kam durust hai.",
    },
  },
  {
    id: "thoracic-extension-chair", region: "thoracic", tier: "A", posture: "seated", feasibility: "standard", sided: false,
    placement: SIDE_UPRIGHT,
    need: ["near:ear", "near:shoulder", "near:hip"],
    needFace: "optional",
    metrics: [trunkLean(), head("nod", "pitch", true)],
    primary: { metric: "trunk_lean", mode: "reps", reference: "baseline", rest: 0, target: -10, holdMs: 2000 },
    joints: [
      { joint: "trunk", axes: ["flex"], role: "mover", coverage: "measured", metric: "trunk_lean", why: "The tilt of the whole trunk (hip to shoulder) against the vertical; the chair back is the pivot. The thoracic spine's own curve is not visible to one camera, so this is the trunk's extension, not the thoracic joint angle." },
      { joint: "neck", axes: ["flex"], role: "watch", coverage: "tracked", metric: "nod", why: "A head dropping back is watched through the face model's nod." },
    ],
    cues: [
      { id: "thoracic-extension-enough", metric: "trunk_lean", when: "change_over", value: 30, forMs: 300, text: CUE.enoughRange },
    ],
    provisional: true,
    limits: {
      en: "Cannot see the thoracic spine's own curve: it measures how far the whole trunk leans back over the chair.",
      ru: "Thoracic spine ka apna curve nahi dekh sakta: yeh naapta hai ke poora dhad kursi par kitna peeche jhuka.",
    },
  },
  {
    id: "cat-camel", region: "thoracic", tier: "B", posture: "quadruped", feasibility: "to-confirm", sided: false,
    placement: QUADRUPED_SIDE,
    need: ["near:ear", "near:shoulder", "near:elbow", "near:hip", "near:knee"],
    metrics: [
      incline("head_incline", "near:shoulder", "near:ear", "horizontal", { byFacing: true }),
      incline("trunk_incline", "near:hip", "near:shoulder", "horizontal", { byFacing: true }),
      joint("hip_angle", "near:shoulder", "near:hip", "near:knee"),
      joint("shoulder_angle", "near:hip", "near:shoulder", "near:elbow"),
    ],
    primary: { metric: "head_incline", mode: "reps", reference: "baseline", rest: 0, target: 15, abs: true, movementsPerRep: 2 },
    joints: [
      { joint: "trunk", axes: ["flex"], role: "mover", coverage: "measured", metric: "trunk_incline", why: "The tilt of the shoulder-to-hip line. The spine's own curve between those points is not visible to one camera." },
      { joint: "neck", axes: ["flex"], role: "mover", coverage: "measured", metric: "head_incline", why: "The head's rise and fall against the shoulder (side view); also what the repetitions are counted from." },
      { joint: "shoulder", axes: ["flex"], role: "mover", coverage: "measured", metric: "shoulder_angle", why: "The angle between the trunk and the upper arm on the near side." },
      { joint: "shoulder:o", axes: ["flex"], role: "mover", coverage: "not_measurable", why: "The far arm is hidden behind the near one in a side view; it is assumed to move like the near arm and is never measured." },
      { joint: "hip", axes: ["flex"], role: "mover", coverage: "measured", metric: "hip_angle", why: "The angle between the trunk and the thigh on the near side." },
      { joint: "hip:o", axes: ["flex"], role: "mover", coverage: "not_measurable", why: "The far leg is hidden behind the near one in a side view; it is assumed to move like the near leg and is never measured." },
    ],
    cues: [
      { id: "cat-camel-enough", metric: "trunk_incline", when: "change_over", value: 40, forMs: 300, text: CUE.enoughRange },
    ],
    provisional: true,
    limits: {
      en: "One counted repetition is one cat-and-camel cycle (two movements). It cannot see the spine's own curve, only the head, the shoulder-to-hip line and the near limbs. If the model cannot find a person on all fours from the side the tool offers no count for this exercise.",
      ru: "Ek ginti ek cat-aur-camel cycle (do harkatein) hai. Yeh reerh ka apna curve nahi dekh sakta, sirf sar, kandhe-se-kulhe ki line aur qareeb ke haath-pair. Agar model haath-ghutno par side se insaan na dhoondh sake to is exercise ki ginti nahi di jaegi.",
    },
  },
  {
    id: "quadruped-thoracic-rotation", region: "thoracic", tier: "B", posture: "quadruped", feasibility: "to-confirm", sided: true,
    placement: QUADRUPED_FRONT,
    need: ["nose", "leftShoulder", "rightShoulder", "other:shoulder", "other:elbow", "other:wrist"],
    metrics: [
      tilt("shoulder_turn", "leftShoulder", "rightShoulder", true),
      { id: "elbow_up", kind: "offset", a: "other:shoulder", b: "other:elbow", scale: ["leftShoulder", "rightShoulder"], axis: "y" },
      joint("elbow_angle", "other:shoulder", "other:elbow", "other:wrist"),
      { id: "nose_shift", kind: "offset", a: MID_SHOULDERS, b: "nose", scale: ["leftShoulder", "rightShoulder"], axis: "x", abs: true },
    ],
    primary: { metric: "shoulder_turn", mode: "reps", reference: "baseline", rest: 0, target: 15, abs: true, holdMs: 2000 },
    joints: [
      { joint: "trunk:t", axes: ["rot"], role: "mover", coverage: "measured", metric: "shoulder_turn", why: "Seen from in front at floor level the trunk's turn about its long axis is the shoulder line turning in the picture; it assumes the hips stay where they are." },
      { joint: "neck:t", axes: ["rot"], role: "mover", coverage: "tracked", metric: "nose_shift", why: "The head follows the elbow; its position against the shoulders is followed, the neck's own angle is not read." },
      { joint: "shoulder:o", axes: ["flex", "abd", "rot"], role: "mover", coverage: "tracked", metric: "elbow_up", why: "The reaching arm's elbow rising above its shoulder is followed; the shoulder's three separate angles cannot be told apart in one picture." },
      { joint: "elbow:o", axes: ["flex"], role: "mover", coverage: "measured", metric: "elbow_angle", why: "Shoulder-elbow-wrist angle of the reaching arm; the hand is behind the head, so the forearm is foreshortened (to confirm)." },
      { joint: "wrist:o", axes: ["flex"], role: "mover", coverage: "not_measurable", why: "The wrist with the hand behind the head is too small and turned away to read." },
    ],
    cues: [
      { id: "quad-rotation-enough", metric: "shoulder_turn", when: "change_over", value: 50, forMs: 300, text: CUE.enoughRange },
    ],
    provisional: true,
    limits: {
      en: "If the model cannot find a person on all fours facing the phone at floor level the tool offers no count for this exercise.",
      ru: "Agar model zameen ki unchai par phone ke samne haath-ghutno par insaan na dhoondh sake to is exercise ki ginti nahi di jaegi.",
    },
  },
  {
    id: "prone-thoracic-extension", region: "thoracic", tier: "B", posture: "prone", feasibility: "to-confirm", sided: false,
    placement: LYING_SIDE,
    need: ["near:ear", "near:shoulder", "near:elbow", "near:hip"],
    metrics: [
      incline("trunk_lift", "near:hip", "near:shoulder", "horizontal", { byFacing: true }),
      joint("arm_angle", "near:hip", "near:shoulder", "near:elbow"),
    ],
    primary: { metric: "trunk_lift", mode: "reps", reference: "baseline", rest: 0, target: 8, holdMs: 5000 },
    joints: [
      { joint: "trunk", axes: ["flex"], role: "mover", coverage: "measured", metric: "trunk_lift", why: "The hip-to-shoulder line rising against the horizontal. It includes the lower back's share; the thoracic curve itself is not visible to one camera." },
      { joint: "shoulder", axes: ["flex"], role: "mover", coverage: "measured", metric: "arm_angle", why: "The angle between the trunk and the upper arm on the near side." },
      { joint: "shoulder:o", axes: ["flex"], role: "mover", coverage: "not_measurable", why: "The far arm is hidden behind the near one in a side view; it is assumed to move like the near arm." },
    ],
    cues: [
      { id: "prone-extension-enough", metric: "trunk_lift", when: "change_over", value: 35, forMs: 300, text: CUE.enoughRange },
    ],
    provisional: true,
    limits: {
      en: "Counts and times the chest lift; an angle only if validated. If the model cannot find a person lying face down from the side the tool offers no count for this exercise.",
      ru: "Chest lift ki ginti aur waqt deta hai; angle tab jab validate ho. Agar model pait ke bal lete insaan ko side se na dhoondh sake to is exercise ki ginti nahi di jaegi.",
    },
  },
];
