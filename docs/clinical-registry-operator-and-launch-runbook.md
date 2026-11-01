# Clinical Registry — operator and launch runbook

## Current deployment boundary

- The Registry is a separate application/database integration from the existing PNA production Supabase project.
- The hosted Registry database has **not** been provisioned or connected.
- The current automated database workflow uses a disposable local Supabase stack and synthetic fixtures only.
- Do not enter real patient information, upload identifiable records, or advertise the Registry as a production clinical record system until the launch gates below are closed.
- Do not place a Supabase service-role key in browser code, `NEXT_PUBLIC_*` variables, GitHub source, preview build variables, or client-visible logs.

## Therapist onboarding and verification

### Applicant workflow

1. The applicant creates an authenticated account.
2. The applicant submits their professional name, title, credentials, registration body/number, and optional institution through the onboarding form.
3. The request is stored in `clinical_private.therapist_verification_requests`.
4. The applicant can retrieve only their own status and reviewer note through `clinical_api.my_therapist_verification_request()`.
5. Submission does not grant membership, clinical-record access, reviewer access, or any privileged role.

### Trusted verification boundary

The current release intentionally has no self-service approval control and no browser-accessible operator console. Verification must remain a trusted, out-of-band operation until a dedicated server-side operator workflow has been designed, threat-modelled, and tested.

Before activating a therapist, an authorised human must independently verify the registration with the relevant regulator, confirm the identity and professional scope, and record the evidence/reference in the organisation's approved restricted administrative record. Do not rely solely on the applicant's form submission or uploaded screenshots.

The database provisioning RPCs `clinical_api.provision_verified_therapist(...)` and `clinical_api.set_therapist_active(...)` are restricted to the Supabase `service_role`. They must only be invoked by a trusted server-side process using a server-only secret. Never call them from the browser. Never expose the service-role key to the therapist or ordinary reviewer.

**Operator workflow is not considered production-ready** until the Registry has a dedicated, authenticated server-side operator mechanism with:
- least-privilege operator identity and documented role assignment;
- a review queue that reveals only the minimum professional-verification data;
- explicit approve/reject/deactivate actions with reason and actor attribution;
- immutable audit events for every decision;
- negative tests proving ordinary therapists and case reviewers cannot approve or activate accounts;
- documented recovery for accidental approval and compromised operator credentials.

Until then, do not provision real therapist memberships in a hosted environment.

## Clinical data and consent safeguards

- Clinical-care consent and public-case publication consent are separate purposes.
- Consent events are append-only; withdrawal must be recorded as a new event.
- Publication is gated by a separate publication-consent event, reviewer approval, and a check that no later withdrawal supersedes the grant.
- The author’s de-identification checkbox is an attestation, **not** an automated de-identification system.
- The current public case text fields are not protected by a reliable automatic detector for names, addresses, dates, phone numbers, faces, or rare combinations of clinical details.
- Reviewer workflow must include a human privacy review. Do not publish a case until direct and indirect identifiers have been removed and the consent evidence has been independently checked.
- There is not yet a signed-consent document upload/verification workflow. The consent event metadata alone is not proof that an approved signed form was obtained and retained.

## Clinical documentation

The secure therapist workspace currently supports draft reports, initial and follow-up assessments, interventions, outcomes, finalisation, owner correction requests, and a browser print flow. Browser print can be used to save a PDF locally, but this is not a validated, digitally signed clinical PDF service.

Before clinical use, add institution-approved report templates, identity/author attribution, timestamps and time zone, version history, explicit amendment labels, export access logging, and a tested PDF rendering path. Confirm that the report contains no unsupported clinical decision or automatic diagnosis.

## Hosting, privacy, and operational launch gates

Do not launch with real patient data until all items are signed off:

1. Provision a dedicated hosted Supabase project for the Registry; verify project URL, keys, backups, region, access policy, and retention configuration. Existing PNA Supabase must remain untouched.
2. Apply migrations to the dedicated project and run database advisors and a fresh independent RLS/security review.
3. Configure Auth redirect URLs, email verification, password recovery, session expiry, MFA policy for privileged staff, rate limits, and abuse monitoring.
4. Configure private storage only if a consent-document workflow is approved; enforce owner-scoped access and signed URLs with short expiry.
5. Complete a privacy impact assessment and obtain institutional/legal/ethics approval for the intended jurisdiction and use. Define lawful basis, retention, deletion, breach response, patient access/correction, and data-subject request handling.
6. Implement operator approval, signed-consent verification, and reviewer privacy attestations.
7. Run tenant-isolation, privilege-escalation, anonymous-access, consent-withdrawal, backup-restore, and data-export tests against the hosted staging project using synthetic records.
8. Verify pagination and bounded queries, database indexes, connection pooling, resource usage, and mobile accessibility.
9. Perform an independent penetration test and remediate all critical/high findings.
10. Obtain explicit product-owner approval before merging or deploying to production.

## CI verification

The local database workflow is expected to:
- install pinned dependencies;
- type-check the application;
- initialise an isolated local Supabase project;
- apply the Registry migration;
- run pgTAP tests with synthetic fixtures;
- create and restore a disposable database backup;
- stop the local stack even if a prior step fails.

A passing CI run verifies the tested branch and fixtures only. It does not certify a hosted environment, legal compliance, clinical safety, or production readiness.
