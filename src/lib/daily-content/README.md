# Daily PNA content architecture

This folder is intentionally modular so automated daily updates never need to rewrite the large legacy content files.

The Knowledge Hub articles were retired in 2026-11 (their addresses redirect to the Conditions & Treatment Guide). Only the
Clinical Case Lab content below is still published from here.

## Clinical Case Lab

Create each case as its own dated file under:

`src/lib/daily-content/cases/YYYY-MM-DD-<short-slug>.ts`

The file exports one `ClinicalCase`. Then add only one import and one entry to `cases/index.ts` between the automation markers.

## Safety rules

- Never rewrite `clinical-cases.ts` during routine daily updates.
- Never delete or overwrite existing daily files.
- Avoid duplicate slugs.
- Keep all references traceable.
- Update only the small registry file after creating new content.
