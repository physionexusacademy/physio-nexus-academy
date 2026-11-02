# PNA Clinical Registry — operator and technical runbook

## Current status

- Dedicated hosted project: **PNA Clinical Registry**, Singapore, ref `zfoohwqyoengbszuylxj`; current status `ACTIVE_HEALTHY`.
- This project is separate from the PNA website Supabase project. Never substitute the website's credentials or replay website migrations into this project.
- Fifteen migrations are recorded in hosted staging.
- Hosted staging currently has zero Auth users, therapist memberships, patients, clinical reports, consent events, consent evidence records, and public case entries. The private consent bucket has zero objects.
- Supabase Edge Function `verify-consent-evidence` is deployed and ACTIVE with JWT verification enabled.
- Latest fully passed checks before the new static guard: Registry security workflow #258 / run `41427219214` and production build workflow #17 / run `41427219283`, both on commit `a29e3bb7e03b0e9ec0a108fc999b177264241f5f`. The Registry run passed TypeScript, Deno, secure-route guard, isolated migrations, 81/81 pgTAP assertions, disposable backup/restore and cleanup. The build run passed dependency audit, TypeScript, Next.js and OpenNext Cloudflare build. The latest integration guard and PostgREST schema-isolation check passed in CI #265 / run `41429152642`; the latest Next.js/OpenNext build passed in #32 / run `41429152617`. These are automated test results, not hosted browser E2E or production acceptance.
- PR #156 remains a draft and unmerged. It is not deployed to the production website.

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
- Uses Supabase-provided server environment variables. It must never receive service-role credentials from the browser.
- The service-only database RPCs are:
  - `clinical_api.get_consent_evidence_integrity_request(uuid)`
  - `clinical_api.record_consent_evidence_integrity(uuid,uuid,text,bigint)`
- These functions revoke execution from `public`, `anon`, and `authenticated`, and grant only to `service_role`.

## Auth and privileged accounts

Hosted Auth has no users yet. Before any real therapist is onboarded:

1. Set the Auth Site URL to `https://physionexusacademy.com` and allow the exact redirect `https://physionexusacademy.com/clinical-registry` (the app adds `?recovery=1` for password recovery). Add the exact Preview origin only when a protected Preview URL exists. Enable the Email provider, require email confirmation, keep anonymous sign-ins disabled, configure production SMTP and recovery templates, and review session lifetime, rate limits and abuse monitoring.
3. Create the first trusted operator only through the approved administrator process.
4. Assign `app_metadata.registry_role = operator` to that account through a trusted Dashboard/Admin API action.
5. Assign reviewer role only to named, authorised reviewers. Do not give every therapist a reviewer/operator role.
6. Enrol and require MFA for operator/reviewer accounts. **Current code still needs a database-side AAL2 check on every privileged operator/reviewer RPC and RLS policy before any privileged role is assigned.** Do not create/assign privileged roles until that enforcement and its tests are in place; a Dashboard MFA toggle alone is not proof of backend enforcement.
7. Independently verify every therapist's identity and professional registration before activating membership.

The available Supabase connection can inspect the database, migrations, project URL and publishable keys, but it does not expose Auth user administration or project Auth settings. The settings above require the project owner/operator in the Supabase Dashboard or an approved Admin API client. GitHub Actions repository secrets are also not exposed to the connected GitHub integration; the owner must add them directly in repository Settings → Secrets and variables → Actions.

## Testing and acceptance

### Already passed
- Hosted rollback-only SQL tests for cross-therapist isolation, wrong-owner consent denial, purpose separation, case submission/review/publication and withdrawal.
- Hosted role-separation tests proving ordinary therapists cannot access reviewer/operator queues and reviewer/operator roles cannot cross into each other's queues.
- Local disposable CI run #265: TypeScript, Deno Edge Function type-check, secure-only route and PostgREST schema-isolation guards, migrations, 81 pgTAP assertions, backup/restore and cleanup.
- Cloudflare production build workflow #32: dependency audit, TypeScript, Next.js build and OpenNext Cloudflare build.
- Hosted read-only checks: `clinical_api` is exposed to PostgREST; expected schema usage and public RPC execute grants are present; all Registry Auth users, therapist memberships, patients, reports, consent events/evidence, public cases and consent Storage objects remain at zero.

### Still required
- Hosted authenticated end-to-end testing with disposable therapist/reviewer identities and synthetic consent files.
- Hosted synthetic Auth identities and synthetic consent files must exercise upload, server verification, private download, mismatch rejection, reviewer approval/rejection, care-consent patient creation, publication-consent activation, withdrawal and public-case suppression.
- Test the Edge Function from the production Registry browser origin and reject invalid/expired JWTs, wrong owners, inactive memberships, invalid file signatures, size mismatches and hash mismatches.
- Complete a protected Preview/browser run on desktop and mobile, including keyboard/accessibility and recovery flows. Preview URLs were previously disabled for this Cloudflare Worker.
- Perform backup/restore and export/recovery drills against the hosted project, not only the disposable CI database.
- Obtain independent penetration testing and remediate all critical/high findings.

The current hosted project has no Auth identities or consent objects, and the available management connector does not expose Auth user creation or a Storage object upload operation. Therefore the hosted browser end-to-end tests cannot be truthfully marked complete yet.

## Database advisor notes

Latest Advisor read:
- Seven INFO-level `rls_enabled_no_policy` notices relate to intentionally private internal/governance tables. Do not add broad policies just to silence them.
- Twenty-seven unindexed foreign-key notices and one unused-index notice remain. Review after representative synthetic workload and query plans exist; do not add/drop indexes speculatively on an empty database.
- No new consent-evidence security warning was introduced by the integrity migration.

## Product and legal release gates

Keep `SIGNED_CONSENT_FORM_APPROVED = false` and `SIGNED_CONSENT_EVIDENCE_WORKFLOW_READY = false` until all conditions are met:

- Institution/ethics-approved consent form and exact immutable version supplied.
- Institutional/legal privacy review, lawful basis, retention/deletion, patient access/correction, breach response and backup retention approved.
- Trusted operator/reviewer identities, Auth settings and MFA configured.
- Hosted end-to-end tests and independent security review passed.
- Protected browser Preview and production acceptance passed.
- PR #151 targets `cloudflare-deploy`; PRs #152–#156 remain stacked on their preceding feature branches. Preserve merge order #151 → #152 → #153 → #154 → #155 → #156. The cumulative stack remains a draft and unmerged; review the complete diff and obtain explicit approval before merging or deploying.

Do not enter real patient data, upload real signed forms, publish cases, merge PR #156 or deploy to production before those gates are closed.
