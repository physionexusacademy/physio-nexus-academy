// PNA update-first service worker.
//
// While the connection to the site works, every page and file follows the browser's normal cache and network rules exactly as it always did: a new
// deployment is never hidden behind an old copy (navigations and data files ask the network first; the only thing served before the network is the
// immutable, hash-named /_next/static files and the pictures, which cannot be out of date). What this worker adds is a safety net for the moments when the connection to the site is CUT on
// the way (a router or an ISP filter resetting it, a weak signal): a person who has opened a public page before sees that saved page (and the data it
// needs) instead of the browser's "This site can't be reached", and anything not saved shows the offline page (/offline, which is public/offline.html) with what to try.
//
// Privacy: only public pages (SAVEABLE_PAGE) are ever saved, never a page of a signed-in person (account, RehabVerse patient pages, admin, API), never a
// response that says `private` or `no-store`, never a URL with a query (sign-in links carry codes), and the saved copies live in this browser only.
//
// skipWaiting + clients.claim let a new worker take over without waiting for every old PNA tab to close. Change VERSION when this file or
// public/offline.html changes: the old caches are deleted when the new worker activates.

const VERSION = "2026-11-21-5";
const PAGES = "pna-pages-" + VERSION;
const STATIC = "pna-static-" + VERSION;
const DATA = "pna-data-" + VERSION;
const KEEP = [PAGES, STATIC, DATA];
const LIMIT = { [PAGES]: 40, [STATIC]: 400, [DATA]: 150 };
// The offline page is public/offline.html. Cloudflare serves it at /offline and redirects /offline.html to it (307): a redirected response must never be
// handed to a navigation (the browser refuses it), so the worker keeps and shows /offline, and clean() rebuilds any answer that did come through a redirect.
const OFFLINE = "/offline";
/** With a saved copy at hand, a page that has not answered within this time is replaced by the saved copy (a connection that hangs instead of resetting). */
const SAVED_COPY_WAIT_MS = 8000;
// The backup address (see src/lib/host-policy.ts): another name and other addresses than the main one, so a network that cuts the main name often lets it through.
// When the main address fails and the backup answers, a public page is opened there (a live page beats a saved one); on the backup address itself nothing moves.
const BACKUP = "https://physio-nexus-academy.physionexusacademypk.workers.dev";
const ON_BACKUP = /\.workers\.dev$/i.test(self.location.hostname);
const BACKUP_PROBE_MS = 3500;

// Public pages whose saved copy may be shown when the connection is cut. Not here on purpose: /account, /admin, /api, /rehabverse/me and the other RehabVerse
// patient pages, the Daily Challenge and the leagues (live scores).
const SAVEABLE_PAGE = new RegExp(
  "^/(?:$" +
    "|learn(?:/|$)|skills(?:/|$)|manual-therapy(?:/|$)|conditions(?:/|$)|msk-special-tests(?:/|$)|health-calculators(?:/|$)" +
    "|virtual-patient/?$|rehabverse(?:/library)?/?$|symptom-checker/?$" +
    "|resources/?$|research/?$|workshops(?:/|$)|training(?:/|$)|faq/?$|about/?$|founder/?$|faculty/?$|contact/?$|reviews/?$" +
    "|home-visit/?$|appointment/?$|patient-services(?:/|$)|locations(?:/|$)|clinical-visual-atlas(?:/|$)|stupid-intern-diaries(?:/|$))",
);
// Data files a saved page needs (changed on deploy: network first) and pictures (long-lived: stale while revalidating).
const DATA_FILE = /^\/(?:(?:teacher-data|skills-data|conditions-data|rehabverse-data|teacher)\/.+\.json|virtual-patient\/.+\.(?:glb|json))$/;
const IMAGE_FILE = /^\/(?:images|icons)\/.+\.(?:png|jpe?g|webp|avif|svg|ico)$/;

const isHtml = (response) => /text\/html/i.test(response.headers.get("content-type") || "");
/** A normal, successful answer from this site. */
const ok = (response) => Boolean(response) && response.status === 200 && response.type === "basic";
/** ...that may be kept: nothing marked private or no-store. */
const keepable = (response) => ok(response) && !/(?:^|,)\s*(?:no-store|private)\b/i.test(response.headers.get("cache-control") || "");
const pageKey = (url) => url.origin + url.pathname;
/** A saved answer is shown to a navigation as it is; one that came through a redirect is rebuilt first (the browser refuses a redirected response there). */
const clean = (response) => (response.redirected ? new Response(response.body, { status: response.status, statusText: response.statusText, headers: response.headers }) : response);

async function put(cacheName, key, response) {
  try {
    const cache = await caches.open(cacheName);
    await cache.put(key, response);
    const keys = await cache.keys();
    for (let i = 0; i < keys.length - LIMIT[cacheName]; i++) await cache.delete(keys[i]);
  } catch {
    // no room, or a blocked cache: the site simply works as it did without a saved copy
  }
}

function withTimeout(promise, ms) {
  if (!ms) return promise;
  return Promise.race([promise, new Promise((_, reject) => setTimeout(() => reject(new Error("slow")), ms))]);
}

/** A redirect to the same public page on the backup address when that address answers (a no-cors request only tells "the connection worked"), otherwise null. */
async function viaBackup(url) {
  if (ON_BACKUP || !SAVEABLE_PAGE.test(url.pathname)) return null;
  try {
    await withTimeout(fetch(BACKUP + "/robots.txt?probe=" + Date.now(), { mode: "no-cors", cache: "no-store" }), BACKUP_PROBE_MS);
    return Response.redirect(BACKUP + url.pathname + url.search, 302);
  } catch {
    return null;
  }
}

async function navigate(event) {
  const request = event.request;
  const url = new URL(request.url);
  const saveable = SAVEABLE_PAGE.test(url.pathname);
  const key = pageKey(url);
  const saved = saveable ? await caches.match(key, { cacheName: PAGES }) : undefined;
  try {
    const response = await withTimeout(fetch(request), saved ? SAVED_COPY_WAIT_MS : 0);
    // a server error is no better than a connection that failed: a saved copy is kinder
    if (saved && response.status >= 500) return clean(saved);
    if (saveable && !url.search && keepable(response) && !response.redirected && isHtml(response)) event.waitUntil(put(PAGES, key, response.clone()));
    return response;
  } catch (error) {
    const live = await viaBackup(url);
    if (live) return live;
    if (saved) return clean(saved);
    const offline = await caches.match(OFFLINE, { cacheName: PAGES });
    if (offline) return clean(offline);
    throw error; // the browser shows its own error page, as before
  }
}

async function cacheFirst(event, cacheName) {
  const cache = await caches.open(cacheName);
  const hit = await cache.match(event.request);
  if (hit) return hit;
  const response = await fetch(event.request);
  if (ok(response)) event.waitUntil(put(cacheName, event.request, response.clone()));
  return response;
}

async function networkFirst(event, cacheName) {
  try {
    const response = await fetch(event.request);
    if (ok(response)) event.waitUntil(put(cacheName, event.request, response.clone()));
    return response;
  } catch (error) {
    const hit = await (await caches.open(cacheName)).match(event.request);
    if (hit) return hit;
    throw error;
  }
}

async function staleWhileRevalidate(event, cacheName) {
  const cache = await caches.open(cacheName);
  const hit = await cache.match(event.request);
  const refresh = fetch(event.request).then((response) => {
    if (ok(response)) event.waitUntil(put(cacheName, event.request, response.clone()));
    return response;
  });
  if (hit) {
    event.waitUntil(refresh.catch(() => undefined));
    return hit;
  }
  return refresh;
}

async function precache() {
  try {
    const cache = await caches.open(PAGES);
    const page = await fetch(OFFLINE, { cache: "reload" });
    if (keepable(page) && isHtml(page)) await cache.put(OFFLINE, page);
    const home = await fetch("/", { cache: "reload", headers: { Accept: "text/html" } });
    if (keepable(home) && !home.redirected && isHtml(home)) await cache.put(self.location.origin + "/", home);
  } catch {
    // install must never fail because of a bad moment of the network
  }
}

self.addEventListener("install", (event) => {
  self.skipWaiting();
  event.waitUntil(precache());
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    (async () => {
      for (const name of await caches.keys()) if (name.startsWith("pna-") && !KEEP.includes(name)) await caches.delete(name);
      await self.clients.claim();
    })(),
  );
});

self.addEventListener("fetch", (event) => {
  const request = event.request;
  if (request.method !== "GET" || request.headers.has("range") || request.headers.has("authorization")) return;
  const url = new URL(request.url);
  if (url.origin !== self.location.origin) return;
  if (request.mode === "navigate") {
    event.respondWith(navigate(event));
  } else if (url.pathname.startsWith("/_next/static/")) {
    event.respondWith(cacheFirst(event, STATIC));
  } else if (DATA_FILE.test(url.pathname)) {
    event.respondWith(networkFirst(event, DATA));
  } else if (IMAGE_FILE.test(url.pathname)) {
    event.respondWith(staleWhileRevalidate(event, STATIC));
  }
  // everything else (API calls, the signed-in pages' data, React Server Component requests, voice files) goes to the network untouched
});

// The first page a person opens loads before this worker controls it, so the page asks the worker to keep a copy of it.
self.addEventListener("message", (event) => {
  const data = event.data || {};
  if (data.type !== "pna-save-page" || typeof data.href !== "string") return;
  event.waitUntil(
    (async () => {
      try {
        const url = new URL(data.href, self.location.origin);
        if (url.origin !== self.location.origin || url.search || !SAVEABLE_PAGE.test(url.pathname)) return;
        const response = await fetch(url.pathname, { credentials: "same-origin", headers: { Accept: "text/html" } });
        if (keepable(response) && !response.redirected && isHtml(response)) await put(PAGES, pageKey(url), response);
      } catch {
        // nothing to keep
      }
    })(),
  );
});
