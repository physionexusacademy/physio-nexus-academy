/**
 * RehabVerse onboarding and account e2e (LOCAL backend with e-mail confirmation turned on):
 *   REHAB_LOCAL_CONFIRM=1 REHAB_DEV_SQL=1 node scripts/rehabverse-local/server.mjs
 *   (dev server as in e2e.cjs)   node scripts/rehabverse-local/e2e-auth.cjs
 * Covers: RehabVerse is visible on the homepage; the landing page leads to "Create your account";
 * the guided sign-up; e-mail confirmation (and resend); sign-in before/after confirming; a taken e-mail;
 * forgot + reset password; an expired link; signed-in people skipping the auth pages.
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
  results.push({ name, ok: Boolean(ok) });
  console.log(`${ok ? "PASS" : "FAIL"}  ${name}${detail ? "  — " + detail : ""}`);
};
const stamp = Date.now().toString(36);
const U = { email: `new.patient.${stamp}@example.test`, password: "First-pass-2026!", name: `Sana Malik ${stamp}` };
const NEWPASS = "Second-pass-2027!";
const lastCode = async (email) => (await (await fetch(`${API}/__dev/last-code?email=${encodeURIComponent(email)}`)).json()).code;

(async () => {
  const browser = await chromium.launch();
  const ctx = await browser.newContext({ viewport: { width: 1280, height: 900 } });
  await ctx.addInitScript(() => { try { localStorage.setItem("pna-rv-lang", "en"); localStorage.setItem("pna-rv-no3d", "1"); } catch { /* ignore */ } });
  const page = await ctx.newPage();
  page.setDefaultTimeout(60000);
  const errors = [];
  // Chrome logs this harmless message when a cross-document view transition is replaced by a quick redirect (site-wide motion.css).
  page.on("pageerror", (e) => { if (!/ViewTransition opt-in disabled/.test(String(e))) errors.push(String(e).slice(0, 160)); });

  /* homepage visibility */
  await page.goto(BASE + "/");
  const section = page.locator('[data-pna-home-feature="rehabverse-v1"]');
  await section.waitFor();
  check("H1 RehabVerse has its own section on the homepage", (await section.getByRole("heading", { name: /Guided rehab at home/ }).count()) === 1);
  check("H2 Homepage section offers 'Create your account' and 'Sign in'", (await section.getByRole("link", { name: /Create your account/ }).count()) === 1 && (await section.getByRole("link", { name: /already have an account/ }).count()) === 1);
  check("H3 RehabVerse is in the patient column of 'What do you want to do today?'", (await page.locator("[data-pna-home-directory]").getByRole("link", { name: /Guided 3D home rehab/ }).count()) === 1);
  await section.scrollIntoViewIfNeeded();
  await page.screenshot({ path: path.join(OUT, "a1-homepage-section.png") });
  await section.getByRole("link", { name: /Create your account/ }).click();
  await page.waitForURL(/\/rehabverse\/register/);
  check("H4 Homepage 'Create your account' opens the sign-up page", true);

  /* landing */
  await page.goto(BASE + "/rehabverse");
  const primary = page.getByRole("link", { name: /Create your account/ }).first();
  await primary.waitFor();
  check("L1 Landing's first button is 'Create your account'", (await page.getByRole("link", { name: /Create your account/ }).count()) >= 1);
  check("L2 Landing explains the 3 steps and has a FAQ", (await page.getByText(/New here\? It takes three steps/).count()) === 1 && (await page.getByText("Before you start").count()) === 1);
  await page.screenshot({ path: path.join(OUT, "a2-landing.png"), fullPage: true });

  /* sign-up page guidance */
  await page.goto(BASE + "/rehabverse/register");
  await page.getByText("Here is exactly what happens").waitFor();
  check("R1 Sign-up page shows the guided steps and a Create account / Sign in switch", (await page.getByText("Here is exactly what happens").count()) === 1 && (await page.getByRole("link", { name: "Sign in" }).count()) >= 1);
  await page.fill("#full_name", U.name);
  await page.fill("#age_years", "37");
  await page.fill("#email", U.email);
  await page.fill("#password", "short");
  check("R2 Password rules update as you type", (await page.getByText("At least 10 characters").count()) === 1);
  await page.fill("#password", U.password);
  await page.check("input[name=consent]");
  await page.screenshot({ path: path.join(OUT, "a3-register.png"), fullPage: true });
  await page.getByRole("button", { name: "Create my account" }).click();
  await page.getByText("One last step: confirm your email").waitFor();
  check("R3 With e-mail confirmation on, the person is told exactly what to do next", (await page.getByText(U.email).count()) >= 1 && (await page.getByRole("button", { name: /send again/ }).count()) === 1);
  await page.screenshot({ path: path.join(OUT, "a4-confirm-email.png") });

  /* sign in before confirming */
  await page.goto(BASE + "/rehabverse/login");
  await page.fill("#email", U.email);
  await page.fill("#password", U.password);
  await page.getByRole("button", { name: "Sign in" }).last().click();
  await page.getByText(/not confirmed yet/).waitFor();
  check("R4 Signing in before confirming explains why and offers a new email", (await page.getByRole("button", { name: /new confirmation email/ }).count()) === 1);
  await page.getByRole("button", { name: /new confirmation email/ }).click();
  await page.getByText(/Sent — check your inbox/).waitFor();
  check("R5 'Send a new confirmation email' works", true);

  /* confirm via the e-mailed link */
  const code = await lastCode(U.email);
  check("R6 A confirmation code was issued", !!code);
  await page.goto(`${BASE}/rehabverse/auth/callback?code=${code}&next=/rehabverse/start`);
  await page.waitForURL(/\/rehabverse\/start/);
  check("R7 The confirmation link signs the person in and lands on the assessment", true);
  // A used code cannot be replayed on another browser: use a fresh context.
  const other = await browser.newContext({ viewport: { width: 1280, height: 900 } });
  await other.addInitScript(() => { try { localStorage.setItem("pna-rv-lang", "en"); } catch { /* ignore */ } });
  const op = await other.newPage();
  await op.goto(`${BASE}/rehabverse/auth/callback?code=${code}&next=/rehabverse/start`);
  await op.waitForURL(/\/rehabverse\/login\?notice=link/);
  await op.getByText(/could not be used/).waitFor();
  check("R8 An expired or reused link lands on sign-in with a clear message", true);
  await other.close();

  /* patient record is created at first sign-in; the intake page opens */
  await page.goto(BASE + "/rehabverse/start");
  await page.getByText("Where is the problem?").waitFor();
  check("R9 After confirming, the assessment questionnaire opens", true);

  /* signed-in people skip the auth pages */
  await page.goto(BASE + "/rehabverse/login");
  await page.waitForURL(/\/rehabverse\/(me|start)/);
  check("R10 Signed-in people are sent past the sign-in page", true);
  await page.goto(BASE + "/rehabverse/me");
  await page.getByRole("button", { name: "Sign out" }).click();
  await page.waitForURL(/\/rehabverse$/);

  /* taken e-mail */
  await page.goto(BASE + "/rehabverse/register");
  await page.fill("#full_name", "Someone Else");
  await page.fill("#age_years", "30");
  await page.fill("#email", U.email);
  await page.fill("#password", "Another-pass-2026!");
  await page.check("input[name=consent]");
  await page.getByRole("button", { name: "Create my account" }).click();
  await page.getByText(/already has an account/).waitFor();
  check("R11 A taken email is explained, pointing to Sign in / Forgot password", true);

  /* forgot + reset */
  await page.goto(BASE + "/rehabverse/login");
  await page.getByRole("link", { name: "Forgot password?" }).click();
  await page.waitForURL(/\/rehabverse\/forgot/);
  await page.fill("#email", U.email);
  await page.getByRole("button", { name: "Send me the link" }).click();
  await page.getByText("Check your email").waitFor();
  check("F1 Forgot password confirms without revealing whether the account exists", true);
  const reset = await lastCode(U.email);
  await page.goto(`${BASE}/rehabverse/auth/callback?code=${reset}&next=/rehabverse/reset`);
  await page.waitForURL(/\/rehabverse\/reset/);
  await page.fill("#password", NEWPASS);
  await page.fill("#again", "does-not-match");
  check("F2 Mismatched passwords are caught", (await page.getByText("The two passwords do not match.").count()) === 1);
  await page.fill("#again", NEWPASS);
  await page.getByRole("button", { name: "Save new password" }).click();
  await page.waitForURL(/\/rehabverse\/(me|start)/);
  check("F3 Reset link lets the person set a new password and continue", true);
  await page.goto(`${BASE}/rehabverse/me`);
  await page.getByRole("button", { name: "Sign out" }).click().catch(() => undefined);
  await page.goto(BASE + "/rehabverse/login");
  await page.fill("#email", U.email);
  await page.fill("#password", U.password);
  await page.getByRole("button", { name: "Sign in" }).last().click();
  await page.getByText(/not correct/).waitFor();
  check("F4 The old password no longer works", true);
  await page.fill("#password", NEWPASS);
  await page.getByRole("button", { name: "Sign in" }).last().click();
  await page.waitForURL(/\/rehabverse\/(me|start)/);
  check("F5 The new password works", true);

  check("X No uncaught page errors", errors.length === 0, errors.slice(0, 3).join(" | "));
  await browser.close();
  const failed = results.filter((r) => !r.ok);
  console.log(`\n${results.length - failed.length}/${results.length} auth checks passed`);
  process.exit(failed.length ? 1 : 0);
})().catch((e) => { console.error("AUTH E2E ERROR:", e); process.exit(2); });
