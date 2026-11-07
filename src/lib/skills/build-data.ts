import { compileSkill, indexEntry } from "./compile.ts";
import { skillDefinitions } from "./registry.ts";

/** file path (relative to repo root) → file content */
export function serializeSkillsData(): Record<string, string> {
  const files: Record<string, string> = {};
  const compiled = skillDefinitions.map(compileSkill);
  for (const skill of compiled) files[`public/skills-data/${skill.slug}.json`] = JSON.stringify(skill);
  files["src/lib/skills/generated/skills-index.json"] = JSON.stringify(compiled.map(indexEntry), null, 1) + "\n";
  return files;
}
