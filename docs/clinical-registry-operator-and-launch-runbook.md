# PNA Clinical Registry — operator and technical runbook

## Current status

- Dedicated hosted project: **PNA Clinical Registry**, Singapore, ref `zfoohwqyoengbszuylxj`; current status `ACTIVE_HEALTHY`.
- This project is separate from the PNA website Supabase project. Never substitute the website's credentials or replay website migrations into this project.
- Twenty-four migrations are recorded in hosted staging, including the latest AAL2/live-role, consent-enforcement, 27 foreign-key index, reviewer-read and consolidated case-library policy migrations.
- Hosted staging currently has zero Auth users, therapist memberships, patients, clinical reports, consent events, consent evidence records, and public case entries. The private consent bucket has zero objects.
- Supabase Edge Function `verify-consent-evidence` is deployed and ACTIVE at version 3 with JWT verification enabled. The deployed code supports exact HTTPS origins from the server-side `REGISTRY_ALLOWED_ORIGINS` secret; production origins remain built in.
- Latest feature-branch head `02899b4c31d38bda2db4fd8497871c91c4524c98` passed Registry security workflow run `41461518799` (100/100 pgTAP assertions, isolated migrations, disposable backup/restore and cleanup), dependency/build run `41461518640` (dependency audit, TypeScript, Next.js and OpenNext Cloudflare build), and the Cloudflare Workers build check. These are automated checks, not hosted browser E2E or production acceptance.
- PRs #151–#156 have been merged in dependency order into the isolated `registry-preview` branch. The production branch `cloudflare-deploy` is unchanged.
- Isolated Preview Worker: `https://pna-clinical-registry-preview.physionexusacademypk.workers.dev`. It is a separate Worker with no production custom-domain route. Cloudflare Access is not enabled because the owner does not wish to provide payment-card details. The Preview is instead protected by a Preview-only HTTP Basic password gate in Next middleware, backed by the Cloudflare Worker secret `PNA_PREVIEW_ACCESS_PASSWORD`. The gate fails closed with HTTP 503 if the secret is missing or shorter than 32 characters, and returns HTTP 401 to unauthenticated visitors. This shared-password perimeter is for Preview access only; it is not an identity provider and does not replace Supabase Auth, MFA, RLS or server-side ownership checks. Use synthetic data only.
- Latest completed Preview pipeline run `41469967111` passed the full Next.js/OpenNext Cloudflare build, dependency audit, TypeScript, 31/31 Registry integration checks, isolated Worker deployment, both live Registry route smoke tests, the Preview-only `X-Robots-Tag: noindex, nofollow` header check, and positive/negative exact-origin CORS preflight tests. The Preview password-gate implementation is being added separately and must pass its own authenticated/unauthenticated smoke tests before the Preview is considered protected.
- Hosted `verify-consent-evidence` Edge Function is ACTIVE at version 3 with JWT verification enabled. The exact Preview origin is allowlisted; no wildcard CORS is used.

## Architecture and access boundaries

- Browser client and public library use `NEXT_PUBLIC_CLINICAL_REGISTRY_SUPABASE_URL` plus the preferred `NEXT_PUBLIC_CLINICAL_REGISTRY_SUPABASE_PUBLISHABLE_KEY` (or the legacy `NEXT_PUBLIC_CLINICAL_REGISTRY_SUPABASE_ANON_KEY` fallback). Both keys must belong to the dedicated Registry project.
- The Cloudflare production build workflow reads `NEXT_PUBLIC_CLINICAL_REGISTRY_SUPABASE_URL` and `NEXT_PUBLIC_CLINICAL_REGISTRY_SUPABASE_PUBLISHABLE_KEY` from GitHub Actions repository secrets. Add both using the dedicated Registry project values only; do not reuse the main PNA website project URL/key. Missing values intentionally leave Registry unavailable without blocking unrelated PNA deployment.
- The deployment workflow reads `CLINICAL_REGISTRY_CONSENT_VERSION` from a GitHub Actions repository variable. Keep it empty until the exact institution/ethics-approved form version is approved. No service-role or secret key is used by the browser Registry client.
- `clinical_api` is exposed to PostgREST (`pgrst.db_schemas=public, clinical_api` verified on the hosted `authenticator` role); `anon` and `authenticated` have schema usage, and `anon` can execute only the intended public-list RPC. `clinical_private` is not exposed to browser clients.
- Private clinical tables have RLS enabled and forced. Anonymous clients have no direct private-table access. Therapists are restricted to their own patient/report records.
- Therapist verification, case review, signed-consent review and operator actions use distinct trusted roles. Role claims must be placed in Supabase Auth `app_metadata` by a trusted administrator; never use user-editable `user_metadata`.
- The service-role key is backend-only. Never put it in source control, browser code, `NEXT_PUBLIC_*`, Cloudflare client variables or logs.
- The Registry has no live patient data. Keep staging synthetic-only.

## Signed consent evidence flow

1. Therapist creates a consent-evidence request for either clinical-care consent or separate public-case publication consent.
2. The request reserves a random owner-scoped object path in the private `clinical-consent-evidence` bucket (10 MiB maximum; PDF/JPEG/PNG only).
3. Therapist uploads the original document to that path. There is no public object URL or public bucket access.
4. The browser invokes the authenticated Edge Function `verify-consent-evidence`.
5. The Edge Function validates the user's session, checks ownership and active verified therapist membership through server-only RPCs, downloads the private object with server-side credentials, checks its actual byte length and PDF/JPEG/PNG signature, computes SHA-256 over the downloaded bytes, and records the result through a service-role-only database RPC.
6. Authenticated therapists cannot directly update the evidence integrity fields. The database constraint requires the server-computed hash and size to match the original declaration.
7. The reviewer queue returns only evidence whose server-side integrity check has passed. The reviewer opens and inspects the private original, checks the correct patient/reference, purpose, exact approved version and signatures, and enters a decision note.
8. The reviewer decision RPC rechecks integrity and confirms that the private object exists. Decisions are stored append-only. Only verified clinical-care evidence permits patient creation. Only verified publication evidence creates a publication-consent grant for its linked patient.
9. Withdrawal is recorded as a new consent event; a later withdrawal supersedes an earlier grant and suppresses public case visibility.

**Important:** A server-computed SHA-256 proves byte integrity between upload and verification; file-signature checks help reject MIME spoofing. Neither proves that the document is authentic, that signatures are genuine, that the patient understood the content, or that the form is institutionally/legal approved. Human reviewer inspection and institutional approval remain mandatory.

## Supabase Edge Function

- Function slug: `verify-consent-evidence`
- Entry point: `supabase/clinical-registry/supabase/functions/verify-consent-evidence/index.ts`
- JWT verification: enabled.
- Browser origin allowlist: `https://physionexusacademy.com` and `https://www.physionexusacademy.com`.
- The exact Preview origin `https://pna-clinical-registry-preview.physionexusacademypk.workers.dev` is currently explicitly allowlisted in Edge Function version 3. This is a temporary exact-origin allowance; remove it after acceptance testing. Never use wildcard origins.
- Uses Supabase-provided server environment variables. It must never receive service-role credentials from the browser.
- The service-only database RPCs are:
  - `clinical_api.get_consent_evidence_integrity_request(uuid)`
  - `clinical_api.record_consent_evidence_integrity(uuid,uuid,text,bigint)`
- These functions revoke execution from `public`, `anon`, and `authenticated`, and grant only to `service_role`.

## Auth and privileged accounts

Hosted Auth has no users yet. Before any real therapist is onboarded:

1. The project owner has already entered the production Auth Site URL and redirect URL. Keep Site URL as `https://physionexusacademy.com`; verify the production callback `https://physionexusacademy.com/clinical-registry` remains allowlisted. For Preview testing, add these exact additional Redirect URLs (no wildcard): `https://pna-clinical-registry-preview.physionexusacademypk.workers.dev/clinical-registry` and `https://pna-clinical-registry-preview.physionexusacademypk.workers.dev/clinical-registry?recovery=1`. The Registry sign-up and confirmation-resend code now explicitly returns to the current origin; password recovery also uses the current origin with `?recovery=1`.
2. Enable the Email provider and email confirmations, keep anonymous sign-ins disabled, configure production SMTP and the default Reset Password template, set the minimum password length to 12, and keep Secure Password Change enabled.
3. Under Authentication → Multi-Factor, ensure App Authenticator/TOTP enrollment and verification are enabled. The Registry UI guides trusted reviewer/operator accounts through TOTP enrollment and challenge; database RPCs, private consent RLS, Storage downloads and case-workflow triggers require AAL2.
4. The Preview origin is already present as an exact CORS allowlist entry in deployed Edge Function version 3. Add the two exact Preview callback URLs in step 1 to Supabase Auth Redirect URLs. Remove the Preview CORS origin and callback URLs after acceptance testing.
5. Review session lifetime, rate limits and abuse monitoring.
6. Create the first trusted operator only through the approved administrator process, after the live-role/AAL2 migrations have passed CI and have been applied to the dedicated hosted Registry project.
7. Assign `app_metadata.registry_role = operator` to that account through a trusted Dashboard/Admin API action. Assign reviewer role only to named, authorised reviewers; never give every therapist a reviewer/operator role.
8. Enrol and verify TOTP for every operator/reviewer account before enabling privileged work. The hosted staging project now has database-side AAL2 checks on privileged RPCs, live Auth app_metadata role checks to defeat stale JWT role claims, and matching protections for consent-table RLS, Storage downloads and the case-workflow trigger; these migrations have been applied and recorded.
9. Independently verify every therapist's identity and professional registration before activating membership.

The available Supabase connection can inspect the database, migrations, project URL and publishable keys, but it does not expose Auth user administration or project Auth settings. The settings above require the project owner/operator in the Supabase Dashboard or an approved Admin API client. GitHub Actions repository secrets are also not exposed to the connected GitHub integration; the owner must add them directly in repository Settings → Secrets and variables → Actions. Add `PNA_PREVIEW_ACCESS_PASSWORD` there as a strong random ASCII passphrase of at least 32 characters. Do not paste it into chat or commit it to source control. The Preview workflow copies it into the isolated Worker as a Cloudflare secret on each deploy.

## Testing and acceptance

### Already passed
- Hosted rollback-only SQL tests for cross-therapist isolation, wrong-owner consent denial, purpose separation, case submission/review/publication and withdrawal.
- Hosted role-separation tests proving ordinary therapists cannot access reviewer/operator queues and reviewer/operator roles cannot cross into each other's queues.
- Historical baseline CI run #265 passed TypeScript, Deno Edge Function type-check, secure-route and PostgREST schema-isolation guards, migrations, 81 pgTAP assertions, backup/restore and cleanup. The current branch now passes 100/100 assertions on its latest head, including live-role, consent-review RLS, reviewer SELECT visibility and consolidated owner/reviewer policy checks.
- Historical Cloudflare build workflow #32 passed dependency audit, TypeScript, Next.js build and OpenNext Cloudflare build. The current head must pass its own latest build workflow before release.
- Hosted read-only checks: `clinical_api` is exposed to PostgREST; expected schema usage and public RPC execute grants are present; all Registry Auth users, therapist memberships, patients, reports, consent events/evidence, public cases and consent Storage objects remain at zero.

### Still required
- Hosted authenticated end-to-end testing with disposable therapist/reviewer identities and synthetic consent files.
- Hosted synthetic Auth identities and synthetic consent files must exercise upload, server verification, private download, mismatch rejection, reviewer approval/rejection, care-consent patient creation, publication-consent activation, withdrawal and public-case suppression.
- Test the Edge Function from the production Registry browser origin and reject invalid/expired JWTs, wrong owners, inactive memberships, invalid file signatures, size mismatches and hash mismatches.
- Complete the Preview/browser run on desktop and mobile, including keyboard/accessibility, email confirmation and recovery. The isolated workers.dev Worker must pass the new unauthenticated-401 and authenticated-200 password-gate smoke tests, plus both Registry route checks. Its noindex headers are enabled only in Preview builds. The shared password gate protects the Preview perimeter but does not replace the database security boundary; do not use it with real patient data.
- Perform backup/restore and export/recovery drills against the hosted project, not only the disposable CI database.
- Obtain independent penetration testing and remediate all critical/high findings.

The current hosted project has no Auth identities or consent objects, and the available management connector does not expose Auth user creation or a Storage object upload operation. Therefore the hosted browser end-to-end tests cannot be truthfully marked complete yet.

## Database advisor notes

Latest Advisor read:
- Seven INFO-level `rls_enabled_no_policy` notices relate to intentionally private internal/governance tables. Do not add broad policies just to silence them.
- The 27 advisor-identified foreign-key indexes have been applied, and the duplicate permissive case-library SELECT/UPDATE policies have been consolidated. The advisor now reports 28 unused indexes because the staging tables are empty (27 new FK indexes plus one pre-existing index); do not remove them until representative workload and query plans justify it.
- No new consent-evidence security warning was introduced by the integrity migration.

## Product and legal release gates

Keep `SIGNED_CONSENT_FORM_APPROVED = false` and `SIGNED_CONSENT_EVIDENCE_WORKFLOW_READY = false` until all conditions are met:

- Institution/ethics-approved consent form and exact immutable version supplied.
- Institutional/legal privacy review, lawful basis, retention/deletion, patient access/correction, breach response and backup retention approved.
- Trusted operator/reviewer identities, Auth settings and MFA configured.
- Hosted end-to-end tests and independent security review passed.
- Protected browser Preview and production acceptance passed.
- PRs #151–#156 are merged into `registry-preview` in the correct dependency order. Do not merge `registry-preview` into `cloudflare-deploy` until hosted Auth/E2E, consent/legal approvals, backup/recovery, independent security review and production sign-off are complete.

Do not enter real patient data, upload real signed forms, publish cases, merge `registry-preview` into `cloudflare-deploy` or deploy production before those gates are closed.
