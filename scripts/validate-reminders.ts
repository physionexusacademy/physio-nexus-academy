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
function fakeNetwork(opts: { claim: ClaimedReminder[]; participants?: ClaimedReminder[]; participantStatus?: number; resend?: number; claimStatus?: number }) {
  const calls: Call[] = [];
  const doFetch = (async (url: string, init: RequestInit) => {
    const body = init.body ? JSON.parse(String(init.body)) : null;
    calls.push({ url, body, headers: init.headers as Record<string, string> });
    if (url.endsWith("/rpc/pna_reminders_claim")) return new Response(JSON.stringify(opts.claim), { status: opts.claimStatus ?? 200 });
    if (url.endsWith("/rpc/pna_participant_reminders_claim")) return new Response(JSON.stringify(opts.participants ?? []), { status: opts.participantStatus ?? 200 });
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
assert.equal(net.calls.length, 4);
assert.equal(net.calls[0].url, "https://oabckudgmzbbbbhkeolk.supabase.co/rest/v1/rpc/pna_reminders_claim");
assert.deepEqual(net.calls[0].body, { p_now: "2026-11-16T07:05:00.000Z", p_limit: 100 });
assert.equal(net.calls[0].headers.Authorization, "Bearer service-key");
assert.equal(net.calls[1].url, "https://oabckudgmzbbbbhkeolk.supabase.co/rest/v1/rpc/pna_participant_reminders_claim");
const sentBatch = net.calls[2].body as { to: string[]; headers: Record<string, string>; from: string }[];
assert.equal(sentBatch.length, 2); assert.deepEqual(sentBatch[0].to, ["a@example.test"]); assert.ok(sentBatch[0].headers["List-Unsubscribe"].includes(token)); assert.match(sentBatch[0].from, /notifications@physionexusacademy\.com/);
assert.match(net.calls[2].headers["Idempotency-Key"], /^pna-reminders-1-2-2$/);
assert.deepEqual(net.calls[3].body, { p_results: [{ id: 1, ok: true }, { id: 2, ok: true }], p_note: null }); ok("job: claims, sends one batch, reports every result");

net = fakeNetwork({ claim: due, resend: 429 });
result = await runReminderJob(env, { fetch: net.doFetch });
assert.deepEqual(result, { claimed: 2, sent: 0, failed: 2 });
assert.deepEqual(net.calls[3].body, { p_results: [{ id: 1, ok: false }, { id: 2, ok: false }], p_note: "resend HTTP 429" }); ok("job: a rejected batch is reported as failed so the database retries it");

net = fakeNetwork({ claim: [] });
result = await runReminderJob(env, { fetch: net.doFetch });
assert.deepEqual(result, { claimed: 0, sent: 0, failed: 0 }); assert.equal(net.calls.length, 3); assert.deepEqual(net.calls[2].body, { p_results: [], p_note: "idle" }); ok("job: nothing due still leaves a heartbeat");

net = fakeNetwork({ claim: due });
result = await runReminderJob({ SUPABASE_SERVICE_ROLE_KEY: "k" }, { fetch: net.doFetch });
assert.equal(result.skipped, "RESEND_API_KEY is not set"); assert.equal(net.calls.length, 0);
result = await runReminderJob({ RESEND_API_KEY: "k" }, { fetch: net.doFetch });
assert.match(result.skipped ?? "", /SERVICE_ROLE/); assert.equal(net.calls.length, 0); ok("job: without the e-mail or database secret it does nothing and claims nothing");

net = fakeNetwork({ claim: due, claimStatus: 500 });
result = await runReminderJob(env, { fetch: net.doFetch });
assert.equal(result.skipped, "claim failed"); assert.equal(net.calls.length, 1); ok("job: a database error ends the run quietly");


/* participants */
const person = (over: Partial<ClaimedReminder> = {}): ClaimedReminder => ({ id: 31, token: "33333333-2222-4333-8444-555555555555", kind: "daily_participant", to: "ayesha@gmail.com", name: "Ayesha Khan", lang: "mix", streak: 3, stats: { missions: 12, points: 940, best: 100, first_day: "2026-10-09", last_day: "2026-11-13", participants: 32, top_percent: 8 }, ...over });
const mail = buildReminderMail(person(), origin);
assert.equal(mail.subject, "Ayesha Khan, today's Clinical Challenge is ready");
assert.match(mail.text, /^Assalam-o-alaikum, Ayesha Khan,/); assert.match(mail.text, /five clinical questions, 30 seconds each/);
assert.match(mail.text, /Thank you for taking part on 3 consecutive days\. You have completed 12 challenges so far, with a best score of 100\/100\./);
assert.match(mail.text, /Aaj ka Daily Clinical Challenge tayyar hai/); assert.ok(mail.text.includes(`${origin}/api/reminders/unsubscribe?t=${person().token}`)); assert.ok(mail.text.includes("Raja Ghazanfar Ali Khan Road")); assert.match(mail.text, /With regards,\nPhysio Nexus Academy/);
assert.ok(mail.html.includes("<strong>Ayesha Khan</strong>") && mail.html.includes("Open today's challenge") && mail.html.includes("unsubscribe in one click"));
assert.equal(mail.headers["List-Unsubscribe-Post"], "List-Unsubscribe=One-Click"); assert.equal(mail.headers["List-Unsubscribe"], `<${origin}/api/reminders/unsubscribe?t=${person().token}>`); ok("participant e-mail: full name, sober acknowledgement of their record, one button, one-click unsubscribe, sender address");
// the standard stays professional: no gamification, no emoji, no rankings, no pressure, no community size
for (const item of [person(), person({ streak: 0, stats: { ...person().stats!, missions: 0, points: 0, best: 0, top_percent: 100 } }), person({ streak: 0, stats: { ...person().stats!, missions: 1, points: 80, best: 80 } })]) {
  const all = `${buildReminderMail(item, origin).subject}\n${buildReminderMail(item, origin).text}\n${buildReminderMail(item, origin).html}`;
  assert.ok(!/\p{Extended_Pictographic}/u.test(all), "no emoji"); assert.ok(!/top \d+\s*%|streak|leaderboard|only \d+ learners|points|mission|don't miss|hurry|last chance/i.test(all), "no gamified or pushy wording");
}
const copy = (st: Partial<NonNullable<ClaimedReminder["stats"]>>, streak = 0) => buildReminderMail(person({ streak, stats: { ...person().stats!, ...st } }), origin).text;
assert.match(copy({ missions: 0, points: 0, best: 0 }), /You began a challenge with us on 9 October\. Today's questions are ready whenever you would like to complete one\./);
assert.match(copy({ missions: 1, points: 80, best: 80 }), /Thank you for completing your first challenge, where you scored 80\/100\./);
assert.match(copy({ missions: 5, points: 300, best: 90 }), /Thank you for taking part regularly\. You have completed 5 challenges so far, with a best score of 90\/100\./); ok("participant e-mail: professional tone in every case — never played, first challenge, regular, consecutive days; no emoji, rankings, badges or pressure");
const nasty = buildReminderMail(person({ name: '  <script>alert(1)</script>\n  Evil  "Name"  ' }), origin);
assert.ok(!nasty.html.includes("<script>") && !nasty.subject.includes("<") && !nasty.subject.includes("\n")); assert.match(nasty.text, /^Assalam-o-alaikum, scriptalert\(1\)\/script Evil "Name",/); ok("a hostile full name cannot inject markup or break the subject line");

net = fakeNetwork({ claim: [due[0]], participants: [person(), person({ id: 32, to: "bilal@gmail.com", name: "Bilal Ahmed", token: "44444444-2222-4333-8444-555555555555", streak: 0 })] });
result = await runReminderJob(env, { fetch: net.doFetch, now: new Date("2026-11-16T12:05:00Z") });
assert.deepEqual(result, { claimed: 3, sent: 3, failed: 0 });
const batch = net.calls.find((c) => c.url.endsWith("/emails/batch"))!.body as { to: string[]; subject: string }[];
assert.equal(batch.length, 3); assert.ok(batch.some((m) => m.to[0] === "ayesha@gmail.com" && m.subject.startsWith("Ayesha Khan,")));
assert.deepEqual(net.calls.find((c) => c.url.endsWith("pna_participant_reminders_claim"))!.body, { p_now: "2026-11-16T12:05:00.000Z", p_limit: 100 }); ok("job: students, patients and participants go out together, each with their own message");

const many = Array.from({ length: 130 }, (_, i) => person({ id: 100 + i, to: `p${i}@gmail.com`, name: `Person ${i}`, token: `00000000-0000-4000-8000-${String(i).padStart(12, "0")}` }));
net = fakeNetwork({ claim: [], participants: many });
result = await runReminderJob(env, { fetch: net.doFetch });
assert.deepEqual(result, { claimed: 130, sent: 130, failed: 0 });
const posts = net.calls.filter((c) => c.url.endsWith("/emails/batch"));
assert.deepEqual(posts.map((c) => (c.body as unknown[]).length), [100, 30]); ok("job: more than 100 recipients are sent in batches of 100");

net = fakeNetwork({ claim: due, participantStatus: 404 });
result = await runReminderJob(env, { fetch: net.doFetch });
assert.deepEqual(result, { claimed: 2, sent: 2, failed: 0 });
assert.equal((net.calls.at(-1)!.body as { p_note: string }).p_note, "participant claim failed"); ok("job: if the participant function is missing (migration not applied) the other reminders still go out");

console.log(`\n${checks} reminder checks passed.`);
