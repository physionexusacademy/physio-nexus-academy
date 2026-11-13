import { NextResponse, type NextRequest } from "next/server";
import { createClient } from "@/lib/supabase/server";

/**
 * Landing point of the links in RehabVerse e-mails (confirm e-mail, reset password).
 * Exchanges the one-time code for a session, then continues inside RehabVerse only.
 */
const allowedNext = (value: string | null) => (value && /^\/rehabverse(\/[a-z0-9\-/]*)?$/i.test(value) ? value : "/rehabverse/me");

export async function GET(request: NextRequest) {
  const url = new URL(request.url);
  // The public address the person is actually using (behind a proxy the request URL can differ from it).
  const host = request.headers.get("x-forwarded-host") ?? request.headers.get("host") ?? url.host;
  const origin = `${request.headers.get("x-forwarded-proto") ?? url.protocol.replace(":", "")}://${host}`;
  const code = url.searchParams.get("code");
  const next = allowedNext(url.searchParams.get("next"));
  if (code) {
    const supabase = await createClient();
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    if (!error) return NextResponse.redirect(new URL(next, origin));
    console.error("RehabVerse auth callback: code exchange failed:", error.code ?? error.message);
  }
  // Expired, already used, or opened on a different device from the one that asked for it.
  return NextResponse.redirect(new URL(`/rehabverse/login?notice=${next.endsWith("/reset") ? "reset_link" : "link"}`, origin));
}
