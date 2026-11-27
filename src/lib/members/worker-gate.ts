/**
 * The members-only gate, run by the Worker before anything else. Dependency-free and testable: the network and the clock are passed in.
 *
 *  1. Is the website members-only right now? The database says so (asked about every 30 seconds per Worker instance); `MEMBERS_ONLY=1` in the Worker's variables forces it on.
 *  2. If not, or the address is one that stays open (./paths.ts), the request goes straight on.
 *  3. If it carries a genuine, unexpired approval cookie (./cookie.ts) it goes on.
 *  4. Otherwise a page request is sent to /members/check, which looks at who is signed in and either sets the cookie and sends them back, or shows the sign-in,
 *     waiting or blocked page. Anything that is not a page request gets a plain 401.
 * If the database cannot be reached the last known answer is used; with none, the site stays open for that request (the site is probably down anyway).
 */
import { MEMBER_COOKIE, readCookie, verifyMemberToken } from "./cookie.ts";
import { isPublicPath } from "./paths.ts";

export type GateEnv = {
  SUPABASE_SERVICE_ROLE_KEY?: string;
  NEXT_PUBLIC_SUPABASE_URL?: string;
  NEXT_PUBLIC_SUPABASE_ANON_KEY?: string;
  /** "1" forces members-only on whatever the database says (an emergency switch in the Worker's variables). */
  MEMBERS_ONLY?: string;
  /**
   * Optional: a request carrying this value passes (the deploy's own checks of the live site), in the `x-pna-ci` header or the `pna_ci` cookie. The cookie is
   * what the browser checks use, because a cookie only goes to this site while a header would be sent to every site a page loads from. The deploy sets it
   * (scripts/ci-members-pass.sh: derived from the server key, so there is no extra secret to keep).
   */
  MEMBERS_CI_TOKEN?: string;
};
export type GateIo = { fetch?: typeof fetch; now?: () => number };

const MODE_TTL_MS = 30_000;
/** The deploy checks' pass as a cookie (see MEMBERS_CI_TOKEN). */
export const CI_COOKIE = "pna_ci";
const DEFAULT_SUPABASE = "https://oabckudgmzbbbbhkeolk.supabase.co";
let known: { value: boolean; at: number } | null = null;

/** For tests: forget the remembered answer. */
export function resetGateMemory() { known = null; }

export async function membersOnly(env: GateEnv, io: GateIo = {}): Promise<boolean> {
  if (env.MEMBERS_ONLY === "1") return true;
  const now = (io.now ?? Date.now)();
  if (known && now - known.at < MODE_TTL_MS) return known.value;
  // the same project and the same server key the reminder job uses; the public (anon) key is the fallback
  const url = (env.NEXT_PUBLIC_SUPABASE_URL || DEFAULT_SUPABASE).replace(/\/$/, "");
  const key = env.SUPABASE_SERVICE_ROLE_KEY || env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "";
  if (!key) return known?.value ?? false;
  try {
    const response = await (io.fetch ?? fetch)(`${url}/rest/v1/rpc/site_access_mode`, { method: "POST", headers: { apikey: key, Authorization: `Bearer ${key}`, "Content-Type": "application/json" }, body: "{}" });
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    const value = (await response.json()) === true;
    known = { value, at: now };
    return value;
  } catch {
    return known?.value ?? false;
  }
}

const isPageRequest = (request: Request) => (request.method === "GET" || request.method === "HEAD") && !request.headers.get("accept")?.includes("application/json");

/** null = let the request through; a Response = answer it instead. */
export async function gateRequest(request: Request, env: GateEnv, io: GateIo = {}): Promise<Response | null> {
  const url = new URL(request.url);
  if (isPublicPath(url.pathname)) return null;
  if (!(await membersOnly(env, io))) return null;
  if (env.MEMBERS_CI_TOKEN && (request.headers.get("x-pna-ci") === env.MEMBERS_CI_TOKEN || readCookie(request.headers.get("cookie"), CI_COOKIE) === env.MEMBERS_CI_TOKEN)) return null;

  const secret = env.SUPABASE_SERVICE_ROLE_KEY ?? "";
  const nowSeconds = Math.floor((io.now ?? Date.now)() / 1000);
  if (await verifyMemberToken(secret, readCookie(request.headers.get("cookie"), MEMBER_COOKIE), nowSeconds)) return null;

  if (!isPageRequest(request)) return new Response("Members only. Please sign in.", { status: 401, headers: { "cache-control": "no-store", "content-type": "text/plain; charset=utf-8" } });
  const target = new URL("/members/check", url.origin);
  target.searchParams.set("next", url.pathname + url.search);
  return new Response(null, { status: 303, headers: { location: target.toString(), "cache-control": "no-store" } });
}
