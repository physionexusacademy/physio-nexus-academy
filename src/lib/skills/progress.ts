"use client";

import { getPakistanDate, recordLearningActivity, shiftPakistanDate } from "@/lib/unified-progress";
import { SKILL_LEVELS, levelRank, type SkillLevelId } from "./types";

/**
 * Skills Lab progress, saved privately in this browser (no account needed).
 * Every reader sanitises stored data so a damaged entry can never break a page.
 */
const PROGRESS_KEY = "pna-skills-v1";
const DECK_KEY = "pna-skills-deck-v1";
export const SKILLS_EVENT = "pna-skills-updated";
export const SKILL_REVIEW_INTERVALS = [1, 3, 7, 14, 30, 60] as const;
export const PASS_MARK = 0.8;
const DATE_RE = /^\d{4}-\d{2}-\d{2}$/;

export type SkillLevelRecord = { best: number; passedAt?: string; attempts: number };
export type SkillsProgress = {
  v: 1;
  levels: Record<string, Partial<Record<SkillLevelId, SkillLevelRecord>>>;
  studied: Record<string, string[]>;
  drills: Record<string, number>;
};
export type SkillCardState = { skill: string; box: number; due: string; reviews: number; lapses: number };
export type SkillsDeck = Record<string, SkillCardState>;

const isRecord = (value: unknown): value is Record<string, unknown> =>
  Boolean(value) && typeof value === "object" && !Array.isArray(value);
const count = (value: unknown) => (typeof value === "number" && Number.isFinite(value) ? Math.max(0, Math.floor(value)) : 0);
const levelIds = new Set<string>(SKILL_LEVELS.map((level) => level.id));

function storage(): Storage | null {
  if (typeof window === "undefined") return null;
  try {
    return window.localStorage;
  } catch {
    return null;
  }
}
function readJson(key: string): unknown {
  try {
    const raw = storage()?.getItem(key);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}
function writeJson(key: string, value: unknown) {
  try {
    storage()?.setItem(key, JSON.stringify(value));
  } catch {
    /* storage full or blocked — practice continues without saving */
  }
}
function notify() {
  try {
    window.dispatchEvent(new Event(SKILLS_EVENT));
  } catch {
    /* ignore */
  }
}

export function getSkillsProgress(): SkillsProgress {
  const parsed = readJson(PROGRESS_KEY);
  const progress: SkillsProgress = { v: 1, levels: {}, studied: {}, drills: {} };
  if (!isRecord(parsed)) return progress;
  if (isRecord(parsed.levels)) {
    for (const [skill, levels] of Object.entries(parsed.levels)) {
      if (!isRecord(levels)) continue;
      const clean: Partial<Record<SkillLevelId, SkillLevelRecord>> = {};
      for (const [level, record] of Object.entries(levels)) {
        if (!levelIds.has(level) || !isRecord(record)) continue;
        clean[level as SkillLevelId] = {
          best: Math.min(1, Math.max(0, typeof record.best === "number" && Number.isFinite(record.best) ? record.best : 0)),
          attempts: count(record.attempts),
          ...(typeof record.passedAt === "string" ? { passedAt: record.passedAt } : {}),
        };
      }
      progress.levels[skill] = clean;
    }
  }
  if (isRecord(parsed.studied)) {
    for (const [skill, ids] of Object.entries(parsed.studied)) {
      if (Array.isArray(ids)) progress.studied[skill] = ids.filter((id): id is string => typeof id === "string").slice(-500);
    }
  }
  if (isRecord(parsed.drills)) {
    for (const [day, total] of Object.entries(parsed.drills)) if (DATE_RE.test(day)) progress.drills[day] = count(total);
  }
  return progress;
}

export function isLevelPassed(progress: SkillsProgress, skill: string, level: SkillLevelId): boolean {
  return Boolean(progress.levels[skill]?.[level]?.passedAt);
}

/** A level's test opens once the previous level is passed (Beginner is always open). */
export function isLevelUnlocked(progress: SkillsProgress, skill: string, level: SkillLevelId): boolean {
  const rank = levelRank(level);
  return rank <= 0 || isLevelPassed(progress, skill, SKILL_LEVELS[rank - 1].id);
}

export function passedLevelCount(progress: SkillsProgress, skill?: string): number {
  const skills = skill ? [skill] : Object.keys(progress.levels);
  return skills.reduce((total, slug) => total + SKILL_LEVELS.filter((level) => isLevelPassed(progress, slug, level.id)).length, 0);
}

export function markStudied(skill: string, id: string) {
  const progress = getSkillsProgress();
  const list = progress.studied[skill] ?? [];
  if (list.includes(id)) return;
  progress.studied[skill] = [...list, id];
  writeJson(PROGRESS_KEY, progress);
  notify();
}

/** Records a level test. Passing awards XP once per level. */
export function recordLevelTest(skill: string, skillTitle: string, level: SkillLevelId, score: number) {
  const progress = getSkillsProgress();
  const levels = progress.levels[skill] ?? {};
  const previous = levels[level];
  const passed = score >= PASS_MARK;
  levels[level] = {
    best: Math.max(previous?.best ?? 0, score),
    attempts: (previous?.attempts ?? 0) + 1,
    ...(previous?.passedAt ? { passedAt: previous.passedAt } : passed ? { passedAt: getPakistanDate() } : {}),
  };
  progress.levels[skill] = levels;
  writeJson(PROGRESS_KEY, progress);
  if (passed) {
    const xp = [30, 40, 50, 80][Math.max(0, levelRank(level))];
    recordLearningActivity("skills-lab", xp, `level:${skill}:${level}`, `Skills Lab: ${skillTitle} — ${level} passed`);
  }
  notify();
  return { passed, firstPass: passed && !previous?.passedAt };
}

/** Counts practice answers; ten correct answers in a day earn a small daily XP bonus. */
export function recordDrillAnswer(correct: boolean) {
  if (!correct) return;
  const progress = getSkillsProgress();
  const today = getPakistanDate();
  progress.drills[today] = (progress.drills[today] ?? 0) + 1;
  const recent = Object.keys(progress.drills).sort().slice(-30);
  progress.drills = Object.fromEntries(recent.map((day) => [day, progress.drills[day]]));
  writeJson(PROGRESS_KEY, progress);
  if (progress.drills[today] === 10) {
    recordLearningActivity("skills-lab", 15, `drills:${today}`, "Skills Lab: 10 correct practice answers");
  }
  notify();
}

/* ---------------- spaced-review flashcards ---------------- */

export function getSkillsDeck(): SkillsDeck {
  const parsed = readJson(DECK_KEY);
  const deck: SkillsDeck = {};
  if (!isRecord(parsed)) return deck;
  for (const [id, card] of Object.entries(parsed)) {
    if (!isRecord(card) || typeof card.skill !== "string" || typeof card.due !== "string" || !DATE_RE.test(card.due)) continue;
    deck[id] = {
      skill: card.skill,
      box: Math.min(count(card.box), SKILL_REVIEW_INTERVALS.length - 1),
      due: card.due,
      reviews: count(card.reviews),
      lapses: count(card.lapses),
    };
  }
  return deck;
}

export function dueSkillCards(deck = getSkillsDeck(), skill?: string, today = getPakistanDate()): string[] {
  return Object.entries(deck)
    .filter(([, card]) => card.due <= today && (!skill || card.skill === skill))
    .sort((a, b) => a[1].due.localeCompare(b[1].due) || a[1].box - b[1].box)
    .map(([id]) => id);
}

/** "Knew it" moves a card to a longer interval; "Again" brings it back tomorrow. */
export function reviewSkillCard(id: string, skill: string, knew: boolean) {
  const deck = getSkillsDeck();
  const current = deck[id] ?? { skill, box: 0, due: getPakistanDate(), reviews: 0, lapses: 0 };
  const box = knew ? Math.min(current.box + (deck[id] ? 1 : 0), SKILL_REVIEW_INTERVALS.length - 1) : 0;
  deck[id] = {
    skill,
    box,
    due: shiftPakistanDate(getPakistanDate(), SKILL_REVIEW_INTERVALS[box]),
    reviews: current.reviews + 1,
    lapses: current.lapses + (knew ? 0 : 1),
  };
  writeJson(DECK_KEY, deck);
  notify();
}
