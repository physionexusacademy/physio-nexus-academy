/**
 * Reminder e-mails and the hourly job, against a fake Supabase + Resend (no network):
 *   node --experimental-strip-types scripts/validate-reminders.ts
 */
import assert from "node:assert/strict";
import { buildReminderMail, type ClaimedReminder } from "../src/lib/reminders/templates.ts";
import { runReminderJob } from "../src/lib/reminders/job.ts";

let checks = 0;
const ok = (name: string) => { checks++; console.log("PASS", name); };
const origin = "https://physionexusacademy.com";
const token = "11111111-2222-4333-8444-555555555555";
const base = { id: 7, token, to: "someone@example.test", name: "Sana Malik", lang: "en" as const };

/* templates */
const daily = buildReminderMail({ ...base, kind: "daily_challenge", lang: "mix", streak: 6 }, origin);
assert.match(daily.subject, /6-day streak/); assert.match(daily.text, /\/daily-challenge/); assert.match(daily.text, /Aap ka 6 din ka streak/);
assert.ok(daily.text.includes(`${origin}/api/reminders/unsubscribe?t=${token}`)); assert.ok(daily.html.includes(`unsubscribe?t=${token}`));
assert.equal(daily.headers["List-Unsubscribe-Post"], "List-Unsubscribe=One-Click"); assert.equal(daily.headers["List-Unsubscribe"], `<${origin}/api/reminders/unsubscribe?t=${token}>`);
assert.match(buildReminderMail({ ...base, kind: "daily_challenge", lang: "mix", streak: 0 }, origin).subject, /waiting/); ok("daily reminder: streak-aware, bilingual, one-click unsubscribe");

for (const kind of ["rehab_checkin", "rehab_day"] as const)
  for (const lang of ["en", "ru"] as const) {
    const mail = buildReminderMail({ ...base, kind, lang }, origin);
    const all = `${mail.subject} ${mail.text} ${mail.html}`;
    assert.ok(!/\b(pain score|diagnos|score|scored|pain level|\d\/10)\b/i.test(all), `${kind}/${lang} must carry no health details`);
    assert.ok(mail.text.includes("/rehabverse/me") && mail.text.includes(token));
    assert.match(mail.text, lang === "en" ? /physiotherapist/ : /physiotherapist/);
  }
assert.match(buildReminderMail({ ...base, kind: "rehab_day", lang: "ru" }, origin).text, /Assalam-o-alaikum Sana/); ok("RehabVerse reminders: English and Roman Urdu, a safety line, no health details");
assert.ok(!buildReminderMail({ ...base, name: '<img src=x onerror=alert(1)>', kind: "rehab_day" }, origin).html.includes("<img"));
assert.ok(!buildReminderMail({ ...base, name: '<b>"x"</b>', kind: "daily_challenge", lang: "mix" }, origin).html.includes("<b>")); ok("names are escaped in the HTML body");

/* job */
type Call = { url: string; body: unknown; headers: Record<string, string> };
function fakeNetwork(opts: { claim: ClaimedReminder[]; resend?: number; claimStatus?: number }) {
  const calls: Call[] = [];
  const doFetch = (async (url: string, init: RequestInit) => {
    const body = init.body ? JSON.parse(String(init.body)) : null;
    calls.push({ url, body, headers: init.headers as Record<string, string> });
    if (url.endsWith("/rpc/pna_reminders_claim")) return new Response(JSON.stringify(opts.claim), { status: opts.claimStatus ?? 200 });
    if (url.endsWith("/rpc/pna_reminders_finish")) return new Response(JSON.stringify({ sent: 0, failed: 0 }), { status: 200 });
    if (url === "https://api.resend.com/emails/batch") return new Response("{}", { status: opts.resend ?? 200 });
    throw new Error("unexpected " + url);
  }) as unknown as typeof fetch;
  return { calls, doFetch };
}
const env = { SUPABASE_SERVICE_ROLE_KEY: "service-key", RESEND_API_KEY: "re_test" };
const due: ClaimedReminder[] = [
  { id: 1, token, kind: "daily_challenge", to: "a@example.test", name: "A", lang: "mix", streak: 3 },
  { id: 2, token: "22222222-2222-4333-8444-555555555555", kind: "rehab_day", to: "b@example.test", name: "B", lang: "ru" },
];

let net = fakeNetwork({ claim: due });
let result = await runReminderJob(env, { fetch: net.doFetch, now: new Date("2026-11-16T07:05:00Z") });
assert.deepEqual(result, { claimed: 2, sent: 2, failed: 0 });
assert.equal(net.calls.length, 3);
assert.equal(net.calls[0].url, "https://oabckudgmzbbbbhkeolk.supabase.co/rest/v1/rpc/pna_reminders_claim");
assert.deepEqual(net.calls[0].body, { p_now: "2026-11-16T07:05:00.000Z", p_limit: 100 });
assert.equal(net.calls[0].headers.Authorization, "Bearer service-key");
const sentBatch = net.calls[1].body as { to: string[]; headers: Record<string, string>; from: string }[];
assert.equal(sentBatch.length, 2); assert.deepEqual(sentBatch[0].to, ["a@example.test"]); assert.ok(sentBatch[0].headers["List-Unsubscribe"].includes(token)); assert.match(sentBatch[0].from, /notifications@physionexusacademy\.com/);
assert.match(net.calls[1].headers["Idempotency-Key"], /^pna-reminders-1-2-2$/);
assert.deepEqual(net.calls[2].body, { p_results: [{ id: 1, ok: true }, { id: 2, ok: true }], p_note: null }); ok("job: claims, sends one batch, reports every result");

net = fakeNetwork({ claim: due, resend: 429 });
result = await runReminderJob(env, { fetch: net.doFetch });
assert.deepEqual(result, { claimed: 2, sent: 0, failed: 2 });
assert.deepEqual(net.calls[2].body, { p_results: [{ id: 1, ok: false }, { id: 2, ok: false }], p_note: "resend HTTP 429" }); ok("job: a rejected batch is reported as failed so the database retries it");

net = fakeNetwork({ claim: [] });
result = await runReminderJob(env, { fetch: net.doFetch });
assert.deepEqual(result, { claimed: 0, sent: 0, failed: 0 }); assert.equal(net.calls.length, 2); assert.deepEqual(net.calls[1].body, { p_results: [], p_note: "idle" }); ok("job: nothing due still leaves a heartbeat");

net = fakeNetwork({ claim: due });
result = await runReminderJob({ SUPABASE_SERVICE_ROLE_KEY: "k" }, { fetch: net.doFetch });
assert.equal(result.skipped, "RESEND_API_KEY is not set"); assert.equal(net.calls.length, 0);
result = await runReminderJob({ RESEND_API_KEY: "k" }, { fetch: net.doFetch });
assert.match(result.skipped ?? "", /SERVICE_ROLE/); assert.equal(net.calls.length, 0); ok("job: without the e-mail or database secret it does nothing and claims nothing");

net = fakeNetwork({ claim: due, claimStatus: 500 });
result = await runReminderJob(env, { fetch: net.doFetch });
assert.equal(result.skipped, "claim failed"); assert.equal(net.calls.length, 1); ok("job: a database error ends the run quietly");

console.log(`\n${checks} reminder checks passed.`);
