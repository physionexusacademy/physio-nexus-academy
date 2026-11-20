import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { gestureParts, IDLE, WAVE_RATE, WAVE_SECONDS } from "../src/lib/rehabverse/guide-motion.ts";
import type { Gesture } from "../src/lib/rehabverse/guide.ts";
import type { JointAngles } from "../src/lib/virtual-patient/engine.ts";

/**
 * The guide and the Teacher move like a person who is talking. This test locks in what was wrong and what must stay right:
 *   - the hello is a WAVE (arm raised, forearm upright and swaying, hand flicking), not the shoulder rotating in and out;
 *   - a wave lasts a couple of seconds and then the hand comes down;
 *   - no gesture holds an arm straight out at shoulder height like a signpost; "pointing" is an open palm;
 *   - fingers are loosely curled, and every angle stays in a human range;
 *   - the Teacher uses the same gestures, so the whole site moves alike.
 */
let checks = 0;
const ok = (condition: unknown, message: string) => { checks++; assert.ok(condition, message); };
const src = (path: string) => readFileSync(new URL("../" + path, import.meta.url), "utf8");

type Sample = Record<string, JointAngles | undefined>;
const sample = (gesture: Gesture, talk: number, from: number, to: number, step = 0.02, since0 = true): Sample[] => {
  const out: Sample[] = [];
  for (let t = from; t <= to + 1e-9; t += step) out.push(gestureParts(gesture, t, talk, since0 ? t - from : 99) as Sample);
  return out;
};
const series = (samples: Sample[], joint: string, axis: "flex" | "abd" | "rot") => samples.map((s) => s[joint]?.[axis] ?? 0);
const range = (values: number[]) => Math.max(...values) - Math.min(...values);
const mean = (values: number[]) => values.reduce((a, b) => a + b, 0) / values.length;
const crossings = (values: number[]) => { const m = mean(values); let n = 0; for (let i = 1; i < values.length; i++) if ((values[i - 1] - m) * (values[i] - m) < 0) n++; return n; };

const GESTURES: Gesture[] = ["calm", "wave", "open", "care", "nod", "point_left", "point_right", "point_down"];

/* 1. The hello wave. */
{
  const wave = sample("wave", 1, 0, WAVE_SECONDS - 0.2);
  const rot = series(wave, "shoulder", "rot"), abd = series(wave, "shoulder", "abd"), flex = series(wave, "shoulder", "flex");
  const elbow = series(wave, "elbow", "flex"), wrist = series(wave, "wrist", "abd");
  ok(range(rot) <= 10, `the shoulder does not rotate in and out during the wave (its rotation moves ${range(rot).toFixed(1)}°)`);
  ok(mean(rot) <= -55 && mean(rot) >= -90, `the arm is turned out so the forearm stands upright (mean shoulder rotation ${mean(rot).toFixed(0)}°)`);
  ok(mean(abd) >= 40 && mean(abd) <= 90 && mean(flex) >= 20, `the arm is raised out and forward (abduction ${mean(abd).toFixed(0)}°, flexion ${mean(flex).toFixed(0)}°)`);
  ok(mean(elbow) >= 90 && mean(elbow) <= 125, `the elbow is bent about a right angle (${mean(elbow).toFixed(0)}°)`);
  ok(range(elbow) >= 25 && range(wrist) >= 20, `the forearm sways (${range(elbow).toFixed(0)}°) and the hand flicks (${range(wrist).toFixed(0)}°)`);
  const hz = crossings(elbow) / 2 / (WAVE_SECONDS - 0.2);
  ok(hz >= 1.2 && hz <= 2.6, `it waves about twice a second (${hz.toFixed(1)} Hz)`);
  ok(Math.abs(WAVE_RATE / (2 * Math.PI) - hz) < 0.4, "...matching the declared rate");
  ok(mean(series(wave, "hand", "flex")) <= 4, "the hand is open");
  // after a couple of seconds the hand comes down by itself
  const later = gestureParts("wave", 5, 1, WAVE_SECONDS + 1) as Sample;
  ok((later.shoulder?.abd ?? 0) < 20 && (later.elbow?.flex ?? 0) < 40, "after the greeting the hand comes down and he keeps talking");
  ok(WAVE_SECONDS >= 2 && WAVE_SECONDS <= 4, "a hello lasts two to four seconds");
}

/* 2. Every gesture is a human posture. */
{
  for (const gesture of GESTURES) for (const talk of [0, 1]) {
    const samples = sample(gesture, talk, 0, 12, 0.05, false);
    for (const side of ["shoulder", "shoulder:o"]) {
      const flex = series(samples, side, "flex"), abd = series(samples, side, "abd"), rot = series(samples, side, "rot");
      ok(Math.min(...flex) >= -20 && Math.max(...flex) <= 140, `${gesture}/${side}: shoulder flexion is human (${Math.min(...flex).toFixed(0)}..${Math.max(...flex).toFixed(0)})`);
      ok(Math.min(...abd) >= -15 && Math.max(...abd) <= 110, `${gesture}/${side}: shoulder abduction is human`);
      ok(Math.min(...rot) >= -110 && Math.max(...rot) <= 60, `${gesture}/${side}: shoulder rotation is human`);
    }
    for (const side of ["elbow", "elbow:o"]) {
      const flex = series(samples, side, "flex");
      ok(Math.min(...flex) >= 0 && Math.max(...flex) <= 150, `${gesture}/${side}: the elbow bends within 0..150°`);
    }
    ok(Math.max(...series(samples, "hand", "flex")) <= 40 && Math.max(...series(samples, "hand:o", "flex")) <= 40, `${gesture}: no clenched fists`);
  }
}

/* 3. No signpost arms: only the wave raises an arm to shoulder height; presenting gestures keep the arm low with the palm up. */
{
  for (const gesture of GESTURES.filter((g) => g !== "wave")) {
    const samples = sample(gesture, 1, 0, 8, 0.05, false);
    ok(Math.max(...series(samples, "shoulder", "abd"), ...series(samples, "shoulder:o", "abd")) <= 60, `${gesture}: no arm is held out at shoulder height`);
  }
  for (const gesture of ["open", "care", "point_left", "point_right", "point_down"] as Gesture[]) {
    const g = gestureParts(gesture, 1, 0) as Sample;
    const rot = Math.max(g.elbow?.rot ?? 0, g["elbow:o"]?.rot ?? 0);
    ok(rot >= 15, `${gesture}: the forearm turns the palm up (${rot}°)`);
  }
  const left = gestureParts("point_left", 1, 0) as Sample, right = gestureParts("point_right", 1, 0) as Sample;
  ok((left.shoulder?.abd ?? 0) >= 30 && (left["shoulder:o"]?.abd ?? 99) <= 12, "pointing left presents the right arm only");
  ok((right["shoulder:o"]?.abd ?? 0) >= 30 && (right.shoulder?.abd ?? 99) <= 12, "pointing right presents the left arm only");
  const down = gestureParts("point_down", 1, 0) as Sample;
  ok((down.shoulder?.flex ?? 0) >= 25 && (down["shoulder:o"]?.flex ?? 0) >= 25 && (down.elbow?.flex ?? 0) >= 45, "pointing down presents both palms in front, low");
}

/* 4. A person who is talking is never frozen, and one who is not is not tense. */
{
  const idle = sample("calm", 0, 0, 10, 0.05, false);
  const talking = sample("calm", 1, 0, 10, 0.05, false);
  ok(range(series(idle, "elbow", "flex")) < 1, "silent and calm, the arms are still");
  ok(range(series(talking, "elbow", "flex")) >= 5 && range(series(talking, "shoulder", "flex")) >= 3, "while talking the elbows and shoulders drift");
  ok(range(series(talking, "neck", "flex")) >= 1.5 && range(series(talking, "neck", "abd")) >= 1.5, "while talking the head nods and tilts a little");
  ok(range(series(idle, "trunk", "flex")) >= 1, "breathing moves the chest even when silent");
  ok(mean(series(idle, "hand", "flex")) >= 8 && mean(series(idle, "hand:o", "flex")) >= 8, "resting fingers are loosely curled, not ruler-straight");
  ok((IDLE.elbow?.flex ?? 0) >= 12, "the idle elbows are slightly bent");
  const beats = sample("calm", 1, 0, 10, 0.05, false);
  ok(range(series(beats, "shoulder", "flex")) > range(series(idle, "shoulder", "flex")) + 3, "the hand lifts on the beats of speech");
}

/* 5. The same gestures everywhere. */
{
  const guide = src("src/components/rehabverse/PhysioGuide.tsx");
  ok(/from "@\/lib\/rehabverse\/guide-motion"/.test(guide) && !/function gestureParts/.test(guide), "the guide uses the shared gesture module");
  ok(/t - gestureStart\.current/.test(guide), "the guide tells the gestures how long they have been going (a wave ends by itself)");
  const rig = src("src/lib/avatar/rig.ts");
  ok(/from "@\/lib\/rehabverse\/guide-motion"/.test(rig) && /gestureParts\(NATURAL\[gesture\]/.test(rig), "the Teacher uses the same natural gestures");
  ok(/smoothArms/.test(rig) && /1 - Math\.exp\(-dt \/ 0\.14\)/.test(rig), "the Teacher's arms glide between gestures instead of jumping");
  ok(/this\.rig\.talk = this\.doc\.speaker\.speaking/.test(src("src/lib/avatar/stage.ts")), "the Teacher's hands and head move while he speaks");
  ok(/gesture: "wave"/.test(src("src/lib/avatar/choreo/site-tour.ts")), "the tour opens with a wave hello");
  ok(JSON.stringify(JSON.parse(src("public/teacher/choreo/site-tour.json")).steps[0]).includes('"wave"'), "...and the built tour data has it");
  const guideData = src("src/lib/rehabverse/guide.ts");
  ok(/gesture: "wave", say: \{ en: "Assalam-o-alaikum!/.test(guideData), "the guide's first line is the greeting, with the wave");
}

console.log(`RehabVerse guide and Teacher motion: ${checks} checks passed (hello is a wave, presenting palms, no signpost arms, natural talking, same gestures everywhere).`);
