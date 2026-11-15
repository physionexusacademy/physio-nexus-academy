import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { DEPTH_NOTE, getTechniqueDepth, techniqueDepthSlugs } from "../src/lib/manual-therapy-depth.ts";

/**
 * Manual Therapy: every technique carries expert depth (reasoning, decision rules, dose, measures, evidence, pitfalls, screening) and a 2D
 * demonstration, and the pages show no beginner / intermediate / advanced labels.
 */
const read = (path: string) => readFileSync(new URL("../" + path, import.meta.url), "utf8");
const KINDS = ["glide", "contract", "fascia", "friction", "neural", "fluid", "thrust", "position"];

/* 1. The techniques that have a chapter, taken from the data files (their imports use the "@/" alias, so they are read as text). */
const techniqueSlugs = new Set<string>();
for (const file of ["src/lib/manual-therapy.ts", "src/lib/manual-therapy-additions.ts"]) {
  for (const match of read(file).matchAll(/\bslug:\s*"([a-z0-9-]+)"/g)) techniqueSlugs.add(match[1]);
}
assert(techniqueSlugs.size >= 20, "could not read the technique list (" + techniqueSlugs.size + ")");
const depthSlugs = techniqueDepthSlugs();
for (const slug of techniqueSlugs) assert(getTechniqueDepth(slug), slug + ": no expert depth block");
for (const slug of depthSlugs) assert(techniqueSlugs.has(slug), slug + ": depth block for a technique that does not exist");

/* 2. Every block is complete and substantive. */
const banned = /\b(beginner|novice|for beginners|level 1|entry[- ]level)\b/i;
for (const slug of depthSlugs) {
  const d = getTechniqueDepth(slug)!;
  assert(KINDS.includes(d.demo), slug + ": unknown demo kind " + d.demo);
  assert(d.why.length >= 200, slug + ": 'why' is too thin");
  assert(d.evidence.length >= 100, slug + ": evidence statement is too thin");
  assert(d.progress.length >= 120, slug + ": progression is too thin");
  assert(d.choose.length >= 3 && d.choose.every((line) => line.length >= 30), slug + ": decision rules missing");
  assert(d.parameters.length >= 3 && d.parameters.every(([label, value]) => label.length >= 3 && value.length >= 4), slug + ": dose parameters missing");
  assert(new Set(d.parameters.map(([label]) => label)).size === d.parameters.length, slug + ": repeated parameter label");
  assert(d.measure.length >= 2 && d.measure.every((line) => line.length >= 25), slug + ": measures missing");
  assert(d.pitfalls.length >= 3 && d.pitfalls.every((line) => line.length >= 30), slug + ": pitfalls missing");
  assert(d.screen.length >= 2 && d.screen.every((line) => line.length >= 20), slug + ": screening missing");
  const all = [d.why, d.evidence, d.progress, ...d.choose, ...d.measure, ...d.pitfalls, ...d.screen, ...d.parameters.flat()].join(" ");
  assert(!banned.test(all), slug + ": the text sorts the reader into levels");
}
assert(DEPTH_NOTE.length > 80 && /supervisor/i.test(DEPTH_NOTE), "the depth note must say doses are ranges a supervisor approves");

/* 3. All eight demonstrations exist, with four captioned steps each, and every kind in use has one. */
const demo = read("src/components/manual-therapy/TechniqueDemo2D.tsx");
for (const kind of KINDS) {
  const block = demo.match(new RegExp("\\n  " + kind + ": \\[([\\s\\S]*?)\\n  \\],"));
  assert(block, kind + ": no step captions");
  assert.equal((block[1].match(/title:/g) ?? []).length, 4, kind + ": needs exactly four steps");
  assert(demo.includes('kind === "' + kind + '"') || kind === "position", kind + ": no scene is drawn for it");
}
for (const slug of depthSlugs) assert(KINDS.includes(getTechniqueDepth(slug)!.demo));
assert(/prefers-reduced-motion/.test(demo), "the demonstration must respect reduced motion");
assert(/aria-pressed|aria-label/.test(demo), "the demonstration controls need accessible names");

/* 4. The pages show the demonstration and the depth, and no level labels. */
const detail = read("src/app/manual-therapy/[slug]/page.tsx");
assert(detail.includes('id="demo"') && detail.includes('id="expert-depth"') && detail.includes("<TechniqueDemo2D"), "the technique page must render the demonstration and the expert depth");
assert(!/technique\.level/.test(detail), "the technique page must not show the technique level");
assert(!/technique\.level/.test(read("src/app/manual-therapy/page.tsx")), "the hub must not show the technique level");
const hub = read("src/components/manual-therapy/EditorialManualEncyclopedia.tsx");
assert(!/data-level|\.level\b/.test(hub), "the hub cards must not carry a level");
assert(/id: "demo"/.test(read("src/components/manual-therapy/TechniqueReadingNav.tsx")), "the reading navigation must link to the demonstration");

console.log("manual therapy depth: " + depthSlugs.length + " techniques with expert depth and a 2D demonstration, no level labels");
