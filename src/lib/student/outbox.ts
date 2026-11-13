/**
 * Student record outbox. Every learning activity the site already records on this device
 * (see unified-progress.ts) is also queued here — but only when someone is signed in — and sent to the
 * student's own PNA record. Anonymous visitors never queue anything and never load the Supabase client.
 */
export type PendingActivity = { source: string; event_key: string; label: string; xp: number; score?: number; occurred_at: string };

const KEY = "pna-student-outbox-v1";
const MAX_QUEUE = 300;
export const OUTBOX_EVENT = "pna-student-outbox-changed";
export const SYNCED_EVENT = "pna-student-synced";
/** Fired when the signed-in / signed-out state may have changed (the address bar does not change when it does). */
export const SESSION_EVENT = "pna-student-session-changed";

/**
 * True when a Supabase session cookie exists (the browser client keeps the session in `sb-<ref>-auth-token`,
 * split into `.0`, `.1` … when long). The `-code-verifier` cookie that "Forgot password" leaves behind is not a session.
 */
export function hasStudentSession(): boolean {
  if (typeof document === "undefined") return false;
  return document.cookie.split(";").some((cookie) => /^\s*sb-[^=]*-auth-token(?:\.\d+)?=./.test(cookie));
}

export function readQueue(): PendingActivity[] {
  try {
    const parsed = JSON.parse(window.localStorage.getItem(KEY) || "[]");
    return Array.isArray(parsed) ? parsed.filter((item) => item && typeof item.event_key === "string") : [];
  } catch {
    return [];
  }
}
export function writeQueue(queue: PendingActivity[]) {
  try {
    window.localStorage.setItem(KEY, JSON.stringify(queue.slice(-MAX_QUEUE)));
    window.dispatchEvent(new Event(OUTBOX_EVENT));
  } catch {
    /* storage unavailable: learning is never blocked */
  }
}

export function pendingCount(): number {
  return typeof window === "undefined" ? 0 : readQueue().length;
}

export function enqueueStudentActivity(activity: PendingActivity): void {
  if (typeof window === "undefined" || !hasStudentSession()) return;
  const queue = readQueue();
  if (queue.some((item) => item.event_key === activity.event_key)) return;
  writeQueue([...queue, activity]);
}
