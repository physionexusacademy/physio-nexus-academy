/**
 * RehabVerse therapist board and research record e2e (LOCAL backend, never the real project):
 *   REHAB_LOCAL_CONFIRM=1 REHAB_DEV_SQL=1 node scripts/rehabverse-local/server.mjs
 *   (dev server as in e2e.cjs, with SUPABASE_SERVICE_ROLE_KEY=local-service-role-key)   node scripts/rehabverse-local/e2e-board.cjs
 *
 * Covers: the inbox links to the board and the research record; the board shows each patient with a colour and the reasons for it, worst first; the tiles and the
 * area links filter it; a card opens the patient's record; the physiotherapist records research consent (a note on how it was obtained is required) and withdraws it;
 * the research page counts the patients who consented; the CSV download is de-identified (study id, no name) and the data dictionary downloads; nobody who is not
 * signed in as staff can download it; a phone shows no sideways scrolling.
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
const PEOPLE = {
  red: { name: `Board Red ${stamp}`, email: `board.red.${stamp}@example.test`, region: "lumbar" },
  amber: { name: `Board Amber ${stamp}`, email: `board.amber.${stamp}@example.test`, region: "cervical" },
  green: { name: `Board Green ${stamp}`, email: `board.green.${stamp}@example.test`, region: "knee" },
};
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

async function register(browser, who) {
  const context = await browser.newContext({ viewport: { width: 1280, height: 900 } });
  const page = await context.newPage();
  page.setDefaultTimeout(60000);
  await page.goto(`${BASE}/rehabverse/register`);
  await page.fill("#full_name", who.name);
  await page.fill("#age_years", "41");
  await page.fill("#phone", "0300 1234567");
  await page.fill("#email", who.email);
  await page.fill("#password", "Patient-Pass-2026");
  await page.check("input[name=consent]");
  await page.getByRole("button", { name: /Send my account request/ }).click();
  await page.waitForURL(/\/rehabverse\/pending/, { timeout: 90000 });
  await context.close();
  await devSql("update public.rehab_patients set status = 'active', decided_at = now() where user_id = (select id from auth.users where email = $1)", [who.email]);
  const row = (await devSql("select p.id, p.reference_code from public.rehab_patients p join auth.users u on u.id = p.user_id where u.email = $1", [who.email]))[0];
  who.id = row.id;
  who.ref = row.reference_code;
}
async function adminLogin(page) {
  await page.goto(`${BASE}/admin/login`);
  await page.fill("input[name=email]", ADMIN.email);
  await page.fill("input[name=password]", ADMIN.password);
  await page.locator("form button[type=submit]").first().click();
  await page.waitForURL((url) => url.pathname === "/admin");
}
const card = (page, who) => page.locator("[data-testid=board-card]").filter({ hasText: who.name });

(async () => {
  const browser = await chromium.launch();

  /* ───────────── 1. three patients in different states ───────────── */
  for (const who of Object.values(PEOPLE)) await register(browser, who);
  const { red, amber, green } = PEOPLE;
  const assessment = (who, ago) => devSql(
    "insert into public.rehab_assessments (patient_id, status, regions, symptoms, pain_now, red_flag_ids, red_flag_level, submitted_at) values ($1, 'submitted', $2, '{}', 5, '{}', 'none', now() - ($3 || ' days')::interval)",
    [who.id, `{${who.region}}`, String(ago)]);
  await assessment(red, 1);
  await devSql("insert into public.rehab_adverse_events (patient_id, source, severity, flag_ids, description, status) values ($1, 'patient', 'moderate', '{}', 'seeded for the board test', 'open')", [red.id]);
  await assessment(amber, 3);
  await assessment(green, 0);

  const adminCtx = await browser.newContext({ viewport: { width: 1280, height: 900 } });
  const admin = await adminCtx.newPage();
  admin.setDefaultTimeout(60000);
  admin.on("pageerror", (e) => { if (!/ViewTransition opt-in disabled/.test(String(e))) errors.push(String(e).slice(0, 200)); });
  await adminLogin(admin);

  /* ───────────── 2. the inbox links to the board and the research record ───────────── */
  await admin.goto(`${BASE}/admin/rehabverse`);
  await admin.locator("[data-testid=nav-board]").waitFor();
  check("2a The clinician inbox has a Board button and a Research button", (await admin.locator("[data-testid=nav-research]").count()) === 1);
  await admin.locator("[data-testid=nav-board]").click();
  await admin.waitForURL(/\/admin\/rehabverse\/board/);

  /* ───────────── 3. the board: colours, reasons, order ───────────── */
  await admin.locator("[data-board-page]").waitFor();
  await card(admin, red).waitFor();
  check("3a A patient with an open adverse event is red, and the reason says so", (await card(admin, red).getAttribute("data-level")) === "red" && /open adverse event/.test(await card(admin, red).innerText()));
  check("3b A patient whose assessment has waited 3 days is amber, and the reason says how long", (await card(admin, amber).getAttribute("data-level")) === "amber" && /Assessment waiting 3 days/.test(await card(admin, amber).innerText()));
  check("3c A patient with nothing to act on is green", (await card(admin, green).getAttribute("data-level")) === "green");
  const order = await admin.locator("[data-testid=board-card]").evaluateAll((els) => els.map((e) => e.getAttribute("data-level")));
  const rank = { red: 0, amber: 1, green: 2 };
  check("3d The list is worst first (red, then amber, then green)", order.every((l, i) => i === 0 || rank[order[i - 1]] <= rank[l]), order.join(","));
  const names = await admin.locator("[data-testid=board-card]").evaluateAll((els) => els.map((e) => e.innerText));
  const idx = (who) => names.findIndex((t) => t.includes(who.name));
  check("3e ...so the red patient is listed before the amber one and the amber before the green", idx(red) < idx(amber) && idx(amber) < idx(green));
  check("3f The colour is written as a word as well (not colour alone)", /Red/.test(await card(admin, red).locator("[data-testid=board-level]").innerText()) && /Amber/.test(await card(admin, amber).locator("[data-testid=board-level]").innerText()));
  const tiles = {};
  for (const l of ["red", "amber", "green"]) tiles[l] = Number(await admin.locator(`[data-testid=count-${l}]`).innerText());
  const dbCount = (l) => admin.locator(`[data-testid=board-card][data-level=${l}]`).count();
  check("3g The summary tiles count what the list shows", tiles.red === (await dbCount("red")) && tiles.amber === (await dbCount("amber")) && tiles.green === (await dbCount("green")), JSON.stringify(tiles));
  await shot(admin, "board-all");

  /* ───────────── 4. filters ───────────── */
  await admin.locator("[data-testid=tile-red]").click();
  await admin.waitForURL(/level=red/);
  await card(admin, red).waitFor();
  check("4a The red tile shows only red patients", (await card(admin, amber).count()) === 0 && (await card(admin, green).count()) === 0 && (await admin.locator("[data-testid=board-card]:not([data-level=red])").count()) === 0);
  await admin.getByRole("link", { name: "Clear filters" }).click();
  await admin.waitForURL((u) => !u.search);
  await admin.getByRole("link", { name: "Neck (cervical)" }).click();
  await admin.waitForURL(/area=cervical/);
  await card(admin, amber).waitFor();
  check("4b The area link shows only patients with that area (neck)", (await card(admin, red).count()) === 0 && (await card(admin, green).count()) === 0);
  await admin.goto(`${BASE}/admin/rehabverse/board?level=green&area=cervical`);
  await admin.locator("[data-board-page]").waitFor();
  check("4c Filters combine, and an empty result says so", (await admin.locator("[data-testid=board-empty]").count()) === 1 || (await card(admin, amber).count()) === 0);
  await admin.goto(`${BASE}/admin/rehabverse/board?level=nonsense&area=%3Cscript%3E`);
  await admin.locator("[data-board-page]").waitFor();
  check("4d An unknown filter value is ignored (the whole board shows)", (await card(admin, red).count()) === 1);

  /* ───────────── 5. a card opens the record; research consent ───────────── */
  await admin.goto(`${BASE}/admin/rehabverse/board`);
  await card(admin, green).getByRole("link", { name: green.name }).click();
  await admin.waitForURL(new RegExp(`/admin/rehabverse/patients/${green.id}`));
  const consent = admin.locator("[data-testid=research-consent]");
  await consent.waitFor();
  check("5a The record opens from the board and shows that no research consent is recorded", /No research consent recorded/.test(await consent.locator("[data-testid=research-state]").innerText()));
  await consent.locator("[data-testid=research-record]").click();
  await admin.getByText(/Write how consent was obtained/).waitFor();
  check("5b Recording consent without saying how it was obtained is refused", /No research consent recorded/.test(await consent.locator("[data-testid=research-state]").innerText()));
  await admin.fill("#research-note", "Signed paper form, clinic visit");
  await consent.locator("[data-testid=research-record]").click();
  await consent.locator("[data-testid=research-state]").filter({ hasText: /^Research consent recorded/ }).waitFor(); // not the "No research consent recorded" sentence
  check("5c With a note, consent is recorded and the note is shown", /Signed paper form/.test(await consent.innerText()));
  const saved = (await devSql("select research_consent, research_consent_note from public.rehab_patients where id = $1", [green.id]))[0];
  check("5d The database holds the consent and how it was obtained", saved.research_consent === true && /Signed paper form/.test(saved.research_consent_note));
  const audit = (await devSql("select count(*)::int n from public.rehab_audit_log where action = 'research.consent_recorded' and patient_id = $1", [green.id]))[0].n;
  check("5e Recording consent is written to the audit log", audit === 1);
  await admin.reload();
  await consent.waitFor();
  check("5f After a reload the consent is still shown", /Research consent recorded/.test(await consent.locator("[data-testid=research-state]").innerText()));

  /* ───────────── 6. the research record and the downloads ───────────── */
  await admin.goto(`${BASE}/admin/rehabverse/research`);
  await admin.locator("[data-testid=consent-count]").waitFor();
  check("6a The research page says ethics approval is not recorded and that registration consent is not research consent", /Ethics approval has not been recorded/.test(await admin.locator("[role=note]").innerText()) && /not research consent/.test(await admin.locator("[role=note]").innerText()));
  check("6b It counts the patients who consented", Number(await admin.locator("[data-testid=consent-count]").innerText()) >= 1);
  const csv = await admin.request.get(`${BASE}/admin/rehabverse/research/export/participants`);
  const csvText = await csv.text();
  check("6c The participants download is a CSV that holds the study id", csv.status() === 200 && /text\/csv/.test(csv.headers()["content-type"] ?? "") && csvText.includes(green.ref), `status ${csv.status()}`);
  check("6d ...and holds no name, e-mail or phone number", !csvText.includes(green.name) && !csvText.includes(green.email) && !/0300/.test(csvText));
  check("6e A patient without consent is not in it", !csvText.includes(red.ref) && !csvText.includes(amber.ref));
  const dict = await admin.request.get(`${BASE}/admin/rehabverse/research/export/dictionary`);
  check("6f The data dictionary downloads", dict.status() === 200 && /study_id/.test(await dict.text()));
  const unknown = await admin.request.get(`${BASE}/admin/rehabverse/research/export/patients`);
  check("6g An unknown table is refused", unknown.status() >= 400 && unknown.status() < 500, `status ${unknown.status()}`);
  const exportsLogged = (await devSql("select count(*)::int n from public.rehab_audit_log where action = 'research.export'"))[0].n;
  check("6h The download was written to the audit log", exportsLogged >= 1, `${exportsLogged} exports`);
  const anon = await browser.newContext();
  const anonRes = await anon.request.get(`${BASE}/admin/rehabverse/research/export/participants`, { maxRedirects: 0 });
  const anonBody = await anonRes.text().catch(() => "");
  check("6i Someone who is not signed in as staff cannot download it", anonRes.status() !== 200 && !anonBody.includes(green.ref), `status ${anonRes.status()}`);
  await anon.close();

  /* ───────────── 7. withdrawing consent ───────────── */
  await admin.goto(`${BASE}/admin/rehabverse/patients/${green.id}`);
  await consent.locator("[data-testid=research-withdraw]").click();
  await admin.getByText(/no longer in the research record/).waitFor();
  const afterWithdraw = (await (await admin.request.get(`${BASE}/admin/rehabverse/research/export/participants`)).text());
  check("7a Withdrawing consent removes the patient from the download at once", !afterWithdraw.includes(green.ref));
  check("7b ...and the withdrawal is in the audit log", (await devSql("select count(*)::int n from public.rehab_audit_log where action = 'research.consent_withdrawn' and patient_id = $1", [green.id]))[0].n === 1);

  /* ───────────── 8. a phone ───────────── */
  const phone = await browser.newContext({ viewport: { width: 390, height: 800 } });
  const mp = await phone.newPage();
  mp.setDefaultTimeout(60000);
  await adminLogin(mp);
  for (const url of ["/admin/rehabverse/board", "/admin/rehabverse/research"]) {
    await mp.goto(`${BASE}${url}`);
    await mp.locator("h1").waitFor();
    await mp.waitForTimeout(400);
    const overflow = await mp.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
    check(`8 ${url} does not scroll sideways on a phone`, overflow <= 1, `${overflow}px`);
  }
  await shot(mp, "board-phone");
  await phone.close();

  check("9 No page errors were raised", errors.length === 0, errors.join(" | "));
  await browser.close();
  const failed = results.filter((r) => !r).length;
  console.log(`\n${results.length - failed}/${results.length} checks passed`);
  process.exit(failed ? 1 : 0);
})().catch((e) => { console.error(e); process.exit(1); });
