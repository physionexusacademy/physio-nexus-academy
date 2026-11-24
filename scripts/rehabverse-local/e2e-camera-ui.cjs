/**
 * RehabVerse camera and design e2e (LOCAL backend, never the real project):
 *   REHAB_DEV_SQL=1 node scripts/rehabverse-local/server.mjs
 *   (dev server as in e2e.cjs)   node scripts/rehabverse-local/e2e-camera-ui.cjs
 * Builds a patient with the AI switch on and a Day 1 with camera exercises, then walks the phone-size screens a patient sees (dashboard, the day, the camera button, the
 * set-up guide, the live view with a fake camera showing a real person, the finish screen) and checks what a low-literacy user needs: one big obvious button, Roman Urdu,
 * spoken help, 44px targets, 16px+ text, no sideways scrolling.
 */
const { chromium } = require("playwright");
const fs = require("fs");
const path = require("path");

const BASE = process.env.E2E_BASE ?? "http://127.0.0.1:3100";
const API = process.env.E2E_API ?? "http://127.0.0.1:54321";
const OUT = process.env.E2E_OUT ?? path.join(process.cwd(), "e2e-out");
const VIDEO = process.env.E2E_FAKE_VIDEO ?? "/tmp/claude-0/fixtures/person-clean.y4m";
fs.mkdirSync(OUT, { recursive: true });
const stamp = Date.now().toString(36);
const ADMIN = { email: "admin@pna.test", password: "AdminPass#2026" };
const PATIENT = { email: `cam.${stamp}@example.test`, password: "Patient-Cam-pass-2026", name: `Camera Tester ${stamp}` };
const results = [];
const check = (name, ok, detail = "") => { results.push(Boolean(ok)); console.log(`${ok ? "PASS" : "FAIL"}  ${name}${detail ? "  — " + detail : ""}`); };

async function token(who) {
  const r = await fetch(`${API}/auth/v1/token?grant_type=password`, { method: "POST", headers: { "content-type": "application/json", apikey: "local-anon-key" }, body: JSON.stringify({ email: who.email, password: who.password }) });
  if (!r.ok) throw new Error("login failed " + (await r.text()));
  return (await r.json()).access_token;
}
async function rpc(tok, fn, args) {
  const r = await fetch(`${API}/rest/v1/rpc/${fn}`, { method: "POST", headers: { "content-type": "application/json", apikey: "local-anon-key", authorization: `Bearer ${tok}` }, body: JSON.stringify(args ?? {}) });
  const body = await r.text();
  if (!r.ok) throw new Error(`${fn}: ${body}`);
  return body ? JSON.parse(body) : null;
}

(async () => {
  const browser = await chromium.launch({ args: ["--use-fake-ui-for-media-stream", "--use-fake-device-for-media-stream", `--use-file-for-fake-video-capture=${VIDEO}`] });
  const errors = [];
  const watch = (page) => page.on("pageerror", (e) => { if (!/ViewTransition opt-in disabled/.test(String(e))) errors.push(e.message); });

  // ---- a patient with AI on and a Day 1 with camera exercises
  const rc = await browser.newContext({ viewport: { width: 1000, height: 800 } }); const rp = await rc.newPage(); rp.setDefaultTimeout(60000);
  await rp.goto(`${BASE}/rehabverse/register`);
  await rp.fill("#full_name", PATIENT.name); await rp.fill("#age_years", "41"); await rp.fill("#phone", "0300 5551234"); await rp.fill("#email", PATIENT.email); await rp.fill("#password", PATIENT.password);
  await rp.check("input[name=consent]");
  await rp.getByRole("button", { name: "Send my account request" }).click();
  await rp.waitForURL(/\/rehabverse\/pending/, { timeout: 90000 });
  await rc.close();
  const adminTok = await token(ADMIN);
  const pending = (await rpc(adminTok, "rehab_admin_registrations")).pending;
  const me = pending.find((p) => p.full_name === PATIENT.name);
  await rpc(adminTok, "rehab_admin_decide_patient", { p_patient_id: me.id, p_decision: "approve", p_note: null });
  const patTok = await token(PATIENT);
  const a = await rpc(patTok, "rehab_submit_assessment", { p_payload: { client_token: "22222222-2222-4222-8222-222222222222", regions: ["lumbar"], symptoms: ["pain"], pain_now: 4, pain_worst: 6, pain_best: 2, duration: "1_3m", onset: "Gradual", aggravating: "Sitting", relieving: "Walking", functional_limitations: "Long sitting", own_words: "Meri kamar mein dard hai.", red_flags: [] } });
  await rpc(patTok, "rehab_set_language", { p_language: "ru" });
  await rpc(adminTok, "rehab_admin_set_ai_assist", { p_patient_id: me.id, p_enabled: true });
  const plan = await rpc(adminTok, "rehab_admin_save_plan", { p_assessment_id: a.id, p_programme_id: null, p_payload: {
    title: "Back strength", goal: "Sit for longer without pain", unlock_mode: "admin_approval", min_hours_between_sessions: 0,
    sessions: [{ day_number: 1, title: "Day 1 — gentle start", patient_note: "Go slowly.", exercises: [
      { exercise_id: "glute-bridge", exercise_title: "Glute bridge", sets: 2, reps: 8, rest_seconds: 30 },
      { exercise_id: "chin-tuck", exercise_title: "Chin tuck", sets: 2, reps: 8, rest_seconds: 30 },
      { exercise_id: "bird-dog", exercise_title: "Bird dog", sets: 2, reps: 6, rest_seconds: 30 } ] }] } });
  await rpc(adminTok, "rehab_admin_programme_action", { p_programme_id: plan.id, p_action: "approve", p_reason: null });

  // ---- the phone
  const ctx = await browser.newContext({ viewport: { width: 390, height: 844 }, deviceScaleFactor: 2, isMobile: true, hasTouch: true, permissions: ["camera"] });
  ctx.setDefaultTimeout(60000);
  const page = await ctx.newPage(); watch(page);
  await page.goto(`${BASE}/rehabverse/login`);
  await page.fill("input[name=email]", PATIENT.email); await page.fill("input[name=password]", PATIENT.password);
  await page.locator("form button[type=submit]").first().click();
  await page.waitForURL((u) => /\/rehabverse\/(me|start)/.test(u.pathname), { timeout: 90000 });
  await page.addInitScript(() => { window.__pnaSpoken = []; });
  await page.goto(`${BASE}/rehabverse/me`);
  await page.waitForLoadState("networkidle").catch(() => {});
  await page.screenshot({ path: path.join(OUT, "cam1-dashboard.png"), fullPage: true });
  const today = page.getByTestId("today-card");
  await today.waitFor();
  const tb = await today.boundingBox();
  const aiTop = await page.locator("text=/AI assistant/i").first().boundingBox().catch(() => null);
  check("C1 Today's session is the first big button on the dashboard (fully on the first phone screen, above the AI notice)", tb && tb.y + tb.height <= 844 && tb.height >= 100 && tb.width >= 300 && (!aiTop || tb.y < aiTop.y), JSON.stringify(tb));
  check("C2 The dashboard speaks Roman Urdu from the first screen for a patient who chose it", /Aaj ka session shuru karein/.test(await today.innerText()) && (await page.evaluate(() => document.documentElement.dataset.siteLang)) !== "en");
  await today.click();
  await page.waitForURL(/\/rehabverse\/me\/day\//);
  await page.waitForLoadState("networkidle").catch(() => {});
  await page.screenshot({ path: path.join(OUT, "cam2-day.png"), fullPage: true });
  const openBtn = page.locator("[data-pna-formcheck-open]").first();
  await openBtn.scrollIntoViewIfNeeded();
  const hb = await openBtn.boundingBox();
  check("C3 The camera button in the day is huge (at least 96px tall, nearly the full width) and in Roman Urdu", hb && hb.height >= 96 && hb.width >= 300 && /Camera se check karein/.test(await openBtn.innerText()), JSON.stringify(hb));
  await page.screenshot({ path: path.join(OUT, "cam3-button.png") });
  await openBtn.click();
  await page.locator("[data-pna-formcheck-start]").waitFor();
  await page.waitForTimeout(600);
  const studio = page.locator(".fc-studio");
  const sb = await studio.boundingBox();
  check("C4 The camera opens full screen above everything", sb && sb.width >= 389 && sb.height >= 843 && (await page.evaluate(() => document.body.style.overflow)) === "hidden", JSON.stringify(sb));
  await page.screenshot({ path: path.join(OUT, "cam4-setup.png") });
  const start = page.locator("[data-pna-formcheck-start]").first();
  await start.scrollIntoViewIfNeeded();
  const stb = await start.boundingBox();
  const covered = await page.evaluate(({ x, y }) => { const el = document.elementFromPoint(x, y); return !!el && !!el.closest("[data-pna-formcheck-start]"); }, { x: stb.x + stb.width / 2, y: stb.y + stb.height / 2 });
  check("C5 The start button is big and nothing floats over it", stb.height >= 72 && stb.width >= 330 && covered, JSON.stringify(stb));
  const lead = await page.locator(".fc-lead").first().evaluate((el) => parseFloat(getComputedStyle(el).fontSize));
  check("C6 The instruction text is 20px or bigger and in Roman Urdu", lead >= 20 && /Phone ko/.test(await page.locator(".fc-lead").first().innerText()), `${lead}px`);
  const small = await page.evaluate(() => [...document.querySelectorAll(".fc-studio *")].filter((e) => e.childNodes.length && [...e.childNodes].some((n) => n.nodeType === 3 && n.textContent.trim()) && parseFloat(getComputedStyle(e).fontSize) < 14).map((e) => e.textContent.trim().slice(0, 30)));
  check("C7 No text in the studio is smaller than 14px", small.length === 0, small.slice(0, 3).join(" | "));
  const tooSmall = await page.evaluate(() => [...document.querySelectorAll(".fc-studio button")].filter((b) => b.offsetParent !== null).map((b) => ({ t: b.textContent.trim().slice(0, 20), h: b.getBoundingClientRect().height, w: b.getBoundingClientRect().width })).filter((b) => b.h < 48 || b.w < 48));
  check("C8 Every button in the studio is at least 48px", tooSmall.length === 0, JSON.stringify(tooSmall));
  const heard = await page.evaluate(() => window.__pnaSpoken.slice());
  check("C9 The set-up instruction is spoken aloud when the camera opens (voice on by default)", heard.some((t) => /Phone ko/.test(t)), JSON.stringify(heard.slice(0, 2)).slice(0, 120));
  check("C10 No sideways scrolling", (await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth)) <= 1);
  await page.locator("[data-pna-formcheck-listen]").click();
  await page.waitForTimeout(500);
  const heardAgain = await page.evaluate(() => window.__pnaSpoken.length);
  check("C12 The Listen button reads the instruction again", heardAgain > heard.length, `${heardAgain} lines so far`);
  await start.click();
  await page.waitForTimeout(9000);
  await page.screenshot({ path: path.join(OUT, "cam5-live.png") });
  const counter = page.locator("[data-pna-formcheck-reps]");
  const cs = await counter.evaluate((el) => parseFloat(getComputedStyle(el).fontSize)).catch(() => 0);
  const stop = page.locator("[data-pna-formcheck-stop]");
  const stopBox = await stop.locator("i").boundingBox().catch(() => null);
  check("C11 The live screen has a giant counter and a big Finish button", cs >= 64 && stopBox && stopBox.width >= 72, `${cs}px counter; finish ${stopBox && stopBox.width}px`);
  await page.locator("[data-pna-formcheck-more]").click();
  await page.waitForTimeout(300);
  await page.screenshot({ path: path.join(OUT, "cam6-more.png") });
  check("C13 The small options are in one sheet with big buttons", (await page.locator(".fc-sheet .fc-soft").count()) === 3);
  await page.getByRole("button", { name: /Wapas exercise par/ }).click();
  await stop.click();
  await page.locator("[data-pna-formcheck-finished]").waitFor();
  await page.waitForTimeout(500);
  await page.screenshot({ path: path.join(OUT, "cam7-finished.png") });
  const finText = await page.locator("[data-pna-formcheck-finished]").innerText();
  const tickBox = await page.locator(".fc-tick").boundingBox();
  check("C14 The finish screen is simple and honest (nothing counted says so and helps; round tick; big buttons)", /Kuch ginti nahi hua/.test(finText) && !/Shabash/.test(finText) && tickBox && Math.abs(tickBox.width - tickBox.height) < 2, JSON.stringify(tickBox));
  await page.locator("[data-pna-formcheck-finished] .fc-soft", { hasText: "Band karein" }).click();
  await page.waitForTimeout(400);
  check("C15 Closing gives the page back (scrolling works, no camera left on)", (await page.locator(".fc-studio").count()) === 0 && (await page.evaluate(() => document.body.style.overflow)) !== "hidden");
  /* ---- the browser's own camera permission: the heads-up before it asks, and the steps when it is blocked ---- */
  await page.evaluate(() => {
    window.__perm = "prompt";
    window.__realGum = navigator.mediaDevices.getUserMedia.bind(navigator.mediaDevices);
    navigator.permissions.query = async () => ({ get state() { return window.__perm; }, addEventListener(_t, f) { window.__permFn = f; }, removeEventListener() {} });
  });
  await openBtn.scrollIntoViewIfNeeded();
  await openBtn.click();
  await page.locator("[data-pna-formcheck-start]").waitFor();
  await page.waitForTimeout(500);
  check("D1 Before the browser asks, the screen says what will happen and what to press", (await page.locator("[data-pna-formcheck-prompt-note]").count()) === 1 && /Allow/.test(await page.locator("[data-pna-formcheck-prompt-note]").innerText()) && /Start dabane par/.test(await page.locator("[data-pna-formcheck-prompt-note]").innerText()));
  await page.locator("[data-pna-formcheck-close]").click();
  await page.waitForTimeout(300);
  await page.evaluate(() => { window.__perm = "denied"; navigator.mediaDevices.getUserMedia = () => Promise.reject(new DOMException("blocked", "NotAllowedError")); });
  await openBtn.click();
  await page.locator("[data-pna-formcheck-guide]").waitFor();
  await page.screenshot({ path: path.join(OUT, "cam8-blocked.png") });
  const guideText = await page.locator("[data-pna-formcheck-guide]").innerText();
  const stepSizes = await page.locator(".fc-guide-steps li").evaluateAll((els) => els.map((e) => parseFloat(getComputedStyle(e).fontSize)));
  check("D2 When the camera is blocked a guide shows the steps in big Roman Urdu type and hides the Start button", /Camera band hai/.test(guideText) && stepSizes.length >= 3 && stepSizes.every((n) => n >= 19) && (await page.locator("[data-pna-formcheck-start]").count()) === 0, `${stepSizes.length} steps at ${stepSizes[0]}px`);
  const spokenBefore = await page.evaluate(() => window.__pnaSpoken.length);
  await page.locator("[data-pna-formcheck-guide-listen]").click();
  await page.waitForTimeout(400);
  check("D3 The steps can be listened to", (await page.evaluate((n) => window.__pnaSpoken.length > n && window.__pnaSpoken.some((t) => /Camera band hai/.test(t)), spokenBefore)));
  await page.locator("[data-pna-formcheck-guide-check]").click();
  await page.waitForTimeout(800);
  check("D4 'Check again' while still blocked says so plainly", /Abhi bhi band hai/.test(await page.locator("[data-pna-formcheck-guide]").innerText()));
  await page.evaluate(() => { window.__perm = "granted"; navigator.mediaDevices.getUserMedia = window.__realGum; window.__permFn && window.__permFn(); });
  await page.locator("[data-pna-formcheck-start]").waitFor({ timeout: 10000 });
  check("D5 When the person allows the camera, the guide goes away by itself and Start comes back", (await page.locator("[data-pna-formcheck-guide]").count()) === 0);
  await page.locator("[data-pna-formcheck-start]").click();
  await page.locator("[data-pna-formcheck-stop]").waitFor({ timeout: 30000 }).catch(() => {});
  check("D6 …and the camera then starts", (await page.locator("[data-pna-formcheck-stop]").count()) === 1);
  await page.locator("[data-pna-formcheck-close]").click();
  check("C16 No page errors in the browser", errors.length === 0, errors.slice(0, 2).join(" | "));
  await browser.close();
  const failed = results.filter((r) => !r).length;
  console.log(`\nCamera and design e2e: ${results.length - failed}/${results.length} passed`);
  process.exit(failed ? 1 : 0);
})().catch((e) => { console.error(e); process.exit(1); });
