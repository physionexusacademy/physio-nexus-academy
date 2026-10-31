# PNA Clinical Registry — Case Ownership, Sharing and Data Model

**Status:** Implementation specification; repository-only, not deployed.
**Parent architecture:** PR #147 — private clinical data boundary.
**Core requirement:** A case's creator is its case owner/administrator. Website-wide administrators do not automatically gain authority to edit, manage, or delete that case.

## 1. Two separate data domains — never mix them

### A. Private patient record (clinical workspace)
Contains identifiable patient details and the full clinical record. It is private to the creating clinician and explicitly authorised team members. It is never publicly readable and is never queried by the public Case Library.

Proposed tables in the non-exposed `clinical_private` schema:
- `patients`: minimal identity and internal patient reference; `created_by` is the owning clinician.
- `clinical_reports`: episode/report envelope; `created_by` is the case-record owner.
- `clinical_assessments`, `clinical_interventions`, `clinical_outcomes`: child records authorised through their parent report.
- `clinical_teams`, `clinical_team_memberships`: explicit shared access, scoped to a team and a role.
- `clinical_audit_events`: append-only audit trail.

No anonymous grants. Do not expose these tables through PostgREST. Enforce RLS and parent-based authorisation. Website admin roles are not clinical roles.

### B. Public learning case (Case Library)
A separate, de-identified educational copy/snapshot. It contains only reviewed educational content and must not contain patient name, initials, phone, email, exact date of birth, address, medical-record number, face, identifiable document/image, or other direct/indirect identifiers.

Proposed tables in a separate `case_library` non-exposed schema:
- `cases`: public-safe educational case content, status, owner, timestamps, publication version.
- `case_collaborators`: optional per-case collaborators and their case-specific permissions.
- `case_publication_reviews`: publication/de-identification review decisions.
- `case_audit_events`: append-only case-level audit events.

A public case is created by an explicit **Publish as educational case** workflow. It is not a live view of a private patient record. The publish workflow copies only approved, de-identified fields into the public case domain.

## 2. Case roles and exact permissions

| Actor | Read published cases | Read own drafts | Create case | Edit/manage case | Publish/unpublish own case | Manage someone else's case |
|---|---:|---:|---:|---:|---:|---:|
| Public visitor / signed-in learner | Yes | No | No (unless later enabled) | No | No | No |
| Case owner (creator) | Yes | Yes | Yes | Yes, own case only | Yes, own case only | No |
| Case-specific editor/collaborator | Yes | If explicitly shared | No by default | Only if owner grants edit | No, unless explicitly granted publish permission | No |
| Case-specific reviewer | Yes | If explicitly shared | No | No; can submit review feedback | No | No |
| Website-wide admin | Yes, as public reader | No by default | No special privilege | **No automatic case ownership or edit rights** | No | **No** |
| Designated safety moderator | Yes | Only if separately authorised | No | No clinical-content editing | May temporarily hide/quarantine a case under a documented safety process; cannot rewrite or claim ownership | No editing/deletion |

**Important distinction:** website administration (site pages, users, workshops, settings) is not case administration. The person who submits a case owns and administers that case. Any exception must be a separately granted, case-specific permission and must be audited.

A safety moderator is a narrowly scoped exception only for urgent privacy/safety takedown. They may set a case to `quarantined` or `hidden`, record a reason code, and notify the owner. They cannot edit the case narrative, transfer ownership, or permanently delete the case. This is not a general website-admin override.

## 3. Publication lifecycle

`draft → submitted_for_review → approved → published → unpublished/archived`

- Only the owner (or a case-specific user explicitly granted publish permission) can submit/publish/unpublish.
- Publication requires a completed de-identification checklist and confirmation that the required patient consent/legal basis for educational publication has been obtained and recorded separately from treatment consent.
- Reviewers can approve/reject or request changes; review does not transfer ownership.
- A published case is readable by everyone. Drafts and review notes remain private to the owner and explicitly assigned reviewers.
- The owner can update or unpublish their case. Updates to a published case create a new version and re-enter review before the changed version becomes public.
- A safety moderator can temporarily quarantine a published case if a credible privacy/safety concern is reported. The action is logged and the owner is notified.
- No public comments or uploads in the first release; these increase privacy and moderation risk.

## 4. Database-enforced authorisation (not just UI hiding)

- Every case has immutable `owner_id` set from `auth.uid()` at creation. Clients cannot choose or change it.
- Case ownership cannot be transferred through ordinary update operations.
- Case owner policies must check the authenticated identity against `owner_id`.
- Collaborator policies must check an active row for that exact `case_id`, user, and permitted role. A collaborator on Case A gets no access to Case B.
- Public SELECT is permitted only for rows whose publication state is `published` and whose public version has passed review. Public SELECT returns only the public-safe case table/view, never private patient tables.
- Draft/review rows are readable only by the owner and specifically assigned reviewers/collaborators according to role.
- Owner UPDATE policies must use both `USING` and `WITH CHECK`; owner_id, case_id and publication review state cannot be reassigned by a client.
- No ordinary DELETE. Owner may unpublish/archive. Retention deletion is a separate, reviewed process.
- Website-admin role or `public.profiles.role` must never appear as a blanket bypass in case RLS.
- Public-safe views, if used, must be `security_invoker = true` on supported PostgreSQL versions and must not join private patient tables.
- Do not add SECURITY DEFINER functions to bypass RLS. Prefer invoker access and explicit grants.
- Audit create, edit, submit, review, publish, unpublish, quarantine, export and ownership/permission changes. Store changed field names and identifiers, not patient narrative or PHI.

## 5. Suggested case fields

Public educational case fields only:
- `id` UUID, `owner_id` UUID, `slug` non-identifying random/public slug.
- `title`, `region`, `case_category`, `age_band` (broad band only, optional), `sex` only if clinically necessary and consented.
- `presentation_summary`, `relevant_history`, `examination_findings`, `clinical_reasoning`, `differential_considerations`, `management_plan`, `follow_up_outcomes`, `learning_points`, `references`.
- `status`, `published_version`, `created_at`, `updated_at`, `published_at`.
- No patient identifiers, exact visit dates, contact details, free-form uploaded originals, or unreviewed media.

Do not assume that removing a name makes a case anonymous. Rare diagnoses, precise dates, unusual occupations, locations, images, and combinations of details can re-identify a person. Apply a human de-identification review before publication.

## 6. Security tests required before any hosted database

Use synthetic users only:
1. Anonymous visitor can read published public-safe cases, but cannot read drafts or private patient tables.
2. Learner can read published cases but cannot create/update/unpublish another user's case.
3. Owner A can create, read, edit, submit, publish and unpublish Case A.
4. Owner A cannot read or edit Owner B's draft or private patient record.
5. Website admin with only the website-admin role cannot edit, publish, delete, or access another user's draft case.
6. Case-specific editor for Case A cannot edit Case B and cannot publish unless granted that exact permission.
7. Reviewer can review only assigned cases and cannot edit content or publish.
8. Safety moderator can quarantine a case but cannot edit narrative, transfer ownership, or permanently delete it.
9. Client cannot change owner_id, bypass review, mark a draft as published, or inject an arbitrary publication timestamp.
10. Public response contains no private patient fields, review notes, audit data, or hidden draft content.
11. A published update remains on the last approved version until the new version passes review.
12. Every privileged case action creates an audit event; audit rows cannot be changed by ordinary users.

Run these tests against a disposable local Supabase/Postgres environment with at least three users (two case owners and one website admin), plus a separate reviewer/moderator identity. Never run synthetic test scripts against the live PNA website database.

## 7. Low-load implementation sequence

1. Keep the current PNA website Supabase project out of the registry runtime.
2. Inspect the Phase 1 report contract and existing Clinical Registry UI before choosing final column names and integration points.
3. Generate migration filenames using Supabase CLI; do not invent migration filenames.
4. Implement private patient tables and public case-library tables in separate non-exposed schemas.
5. Add RLS/grants and automated tests; verify public access is restricted to approved de-identified case records.
6. Run local tests and security/performance review.
7. Only after local verification, obtain an exact cost quote and explicit approval before provisioning a separate hosted Registry Supabase project.
8. Website integration and real patient onboarding remain separate approval gates.

## 8. Current status

| Workstream | Status |
|---|---|
| Private patient vs public learning-case separation | Specified |
| Case creator is case owner/admin | Specified |
| Website admin has no automatic case-management rights | Specified |
| Per-case collaborator/reviewer permissions | Specified |
| Public read of approved de-identified cases | Specified |
| SQL schema/migrations | Not yet generated or applied |
| RLS implementation and automated tests | Not yet implemented or run |
| Hosted database | Not created; cost approval required |
| Website integration / real patient onboarding | Not started; blocked pending security gates |

**This document is a design artifact, not a running database. No live Supabase project has been changed.**
