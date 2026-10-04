const CACHE = "pna-runtime-v4";
const OFFLINE_URL = "/offline.html";
const HOME_URL = "/";
const NAVIGATION_TIMEOUT_MS = 12000;
const RETRY_DELAY_MS = 500;

self.addEventListener("install", (event) => {
  event.waitUntil(caches.open(CACHE).then((cache) => cache.add(OFFLINE_URL)));
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) =>
        Promise.all(keys.filter((key) => key !== CACHE).map((key) => caches.delete(key)))
      )
      .then(() => self.clients.claim())
  );
});

self.addEventListener("message", (event) => {
  if (event.data?.type === "SKIP_WAITING") {
    self.skipWaiting();
  }
});

function wait(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function fetchWithTimeout(request) {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), NAVIGATION_TIMEOUT_MS);

  try {
    return await fetch(request, { signal: controller.signal });
  } finally {
    clearTimeout(timeout);
  }
}

async function getFallback(request) {
  return (
    (await caches.match(request)) ||
    (await caches.match(HOME_URL)) ||
    (await caches.match(OFFLINE_URL)) ||
    new Response("Physio Nexus Academy is temporarily unavailable.", {
      status: 503,
      headers: { "Content-Type": "text/plain; charset=utf-8" },
    })
  );
}

async function fetchNavigation(request) {
  for (let attempt = 0; attempt < 2; attempt += 1) {
    try {
      const response = await fetchWithTimeout(request);

      if (response.ok) {
        const cache = await caches.open(CACHE);
        await cache.put(request, response.clone());

        const url = new URL(request.url);
        if (url.pathname === "/") {
          await cache.put(HOME_URL, response.clone());
        }

        return response;
      }

      // Do not replace normal client errors such as 404s.
      if (response.status < 500) {
        return response;
      }
    } catch {
      // Retry once before falling back to the last good page/offline shell.
    }

    if (attempt === 0) {
      await wait(RETRY_DELAY_MS);
    }
  }

  return getFallback(request);
}

self.addEventListener("fetch", (event) => {
  const request = event.request;

  if (request.method !== "GET" || request.mode !== "navigate") return;

  const url = new URL(request.url);

  if (
    url.origin !== self.location.origin ||
    url.pathname.startsWith("/admin") ||
    url.pathname.startsWith("/api")
  ) {
    return;
  }

  event.respondWith(fetchNavigation(request));
});
