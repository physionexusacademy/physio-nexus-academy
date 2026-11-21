/**
 * RehabVerse account approval e2e (LOCAL backend, never the real project):
 *   REHAB_DEV_SQL=1 node scripts/rehabverse-local/server.mjs
 *   (dev server as in e2e.cjs)   node scripts/rehabverse-local/e2e-approval.cjs
 * Covers: a new account is a request (waiting screen, no e-mail step); the clinic sees it in "Account requests" with the phone number, rejects one
 * (the person reads the reason), approves another (the waiting screen moves on by itself, "Tell them on WhatsApp"); a waiting account can open nothing.
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
const P1 = { email: `approve.${stamp}@example.test`, password: "Patient-One-pass-2026", name: `Approve Me ${stamp}` };
const P2 = { email: `reject.${stamp}@example.test`, password: "Patient-Two-pass-2026", name: `Reject Me ${stamp}` };
const results = [];
const check = (name, ok, detail = "") => {
  results.push(Boolean(ok));
  console.log(`${ok ? "PASS" : "FAIL"}  ${name}${detail ? "  — " + detail : ""}`);
};
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
  const ctx = (vp = { width: 1280, height: 900 }) => browser.newContext({ viewport: vp }).then(async (c) => { await c.addInitScript(() => { try { localStorage.setItem("pna-rv-lang", "en"); } catch { /* ignore */ } }); return c; });
  const errors = [];
  const watch = (page) => page.on("pageerror", (e) => errors.push(e.message));

  const c1 = await ctx(), p1 = await c1.newPage(); watch(p1);
  const c2 = await ctx(), p2 = await c2.newPage(); watch(p2);
  await register(p1, P1, "0300 1112223");
  await register(p2, P2, "0311 4445556");
  check("A1 Both new accounts wait on the waiting screen", (await p1.getByText("Your request is with the clinic").count()) === 1 && (await p2.getByText("Your request is with the clinic").count()) === 1);
  await p1.screenshot({ path: path.join(OUT, "ap1-waiting.png") });

  const ca = await ctx(), admin = await ca.newPage(); watch(admin);
  await admin.goto(`${BASE}/admin/login`);
  await admin.fill("input[name=email]", ADMIN.email);
  await admin.fill("input[name=password]", ADMIN.password);
  await admin.locator("form button[type=submit]").first().click();
  await admin.waitForURL((url) => url.pathname === "/admin");
  await admin.goto(`${BASE}/admin/rehabverse`);
  await admin.getByRole("heading", { name: /Account requests/ }).waitFor();
  const card = admin.locator("section[aria-labelledby=account-requests]");
  check("A2 The clinic sees both requests with the phone numbers", (await card.getByText(P1.name).count()) === 1 && (await card.getByText("0300 1112223").count()) === 1 && (await card.getByText("0311 4445556").count()) === 1);
  check("A3 Each request has a call and a WhatsApp link", (await card.getByRole("link", { name: new RegExp(`WhatsApp ${P1.name}`) }).count()) === 1 && (await card.getByRole("link", { name: new RegExp(`Call ${P2.name}`) }).count()) === 1);
  await admin.screenshot({ path: path.join(OUT, "ap2-admin-requests.png"), fullPage: true });

  // reject P2 with a reason
  const row2 = card.locator("li", { hasText: P2.name });
  await row2.getByRole("button", { name: /Reject/ }).click();
  await row2.locator("textarea").fill("Could not reach you on this number");
  await row2.getByRole("button", { name: "Reject", exact: true }).click();
  await card.getByText(P2.name).waitFor({ state: "detached", timeout: 20000 }).catch(() => undefined);
  check("A4 A rejected request leaves the waiting list", (await card.locator("li", { hasText: P2.name }).filter({ has: admin.getByRole("button", { name: "Approve" }) }).count()) === 0);
  await p2.reload();
  await p2.getByText("Your request could not be approved").waitFor();
  check("A5 The rejected person reads the clinic's reason", (await p2.getByText("Could not reach you on this number").count()) === 1);
  await p2.screenshot({ path: path.join(OUT, "ap3-rejected.png") });
  await p2.goto(`${BASE}/rehabverse/start`);
  await p2.waitForURL(/\/rehabverse\/pending/);
  check("A6 A rejected account still opens nothing", true);

  // approve P1: the waiting screen moves on by itself
  const row1 = card.locator("li", { hasText: P1.name });
  await row1.getByRole("button", { name: "Approve" }).click();
  await admin.getByText(/is approved\./).waitFor();
  const wa = admin.getByRole("link", { name: /Tell them on WhatsApp/ });
  check("A7 After approving, the clinic can tell the person on WhatsApp (number converted to 92…)", (await wa.count()) === 1 && /wa\.me\/92300/.test((await wa.getAttribute("href")) ?? ""));
  await admin.screenshot({ path: path.join(OUT, "ap4-admin-approved.png"), fullPage: true });
  await p1.waitForURL(/\/rehabverse\/start/, { timeout: 60000 });
  check("A8 The waiting screen moves on to the assessment by itself once approved", true);
  await p1.getByText("Where is the problem?").waitFor();
  check("A9 The approved person can start the assessment", true);

  // the admin patient list shows the status
  await admin.goto(`${BASE}/admin/rehabverse/patients`);
  await admin.getByText(P2.name).first().waitFor();
  check("A10 The patient list shows the rejected request", (await admin.locator("li", { hasText: P2.name }).getByText("rejected").count()) === 1);
  check("X No uncaught page errors", errors.length === 0, errors.slice(0, 2).join(" | "));

  await browser.close();
  const failed = results.filter((x) => !x).length;
  console.log(failed ? `\n${failed} of ${results.length} FAILED` : `\nALL ${results.length} PASSED`);
  process.exit(failed ? 1 : 0);
})().catch((e) => { console.error("APPROVAL E2E ERROR:", e); process.exit(1); });
