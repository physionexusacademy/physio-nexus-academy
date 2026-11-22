# RehabVerse therapist board and research record (29 Nov 2026)

Migration: `supabase/migrations/20261129120000_rehab_board_research.sql` (it needs the outcome-measures migration `20261128120000` first, because the board reads the outcome plan and answers).
Until it is applied, the board page says the database update is missing, the research page is empty and the consent control is hidden; nothing else changes.

## The board (`/admin/rehabverse/board`)

One card per active patient, worst first. The colour comes from fixed rules in `src/lib/board/rules.ts`, never from a model, so every light lists its reasons and can be checked
against the record. Filters are links (`?level=red&area=lumbar`), so the page needs no client code.

| Colour | When |
| --- | --- |
| **Red** | an open adverse event; a safety warning that needs a clinical assessment; a paused programme; pain worse than at the start (NPRS change classed worse by the instrument's own threshold) |
| **Amber** | assessment waiting 2 days or more (no safety warning); days awaiting your review for 1 day or more; no important pain change after 4 weeks; questionnaires late (7 days after the due date) or measurements overdue; no activity for 5 days on a running programme |
| **Green** | none of the above. "Good" notes (pain better, 80% or more of released days done) are shown beside it |

A card shows the stage, the areas, the pain at the start, the share of released days done and the last activity, and links to the patient's record.
`scripts/validate-board-research.ts` tests each rule on both sides of its limit, the ordering, and that a patient with no data is never shown as "on track" by mistake.

## Research consent

* A patient is in the research record only while the physiotherapist has recorded research consent on the patient's record (with a note on how it was obtained, 5 to 300 characters).
* **Registration consent is for the service and is not research consent.** The patient sees no research switch; consent is taken in person or on paper, with wording an ethics committee has approved.
* Recording and withdrawing are in the audit log (`research.consent_recorded`, `research.consent_withdrawn`). Withdrawing removes the patient from every download at once.
* Only staff can record it; a patient cannot, not even by writing to the table (privileges are revoked, the function is staff-only).

## The research record (`/admin/rehabverse/research`)

A banner states that **ethics approval has not been recorded**; do not use or publish the data as research before it is.
Downloads (CSV, one per table, `/admin/rehabverse/research/export/<table>`): participants, screening, outcomes, daily_feedback, adverse_events, and the data dictionary.

De-identification: the study id is the reference code (no name, e-mail or phone), age is a 10-year band (70+ together), dates are months, outcome timing is "days from the plan start",
and **no free text** leaves the system (no activities, notes, own words, descriptions). A cell that starts with `=`, `+`, `-` or `@` is written with a leading apostrophe so a spreadsheet never runs it.
Every download is audited (`research.export`, table and row count). The data dictionary (`src/lib/research/dictionary.json`) must list exactly the columns the database returns:
the database validator compares them, so a column cannot be added without being described.

## Owner to-do

1. Obtain **ethics approval** and approved consent wording; record how consent will be taken.
2. Decide who may download the research files and where they are stored (a downloaded file is outside the system's protection).
3. Decide the study's primary outcome and analysis plan before the first export.
