# Phase 1 Status — PNA Clinical Registry

**Active branch:** `fix/registry-phase1-forms` (from `registry-preview`)
**Production (`cloudflare-deploy`):** not touched

## Done

- Clinician-friendly structured forms component: `src/app/clinical-registry/ClinicalDocumentationForms.tsx`
  - Initial assessment (subjective, objective, pain, impression, goals)
  - Session / follow-up (multi-session ready)
  - Intervention (region, technique, dosage, response, home advice)
  - Outcome (name, code, value, unit, direction)
- No raw JSON required for therapists

## Remaining to close Phase 1

Wire `ClinicalDocumentationForms` into `ClinicalRegistrySecureClient.tsx` (state + handlers + replace JSON textareas). The main client file is large (~95KB); wire-up is the next safe code change on this branch.

## Phase 2 (after wire-up)

- Manual Therapy pick-lists + muscle-specific safe stretches
- Modalities pick-lists
- 30/60-day program planner UX
- On-demand PDF (no permanent Supabase storage)
- Graphical outcome reports

## Note on `fix/registry-phase1-audit`

That branch had a failed large-file write that stubbed the main client. Prefer **`fix/registry-phase1-forms`** going forward. Do not merge the audit branch to production.
