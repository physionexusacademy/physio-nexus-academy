import { createClient } from "npm:@supabase/supabase-js@2";

const BUCKET = "clinical-consent-evidence";
const MAX_BYTES = 10 * 1024 * 1024;
const configuredOrigins = (Deno.env.get("REGISTRY_ALLOWED_ORIGINS") ?? "")
  .split(",")
  .map((value) => value.trim())
  .filter(Boolean);

// Validate every configured entry. Silently filtering malformed values can hide
// an operator typo and make the deployed origin allowlist differ from intent.
const validatedOrigins = configuredOrigins.map((origin) => {
  let parsed: URL;
  try {
    parsed = new URL(origin);
  } catch {
    throw new Error("REGISTRY_ALLOWED_ORIGINS must contain exact HTTPS origins only.");
  }
  if (
    parsed.protocol !== "https:" ||
    parsed.origin !== origin ||
    parsed.username ||
    parsed.password ||
    parsed.pathname !== "/" ||
    parsed.search ||
    parsed.hash
  ) {
    throw new Error("REGISTRY_ALLOWED_ORIGINS must contain exact HTTPS origins only; wildcards and paths are not allowed.");
  }
  return origin;
});
const ALLOWED_ORIGINS = new Set([
  "https://physionexusacademy.com",
  "https://www.physionexusacademy.com",
  "https://pna-clinical-registry-preview.physionexusacademypk.workers.dev",
  ...validatedOrigins,
]);

function response(body: unknown, status = 200, origin?: string | null) {
  const headers = new Headers({
    "Content-Type": "application/json",
    "Cache-Control": "no-store",
    "Vary": "Origin",
  });
  if (origin && ALLOWED_ORIGINS.has(origin)) {
    headers.set("Access-Control-Allow-Origin", origin);
    headers.set("Access-Control-Allow-Credentials", "true");
  }
  headers.set("Access-Control-Allow-Headers", "authorization, apikey, content-type, x-client-info");
  headers.set("Access-Control-Allow-Methods", "POST, OPTIONS");
  return new Response(JSON.stringify(body), { status, headers });
}

function matchesFileSignature(bytes: Uint8Array, mime: string): boolean {
  if (mime === "application/pdf") {
    return bytes.length >= 5 &&
      bytes[0] === 0x25 && bytes[1] === 0x50 && bytes[2] === 0x44 &&
      bytes[3] === 0x46 && bytes[4] === 0x2d;
  }
  if (mime === "image/jpeg") {
    return bytes.length >= 3 &&
      bytes[0] === 0xff && bytes[1] === 0xd8 && bytes[2] === 0xff;
  }
  if (mime === "image/png") {
    const signature = [0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a];
    return signature.every((value, index) => bytes[index] === value);
  }
  return false;
}

Deno.serve(async (req: Request) => {
  const origin = req.headers.get("Origin");
  if (req.method === "OPTIONS") return response({ ok: true }, 200, origin);
  if (req.method !== "POST") return response({ error: "Method not allowed" }, 405, origin);
  if (origin && !ALLOWED_ORIGINS.has(origin)) return response({ error: "Origin not allowed" }, 403);

  const authorization = req.headers.get("Authorization");
  if (!authorization?.startsWith("Bearer ")) {
    return response({ error: "Authenticated therapist session required" }, 401, origin);
  }

  try {
    const url = Deno.env.get("SUPABASE_URL");
    const anonKey = Deno.env.get("SUPABASE_ANON_KEY");
    const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
    if (!url || !anonKey || !serviceRoleKey) {
      throw new Error("Required server-side Supabase environment is unavailable.");
    }

    const token = authorization.slice("Bearer ".length);
    const userClient = createClient(url, anonKey, {
      global: { headers: { Authorization: authorization } },
      auth: { persistSession: false, autoRefreshToken: false },
    });
    const { data: authData, error: authError } = await userClient.auth.getUser(token);
    if (authError || !authData.user) {
      return response({ error: "Session is invalid or expired." }, 401, origin);
    }

    const body = await req.json().catch(() => null);
    const evidenceId = typeof body?.evidence_id === "string" ? body.evidence_id : "";
    if (!/^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(evidenceId)) {
      return response({ error: "A valid evidence ID is required." }, 400, origin);
    }

    const admin = createClient(url, serviceRoleKey, {
      auth: { persistSession: false, autoRefreshToken: false },
    });
    const { data: requests, error: requestError } = await admin
      .schema("clinical_api")
      .rpc("get_consent_evidence_integrity_request", { p_evidence_id: evidenceId });
    if (requestError) throw requestError;
    const evidence = Array.isArray(requests) ? requests[0] : requests;
    if (!evidence) return response({ error: "Pending consent evidence was not found." }, 404, origin);
    if (evidence.owner_id !== authData.user.id) {
      return response({ error: "You can verify only your own uploaded evidence." }, 403, origin);
    }

    const { data: file, error: downloadError } = await admin.storage
      .from(BUCKET)
      .download(evidence.object_path);
    if (downloadError || !file) {
      return response({ error: "The uploaded private document could not be retrieved for verification." }, 422, origin);
    }
    if (file.size < 1 || file.size > MAX_BYTES || file.size !== Number(evidence.declared_size_bytes)) {
      return response({ error: "Uploaded file size does not match the declared evidence size." }, 422, origin);
    }

    const bytes = new Uint8Array(await file.arrayBuffer());
    if (!matchesFileSignature(bytes, evidence.content_type)) {
      return response({ error: "The uploaded file signature does not match its declared PDF/JPEG/PNG type." }, 422, origin);
    }

    const digest = await crypto.subtle.digest("SHA-256", bytes);
    const actualSha256 = Array.from(new Uint8Array(digest))
      .map((value) => value.toString(16).padStart(2, "0"))
      .join("");
    if (actualSha256 !== evidence.declared_sha256) {
      return response({ error: "Server-computed SHA-256 does not match the uploaded evidence metadata." }, 422, origin);
    }

    const { data: recorded, error: recordError } = await admin
      .schema("clinical_api")
      .rpc("record_consent_evidence_integrity", {
        p_evidence_id: evidenceId,
        p_owner_id: evidence.owner_id,
        p_actual_sha256: actualSha256,
        p_actual_size_bytes: bytes.byteLength,
      });
    if (recordError) throw recordError;
    if (recorded !== true) throw new Error("Server-side integrity result was not recorded.");

    return response({
      ok: true,
      evidence_id: evidenceId,
      sha256_verified: true,
      size_verified: true,
      verified_at: new Date().toISOString(),
      note: "File integrity verified. This does not establish the authenticity, adequacy, or legal approval of the consent document; an authorised reviewer must inspect it.",
    }, 200, origin);
  } catch (error) {
    console.error("Consent evidence integrity verification failed:", error);
    return response({ error: "Consent evidence integrity verification failed. Please retry or contact the Registry operator." }, 500, origin);
  }
});
