/**
 * RehabVerse exercise-coach end-to-end test against the LOCAL backend (never the real project). There is no Cloudflare AI locally, so the free-form
 * question runs on the scripted menu; everything else (the quick answers made from the plan and the library, the routing to the physiotherapist, the
 * safety stop, the hold, the switch) is the real thing. The model itself is judged with /api/rehabverse/ai/selftest on the live site.
 *
 *   1) REHAB_DEV_SQL=1 node scripts/rehabverse-local/server.mjs
 *   2) NEXT_PUBLIC_SUPABASE_URL=http://127.0.0.1:54321 NEXT_PUBLIC_SUPABASE_ANON_KEY=local-anon-key SUPABASE_SERVICE_ROLE_KEY=local-service-role-key \
 *      NEXT_PUBLIC_SITE_URL=http://127.0.0.1:3100 PNA_SKIP_CF_DEV=1 npx next dev -p 3100
 *   3) node scripts/rehabverse-local/e2e-coach.cjs
 */
const { chromium } = require("playwright");
const fs = require("fs");
const path = require("path");

const BASE = process.env.E2E_BASE ?? "http://127.0.0.1:3100";
const API = process.env.E2E_API ?? "http://127.0.0.1:54321";
const OUT = process.env.E2E_OUT ?? path.join(process.cwd(), "e2e-out-coach");
fs.mkdirSync(OUT, { recursive: true });
const stamp = Date.now().toString(36);
const person = (tag) => ({ email: `${tag}.${stamp}@example.test`, password: `Patient-${tag}-pass-2026`, name: `${tag} Test ${stamp}` });
const ADMIN = { email: "admin@pna.test", password: "AdminPass#2026" };
const results = [];
const check = (name, ok, detail = "") => {
  results.push(Boolean(ok));
  console.log(`${ok ? "PASS" : "FAIL"}  ${name}${detail ? "  — " + detail : ""}`);
};
async function devSql(sql, params = []) {
  const res = await fetch(`${API}/__dev/sql`, { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ sql, params }) });
  if (!res.ok) throw new Error("dev sql failed: " + (await res.text()));
  return res.json();
}
const rows = async (sql, params) => { const r = await devSql(sql, params); return Array.isArray(r) ? r : r.rows ?? []; };
const GL = ["--use-gl=angle", "--use-angle=swiftshader", "--enable-unsafe-swiftshader"];

async function newPage(browser) {
  const ctx = await browser.newContext({ viewport: { width: 1280, height: 1000 } });
  await ctx.addInitScript(() => { try { localStorage.setItem("pna-teacher-lang-v1", JSON.stringify("en")); localStorage.setItem("pna-fx-v1", JSON.stringify({ mode: "lite", how: "user", at: Date.now() })); } catch {} });
  // third-party analytics are not part of what is tested, and a slow one would hold the page's load event
  await ctx.route(/googletagmanager\.com|google-analytics\.com/, (route) => route.abort());
  const page = await ctx.newPage();
  page.errors = [];
  page.on("pageerror", (e) => page.errors.push(String(e)));
  return page;
}
async function register(page, who) {
  await page.goto(`${BASE}/rehabverse/register`);
  await page.fill("#full_name", who.name);
  await page.fill("#age_years", "41");
  await page.fill("#email", who.email);
  await page.fill("#password", who.password);
  await page.check("input[name=consent]");
  await page.getByRole("button", { name: "Create my account" }).click();
  await page.waitForURL(/\/rehabverse\/start/, { timeout: 90000 });
}

/** A patient with an assessment, an active programme and an OPEN day 1 with two prescribed exercises (made directly in the local database). */
async function seedDay(who, aiOn) {
  const [p] = await rows("select id from public.rehab_patients where user_id = (select id from auth.users where email = $1)", [who.email]);
  if (aiOn) await devSql("update public.rehab_patients set ai_assist = 'on' where id = $1", [p.id]);
  const [a] = await rows("insert into public.rehab_assessments (patient_id, status, regions, symptoms, pain_now) values ($1, 'programme_created', '{hip}', '{pain}', 4) returning id", [p.id]);
  const [g] = await rows("insert into public.rehab_programmes (patient_id, assessment_id, title, status, approved_at) values ($1, $2, 'Hip programme', 'active', now()) returning id", [p.id, a.id]);
  const [s] = await rows("insert into public.rehab_sessions (programme_id, day_number, title, status, released_at, release_mode) values ($1, 1, 'Day 1: hips', 'unlocked', now(), 'first_day') returning id", [g.id]);
  await devSql("insert into public.rehab_session_exercises (session_id, position, exercise_id, exercise_title, sets, reps, hold_seconds, rest_seconds, side, frequency, precautions) values ($1, 1, 'clamshell', 'Clamshell', 2, 10, 3, 30, 'left', 'once a day', 'Keep the movement small and slow.')", [s.id]);
  await devSql("insert into public.rehab_session_exercises (session_id, position, exercise_id, exercise_title, sets, reps, rest_seconds, side, frequency) values ($1, 2, 'glute-bridge', 'Glute bridge', 3, 8, 45, 'both', 'once a day')", [s.id]);
  return { patientId: p.id, sessionId: s.id };
}
const dayReady = (page) => page.waitForSelector('h2:has-text("Today\'s exercises")', { state: "attached", timeout: 90000 });
const lastMessage = async (page) => (await page.locator('[data-rv-coach="chat"] [role="log"] p').last().innerText()).trim();
async function ask(page, action) {
  const before = await page.locator('[data-rv-coach="chat"] [role="log"] p').count();
  await action();
  await page.waitForFunction((n) => document.querySelectorAll('[data-rv-coach="chat"] [role="log"] p').length >= n + 2, before, { timeout: 60000 });
  await page.waitForFunction(() => !document.querySelector('[aria-label="The coach is typing"]'), null, { timeout: 60000 });
  return lastMessage(page);
}

(async () => {
  const browser = await chromium.launch({ args: GL });

  /* 1. Without the switch, the day page has no coach. */
  const n = person("none"); const pn = await newPage(browser);
  await register(pn, n);
  const dayN = await seedDay(n, false);
  await pn.goto(`${BASE}/rehabverse/me/day/${dayN.sessionId}`);
  await dayReady(pn);
  check("1a Without the switch the day page shows the exercises and no coach", (await pn.locator("[data-rv-coach]").count()) === 0);

  /* 2. With the switch on: the coach is offered, with a notice first. */
  const a = person("alice"); const pa = await newPage(browser);
  await register(pa, a);
  const day = await seedDay(a, true);
  await pa.goto(`${BASE}/rehabverse/me/day/${day.sessionId}`);
  await dayReady(pa);
  await pa.locator('[data-rv-coach="closed"]').waitFor({ timeout: 30000 });
  check("2a With the switch on the day page offers the exercise coach, marked AI", /exercise coach/i.test(await pa.locator('[data-rv-coach="closed"]').innerText()) && /\bAI\b/.test(await pa.locator('[data-rv-coach="closed"]').innerText()));
  await pa.locator('[data-rv-coach="closed"]').click();
  const notice = await pa.locator('[data-rv-coach="notice"]').innerText();
  check("2b The notice says it is an AI, that the physiotherapist reads the chat, and gives the emergency number", /AI coach, not a doctor or a physiotherapist/.test(notice) && /physiotherapist can read this chat/.test(notice) && /1122/.test(notice));
  await pa.getByRole("button", { name: "I understand, start" }).click();
  await pa.locator('[data-rv-coach="chat"]').waitFor({ timeout: 30000 });
  check("2c The coach greets the patient and says it is an AI", /I am your exercise coach, an AI assistant/.test(await lastMessage(pa)));
  const [conv] = await rows("select id, kind, status, messages, draft from public.rehab_ai_conversations where patient_id = $1", [day.patientId]);
  check("2d The conversation is stored as a coach conversation", conv && conv.kind === "coach" && conv.status === "open" && conv.messages.length === 1, JSON.stringify({ kind: conv?.kind, status: conv?.status }));

  /* 3. Quick answers come from the physiotherapist's plan and the reviewed library, for the exercise that is open. */
  const how = await ask(pa, () => pa.locator('[data-coach-quick="how"]').click());
  check("3a 'How do I do it?' gives the reviewed steps for the open exercise (Clamshell)", /Clamshell/.test(how) && /Starting position:/.test(how) && /1\. /.test(how) && /Breathing:/.test(how), how.slice(0, 120).replace(/\n/g, " | "));
  const dose = await ask(pa, () => pa.locator('[data-coach-quick="dose"]').click());
  check("3b 'How many?' gives the physiotherapist's prescription, not the library default", /2 sets/.test(dose) && /10 repetitions/.test(dose) && /hold for 3 seconds/.test(dose) && /rest 30 seconds/.test(dose) && /left side only/.test(dose), dose.slice(0, 160));
  await pa.getByRole("button", { name: /Glute bridge/ }).first().click();
  const dose2 = await ask(pa, () => pa.locator('[data-coach-quick="dose"]').click());
  check("3c Opening another exercise changes what the coach answers about (Glute bridge: 3 sets of 8)", /Glute bridge/.test(dose2) && /3 sets/.test(dose2) && /8 repetitions/.test(dose2), dose2.slice(0, 140));
  const mistakes = await ask(pa, () => pa.locator('[data-coach-quick="mistakes"]').click());
  check("3d Common mistakes are listed from the library", /common mistakes/i.test(mistakes) && /•/.test(mistakes));
  const pain = await ask(pa, () => pa.locator('[data-coach-quick="pain"]').click());
  check("3e 'What if it hurts?' uses the guide's wording, states no pain score and tells the physiotherapist", /sharp, severe or worsening pain is not okay/.test(pain) && !/\d\s*\/\s*10|out of 10/.test(pain) && /noted this for your physiotherapist/.test(pain));
  await pa.screenshot({ path: path.join(OUT, "01-coach-answers.png"), fullPage: true });

  /* 4. A question only the physiotherapist can answer is routed to them. */
  await pa.getByLabel("Your question").fill("Can I take a painkiller before this?");
  const physio = await ask(pa, () => pa.getByRole("button", { name: "Send", exact: true }).click());
  check("4a A medicine question is not answered: it goes to the physiotherapist", /question for your physiotherapist/.test(physio) && /noted it for them/.test(physio), physio.slice(0, 100));
  let inbox = await rows("select kind, severity, body from public.rehab_notifications where audience = 'admin' and patient_id = $1 and kind like 'ai_coach_%'", [day.patientId]);
  check("4b The admin inbox has ONE question for this patient and day (the 'what if it hurts' question came first; the painkiller question did not add a second)", inbox.length === 1 && inbox[0].kind === "ai_coach_question" && inbox[0].severity === "attention" && /day 1/.test(inbox[0].body) && /hurts/.test(inbox[0].body), JSON.stringify(inbox));

  /* 5. A free-form question with no model available: the scripted menu, counted as a scripted reply. */
  await pa.getByLabel("Your question").fill("what does it mean to keep my hips stacked?");
  const free = await ask(pa, () => pa.getByRole("button", { name: "Send", exact: true }).click());
  check("5a A free-form question without a model gets the scripted menu", /I can help with how to do an exercise/.test(free));
  const counts = (await rows("select turns, fallback_turns, models from public.rehab_ai_conversations where id = $1", [conv.id]))[0];
  check("5b ...and the transcript counts it as a scripted reply", counts.turns >= 6 && counts.fallback_turns === 1, JSON.stringify(counts));

  /* 5c. A patient who WRITES Roman Urdu is answered in Roman Urdu, whatever the page's language switch says (the page is in English here). */
  await pa.getByLabel("Your question").fill("ye exercise kaise karni hai");
  const ur1 = await ask(pa, () => pa.getByRole("button", { name: "Send", exact: true }).click());
  check("5c Roman Urdu question on an English page: the steps come in Roman Urdu", /Shuru ki position/.test(ur1) && !/Starting position:/.test(ur1), ur1.slice(0, 120).replace(/\n/g, " | "));
  await pa.getByLabel("Your question").fill("ye hips stacked ka kya matlab hai");
  const ur2 = await ask(pa, () => pa.getByRole("button", { name: "Send", exact: true }).click());
  check("5d A free-form Roman Urdu question gets the scripted menu in Roman Urdu", /Main madad kar sakta hoon/.test(ur2) && !/I can help with/.test(ur2), ur2.slice(0, 100));

  /* 6. A safety problem stops the coach and alerts the physiotherapist. */
  await pa.getByLabel("Your question").fill("I felt a pop in my knee");
  const stop = await ask(pa, () => pa.getByRole("button", { name: "Send", exact: true }).click());
  check("6a A safety problem gets a stop message with the emergency number, not coaching", /Please stop exercising for now/.test(stop) && /1122/.test(stop), stop.slice(0, 90));
  check("6b The patient is told the physiotherapist has been told, and typing is closed", (await pa.getByText("Your physiotherapist has been told. Please use the feedback form").count()) === 1 && (await pa.getByLabel("Your question").count()) === 0);
  inbox = await rows("select kind, severity, title, body from public.rehab_notifications where audience = 'admin' and patient_id = $1 and kind like 'ai_coach_%' order by kind", [day.patientId]);
  const safety = inbox.find((m) => m.kind === "ai_coach_safety");
  check("6c The admin inbox has an URGENT safety notice with the patient's words", safety && safety.severity === "urgent" && /pop in my knee/.test(safety.body) && /reported a problem during exercise/.test(safety.title), JSON.stringify(safety));
  const closed = (await rows("select status, safety_alert from public.rehab_ai_conversations where id = $1", [conv.id]))[0];
  check("6d The conversation is recorded as a safety stop", closed.status === "safety_stop" && closed.safety_alert === "pop-or-tear", JSON.stringify(closed));
  await pa.screenshot({ path: path.join(OUT, "02-coach-safety-stop.png"), fullPage: true });

  /* 7. The coach stays quiet for that day afterwards. */
  await pa.reload();
  await dayReady(pa);
  await pa.locator('[data-rv-coach="closed"]').click();
  await pa.getByRole("button", { name: "I understand, start" }).click();
  await pa.getByText("The coach is paused for today because of what you reported").waitFor({ timeout: 30000 });
  check("7a After a safety stop the coach stays paused for that day (the feedback form is still there)", (await pa.getByLabel("Your question").count()) === 0 && (await pa.getByText("After your session: feedback").count()) === 1);

  /* 8. The admin sees the conversation and the alerts. */
  const pad = await newPage(browser);
  await pad.goto(`${BASE}/admin/login`);
  await pad.fill("input[name=email]", ADMIN.email);
  await pad.fill("input[name=password]", ADMIN.password);
  await pad.locator("form button[type=submit]").first().click();
  await pad.waitForURL((url) => url.pathname === "/admin", { timeout: 90000 });
  await pad.goto(`${BASE}/admin/rehabverse/patients/${day.patientId}`);
  await pad.getByText("AI conversations").first().waitFor({ timeout: 60000 });
  const transcript = await pad.locator("#ai").innerText();
  check("8a The admin reads the coach conversation word for word, marked as a coach conversation with a safety alert", /coach conversation/.test(transcript) && /Can I take a painkiller/.test(transcript) && /I felt a pop in my knee/.test(transcript) && /alert: pop-or-tear/.test(transcript), transcript.slice(0, 100).replace(/\n/g, " "));
  check("8b ...and the scripted replies are marked", /scripted repl/.test(transcript));
  await pad.screenshot({ path: path.join(OUT, "03-admin-coach.png"), fullPage: true });

  /* 9. Switching AI off stops the coach at once. */
  const c = person("carol"); const pc = await newPage(browser);
  await register(pc, c);
  const dayC = await seedDay(c, true);
  await pc.goto(`${BASE}/rehabverse/me/day/${dayC.sessionId}`);
  await dayReady(pc);
  await pc.locator('[data-rv-coach="closed"]').click();
  await pc.getByRole("button", { name: "I understand, start" }).click();
  await pc.locator('[data-rv-coach="chat"]').waitFor({ timeout: 30000 });
  await devSql("update public.rehab_patients set ai_assist = 'off' where id = $1", [dayC.patientId]);
  await pc.locator('[data-coach-quick="how"]').click();
  await pc.waitForFunction(() => document.querySelectorAll("[data-rv-coach]").length === 0, null, { timeout: 30000 });
  check("9a When the admin switches AI off mid-chat the coach disappears and nothing more is recorded", (await rows("select turns from public.rehab_ai_conversations where patient_id = $1", [dayC.patientId]))[0].turns === 0);

  /* 10. A day that is not open cannot be coached, and one patient cannot reach another's. */
  const lock = await rows("update public.rehab_sessions set status = 'locked' where id = $1 returning id", [day.sessionId]);
  check("10a (setup) the day is locked", lock.length === 1);

  await browser.close();
  const errorPages = [pn, pa, pad, pc].filter((p) => p.errors.length);
  check("11 No page errors", errorPages.length === 0, errorPages.map((p) => p.errors[0]).join(" | "));
  const failed = results.filter((ok) => !ok).length;
  console.log(`\n${results.length - failed}/${results.length} passed`);
  process.exit(failed ? 1 : 0);
})().catch((error) => { console.error(error); process.exit(1); });
