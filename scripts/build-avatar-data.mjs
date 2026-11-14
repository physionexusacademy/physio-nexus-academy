/**
 * Builds the static teaching data for Dr. Sajjad: public/teacher/choreo/<slug>.json (one per technique) and index.json.
 * The browser fetches these; they never enter the Cloudflare worker. Run after editing src/lib/avatar/choreo/*.
 */
import fs from "node:fs";
import path from "node:path";
import { loadAvatarData } from "./avatar-run.mjs";

const root = process.cwd();
const { build } = await loadAvatarData(root);
const { built, problems } = build();
if (problems.length) {
  console.error(`Avatar data has ${problems.length} problem(s):`);
  for (const p of problems) console.error(" ✗", p);
  process.exit(1);
}
const out = path.join(root, "public/teacher/choreo");
fs.mkdirSync(out, { recursive: true });
for (const f of fs.readdirSync(out)) if (f.endsWith(".json")) fs.rmSync(path.join(out, f));
for (const c of built) fs.writeFileSync(path.join(out, `${c.slug}.json`), JSON.stringify(c) + "\n");
fs.writeFileSync(path.join(out, "index.json"), JSON.stringify(built.map((c) => ({ slug: c.slug, lesson: c.lessonSlug, title: c.title, review: c.review.status }))) + "\n");
console.log(`Wrote ${built.length} choreograph${built.length === 1 ? "y" : "ies"} to public/teacher/choreo/`);
