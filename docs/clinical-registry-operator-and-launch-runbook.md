# Clinical Registry — operator and launch runbook

## Current deployment boundary

- The Registry is a separate application/database integration from the existing PNA production Supabase project.
- A dedicated Supabase Free project, **PNA Clinical Registry**, is provisioned in Singapore (project ref: `zfoohwqyoengbszuylxj`). It is separate from the existing PNA website Supabase project.
- The eight versioned Registry migrations, including private-schema hardening, RLS-backed RPC privileges, consent ownership binding, and corrected tenant predicates, have been applied to this hosted project; the hosted database contains the Registry schemas and functions, with no patient records.
- The `clinical_api` schema is the browser-facing RPC surface; `clinical_private` is not exposed through PostgREST. All 18 private tables have RLS enabled. `anon` has no private table or sequence grants. `authenticated` has only minimum underlying `SELECT`/`INSERT`/`UPDATE` privileges on 12 owner-scoped tables needed by `SECURITY INVOKER` RPCs; the RLS policies remain the tenant boundary. The six internal authorization/governance tables have no client table grants or policies. Neither `anon` nor `authenticated` can execute private helper functions.
- The automated database workflow uses a disposable local Supabase stack and synthetic fixtures. Latest local security workflow run #208 (run ID `41400047102`) completed successfully on 2026-11-02 against commit `aecaf0877ac2e03c2c94168cca16d6a7d65e41a5`: TypeScript/integration type-check, all eight isolated Registry migrations, 63 pgTAP RLS/workflow assertions, disposable backup/restore, and cleanup all passed. This run includes the UI safety guard that disables patient intake and new case submissions until signed-consent evidence verification exists. A separate rollback-only synthetic tenant-isolation and consent workflow test also passed against the hosted project; broader hosted Auth, operator-role, and privilege-escalation testing remains pending.
- A live read-only hosted audit on 2026-11-02 confirmed the project is `ACTIVE_HEALTHY`, all eight migrations are recorded, all 18 private tables have RLS, `anon` has zero private table/sequence grants, `authenticated` has 24 narrowly scoped table privileges across 12 owner-scoped tables, both client roles have zero private-helper EXECUTE grants, and both client roles have zero sequence grants. Current hosted counts remain zero Auth users, zero patients, zero clinical reports, and zero Storage buckets.
- A hosted synthetic tenant-isolation and consent workflow test also passed inside a single SQL transaction: two temporary therapist identities were used to test cross-tenant reads/updates, cross-owner consent denial, wrong-purpose consent rejection, valid case submission/review/publication, and withdrawal hiding the public case. The transaction was rolled back; a follow-up audit confirmed zero Auth users, memberships, patients, reports, case submissions, consent events, and audit events remain. A second rollback-only hosted test also confirmed ordinary therapists cannot access reviewer/operator queues or decision RPCs, and reviewer/operator roles cannot cross into each other's queues.
- No Registry PDF files are stored in Supabase Storage. Clinical records remain structured database rows/JSON; PDF export is generated only on demand in the browser and downloaded locally.
- Cloudflare reported a successful Preview build for commit `98de76a` on 2026-11-02. Preview URLs are disabled for this Worker, so the build artifact has not been opened for end-to-end browser verification; enable a protected Preview URL or use an approved staging route before UI acceptance.
- Patient registration and new public-case submissions are now fail-closed in the UI because the current consent checkbox is only therapist attestation. A signed-consent evidence verification workflow is not yet implemented. Do not enter real patient information, upload identifiable records, or advertise the Registry as a production clinical record system until the launch gates below are closed.
- Do not place a Supabase service-role key in browser code, `NEXT_PUBLIC_*` variables, GitHub source, preview build variables, or client-visible logs.

## Therapist onboarding and verification

### Applicant workflow

1. The applicant creates an authenticated account.
2. The applicant submits their professional name, title, credentials, registration body/number, and optional institution through the onboarding form.
3. The request is stored in `clinical_private.therapist_verification_requests`.
4. The applicant can retrieve only their own status and reviewer note through `clinical_api.my_therapist_verification_request()`.
5. Submission does not grant membership, clinical-record access, reviewer access, or any privileged role.

### Trusted verification boundary

A restricted authenticated operator console is implemented in migration `20261101160000_clinical_registry_trusted_therapist_approval.sql`. Its database-side `SECURITY DEFINER` RPCs authorise only users with trusted Supabase Auth `app_metadata.registry_role = "operator"`; this role is not read from user-editable metadata and is separate from the PNA website administrator and case reviewer roles. The browser UI is not the security boundary. The console exposes a bounded verification queue and verified-membership directory, not patient records.

Before activating a therapist, an authorised human must independently verify the registration with the relevant regulator, confirm the identity and professional scope, and record the evidence/reference in the organisation's approved restricted administrative record. Do not rely solely on the applicant's form submission or uploaded screenshots.

The database provisioning RPCs `clinical_api.provision_verified_therapist(...)` and `clinical_api.set_therapist_active(...)` are restricted to the Supabase `service_role`. They must only be invoked by a trusted server-side process using a server-only secret. Never call them from the browser. Never expose the service-role key to the therapist or ordinary reviewer.

**Operator workflow implementation is present, but initial trusted setup remains a launch gate.** Before production:
- create the first operator account only after Auth is configured, then assign `app_metadata.registry_role = "operator"` through a trusted Supabase dashboard/Admin API action (never user-editable metadata);
- enable MFA for that operator and document recovery/credential revocation;
- assign reviewer roles separately and only to named, authorised reviewers;
- retain the independent regulator/identity verification evidence and a decision reason for each approval;
- preserve the existing negative tests proving ordinary therapists cannot inspect or approve the queue.

The approval/rejection/deactivation RPCs enforce the trusted `app_metadata` role in PostgreSQL and write actor-attributed immutable audit events. The older `provision_verified_therapist(...)` and `set_therapist_active(...)` RPCs remain restricted to `service_role`; never call them from the browser. Until the initial operator and Auth controls are configured, do not provision real therapist memberships in the hosted environment.

## Clinical data and consent safeguards

- Clinical-care consent and public-case publication consent are separate purposes.
- Consent events are append-only; withdrawal must be recorded as a new event.
- Publication is gated by a separate publication-consent event, reviewer approval, and a check that no later withdrawal supersedes the grant.
- The author’s de-identification checkbox is an attestation, **not** an automated de-identification system.
- The current public case text fields are not protected by a reliable automatic detector for names, addresses, dates, phone numbers, faces, or rare combinations of clinical details.
- Reviewer workflow must include a human privacy review. Do not publish a case until direct and indirect identifiers have been removed and the consent evidence has been independently checked.
- There is not yet a signed-consent document upload/verification workflow. The consent event metadata and therapist checkbox are not proof that an approved signed form was obtained, verified, and retained. This remains a hard gate before using the Registry for real patient records or public case submissions.

## Clinical documentation

The secure therapist workspace currently supports draft reports, initial and follow-up assessments, interventions, outcomes, finalisation, owner correction requests, immutable pre-update report snapshots, JSON export logging, and an audited browser print / Save PDF request. Earlier report snapshots are owner-readable and append-only. The access log records that a print/export was requested; it cannot prove that a physical print or PDF file was successfully created or retained. Browser print can be used to save a PDF locally, but this is not a validated, digitally signed clinical PDF service.

Before clinical use, add institution-approved report templates, verified identity/author attribution, timestamps and time zone, explicit amendment labels/reason capture for every change, a tested PDF rendering path, and retention/export access procedures. The automatic snapshots preserve the pre-update database state, and the amendment workflow requires a clinician-entered correction reason that is retained with the immutable version entry. Confirm that the report contains no unsupported clinical decision or automatic diagnosis.

## Hosting, privacy, and operational launch gates

Do not launch with real patient data until all items are signed off:

1. Hosted Free project provisioned. Before staging/production use, verify the project URL and publishable key in the website's Cloudflare build environment, configure Auth site/redirect URLs, confirm backup/recovery and retention policy, and keep the existing PNA Supabase untouched.
2. Hosted migrations are applied. Security Advisor currently shows six INFO-only `rls_enabled_no_policy` notices on private tables with no client policies; verify this deny-by-default design in an independent review. Performance Advisor currently reports 22 unindexed foreign keys and one unused index; review representative query plans after synthetic data and workload exist before adding/removing indexes. Do not add speculative indexes to an empty database.
3. Configure Auth redirect URLs, email verification, password recovery, session expiry, MFA policy for privileged staff, rate limits, and abuse monitoring.
4. Do not store generated PDFs. Keep browser-generated PDF exports local to the therapist. Configure private Storage only if an institution-approved signed-consent evidence workflow is later approved; enforce owner-scoped access and short-lived signed URLs.
5. Complete a privacy impact assessment and obtain institutional/legal/ethics approval for the intended jurisdiction and use. Define lawful basis, retention, deletion, breach response, patient access/correction, and data-subject request handling.
6. Implement operator approval, signed-consent verification, and reviewer privacy attestations.
7. Rollback-only hosted synthetic tests have verified cross-therapist read/update isolation, cross-owner consent denial, wrong-purpose consent rejection, valid case submission/review/publication, withdrawal hiding public cases, and ordinary-therapist/reviewer/operator role separation. Still run full hosted Auth signup/recovery/MFA flows, broader privilege-escalation and anonymous-access checks, backup-restore, and data-export tests using synthetic records.
8. Verify pagination and bounded queries, database indexes, connection pooling, resource usage, and mobile accessibility.
9. Perform an independent penetration test and remediate all critical/high findings.
10. Obtain explicit product-owner approval before merging or deploying to production. The current work remains a draft PR and is not deployed to production.

## CI verification

Latest verified run: GitHub Actions workflow #208 (`41400047102`) on commit `aecaf0877ac2e03c2c94168cca16d6a7d65e41a5` — **success**. The job completed all 14 steps, including TypeScript/integration type-check, disposable local Supabase startup, all eight migration applications, 63 synthetic RLS/workflow assertions, backup/restore verification, and cleanup.

The local database workflow is expected to:
- install pinned dependencies;
- type-check the application;
- initialise an isolated local Supabase project;
- apply the Registry migration;
- run pgTAP tests with synthetic fixtures;
- create and restore a disposable database backup;
- stop the local stack even if a prior step fails.

A passing CI run verifies the tested branch and fixtures only. It does not certify a hosted environment, legal compliance, clinical safety, or production readiness.


## Signed-consent evidence workflow — staging foundation (2026-11-02)

A new additive migration has been applied to the dedicated hosted Registry staging project and added to the feature branch:

- `20261102150000_clinical_registry_signed_consent_evidence.sql`
- `20261102152000_clinical_registry_consent_policy_initplan_fix.sql`
- `20261102154000_clinical_registry_consent_review_queues.sql`

Hosted staging now has a private `clinical-consent-evidence` Storage bucket (10 MiB maximum; PDF/JPEG/PNG only), owner-scoped evidence metadata, reviewer-only verification RPC, append-only review decision records, owner/reviewer download policies, and consent-event linkage to evidence. The legacy checkbox-only consent RPCs have had authenticated execution revoked. New RPCs support evidence-request metadata, reviewer decisions, patient creation after verified clinical-care consent, consent withdrawal, owner/reviewer queues, and retrieval of the current publication-consent grant.

Read-only verification on 2026-11-02 confirmed:
- Bucket is private; object count is zero.
- Anonymous users have no SELECT access to evidence metadata.
- Authenticated therapist has only SELECT/INSERT on evidence metadata; no direct UPDATE.
- Legacy checkbox-only grant RPCs are not executable by authenticated clients.
- New RPCs are not executable by anon; reviewer RPC enforces `app_metadata.registry_role = reviewer`.
- Auth users, patients, reports, consent events and evidence records remain zero.

Important limitations / hard gates:
- This is the database and private-storage foundation, not yet a complete user-facing upload/review interface.
- The client-declared SHA-256 is metadata only; it is not a server-verified checksum. Reviewers must inspect the original uploaded document. A server-side file-integrity verification step remains to be implemented before relying on hashes.
- The actual consent form text/version must be supplied and approved by the relevant institution/ethics or legal authority. No generic AI-generated form is to be treated as approved.
- End-to-end upload/download, reviewer decision, care-consent patient creation, publication-consent activation, withdrawal and public-case hiding tests must be added and passed with disposable synthetic Auth identities.
- Do not enable the UI readiness flag, collect real patient information, or publish cases until the approved form, UI, full hosted tests, and institutional privacy/ethics gates are complete.


### User interface update

The feature branch now includes:
- Therapist upload form for clinical-care consent (before patient creation) and separate public-case publication consent (for a selected existing patient).
- SHA-256 calculation in the browser as a declared metadata value only.
- Owner evidence status list; patient creation is offered only after reviewer verification of clinical-care evidence.
- Reviewer-only pending evidence queue, private document download, required decision note, and verify/reject actions.
- Case submission now looks up the current publication-consent event instead of creating a grant from a checkbox.
- Explicit `SIGNED_CONSENT_FORM_APPROVED = false` and `SIGNED_CONSENT_EVIDENCE_WORKFLOW_READY = false` guards. Upload, patient registration and case submission remain locked pending the actual approved form/version and full acceptance tests.

Do not change either guard to true merely because the UI and database exist. The exact approved consent form and version must first be provided by the institution/ethics authority, then reviewed and wired into the Registry. The reviewer console must also be configured with a trusted reviewer `app_metadata` role before its functions can be used.
