import { NextRequest, NextResponse } from "next/server";
import { callRpc } from "@/lib/reminders/job";

export const dynamic = "force-dynamic";
export const revalidate = 0;

/**
 * One-click opt-out for reminder e-mails (Daily Clinical Challenge and RehabVerse follow-up).
 *  - GET shows a confirmation page, so link scanners that open every link in an e-mail never unsubscribe anybody by accident;
 *  - POST (the button on that page, or a mail client's one-click List-Unsubscribe) switches the reminders off.
 * The token is random and unique to one e-mail; it identifies the reminder, never the person.
 */
const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
const headers = { "Cache-Control": "no-store", "X-Robots-Tag": "noindex, nofollow", "Content-Type": "text/html; charset=utf-8" };

const page = (title: string, body: string, status = 200) =>
  new NextResponse(
    `<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><meta name="robots" content="noindex"><title>${title}</title></head>` +
      `<body style="margin:0;min-height:100vh;display:grid;place-items:center;background:#0b2a3b;font-family:Segoe UI,Arial,sans-serif;color:#e9f6f7">` +
      `<main style="max-width:420px;margin:24px;padding:28px;border-radius:20px;background:#0f3a4f;border:1px solid #1f6a82;text-align:center">` +
      `<p style="margin:0 0 10px;font-size:12px;letter-spacing:.16em;color:#7ff0e0;font-weight:700">PHYSIO NEXUS ACADEMY</p>${body}</main></body></html>`,
    { status, headers },
  );

const button = "display:inline-block;margin-top:18px;border:0;border-radius:12px;padding:12px 22px;font-weight:700;font-size:15px;cursor:pointer;text-decoration:none";

export async function GET(request: NextRequest) {
  const token = request.nextUrl.searchParams.get("t") ?? "";
  if (!UUID.test(token)) return page("Link not valid", `<h1 style="font-size:20px">This link is not valid</h1><p style="color:#b8d3dc">Open My PNA or your RehabVerse dashboard to change your reminder settings.</p>`, 400);
  return page(
    "Turn off reminders",
    `<h1 style="font-size:20px">Turn off these reminder e-mails?</h1><p style="color:#b8d3dc;line-height:1.6">You can switch them back on at any time in My PNA or your RehabVerse dashboard.</p>` +
      `<form method="post" action="/api/reminders/unsubscribe?t=${token}"><button type="submit" style="${button};background:#0fb5a0;color:#032a2a">Yes, turn them off</button></form>`,
  );
}

export async function POST(request: NextRequest) {
  const token = request.nextUrl.searchParams.get("t") ?? "";
  if (!UUID.test(token)) return page("Link not valid", `<h1 style="font-size:20px">This link is not valid</h1>`, 400);
  try {
    const result = await callRpc<{ ok: boolean }>(
      { SUPABASE_SERVICE_ROLE_KEY: process.env.SUPABASE_SERVICE_ROLE_KEY, NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL },
      "pna_reminder_unsubscribe",
      { p_token: token },
    );
    if (!result?.ok) return page("Link not valid", `<h1 style="font-size:20px">This link is no longer valid</h1><p style="color:#b8d3dc">Open My PNA or your RehabVerse dashboard to change your reminder settings.</p>`, 404);
  } catch {
    return page("Try again", `<h1 style="font-size:20px">We could not update your setting</h1><p style="color:#b8d3dc">Please try again in a minute.</p>`, 503);
  }
  return page(
    "Reminders turned off",
    `<h1 style="font-size:20px">Reminders turned off</h1><p style="color:#b8d3dc;line-height:1.6">You will not get these e-mails any more. You can switch them back on in My PNA or your RehabVerse dashboard.</p><a href="/" style="${button};background:#0fb5a0;color:#032a2a">Back to Physio Nexus Academy</a>`,
  );
}
