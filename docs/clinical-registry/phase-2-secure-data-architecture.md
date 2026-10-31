# PNA Clinical Registry — Phase 2 Secure Data Architecture

**Status:** Design/staging specification only  
**Target:** Supabase project `oabckudgmzbbbbhkeolk` (Postgres 17)  
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

## 2. Current environment findings

- The connected Supabase project is active and healthy, running PostgreSQL 17 in `ap-southeast-1`.
- Existing PNA tables are in `public`; the existing `profiles.role` check permits only `owner`, `admin`, and `editor`. Do not overload this website-admin role to mean a verified clinician.
- Existing public tables use a mixture of public-read/admin-write and server-only patterns. The clinical registry must have its own isolated authorization model.
- There are currently no Supabase development branches. Creating a branch was attempted but blocked by the platform's cost-confirmation safety gate; no branch or database change was made.
- Supabase's 30 October 2026 Data API change means newly created `public` tables are no longer automatically exposed. Any future API grants must be explicit and minimal; grants do not replace RLS.

## 3. Proposed database boundary

Use a dedicated, non-exposed PostgreSQL schema named `clinical_private` for identifiable clinical data and internal access-control tables. Do not add this schema to Supabase's exposed Data API schemas.

Expose only a narrowly scoped `clinical_api` schema if/when the application needs PostgREST RPC access. RPC functions must be `SECURITY INVOKER`; do not use `SECURITY DEFINER` as a shortcut around RLS. The caller's authenticated JWT context must remain available so `auth.uid()`-based policies are evaluated for the real user.

Grant `USAGE` on `clinical_private` and only the minimum table privileges required to the `authenticated` role for invoker RPC execution. Do not grant anything to `anon`. Do not expose base tables through PostgREST. Recheck Data API schema configuration before enabling any RPC endpoint.

## 4. Proposed entities

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

### Data minimisation

- Do not require date of birth, address, phone, or email for a clinical report unless a documented clinical/operational need exists.
- Prefer a patient reference and minimum display identity. Store direct identifiers separately from clinical narrative if the product later requires them.
- Do not store passwords, access tokens, or raw authentication secrets.
- Never put patient names, diagnoses, free-text notes, or other PHI in audit metadata, analytics, logs, URLs, or error messages.
- Use database/platform encryption at rest and TLS in transit. If field-level encryption is later required, define key custody and rotation before implementation; do not invent an application-managed encryption key.

## 5. Access model

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

## 6. Audit and consent

- Audit create/update/finalise/archive/export events. Record actor, time, action, entity ID, and changed field names only.
- Audit records are append-only: authenticated clients receive no UPDATE or DELETE privilege.
- Use invoker trigger functions for audit writes; avoid SECURITY DEFINER functions.
- Capture patient consent status, purpose, captured-at time, and the staff member recording it. Consent to treatment and consent to public case publication are separate.
- Final reports require verified therapist identity, as already enforced by the Phase 1 report contract.
- Define retention, correction, export, and deletion procedures with applicable Pakistani privacy/professional requirements before real-world use.

## 7. RLS verification matrix (must pass before production)

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

## 8. Deployment sequence

1. Finalise this design and review the exact SQL migration.
2. Obtain an isolated Supabase development branch/project. If the platform quotes a non-zero cost, obtain explicit approval before creating it.
3. Create migration using the Supabase CLI's migration generator; do not hand-invent migration filenames.
4. Apply to the isolated database only.
5. Run RLS tests, schema/grant inspection, and Supabase Security + Performance Advisors; fix all high/critical findings.
6. Implement the `clinical_api` invoker RPC layer and server/client integration only after the database tests pass.
7. Obtain a separate production rollout approval. No real patient records until authentication, consent, access logging, retention, backup/restore, and security review are complete.

## 9. Out of scope for Phase 2

- No production schema changes or data writes.
- No patient onboarding or real patient record entry.
- No public registry publication.
- No PDF report generation.
- No new auth provider or password flow.
- No change to existing PNA website tables, roles, or public Case Lab data.
