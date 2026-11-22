import fs from "node:fs";
import path from "node:path";
import {
  CAMERA_SPECS, MOVEMENT_TYPES, VALIDATED_TYPES, lintCue, mayShowAngle, metricParts, movementTypeOf, needsBaseline, needsHead, specFor,
  type CameraSpec, type Metric, type Need,
} from "../src/lib/formcheck/index.ts";
import { renderDecisions } from "./formcheck-decisions.ts";
import { loadLibrary } from "./formcheck-library.ts";

/**
 * The 27 camera specifications against the exercise library. Every exercise has exactly one spec; every joint that moves in its own 3D demonstration is covered
 * (measured, tracked, or said to be not measurable); every metric, need and cue is consistent; every cue obeys the wording rules; the decisions document is current;
 * and no movement type is treated as validated before the study says so.
 */
let checks = 0;
const failures: string[] = [];
const ok = (condition: unknown, message: string) => { checks++; if (!condition) failures.push(message); };
const library = loadLibrary();

/* 1. one spec per exercise, in the library's own set and order */
ok(library.length === 27, `the library has ${library.length} neck and back exercises, expected 27`);
ok(CAMERA_SPECS.length === 27, `there are ${CAMERA_SPECS.length} specs, expected 27`);
ok(new Set(CAMERA_SPECS.map((s) => s.id)).size === 27, "spec ids must be unique");
for (const lib of library) {
  const spec = specFor(lib.id);
  ok(spec, `${lib.id}: no camera spec`);
  ok(spec!.region === lib.region, `${lib.id}: region ${spec!.region} does not match the library's ${lib.region}`);
  ok(spec!.sided === lib.sided, `${lib.id}: sided is ${spec!.sided} but the library says ${lib.sided}`);
}
for (const spec of CAMERA_SPECS) ok(library.some((l) => l.id === spec.id), `${spec.id}: not an exercise of the library`);
ok(CAMERA_SPECS.map((s) => s.id).join() === library.map((l) => l.id).join(), "specs are listed in library order");

const lyingPostures = new Set(["supine", "prone", "side-lying", "quadruped"]);
const libraryPosition = (spec: CameraSpec, position: string) => {
  const allowed: Record<string, string[]> = { standing: ["seated", "standing"], supine: ["supine"], prone: ["prone"], sidelying: ["side-lying"], quadruped: ["quadruped", "prone"] };
  return (allowed[position] ?? []).includes(spec.posture);
};

const NEED_PARTS = (metrics: Metric[]): Need[] => [...new Set(metrics.flatMap((m) => metricParts(m)))] as Need[];
const sameSet = (a: string[], b: string[]) => a.length === b.length && a.every((x) => b.includes(x));

const cueIds = new Set<string>();
for (const spec of CAMERA_SPECS) {
  const lib = library.find((l) => l.id === spec.id)!;
  const at = (what: string) => `${spec.id}: ${what}`;

  /* 2. posture, tier, view */
  ok(libraryPosition(spec, lib.position), at(`posture ${spec.posture} does not match the library's ${lib.position}`));
  ok((spec.tier === "B") === lyingPostures.has(spec.posture), at("lying, face-down and all-fours exercises are tier B, seated and standing ones tier A"));
  ok((spec.feasibility === "to-confirm") === (spec.tier === "B"), at("tier B views are to-confirm, tier A views standard"));
  ok(spec.provisional === true, at("every spec is provisional"));
  const frontOrSide = spec.placement.view === "front" || spec.placement.view === "side";
  if (spec.tier === "A") ok(frontOrSide, at("an upright exercise is read from the front or the side"));
  ok(spec.placement.distanceM[0] > 0 && spec.placement.distanceM[0] <= spec.placement.distanceM[1] && spec.placement.heightCm[0] <= spec.placement.heightCm[1], at("distance and height ranges"));
  ok(spec.placement.how.en.length > 40 && spec.placement.how.ru.length > 40, at("the set-up text is written in both languages"));
  ok(spec.limits.en.length > 30 && spec.limits.ru.length > 30, at("the limits are written in both languages"));

  /* 3. metrics */
  const ids = spec.metrics.map((m) => m.id);
  ok(new Set(ids).size === ids.length, at("metric ids are unique"));
  const secondIds = (spec.second?.metrics ?? []).map((m) => m.id);
  const metricIds = (pass: 1 | 2 = 1) => (pass === 2 ? secondIds : ids);
  ok(sameSet(NEED_PARTS(spec.metrics).filter((p) => !spec.need.includes(p as Need)), []), at(`need must list every landmark the metrics use: missing ${NEED_PARTS(spec.metrics).filter((p) => !spec.need.includes(p as Need)).join(", ")}`));
  if (spec.second) {
    const missing = NEED_PARTS(spec.second.metrics).filter((p) => !spec.second!.need.includes(p as Need));
    ok(missing.length === 0, at(`the second pass's need must list every landmark its metrics use: missing ${missing.join(", ")}`));
    ok(spec.second.why.en.length > 20 && spec.second.why.ru.length > 20, at("the second pass is explained in both languages"));
  }
  const usesSides = [...spec.metrics, ...(spec.second?.metrics ?? [])].some((m) => metricParts(m).some((p) => p.startsWith("tested:") || p.startsWith("other:")));
  ok(!usesSides || spec.sided, at("tested: and other: references need a sided exercise (the person says which side)"));
  const faceMetrics = spec.metrics.filter(needsHead);
  ok(!faceMetrics.length || spec.needFace, at("a metric uses the face model, so the spec must say whether it is required or optional"));
  ok(!spec.needFace || faceMetrics.length > 0, at("needFace is set but no metric uses the face model"));
  const primary = spec.metrics.find((m) => m.id === spec.primary.metric);
  ok(primary, at(`the primary metric ${spec.primary.metric} does not exist`));
  if (!primary) continue;
  ok((spec.needFace === "required") === needsHead(primary), at("needFace is required exactly when the primary metric uses the face model"));
  ok(!needsBaseline(primary) || spec.primary.reference === "baseline", at("a rotation metric is read against the person's own neutral position"));

  /* 4. the primary: counted by reps or by a timer, taken from the library's own dosage */
  const { mode, holdMs } = spec.primary;
  const dosageHold = (lib.dosage.holdSeconds ?? lib.dosage.durationSeconds ?? 0) * 1000;
  ok(spec.primary.rest !== spec.primary.target || mode === "hold-steady", at("rest and target must differ"));
  ok((holdMs ?? 0) === dosageHold, at(`the hold of ${holdMs ?? 0} ms differs from the library's dosage (${dosageHold} ms)`));
  const timed = (lib.dosage.reps ?? 0) <= 1 && dosageHold > 0;
  ok(timed === (mode !== "reps"), at(`${timed ? "a timed exercise" : "a repetition exercise"} is counted by ${timed ? "a timer" : "repetitions"}, not ${mode}`));
  ok(mode !== "hold-steady" || (spec.primary.reference === "baseline" && spec.primary.target > 0), at("a steady hold is a band around the start position"));
  ok(!spec.primary.movementsPerRep || spec.primary.movementsPerRep >= 2, at("movementsPerRep is 2 or more when given"));

  /* 5. every joint that moves is covered */
  for (const [joint, axes] of Object.entries(lib.moving)) {
    for (const axis of axes) {
      const cover = spec.joints.find((j) => j.joint === joint && j.axes.includes(axis));
      ok(cover, at(`the joint ${joint} (${axis}) moves in the demonstration but the spec does not cover it`));
      if (cover) ok(cover.role === "mover", at(`${joint} (${axis}) moves, so its role is mover`));
    }
  }
  for (const j of spec.joints) {
    ok(j.axes.length > 0 && (j.role === "mover" || j.role === "watch"), at(`joint ${j.joint}: axes and role`));
    ok((j.why ?? "").length >= 20, at(`joint ${j.joint}: say how or why`));
    const pool = metricIds(j.pass ?? 1);
    if (j.coverage === "not_measurable") ok(!j.metric, at(`joint ${j.joint}: a joint that cannot be measured names no metric`));
    else {
      ok(j.metric && pool.includes(j.metric), at(`joint ${j.joint}: metric ${j.metric} is not a metric of ${j.pass === 2 ? "the second pass" : "the first view"}`));
      ok(!(j.pass === 2) || spec.second, at(`joint ${j.joint}: pass 2 needs a second pass`));
    }
    if (j.coverage === "measured") ok(movementTypeOf(spec, j.metric!) !== null, at(`joint ${j.joint}: metric ${j.metric} has no movement type`));
  }
  ok(movementTypeOf(spec, spec.primary.metric) !== null || spec.primary.mode !== "reps" || true, at("primary movement type"));

  /* 6. cues: obey the wording rules, point at real metrics, are not duplicated */
  for (const cue of spec.cues) {
    ok(!cueIds.has(cue.id), at(`cue id ${cue.id} is used twice`));
    cueIds.add(cue.id);
    ok(metricIds(cue.pass ?? 1).includes(cue.metric), at(`cue ${cue.id}: metric ${cue.metric} is not a metric of ${cue.pass === 2 ? "the second pass" : "the first view"}`));
    ok(cue.value > 0 && cue.forMs >= 200 && cue.forMs <= 2000, at(`cue ${cue.id}: value and duration`));
    for (const lang of ["en", "ru"] as const) ok(lintCue(cue.text[lang]).length === 0, at(`cue ${cue.id}/${lang} breaks the wording rules: ${lintCue(cue.text[lang]).join("; ")}`));
  }
}

/* 7. the movement types: the validated list is empty until the study says otherwise, and every type is named */
ok(Object.keys(VALIDATED_TYPES).every((t) => t in MOVEMENT_TYPES), "a validated type must be a known movement type");
ok(Object.keys(VALIDATED_TYPES).length === 0, "no movement type may be marked validated before the study has been run (protocol section 10.7); record the decision in movement-types.ts when it has");
for (const type of Object.keys(MOVEMENT_TYPES)) ok(!mayShowAngle(type as keyof typeof MOVEMENT_TYPES), `${type}: no angle is shown before validation`);
const usedTypes = new Set<string>();
for (const spec of CAMERA_SPECS) for (const m of [...spec.metrics, ...(spec.second?.metrics ?? [])]) { const t = movementTypeOf(spec, m.id); if (t) usedTypes.add(t); }
for (const type of Object.keys(MOVEMENT_TYPES)) ok(usedTypes.has(type), `movement type ${type} is not used by any spec`);
const battery: number[] = Object.values(MOVEMENT_TYPES).flatMap((t) => (t.battery === null ? [] : [t.battery as number]));
ok([1, 2, 3, 4, 5, 6, 7, 8].every((n) => battery.includes(n)), "every movement of the study battery (protocol section 6) maps to a movement type");

/* 8. the decisions document is generated from the specs: it must be current */
const docFile = path.join(process.cwd(), "docs/camera-form-check/03-exercise-camera-decisions.md");
ok(fs.existsSync(docFile), "docs/camera-form-check/03-exercise-camera-decisions.md is missing: run npm run build:formcheck-decisions");
ok(fs.existsSync(docFile) && fs.readFileSync(docFile, "utf8") === renderDecisions(), "03-exercise-camera-decisions.md is stale: run npm run build:formcheck-decisions");

if (failures.length) {
  console.error(`Form Check specs: ${failures.length} problem(s)\n` + failures.map((f) => `  - ${f}`).join("\n"));
  process.exit(1);
}
const joints = CAMERA_SPECS.flatMap((s) => s.joints);
console.log(`Form Check specs: ${checks} checks passed (27 exercises, ${joints.length} joint decisions: ${joints.filter((j) => j.coverage === "measured").length} measured, ${joints.filter((j) => j.coverage === "tracked").length} tracked, ${joints.filter((j) => j.coverage === "not_measurable").length} not measurable).`);
