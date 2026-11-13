/**
 * Regenerates the RehabVerse exercise data served as static assets. Run after editing any exercise:
 *   npm run build:rehabverse-data
 * validate:rehabverse-library fails the deploy if public/rehabverse-data/ is stale.
 */
import fs from "node:fs";
import path from "node:path";
import { serializeRehabverseData } from "../src/lib/rehabverse/library/source.ts";

const root = process.cwd();
const files = serializeRehabverseData();
const dir = path.join(root, "public/rehabverse-data");
fs.mkdirSync(dir, { recursive: true });
const keep = new Set(Object.keys(files));
for (const file of fs.readdirSync(dir)) if (!keep.has(`public/rehabverse-data/${file}`)) fs.rmSync(path.join(dir, file));
let bytes = 0;
for (const [file, content] of Object.entries(files)) {
  fs.writeFileSync(path.join(root, file), content);
  bytes += Buffer.byteLength(content);
}
console.log(`RehabVerse exercise data written: ${Object.keys(files).length} files, ${(bytes / 1024).toFixed(0)} KiB.`);
