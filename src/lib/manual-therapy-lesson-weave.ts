import { lessonWeavePartA, type LessonWeave } from "@/lib/manual-therapy-lesson-weave-a";
import { lessonWeavePartB } from "@/lib/manual-therapy-lesson-weave-b";

/** Technique-specific narrative teaching notes, not procedural substitutes. */
export type { LessonWeave };
export const manualTherapyLessonWeaves: Record<string, LessonWeave> = {
  ...lessonWeavePartA,
  ...lessonWeavePartB,
};
