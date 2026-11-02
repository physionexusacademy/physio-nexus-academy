import { readFileSync, existsSync } from "node:fs";

const read = (path) => readFileSync(path, "utf8");
const checks = [];
const assert = (name, condition, detail) => {
  checks.push({ name, ok: Boolean(condition), detail });
};

const routePath = "src/app/clinical-registry/page.tsx";
const clientPath = "src/lib/clinical-registry/client.ts";
const securePath = "src/app/clinical-registry/ClinicalRegistrySecureClient.tsx";
const libraryPath = "src/app/clinical-registry/library/page.tsx";
const deployPath = ".github/workflows/deploy-cloudflare-production.yml";
const configPath = "supabase/clinical-registry/supabase/config.toml";

const route = read(routePath);
const client = read(clientPath);
const secure = read(securePath);
const library = read(libraryPath);
const deploy = read(deployPath);
const config = read(configPath);

assert(
  "Registry route uses the secure client",
  route.includes('ClinicalRegistrySecureClient') && !route.includes('ClinicalRegistryClient'),
  "The private route must not render the legacy demo client."
);
assert(
  "Legacy demo client is absent",
  !existsSync("src/app/clinical-registry/ClinicalRegistryClient.tsx"),
  "Fabricated demo patients must not return."
);
assert(
  "Browser client uses dedicated Registry variables only",
  client.includes("NEXT_PUBLIC_CLINICAL_REGISTRY_SUPABASE_URL") &&
    client.includes("NEXT_PUBLIC_CLINICAL_REGISTRY_SUPABASE_PUBLISHABLE_KEY") &&
    !client.includes("NEXT_PUBLIC_SUPABASE_URL") &&
    !client.includes("NEXT_PUBLIC_SUPABASE_ANON_KEY") &&
    !client.includes("SERVICE_ROLE"),
  "The Registry client must never fall back to the main PNA Supabase project or a privileged key."
);
assert(
  "Browser client selects the clinical API schema",
  client.includes('db: { schema: "clinical_api" }'),
  "All browser RPC calls must target the dedicated clinical_api schema."
);
assert(
  "Private schema is not exposed by PostgREST",
  config.includes('schemas = ["clinical_api"]') && !/^schemas\s*=.*clinical_private/m.test(config),
  "Only clinical_api may be exposed through the Data API; clinical_private stays hidden."
);
assert(
  "Public library uses the dedicated Registry project",
  library.includes("NEXT_PUBLIC_CLINICAL_REGISTRY_SUPABASE_URL") &&
    library.includes("NEXT_PUBLIC_CLINICAL_REGISTRY_SUPABASE_PUBLISHABLE_KEY") &&
    library.includes('.schema("clinical_api")') &&
    !library.includes("NEXT_PUBLIC_SUPABASE_URL") &&
    !library.includes("NEXT_PUBLIC_SUPABASE_ANON_KEY"),
  "The public library must query only the dedicated clinical_api schema."
);
assert(
  "Consent gates remain fail-closed",
  secure.includes("const SIGNED_CONSENT_FORM_APPROVED = false") &&
    secure.includes("const SIGNED_CONSENT_EVIDENCE_WORKFLOW_READY = false"),
  "Do not enable patient creation or public case submission before approvals and hosted acceptance."
);
assert(
  "Privileged roles use trusted app metadata",
  secure.includes('session.user.app_metadata?.registry_role === "operator"') &&
    secure.includes('session.user.app_metadata?.registry_role === "reviewer"'),
  "Operator/reviewer UI must not rely on user-editable metadata."
);
assert(
  "Deployment injects dedicated Registry configuration",
  deploy.includes("NEXT_PUBLIC_CLINICAL_REGISTRY_SUPABASE_URL") &&
    deploy.includes("NEXT_PUBLIC_CLINICAL_REGISTRY_SUPABASE_PUBLISHABLE_KEY") &&
    deploy.includes("NEXT_PUBLIC_CLINICAL_REGISTRY_CONSENT_VERSION"),
  "Registry configuration must be wired from dedicated build-time secrets/variables."
);
assert(
  "Password recovery sends a reset email to the allowlisted Registry route",
  secure.includes("client.auth.resetPasswordForEmail(email.trim(), { redirectTo })") &&
    secure.includes("/clinical-registry?recovery=1"),
  "The reset email must return to the dedicated Clinical Registry recovery route."
);
assert(
  "Password recovery event opens the new-password screen",
  secure.includes('event === "PASSWORD_RECOVERY"') &&
    secure.includes("if (recoveryMode) return"),
  "A valid Supabase recovery event must display the password update form."
);
assert(
  "Recovered password is updated securely and the recovery session is closed",
  secure.includes("client.auth.updateUser({ password: newPassword })") &&
    secure.includes("await client.auth.signOut()"),
  "The new password must be saved before the recovery session is signed out."
);
assert(
  "Recovery form enforces the Registry password length",
  secure.includes("newPassword.length < 12") &&
    secure.includes('minLength={12}') &&
    secure.includes("Choose a password with at least 12 characters."),
  "Recovery must enforce the same 12-character minimum used at registration."
);
assert(
  "Expired or invalid recovery links show a safe recovery-specific error",
  secure.includes('searchParams.get("error_code")') &&
    secure.includes('recoveryErrorCode === "otp_expired"') &&
    secure.includes("This password-reset link is invalid or has already been used."),
  "The user must receive a clear recovery error without exposing account-existence information."
);
assert(
  "Recovery email response does not disclose whether an account exists",
  secure.includes("If an account exists for this email, a password-reset link has been sent."),
  "The UI must not reveal whether an email address is registered."
);

for (const check of checks) {
  console.log(`${check.ok ? "PASS" : "FAIL"}: ${check.name} — ${check.detail}`);
}
if (checks.some((check) => !check.ok)) process.exit(1);
console.log(`Clinical Registry integration checks: ${checks.length}/${checks.length} passed.`);
