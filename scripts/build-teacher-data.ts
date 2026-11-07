/**
 * Regenerates PNA Teacher static data. Run after editing any lesson:
 *   npm run build:teacher-data
 * The deploy pipeline fails (validate:teacher) if these files are stale.
 */
import fs from "node:fs";
import path from "node:path";
import { serializeTeacherData } from "../src/lib/teacher/build-data.ts";

const root = process.cwd();
const files = serializeTeacherData();
const lessonDir = path.join(root, "public/teacher-data/lessons");
fs.mkdirSync(lessonDir, { recursive: true });
fs.mkdirSync(path.join(root, "src/lib/teacher/generated"), { recursive: true });
const keep = new Set(Object.keys(files));
for (const file of fs.readdirSync(lessonDir)) {
  if (!keep.has(`public/teacher-data/lessons/${file}`)) fs.rmSync(path.join(lessonDir, file));
}
let bytes = 0;
for (const [file, content] of Object.entries(files)) {
  fs.writeFileSync(path.join(root, file), content);
  bytes += Buffer.byteLength(content);
}
console.log(`PNA Teacher data written: ${Object.keys(files).length} files, ${(bytes / 1024).toFixed(0)} KiB.`);
