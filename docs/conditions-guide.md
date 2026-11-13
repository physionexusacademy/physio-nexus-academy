# Conditions & Treatment Guide (`/conditions`)

One section replaces three: the MSK Injury Hub (`/msk-injuries`), Treatment Plans (`/treatment-plans`) and the Knowledge Hub
articles (`/knowledge-hub`). The Clinical Challenge Arena (`/clinical-arena`) was retired in the same change.
Old addresses permanently redirect (see `next.config.js`).

## What the visitor gets

* **Two ways to browse** — where it is (10 body areas / systems) and what kind of problem it is (10 types); search also
  understands everyday names ("sciatica", "tennis elbow", "frozen shoulder"; see `src/lib/conditions/aliases.ts`).
* **Three depths**, remembered on the device and carried in the link (`#quick`, `#clinical`, `#expert`):
  * **Quick guide** — what it can feel like, when to get medical help first, what helps first, self-care.
  * **Clinical plan** — a stage planner ("which stage fits right now?": tick the exit criteria, the plan tells you when to
    move on and shows doses), assessment, key tests, differentials, outcome measures, return criteria.
  * **Expert detail** — reasoning, mechanism, classification, investigations, manual therapy, modalities, dosing,
    progression rules, mistakes, pearls, education, escalation, step-by-step test technique, evidence, and a case story.
* 48 conditions: 36 from the MSK library + 12 plan-only conditions (neuro, heart/lung, long-term pain, after surgery).
  Conditions that existed in both libraries are merged into one guide.

## Why it is small

The Cloudflare worker has a 3 MiB (gzip) limit. The worker now contains only a 32 KiB catalogue
(`src/lib/conditions/generated/catalog.json`: names, summaries, first warning signs). Everything else is static JSON in
`public/conditions-data/<slug>.json`, fetched by the browser and **not counted** against the limit.

## Editing content

The source of truth is unchanged: `src/lib/msk-injury-hub.ts` (+ `msk-expanded-conditions.ts`, `msk-clinical-stories.ts`),
`src/lib/treatment-plans.ts` and `src/lib/treatment-plan-guides.ts`. Then regenerate and validate:

```
npm run build:conditions-data
npm run validate:conditions   # also runs in CI before every deploy
```

Where a condition lives (area/type) is set in `src/lib/conditions/taxonomy.ts`; a new condition must be placed there.
Stage mapping: injury conditions use their rehab phases (a stage's "ready when" = the previous stage's exit criteria);
plan-only conditions are turned into three stages (start / treat / progress and self-manage).
