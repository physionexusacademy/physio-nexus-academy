/** Palpation: a reference landmark, the path to the target, the fingertip pressing, then the check. Pulses show a live pulse wave. */
import type { Scene } from "../scene-types.ts";

type View = "front" | "back" | "side" | "above";
const VIEWS: Record<View, [number, number, number]> = { front: [0.35, 0.12, 1], back: [0.35, 0.12, -1], side: [1, 0.12, 0.15], above: [0.2, 0.35, 1] };

type Landmark = {
  id: string;
  title: string;
  /** Skin point of the target (a landmark id, with an offset if the skin point sits beside it). */
  at?: string;
  /** Where to start from (a landmark you already know). */
  from?: string;
  fromName?: string;
  how: string;
  check: string;
  view: View;
  zoom?: number;
  position?: Scene["position"];
  pulse?: boolean;
  focus?: string;
};

const L: Landmark[] = [
  { id: "suprasternal-notch", title: "Suprasternal (jugular) notch", how: "Press into the soft dip at the top of the sternum, between the two collarbones", check: "The trachea lies directly behind it, in the midline", view: "front", zoom: 0.8 },
  { id: "sternal-angle", title: "Sternal angle (angle of Louis)", from: "@suprasternal-notch", fromName: "the jugular notch", how: "Slide your finger down the sternum about 5 cm until you feel a horizontal ridge", check: "The 2nd rib joins here: count down the ribs from it. Level with T4–T5 and the carina", view: "front", zoom: 0.9 },
  { id: "xiphoid", title: "Xiphoid process", from: "@sternal-angle", fromName: "the sternal angle", how: "Follow the sternum down to its tip, in the notch where the lower ribs meet", check: "Press gently: the tip is cartilage and can be tender. Level with T9–T10", view: "front", zoom: 0.9 },
  { id: "ac-joint", title: "Acromioclavicular (AC) joint", from: "@scapular-spine", fromName: "the spine of the scapula", how: "Follow the collarbone outwards until it ends in a small step at the top of the shoulder", check: "Tenderness or a step here suggests AC sprain; the joint is about 2 cm across", view: "front", zoom: 0.8 },
  { id: "coracoid", title: "Coracoid process", from: "@ac-joint", fromName: "the AC joint", how: "From the AC joint, slide about 3 cm down and in, below the outer collarbone, and press firmly", check: "A hard bony knob under the deltoid, normally slightly tender", view: "front", zoom: 0.85 },
  { id: "medial-epicondyle", title: "Medial epicondyle", how: "Find the bony point on the inner side of the elbow, above the joint line", check: "The ulnar nerve runs just behind it (the funny bone); the common flexor tendon attaches here", view: "front", zoom: 0.8 },
  { id: "lateral-epicondyle", title: "Lateral epicondyle", how: "Find the bony point on the outer side of the elbow, above the joint line", check: "The common extensor tendon attaches here: tenderness suggests tennis elbow", view: "side", zoom: 0.8 },
  { id: "olecranon", title: "Olecranon", how: "With the elbow bent, feel the point of the elbow at the back", check: "The medial and lateral epicondyles and the olecranon form a straight line in extension and a triangle in flexion", view: "side", zoom: 0.8 },
  { id: "radial-styloid", title: "Radial styloid", how: "Follow the thumb side of the forearm to the bony tip at the wrist", check: "It lies about 1 cm lower than the ulnar styloid. The anatomical snuffbox is just below it", view: "front", zoom: 0.7 },
  { id: "c7", title: "C7 spinous process", how: "Flex the neck and run your finger down the back of the neck to the most prominent bump", check: "Extend the neck: C7 stays still while C6 slides forward and disappears", view: "back", zoom: 0.9 },
  { id: "scapular-spine", title: "Spine of the scapula (root)", from: "@c7", fromName: "C7", how: "Run your finger out along the ridge across the upper back, starting where it meets the medial border", check: "The root lies level with the T3 spinous process", view: "back", zoom: 1.1 },
  { id: "inferior-angle", title: "Inferior angle of the scapula", from: "@scapular-spine", fromName: "the scapular spine", how: "Follow the medial border of the scapula down to its lowest point", check: "Level with T7. The arms by the side help to find it", view: "back", zoom: 1.1 },
  { id: "iliac-crest", title: "Iliac crest (highest point)", how: "Rest your hands on the hips and press down into the top of the pelvis; find the highest point", check: "A line joining the two highest points passes through the L4 spinous process (Tuffier’s line)", view: "back", zoom: 1.2 },
  { id: "psis", title: "Posterior superior iliac spine (PSIS)", from: "@iliac-crest", fromName: "the iliac crest", how: "Slide down the crest towards the middle of the back to the bony bump, which sits in the dimple", check: "Level with the S2 spinous process. Compare both sides", view: "back", zoom: 1.0 },
  { id: "asis", title: "Anterior superior iliac spine (ASIS)", from: "@iliac-crest", fromName: "the iliac crest", how: "Follow the iliac crest forwards until it ends in a prominent bump at the front", check: "Level in a normal pelvis. Origin of sartorius and the inguinal ligament", view: "front", zoom: 1.0 },
  { id: "femoral-pulse", title: "Femoral pulse (mid-inguinal point)", from: "@asis", fromName: "the ASIS", how: "Halfway between the ASIS and the pubic symphysis, press firmly with two fingers", check: "Count for 15 s. Absent or weak: think of arterial occlusion. Femoral nerve lies lateral, vein medial (NAVY)", view: "front", zoom: 0.9, position: "supine", pulse: true },
  { id: "greater-trochanter", title: "Greater trochanter", how: "Place your hand on the outside of the hip and feel the broad bony prominence; rotate the leg to feel it move", check: "About a hand-width below the iliac crest. Tenderness suggests trochanteric pain", view: "side", zoom: 1.1 },
  { id: "ischial-tuberosity", title: "Ischial tuberosity", how: "With the hip flexed, press into the lower buttock fold: the bone you sit on", check: "The hamstrings attach here; it is tender in hamstring tendinopathy", view: "back", zoom: 1.0 },
  { id: "patella", title: "Patella", how: "Feel the kneecap with the knee relaxed and straight; slide it from side to side", check: "It moves freely when the quadriceps is relaxed. Apprehension suggests instability", view: "side", zoom: 0.9 },
  { id: "tibial-tuberosity", title: "Tibial tuberosity", from: "@patella", fromName: "the patella", how: "Follow the patellar tendon down from the kneecap to the bump on the front of the shin", check: "Tenderness in adolescents suggests Osgood–Schlatter disease", view: "side", zoom: 0.9 },
  { id: "popliteal-fossa", title: "Popliteal fossa (popliteal pulse)", how: "With the knee flexed and relaxed, press deeply into the middle of the diamond behind the knee", check: "The popliteal pulse is deep and hard to find; a bounding pulse suggests an aneurysm", view: "back", zoom: 0.9, position: "prone", pulse: true },
  { id: "fibular-head", title: "Head of the fibula", from: "@tibial-tuberosity", fromName: "the tibial tuberosity", how: "Go round the outside of the knee, below and behind the joint line, to the bony knob", check: "The common fibular nerve winds round just below it: press lightly", view: "side", zoom: 0.9 },
  { id: "medial-malleolus", title: "Medial malleolus", how: "Feel the bony prominence on the inside of the ankle (the end of the tibia)", check: "The tibialis posterior tendon runs just behind it; the tibial nerve and posterior tibial pulse sit further back", view: "front", zoom: 0.7 },
  { id: "lateral-malleolus", title: "Lateral malleolus", how: "Feel the bony prominence on the outside of the ankle (the end of the fibula); it extends lower than the medial one", check: "The ATFL lies just in front of it: the commonest ankle sprain", view: "side", zoom: 0.7 },
  { id: "dorsalis-pedis", title: "Dorsalis pedis pulse", how: "On the top of the foot, lateral to the extensor hallucis longus tendon, press lightly with two fingers", check: "Absent in about 10 % of healthy people: always check the posterior tibial pulse as well", view: "above", zoom: 0.7, position: "supine", pulse: true },
  { id: "calcaneus", title: "Calcaneus and Achilles insertion", how: "Feel the back of the heel and follow the Achilles tendon down to where it attaches", check: "Tenderness at the insertion points to insertional tendinopathy or Sever’s disease", view: "back", zoom: 0.75 },
];

function landmarkScene(l: Landmark): Scene {
  const at = l.at ?? `@${l.id}`;
  const hasFrom = Boolean(l.from);
  return {
    kind: "landmark",
    title: l.title,
    position: l.position ?? "standing",
    loopMs: 12000,
    frame: { focus: at, zoom: l.zoom ?? 1, view: VIEWS[l.view], around: l.from ? [l.from] : [] },
    beats: [
      { to: 0.25, text: hasFrom ? `Start from a landmark you know: ${l.fromName}` : "Position the patient so the area is relaxed and exposed", chip: hasFrom ? "Start" : "Position" },
      { to: 0.5, text: l.how, chip: "Find it" },
      { to: 0.78, text: "Press gently with the pads of two fingers, then slide across the bone", chip: "Palpate" },
      { to: 1, text: l.check, chip: "Check" },
    ],
    overlays: [
      ...(l.from ? [{ t: "beacon" as const, at: l.from, label: l.fromName, tone: "white" as const, when: [0.02, 0.55] as [number, number] }, { t: "path" as const, pts: [l.from, at], tone: "amber" as const, flow: true, width: 5, when: [0.25, 0.55] as [number, number] }] : []),
      { t: "beacon", at, label: l.title.split(" (")[0], when: [0.4, 1] },
      { t: "touch", at, style: "press", label: l.pulse ? "Pulse" : "Press", when: [0.5, 1] },
    ],
    hud: [
      { t: "stat", label: "Landmark", value: l.title.split(" (")[0].replace(" process", "").replace("Spine of the scapula", "Scapular spine"), tone: "cyan" },
      ...(l.pulse ? [{ t: "wave" as const, kind: "pulse" as const, bpm: 72, label: "Pulse under your fingers", when: [0.5, 1] as [number, number] }] : []),
    ],
  };
}

export const palpationScenes: Record<string, Scene> = Object.fromEntries(L.map((l) => [`palpation/${l.id}`, landmarkScene(l)]));
// Concept demonstrations reuse an atlas item.
palpationScenes["palpation/concept:how-to-palpate"] = palpationScenes["palpation/asis"];
palpationScenes["palpation/concept:spinal-levels"] = palpationScenes["palpation/c7"];
palpationScenes["palpation/concept:pulses"] = palpationScenes["palpation/femoral-pulse"];
palpationScenes["palpation/concept:ottawa"] = palpationScenes["palpation/lateral-malleolus"];
