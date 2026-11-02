# PNA Clinical Registry — secure staging implementation

**Status: lightweight-consent staging implementation is deployed; production use remains blocked.** The dedicated Supabase project `PNA Clinical Registry` (`zfoohwqyoengbszuylxj`, Singapore) is separate from the PNA public website database and is ACTIVE_HEALTHY. The hosted ledger records 27 migrations. Current hosted counts: 4 Auth users, 1 therapist membership, 1 therapist application, 0 patients, 0 reports, 0 consent events and 0 public case entries. No real patient data is present.

## Implemented

- Private clinical schemas with RLS enabled and forced; the browser-facing API is restricted to the `clinical_api` schema.
- Owner-scoped therapist patient and report workflows, assessment/intervention/outcome records, report finalisation, append-only versions and audit events.
- Therapist onboarding, independent credential-verification workflow, and distinct trusted operator/reviewer authorization boundaries.
- Append-only clinical-care and public-case publication consent events, explicit therapist attestations, consent withdrawal, case review/publication/withdrawal workflow, and a fixed-field public Case Library read surface.
- Consent documents are **not uploaded to PNA**. Therapists retain signed originals in their clinic/institution's secure records; the Registry stores only a small consent event (owner, patient, purpose, version label and timestamp).
- The old evidence tables, upload/download policies and upload/reviewer RPCs have been removed. The private consent bucket is empty and has no client upload/download policies. The legacy `verify-consent-evidence` Edge Function is retired and returns HTTP 410; it performs no storage or database work.
- Patient creation and public-case submission use separate explicit written-consent attestations. Case publication still requires independent reviewer approval and publication; withdrawal remains recorded as a new consent event.
- Browser-generated PDF/print and owner-scoped JSON export; no clinical PDFs are stored in Supabase Storage.
- Dedicated Registry browser client uses only Registry-specific public URL/key variables and never falls back to the PNA website Supabase project.
- Retention rules remain inactive by default; there is no automatic deletion.
- Hosted staging has the 27 foreign-key support indexes and consolidated case-library owner/reviewer SELECT and UPDATE policies; no duplicate permissive policy warning remains.

## Latest automated verification (2026-11-03)

Consent redesign code commit `cd2e4a11a40ae709c6122774f526f1563a8fe60a` passed the local Registry database-security workflow [run 41529678175](https://github.com/physionexusacademy/physio-nexus-academy/actions/runs/41529678175): TypeScript, **29/29 integration checks**, Deno type-check, ordered migration reset, **91/91 pgTAP assertions**, disposable backup/restore and cleanup. The isolated Preview deployment [run 41529678128](https://github.com/physionexusacademy/physio-nexus-academy/actions/runs/41529678128) also passed the Cloudflare build, Worker deployment and protected-route smoke tests. These automated checks do not replace hosted authenticated browser acceptance or institutional/privacy approval.

## Consent architecture change (2026-11-03)

The hosted project now uses lightweight consent attestations rather than document uploads. The migration removes the evidence metadata/review tables, related RPCs, evidence column and Storage policies. The empty private Storage bucket remains because Supabase protects bucket deletion through the Storage API; with no objects and no client policies it is dormant. The retired Edge Function returns HTTP 410.

## Lightweight consent boundary

- The therapist must obtain separate written consent for clinical care/documentation and, where relevant, public educational case publication.
- The signed original remains outside PNA in the therapist's secure institutional/clinic records. Never upload it to the Registry.
- The Registry records only a small append-only consent event after the therapist explicitly attests that the signed original has been obtained and retained.
- This is a therapist attestation, not automated proof that a signature is authentic or that the form is legally/institutionally approved. The organisation must approve the form and privacy process, and an independent reviewer must still inspect each de-identified case before publication.

## Remaining technical acceptance work

1. Complete hosted end-to-end testing with disposable authenticated therapist/reviewer identities: create a patient with clinical-care attestation, create a final report, record separate publication attestation, submit for review, approve/publish, withdraw consent and confirm public-case suppression.
2. Confirm no client path invokes Storage upload/download or the retired consent verifier.
4. Configure and verify Supabase Auth site/redirect URLs, email confirmation/recovery, session policy, rate limits and privileged-user MFA through the project Dashboard/Admin API.
5. Enable a protected Cloudflare Preview/staging URL and complete desktop/mobile/accessibility/browser acceptance. Preview URLs were previously disabled for this Worker.
6. The 27 advisor-identified foreign-key indexes have now been applied to hosted staging. The duplicate permissive case-library SELECT/UPDATE policies have also been consolidated. Supabase no longer reports missing foreign-key indexes or duplicate permissive policies; it reports 28 unused indexes because the Registry has no workload yet (27 new FK indexes plus one pre-existing index). Retain them until representative workload and query plans justify removal.
7. Complete backup/restore and export/recovery drills against the hosted project, not only the disposable CI database.
8. PR #151 has been retargeted to `cloudflare-deploy` and GitHub currently reports it mergeable/clean. PRs #152–#156 remain stacked on their preceding feature branches; preserve merge order #151 → #152 → #153 → #154 → #155 → #156. The complete feature stack remains draft and unmerged; obtain explicit approval before merge/deploy.
9. Obtain an independent security/penetration review and remediate critical/high findings.

## Institutional / operational release gates (not code tasks)

- Approve the offline signed consent form(s) and immutable version identifiers for clinical care and separate public case publication. Keep originals in the therapist's secure clinic/institution records; do not store copies in PNA.
- Approve privacy impact assessment, lawful basis, retention/deletion periods, patient correction/access process, breach response and backup retention.
- Approve clinical data processing and any public case publication process for the intended jurisdiction.
- Name the trusted operator/reviewer personnel and independently verify their credentials.
- Obtain explicit product-owner approval before production merge/deployment.

## Registry environment variables

- In GitHub Actions repository secrets, configure `NEXT_PUBLIC_CLINICAL_REGISTRY_SUPABASE_URL` and `NEXT_PUBLIC_CLINICAL_REGISTRY_SUPABASE_PUBLISHABLE_KEY` using values from the **dedicated PNA Clinical Registry** project only. The deployment workflow passes these at build time; if they are absent, the main PNA website can still deploy, but Registry sign-in and the public library remain unconfigured.
- `NEXT_PUBLIC_CLINICAL_REGISTRY_SUPABASE_URL` — dedicated Registry project URL.
- `NEXT_PUBLIC_CLINICAL_REGISTRY_SUPABASE_PUBLISHABLE_KEY` — preferred Registry publishable key; `NEXT_PUBLIC_CLINICAL_REGISTRY_SUPABASE_ANON_KEY` is accepted as a legacy fallback. Both must belong to the dedicated Registry project.
- `NEXT_PUBLIC_CLINICAL_REGISTRY_CONSENT_VERSION` — optional consent-version label; defaults to `PNA-OFFLINE-CONSENT-ATTESTATION-V1`.

The retired consent verifier performs no backend work. Never add a service-role/secret key to source control, browser code, `NEXT_PUBLIC_*`, Cloudflare client variables, or logs.

## Mandatory safety boundary

Do not enter real patient data during staging or upload signed consent documents to PNA. Retain signed originals securely outside the Registry. Production remains blocked until hosted acceptance tests, Auth/reviewer setup, institutional consent/privacy sign-offs, backup/recovery and independent security review are complete. Do not merge or deploy this draft feature branch to production merely because CI passes.
