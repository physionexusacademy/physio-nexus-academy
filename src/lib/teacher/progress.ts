/**
 * PNA Teacher — learner state kept in this browser (localStorage only).
 * No backend load. Every read is defensive so storage problems (private mode,
 * full storage, corrupted JSON) never block a lesson.
 */
import { getPakistanDate, recordLearningActivity, shiftPakistanDate } from "../unified-progress.ts";
import type { TeacherLang, TeacherPath, TeacherPathStep, TeacherProfile } from "./types.ts";

export const TEACHER_EVENT = "pna-teacher-updated";

const PROFILE_KEY = "pna-teacher-profile-v1";
const LANG_KEY = "pna-teacher-lang-v1";
const PROGRESS_KEY = "pna-teacher-progress-v1";
const DECK_KEY = "pna-teacher-deck-v1";
const SESSION_PREFIX = "pna-teacher-session-v1:";

/** Days until the next review for each Leitner box. */
export const REVIEW_INTERVALS = [1, 3, 7, 14, 30, 60] as const;

export type LessonRecord = { completedAt: string; firstTryCorrect: number; checks: number };
export type TeacherProgress = {
  v: 1;
  lessons: Record<string, LessonRecord>;
  /** `${pathSlug}/${stepId}` → completion date, for mission steps. */
  missions: Record<string, string>;
};
export type CardState = { lesson: string; box: number; due: string; reviews: number; lapses: number };
export type TeacherDeck = Record<string, CardState>;

function storage(): Storage | null {
  if (typeof window === "undefined") return null;
  try {
    return window.localStorage;
  } catch {
    return null;
  }
}

function readJson<T>(key: string): T | null {
  const store = storage();
  if (!store) return null;
  try {
    const raw = store.getItem(key);
    return raw ? (JSON.parse(raw) as T) : null;
  } catch {
    return null;
  }
}

function writeJson(key: string, value: unknown) {
  const store = storage();
  if (!store) return;
  try {
    store.setItem(key, JSON.stringify(value));
  } catch {
    /* storage full or blocked — learning continues without saving */
  }
}

function notify() {
  if (typeof window === "undefined") return;
  try {
    window.dispatchEvent(new Event(TEACHER_EVENT));
  } catch {
    /* ignore */
  }
}

export function teacherToday(): string {
  return getPakistanDate();
}

/* ---------------- profile & language ---------------- */

const stages = new Set(["year1-2", "year3-4", "final-intern", "graduate"]);
const goals = new Set(["understand", "exams", "clinic", "manual"]);

export function getTeacherProfile(): TeacherProfile | null {
  const parsed = readJson<Partial<TeacherProfile>>(PROFILE_KEY);
  if (!parsed || parsed.v !== 1) return null;
  if (!stages.has(String(parsed.stage)) || !goals.has(String(parsed.goal))) return null;
  const minutes = parsed.minutes === 5 || parsed.minutes === 30 ? parsed.minutes : 15;
  return {
    v: 1,
    name: typeof parsed.name === "string" ? parsed.name.slice(0, 40) : "",
    stage: parsed.stage as TeacherProfile["stage"],
    goal: parsed.goal as TeacherProfile["goal"],
    minutes,
    lang: parsed.lang === "ur" ? "ur" : "en",
    createdAt: typeof parsed.createdAt === "string" ? parsed.createdAt : teacherToday(),
  };
}

export function saveTeacherProfile(profile: TeacherProfile) {
  writeJson(PROFILE_KEY, { ...profile, name: profile.name.trim().slice(0, 40) });
  writeJson(LANG_KEY, profile.lang);
  notify();
}

export function clearTeacherProfile() {
  storage()?.removeItem(PROFILE_KEY);
  notify();
}

export function getTeacherLang(): TeacherLang {
  const stored = readJson<string>(LANG_KEY);
  if (stored === "ur" || stored === "en") return stored;
  return getTeacherProfile()?.lang ?? "en";
}

export function setTeacherLang(lang: TeacherLang) {
  writeJson(LANG_KEY, lang);
  const profile = getTeacherProfile();
  if (profile && profile.lang !== lang) writeJson(PROFILE_KEY, { ...profile, lang });
  notify();
}

/* ---------------- lessons & missions ---------------- */

export function getTeacherProgress(): TeacherProgress {
  const parsed = readJson<Partial<TeacherProgress>>(PROGRESS_KEY);
  return {
    v: 1,
    lessons: parsed?.lessons && typeof parsed.lessons === "object" ? parsed.lessons : {},
    missions: parsed?.missions && typeof parsed.missions === "object" ? parsed.missions : {},
  };
}

export function lessonXp(firstTryCorrect: number): number {
  return 30 + 5 * Math.max(0, Math.floor(firstTryCorrect));
}

/**
 * Records a finished lesson, adds its flashcards to the review deck and awards
 * XP once (replays never award duplicate XP). Returns what was earned.
 */
export function completeTeacherLesson(input: {
  slug: string;
  title: string;
  firstTryCorrect: number;
  checks: number;
  flashcardIds: string[];
}): { xpAwarded: number; newCards: number; firstCompletion: boolean } {
  const progress = getTeacherProgress();
  const firstCompletion = !progress.lessons[input.slug];
  const previous = progress.lessons[input.slug];
  progress.lessons[input.slug] = {
    completedAt: previous?.completedAt ?? teacherToday(),
    firstTryCorrect: Math.max(previous?.firstTryCorrect ?? 0, input.firstTryCorrect),
    checks: input.checks,
  };
  writeJson(PROGRESS_KEY, progress);
  const newCards = addCardsToDeck(input.slug, input.flashcardIds);
  const xp = lessonXp(input.firstTryCorrect);
  // recordLearningActivity ignores repeated event ids, so replays earn no XP.
  recordLearningActivity("pna-teacher", xp, "lesson:" + input.slug, "PNA Teacher lesson: " + input.title);
  notify();
  return { xpAwarded: firstCompletion ? xp : 0, newCards, firstCompletion };
}

export function completeMission(pathSlug: string, stepId: string, title: string) {
  const progress = getTeacherProgress();
  const key = pathSlug + "/" + stepId;
  if (!progress.missions[key]) {
    progress.missions[key] = teacherToday();
    writeJson(PROGRESS_KEY, progress);
    recordLearningActivity("pna-teacher", 10, "mission:" + key, "PNA Teacher mission: " + title);
  }
  notify();
}

export function undoMission(pathSlug: string, stepId: string) {
  const progress = getTeacherProgress();
  delete progress.missions[pathSlug + "/" + stepId];
  writeJson(PROGRESS_KEY, progress);
  notify();
}

export function isStepDone(path: TeacherPath, step: TeacherPathStep, progress: TeacherProgress): boolean {
  return step.kind === "lesson"
    ? Boolean(progress.lessons[step.lesson])
    : Boolean(progress.missions[path.slug + "/" + step.id]);
}

export function pathCompletion(path: TeacherPath, progress: TeacherProgress) {
  const done = path.steps.filter((step) => isStepDone(path, step, progress)).length;
  const nextIndex = path.steps.findIndex((step) => !isStepDone(path, step, progress));
  return { done, total: path.steps.length, nextIndex, complete: nextIndex === -1 };
}

/* ---------------- lesson conversation resume ---------------- */

export function loadLessonSession<T>(slug: string): T | null {
  return readJson<T>(SESSION_PREFIX + slug);
}

export function saveLessonSession(slug: string, session: unknown) {
  writeJson(SESSION_PREFIX + slug, session);
}

export function clearLessonSession(slug: string) {
  storage()?.removeItem(SESSION_PREFIX + slug);
}

/* ---------------- flashcards (Leitner-style spaced review) ---------------- */

export function getDeck(): TeacherDeck {
  const parsed = readJson<TeacherDeck>(DECK_KEY);
  return parsed && typeof parsed === "object" ? parsed : {};
}

function addCardsToDeck(lesson: string, ids: string[]): number {
  const deck = getDeck();
  const due = shiftPakistanDate(teacherToday(), REVIEW_INTERVALS[0]);
  let added = 0;
  for (const id of ids) {
    if (deck[id]) continue;
    deck[id] = { lesson, box: 0, due, reviews: 0, lapses: 0 };
    added += 1;
  }
  writeJson(DECK_KEY, deck);
  return added;
}

export function getDueCardIds(deck = getDeck(), today = teacherToday()): string[] {
  return Object.entries(deck)
    .filter(([, card]) => card.due <= today)
    .sort((a, b) => a[1].due.localeCompare(b[1].due) || a[1].box - b[1].box)
    .map(([id]) => id);
}

/** Schedules a card after a scheduled review. "knew" promotes, "again" resets. */
export function reviewCard(id: string, knew: boolean) {
  const deck = getDeck();
  const card = deck[id];
  if (!card) return;
  const box = knew ? Math.min(card.box + 1, REVIEW_INTERVALS.length - 1) : 0;
  deck[id] = {
    ...card,
    box,
    due: shiftPakistanDate(teacherToday(), REVIEW_INTERVALS[box]),
    reviews: card.reviews + 1,
    lapses: card.lapses + (knew ? 0 : 1),
  };
  writeJson(DECK_KEY, deck);
  notify();
}

/** Awards a small daily XP bonus (once per day) for finishing a review session. */
export function completeReviewSession(reviewed: number) {
  if (reviewed <= 0) return;
  recordLearningActivity("pna-teacher", 10, "review:" + teacherToday(), "PNA Teacher flashcard review");
  notify();
}
