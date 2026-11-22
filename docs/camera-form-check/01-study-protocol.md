---
title: "Pilot agreement and reliability study of an on-device camera-based pose-estimation tool (PNA RehabVerse Form Check) for neck and back exercises in healthy adults"
subtitle: "Study protocol, version 0.1 (DRAFT for ethics review) — contains [TO COMPLETE] fields"
---

**Protocol version:** 0.1 DRAFT  **Date:** [TO COMPLETE]  **Registration:** [TO COMPLETE: pre-registration (for example OSF) before data collection; the protocol and analysis plan below are frozen at registration]

| Field | Entry |
|---|---|
| Principal investigator | [TO COMPLETE: name, qualifications, registration number] |
| Co-investigators | [TO COMPLETE] |
| Independent statistician / analyst | [TO COMPLETE: a person who is not a developer of the tool] |
| Study site | [TO COMPLETE: clinic / institution address] |
| Sponsor / funder | [TO COMPLETE] (none declared in this draft) |
| Ethics review body | [TO COMPLETE: institutional ethics committee; national bioethics requirements that apply] |
| Tool under study | PNA RehabVerse "Form Check" (software, runs in a phone or computer browser), version frozen before enrolment (see 9.3) |

## 1. Summary

RehabVerse is a web application in which a physiotherapist assigns home exercises and a patient follows them with a 3D demonstration. "Form Check" is a proposed optional feature that uses the device camera and an on-device pose-estimation model to (a) count repetitions, (b) time holds, (c) estimate selected joint and segment angles and (d) give short spoken or written cues, for exercises of the neck (cervical), mid-back (thoracic) and low back (lumbar) regions. Nothing is uploaded: the video is processed on the device and is not recorded or stored.

Before any numeric angle is shown to a patient, its accuracy must be known. This pilot study measures, in healthy adult volunteers, how closely the tool's angle estimates agree with a reference instrument, how repeatable they are, how well repetitions and holds are counted and timed, how well deliberately introduced form errors are detected, how often the tool cannot give a reading, and how acceptable it is to use. Results are used (i) to decide, for each movement type, whether a numeric angle may be displayed, only a count and timer, or nothing, and (ii) to plan a larger confirmatory study. It is **not** a study of treatment effect, diagnosis or clinical decision making.

## 2. Background and rationale

Home exercise is a core part of neck and back rehabilitation, but patients often cannot tell whether they perform an exercise correctly and therapists seldom see it. Marker-less pose estimation from a single camera (for example the MediaPipe/BlazePose family of models, Apache-2.0 licence) can run on a phone [Lugaresi 2019; Bazarevsky 2020], but its error depends on camera placement, the plane of movement, clothing, lighting and the body position (it is generally weaker for lying positions and for movements out of the camera plane, and it does not measure spinal curvature). Published accuracy figures come from other devices, populations and movements, so they cannot be assumed for this tool, these exercises or the clothing worn locally. A pre-specified, transparent local agreement study is therefore needed before any numeric feedback is offered, and the tool's claims must stay within what is shown.

## 3. Objectives

**Primary.** To estimate the agreement between camera-derived angles and a reference measurement for a pre-specified battery of eight neck and back movements (bias and 95% limits of agreement, with confidence intervals).

**Secondary.**

1. Test–retest reliability of the camera-derived angles (ICC, SEM, MDC95).
2. Accuracy of repetition counting (against a manual count) and of hold timing (against a stopwatch).
3. Sensitivity and specificity of the tool's cues for instructed, deliberate form errors that are safe to perform.
4. Coverage: the proportion of trials in which the tool gives a reading, and reasons for refusing (tracking lost, body part out of frame, low confidence).
5. Effect of phone model, lighting, clothing and camera placement on error.
6. Acceptability, comfort and usability (System Usability Scale and short comfort items).
7. Safety: adverse events and discomfort.

## 4. Design

Cross-sectional method-comparison study with repeated measures within each participant, a randomised order of movements and devices, and a blinded reference assessor. A second session of the same battery, after a rest of at least 10 minutes on the same day, gives test–retest data. Single site. This is a pilot: the sample is small by design and the study is analysed with precision (confidence intervals) rather than with significance tests.

## 5. Participants

**Number.** 8 to 10 healthy adult volunteers. This is a pilot sample justified in section 10.6; it is not powered for a confirmatory claim.

**Inclusion.** Age 18 to 60 years; able to give informed consent in English or Urdu; able to perform gentle active neck and trunk movements and to get down to and up from the floor without help.

**Exclusion.** Neck or back pain in the last 4 weeks that limits movement; surgery, fracture or other injury in the last 6 months affecting the spine, shoulders or hips; known spinal instability, myelopathy, inflammatory spinal disease or uncontrolled cardiovascular or respiratory disease; dizziness or fainting on neck movement; pregnancy beyond the first trimester (floor positions); any condition for which the study physiotherapist advises against the movements. A participant who has pain or discomfort during the session stops (section 8.5).

**Recruitment and voluntariness.** Open invitation at [TO COMPLETE: site]. Staff or students of the investigators' organisation may take part only if they are not in a reporting or assessment relationship with the investigators and are told that declining has no consequence; their data are labelled so that this can be checked. No payment beyond [TO COMPLETE: travel or refreshment allowance, if any]. Participants of all body sizes and in their usual clothing (including loose and modest clothing and a head covering, if worn) are welcome because real-world conditions are part of the question. No participant is ever asked to remove clothing.

**Chaperone and privacy of the setting.** A same-sex assessor or chaperone is offered. Sessions take place in a private room. The camera shows the participant only to the participant while the session runs; no image or video is saved.

## 6. Tool under study

PNA RehabVerse Form Check, a web page that opens the front or rear camera after the participant taps a button and the browser permission is granted, runs the MediaPipe Pose Landmarker (and, for head rotation, the Face Landmarker) in the browser, and applies pre-specified geometry to the detected landmarks. The tool displays a live mirrored view with a skeleton overlay and one or two angle arcs, a repetition counter, a hold timer and short cues; a small 3D demonstration shows the target movement. It refuses to give a number when the landmarks it needs are not visible with enough confidence. Cues never ask a person to go further into a movement and always allow stopping if there is pain. The tool is described as exercise guidance for the study; it is not used to diagnose, to decide treatment or to judge safety.

## 7. Measurements

### 7.1 Movement battery (Appendix E gives the full set-up)

| # | Movement | View | Camera quantity | Reference |
|---|---|---|---|---|
| 1 | Neck flexion and extension (sitting) | side | head–trunk sagittal angle | CROM device if available, otherwise a digital inclinometer |
| 2 | Neck rotation, left and right (sitting) | front | head rotation | CROM device or goniometer |
| 3 | Neck side bend, left and right (sitting) | front | head tilt relative to the shoulder line | CROM device or inclinometer |
| 4 | Standing trunk side bend, left and right | front | trunk inclination | digital inclinometer |
| 5 | Hip hinge (standing) | side | trunk inclination and knee angle | inclinometer and goniometer |
| 6 | Seated thoracic rotation, left and right | front | shoulder-line rotation relative to the pelvis | goniometer / rotation gauge (exploratory) |
| 7 | Glute bridge (supine), top position | side | shoulder–hip–knee angle | goniometer |
| 8 | Bird-dog (quadruped), top position | side | arm elevation and leg extension | goniometer and a level |

Each movement is held at its end point for 3 seconds so that the reference can be read; the camera reading for the same hold is the median of the readings in the middle second. Four repetitions per movement per session. Order of movements is randomised for each participant.

### 7.2 Other measures

Repetition count and hold time (tool vs. manual count and stopwatch); instructed form errors (7.3); phone model, operating system, camera height and distance, lighting category, clothing category; tool "no reading" events with the reason; System Usability Scale (Brooke 1996) and three comfort items; adverse events.

### 7.3 Instructed form errors

For movements 1, 4, 5 and 8 the participant performs one trial with a deliberate, safe, small fault (for example shoulder shrug during neck movement; trunk rotation during side bend; rounded upper back during hip hinge; lumbar sway or trunk rotation during bird-dog), asked in random order among correct trials. The known fault is the ground truth; the physiotherapist confirms it live. This gives sensitivity and specificity of the cues without recording or rating any video.

## 8. Procedures

1. Information, questions, written consent (Appendix: Participant information and consent form).
2. Screening against inclusion/exclusion criteria; baseline questions (age band, sex, height, clothing, device).
3. Set-up: phone on a stand at the specified height and distance; a lighting reading; study code entered in the app's validation mode.
4. Movement battery with the reference measured by the blinded assessor and the camera reading captured by the app, which keeps its reading hidden from the assessor until the reference value has been entered.
5. Rest of at least 10 minutes; repeat of the battery (session 2).
6. Questionnaires; debrief.

Total time about 60 minutes.

### 8.5 Stopping rules and safety

The study physiotherapist is present throughout. All movements are gentle, active, within comfortable range and no pain is provoked; any report of pain, dizziness, tingling or discomfort stops that movement, and the participant is asked about it before the next one. Standing movements are done next to a wall or chair. Adverse events are recorded on the form in Appendix D and reported to the ethics committee as required by it. The participant may stop at any time without giving a reason and without consequence.

## 9. Data, software and blinding

**9.1 Data recorded.** Per trial: study code, movement, repetition, camera angle(s) and the tool's confidence, reference value, flags (instructed error, tool refused), device and condition categories, time. **No video, no image and no landmark coordinates are stored.** Names are never entered in the app; the code-to-name key is kept on paper (or in a separate protected file) by the principal investigator.

**9.2 Blinding.** The reference assessor does not see the camera reading until the reference is recorded; the camera operator does not see the reference. The analysis is run by the independent analyst on the exported, de-identified data.

**9.3 Software freeze.** Before the first participant is enrolled the engine version, the model files (their SHA-256 hashes), the MediaPipe library version and all thresholds are frozen and recorded in the registration. Any change after that starts a new, separately reported dataset.

## 10. Statistical analysis plan (pre-specified)

**10.1 Agreement.** For each movement quantity, the differences (camera − reference) are analysed with a mixed-effects model with a random participant effect to account for repeated measures; bias and 95% limits of agreement are reported with 95% confidence intervals obtained by a participant-level (cluster) bootstrap [Bland & Altman 1986, 1999]. Bland–Altman plots show the differences against the mean. Proportional bias is examined by regressing the differences on the mean. Also reported: mean absolute error, root-mean-square error, and the proportion of pairs within 5° and within 10°.

**10.2 Reliability.** ICC for absolute agreement with its 95% confidence interval, using the model that matches the design, reported with the form used [Koo & Li 2016]; standard error of measurement (SEM) and the minimal detectable change at 95% confidence (MDC95 = 1.96 × √2 × SEM). Lin's concordance correlation coefficient may be reported for camera versus reference [Lin 1989].

**10.3 Counting and timing.** Exact-count agreement (%), mean absolute count error; hold time differences with limits of agreement.

**10.4 Cues.** Sensitivity, specificity and Cohen's kappa of the tool's cue against the instructed fault.

**10.5 Coverage and conditions.** Percentage of trials with a reading; reasons for no reading; error by phone model, lighting, clothing and camera placement (descriptive, with the same interval estimates); no imputation of missing data, with a report of how many trials are missing and why.

**10.6 Sample size.** This is a pilot. Eight to ten participants, eight movement types and four repetitions in two sessions give roughly 500 to 640 trials, but the between-person variation of the error is estimated from only 8 to 10 people, so intervals will be wide and are reported as such. The pilot's purpose is to estimate bias and variability to size a confirmatory study (expected at least 35 to 50 participants) and to decide what the tool may display in the first supervised patient use.

**10.7 Pre-specified decision rules for the supervised patient pilot.** For a movement quantity, a numeric angle may be shown to a patient only if **all** of the following hold: mean absolute error ≤ 5°; 95% limits of agreement within ±10° (the upper limit of the confidence interval of the limits within ±12°); ICC lower 95% confidence limit ≥ 0.5; coverage ≥ 80%. A movement whose count accuracy is at least 95% and hold timing within ±1 s may show a count and timer. Otherwise the tool shows neither angle nor count for that movement and says so. These thresholds are proposed by the investigators, are open to the committee's advice, and apply only to the supervised pilot; they are not claims of clinical validity. The reference instrument's own measurement error (commonly several degrees for a goniometer) is acknowledged as a limitation and the reference is repeated for a subset to estimate it.

**10.8 Reporting.** GRRAS [Kottner 2011] and COSMIN principles [Mokkink 2010]; all pre-specified analyses reported whether or not favourable; deviations listed.

## 11. Ethical considerations

**Risk.** Minimal: gentle active movements that people do in everyday life and in routine rehabilitation, under supervision, with a stopping rule. Possible short-lived muscle soreness or fatigue. No procedure involves pain provocation, imaging, drugs or clothing removal.

**Benefit.** No direct benefit to participants. Benefit to society: an honestly measured tool, or a decision not to use it, before it reaches patients.

**Consent.** Written, in the participant's language, with time to decide and to ask questions; consent covers the use of the de-identified measurements for this and for a planned confirmatory study and for publication in aggregate form. Withdrawal is possible at any time; data of a participant who withdraws are removed from the working dataset on request (before analysis lock) and not used afterwards.

**Privacy and data protection.** On-device processing; no video, image or landmark storage; a study code instead of a name; paper key held separately; access limited to named investigators; storage in the application's access-controlled database with row-level security and audit logging; de-identified export for the analyst; retention [TO COMPLETE: period]; publication only in aggregate.

**Conflict of interest.** The principal investigator [TO COMPLETE: confirm] has a commercial interest in the application. To limit bias: the analysis plan and decision rules are fixed before data collection; the analysis is run by an independent analyst; and all results are reported.

**Regulatory position.** In the study and in the supervised pilot the software is used for exercise guidance and research, not for diagnosis or treatment decisions, and is described as such. The investigators will check whether, and from what claims onward, the software would be regulated as a medical device under the rules that apply in [TO COMPLETE: jurisdiction] before any wider release or any measurement claim.

**Vulnerable groups.** Participants must be adults able to consent. Students and staff of the investigators are handled as described in section 5.

**Equity and inclusion.** Body size, clothing and head covering are recorded as conditions rather than reasons for exclusion, so that the tool's limits for those groups are known and disclosed.

## 12. Next step: supervised pilot with patients (separate protocol)

If, and only if, the decision rules in 10.7 are met for some movements, a second protocol will describe a supervised feasibility and safety pilot in 8 to 10 adult patients of the clinic who are doing neck or back exercises, using only the movements that met the rules, with separate consent, therapist oversight, a stopping rule and outcome measures of safety, adherence, usability and therapist agreement. It is not part of this submission.

## 13. Timeline and resources

[TO COMPLETE: approval, software freeze and registration, recruitment (about two weeks for 8 to 10 participants), data collection, analysis, report.] Equipment: two or three phones of different makes, phone stands, inclinometer and goniometer (CROM device if available), lighting meter (a phone app is sufficient), stopwatch, paper forms.

## 14. References

1. Bland JM, Altman DG. Statistical methods for assessing agreement between two methods of clinical measurement. *Lancet* 1986;1:307–310.
2. Bland JM, Altman DG. Measuring agreement in method comparison studies. *Stat Methods Med Res* 1999;8:135–160.
3. Koo TK, Li MY. A guideline of selecting and reporting intraclass correlation coefficients for reliability research. *J Chiropr Med* 2016;15:155–163.
4. Lin LI. A concordance correlation coefficient to evaluate reproducibility. *Biometrics* 1989;45:255–268.
5. Kottner J, et al. Guidelines for Reporting Reliability and Agreement Studies (GRRAS) were proposed. *J Clin Epidemiol* 2011;64:96–106.
6. Mokkink LB, et al. The COSMIN checklist for assessing the methodological quality of studies on measurement properties of health status measurement instruments. *J Clin Epidemiol* 2010;63:737–745.
7. Lugaresi C, et al. MediaPipe: a framework for building perception pipelines. arXiv:1906.08172, 2019.
8. Bazarevsky V, et al. BlazePose: on-device real-time body pose tracking. arXiv:2006.10204, 2020.
9. Brooke J. SUS: a "quick and dirty" usability scale. In: Jordan PW, et al., eds. *Usability Evaluation in Industry*. London: Taylor & Francis; 1996.
10. World Medical Association. Declaration of Helsinki: ethical principles for medical research involving human participants (current revision).

*(Please check each reference against the original before submission.)*

---

# Appendices

## Appendix A. What the tool will and will not claim

The tool will say: repetitions counted; time held; an estimated angle "from the camera", with the number shown only for movements that met the rules in 10.7 and always with a confidence indication; and short exercise cues. The tool will not say: that a movement is medically correct or incorrect, that a joint has a deficit, that the spine is neutral or curved (a single camera cannot measure spinal curvature), or anything about diagnosis or safety. For lying and four-point positions (bridges, bird-dog, curl-up, plank, cat-camel, open book and similar) and for "core control" exercises, lumbar and pelvic control are not measured and the tool says so.

## Appendix B. Data management plan

| Item | Plan |
|---|---|
| Data types | Trial-level numbers (angles, confidence, counts, times, flags), condition categories, questionnaire scores, adverse-event records; consent record |
| Identifiers | Study code only in the app; the key linking code to name is on paper (or a separate encrypted file) held by the principal investigator |
| Storage | The application database (access-controlled, encryption in transit and at rest, row-level security, audit log); paper forms in a locked cabinet |
| Access | Named investigators; the independent analyst receives a de-identified export (study code, age band, no free text) |
| Video / images / landmark coordinates | Not recorded, not stored, not transmitted |
| Retention | [TO COMPLETE: for example 5 years after publication], then deletion |
| Sharing | Aggregate results in publications; de-identified trial-level data available on reasonable request, subject to committee approval |
| Withdrawal | Participant data removed from the working dataset on request before analysis lock |
| Breach | Reported to the principal investigator immediately and to the ethics committee as it requires |

## Appendix C. Risk register (study and tool)

| Risk | Likelihood | Effect | Control |
|---|---|---|---|
| Muscle soreness or fatigue | Low | Minor | Gentle movements, comfortable range, rests, stop rule |
| Pain, dizziness or tingling during a movement | Low | Minor to moderate | Stop at once, ask, record, do not continue that movement; physiotherapist present |
| Fall or loss of balance (standing movements) | Very low | Moderate | Wall or chair beside; no single-leg or end-range balance tasks |
| Embarrassment or discomfort about being on camera | Low | Minor | Participant sees only themselves; nothing recorded; same-sex assessor or chaperone offered; may stop at any time; "simple view" shows only the skeleton |
| Tool gives a wrong number | Expected, that is what is measured | None in the study (numbers are not used for any decision about the participant) | The study measures it; numbers are shown to patients only after the decision rules are met |
| Tool cue pushes a person too far | Low | Moderate | Cues are written never to ask for more range; "stop if painful" is always shown; cues are fixed and reviewed |
| Data loss or disclosure | Low | Minor (no names, no images) | Study code only; access control; audit log; paper key held apart |
| Bias from the investigators' interest in the tool | Moderate | Affects the validity of the conclusions | Pre-registration, frozen software and decision rules, blinded reference, independent analyst, full reporting |

## Appendix D. Case report form fields

Participant code; date; session 1 or 2; age band; sex; height; clothing category (fitted, loose, loose with head covering, other); phone make/model and operating system; camera height and distance; lighting category (bright, normal, dim) and reading; for each movement and repetition: reference value and instrument, camera value and tool confidence, tool refused (yes/no and reason), instructed error (yes/no), counted repetitions (tool and manual), hold time (tool and stopwatch); comfort items; SUS; adverse events (type, onset, severity, action, outcome); assessor initials.

## Appendix E. Set-up for each movement

Phone on a stand about 2 m from the participant, at about hip to chest height, level (a phone spirit-level reading is recorded), whole body in frame, plain background where possible, a front or side placement as in 7.1; the participant stands or sits on the marked spot. Floor movements: phone about 2 m to the side at floor-to-hip height. A distance and height are recorded in the case report form.

## Appendix F. Submission checklist

Signed application form of the ethics committee; this protocol; participant information sheet and consent form (English and Urdu, the Urdu version checked by a fluent speaker); data management plan (Appendix B); risk register (Appendix C); case report form (Appendix D); curricula vitae of the investigators; evidence of registration plan; declaration of interest; insurance or indemnity statement if the committee asks for it [TO COMPLETE]; letter of permission from the site [TO COMPLETE].
