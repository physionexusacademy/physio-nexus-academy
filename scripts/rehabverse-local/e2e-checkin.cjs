/**
 * RehabVerse recovery check-in chat end-to-end test against the LOCAL backend (never the real project). There is no Cloudflare AI locally, so every
 * acknowledgement is the scripted one; everything else (the order of the questions, the safety question, the denials, the pre-filled form, the
 * physiotherapist alerts, the hold after a safety stop, the admin's view of what changed) is the real thing. The model itself is judged with
 * /api/rehabverse/ai/selftest on the live site.
 *
 *   1) REHAB_DEV_SQL=1 node scripts/rehabverse-local/server.mjs
 *   2) NEXT_PUBLIC_SUPABASE_URL=http://127.0.0.1:54321 NEXT_PUBLIC_SUPABASE_ANON_KEY=local-anon-key SUPABASE_SERVICE_ROLE_KEY=local-service-role-key \
 *      NEXT_PUBLIC_SITE_URL=http://127.0.0.1:3100 PNA_SKIP_CF_DEV=1 npx next dev -p 3100
 *   3) node scripts/rehabverse-local/e2e-checkin.cjs
 */
const { chromium } = require("playwright");
const fs = require("fs");
const path = require("path");

const BASE = process.env.E2E_BASE ?? "http://127.0.0.1:3100";
const API = process.env.E2E_API ?? "http://127.0.0.1:54321";
const OUT = process.env.E2E_OUT ?? path.join(process.cwd(), "e2e-out-checkin");
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
  const ctx = await browser.newContext({ viewport: { width: 1280, height: 1100 } });
  await ctx.addInitScript(() => { try { localStorage.setItem("pna-teacher-lang-v1", JSON.stringify("en")); localStorage.setItem("pna-fx-v1", JSON.stringify({ mode: "lite", how: "user", at: Date.now() })); } catch {} });
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

/** A patient with an active programme and a day they finished `hoursAgo` hours ago (feedback submitted), so the 24 h check-in is open when hoursAgo is about 30. */
async function seedDay(who, aiOn, hoursAgo = 30) {
  const [p] = await rows("select id from public.rehab_patients where user_id = (select id from auth.users where email = $1)", [who.email]);
  if (aiOn) await devSql("update public.rehab_patients set ai_assist = 'on' where id = $1", [p.id]);
  const [a] = await rows("insert into public.rehab_assessments (patient_id, status, regions, symptoms, pain_now) values ($1, 'programme_created', '{hip}', '{pain}', 4) returning id", [p.id]);
  const [g] = await rows("insert into public.rehab_programmes (patient_id, assessment_id, title, status, approved_at, errp_schedule) values ($1, $2, 'Hip programme', 'active', now(), '{24h}') returning id", [p.id, a.id]);
  const [s] = await rows("insert into public.rehab_sessions (programme_id, day_number, title, status, released_at, release_mode) values ($1, 1, 'Day 1: hips', 'awaiting_review', now(), 'first_day') returning id", [g.id]);
  await devSql("insert into public.rehab_session_exercises (session_id, position, exercise_id, exercise_title, sets, reps, rest_seconds, side, frequency) values ($1, 1, 'glute-bridge', 'Glute bridge', 3, 8, 45, 'both', 'once a day')", [s.id]);
  await devSql("insert into public.rehab_feedback (session_id, patient_id, completion, pain_before, pain_during, pain_after, difficulty, submitted_at) values ($1, $2, 'all', 3, 5, 4, 6, now() - ($3 || ' hours')::interval)", [s.id, p.id, String(hoursAgo)]);
  return { patientId: p.id, sessionId: s.id };
}
const dayReady = (page) => page.waitForSelector("#checkin, h2:has-text('Today')", { state: "attached", timeout: 90000 });
const LOG = '[data-rv-checkin="chat"] [role="log"] p';
const lastMessage = async (page) => (await page.locator(LOG).last().innerText()).trim();
async function say(page, text) {
  const before = await page.locator(LOG).count();
  await page.getByLabel("Your answer").fill(text);
  await page.getByRole("button", { name: "Send", exact: true }).click();
  await page.waitForFunction((n) => document.querySelectorAll('[data-rv-checkin="chat"] [role="log"] p').length >= n + 2, before, { timeout: 60000 });
  await page.waitForFunction(() => !document.querySelector('[aria-label="The assistant is typing"]'), null, { timeout: 60000 });
  return lastMessage(page);
}
const formPain = async (page) => (await page.locator('fieldset:has(legend:has-text("Pain right now")) button[aria-pressed="true"]').first().innerText().catch(() => "")).trim();
const radio = async (page, label) => (await page.getByRole("radio", { name: label, exact: true }).getAttribute("aria-checked")) === "true";
const box = async (page, text) => (await page.getByRole("checkbox", { name: text }).first().getAttribute("aria-checked")) === "true";
async function openChat(page) {
  await page.locator('[data-rv-checkin="closed"]').waitFor({ timeout: 30000 });
  // seven 3D pages are open by the end of the run: the software renderer can be slow, so these clicks wait longer
  await page.locator('[data-rv-checkin="closed"]').click({ timeout: 120000 });
  await page.getByRole("button", { name: "I understand, start" }).click({ timeout: 120000 });
  await page.locator('[data-rv-checkin="chat"]').waitFor({ timeout: 60000 });
}
const inbox = (patientId, like) => rows("select kind, severity, title, body from public.rehab_notifications where audience = 'admin' and patient_id = $1 and kind like $2 order by kind", [patientId, like]);

(async () => {
  const browser = await chromium.launch({ args: GL });

  /* 1. Without the switch, the check-in is the form only. */
  const n = person("none"); const pn = await newPage(browser);
  await register(pn, n);
  const dayN = await seedDay(n, false);
  await pn.goto(`${BASE}/rehabverse/me/day/${dayN.sessionId}`);
  await dayReady(pn);
  await pn.getByText("Pain right now").first().waitFor({ timeout: 60000 });
  check("1a Without the switch the 24 h check-in is the plain form and no assistant is offered", (await pn.locator("[data-rv-checkin]").count()) === 0);

  /* 2. With the switch: the assistant is offered, with a notice first. */
  const a = person("alice"); const pa = await newPage(browser);
  await register(pa, a);
  const day = await seedDay(a, true);
  await pa.goto(`${BASE}/rehabverse/me/day/${day.sessionId}`);
  await dayReady(pa);
  await pa.locator('[data-rv-checkin="closed"]').waitFor({ timeout: 60000 });
  const card = await pa.locator('[data-rv-checkin="closed"]').innerText();
  check("2a With the switch on, the check-in offers the chat, marked AI, above the form", /answer by chat/i.test(card) && /\bAI\b/.test(card) && (await pa.getByText("Pain right now").count()) >= 1);
  await pa.locator('[data-rv-checkin="closed"]').click();
  const notice = await pa.locator('[data-rv-checkin="notice"]').innerText();
  check("2b The notice says it is an AI, that it only fills in the form, that the physiotherapist reads it, and gives the emergency number", /AI assistant, not a doctor or a physiotherapist/.test(notice) && /you check it and save it yourself/.test(notice) && /physiotherapist can read this chat/.test(notice) && /1122/.test(notice));
  await pa.getByRole("button", { name: "I understand, start" }).click();
  await pa.locator('[data-rv-checkin="chat"]').waitFor({ timeout: 30000 });
  const greeting = await lastMessage(pa);
  check("2c It greets the patient, says it is an AI and asks the first question (pain 0 to 10)", /check-in assistant, an AI/.test(greeting) && /0 \(no pain\) to 10/.test(greeting), greeting.slice(0, 80));
  const [conv] = await rows("select id, kind, status, messages, draft from public.rehab_ai_conversations where patient_id = $1", [day.patientId]);
  check("2d The conversation is stored as a feedback conversation", conv && conv.kind === "feedback" && conv.status === "open" && conv.messages.length === 1, JSON.stringify({ kind: conv?.kind, status: conv?.status }));

  /* 3. A normal check-in: questions in order, denials do not alarm, the form fills in, "None of these" is left for the patient. */
  const q2 = await say(pa, "3");
  check("3a After pain comes the safety question, in full", /safety question that I ask everyone/.test(q2) && /chest pain or trouble breathing/.test(q2) && /yes or no/.test(q2), q2.slice(0, 100));
  check("3b The form shows the pain the patient gave", (await formPain(pa)).startsWith("3"), await formPain(pa));
  const q3 = await say(pa, "no chest pain, no dizziness, no numbness");
  check("3c Plain denials do not alarm: the chat carries on with the next question", /better, about the same, or worse/.test(q3) && (await inbox(day.patientId, "ai_checkin_%")).length === 0, q3.slice(0, 80));
  const q4 = await say(pa, "a bit better");
  check("3d 'a bit better' is understood as better, and the daily activities question follows", /everyday things/.test(q4) && (await radio(pa, "Better")));
  const q5 = await say(pa, "8");
  check("3e Daily activities 8 is accepted and the new symptoms question follows", /new symptoms/.test(q5));
  const q6 = await say(pa, "no");
  check("3f ...then the last question", /anything else you would like your physiotherapist to know/.test(q6));
  const fin = await say(pa, "my knee clicks sometimes when I climb stairs");
  check("3g The chat finishes with a summary built from the answers, and tells the patient to tick the safety list and save", /pain now 3\/10/.test(fin) && /everyday activities 8\/10/.test(fin) && /you told me you had none of the warning signs/.test(fin) && /tick the safety list yourself/.test(fin), fin.slice(0, 160));
  check("3h Typing is closed and the patient is told the form is filled in", (await pa.getByLabel("Your answer").count()) === 0 && (await pa.getByText("The form below is filled in").count()) === 1);
  check("3i The form carries the answers (pain 3, better, note) and 'None of these' is NOT ticked by the chat", (await formPain(pa)).startsWith("3") && (await radio(pa, "Better")) && !(await box(pa, /None of these/)) && (await pa.getByLabel("Note").inputValue()).includes("knee clicks"));
  check("3j The Save button stays disabled until the patient answers the safety list themselves", await pa.getByRole("button", { name: /Save check-in/ }).isDisabled());
  await pa.screenshot({ path: path.join(OUT, "01-checkin-chat-done.png"), fullPage: true });

  /* 4. The patient changes one answer on the form and saves it: only the patient's form is a record. */
  await pa.locator('fieldset:has(legend:has-text("Pain right now")) button', { hasText: /^4$/ }).first().click();
  await pa.getByRole("checkbox", { name: /None of these/ }).first().click();
  await pa.getByRole("button", { name: /Save check-in/ }).click();
  await pa.getByText("Thank you — recorded.").waitFor({ timeout: 60000 });
  const [obs] = await rows("select timepoint, pain, function_score, symptom_response, new_symptoms, flag_ids, note from public.rehab_errp_observations where patient_id = $1", [day.patientId]);
  check("4a The saved check-in is the patient's own form (pain 4 as edited, better, activities 8, no new symptoms, no warning signs)", obs && obs.timepoint === "24h" && obs.pain === 4 && obs.symptom_response === "better" && obs.function_score === 8 && obs.new_symptoms === false && obs.flag_ids.length === 0, JSON.stringify(obs));
  await new Promise((r) => setTimeout(r, 1500));
  const [saved] = await rows("select status, draft from public.rehab_ai_conversations where id = $1", [conv.id]);
  check("4b The conversation is closed as completed and keeps the chat's own answers (pain 3) next to the day and the check-in", saved.status === "completed" && saved.draft.answers.pain === 3 && saved.draft.timepoint === "24h" && saved.draft.session_id === day.sessionId && saved.draft.answers.signs === "no", JSON.stringify(saved.draft).slice(0, 220));

  /* 5. A warning sign stops the chat, pre-ticks it on the form, alerts the physiotherapist and keeps the chat quiet. */
  const b = person("bella"); const pb = await newPage(browser);
  await register(pb, b);
  const dayB = await seedDay(b, true);
  await pb.goto(`${BASE}/rehabverse/me/day/${dayB.sessionId}`);
  await dayReady(pb);
  await openChat(pb);
  await say(pb, "5");
  const stop = await say(pb, "my calf is swollen and hot");
  check("5a A swollen calf stops the chat with a stop message (not the exercise coach's 'rest of today's session')", /Please stop exercising for now/.test(stop) && !/today's session/.test(stop) && /ticked what you reported/.test(stop), stop.slice(0, 100));
  check("5b The calf warning sign is ticked on the form, 'None of these' is not, and the patient is told the physiotherapist has been told", (await box(pb, /A hot, swollen or very painful calf/)) && !(await box(pb, /None of these/)) && (await pb.getByText("Your physiotherapist has been told. The warning sign is ticked").count()) === 1 && (await pb.getByLabel("Your answer").count()) === 0);
  const told = await inbox(dayB.patientId, "ai_checkin_%");
  check("5c The admin inbox has an URGENT check-in alert with the patient's words", told.length === 1 && told[0].kind === "ai_checkin_safety" && told[0].severity === "urgent" && /calf is swollen and hot/.test(told[0].body) && /24h check-in/.test(told[0].body) && /Check-in assistant/.test(told[0].title), JSON.stringify(told[0]));
  const [stopped] = await rows("select status, safety_alert, draft from public.rehab_ai_conversations where patient_id = $1", [dayB.patientId]);
  check("5d The conversation is recorded as a safety stop with the sign", stopped.status === "safety_stop" && stopped.draft.answers.flags.includes("fb_calf") && stopped.draft.answers.signs === "reported", JSON.stringify({ status: stopped.status, alert: stopped.safety_alert }));
  await pb.screenshot({ path: path.join(OUT, "02-checkin-safety-stop.png"), fullPage: true });
  await pb.reload();
  await dayReady(pb);
  await openChat(pb);
  check("5e After a reload the chat is still stopped, the sign is still ticked, and no second conversation was made", (await pb.getByLabel("Your answer").count()) === 0 && (await box(pb, /A hot, swollen or very painful calf/)) && (await rows("select id from public.rehab_ai_conversations where patient_id = $1", [dayB.patientId])).length === 1);
  await pb.getByRole("radio", { name: "Worse", exact: true }).click();
  await pb.getByRole("button", { name: /Save check-in/ }).click();
  await pb.getByText("Thank you for telling us. Please stop exercising.").waitFor({ timeout: 60000 });
  const [obsB] = await rows("select flag_ids, pain, symptom_response from public.rehab_errp_observations where patient_id = $1", [dayB.patientId]);
  check("5f Saving the pre-ticked form records the warning sign and the programme's own safety response runs", obsB.flag_ids.includes("fb_calf") && obsB.pain === 5, JSON.stringify(obsB));

  await pa.context().close(); await pb.context().close(); // finished with these two: free the software renderer
  /* 6. A bare "yes" to the safety question stops the chat too, and nothing is ticked for the patient. */
  const c = person("carol"); const pc = await newPage(browser);
  await register(pc, c);
  const dayC = await seedDay(c, true);
  await pc.goto(`${BASE}/rehabverse/me/day/${dayC.sessionId}`);
  await dayReady(pc);
  await openChat(pc);
  await say(pc, "2");
  const yes = await say(pc, "yes");
  check("6a A bare yes stops the chat and asks the patient to tick which sign it was", /Please stop exercising for now/.test(yes) && /tick which warning sign/.test(yes), yes.slice(0, 80));
  const told6 = await inbox(dayC.patientId, "ai_checkin_%");
  check("6b ...the physiotherapist gets an urgent alert, and no warning sign is ticked", told6.length === 1 && told6[0].severity === "urgent" && (await pc.getByRole("checkbox", { name: /calf|chest|dizz|numbness|Sharp|hurt myself|joint/ }).evaluateAll((els) => els.every((e) => e.getAttribute("aria-checked") !== "true"))));

  /* 7. A question only the physiotherapist can answer, and a very high pain, are routed to them. */
  const d = person("dan"); const pd = await newPage(browser);
  await register(pd, d);
  const dayD = await seedDay(d, true);
  await pd.goto(`${BASE}/rehabverse/me/day/${dayD.sessionId}`);
  await dayReady(pd);
  await openChat(pd);
  const high = await say(pd, "9, should I take a tablet?");
  check("7a A medicine question is not answered, the pain number is still recorded, and the high number is made sure the physiotherapist sees", /question for your physiotherapist/.test(high) && /high number/.test(high) && (await formPain(pd)).startsWith("9"), high.slice(0, 120));
  const told7 = await inbox(dayD.patientId, "ai_checkin_%");
  check("7b The admin inbox has ONE note (attention) from the check-in assistant", told7.length === 1 && told7[0].kind === "ai_checkin_question" && told7[0].severity === "attention", JSON.stringify(told7));
  const unclear = await say(pd, "banana");
  check("7c An answer it cannot understand is asked again with help, never guessed", /did not quite understand/.test(unclear) && /yes or no/.test(unclear));

  /* 8. The admin sees the conversation, the alerts, and what the patient changed on the form after the chat. */
  const pad = await newPage(browser);
  await pad.goto(`${BASE}/admin/login`);
  await pad.fill("input[name=email]", ADMIN.email);
  await pad.fill("input[name=password]", ADMIN.password);
  await pad.locator("form button[type=submit]").first().click();
  await pad.waitForURL((url) => url.pathname === "/admin", { timeout: 90000 });
  await pad.goto(`${BASE}/admin/rehabverse/patients/${day.patientId}`);
  await pad.getByText("AI conversations").first().waitFor({ timeout: 60000 });
  const transcript = await pad.locator("#ai").innerText();
  check("8a The admin reads the check-in conversation word for word", /feedback conversation/.test(transcript) && /no chest pain, no dizziness, no numbness/.test(transcript) && /my knee clicks/.test(transcript));
  const chip = await pad.locator("[data-admin-checkin-chats]").first().innerText();
  check("8b Next to the recovery results the physiotherapist sees that the chat was used and that the patient changed the pain from 3 (chat) to 4 (form)", /AI check-in chat/.test(chip) && /changed pain \(chat 3\/10, form 4\/10\)/.test(chip), chip.replace(/\n/g, " | "));
  await pad.screenshot({ path: path.join(OUT, "03-admin-checkin.png"), fullPage: true });
  await pad.goto(`${BASE}/admin/rehabverse/patients/${dayB.patientId}`);
  await pad.getByText("AI conversations").first().waitFor({ timeout: 60000 });
  const chipB = await pad.locator("[data-admin-checkin-chats]").first().innerText();
  check("8c For the safety-stopped check-in the admin sees 'stopped on a warning sign' with the sign named", /stopped on a warning sign/.test(chipB) && /calf/i.test(chipB), chipB.replace(/\n/g, " | "));

  /* 9. A check-in that is not open has no chat; switching AI off stops it at once. */
  const e = person("eve"); const pe = await newPage(browser);
  await register(pe, e);
  const dayE = await seedDay(e, true, 1);
  await pe.goto(`${BASE}/rehabverse/me/day/${dayE.sessionId}`);
  await dayReady(pe);
  await pe.getByText("Coming up").first().waitFor({ timeout: 60000 });
  check("9a One hour after the session the 24 h check-in is 'coming up' and has no chat", (await pe.locator("[data-rv-checkin]").count()) === 0);
  const f = person("fay"); const pf = await newPage(browser);
  await register(pf, f);
  const dayF = await seedDay(f, true);
  await pf.goto(`${BASE}/rehabverse/me/day/${dayF.sessionId}`);
  await dayReady(pf);
  await openChat(pf);
  await devSql("update public.rehab_patients set ai_assist = 'off' where id = $1", [dayF.patientId]);
  await pf.getByLabel("Your answer").fill("4");
  await pf.getByRole("button", { name: "Send", exact: true }).click();
  await pf.waitForFunction(() => document.querySelectorAll("[data-rv-checkin]").length === 0, null, { timeout: 30000 });
  check("9b When the admin switches AI off mid-chat the assistant disappears and nothing more is recorded (the form is still there)", (await rows("select turns from public.rehab_ai_conversations where patient_id = $1", [dayF.patientId]))[0].turns === 0 && (await pf.getByText("Pain right now").count()) >= 1);

  await browser.close();
  const errorPages = [pn, pa, pb, pc, pd, pad, pe, pf].filter((p) => p.errors.length);
  check("10 No page errors", errorPages.length === 0, errorPages.map((p) => p.errors[0]).join(" | "));
  const failed = results.filter((ok) => !ok).length;
  console.log(`\n${results.length - failed}/${results.length} passed`);
  process.exit(failed ? 1 : 0);
})().catch((error) => { console.error(error); process.exit(1); });
