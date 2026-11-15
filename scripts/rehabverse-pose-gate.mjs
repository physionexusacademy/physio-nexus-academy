/**
 * RehabVerse pose quality gate: opens the 3D exercise library in a browser, shows every exercise on the real model (both sides, and its
 * "common mistake" version), poses it at 48 moments of the repetition and fails when something looks wrong: a body part sunk into the mat /
 * bed / floor, a body floating above its surface, planted feet that lift, a jump, a repetition that does not come back, a contact that does
 * not happen, or a left side that differs from the right. (The checks are in src/lib/rehabverse/pose-check.ts; the numbers come from the
 * development hooks of the player, window.__rvPlayer.)
 *
 *   npm run validate:rehabverse-poses                 (starts the dev server itself)
 *   RV_URL=http://127.0.0.1:3100 node --experimental-strip-types scripts/rehabverse-pose-gate.mjs   (against a running one)
 *
 * Options (environment): RV_ONLY=id1,id2 to check some exercises; RV_SHOTS=<dir> to save one picture of each exercise (for a person to look at).
 */
import fs from "node:fs";
import path from "node:path";
import { createRequire } from "node:module";
import { spawn } from "node:child_process";
import { compareSides } from "../src/lib/rehabverse/pose-check.ts";

const require = createRequire(import.meta.url);
function loadPlaywright() {
  for (const base of [process.env.PNA_BROWSER_QA_DIR && path.join(process.env.PNA_BROWSER_QA_DIR, "node_modules/playwright"), "playwright"]) {
    if (!base) continue;
    try {
      return require(base);
    } catch {
      /* try the next place */
    }
  }
  throw new Error("Playwright is not installed (npm install playwright, or set PNA_BROWSER_QA_DIR)");
}
const { chromium } = loadPlaywright();

const dataDir = "public/rehabverse-data";
const all = fs
  .readdirSync(dataDir)
  .filter((f) => f.endsWith(".json"))
  .flatMap((f) => JSON.parse(fs.readFileSync(path.join(dataDir, f), "utf8")));
const only = process.env.RV_ONLY ? new Set(process.env.RV_ONLY.split(",")) : null;
const exercises = all.filter((e) => !only || only.has(e.id));
if (!exercises.length) throw new Error("no exercises to check");

let server = null;
let base = process.env.RV_URL;
if (!base) {
  const port = Number(process.env.RV_PORT || 3100);
  base = `http://127.0.0.1:${port}`;
  server = spawn("npx", ["next", "dev", "-p", String(port)], {
    env: { ...process.env, PNA_SKIP_CF_DEV: "1", NEXT_TELEMETRY_DISABLED: "1", NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL || "http://127.0.0.1:54321", NEXT_PUBLIC_SUPABASE_ANON_KEY: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "placeholder-anon-key" },
    stdio: "ignore",
  });
  for (let i = 0; i < 120; i++) {
    try {
      if ((await fetch(base + "/rehabverse/library")).ok) break;
    } catch {
      /* not up yet */
    }
    await new Promise((resolve) => setTimeout(resolve, 2000));
  }
}

const shots = process.env.RV_SHOTS;
if (shots) fs.mkdirSync(shots, { recursive: true });
const problems = [];
const started = Date.now();
const browser = await chromium.launch({ args: ["--use-gl=angle", "--use-angle=swiftshader", "--enable-unsafe-swiftshader"] });
try {
  const page = await browser.newPage({ viewport: { width: 760, height: 560 } });
  page.on("pageerror", (error) => problems.push(`page error: ${String(error).slice(0, 200)}`));
  await page.addInitScript(() => {
    localStorage.setItem("pna-rv-lang", "en");
    window.__rvWide = true;
  });
  await page.goto(`${base}/rehabverse/library`, { waitUntil: "domcontentloaded", timeout: 240000 });
  await page.waitForSelector("ul button strong", { timeout: 240000 });

  // (the figure may still be rebuilding after a change of side: ask again a few times)
  const measure = async () => {
    for (let attempt = 0; attempt < 8; attempt++) {
      const result = await page.evaluate(() => window.__rvPlayer.check(48));
      if (result) return result;
      await page.waitForTimeout(400);
    }
    throw new Error("the figure was not ready");
  };
  const settle = () => page.evaluate(() => new Promise((resolve) => requestAnimationFrame(() => requestAnimationFrame(() => setTimeout(resolve, 60)))));
  // A re-render of the page (a language switch, a keystroke in the search box) must not rebuild the 3D stage: it froze phones for seconds
  // (the model and the voice stopped). The player counts its activations in development; they must not change.
  try {
    const first = exercises[0];
    await page.locator("ul button", { has: page.locator("strong", { hasText: new RegExp(`^${first.name.en.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}$`) }) }).first().click({ timeout: 30000 });
    await page.waitForFunction((id) => window.__rvPlayer && window.__rvPlayer.state().id === id && window.__rvPlayer.state().ready, first.id, { timeout: 120000 });
    const before = await page.evaluate(() => window.__rvPlayer.state().activations);
    const toggle = page.locator("[role=group][aria-label=Language]").first();
    for (const name of ["English", "Roman Urdu", "English"]) {
      await toggle.getByRole("button", { name, exact: true }).click();
      await page.waitForTimeout(500);
    }
    const search = page.getByLabel("Search exercises");
    await search.fill("zz");
    await page.waitForTimeout(300);
    await search.fill("");
    await page.waitForTimeout(500);
    const after = await page.evaluate(() => window.__rvPlayer.state().activations);
    if (after !== before) problems.push(`library: a language switch or a search keystroke rebuilt the 3D stage (${after - before} time(s))`);
  } catch (error) {
    problems.push(`library: the language / search re-render check could not run (${String(error.message).split("\n")[0]})`);
  }
  for (const exercise of exercises) {
    try {
      await page.locator("ul button", { has: page.locator("strong", { hasText: new RegExp(`^${exercise.name.en.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}$`) }) }).first().click({ timeout: 30000 });
      await page.waitForFunction((id) => window.__rvPlayer && window.__rvPlayer.state().id === id && window.__rvPlayer.state().ready && window.__rvPlayer.cycle().length > 0 && !document.querySelector("figure [role=status]"), exercise.id, { timeout: 120000 });
      const runs = {};
      for (const side of ["left", "right"]) {
        await page.evaluate((s) => { window.__rvPlayer.setMistake(false); window.__rvPlayer.setSide(s); }, side);
        await page.waitForFunction((s) => window.__rvPlayer.state().side === s && !window.__rvPlayer.state().mistake, side, { timeout: 30000 });
        await settle();
        const result = await measure();
        runs[side] = result;
        for (const v of result.violations) problems.push(`${exercise.id} [${side}]: ${v.kind} at ${v.at}: ${v.detail}`);
      }
      for (const v of compareSides(runs.left.heights, runs.right.heights)) problems.push(`${exercise.id}: ${v.kind} at ${v.at}: ${v.detail}`);
      if (exercise.motion.mistake) {
        await page.evaluate(() => window.__rvPlayer.setMistake(true));
        await page.waitForFunction(() => window.__rvPlayer.state().mistake, null, { timeout: 30000 });
        await settle();
        const result = await measure();
        // the faulty version is allowed to look wrong in the way it teaches (it need not touch or come back), but not to sink into the bed
        for (const v of result.violations.filter((x) => x.kind === "penetrates" || x.kind === "jumps")) problems.push(`${exercise.id} [common mistake]: ${v.kind} at ${v.at}: ${v.detail}`);
        await page.evaluate(() => window.__rvPlayer.setMistake(false));
        await page.waitForFunction(() => !window.__rvPlayer.state().mistake, null, { timeout: 30000 });
      }
      if (shots) {
        const cycle = await page.evaluate(() => window.__rvPlayer.cycle());
        const at = cycle[0].ms + (cycle[1]?.kind === "hold" ? cycle[1].ms * 0.5 : 0);
        await page.evaluate((ms) => window.__rvPlayer.seek(ms), at);
        await page.waitForTimeout(400);
        await page.locator(`figure[data-rv-player="${exercise.id}"] div.relative`).first().screenshot({ path: path.join(shots, `${exercise.id}.png`) });
      }
    } catch (error) {
      problems.push(`${exercise.id}: could not be checked (${String(error.message).split("\n")[0]})`);
    }
  }
} finally {
  await browser.close();
  server?.kill();
}

const seconds = Math.round((Date.now() - started) / 1000);
if (problems.length) {
  console.error(`RehabVerse pose gate FAILED: ${problems.length} problem(s) in ${exercises.length} exercises (${seconds} s)\n - ` + problems.join("\n - "));
  process.exit(1);
}
console.log(`RehabVerse pose gate OK: ${exercises.length} exercises, both sides, ${seconds} s (no sunk or floating body, planted feet, smooth, closed, mirrored).`);
