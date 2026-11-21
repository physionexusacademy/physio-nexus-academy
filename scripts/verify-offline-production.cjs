/**
 * Live check, in a real browser, of what a visitor sees when the connection to the site is cut: the worker registers, a public page opened before still shows
 * from its saved copy, a page never opened (and a signed-in page) shows the offline page, and nothing private is saved. Run after every deploy
 * (.github/workflows/deploy-cloudflare-production.yml, job offline-live) or by hand:   node scripts/verify-offline-production.cjs [https://physionexusacademy.com]
 * Needs Playwright's Chromium. (A local test with a server that resets and hangs connections: scripts/sw-resilience-test.cjs.)
 */
const { chromium } = require("playwright");

const BASE = (process.argv[2] || process.env.PNA_BASE || "https://physionexusacademy.com").replace(/\/$/, "");
const results = [];
const check = (name, ok, detail = "") => {
  results.push(Boolean(ok));
  console.log(`${ok ? "PASS" : "FAIL"}  ${name}${detail ? "  — " + detail : ""}`);
};
const text = (p) => p.evaluate(() => document.body.innerText);
const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

(async () => {
  const launch = { };
  // a sandbox that reaches the internet through a proxy passes it in HTTPS_PROXY (CI does not need it)
  if (process.env.PNA_BROWSER_PROXY) launch.proxy = { server: process.env.PNA_BROWSER_PROXY };
  const browser = await chromium.launch(launch);
  const ctx = await browser.newContext({ ignoreHTTPSErrors: Boolean(process.env.PNA_BROWSER_PROXY) });
  const page = await ctx.newPage();
  let failedCount = 0;
  try {
    // 1. open a public page: the worker registers and takes over
    await page.goto(`${BASE}/learn`, { waitUntil: "load", timeout: 60000 });
    const registered = await page.evaluate(async () => {
      if (!("serviceWorker" in navigator)) return "no service worker support";
      const reg = await Promise.race([navigator.serviceWorker.ready, new Promise((r) => setTimeout(() => r(null), 20000))]);
      return reg && reg.active ? reg.active.scriptURL : "not registered";
    });
    check("the service worker registers on the first visit", /\/sw\.js$/.test(registered), registered);

    // 2. the first visit is saved by the page asking the worker (it loaded before the worker controlled it); wait for it
    let saved = [];
    for (let i = 0; i < 30; i++) {
      saved = await page.evaluate(async () => {
        const out = [];
        for (const name of await caches.keys()) if (name.startsWith("pna-pages-")) for (const r of await (await caches.open(name)).keys()) out.push(new URL(r.url).pathname);
        return out;
      });
      if (saved.includes("/learn") && saved.includes("/offline")) break;
      await sleep(500);
    }
    check("the offline page is saved (at /offline)", saved.includes("/offline"), saved.join(" "));
    check("the page just opened (/learn) is saved", saved.includes("/learn"), saved.join(" "));

    // 3. open a second public page while online (it is controlled now), then cut the connection
    await page.goto(`${BASE}/skills`, { waitUntil: "load", timeout: 60000 });
    await page.goto(`${BASE}/account`, { waitUntil: "load", timeout: 60000 }).catch(() => {});
    await sleep(1500);
    await ctx.setOffline(true);

    // 4. connection cut
    await page.goto(`${BASE}/learn`, { waitUntil: "load", timeout: 30000 }).catch((error) => console.log("goto /learn offline:", error.message.split("\n")[0]));
    const learn = await text(page).catch(() => "");
    check("cut connection: a page opened before still shows (the saved copy)", /PNA Teacher|Learn|lesson/i.test(learn) && !/We can't reach the site right now/.test(learn), learn.replace(/\s+/g, " ").slice(0, 80));

    await page.goto(`${BASE}/skills`, { waitUntil: "load", timeout: 30000 }).catch(() => {});
    check("cut connection: a second visited page shows too", /Skills/i.test(await text(page).catch(() => "")) && !/We can't reach the site right now/.test(await text(page).catch(() => "")));

    await page.goto(`${BASE}/learn/never-opened-before-xyz`, { waitUntil: "load", timeout: 30000 }).catch((error) => console.log("goto never-opened offline:", error.message.split("\n")[0]));
    const never = await text(page).catch(() => "");
    check("cut connection: a page never opened shows the offline page with what to try", /We can't reach the site right now/.test(never) && /workers\.dev/.test(never), never.replace(/\s+/g, " ").slice(0, 80));

    await page.goto(`${BASE}/account`, { waitUntil: "load", timeout: 30000 }).catch(() => {});
    const account = await text(page).catch(() => "");
    check("cut connection: a signed-in page is never shown from a saved copy", /We can't reach the site right now/.test(account), account.replace(/\s+/g, " ").slice(0, 80));

    // 5. nothing private was saved
    await ctx.setOffline(false);
    const everything = await page.evaluate(async () => {
      const out = [];
      for (const name of await caches.keys()) for (const r of await (await caches.open(name)).keys()) out.push(new URL(r.url).pathname + new URL(r.url).search);
      return out;
    });
    const privateSaved = everything.filter((u) => /^\/(account|admin|api|rehabverse\/me|daily-challenge|leagues)/.test(u) || u.includes("?"));
    check("nothing private is saved (account, admin, API, patient pages, queries)", privateSaved.length === 0, privateSaved.join(" ") || `${everything.length} saved files`);
  } finally {
    await browser.close();
  }
  failedCount = results.filter((x) => !x).length;
  console.log(failedCount ? `\n${failedCount} of ${results.length} FAILED` : `\nALL ${results.length} PASSED`);
  process.exit(failedCount ? 1 : 0);
})().catch((error) => {
  console.error(error);
  process.exit(1);
});
