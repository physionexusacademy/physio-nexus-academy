import data from "./generated/skills-index.json";
import type { SkillIndexEntry, SkillPhase } from "./types";

/** Small server-side index of the Skills Lab (titles, counts, goals). */
export const skillIndex = data as SkillIndexEntry[];

export function getSkillEntry(slug: string): SkillIndexEntry | undefined {
  return skillIndex.find((skill) => skill.slug === slug);
}

export const skillPhases: { id: SkillPhase; title: string; tagline: string }[] = [
  { id: "measure", title: "Measure & test", tagline: "The two skills every OSCE starts with." },
  { id: "neuro", title: "Neurological examination", tagline: "Find the level, the nerve and the lesion." },
  { id: "patient", title: "Whole-patient skills", tagline: "Length, vitals, posture, balance, measures and palpation." },
];
