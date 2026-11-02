/**
 * Guard the PNA manual-therapy editorial library from coverage regressions.
 * Runs in GitHub Actions before deploying production.
 */
import { readFileSync } from "node:fs";
import { strict as assert } from "node:assert";

const read = (file) => readFileSync(file, "utf8");
const techniqueFiles = ["src/lib/manual-therapy.ts", "src/lib/manual-therapy-additions.ts"];
const parentSources = ["src/lib/manual-therapy-lesson-weave-a.ts", "src/lib/manual-therapy-lesson-weave-b.ts"];
const regionalSources = ["src/lib/manual-therapy-regional-vignettes-a.ts", "src/lib/manual-therapy-regional-vignettes-b.ts"];
const sourceIds = (file, regex) => [...read(file).matchAll(regex)].map((match) => match[1]);
const parentTechniques = techniqueFiles.flatMap((file) => sourceIds(file, /\bslug:\s*"([^"]+)"/g));
const parentStories = parentSources.flatMap((file) => sourceIds(file, /^  "([^"]+)": \{/gm));
const regionalData = read("src/lib/manual-therapy-regional.ts");
const explicitStart = regionalData.indexOf("export const regionalManualApplications");
const explicitEnd = regionalData.indexOf("const regionProfiles");
assert(explicitStart >= 0 && explicitEnd > explicitStart, "Explicit regional application source changed");
const regionalGuideIds = [...regionalData.slice(explicitStart, explicitEnd).matchAll(/\bslug:\s*"([^"]+)"/g)].map((m) => m[1]);
const regionalStories = regionalSources.flatMap((file) => sourceIds(file, /^  "([^"]+)": \{/gm));

function coverage(expected, actual, category) {
  assert.equal(new Set(expected).size, expected.length, category + ": duplicate source slugs");
  assert.equal(new Set(actual).size, actual.length, category + ": duplicate story keys");
  assert.deepEqual([...new Set(actual)].sort(), [...new Set(expected)].sort(),
    category + ": a lesson is missing or no longer matches the source library");
  console.log(category + ": " + actual.length + "/" + expected.length + " unique lessons covered");
}
coverage(parentTechniques, parentStories, "Parent techniques");
coverage(regionalGuideIds, regionalStories, "Existing authored regional guides");

for (const file of parentSources) {
  const data = read(file);
  const entries = [...data.matchAll(/^  "([^"]+)": \{\n([\s\S]*?)\n  \}/gm)];
  for (const [, slug, entry] of entries) {
    for (const field of ["dialogue", "watch", "method", "science", "question", "answer", "closer"]) {
      assert(new RegExp("^    " + field + ': "', "m").test(entry), slug + ": missing " + field);
    }
  }
}

const parentPage = read("src/app/manual-therapy/[slug]/page.tsx");
const storyComponent = read("src/components/manual-therapy/ClinicalStoryChapter.tsx");
const regionalPage = read("src/app/manual-therapy/regions/[slug]/page.tsx");
assert(parentPage.includes("weave.method") && parentPage.includes("weave.science")
  && parentPage.includes("weave.question") && parentPage.includes("weave.answer"),
  "Parent page editorial stages incomplete");
assert(parentPage.includes("items={guide.applicationSteps}") && parentPage.includes("items={guide.stopCriteria}")
  && parentPage.includes("items={technique.contraindications}"), "Parent technical/safety content missing");
assert(storyComponent.includes("weave.dialogue") && storyComponent.includes("weave.watch"),
  "Scene and treatment-room visualization missing");
assert(regionalPage.includes("clinicalStory.title")
  && regionalPage.includes("<RegionalLearningLab slug={item.techniqueSlug} />")
  && regionalPage.includes("Important: this is a clinical framework, not a complete technique protocol.")
  && regionalPage.includes("item.safety?.length"), "Regional story flow or overview safety status missing");
console.log("Narrative flow, clinical method, warnings and regional classification: checked");
