# RehabVerse outcome measures (28 Nov 2026)

A physiotherapist chooses which outcome measures to follow for a patient and how often; the patient answers the questionnaires that are due, and the
physiotherapist records the measurements they take. Everything is stored for the research record: the instrument, its **version**, the time point, the
**language the words were shown in**, who collected it, and a score that **the server worked out from the raw answers**.

## Where things are

| What | Where |
| --- | --- |
| Catalogue, wording (English + Roman Urdu), sources, licence, availability | `src/lib/outcomes/instruments.ts` |
| Scoring (the only place a score is computed; refuses anything unexpected) | `src/lib/outcomes/scoring.ts` |
| Reading a change (thresholds with their sources, shown beside every result) | `src/lib/outcomes/interpret.ts` |
| Plans, schedules, what is due | `src/lib/outcomes/plan.ts` |
| Database (plans, answers that cannot be edited, who may read and write) | `supabase/migrations/20261128120000_rehab_outcomes.sql` |
| Patient screens | `/rehabverse/me/outcomes`, dashboard card "Questions from your physiotherapist" |
| Physiotherapist screens | patient record → "Outcome measures" (plan editor, results, record a measurement) |
| Tests | `npm run validate:outcomes` (1,650 checks), DB validator section 16c, `scripts/rehabverse-local/e2e-outcomes.cjs` |

## Rules that protect the research record

- **The server scores.** The browser sends raw answers; `submitOutcomeAction` / `recordOutcomeAction` score them with `scoreResponse` and call the
  service-role-only `rehab_outcome_save`. A patient cannot write a score or an answer for something not in her live plan.
- **Answers cannot be edited** (a trigger refuses updates). One answer set per patient, instrument and time point; a repeat is ignored, the first is kept.
  A wrong entry is explained in the clinical notes, not rewritten.
- **A new plan** is a new row; the latest is live, earlier plans and every answer stay. Answers can only be saved for instruments in the live plan at the
  version chosen.
- **Versions.** Changing the wording or scoring of an instrument means a new `version`; old answers stay tied to the exact words they were given with.
- **Language.** Roman Urdu is a help beside the official English wording (the English is shown under every Roman Urdu line) and is **not a validated
  translation**. The language shown is stored with each answer so it can be analysed (or excluded) later.
- **Availability.** Only instruments whose status is `ready` can be put in a plan. `verify_wording`, `needs_permission` and `needs_licence` are listed to the
  physiotherapist with the reason and cannot be chosen; `checkPlanItems` refuses them on the server too.
- **Thresholds are guides.** Each band is shown with its source and "a guide, not a verdict". The physiotherapist-measured tests claim no threshold.

## Instruments

| Instrument | Who | Status | Notes |
| --- | --- | --- | --- |
| NPRS (now, average, worst, best over the last week) | patient | ready | primary = average over the week; important change ≥ 2 points and ≥ 30% (IMMPACT; 50% = substantial) |
| PSFS (up to 3 activities, 0–10) | patient | ready | activities written at the start and re-asked in the same order; ≈ 2 points on the average is beyond error |
| GROC (−7 to +7) | patient, follow-up only | ready | bands after Jaeschke 1989; protocols differ on where "important" starts, so state yours |
| Neck movement, deep neck flexor endurance | physiotherapist | ready | no threshold built in |
| Low back function tests (Schober, finger-to-floor, Sorensen, 5×STS, 30-s chair stand, TUG) | physiotherapist | ready | no threshold built in |
| RMDQ-24 | patient | **verify_wording** | public domain; the 24 statements are in the library but must be compared with the official copy (rmdq.org) first |
| STarT Back | patient | **verify_wording** | free for research (Keele); compare wording and scoring with the official copy; no Urdu version from Keele |
| NDI | patient | **needs_permission** | author's permission required (Dr. Howard Vernon); no wording stored |
| ODI 2.1a | patient | **needs_licence** | Mapi Research Trust licence; no wording stored |

## Owner to-do (these need a person)

1. **Compare the wording** of RMDQ-24 and STarT Back with the official copies (the official sites were not reachable from the build environment), then change
   their status to `ready` and bump nothing (version 1 stays, the words were never given to a patient before).
2. **NDI**: ask Dr. Vernon (CMCC) for permission to use it, and for the approved Urdu version if one exists. Suggested request: *"We are a physiotherapy clinic
   and academy in Pakistan running a research record of outcomes for neck and low back pain. May we use the Neck Disability Index (English, and your approved
   Urdu version if available) in an online patient portal, with full citation? We will not alter the wording."* Then add the wording as version 1.
3. **ODI**: confirm the Mapi terms for this study (individual clinical practice and unfunded academic research are reported to be free) and obtain the licence.
4. **Ethics approval** has not been obtained: before any of this data is used for research, the study needs it (consent wording, de-identified export).
5. Decide the **primary outcome and the "important change" thresholds** for the protocol; the screens show the common ones with their sources.
