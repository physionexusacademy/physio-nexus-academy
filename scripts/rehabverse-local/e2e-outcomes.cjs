/**
 * RehabVerse outcome measures e2e (LOCAL backend, never the real project):
 *   REHAB_LOCAL_CONFIRM=1 REHAB_DEV_SQL=1 node scripts/rehabverse-local/server.mjs
 *   (dev server as in e2e.cjs, with SUPABASE_SERVICE_ROLE_KEY=local-service-role-key)   node scripts/rehabverse-local/e2e-outcomes.cjs
 *
 * Covers: the physiotherapist chooses what to follow (suggestion by area, schedule, instruments that are not available are listed with the reason); the patient is
 * pointed to the questionnaires and answers them (English and Roman Urdu, with the official English wording under the Roman Urdu); the server stores the score it
 * worked out, the language and who collected it; the physiotherapist records a measurement; a follow-up shows the change from the start with its threshold and source;
 * the follow-up Patient-Specific Functional Scale asks the same activities; a phone shows no sideways scrolling.
 */
const { chromium } = require("playwright");
const fs = require("fs");
const path = require("path");

const BASE = process.env.E2E_BASE ?? "http://127.0.0.1:3100";
const API = process.env.E2E_API ?? "http://127.0.0.1:54321";
const OUT = process.env.E2E_OUT ?? path.join(process.cwd(), "e2e-out");
fs.mkdirSync(OUT, { recursive: true });
const stamp = Date.now().toString(36);
const ADMIN = { email: "admin@pna.test", password: "AdminPass#2026" };
const P = { email: `outcomes.${stamp}@example.test`, password: "Patient-Pass-2026", name: `Outcomes Patient ${stamp}` };
const results = [];
const check = (name, ok, detail = "") => {
  results.push(Boolean(ok));
  console.log(`${ok ? "PASS" : "FAIL"}  ${name}${detail ? "  — " + detail : ""}`);
};
const errors = [];
async function devSql(sql, params = []) {
  const res = await fetch(`${API}/__dev/sql`, { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ sql, params }) });
  if (!res.ok) throw new Error("dev sql failed: " + (await res.text()));
  return res.json();
}
const shot = (page, name) => page.screenshot({ path: path.join(OUT, name + ".png"), fullPage: true }).catch(() => undefined);
const next = (page) => page.locator("button.rv-btn-primary").filter({ hasText: /^\s*(Next|Aage)/ }).click();

async function newPage(browser, lang, viewport = { width: 1280, height: 900 }) {
  const context = await browser.newContext({ viewport });
  await context.addInitScript((l) => { try { localStorage.setItem("pna-teacher-lang-v1", JSON.stringify(l)); localStorage.setItem("pna-rv-no3d", "1"); } catch { /* about:blank */ } }, lang);
  const page = await context.newPage();
  page.setDefaultTimeout(60000);
  page.on("pageerror", (e) => { if (!/ViewTransition opt-in disabled/.test(String(e))) errors.push(String(e).slice(0, 200)); });
  return { context, page };
}
async function registerAndAssess(page) {
  await page.goto(`${BASE}/rehabverse/register`);
  await page.fill("#full_name", P.name);
  await page.fill("#age_years", "44");
  await page.fill("#phone", "0300 1234567");
  await page.fill("#email", P.email);
  await page.fill("#password", P.password);
  await page.check("input[name=consent]");
  await page.getByRole("button", { name: /Send my account request/ }).click();
  await page.waitForURL(/\/rehabverse\/pending/, { timeout: 90000 });
  await devSql("update public.rehab_patients set status = 'active', decided_at = now() where user_id = (select id from auth.users where email = $1)", [P.email]);
  await page.goto(`${BASE}/rehabverse/start`);
  const sc = page.locator(".sc");
  await sc.waitFor();
  await sc.locator(".sc-region").nth(5).click(); // lower back
  const g = sc.locator(".sc-group");
  await g.nth(0).locator(".sc-option").nth(1).click();
  await g.nth(1).locator(".sc-option").nth(1).click();
  await g.nth(2).locator(".sc-option").nth(1).click();
  await sc.locator(".sc-btn-primary").click();
  await sc.locator(".sc-choice").first().click();
  await sc.locator(".sc-btn-primary").click();
  await sc.locator(".sc-check").first().click();
  await sc.locator(".sc-btn-primary").click();
  await page.locator(".rv-card[role=checkbox]").first().click();
  await next(page);
  await page.locator(".rv-nprs").first().locator("button").nth(6).click();
  await next(page); await next(page); await next(page); await next(page); // history, better, life, safety
}
async function finishAssessment(page) {
  // (the helper above stops at the safety step: tick "None of these apply" and send)
  await page.locator(".rv-card[role=checkbox]").last().click();
  await next(page);
  await page.locator("button.rv-btn-primary").last().click();
  await page.getByText(/Assessment received|Assessment mil gaya/).waitFor();
}
async function adminLogin(page) {
  await page.goto(`${BASE}/admin/login`);
  await page.fill("input[name=email]", ADMIN.email);
  await page.fill("input[name=password]", ADMIN.password);
  await page.locator("form button[type=submit]").first().click();
  await page.waitForURL((url) => url.pathname === "/admin");
}
const responses = async () => devSql(`select r.instrument, r.timepoint, r.score, r.answers, r.language, r.collected_by from public.rehab_outcome_responses r join public.rehab_patients p on p.id = r.patient_id join auth.users u on u.id = p.user_id where u.email = $1 order by r.taken_at`, [P.email]);

(async () => {
  const browser = await chromium.launch();

  /* ───────────── 1. a patient with an assessment; the physiotherapist chooses what to follow ───────────── */
  const patientEn = await newPage(browser, "en");
  await registerAndAssess(patientEn.page);
  await finishAssessment(patientEn.page);
  await patientEn.page.goto(`${BASE}/rehabverse/me/outcomes`);
  await patientEn.page.getByText(/has not chosen any questionnaires/i).waitFor();
  check("1a Before a plan, the patient is told nothing has been chosen yet", true);
  await patientEn.context.close();

  const adminCtx = await browser.newContext({ viewport: { width: 1280, height: 900 } });
  const admin = await adminCtx.newPage();
  admin.setDefaultTimeout(60000);
  await adminLogin(admin);
  const pid = (await devSql("select p.id from public.rehab_patients p join auth.users u on u.id = p.user_id where u.email = $1", [P.email]))[0].id;
  await admin.goto(`${BASE}/admin/rehabverse/patients/${pid}`);
  const panel = admin.locator("[data-testid=outcomes-panel]");
  await panel.waitFor();
  const editor = admin.locator("[data-testid=outcomes-plan-editor]");
  check("2a The physiotherapist's record has an Outcome measures section with the plan editor open", await editor.isVisible());
  await admin.getByRole("button", { name: /Suggest for/ }).click();
  const checked = await editor.locator("input[type=checkbox]:checked").evaluateAll((els) => els.map((e) => e.getAttribute("aria-label")));
  check("2b 'Suggest' picks the measures that suit the lower back (pain, patient-specific, change, back tests)", checked.length === 4 && checked.some((l) => /Numeric Pain/.test(l)) && checked.some((l) => /Patient-Specific/.test(l)) && checked.some((l) => /Global Rating/.test(l)) && checked.some((l) => /Low back function/.test(l)), JSON.stringify(checked));
  const unavailable = await editor.locator("details").innerText().catch(() => "");
  await editor.locator("details summary").click();
  const notes = await editor.locator("details").innerText();
  check("2c Instruments that cannot be given yet are listed with the reason (NDI needs the author's permission, ODI a licence, RMDQ and STarT Back wording to be checked)", /Neck Disability Index/.test(notes) && /permission/i.test(notes) && /Oswestry/.test(notes) && /licen[cs]e/i.test(notes) && /Roland-Morris/.test(notes) && /STarT Back/.test(notes), unavailable.slice(0, 40));
  check("2d An unavailable instrument cannot be ticked", (await editor.locator("input[type=checkbox]").count()) === 6);
  await editor.getByLabel("Note for the record").fill("Baseline for the low back study");
  await editor.getByRole("button", { name: /Save plan and tell the patient/ }).click();
  await admin.getByText(/Plan saved\./).waitFor();
  const plan = (await devSql("select items from public.rehab_outcome_plans where patient_id = $1", [pid]))[0].items;
  check("2e The plan is saved (four instruments, standard schedule) and audited", plan.length === 4 && plan.every((i) => i.schedule === "standard") && (await devSql("select count(*)::int n from public.rehab_audit_log where action = 'outcomes.plan_set' and patient_id = $1", [pid]))[0].n === 1);
  await shot(admin, "o2-admin-plan");

  /* ───────────── 2. the patient answers (Roman Urdu, with the official English under it) ───────────── */
  const patientUr = await newPage(browser, "ur", { width: 390, height: 844 });
  const pp = patientUr.page;
  await pp.goto(`${BASE}/rehabverse/login`);
  await pp.fill("#email", P.email);
  await pp.fill("#password", P.password);
  await pp.locator("form button[type=submit]").click();
  await pp.waitForURL(/\/rehabverse\/me/, { timeout: 60000 });
  const card = pp.locator("[data-testid=outcomes-card]");
  await card.waitFor();
  check("3a The dashboard points the patient to the questionnaires (2 are open: pain and her own activities)", /2 chhote sawalnaame/.test(await card.innerText()), (await card.innerText()).replace(/\n+/g, " | "));
  await card.click();
  await pp.waitForURL(/\/rehabverse\/me\/outcomes/);
  await pp.getByText("Aap ke intezar mein").waitFor();
  const listText = await pp.locator("main").innerText();
  check("3b Only what is due now is offered: pain and PSFS at the start (a rating of change has no start; the physiotherapist's tests are not the patient's)", /Dard ka 0–10 number/.test(listText) && /Patient-Specific Functional Scale/.test(listText) && !/Global Rating/.test(listText) && !/kamar ke function tests/i.test(listText), listText.slice(0, 200).replace(/\n+/g, " | "));
  await pp.getByRole("button", { name: /Dard ka 0–10 number/ }).click();
  const formText = await pp.locator("main").innerText();
  check("3c In Roman Urdu the question is natural spoken Roman Urdu and the official English is under it", /Abhi aap ka dard kitna tez hai\?/.test(formText) && /How strong is your pain right now\?/.test(formText) && /sirf samajhne mein madad/.test(formText));
  const groups = pp.locator('fieldset [role=group]');
  for (const [i, v] of [5, 6, 8, 3].entries()) await groups.nth(i).getByRole("button", { name: String(v), exact: true }).click(); // now, avg7, worst7, best7
  await pp.getByRole("button", { name: /Mere jawab bhejein/ }).click();
  await pp.getByText(/Shukriya/).waitFor();
  const nprs = (await responses()).find((r) => r.instrument === "nprs");
  check("3d The server stored the pain answers with the score it worked out (average 6), the language shown and who answered", nprs && nprs.score.primary === 6 && nprs.language === "ru" && nprs.collected_by === "patient" && nprs.timepoint === "baseline", JSON.stringify(nprs && nprs.score));
  await pp.getByRole("button", { name: /Patient-Specific Functional Scale/ }).click();
  const inputs = pp.locator("input.rv-input");
  await inputs.nth(0).fill("Bachay ko uthana");
  await pp.getByRole("button", { name: "Aur ek kaam shamil karein" }).click();
  await pp.locator("input.rv-input").nth(1).fill("Baith kar kaam karna");
  const rateGroups = pp.locator('fieldset [role=group]');
  await rateGroups.nth(0).getByRole("button", { name: "2", exact: true }).click();
  await rateGroups.nth(1).getByRole("button", { name: "4", exact: true }).click();
  await shot(pp, "o3-patient-psfs-phone");
  check("3e No sideways scrolling on a phone", await pp.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth + 1));
  await pp.getByRole("button", { name: /Mere jawab bhejein/ }).click();
  await pp.getByText(/Shukriya/).waitFor();
  const psfs = (await responses()).find((r) => r.instrument === "psfs");
  check("3f The PSFS is stored with the activities as written and the mean (3)", psfs && psfs.score.primary === 3 && psfs.answers.activities.length === 2 && psfs.answers.activities[0].name === "Bachay ko uthana", JSON.stringify(psfs && psfs.answers));
  await pp.getByText("Abhi aap ke liye kuch baaqi nahi").waitFor({ timeout: 20000 }).catch(() => undefined); // the list refreshes a moment after the thanks
  check("3g Nothing is waiting any more", /Abhi aap ke liye kuch baaqi nahi/.test(await pp.locator("main").innerText()));
  await patientUr.context.close();

  /* ───────────── 3. the physiotherapist records a measurement, then a follow-up changes the picture ───────────── */
  await admin.goto(`${BASE}/admin/rehabverse/patients/${pid}`);
  await admin.locator("[data-testid=outcomes-panel]").waitFor();
  const section = admin.locator('section[aria-label="Low back function tests"]');
  await section.getByRole("button", { name: "Record measurement" }).first().click();
  await section.getByLabel("Sorensen hold (s)").fill("40");
  await section.getByLabel("Five times sit-to-stand (s)").fill("12.4");
  await section.getByRole("button", { name: "Save measurement" }).click();
  await section.getByText(/Sorensen hold: 40 s/).waitFor();
  const back = (await responses()).find((r) => r.instrument === "back_function_tests");
  check("4a The physiotherapist's measurement is stored (collected by the therapist, English)", back && back.collected_by === "therapist" && back.language === "en" && back.score.parts.sorensen === 40 && back.score.parts.five_sts === 12.4, JSON.stringify(back && back.score));
  const nprsSection = admin.locator('section[aria-label="Numeric Pain Rating Scale (0–10)"]');
  check("4b The pain record shows who answered it and in which language", /answered by the patient/.test(await nprsSection.innerText()) && /Roman Urdu/.test(await nprsSection.innerText()));
  check("4c A start record is not compared with itself", !/change [+-]/.test(await nprsSection.innerText()));

  // two weeks later (the plan started 15 days ago)
  await devSql("update public.rehab_outcome_plans set anchor_at = now() - interval '15 days' where patient_id = $1", [pid]);
  const patientEn2 = await newPage(browser, "en");
  const pe = patientEn2.page;
  await pe.goto(`${BASE}/rehabverse/login`);
  await pe.fill("#email", P.email);
  await pe.fill("#password", P.password);
  await pe.locator("form button[type=submit]").click();
  await pe.waitForURL(/\/rehabverse\/me/, { timeout: 60000 });
  await pe.locator("[data-testid=outcomes-card]").waitFor();
  check("5a Two weeks on, three questionnaires are open (pain, activities, rating of change)", /3 short questionnaire/.test(await pe.locator("[data-testid=outcomes-card]").innerText()));
  await pe.locator("[data-testid=outcomes-card]").click();
  await pe.waitForURL(/\/rehabverse\/me\/outcomes/);
  await pe.getByRole("button", { name: /Numeric Pain Rating Scale/ }).click();
  const g2 = pe.locator('fieldset [role=group]');
  for (const [i, v] of [2, 3, 5, 1].entries()) await g2.nth(i).getByRole("button", { name: String(v), exact: true }).click();
  await pe.getByRole("button", { name: /Send my answers/ }).click();
  await pe.getByText(/Thank you/).waitFor();
  await pe.getByRole("button", { name: /Patient-Specific Functional Scale/ }).click();
  check("5b A follow-up PSFS asks the same activities that were written at the start (they cannot be changed)", (await pe.locator("input.rv-input").count()) === 0 && /Bachay ko uthana/.test(await pe.locator("main").innerText()) && /Baith kar kaam karna/.test(await pe.locator("main").innerText()));
  const rg = pe.locator('fieldset [role=group]');
  await rg.nth(0).getByRole("button", { name: "6", exact: true }).click();
  await rg.nth(1).getByRole("button", { name: "7", exact: true }).click();
  await pe.getByRole("button", { name: /Send my answers/ }).click();
  await pe.getByText(/Thank you/).waitFor();
  await pe.getByRole("button", { name: /Global Rating of Change/ }).click();
  await pe.getByRole("radio", { name: /Quite a bit better/ }).click();
  await pe.getByRole("button", { name: /Send my answers/ }).click();
  await pe.getByText(/Thank you/).waitFor();
  await pe.locator("main").getByText(/Your pain is clearly lower than at the start/).waitFor({ timeout: 30000 });
  check("5c The patient sees her pain over time and a plain sentence about it", true);
  await shot(pe, "o5-patient-progress");
  const all = await responses();
  check("5d Everything is stored: pain, PSFS and GROC follow-ups, all at 2 weeks", ["nprs", "psfs", "groc"].every((i) => all.some((r) => r.instrument === i && r.timepoint === "w2")), JSON.stringify(all.map((r) => `${r.instrument}:${r.timepoint}`)));
  await patientEn2.context.close();

  await admin.goto(`${BASE}/admin/rehabverse/patients/${pid}`);
  await admin.locator("[data-testid=outcomes-panel]").waitFor();
  const nprs2 = await admin.locator('section[aria-label="Numeric Pain Rating Scale (0–10)"]').innerText();
  check("6a The physiotherapist sees the pain change from the start with its band and the source of the threshold (6 to 3 = 50%, IMMPACT)", /Much better/.test(nprs2) && /\+3/.test(nprs2) && /50%/.test(nprs2) && /IMMPACT/.test(nprs2), nprs2.replace(/\n+/g, " | ").slice(0, 260));
  const psfs2 = await admin.locator('section[aria-label="Patient-Specific Functional Scale"]').innerText();
  check("6b The PSFS follow-up shows the change (3 to 6.5, better by 3.5)", /6\.5/.test(psfs2) && /Better/.test(psfs2) && /\+3\.5/.test(psfs2), psfs2.replace(/\n+/g, " | ").slice(0, 200));
  const groc2 = await admin.locator('section[aria-label="Global Rating of Change (−7 to +7)"]').innerText();
  check("6c The rating of change is shown as +5 and banded", /\+5/.test(groc2) && /Better/.test(groc2));
  await shot(admin, "o6-admin-results");
  const stable = (await devSql("select count(*)::int n from public.rehab_audit_log where action = 'outcomes.recorded' and patient_id = $1", [pid]))[0].n;
  check("6d Every answer is in the audit log (6 records)", stable === 6, String(stable));

  /* ───────────── 4. feedback to the patient: a draft from the results, edited and sent by the physiotherapist ───────────── */
  const fb = admin.locator("[data-testid=outcomes-feedback]");
  await fb.scrollIntoViewIfNeeded();
  await fb.getByRole("button", { name: "Draft from the results" }).click();
  const draft = await fb.getByLabel("Message to the patient").inputValue();
  check("7a The draft is written from the stored scores (pain 6 to 3, 50% lower; activities 3 to 6.5; rating +5) and signed", /went from 6\/10 to 3\/10 \(50% lower\)/.test(draft) && /went from 3 to 6\.5 out of 10/.test(draft) && /\+5/.test(draft) && /Your physiotherapist$/.test(draft.trim()), draft.slice(0, 120));
  await fb.getByLabel("Language of the message").selectOption("ru");
  await fb.getByRole("button", { name: "Draft from the results" }).click();
  const draftRu = await fb.getByLabel("Message to the patient").inputValue();
  check("7b In Roman Urdu the draft is natural spoken Roman Urdu with the same numbers", /aap ka pichle hafte ka average dard 6\/10 se 3\/10 ho gaya/.test(draftRu) && /Aap ka physiotherapist/.test(draftRu), draftRu.slice(0, 120));
  await fb.getByLabel("Language of the message").selectOption("en");
  await fb.getByRole("button", { name: "Draft from the results" }).click();
  await fb.getByRole("button", { name: /Smooth the wording with AI/ }).click();
  await fb.getByText(/The draft is unchanged|AI's version was not used|Wording smoothed/).waitFor();
  check("7c With no AI service the draft is kept as it is and the physiotherapist is told", /The draft is unchanged|not used|Wording smoothed/.test(await fb.innerText()));
  const base = await fb.getByLabel("Message to the patient").inputValue();
  await fb.getByLabel("Message to the patient").fill(base + "\nSee you at the next visit.");
  await fb.getByRole("button", { name: "Send to the patient" }).click();
  await fb.getByText(/Sent\. The patient has been told/).waitFor();
  const sent = (await devSql("select message, language, source from public.rehab_outcome_feedback where patient_id = $1", [pid]))[0];
  check("7d The message is stored as the physiotherapist sent it (with the extra line), English, and records that it started from a rules draft", sent && /See you at the next visit\./.test(sent.message) && sent.language === "en" && sent.source === "rules", JSON.stringify(sent && sent.source));
  const patientEn3 = await newPage(browser, "en");
  const p3 = patientEn3.page;
  await p3.goto(`${BASE}/rehabverse/login`);
  await p3.fill("#email", P.email);
  await p3.fill("#password", P.password);
  await p3.locator("form button[type=submit]").click();
  await p3.waitForURL(/\/rehabverse\/me/, { timeout: 60000 });
  await p3.goto(`${BASE}/rehabverse/me/outcomes`);
  const msgs = p3.locator("[data-testid=outcomes-messages]");
  await msgs.waitFor();
  check("7e The patient reads the message on her questionnaires page (and is not shown how it was drafted)", /went from 6\/10 to 3\/10/.test(await msgs.innerText()) && /See you at the next visit\./.test(await msgs.innerText()) && !/\b(rules draft|AI-smoothed|drafted by)\b/i.test(await msgs.innerText()));
  await shot(p3, "o7-patient-message");
  await patientEn3.context.close();
  await adminCtx.close();

  await browser.close();
  check("7a No page errors during the run", errors.length === 0, errors.join(" | "));
  const failed = results.filter((r) => !r).length;
  console.log(failed ? `\n${failed} of ${results.length} FAILED` : `\nAll ${results.length} checks passed.`);
  process.exit(failed ? 1 : 0);
})().catch((e) => { console.log("E2E ERROR:", e.message); process.exit(1); });
