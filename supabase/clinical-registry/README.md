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
- Synthetic pgTAP isolation checks cover two owners, a pending therapist, and anonymous access.

## Required before completion
1. Generate real migration file(s) with the installed Supabase CLI. Do not rename the prototype files into the migrations folder by hand.
2. Run the schema and RPC SQL against a disposable local Supabase stack; run the pgTAP file and fix all failures.
3. Expose only the clinical_api schema in the separate Registry project's Data API settings. Never expose clinical_private.
4. Add trusted therapist verification provisioning and append-only audit triggers.
5. Add patient consent, retention, correction, backup/restore and export workflows.
6. Implement the separate de-identified public Case Library and its review/publication lifecycle.
7. Integrate the website only after local security tests and Supabase Advisors pass.

## Files
- private-schema.prototype.sql — private tables, indexes, grants and RLS.
- api-functions.prototype.sql — invoker-only PostgREST RPC boundary.
- private-schema.rls.test.sql — synthetic pgTAP isolation tests.

## Mandatory safety boundary
Do not connect this to the existing PNA website Supabase project. Do not insert real patient data. A separate hosted Registry project requires an exact cost review and explicit approval. No live database or patient information was changed by this prototype.
