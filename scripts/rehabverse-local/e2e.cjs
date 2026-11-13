/**
 * RehabVerse end-to-end test against the LOCAL backend (never the real project).
 *
 *   1) node scripts/rehabverse-local/server.mjs            (with REHAB_DEV_SQL=1; port 54321)
 *   2) NEXT_PUBLIC_SUPABASE_URL=http://127.0.0.1:54321 NEXT_PUBLIC_SUPABASE_ANON_KEY=local-anon-key \
 *      NEXT_PUBLIC_SITE_URL=http://127.0.0.1:3100 PNA_SKIP_CF_DEV=1 npx next dev -p 3100
 *   3) node scripts/rehabverse-local/e2e.cjs
 *
 * It walks the 15 acceptance criteria with real browsers: patient registration and intake, the
 * clinician inbox, programme building with the 3D library, Day 1 release, 3D demos, feedback,
 * review, Day 2 unlock, a safety pause, recovery check-ins, cross-patient isolation and mobile layout.
 * Screenshots go to $E2E_OUT (default ./e2e-out).
 */
const { chromium } = require("playwright");
const fs = require("fs");
const path = require("path");

const BASE = process.env.E2E_BASE ?? "http://127.0.0.1:3100";
const API = process.env.E2E_API ?? "http://127.0.0.1:54321";
const OUT = process.env.E2E_OUT ?? path.join(process.cwd(), "e2e-out");
fs.mkdirSync(OUT, { recursive: true });

const results = [];
const check = (name, ok, detail = "") => {
  results.push({ name, ok: Boolean(ok), detail });
  console.log(`${ok ? "PASS" : "FAIL"}  ${name}${detail ? "  — " + detail : ""}`);
};
const stamp = Date.now().toString(36);
const A = { email: `patient.a.${stamp}@example.test`, password: "Patient-A-pass-2026", name: `Aisha Khan ${stamp}` };
const B = { email: `patient.b.${stamp}@example.test`, password: "Patient-B-pass-2026", name: `Bilal Ahmed ${stamp}` };
const ADMIN = { email: "admin@pna.test", password: "AdminPass#2026" };

const GL = ["--use-gl=angle", "--use-angle=swiftshader", "--enable-unsafe-swiftshader"];

async function devSql(sql, params = []) {
  const res = await fetch(`${API}/__dev/sql`, { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ sql, params }) });
  if (!res.ok) throw new Error("dev sql failed: " + (await res.text()));
  return res.json();
}

async function newContext(browser, viewport = { width: 1280, height: 900 }, { no3d = true } = {}) {
  const context = await browser.newContext({ viewport });
  await context.addInitScript((flag) => { try { localStorage.setItem("pna-rv-lang", "en"); if (flag) localStorage.setItem("pna-rv-no3d", "1"); } catch { /* about:blank */ } }, no3d);
  const page = await context.newPage();
  page.setDefaultTimeout(60000);
  // Chrome logs this harmless message when a cross-document view transition is replaced by a quick redirect (site-wide motion.css).
  page.on("pageerror", (e) => { if (!/ViewTransition opt-in disabled/.test(String(e))) errors.push(String(e).slice(0, 200)); });
  return { context, page };
}
const errors = [];
const shot = (page, name) => page.screenshot({ path: path.join(OUT, name + ".png"), fullPage: true }).catch(() => undefined);
const park = (page) => page.goto("about:blank").catch(() => undefined);
const noOverflow = (page) => page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth + 1);

async function register(page, who, age = 41) {
  await page.goto(`${BASE}/rehabverse/register`);
  await page.fill("#full_name", who.name);
  await page.fill("#age_years", String(age));
  await page.fill("#email", who.email);
  await page.fill("#password", who.password);
  await page.check("input[name=consent]");
  await page.getByRole("button", { name: "Create my account" }).click();
}

async function intake(page, { flags = [], region = "Lower back" } = {}) {
  await page.getByRole("checkbox", { name: region, exact: true }).click();
  await page.locator("button.rv-btn-primary").filter({ hasText: /^\s*Next/ }).click(); // symptoms
  await page.getByRole("checkbox", { name: "Pain", exact: true }).click();
  await page.locator("button.rv-btn-primary").filter({ hasText: /^\s*Next/ }).click(); // pain
  await page.locator(".rv-nprs").first().getByRole("button", { name: /^6 —/ }).click();
  await page.locator("button.rv-btn-primary").filter({ hasText: /^\s*Next/ }).click(); // history
  await page.getByRole("radio", { name: "1–4 weeks" }).click();
  await page.locator("button.rv-btn-primary").filter({ hasText: /^\s*Next/ }).click(); // better/worse
  await page.locator("#aggravating").fill("Sitting for long, bending forward");
  await page.locator("button.rv-btn-primary").filter({ hasText: /^\s*Next/ }).click(); // life
  await page.locator("#functional").fill("Hard to lift my child");
  await page.locator("button.rv-btn-primary").filter({ hasText: /^\s*Next/ }).click(); // safety
  if (flags.length) for (const f of flags) await page.getByRole("checkbox", { name: new RegExp(f) }).click();
  else await page.getByRole("checkbox", { name: "None of these apply to me" }).click();
  await page.locator("button.rv-btn-primary").filter({ hasText: /^\s*Next/ }).click(); // own words
  await page.locator("#own").fill("Pain started two weeks ago after lifting.");
  await page.getByRole("button", { name: /Send to my physiotherapist/ }).click();
}

async function adminLogin(page) {
  await page.goto(`${BASE}/admin/login`);
  await page.fill("input[name=email]", ADMIN.email);
  await page.fill("input[name=password]", ADMIN.password);
  await page.locator("form button[type=submit]").first().click();
  await page.waitForURL((url) => url.pathname === "/admin");
}

async function pickScale(page, group, n) {
  await page.locator("fieldset", { hasText: group }).first().getByRole("button", { name: new RegExp(`^${n} —`) }).click();
}

(async () => {
  const browser = await chromium.launch({ args: GL });

  /* ───────────── 1. Patient A: account + symptoms ───────────── */
  const a = await newContext(browser);
  await register(a.page, A);
  await a.page.waitForURL(/\/rehabverse\/start/, { timeout: 90000 });
  check("1a Patient account created and signed in", true);
  await shot(a.page, "01-intake-start");
  await intake(a.page);
  await a.page.getByText("Thank you — your physiotherapist will review it.").waitFor();
  check("1b Symptom submission accepted (no red flags)", true);
  await shot(a.page, "02-intake-done");
  await a.page.goto(`${BASE}/rehabverse/me`);
  await a.page.getByText("Your assessment is being reviewed").waitFor();
  check("1c Dashboard shows assessment under review; no programme or exercises", (await a.page.getByText("Start today's session").count()) === 0);
  // Duplicate protection: a second open assessment is sent back to the dashboard.
  await a.page.goto(`${BASE}/rehabverse/start`);
  await a.page.waitForURL(/\/rehabverse\/me/);
  check("1d Cannot open a second assessment while one is open", true);

  /* ───────────── 2. Patient B: red flag ───────────── */
  const b = await newContext(browser);
  await register(b.page, B, 55);
  await b.page.waitForURL(/\/rehabverse\/start/);
  await intake(b.page, { flags: ["Numbness around the groin"] });
  await b.page.getByText("Your answers need a clinician before any exercise.").waitFor();
  check("2a Red-flag answers route to clinical assessment (no programme)", true);
  await shot(b.page, "03-flagged");

  await park(a.page);
  await park(b.page);
  /* ───────────── 3. Admin: inbox, review, build, approve ───────────── */
  const adm = await newContext(browser);
  await adminLogin(adm.page);
  await adm.page.goto(`${BASE}/admin/rehabverse`);
  await adm.page.getByRole("heading", { name: "Clinician inbox" }).waitFor();
  check("3a Submissions appear in the clinician inbox", (await adm.page.getByText(A.name).count()) > 0 && (await adm.page.getByText(B.name).count()) > 0);
  check("3b Red-flag case is surfaced under safety", (await adm.page.getByText("red-flag assessment").count()) > 0);
  await shot(adm.page, "04-admin-inbox");

  // Red-flag patient: programme cannot be created.
  await adm.page.getByRole("link", { name: new RegExp(B.name) }).first().click();
  await adm.page.getByText(/no exercise programme should start/i).waitFor();
  check("3c Flagged patient: builder locked, warning shown", (await adm.page.getByText(/can be built once the assessment is reviewed/).count()) > 0);
  await shot(adm.page, "05-admin-flagged-record");

  // Patient A: review + clear + build.
  await adm.page.goto(`${BASE}/admin/rehabverse`);
  await adm.page.getByRole("link", { name: new RegExp(A.name) }).first().click();
  await adm.page.getByText("Initial assessment").waitFor();
  check("3d Admin reviews the full assessment", (await adm.page.getByText("Sitting for long, bending forward").count()) > 0);
  await adm.page.getByLabel("Clinical note").fill("Reviewed the screening: no red flags; suitable for graded exercise.");
  await adm.page.getByRole("button", { name: "Clear for programme" }).click();
  await adm.page.getByText("Updated.").waitFor();
  await adm.page.getByRole("button", { name: /Add exercises from the 3D library/ }).first().click();
  const dialog = adm.page.getByRole("dialog", { name: "Exercise library" });
  await dialog.waitFor();
  await dialog.getByRole("button", { name: /^Add$/ }).nth(0).click();
  await dialog.getByRole("button", { name: /^Add$/ }).nth(1).click();
  // Preview a real 3D demo in the picker.
  await dialog.getByRole("button", { name: /^Preview/ }).first().click();
  await dialog.locator("figure[data-rv-player] canvas").first().waitFor({ timeout: 120000 });
  await shot(adm.page, "06-admin-picker");
  await dialog.getByRole("button", { name: "Done" }).click();
  await adm.page.getByRole("button", { name: "Add a day" }).click();
  await adm.page.getByLabel("Day 2 title").fill("Build up");
  await adm.page.getByRole("button", { name: /Add exercises from the 3D library/ }).nth(1).click();
  await dialog.waitFor();
  await dialog.getByRole("button", { name: /^Add$/ }).nth(2).click();
  await dialog.getByRole("button", { name: "Done" }).click();
  await adm.page.getByRole("button", { name: "Save as draft" }).click();
  await adm.page.getByText(/Saved \(2 days\)/).waitFor();
  check("3e Admin builds an individual 2-day programme from the library and saves a draft", true);
  await shot(adm.page, "07-admin-programme-draft");
  // Patient cannot see a draft.
  await a.page.goto(`${BASE}/rehabverse/me`);
  await a.page.getByText("Your assessment is being reviewed").waitFor();
  check("3f Draft programme is invisible to the patient", (await a.page.getByText("Start today's session").count()) === 0);
  await adm.page.getByRole("button", { name: /Approve & release Day 1/ }).click();
  await adm.page.getByText(/approved — Day 1 is open/).waitFor();
  check("3g Admin approves the programme (Day 1 released)", true);
  await park(adm.page);

  /* ───────────── 3h. Starter programme template (Patient C) ───────────── */
  const C = { email: `patient.c.${stamp}@example.test`, password: "Patient-C-pass-2026", name: `Chitra Rao ${stamp}` };
  const c = await newContext(browser);
  await register(c.page, C, 47);
  await c.page.waitForURL(/\/rehabverse\/start/);
  await intake(c.page, { region: "Neck" });
  await c.page.getByText("Thank you — your physiotherapist will review it.").waitFor();
  await park(c.page);
  await adm.page.goto(`${BASE}/admin/rehabverse`);
  await adm.page.getByRole("link", { name: new RegExp(C.name) }).first().click();
  await adm.page.getByText("Initial assessment").waitFor();
  await adm.page.getByLabel("Starter programme").selectOption("neck-posture");
  await adm.page.getByRole("button", { name: "Use it" }).click();
  await adm.page.getByText(/Loaded “Neck stiffness and posture”/).waitFor();
  const dayCount = await adm.page.locator('section[aria-label^="Day "]').count();
  check("3h Clinician can start from a starter programme (4 days of real library exercises)", dayCount === 4 && (await adm.page.getByText("Chin tuck").count()) > 0, `days ${dayCount}`);
  await adm.page.getByRole("button", { name: "Save as draft" }).click();
  await adm.page.getByText(/Saved \(4 days\)/).waitFor();
  check("3i The starter programme can be saved and edited like any other", true);
  await park(adm.page);

  /* ───────────── 4. Patient A: Day 1 only, 3D demos ───────────── */
  await a.page.goto(`${BASE}/rehabverse/me`);
  await a.page.getByText("Start today's session").waitFor();
  const lockedDays = await a.page.getByText("Opens after your feedback and your physiotherapist's approval").count();
  check("4a Patient sees Day 1 open and Day 2 locked", lockedDays >= 1);
  await shot(a.page, "08-dashboard-day1");
  const day1 = await a.page.getByRole("link", { name: /Start today's session/ }).getAttribute("href");
  await a.page.goto(`${BASE}${day1}`);
  await a.page.locator("figure[data-rv-player] canvas").first().waitFor({ timeout: 120000 });
  await a.page.waitForFunction(() => !document.querySelector("figure[data-rv-player] [role=status]"), null, { timeout: 120000 });
  check("4b Real 3D exercise demonstration is shown for the prescribed exercise", true);
  await a.page.waitForTimeout(2500);
  await shot(a.page, "09-day1-session");
  const lockedDay2 = await a.page.evaluate(async () => {
    const day = [...document.querySelectorAll("a")].map((x) => x.getAttribute("href")).filter(Boolean);
    return day.length;
  });
  // Direct URL to Day 2 must not reveal its exercises. Find Day 2 id via the admin dev SQL.
  const day2 = (await devSql("select s.id from public.rehab_sessions s join public.rehab_programmes p on p.id=s.programme_id join public.rehab_patients pt on pt.id=p.patient_id join auth.users u on u.id=pt.user_id where u.email=$1 and s.day_number=2", [A.email]))[0].id;
  await a.page.goto(`${BASE}/rehabverse/me/day/${day2}`);
  await a.page.getByText("This day is locked").waitFor();
  check("4c Locked Day 2: opening its URL shows no exercises", (await a.page.locator("figure[data-rv-player]").count()) === 0);
  void lockedDay2;

  /* ───────────── 5. Feedback ───────────── */
  await a.page.goto(`${BASE}${day1}`);
  await a.page.getByText("After your session: feedback").waitFor();
  await a.page.getByRole("radio", { name: "Yes, all of them" }).click();
  await pickScale(a.page, "Pain BEFORE", 2);
  await pickScale(a.page, "Pain DURING", 3);
  await pickScale(a.page, "Pain RIGHT AFTER", 2);
  await pickScale(a.page, "How hard was it?", 3);
  await a.page.getByRole("checkbox", { name: "None of these", exact: true }).click();
  await a.page.getByRole("button", { name: /Send my feedback/ }).click();
  await a.page.getByText("Feedback sent — well done!").waitFor();
  check("5a Patient submits daily feedback (pain before/during/after, difficulty, completion)", true);
  await shot(a.page, "10-feedback-sent");
  await a.page.goto(`${BASE}/rehabverse/me`);
  await a.page.getByText(/Day 1 feedback received/).waitFor();
  check("5b Next day stays locked until approval", (await a.page.getByText("Start today's session").count()) === 0);
  await a.page.goto(`${BASE}/rehabverse/me/day/${day2}`);
  await a.page.getByText("This day is locked").waitFor();
  check("5c Day 2 still locked after feedback only", true);
  const stored = await devSql("select f.pain_before,f.pain_during,f.pain_after,f.difficulty,f.completion,pt.full_name,s.day_number from public.rehab_feedback f join public.rehab_sessions s on s.id=f.session_id join public.rehab_patients pt on pt.id=f.patient_id join auth.users u on u.id=pt.user_id where u.email=$1", [A.email]);
  check("5d Feedback saved against the correct patient and session", stored.length === 1 && stored[0].full_name === A.name && stored[0].day_number === 1 && stored[0].pain_after === 2, JSON.stringify(stored[0]));
  await park(a.page);

  /* ───────────── 6. Admin reviews feedback, approves, Day 2 ───────────── */
  await adm.page.goto(`${BASE}/admin/rehabverse`);
  const reviewLink = adm.page.getByRole("link", { name: new RegExp(`${A.name}.*Day 1`) });
  await reviewLink.waitFor();
  await reviewLink.click();
  await adm.page.getByText(/Suggest: the patient may be ready to progress/).waitFor();
  check("6a Admin sees feedback with transparent rule-based suggestion", (await adm.page.getByText(/Decision support only/).count()) > 0);
  await adm.page.getByRole("button", { name: /Save decision/ }).click();
  await adm.page.getByText("Decision saved.").waitFor();
  check("6b Admin approves progression (Day 2 unlocks)", true);
  await shot(adm.page, "11-admin-review");
  await park(adm.page);
  await a.page.goto(`${BASE}/rehabverse/me`);
  await a.page.getByText("Start today's session").waitFor();
  check("6c Patient now sees Day 2 open", (await a.page.getByText(/Day 2: Build up/).count()) > 0 || (await a.page.getByText("Start today's session").count()) > 0);

  /* ───────────── 7. Concerning symptom pauses the programme ───────────── */
  await a.page.goto(`${BASE}/rehabverse/me/day/${day2}`);
  await a.page.getByText("After your session: feedback").waitFor();
  await a.page.getByRole("radio", { name: "Yes, all of them" }).click();
  await pickScale(a.page, "Pain BEFORE", 3);
  await pickScale(a.page, "Pain DURING", 5);
  await pickScale(a.page, "Pain RIGHT AFTER", 4);
  await pickScale(a.page, "How hard was it?", 5);
  await a.page.getByRole("checkbox", { name: /Dizziness, fainting/ }).click();
  await a.page.getByRole("button", { name: /Send my feedback/ }).click();
  await a.page.getByText(/Please stop exercising/).waitFor();
  check("7a Concerning symptom: patient told to stop and seek care; programme paused", true);
  await shot(a.page, "12-safety-pause");
  await a.page.goto(`${BASE}/rehabverse/me`);
  await a.page.getByText("Your programme is paused").first().waitFor();
  await adm.page.goto(`${BASE}/admin/rehabverse`);
  await adm.page.getByRole("link", { name: new RegExp(`${A.name}.*adverse event \\(severe\\)`) }).waitFor();
  check("7b Adverse event raised for clinical review", true);
  await park(adm.page);
  await park(a.page);

  /* ───────────── 8. ERRP follow-up ───────────── */
  // Age Day 1's feedback so the next-day check-in is due.
  await devSql("update public.rehab_feedback set submitted_at = now() - interval '26 hours' where session_id in (select s.id from public.rehab_sessions s where s.day_number = 1 and s.programme_id in (select p.id from public.rehab_programmes p join public.rehab_patients pt on pt.id=p.patient_id join auth.users u on u.id=pt.user_id where u.email=$1))", [A.email]).catch(() => undefined);
  await a.page.goto(`${BASE}/rehabverse/me`);
  await a.page.getByText("Your programme timeline").waitFor();
  const due = await a.page.getByText("A quick check-in is due").count();
  check("8a Recovery check-in becomes due after ~24 h", due > 0);
  if (due) {
    await a.page.getByRole("link", { name: /Answer \(1 minute\)/ }).first().click();
    await a.page.locator("#checkin").waitFor();
    await pickScale(a.page, "Pain right now", 2);
    await a.page.getByRole("radio", { name: "Better" }).click();
    await a.page.getByRole("checkbox", { name: "None of these", exact: true }).click();
    await a.page.getByRole("button", { name: /Save check-in/ }).click();
    await a.page.getByText("Thank you — recorded.").waitFor();
    check("8b Next-day recovery check-in recorded", true);
  }
  await a.page.goto(`${BASE}/rehabverse/me`);
  await a.page.getByText("Your progress").waitFor();
  check("8c Progress charts and adherence are shown", (await a.page.locator("svg[role=img]").count()) >= 2);
  await shot(a.page, "13-dashboard-progress");
  // Data rights: download a copy; ask for deletion.
  const [download] = await Promise.all([a.page.waitForEvent("download"), a.page.getByRole("button", { name: "Download my data" }).click()]);
  const exported = JSON.parse(require("fs").readFileSync(await download.path(), "utf8"));
  check("8d Patient can download their own record (JSON)", exported.patient?.full_name === A.name && Array.isArray(exported.days) && exported.days.length >= 1 && !JSON.stringify(exported).includes(B.name));
  a.page.once("dialog", (d) => d.accept());
  await a.page.getByRole("button", { name: "Ask to delete my account" }).click();
  await a.page.getByText(/request was sent to the clinic/).waitFor();
  check("8e Patient can ask the clinic to delete their account", true);

  /* ───────────── 9. Isolation and access control ───────────── */
  const denied = await b.page.goto(`${BASE}/rehabverse/me/day/${day2}`);
  const bText = await b.page.locator("body").innerText();
  check("9a Patient B cannot open Patient A's session", denied.status() === 404 && !/Day 2 — Build up|Feedback|exercises/i.test(bText.replace(/Not Found/gi, "")), `status ${denied.status()}`);
  const tokenB = await b.context.cookies();
  const authCookie = tokenB.find((c) => /auth-token/.test(c.name));
  let rpcDenied = false;
  if (authCookie) {
    try {
      const raw = decodeURIComponent(authCookie.value).replace(/^base64-/, "");
      const json = JSON.parse(Buffer.from(raw, "base64").toString("utf8"));
      const res = await fetch(`${API}/rest/v1/rpc/rehab_my_session`, { method: "POST", headers: { "content-type": "application/json", authorization: `Bearer ${json.access_token}`, apikey: "local-anon-key" }, body: JSON.stringify({ p_session_id: day2 }) });
      rpcDenied = !res.ok;
      const all = await fetch(`${API}/rest/v1/rpc/rehab_admin_patients`, { method: "POST", headers: { "content-type": "application/json", authorization: `Bearer ${json.access_token}`, apikey: "local-anon-key" }, body: "{}" });
      check("9b Patient token cannot call clinician functions", !all.ok, `status ${all.status}`);
    } catch (e) {
      check("9b Patient token cannot call clinician functions", false, String(e));
    }
  }
  check("9c Direct database call for another patient's session is refused", rpcDenied);
  await b.page.goto(`${BASE}/admin/rehabverse`);
  check("9d Patient cannot open the clinician area", /\/admin\/login/.test(b.page.url()), b.page.url());
  const anon = await newContext(browser, undefined, { no3d: false });
  await anon.page.goto(`${BASE}/rehabverse/me`);
  check("9e Signed-out visitor is sent to sign in", /\/rehabverse\/login/.test(anon.page.url()));
  const pub = await anon.page.goto(`${BASE}/rehabverse/library`);
  check("9f Public library needs no sign-in and exposes no patient data", pub.status() === 200 && (await anon.page.content()).indexOf(A.name) === -1);

  /* ───────────── 10. Guide + Roman Urdu ───────────── */
  await anon.page.goto(`${BASE}/rehabverse`);
  await anon.page.locator("[data-rv-guide] canvas").first().waitFor({ timeout: 120000 });
  await anon.page.waitForTimeout(6000);
  check("10a 3D physio guide renders and talks (subtitles)", (await anon.page.locator("[data-rv-guide]").getByText(/Assalam-o-alaikum|Welcome/).count()) > 0);
  await shot(anon.page, "14-landing-guide-en");
  await anon.page.getByRole("button", { name: "Roman Urdu" }).first().click();
  await anon.page.waitForTimeout(4000);
  await shot(anon.page, "15-landing-guide-ru");
  check("10b Roman Urdu mode switches the whole page", (await anon.page.getByText("Aap ki guided rehab").count()) > 0);

  /* ───────────── 11. Mobile ───────────── */
  const m = await newContext(browser, { width: 390, height: 844 }, { no3d: false });
  await m.page.goto(`${BASE}/rehabverse/login`);
  await m.page.fill("#email", A.email);
  await m.page.fill("#password", A.password);
  await m.page.getByRole("button", { name: "Sign in" }).first().click();
  await m.page.waitForURL(/\/rehabverse\/me/);
  const pages = [["landing", "/rehabverse"], ["dashboard", "/rehabverse/me"], ["day", `/rehabverse/me/day/${day1.split("/").pop()}`], ["library", "/rehabverse/library"], ["register", "/rehabverse/register"]];
  for (const [name, p] of pages) {
    await m.page.goto(`${BASE}${p}`);
    await m.page.waitForTimeout(name === "landing" || name === "day" ? 9000 : 1500);
    check(`11 Mobile layout (${name}) has no horizontal overflow`, await noOverflow(m.page));
    await shot(m.page, `m-${name}`);
  }
  const mobAdmin = await newContext(browser, { width: 390, height: 844 });
  await adminLogin(mobAdmin.page);
  const patientId = (await devSql("select pt.id from public.rehab_patients pt join auth.users u on u.id=pt.user_id where u.email=$1", [A.email]))[0].id;
  await mobAdmin.page.goto(`${BASE}/admin/rehabverse/patients/${patientId}`);
  await mobAdmin.page.getByText("Initial assessment").waitFor();
  check("11 Mobile layout (admin record) has no horizontal overflow", await noOverflow(mobAdmin.page));
  await shot(mobAdmin.page, "m-admin-record");

  check("12 No uncaught page errors during the run", errors.length === 0, errors.slice(0, 3).join(" | "));
  await browser.close();
  const failed = results.filter((r) => !r.ok);
  fs.writeFileSync(path.join(OUT, "results.json"), JSON.stringify({ passed: results.length - failed.length, failed: failed.length, results }, null, 2));
  console.log(`\n${results.length - failed.length}/${results.length} checks passed`);
  process.exit(failed.length ? 1 : 0);
})().catch((error) => {
  console.error("E2E ERROR:", error);
  process.exit(2);
});
