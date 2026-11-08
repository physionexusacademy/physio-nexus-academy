/**
 * Cloudflare Worker entry: wraps the OpenNext worker with a short edge cache for the
 * public pages that read live Supabase data (they are rendered on every request, which
 * took 1–2 s for the homepage).
 *
 * - Fresh for 60 s; after that the cached page is still served instantly while a new copy
 *   is rendered in the background (up to 10 minutes old, then it waits for a fresh render).
 * - Only full HTML page requests for the listed paths are cached: never API routes, admin,
 *   the clinical registry, workshop portals, React Server Component requests, responses that
 *   set cookies, or visitors who are signed in (Supabase auth cookie).
 * - Deploy smoke tests add a unique query string, so they always see a fresh render.
 */
// @ts-ignore — built by `opennextjs-cloudflare build`
import openNextWorker from "./.open-next/worker.js";
// @ts-ignore — re-exported so Wrangler still finds OpenNext's Durable Object classes
export { DOQueueHandler, DOShardedTagCache, BucketCachePurge } from "./.open-next/worker.js";

type Ctx = { waitUntil(promise: Promise<unknown>): void; passThroughOnException?(): void };
type Handler = { fetch(request: Request, env: unknown, ctx: Ctx): Promise<Response> };
const worker = openNextWorker as Handler;

const FRESH_MS = 60_000;
const STALE_MS = 10 * 60_000;
const STORE_SECONDS = 15 * 60;
const CACHED_PATHS = new Set(["/", "/resources", "/workshops", "/faq", "/about", "/founder", "/training", "/daily-challenge"]);
const refreshing = new Set<string>();

function cacheable(request: Request, url: URL) {
  if (request.method !== "GET") return false;
  const path = url.pathname;
  const listed = CACHED_PATHS.has(path) || /^\/workshops\/[^/]+$/.test(path);
  if (!listed) return false;
  if (url.searchParams.has("_rsc") || request.headers.has("rsc") || request.headers.has("next-router-state-tree")) return false;
  if (/(^|;\s*)sb-[^=]*-auth-token/.test(request.headers.get("cookie") ?? "")) return false;
  return true;
}

async function renderAndStore(request: Request, env: unknown, ctx: Ctx, key: Request, cache: Cache) {
  const response = await worker.fetch(request, env, ctx);
  const type = response.headers.get("content-type") ?? "";
  if (response.status === 200 && type.includes("text/html") && !response.headers.has("set-cookie")) {
    const stored = new Response(response.clone().body, response);
    stored.headers.set("cache-control", `public, max-age=${STORE_SECONDS}`);
    stored.headers.set("x-pna-rendered-at", String(Date.now()));
    ctx.waitUntil(cache.put(key, stored));
  }
  return response;
}

function forBrowser(response: Response, state: string) {
  const out = new Response(response.body, response);
  // Browsers always check back (the page changes when the admin edits workshops or reviews).
  out.headers.set("cache-control", "public, max-age=0, must-revalidate");
  out.headers.delete("x-pna-rendered-at");
  out.headers.set("x-pna-edge-cache", state);
  return out;
}

export default {
  async fetch(request: Request, env: unknown, ctx: Ctx): Promise<Response> {
    const url = new URL(request.url);
    const edgeCache = (globalThis as unknown as { caches?: { default?: Cache } }).caches?.default;
    if (!edgeCache || !cacheable(request, url)) return worker.fetch(request, env, ctx);

    const key = new Request(`${url.origin}${url.pathname}${url.search}`, { method: "GET" });
    const hit = await edgeCache.match(key);
    if (hit) {
      const age = Date.now() - Number(hit.headers.get("x-pna-rendered-at") ?? 0);
      if (age < FRESH_MS) return forBrowser(hit, "HIT");
      if (age < STALE_MS) {
        if (!refreshing.has(key.url)) {
          refreshing.add(key.url);
          ctx.waitUntil(
            renderAndStore(new Request(request.url, { headers: request.headers }), env, ctx, key, edgeCache)
              .catch(() => undefined)
              .finally(() => refreshing.delete(key.url)),
          );
        }
        return forBrowser(hit, "STALE");
      }
    }
    const fresh = await renderAndStore(request, env, ctx, key, edgeCache);
    if (fresh.status !== 200) return fresh;
    const out = new Response(fresh.body, fresh);
    out.headers.set("x-pna-edge-cache", "MISS");
    return out;
  },
};
