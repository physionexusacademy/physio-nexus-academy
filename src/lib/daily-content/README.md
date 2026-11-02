# Daily PNA content architecture

This folder is intentionally modular so automated daily updates never need to rewrite the large legacy content files.

## Knowledge Hub

Create one dated folder per run:

`src/lib/daily-content/knowledge/YYYY-MM-DD/`

Inside it, create one article file for every active specialty, for example:

- `msk.ts`
- `neuro.ts`
- `cardio.ts`
- `pediatrics.ts`
- `sports.ts`
- `geriatrics.ts`
- `womens-health.ts`
- `pain-science.ts`
- `exercise-rehab.ts`
- `research.ts`

Each file exports one `KnowledgeArticle`. The dated folder's `index.ts` imports those article files and exports an array for that date. Then add only one import and one spread entry to `knowledge/index.ts` between the automation markers.

## Clinical Case Lab

Create each case as its own dated file under:

`src/lib/daily-content/cases/YYYY-MM-DD-<short-slug>.ts`

The file exports one `ClinicalCase`. Then add only one import and one entry to `cases/index.ts` between the automation markers.

## Safety rules

- Never rewrite `knowledge-daily.ts` or `clinical-cases.ts` during routine daily updates.
- Never delete or overwrite existing daily files.
- Avoid duplicate slugs.
- Keep all references traceable.
- Update only the two small registry files after creating new content.
- The unified aggregators automatically expose modular content to Knowledge Hub pages, specialty pages, case pages and sitemap routes.
