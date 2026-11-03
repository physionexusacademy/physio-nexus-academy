# Phase 1 — PNA Clinical Registry

**Branch:** `fix/registry-phase1-forms` (from `registry-preview`)  
**Production (`cloudflare-deploy`):** not touched

## Completed on this branch

### 1. Clinician-friendly forms component
`src/app/clinical-registry/ClinicalDocumentationForms.tsx`

| Form | What therapists enter |
|------|------------------------|
| Initial assessment | Subjective, objective, pain 0–10, impression, goals |
| Session / follow-up | Date, pain, subjective, objective, notes (Session 2, 3, 7…) |
| Intervention | Date, body region, technique, dosage, response, home advice |
| Outcome | Measure name, code, value, unit, direction |

No raw JSON required.

### 2. Wire-up patch
`scripts/phase1-wire.patch` + `scripts/apply-phase1-wire.mjs`

The patch replaces JSON textareas with the structured forms component and handlers. It has been verified to apply cleanly against `registry-preview` / this branch base.

## Finish wire-up (one command on your machine)

```bash
git fetch origin
git checkout fix/registry-phase1-forms
git pull
node scripts/apply-phase1-wire.mjs
# If the patch file is incomplete on remote, use the full patch from the conversation artifacts
git add src/app/clinical-registry/ClinicalRegistrySecureClient.tsx
git commit -m "fix(registry): wire Phase 1 structured clinician forms into main client"
git push origin fix/registry-phase1-forms
```

## Why a local apply step?

The main client file is ~95KB. Automated full-file push through the integration hit payload limits. The forms component and verified patch are on the branch; applying the patch locally completes the wire safely without touching production.

## Phase 2 (next)

1. Manual Therapy pick-lists + muscle-specific safe stretches  
2. Modalities pick-lists  
3. 30 / 60 day program planner UX  
4. On-demand PDF (no permanent storage on Supabase)  
5. Graphical outcome reports  

## Do not merge yet

- Do not merge `fix/registry-phase1-forms` to `cloudflare-deploy` until wire-up is applied, tested on preview, and you sign off.
- Ignore branch `fix/registry-phase1-audit` (temporary stub from an earlier large-file write attempt).
