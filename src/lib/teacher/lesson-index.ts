import "server-only";
import type { TeacherLessonMeta } from "./types";
import { readStaticJson } from "@/lib/static-json";

/**
 * Server-side view of every PNA Teacher lesson. Neither the lesson bodies nor this index are bundled into the worker: both are static files
 * (/teacher-data/lessons/<slug>.json and /teacher-data/index.json), read through readStaticJson. Regenerate with `npm run build:teacher-data`.
 * Only the counts are bundled (./counts.ts).
 */
let cached: Promise<TeacherLessonMeta[]> | null = null;

/** Every lesson, concept and manual. A failed read is not remembered and is never turned into an empty list. */
export function loadLessonIndex(): Promise<TeacherLessonMeta[]> {
  if (!cached) {
    cached = readStaticJson<TeacherLessonMeta[]>("/teacher-data/index.json").then((data) => {
      if (!Array.isArray(data) || data.length < 100) throw new Error("The PNA Teacher lesson index is missing or too small.");
      return data;
    });
    cached.catch(() => {
      cached = null;
    });
  }
  return cached;
}

export async function loadConceptLessons(): Promise<TeacherLessonMeta[]> {
  return (await loadLessonIndex()).filter((lesson) => lesson.kind === "concept");
}

export async function loadManualLessons(): Promise<TeacherLessonMeta[]> {
  return (await loadLessonIndex()).filter((lesson) => lesson.kind === "manual");
}

export async function getLessonMeta(slug: string): Promise<TeacherLessonMeta | undefined> {
  return (await loadLessonIndex()).find((lesson) => lesson.slug === slug);
}
