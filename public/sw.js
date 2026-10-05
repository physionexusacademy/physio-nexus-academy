// PNA service-worker kill switch.
// Previous navigation caching could leave browsers stuck on stale failed pages.
const PNA_CACHE_PREFIX = "pna-";

self.addEventListener("install", () => {
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    (async () => {
      try {
        const keys = await caches.keys();
        await Promise.all(
          keys
            .filter((key) => key.startsWith(PNA_CACHE_PREFIX))
            .map((key) => caches.delete(key))
        );
      } catch {}

      try {
        await self.registration.unregister();
      } catch {}
    })()
  );
});

self.addEventListener("message", (event) => {
  if (event.data?.type === "SKIP_WAITING") self.skipWaiting();
});
