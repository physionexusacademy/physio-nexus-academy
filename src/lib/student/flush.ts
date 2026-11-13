import { createClient } from "@/lib/supabase/client";
import { SYNCED_EVENT, hasStudentSession, readQueue, writeQueue } from "./outbox";

/**
 * Sends queued activity to the student's own PNA record. This is the only place (besides the account screens) that
 * imports the Supabase browser client, so it must only ever be loaded in the browser, never in the Cloudflare worker:
 * reach it through a client-only (ssr: false) component, as StudentSyncRunner and the account screens do.
 */

let flushing: Promise<{ sent: number; xp: number } | null> | null = null;

/** Sends queued activities (50 at a time). Safe to call often; returns null when nothing could be sent. */
export function flushStudentOutbox(): Promise<{ sent: number; xp: number } | null> {
  if (typeof window === "undefined" || !hasStudentSession() || readQueue().length === 0) return Promise.resolve(null);
  if (flushing) return flushing;
  flushing = (async () => {
    try {
      const supabase = createClient();
      const { data } = await supabase.auth.getSession();
      if (!data.session) return null;
      let sent = 0;
      let xp = 0;
      for (let guard = 0; guard < 8; guard++) {
        const queue = readQueue();
        if (!queue.length) break;
        const batch = queue.slice(0, 50);
        const { data: result, error } = await supabase.rpc("student_record_activities", { p: { events: batch } });
        if (error) break; // keep everything queued; try again next time (also covers "profile not created yet")
        sent += batch.length;
        xp += batch.reduce((total, item) => total + item.xp, 0);
        const done = new Set(batch.map((item) => item.event_key));
        writeQueue(readQueue().filter((item) => !done.has(item.event_key)));
        void result;
      }
      if (sent) window.dispatchEvent(new CustomEvent(SYNCED_EVENT, { detail: { sent, xp } }));
      return sent ? { sent, xp } : null;
    } catch {
      return null;
    } finally {
      flushing = null;
    }
  })();
  return flushing;
}
