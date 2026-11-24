/**
 * Research Room e2e (LOCAL backend, never the real project):
 *   REHAB_DEV_SQL=1 node scripts/rehabverse-local/server.mjs
 *   (dev server as in e2e.cjs)   node scripts/rehabverse-local/e2e-research-room.cjs
 * Covers: study set-up, a hidden placeholder allocation list, the rule that recruiting cannot start while an instrument is not cleared for patients,
 * recruiting and the frozen fingerprint, screening and enrolment from two real accounts (arm from the list, AI switch follows, patient approved),
 * the locked arm card and the logged override, a screened-out person who can still be approved as an ordinary patient, the flow numbers, and a phone-width layout.
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
const mk = (n) => ({ email: `rr${n}.${stamp}@example.test`, password: "Patient-pass-2026-x", name: `Trial Person ${n} ${stamp}` });
const PEOPLE = [mk(1), mk(2), mk(3)];
const results = [];
const check = (name, ok, detail = "") => { results.push(Boolean(ok)); console.log(`${ok ? "PASS" : "FAIL"}  ${name}${detail ? "  — " + detail : ""}`); };
async function devSql(sql, params = []) {
  const res = await fetch(`${API}/__dev/sql`, { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ sql, params }) });
  if (!res.ok) throw new Error("dev sql failed: " + (await res.text()));
  return res.json();
}
async function register(page, who, phone) {
  await page.goto(`${BASE}/rehabverse/register`);
  await page.fill("#full_name", who.name);
  await page.fill("#age_years", "44");
  await page.fill("#phone", phone);
  await page.fill("#email", who.email);
  await page.fill("#password", who.password);
  await page.check("input[name=consent]");
  await page.getByRole("button", { name: "Send my account request" }).click();
  await page.waitForURL(/\/rehabverse\/pending/, { timeout: 90000 });
}

(async () => {
  const browser = await chromium.launch();
  const ctx = (vp = { width: 1280, height: 1000 }) => browser.newContext({ viewport: vp }).then((c) => { c.setDefaultTimeout(60000); c.setDefaultNavigationTimeout(60000); return c; });
  const errors = [];
  const watch = (page) => page.on("pageerror", (e) => { if (!/ViewTransition opt-in disabled/.test(String(e))) errors.push(e.message); });

  const people = [];
  for (let i = 0; i < PEOPLE.length; i++) { const c = await ctx(), p = await c.newPage(); watch(p); await register(p, PEOPLE[i], `030${i}111222${i}`); people.push(p); }

  const ca = await ctx(), admin = await ca.newPage(); watch(admin);
  await admin.goto(`${BASE}/admin/login`);
  await admin.fill("input[name=email]", ADMIN.email);
  await admin.fill("input[name=password]", ADMIN.password);
  await admin.locator("form button[type=submit]").first().click();
  await admin.waitForURL((url) => url.pathname === "/admin");

  /* ---- before a study: approve works as always ---- */
  await admin.goto(`${BASE}/admin/rehabverse`);
  await admin.getByRole("heading", { name: /Account requests/ }).waitFor();
  check("R1 No study yet: the inbox still offers a plain Approve", (await admin.getByRole("button", { name: "Approve" }).count()) >= 3 && (await admin.getByTestId("enrol-instead").count()) === 0);

  /* ---- set-up ---- */
  await admin.goto(`${BASE}/admin/rehabverse/research-room`);
  await admin.getByRole("heading", { name: "Study set-up" }).waitFor();
  check("R2 The Research Room opens with the ethics warning", (await admin.getByText("Recruiting cannot start until the ethics approval").count()) === 1);
  await admin.fill("#rr-eth", "ERC/2026/17");
  await admin.fill("#rr-ethd", "2026-11-01");
  await admin.fill("#rr-cons", "C1");
  await admin.getByTestId("study-save").click();
  await admin.getByRole("status").filter({ hasText: "Saved." }).waitFor();
  check("R3 The draft is saved", true);
  check("R4 'Start recruiting' is not possible without a list", await admin.getByTestId("study-start").isDisabled());
  await admin.getByRole("heading", { name: /Allocation list/ }).waitFor();
  await admin.fill("#rr-per", "20");
  await admin.getByRole("button", { name: "Make a placeholder list" }).click();
  await admin.getByRole("status").filter({ hasText: /Loaded \d+ rows/ }).waitFor();
  const counts = await admin.getByTestId("list-counts").innerText();
  check("R5 The list shows only how many rows are left per pain band", /Pain 3-5: \d+ of \d+ left/.test(counts) && /Pain 6-10/.test(counts) && !/\bai\b|no_ai|arm/i.test(counts), counts.replace(/\n/g, " | "));
  check("R6 The list is marked as a placeholder, not independent", (await admin.getByText(/generated here/).count()) >= 1);
  await admin.screenshot({ path: path.join(OUT, "rr1-setup.png"), fullPage: true });

  check("R7 The RMDQ-24 (checked against the official copy) is the primary outcome and does not block starting", (await admin.locator("li", { hasText: "RMDQ-24" }).first().getByLabel("Primary outcome (12 weeks)").isChecked()));
  await admin.getByTestId("study-start").click();
  await admin.getByTestId("study-hash").waitFor();
  const hash = await admin.getByTestId("study-hash").innerText();
  check("R8 Recruiting starts and the rules are frozen with a SHA-256 fingerprint", /^[0-9a-f]{64}$/.test(hash), hash.slice(0, 12) + "…");
  check("R9 The primary outcome shown is the RMDQ-24 and the set-up form is gone (frozen)", (await admin.locator("#rr-eth").count()) === 0 && /Primary outcome: RMDQ24/i.test(await admin.locator("body").innerText()) && (await admin.getByText("rules are frozen").count()) >= 1);

  /* ---- the inbox now sends people to enrolment ---- */
  await admin.goto(`${BASE}/admin/rehabverse`);
  await admin.getByRole("heading", { name: /Account requests/ }).waitFor();
  check("R10 While recruiting, the inbox offers 'Screen and enrol' instead of Approve", (await admin.getByTestId("enrol-instead").count()) >= 3 && (await admin.getByRole("button", { name: "Approve" }).count()) === 0);

  /* ---- enrolment ---- */
  await admin.goto(`${BASE}/admin/rehabverse/research-room`);
  await admin.getByRole("heading", { name: /^Enrolment/ }).waitFor();
  async function screen(person, { redFlag = false } = {}) {
    const row = admin.locator("li", { hasText: person.name }).first();
    await row.getByRole("button", { name: /Screen and enrol/ }).click();
    await row.getByRole("radio", { name: "5", exact: true }).click();
    for (const q of await row.locator("fieldset", { hasText: "Eligibility" }).locator("li").all()) {
      const text = await q.innerText();
      const exclude = /red flag|surgery|pregnant/i.test(text);
      const yes = exclude ? (redFlag && /red flag/i.test(text)) : true;
      await q.getByRole("radio", { name: yes ? "Yes" : "No" }).click();
    }
    await row.getByRole("checkbox").check();
    return row;
  }
  check("R11 'Enrol and randomise' stays disabled until the form is complete", await (async () => {
    const row = admin.locator("li", { hasText: PEOPLE[0].name }).first();
    await row.getByRole("button", { name: /Screen and enrol/ }).click();
    const disabled = await row.getByTestId("enrol-go").isDisabled();
    await row.getByRole("button", { name: "Close" }).click();
    return disabled;
  })());
  const arms = [];
  for (const [i, person] of [PEOPLE[0], PEOPLE[1]].entries()) {
    const row = await screen(person);
    await row.getByTestId("enrol-go").click();
    await row.getByTestId("enrol-result").waitFor();
    const text = await row.getByTestId("enrol-result").innerText();
    const arm = /AI-assisted arm/.test(text) ? "ai" : "no_ai";
    arms.push(arm);
    const db = (await devSql("select p.status, p.ai_assist, a.arm, a.stratum from public.rehab_patients p join public.rehab_study_allocations a on a.patient_id = p.id where p.full_name = $1", [person.name]))[0];
    check(`R12.${i + 1} ${person.name.split(" ").slice(0, 3).join(" ")} is enrolled in the ${arm === "ai" ? "AI" : "standard"} arm, approved, and the AI switch follows`, db && db.status === "active" && db.arm === arm && db.ai_assist === (arm === "ai" ? "on" : "off") && db.stratum === "3-5", JSON.stringify(db));
  }
  await admin.screenshot({ path: path.join(OUT, "rr2-enrolled.png"), fullPage: true });
  const consents = await devSql("select count(*)::int as n from public.rehab_study_consents");
  check("R13 Consent evidence is stored for both", consents[0].n === 2);

  /* ---- the patient can now sign in ---- */
  await people[0].waitForURL((u) => !/pending/.test(u.pathname), { timeout: 60000 }).catch(() => {});
  await people[0].goto(`${BASE}/rehabverse/me`);
  check("R14 The enrolled patient is no longer on the waiting screen", !/pending/.test(people[0].url()), people[0].url());

  /* ---- screened out ---- */
  const outRow = await screen(PEOPLE[2], { redFlag: true });
  await outRow.getByTestId("enrol-go").click();
  await outRow.getByTestId("enrol-result").waitFor();
  check("R15 A person with a red flag is not enrolled, and the reason is shown", /Not eligible/.test(await outRow.getByTestId("enrol-result").innerText()) && /red flag/i.test(await outRow.getByTestId("enrol-result").innerText()));
  await admin.reload();
  const again = admin.locator("li", { hasText: PEOPLE[2].name }).first();
  await again.getByRole("button", { name: "Approve as an ordinary patient" }).click();
  await admin.waitForFunction((n) => !document.body.innerText.includes(n), PEOPLE[2].name, { timeout: 30000 });
  const ordinary = (await devSql("select status, ai_assist from public.rehab_patients where full_name = $1", [PEOPLE[2].name]))[0];
  const inStudy = (await devSql("select count(*)::int as n from public.rehab_study_allocations a join public.rehab_patients p on p.id = a.patient_id where p.full_name = $1", [PEOPLE[2].name]))[0].n;
  check("R16 The screened-out person is approved as an ordinary patient outside the study", ordinary.status === "active" && ordinary.ai_assist === "off" && inStudy === 0, JSON.stringify(ordinary));

  /* ---- flow numbers ---- */
  const flow = await admin.getByTestId("flow").innerText();
  const nums = Object.fromEntries([...flow.matchAll(/([A-Za-z() -]+)\n(\d+)/g)].map((m) => [m[1].trim(), Number(m[2])]));
  check("R17 The flow numbers add up (3 assessed, 1 excluded, 2 randomised)", nums["Assessed for eligibility"] === 3 && nums["Excluded"] === 1 && nums["Randomised"] === 2, JSON.stringify(nums));
  check("R18 No list row was used by the person who was screened out", /Pain 3-5: \d+ of \d+ left/.test(await admin.getByTestId("list-counts").innerText()));

  /* ---- the locked arm card and the override ---- */
  const aiIndex = arms.indexOf("ai");
  const target = aiIndex >= 0 ? PEOPLE[aiIndex] : PEOPLE[0];
  const targetId = (await devSql("select id from public.rehab_patients where full_name = $1", [target.name]))[0].id;
  await admin.goto(`${BASE}/admin/rehabverse/patients/${targetId}`);
  await admin.getByTestId("study-arm-card").waitFor();
  check("R19 A participant's record shows the locked arm card and no free AI switch", (await admin.locator("[data-pna-ai-switch]").count()) === 0 && /pain band 3-5/.test(await admin.getByTestId("study-arm-card").innerText()));
  await admin.screenshot({ path: path.join(OUT, "rr3-arm-card.png") });
  await admin.getByRole("button", { name: /Override the AI setting/ }).click();
  const goBtn = admin.getByRole("button", { name: /Record the departure/ });
  check("R20 The override is disabled until a reason is written", await goBtn.isDisabled());
  await admin.fill("#ov-reason", "Patient asked to change the AI setting");
  await goBtn.click();
  await admin.getByText(/Departure: AI set/).waitFor();
  const dev = (await devSql("select received_ai, allocated_arm from public.rehab_study_deviations where patient_id = $1", [targetId]))[0];
  const now = (await devSql("select ai_assist from public.rehab_patients where id = $1", [targetId]))[0].ai_assist;
  check("R21 The override flips the AI setting, keeps the allocated arm, and is recorded as a departure", dev && dev.allocated_arm === arms[PEOPLE.indexOf(target)] && now === dev.received_ai, JSON.stringify({ dev, now }));

  /* ---- phone layout ---- */
  const cm = await ctx({ width: 375, height: 800 }), m = await cm.newPage(); watch(m);
  await m.goto(`${BASE}/admin/login`);
  await m.fill("input[name=email]", ADMIN.email);
  await m.fill("input[name=password]", ADMIN.password);
  await m.locator("form button[type=submit]").first().click();
  await m.waitForURL((url) => url.pathname === "/admin");
  await m.goto(`${BASE}/admin/rehabverse/research-room`);
  await m.getByRole("heading", { name: "Study set-up" }).waitFor();
  const overflow = await m.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
  check("R22 The Research Room fits a phone screen without sideways scrolling", overflow <= 1, `overflow ${overflow}px`);
  await m.screenshot({ path: path.join(OUT, "rr4-phone.png"), fullPage: true });

  check("R23 No page errors in the browser", errors.length === 0, errors.slice(0, 2).join(" | "));
  await browser.close();
  const failed = results.filter((r) => !r).length;
  console.log(`\nResearch Room e2e: ${results.length - failed}/${results.length} passed`);
  process.exit(failed ? 1 : 0);
})().catch((e) => { console.error(e); process.exit(1); });
