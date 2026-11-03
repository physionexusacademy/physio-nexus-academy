# PNA Clinical Registry — Phase 1 Audit

**Branch:** `fix/registry-phase1-audit` (from `registry-preview` @ `c32ce046`)
**Date:** 2026-11-03
**Scope:** Existing implementation only. No production (`cloudflare-deploy`) changes. No feature expansion yet.

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

## 2. Confirmed technical issues / mistakes (to fix in Phase 1)

### 2.1 Hardcoded owner identity (maintainability + risk)

In `ClinicalRegistrySecureClient.tsx`:

- Bootstrap Operator button and Reviewer assignment are gated on a **hardcoded UUID** (`fc9992a5-557f-4b9e-83a4-6f560c9e4134`) and email (`sajjadraza.dpt@gmail.com`).
- Reviewer assignment target is also hardcoded (`physionexusacademypk@gmail.com`).

**Why this is a problem:**
- Any future account change or additional operator breaks the UI.
- Secrets / identity should not live as magic strings in the client bundle.
- Makes automated testing and multi-operator governance harder.

**Safe fix direction:**
- Move the "first operator" and "designated operator" checks to server-side Edge Functions only (already partially true).
- Client should only show privileged controls when `app_metadata.registry_role === "operator"` (and AAL2), not when a specific UUID matches.
- Keep a short comment explaining the bootstrap path, but remove the email/UUID hardcode from the React conditionals where possible.

### 2.2 Assessment / correction data entry is raw JSON

Therapists currently type/paste JSON for:
- Initial assessment
- Follow-up assessments
- Report corrections

This is extremely error-prone for clinical users and will produce frequent `setError("... must be valid JSON")` failures in real use.

**This is both a UX mistake and a functional risk.** It is not a crash bug, but it will block real therapists.

Phase 1 action: document clearly; Phase 2 will replace with structured forms + Manual Therapy / Modalities pickers.

### 2.3 Export is JSON, not clinical PDF

`export_my_patient_record` currently downloads a JSON blob.

User requirement: on-demand PDF, never permanently stored on Supabase.

Phase 1: keep current export working; Phase 2 implements proper on-demand PDF generation.

### 2.4 Intervention entry is a single free-text field

`add_intervention` takes a plain string. There is no structured body region, technique, dosage, response, or home advice (even though `InterventionEntry` in `report-types.ts` already defines these fields).

This is a data-model vs UI mismatch — the type system is ready, the form is not.

### 2.5 Outcome entry is minimal

Only measure name/code/value/direction. No unit, scale min/max, or date of measurement in the simple form (again the type system supports more).

### 2.6 No multi-session / program length model in the UI

The data model supports `followUpAssessments[]`, but the UI does not present a clear "Session 1 / Session 2 … Session 7" or "30-day / 60-day program" concept. Therapists will not naturally maintain a structured course of care.

---

## 3. Security / governance notes (not code bugs, but blockers)

These remain from PR #162 and are **out of scope for pure bug-fix**, but must stay visible:

- Existing self-approved therapist membership needs independent Operator review.
- Existing patient row must be confirmed synthetic before any cleanup.
- Hosted backup/restore drill still required.
- Independent penetration test still required.
- Institutional consent / privacy policy approval still required.

---

## 4. Phase 1 fix order (safe, no production merge)

1. **Document + reduce hardcode surface** in the client (this PR / this branch).
2. Improve error messages around JSON parse failures so therapists understand what went wrong.
3. Align intervention / outcome form fields with the existing `InterventionEntry` and `OutcomeMeasurement` types (still free-text, but structured) — only if it stays a pure fix, not a redesign.
4. Add a short in-app notice that full Manual Therapy / Modalities libraries and graphical PDF reports are the next phase.

**Explicitly deferred to Phase 2 (feature work):**
- Manual Therapy option library + muscle-specific safe stretches
- Modalities ready options
- True multi-session / 30-60 day program UX
- On-demand professional PDF generation
- Graphical outcome charts

---

## 5. Safety rules for this branch

- Target branch: `fix/registry-phase1-audit` only.
- Base: `registry-preview`.
- **Do not merge** to `cloudflare-deploy` until Phase 1 + Phase 2 + testing are complete and owner signs off.
- No schema / RLS / Edge Function changes in Phase 1 unless a clear correctness bug is found.
- No patient data inspection or modification.
