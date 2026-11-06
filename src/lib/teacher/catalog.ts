/**
 * One registry for every PNA Teacher lesson: the hand-written concept lessons
 * (served at /learn/[slug]) and the 35 Manual Therapy chapter lessons (served
 * inside each /manual-therapy/[slug] page). Use lessonHref() for every link.
 */
import type { TeacherLesson, TeacherLessonCard } from "./types.ts";
import { teacherLessons, toLessonCard } from "./lessons/index.ts";
import { manualTherapyTeacherLessons } from "./manual-therapy/index.ts";

export const allTeacherLessons: TeacherLesson[] = [...teacherLessons, ...manualTherapyTeacherLessons];

const manualSlugs = new Set(manualTherapyTeacherLessons.map((lesson) => lesson.slug));
const bySlug = new Map(allTeacherLessons.map((lesson) => [lesson.slug, lesson]));

export function isManualTherapyLesson(slug: string): boolean {
  return manualSlugs.has(slug);
}

export function getAnyTeacherLesson(slug: string): TeacherLesson | undefined {
  return bySlug.get(slug);
}

/** Where a lesson lives. Pass a path slug so the lesson can send the learner back to it. */
export function lessonHref(slug: string, pathSlug?: string): string {
  const query = pathSlug ? `?path=${pathSlug}` : "";
  return manualSlugs.has(slug) ? `/manual-therapy/${slug}${query}#pna-teacher` : `/learn/${slug}${query}`;
}

export const allTeacherLessonCards: TeacherLessonCard[] = allTeacherLessons.map((lesson) => toLessonCard(lesson, lessonHref(lesson.slug)));
export const conceptLessonCards: TeacherLessonCard[] = teacherLessons.map((lesson) => toLessonCard(lesson, lessonHref(lesson.slug)));
export const manualTherapyLessonCards: TeacherLessonCard[] = manualTherapyTeacherLessons.map((lesson) => toLessonCard(lesson, lessonHref(lesson.slug)));
