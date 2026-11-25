import counts from "./generated/lesson-counts.json";

/** How many PNA Teacher lessons there are (written by npm run build:teacher-data). Small enough for pages and client code; the full index is not. */
export const lessonCounts = counts as { lessons: number; concept: number; manual: number };
