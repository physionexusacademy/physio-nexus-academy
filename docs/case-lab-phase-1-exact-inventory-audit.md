# Case Lab Phase 1 — Exact Inventory Audit

Audit date: 2026-10-26  
Audited branch: `case-lab-real-patient-stories-v1`  
Scope: source inventory and rendered Case Lab catalog; this is an inventory audit, not a clinical-quality sign-off.

## Exact source inventory

| Source | Count | What the count means |
|---|---:|---|
| `clinical-case-index.ts` | 9 | Deep-dive case records / index slugs; all 9 slugs are unique |
| `case-lab-msk-core.ts` | 20 | Directly authored MSK scenario records; all 20 IDs are unique |
| Multidisciplinary templates | 60 blueprints → 300 generated encounters | 60 templates across neuro, paediatrics, cardiopulmonary, mobility/vestibular and specialist areas; each template generates 5 encounters |
| `clinical-arena-expanded.ts` | 36 condition blueprints → 180 generated scenarios | 36 conditions × 5 scenario variants; all 180 IDs are unique |
| **Total underlying inventory** | **509 records/encounters** | 9 + 20 + 300 + 180 = 509 |

### Important distinction: 509 underlying records vs. 125 cards currently shown

The Case Lab catalog does not currently render every generated encounter as its own card. In `case-lab-catalog.ts`, the catalog includes all 9 deep dives, all 20 core MSK cases, only encounters whose IDs end in `-1` from the 300 multidisciplinary encounters (60 cards), and only `-1` scenarios from the 180 expanded scenarios (36 cards).

Therefore the current catalog is **125 cards**: 9 deep dives + 20 core MSK + 60 multidisciplinary representatives + 36 expanded representatives. The other 240 generated encounters are in the source data but are not separately listed as Case Lab cards by this catalog composition. This distinction explains the 509 vs. visible-card count.

## Findings affecting the planned story rewrite

1. **The “509” total is now reconciled mathematically from the source composition.** It does not mean 509 individually authored, clinically distinct narratives.
2. The 300 multidisciplinary encounters are generated from 60 shared templates, and the 180 expanded scenarios are generated as five variants for each of 36 conditions. The expanded file itself explicitly describes these as structured learning scenarios, not individually validated clinical cases.
3. The five variants frequently reuse the same presenting problem and findings while changing demographics or functional context. They should not automatically be treated as five meaningfully different patient stories.
4. The nine deep dives and twenty core MSK scenarios are separate source groups; do not assume that all records across sources are free of clinical-topic overlap without a later cross-source duplicate review.
5. Guides and supplemental guides are teaching support, not additional patient cases; do not add their counts to the case total.
6. This audit verifies record counts and catalog filtering from source code. It does **not** certify the clinical correctness, evidence quality, referral pathway, or unique-story quality of each record.

## Batch planning baseline

Use the 509 source records as the full inventory baseline, while separately tracking:
- 9 deep dives;
- 20 core MSK cases;
- 300 template-generated multidisciplinary encounters (60 blueprint families × 5);
- 180 expanded scenarios (36 condition families × 5);
- 125 cards currently surfaced by the Case Lab catalog.

For the rewrite, group the 480 generated encounters by their 60 multidisciplinary blueprint families and 36 expanded condition families, then decide which variants deserve genuinely distinct stories. Avoid counting a demographic/context swap as a fully distinct case. Preserve existing IDs or provide a compatibility map when changing IDs so current links and consumers do not break.

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
- `src/lib/clinical-case-guides.ts`
- `src/lib/case-lab-extra-guides.ts`

## Status / safety

This document is an audit artifact only. No patient-case content was rewritten by this inventory commit. Keep work on `case-lab-real-patient-stories-v1`; do not merge to `cloudflare-deploy` until the user explicitly requests it and the subsequent changes pass checks.
