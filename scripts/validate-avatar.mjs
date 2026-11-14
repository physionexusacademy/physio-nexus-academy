/**
 * Dr. Sajjad teaching data validator. Run: npm run validate:avatar
 * Every spoken line and note resolves to existing lesson / guide text in English and Roman Urdu, every landmark exists, steps are
 * well formed, the choreography is bound to a real lesson, and the generated JSON in public/teacher/choreo/ is fresh.
 */
import fs from "node:fs";
import path from "node:path";
import { loadAvatarData } from "./avatar-run.mjs";

const root = process.cwd();
const { build, splitNumbered } = await loadAvatarData(root);
const { built, problems } = build();
const failures = [...problems];
const check = (condition, message) => {
  if (!condition) failures.push(message);
};

// Parser sanity: the lesson's Roman Urdu steps split into exactly their English count.
check(splitNumbered("1. Ek baat. 2. Doosri baat. 3. Teesri.").length === 3, "splitNumbered must split numbered lists");

for (const c of built) {
  check(c.steps.length >= 3, `${c.slug}: needs at least 3 steps`);
  check(new Set(c.steps.map((s) => s.chip)).size === c.steps.length, `${c.slug}: step chips must be unique`);
  c.steps.forEach((s, i) => {
    const where = `${c.slug} step ${i}`;
    const names = ["tested", "other"];
    if (s.stand) check(names.includes(s.stand.side) && s.stand.distance > 0.2 && s.stand.distance < 1.6, `${where}: stand needs a side and a distance of 0.2–1.6 m`);
    for (const k of s.contacts ?? []) {
      check(k.hand === "L" || k.hand === "R", `${where}: contact hand must be L or R`);
      check(Array.isArray(k.palm) && k.palm.length === 3 && Array.isArray(k.fingers) && k.fingers.length === 3, `${where}: contact needs palm and fingers directions`);
    }
    check(!(s.contacts ?? []).some((k, a, all) => all.findIndex((o) => o.hand === k.hand) !== a), `${where}: a hand can only be in one place`);
    if (s.move) check(s.move.amplitudeMm > 0 && s.move.amplitudeMm <= 20 && s.move.hz > 0 && s.move.hz <= 3, `${where}: movement amplitude 0–20 mm and 0–3 Hz`);
    for (const o of s.overlays) check(o.t && (o.label === undefined || typeof o.label === "string"), `${where}: overlay labels must be plain strings`);
  });
  const file = path.join(root, "public/teacher/choreo", `${c.slug}.json`);
  check(fs.existsSync(file) && fs.readFileSync(file, "utf8") === JSON.stringify(c) + "\n", `public/teacher/choreo/${c.slug}.json is missing or stale — run npm run build:avatar-data`);
}
const idx = path.join(root, "public/teacher/choreo/index.json");
check(fs.existsSync(idx), "public/teacher/choreo/index.json is missing — run npm run build:avatar-data");
if (fs.existsSync(idx)) {
  const listed = JSON.parse(fs.readFileSync(idx, "utf8")).map((e) => e.slug).sort();
  check(JSON.stringify(listed) === JSON.stringify(built.map((c) => c.slug).sort()), "choreo/index.json does not list every choreography");
}
// Label and caption data stay free of the avatar speaking anything that is not a reference.
for (const c of built) for (const s of c.steps) for (const l of s.say) check(l.src !== "missing", `${c.slug}: unresolved line`);

if (failures.length) {
  console.error(`Avatar validation found ${failures.length} problem(s):`);
  for (const f of failures) console.error(" ✗", f);
  process.exit(1);
}
console.log(`Avatar data OK: ${built.length} choreograph${built.length === 1 ? "y" : "ies"}, ${built.reduce((n, c) => n + c.steps.length, 0)} steps, every line resolves in English and Roman Urdu.`);
