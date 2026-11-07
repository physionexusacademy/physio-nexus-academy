/**
 * Regenerates the Clinical Skills Lab static data. Run after editing any skill:
 *   npm run build:skills-data
 * Writes public/skills-data/<slug>.json (served as static assets) and the small
 * server index src/lib/skills/generated/skills-index.json.
 * validate:skills fails the deploy if these files are stale.
 */
import fs from "node:fs";
import path from "node:path";
import { serializeSkillsData } from "../src/lib/skills/build-data.ts";

const root = process.cwd();
const files = serializeSkillsData();
const dataDir = path.join(root, "public/skills-data");
fs.mkdirSync(dataDir, { recursive: true });
fs.mkdirSync(path.join(root, "src/lib/skills/generated"), { recursive: true });
const keep = new Set(Object.keys(files));
for (const file of fs.readdirSync(dataDir)) {
  if (!keep.has(`public/skills-data/${file}`)) fs.rmSync(path.join(dataDir, file));
}
let bytes = 0;
for (const [file, content] of Object.entries(files)) {
  fs.writeFileSync(path.join(root, file), content);
  bytes += Buffer.byteLength(content);
}
console.log(`Skills Lab data written: ${Object.keys(files).length} files, ${(bytes / 1024).toFixed(0)} KiB.`);
