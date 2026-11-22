/**
 * RehabVerse screening e2e (LOCAL backend, never the real project):
 *   REHAB_LOCAL_CONFIRM=1 REHAB_DEV_SQL=1 node scripts/rehabverse-local/server.mjs
 *   (dev server as in e2e.cjs, with SUPABASE_SERVICE_ROLE_KEY=local-service-role-key)   node scripts/rehabverse-local/e2e-screening.cjs
 *
 * Covers: the assessment asks the same picture questions as the public symptom checker (English and Roman Urdu); the server stores a snapshot
 * (answers, engine version, patterns, study arm); the patient sees what their answers point to, highlighted and framed as a screening; the study
 * setting ("after review") hides it until the physiotherapist has reviewed it and exposure is logged only when it is shown; a knee injury that trips the
 * fracture screen shows the care note instead of a headline pattern; a safety warning never shows patterns; the physiotherapist's record shows the snapshot.
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
const mk = (tag) => ({ email: `${tag}.${stamp}@example.test`, password: "Patient-Pass-2026", name: `${tag.toUpperCase()} Screening ${stamp}` });
const S1 = mk("lowback"), S2 = mk("kneeur"), S3 = mk("flagged"), S4 = mk("handover");
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
const snapshotOf = async (who) => (await devSql(
  `select k.* from public.rehab_checker_snapshots k join public.rehab_patients p on p.id = k.patient_id join auth.users u on u.id = p.user_id where u.email = $1 order by k.created_at desc limit 1`, [who.email]))[0];
const shot = (page, name) => page.screenshot({ path: path.join(OUT, name + ".png"), fullPage: true }).catch(() => undefined);

async function newPatientPage(browser, lang, viewport = { width: 1280, height: 900 }) {
  const context = await browser.newContext({ viewport });
  await context.addInitScript((l) => { try { localStorage.setItem("pna-teacher-lang-v1", JSON.stringify(l)); localStorage.setItem("pna-rv-no3d", "1"); } catch { /* about:blank */ } }, lang);
  const page = await context.newPage();
  page.setDefaultTimeout(60000);
  page.on("pageerror", (e) => { if (!/ViewTransition opt-in disabled/.test(String(e))) errors.push(String(e).slice(0, 200)); });
  return { context, page };
}
async function register(page, who, age) {
  await page.goto(`${BASE}/rehabverse/register`);
  await page.fill("#full_name", who.name);
  await page.fill("#age_years", String(age));
  await page.fill("#phone", "0300 1234567");
  await page.fill("#email", who.email);
  await page.fill("#password", who.password);
  await page.check("input[name=consent]");
  await page.getByRole("button", { name: /Send my account request|Account ki request bhejein/i }).click();
  await page.waitForURL(/\/rehabverse\/pending/, { timeout: 90000 });
  await devSql("update public.rehab_patients set status = 'active', decided_at = now() where user_id = (select id from auth.users where email = $1)", [who.email]);
  await page.goto(`${BASE}/rehabverse/start`);
}
const next = (page) => page.locator("button.rv-btn-primary").filter({ hasText: /^\s*(Next|Aage)/ }).click();
/** The picture questions, by position so it works in either language. */
async function pictures(page, { regionIndex, onsetIndex, durationIndex, impactIndex, locationIndex = 0, clueIndexes = [0] }) {
  const sc = page.locator(".sc");
  await sc.locator(".sc-region").nth(regionIndex).click();
  const groups = sc.locator(".sc-group");
  await groups.nth(0).locator(".sc-option").nth(onsetIndex).click();
  await groups.nth(1).locator(".sc-option").nth(durationIndex).click();
  await groups.nth(2).locator(".sc-option").nth(impactIndex).click();
  await sc.locator(".sc-btn-primary").click();
  await sc.locator(".sc-choice").nth(locationIndex).click();
  await sc.locator(".sc-btn-primary").click();
  return sc;
}
async function restOfForm(page, { flagIndexes = [], painIndex = 6 } = {}) {
  await page.locator(".rv-card[role=checkbox]").first().click(); // a symptom
  await next(page); // pain
  await page.locator(".rv-nprs").first().locator("button").nth(painIndex).click();
  await next(page); // history
  await next(page); // better
  await next(page); // life
  await next(page); // safety
  if (flagIndexes.length) for (const i of flagIndexes) await page.locator(".rv-card[role=checkbox]").nth(i).click();
  else await page.locator(".rv-card[role=checkbox]").last().click(); // "None of these apply to me"
  await next(page); // words
  await page.locator("button.rv-btn-primary").last().click();
}
async function adminLogin(page) {
  await page.goto(`${BASE}/admin/login`);
  await page.fill("input[name=email]", ADMIN.email);
  await page.fill("input[name=password]", ADMIN.password);
  await page.locator("form button[type=submit]").first().click();
  await page.waitForURL((url) => url.pathname === "/admin");
}

const resetSetting = () => devSql("update public.rehab_study_settings set screening_visibility = 'immediate' where id").catch(() => undefined);

(async () => {
  await resetSetting(); // a run that stopped half-way must not leave the study setting changed
  const browser = await chromium.launch();

  /* ───────────── 1. English, lower back, no safety warning, shown at once ───────────── */
  const a = await newPatientPage(browser, "en");
  await register(a.page, S1, 41);
  const sc1 = a.page.locator(".sc");
  await sc1.waitFor();
  check("1a The assessment starts with the symptom checker's body pictures", (await sc1.locator(".sc-region").count()) === 10 && (await sc1.locator(".sc-region img, .sc-region svg").count()) >= 10);
  await pictures(a.page, { regionIndex: 5, onsetIndex: 1, durationIndex: 1, impactIndex: 1, clueIndexes: [0] });
  await sc1.locator(".sc-check").first().click();
  await sc1.locator(".sc-btn-primary").click();
  check("1b After the pictures, the assessment's own questions continue (symptoms)", /What are you feeling\?/.test(await a.page.locator("main").innerText()));
  await restOfForm(a.page);
  await a.page.getByText("Assessment received").waitFor();
  const headline = a.page.locator(".sc-headline");
  await headline.waitFor({ timeout: 30000 });
  const headText = await headline.innerText();
  check("1c The patient is shown the pattern that fits best, highlighted", await headline.isVisible() && /Your answers fit this pattern best/i.test(headText));
  check("1d It is framed as a screening, not a diagnosis", /not a confirmed diagnosis/i.test(headText) && /not a diagnosis/i.test(await a.page.locator(".sc-inline").innerText()));
  await shot(a.page, "s1-result-en");
  const snap1 = await snapshotOf(S1);
  const asm = (await devSql("select a.regions, a.duration, a.onset from public.rehab_assessments a join public.rehab_patients p on p.id = a.patient_id join auth.users u on u.id = p.user_id where u.email = $1", [S1.email]))[0];
  check("1e The assessment keeps the main area, how long and how it started", JSON.stringify(asm.regions) === JSON.stringify(["lumbar"]) && asm.duration === "1_4w" && asm.onset === "gradual", JSON.stringify(asm));
  check("1f The server stored a snapshot: engine version, region, study arm, answers", snap1 && /^msk1-[0-9a-f]{8}$/.test(snap1.engine_version) && snap1.region === "low-back" && snap1.arm === "immediate" && snap1.source === "checker");
  const answers1 = snap1 ? snap1.answers : [];
  check("1g The answers are the checker's ids (age from the account, history, impact, location, clue)", ["age_40_59", "onset_gradual", "duration_subacute", "impact_moderate"].every((id) => answers1.includes(id)) && answers1.some((id) => id.startsWith("loc_")), JSON.stringify(answers1));
  check("1h The stored patterns are computed on the server (top patterns present, at most 3)", snap1 && Array.isArray(snap1.top_patterns) && snap1.top_patterns.length >= 1 && snap1.top_patterns.length <= 3, JSON.stringify(snap1 && snap1.top_patterns));
  check("1i Exposure is logged when the screening is shown", snap1 && snap1.shown_to_patient_at !== null);

  await a.page.goto(`${BASE}/rehabverse/me`);
  const panel = a.page.locator("[data-testid=screening-panel]");
  await panel.waitFor();
  await a.page.locator(".sc-headline").waitFor({ timeout: 30000 });
  check("1j The dashboard keeps showing what the answers pointed to", (await a.page.locator(".sc-headline").count()) === 1);
  await a.context.close();

  /* ───────────── 2. the study setting: after the physiotherapist's review (Roman Urdu, knee injury, fracture screen) ───────────── */
  const adminCtx = await browser.newContext({ viewport: { width: 1280, height: 900 } });
  const admin = await adminCtx.newPage();
  admin.setDefaultTimeout(60000);
  await adminLogin(admin);
  await admin.goto(`${BASE}/admin/rehabverse`);
  const arm = admin.getByRole("radio", { name: /After I have reviewed it/ });
  await arm.waitFor();
  await arm.click();
  await admin.getByText(/Saved\. New participants/).waitFor();
  const setting = (await devSql("select screening_visibility from public.rehab_study_settings where id"))[0].screening_visibility;
  check("2a The admin switches the study setting to 'after review' (saved and audited)", setting === "after_review" && (await devSql("select count(*)::int n from public.rehab_audit_log where action = 'study.screening_visibility'"))[0].n >= 1);

  const b = await newPatientPage(browser, "ur", { width: 390, height: 844 });
  await register(b.page, S2, 66);
  const sc2 = b.page.locator(".sc");
  await sc2.waitFor();
  check("2b In Roman Urdu the questions are in natural spoken Roman Urdu", /Aap ka main masla kahan hai\?/.test(await sc2.innerText()));
  await sc2.locator(".sc-region").nth(7).click(); // knee
  const g = sc2.locator(".sc-group");
  await g.nth(0).locator(".sc-option").nth(0).click(); // suddenly (an injury)
  await g.nth(1).locator(".sc-option").nth(0).click(); // under a week
  await g.nth(2).locator(".sc-option").nth(2).click(); // high impact
  await sc2.locator(".sc-btn-primary").click();
  await sc2.locator(".sc-choice").first().click();
  await sc2.locator(".sc-btn-primary").click();
  const clues = sc2.locator(".sc-check");
  const count = await clues.count();
  for (let i = 0; i < count; i++) { if (/4 qadam|wazan nahi daal saka/i.test(await clues.nth(i).innerText())) await clues.nth(i).click(); }
  check("2c After an injury the fracture-screen questions are offered", /4 qadam/.test(await sc2.innerText()));
  await sc2.locator(".sc-btn-primary").click();
  await restOfForm(b.page);
  await b.page.getByText(/Assessment mil gaya/).waitFor();
  const waiting = b.page.locator(".sc-inline");
  await waiting.waitFor({ timeout: 30000 });
  check("2d In the 'after review' arm the patient is told it will appear after review", /Aap ki screening review ke baad nazar aayegi/i.test(await waiting.innerText()) && (await b.page.locator(".sc-headline").count()) === 0);
  const snap2 = await snapshotOf(S2);
  check("2e The snapshot is recorded in the 'after review' arm with nothing shown yet", snap2 && snap2.arm === "after_review" && snap2.shown_to_patient_at === null && snap2.fracture_screen === true && snap2.language === "ru");
  check("2f The snapshot's duration band follows the cautious mapping (under a week is acute)", snap2 && snap2.answers.includes("duration_acute") && snap2.answers.includes("onset_trauma") && snap2.answers.includes("age_60_plus"), JSON.stringify(snap2 && snap2.answers));
  await shot(b.page, "s2-waiting-ur-phone");
  check("2g No sideways scrolling on a phone", await b.page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth + 1));

  // The physiotherapist's record shows the snapshot; reviewing it lets the patient see the screening.
  const pid = (await devSql("select p.id from public.rehab_patients p join auth.users u on u.id = p.user_id where u.email = $1", [S2.email]))[0].id;
  await admin.goto(`${BASE}/admin/rehabverse/patients/${pid}`);
  const card = admin.locator("[data-testid=screening-snapshot]");
  await card.waitFor();
  const cardText = await card.innerText();
  check("2h The physiotherapist's record shows the snapshot: engine version, fracture screen, patterns", /Engine msk1-/.test(cardText) && /fracture screen/i.test(cardText) && /Patterns that fit/i.test(cardText));
  check("2i It shows the study arm and that the patient has not been shown the screening yet", /Shown to the patient after your review/.test(cardText) && /has not been shown the screening yet/.test(cardText));
  await shot(admin, "s2-admin-record");
  await admin.getByRole("button", { name: "Mark in review" }).click();
  await admin.getByText("Updated.").waitFor();
  await b.page.goto(`${BASE}/rehabverse/me`);
  await b.page.locator("[data-testid=screening-panel]").waitFor();
  await b.page.locator(".sc-inline .sc-note").first().waitFor({ timeout: 30000 });
  const afterReview = await b.page.locator(".sc-inline").innerText();
  check("2j After the review the patient sees the screening; an injury shows the fracture care note instead of a headline pattern", /Fracture screening/i.test(afterReview) && /in-person assessment/i.test(afterReview) && (await b.page.locator(".sc-headline").count()) === 0);
  check("2k Exposure is logged only once it was shown", (await snapshotOf(S2)).shown_to_patient_at !== null);
  await shot(b.page, "s2-dashboard-ur-phone");
  await b.context.close();

  /* ───────────── 3. a safety warning never shows patterns ───────────── */
  const c = await newPatientPage(browser, "en");
  await register(c.page, S3, 35);
  await pictures(c.page, { regionIndex: 7, onsetIndex: 1, durationIndex: 3, impactIndex: 1 });
  await c.page.locator(".sc .sc-btn-primary").click();
  await restOfForm(c.page, { flagIndexes: [1] }); // chest pain
  await c.page.getByText("Please get checked first").waitFor();
  check("3a With a safety warning the patient is sent to a clinician and no patterns are shown", (await c.page.locator(".sc-headline").count()) === 0 && (await c.page.locator(".sc-inline").count()) === 0);
  const snap3 = await snapshotOf(S3);
  check("3b The snapshot is still stored for the physiotherapist and the research record", Boolean(snap3) && snap3.shown_to_patient_at === null);
  await c.context.close();

  /* ───────────── 3b. the public checker hands its answers over to the assessment ───────────── */
  const d = await newPatientPage(browser, "en");
  await register(d.page, S4, 52);
  await d.page.goto(`${BASE}/symptom-checker`);
  const pub = d.page.locator(".sc");
  await pub.waitFor();
  await pub.locator(".sc-region").nth(7).click(); // knee
  const pg = pub.locator(".sc-group");
  await pg.nth(0).locator(".sc-option").nth(1).click(); // 40–59
  await pg.nth(1).locator(".sc-option").nth(1).click(); // gradual
  await pg.nth(2).locator(".sc-option").nth(1).click(); // 2–6 weeks
  await pg.nth(3).locator(".sc-option").nth(1).click(); // moderate
  await pub.locator(".sc-btn-primary").click();
  await pub.locator(".sc-choice").first().click();
  await pub.locator(".sc-btn-primary").click();
  await pub.locator(".sc-check").first().click();
  await pub.locator(".sc-btn-primary").click();
  await pub.locator(".sc-none").click();
  await pub.locator(".sc-btn-primary").click();
  const handLink = pub.getByRole("link", { name: /Send to a physiotherapist in RehabVerse/ });
  await handLink.waitFor();
  check("3c The public checker result offers to send the answers to a physiotherapist", await handLink.isVisible());
  await handLink.click();
  await d.page.waitForURL(/\/rehabverse\/start/, { timeout: 60000 });
  const carried = d.page.locator(".sc");
  await carried.waitFor();
  check("3d The assessment opens with the answers filled in and says so", /Your answers from the symptom checker are filled in/.test(await d.page.locator("main").innerText()));
  check("3e The history step has how it started and the effect pre-selected, and the duration left to ask", (await carried.locator(".sc-option[aria-pressed=true]").count()) === 2);
  await carried.locator(".sc-group").nth(1).locator(".sc-option").nth(1).click(); // 1–4 weeks
  await carried.locator(".sc-btn-primary").click(); // location
  check("3f The location and the symptom clue are filled in too", (await carried.locator(".sc-choice[aria-pressed=true]").count()) === 1);
  await carried.locator(".sc-btn-primary").click(); // clues
  check("3g ...and the clue ticked in the checker is ticked here", (await carried.locator(".sc-check[data-on=true]").count()) === 1);
  await carried.locator(".sc-btn-primary").click(); // finished
  await restOfForm(d.page);
  await d.page.getByText("Assessment received").waitFor();
  const snap4 = await snapshotOf(S4);
  check("3h The snapshot records that the answers came through the hand-over", snap4 && snap4.source === "handover" && snap4.region === "knee", JSON.stringify(snap4 && snap4.source));
  check("3i The hand-over is cleared once the assessment is sent", (await d.page.evaluate(() => window.sessionStorage.getItem("pna-checker-handover-v1"))) === null);
  await d.context.close();

  // put the study setting back to the default
  await admin.goto(`${BASE}/admin/rehabverse`);
  await admin.getByRole("radio", { name: /Straight after the form is sent/ }).click();
  await admin.getByText(/Saved\. New participants/).waitFor();
  check("4a The study setting is put back to 'immediate'", (await devSql("select screening_visibility from public.rehab_study_settings where id"))[0].screening_visibility === "immediate");
  await adminCtx.close();

  await browser.close();
  check("5a No page errors during the run", errors.length === 0, errors.join(" | "));
  const failed = results.filter((r) => !r).length;
  console.log(failed ? `\n${failed} of ${results.length} FAILED` : `\nAll ${results.length} checks passed.`);
  process.exit(failed ? 1 : 0);
})().catch(async (e) => { console.log("E2E ERROR:", e.message); await resetSetting(); process.exit(1); });
