/**
 * Local-only spaced review queue (browser localStorage).
 * Zero Supabase / Cloudflare backend load.
 */
export type ReviewItem = {
  id: string;
  title: string;
  href: string;
  source: "case-lab" | "daily-challenge" | "stupid-intern" | "knowledge-hub";
  addedAt: string;
  nextReviewAt: string;
  intervalDays: number;
  reviews: number;
};

const KEY = "pna-clinical-review-v1";
const MAX_ITEMS = 80;

function todayPKT(): string {
  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone: "Asia/Karachi",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).formatToParts(new Date());
  const p = (t: string) => parts.find((x) => x.type === t)?.value ?? "";
  return `${p("year")}-${p("month")}-${p("day")}`;
}

function addDays(isoDate: string, days: number): string {
  const [y, m, d] = isoDate.split("-").map(Number);
  const dt = new Date(Date.UTC(y, m - 1, d + days));
  return dt.toISOString().slice(0, 10);
}

function read(): ReviewItem[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as ReviewItem[];
    return Array.isArray(parsed) ? parsed.slice(0, MAX_ITEMS) : [];
  } catch {
    return [];
  }
}

function write(items: ReviewItem[]) {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(KEY, JSON.stringify(items.slice(0, MAX_ITEMS)));
    window.dispatchEvent(new Event("pna-review-queue-updated"));
  } catch {
    /* storage full / private mode — ignore */
  }
}

/** Add or bump an item into the review queue (first review tomorrow). */
export function queueForReview(input: {
  id: string;
  title: string;
  href: string;
  source: ReviewItem["source"];
}): void {
  const items = read();
  const existing = items.find((x) => x.id === input.id);
  const today = todayPKT();
  if (existing) {
    // Already queued — don't reset unless overdue by a long time
    return;
  }
  items.unshift({
    id: input.id,
    title: input.title,
    href: input.href,
    source: input.source,
    addedAt: today,
    nextReviewAt: addDays(today, 1),
    intervalDays: 1,
    reviews: 0,
  });
  write(items);
}

/** Mark reviewed → expand interval (1 → 3 → 7 → 14 → 30 days). */
export function markReviewed(id: string): void {
  const items = read();
  const idx = items.findIndex((x) => x.id === id);
  if (idx < 0) return;
  const item = items[idx];
  const nextInterval =
    item.intervalDays < 3
      ? 3
      : item.intervalDays < 7
        ? 7
        : item.intervalDays < 14
          ? 14
          : 30;
  const today = todayPKT();
  items[idx] = {
    ...item,
    reviews: item.reviews + 1,
    intervalDays: nextInterval,
    nextReviewAt: addDays(today, nextInterval),
  };
  write(items);
}

export function getDueReviews(): ReviewItem[] {
  const today = todayPKT();
  return read()
    .filter((x) => x.nextReviewAt <= today)
    .sort((a, b) => a.nextReviewAt.localeCompare(b.nextReviewAt));
}

export function getReviewQueue(): ReviewItem[] {
  return read().sort((a, b) => a.nextReviewAt.localeCompare(b.nextReviewAt));
}

export function removeFromQueue(id: string): void {
  write(read().filter((x) => x.id !== id));
}
