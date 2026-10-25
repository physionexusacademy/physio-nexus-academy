# Case Lab Phase 1 — Inventory Audit

Audit date: 2026-10-26
Branch: case-lab-real-patient-stories-v1
Scope: Case Lab catalog assembly and directly connected clinical-case sources. This is an inventory/quality audit, not a claim that all underlying scenarios are independently authored patient cases.

## Executive result

The current Case Lab catalog exposes **113 cards**, from four source groups:
- **9** clinical deep-dive cards (clinicalCaseIndex)
- **8** core MSK interactive cards (coreMskCases)
- **60** multidisciplinary interactive cards (one -1 encounter per authored template)
- **36** expanded interactive cards (one -1 variant per condition group)

Arithmetic: 9 + 8 + 60 + 36 = 113. This follows the exact filters and mappings in src/lib/case-lab-catalog.ts; labCaseTotal is labCaseCards.length.

## Underlying source inventory (do not add these numbers as unique clinical cases)

| Source | Source-level inventory | What the count means |
|---|---:|---|
| clinical-case-index.ts | 9 unique slugs | Deep-dive cards in catalog |
| case-lab-msk-core.ts | 8 explicit case IDs | Core MSK cards in catalog |
| clinical-arena-neuro.ts | 12 templates | Multidisciplinary blueprints |
| clinical-arena-pediatrics.ts | 12 templates | Multidisciplinary blueprints |
| clinical-arena-cardiopulm.ts | 12 templates | Multidisciplinary blueprints |
| clinical-arena-mobility-vestibular.ts | 12 templates | Multidisciplinary blueprints |
| clinical-arena-specialist.ts | 12 templates | Multidisciplinary blueprints |
| Multidisciplinary total | 60 templates / 300 generated encounters | Five functional-context encounters per template; not 300 independent diagnoses or separately authored narratives |
| clinical-arena-expanded.ts | 36 condition groups / 180 scenario records | Five generated/context variants per group; file comment explicitly says these are structured learning scenarios, not individually validated clinical cases |
| clinical-cases.ts | 3 legacy case slugs in this source | Used by the case adapter, not counted as additional catalog cards |
| daily-case-2026-09-29.ts | 1 additional detailed case slug observed | Additional clinical case source; not directly included in the current catalog’s 9-item index |
| msk-clinical-stories.ts | 14 story keys | Narrative teaching stories; not automatically 14 Case Lab cards |
| clinical-case-guides.ts + case-lab-extra-guides.ts | Guides for selected detailed cases | Supporting guidance, not separate cases |

## Exact Case Lab catalog sources

### Deep-dive slugs (9)
- postpartum-running-stress-urinary-incontinence
- older-adult-recurrent-falls-orthostatic-symptoms
- overhead-athlete-shoulder-load-capacity
- runner-anterior-knee-pain-load-capacity
- copd-rehab-exertional-desaturation-clinical-reasoning
- low-back-pain-new-bladder-saddle-symptoms
- stroke-gait-balance-task-specific-rehab
- copd-post-exacerbation-pulmonary-rehab
- acl-reconstruction-return-to-sport-readiness

### Core MSK IDs (8)
- shoulder-01 — The Frozen Shoulder Mystery
- knee-01 — The Pivot-and-Pop Case
- hand-01
- back-01
- ankle-01
- hip-01
- neck-01
- safety-01

### Multidisciplinary catalog rule
The catalog filters multidisciplinaryCases to IDs ending in -1. The generator creates five encounter IDs per template; the catalog deliberately displays only the first context per template. Each of five template files contains 12 blueprints, totalling 60.

### Expanded catalog rule
The catalog filters expandedCases to IDs ending in -1. The expanded source has IDs expanded-01-1 through expanded-36-5: 36 condition groups × 5 context variants = 180 records, but only 36 appear in the catalog.

## Overlap and deduplication findings

- The three slugs in clinical-cases.ts — low-back-pain-new-bladder-saddle-symptoms, stroke-gait-balance-task-specific-rehab, and copd-post-exacerbation-pulmonary-rehab — also appear in the 9-item deep-dive index. These are shared records/references, not three extra cards.
- clinical-case-index.ts has 9 unique slugs; no duplicate slug was found within that index.
- The 180 expanded records are not 180 unique conditions; they are 36 condition groups with five generated variants each.
- The 300 multidisciplinary encounters are not 300 independent diagnoses; they are generated from 60 templates in five contexts each.
- Therefore, **509 is not supported by this catalog audit** as either the visible-card count or a verified count of unique, individually authored patient cases. It may refer to a wider content total, but that would need a separate documented inventory of other content families.

## Quality flags for the next phase

1. adaptDetailedCase in case-lab-story.ts sets examCorrect: -1 and diagnosisCorrect: -1 for adapted detailed cases. Confirm the UI treats these as non-scored/appropriate states; do not assume a valid answer key exists.
2. The adapter marks adapted detailed cases fullyAuthored: false, avoiding representation of adapted content as a fully bespoke patient story.
3. A generic red-flag prompt is not proof that a patient was screened or that red flags are absent. Cases must distinguish known positives, negatives actually assessed, and information not yet obtained.
4. Generated/context variants should not be marketed as five genuinely different patient stories unless their clinically relevant histories, findings, reasoning and management actually differ.
5. Quality grading should be per case, checking patient narrative, history, examination, working diagnosis/differentials, red-flag triage/referral urgency, management, progression/follow-up, evidence/reference integrity, and answer-key correctness.

## Batch planning recommendation

For rewriting, group by clinically coherent topic and risk, not by raw generated record count. First batch should use a manageable set of high-priority cases (including red-flag cases) and fully meet the common case standard before expanding. Do not rewrite all 180 generated variants as if each were distinct; audit the 36 underlying condition groups and 60 underlying multidisciplinary blueprints first.

## Files inspected

- src/lib/case-lab-catalog.ts
- src/lib/clinical-case-index.ts
- src/lib/case-lab-msk-core.ts
- src/lib/clinical-arena-expanded.ts
- src/lib/clinical-arena-multispecialty.ts
- src/lib/clinical-arena-multispecialty-core.ts
- src/lib/clinical-arena-neuro.ts
- src/lib/clinical-arena-pediatrics.ts
- src/lib/clinical-arena-cardiopulm.ts
- src/lib/clinical-arena-mobility-vestibular.ts
- src/lib/clinical-arena-specialist.ts
- src/lib/clinical-cases.ts
- src/lib/daily-case-2026-09-29.ts
- src/lib/case-lab-story.ts
- src/lib/clinical-case-guides.ts
- src/lib/case-lab-extra-guides.ts
- src/lib/msk-clinical-stories.ts