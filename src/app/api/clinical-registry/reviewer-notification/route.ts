import { createClient } from "@supabase/supabase-js";
import { NextRequest, NextResponse } from "next/server";

export const dynamic = "force-dynamic";

const escapeHtml = (value: string) => value.replace(/[&<>"']/g, (character) => ({
  "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;",
}[character] ?? character));

export async function POST(request: NextRequest) {
  const authorization = request.headers.get("authorization") ?? "";
  const token = authorization.startsWith("Bearer ") ? authorization.slice(7) : "";
  if (!token) return NextResponse.json({ ok: false, error: "Authentication is required." }, { status: 401 });

  const url = process.env.NEXT_PUBLIC_CLINICAL_REGISTRY_SUPABASE_URL;
  const apiKey = process.env.NEXT_PUBLIC_CLINICAL_REGISTRY_SUPABASE_PUBLISHABLE_KEY
    || process.env.NEXT_PUBLIC_CLINICAL_REGISTRY_SUPABASE_ANON_KEY;
  if (!url || !apiKey) return NextResponse.json({ ok: false, error: "The Registry service is not configured." }, { status: 503 });

  const client = createClient(url, apiKey, {
    db: { schema: "clinical_api" },
    auth: { persistSession: false, autoRefreshToken: false },
    global: { headers: { Authorization: `Bearer ${token}` } },
  });

  const { data: authData, error: authError } = await client.auth.getUser(token);
  if (authError || !authData.user) return NextResponse.json({ ok: false, error: "Your therapist session could not be verified." }, { status: 401 });

  let payload: { caseId?: string };
  try {
    payload = await request.json() as { caseId?: string };
  } catch {
    return NextResponse.json({ ok: false, error: "A valid case submission reference is required." }, { status: 400 });
  }
  const caseId = typeof payload.caseId === "string" ? payload.caseId : "";
  if (!/^[0-9a-f-]{36}$/i.test(caseId)) return NextResponse.json({ ok: false, error: "The case reference is invalid." }, { status: 400 });

  const { data: submissions, error: submissionsError } = await client.rpc("list_my_case_submissions");
  if (submissionsError) return NextResponse.json({ ok: false, error: "Your submission could not be verified." }, { status: 403 });
  const submission = (submissions ?? []).find((item: { case_id?: string; status?: string }) => item.case_id === caseId);
  if (!submission || submission.status !== "submitted") {
    return NextResponse.json({ ok: false, error: "Only your own submitted cases can trigger a reviewer notification." }, { status: 403 });
  }

  const resendKey = process.env.RESEND_API_KEY;
  if (!resendKey) return NextResponse.json({ ok: false, error: "Reviewer email is not configured yet. The case remains safely in the reviewer dashboard." }, { status: 503 });

  const recipient = "physionexusacademypk@gmail.com";
  const sender = process.env.RESEND_FROM_EMAIL || "PNA Clinical Registry <onboarding@resend.dev>";
  const caseTitle = (typeof submission.case_title === "string" ? submission.case_title : "New clinical case").replace(/[\\r\\n\\t]+/g, " ").slice(0, 160);
  const reviewUrl = "https://physionexusacademy.com/clinical-registry/therapist";
  const safeTitle = escapeHtml(caseTitle);
  const safeId = escapeHtml(caseId);

  const response = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${resendKey}`,
      "Content-Type": "application/json",
      "Idempotency-Key": `pna-registry-case-submitted-${caseId}`,
    },
    body: JSON.stringify({
      from: sender,
      to: [recipient],
      subject: `[PNA Clinical Registry] Review required: ${caseTitle}`,
      html: `<div style="font-family:Arial,sans-serif;color:#173653;max-width:640px;margin:auto"><div style="background:#173653;color:#fff;padding:22px 26px;border-radius:14px 14px 0 0"><div style="font-size:11px;letter-spacing:2px;color:#b9dddd">PHYSIO NEXUS ACADEMY</div><h1 style="font-size:22px;margin:10px 0 0">New case submitted for review</h1></div><div style="border:1px solid #dce6eb;border-top:0;padding:24px;border-radius:0 0 14px 14px"><p>A therapist has submitted a de-identified educational case to the PNA Clinical Registry.</p><h2 style="font-size:18px;margin:18px 0 8px">${safeTitle}</h2><p style="font-size:12px;color:#607080">Submission reference: ${safeId}</p><p style="font-size:13px;line-height:1.7">The case is stored securely in the reviewer queue. Sign in with your authorised reviewer account and complete authenticator MFA to review the submission. Patient identifiers and private clinical records are not included in this email.</p><p style="margin:24px 0"><a href="${reviewUrl}" style="background:#087f80;color:#fff;text-decoration:none;padding:12px 18px;border-radius:8px;font-weight:bold">Open reviewer dashboard</a></p><p style="font-size:11px;color:#82909b">This is an automated notification from PNA Clinical Registry.</p></div></div>`,
      text: `A de-identified case has been submitted for review: ${caseTitle}\nReference: ${caseId}\nOpen the reviewer dashboard: ${reviewUrl}\n\nNo patient identifiers or private clinical record details are included in this email.`,
    }),
  });

  if (!response.ok) {
    const result = await response.json().catch(() => ({})) as { message?: string };
    return NextResponse.json({ ok: false, error: result.message || "The email provider could not deliver the reviewer notification. The case remains in the reviewer queue." }, { status: 502 });
  }

  return NextResponse.json({ ok: true, notified: recipient });
}
