import assert from "node:assert/strict";
import { mskConditionIndex } from "../src/lib/msk-injury-index.ts";
import { mskConditions } from "../src/lib/msk-injury-hub.ts";
import { mskClinicalStories } from "../src/lib/msk-clinical-stories.ts";

const indexed = mskConditionIndex.map(({ slug }) => slug);
const clinical = mskConditions.map(({ slug }) => slug);
const authored = Object.keys(mskClinicalStories);
const unique = (items) => new Set(items).size === items.length;

assert.ok(unique(indexed), "Duplicate condition index slug");
assert.ok(unique(clinical), "Duplicate condition library slug");
assert.ok(unique(authored), "Duplicate authored story slug");
assert.deepEqual([...indexed].sort(), [...clinical].sort(), "Index and clinical library must match");
assert.deepEqual([...indexed].sort(), [...authored].sort(), "Every published condition needs its own story");

for (const slug of indexed) {
  const story = mskClinicalStories[slug];
  for (const field of [
    "headline", "scene", "dialogue", "clue", "twist", "aha",
    "patientTranslation", "clinicianReasoning", "rehabBridge", "question", "explanation",
  ]) {
    assert.ok(typeof story[field] === "string" && story[field].trim().length > 35,
      slug + ": missing/too-short " + field);
  }
  assert.ok(Array.isArray(story.options) && story.options.length === 3, slug + ": expected three choices");
  assert.ok(story.options.every((option) => typeof option === "string" && option.length > 15), slug + ": invalid option");
  assert.ok(Number.isInteger(story.answer) && story.answer >= 0 && story.answer < story.options.length,
    slug + ": invalid answer");
  assert.ok(new Set(story.options).size === 3, slug + ": duplicate choices");
}

console.log("MSK story validation passed: " + authored.length + " distinct cases match clinical guides and index.");
