/**
 * Every Skills Lab skill, in display order. Used ONLY by the build script and the
 * validator — app code reads the small generated index and fetches static JSON,
 * so none of this content is bundled into the Cloudflare Worker.
 */
import type { SkillDefinition } from "./types.ts";
import { mmtSkill } from "./content/mmt.ts";
import { goniometrySkill } from "./content/goniometry.ts";

export const skillDefinitions: SkillDefinition[] = [mmtSkill, goniometrySkill];
