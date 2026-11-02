# PNA Clinical Registry — secure staging implementation

**Status: hosted staging foundation is implemented; production use remains blocked.** The dedicated Supabase project `PNA Clinical Registry` (`zfoohwqyoengbszuylxj`, Singapore) is separate from the PNA public website database. It is ACTIVE_HEALTHY. Thirteen versioned migrations are recorded on the hosted project. No real patient data, Auth users, therapist memberships, consent events, evidence files, or public case entries are present.

## Implemented

- Private clinical schemas with RLS enabled and forced; the browser-facing API is restricted to the `clinical_api` schema.
- Owner-scoped therapist patient and report workflows, assessment/intervention/outcome records, report finalisation, append-only versions and audit events.
- Therapist onboarding, independent credential-verification workflow, and distinct trusted operator/reviewer authorization boundaries.
- Append-only clinical-care and public-case publication consent events, consent withdrawal, case review/publication/withdrawal workflow, and a fixed-field public Case Library read surface.
- Private `clinical-consent-evidence` Storage bucket; owner-scoped metadata and private object access; separate clinical-care and public-case publication evidence purposes.
- Server-side consent evidence integrity verification deployed as Supabase Edge Function `verify-consent-evidence` with JWT verification enabled. The function authenticates the caller, checks active verified therapist membership through a server-only RPC, downloads the private object using server-side credentials, validates file signature (PDF/JPEG/PNG), checks byte length, computes SHA-256 from downloaded bytes, and records the result through a service-role-only RPC.
- Reviewer queue only returns pending evidence after server-side integrity verification. The database reviewer decision RPC independently rejects unverified evidence and requires the private object to exist. Review decisions are append-only.
- Therapist upload UI invokes the server-side verifier after upload. Reviewer UI shows the verified timestamp and hash prefix before human inspection.
- Patient creation and case submission remain fail-closed until the institution-approved consent form/version and the full acceptance gates are completed.
- Browser-generated PDF/print and owner-scoped JSON export; no clinical PDFs are stored in Supabase Storage.
- Dedicated Registry browser client uses only Registry-specific public URL/key variables and never falls back to the PNA website Supabase project.
- Retention rules remain inactive by default; there is no automatic deletion.

## Latest automated verification

GitHub Actions workflow #219 (run ID `41406134080`) passed on 2026-11-02 for the preceding signed-consent implementation: TypeScript check, migrations, 70/70 pgTAP assertions, disposable backup/restore, and cleanup.

The server-side integrity migration, Edge Function, UI invocation and expanded 74-assertion suite have since been added. **A new CI run for these latest changes must pass before this revision is considered automatically verified.** A passing local CI run does not certify the hosted Auth/Storage flow or production readiness.

## Current server-side integrity boundary

- Browser SHA-256 is only a declaration; it is not trusted.
- The Edge Function independently hashes bytes downloaded from private Storage and checks size and file signature.
- Only the service-role-only database RPC can write server-verified hash/size/timestamp fields. Authenticated therapists have no direct UPDATE privilege on evidence metadata.
- The reviewer queue excludes unverified evidence. The reviewer RPC checks the integrity fields again and confirms that the private Storage object exists.
- This proves that the stored bytes match the submitted bytes and declared type/size. **It does not prove the document is authentic, that signatures are genuine, that the patient understood the form, or that the wording is legally/institutionally approved.** A named authorised human reviewer must inspect the original document.

## Remaining technical acceptance work

1. Run the expanded 74-assertion CI suite and fix any failures.
2. Complete hosted end-to-end testing with disposable authenticated therapist/reviewer identities and synthetic PDF/JPEG/PNG objects: upload, server verification, mismatch rejection, private download, reviewer approval/rejection, patient creation, publication consent, withdrawal and public-case suppression.
3. Test the deployed Edge Function from the actual Registry browser origin, including unauthenticated rejection, owner mismatch, invalid file signatures, hash mismatch and size mismatch.
4. Configure and verify Supabase Auth site/redirect URLs, email confirmation/recovery, session policy, rate limits and privileged-user MFA through the project Dashboard/Admin API.
5. Enable a protected Cloudflare Preview/staging URL and complete desktop/mobile/accessibility/browser acceptance. Preview URLs were previously disabled for this Worker.
6. Review query plans with representative synthetic data before changing the current 27 unindexed-FK and 3 unused-index INFO notices. Do not add speculative indexes to an empty database.
7. Complete backup/restore and export/recovery drills against the hosted project, not only the disposable CI database.
8. Reconcile the feature branch with `cloudflare-deploy` deliberately; do not blindly merge the current long-diverged PR.
9. Obtain an independent security/penetration review and remediate critical/high findings.

## Institutional / operational release gates (not code tasks)

- Supply the exact institution/ethics-approved signed consent form and immutable version identifier.
- Approve privacy impact assessment, lawful basis, retention/deletion periods, patient correction/access process, breach response and backup retention.
- Approve clinical data processing and any public case publication process for the intended jurisdiction.
- Name the trusted operator/reviewer personnel and independently verify their credentials.
- Obtain explicit product-owner approval before production merge/deployment.

## Registry environment variables

- `NEXT_PUBLIC_CLINICAL_REGISTRY_SUPABASE_URL` — dedicated Registry project URL.
- `NEXT_PUBLIC_CLINICAL_REGISTRY_SUPABASE_ANON_KEY` — Registry publishable/legacy anon key only.
- `NEXT_PUBLIC_CLINICAL_REGISTRY_CONSENT_VERSION` — exact institution-approved form version; keep empty until approved.

The Edge Function uses Supabase-provided server-side environment variables. Never add a service-role/secret key to source control, browser code, `NEXT_PUBLIC_*`, Cloudflare client variables, or logs.

## Mandatory safety boundary

Do not enter real patient data or upload real signed consent documents during staging. Do not enable the UI readiness guards until the exact approved form/version, hosted acceptance tests, Auth/reviewer setup and institutional sign-offs are complete. Do not merge or deploy this draft feature branch to production merely because CI passes.
