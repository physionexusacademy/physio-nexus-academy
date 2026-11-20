/**
 * RehabVerse AI pilot and sign-off end-to-end test against the LOCAL backend (never the real project): the pilot limit on the AI switch, the pilot
 * dashboard numbers, the review pack, the sign-off record, "open to all" only after an approved sign-off for the CURRENT version, and who can see it.
 *
 *   1) REHAB_DEV_SQL=1 node scripts/rehabverse-local/server.mjs
 *   2) NEXT_PUBLIC_SUPABASE_URL=http://127.0.0.1:54321 NEXT_PUBLIC_SUPABASE_ANON_KEY=local-anon-key SUPABASE_SERVICE_ROLE_KEY=local-service-role-key \
 *      NEXT_PUBLIC_SITE_URL=http://127.0.0.1:3100 PNA_SKIP_CF_DEV=1 npx next dev -p 3100
 *   3) node scripts/rehabverse-local/e2e-pilot.cjs
 */
const { chromium } = require("playwright");
const fs = require("fs");
const path = require("path");

const BASE = process.env.E2E_BASE ?? "http://127.0.0.1:3100";
const API = process.env.E2E_API ?? "http://127.0.0.1:54321";
const OUT = process.env.E2E_OUT ?? path.join(process.cwd(), "e2e-out-pilot");
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
const patientId = async (who) => (await rows("select id from public.rehab_patients where user_id = (select id from auth.users where email = $1)", [who.email]))[0].id;
const wait = (ms) => new Promise((r) => setTimeout(r, ms));

(async () => {
  const browser = await chromium.launch({ args: GL });

  /* 0. Clean slate: nobody has AI on, the default limit, no sign-offs (the sign-off table refuses edits, so its guard is lifted for this test setup only). */
  await devSql("update public.rehab_patients set ai_assist = 'off'");
  await devSql("alter table public.rehab_ai_signoffs disable trigger rehab_ai_signoffs_no_change");
  await devSql("delete from public.rehab_ai_signoffs");
  await devSql("alter table public.rehab_ai_signoffs enable trigger rehab_ai_signoffs_no_change");
  await devSql("update public.rehab_ai_pilot set max_patients = 5, open_to_all = false");

  const a = person("alice"), b = person("bella"), c = person("carol");
  const pa = await newPage(browser); await register(pa, a);
  const pb = await newPage(browser); await register(pb, b);
  const pc = await newPage(browser); await register(pc, c);
  const [ida, idb, idc] = [await patientId(a), await patientId(b), await patientId(c)];

  /* 1. Who can see the pilot pages. */
  const anon = await fetch(`${BASE}/admin/rehabverse/ai-pilot`, { redirect: "manual" });
  check("1a Anonymous visitors cannot open the AI pilot page (redirected to sign in)", anon.status >= 300 && anon.status < 400, `HTTP ${anon.status}`);
  await pa.goto(`${BASE}/admin/rehabverse/ai-pilot`);
  check("1b A patient who opens it sees no pilot data", (await pa.locator("[data-ai-pilot-page]").count()) === 0, pa.url());

  const pad = await newPage(browser);
  await pad.goto(`${BASE}/admin/login`);
  await pad.fill("input[name=email]", ADMIN.email);
  await pad.fill("input[name=password]", ADMIN.password);
  await pad.locator("form button[type=submit]").first().click();
  await pad.waitForURL((url) => url.pathname === "/admin", { timeout: 90000 });

  /* 2. The pilot page: status, limit, no sign-off yet. */
  await pad.goto(`${BASE}/admin/rehabverse/ai-pilot`);
  await pad.locator("[data-ai-pilot-page]").waitFor({ timeout: 90000 });
  check("2a The pilot page says 0 patients have AI on, limit 5", /Pilot:\s*0 patients have AI on \(limit 5\)/.test(await pad.locator("[data-pilot-status]").innerText()));
  check("2b With no sign-off it says so, and 'Open to all patients' is disabled", /No sign-off yet/.test(await pad.locator("[data-pilot-signoff]").innerText()) && (await pad.getByRole("button", { name: "Open to all patients" }).isDisabled()));
  // no limit (the default for research): tick the box, save, and the page says so; then back to a limit of 1 for the rest of the test
  await pad.locator("[data-pilot-nolimit]").check();
  await pad.getByRole("button", { name: "Save", exact: true }).click();
  await pad.getByText("Saved.").waitFor({ timeout: 30000 });
  await pad.reload();
  await pad.locator("[data-pilot-status]").waitFor();
  check("2c 'No limit on patients' removes the limit (the page says no limit, and the saved value is 100000)", /\(no limit\)/.test(await pad.locator("[data-pilot-status]").innerText()) && (await rows("select max_patients from public.rehab_ai_pilot"))[0].max_patients === 100000);
  await pad.locator("[data-pilot-nolimit]").uncheck();
  await pad.getByLabel("Pilot limit").fill("1");
  await pad.getByRole("button", { name: "Save", exact: true }).click();
  await pad.getByText("Saved.").waitFor({ timeout: 30000 });
  await pad.reload();
  await pad.locator("[data-pilot-status]").waitFor();
  check("2d A limit can still be set (the page now says limit 1)", /Pilot:\s*0 patients have AI on \(limit 1\)/.test(await pad.locator("[data-pilot-status]").innerText()));

  /* 3. The limit on the AI switch. */
  await pad.goto(`${BASE}/admin/rehabverse/patients/${ida}`);
  await pad.getByRole("switch", { name: "Turn AI on" }).click();
  await pad.getByRole("switch", { name: "Turn AI off" }).waitFor({ timeout: 30000 });
  check("3a The first patient can be switched on", (await rows("select ai_assist from public.rehab_patients where id = $1", [ida]))[0].ai_assist === "on");
  await pad.goto(`${BASE}/admin/rehabverse/patients/${idb}`);
  await pad.getByRole("switch", { name: "Turn AI on" }).click();
  await pad.getByText("Pilot limit reached").waitFor({ timeout: 30000 });
  check("3b The second patient is refused, with a clear message, and stays off", (await rows("select ai_assist from public.rehab_patients where id = $1", [idb]))[0].ai_assist === "off");

  /* 4. Usage numbers on the dashboard (seeded: a check-in chat the patient changed on the form, with scripted replies and a safety alert). */
  const [asm] = await rows("insert into public.rehab_assessments (patient_id, status, regions, symptoms, pain_now) values ($1, 'programme_created', '{hip}', '{pain}', 4) returning id", [ida]);
  const [prog] = await rows("insert into public.rehab_programmes (patient_id, assessment_id, title, status, approved_at, errp_schedule) values ($1, $2, 'Hip programme', 'active', now(), '{24h}') returning id", [ida, asm.id]);
  const [ses] = await rows("insert into public.rehab_sessions (programme_id, day_number, title, status, released_at, release_mode) values ($1, 1, 'Day 1: hips', 'awaiting_review', now(), 'first_day') returning id", [prog.id]);
  await devSql("insert into public.rehab_errp_observations (patient_id, session_id, timepoint, pain, symptom_response, new_symptoms, flag_ids) values ($1, $2, '24h', 4, 'better', false, '{}')", [ida, ses.id]);
  const draft = { session_id: ses.id, timepoint: "24h", day_number: 1, answers: { pain: 3, symptom_response: "better", new_symptoms: false, signs: "no", flags: [], done: true } };
  await devSql("insert into public.rehab_ai_conversations (patient_id, kind, language, status, consent_version, messages, draft, models, turns, fallback_turns) values ($1, 'feedback', 'en', 'completed', 'ai-v1', '[]', $2::jsonb, '{@cf/meta/llama-3.3-70b-instruct-fp8-fast}', 6, 3)", [ida, JSON.stringify(draft)]);
  await devSql("insert into public.rehab_notifications (audience, patient_id, kind, severity, title, body) values ('admin', $1, 'ai_checkin_safety', 'urgent', 'Check-in assistant: test', 'test')", [ida]);
  await pad.goto(`${BASE}/admin/rehabverse/ai-pilot`);
  await pad.locator("[data-pilot-usage]").waitFor({ timeout: 60000 });
  const usage = await pad.locator("[data-pilot-usage]").innerText();
  check("4a The usage table shows the check-in assistant: 1 chat, 6 turns, 3 scripted (50%)", /Check-in assistant\s+1\s+1\s+6\s+3 \(50%\)/.test(usage.replace(/\s+/g, " ")), usage.replace(/\s+/g, " ").slice(0, 160));
  check("4b Half the replies being scripted raises a visible warning", (await pad.getByText("Half or more of the replies were scripted").count()) === 1);
  check("4c The page counts the urgent warning sign told to the physiotherapist", /1\s*warning signs reported/.test((await pad.locator("[data-pilot-routed]").innerText()).replace(/\s+/g, " ")));
  const pageText = (await pad.locator("[data-ai-pilot-page]").innerText()).replace(/\s+/g, " ");
  check("4d It shows that the patient changed the check-in on the form after the chat (1 of 1)", /of 1 saved check-in that used the chat, 1 was changed by the patient on the form \(100%\)/.test(pageText), pageText.slice(pageText.indexOf("Check-in chat"), pageText.indexOf("Check-in chat") + 150));
  check("4e The model used is listed, and the patient with AI on is listed with a link to the record", /llama-3\.3-70b/.test(pageText) && (await pad.locator(`[data-pilot-patients] a[href*="${ida}"]`).count()) === 1);
  await pad.screenshot({ path: path.join(OUT, "01-pilot-dashboard.png"), fullPage: true });

  /* 5. The review pack. */
  await pad.getByRole("link", { name: /Review pack and sign-off/ }).click();
  await pad.locator("[data-ai-review-page]").waitFor({ timeout: 90000 });
  const version = await pad.locator("[data-ai-review-page]").getAttribute("data-pack-version");
  check("5a The review pack opens with a 12-character version and a sign-off form", /^[0-9a-f]{12}$/.test(version ?? "") && (await pad.locator("[data-ai-signoff-form]").count()) === 1, version);
  check("5b All six parts of the pack are there", (await pad.locator("[data-review-part]").count()) === 6);
  const noticeText = await pad.locator('[data-review-part="notices"]').innerText();
  check("5c The notices part shows what patients are told, including the research sentence to check against the ethics approval", /I am an AI assistant, not a doctor or a physiotherapist/.test(noticeText) && /without your name, to study how AI can help in physiotherapy/.test(noticeText) && /1122/.test(noticeText));
  await pad.locator('[data-review-part="safety"] summary').click();
  const probes = (await pad.locator("[data-review-probes]").innerText()).replace(/\s+/g, " ");
  check("5d The safety table shows the sample sentences, with bladder control stopping every assistant and 'no chest pain' stopping none", /I lost control of my bladder STOPS: cauda-equina \(emergency\) STOPS: cauda-equina \(emergency\) STOPS: cauda-equina \(emergency\)/.test(probes) && /no chest pain, no dizziness, no numbness carries on carries on carries on/.test(probes), probes.slice(0, 200));
  await pad.locator('[data-review-part="conversations"] summary').click();
  const convs = await pad.locator('[data-review-part="conversations"]').innerText();
  check("5e The sample conversations show each assistant, in both languages", /Intake assistant: English, scripted path/.test(convs) && /Exercise coach: Everyday questions, Roman Urdu/.test(convs) && /Check-in assistant: A warning sign \(swollen calf\)/.test(convs));
  await pad.locator('[data-review-part="prompts"] summary').click();
  const prompts = await pad.locator('[data-review-part="prompts"]').innerText();
  check("5f The exact instructions sent to the model are shown for each assistant", /You are the RehabVerse Assistant/.test(prompts) && /exercise coach/i.test(prompts) && /check-in assistant/i.test(prompts));
  await pad.screenshot({ path: path.join(OUT, "02-review-pack.png"), fullPage: false });

  /* 6. Sign-off. */
  await pad.getByLabel("Reviewer name").fill("Dr Sajjad (test)");
  await pad.getByRole("textbox", { name: "Notes" }).fill("Reviewed in the test run.");
  await pad.getByRole("button", { name: "Record sign-off" }).click();
  await pad.getByText(`Recorded for version ${version}.`).waitFor({ timeout: 30000 });
  const [so] = await rows("select reviewer_name, decision, pack_version, notes from public.rehab_ai_signoffs order by created_at desc limit 1");
  check("6a The sign-off is stored with the reviewer, the decision, the notes and the version that was read", so.reviewer_name === "Dr Sajjad (test)" && so.decision === "approved" && so.pack_version === version && so.notes === "Reviewed in the test run.", JSON.stringify(so));
  let refused = false;
  try { await devSql("update public.rehab_ai_signoffs set notes = 'edited'"); } catch { refused = true; }
  check("6b A stored sign-off cannot be edited", refused);

  /* 7. Open to all only for an approved, current sign-off. */
  await pad.goto(`${BASE}/admin/rehabverse/ai-pilot`);
  await pad.locator("[data-pilot-signoff]").waitFor();
  check("7a The page says the approved sign-off covers the wording that is live now, and 'Open to all patients' is enabled", /Approved by Dr Sajjad \(test\)/.test((await pad.locator("[data-pilot-signoff]").innerText())) && /covers the wording that is live now/.test(await pad.locator("[data-pilot-signoff]").innerText()) && (await pad.getByRole("button", { name: "Open to all patients" }).isEnabled()));
  await devSql("insert into public.rehab_ai_signoffs (reviewer_name, decision, pack_version) values ('Dr Earlier', 'approved', 'oldversion123')");
  await pad.reload();
  await pad.locator("[data-pilot-signoff]").waitFor();
  const stale = await pad.locator("[data-pilot-signoff]").innerText();
  check("7b If the latest sign-off is for an older version the page says the wording changed and 'Open to all patients' is disabled again", /wording changed after this review/.test(stale) && (await pad.getByRole("button", { name: "Open to all patients" }).isDisabled()), stale.slice(0, 160));
  await devSql("alter table public.rehab_ai_signoffs disable trigger rehab_ai_signoffs_no_change");
  await devSql("delete from public.rehab_ai_signoffs where pack_version = 'oldversion123'");
  await devSql("alter table public.rehab_ai_signoffs enable trigger rehab_ai_signoffs_no_change");
  await pad.reload();
  await pad.getByRole("button", { name: "Open to all patients" }).click();
  await pad.getByText("AI is now open to all patients").waitFor({ timeout: 30000 });
  await pad.reload();
  await pad.locator("[data-pilot-status]").waitFor();
  check("7c Opening to all works with the current approved sign-off, and the status says so", /open to all patients/.test(await pad.locator("[data-pilot-status]").innerText()));
  await pad.goto(`${BASE}/admin/rehabverse/patients/${idb}`);
  await pad.getByRole("switch", { name: "Turn AI on" }).click();
  await pad.getByRole("switch", { name: "Turn AI off" }).waitFor({ timeout: 30000 });
  check("7d ...and then the previously refused patient can be switched on (the limit no longer applies)", (await rows("select ai_assist from public.rehab_patients where id = $1", [idb]))[0].ai_assist === "on");

  /* 8. The patients' own pages are untouched by all this: a patient with AI off sees no AI feature. */
  await pc.goto(`${BASE}/rehabverse/start`);
  await pc.waitForLoadState("domcontentloaded");
  await wait(1500);
  check("8a A patient whose AI is off still gets the normal form and no AI notice", (await pc.locator("text=Before we start").count()) === 0);

  await browser.close();
  const errorPages = [pa, pb, pc, pad].filter((p) => p.errors.length);
  check("9 No page errors", errorPages.length === 0, errorPages.map((p) => p.errors[0]).join(" | "));
  const failed = results.filter((ok) => !ok).length;
  console.log(`\n${results.length - failed}/${results.length} passed`);
  process.exit(failed ? 1 : 0);
})().catch((error) => { console.error(error); process.exit(1); });
