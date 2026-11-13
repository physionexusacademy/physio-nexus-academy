/**
 * Peripheral nerves: the nerve's course flows as a glowing ribbon along the limb, its skin territory lights up, the movement it
 * powers is shown, and then what happens when it is injured. Where the 3D patient cannot show the sign (a winging scapula, a claw
 * hand), the course and territory are shown and the sign is described.
 */
import { P, toward } from "../../virtual-patient/parts.ts";
import type { Pose } from "../../virtual-patient/engine.ts";
import type { Scene } from "../scene-types.ts";
import { PRO, ramp, SUP } from "./shared.ts";

type Motor = {
  /** What is tested, e.g. "Wrist extension". */
  label: string;
  normal: (s: "left" | "right", a: number) => Pose;
  injured: (s: "left" | "right", a: number) => Pose;
  normalText: string;
  injuredText: string;
};

type Nerve = {
  id: string;
  title: string;
  roots: string;
  position: Scene["position"];
  planted?: string;
  /** Course, from the spine towards the periphery. A second ribbon can follow for branches. */
  path: string[];
  branch?: string[];
  /** Cutaneous territories that glow (nerve ids from the surface map). Motor-only nerves have none. */
  zones?: string[];
  /** A skin point inside the nerve's own (autonomous) zone. */
  zonePoint?: string;
  /** Where it is exposed to injury. */
  danger?: { at: string; label: string };
  motor?: Motor;
  /** What the nerve supplies when there is nothing to show in 3D (motor-only nerves). */
  supplies: string;
  injury: string;
  frame: Scene["frame"];
};

function nerveScene(n: Nerve): Scene {
  const rest = (s: "left" | "right") => (n.motor ? n.motor.normal(s, 0) : {});
  const hasZone = Boolean(n.zones?.length);
  const beat2 = hasZone ? `Sensation: its skin territory lights up${n.zonePoint ? " — the autonomous zone is marked" : ""}` : `Motor nerve — ${n.supplies}`;
  return {
    kind: "nerve",
    title: n.title,
    position: n.position,
    planted: n.planted,
    loopMs: 15000,
    frame: n.frame,
    zone: hasZone ? { nerves: n.zones, color: "#ff5bd8", when: [0.25, 1] } : undefined,
    pose: (s, u) => {
      if (!n.motor) return {};
      if (u < 0.5) return rest(s);
      if (u < 0.75) return n.motor.normal(s, ramp(u, 0.52, 0.68));
      return n.motor.injured(s, ramp(u, 0.77, 0.9));
    },
    beats: [
      { to: 0.25, text: `${n.title} (${n.roots}): follow its course`, chip: "Course" },
      { to: 0.5, text: beat2, chip: hasZone ? "Sensation" : "Supplies" },
      { to: 0.75, text: n.motor ? `Healthy: ${n.motor.normalText}` : n.danger ? `Vulnerable at: ${n.danger.label}` : "Healthy nerve", chip: n.motor ? "Movement" : "Weak point" },
      { to: 1, text: n.motor ? `Injured: ${n.motor.injuredText}` : n.injury, chip: "If injured" },
    ],
    overlays: [
      { t: "path", pts: n.path, tone: "cyan", flow: true, width: 7, label: (c) => (c.u < 0.25 ? "Nerve course" : ""), when: [0.01, 1] },
      ...(n.branch ? [{ t: "path" as const, pts: n.branch, tone: "cyan" as const, flow: true, width: 6, when: [0.01, 1] as [number, number] }] : []),
      ...(n.zonePoint ? [{ t: "beacon" as const, at: n.zonePoint, label: "Autonomous zone", tone: "magenta" as const, when: [0.26, 0.5] as [number, number] }] : []),
      ...(n.danger ? [{ t: "beacon" as const, at: n.danger.at, label: n.danger.label, tone: "amber" as const, when: [0.5, 0.75] as [number, number] }] : []),
      ...(n.danger ? [{ t: "beacon" as const, at: n.danger.at, tone: "red" as const, when: [0.75, 1] as [number, number] }] : []),
    ],
    hud: [
      { t: "stat", label: "Nerve", value: n.title.replace(" nerve", ""), sub: n.roots, tone: "magenta" },
      ...(n.motor ? [{ t: "stat" as const, label: (n.motor.label), value: (c: { u: number }) => (c.u < 0.5 ? "—" : c.u < 0.75 ? "Strong" : "Lost"), tone: "amber" as const, at: "bl" as const, when: [0.5, 1] as [number, number] }] : []),
    ],
  };
}

const NERVES: Nerve[] = [
  {
    id: "axillary",
    title: "Axillary nerve",
    roots: "C5–C6",
    position: "sitting",
    path: ["upperarm01{0,0.0,-0.03}", "upperarm01{0.045,-0.03,0}", "upperarm01+lowerarm01*0.35{0.035,0,0}"],
    zones: ["axillary"],
    zonePoint: "key:axillary",
    danger: { at: "upperarm01{0.02,-0.06,-0.02}", label: "Surgical neck of the humerus" },
    motor: {
      label: "Deltoid",
      normal: (s, a) => P(s, { shoulder: { abd: 85 * a }, elbow: { flex: 12 } }),
      injured: (s, a) => P(s, { shoulder: { abd: 85 * (1 - a) + 10 * a }, elbow: { flex: 12 } }),
      normalText: "the arm lifts out to the side (deltoid, C5–C6)",
      injuredText: "the arm cannot be abducted; the deltoid flattens and the “regimental badge” patch is numb. Seen after shoulder dislocation or surgical-neck fracture",
    },
    supplies: "deltoid and teres minor",
    injury: "",
    frame: { focus: "upperarm01", zoom: 1.6, view: [0.25, 0.15, 1], around: ["upperarm01+lowerarm01*0.5", "@ac-joint"] },
  },
  {
    id: "musculocutaneous",
    title: "Musculocutaneous nerve",
    roots: "C5–C7",
    position: "sitting",
    path: ["upperarm01{-0.02,-0.02,0.02}", "upperarm01+lowerarm01*0.5{-0.01,0,0.03}", "lowerarm01", "lowerarm01+wrist*0.55"],
    zones: ["musculocutaneous"],
    zonePoint: "key:musculocutaneous",
    danger: { at: "upperarm01{-0.02,-0.03,0.02}", label: "Coracobrachialis (pierced by the nerve)" },
    motor: {
      label: "Biceps",
      normal: (s, a) => P(s, { shoulder: { flex: 6 }, elbow: { flex: 105 * a, rot: 75 * a } }),
      injured: (s, a) => P(s, { shoulder: { flex: 6 }, elbow: { flex: 105 * (1 - a) + 14 * a, rot: 75 * (1 - a) + 4 * a } }),
      normalText: "the elbow flexes and the forearm supinates (biceps, brachialis)",
      injuredText: "weak elbow flexion and supination, numb lateral forearm, biceps reflex lost. Injured by shoulder dislocation or humeral fracture",
    },
    supplies: "biceps, brachialis and coracobrachialis",
    injury: "",
    frame: { focus: "lowerarm01", zoom: 1.5, view: [1, 0.2, 0.4], around: ["upperarm01", "wrist"] },
  },
  {
    id: "radial",
    title: "Radial nerve",
    roots: "C5–T1",
    position: "sitting",
    path: ["upperarm01", "upperarm01+lowerarm01*0.45", "@lateral-epicondyle", "lowerarm01+wrist*0.5", "wrist", "finger1-1"],
    zones: ["radial"],
    zonePoint: "key:radial",
    danger: { at: "upperarm01+lowerarm01*0.45", label: "Spiral groove of the humerus" },
    motor: {
      label: "Wrist extensors",
      normal: (s, a) => P(s, { shoulder: { flex: 80 }, elbow: { flex: 15, rot: PRO }, wrist: { flex: -42 * a }, fingers: { flex: 0 } }),
      injured: (s, a) => P(s, { shoulder: { flex: 80 }, elbow: { flex: 15, rot: PRO }, wrist: { flex: -42 * (1 - a) + 52 * a }, fingers: { flex: 32 * a } }),
      normalText: "the wrist extends against gravity (radial nerve)",
      injuredText: "WRIST DROP: the wrist and fingers cannot extend. Common after a mid-shaft humeral fracture (spiral groove) or “Saturday-night palsy”",
    },
    supplies: "triceps and every extensor of the wrist and fingers",
    injury: "",
    frame: { focus: "lowerarm01+wrist", zoom: 1.5, view: [0.7, 0.45, 0.5], around: ["upperarm01+lowerarm01*0.45", "finger3-3>"] },
  },
  {
    id: "median",
    title: "Median nerve",
    roots: "C6–T1",
    position: "sitting",
    path: ["upperarm01", "upperarm01+lowerarm01*0.5", "lowerarm01", "lowerarm01+wrist*0.5", "wrist", "finger2-1"],
    branch: ["wrist", "finger1-1"],
    zones: ["median"],
    zonePoint: "key:median",
    danger: { at: "wrist", label: "Carpal tunnel" },
    motor: {
      label: "Thumb abduction",
      normal: (s, a) => P(s, { shoulder: { flex: 10 }, elbow: { flex: 90, rot: SUP }, thumb: { abd: 58 * a, flex: 4 } }),
      injured: (s, a) => P(s, { shoulder: { flex: 10 }, elbow: { flex: 90, rot: SUP }, thumb: { abd: 58 * (1 - a) + 4 * a, flex: 4 } }),
      normalText: "the thumb lifts away from the palm — “point to the ceiling” (abductor pollicis brevis)",
      injuredText: "the thumb stays flat in the palm (“ape hand”) and the thenar muscles waste. Carpal tunnel syndrome is the commonest cause",
    },
    supplies: "forearm flexors (pronator teres, FCR, FDS), the thenar muscles and the first two lumbricals",
    injury: "",
    frame: { focus: "wrist+finger1-1", zoom: 0.9, view: [0.3, 1, 0.3], around: ["lowerarm01", "finger2-3>"] },
  },
  {
    id: "ulnar",
    title: "Ulnar nerve",
    roots: "C8–T1",
    position: "sitting",
    path: ["upperarm01", "@medial-epicondyle", "lowerarm01+wrist*0.5", "wrist", "finger5-1"],
    zones: ["ulnar", "medial-antebrachial"],
    zonePoint: "key:ulnar",
    danger: { at: "@medial-epicondyle", label: "Cubital tunnel (the “funny bone”)" },
    supplies: "FCU, the ulnar half of FDP, the hypothenar muscles, interossei and the ring/little finger lumbricals",
    injury: "CLAW HAND of the ring and little fingers, weak finger abduction and a positive Froment’s sign (thumb IP flexes to grip paper). Cubital-tunnel compression at the elbow is the commonest site",
    frame: { focus: "lowerarm01", zoom: 1.5, view: [1, 0.25, 0.1], around: ["upperarm01", "finger5-3>"] },
  },
  {
    id: "long-thoracic",
    title: "Long thoracic nerve",
    roots: "C5–C7",
    position: "standing",
    path: ["neck02{0.04,0,-0.02}", "upperarm01{0,-0.02,-0.04}", "spine03{0.13,-0.02,-0.01}"],
    danger: { at: "spine03{0.13,-0.02,-0.01}", label: "Lies on the chest wall" },
    supplies: "serratus anterior, which holds the scapula flat on the ribs",
    injury: "WINGING OF THE SCAPULA, worst when pushing the arm forward against a wall. Follows axillary surgery, mastectomy or a heavy load on the shoulder",
    frame: { focus: "upperarm01", zoom: 1.9, view: [0.6, 0.15, -1], around: ["spine03{0.13,-0.02,-0.01}", "neck02"] },
  },
  {
    id: "spinal-accessory",
    title: "Spinal accessory nerve (CN XI)",
    roots: "cranial",
    position: "standing",
    path: ["@ear{0,-0.03,-0.02}", "neck02{0.045,0,0}", "@ac-joint{0,0.015,-0.02}", "@scapular-spine"],
    danger: { at: "neck02{0.045,0,0}", label: "Posterior triangle: easily cut at neck surgery or biopsy" },
    supplies: "sternocleidomastoid and trapezius",
    injury: "the shoulder droops, shrugging is weak and the arm cannot be raised fully above 90°. Often after lymph-node biopsy or neck dissection",
    frame: { focus: "neck02", zoom: 1.7, view: [0.5, 0.2, -1], around: ["@ear", "@scapular-spine"] },
  },
  {
    id: "suprascapular",
    title: "Suprascapular nerve",
    roots: "C5–C6",
    position: "sitting",
    path: ["neck02{0.04,0,-0.02}", "@scapular-spine{0,0.03,0}", "@scapular-spine"],
    danger: { at: "@scapular-spine{0,0.02,0}", label: "Suprascapular notch / spinoglenoid notch" },
    motor: {
      label: "External rotation",
      normal: (s, a) => P(s, { shoulder: { flex: 4, rot: -48 * a }, elbow: { flex: 90 } }),
      injured: (s, a) => P(s, { shoulder: { flex: 4, rot: -48 * (1 - a) - 6 * a }, elbow: { flex: 90 } }),
      normalText: "the forearm rotates outwards (infraspinatus, supraspinatus)",
      injuredText: "weak external rotation and abduction start, with wasting above and below the scapular spine. Seen in overhead athletes and after ganglion compression",
    },
    supplies: "supraspinatus and infraspinatus",
    injury: "",
    frame: { focus: "@scapular-spine", zoom: 1.7, view: [0.5, 0.35, -0.8], around: ["lowerarm01", "wrist"] },
  },
  {
    id: "femoral",
    title: "Femoral nerve",
    roots: "L2–L4",
    position: "sitting",
    path: ["@femoral-pulse", "upperleg01+lowerleg01*0.4", "upperleg01+lowerleg01*0.85", "lowerleg01+foot*0.4", "lowerleg01+foot*0.9"],
    zones: ["femoral", "saphenous"],
    zonePoint: "key:saphenous",
    danger: { at: "@femoral-pulse", label: "Under the inguinal ligament (pelvic haematoma, hip surgery)" },
    motor: {
      label: "Quadriceps",
      normal: (s, a) => P(s, { knee: { flex: 85 - 82 * a } }),
      injured: (s, a) => P(s, { knee: { flex: 85 - 82 * (1 - a) - 6 * a } }),
      normalText: "the knee extends against gravity (quadriceps, L3)",
      injuredText: "the knee cannot straighten and gives way on stairs; the knee-jerk is lost; numb front and inner thigh and shin (saphenous)",
    },
    supplies: "iliacus, quadriceps and sartorius",
    injury: "",
    frame: { focus: "upperleg01+lowerleg01", zoom: 1.7, view: [1, 0.15, 0.5], around: ["@femoral-pulse", "foot"] },
  },
  {
    id: "obturator",
    title: "Obturator nerve",
    roots: "L2–L4",
    position: "supine",
    path: ["pelvis{-0.03,-0.02,0.04}", "upperleg01{-0.05,-0.05,0.0}", "upperleg01+lowerleg01*0.5{-0.045,0,0}"],
    zones: ["obturator"],
    danger: { at: "pelvis{-0.03,-0.02,0.04}", label: "Obturator canal (pelvic surgery, hernia)" },
    motor: {
      label: "Hip adductors",
      normal: (s, a) => P(s, { hip: { abd: 22 * (1 - a) }, "hip:o": { abd: 22 * (1 - a) } }),
      injured: (s, a) => P(s, { hip: { abd: 22 }, "hip:o": { abd: 22 * (1 - a) } }),
      normalText: "both legs squeeze together (hip adduction, L2–L4)",
      injuredText: "the leg on the injured side cannot be brought across; gait is wide-based; the inner thigh is numb",
    },
    supplies: "the hip adductor group and gracilis",
    injury: "",
    frame: { focus: "upperleg01+lowerleg01", zoom: 2.0, view: [0.2, 0.2, 1], around: ["foot", "foot:o", "pelvis"] },
  },
  {
    id: "lateral-femoral-cutaneous",
    title: "Lateral femoral cutaneous nerve",
    roots: "L2–L3",
    position: "standing",
    path: ["@asis", "@asis+@greater-trochanter*0.5", "upperleg01+lowerleg01*0.45{0.04,0,0}"],
    zones: ["lateral-femoral-cutaneous"],
    zonePoint: "@greater-trochanter{0.02,-0.12,0.02}",
    danger: { at: "@asis", label: "Passes under the inguinal ligament, next to the ASIS" },
    supplies: "sensation only (the skin of the outer thigh)",
    injury: "MERALGIA PARAESTHETICA: burning, tingling and numbness of the outer thigh with no weakness. Tight belts, obesity, pregnancy and long standing compress it",
    frame: { focus: "upperleg01", zoom: 1.7, view: [1, 0.15, 0.7], around: ["@asis", "upperleg01+lowerleg01*0.6"] },
  },
  {
    id: "sciatic",
    title: "Sciatic nerve",
    roots: "L4–S3",
    position: "sitting",
    path: ["@ischial-tuberosity{0.0,0.04,0.0}", "upperleg01+lowerleg01*0.35{0,0,-0.045}", "@popliteal-fossa"],
    branch: ["@popliteal-fossa", "lowerleg01+foot*0.5", "@medial-malleolus", "foot"],
    zones: ["tibial", "sural", "superficial-fibular", "deep-fibular"],
    zonePoint: "key:sural",
    danger: { at: "@ischial-tuberosity{0.0,0.04,0.0}", label: "Deep to piriformis and the hip (posterior hip dislocation, injections, piriformis)" },
    motor: {
      label: "Foot and ankle",
      normal: (s, a) => P(s, { ankle: { flex: 14 * a } }),
      injured: (s, a) => P(s, { ankle: { flex: 14 * (1 - a) - 22 * a }, toe: { flex: -14 * a } }),
      normalText: "the ankle and toes move freely (tibial and common fibular divisions)",
      injuredText: "FOOT DROP and no movement below the knee; hamstrings weak; all of the leg and foot below the knee numb except the inner shin",
    },
    supplies: "hamstrings and every muscle below the knee",
    injury: "",
    frame: { focus: "lowerleg01", zoom: 1.9, view: [1, 0.2, 0.6], around: ["upperleg01", "foot"] },
  },
  {
    id: "common-fibular",
    title: "Common fibular (peroneal) nerve",
    roots: "L4–S2",
    position: "sitting",
    path: ["@popliteal-fossa", "@fibular-head", "lowerleg01+foot*0.35{0.03,0,0.02}", "lowerleg01+foot*0.8{0.01,0,0.03}", "toe3-1"],
    zones: ["superficial-fibular", "deep-fibular"],
    zonePoint: "key:deep-fibular",
    danger: { at: "@fibular-head", label: "Wraps the neck of the fibula — crossed legs, casts, tight splints" },
    motor: {
      label: "Ankle dorsiflexion",
      normal: (s, a) => P(s, { ankle: { flex: 16 * a } }),
      injured: (s, a) => P(s, { ankle: { flex: 16 * (1 - a) - 24 * a }, toe: { flex: -12 * a } }),
      normalText: "the foot lifts up (tibialis anterior, L4)",
      injuredText: "FOOT DROP: the foot hangs, the toes drag and the patient steps high (steppage gait); numb top of the foot and outer shin",
    },
    supplies: "tibialis anterior, the toe extensors and the peroneal (fibular) muscles",
    injury: "",
    frame: { focus: "lowerleg01+foot", zoom: 1.6, view: [1, 0.15, 0.5], around: ["@fibular-head", "toe3-1"] },
  },
  {
    id: "tibial",
    title: "Tibial nerve",
    roots: "L4–S3",
    position: "standing",
    planted: "toe3-1",
    path: ["@popliteal-fossa", "lowerleg01+foot*0.45{0,0,-0.03}", "@medial-malleolus", "foot", "toe3-1"],
    zones: ["tibial"],
    zonePoint: "key:tibial",
    danger: { at: "@medial-malleolus", label: "Tarsal tunnel behind the medial malleolus" },
    motor: {
      label: "Calf (plantarflexion)",
      normal: (s, a) => P(s, { ankle: { flex: -34 * a }, toe: { flex: 30 * a }, "knee:o": { flex: 75 }, "hip:o": { flex: 15 } }),
      injured: (s, a) => P(s, { ankle: { flex: -34 * (1 - a) - 4 * a }, toe: { flex: 30 * (1 - a) }, "knee:o": { flex: 75 }, "hip:o": { flex: 15 } }),
      normalText: "single-leg heel raise: the calf lifts the body onto the toes (S1–S2)",
      injuredText: "cannot rise onto the toes; the sole is numb and the toes claw. Tarsal-tunnel syndrome causes burning on the sole",
    },
    supplies: "the calf, tibialis posterior, the toe flexors and the small muscles of the sole",
    injury: "",
    frame: { focus: "foot+lowerleg01", zoom: 1.5, view: [-0.9, 0.4, 0.5], around: ["@popliteal-fossa", "toe3-1"] },
  },
  {
    id: "superior-gluteal",
    title: "Superior gluteal nerve",
    roots: "L4–S1",
    position: "standing",
    path: ["pelvis{0.045,0.0,-0.05}", "@greater-trochanter{0.0,0.09,-0.02}"],
    danger: { at: "pelvis{0.045,0.0,-0.05}", label: "Above piriformis, in the greater sciatic notch" },
    supplies: "gluteus medius, gluteus minimus and tensor fasciae latae: the hip abductors that keep the pelvis level",
    injury: "TRENDELENBURG sign: standing on the affected leg, the pelvis drops on the opposite side (or the trunk leans over the stance hip). Injured by deep gluteal injections or hip surgery",
    frame: { focus: "@greater-trochanter", zoom: 1.7, view: [0.7, 0.3, -1], around: ["pelvis", "upperleg01"] },
  },
];

export const nerveScenes: Record<string, Scene> = Object.fromEntries(NERVES.map((n) => [`peripheral-nerves/${n.id}`, nerveScene(n)]));

// Concept demonstrations reuse an atlas item.
nerveScenes["peripheral-nerves/concept:big-three-hand"] = nerveScenes["peripheral-nerves/median"];
nerveScenes["peripheral-nerves/concept:classic-signs"] = nerveScenes["peripheral-nerves/radial"];
nerveScenes["peripheral-nerves/concept:sensory-autonomous"] = nerveScenes["peripheral-nerves/ulnar"];

void toward;
