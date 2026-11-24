import { NextResponse, type NextRequest } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { MEMBER_COOKIE, MEMBER_COOKIE_TTL_SECONDS, signMemberToken } from "@/lib/members/cookie";
import { safeNext } from "@/lib/members/paths";

export const dynamic = "force-dynamic";

/**
 * Where the Worker sends a visitor who has no approval cookie. Looks at who is signed in (refreshing the sign-in if it has expired), asks the database for their standing and then:
 * approved → sets the signed approval cookie and sends them back to the page they wanted; waiting → the waiting page; rejected or suspended → the blocked page; nobody → sign in.
 */
export async function GET(request: NextRequest) {
  const next = safeNext(request.nextUrl.searchParams.get("next"));
  // a relative address: the browser keeps using the address it is on, whatever host name this server thinks it has
  const go = (path: string) => new NextResponse(null, { status: 303, headers: { location: path, "cache-control": "no-store" } });

  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return go(`/members?next=${encodeURIComponent(next)}`);

  const { data, error } = await supabase.rpc("site_member_ensure");
  if (error || !data) return go("/members?error=unavailable");
  const status = (data as { status?: string }).status;
  if (status === "pending" || status === "none") return go("/members/waiting");
  if (status === "rejected" || status === "suspended") return go("/members/blocked");
  if (status !== "approved") return go("/members?error=unavailable");

  const secret = process.env.SUPABASE_SERVICE_ROLE_KEY ?? "";
  if (!secret) return go("/members?error=not_configured");
  const response = go(next);
  response.cookies.set(MEMBER_COOKIE, await signMemberToken(secret, user.id, Math.floor(Date.now() / 1000)), {
    httpOnly: true, secure: true, sameSite: "lax", path: "/", maxAge: MEMBER_COOKIE_TTL_SECONDS,
  });
  return response;
}
