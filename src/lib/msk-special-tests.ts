import { spineSpecialTests } from "./msk-special-tests-spine";
import { upperLimbSpecialTests } from "./msk-special-tests-upper";
import { lowerLimbSpecialTests } from "./msk-special-tests-lower";
import { additionalSpecialTests, additionalTechniqueGuides } from "./msk-special-tests-additions";
import { spineTechniqueGuides } from "./msk-special-tests-technique-spine";
import { upperTechniqueGuides } from "./msk-special-tests-technique-upper";
import { lowerTechniqueGuides } from "./msk-special-tests-technique-lower";
import { MSK_TEST_REGIONS, type MskSpecialTest } from "./msk-special-tests-types";
import type { MskTechniqueGuide } from "./msk-special-tests-technique-types";

export { MSK_TEST_REGIONS };
export type { MskSpecialTest };

export type GuidedMskSpecialTest = MskSpecialTest & { technique: MskTechniqueGuide };

const originalTests: MskSpecialTest[] = [...spineSpecialTests, ...upperLimbSpecialTests, ...lowerLimbSpecialTests, ...additionalSpecialTests];
const guides: MskTechniqueGuide[] = [...spineTechniqueGuides, ...upperTechniqueGuides, ...lowerTechniqueGuides, ...additionalTechniqueGuides];
const guideByName = new Map(guides.map((guide) => [guide.name, guide]));

// Fail the build rather than publish a card without therapist hands and force directions.
if (guideByName.size !== guides.length) {
  throw new Error("Duplicate named MSK special-test technique guides");
}
if (guides.length !== originalTests.length) {
  throw new Error("MSK special tests and therapist technique guides have different totals");
}
const testNames = new Set(originalTests.map((test) => test.name));
for (const guide of guides) {
  if (!testNames.has(guide.name)) throw new Error("Orphan MSK technique guide: " + guide.name);
  if (![guide.therapist, guide.hands, guide.force, guide.visualize, guide.avoid].every((value) => value.trim().length > 25)) {
    throw new Error("Incomplete hand placement or force guide for: " + guide.name);
  }
}

const all: GuidedMskSpecialTest[] = originalTests.map((test) => {
  const technique = guideByName.get(test.name);
  if (!technique) throw new Error("Missing hand placement or force direction guide for " + test.name);
  return { ...test, technique };
});

export const mskSpecialTests: GuidedMskSpecialTest[] = MSK_TEST_REGIONS.flatMap((region) => all.filter((item) => item.region === region));

// Consistency checks run both in build and production, so no incomplete test ships.
const identifiers = new Set<string>();
for (const test of mskSpecialTests) {
  if (identifiers.has(test.id)) throw new Error("Duplicate MSK special test id: " + test.id);
  identifiers.add(test.id);
  if (!test.purpose || !test.position || !test.positive || !test.meaning || test.steps.length !== 3 || test.steps.some((s) => !s.trim())) {
    throw new Error("Incomplete MSK special test: " + test.name);
  }
}
if (mskSpecialTests.length !== all.length) throw new Error("Unrecognized MSK test region");

export const mskTestCounts = MSK_TEST_REGIONS.map((region) => ({
  region, count: mskSpecialTests.filter((item) => item.region === region).length
}));
