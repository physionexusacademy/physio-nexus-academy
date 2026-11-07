/**
 * Builds the static PNA Teacher data: one JSON file per lesson (served from
 * /teacher-data, outside the Cloudflare Worker bundle), all flashcards, and a
 * small lesson index the server imports. Used by scripts/build-teacher-data.ts
 * and checked for drift by scripts/validate-pna-teacher.ts.
 */
import type { TeacherLesson, TeacherLessonMeta } from "./types.ts";
import { teacherLessons, toLessonCard } from "./lessons/index.ts";
import { manualTherapyTeacherLessons, nextManualTherapyLesson } from "./manual-therapy/index.ts";
import { lessonHref } from "./catalog.ts";

export type TeacherFlashcardRecord = {
  id: string;
  lesson: string;
  lessonTitle: string;
  front: TeacherLesson["flashcards"][number]["front"];
  back: TeacherLesson["flashcards"][number]["back"];
};

function meta(lesson: TeacherLesson, kind: "concept" | "manual", next: TeacherLessonMeta["next"]): TeacherLessonMeta {
  return {
    ...toLessonCard(lesson, lessonHref(lesson.slug)),
    kind,
    goal: lesson.goal,
    checks: lesson.beats.filter((beat) => beat.type === "check").length,
    summaryEn: lesson.summary.map((point) => point.en),
    keywords:
      kind === "concept"
        ? [lesson.title, lesson.slug, lesson.area, ...lesson.summary.map((p) => p.en), ...lesson.flashcards.map((c) => c.front.en)].join(" ")
        : "",
    next,
  };
}

export function buildTeacherData() {
  const index: TeacherLessonMeta[] = [
    ...teacherLessons.map((lesson, i) => {
      const next = teacherLessons[i + 1];
      return meta(lesson, "concept", next ? { slug: next.slug, title: next.title, href: `/learn/${next.slug}` } : null);
    }),
    ...manualTherapyTeacherLessons.map((lesson) => meta(lesson, "manual", nextManualTherapyLesson(lesson.slug))),
  ];
  const lessons: Record<string, TeacherLesson> = Object.fromEntries(
    [...teacherLessons, ...manualTherapyTeacherLessons].map((lesson) => [lesson.slug, lesson]),
  );
  const flashcards: TeacherFlashcardRecord[] = [...teacherLessons, ...manualTherapyTeacherLessons].flatMap((lesson) =>
    lesson.flashcards.map((card) => ({ id: card.id, lesson: lesson.slug, lessonTitle: lesson.title, front: card.front, back: card.back })),
  );
  return { index, lessons, flashcards };
}

/** Exact file contents, so the validator can detect stale generated files. */
export function serializeTeacherData() {
  const { index, lessons, flashcards } = buildTeacherData();
  const files: Record<string, string> = {
    "src/lib/teacher/generated/lesson-index.json": JSON.stringify(index, null, 1) + "\n",
    "public/teacher-data/flashcards.json": JSON.stringify(flashcards) + "\n",
  };
  for (const [slug, lesson] of Object.entries(lessons)) files[`public/teacher-data/lessons/${slug}.json`] = JSON.stringify(lesson) + "\n";
  return files;
}
