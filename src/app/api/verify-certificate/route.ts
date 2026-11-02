import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

const CERTIFICATE_ID_PATTERN = /^PNA-\d{2}-[A-F0-9]{16}$/;

export async function POST(request: Request) {
  let body: { certificateId?: unknown };

  try {
    body = await request.json();
  } catch {
    return NextResponse.json(
      { error: "Invalid request." },
      { status: 400, headers: { "Cache-Control": "no-store" } }
    );
  }

  const certificateId = String(body.certificateId ?? "").trim().toUpperCase();

  if (!CERTIFICATE_ID_PATTERN.test(certificateId)) {
    return NextResponse.json(
      { error: "Enter a valid PNA Certificate ID." },
      { status: 400, headers: { "Cache-Control": "no-store" } }
    );
  }

  const supabase = await createClient();
  const { data, error } = await supabase.rpc("verify_certificate", {
    p_certificate_id: certificateId,
  });

  if (error) {
    console.error("Certificate verification failed:", error.message);
    return NextResponse.json(
      { error: "Verification service is temporarily unavailable." },
      { status: 500, headers: { "Cache-Control": "no-store" } }
    );
  }

  const certificate = Array.isArray(data) ? data[0] : null;

  if (!certificate) {
    return NextResponse.json(
      { error: "Certificate not found." },
      { status: 404, headers: { "Cache-Control": "no-store" } }
    );
  }

  return NextResponse.json(
    { certificate },
    { status: 200, headers: { "Cache-Control": "no-store" } }
  );
}
