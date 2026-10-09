import { spineSpecialTests } from "./msk-special-tests-spine";
import { upperLimbSpecialTests } from "./msk-special-tests-upper";
import { lowerLimbSpecialTests } from "./msk-special-tests-lower";
import { MSK_TEST_REGIONS, type MskSpecialTest } from "./msk-special-tests-types";

export { MSK_TEST_REGIONS };
export type { MskSpecialTest };

const all: MskSpecialTest[] = [...spineSpecialTests, ...upperLimbSpecialTests, ...lowerLimbSpecialTests];

export const mskSpecialTests = MSK_TEST_REGIONS.flatMap((region) => all.filter((item) => item.region === region));

// Explicit integrity checks catch duplicate entries and incomplete procedure cards in development.
if (process.env.NODE_ENV !== "production") {
  const identifiers = new Set<string>();
  for (const test of mskSpecialTests) {
    if (identifiers.has(test.id)) throw new Error("Duplicate MSK special test id: " + test.id);
    identifiers.add(test.id);
    if (!test.purpose || !test.position || !test.positive || !test.meaning || test.steps.length !== 3 || test.steps.some((s) => !s.trim())) {
      throw new Error("Incomplete MSK special test: " + test.name);
    }
  }
  if (mskSpecialTests.length !== all.length) throw new Error("Unrecognized MSK test region");
}

export const mskTestCounts = MSK_TEST_REGIONS.map((region) => ({
  region, count: mskSpecialTests.filter((item) => item.region === region).length
}));
