import type { CameraSpec, SecondPass } from "./spec-types.ts";
import { BEHIND, CUE, FEET_END, FRONT_STANDING, LYING_SIDE, MID_HIPS, MID_SHOULDERS, QUADRUPED_SIDE, incline, joint, pelvisLevel, shoulderLevel, tilt } from "./spec-parts.ts";
import type { Bi } from "./types.ts";

/**
 * The twelve lumbar exercises. All but the standing side bend are done lying or on all fours, so they are read from a low phone on the working side (flexion, extension,
 * limb angles), with a short second pass from the feet end for what the side cannot see (a pelvis that drops, knees that fall in). One camera cannot see the lumbar
 * spine's own curve, a pelvic tilt or whether the deep abdominal muscles are working; the specs say so for every exercise instead of pretending.
 */
const CUE_KNEES_APART: Bi = { en: "Keep your knees hip-width apart.", ru: "Ghutne kulhon ki chaurai jitne door rakhein." };
const PELVIC_TILT_NOT_VISIBLE = "Pelvic tilt about the horizontal axis cannot be seen in a picture; the hip angle includes it, it is not separated.";

/** The hip-level and knee-gap pass from the feet end that the three bridges share. */
const bridgeSecond = (): SecondPass => ({
  placement: FEET_END,
  why: { en: "A short second pass from your feet: do both hips rise together, and do the knees stay apart?", ru: "Pairon ki taraf se ek chhota doosra round: kya dono kulhe saath uthte hain, aur kya ghutne alag rehte hain?" },
  need: ["leftHip", "rightHip", "leftKnee", "rightKnee"],
  metrics: [pelvisLevel(), { id: "knee_gap", kind: "dist", a: "leftKnee", b: "rightKnee", scale: ["leftHip", "rightHip"] }],
});

export const LUMBAR_SPECS: CameraSpec[] = [
  {
    id: "knee-to-chest", region: "lumbar", tier: "B", posture: "supine", feasibility: "to-confirm", sided: true,
    placement: LYING_SIDE,
    need: ["near:shoulder", "near:hip", "near:knee", "near:ankle", "near:elbow", "near:wrist"],
    metrics: [
      joint("hip_angle", "near:shoulder", "near:hip", "near:knee"),
      joint("knee_angle", "near:hip", "near:knee", "near:ankle"),
      joint("shoulder_angle", "near:hip", "near:shoulder", "near:elbow"),
      joint("elbow_angle", "near:shoulder", "near:elbow", "near:wrist"),
    ],
    primary: { metric: "hip_angle", mode: "reps", reference: "baseline", rest: 0, target: -45, holdMs: 20000 },
    joints: [
      { joint: "hip", axes: ["flex"], role: "mover", coverage: "measured", metric: "hip_angle", why: "The angle between the trunk and the thigh on the working side (the phone is on that side)." },
      { joint: "knee", axes: ["flex"], role: "mover", coverage: "measured", metric: "knee_angle", why: "Hip-knee-ankle angle of the working leg." },
      { joint: "shoulder", axes: ["flex"], role: "mover", coverage: "measured", metric: "shoulder_angle", why: "The angle between the trunk and the upper arm that holds the knee." },
      { joint: "elbow", axes: ["flex"], role: "mover", coverage: "measured", metric: "elbow_angle", why: "Shoulder-elbow-wrist angle of the arm holding the knee." },
      { joint: "trunk", axes: ["flex"], role: "watch", coverage: "not_measurable", why: "Whether the low back stays resting on the mat is not visible in a picture." },
    ],
    cues: [
      { id: "knee-to-chest-enough", metric: "hip_angle", when: "change_over", value: 90, forMs: 300, text: CUE.enoughRange },
    ],
    provisional: true,
    limits: {
      en: "Measures the limb angles and times the hold. It cannot see the low back flatten or the pelvis tilt.",
      ru: "Haath-pair ke angle naapta aur hold ka waqt deta hai. Kamar ka chapta hona ya pelvis ka tilt nahi dekh sakta.",
    },
  },
  {
    id: "knee-rock", region: "lumbar", tier: "B", posture: "supine", feasibility: "to-confirm", sided: true,
    placement: FEET_END,
    need: ["leftKnee", "rightKnee", "leftHip", "rightHip", "leftShoulder", "rightShoulder"],
    metrics: [
      tilt("knee_tilt", "leftKnee", "rightKnee", true),
      { id: "lumbar_twist", kind: "diff", abs: true, a: tilt("hips", "leftHip", "rightHip"), b: tilt("shoulders", "leftShoulder", "rightShoulder") },
      shoulderLevel(),
    ],
    primary: { metric: "knee_tilt", mode: "reps", reference: "baseline", rest: 0, target: 20, abs: true },
    joints: [
      { joint: "hip", axes: ["abd"], role: "mover", coverage: "measured", metric: "knee_tilt", why: "Seen from the feet, the knees falling to one side is the knee line tilting in the picture." },
      { joint: "hip", axes: ["rot"], role: "mover", coverage: "not_measurable", why: "About 10 degrees of rotation of the thigh; it is below what a picture of the knees shows." },
      { joint: "hip:o", axes: ["abd"], role: "mover", coverage: "measured", metric: "knee_tilt", why: "Both knees fall together; the knee line carries both legs." },
      { joint: "hip:o", axes: ["rot"], role: "mover", coverage: "not_measurable", why: "About 10 degrees of rotation of the thigh; it is below what a picture of the knees shows." },
      { joint: "trunk", axes: ["rot"], role: "mover", coverage: "measured", metric: "lumbar_twist", why: "The purpose of the exercise: the hip line turning against the shoulder line. Seen from the feet it is a direct stand-in for the low back's rotation; it assumes the shoulders stay flat." },
    ],
    cues: [
      { id: "knee-rock-shoulders", metric: "shoulder_level", when: "change_over", value: 6, forMs: 600, text: CUE.shouldersFlat },
      { id: "knee-rock-enough", metric: "knee_tilt", when: "change_over", value: 45, forMs: 300, text: CUE.enoughRange },
    ],
    provisional: true,
    limits: {
      en: "Needs the knees, hips and shoulders to be seen from the feet end; blankets or loose clothes over the hips can hide them, in which case the tool counts from the knees only.",
      ru: "Pairon ki taraf se ghutne, kulhe aur kandhe nazar aane chahiye; kulhon par kambal ya dheele kapde unhe chhupa sakte hain, us surat mein tool sirf ghutno se ginta hai.",
    },
  },
  {
    id: "glute-bridge", region: "lumbar", tier: "B", posture: "supine", feasibility: "to-confirm", sided: false,
    placement: LYING_SIDE,
    need: ["near:ear", "nose", "near:shoulder", "near:elbow", "near:hip", "near:knee", "near:ankle"],
    metrics: [
      joint("hip_angle", "near:shoulder", "near:hip", "near:knee"),
      joint("knee_angle", "near:hip", "near:knee", "near:ankle"),
      joint("shoulder_angle", "near:hip", "near:shoulder", "near:elbow"),
      incline("head_line", "near:ear", "nose", "horizontal", { byFacing: true }),
    ],
    primary: { metric: "hip_angle", mode: "reps", reference: "baseline", rest: 0, target: 30, holdMs: 3000 },
    joints: [
      { joint: "hip", axes: ["flex"], role: "mover", coverage: "measured", metric: "hip_angle", why: "The angle between the trunk and the thigh on the near side: the hip rising towards a straight line." },
      { joint: "knee", axes: ["flex"], role: "mover", coverage: "measured", metric: "knee_angle", why: "Hip-knee-ankle angle on the near side (a change of about 8 degrees, at the limit of what is read)." },
      { joint: "shoulder", axes: ["flex"], role: "mover", coverage: "measured", metric: "shoulder_angle", why: "The angle between the trunk and the upper arm resting on the mat." },
      { joint: "neck", axes: ["flex"], role: "mover", coverage: "tracked", metric: "head_line", why: "The head resting on the mat is followed through the ear-to-nose line; about 12 degrees, not read as an angle." },
      { joint: "pelvis", axes: ["flex"], role: "mover", coverage: "not_measurable", why: PELVIC_TILT_NOT_VISIBLE },
      { joint: "hip:o", axes: ["flex"], role: "mover", coverage: "tracked", metric: "pelvis_level", pass: 2, why: "The far hip is hidden behind the near one in a side view; the second pass from the feet shows whether both hips rise together." },
      { joint: "knee:o", axes: ["flex"], role: "mover", coverage: "tracked", metric: "knee_gap", pass: 2, why: "The far knee is hidden in a side view; the second pass shows whether the knees stay apart." },
      { joint: "shoulder:o", axes: ["flex"], role: "mover", coverage: "not_measurable", why: "The far arm is hidden behind the near one; it rests on the mat and is assumed to match." },
    ],
    cues: [
      { id: "bridge-hips-level", metric: "pelvis_level", when: "change_over", value: 5, forMs: 500, text: CUE.hipsLevel, pass: 2 },
      { id: "bridge-knees-apart", metric: "knee_gap", when: "change_over", value: 0.2, forMs: 600, text: CUE_KNEES_APART, pass: 2 },
    ],
    second: bridgeSecond(),
    provisional: true,
    limits: {
      en: "Counts the bridge, times the hold and watches the hips and knees; an angle only if validated. It cannot see a tilting pelvis or the lower back arching.",
      ru: "Bridge ki ginti, hold ka waqt aur kulhon-ghutno ki nigrani; angle tab jab validate ho. Pelvis ka tilt ya kamar ka arch nahi dekh sakta.",
    },
  },
  {
    id: "single-leg-bridge", region: "lumbar", tier: "B", posture: "supine", feasibility: "to-confirm", sided: true,
    placement: LYING_SIDE,
    need: ["near:ear", "nose", "tested:shoulder", "tested:elbow", "tested:hip", "tested:knee", "tested:ankle"],
    metrics: [
      joint("hip_angle", "tested:shoulder", "tested:hip", "tested:knee"),
      joint("knee_angle", "tested:hip", "tested:knee", "tested:ankle"),
      joint("shoulder_angle", "tested:hip", "tested:shoulder", "tested:elbow"),
      incline("head_line", "near:ear", "nose", "horizontal", { byFacing: true }),
    ],
    primary: { metric: "hip_angle", mode: "reps", reference: "baseline", rest: 0, target: 30, holdMs: 3000 },
    joints: [
      { joint: "hip", axes: ["flex"], role: "mover", coverage: "measured", metric: "hip_angle", why: "The angle between the trunk and the thigh of the supporting leg (the phone goes on that side)." },
      { joint: "knee", axes: ["flex"], role: "mover", coverage: "measured", metric: "knee_angle", why: "Hip-knee-ankle angle of the supporting leg (about 8 degrees, at the limit of what is read)." },
      { joint: "shoulder", axes: ["flex"], role: "mover", coverage: "measured", metric: "shoulder_angle", why: "The angle between the trunk and the upper arm resting on the mat." },
      { joint: "shoulder:o", axes: ["flex"], role: "mover", coverage: "not_measurable", why: "The far arm is hidden behind the near one; it rests on the mat and is assumed to match." },
      { joint: "neck", axes: ["flex"], role: "mover", coverage: "tracked", metric: "head_line", why: "The head resting on the mat is followed through the ear-to-nose line; about 12 degrees, not read as an angle." },
      { joint: "pelvis", axes: ["flex"], role: "mover", coverage: "not_measurable", why: PELVIC_TILT_NOT_VISIBLE },
      { joint: "pelvis", axes: ["drop"], role: "watch", coverage: "measured", metric: "pelvis_level", pass: 2, why: "A hip dropping on the side of the lifted leg is the commonest fault of this exercise; seen from the feet as the hip line tilting." },
    ],
    cues: [
      { id: "single-bridge-hips-level", metric: "pelvis_level", when: "change_over", value: 5, forMs: 500, text: CUE.hipsLevel, pass: 2 },
    ],
    second: bridgeSecond(),
    provisional: true,
    limits: {
      en: "The second pass from the feet matters most here (a dropping hip). It cannot see a tilting pelvis or the lower back arching.",
      ru: "Yahan pairon ki taraf se doosra round sab se zaroori hai (kulha girna). Pelvis ka tilt ya kamar ka arch nahi dekh sakta.",
    },
  },
  {
    id: "dead-bug", region: "lumbar", tier: "B", posture: "supine", feasibility: "to-confirm", sided: true,
    placement: LYING_SIDE,
    need: ["other:shoulder", "other:hip", "other:knee", "other:ankle"],
    metrics: [
      joint("leg_hip", "other:shoulder", "other:hip", "other:knee"),
      joint("leg_knee", "other:hip", "other:knee", "other:ankle"),
    ],
    primary: { metric: "leg_hip", mode: "reps", reference: "baseline", rest: 0, target: 50 },
    joints: [
      { joint: "hip:o", axes: ["flex"], role: "mover", coverage: "measured", metric: "leg_hip", why: "The angle between the trunk and the thigh of the leg that lowers (the phone goes on that leg's side)." },
      { joint: "knee:o", axes: ["flex"], role: "mover", coverage: "measured", metric: "leg_knee", why: "Hip-knee-ankle angle of the leg that lowers." },
      { joint: "shoulder", axes: ["flex"], role: "mover", coverage: "measured", metric: "arm_reach", pass: 2, why: "The arm that reaches overhead is on the far side in this view; the second pass puts the phone on that side." },
      { joint: "trunk", axes: ["flex"], role: "watch", coverage: "not_measurable", why: "Whether the low back stays flat is the point of the exercise and is not visible in a picture." },
    ],
    cues: [
      { id: "dead-bug-enough", metric: "leg_hip", when: "change_over", value: 100, forMs: 300, text: CUE.enoughRange },
    ],
    second: {
      placement: LYING_SIDE,
      why: { en: "For the next set put the phone on the side of the ARM that reaches, so the arm is seen.", ru: "Agle set mein phone us bazu ki taraf rakhein jo upar jata hai, taake bazu nazar aaye." },
      need: ["tested:shoulder", "tested:elbow", "tested:hip"],
      metrics: [joint("arm_reach", "tested:hip", "tested:shoulder", "tested:elbow")],
    },
    provisional: true,
    limits: {
      en: "The arm and the leg that move are on opposite sides, so one set is seen from the leg's side and the next from the arm's side. It cannot see whether the low back stays flat.",
      ru: "Haath aur pair jo hilte hain ulte taraf hote hain, isliye ek set pair ki taraf se aur agla set bazu ki taraf se dekha jata hai. Yeh nahi dekh sakta ke kamar chapti rehti hai ya nahi.",
    },
  },
  {
    id: "bird-dog", region: "lumbar", tier: "B", posture: "quadruped", feasibility: "to-confirm", sided: true,
    placement: QUADRUPED_SIDE,
    need: ["tested:hip", "tested:shoulder", "tested:elbow", "other:shoulder", "other:hip", "other:knee", "other:ankle", "other:footIndex"],
    metrics: [
      joint("arm_reach", "tested:hip", "tested:shoulder", "tested:elbow"),
      joint("leg_hip", "other:shoulder", "other:hip", "other:knee"),
      joint("leg_knee", "other:hip", "other:knee", "other:ankle"),
      joint("foot_angle", "other:knee", "other:ankle", "other:footIndex"),
      incline("back_level", "tested:hip", "tested:shoulder", "horizontal", { byFacing: true, abs: true }),
    ],
    primary: { metric: "leg_hip", mode: "reps", reference: "baseline", rest: 0, target: 60, holdMs: 5000 },
    joints: [
      { joint: "shoulder", axes: ["flex"], role: "mover", coverage: "measured", metric: "arm_reach", why: "The angle between the trunk and the reaching arm (the arm extends beyond the body, so it is seen even on the far side)." },
      { joint: "elbow", axes: ["rot"], role: "mover", coverage: "not_measurable", why: "Rotation of the forearm about its own axis is not visible." },
      { joint: "wrist", axes: ["flex"], role: "mover", coverage: "not_measurable", why: "The hand is too small to read." },
      { joint: "hip:o", axes: ["flex"], role: "mover", coverage: "measured", metric: "leg_hip", why: "The angle between the trunk and the thigh of the reaching leg: the main result (the counted movement)." },
      { joint: "knee:o", axes: ["flex"], role: "mover", coverage: "measured", metric: "leg_knee", why: "Hip-knee-ankle angle of the reaching leg." },
      { joint: "ankle:o", axes: ["flex"], role: "mover", coverage: "measured", metric: "foot_angle", why: "Knee-ankle-toe angle of the reaching foot; the foot is small, so low confidence is likely." },
      { joint: "trunk", axes: ["flex"], role: "watch", coverage: "measured", metric: "back_level", why: "A back that stays level (the hip-to-shoulder line against the horizontal)." },
      { joint: "pelvis", axes: ["rot"], role: "watch", coverage: "measured", metric: "pelvis_level", pass: 2, why: "The pelvis turning as the leg lifts, seen from behind as the hip line tilting." },
    ],
    cues: [
      { id: "bird-dog-back", metric: "back_level", when: "change_over", value: 8, forMs: 600, text: CUE.backLevel },
      { id: "bird-dog-hips", metric: "pelvis_level", when: "change_over", value: 6, forMs: 600, text: CUE.hipsLevel, pass: 2 },
    ],
    second: {
      placement: BEHIND,
      why: { en: "A short second pass from behind: does the pelvis stay level as the leg lifts?", ru: "Peeche se ek chhota doosra round: kya pair uthne par pelvis barabar rehta hai?" },
      need: ["leftHip", "rightHip", "leftShoulder", "rightShoulder"],
      metrics: [pelvisLevel(), shoulderLevel()],
    },
    provisional: true,
    limits: {
      en: "The arm and the leg that reach are on opposite sides but both extend beyond the body, so one side view sees both when the model finds them. If it cannot, the tool counts from the leg only.",
      ru: "Haath aur pair jo bahar jate hain ulte taraf hote hain lekin dono jism se bahar nikalte hain, isliye ek side view dono dekh leta hai jab model unhe dhoondh le. Warna tool sirf pair se ginta hai.",
    },
  },
  {
    id: "front-plank", region: "lumbar", tier: "B", posture: "prone", feasibility: "to-confirm", sided: false,
    placement: QUADRUPED_SIDE,
    need: ["near:shoulder", "near:elbow", "near:hip", "near:knee", "near:ankle", "near:footIndex"],
    metrics: [
      { id: "hip_line", kind: "offset", a: "near:hip", b: { mid: ["near:shoulder", "near:ankle"] }, scale: ["near:shoulder", "near:ankle"], axis: "y" },
      joint("shoulder_angle", "near:hip", "near:shoulder", "near:elbow"),
      joint("knee_angle", "near:hip", "near:knee", "near:ankle"),
      joint("ankle_angle", "near:knee", "near:ankle", "near:footIndex"),
    ],
    primary: { metric: "hip_line", mode: "hold-steady", reference: "baseline", rest: 0, target: 0.06, holdMs: 20000 },
    joints: [
      { joint: "pelvis", axes: ["flex"], role: "mover", coverage: "tracked", metric: "hip_line", why: "A sagging or piking hip shows as the hip leaving the shoulder-to-ankle line; the pelvic tilt itself is not read." },
      { joint: "shoulder", axes: ["flex"], role: "mover", coverage: "measured", metric: "shoulder_angle", why: "The angle between the trunk and the upper arm on the near side." },
      { joint: "shoulder:o", axes: ["flex"], role: "mover", coverage: "not_measurable", why: "The far arm is hidden behind the near one; it is assumed to match." },
      { joint: "knee", axes: ["flex"], role: "mover", coverage: "measured", metric: "knee_angle", why: "Hip-knee-ankle angle on the near side: straight legs." },
      { joint: "knee:o", axes: ["flex"], role: "mover", coverage: "not_measurable", why: "The far leg is hidden behind the near one; it is assumed to match." },
      { joint: "ankle", axes: ["flex"], role: "mover", coverage: "measured", metric: "ankle_angle", why: "Knee-ankle-toe angle on the near side; the foot is small, so low confidence is likely." },
      { joint: "ankle:o", axes: ["flex"], role: "mover", coverage: "not_measurable", why: "The far foot is hidden behind the near one." },
      { joint: "toe", axes: ["flex"], role: "mover", coverage: "not_measurable", why: "The toes are too small to read; only the foot index point exists." },
      { joint: "toe:o", axes: ["flex"], role: "mover", coverage: "not_measurable", why: "The toes are too small to read; only the foot index point exists." },
    ],
    cues: [
      { id: "plank-line", metric: "hip_line", when: "change_over", value: 0.06, forMs: 800, text: CUE.bodyLine },
    ],
    provisional: true,
    limits: {
      en: "Times how long the body stays in its starting line; it cannot see whether the deep abdominal muscles are working.",
      ru: "Yeh naapta hai ke jism kitni der apni shuru ki line mein raha; yeh nahi dekh sakta ke gehre pait ke muscles kaam kar rahe hain ya nahi.",
    },
  },
  {
    id: "supine-marching", region: "lumbar", tier: "B", posture: "supine", feasibility: "to-confirm", sided: true,
    placement: LYING_SIDE,
    need: ["tested:shoulder", "tested:hip", "tested:knee", "tested:ankle"],
    metrics: [
      joint("hip_angle", "tested:shoulder", "tested:hip", "tested:knee"),
      joint("knee_angle", "tested:hip", "tested:knee", "tested:ankle"),
    ],
    primary: { metric: "hip_angle", mode: "reps", reference: "baseline", rest: 0, target: -25, holdMs: 2000 },
    joints: [
      { joint: "hip", axes: ["flex"], role: "mover", coverage: "measured", metric: "hip_angle", why: "The angle between the trunk and the thigh of the marching leg (the phone goes on that side)." },
      { joint: "knee", axes: ["flex"], role: "mover", coverage: "measured", metric: "knee_angle", why: "Hip-knee-ankle angle of the marching leg (about 6 degrees, at the limit of what is read)." },
      { joint: "pelvis", axes: ["drop"], role: "watch", coverage: "measured", metric: "pelvis_level", pass: 2, why: "The pelvis staying level as the leg lifts, seen from the feet." },
      { joint: "trunk", axes: ["flex"], role: "watch", coverage: "not_measurable", why: "Whether the low back stays still is the point of the exercise and is not visible in a picture." },
    ],
    cues: [
      { id: "marching-hips-level", metric: "pelvis_level", when: "change_over", value: 5, forMs: 500, text: CUE.hipsLevel, pass: 2 },
    ],
    second: {
      placement: FEET_END,
      why: { en: "A short second pass from your feet: does the pelvis stay level as the leg lifts?", ru: "Pairon ki taraf se ek chhota doosra round: kya pair uthne par pelvis barabar rehta hai?" },
      need: ["leftHip", "rightHip"],
      metrics: [pelvisLevel()],
    },
    provisional: true,
    limits: {
      en: "Counts the marching and watches the pelvis; it cannot see whether the low back or the deep abdominal muscles are controlling it.",
      ru: "Marching ki ginti aur pelvis ki nigrani; yeh nahi dekh sakta ke kamar ya gehre pait ke muscles use control kar rahe hain ya nahi.",
    },
  },
  {
    id: "mcgill-curl-up", region: "lumbar", tier: "B", posture: "supine", feasibility: "to-confirm", sided: true,
    placement: LYING_SIDE,
    need: ["near:ear", "near:shoulder", "near:hip"],
    metrics: [
      incline("trunk_incline", "near:hip", "near:shoulder", "horizontal", { byFacing: true }),
      { id: "neck_on_trunk", kind: "diff", abs: true, a: incline("head_incl", "near:shoulder", "near:ear", "horizontal", { byFacing: true }), b: incline("trunk_incl", "near:hip", "near:shoulder", "horizontal", { byFacing: true }) },
    ],
    primary: { metric: "trunk_incline", mode: "reps", reference: "baseline", rest: 0, target: 8, holdMs: 7000 },
    joints: [
      { joint: "trunk", axes: ["flex"], role: "mover", coverage: "measured", metric: "trunk_incline", why: "The hip-to-shoulder line rising against the horizontal: the small lift of the head and shoulders." },
      { joint: "neck", axes: ["flex"], role: "mover", coverage: "measured", metric: "neck_on_trunk", why: "The head's line against the trunk's line: a head that stays in line with the chest reads near zero, a chin poking forward reads larger." },
    ],
    cues: [
      { id: "curl-up-head", metric: "neck_on_trunk", when: "change_over", value: 12, forMs: 500, text: CUE.headInLine },
      { id: "curl-up-enough", metric: "trunk_incline", when: "change_over", value: 30, forMs: 300, text: CUE.enoughRange },
    ],
    provisional: true,
    limits: {
      en: "Times the lift and checks the head stays in line; it cannot see the abdominal muscles or the low back's position.",
      ru: "Uthne ka waqt naapta aur dekhta hai ke sar seene ki seedh mein raha; yeh pait ke muscles ya kamar ki position nahi dekh sakta.",
    },
  },
  {
    id: "bridge-with-ball", region: "lumbar", tier: "B", posture: "supine", feasibility: "to-confirm", sided: false,
    placement: LYING_SIDE,
    need: ["near:ear", "nose", "near:shoulder", "near:elbow", "near:hip", "near:knee", "near:ankle"],
    metrics: [
      joint("hip_angle", "near:shoulder", "near:hip", "near:knee"),
      joint("knee_angle", "near:hip", "near:knee", "near:ankle"),
      joint("shoulder_angle", "near:hip", "near:shoulder", "near:elbow"),
      incline("head_line", "near:ear", "nose", "horizontal", { byFacing: true }),
    ],
    primary: { metric: "hip_angle", mode: "reps", reference: "baseline", rest: 0, target: 30, holdMs: 3000 },
    joints: [
      { joint: "hip", axes: ["flex"], role: "mover", coverage: "measured", metric: "hip_angle", why: "The angle between the trunk and the thigh on the near side: the hip rising towards a straight line." },
      { joint: "knee", axes: ["flex"], role: "mover", coverage: "measured", metric: "knee_angle", why: "Hip-knee-ankle angle on the near side (about 8 degrees, at the limit of what is read)." },
      { joint: "shoulder", axes: ["flex"], role: "mover", coverage: "measured", metric: "shoulder_angle", why: "The angle between the trunk and the upper arm resting on the mat." },
      { joint: "neck", axes: ["flex"], role: "mover", coverage: "tracked", metric: "head_line", why: "The head resting on the mat is followed through the ear-to-nose line; about 12 degrees, not read as an angle." },
      { joint: "pelvis", axes: ["flex"], role: "mover", coverage: "not_measurable", why: PELVIC_TILT_NOT_VISIBLE },
      { joint: "hip:o", axes: ["flex"], role: "mover", coverage: "tracked", metric: "pelvis_level", pass: 2, why: "The far hip is hidden behind the near one in a side view; the second pass from the feet shows whether both hips rise together." },
      { joint: "knee:o", axes: ["flex"], role: "mover", coverage: "tracked", metric: "knee_gap", pass: 2, why: "The far knee is hidden in a side view; the second pass shows whether the knees stay together on the ball." },
      { joint: "shoulder:o", axes: ["flex"], role: "mover", coverage: "not_measurable", why: "The far arm is hidden behind the near one; it rests on the mat and is assumed to match." },
    ],
    cues: [
      { id: "ball-bridge-hips-level", metric: "pelvis_level", when: "change_over", value: 5, forMs: 500, text: CUE.hipsLevel, pass: 2 },
      { id: "ball-bridge-ball", metric: "knee_gap", when: "change_over", value: 0.2, forMs: 600, text: CUE.ballBetweenKnees, pass: 2 },
    ],
    second: bridgeSecond(),
    provisional: true,
    limits: {
      en: "Counts the bridge, times the hold and watches the hips and the gap between the knees; it cannot see how hard the ball is squeezed.",
      ru: "Bridge ki ginti, hold ka waqt aur kulhon-ghutno ki nigrani; yeh nahi dekh sakta ke ball kitni dabayi gayi.",
    },
  },
  {
    id: "standing-side-bend", region: "lumbar", tier: "A", posture: "standing", feasibility: "standard", sided: true,
    placement: FRONT_STANDING,
    need: ["leftShoulder", "rightShoulder", "leftHip", "rightHip", "tested:hip", "tested:shoulder", "tested:elbow", "other:hip", "other:shoulder", "other:elbow"],
    metrics: [
      incline("trunk_tilt", MID_HIPS, MID_SHOULDERS, "vertical", { abs: true }),
      joint("shoulder_angle_t", "tested:hip", "tested:shoulder", "tested:elbow"),
      joint("shoulder_angle_o", "other:hip", "other:shoulder", "other:elbow"),
      { id: "chest_turn", kind: "rotation", a: "leftShoulder", b: "rightShoulder", abs: true },
    ],
    primary: { metric: "trunk_tilt", mode: "reps", reference: "baseline", rest: 0, target: 15, abs: true },
    joints: [
      { joint: "trunk:t", axes: ["abd"], role: "mover", coverage: "measured", metric: "trunk_tilt", why: "The line from the middle of the hips to the middle of the shoulders against the vertical, seen from the front (the plane of the movement)." },
      { joint: "shoulder", axes: ["abd"], role: "mover", coverage: "measured", metric: "shoulder_angle_t", why: "Hip-shoulder-elbow angle of the arm that slides down the leg." },
      { joint: "shoulder:o", axes: ["abd"], role: "mover", coverage: "measured", metric: "shoulder_angle_o", why: "Hip-shoulder-elbow angle of the other arm." },
      { joint: "trunk", axes: ["rot"], role: "watch", coverage: "measured", metric: "chest_turn", why: "A turning chest would mean the bend is leaving the side." },
    ],
    cues: [
      { id: "side-bend-chest", metric: "chest_turn", when: "change_over", value: 12, forMs: 500, text: CUE.chestFacing },
      { id: "side-bend-enough", metric: "trunk_tilt", when: "change_over", value: 40, forMs: 300, text: CUE.enoughRange },
    ],
    provisional: true,
    limits: {
      en: "The whole trunk's tilt is measured; the low back's own share of it cannot be separated from the chest's.",
      ru: "Poore dhad ka jhukao naapa jata hai; kamar ka apna hissa seene ke hisse se alag nahi kiya ja sakta.",
    },
  },
  {
    id: "prone-on-elbows", region: "lumbar", tier: "B", posture: "prone", feasibility: "to-confirm", sided: false,
    placement: LYING_SIDE,
    need: ["near:ear", "near:shoulder", "near:elbow", "near:hip"],
    metrics: [
      incline("trunk_lift", "near:hip", "near:shoulder", "horizontal", { byFacing: true }),
      joint("shoulder_angle", "near:hip", "near:shoulder", "near:elbow"),
    ],
    primary: { metric: "trunk_lift", mode: "hold-reach", reference: "baseline", rest: 0, target: 10, holdMs: 30000 },
    joints: [
      { joint: "trunk", axes: ["flex"], role: "watch", coverage: "measured", metric: "trunk_lift", why: "No joint moves in this exercise (the position is held); the propped-up trunk's tilt is the position being timed." },
      { joint: "shoulder", axes: ["flex"], role: "watch", coverage: "measured", metric: "shoulder_angle", why: "The elbows stay under the shoulders (the angle between the trunk and the upper arm)." },
    ],
    cues: [
      { id: "prone-elbows-enough", metric: "trunk_lift", when: "change_over", value: 40, forMs: 300, text: CUE.enoughRange },
    ],
    provisional: true,
    limits: {
      en: "Times how long the position is held; the low back's own curve and the amount of extension in it cannot be seen.",
      ru: "Yeh naapta hai ke position kitni der rahi; kamar ka apna curve aur usmein extension ki miqdar nahi dekhi ja sakti.",
    },
  },
];
