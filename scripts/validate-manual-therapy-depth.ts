import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { DEPTH_NOTE, getTechniqueDepth, techniqueDepthSlugs } from "../src/lib/manual-therapy-depth.ts";

/**
 * Manual Therapy: every technique carries expert depth (reasoning, decision rules, dose, measures, evidence, pitfalls, screening) and a 2D
 * demonstration, and the pages show no beginner / intermediate / advanced labels.
 */
const read = (path: string) => readFileSync(new URL("../" + path, import.meta.url), "utf8");
const KINDS = ["glide", "contract", "fascia", "friction", "neural", "fluid", "thrust", "position", "response", "appraise"];

/* 1. The techniques that have a chapter, taken from the data files (their imports use the "@/" alias, so they are read as text). */
const techniqueSlugs = new Set<string>();
for (const file of ["src/lib/manual-therapy.ts", "src/lib/manual-therapy-additions.ts", "src/lib/manual-therapy-world.ts"]) {
  for (const match of read(file).matchAll(/\b"?slug"?:\s*"([a-z0-9-]+)"/g)) techniqueSlugs.add(match[1]);
}
assert(techniqueSlugs.size >= 35, "could not read the technique list (" + techniqueSlugs.size + ")");
const depthSlugs = techniqueDepthSlugs();
for (const slug of techniqueSlugs) assert(getTechniqueDepth(slug), slug + ": no expert depth block");
for (const slug of depthSlugs) assert(techniqueSlugs.has(slug), slug + ": depth block for a technique that does not exist");

/* 2. Every block is complete and substantive. */
const banned = /\b(beginner|novice|for beginners|level 1|entry[- ]level)\b/i;
const WORLD_SLUGS = [...read("src/lib/manual-therapy-world.ts").matchAll(/"slug":\s*"([a-z0-9-]+)"/g)].map((m) => m[1]);
assert.equal(WORLD_SLUGS.length, 13, "the 13 world approaches must all be read");
for (const slug of WORLD_SLUGS) assert(getTechniqueDepth(slug), slug + ": the world approach has no expert depth");
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
const sections = read("src/components/manual-therapy/ExpertDepthSections.tsx");
assert(sections.includes('id="demo"') && sections.includes('id="expert-depth"') && sections.includes("<TechniqueDemo2D"), "the shared sections must render the demonstration and the expert depth");
assert(detail.includes("<ExpertDepthSections") && read("src/components/manual-therapy/WorldApproachChapter.tsx").includes("<ExpertDepthSections"), "both the technique page and the world chapter must render the depth sections");
assert(!/technique\.level/.test(detail), "the technique page must not show the technique level");
assert(!/technique\.level/.test(read("src/app/manual-therapy/page.tsx")), "the hub must not show the technique level");
const hub = read("src/components/manual-therapy/EditorialManualEncyclopedia.tsx");
assert(!/data-level|\.level\b/.test(hub), "the hub cards must not carry a level");
assert(/id: "demo"/.test(read("src/components/manual-therapy/TechniqueReadingNav.tsx")), "the reading navigation must link to the demonstration");

console.log("manual therapy depth: " + depthSlugs.length + " techniques with expert depth and a 2D demonstration, no level labels");

/* 5. Named techniques are explained one by one (English and Roman Urdu), and the Roman Urdu theory reaches every chapter page. */
import { manualTherapyComponents } from "../src/lib/manual-therapy-components.ts";
assert.equal(manualTherapyComponents["fascial-distortion-model"]?.items.length, 6, "the Fascial Distortion Model must explain all six of its techniques");
assert.equal(manualTherapyComponents["spencer-shoulder-sequence"]?.items.length, 7, "the Spencer sequence must explain all seven movements");
for (const [slug, chapter] of Object.entries(manualTherapyComponents)) {
  assert(depthSlugs.includes(slug), slug + ": components belong to a real chapter");
  assert(chapter.heading.en && chapter.heading.ur && chapter.intro.en.length > 80 && chapter.intro.ur.length > 80, slug + ": heading and intro in both languages");
  for (const item of chapter.items) {
    assert(item.name && item.tag.en && item.tag.ur && item.what.en.length > 15 && item.what.ur.length > 15, slug + " / " + item.name + ": explain what it is in both languages");
    assert(item.perform.en.length >= 3 && item.perform.en.length === item.perform.ur.length, slug + " / " + item.name + ": at least three steps, the same number in both languages");
  }
}
const urduContent = read("src/lib/manual-therapy-urdu-content.ts");
for (const slug of depthSlugs) assert(urduContent.includes('"' + slug + '": {'), slug + ": no Roman Urdu theory");
assert(sections.includes("<ComponentsSection"), "the shared sections must render the named techniques");
assert(detail.includes("<UrduGuideSection") && read("src/components/manual-therapy/WorldApproachChapter.tsx").includes("<UrduGuideSection"), "both chapter pages must offer the Roman Urdu theory");
console.log("named techniques: " + Object.keys(manualTherapyComponents).length + " chapters explain their techniques one by one in English and Roman Urdu");

/* 6. Every technique gets a Demo Lab: seven demonstrations, each fed by that technique's own data, and each named technique has its own demo. */
const lab = read("src/components/manual-therapy/DemoLab.tsx");
for (const id of ["do", "how", "dose", "test", "choose", "safety", "ladder"]) assert(lab.includes('id: "' + id + '"'), "Demo Lab is missing the " + id + " demonstration");
assert(sections.includes("<DemoLab"), "the shared sections must render the Demo Lab");
for (const slug of depthSlugs) {
  const d = getTechniqueDepth(slug)!;
  assert(d.why.length > 40 && d.parameters.length >= 2 && d.measure.length >= 2 && d.choose.length >= 2 && d.screen.length >= 2 && d.pitfalls.length >= 2 && d.progress.length > 20, slug + ": not enough depth data to feed all seven demonstrations");
}
assert(read("src/components/manual-therapy/ChapterClient.tsx").includes("<TechniqueDemo2D"), "each named technique must have its own demonstration");
console.log("demo lab: seven demonstrations for each of " + depthSlugs.length + " techniques, plus one for every named technique");

