import { readFileSync, existsSync } from "node:fs";

const read = (path) => readFileSync(path, "utf8");
const checks = [];
const assert = (name, condition, detail) => {
  checks.push({ name, ok: Boolean(condition), detail });
};

const routePath = "src/app/clinical-registry/page.tsx";
const clientPath = "src/lib/clinical-registry/client.ts";
const securePath = "src/app/clinical-registry/ClinicalRegistrySecureClient.tsx";
const edgeFunctionPath = "supabase/clinical-registry/supabase/functions/verify-consent-evidence/index.ts";
const libraryPath = "src/app/clinical-registry/library/page.tsx";
const deployPath = ".github/workflows/deploy-cloudflare-production.yml";
const configPath = "supabase/clinical-registry/supabase/config.toml";
const mfaMigrationPath = "supabase/clinical-registry/supabase/migrations/20261102190000_clinical_registry_privileged_mfa_enforcement.sql";
const rlsTestPath = "supabase/clinical-registry/private-schema.rls.test.sql";
const fkIndexMigrationPath = "supabase/clinical-registry/supabase/migrations/20261102200000_clinical_registry_foreign_key_indexes.sql";
const emailConfirmationMigrationPath = "supabase/clinical-registry/supabase/migrations/20261102210000_clinical_registry_confirmed_email_onboarding.sql";
const liveRoleMigrationPath = "supabase/clinical-registry/supabase/migrations/20261102220000_clinical_registry_live_privileged_role_checks.sql";
const patientConsentMigrationPath = "supabase/clinical-registry/supabase/migrations/20261102230000_clinical_registry_require_verified_consent_for_patient_creation.sql";
const consentGrantMigrationPath = "supabase/clinical-registry/supabase/migrations/20261102240000_clinical_registry_evidence_only_consent_grants.sql";
const evidenceRequestMigrationPath = "supabase/clinical-registry/supabase/migrations/20261102250000_clinical_registry_evidence_request_rpc_only.sql";
const reportInsertGuardMigrationPath = "supabase/clinical-registry/supabase/migrations/20261102170712_clinical_registry_report_insert_guard.sql";

const route = read(routePath);
const client = read(clientPath);
const secure = read(securePath);
const edgeFunction = read(edgeFunctionPath);
const library = read(libraryPath);
const deploy = read(deployPath);
const config = read(configPath);
const mfaMigration = read(mfaMigrationPath);
const rlsTests = read(rlsTestPath);
const fkIndexMigration = read(fkIndexMigrationPath);
const emailConfirmationMigration = read(emailConfirmationMigrationPath);
const liveRoleMigration = read(liveRoleMigrationPath);
const patientConsentMigration = read(patientConsentMigrationPath);
const consentGrantMigration = read(consentGrantMigrationPath);
const evidenceRequestMigration = read(evidenceRequestMigrationPath);
const reportInsertGuardMigration = read(reportInsertGuardMigrationPath);

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
  "Consent workflow stores attestations only and has no upload UI",
  secure.includes("create_patient_with_consent_attestation") &&
    secure.includes("record_publication_consent_attestation") &&
    secure.includes("PNA does not upload or store the document") &&
    !secure.includes("type=\"file\"") &&
    !secure.includes("client.storage.from(\"clinical-consent-evidence\")") &&
    !secure.includes("verify-consent-evidence"),
  "Patient consent originals remain with the therapist; the Registry records only small consent metadata."
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
  "Sign-up confirmation and resend preserve the current Preview origin",
  secure.includes("client.auth.signUp({ email, password, options: { emailRedirectTo: redirectTo } })") &&
    secure.includes('client.auth.resend({ type: "signup", email: email.trim(), options: { emailRedirectTo: redirectTo } })') &&
    secure.includes("const redirectTo = `${window.location.origin}/clinical-registry`;"),
  "Signup and confirmation-resend emails must return to the exact origin where the user started."
);
assert(
  "Password recovery event opens the new-password screen",
  secure.includes('event === "PASSWORD_RECOVERY"') &&
    secure.includes('searchParams.get("recovery") === "1"') &&
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
  "Privileged users can enrol and verify authenticator MFA",
  secure.includes('client.auth.mfa.enroll({') &&
    secure.includes('client.auth.mfa.challenge({ factorId: mfaFactorId })') &&
    secure.includes('client.auth.mfa.verify({') &&
    secure.includes('assurance.currentLevel === "aal2"'),
  "Reviewer/operator UI must provide a TOTP setup and challenge flow before privileged actions."
);
assert(
  "Privileged queues remain hidden until AAL2 is reached",
  secure.includes('aalLevel !== "aal2" || mfaRequired') &&
    secure.includes("if (!recoveryMode && session && mfaRequired") &&
    secure.includes("Reviewer and operator actions require a verified authenticator"),
  "The client must not request privileged queues while the session is below AAL2."
);
assert(
  "Public case evidence references require HTTPS",
  library.includes('item.evidence_reference.startsWith("https://")') &&
    !library.includes('item.evidence_reference.startsWith("http://")'),
  "Public evidence links must use encrypted HTTPS transport."
);
assert(
  "Local Supabase enables the TOTP MFA flow used by privileged accounts",
  config.includes("[auth.mfa.totp]\nenroll_enabled = true\nverify_enabled = true") &&
    config.includes("minimum_password_length = 12") &&
    config.includes("secure_password_change = true") &&
    config.includes("enable_confirmations = true") &&
    config.includes('additional_redirect_urls = ["http://127.0.0.1:3000", "http://localhost:3000"]'),
  "Local Auth must allow TOTP, enforce the Registry password floor and allow the correct local recovery redirect."
);
assert(
  "Privileged role revocation takes effect before JWT expiry",
  liveRoleMigration.includes("raw_app_meta_data ->> 'registry_role'") &&
    liveRoleMigration.includes("require_registry_role") &&
    liveRoleMigration.includes("is_current_registry_reviewer_aal2") &&
    liveRoleMigration.includes("v_reviewer boolean := clinical_private.is_current_registry_reviewer_aal2()"),
  "Reviewer/operator privileges must be checked against current Auth app_metadata, including storage and trigger paths."
);
assert(
  "Reviewer and operator database actions require AAL2",
  mfaMigration.includes("auth.jwt() ->> 'aal') = 'aal2'") &&
    mfaMigration.includes("reviewers must also hold an AAL2 session") &&
    (mfaMigration.match(/perform clinical_private\.require_registry_aal2\(\);/g) ?? []).length === 10,
  "All ten privileged reviewer/operator RPCs must enforce MFA in the database, not only in the UI."
);
assert(
  "Consent grants use authenticated therapist attestations",
  read("supabase/clinical-registry/supabase/migrations/20261102280000_clinical_registry_lightweight_consent_attestation.sql").includes("create_patient_with_consent_attestation") &&
    read("supabase/clinical-registry/supabase/migrations/20261102280000_clinical_registry_lightweight_consent_attestation.sql").includes("record_publication_consent_attestation") &&
    read("supabase/clinical-registry/supabase/migrations/20261102280000_clinical_registry_lightweight_consent_attestation.sql").includes("Active verified therapist membership required"),
  "Only active verified therapists can create the minimal consent audit events."
);
assert(
  "Patient creation requires explicit written-consent attestation",
  read("supabase/clinical-registry/supabase/migrations/20261102280000_clinical_registry_lightweight_consent_attestation.sql").includes("p_written_consent_confirmed") &&
    read("supabase/clinical-registry/supabase/migrations/20261102280000_clinical_registry_lightweight_consent_attestation.sql").includes("Confirm that written clinical-care consent has been obtained") &&
    read("supabase/clinical-registry/supabase/migrations/20261102280000_clinical_registry_lightweight_consent_attestation.sql").includes("revoke all on function clinical_api.create_patient_with_consent_attestation"),
  "Patient creation is atomic and requires a therapist attestation; direct patient inserts remain revoked."
);
assert(
  "Therapist onboarding requires a confirmed email address",
  emailConfirmationMigration.includes("email_confirmed_at is not null") &&
    rlsTests.includes("unconfirmed email cannot submit a professional verification request") &&
    rlsTests.includes("stale reviewer JWT cannot retain access after the live Auth role is revoked") &&
    rlsTests.includes("stale reviewer JWT cannot bypass the case workflow trigger after role revocation"),
  "An unconfirmed account must not be able to submit a professional verification request."
);
assert(
  "All advisor-identified foreign keys receive a narrow index",
  (fkIndexMigration.match(/create index if not exists idx_fk_/g) ?? []).length === 27,
  "Create only the 27 missing foreign-key indexes; retain the currently unused index until workload data exists."
);
assert(
  "Database security tests cover both AAL1 denial and AAL2 success",
  rlsTests.includes("reviewer cannot read protected queues without an AAL2 session") &&
    rlsTests.includes("operator cannot inspect identity-verification queue without an AAL2 session") &&
    rlsTests.includes('"aal":"aal2"') &&
    rlsTests.includes("select plan(91);") &&
    rlsTests.includes("lightweight consent attestation creates a private patient and clinical-care event") &&
    rlsTests.includes("publication consent attestation is owner-scoped and idempotent") &&
    rlsTests.includes("signed consent upload tables and policies are removed") &&
    rlsTests.includes("legacy patient creation RPC is not executable") &&
    rlsTests.includes("authenticated therapists cannot directly insert patient rows"),
  "pgTAP must prove privileged actions are denied at AAL1 and accepted at AAL2."
);

assert(
  "New clinical reports must begin as active drafts",
  reportInsertGuardMigration.includes("guard_report_initial_state") &&
    reportInsertGuardMigration.includes("new.finalised_at is not null") &&
    reportInsertGuardMigration.includes("new.archived_at is not null") &&
    rlsTests.includes("new clinical reports cannot be inserted as final") &&
    rlsTests.includes("new clinical reports cannot be inserted as archived"),
  "Direct authenticated INSERTs must not manufacture final or archived reports outside the draft workflow."
);
assert(
  "Normal report creation still succeeds through the Registry RPC",
  rlsTests.includes("verified therapist can create a new report through the normal RPC"),
  "The database guard must preserve valid draft creation for verified therapists."
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
