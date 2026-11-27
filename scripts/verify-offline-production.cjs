/**
 * Live check, in a real browser, of what a visitor sees when the connection to the site is cut: the worker registers, a public page opened before still shows
 * from its saved copy, a page never opened (and a signed-in page) shows the offline page, and nothing private is saved. Run after every deploy
 * (.github/workflows/deploy-cloudflare-production.yml, job offline-live) or by hand:   node scripts/verify-offline-production.cjs [https://physionexusacademy.com]
 * Needs Playwright's Chromium. (A local test with a server that resets and hangs connections: scripts/sw-resilience-test.cjs.)
 *
 * The connection is cut the way a dead network cuts it: the browser is started again, on the same profile (so the worker and its saved pages are still there),
 * with a proxy that nothing listens on, so every request fails, the worker's own requests as well. (Playwright's setOffline does not stop the worker's requests
 * in every version, so it cannot be used for this.)
 */
const fs = require("fs");
const os = require("os");
const path = require("path");
const { chromium } = require("playwright");
const { addCiCookie } = require("./ci-members-pass.cjs");

const BASE = (process.argv[2] || process.env.PNA_BASE || "https://physionexusacademy.com").replace(/\/$/, "");
// a sandbox that reaches the internet through a proxy passes it here (CI does not need it)
const UPSTREAM_PROXY = process.env.PNA_BROWSER_PROXY || "";
const results = [];
const check = (name, ok, detail = "") => {
  results.push(Boolean(ok));
  console.log(`${ok ? "PASS" : "FAIL"}  ${name}${detail ? "  — " + detail : ""}`);
};
const text = (p) => p.evaluate(() => document.body.innerText).catch(() => "");
const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));
const short = (s) => s.replace(/\s+/g, " ").slice(0, 80);
const listCaches = (p, prefix) =>
  p.evaluate(async (pre) => {
    const out = [];
    for (const name of await caches.keys()) if (!pre || name.startsWith(pre)) for (const r of await (await caches.open(name)).keys()) out.push(new URL(r.url).pathname + new URL(r.url).search);
    return out;
  }, prefix || "");

(async () => {
  const profile = fs.mkdtempSync(path.join(os.tmpdir(), "pna-offline-profile-"));

  // ---- 1. online: open public pages, the worker registers and saves them
  let ctx = await chromium.launchPersistentContext(profile, {
    headless: true,
    ignoreHTTPSErrors: Boolean(UPSTREAM_PROXY),
    ...(UPSTREAM_PROXY ? { proxy: { server: UPSTREAM_PROXY } } : {}),
  });
  await addCiCookie(ctx, BASE); // members-only mode: the deploy's pass (does nothing when PNA_CI_TOKEN is not set)
  let page = ctx.pages()[0] || (await ctx.newPage());
  await page.goto(`${BASE}/learn`, { waitUntil: "load", timeout: 60000 });
  const registered = await page.evaluate(async () => {
    if (!("serviceWorker" in navigator)) return "no service worker support";
    const reg = await Promise.race([navigator.serviceWorker.ready, new Promise((r) => setTimeout(() => r(null), 20000))]);
    return reg && reg.active ? reg.active.scriptURL : "not registered";
  });
  check("the service worker registers on the first visit", /\/sw\.js$/.test(registered), registered);

  // the first visit is saved by the page asking the worker (it loaded before the worker controlled it): wait for it
  let saved = [];
  for (let i = 0; i < 30; i++) {
    saved = await listCaches(page, "pna-pages-");
    if (saved.includes("/learn") && saved.includes("/offline")) break;
    await sleep(500);
  }
  check("the offline page is saved (at /offline)", saved.includes("/offline"), saved.join(" "));
  check("the page just opened (/learn) is saved", saved.includes("/learn"), saved.join(" "));

  // a second public page and a signed-in page, opened online while the worker controls the browser
  await page.goto(`${BASE}/skills`, { waitUntil: "load", timeout: 60000 });
  await page.goto(`${BASE}/account`, { waitUntil: "load", timeout: 60000 }).catch(() => {});
  await sleep(2000);
  const savedOnline = await listCaches(page);
  const privateSaved = savedOnline.filter((u) => /^\/(account|admin|api|rehabverse\/me|daily-challenge|leagues)/.test(u) || u.includes("?"));
  check("nothing private is saved (account, admin, API, patient pages, queries)", privateSaved.length === 0, privateSaved.join(" ") || `${savedOnline.length} saved files`);
  check("the second visited page (/skills) is saved", savedOnline.includes("/skills"));
  await ctx.close();

  // ---- 2. the connection is cut: same browser profile, a proxy nothing listens on, so every request fails (the worker's too)
  ctx = await chromium.launchPersistentContext(profile, { headless: true, args: ["--proxy-server=http://127.0.0.1:9"] });
  page = ctx.pages()[0] || (await ctx.newPage());
  const open = async (pathname) => {
    await page.goto(`${BASE}${pathname}`, { waitUntil: "load", timeout: 30000 }).catch((error) => console.log(`   (${pathname}: ${error.message.split("\n")[0]})`));
    return text(page);
  };

  const learn = await open("/learn");
  check("cut connection: a page opened before still shows (the saved copy)", /PNA Teacher|Learn|lesson/i.test(learn) && !/We can't reach the site right now/.test(learn), short(learn));
  const skills = await open("/skills");
  check("cut connection: a second visited page shows too", /Skills/i.test(skills) && !/We can't reach the site right now/.test(skills), short(skills));
  const never = await open("/learn/never-opened-before-xyz");
  check("cut connection: a page never opened shows the offline page with what to try", /We can't reach the site right now/.test(never) && /workers\.dev/.test(never), short(never));
  // A signed-in page that was never opened: not a page the worker saves, so the cut shows the offline page, not a saved copy.
  const patient = await open("/rehabverse/me");
  check("cut connection: a signed-in (patient) page is never shown from a saved copy", /We can't reach the site right now/.test(patient), short(patient));
  await ctx.close();

  fs.rmSync(profile, { recursive: true, force: true });
  const failed = results.filter((x) => !x).length;
  console.log(failed ? `\n${failed} of ${results.length} FAILED` : `\nALL ${results.length} PASSED`);
  process.exit(failed ? 1 : 0);
})().catch((error) => {
  console.error(error);
  process.exit(1);
});
