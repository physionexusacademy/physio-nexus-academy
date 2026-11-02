# Clinical Registry secure database prototype

**Status: hosted staging foundation implemented; production use is blocked.** A separate Supabase Free project (`PNA Clinical Registry`) is connected and its eight migrations are applied. Local security workflow #204 passed TypeScript, eight migrations, 63 pgTAP assertions and disposable backup/restore. The app remains an open draft PR and is not deployed to production. Hosted Auth currently has zero users; signed-consent evidence verification, institutional approval, independent security testing and end-to-end Preview acceptance remain incomplete.

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
- `/clinical-registry/library` is a public, indexable server-rendered page that reads only the fixed-field public Case Library RPC through the dedicated Registry anon key.
- The initial application UI supports therapist sign-in/sign-up, pending-verification state, owner-scoped patient/report lists, clinical-care consent attestation, assessment/follow-up/intervention/outcome entry, report finalisation, print-to-PDF, owner-scoped JSON export, owner-applied report corrections, and public Case Library reading. **Patient intake and new case submissions are now fail-closed/disabled** until an institution-approved signed-consent evidence verification workflow is implemented and tested.
- Trusted service-role-only RPCs provision verified therapist memberships and activate/deactivate them; ordinary authenticated users cannot self-verify.
- Retention rules are inactive by default; a service-role-only candidate query supports review without automatic deletion.

## Remaining release gates
1. Latest local workflow #204 passed all eight Registry migrations, 63 synthetic pgTAP assertions and disposable backup/restore. The hosted Registry project is separate from the PNA website's root Supabase project.
2. Run Supabase Security and Performance Advisors against the isolated Registry project after a separate hosted project is provisioned.
3. For any later hosted setup, run Supabase CLI commands from `supabase/clinical-registry` so the website migrations are never replayed. Configure only the `clinical_api` schema in the separate Registry project's Data API settings. Never expose `clinical_private`.
4. The operator console and database-side role checks are implemented, but no hosted Auth users exist yet. Configure Auth, create the first trusted operator, assign reviewer/operator `app_metadata` through trusted Admin API actions, and enforce MFA. The service-role key must remain server-side.
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
- `supabase/config.toml` and `supabase/migrations/` — generated by the Supabase CLI inside this nested Registry project; separate from the website project's root Supabase config.

## Mandatory safety boundary
Do not connect this to the existing PNA website Supabase project. Do not insert real patient data. A separate hosted Registry project requires an exact cost review and explicit approval. The public Case Library must contain only deliberately de-identified narratives and must be manually reviewed before publication. Consent and retention requirements require institutional/legal approval before real use. No live database or patient information was changed by this prototype.
