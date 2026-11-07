/**
 * Every Skills Lab skill, in display order. Used ONLY by the build script and the
 * validator — app code reads the small generated index and fetches static JSON,
 * so none of this content is bundled into the Cloudflare Worker.
 */
import type { SkillDefinition } from "./types.ts";
import { mmtSkill } from "./content/mmt.ts";
import { goniometrySkill } from "./content/goniometry.ts";
import { dermatomesSkill, myotomesSkill, reflexesSkill } from "./content/neuro-levels.ts";
import { peripheralNervesSkill, toneCoordinationSkill } from "./content/neuro-nerves.ts";
import { muscleLengthSkill } from "./content/muscle-length.ts";
import { vitalSignsSkill } from "./content/vital-signs.ts";
import { postureSkill } from "./content/posture.ts";
import { balanceFunctionSkill } from "./content/balance.ts";
import { limbMeasuresSkill } from "./content/limb-measures.ts";
import { palpationSkill } from "./content/palpation.ts";

export const skillDefinitions: SkillDefinition[] = [
  // Phase 1 — measure & test
  mmtSkill,
  goniometrySkill,
  // Phase 2 — neurological examination
  dermatomesSkill,
  myotomesSkill,
  reflexesSkill,
  peripheralNervesSkill,
  toneCoordinationSkill,
  // Phase 3 — whole-patient skills
  muscleLengthSkill,
  vitalSignsSkill,
  postureSkill,
  balanceFunctionSkill,
  limbMeasuresSkill,
  palpationSkill,
];
