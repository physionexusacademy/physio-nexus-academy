# Clinical Registry secure database prototype

**Status: implementation draft for isolated local review. Not a migration and not deployed.**

## Implemented in this slice
- A private clinical schema separated from the public website schema.
- Therapist verification is read-only to the clinician; verification must be provisioned by a trusted administrator.
- Patient and report ownership is tied to the authenticated creator.
- Assessment, intervention and outcome rows inherit access through their parent report.
- RLS is enabled and forced on every private table.
- No anonymous grants on private tables and no ordinary DELETE privileges; anonymous access is limited to the fixed-field public Case Library RPC.
- Indexes cover owner-scoped lists and report child-record lookups.
- A narrow SECURITY INVOKER RPC prototype provides bounded list, create, read, assessment, intervention, outcome, finalise and archive operations.
- Synthetic pgTAP isolation checks cover two owners, a pending therapist, anonymous access, audit creation and consent withdrawal.
- Append-only consent events distinguish clinical-care consent from public-case publication consent; report creation is blocked without current care consent.
- Clinical record changes create append-only audit events containing changed column names only (not clinical values).
- Correction requests are append-only, validate target ownership, and can be applied only by the owning therapist; each applied report correction creates an immutable resolution event and a column-level audit entry.
- A de-identified Case Library supports draft, submission, reviewer approval/rejection, publication and owner withdrawal. Public reads use a fixed-field RPC and are suppressed after publication consent is withdrawn.
- The Registry page has a separate browser client that reads only `NEXT_PUBLIC_CLINICAL_REGISTRY_SUPABASE_URL` and `NEXT_PUBLIC_CLINICAL_REGISTRY_SUPABASE_ANON_KEY`; it never falls back to the PNA website Supabase credentials.
- The initial application UI supports therapist sign-in/sign-up, pending-verification state, owner-scoped patient/report lists, clinical-care consent capture, assessment/follow-up/intervention/outcome entry, report finalisation, print, owner-scoped JSON export, owner-applied report corrections, public Case Library reading and separate-consent case submission/withdrawal.
- Trusted service-role-only RPCs provision verified therapist memberships and activate/deactivate them; ordinary authenticated users cannot self-verify.
- Retention rules are inactive by default; a service-role-only candidate query supports review without automatic deletion.

## Remaining release gates
1. The CI workflow generates the migration with `supabase migration new`, applies it in a disposable local stack and commits it to the PR branch only after all checks pass. Do not manually rename prototype files into the migrations folder.
2. Complete the local CI backup/restore test and run Supabase Security and Performance Advisors against the isolated Registry project.
3. Configure only the `clinical_api` schema in the separate Registry project's Data API settings. Never expose `clinical_private`.
4. Build a server-side operator console/service that invokes the service-role-only therapist provisioning RPCs and assigns reviewer `app_metadata` through the Supabase Auth Admin API. Keep the service-role key server-side; do not let users self-verify.
5. Complete the comprehensive clinical report template/PDF renderer, structured form validation, patient-record correction support, and accessibility QA.
6. Have the institution/ethics committee and local counsel approve consent language, retention periods, correction handling, export, backup retention and breach response. No retention rule is active by default and no automatic deletion is implemented.
7. Add operational backup/restore and export runbooks for the separately hosted project; CI can validate a disposable local backup but cannot establish provider backup coverage.
8. Provision the separate hosted Registry project only after an exact cost review and explicit user approval. Set the three Registry environment variables below; never reuse the PNA website project credentials.

## Registry-only environment variables
- `NEXT_PUBLIC_CLINICAL_REGISTRY_SUPABASE_URL` — URL of the dedicated Registry Supabase project.
- `NEXT_PUBLIC_CLINICAL_REGISTRY_SUPABASE_ANON_KEY` — publishable/anon key from that dedicated project.
- `NEXT_PUBLIC_CLINICAL_REGISTRY_CONSENT_VERSION` — version identifier for the institution-approved consent form. Patient creation is disabled when this is empty.

## Files
- private-schema.prototype.sql — private tables, indexes, grants and RLS.
- api-functions.prototype.sql — invoker-only PostgREST RPC boundary.
- governance.prototype.sql — consent, audit, correction, retention-review and Case Library workflows.
- private-schema.rls.test.sql — synthetic pgTAP isolation tests.

## Mandatory safety boundary
Do not connect this to the existing PNA website Supabase project. Do not insert real patient data. A separate hosted Registry project requires an exact cost review and explicit approval. The public Case Library must contain only deliberately de-identified narratives and must be manually reviewed before publication. Consent and retention requirements require institutional/legal approval before real use. No live database or patient information was changed by this prototype.
