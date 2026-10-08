import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { worldManualApproaches } from "../src/lib/manual-therapy-world.ts";

const expected = 13;
const required = [
  "title", "category", "kind", "evidenceLabel", "origin", "summary", "headline",
  "scene", "dialogue", "clue", "plotTwist", "aha", "approach", "patientExplanation",
  "evidence", "myth", "stop", "question", "explanation",
];
assert.equal(worldManualApproaches.length, expected, "The published worldwide collection is incomplete");
assert.equal(new Set(worldManualApproaches.map((item) => item.slug)).size, expected, "Duplicate slugs");

for (const item of worldManualApproaches) {
  assert.match(item.slug, /^[a-z0-9-]+$/, item.slug + ": invalid route slug");
  for (const field of required) {
    assert.equal(typeof item[field], "string", item.slug + ": missing " + field);
    assert(item[field].trim().length > (["title", "category", "kind", "evidenceLabel"].includes(field) ? 6 : 24), item.slug + ": insufficient depth in " + field);
  }
  assert(item.scene.length > 140 && item.dialogue.length > 65, item.slug + ": story is too thin");
  assert(item.clinicFlow.length === 4 && item.clinicFlow.every((step) => step.length > 60),
    item.slug + ": clinic reasoning stages missing");
  assert(item.options.length === 3 && item.options.every((option) => option.length > 16),
    item.slug + ": three distinct answers required");
  assert(new Set(item.options).size === 3, item.slug + ": repeated answer choices");
  assert(Number.isInteger(item.answer) && item.answer >= 0 && item.answer < 3, item.slug + ": invalid answer");
  assert(item.sources.length >= 1 && item.sources.every((source) => /^https:\/\//.test(source.url)),
    item.slug + ": cited contextual source required");
}

const content = (path) => readFileSync(path, "utf8");
const hub = content("src/app/manual-therapy/page.tsx");
const detail = content("src/app/manual-therapy/[slug]/page.tsx");
const chapter = content("src/components/manual-therapy/WorldApproachChapter.tsx");
const nextConfig = content("next.config.js");

const oldSource = [
  content("src/lib/manual-therapy.ts"),
  content("src/lib/manual-therapy-additions.ts"),
];
const originalSlugs = oldSource.flatMap((source) => [...source.matchAll(/\\bslug:\\s*"([^"]+)"/g)].map((match) => match[1]));
assert.equal(originalSlugs.length, 22, "Original 22 technique chapters must be preserved");
assert.equal(new Set(originalSlugs).size, 22, "Duplicate original chapters");
assert(worldManualApproaches.every((item) => !originalSlugs.includes(item.slug)),
  "Worldwide approaches must not overwrite existing technique URLs");

assert(hub.includes('data-pna-library="unified-35-v1"'), "Unified main library marker missing");
assert(hub.includes("World Manual Therapy Encyclopedia"), "Main heading was not renamed");
assert(hub.includes("...manualTherapyTechniques.map") && hub.includes("...worldManualApproaches.map"),
  "Main library must render all 22 existing and 13 worldwide items");
assert(hub.includes("href={technique.href}"), "All library cards must open their own chapter");
assert(!hub.includes('data-pna-world-entry="v1"'), "Remove standalone worldwide promo card");
assert(!hub.includes("Explore the worldwide collection"), "No second collection call-to-action");
assert(detail.includes("...worldManualApproaches.map") && detail.includes("<WorldApproachChapter lesson={worldLesson} />"),
  "13 additional chapters must resolve on the same /manual-therapy/[slug] route");
assert(chapter.includes('data-pna-world-story="v1"') && chapter.includes("lesson.stop")
  && chapter.includes("lesson.evidence"), "Worldwide chapters need narrative, safety and evidence sections");
assert(content("src/app/manual-therapy/world-approaches/page.tsx").includes('redirect("/manual-therapy")'),
  "Legacy collection must redirect home");
assert(content("src/app/manual-therapy/world-approaches/[slug]/page.tsx").includes('redirect("/manual-therapy/" + slug)'),
  "Legacy chapter URLs must redirect to unified root");
assert(nextConfig.includes("source: '/manual-therapy/world-approaches/:slug'"),
  "Legacy chapter links need an SEO-preserving redirect");
assert(content("src/components/manual-therapy/WorldApproachChallenge.tsx").includes("lesson.explanation"),
  "Challenges must reveal clinical reasoning");

console.log("World Manual Therapy Encyclopedia validation passed: 35/35 chapters on one main library, no separate collection, 13 lessons with safety and quizzes, old URLs preserved.");
