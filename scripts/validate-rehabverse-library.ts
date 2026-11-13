/**
 * PNA RehabVerse exercise-library validator — run in CI before every deploy:
 *   npm run validate:rehabverse-library
 * Fails when an exercise is missing clinical information, English or Roman Urdu text, a valid
 * reference or a real movement; when angles, timings or bone names are impossible; or when a
 * region or level has no exercises.
 */
import fs from "node:fs";
import path from "node:path";
import { REGIONS, LEVELS, type Bi, type ExerciseDef, type Region } from "../src/lib/rehabverse/types.ts";
import { SOURCE, serializeRehabverseData } from "../src/lib/rehabverse/library/source.ts";
import { REFERENCES } from "../src/lib/rehabverse/references.ts";
import { buildCycle, maxAngle } from "../src/lib/rehabverse/motion.ts";

const failures: string[] = [];
const fail = (where: string, message: string) => failures.push(`${where}: ${message}`);

const POSITIONS = new Set(["standing", "supine", "prone", "sitting", "sidelying", "quadruped", "kneeling"]);
const VIEWS = new Set(["front", "side", "back", "angle", "feet"]);
const PROPS = new Set(["wall", "step", "chair", "weight", "ball", "table", "wand", "bolster", "roller", "band", "towel"]);
const CATEGORIES = new Set(["mobility", "stretch", "strength", "stabilisation", "endurance", "balance", "functional", "postural", "tendon_gliding", "proprioception", "gait"]);
const MIN_PER_REGION = 6;
const URDU_SCRIPT = /[؀-ۿݐ-ݿ]/;

/* Bone names come from the actual model file, so a typo cannot slip through. */
function glbNodeNames(file: string): Set<string> {
  const buffer = fs.readFileSync(file);
  const jsonLength = buffer.readUInt32LE(12);
  const json = JSON.parse(buffer.subarray(20, 20 + jsonLength).toString("utf8")) as { nodes: { name?: string }[] };
  return new Set(json.nodes.map((node) => (node.name ?? "").replace(/\.(L|R)$/i, "").toLowerCase()));
}
const bones = glbNodeNames(path.join(process.cwd(), "public/virtual-patient/patient.glb"));

const bi = (where: string, label: string, value: Bi | undefined, minWords = 1) => {
  if (!value || typeof value.en !== "string" || typeof value.ru !== "string") return fail(where, `${label}: needs both en and ru`);
  if (value.en.trim().split(/\s+/).length < minWords) fail(where, `${label}: English too short`);
  if (value.ru.trim().split(/\s+/).length < minWords) fail(where, `${label}: Roman Urdu too short`);
  if (URDU_SCRIPT.test(value.ru)) fail(where, `${label}: Roman Urdu must use Latin letters (found Urdu script)`);
  if (value.en.trim() === value.ru.trim() && value.en.trim().split(/\s+/).length > 3) fail(where, `${label}: Roman Urdu is identical to English`);
};

const all: ExerciseDef[] = [];
for (const region of REGIONS) {
  const list = SOURCE[region];
  if (list.length < MIN_PER_REGION) fail(`region ${region}`, `only ${list.length} exercises (need ${MIN_PER_REGION}+)`);
  if (!list.some((e) => e.level === "beginner")) fail(`region ${region}`, "no beginner exercise");
  for (const exercise of list) {
    if (!exercise.regions.includes(region)) fail(exercise.id, `lives in the ${region} file but does not list ${region} in regions`);
    all.push(exercise);
  }
}

const seen = new Set<string>();
for (const e of all) {
  const at = e.id;
  if (!/^[a-z0-9]+(-[a-z0-9]+)*$/.test(e.id)) fail(at, "id must be kebab-case");
  if (seen.has(e.id)) fail(at, "duplicate id");
  seen.add(e.id);

  bi(at, "name", e.name);
  bi(at, "summary", e.summary, 6);
  bi(at, "setup", e.setup, 6);
  bi(at, "breathing", e.breathing, 2);
  if (e.regions.length === 0 || !e.regions.every((r) => REGIONS.includes(r as Region))) fail(at, "bad regions");
  if (!LEVELS.includes(e.level)) fail(at, "bad level");
  if (!CATEGORIES.has(e.category)) fail(at, "bad category");
  if (e.targets.trim().length < 6) fail(at, "targets missing");
  if (e.indications.length < 1) fail(at, "needs at least one indication");
  if (e.contraindications.length < 1) fail(at, "needs at least one contraindication / precaution");
  if (e.safety.length < 1) fail(at, "needs at least one patient safety line");
  e.safety.forEach((line, i) => bi(at, `safety[${i}]`, line, 3));
  if (e.steps.length < 2) fail(at, "needs at least two steps");
  e.steps.forEach((step, i) => bi(at, `steps[${i}]`, step, 2));
  if (e.mistakes.length < 1) fail(at, "needs at least one common mistake");
  e.mistakes.forEach((m, i) => bi(at, `mistakes[${i}]`, m));
  if (e.progressions.length < 1 || e.regressions.length < 1) fail(at, "needs a progression and a regression");
  if (e.evidence.length < 1) fail(at, "needs at least one evidence reference");
  for (const key of e.evidence) if (!REFERENCES[key]) fail(at, `unknown reference ${key}`);

  // Dosage
  const d = e.dosage;
  if (!(d.sets >= 1 && d.sets <= 6)) fail(at, `sets ${d.sets} out of range`);
  if (!(d.reps || d.holdSeconds || d.durationSeconds)) fail(at, "dosage needs reps, hold or duration");
  if (d.reps !== undefined && !(d.reps >= 1 && d.reps <= 40)) fail(at, `reps ${d.reps} out of range`);
  if (d.holdSeconds !== undefined && !(d.holdSeconds >= 1 && d.holdSeconds <= 120)) fail(at, `hold ${d.holdSeconds}s out of range`);
  if (!(d.restSeconds >= 0 && d.restSeconds <= 180)) fail(at, `rest ${d.restSeconds}s out of range`);
  if (!d.frequency.trim()) fail(at, "frequency missing");

  // Movement
  const m = e.motion;
  if (!POSITIONS.has(m.position)) fail(at, `unknown position ${m.position}`);
  if (m.view && !VIEWS.has(m.view)) fail(at, `unknown view ${m.view}`);
  if (m.moves.length < 1) fail(at, "motion has no moves");
  if (m.zoom !== undefined && !(m.zoom > 0.3 && m.zoom < 3)) fail(at, `zoom ${m.zoom} out of range`);
  if (maxAngle(m) > 175) fail(at, `joint angle ${maxAngle(m)}° is not plausible`);
  for (const [i, move] of m.moves.entries()) {
    if (!(move.ms >= 200 && move.ms <= 8000)) fail(at, `moves[${i}].ms ${move.ms} out of range`);
    if (move.hold !== undefined && !(move.hold >= 0 && move.hold <= 12000)) fail(at, `moves[${i}].hold out of range`);
    if (move.say) bi(at, `moves[${i}].say`, move.say);
  }
  const cycle = buildCycle(m, "left");
  let travelled = 0;
  for (const segment of cycle.filter((s) => s.kind === "move")) {
    for (const key of Object.keys({ ...segment.from, ...segment.to }) as (keyof typeof segment.from)[]) {
      const a = segment.from[key] ?? {};
      const b = segment.to[key] ?? {};
      for (const axis of ["flex", "abd", "rot"] as const) travelled = Math.max(travelled, Math.abs((b[axis] ?? 0) - (a[axis] ?? 0)));
    }
  }
  if (travelled < 4) fail(at, "the demonstration does not visibly move");
  if (m.mistake) {
    bi(at, "mistake.text", m.mistake.text, 3);
    if (m.mistake.moves.length < 1) fail(at, "mistake has no moves");
  }
  for (const prop of m.props ?? []) if (!PROPS.has(prop.kind)) fail(at, `unknown prop ${prop.kind}`);
  const checkBone = (bone: string) => {
    const key = bone.toLowerCase();
    if (!bones.has(key)) fail(at, `bone "${bone}" is not in the model`);
  };
  m.glow?.bones.forEach(checkBone);
  m.arrows?.forEach((a) => checkBone(a.bone));
  if (m.anchor && typeof m.anchor === "object" && m.anchor.bone) checkBone(m.anchor.bone);
}

// The static files the site serves must match the reviewed source exactly.
const expected = serializeRehabverseData();
for (const [file, content] of Object.entries(expected)) {
  const full = path.join(process.cwd(), file);
  if (!fs.existsSync(full)) fail(file, "missing — run npm run build:rehabverse-data");
  else if (fs.readFileSync(full, "utf8") !== content) fail(file, "stale — run npm run build:rehabverse-data");
}
const dataDir = path.join(process.cwd(), "public/rehabverse-data");
for (const file of fs.existsSync(dataDir) ? fs.readdirSync(dataDir) : []) if (!expected[`public/rehabverse-data/${file}`]) fail(`public/rehabverse-data/${file}`, "orphan file — run npm run build:rehabverse-data");

const total = all.length;
const byRegion = Object.fromEntries(REGIONS.map((r) => [r, all.filter((e) => e.regions.includes(r)).length]));
const byLevel = Object.fromEntries(LEVELS.map((l) => [l, all.filter((e) => e.level === l).length]));
if (total < 60) fail("library", `only ${total} exercises`);

if (failures.length) {
  console.error(`RehabVerse library: ${failures.length} problem(s)\n` + failures.map((f) => ` - ${f}`).join("\n"));
  process.exit(1);
}
console.log(`RehabVerse library OK — ${total} exercises\n  by region: ${JSON.stringify(byRegion)}\n  by level: ${JSON.stringify(byLevel)}`);
