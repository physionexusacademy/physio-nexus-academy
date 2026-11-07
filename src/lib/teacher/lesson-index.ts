/**
 * Server-side view of every PNA Teacher lesson. Lesson bodies are NOT bundled:
 * they are static files under /teacher-data/lessons/<slug>.json, fetched by the
 * lesson player. Regenerate with `npm run build:teacher-data`.
 */
import type { TeacherLessonMeta } from "./types";
import data from "./generated/lesson-index.json";

export const lessonIndex = data as TeacherLessonMeta[];
export const conceptLessonMetas = lessonIndex.filter((lesson) => lesson.kind === "concept");
export const manualLessonMetas = lessonIndex.filter((lesson) => lesson.kind === "manual");

const bySlug = new Map(lessonIndex.map((lesson) => [lesson.slug, lesson]));

export function getLessonMeta(slug: string): TeacherLessonMeta | undefined {
  return bySlug.get(slug);
}

export function isManualTherapyLessonSlug(slug: string): boolean {
  return bySlug.get(slug)?.kind === "manual";
}
