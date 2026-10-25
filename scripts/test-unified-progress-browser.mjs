import { spawn } from "node:child_process";
import { setTimeout as delay } from "node:timers/promises";
import { chromium } from "playwright";

const baseURL = "http://127.0.0.1:4173";
const server = spawn("npm", ["run", "dev", "--", "--hostname", "127.0.0.1", "--port", "4173"], {
  stdio: ["ignore", "pipe", "pipe"],
  // Put npm and its Next.js child in a dedicated process group so cleanup can terminate both.
  detached: true,
  env: { ...process.env, PORT: "4173", NEXT_TELEMETRY_DISABLED: "1" },
});
let serverOutput = "";
server.stdout.on("data", (chunk) => { serverOutput += chunk.toString(); });
server.stderr.on("data", (chunk) => { serverOutput += chunk.toString(); });

async function waitForServer(page) {
  const deadline = Date.now() + 120_000;
  let lastError;
  while (Date.now() < deadline) {
    if (server.exitCode !== null) throw new Error("Next.js dev server exited early:\n" + serverOutput);
    try {
      const response = await page.goto(baseURL, { waitUntil: "domcontentloaded", timeout: 8_000 });
      if (response && response.status() < 500) return;
    } catch (error) { lastError = error; }
    await delay(1_000);
  }
  throw new Error("Next.js dev server did not become ready. " + String(lastError) + "\n" + serverOutput);
}

let browser;
function signalServerGroup(signal) {
  if (!server.pid) return;
  try {
    // detached:true makes the child PID the process-group ID on GitHub's Linux runner.
    process.kill(-server.pid, signal);
  } catch (error) {
    if (error?.code !== "ESRCH") {
      try { server.kill(signal); } catch {}
    }
  }
}

try {
  browser = await chromium.launch({ headless: true });
  const context = await browser.newContext();
  const page = await context.newPage();
  const pageErrors = [];
  page.on("pageerror", (error) => pageErrors.push(error.message));

  await waitForServer(page);
  await page.goto(baseURL, { waitUntil: "networkidle", timeout: 30_000 });
  await page.locator('[data-pna-unified-progress="v1"]').first().waitFor({ state: "visible", timeout: 20_000 });
  console.log("PASS homepage: unified learning progress card renders");

  await page.goto(baseURL + "/daily-challenge", { waitUntil: "domcontentloaded", timeout: 30_000 });
  await page.locator('[data-pna-unified-progress="v1"]').waitFor({ state: "visible", timeout: 20_000 });
  await page.locator("#dc-name").waitFor({ state: "visible", timeout: 20_000 });
  await page.locator("#dc-email").waitFor({ state: "visible", timeout: 20_000 });
  if (!(await page.locator("#dc-name").evaluate((element) => element.hasAttribute("required"))) || !(await page.locator("#dc-email").evaluate((element) => element.hasAttribute("required")))) {
    throw new Error("Daily Challenge onboarding fields are missing required validation.");
  }
  console.log("PASS Daily Challenge: progress card and required onboarding fields render (no real submission made)");

  await page.goto(baseURL + "/clinical-arena", { waitUntil: "domcontentloaded", timeout: 30_000 });
  await page.locator('[data-pna-unified-progress="v1"]').waitFor({ state: "visible", timeout: 20_000 });
  const casePanel = page.locator("#clinical-arena-case");
  await casePanel.waitFor({ state: "visible", timeout: 20_000 });

  // Complete one six-stage simulated case with generic choices. This only writes browser-local progress;
  // it does not submit data to the public leaderboard or call a patient-facing service.
  const askQuestion = casePanel.locator("button").filter({ hasText: /^Ask:/ }).first();
  await askQuestion.click();
  await casePanel.getByRole("button", { name: /Finish history stage/ }).click();
  await casePanel.getByRole("button", { name: /Continue to/ }).click();

  for (let stageIndex = 1; stageIndex < 6; stageIndex++) {
    await casePanel.locator("button.pna-question").first().waitFor({ state: "visible", timeout: 10_000 });
    await casePanel.locator("button.pna-question").first().click();
    await casePanel.getByRole("button", { name: /Check my decision/ }).click();
    if (stageIndex < 5) {
      await casePanel.getByRole("button", { name: /Continue to/ }).click();
    } else {
      await casePanel.getByRole("button", { name: /Next patient|View results/ }).click();
    }
  }

  await page.waitForFunction(() => {
    const raw = localStorage.getItem("pna-unified-progress-v1");
    if (!raw) return false;
    try {
      const value = JSON.parse(raw);
      return Array.isArray(value.eventIds) && value.eventIds.some((id) => id.startsWith("clinical-arena:arena:"))
        && Array.isArray(value.activeDates) && value.activeDates.length > 0
        && value.currentStreak >= 1;
    } catch { return false; }
  }, { timeout: 15_000 });
  console.log("PASS Clinical Arena: completing a case records a unique activity and starts the streak");

  if (pageErrors.length) throw new Error("Browser console errors:\n" + pageErrors.join("\n"));
  console.log("PASS browser smoke tests completed with no uncaught page errors");
} catch (error) {
  console.error(error);
  console.error("Captured Next.js dev server output:\n" + serverOutput);
  process.exitCode = 1;
} finally {
  if (browser) await browser.close();
  // Kill the whole process group: killing only npm leaves Next.js descendants alive,
  // which keep inherited stdout/stderr pipes open and prevent Node from exiting.
  signalServerGroup("SIGTERM");
  const shutdownDeadline = Date.now() + 3_000;
  while (server.exitCode === null && Date.now() < shutdownDeadline) await delay(100);
  if (server.exitCode === null) signalServerGroup("SIGKILL");
  // Also wait for stdio to close; this is the condition that was hanging CI after PASS logs.
  await Promise.race([
    new Promise((resolve) => server.once("close", resolve)),
    delay(2_000),
  ]);
}
