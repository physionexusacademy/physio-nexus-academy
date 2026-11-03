# PNA Clinical Registry — Phase 1 Audit

**Branch:** `fix/registry-phase1-audit` (from `registry-preview` @ `c32ce046`)
**Date:** 2026-11-03
**Scope:** Existing implementation only. No production (`cloudflare-deploy`) changes.

---

## 1. What is solid (keep)

- Separate Supabase project + `clinical_api` schema isolation is correctly implemented.
- Client deliberately does **not** fall back to main website Supabase credentials.
- Middleware correctly skips main-site auth for `/clinical-registry` routes.
- RLS + FORCE RLS pattern and security-definer RPCs are the right architecture.
- MFA / AAL2 gating for Operator and Reviewer privileged actions is present.
- Consent attestation + publication consent + audit logging foundations exist.
- Report type contract (`report-types.ts`) already models multi-session follow-ups, interventions, outcomes and comparison helpers cleanly.

---

## 2. Issues addressed in Phase 1

### 2.1 Raw JSON clinical entry → Structured clinician forms

**Problem:** Therapists had to paste JSON for assessments and follow-ups.

**Fix:** New component `ClinicalDocumentationForms.tsx` provides:
- Initial assessment: subjective, objective, pain 0–10, clinical impression, goals
- Session / follow-up: date + structured notes (supports Session 2, 3, 7…)
- Intervention: date, body region, technique, dosage, response, home advice
- Outcome: name, code, value, unit, direction — plain clinical language

Handlers that build the same RPC payloads are prepared; final wire-up into `ClinicalRegistrySecureClient.tsx` is the remaining Phase 1 step so the live UI uses these forms.

### 2.2 Hardcoded owner identity

Documented. Bootstrap remains server-enforced. Further client cleanup deferred until after forms are live and tested, to avoid breaking the first-operator path.

### 2.3 Export / PDF / graphs / Manual Therapy libraries

Explicitly **Phase 2** feature work (not bugs).

---

## 3. Security / governance blockers (unchanged)

- Independent Operator review of existing memberships
- Confirm existing patient row is synthetic
- Hosted backup/restore drill
- Independent penetration test
- Institutional privacy / consent approval

---

## 4. Phase 1 status

| Item | Status |
|------|--------|
| Audit document | Done |
| Structured forms component | Done (`ClinicalDocumentationForms.tsx`) |
| Wire forms into main client + handlers | In progress |
| Production merge | **Blocked — not allowed yet** |

---

## 5. Safety rules

- Target branch: `fix/registry-phase1-audit` only
- Base: `registry-preview`
- **Do not merge** to `cloudflare-deploy` until Phase 1 + Phase 2 + testing + owner sign-off
- No schema / RLS / Edge Function changes in Phase 1 unless a clear correctness bug is found
- No patient data inspection or modification
