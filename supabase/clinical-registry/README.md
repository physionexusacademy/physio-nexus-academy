# Clinical Registry secure database prototype

**Status: implementation draft for isolated local review. Not a migration and not deployed.**

## Implemented in this slice
- A private clinical schema separated from the public website schema.
- Therapist verification is read-only to the clinician; verification must be provisioned by a trusted administrator.
- Patient and report ownership is tied to the authenticated creator.
- Assessment, intervention and outcome rows inherit access through their parent report.
- RLS is enabled and forced on every private table.
- No anonymous grants and no ordinary DELETE privileges.
- Indexes cover owner-scoped lists and report child-record lookups.
- A narrow SECURITY INVOKER RPC prototype provides bounded list, create, read, assessment, intervention, outcome, finalise and archive operations.
- Synthetic pgTAP isolation checks cover two owners, a pending therapist, anonymous access, audit creation and consent withdrawal.
- Append-only consent events distinguish clinical-care consent from public-case publication consent; report creation is blocked without current care consent.
- Clinical record changes create append-only audit events containing changed column names only (not clinical values).
- Correction requests are append-only and validate that the requested target belongs to the therapist's patient/report.
- A de-identified Case Library supports draft, submission, reviewer approval/rejection, publication and owner withdrawal. Public reads use a fixed-field RPC and are suppressed after publication consent is withdrawn.
- Retention rules are inactive by default; a service-role-only candidate query supports review without automatic deletion.

## Remaining release gates
1. Generate and commit real migration file(s) with the installed Supabase CLI. Do not rename prototype files into the migrations folder by hand.
2. Complete local CI, backup/restore verification and Supabase Advisors against the isolated Registry project.
3. Configure only the clinical_api schema in the separate Registry project's Data API settings. Never expose clinical_private.
4. Implement a trusted operator workflow for therapist verification and reviewer app_metadata assignment; do not let users self-verify.
5. Have the institution/ethics committee and local counsel approve consent language, retention periods, correction handling, export, backup retention and breach response. No retention rule is active by default and no automatic deletion is implemented.
6. Add operational backup/restore and export runbooks for the separately hosted project; CI can validate a disposable local backup but cannot establish provider backup coverage.
7. Integrate the website only after the above gates, local security tests and Supabase Advisors pass.

## Files
- private-schema.prototype.sql — private tables, indexes, grants and RLS.
- api-functions.prototype.sql — invoker-only PostgREST RPC boundary.
- governance.prototype.sql — consent, audit, correction, retention-review and Case Library workflows.
- private-schema.rls.test.sql — synthetic pgTAP isolation tests.

## Mandatory safety boundary
Do not connect this to the existing PNA website Supabase project. Do not insert real patient data. A separate hosted Registry project requires an exact cost review and explicit approval. The public Case Library must contain only deliberately de-identified narratives and must be manually reviewed before publication. Consent and retention requirements require institutional/legal approval before real use. No live database or patient information was changed by this prototype.
