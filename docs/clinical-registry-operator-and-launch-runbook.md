# PNA Clinical Registry — operator and technical runbook

## Current status

- Dedicated hosted project: **PNA Clinical Registry**, Singapore, ref `zfoohwqyoengbszuylxj`; current status `ACTIVE_HEALTHY`.
- This project is separate from the PNA website Supabase project. Never substitute the website's credentials or replay website migrations into this project.
- Twenty-eight migrations are recorded in hosted staging, including AAL2/live-role enforcement, 27 foreign-key indexes, reviewer-read and consolidated case-library policies, report initial-state guard, lightweight-consent replacement and the independent-operator self-approval guard (hosted migration version `20261103042622`). The two consent migrations are recorded in the hosted ledger as versions `20261102211710` and `20261102212219`; their repository files are ordered after the legacy consent migrations for clean local replay. Do not run `supabase db push` or migration repair until the hosted/local history is reconciled; continue using explicit hosted migration operations.
- Hosted staging currently has **4 Auth users, 1 operator, 0 reviewers, 1 active verified therapist membership and 1 therapist application**. The hosted database contains **1 patient row and 1 consent event**, with 0 reports, 0 case submissions, 0 published cases and 0 consent files. The patient row has not been inspected or changed; confirm whether it is synthetic before any further test or cleanup. The legacy consent-evidence table and review table are removed; the private bucket is empty and has no client upload/download policies. All 18 current `clinical_private` tables have RLS enabled and FORCE RLS.
- Supabase Edge Function `verify-consent-evidence` remains deployed only as a retired endpoint (version 7, JWT verification enabled) and returns HTTP 410 without accessing Storage or the database. No Registry client invokes it.
- The lightweight consent redesign and independent-operator guard passed local DB security workflow [41577824280](https://github.com/physionexusacademy/physio-nexus-academy/actions/runs/41577824280): 29/29 integration checks and 93/93 pgTAP assertions, including self-approval and self-membership denial. Preview workflow [41577824241](https://github.com/physionexusacademy/physio-nexus-academy/actions/runs/41577824241) passed Cloudflare build, isolated Worker deployment and protected-route smoke tests. The new guard is applied to hosted staging; hosted transaction tests also confirm both self-actions are denied.
- The `registry-preview` branch contains the isolated Registry work. The production branch `cloudflare-deploy` remains unchanged; do not merge or deploy it without explicit approval.
- Isolated Preview Worker: `https://pna-clinical-registry-preview.physionexusacademypk.workers.dev`. It is a separate Worker with no production custom-domain route. Cloudflare Access is not enabled because the owner does not wish to provide payment-card details. The Preview-only HTTP Basic gate from PR #157 is now deployed: GitHub Actions Preview run #9 (`41485143120`) passed the secret-length/Cloudflare credential checks, installed `PNA_PREVIEW_ACCESS_PASSWORD` as a Worker secret, deployed the isolated Worker, and passed unauthenticated HTTP 401 plus authenticated HTTP 200 smoke tests for both `/clinical-registry` and `/clinical-registry/library`. The gate fails closed with HTTP 503 if the Worker secret is missing or shorter than 32 characters. This shared-password perimeter is for Preview access only; it is not an identity provider and does not replace Supabase Auth, MFA, RLS or server-side ownership checks. Use synthetic data only.
- Preview run #9 (`41485143120`) passed the password-gate deployment and unauthenticated/authenticated route smoke tests. Preview run #10 (`41487493241`) passed the clinical RPC response-hardening build and smoke tests. Preview run #13 (`41488148839`) passed again after the report initial-state guard. A follow-up cleanup commit `b9c5097b0c8d714bc8fc1072a7a58b180bb6d6e8` removed the obsolete root middleware copy; the active `src/middleware.ts` remains the deployed implementation.
- The consent file verifier has been retired (version 7 returns HTTP 410). No CORS allowlist or storage upload/download workflow is needed for consent.

## Architecture and access boundaries

- Browser client and public library use `NEXT_PUBLIC_CLINICAL_REGISTRY_SUPABASE_URL` plus the preferred `NEXT_PUBLIC_CLINICAL_REGISTRY_SUPABASE_PUBLISHABLE_KEY` (or the legacy `NEXT_PUBLIC_CLINICAL_REGISTRY_SUPABASE_ANON_KEY` fallback). Both keys must belong to the dedicated Registry project.
- The Cloudflare production build workflow reads `NEXT_PUBLIC_CLINICAL_REGISTRY_SUPABASE_URL` and `NEXT_PUBLIC_CLINICAL_REGISTRY_SUPABASE_PUBLISHABLE_KEY` from GitHub Actions repository secrets. Add both using the dedicated Registry project values only; do not reuse the main PNA website project URL/key. Missing values intentionally leave Registry unavailable without blocking unrelated PNA deployment.
- The deployment workflow may pass `CLINICAL_REGISTRY_CONSENT_VERSION` as an optional version label. If unset, the client uses `PNA-OFFLINE-CONSENT-ATTESTATION-V1`. No service-role or secret key is used by the browser Registry client.
- `clinical_api` is exposed to PostgREST (`pgrst.db_schemas=public, clinical_api` verified on the hosted `authenticator` role); `anon` and `authenticated` have schema usage, and `anon` can execute only the intended public-list RPC. `clinical_private` is not exposed to browser clients.
- Private clinical tables have RLS enabled and forced. Anonymous clients have no direct private-table access. Therapists are restricted to their own patient/report records.
- Therapist verification, case review and operator actions use distinct trusted roles. There is no separate signed-consent reviewer queue. Role claims must be placed in Supabase Auth `app_metadata` by a trusted administrator; never use user-editable `user_metadata`.
- The service-role key is backend-only. Never put it in source control, browser code, `NEXT_PUBLIC_*`, Cloudflare client variables or logs.
- The Registry contains one existing patient row and one consent event. Their content has not been inspected; do not assume they are synthetic or alter them without owner confirmation. Keep staging synthetic-only.

## Lightweight consent attestation flow

1. Before creating a patient record, the therapist obtains written clinical-care/documentation consent and keeps the signed original in the clinic/institution's secure records.
2. The therapist adds the patient in the Registry and confirms that the written original has been obtained and retained. The Registry writes one small clinical-care consent event atomically with patient creation.
3. Before submitting a de-identified case for public educational publication, the therapist obtains separate written publication consent and retains that signed original outside PNA.
4. The therapist confirms the separate publication consent in the case-submission form. The Registry writes one small append-only publication-consent event; no file, image, PDF, hash or object metadata is uploaded.
5. The de-identified case still goes through independent reviewer approval and a separate publish action. Withdrawal is recorded as a later consent event and suppresses the public case.

**Important:** A checkbox is a therapist attestation, not proof that a signature is authentic or that the patient understood the form. Institutional/legal approval of the actual offline form, privacy wording, retention and publication process remains mandatory. Never upload signed patient documents to PNA.

## Retired consent upload endpoint

- Function slug: `verify-consent-evidence`.
- JWT verification remains enabled; version 7 returns HTTP 410 with a retirement message.
- It performs no Storage access, file hashing or database RPC calls. No browser workflow invokes it.
- The old evidence tables, evidence RPCs, Storage upload/download policies and event evidence foreign key have been removed. The empty `clinical-consent-evidence` bucket is retained because Supabase Storage protects direct SQL bucket deletion; with no objects and no client policies it is dormant.

## Auth and privileged accounts

Hosted Auth currently has four email-confirmed accounts: one designated operator, no reviewer, and the remaining test identities not yet assigned privileged roles. There is one active therapist membership; its approval was self-attributed to the same operator and awaits independent review. Before production use:

1. The project owner has already entered the production Auth Site URL and redirect URL. Keep Site URL as `https://physionexusacademy.com`; verify the production callback `https://physionexusacademy.com/clinical-registry` remains allowlisted. For Preview testing, add these exact additional Redirect URLs (no wildcard): `https://pna-clinical-registry-preview.physionexusacademypk.workers.dev/clinical-registry` and `https://pna-clinical-registry-preview.physionexusacademypk.workers.dev/clinical-registry?recovery=1`. The Registry sign-up and confirmation-resend code now explicitly returns to the current origin; password recovery also uses the current origin with `?recovery=1`.
2. Enable the Email provider and email confirmations, keep anonymous sign-ins disabled, configure production SMTP and the default Reset Password template, keep the minimum password length at 8, and keep Secure Password Change enabled.
3. Under Authentication → Multi-Factor, ensure App Authenticator/TOTP enrollment and verification are enabled. The Registry UI guides trusted reviewer/operator accounts through TOTP enrollment and challenge; privileged database RPCs and case-workflow triggers require AAL2.
4. The Preview origin is already present as an exact CORS allowlist entry in deployed Edge Function version 4. Add the two exact Preview callback URLs in step 1 to Supabase Auth Redirect URLs. Remove the Preview CORS origin and callback URLs after acceptance testing.
5. Review session lifetime, rate limits and abuse monitoring.
6. Create the first trusted operator only after the live-role/AAL2 migrations have passed CI and have been applied to the dedicated hosted Registry project. This prerequisite is satisfied by the hosted migration history and security checks recorded above.
7. For the isolated Preview bootstrap only, Edge Function `bootstrap-first-registry-operator` is deployed with JWT verification enabled. It accepts only the designated confirmed account (UID `fc9992a5-557f-4b9e-83a4-6f560c9e4134`, `sajjadraza.dpt@gmail.com`), verifies the live Auth user server-side, inventories Auth users to fail closed if another Operator exists, and assigns only `app_metadata.registry_role = operator`. The service-role key is read only from the Edge Function server environment and is never sent to the browser. The Registry Preview UI exposes the one-time setup action only to that exact account. The user must invoke it from their authenticated Preview session; do not call it with an arbitrary token or expose the function to other origins. The function is not a general role-management API and must not be repurposed for other users or roles.
8. After successful assignment, the user must sign out/in, enrol and verify TOTP, and reach AAL2 before privileged work is available. Assign reviewer role only to named, authorised reviewers through the approved administrator process; never give every therapist a reviewer/operator role. The hosted staging project has database-side AAL2 checks on privileged RPCs, live Auth app_metadata role checks to defeat stale JWT role claims, and matching protections for the case-workflow trigger; consent document storage/download has been retired.
9. Independently verify every therapist's identity and professional registration before activating membership.

The available Supabase connection does not expose general Auth user administration or project Auth settings. The first-operator bootstrap has been completed for the designated account. A hosted audit found that the sole operator account also approved its own therapist membership (the audit actor and target are the same account). This violates independent credential-review practice. The self-approval guard migration is now applied to hosted staging, passed CI, and passed hosted negative tests while preserving live-role/AAL2 checks. The existing membership has not been deactivated, to avoid unexpectedly locking the owner out of the existing patient record. A second trusted operator is required to independently review that membership before production. Do not use SQL to edit `auth.users`. Supabase Free plan does not provide leaked-password protection. Treat the Advisor warning as a plan limitation, not a failed configuration. Keep the minimum password length at 8, require unique passwords, and enforce TOTP/AAL2 for privileged accounts. Revisit leaked-password protection only if the project moves to a plan that supports it.

## Testing and acceptance

### Already passed
- Local pgTAP tests cover cross-therapist isolation, wrong-owner consent denial, clinical-care and publication-consent purpose separation, case submission/review/publication, withdrawal and explicit lightweight attestation. The plan is now 91 assertions; upload/integrity tests have been removed.
- Role-separation tests prove ordinary therapists cannot access reviewer/operator queues and reviewer/operator roles cannot cross into each other's queues.
- The consent redesign passed TypeScript, integration validation, isolated migration reset, 91/91 pgTAP assertions, disposable backup/restore and cleanup. The additional self-approval guard passed the updated 93-assertion suite.
- Hosted read-only checks: `clinical_api` is exposed to PostgREST; 18/18 private tables have RLS and FORCE RLS; no consent files exist. Current patient/report/consent/case counts are recorded above.

### Still required
- Hosted authenticated end-to-end testing with a disposable therapist/reviewer pair: create a patient using written-consent attestation, create/finalise a report, record separate publication consent, submit a de-identified case, review, publish, withdraw consent and confirm public suppression.
- Confirm the retired upload endpoint returns HTTP 410 and no browser path invokes Storage upload/download.
- Complete the manual Preview/browser acceptance on desktop and mobile, including keyboard/accessibility, email confirmation and recovery. Automated Preview access-gate tests already passed: unauthenticated requests receive 401 and authenticated requests receive 200 for both Registry routes. The shared password gate protects the Preview perimeter but does not replace the database security boundary; do not use it with real patient data.
- Perform backup/restore and export/recovery drills against the hosted project, not only the disposable CI database.
- Obtain independent penetration testing and remediate all critical/high findings.

The current hosted project has four Auth identities, one operator and no reviewer account. It has one active therapist membership that was self-approved, one patient row and one consent event; reports and case submissions are zero. Hosted authenticated browser acceptance is still required; first confirm whether the existing patient row is synthetic. Keep all signed consent originals outside PNA.

## Database advisor notes

Latest Advisor read:
- Six INFO-level `rls_enabled_no_policy` notices relate to intentionally private internal/governance tables. They are fail-closed by design; do not add broad policies just to silence them. One WARN reports Supabase Auth leaked-password protection disabled; enable it in the Dashboard before production.
- The 27 advisor-identified foreign-key indexes have been applied, and the duplicate permissive case-library SELECT/UPDATE policies have been consolidated. The latest advisor reports 15 unused indexes because staging has no representative workload; do not remove them until query plans and real workload justify it.
- No client consent-file upload/download policy remains. The empty legacy Storage bucket is dormant.

## Product and legal release gates

Before production use, obtain institutional/legal approval of the offline clinical-care and separate public-case publication consent forms, their version labels and the Registry's therapist-attestation process.
- Institutional/legal privacy review, lawful basis, retention/deletion, patient access/correction, breach response and backup retention approved.
- Trusted operator/reviewer identities, Auth settings and MFA configured.
- Hosted end-to-end tests and independent security review passed.
- Protected browser Preview and production acceptance passed.
- PRs #151–#158 are merged into `registry-preview` in the correct dependency order. Do not merge `registry-preview` into `cloudflare-deploy` until hosted Auth/E2E, consent/legal approvals, backup/recovery, independent security review and production sign-off are complete.

Do not enter real patient data, upload real signed forms, publish cases, merge `registry-preview` into `cloudflare-deploy` or deploy production before those gates are closed.
