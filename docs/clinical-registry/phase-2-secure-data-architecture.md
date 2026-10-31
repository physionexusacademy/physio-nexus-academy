# PNA Clinical Registry — Phase 2 Secure Data Architecture

**Status:** Design/staging specification only  
**Target website project:** `oabckudgmzbbbbhkeolk` (PostgreSQL 17; reference only — no registry workload will be deployed here)  
**Related foundation:** PR #146 — `feature/clinical-registry-report-foundation`  
**Phase 2 branch:** `feature/clinical-registry-phase-2-security`

## 1. Non-negotiable safety boundaries

- This registry is for private clinical records. It is not the public Case Lab or public research registry.
- No real patient data, test patients, names, phone numbers, dates of birth, clinical notes, or attachments are to be inserted during schema development.
- Do not expose patient tables to anonymous users.
- Do not put a Supabase service-role/secret key in browser code, public environment variables, or a mobile client.
- A user being authenticated is not enough: every operation must also prove active therapist membership and patient/team access.
- Public anonymised case publication is a separate, later workflow requiring explicit consent, de-identification review, and approval.
- The schema must not be deployed to production until the migration, RLS tests, and application access path have passed review.

## 2. Low-load development and hosting strategy

**Core decision: keep the existing PNA website Supabase project out of the registry's runtime path.** The website project is a reference/integration boundary, not the registry database.

### Stage A — zero-hosted-load development (now)

1. Keep schema design, SQL migrations, seed fixtures, RLS tests, and documentation in the GitHub feature branch only.
2. Run database development locally with Supabase CLI + local Postgres/Docker. Use synthetic fixtures only.
3. Run automated RLS tests locally against disposable users/teams/patients. Never connect test scripts to the live website project.
4. Keep the registry UI behind a disabled feature flag until its backend is independently provisioned.
5. Do not create a hosted Supabase development branch merely for convenience. It adds a separate compute resource and may incur hourly charges.

### Stage B — isolated hosted environment (only when local tests pass)

1. Prefer a **separate Supabase project dedicated to the Clinical Registry**, rather than adding registry tables, queries, storage, or Edge Functions to the current PNA website project.
2. Use synthetic data only in this isolated project during QA. Keep it in the same suitable region where feasible, but do not assume region selection changes pricing.
3. Keep registry connection secrets server-side. The public PNA website may call a narrow authenticated backend/API, but it must not receive privileged database credentials.
4. If a temporary hosted development branch is genuinely needed, first obtain the exact quoted cost and explicit approval. Delete it after testing if it is no longer needed.
5. A separate registry project is the preferred eventual production boundary too; it prevents registry traffic, storage growth, backups, and database load from competing with the academy website.

### Stage C — controlled integration

- Integrate only through a small, authenticated server-side boundary with strict request validation, rate limits, pagination, and bounded query sizes.
- Do not run patient-wide scans, unbounded exports, or heavy analytics on the website database.
- Use indexes that match actual query patterns; review query plans before release.
- Generate PDFs asynchronously in a dedicated worker/function or server-side job, not in a request that blocks the website.
- Keep registry file storage in its own private bucket/project, with signed short-lived access and size/type limits.
- Monitor registry resources independently. Set conservative alerts/quotas and review database, storage, egress, and function usage before expanding.
- Public Case Lab receives only manually approved, de-identified publication records through a separate one-way publication process; never query private patient tables directly.

### Progress tracking without production writes

- GitHub is the source of truth for design, migrations, tests, code review, and release status.
- Every phase change must update this document's status table and PR description.
- Use small, reviewable commits; link each implementation/test result to its commit or PR.
- Maintain a migration ledger in Git. Never apply an unreviewed migration to the live website database.
- Mark a task complete only after its evidence exists (test output, reviewed PR, or verified isolated deployment). “Designed” is not “deployed.”
- Keep a short progress note with: completed, in progress, blocked, next action, environment touched, and verification evidence.

## 3. Current environment findings

- The connected PNA website Supabase project is active and healthy, running PostgreSQL 17 in `ap-southeast-1`.
- Existing PNA tables are in `public`; the existing `profiles.role` check permits only `owner`, `admin`, and `editor`. Do not overload this website-admin role to mean a verified clinician.
- Existing public tables use a mixture of public-read/admin-write and server-only patterns. The clinical registry must have its own isolated authorization model.
- There are currently no Supabase development branches. A previous branch creation attempt was stopped by the platform's cost-confirmation gate; no branch or database change was made.
- Supabase's 30 October 2026 Data API change means newly created `public` tables are no longer automatically exposed. Any future API grants must be explicit and minimal; grants do not replace RLS.

## 4. Proposed database boundary

Use a dedicated, non-exposed PostgreSQL schema named `clinical_private` for identifiable clinical data and internal access-control tables. Do not add this schema to Supabase's exposed Data API schemas.

Expose only a narrowly scoped `clinical_api` schema if/when the application needs PostgREST RPC access. RPC functions must be `SECURITY INVOKER`; do not use `SECURITY DEFINER` as a shortcut around RLS. The caller's authenticated JWT context must remain available so `auth.uid()`-based policies are evaluated for the real user.

Grant `USAGE` on `clinical_private` and only the minimum table privileges required to the `authenticated` role for invoker RPC execution. Do not grant anything to `anon`. Do not expose base tables through PostgREST. Recheck Data API schema configuration before enabling any RPC endpoint.

## 5. Proposed entities

| Entity | Purpose | Important constraints |
|---|---|---|
| `therapist_memberships` | Verified clinician identity and registry eligibility | One row per Auth user; verification state; verified-by and timestamp; never trust user-editable JWT metadata |
| `teams` | Clinic/practice workspace | Created/managed by authorised registry administrators |
| `team_memberships` | User-to-team relationship | Unique team/user pair; role limited to owner, admin, clinician, assistant, read_only; active/revoked state |
| `patients` | Minimal patient identity and registry reference | Created-by user, optional team, non-guessable internal UUID, human-readable reference; consent state and timestamps |
| `clinical_reports` | Episode/report envelope | Patient, author, optional team, draft/final status, category, condition, created/updated timestamps |
| `clinical_assessments` | Initial and follow-up assessment sections | Report FK, assessment date/type, structured clinical fields |
| `clinical_interventions` | Treatment entries | Report FK, date, intervention, region, parameters, dosage, response, home advice |
| `clinical_outcomes` | Repeated outcome measures | Report FK, measure code/name, numeric value, unit, scale bounds, direction, date |
| `audit_events` | Append-only access/change trail | Actor, action, entity/table, entity UUID, timestamp, request correlation ID; no raw clinical values |

## 6. Data minimisation

- Do not require date of birth, address, phone, or email for a clinical report unless a documented clinical/operational need exists.
- Prefer a patient reference and minimum display identity. Store direct identifiers separately from clinical narrative if the product later requires them.
- Do not store passwords, access tokens, or raw authentication secrets.
- Never put patient names, diagnoses, free-text notes, or other PHI in audit metadata, analytics, logs, URLs, or error messages.
- Use database/platform encryption at rest and TLS in transit. If field-level encryption is later required, define key custody and rotation before implementation; do not invent an application-managed encryption key.

## 7. Access model

### Clinician eligibility

A clinician must have an active `therapist_memberships` row with a verified status before they can create or finalise clinical reports. Website roles in `public.profiles` are not clinical credentials.

### Patient/report access

A user may access a patient and its child records only when one of the following is true:

1. They are the patient record's `created_by` owner and their therapist membership is active; or
2. They have an active membership in the same team and the team's access rules permit their role.

Read-only team members may read but not create, update, or delete. Assistants must not finalise reports or alter therapist verification. Only designated registry administrators may verify clinician credentials or manage team membership.

### RLS requirements

- Enable and FORCE RLS on every table in `clinical_private`.
- Policies must target `authenticated` explicitly and use `(select auth.uid())`.
- Every INSERT policy must constrain the actor/owner and team membership.
- Every UPDATE policy must include both `USING` and `WITH CHECK` so ownership/team IDs cannot be reassigned.
- DELETE should be disabled for ordinary users. Use archive/soft-delete and a separately authorised retention workflow.
- Child-table policies must derive access from the parent report/patient, not trust a client-supplied owner ID.
- Team membership reads must be limited to the caller's own membership row unless a separately reviewed administrator workflow is implemented.
- Do not rely on `user_metadata` or user-editable JWT claims for roles or verification.

## 8. Audit and consent

- Audit create/update/finalise/archive/export events. Record actor, time, action, entity ID, and changed field names only.
- Audit records are append-only: authenticated clients receive no UPDATE or DELETE privilege.
- Use invoker trigger functions for audit writes; avoid SECURITY DEFINER functions.
- Capture patient consent status, purpose, captured-at time, and the staff member recording it. Consent to treatment and consent to public case publication are separate.
- Final reports require verified therapist identity, as already enforced by the Phase 1 report contract.
- Define retention, correction, export, and deletion procedures with applicable Pakistani privacy/professional requirements before real-world use.

## 9. RLS verification matrix (must pass before hosted QA)

| Scenario | Expected result |
|---|---|
| Anonymous user reads any clinical table | Denied |
| Authenticated user without active therapist membership | Denied |
| Clinician reads own patient | Allowed |
| Clinician reads another clinician's unshared patient | Denied |
| Active team clinician reads a team-shared patient | Allowed |
| User changes `created_by`, `team_id`, or report owner to another user | Denied |
| Read-only member inserts/updates/finalises | Denied |
| Assistant finalises a report | Denied |
| Unverified clinician finalises a report | Denied |
| User updates/deletes an audit event | Denied |
| Public/anonymous API can enumerate clinical data | Denied |
| Public Case Lab queries private clinical tables | Denied |

Automate these cases using Supabase database tests/pgTAP or an equivalent isolated test harness. Test at least two distinct authenticated users and two teams; do not use production patient data.

## 10. Deployment sequence

1. Finalise this design and review the exact SQL migration.
2. Develop and test locally first using Supabase CLI and synthetic fixtures.
3. Provision a separate hosted registry project only when local tests pass and the user has reviewed the quoted cost and explicitly approved it.
4. Create migrations using the Supabase CLI's migration generator; do not hand-invent migration filenames.
5. Apply migrations to the isolated registry environment only.
6. Run RLS tests, schema/grant inspection, and Supabase Security + Performance Advisors; fix all high/critical findings.
7. Implement the authenticated API layer and application integration only after database tests pass.
8. Obtain separate approval for production registry launch and a separate approval for any PNA website integration/deployment.
9. Do not onboard real patients until authentication, consent, access logging, retention, backup/restore, and security review are complete.

## 11. Progress ledger

| Workstream | Status | Evidence / next gate |
|---|---|---|
| Phase 1 report foundation | Staged in PR #146 | Review/merge state tracked in GitHub |
| Phase 2 security architecture | Documented in PR #147 | This specification; no database writes |
| Website Supabase impact isolation | Strategy defined | Local-first; separate registry project preferred |
| SQL migrations and schema | Not started | Start only after architecture review |
| RLS automated tests | Not started | Synthetic users/teams in local database |
| Hosted registry environment | Blocked pending cost review | No hosted branch/project created |
| App/API integration | Not started | After isolated DB and RLS tests pass |
| PDF/report automation | Not started | After secure data path is proven |
| Production patient onboarding | Explicitly blocked | Separate security and launch approval |

**Last verified boundary:** no registry schema, migration, patient data, storage bucket, or Edge Function has been created in the current PNA website Supabase project.

## 12. Out of scope for this stage

- No production schema changes or data writes.
- No patient onboarding or real patient record entry.
- No public registry publication.
- No PDF report generation.
- No new auth provider or password flow.
- No change to existing PNA website tables, roles, or public Case Lab data.
