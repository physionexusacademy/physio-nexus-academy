import { createClient } from "npm:@supabase/supabase-js@2";

const OPERATOR_ID = "fc9992a5-557f-4b9e-83a4-6f560c9e4134";
const OPERATOR_EMAIL = "sajjadraza.dpt@gmail.com";
const REVIEWER_EMAIL = "physionexusacademypk@gmail.com";
const ALLOWED_ORIGIN = "https://pna-clinical-registry-preview.physionexusacademypk.workers.dev";

function respond(body: unknown, status = 200, origin?: string | null) {
  const headers = new Headers({ "Content-Type": "application/json", "Cache-Control": "no-store", Vary: "Origin" });
  if (origin === ALLOWED_ORIGIN) {
    headers.set("Access-Control-Allow-Origin", ALLOWED_ORIGIN);
    headers.set("Access-Control-Allow-Headers", "authorization, apikey, content-type, x-client-info");
    headers.set("Access-Control-Allow-Methods", "POST, OPTIONS");
  }
  return new Response(JSON.stringify(body), { status, headers });
}

Deno.serve(async (req: Request) => {
  const origin = req.headers.get("Origin");
  if (req.method === "OPTIONS") return origin === ALLOWED_ORIGIN ? respond({ ok: true }, 200, origin) : respond({ error: "Origin not allowed" }, 403);
  if (req.method !== "POST") return respond({ error: "Method not allowed" }, 405, origin);
  if (origin && origin !== ALLOWED_ORIGIN) return respond({ error: "Origin not allowed" }, 403, origin);
  const authorization = req.headers.get("Authorization");
  if (!authorization?.startsWith("Bearer ")) return respond({ error: "A signed-in operator session is required." }, 401, origin);

  try {
    const url = Deno.env.get("SUPABASE_URL");
    const anonKey = Deno.env.get("SUPABASE_ANON_KEY");
    const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
    if (!url || !anonKey || !serviceRoleKey) return respond({ error: "Reviewer provisioning is not configured on the server." }, 503, origin);

    const token = authorization.slice(7);
    const userClient = createClient(url, anonKey, { global: { headers: { Authorization: authorization } }, auth: { persistSession: false, autoRefreshToken: false } });
    const [{ data: authData, error: authError }, { data: claimsData, error: claimsError }] = await Promise.all([
      userClient.auth.getUser(token),
      userClient.auth.getClaims(token)
    ]);
    if (authError || !authData.user || claimsError || !claimsData?.claims) return respond({ error: "Session could not be verified." }, 401, origin);
    const caller = authData.user;
    const claims = claimsData.claims as Record<string, unknown>;
    if (caller.id !== OPERATOR_ID || caller.email?.toLowerCase() !== OPERATOR_EMAIL || caller.app_metadata?.registry_role !== "operator" || claims.aal !== "aal2") {
      return respond({ error: "Only the designated AAL2 Registry Operator can assign this reviewer role." }, 403, origin);
    }

    const admin = createClient(url, serviceRoleKey, { auth: { persistSession: false, autoRefreshToken: false } });
    let target: any = null;
    for (let page = 1; page <= 100; page++) {
      const { data, error } = await admin.auth.admin.listUsers({ page, perPage: 1000 });
      if (error) return respond({ error: "Auth account inventory could not be verified." }, 503, origin);
      target = (data.users ?? []).find((u) => u.email?.toLowerCase() === REVIEWER_EMAIL) ?? target;
      if (target || (data.users ?? []).length < 1000) break;
    }
    if (!target || !target.email_confirmed_at || target.email?.toLowerCase() !== REVIEWER_EMAIL) return respond({ error: "The designated reviewer account must exist and have a confirmed email." }, 404, origin);
    if (target.id === caller.id || target.app_metadata?.registry_role === "operator") return respond({ error: "The operator account cannot be assigned as its own reviewer." }, 409, origin);
    if (target.app_metadata?.registry_role === "reviewer") return respond({ ok: true, alreadyAssigned: true, message: "The designated account already has the Case Reviewer role. Sign out and sign back in to refresh role claims." }, 200, origin);
    if (target.app_metadata?.registry_role) return respond({ error: "The target account already has a different privileged Registry role." }, 409, origin);

    const { data: memberships, error: membershipError } = await admin.schema("clinical_api").rpc("list_verified_therapist_memberships");
    if (membershipError) return respond({ error: "The approved therapist membership could not be verified; no role was changed." }, 503, origin);
    const membership = (memberships ?? []).find((m: any) => m.user_id === target.id && m.is_active === true);
    if (!membership) return respond({ error: "The target account must have an active verified therapist membership before reviewer access can be granted." }, 403, origin);

    let reviewerCount = 0;
    for (let page = 1; page <= 100; page++) {
      const { data, error } = await admin.auth.admin.listUsers({ page, perPage: 1000 });
      if (error) return respond({ error: "Trusted-role inventory could not be verified." }, 503, origin);
      reviewerCount += (data.users ?? []).filter((u) => u.app_metadata?.registry_role === "reviewer" && u.id !== target.id).length;
      if ((data.users ?? []).length < 1000) break;
      if (page === 100) return respond({ error: "Trusted-role inventory exceeded the safe scan limit." }, 503, origin);
    }
    if (reviewerCount > 0) return respond({ error: "A Case Reviewer is already assigned. No role was changed." }, 409, origin);

    const nextMetadata = { ...target.app_metadata, registry_role: "reviewer" };
    const { data: updated, error: updateError } = await admin.auth.admin.updateUserById(target.id, { app_metadata: nextMetadata });
    if (updateError || updated.user?.app_metadata?.registry_role !== "reviewer") return respond({ error: "Reviewer role assignment could not be confirmed." }, 503, origin);
    return respond({ ok: true, message: "Case Reviewer role assigned to the approved therapist account. Sign out and sign back in, then complete authenticator MFA." }, 200, origin);
  } catch (error) {
    console.error("Reviewer provisioning failed:", error);
    return respond({ error: "Secure reviewer provisioning failed." }, 500, origin);
  }
});
