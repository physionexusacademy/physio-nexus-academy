/**
 * Virtual Patient validator — run before every deploy:
 *   npm run validate:virtual-patient
 * Bundles the real case, exam, anatomy and scoring modules (esbuild, tsconfig paths)
 * and checks: case data is complete and consistent, dermatomes/nerves land where
 * textbooks put them on the 3D body, findings match each diagnosis, scoring works,
 * and the model files are in place and small.
 */
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { pathToFileURL } from "node:url";
import { build } from "esbuild";

const root = process.cwd();
const entry = `
export { CASES, PRACTICE_CASE } from "@/lib/virtual-patient/cases";
export * as exam from "@/lib/virtual-patient/exam";
export { classifySurface } from "@/lib/virtual-patient/anatomy";
export { scoreSession, examKeyDone } from "@/lib/virtual-patient/session";
export { default as rig } from "@/lib/virtual-patient/generated/rig.json";
`;
const result = await build({
  stdin: { contents: entry, resolveDir: root, loader: "ts" },
  bundle: true,
  platform: "node",
  format: "esm",
  write: false,
  logLevel: "error",
  tsconfig: path.join(root, "tsconfig.json"),
  define: { "process.env.NODE_ENV": '"test"' },
  plugins: [{
    name: "stub-browser-only",
    setup(b) {
      // session.ts imports unified-progress (browser storage) — stub it for Node.
      b.onResolve({ filter: /unified-progress$/ }, () => ({ path: "unified-progress", namespace: "stub" }));
      b.onLoad({ filter: /.*/, namespace: "stub" }, () => ({ contents: "export const recordLearningActivity = () => {};", loader: "js" }));
    },
  }],
});
const dir = fs.mkdtempSync(path.join(os.tmpdir(), "pna-vp-"));
const file = path.join(dir, "vp.mjs");
fs.writeFileSync(file, result.outputFiles[0].text);
const { CASES, PRACTICE_CASE, exam, classifySurface, scoreSession, examKeyDone, rig } = await import(pathToFileURL(file).href);

const failures = [];
const fail = (where, message) => failures.push(`${where}: ${message}`);

/* ---------- 1. Model files ---------- */
const glb = path.join(root, "public/virtual-patient/patient.glb");
if (!fs.existsSync(glb)) fail("model", "public/virtual-patient/patient.glb missing — run node scripts/build-virtual-patient.mjs");
else if (fs.statSync(glb).size > 1.5 * 1024 * 1024) fail("model", `patient.glb is ${(fs.statSync(glb).size / 1024).toFixed(0)} KiB (keep it under 1.5 MiB for phones)`);
if (rig.source?.license !== "CC0-1.0") fail("model", "rig.json must record the CC0 source licence");
if (Object.keys(rig.landmarks).length < 20) fail("model", "too few palpation landmarks");

/* ---------- 2. Anatomy spot checks (rest-pose points on the real body) ---------- */
const bone = (name) => rig.bones.find((b) => b.name === name);
const H = (name) => bone(name).head;
const T = (name) => bone(name).tail;
const lerp = (a, b, t) => a.map((v, i) => v + (b[i] - v) * t);
const add = (a, b) => a.map((v, i) => v + b[i]);
const lm = (id, side = "left") => (rig.landmarks[id][side] ?? rig.landmarks[id].mid).p;
const probes = [
  ["dorsum of the foot", add(lerp(H("foot.L"), H("toe3-1.L"), 0.55), [0, 0.035, 0]), "foot.L", "L5"],
  ["lateral heel", add(H("foot.L"), [0.035, -0.04, -0.045]), "foot.L", "S1"],
  ["medial malleolus", lm("medial-malleolus"), "foot.L", "L4"],
  ["thumb", T("finger1-3.L"), "finger1-3.L", "C6"],
  ["middle finger", T("finger3-3.L"), "finger3-3.L", "C7"],
  ["little finger", T("finger5-3.L"), "finger5-3.L", "C8"],
  ["umbilicus", lm("umbilicus", "mid"), "spine05", "T10"],
  ["nipple", T("breast.L"), "breast.L", "T4"],
  ["xiphoid", lm("xiphoid", "mid"), "spine03", "T6"],
  ["back of the knee", lm("popliteal-fossa"), "lowerleg01.L", "S2"],
];
for (const [name, point, boneName, expected] of probes) {
  const got = classifySurface(point, boneName);
  if (got.dermatome !== expected) fail(`anatomy › ${name}`, `expected ${expected}, got ${got.dermatome ?? "none"} (${got.region})`);
  const mirrored = classifySurface([-point[0], point[1], point[2]], boneName.replace(/\.L$/, ".R"));
  if (mirrored.dermatome !== got.dermatome) fail(`anatomy › ${name}`, `left/right mismatch (${got.dermatome} vs ${mirrored.dermatome})`);
}

/* ---------- 3. Cases ---------- */
const ids = new Set();
const MOTIONS = new Set(exam.MOTIONS.map((m) => m.id));
const TESTS = new Set(exam.MUSCLE_TESTS.map((t) => t.id));
const REFLEXES = new Set(exam.REFLEXES.map((r) => r.id));
const SPECIAL = new Set(exam.SPECIAL_TESTS.map((t) => t.id));
const TAPE = new Set(exam.TAPE.map((t) => t.id));
const HISTORY = new Set(exam.HISTORY.map((h) => h.id));
const DERMATOMES = new Set(["C2", "C3", "C4", "C5", "C6", "C7", "C8", "T1", "T2", "T3", "T4", "T5", "T6", "T7", "T8", "T9", "T10", "T11", "T12", "L1", "L2", "L3", "L4", "L5", "S1", "S2"]);
const NERVES = new Set(["trigeminal", "axillary", "radial", "musculocutaneous", "median", "ulnar", "medial-antebrachial", "lateral-femoral-cutaneous", "femoral", "obturator", "saphenous", "superficial-fibular", "deep-fibular", "sural", "tibial", "posterior-femoral-cutaneous"]);
const LANDMARKS = new Set(Object.keys(rig.landmarks));
const keyOf = (k) => k.replace(/\.(left|right)$/, "");

for (const c of [...CASES, PRACTICE_CASE]) {
  const at = (part) => `${c.id} › ${part}`;
  if (ids.has(c.id)) fail(c.id, "duplicate case id");
  ids.add(c.id);
  if (!c.patient?.name || !c.referral) fail(at("intro"), "patient and referral required");
  for (const [id, line] of Object.entries(c.history)) {
    if (!HISTORY.has(id)) fail(at("history"), `unknown question ${id}`);
    if (!line.en?.trim() || !line.ur?.trim()) fail(at(`history ${id}`), "needs English and Roman Urdu");
  }
  const f = c.findings;
  for (const key of Object.keys(f.rom ?? {})) if (!MOTIONS.has(keyOf(key))) fail(at("rom"), `unknown motion ${key}`);
  for (const key of Object.keys(f.strength ?? {})) {
    if (!TESTS.has(keyOf(key))) fail(at("strength"), `unknown muscle test ${key}`);
    const g = f.strength[key];
    if (!(g >= 0 && g <= 5)) fail(at("strength"), `grade ${g} out of range`);
  }
  for (const key of Object.keys(f.reflexes ?? {})) if (!REFLEXES.has(keyOf(key))) fail(at("reflexes"), `unknown reflex ${key}`);
  for (const key of Object.keys(f.special ?? {})) if (!SPECIAL.has(keyOf(key))) fail(at("special"), `unknown special test ${key}`);
  for (const key of Object.keys(f.tape ?? {})) if (!TAPE.has(keyOf(key))) fail(at("tape"), `unknown measurement ${key}`);
  for (const rule of f.sensation ?? []) {
    for (const d of rule.dermatomes ?? []) if (!DERMATOMES.has(d)) fail(at("sensation"), `unknown dermatome ${d}`);
    for (const n of rule.nerves ?? []) if (!NERVES.has(n)) fail(at("sensation"), `unknown nerve ${n}`);
  }
  for (const rule of f.tender ?? []) for (const l of rule.landmarks ?? []) if (!LANDMARKS.has(l)) fail(at("tender"), `unknown landmark ${l}`);
  if (c.id === "practice") continue;

  for (const id of c.key.history) if (!HISTORY.has(id)) fail(at("key"), `unknown history item ${id}`);
  for (const key of c.key.exam) {
    const [type, value] = key.split(":");
    const ok = {
      rom: MOTIONS, mmt: TESTS, reflex: REFLEXES, special: SPECIAL, tape: TAPE,
      sensation: new Set([...DERMATOMES, ...NERVES]),
      palpate: new Set([...LANDMARKS, "Inner knee", "Lateral ankle", "Top of the shoulder"]),
    }[type];
    if (key !== "vitals" && !ok?.has(value)) fail(at("key"), `unknown exam item ${key}`);
  }
  if (c.key.exam.length < 3) fail(at("key"), "list at least 3 key examination items");
  for (const q of ["diagnosis", "plan"]) {
    const block = c.questions[q];
    if (block.options.length < 3) fail(at(q), "needs at least 3 options");
    if (!(block.answer >= 0 && block.answer < block.options.length)) fail(at(q), "answer index out of range");
    if (!block.why) fail(at(q), "explain the answer");
  }
  if (c.teaching.length < 2) fail(at("teaching"), "add take-home points");

  // A perfect student: asks every key question, performs and records every key test correctly.
  const events = [];
  for (const id of c.key.history) events.push({ kind: "history", id });
  for (const key of c.key.exam) {
    const [type, value] = key.split(":");
    if (type === "rom") events.push({ kind: "rom", motion: value, side: "left", truth: 0, recorded: 0 });
    if (type === "mmt") events.push({ kind: "mmt", test: value, side: "left", truth: 5, recorded: 5 });
    if (type === "reflex") events.push({ kind: "reflex", reflex: value, side: "left", truth: "2+", recorded: "2+" });
    if (type === "special") events.push({ kind: "special", test: value, side: "left", positive: true, recorded: true });
    if (type === "sensation") events.push({ kind: "sensation", side: "left", dermatome: value, nerve: value, region: "", response: "reduced" });
    if (type === "palpate") events.push({ kind: "palpate", side: "left", landmark: value, region: value, tender: false });
    if (type === "tape") events.push({ kind: "tape", tape: value, side: "left", value: 1 });
    if (type === "vitals") events.push({ kind: "vitals" });
  }
  for (const key of c.key.exam) if (!examKeyDone(key, events)) fail(at("scoring"), `key ${key} not recognised as done`);
  const perfect = scoreSession(c, events, { diagnosis: c.questions.diagnosis.answer, plan: c.questions.plan.answer });
  if (perfect.total !== 100 || !perfect.passed) fail(at("scoring"), `perfect student scored ${perfect.total}`);
  const wrongPlan = (c.questions.plan.answer + 1) % c.questions.plan.options.length;
  const missed = scoreSession(c, events, { diagnosis: c.questions.diagnosis.answer, plan: wrongPlan });
  if (c.key.redFlag && (missed.total > 40 || !missed.missedRedFlag)) fail(at("scoring"), "a missed red flag must cap the score at 40");
}

/* ---------- 4. Findings match each diagnosis ---------- */
const byId = Object.fromEntries(CASES.map((c) => [c.id, c]));
const surface = (side, dermatome, nerve = null) => ({ side, dermatome, nerve, region: "", covered: false });
const expect = (cond, where, message) => cond || fail(where, message);
const l5 = byId["lumbar-l5"].findings;
expect(exam.sensationFor(l5, surface("left", "L5")) === "reduced", "lumbar-l5", "left L5 sensation should be reduced");
expect(exam.sensationFor(l5, surface("right", "L5")) === "normal", "lumbar-l5", "right L5 sensation should be normal");
expect(exam.strengthFor(l5, "hip-abd", "left") < 5, "lumbar-l5", "L5 root should weaken hip abduction");
expect(exam.strengthFor(byId["fibular-palsy"].findings, "hip-abd", "right") === 5, "fibular-palsy", "fibular nerve palsy must spare hip abduction");
expect(exam.specialFor(byId["fibular-palsy"].findings, "slr", "right").positive === false, "fibular-palsy", "SLR must be negative in a peripheral nerve lesion");
expect(exam.sensationFor(byId["carpal-tunnel"].findings, surface("right", "C6", "radial")) === "normal", "carpal-tunnel", "the back of the hand (radial nerve) must be spared");
expect(exam.signFor(byId["stroke"].findings, "babinski", "left") === true, "stroke", "stroke needs an upgoing plantar on the weak side");
expect(exam.signFor(byId["myelopathy"].findings, "hoffmann", "right") === true, "myelopathy", "myelopathy needs Hoffmann's sign");
const fs1 = exam.romFor(byId["frozen-shoulder"].findings, "shoulder-er", "left");
expect(fs1.passive < 45, "frozen-shoulder", "frozen shoulder must lose passive external rotation");
const rc = exam.romFor(byId["rotator-cuff-tear"].findings, "shoulder-abduction", "right");
expect(rc.passive - rc.active > 60, "rotator-cuff-tear", "cuff tear: passive range should exceed active");

if (failures.length) {
  console.error(`Virtual Patient validation failed (${failures.length}):`);
  for (const message of failures) console.error("  ✗ " + message);
  process.exit(1);
}
console.log(`Virtual Patient OK — ${CASES.length} cases, ${exam.MOTIONS.length} ROM motions, ${exam.MUSCLE_TESTS.length} muscle tests, ${exam.REFLEXES.length} reflexes/signs, ${exam.SPECIAL_TESTS.length} special tests, ${Object.keys(rig.landmarks).length} landmarks, ${(fs.statSync(glb).size / 1024).toFixed(0)} KiB model.`);
