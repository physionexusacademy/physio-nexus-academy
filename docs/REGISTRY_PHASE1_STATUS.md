# Phase 1 — corrected complete wire-up

ChatGPT was right: the earlier remote `phase1-wire.patch` was **incomplete** (only import + state). Handlers and JSX were missing.

## Correct workflow (use this)

On branch `fix/registry-phase1-forms`:

```bash
git pull origin fix/registry-phase1-forms
node scripts/bootstrap-phase1.mjs
```

That script:
1. Rebuilds the **full** apply script (complete patch: import + state + handlers + JSX)
2. Applies it to `ClinicalRegistrySecureClient.tsx`
3. Verifies `ClinicalDocumentationForms` is wired and `assessmentJson` is gone

Then:

```bash
git add src/app/clinical-registry/ClinicalRegistrySecureClient.tsx
git commit -m "fix(registry): wire Phase 1 structured clinician forms into main client"
git push origin fix/registry-phase1-forms
```

Requires files:
- `scripts/bootstrap-phase1.mjs`
- `scripts/phase1-complete.a.b64`
- `scripts/phase1-complete.b.b64`

Production (`cloudflare-deploy`) remains untouched.
