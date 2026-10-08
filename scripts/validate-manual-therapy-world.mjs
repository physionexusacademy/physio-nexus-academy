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
    assert(item[field].trim().length > 24, item.slug + ": insufficient depth in " + field);
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
assert(content("src/app/manual-therapy/page.tsx").includes('data-pna-world-entry="v1"'),
  "The original Manual Therapy homepage must link to the worldwide collection");
assert(content("src/app/manual-therapy/world-approaches/page.tsx").includes('data-pna-world-library="v1"'),
  "World encyclopedia index marker missing");
assert(content("src/app/manual-therapy/world-approaches/[slug]/page.tsx").includes('data-pna-world-story="v1"'),
  "World lesson pages are not wired");
assert(content("src/app/manual-therapy/world-approaches/[slug]/page.tsx").includes("lesson.stop")
  && content("src/app/manual-therapy/world-approaches/[slug]/page.tsx").includes("lesson.evidence"),
  "Clinical caution and evidence are required");
assert(content("src/components/manual-therapy/WorldApproachChallenge.tsx").includes("lesson.explanation"),
  "The challenge must reveal reasoning, not only an answer key");

console.log("World Manual Therapy Encyclopedia validation passed: 13/13 distinct evidence-aware stories, safety sections, references, routes and quizzes.");
