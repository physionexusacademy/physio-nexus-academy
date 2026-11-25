# Posture screen: validation study protocol

**Status: draft for the clinical lead and an ethics committee. Nothing in the app claims accuracy beyond what this study shows.**

## Why
The public posture screen (`/health-calculators/posture`) reads posture from one phone picture with an on-device pose model. The model has no landmark for the spine or the C7 vertebra and a flat picture has no depth, so the numbers are *estimates*. Until this study is done, every number is shown with a plus-or-minus, and the cut-offs ("a little off", "worth a closer look") are provisional. The study answers four questions:

1. **Agreement:** how close are the app's numbers to a reference measurement? (bias and 95 percent limits of agreement)
2. **Repeatability:** if the same person is captured twice, how much do the numbers differ? (SEM, minimal detectable change, ICC)
3. **What affects it:** phone model, who holds the phone, clothing, body build, lighting.
4. **Cut-offs:** where should "typical", "a little off" and "worth a closer look" sit?

## Design
Cross-sectional agreement and test-retest study, reported with GRRAS (Kottner 2011) and planned with COSMIN (Mokkink 2010).

- **Participants:** adults and students (18 to 65), 60 people to start (a pilot of 20 first to check the procedure). Exclusions: fresh injury, severe pain, a diagnosed structural spine deformity, pregnancy in the third trimester, inability to stand unaided for two minutes. Record age, sex, height, weight and clothing; no names with the data.
- **Consent and ethics:** written informed consent; approval from an institutional ethics committee before the first participant. The app stores nothing; the reference photograph is a *separate research procedure* with its own consent, kept on an encrypted research drive and destroyed at the end of the study.
- **App captures:** each person is captured **side and front**, by themselves (phone on a stand, front camera) and by a helper (back camera), on **two phone models** at least (one budget, one mid-range). Phone level reading (pitch and roll) is recorded. Repeat all captures after 10 minutes (the person steps away and returns) for the repeatability analysis, in at least 30 people.
- **Reference measurements** (made by a trained physiotherapist who does not see the app's numbers, within the same ten minutes):
  - *Head and trunk (side):* photograph with a levelled camera at 2.5 m, skin markers on the tragus and C7 spinous process and the acromion, a plumb line in view, angles measured on the photograph in free software (Kinovea or ImageJ) with a calibration scale; craniovertebral angle recorded as the clinical reference for the ear-shoulder angle stand-in.
  - *Shoulder, hip and head level (front):* the same photograph method with markers on both acromions, both anterior superior iliac spines and both tragi, and a spirit-levelled horizontal reference; a digital inclinometer on the bony landmarks as a second reference.
  - *Knees:* markers on the hip centre, mid-patella and mid-ankle; the offset of the knee from the hip-ankle line on the photograph.
  - *Knee angle (side):* long-arm goniometer.
- **Blinding and order:** the reference assessor never sees the app's numbers; the order of app and reference is alternated.

## Data sheet
The page's researcher mode (open the posture page with `?validation=1`) adds a *Reference value* box for each metric and exports a CSV with these columns: `time, view, metric, app_value, app_plus_minus, reference_value, capture_by, phone_pitch_deg, phone_roll_deg`. A template is in `public/posture-validation-template.csv`. Add columns for participant code, phone model, clothing and rater in a spreadsheet before analysis. Nothing is sent anywhere: the table lives in the page until it is downloaded.

## Analysis
Run `node --experimental-strip-types scripts/analyse-posture-validation.ts study.csv` for the first look, then in a statistics package:

- **Agreement:** Bland and Altman (1986): bias, standard deviation of the differences, 95 percent limits of agreement; plot differences against means to look for proportional bias; Pearson r only as a side note.
- **Repeatability:** ICC(2,1) with its 95 percent confidence interval, standard error of measurement (SEM) and minimal detectable change at 95 percent (MDC95) from the two captures. The functions in `src/lib/posture/validation.ts` are tested against the Shrout and Fleiss (1979) worked example.
- **Subgroups:** repeat the agreement analysis by phone model, who held the phone, clothing and body-mass-index group.
- **Cut-offs:** receiver-operating-characteristic analysis of each metric against the reference measurement and against a clinician's rating of the photograph ("typical", "mild", "marked") to set the three bands.

## Pre-specified acceptance (so we do not move the goalposts)
A metric is *reported as measured* on the public page only if, in the full sample:
- the 95 percent limits of agreement are within **±3 degrees** (angle metrics) or **±5 percent** (percentage metrics) of the reference, and
- ICC(2,1) is **0.75 or higher**, and
- the minimal detectable change is smaller than the cut-off between "typical" and "a little off".

A metric that fails stays on the page as an *estimate* with its measured limits of agreement printed next to it, or is removed.

## Reporting
Report all metrics, including failures; state the limits of agreement in the units of each metric; publish the de-identified data and the analysis code with the paper. Update `src/lib/posture/measures.ts` (the cut-offs and the uncertainty floors) from the results, and update the page wording to quote the measured agreement.

## References
- Bland JM, Altman DG. Statistical methods for assessing agreement between two methods of clinical measurement. Lancet 1986;1:307-310.
- Shrout PE, Fleiss JL. Intraclass correlations: uses in assessing rater reliability. Psychol Bull 1979;86:420-428.
- Kottner J, Audige L, Brorson S, et al. Guidelines for Reporting Reliability and Agreement Studies (GRRAS) were proposed. J Clin Epidemiol 2011;64:96-106.
- Mokkink LB, Terwee CB, Patrick DL, et al. The COSMIN study reached international consensus on taxonomy, terminology, and definitions of measurement properties for health-related patient-reported outcomes. J Clin Epidemiol 2010;63:737-745.
