/** In-depth PNA Teacher lessons (slug under /learn) that go with each Skills Lab skill. Filled by the lesson authoring step. */
export type SkillLessonLink = { slug: string; title: string };

export const LESSONS_FOR_SKILL: Record<string, SkillLessonLink[]> = {};
