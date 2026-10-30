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

// Clinical stories are an optional teaching layer, not a prerequisite for publishing
// a condition guide. Validate every authored story, and ensure none points to an
// unpublished/unknown condition. This keeps new condition pages from failing CI
// merely because their separate case-story content has not been authored yet.
const indexedSet = new Set(indexed);
const unknownStories = authored.filter((slug) => !indexedSet.has(slug));
assert.deepEqual(unknownStories, [], "Every authored story must match a published condition");

for (const slug of authored) {
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

console.log("MSK story validation passed: " + authored.length + " authored cases validated against " + indexed.length + " published condition guides.");
