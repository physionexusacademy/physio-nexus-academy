/**
 * Regenerates the static Manual Therapy chapter data. Run after editing any chapter content (guides, mechanisms, mastery, depth, Roman Urdu, stories...):
 *   npm run build:manual-therapy-data
 * The deploy pipeline fails (validate:manual-therapy-data) if these files are stale.
 */
import fs from "node:fs";
import path from "node:path";
import { loadChapterBuilder } from "./manual-therapy-data-run.mjs";

const root = process.cwd();
const { serializeChapterData } = await loadChapterBuilder(root);
const files = serializeChapterData();
const chapterDir = path.join(root, "public/manual-therapy-data/chapters");
fs.mkdirSync(chapterDir, { recursive: true });
const keep = new Set(Object.keys(files));
for (const file of fs.readdirSync(chapterDir)) {
  if (!keep.has(`public/manual-therapy-data/chapters/${file}`)) fs.rmSync(path.join(chapterDir, file));
}
let bytes = 0;
for (const [file, content] of Object.entries(files)) {
  fs.writeFileSync(path.join(root, file), content);
  bytes += Buffer.byteLength(content);
}
console.log(`Manual Therapy chapter data written: ${Object.keys(files).length} files, ${(bytes / 1024).toFixed(0)} KiB.`);
