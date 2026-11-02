"use client";

export type LearningSource = "daily-challenge" | "clinical-arena";
export type UnifiedProgress = {
  version: 1;
  totalXP: number;
  currentStreak: number;
  longestStreak: number;
  lastActiveDate: string | null;
  activeDates: string[];
  eventIds: string[];
  lastActivityLabel: string | null;
};
const STORAGE_KEY = "pna-unified-progress-v1";

function emptyProgress(totalXP = 0): UnifiedProgress {
  return { version: 1, totalXP: Math.max(0, Math.floor(totalXP)), currentStreak: 0, longestStreak: 0, lastActiveDate: null, activeDates: [], eventIds: [], lastActivityLabel: null };
}
export function getPakistanDate(date = new Date()): string {
  const parts = new Intl.DateTimeFormat("en-CA", { timeZone: "Asia/Karachi", year: "numeric", month: "2-digit", day: "2-digit" }).formatToParts(date);
  const part = (type: string) => parts.find((item) => item.type === type)?.value ?? "";
  return part("year") + "-" + part("month") + "-" + part("day");
}
function dayNumber(date: string): number {
  const [year, month, day] = date.split("-").map(Number);
  return Date.UTC(year, month - 1, day) / 86400000;
}
export function shiftPakistanDate(date: string, offset: number): string {
  return new Date((dayNumber(date) + offset) * 86400000).toISOString().slice(0, 10);
}
function readStoredProgress(): UnifiedProgress {
  if (typeof window === "undefined") return emptyProgress();
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw) as Partial<UnifiedProgress>;
      if (parsed.version === 1) return {
        ...emptyProgress(), ...parsed,
        totalXP: Math.max(0, Math.floor(Number(parsed.totalXP) || 0)),
        currentStreak: Math.max(0, Math.floor(Number(parsed.currentStreak) || 0)),
        longestStreak: Math.max(0, Math.floor(Number(parsed.longestStreak) || 0)),
        activeDates: Array.isArray(parsed.activeDates) ? parsed.activeDates.filter((d): d is string => typeof d === "string").slice(-365) : [],
        eventIds: Array.isArray(parsed.eventIds) ? parsed.eventIds.filter((id): id is string => typeof id === "string").slice(-1000) : [],
      };
    }
    // Preserve existing Clinical Arena XP when first introducing the unified progress card.
    let legacyXP = 0;
    try {
      const legacy = JSON.parse(window.localStorage.getItem("pna-arena-progress-v2") || "{}") as { xp?: number };
      legacyXP = Math.max(0, Math.floor(Number(legacy.xp) || 0));
    } catch { legacyXP = 0; }
    const initial = emptyProgress(legacyXP);
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(initial));
    return initial;
  } catch { return emptyProgress(); }
}
function save(progress: UnifiedProgress): void {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(progress));
    window.dispatchEvent(new Event("pna-unified-progress-updated"));
  } catch { /* Progress must never block a learning activity if browser storage is unavailable. */ }
}
export function getUnifiedProgress(): UnifiedProgress {
  const progress = readStoredProgress();
  const gap = progress.lastActiveDate ? dayNumber(getPakistanDate()) - dayNumber(progress.lastActiveDate) : Infinity;
  return { ...progress, currentStreak: gap <= 1 ? progress.currentStreak : 0 };
}
export function recordLearningActivity(source: LearningSource, xpEarned: number, eventId: string, label: string): UnifiedProgress {
  const progress = readStoredProgress();
  const uniqueEventId = source + ":" + eventId;
  if (!eventId || progress.eventIds.includes(uniqueEventId)) return getUnifiedProgress();
  const today = getPakistanDate();
  const lastDate = progress.lastActiveDate;
  const currentStreak = lastDate === today
    ? progress.currentStreak
    : lastDate && dayNumber(today) - dayNumber(lastDate) === 1 ? progress.currentStreak + 1 : 1;
  const xp = Math.min(10000, Math.max(0, Math.floor(Number(xpEarned) || 0)));
  save({
    ...progress,
    totalXP: progress.totalXP + xp,
    currentStreak,
    longestStreak: Math.max(progress.longestStreak, currentStreak),
    lastActiveDate: today,
    activeDates: [...new Set([...progress.activeDates, today])].slice(-365),
    eventIds: [...progress.eventIds, uniqueEventId].slice(-1000),
    lastActivityLabel: label,
  });
  return getUnifiedProgress();
}
