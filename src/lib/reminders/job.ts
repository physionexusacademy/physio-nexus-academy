/**
 * The hourly reminder job (runs from the Cloudflare cron trigger in custom-worker.ts).
 *
 *   1. ask the database which reminders are due — it reserves them, so a repeat or overlapping run never sends twice;
 *   2. send them through Resend (one batch call);
 *   3. tell the database what was sent, which also leaves a heartbeat row (pna_job_runs) so the schedule can be checked.
 *
 * Imports are relative and dependency-free: wrangler bundles this file next to the OpenNext worker.
 */
import { buildReminderMail, type ClaimedReminder } from "./templates.ts";

export type ReminderEnv = {
  SUPABASE_SERVICE_ROLE_KEY?: string;
  NEXT_PUBLIC_SUPABASE_URL?: string;
  RESEND_API_KEY?: string;
  RESEND_FROM_EMAIL?: string;
  NEXT_PUBLIC_SITE_URL?: string;
};

export type JobResult = { skipped?: string; claimed: number; sent: number; failed: number };
type Io = { fetch?: typeof fetch; now?: Date };

const DEFAULT_SUPABASE = "https://oabckudgmzbbbbhkeolk.supabase.co";
const DEFAULT_ORIGIN = "https://physionexusacademy.com";
const DEFAULT_FROM = "Physio Nexus Academy <notifications@physionexusacademy.com>";

export async function callRpc<T>(env: ReminderEnv, name: string, args: Record<string, unknown>, doFetch: typeof fetch = fetch): Promise<T> {
  const url = (env.NEXT_PUBLIC_SUPABASE_URL || DEFAULT_SUPABASE).replace(/\/$/, "");
  const key = env.SUPABASE_SERVICE_ROLE_KEY ?? "";
  const response = await doFetch(`${url}/rest/v1/rpc/${name}`, {
    method: "POST",
    headers: { apikey: key, Authorization: `Bearer ${key}`, "Content-Type": "application/json" },
    body: JSON.stringify(args),
  });
  if (!response.ok) throw new Error(`${name} failed with HTTP ${response.status}`);
  return (await response.json()) as T;
}

export async function runReminderJob(env: ReminderEnv, io: Io = {}): Promise<JobResult> {
  const doFetch = io.fetch ?? fetch;
  const empty = { claimed: 0, sent: 0, failed: 0 };
  if (!env.SUPABASE_SERVICE_ROLE_KEY) return { ...empty, skipped: "SUPABASE_SERVICE_ROLE_KEY is not set" };
  if (!env.RESEND_API_KEY) return { ...empty, skipped: "RESEND_API_KEY is not set" }; // nothing is claimed, so nothing is lost
  const origin = (env.NEXT_PUBLIC_SITE_URL || DEFAULT_ORIGIN).replace(/\/$/, "");
  const from = env.RESEND_FROM_EMAIL || DEFAULT_FROM;

  let due: ClaimedReminder[] = [];
  const now = (io.now ?? new Date()).toISOString();
  try {
    due = await callRpc<ClaimedReminder[]>(env, "pna_reminders_claim", { p_now: now, p_limit: 100 }, doFetch);
  } catch (error) {
    console.error("PNA reminders: claim failed", error instanceof Error ? error.message : error);
    return { ...empty, skipped: "claim failed" };
  }
  // Past Daily Challenge participants are a separate claim; if that function is missing or fails, the others still go out.
  let participantNote = "";
  try {
    due = due.concat(await callRpc<ClaimedReminder[]>(env, "pna_participant_reminders_claim", { p_now: now, p_limit: 100 }, doFetch));
  } catch (error) {
    participantNote = "participant claim failed";
    console.error("PNA reminders: participant claim failed", error instanceof Error ? error.message : error);
  }

  const results: { id: number; ok: boolean }[] = [];
  let note = due.length ? "" : "idle";
  for (let offset = 0; offset < due.length; offset += 100) {
    const chunk = due.slice(offset, offset + 100);
    try {
      const payload = chunk.map((item) => {
        const mail = buildReminderMail(item, origin);
        return { from, to: [item.to], subject: mail.subject, text: mail.text, html: mail.html, headers: mail.headers };
      });
      const response = await doFetch("https://api.resend.com/emails/batch", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${env.RESEND_API_KEY}`,
          "Content-Type": "application/json",
          "Idempotency-Key": `pna-reminders-${chunk[0].id}-${chunk[chunk.length - 1].id}-${chunk.length}`,
        },
        body: JSON.stringify(payload),
      });
      if (!response.ok) note = `resend HTTP ${response.status}`;
      for (const item of chunk) results.push({ id: item.id, ok: response.ok });
    } catch (error) {
      note = "resend unreachable";
      console.error("PNA reminders: send failed", error instanceof Error ? error.message : error);
      for (const item of chunk) results.push({ id: item.id, ok: false });
    }
  }
  if (participantNote) note = note ? `${note}; ${participantNote}` : participantNote;

  try {
    await callRpc(env, "pna_reminders_finish", { p_results: results, p_note: note || null }, doFetch);
  } catch (error) {
    console.error("PNA reminders: could not record results", error instanceof Error ? error.message : error);
  }
  const sent = results.filter((r) => r.ok).length;
  return { claimed: due.length, sent, failed: results.length - sent };
}
