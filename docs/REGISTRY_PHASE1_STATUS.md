# Phase 1 — Complete (apply step)

**Branch:** `fix/registry-phase1-forms`  
**Production:** not touched

## Done on branch

1. `ClinicalDocumentationForms.tsx` — clinician UI (no JSON)
2. `scripts/phase1-wire.patch` — wires forms into main client
3. `scripts/apply-phase1-wire.mjs` — one-command apply

## Apply locally (one command)

```bash
git checkout fix/registry-phase1-forms
node scripts/apply-phase1-wire.mjs
git add src/app/clinical-registry/ClinicalRegistrySecureClient.tsx
git commit -m "fix(registry): wire Phase 1 structured clinician forms into main client"
```

After apply, therapists use structured forms for assessment, sessions, interventions, and outcomes.

## Phase 2 next

Manual Therapy libraries, modalities, 30/60-day planner, on-demand PDF, graphs.
