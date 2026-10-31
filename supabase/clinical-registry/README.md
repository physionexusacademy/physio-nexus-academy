# Clinical Registry secure database prototype

**Status: implementation draft for isolated local review. Not a migration and not deployed.**

## Implemented in this slice
- A private clinical schema separated from the public website schema.
- Therapist verification is read-only to the clinician; verification must be provisioned by a trusted administrator.
- Patient and report ownership is tied to the authenticated creator.
- Assessment, intervention and outcome rows inherit access through their parent report.
- RLS is enabled and forced on every table.
- No anonymous grants and no ordinary DELETE privileges.
- Indexes cover owner-scoped lists and report child-record lookups.

## Required before completion
1. Generate a real migration with the installed Supabase CLI. Do not rename this prototype into the migrations directory by hand.
2. Run it against a disposable local Supabase stack and add automated RLS tests with synthetic users.
3. Add the narrow authenticated API layer (SECURITY INVOKER RPCs) while keeping clinical_private outside the Data API exposed-schema list.
4. Add trusted therapist verification provisioning and append-only audit triggers.
5. Build patient consent, retention and correction workflows.
6. Implement the separate de-identified public Case Library and its review/publication lifecycle.
7. Integrate the application only after local security tests and Supabase Advisors pass.

## Mandatory safety boundary
Do not connect this to the existing PNA website Supabase project. Do not insert real patient data. A separate hosted Registry project requires an exact cost review and explicit approval. No live database or patient information was changed by this prototype.
