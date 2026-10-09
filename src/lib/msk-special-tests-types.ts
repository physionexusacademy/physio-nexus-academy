export const MSK_TEST_REGIONS = [
  "Cervical Spine",
  "Lumbar Spine & SI Joint",
  "Shoulder",
  "Elbow",
  "Wrist & Hand",
  "Hip & Pelvis",
  "Knee",
  "Ankle & Foot",
] as const;

export type MskTestRegion = (typeof MSK_TEST_REGIONS)[number];

export type MskSpecialTest = {
  id: string;
  name: string;
  region: MskTestRegion;
  purpose: string;
  position: string;
  steps: [string, string, string];
  positive: string;
  meaning: string;
  caution?: string;
};

export function defineSpecialTest(
  region: MskTestRegion,
  name: string,
  purpose: string,
  position: string,
  steps: [string, string, string],
  positive: string,
  meaning: string,
  caution?: string,
): MskSpecialTest {
  const slug = [region, name].join("-").toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
  return { id: slug, name, region, purpose, position, steps, positive, meaning, ...(caution ? { caution } : {}) };
}
