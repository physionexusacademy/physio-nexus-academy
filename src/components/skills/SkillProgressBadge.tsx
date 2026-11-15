"use client";

import { useEffect, useState } from "react";
import { SKILLS_EVENT, getSkillsProgress, isLevelPassed } from "@/lib/skills/progress";

/** Whether the skill test has been passed (stored on this device). */
export function SkillProgressBadge({ slug, dark = false }: { slug: string; dark?: boolean }) {
  const [passed, setPassed] = useState(false);
  useEffect(() => {
    const read = () => setPassed(isLevelPassed(getSkillsProgress(), slug, "expert"));
    read();
    window.addEventListener(SKILLS_EVENT, read);
    window.addEventListener("storage", read);
    return () => {
      window.removeEventListener(SKILLS_EVENT, read);
      window.removeEventListener("storage", read);
    };
  }, [slug]);
  return (
    <span className="inline-flex items-center gap-2" aria-label={passed ? "Skill test passed" : "Skill test not passed yet"}>
      <span className={"h-2 w-10 rounded-full " + (passed ? "bg-gradient-to-r from-[#2ee6d6] to-[#3cc8ff]" : dark ? "bg-white/15" : "bg-slate-200")} />
      <span className={"text-[11px] font-bold " + (dark ? "text-[#a9bfd6]" : "text-slate-500")}>{passed ? "Passed ✓" : "Not tested"}</span>
    </span>
  );
}
