---
title: "Pre-registration summary (for OSF or a similar registry)"
subtitle: "Pilot agreement and reliability study of PNA RehabVerse Form Check (Part A) — version 0.1 DRAFT — contains [TO COMPLETE] fields"
---

*Register before the first participant is enrolled and attach the protocol (document 01), the statistical analysis plan (document 08) and the frozen software record (section 12 below). Pre-registration is not a legal requirement for a study of this kind; it is how the investigators show that the decision rules were fixed before the data existed. A registry's own template may use other headings; copy the answers across.*

| Field | Entry |
|---|---|
| Title | Pilot agreement and reliability study of an on-device camera-based pose-estimation tool (PNA RehabVerse Form Check) for neck and back exercises in healthy adults |
| Authors and roles | [TO COMPLETE] |
| Ethics approval | [TO COMPLETE: committee, reference, date] (register after approval, before enrolment) |
| Description | A pilot method-comparison and test–retest study estimating how closely a phone-camera tool agrees with a standard reference instrument for eight neck and back movement types, how repeatable it is, how well it counts repetitions and times holds, how well it detects deliberate form errors, and how often it gives no reading |
| Hypotheses | None tested. The study estimates bias, limits of agreement, reliability and accuracy, and applies pre-specified decision rules for what the tool may display in a later supervised patient pilot |
| Design | Cross-sectional, repeated measures within participants, two sessions on the same day (at least 10 minutes' rest), randomised order of movements and devices, blinded reference assessor, single site |
| Participants | 8 to 10 healthy adults aged 18 to 60 (inclusion and exclusion criteria: protocol section 5) |
| Sample size and stopping rule | 8 to 10 participants (pilot); enrolment stops at 10 or [TO COMPLETE: date]; no interim analysis; no stopping for results |
| Randomisation and blinding | Order of movements randomised per participant; assessor blinded to the camera reading until the reference is recorded; camera operator blinded to the reference; independent analyst |
| Interventions / procedures | Eight gentle movements, four repetitions each, per session; reference by CROM device, inclinometer or goniometer; camera reading by the application; instructed safe form errors for four movements |
| Measured variables | Camera angle and confidence; reference value; repetition counts (tool and manual); hold times (tool and stopwatch); refusals and reasons; cue events; set-up and condition categories; SUS and comfort items; adverse events |
| Primary outcome | Bias and 95% limits of agreement of camera against reference for each of the eight movement types |
| Secondary outcomes | ICC, SEM, MDC95; count and hold-time accuracy; cue sensitivity, specificity and kappa; coverage; error by condition; SUS and comfort; adverse events |
| Statistical models | Mixed model with participant random effect; cluster bootstrap (5,000 resamples, percentile) for intervals; ICC(2,1) with ICC(3,1) as sensitivity; Wilson intervals for proportions (analysis plan, document 08) |
| Decision rules | A numeric angle may be shown to patients only for a movement type with mean absolute error ≤ 5°, limits of agreement within ±10° (upper confidence limit within ±12°), ICC lower confidence limit ≥ 0.5 and coverage ≥ 80%; counts and timers if count accuracy ≥ 95% and hold timing within ±1 s; otherwise nothing is shown for that movement |
| Missing data | Not imputed; reported; worst-case sensitivity analysis for coverage |
| Exploratory analyses | Anything not in the analysis plan is labelled exploratory |
| Data and code availability | De-identified trial data on reasonable request; analysis script and data dictionary deposited with the registration |
| Conflict of interest | [TO COMPLETE: describe; see document 12] |

# 12. Frozen software record (complete before enrolment)

| Item | Value |
|---|---|
| Engine version / repository tag | [TO COMPLETE] |
| Pose Landmarker model file and SHA-256 | [TO COMPLETE] |
| Face Landmarker model file and SHA-256 | [TO COMPLETE] |
| MediaPipe Tasks Vision library version | [TO COMPLETE] |
| Thresholds (set-up check, hysteresis, filter, cue rules) | [TO COMPLETE: attach the specification file at the tag] |
| Date and person freezing | [TO COMPLETE] |
