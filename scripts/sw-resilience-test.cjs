/**
 * Browser test of public/sw.js against a small server that can CUT the connection (reset), hang, or answer 503, the way a filter or a bad network does.
 * Run by hand (needs Playwright's Chromium):   node scripts/sw-resilience-test.cjs
 * It checks what is saved (public pages only), what is never saved (signed-in pages, private/no-store, redirects, queries, API calls), that online
 * navigations always come fresh from the network, and what the visitor sees when the connection is cut.
 */
const http = require("http");
const fs = require("fs");
const path = require("path");
const { chromium } = require("playwright");

const PUBLIC = path.join(__dirname, "..", "public");
const PORT = 8099;
const BASE = `http://127.0.0.1:${PORT}`;
let mode = "up"; // up | down (connection reset) | hang | 503
const hung = new Set(); // connections left hanging on purpose; closed when the mode changes (a real network gives up on them too)
let swVersion = null; // replaces the VERSION constant when set (to test an update)
const hits = {};
const results = [];
const check = (name, ok, detail = "") => {
  results.push(Boolean(ok));
  console.log(`${ok ? "PASS" : "FAIL"}  ${name}${detail ? "  — " + detail : ""}`);
};

const page = (title, extra = "") => `<!doctype html><html><head><meta charset="utf-8"><title>${title}</title></head><body><h1>${title}</h1><p>${extra}</p></body></html>`;

const server = http.createServer((req, res) => {
  const url = new URL(req.url, BASE);
  if (url.pathname === "/__mode") {
    mode = url.searchParams.get("m") || "up";
    for (const socket of hung) socket.destroy();
    hung.clear();
    res.end("ok");
    return;
  }
  hits[url.pathname] = (hits[url.pathname] || 0) + 1;
  const n = hits[url.pathname];
  if (url.pathname === "/sw.js") {
    let src = fs.readFileSync(path.join(PUBLIC, "sw.js"), "utf8");
    if (swVersion) src = src.replace(/const VERSION = "[^"]*";/, `const VERSION = "${swVersion}";`);
    res.writeHead(200, { "content-type": "text/javascript", "cache-control": "no-cache" });
    res.end(src);
    return;
  }
  // like Cloudflare's static assets: /offline.html is sent on to /offline (a navigation must never be answered with a redirected response)
  if (url.pathname === "/offline.html") {
    res.writeHead(307, { location: "/offline" });
    res.end();
    return;
  }
  if (url.pathname === "/offline") {
    res.writeHead(200, { "content-type": "text/html; charset=utf-8", "cache-control": "no-cache" });
    res.end(fs.readFileSync(path.join(PUBLIC, "offline.html")));
    return;
  }
  if (url.pathname === "/images/pna-logo.png") {
    res.writeHead(200, { "content-type": "image/png", "cache-control": "public, max-age=604800" });
    res.end(Buffer.from("iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg==", "base64"));
    return;
  }
  // the network is "cut" for everything else
  if (mode === "down") {
    req.socket.destroy();
    return;
  }
  if (mode === "hang") {
    hung.add(req.socket);
    return;
  }
  if (mode === "503") {
    res.writeHead(503, { "content-type": "text/html" });
    res.end(page("Service unavailable"));
    return;
  }
  const html = (body, headers = {}) => {
    res.writeHead(200, { "content-type": "text/html; charset=utf-8", "cache-control": "public, max-age=0, must-revalidate", ...headers });
    res.end(body);
  };
  if (url.pathname === "/") return html(page("Home", `version ${n}`));
  if (url.pathname === "/skills") return html(page("Skills", `version ${n}`), { "cache-control": "private, no-store" });
  if (url.pathname === "/account" || url.pathname === "/rehabverse/me") return html(page("Signed in page " + url.pathname, "private"));
  if (url.pathname === "/learn/redir") {
    res.writeHead(302, { location: "/learn" });
    res.end();
    return;
  }
  if (url.pathname === "/learn" || url.pathname.startsWith("/learn/") || url.pathname === "/virtual-patient") return html(page("Page " + url.pathname, `version ${n}`));
  if (url.pathname.startsWith("/_next/static/")) {
    res.writeHead(200, { "content-type": "text/javascript", "cache-control": "public, max-age=31536000, immutable" });
    res.end(`window.__chunk = "served ${n}";`);
    return;
  }
  if (url.pathname.startsWith("/teacher-data/")) {
    res.writeHead(200, { "content-type": "application/json", "cache-control": "no-cache" });
    res.end(JSON.stringify({ served: n }));
    return;
  }
  if (url.pathname.startsWith("/api/")) {
    res.writeHead(200, { "content-type": "application/json", "cache-control": "no-store" });
    res.end(JSON.stringify({ served: n }));
    return;
  }
  res.writeHead(404);
  res.end("not found");
});

const set = (m) => fetch(`${BASE}/__mode?m=${m}`).then(() => (mode = m));
const text = (p) => p.evaluate(() => document.body.innerText);
const cacheNames = (p) => p.evaluate(() => caches.keys());
const cacheUrls = (p, prefix) =>
  p.evaluate(async (pre) => {
    const out = [];
    for (const name of await caches.keys()) if (name.startsWith(pre)) for (const r of await (await caches.open(name)).keys()) out.push(new URL(r.url).pathname + new URL(r.url).search);
    return out;
  }, prefix);

(async () => {
  await new Promise((resolve) => server.listen(PORT, "127.0.0.1", resolve));
  const browser = await chromium.launch();
  const ctx = await browser.newContext();
  const p = await ctx.newPage();

  // --- install: the offline page and the home page are saved at once
  await p.goto(BASE + "/", { waitUntil: "load" });
  await p.evaluate(() => navigator.serviceWorker.register("/sw.js", { scope: "/", updateViaCache: "none" }));
  await p.evaluate(() => navigator.serviceWorker.ready);
  await p.waitForFunction(() => navigator.serviceWorker.controller, null, { timeout: 10000 });
  let pages = await cacheUrls(p, "pna-pages-");
  check("install saves the offline page (at /offline, not the redirecting /offline.html)", pages.includes("/offline") && !pages.includes("/offline.html"), pages.join(" "));
  check("install saves the home page", pages.includes("/"));

  // --- online: always fresh from the network, public pages are kept
  await p.goto(BASE + "/learn", { waitUntil: "load" });
  const first = await text(p);
  await p.goto(BASE + "/learn", { waitUntil: "load" });
  const second = await text(p);
  check("online navigations come fresh from the network (no stale copy)", first !== second && /version 2/.test(second), `${first.replace(/\s+/g, " ")} → ${second.replace(/\s+/g, " ")}`);
  check("a public page is saved", (await cacheUrls(p, "pna-pages-")).includes("/learn"));

  // pages that must never be saved
  for (const pth of ["/skills", "/account", "/rehabverse/me", "/learn/redir", "/learn?token=abc123"]) await p.goto(BASE + pth, { waitUntil: "load" });
  pages = await cacheUrls(p, "pna-pages-");
  check("a private/no-store page is not saved", !pages.includes("/skills"));
  check("signed-in pages are not saved", !pages.includes("/account") && !pages.includes("/rehabverse/me"));
  check("a redirected answer is not saved under the first address", !pages.includes("/learn/redir"));
  check("a URL with a query (sign-in codes) is never saved", !pages.some((u) => u.includes("token") || u.includes("?")), pages.join(" "));

  // static files and data
  await p.evaluate(async () => {
    await fetch("/_next/static/chunks/a.js");
    await fetch("/teacher-data/lessons/x.json");
    await fetch("/api/ping");
    await fetch("/images/pna-logo.png");
  });
  const staticSeen = await cacheUrls(p, "pna-static-");
  const dataSeen = await cacheUrls(p, "pna-data-");
  check("hash-named files and pictures are kept", staticSeen.includes("/_next/static/chunks/a.js") && staticSeen.includes("/images/pna-logo.png"), staticSeen.join(" "));
  check("lesson data is kept", dataSeen.includes("/teacher-data/lessons/x.json"));
  check("API calls are never kept", ![...staticSeen, ...dataSeen, ...(await cacheUrls(p, "pna-pages-"))].some((u) => u.startsWith("/api/")));
  const freshData = await p.evaluate(async () => (await (await fetch("/teacher-data/lessons/x.json")).json()).served);
  check("data files come fresh from the network while it works", freshData >= 2, `served ${freshData}`);

  // --- the connection is cut
  await set("down");
  await p.goto(BASE + "/learn", { waitUntil: "load" });
  check("cut connection: the saved copy of a visited public page is shown", /Page \/learn/.test(await text(p)), (await text(p)).replace(/\s+/g, " ").slice(0, 80));
  await p.goto(BASE + "/learn/never-visited", { waitUntil: "load" });
  check("cut connection: a page never visited shows the offline page with help", /We can't reach the site right now/.test(await text(p)) && /Dobara koshish/.test(await text(p)));
  const offlineText = await text(p);
  check("the offline page offers the backup address and Secure DNS", /workers\.dev/.test(offlineText) && /secure DNS/i.test(offlineText));
  await p.goto(BASE + "/account", { waitUntil: "load" });
  check("cut connection: a signed-in page is never shown from a saved copy", /We can't reach the site right now/.test(await text(p)));
  await p.goto(BASE + "/skills", { waitUntil: "load" });
  check("cut connection: a private page is never shown from a saved copy", /We can't reach the site right now/.test(await text(p)));
  await p.goto(BASE + "/learn?utm=x", { waitUntil: "load" });
  check("cut connection: a visited page opened with a tracking query still shows its saved copy", /Page \/learn/.test(await text(p)));
  const offlineFetches = await p.evaluate(async () => {
    const out = {};
    for (const u of ["/_next/static/chunks/a.js", "/teacher-data/lessons/x.json"]) out[u] = await fetch(u).then((r) => r.text(), () => "FAILED");
    out.api = await fetch("/api/ping").then((r) => r.text(), () => "FAILED");
    return out;
  });
  check("cut connection: saved script and lesson data still load", /served/.test(offlineFetches["/_next/static/chunks/a.js"]) && /served/.test(offlineFetches["/teacher-data/lessons/x.json"]), JSON.stringify(offlineFetches));
  check("cut connection: API calls fail honestly (nothing invented)", offlineFetches.api === "FAILED");

  // --- the connection comes back: fresh again
  await set("up");
  await p.goto(BASE + "/learn", { waitUntil: "load" });
  check("connection back: the page is fresh again", /version \d+/.test(await text(p)) && !/We can't reach/.test(await text(p)));

  // --- a server error with a saved copy
  await set("503");
  await p.goto(BASE + "/learn", { waitUntil: "load" });
  check("server error (503) with a saved copy: the saved copy is shown", /Page \/learn/.test(await text(p)));
  await p.goto(BASE + "/learn/another-never-visited", { waitUntil: "load" });
  check("server error without a saved copy: the real answer is shown, not hidden", /Service unavailable/.test(await text(p)));

  // --- a connection that hangs
  await set("hang");
  const t0 = Date.now();
  await p.goto(BASE + "/learn", { waitUntil: "load", timeout: 30000 });
  const waited = Date.now() - t0;
  check("hanging connection with a saved copy: the saved copy appears after about 8 seconds", /Page \/learn/.test(await text(p)) && waited > 7000 && waited < 14000, `${waited} ms`);
  await set("up");

  // --- many pages: the cache stays small
  for (let i = 1; i <= 45; i++) await p.goto(`${BASE}/learn/p${i}`, { waitUntil: "load" });
  pages = await cacheUrls(p, "pna-pages-");
  check("the saved pages are capped (40)", pages.length <= 40, `${pages.length} saved`);

  // --- a new version of the worker removes the old caches and keeps other sites' caches alone
  await p.evaluate(async () => {
    await caches.open("pna-pages-old-version");
    await caches.open("unrelated-cache");
  });
  swVersion = "test-2";
  await p.evaluate(async () => {
    const reg = await navigator.serviceWorker.getRegistration();
    await reg.update();
  });
  // The new worker creates its caches while it installs and deletes the old ones when it activates (after the install): wait for the deletion itself.
  // Poll from here, with pauses: a page that asks caches.keys() on every frame keeps the cache storage so busy that the worker's activation stalls.
  for (let waited = 0; waited < 20000 && (await cacheNames(p)).includes("pna-pages-old-version"); waited += 300) await new Promise((resolve) => setTimeout(resolve, 300));
  const names = await cacheNames(p);
  check("a new worker version deletes the old pna caches", !names.includes("pna-pages-old-version") && !names.includes("pna-pages-2026-11-21-1"), names.join(" "));
  check("...and leaves unrelated caches alone", names.includes("unrelated-cache"));

  await browser.close();
  server.close();
  const failed = results.filter((x) => !x).length;
  console.log(failed ? `\n${failed} of ${results.length} FAILED` : `\nALL ${results.length} PASSED`);
  process.exit(failed ? 1 : 0);
})().catch((error) => {
  console.error(error);
  process.exit(1);
});
