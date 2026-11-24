/**
 * Cloudflare Worker entry: wraps the OpenNext worker with a short edge cache for the
 * public pages that read live Supabase data (they are rendered on every request, which
 * took 1–2 s). The homepage is not listed: it is a prebuilt static page.
 *
 * - Fresh for 5 minutes; after that the cached page is still served instantly while a new copy
 *   is rendered in the background (up to an hour old, then it waits for a fresh render). A page the admin has just edited
 *   therefore shows the change within about five minutes.
 * - Only full HTML page requests for the listed paths are cached: never API routes, admin,
 *   the clinical registry, workshop portals, React Server Component requests, responses that
 *   set cookies, or visitors who are signed in (Supabase auth cookie).
 * - Deploy smoke tests add a unique query string, so they always see a fresh render.
 * - The cache key carries the Worker's version (the CF_VERSION_METADATA binding), so a new deployment never serves a page rendered by the
 *   previous one: its HTML points at that build's JavaScript and CSS files (named by hash), which no longer exist, and the page would load
 *   unstyled and dead until the copy was replaced (the first visit of each listed page after every deploy).
 *
 * It also owns the hourly cron trigger that sends the opt-in reminder e-mails (src/lib/reminders/job.ts).
 *
 * It also answers on the Worker's workers.dev address, a backup for networks that cut the connection to the real name; there (and only there) search engines are told
 * to ignore everything (src/lib/host-policy.ts).
 */
// @ts-ignore — built by `opennextjs-cloudflare build`
import openNextWorker from "./.open-next/worker.js";
import { runReminderJob, type ReminderEnv } from "./src/lib/reminders/job";
import { backupRobotsTxt, isBackupHost, withBackupHeaders } from "./src/lib/host-policy";
import { gateRequest, type GateEnv } from "./src/lib/members/worker-gate";
// @ts-ignore — re-exported so Wrangler still finds OpenNext's Durable Object classes
export { DOQueueHandler, DOShardedTagCache, BucketCachePurge } from "./.open-next/worker.js";

type Ctx = { waitUntil(promise: Promise<unknown>): void; passThroughOnException?(): void };
type Handler = { fetch(request: Request, env: unknown, ctx: Ctx): Promise<Response> };
const worker = openNextWorker as Handler;

const FRESH_MS = 5 * 60_000;
const STALE_MS = 60 * 60_000;
const STORE_SECONDS = 2 * 60 * 60;
const CACHED_PATHS = new Set(["/resources", "/workshops", "/faq", "/about", "/founder", "/training", "/daily-challenge"]);
const refreshing = new Set<string>();

/** The id of the deployed Worker version ("v0" where the binding is missing, e.g. in local development: then the old behaviour is kept). */
const versionOf = (env: unknown) => (env as { CF_VERSION_METADATA?: { id?: string } } | null)?.CF_VERSION_METADATA?.id ?? "v0";

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
  /** Hourly cron (wrangler.jsonc → triggers.crons): Daily Clinical Challenge and RehabVerse follow-up reminder e-mails. */
  async scheduled(_event: unknown, env: ReminderEnv, ctx: Ctx): Promise<void> {
    ctx.waitUntil(
      runReminderJob(env)
        .then((result) => console.log("PNA reminders", JSON.stringify(result)))
        .catch((error) => console.error("PNA reminders crashed", error instanceof Error ? error.message : error)),
    );
  },
  async fetch(request: Request, env: unknown, ctx: Ctx): Promise<Response> {
    const url = new URL(request.url);
    // the backup (workers.dev) address: never indexed, always pointing at the real address; the real address is answered exactly as before
    if (isBackupHost(url.hostname)) {
      if (url.pathname === "/robots.txt") return backupRobotsTxt();
      return withBackupHeaders(await handle(request, url, env, ctx), url);
    }
    return handle(request, url, env, ctx);
  },
};

async function handle(request: Request, url: URL, env: unknown, ctx: Ctx): Promise<Response> {
  // members-only mode (switched in Admin > Members access): before any cache or page, anyone who is not an approved member is sent to sign in
  const gated = await gateRequest(request, (env ?? {}) as GateEnv);
  if (gated) return gated;
  const edgeCache = (globalThis as unknown as { caches?: { default?: Cache } }).caches?.default;
  if (!edgeCache || !cacheable(request, url)) return worker.fetch(request, env, ctx);

  const key = new Request(`${url.origin}${url.pathname}${url.search}${url.search ? "&" : "?"}__pna_v=${versionOf(env)}`, { method: "GET" });
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
}
