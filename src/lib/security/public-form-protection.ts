const WINDOW_MS = 10 * 60 * 1000;
const MAX_REQUESTS_PER_WINDOW = 6;
const MAX_TRACKED_KEYS = 2_000;

type WindowEntry = { startedAt: number; count: number };

// Best-effort per-isolate throttling. Server-side validation remains the primary
// protection; production-wide abuse controls should use a shared edge limiter.
const windows = new Map<string, WindowEntry>();

export function isPublicFormRateLimited(key: string, now = Date.now()) {
  if (windows.size >= MAX_TRACKED_KEYS) {
    for (const [entryKey, entry] of windows) {
      if (now - entry.startedAt >= WINDOW_MS || windows.size >= MAX_TRACKED_KEYS) {
        windows.delete(entryKey);
      }
      if (windows.size < MAX_TRACKED_KEYS * 0.8) break;
    }
  }

  const current = windows.get(key);
  if (!current || now - current.startedAt >= WINDOW_MS) {
    windows.set(key, { startedAt: now, count: 1 });
    return false;
  }

  current.count += 1;
  return current.count > MAX_REQUESTS_PER_WINDOW;
}
