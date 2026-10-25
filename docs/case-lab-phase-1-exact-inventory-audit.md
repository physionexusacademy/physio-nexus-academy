# Case Lab Phase 1 — Exact Inventory Audit

Audit date: 2026-10-26  
Audited branch: `case-lab-real-patient-stories-v1`  
Scope: source inventory and catalog composition. This is not a clinical-quality sign-off.

## Verified catalog count

The current `case-lab-catalog.ts` assembles cards from four sources:

| Source | Current source count | Catalog cards | Count method |
|---|---:|---:|---|
| `clinical-case-index.ts` | 9 | 9 | 9 unique `slug` values |
| `case-lab-msk-core.ts` | 8 | 8 | 8 explicit case IDs in the current `coreMskCases` array |
| Multidisciplinary templates | 60 blueprints → 300 generated encounters | 60 | Catalog filters generated IDs ending in `-1` |
| `clinical-arena-expanded.ts` | 36 condition groups → 180 generated scenarios | 36 | Catalog filters IDs ending in `-1` |
| **Current total** | **497 source records/encounters, counting generated variants** | **113 cards** | 9 + 8 + 60 + 36 |

## Correction to the previously documented 509 / 125 figures

An earlier audit note stated that `case-lab-msk-core.ts` contained 20 directly authored MSK cases, yielding 509 underlying records and 125 cards. A fresh literal-source inspection of the current audited branch found **8 explicit records** in `coreMskCases` (IDs: `shoulder-01`, `knee-01`, `hand-01`, `back-01`, `ankle-01`, `hip-01`, `neck-01`, `safety-01`). The source comment claiming 20 cases is stale or inaccurate relative to the actual array. Therefore, for this branch, the defensible counts are **497 underlying records/encounters** and **113 catalog cards**, not 509 and 125. The 60 × 5 and 36 × 5 generated totals are encounter variants, not independently authored unique cases.

## Source-level quality and overlap findings

1. **Generated variants are not automatically distinct patient stories.** The 300 multidisciplinary encounters are built from 60 blueprints with five functional contexts per blueprint. The shared core presentation and findings remain substantially reused.
2. **Expanded scenarios are explicitly educational variants.** `clinical-arena-expanded.ts` documents 36 conditions × 5 functional contexts and says these are structured learning scenarios, not individually validated clinical cases. Variants reuse the same condition-specific findings and explanation while demographics or functional context change.
3. **Cross-source overlap is present by design or plausible from the source titles.** The deep-dive index includes topics also represented in daily clinical case modules and/or expanded scenario groups (for example COPD, anterior knee pain, overhead shoulder pain, recurrent falls, postpartum running symptoms, and cervical myelopathy). These may be separate learning formats but must not be counted as unique diagnoses or unique stories without comparing their actual content.
4. `all-clinical-cases.ts` merges modular daily cases with legacy cases by slug, preventing exact slug duplicates in that merged list. The Case Lab index is a separate list, so that slug-level de-duplication does not prove no overlap between Case Lab sources.
5. Guides and supplemental guides are learning support, not additional cases; do not add their counts to the inventory.
6. `case-lab-story.ts` adapts multiple source types into a shared story schema. Detailed-case adaptation currently sets `examCorrect` and `diagnosisCorrect` to `-1`; verify how consumers render/score those values before treating them as functioning answer keys.
7. Safety prompts and red-flag language must not be interpreted as evidence that a red flag was assessed and absent. Case rewrites must clearly distinguish known positive findings, unknown/unasked features, screening instructions, and escalation urgency.

## Batch planning baseline

Use these separate baselines:
- **113 cards currently assembled by the Case Lab catalog**;
- **497 source records/encounters when generated context variants are counted individually**;
- **60 multidisciplinary blueprint families**;
- **36 expanded condition families**;
- **8 explicit core MSK records in the current source array**;
- **9 indexed deep-dive records**.

For the rewrite, group generated encounters by blueprint/condition family. Decide which variants deserve genuinely distinct narratives; do not count a demographic or activity-context swap as a fully distinct case. Preserve IDs or provide a compatibility map when changing IDs so existing links and consumers do not break.

## Source files inspected

- `src/lib/case-lab-catalog.ts`
- `src/lib/clinical-case-index.ts`
- `src/lib/case-lab-msk-core.ts`
- `src/lib/clinical-arena-multispecialty.ts`
- `src/lib/clinical-arena-multispecialty-core.ts`
- `src/lib/clinical-arena-neuro.ts`
- `src/lib/clinical-arena-pediatrics.ts`
- `src/lib/clinical-arena-cardiopulm.ts`
- `src/lib/clinical-arena-mobility-vestibular.ts`
- `src/lib/clinical-arena-specialist.ts`
- `src/lib/clinical-arena-expanded.ts`
- `src/lib/clinical-cases.ts`
- `src/lib/clinical-cases-current.ts`
- `src/lib/all-clinical-cases.ts`
- `src/lib/daily-content/cases/index.ts`
- `src/lib/clinical-case-guides.ts`
- `src/lib/case-lab-extra-guides.ts`
- `src/lib/case-lab-story.ts`

## Status / safety

This document records inventory findings; it does not certify clinical correctness, evidence quality, referral pathways, or unique-story quality. Keep work on `case-lab-real-patient-stories-v1`. Do not merge to `cloudflare-deploy` until the user explicitly requests it and subsequent changes pass checks.
