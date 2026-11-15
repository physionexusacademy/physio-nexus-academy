import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

/**
 * No beginner / intermediate / advanced / expert barriers for learners: every skill, guide and case is shown at full depth, with nothing behind a
 * level switch, a lock or a "next level" test. (Clinician tools and data fields that describe difficulty internally are out of scope.)
 */
const read = (path: string) => readFileSync(new URL("../" + path, import.meta.url), "utf8");
const forbid = (path: string, patterns: RegExp[], why: string) => {
  const text = read(path);
  for (const pattern of patterns) assert(!pattern.test(text), `${path}: ${why} (${pattern})`);
};

forbid("src/components/skills/SkillLab.tsx", [/LevelBar/, /isLevelUnlocked/, /useState<SkillLevelId>/, /Pass the .* test first/, /unlock at higher levels/, /Level test/], "the Skills Lab must not gate content by level");
forbid("src/components/skills/SkillProgressBadge.tsx", [/of 4 levels/, /Beginner|Intermediate|Advanced/], "the skill badge must not show levels");
forbid("src/app/conditions/ConditionGuide.tsx", [/role="tablist"/, /hidden=\{depth/, /localStorage/, /GoDeeper/], "a condition guide must show all three parts on one page");
forbid("src/app/conditions/ConditionsExplorer.tsx", [/Choose how deep/, /radiogroup/, /pna-cond-depth/], "the conditions list must not ask the visitor to choose a depth");
forbid("src/components/virtual-patient/Panels.tsx", [/LEVEL_TONE/, /\{c\.level\}/], "Virtual Patient cases must not show a level");
forbid("src/components/rehabverse/LibraryBrowser.tsx", [/All levels/, /Har level/, /LEVEL_LABEL/], "the exercise library must not filter or label by level");
forbid("src/components/rehabverse/ExerciseDetails.tsx", [/LEVEL_LABEL/], "an exercise must not show a level chip");
forbid("src/app/case-lab/CaseLabLibrary.tsx", [/Clinical level/, /All levels/, /patient\.difficulty/], "Case Lab must not filter or label by level");
forbid("src/app/skills/page.tsx", [/beginner to expert/i, /Beginner → Expert/, /level test/i], "the Skills hub must not describe levels");
forbid("src/components/home/HomeFeatures.tsx", [/Beginner/, /Intermediate/, /Advanced/, /Four levels/], "the homepage feature cards must not show levels");
forbid("src/components/home/StudentPass.tsx", [/start at Beginner/i], "the student pass must not mention levels");

console.log("no levels: skills, conditions, virtual patient, exercise library, case lab and homepage cards show full depth");
