// PNA update-first service worker.
// Intentionally does not cache navigations or assets: every request follows the
// browser's normal network/cache policy, avoiding stale app pages after deploy.
// skipWaiting + clients.claim let a new worker take over without waiting for
// every old PNA tab to close.

self.addEventListener("install", () => {
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(self.clients.claim());
});
