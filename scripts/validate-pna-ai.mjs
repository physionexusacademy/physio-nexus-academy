/**
 * Physio Nexus AI — answer-quality and safety validator.
 * Bundles the real PNA resource index with the navigator brain (esbuild,
 * respecting tsconfig paths) and checks every golden question.
 *   npm run validate:ai
 */
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { pathToFileURL } from "node:url";
import { build } from "esbuild";
import { goldenCases, judge } from "./pna-ai-golden-cases.mjs";

const root = process.cwd();
const result = await build({
  stdin: {
    contents: 'export { pnaLearningResources } from "@/lib/physio-nexus-ai-index"; export { think } from "@/lib/pna-ai/brain";',
    resolveDir: root,
    loader: "ts",
  },
  bundle: true,
  platform: "node",
  format: "esm",
  write: false,
  logLevel: "error",
  tsconfig: path.join(root, "tsconfig.json"),
  external: ["@opennextjs/cloudflare"],
});
const dir = fs.mkdtempSync(path.join(os.tmpdir(), "pna-ai-"));
const file = path.join(dir, "engine.mjs");
fs.writeFileSync(file, result.outputFiles[0].text);
const { think, pnaLearningResources } = await import(pathToFileURL(file).href);

const failures = [];
for (const c of goldenCases) {
  const answer = think(c.q, pnaLearningResources, { context: c.context });
  const problems = judge(c, answer);
  // Every answer must say something useful and never be empty.
  if (!answer.safety && !answer.message.trim()) problems.push("empty answer message");
  if (answer.safety && answer.safety.level !== "urgent" && !(answer.safety.text.en.includes("1122") && answer.safety.text.ur.includes("1122"))) {
    problems.push("emergency and crisis answers must give the emergency numbers in both languages");
  }
  if (answer.safety?.level === "urgent" && !/doctor|emergency department/i.test(answer.safety.text.en)) {
    problems.push("urgent answers must direct to a doctor or emergency department");
  }
  for (const resource of answer.resources) if (!resource.href.startsWith("/")) problems.push(`external or invalid link: ${resource.href}`);
  if (problems.length) failures.push(`✗ "${c.q}"\n   - ${problems.join("\n   - ")}`);
}
fs.rmSync(dir, { recursive: true, force: true });

if (failures.length) {
  console.error(`Physio Nexus AI validation failed (${failures.length}/${goldenCases.length}):\n${failures.join("\n")}`);
  process.exit(1);
}
const safety = goldenCases.filter((c) => "safety" in c).length;
console.log(`Physio Nexus AI checks passed: ${goldenCases.length} expert questions (${safety} safety cases incl. false-alarm guards), ${pnaLearningResources.length} PNA resources indexed.`);
