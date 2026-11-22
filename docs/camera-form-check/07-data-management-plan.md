---
title: "Data management plan"
subtitle: "Camera exercise-feedback study (PNA RehabVerse Form Check), Parts A and B — version 0.1 DRAFT — contains [TO COMPLETE] fields"
---

# 1. Summary

The studies collect **numbers only** about movements (angles, counts, times, confidence, flags) and a small amount of descriptive information about the participant and the set-up, each record labelled with a **study code**, never a name. The camera image is processed on the participant's own device and is **not recorded, stored or transmitted**; landmark coordinates are not stored either. This plan describes what is collected, where it lives, who can see it, how long it is kept and how it is destroyed.

# 2. Roles

| Role | Who | Responsibility |
|---|---|---|
| Data controller / principal investigator | [TO COMPLETE] | Decides purposes and means; holds the key linking study codes to names; answers participants' requests |
| Data processor (hosting) | [TO COMPLETE: the database host, for example Supabase, project region: TO COMPLETE]; the web host (Cloudflare) | Stores and serves the application; has no access to the study key; contracts and data-processing terms [TO COMPLETE: confirm] |
| Reference assessor (blinded) | [TO COMPLETE] | Enters reference values before seeing the camera reading |
| Independent analyst | [TO COMPLETE] | Receives the de-identified export only; runs the registered analysis |
| Data protection contact (if the institution has one) | [TO COMPLETE] | Advises on legal basis and breach handling |

# 3. Data collected

| Group | Items | Personal data? |
|---|---|---|
| Trial data | Study code, session, movement, repetition number, camera value and confidence, reference value and instrument, counted repetitions (tool and manual), hold time (tool and stopwatch), whether the tool refused and why, whether an error was instructed, cue events (type and time) | Pseudonymised health-related measurements |
| Condition categories | Phone make/model and operating system, camera height and distance, orientation, lighting category and reading, clothing category | Pseudonymised |
| Participant descriptors | Age band, sex, height, region/condition (Part B), the assigned exercises (Part B) | Pseudonymised |
| Questionnaires | SUS, three comfort items, interview notes (Part B) | Pseudonymised |
| Adverse events | Type, onset, severity, action, outcome | Pseudonymised |
| Consent record | Signed form, date, version of the information sheet | Identifiable; kept on paper apart from the data |
| **Not collected** | Video, images, audio, landmark coordinates, names or contact details in the application, free-text names | — |

Free text is limited to the adverse-event description and the closing comments; assessors are told not to write names or other identifying details, and free text is withheld from the analyst's export unless reviewed.

# 4. Data flow

1. The participant or patient uses the application on a phone or computer. The camera image goes to the pose model **inside the browser**; only the derived numbers leave that step.
2. The numbers for each trial are sent over an encrypted connection (HTTPS) to the application's server and written to the study tables of the database. The server accepts study writes only from the signed-in therapist or researcher role, not from the public.
3. In Part A the assessor enters the reference value on the validation screen **before** the camera value is revealed; the order is recorded.
4. Paper source forms (consent, case report form, adverse-event form) are kept in a locked cabinet.
5. After analysis lock, the independent analyst receives a de-identified export (study code, age band, no free text, no dates finer than the month) with a data dictionary.

# 5. Security measures

- Encryption in transit (HTTPS) and at rest (database host's disk encryption).
- Access control by role; row-level security on every study table; writes through the server only; the public cannot read the study tables.
- Study records are append-only: corrections are new records that supersede the old ones, and the audit log records who did what and when. [TO COMPLETE: confirm once the study tables are built.]
- The therapist and researcher accounts use strong passwords and [TO COMPLETE: two-factor authentication if available]; accounts are removed when a person leaves the study.
- The key linking codes to names is **never** stored in the application: it is on paper, or in a separate encrypted file, held by the principal investigator.
- No study data are sent to any artificial-intelligence service. The pose and face models run in the browser from files hosted with the application.
- Software is frozen before enrolment (engine version, model-file hashes, library version, thresholds); the frozen version is recorded in the registration and in each trial record.

# 6. Quality control

- The tool's reading is captured automatically; the reference value is entered by the assessor and checked against plausible limits when typed; out-of-range entries must be confirmed.
- Ten percent of paper source forms are checked against the database by a second person [TO COMPLETE: confirm].
- The export is accompanied by a data dictionary and a run log; the analyst's script is registered with the analysis plan.

# 7. Participants' rights and withdrawal

Participants may ask what is held about them, ask for their numbers to be removed (before analysis lock the records are deleted from the working dataset; after analysis lock they cannot be removed from results already aggregated), and complain to the ethics committee. Requests go to the principal investigator [TO COMPLETE: contact]; the key is used to find the records, and the request itself is logged without identifying details beyond what is needed.

# 8. Retention, sharing and destruction

| Item | Period | Then |
|---|---|---|
| De-identified trial data | [TO COMPLETE: for example 5 years after publication] | Deleted from the database and the analyst's copies |
| Paper forms | [TO COMPLETE: same period] | Shredded |
| Key linking codes to names | Until the end of the study plus [TO COMPLETE: shortest period the committee allows], so withdrawals can be honoured | Destroyed |
| Audit log | Same as the data | Deleted with the data |

Sharing: aggregate results in publications; de-identified trial-level data on reasonable request, subject to the committee's advice and a data-use agreement. The registered protocol, analysis plan and the frozen software version are public.

# 9. Breach and incident handling

Any suspected loss or disclosure is reported to the principal investigator at once; the investigator assesses it within [TO COMPLETE: 24 hours], contains it (for example revokes access, rotates credentials), informs the ethics committee as it requires [TO COMPLETE: timeframe] and, where the law requires, the data protection authority and the people affected. Because no names, images or contact details are stored with the data, the likely harm of a breach is low, but this is not assumed.

# 10. Legal basis and local rules

[TO COMPLETE: the legal basis and local requirements for processing health-related research data in your jurisdiction (for example the national bioethics committee's guidelines, the institution's data policy, and any data-protection law that applies), and the institution's data-protection contact.] The investigators will check these before enrolment; this draft does not assume which rules apply.

# 11. Draft data dictionary (to be finalised when the study tables are built)

| Variable | Type | Description |
|---|---|---|
| study_code | text | Pseudonym, for example PNA-V-001 |
| session | 1 or 2 | Session within the visit |
| movement_id | text | Movement of the battery or the exercise id of the library |
| movement_type | text | Movement type id (see the camera decisions document) |
| repetition | integer | Repetition number |
| camera_value | number | Camera reading (degrees or the stated unit) |
| camera_confidence | 0 to 1 | Lowest landmark confidence used |
| reference_value | number | Reference instrument reading |
| reference_instrument | text | Instrument used |
| refused | yes/no | The tool gave no reading |
| refused_reason | text (coded) | Set-up not met, tracking lost, low confidence, other |
| instructed_error | yes/no | A deliberate fault was asked for |
| cue_fired | text (coded) | Cue id, or none |
| count_tool / count_manual | integer | Repetition counts |
| hold_tool_s / hold_stopwatch_s | number | Hold times in seconds |
| phone_model, os, orientation, height_cm, distance_m | text/number | Set-up |
| light_category, lux | text/number | Lighting |
| clothing_category | text | Fitted, loose, loose with head covering, other |
| engine_version, model_hash | text | Frozen software identification |
| entered_at_month | date (month) | Month of the trial |
