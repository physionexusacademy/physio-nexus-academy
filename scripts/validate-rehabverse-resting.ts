import assert from "node:assert/strict";
import { readFileSync, readdirSync } from "node:fs";
import { NEUTRAL, restingLimbs, restingParts, withResting } from "../src/lib/rehabverse/resting.ts";
import type { Motion } from "../src/lib/rehabverse/types.ts";

/**
 * Lying exercises start from a resting pose, so a limb the exercise does not use lies on the bed instead of hanging in the air:
 *   - on the back the hands rest on the bed (not "always in the fundamental position", 12 cm above it);
 *   - face down the arms and legs rest on the mat;
 *   - on the side the top leg lies on the bottom leg;
 *   - a limb the exercise DOES use (moves it, or sets it clearly away from neutral) is left exactly as the exercise says.
 * The numbers themselves were solved on the real model; the 3D pose gate (npm run validate:rehabverse-poses) measures them for every exercise.
 */
let checks = 0;
const ok = (condition: unknown, message: string) => { checks++; assert.ok(condition, message); };
const read = (path: string) => readFileSync(new URL("../" + path, import.meta.url), "utf8");

type Ex = { id: string; motion: Motion };
const dir = new URL("../public/rehabverse-data/", import.meta.url);
const all: Ex[] = readdirSync(dir).filter((f) => f.endsWith(".json")).flatMap((f) => JSON.parse(readFileSync(new URL(f, dir), "utf8")));
const byId = (id: string) => all.find((e) => e.id === id)!;
const startOf = (e: Ex) => withResting(e.motion, e.motion.start);

/* ---------- the resting pose ---------- */
const supine = restingParts("supine");
ok(supine.shoulder && supine["shoulder:o"] && supine.elbow && supine["elbow:o"] && supine.hand && supine["hand:o"], "on the back both arms are covered: shoulder, forearm and hand");
ok((supine.shoulder?.flex ?? 0) < 0, "on the back the arms rest slightly behind the body, so the hands reach the bed");
ok((supine.elbow?.rot ?? 0) >= 30, "...with the forearm turned palm down");
ok(JSON.stringify(supine.shoulder) === JSON.stringify(supine["shoulder:o"]), "...the same on both sides");
const prone = restingParts("prone");
ok(prone.shoulder && prone.hip && prone.ankle && prone["hip:o"] && prone["ankle:o"], "face down the arms and the legs are covered");
ok((prone.ankle?.flex ?? 0) <= -45, "face down the feet point, so the top of the foot lies on the mat");
const side = restingParts("sidelying");
ok(side.hip && side.knee && !side.shoulder, "on the side the top leg is covered (the arms keep the engine's side-lying pose)");
ok((side.hip?.abd ?? 0) < 0 && (side.hip?.rot ?? 0) < 0, "...adducted and turned so the knee and shin lie on the leg below");
ok(Object.keys(restingParts("standing")).length === 0 && Object.keys(restingParts("sitting")).length === 0 && Object.keys(restingParts("quadruped")).length === 0, "standing, sitting and all fours are untouched");

/* ---------- when the resting pose is used, and when the exercise keeps its own ---------- */
const probe = (position: Motion["position"], start: Motion["start"], moves: Motion["moves"] = []) => ({ position, start, moves, mistake: undefined }) as Pick<Motion, "position" | "start" | "moves" | "mistake">;
{
  const m = probe("supine", { shoulder: { flex: 4 }, "shoulder:o": { flex: 4 } }, [{ to: { hip: { flex: 60 } }, ms: 1000 }]);
  const start = withResting(m, m.start);
  ok(JSON.stringify(start.shoulder) === JSON.stringify(supine.shoulder), "a small start angle only meant 'by the sides': the resting arm replaces it");
}
{
  const m = probe("supine", { shoulder: { flex: 90 }, "shoulder:o": { flex: 90 } }, [{ to: { shoulder: { flex: 170 } }, ms: 1000 }]);
  const start = withResting(m, m.start);
  ok(start.shoulder?.flex === 90 && start["shoulder:o"]?.flex === 90, "arms the exercise holds up (more than " + NEUTRAL + " degrees) are left alone");
  ok(JSON.stringify(start.elbow) === JSON.stringify(supine.elbow), "...but a joint it does not mention (the forearm) still rests");
}
{
  const m = probe("supine", {}, [{ to: { shoulder: { flex: 10, abd: 5 } }, ms: 1000 }]);
  const start = withResting(m, m.start);
  ok(start.shoulder === undefined && start["shoulder:o"] !== undefined, "a joint a movement mentions is the exercise's own, even for a small angle; the other side still rests");
}
{
  const m = { ...probe("supine", {}, [{ to: { hip: { flex: 60 } }, ms: 1000 }]), mistake: { text: { en: "x", ru: "x" }, moves: [{ to: { shoulder: { flex: 40 } }, ms: 1000 }] } } as Pick<Motion, "position" | "start" | "moves" | "mistake">;
  ok(withResting(m, m.start).shoulder === undefined, "a joint the faulty version moves is not taken over by the resting pose either");
}

/* ---------- which limbs lie still ---------- */
{
  const curl = byId("prone-hamstring-curl").motion;
  const limbs = restingLimbs(curl, curl.start);
  ok(limbs.includes("arm") && limbs.includes("arm:o") && limbs.includes("leg:o") && !limbs.includes("leg"), "prone hamstring curl: both arms and the other leg lie still, the curling leg does not");
  const calf = byId("supine-calf-stretch").motion;
  ok(restingLimbs(calf, calf.start).length === 0, "supine calf stretch: the arms hold the strap, nothing is checked as resting");
  const dead = byId("dead-bug").motion;
  ok(!restingLimbs(dead, dead.start).includes("arm") && !restingLimbs(dead, dead.start).includes("arm:o"), "dead bug: the raised arms are held, not resting");
}

/* ---------- every lying exercise ---------- */
const lying = all.filter((e) => ["supine", "prone"].includes(e.motion.position));
const arms = (e: Ex, key: "shoulder" | "shoulder:o") => {
  const motion = e.motion;
  const moved = [...motion.moves, ...(motion.mistake?.moves ?? [])].some((move) => move.to[key] !== undefined);
  const held = Object.values(motion.start[key] ?? {}).some((v) => Math.abs(v as number) > NEUTRAL);
  return { moved, held };
};
for (const e of lying) {
  for (const key of ["shoulder", "shoulder:o"] as const) {
    const { moved, held } = arms(e, key);
    const start = startOf(e);
    if (!moved && !held) {
      const expect = restingParts(e.motion.position)[key];
      ok(JSON.stringify(start[key]) === JSON.stringify(expect), `${e.id}: the ${key === "shoulder" ? "tested" : "other"} arm lies in the resting pose, not the standing one`);
    } else if (held) {
      ok(start[key] !== undefined && Object.values(start[key] ?? {}).some((v) => Math.abs(v as number) > NEUTRAL), `${e.id}: a held arm keeps the exercise's own angle`);
    }
  }
}
const sidelying = all.filter((e) => e.motion.position === "sidelying");
ok(sidelying.length >= 6 && lying.length >= 25, "the library has its lying exercises (the check above is not empty)");

/* ---------- the player and the gate use it ---------- */
{
  const player = read("src/components/rehabverse/ExercisePlayer.tsx");
  ok(/withResting\(motion, ownStart\)/.test(player) && /rest: restingLimbs\(motion, ownStart\)/.test(player), "the exercise player starts every exercise from the resting pose and tells the gate which limbs lie still");
  ok(/lowestY\(down\)/.test(player), "on the side the body is placed on its ribs, hip and legs (the shoulder underneath may sink into the mattress)");
  const check = read("src/lib/rehabverse/pose-check.ts");
  ok(/limb-floats/.test(check) && /TOLERANCE\.limb/.test(check), "the pose gate fails a resting limb that floats above the bed or mat");
  const engine = read("src/lib/virtual-patient/engine.ts");
  ok(/lowestY\(skipArm\?: Side\)/.test(engine), "the 3D engine can find the lowest point of the body without one arm");
}

console.log(`RehabVerse resting poses: ${checks} checks passed (hands on the bed on the back, arms and legs on the mat face down, top leg on the leg below, an exercise's own joints left alone, wired into the player and the pose gate).`);
