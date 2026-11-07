"use client";

import { useEffect, useState } from "react";
import { SKILL_LEVELS } from "@/lib/skills/types";
import { SKILLS_EVENT, getSkillsProgress, isLevelPassed } from "@/lib/skills/progress";

/** Four level dots for a skill, filled when the level test is passed (stored on this device). */
export function SkillProgressBadge({ slug, dark = false }: { slug: string; dark?: boolean }) {
  const [passed, setPassed] = useState<boolean[]>([false, false, false, false]);
  useEffect(() => {
    const read = () => {
      const progress = getSkillsProgress();
      setPassed(SKILL_LEVELS.map((level) => isLevelPassed(progress, slug, level.id)));
    };
    read();
    window.addEventListener(SKILLS_EVENT, read);
    window.addEventListener("storage", read);
    return () => {
      window.removeEventListener(SKILLS_EVENT, read);
      window.removeEventListener("storage", read);
    };
  }, [slug]);
  const count = passed.filter(Boolean).length;
  return (
    <span className="inline-flex items-center gap-2" aria-label={`${count} of 4 levels passed`}>
      <span className="flex gap-1">
        {passed.map((done, index) => (
          <span
            key={SKILL_LEVELS[index].id}
            title={`${SKILL_LEVELS[index].label}${done ? " — passed" : ""}`}
            className={"h-2 w-5 rounded-full " + (done ? "bg-gradient-to-r from-[#2ee6d6] to-[#3cc8ff]" : dark ? "bg-white/15" : "bg-slate-200")}
          />
        ))}
      </span>
      <span className={"text-[11px] font-bold " + (dark ? "text-[#a9bfd6]" : "text-slate-500")}>{count === 4 ? "Expert ✓" : `${count}/4`}</span>
    </span>
  );
}
