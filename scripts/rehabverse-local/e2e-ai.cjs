/**
 * RehabVerse AI-assistant end-to-end test against the LOCAL backend (never the real project). There is no Cloudflare AI locally, so the
 * conversation runs on the scripted fallback: this proves the plumbing (switch, notice, chat, safety stop, hand-over to the questionnaire,
 * submission, stored transcript, admin view). The model itself is judged with /api/rehabverse/ai/selftest on the live site.
 *
 *   1) REHAB_DEV_SQL=1 node scripts/rehabverse-local/server.mjs
 *   2) NEXT_PUBLIC_SUPABASE_URL=http://127.0.0.1:54321 NEXT_PUBLIC_SUPABASE_ANON_KEY=local-anon-key SUPABASE_SERVICE_ROLE_KEY=local-service-role-key \
 *      NEXT_PUBLIC_SITE_URL=http://127.0.0.1:3100 PNA_SKIP_CF_DEV=1 npx next dev -p 3100
 *   3) node scripts/rehabverse-local/e2e-ai.cjs
 */
const { chromium } = require("playwright");
const fs = require("fs");
const path = require("path");

const BASE = process.env.E2E_BASE ?? "http://127.0.0.1:3100";
const API = process.env.E2E_API ?? "http://127.0.0.1:54321";
const OUT = process.env.E2E_OUT ?? path.join(process.cwd(), "e2e-out-ai");
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
  const ctx = await browser.newContext({ viewport: { width: 1100, height: 900 } });
  await ctx.addInitScript(() => { try { localStorage.setItem("pna-teacher-lang-v1", JSON.stringify("en")); } catch {} });
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
  await page.fill("#phone", "0300 1234567");
  await page.fill("#email", who.email);
  await page.fill("#password", who.password);
  await page.check("input[name=consent]");
  await page.getByRole("button", { name: "Send my account request" }).click();
  await page.waitForURL(/\/rehabverse\/pending/, { timeout: 90000 });
  // the clinic approves the request (a new account waits for it): done in the local database
  await devSql("update public.rehab_patients set status = 'active', decided_at = now() where user_id = (select id from auth.users where email = $1)", [who.email]);
  await page.goto(`${BASE}/rehabverse/start`);
  await page.waitForURL(/\/rehabverse\/start/, { timeout: 90000 });
}
const aiOn = (who) => devSql("update public.rehab_patients set ai_assist = 'on' where user_id = (select id from auth.users where email = $1)", [who.email]);
async function say(page, text) {
  const before = await page.locator('[role="log"] p').count();
  await page.getByLabel("Your message").fill(text);
  await page.getByRole("button", { name: "Send" }).click();
  await page.waitForFunction((n) => document.querySelectorAll('[role="log"] p').length >= n + 2, before, { timeout: 60000 });
  await page.waitForFunction(() => !document.querySelector('[aria-label="The assistant is typing"]'), null, { timeout: 60000 });
}

(async () => {
  const browser = await chromium.launch({ args: GL });

  /* 1. A patient whose switch is off sees the normal form and no mention of AI. */
  const n = person("none"); const pn = await newPage(browser);
  await register(pn, n);
  await pn.getByText("Where is your main problem?").waitFor({ timeout: 60000 });
  check("1a Without the switch the patient gets the normal form", (await pn.getByText("Before we start").count()) === 0);
  await pn.goto(`${BASE}/rehabverse/me`);
  await pn.waitForLoadState("networkidle");
  check("1b ...and the dashboard says nothing about AI", (await pn.getByText("Your AI assistant").count()) === 0);

  /* 2. A patient with the switch on: notice, then a conversation. */
  const a = person("alice"); const pa = await newPage(browser);
  await register(pa, a);
  await aiOn(a);
  await pa.goto(`${BASE}/rehabverse/start`);
  await pa.getByText("Before we start").waitFor({ timeout: 60000 });
  check("2a With the switch on the patient first sees the AI notice", await pa.getByText("I am an AI assistant, not a doctor or a physiotherapist").isVisible());
  check("2b The notice gives the emergency number and offers the normal form", (await pa.getByText(/1122/).count()) > 0 && (await pa.getByRole("button", { name: /Use the normal form instead/ }).count()) === 1);
  await pa.screenshot({ path: path.join(OUT, "01-notice.png") });
  await pa.goto(`${BASE}/rehabverse/start`);
  await pa.getByRole("button", { name: /I understand, let's talk/ }).click();
  await pa.getByRole("log").waitFor({ timeout: 60000 });
  check("2d The conversation opens with the assistant's greeting, which says it is an AI", await pa.getByText(/I'm the RehabVerse assistant/).isVisible() && /I'm an AI/.test(await pa.getByRole("log").innerText()));
  const script = [
    "My lower back hurts", "7", "about 3 weeks", "it started suddenly after lifting a box", "lifting a heavy box", "sitting and bending forward",
    "walking helps a little", "a bit of tingling in my right leg", "it is hard to lift my child", "no", "no", "none", "I want to get back to playing with my children",
  ];
  for (const line of script) await say(pa, line);
  await pa.getByRole("button", { name: /Check what I noted/ }).waitFor({ timeout: 30000 });
  check("2e Every question was asked and the conversation finished by itself", true);
  await pa.screenshot({ path: path.join(OUT, "02-chat-finished.png") });
  await pa.getByRole("button", { name: /Check what I noted/ }).click();
  await pa.getByText("Here is what I noted").waitFor();
  const summary = await pa.locator("dl").innerText();
  check("2f The patient is shown what was noted, in plain rows", /Lower back/i.test(summary) && /7\/10/.test(summary) && /sitting and bending/i.test(summary) && /children/i.test(summary));
  await pa.screenshot({ path: path.join(OUT, "03-summary.png") });
  await pa.getByRole("button", { name: /Looks right, continue/ }).click();
  await pa.getByText("Filled in from our conversation").or(pa.getByText("This is the last important step")).first().waitFor();
  check("2g The normal questionnaire takes over at the safety step", await pa.getByText("None of these apply to me").isVisible());
  await pa.getByRole("checkbox", { name: "None of these apply to me" }).click();
  await pa.locator("button.rv-btn-primary").filter({ hasText: /^\s*Next/ }).click();
  check("2h The last step keeps what the patient said in their own words", /children/i.test(await pa.locator("#own").inputValue()));
  // the patient adds a sentence the chat did not have: the clinician's brief must show it as a change after the chat
  await pa.locator("#own").fill((await pa.locator("#own").inputValue()) + " I also take tablets for high blood pressure.");
  await pa.getByRole("button", { name: /Send to my physiotherapist/ }).click();
  await pa.getByText("Thank you — your physiotherapist will review it.").waitFor({ timeout: 60000 });
  check("2i The assessment was submitted by the patient after checking it", true);
  await pa.goto(`${BASE}/rehabverse/me`);
  await pa.getByText("Your assessment is being reviewed").waitFor({ timeout: 60000 });
  check("2c The dashboard tells an enabled patient about the assistant (read-only, no buttons)", (await pa.getByText("Your AI assistant").count()) === 1 && (await pa.locator('[data-pna-ai-card] button').count()) === 0);

  const conv = (await rows("select c.status, c.turns, c.fallback_turns, c.assessment_id, jsonb_array_length(c.messages)::int as n, c.models from public.rehab_ai_conversations c join public.rehab_patients p on p.id = c.patient_id join auth.users u on u.id = p.user_id where u.email = $1", [a.email]))[0];
  check("2j The conversation is stored, completed and linked to the assessment", conv && conv.status === "completed" && conv.assessment_id && conv.turns === script.length && conv.n === 1 + 2 * script.length, JSON.stringify(conv));
  const assessment = (await rows("select regions, pain_now, duration, aggravating, functional_limitations, medications from public.rehab_assessments a join public.rehab_patients p on p.id = a.patient_id join auth.users u on u.id = p.user_id where u.email = $1", [a.email]))[0];
  check("2k The assessment holds what the conversation collected", assessment && assessment.regions.includes("lumbar") && assessment.pain_now === 7 && assessment.duration === "1_4w" && /sitting/i.test(assessment.aggravating) && /child/i.test(assessment.functional_limitations), JSON.stringify(assessment));
  check("2l No page errors", pa.errors.length === 0, pa.errors.slice(0, 2).join(" | "));

  /* 3. An emergency stops the conversation and pre-ticks the matching safety question. */
  const b = person("bella"); const pb = await newPage(browser);
  await register(pb, b);
  await aiOn(b);
  await pb.goto(`${BASE}/rehabverse/start`);
  await pb.getByRole("button", { name: /I understand, let's talk/ }).click();
  await pb.getByRole("log").waitFor({ timeout: 60000 });
  await say(pb, "I have chest pain and I can't breathe properly");
  check("3a An emergency message gets the urgent-help text, not an interview", /1122|emergency|urgent/i.test(await pb.getByRole("log").innerText()) && (await pb.getByText("Please get help first").count()) === 1);
  check("3b The chat is closed for typing after an emergency", (await pb.getByLabel("Your message").count()) === 0);
  await pb.screenshot({ path: path.join(OUT, "04-safety.png") });
  await pb.getByRole("button", { name: "Continue" }).click();
  await pb.getByText("Please answer the safety questions").waitFor();
  check("3c The matching red-flag question is already ticked for the patient to confirm", await pb.getByRole("checkbox", { name: /Chest pain/ }).getAttribute("aria-checked") === "true");
  const sc = (await rows("select c.status, c.safety_alert, c.fallback_turns from public.rehab_ai_conversations c join public.rehab_patients p on p.id = c.patient_id join auth.users u on u.id = p.user_id where u.email = $1", [b.email]))[0];
  check("3d The safety stop is recorded with its alert", sc && sc.status === "safety_stop" && /cardiac|breathing/.test(sc.safety_alert), JSON.stringify(sc));

  /* 4. Leaving for the normal form is always possible. */
  const c = person("carol"); const pc = await newPage(browser);
  await register(pc, c);
  await aiOn(c);
  await pc.goto(`${BASE}/rehabverse/start`);
  await pc.getByRole("button", { name: /Use the normal form instead/ }).click();
  await pc.getByText("Where is your main problem?").waitFor();
  check("4a 'Use the normal form instead' works and starts no conversation", (await rows("select 1 from public.rehab_ai_conversations c join public.rehab_patients p on p.id = c.patient_id join auth.users u on u.id = p.user_id where u.email = $1", [c.email])).length === 0);

  /* 5. Switching AI off stops a conversation at once, and the patient falls back to the form. */
  const d = person("dara"); const pd = await newPage(browser);
  await register(pd, d);
  await aiOn(d);
  await pd.goto(`${BASE}/rehabverse/start`);
  await pd.getByRole("button", { name: /I understand, let's talk/ }).click();
  await pd.getByRole("log").waitFor({ timeout: 60000 });
  await say(pd, "My knee hurts");
  await pd.getByLabel("Your message").waitFor({ state: "visible" });
  await devSql("update public.rehab_patients set ai_assist = 'off' where user_id = (select id from auth.users where email = $1)", [d.email]);
  await pd.getByLabel("Your message").fill("7");
  await pd.getByRole("button", { name: "Send" }).click();
  await pd.getByText(/Where is (the|your main) problem\?/).waitFor({ timeout: 60000 }); // the plain list when the conversation already named an area, the pictures when it had not
  check("5a When the admin turns AI off mid-conversation the patient lands on the normal form", true);
  check("5b ...and no further AI turn was recorded", (await rows("select c.turns from public.rehab_ai_conversations c join public.rehab_patients p on p.id = c.patient_id join auth.users u on u.id = p.user_id where u.email = $1", [d.email]))[0].turns === 1);

  /* 6. The admin reads the conversation on the patient's record. */
  const pad = await newPage(browser);
  await pad.goto(`${BASE}/admin/login`);
  await pad.fill("input[name=email]", ADMIN.email);
  await pad.fill("input[name=password]", ADMIN.password);
  await pad.locator("form button[type=submit]").first().click();
  await pad.waitForURL((url) => url.pathname === "/admin", { timeout: 90000 });
  const pid = (await rows("select p.id from public.rehab_patients p join auth.users u on u.id = p.user_id where u.email = $1", [a.email]))[0].id;
  await pad.goto(`${BASE}/admin/rehabverse/patients/${pid}`);
  await pad.getByText("AI conversations").first().waitFor({ timeout: 60000 });
  const transcript = await pad.locator("#ai").innerText();
  check("6a The admin sees the AI conversation on the patient's record, word for word", /My lower back hurts/.test(transcript) && /RehabVerse assistant/.test(transcript) && /children/.test(transcript));
  check("6b ...with the turns, the models used and the linked assessment", /13 turns/.test(transcript) && /produced the assessment above/.test(transcript));
  await pad.screenshot({ path: path.join(OUT, "05-admin-transcript.png"), fullPage: true });

  /* 7. The history brief the treating physiotherapist reads first. */
  const brief = await pad.locator("#brief").innerText();
  check("7a The record opens with a History brief section and a link to it", (await pad.locator('nav a[href="#brief"]').count()) === 1 && /History brief/.test(brief));
  check("7b The headline and the story are built from the patient's answers", /lower back/i.test(brief) && /pain 7\/10/.test(brief) && /Pain is 7\/10 now/i.test(brief) && /“sitting and bending forward”/.test(brief));
  check("7c It says the history came from the AI chat and was submitted by the patient", /Collected in a conversation with the AI assistant \(13 turns, 13 scripted\)/.test(brief) && /checked and submitted by the patient/.test(brief));
  check("7d It lists what the patient changed after the chat", /Changed by the patient after the chat/i.test(brief) && /Own words/i.test(brief) && /high blood pressure/i.test(brief));
  check("7e It points out what was mentioned (high blood pressure) and what to ask next", /Mentioned in the history:.*High blood pressure/is.test(brief) && /Worth asking at the first visit/i.test(brief) && /tingling/i.test(brief));
  check("7f It states the red-flag screening result and says it is not a diagnosis", /Red-flag screening: nothing ticked/i.test(brief) && /not a diagnosis/i.test(brief));
  await pad.context().grantPermissions(["clipboard-read", "clipboard-write"], { origin: BASE }).catch(() => {});
  await pad.locator("#brief").getByRole("button", { name: /Copy as text/ }).click();
  await pad.locator("#brief").getByText("Copied").waitFor({ timeout: 10000 });
  const copied = await pad.evaluate(() => navigator.clipboard.readText()).catch(() => "");
  check("7g 'Copy as text' puts the brief on the clipboard for the clinical notes", /^HISTORY BRIEF · /.test(copied) && /STORY/.test(copied) && /not written by AI/.test(copied), copied.slice(0, 80));
  await pad.locator("#brief").screenshot({ path: path.join(OUT, "06-admin-brief.png") });

  await browser.close();
  const failed = results.filter((ok) => !ok).length;
  console.log(`\n${results.length - failed}/${results.length} passed`);
  process.exit(failed ? 1 : 0);
})().catch((error) => { console.error(error); process.exit(1); });
