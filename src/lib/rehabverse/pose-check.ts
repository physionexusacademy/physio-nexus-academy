/**
 * The pose quality gate: checks, on the real 3D model, that an exercise looks right at every moment of its repetition.
 * Pure functions (no 3D engine here): the player's test hook (window.__rvPlayer.check) measures where the bones are at many moments
 * and hands the numbers to `analyse`; scripts/rehabverse-pose-gate.cjs runs it for every exercise, both sides, and fails the build.
 *
 * What it catches: a body part sunk into the mat, plinth or floor; a body that floats above its surface (nothing touches it);
 * feet that should stay planted but lift; a movement that jumps between two moments or does not come back to where it started;
 * a declared contact that does not happen (the ankle on the opposite knee); and (in the runner) left and right sides that differ.
 */
import { PLINTH } from "../virtual-patient/plinth.ts";

export type Vec = [number, number, number];
/** One bone as a capsule: from its head to its end, with a radius (metres) a little under the skin. */
export type Seg = { id: string; side: "tested" | "other" | "mid"; a: Vec; b: Vec; r: number };
/** `floor`: the height of the body's lowest vertex (measured on the real mesh), when known. */
export type Snapshot = { kind: string; t: number; segs: Seg[]; floor?: number };
export type Env = {
  /** Height of what the body rests on (mat, plinth top, the floor, the step the person stands on). */
  supportY: number;
  surface: "plinth" | "mat" | "floor";
  /** Lying, kneeling or on all fours: something must touch the surface; standing: the feet must. */
  resting: boolean;
  /** "both" feet must stay planted, or only the "tested" / "other" foot. */
  plant?: "both" | "tested" | "other";
  /** The top of a step the person may stand on (feet may rest here as well as on the floor). */
  stepTop?: number;
  /**
   * How far (m) each trunk bone (they run close to the back, not through the middle of the body) is from the skin that touches the
   * surface: a few cm lying on the back, about 12 cm lying face down or on the side. A number applies to every trunk bone.
   */
  trunkR?: number | Record<string, number>;
};

/** Measured on the model lying on its back: the pelvis is 3 cm above the bed, the upper back 6 cm. */
export const SUPINE_TRUNK: Record<string, number> = { root: 0.03, spine01: 0.04, spine02: 0.04, spine03: 0.06, spine04: 0.065, spine05: 0.065 };
export type Touch = { a: [string, "tested" | "other" | "mid"]; b: [string, "tested" | "other" | "mid"]; within: number; when?: "hold" | "all" };
export type Violation = { kind: "penetrates" | "floats" | "feet-lift" | "jumps" | "no-return" | "touch" | "asymmetry"; at: string; detail: string };

/** Body bones and their radius (m): enough of the skeleton to see every limb, the trunk and the head. */
export const BODY: { bone: string; r: number; sided: boolean; /** the bone whose head is where this segment ends (the bones are short pieces of the limb) */ to?: string }[] = [
  { bone: "root", r: 0.1, sided: false },
  { bone: "spine01", r: 0.1, sided: false },
  { bone: "spine02", r: 0.1, sided: false },
  { bone: "spine03", r: 0.1, sided: false },
  { bone: "spine04", r: 0.11, sided: false },
  { bone: "spine05", r: 0.11, sided: false },
  { bone: "neck01", r: 0.05, sided: false },
  { bone: "head", r: 0.09, sided: false },
  { bone: "upperarm01", r: 0.045, sided: true, to: "lowerarm01" },
  { bone: "lowerarm01", r: 0.04, sided: true, to: "wrist" },
  { bone: "wrist", r: 0.03, sided: true, to: "finger3-1" },
  { bone: "finger3-1", r: 0.012, sided: true },
  { bone: "upperleg01", r: 0.08, sided: true, to: "lowerleg01" },
  { bone: "lowerleg01", r: 0.055, sided: true, to: "foot" },
  { bone: "foot", r: 0.03, sided: true },
  { bone: "toe1-1", r: 0.02, sided: true },
];

const FOOT = new Set(["foot", "toe1-1"]);
const TRUNK = new Set(["root", "spine01", "spine02", "spine03", "spine04", "spine05"]);
/** The head and neck rest on a pillow or are held up: not part of the contact checks. */
const SKIP = new Set(["head", "neck01"]);
const sub = (p: Vec, q: Vec): Vec => [p[0] - q[0], p[1] - q[1], p[2] - q[2]];
const len = (v: Vec) => Math.hypot(v[0], v[1], v[2]);
function radius(s: Seg, env?: Env) {
  const t = env?.trunkR;
  if (!TRUNK.has(s.id) || t === undefined) return s.r;
  return typeof t === "number" ? t : t[s.id] ?? s.r;
}
const lowest = (s: Seg, env?: Env) => Math.min(s.a[1], s.b[1]) - radius(s, env);

/** Distance from a point to a segment's centre line. */
function pointToSegment(p: Vec, a: Vec, b: Vec) {
  const ab = sub(b, a);
  const l2 = ab[0] * ab[0] + ab[1] * ab[1] + ab[2] * ab[2];
  const t = l2 ? Math.max(0, Math.min(1, ((p[0] - a[0]) * ab[0] + (p[1] - a[1]) * ab[1] + (p[2] - a[2]) * ab[2]) / l2)) : 0;
  return len(sub(p, [a[0] + ab[0] * t, a[1] + ab[1] * t, a[2] + ab[2] * t]));
}

/** A plinth exercise only has to respect the bed where the body is over it (a leg may hang over the edge). */
const overPlinth = (s: Seg) => [s.a, s.b].every((p) => Math.abs(p[0]) <= PLINTH.width / 2 + 0.02 && Math.abs(p[2]) <= PLINTH.length / 2 + 0.02);

export const TOLERANCE = {
  /** how far (m) a body part may sink into its surface */
  sink: 0.035,
  /** how far (m) the lowest body part may be above the surface before the body counts as floating */
  float: 0.055,
  /** the most (m) a key point may move between two neighbouring moments */
  jump: 0.3,
  /** how far (m) the end of the repetition may be from its start */
  closure: 0.04,
  /** left and right sides must agree to this (m) */
  symmetry: 0.025,
};

export function analyse(snaps: Snapshot[], env: Env, touches: Touch[] = []): Violation[] {
  const out: Violation[] = [];
  const add = (kind: Violation["kind"], at: string, detail: string) => {
    if (!out.some((v) => v.kind === kind && v.detail === detail)) out.push({ kind, at, detail });
  };

  for (const snap of snaps) {
    const at = `${snap.kind} @${Math.round(snap.t)}ms`;
    const body = snap.segs.filter((s) => !SKIP.has(s.id));
    const supported = env.surface === "plinth" ? body.filter(overPlinth) : body;
    // 1. nothing sunk into its surface (and, over a bed, nothing through the floor)
    for (const s of supported) {
      const down = env.supportY - lowest(s, env);
      if (down > TOLERANCE.sink) add("penetrates", at, `${s.id} (${s.side}) is ${(down * 100).toFixed(1)} cm into the ${env.surface}`);
    }
    if (env.surface === "plinth") for (const s of body) if (lowest(s, env) < -TOLERANCE.sink) add("penetrates", at, `${s.id} (${s.side}) is through the floor`);
    // 2. something touches: a lying / kneeling body rests on its surface; a standing one on its feet
    const pool = env.resting ? supported : body.filter((s) => FOOT.has(s.id));
    // (a foot may rest on the step as well as on the floor; and where the real mesh's lowest point touches the surface the body is not floating)
    const rests = (y: number) => Math.min(Math.abs(y - env.supportY), env.stepTop !== undefined ? Math.abs(y - env.stepTop) : Infinity);
    const meshTouches = env.resting && snap.floor !== undefined && snap.floor - env.supportY <= 0.03;
    if (pool.length && !meshTouches) {
      const low = Math.min(...pool.map((s) => lowest(s, env)));
      const off = env.resting ? low - env.supportY : Math.min(...pool.map((s) => rests(lowest(s, env))));
      if (off > TOLERANCE.float) add("floats", at, `the lowest ${env.resting ? "body part" : "foot"} is ${(off * 100).toFixed(1)} cm above the ${env.surface}`);
    }
    // 3. feet that should stay planted
    if (env.plant) {
      const sides = env.plant === "both" ? (["tested", "other"] as const) : ([env.plant] as const);
      for (const side of sides) {
        const feet = body.filter((s) => FOOT.has(s.id) && s.side === side);
        const up = feet.length ? Math.min(...feet.map((s) => rests(lowest(s, env)))) : 0;
        if (feet.length && up > TOLERANCE.float + 0.02) add("feet-lift", at, `the ${side} foot should stay planted but is ${(up * 100).toFixed(1)} cm up`);
      }
    }
    // 4. declared contacts
    for (const touch of touches) {
      if ((touch.when ?? "hold") === "hold" && snap.kind !== "hold") continue;
      const pa = snap.segs.find((s) => s.id === touch.a[0] && s.side === touch.a[1]);
      const pb = snap.segs.find((s) => s.id === touch.b[0] && s.side === touch.b[1]);
      if (!pa || !pb) {
        add("touch", at, `contact ${touch.a[0]} (${touch.a[1]}) with ${touch.b[0]} (${touch.b[1]}): bone not found`);
        continue;
      }
      const gap = pointToSegment(pa.a, pb.a, pb.b) - pa.r - pb.r;
      if (gap > touch.within) add("touch", at, `${touch.a[0]} (${touch.a[1]}) should touch ${touch.b[0]} (${touch.b[1]}) but is ${(gap * 100).toFixed(1)} cm away`);
    }
  }

  // 5. smooth: no jump between neighbouring moments, and the repetition comes back to where it started
  const track = (id: string, side: Seg["side"]) => snaps.map((s) => s.segs.find((g) => g.id === id && g.side === side)?.a);
  const keys: [string, Seg["side"]][] = [["root", "mid"], ["head", "mid"], ["wrist", "tested"], ["wrist", "other"], ["foot", "tested"], ["foot", "other"]];
  for (const [id, side] of keys) {
    const points = track(id, side);
    for (let i = 1; i < points.length; i++) {
      const p = points[i - 1];
      const q = points[i];
      if (p && q && len(sub(q, p)) > TOLERANCE.jump) add("jumps", `${snaps[i].kind} @${Math.round(snaps[i].t)}ms`, `${id} (${side}) jumps ${(len(sub(q, p)) * 100).toFixed(0)} cm between two moments`);
    }
    const first = points[0];
    const last = points[points.length - 1];
    if (first && last && len(sub(last, first)) > TOLERANCE.closure) add("no-return", "end", `${id} (${side}) ends ${(len(sub(last, first)) * 100).toFixed(1)} cm from where it started`);
  }
  return out;
}

/** Height of every key joint at every moment, for the left/right comparison. */
export function heights(snaps: Snapshot[]) {
  const ids = ["wrist", "lowerarm01", "upperarm01", "foot", "lowerleg01", "upperleg01", "toe1-1"];
  return snaps.map((snap) => Object.fromEntries(ids.flatMap((id) => (["tested", "other"] as const).map((side) => [`${id}.${side}`, snap.segs.find((s) => s.id === id && s.side === side)?.a[1] ?? 0]))));
}

/** Left-side and right-side runs of the same exercise must agree on every height (a mirror fault shows up here). */
export function compareSides(left: Record<string, number>[], right: Record<string, number>[]): Violation[] {
  const out: Violation[] = [];
  left.forEach((snap, i) => {
    for (const [key, y] of Object.entries(snap)) {
      const other = right[i]?.[key];
      if (other !== undefined && Math.abs(other - y) > TOLERANCE.symmetry && !out.some((v) => v.detail.startsWith(key))) {
        out.push({ kind: "asymmetry", at: `moment ${i}`, detail: `${key}: ${(y * 100).toFixed(1)} cm on the left side but ${(other * 100).toFixed(1)} cm on the right` });
      }
    }
  });
  return out;
}
