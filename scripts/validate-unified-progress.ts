import assert from "node:assert/strict";
import { getPakistanDate, shiftPakistanDate, getUnifiedProgress, recordLearningActivity } from "../src/lib/unified-progress.ts";

const store = new Map<string, string>();
const fakeWindow = {
  localStorage: {
    getItem: (key: string) => store.get(key) ?? null,
    setItem: (key: string, value: string) => { store.set(key, value); },
  },
  dispatchEvent: (_event: Event) => true,
};
Object.defineProperty(globalThis, "window", { configurable: true, value: fakeWindow });

assert.equal(getPakistanDate(new Date("2026-10-24T19:30:00.000Z")), "2026-10-25", "Pakistan date must handle UTC-to-PKT day rollover");
assert.equal(shiftPakistanDate("2024-02-28", 1), "2024-02-29", "date shifting must handle leap day");
assert.equal(shiftPakistanDate("2026-01-01", -1), "2025-12-31", "date shifting must handle year boundaries");

store.set("pna-arena-progress-v2", JSON.stringify({ xp: 125 }));
const migrated = getUnifiedProgress();
assert.equal(migrated.totalXP, 125, "legacy Clinical Arena XP must migrate once");

const today = getPakistanDate();
const first = recordLearningActivity("daily-challenge", 25, "daily:" + today, "Daily challenge completed");
assert.equal(first.totalXP, 150, "first activity must add earned XP");
assert.equal(first.currentStreak, 1, "first activity must start a one-day streak");
assert.ok(first.activeDates.includes(today), "activity date must be recorded");

const duplicate = recordLearningActivity("daily-challenge", 25, "daily:" + today, "Daily challenge completed");
assert.equal(duplicate.totalXP, 150, "replayed event must not award duplicate XP");

const secondSameDay = recordLearningActivity("clinical-arena", 40, "case:" + today, "Clinical Arena case completed");
assert.equal(secondSameDay.totalXP, 190, "a distinct activity must award XP");
assert.equal(secondSameDay.currentStreak, 1, "multiple activities on the same day must not inflate streak length");

console.log("Unified learning progress checks passed (date handling, XP migration, XP awards, duplicate protection, same-day streak).");
