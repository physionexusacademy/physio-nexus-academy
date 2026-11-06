import type { TeacherLesson, TeacherLessonCard } from "../types.ts";
import { convexConcaveRule } from "./convex-concave-rule.ts";
import { maitlandGrades } from "./maitland-grades.ts";
import { sensitivitySpecificity } from "./sensitivity-specificity.ts";
import { umnVsLmn } from "./umn-vs-lmn.ts";
import { activePassiveInsufficiency } from "./active-passive-insufficiency.ts";
import { openVsClosedChain } from "./open-vs-closed-chain.ts";
import { tissueHealingPhases } from "./tissue-healing-phases.ts";
import { painScienceBasics } from "./pain-science-basics.ts";

/** Display order on the PNA Teacher hub. */
export const teacherLessons: TeacherLesson[] = [
  convexConcaveRule,
  activePassiveInsufficiency,
  openVsClosedChain,
  tissueHealingPhases,
  maitlandGrades,
  sensitivitySpecificity,
  umnVsLmn,
  painScienceBasics,
];

export function getTeacherLesson(slug: string): TeacherLesson | undefined {
  return teacherLessons.find((lesson) => lesson.slug === slug);
}

export function toLessonCard(lesson: TeacherLesson): TeacherLessonCard {
  return {
    slug: lesson.slug,
    title: lesson.title,
    hook: lesson.hook,
    area: lesson.area,
    level: lesson.level,
    bestFor: lesson.bestFor,
    minutes: lesson.minutes,
    flashcardCount: lesson.flashcards.length,
  };
}

export const teacherLessonCards: TeacherLessonCard[] = teacherLessons.map(toLessonCard);
