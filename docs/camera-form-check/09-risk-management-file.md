---
title: "Risk management file"
subtitle: "Camera exercise-feedback tool (PNA RehabVerse Form Check) and its studies — version 0.1 DRAFT — contains [TO COMPLETE] fields"
---

# 1. Purpose and method

This file lists what could go wrong for a participant, a patient or the integrity of the research, what controls are in place, and **how each control is verified** (so that it is more than a promise). Severity (S) and likelihood (L) are scored 1 to 5 by the investigators [TO COMPLETE: confirm scores with the committee's own scale if it has one]; risk = S × L before and after controls. The file is reviewed before each study phase and after any adverse event.

Scales. Severity: 1 negligible, 2 minor (short-lived discomfort), 3 moderate (needs a change of plan or a clinic visit), 4 serious, 5 critical. Likelihood: 1 very unlikely, 2 unlikely, 3 possible, 4 likely, 5 expected.

# 2. Risk table

| ID | Hazard | Cause | Possible harm | S | L | Controls | Verification | Residual S×L |
|---|---|---|---|---|---|---|---|---|
| R1 | Muscle soreness, fatigue | Repeated movements | Minor discomfort | 2 | 3 | Gentle, active, comfortable range; rests; stop rule; physiotherapist present | Procedure in protocol 8.5; adverse-event form | 2×2 |
| R2 | Pain, dizziness, tingling | Neck or trunk movement | Symptoms, distress | 3 | 2 | Stop at once, ask, record, do not repeat that movement; exclusion criteria; neck movements gentle and supported | Adverse-event form; physiotherapist present; screening form | 3×1 |
| R3 | Fall or loss of balance | Standing movements; floor transfers | Injury | 3 | 1 | Wall or chair beside; no single-leg or end-range balance tasks; floor mat; exclusion if unable to get down and up | Set-up checklist before each movement | 3×1 |
| R4 | Wrong number displayed | Pose model error, bad set-up, clothing, lighting | Misleading feedback | 3 | 5 in the study (it is what is measured); 3 later | In Part A numbers are not used for any decision; later a number is shown **only** for movement types that met the pre-specified rules; the tool refuses when landmarks are missing or the set-up check fails | Automated test that no movement type is marked validated before the study (`npm run validate:formcheck`); set-up gate tests (visibility, size, view, light) | 3×2 |
| R5 | Cue pushes a person too far or past pain | Badly worded cue | Strain, pain | 3 | 2 | Cue wording rules: never more range, effort or force; never over pain; no medical judgement; "stop if anything hurts, feels dizzy or tingles" on every set-up screen and summary; cues with an "enough, come back slowly" form exist | Automated wording test on **every** cue sentence in both languages (`lintCue`, run in CI); cue list reviewed by the physiotherapist before recording | 3×1 |
| R6 | Cue is wrong for this person | Tool cannot see spine, pelvis, muscle activity | False reassurance or unnecessary worry | 2 | 3 | The tool states what it cannot see (spine curvature, pelvic tilt, deep muscle activity) in the summary; wording avoids "correct/incorrect"; clinician decides | Per-exercise limits are part of the generated decisions document and checked in CI | 2×2 |
| R7 | Distraction from the exercise | Watching the screen | Loss of balance, strain | 3 | 2 | Simple view (skeleton only); large, short cues; phone on a stand at the stated distance; no number blinking | Usability observation in Part B; SUS | 3×1 |
| R8 | Privacy: being on camera | Camera on a person's body | Embarrassment, loss of trust | 2 | 3 | Participant sees only themselves; no recording or storage; same-sex assessor or chaperone offered; may stop at any time; no clothing removal; skeleton-only view | Information sheet; consent; Part A feedback items | 2×1 |
| R9 | Privacy: another person in frame | Family member walks behind | Unintended exposure | 2 | 2 | Nothing is recorded; set-up check expects one person; the person is asked to clear the room | Set-up check test for "more than one person" [TO COMPLETE: confirm when built] | 2×1 |
| R10 | Data disclosure or loss | Account compromise, error | Disclosure of pseudonymised health data | 2 | 2 | Study code, no names or images; access control and row-level security; append-only records; audit log; paper key held apart; de-identified export; breach plan | Security review before enrolment [TO COMPLETE]; access test | 2×1 |
| R11 | Study code linked to a name by mistake | Name typed into a free-text field | Re-identification | 3 | 2 | Free text limited and withheld from the analyst's export unless reviewed; assessors told not to enter names | Export check before release | 3×1 |
| R12 | Bias from the investigators' interest | Commercial interest in the tool | Over-optimistic conclusions | 3 | 3 | Registration, frozen software, pre-specified decision rules, blinded reference assessor, camera reading hidden until the reference is entered, independent analyst, full reporting | Registration record; blinding order logged in each trial record | 3×1 |
| R13 | Software changes during the study | Update after enrolment | Results do not apply to the final tool | 3 | 2 | Software freeze: engine version, model-file hashes, library version and thresholds recorded before enrolment and in each trial; any change starts a new dataset | Version and hashes stored with every trial | 3×1 |
| R14 | Translation error in Roman Urdu | Idiom, spelling | Misleading instruction | 2 | 3 | Cue and information texts checked by a fluent speaker and by a second reader; the same wording rules apply in Roman Urdu | Roman Urdu lines pass the wording test; reviewer sign-off [TO COMPLETE] | 2×1 |
| R15 | Tool used outside its limits | A patient uses it for a diagnosis or to judge safety | Delay in seeking care | 3 | 2 | The tool and its texts state that it is exercise guidance, not diagnosis; the physiotherapist stays responsible; red-flag screening is by the physiotherapist | Wording review; Part B eligibility screening | 3×1 |
| R16 | Camera or microphone left on | Page error | Unintended capture | 3 | 1 | The camera is opened only by an explicit tap and closed when the page is left; nothing is recorded; no microphone is requested | Browser test that the camera stream stops on exit [TO COMPLETE: confirm when built] | 3×1 |
| R17 | Heat, battery or lag on an old phone | Heavy model | Poor experience, cut-off | 1 | 3 | The model loads only when the camera is opened; the tool says when the device is too slow and stops | Part A feasibility items | 1×2 |
| R18 | Participant under pressure to join | Staff or student of the investigators; patient of the clinic | Lack of free choice | 3 | 2 | Independent invitation; clear "no effect on care or job or studies"; records labelled; withdrawal at any time | Consent form wording; recruitment record | 3×1 |

# 3. Adverse event and incident handling

| Event | Action | Reporting |
|---|---|---|
| Symptom during a movement | Stop; ask; physiotherapist assesses; record | Adverse-event form (document 10); committee as it requires |
| Serious event | Immediate care or referral; stop that participant; principal investigator informed at once | Committee within [TO COMPLETE: timeframe]; halt rule in Part B section 7 |
| Wrong or unsafe tool behaviour | Stop use; record the version and set-up | Reviewed by the principal investigator and an independent clinician before restart |
| Data incident | See the data management plan, section 9 | As there |

# 4. Review

Reviewed by [TO COMPLETE: principal investigator and independent clinician] before Part A, before Part B and after any serious event; changes are listed in the version table. Version 0.1: initial draft.
