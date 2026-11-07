/**
 * Surface anatomy of the virtual patient: which dermatome, cutaneous nerve and
 * body region a skin point belongs to. Works in the model's rest pose (metres,
 * y up from the floor, patient's left +x, front +z), so it is independent of how
 * the patient is currently positioned. Dermatome maps vary between textbooks —
 * these follow the ISNCSCI key points and the common clinical (Keegan-style) map.
 */
import rig from "./generated/rig.json";

export type Dermatome =
  | "C2" | "C3" | "C4" | "C5" | "C6" | "C7" | "C8" | "T1" | "T2" | "T3" | "T4" | "T5" | "T6" | "T7" | "T8" | "T9" | "T10" | "T11" | "T12"
  | "L1" | "L2" | "L3" | "L4" | "L5" | "S1" | "S2";
export type CutaneousNerve =
  | "trigeminal" | "axillary" | "radial" | "musculocutaneous" | "median" | "ulnar" | "medial-antebrachial"
  | "lateral-femoral-cutaneous" | "femoral" | "obturator" | "saphenous" | "superficial-fibular" | "deep-fibular" | "sural" | "tibial" | "posterior-femoral-cutaneous";

export type SurfaceInfo = {
  side: "left" | "right";
  region: string;
  dermatome: Dermatome | null;
  nerve: CutaneousNerve | null;
  /** Under the exam shorts — not tested in this simulator. */
  covered: boolean;
};

type Bone = { name: string; head: number[]; tail: number[] };
const bones = new Map((rig.bones as Bone[]).map((b) => [b.name, b]));
const H = (name: string) => bones.get(name)!.head;
const T = (name: string) => bones.get(name)!.tail;
const sub = (a: number[], b: number[]) => [a[0] - b[0], a[1] - b[1], a[2] - b[2]];
const dot = (a: number[], b: number[]) => a[0] * b[0] + a[1] * b[1] + a[2] * b[2];
const len = (a: number[]) => Math.hypot(a[0], a[1], a[2]);
const norm = (a: number[]) => {
  const l = len(a) || 1;
  return [a[0] / l, a[1] / l, a[2] / l];
};
const cross = (a: number[], b: number[]) => [a[1] * b[2] - a[2] * b[1], a[2] * b[0] - a[0] * b[2], a[0] * b[1] - a[1] * b[0]];
const perp = (v: number[], axis: number[]) => {
  const k = dot(v, axis);
  return [v[0] - axis[0] * k, v[1] - axis[1] * k, v[2] - axis[2] * k];
};

/* Reference geometry (left side; right is the mirror image). */
const neckBase = H("neck01");
const clavicleY = H("clavicle.L")[1];
const nippleY = T("breast.L")[1];
const xiphoidY = (rig.landmarks as Record<string, { mid?: { p: number[] } }>)["xiphoid"].mid!.p[1];
const hip = H("upperleg01.L");
const knee = H("lowerleg01.L");
const ankle = H("foot.L");
const umbilicusY = hip[1] + 0.1;
const inguinalY = hip[1] + 0.005;
const shortsLow = knee[1] + 0.58 * (hip[1] - knee[1]);
const shortsHigh = hip[1] + 0.105;
const eyeY = H("eye.L")[1];
const shoulder = H("upperarm01.L");
const elbow = H("lowerarm01.L");
const wrist = H("wrist.L");
const armAxis = norm(sub(elbow, shoulder));
const armLateral = norm([-armAxis[1], armAxis[0], 0]);
const foreAxis = norm(sub(wrist, elbow));
const radialDir = norm(perp(sub(H("finger1-1.L"), wrist), foreAxis));
const handAxis = norm(sub(H("finger3-1.L"), wrist));
// Relaxed fingers curl towards the palm: that tells us which side is palmar.
const palmarDir = norm(perp(sub(T("finger3-3.L"), H("finger3-1.L")), handAxis));
const thighAxis = norm(sub(knee, hip));
const shankAxis = norm(sub(ankle, knee));

/** Linear interpolation over [y, level] stops (y descending). */
function trunkLevel(y: number): Dermatome {
  const stops: [number, number][] = [
    [clavicleY - 0.03, 2],
    [nippleY, 4],
    [xiphoidY, 6],
    [umbilicusY, 10],
    [inguinalY + 0.03, 12],
  ];
  let level = 2;
  if (y <= stops[stops.length - 1][0]) level = 12.6;
  else
    for (let i = 0; i < stops.length - 1; i++) {
      const [y0, l0] = stops[i];
      const [y1, l1] = stops[i + 1];
      if (y <= y0 && y >= y1) level = l0 + ((y0 - y) / (y0 - y1)) * (l1 - l0);
    }
  const n = Math.round(level);
  return n >= 13 ? "L1" : (`T${Math.max(2, n)}` as Dermatome);
}

export function classifySurface(point: number[], boneName: string): SurfaceInfo {
  const side: SurfaceInfo["side"] = point[0] >= 0 ? "left" : "right";
  const p = [Math.abs(point[0]), point[1], point[2]];
  const b = boneName.replace(/(\.)?[LR]$/, "").replace(/\.$/, "");
  const result = (region: string, dermatome: Dermatome | null, nerve: CutaneousNerve | null = null, covered = false): SurfaceInfo => ({ side, region, dermatome, nerve, covered });

  // Head and neck.
  if (/^(head|jaw|eye|neck0|oris|levator|oculi|orbicularis|risorius|temporalis|special0[1-6]|tongue)/.test(b)) {
    if (p[1] > neckBase[1] + 0.07) {
      const back = p[2] < H("head")[2] - 0.01;
      if (back && p[1] > eyeY - 0.06) return result("Back of the head", "C2");
      if (!back) return result("Face", null, "trigeminal");
      return result("Upper neck", "C3");
    }
    return result("Neck", "C3");
  }

  // Upper limb.
  if (/^(upperarm|shoulder)/.test(b)) {
    const v = sub(p, shoulder);
    const t = dot(v, armAxis) / len(sub(elbow, shoulder));
    const lateral = dot(norm(perp(v, armAxis)), armLateral);
    if (t < 0.15 && p[1] > clavicleY) return result("Top of the shoulder", "C4");
    if (lateral > 0.15) return result("Lateral upper arm", "C5", t < 0.55 ? "axillary" : "radial");
    return result("Medial upper arm", t < 0.5 ? "T2" : "T1");
  }
  if (/^lowerarm/.test(b)) {
    const v = sub(p, elbow);
    const t = dot(v, foreAxis) / len(sub(wrist, elbow));
    const radial = dot(norm(perp(v, foreAxis)), radialDir);
    if (radial > 0.2) return result("Lateral (radial) forearm", "C6", "musculocutaneous");
    if (radial < -0.2) return result("Medial (ulnar) forearm", t > 0.55 ? "C8" : "T1", "medial-antebrachial");
    return result(t > 0.5 ? "Distal forearm" : "Proximal forearm", t > 0.5 ? "C7" : "C6", "radial");
  }
  if (/^(wrist|metacarpal|finger)/.test(b)) {
    const v = sub(p, wrist);
    const palmar = dot(norm(perp(v, handAxis)), palmarDir) > 0.1;
    const finger = /^finger(\d)/.exec(b)?.[1];
    const meta = /^metacarpal(\d)/.exec(b)?.[1];
    const ray = Number(finger ?? meta ?? 0) || (dot(norm(perp(v, handAxis)), radialDir) > 0.25 ? 2 : dot(norm(perp(v, handAxis)), radialDir) < -0.25 ? 5 : 3);
    const names = ["", "Thumb", "Index finger", "Middle finger", "Ring finger", "Little finger"];
    const where = finger ? names[ray] : meta ? `${palmar ? "Palm" : "Back of the hand"} (${names[ray].toLowerCase()} side)` : palmar ? "Palm" : "Back of the hand";
    const dermatome: Dermatome = ray <= 2 ? "C6" : ray === 3 ? "C7" : "C8";
    let nerve: CutaneousNerve;
    if (ray >= 5 || (ray === 4 && !palmar)) nerve = "ulnar";
    else if (palmar || /-3$/.test(b)) nerve = ray === 4 ? "ulnar" : "median";
    else nerve = "radial";
    return result(where, dermatome, nerve);
  }

  // Lower limb.
  if (/^(upperleg|pelvis)/.test(b) && p[1] < hip[1] + 0.02) {
    if (p[1] >= shortsLow && p[1] <= shortsHigh) return result("Under the shorts", null, null, true);
    const v = sub(p, hip);
    const t = dot(v, thighAxis) / len(sub(knee, hip));
    const radialOut = norm(perp(v, thighAxis));
    if (radialOut[2] < -0.45) return result("Back of the thigh", "S2", "posterior-femoral-cutaneous");
    if (radialOut[0] < -0.45) return result("Inner thigh", "L3", "obturator");
    if (radialOut[0] > 0.55) return result("Outer thigh", "L3", "lateral-femoral-cutaneous");
    return result("Front of the thigh", t < 0.55 ? "L2" : "L3", "femoral");
  }
  if (/^lowerleg/.test(b)) {
    const v = sub(p, knee);
    const t = dot(v, shankAxis) / len(sub(ankle, knee));
    const out = norm(perp(v, shankAxis));
    if (t < 0.12) {
      if (out[2] < -0.4) return result("Back of the knee", "S2", "posterior-femoral-cutaneous");
      if (out[0] < -0.3) return result("Inner knee", "L3", "saphenous");
      return result("Front of the knee", "L3", "femoral");
    }
    if (out[2] < -0.35) return out[0] < 0 ? result("Inner calf", "S2", "saphenous") : result("Outer calf", "S1", "sural");
    if (out[0] < -0.2) return result("Inner shin", "L4", "saphenous");
    return result("Outer shin", "L5", "superficial-fibular");
  }
  if (/^(foot|toe)/.test(b)) {
    const toe = /^toe(\d)/.exec(b)?.[1];
    const v = sub(p, ankle);
    if (toe === "1") return result("Big toe", "L5", "superficial-fibular");
    if (toe === "5") return result("Little toe", "S1", "sural");
    if (toe) return result("Toes", "L5", "superficial-fibular");
    const sole = p[1] < ankle[1] - 0.045 && v[1] < -0.05;
    if (v[2] < -0.02) return result("Heel", "S1", sole ? "tibial" : "sural");
    if (sole) return result("Sole", "S1", "tibial");
    const medial = p[0] < ankle[0] - 0.03;
    const lateral = p[0] > ankle[0] + 0.035;
    if (medial) return result(v[2] < 0.05 ? "Medial ankle" : "Inner border of the foot", "L4", "saphenous");
    if (lateral) return result(v[2] < 0.05 ? "Lateral ankle" : "Outer border of the foot", "S1", "sural");
    const firstWeb = p[0] < ankle[0] && v[2] > 0.11;
    return result("Top of the foot", "L5", firstWeb ? "deep-fibular" : "superficial-fibular");
  }

  // Trunk (front and back).
  if (p[1] >= shortsLow && p[1] <= shortsHigh && p[1] < inguinalY + 0.07) return result("Under the shorts", null, null, true);
  if (p[1] > clavicleY - 0.02) return result(p[2] < neckBase[2] - 0.03 ? "Upper back" : "Above the collarbone", "C4");
  const back = p[2] < H("spine02")[2] - 0.02;
  return result(back ? "Back" : "Chest and abdomen", trunkLevel(p[1]));
}

export const NERVE_LABEL: Record<CutaneousNerve, string> = {
  trigeminal: "Trigeminal nerve (CN V)",
  axillary: "Axillary nerve",
  radial: "Radial nerve",
  musculocutaneous: "Musculocutaneous (lateral antebrachial cutaneous) nerve",
  median: "Median nerve",
  ulnar: "Ulnar nerve",
  "medial-antebrachial": "Medial antebrachial cutaneous nerve",
  "lateral-femoral-cutaneous": "Lateral femoral cutaneous nerve",
  femoral: "Femoral nerve (anterior cutaneous branches)",
  obturator: "Obturator nerve",
  saphenous: "Saphenous nerve (femoral)",
  "superficial-fibular": "Superficial fibular nerve",
  "deep-fibular": "Deep fibular nerve",
  sural: "Sural nerve",
  tibial: "Tibial nerve (plantar branches)",
  "posterior-femoral-cutaneous": "Posterior femoral cutaneous nerve",
};
