# PNA Teacher: FINAL list (67 lessons) and writing tracker

Finalised 26 Nov 2026 by the owner: the ten first picks, all 52 research topics (R1 to R52), and G31 to G35 (popular treatments, honest evidence map).
Nothing here is pushed or deployed. Work is local only (GitHub Actions is blocked by the spending limit).

## Style rules the owner set
* **Medicines lessons must be amazing, not pharma-boring.** Teach through stories and decisions: a patient on a medicine does something surprising (a dizzy stand-up, a dangerous bruise, a heart rate that will not rise), then explain the mechanism in one picture, then what the physio does. One medicine family per lesson beat, no long drug lists, no doses (doses belong to the prescriber); every point ends with an action for the physio.
* All lessons: English plus Roman Urdu, 3+ checks, an analogy, a clinical-application beat, a mistake beat, 4+ flashcards, 2+ sources with search words, stop signs where relevant.
* [!] lessons (S1, S3, S4, S5, S8, S18, S19, G31) need clinician review before publishing; S4 also needs pharmacist review.
* Research lessons use real, citable guidance (reporting guidelines, Cochrane handbook ideas, COSMIN, CONSORT/STROBE/PRISMA and so on) and never invented statistics or numbers; where a threshold is a convention it says so.
* Batches of about 10 lessons; one local branch and commit per batch; build with `npm run build:teacher-data`, validate with `npm run validate:teacher`, regenerate the daily pool, run all workflow validators, run a Worker size dry-run.

## Tracker

| ID | Working title | Area (shelf) | Batch | Status |
|---|---|---|---|---|
| S1 | Scary things that look like MSK pain: serious pathology masquerading (cancer, infection, fracture, vascular, cardiac, visceral) [!] | Clinical Reasoning | 9 | done |
| S2 | Differential duels: shoulder vs neck, hip vs lumbar spine vs SIJ, knee pain referred from hip or spine, chest wall vs cardiac | Clinical Reasoning | 9 | done |
| S3 | Rules every physio should know: Canadian C-spine, NEXUS, Wells (DVT and PE), Ottawa (done), and when each rule fails [!] | Clinical Reasoning | 9 | done |
| S4 | Medicines that change your rehab plan: anticoagulants, beta-blockers, steroid injections, statins, diabetes medicines, painkillers [!] | Medicines & Safety | 9 | done |
| S5 | Clinic emergencies drill: BLS, anaphylaxis, hypoglycaemia, syncope, seizure, choking [!] | Emergency Care | 9 | done |
| S8 | Physiotherapy and daily prayer (salah): safe positions with knee, hip or back pain and after surgery [PK][!] | Culture & Context | 9 | done |
| S12 | Strength training for patients: progressive overload, RPE, reps in reserve, isometrics, how to progress safely | Exercise Prescription | 9 | done |
| S17 | Critical appraisal in 10 minutes, and starting your first research project (links to the Research track R5, R34 to R36) | Research & Evidence | 9 | done |
| S18 | Paediatric orthopaedics: DDH, Perthes and SCFE (the limping child), clubfoot (Ponseti), Duchenne and Gowers, torticollis [PK][!] | Paediatrics | 9 | done |
| S19 | Pelvic floor in men and women, plus diastasis recti and prolapse: what exercise helps [!] | Pelvic Health | 9 | done |
| R1 | Why evidence-based practice: evidence + experience + patient values, and where each fails | Research & Evidence | 10 | done |
| R2 | Why treatments seem to work when they may not: natural history, regression to the mean, placebo and context, confounding | Research & Evidence | 10 | done |
| R3 | From a clinical question to PICO in 5 minutes (why, when, how) | Research & Evidence | 10 | done |
| R4 | Finding evidence fast: PubMed and MeSH, PEDro, Cochrane, Boolean search, a 15-minute search routine | Research & Evidence | 10 | done |
| R5 | Reading a paper efficiently, and spotting spin and hype | Research & Evidence | 10 | done |
| R6 | The hierarchy of evidence, and where it misleads | Research & Evidence | 10 | done |
| R7 | Which design answers which question: a decision map | Research & Evidence | 10 | todo |
| R8 | Randomised trials for therapists: randomisation, concealment, blinding problems in physio, intention-to-treat, pragmatic vs explanatory | Research & Evidence | 10 | todo |
| R9 | Cohort, case-control and cross-sectional studies | Research & Evidence | 10 | todo |
| R10 | Case reports and case series (CARE): writing one properly | Research & Evidence | 10 | todo |
| R11 | Single-case experimental designs and N-of-1 trials in your own clinic | Research & Evidence | 10 | todo |
| R12 | Qualitative research: interviews, focus groups, thematic analysis, rigour | Research & Evidence | 11 | todo |
| R13 | Mixed-methods research | Research & Evidence | 11 | todo |
| R14 | Surveys and questionnaires: design, sampling, response bias | Research & Evidence | 11 | todo |
| R15 | Delphi and consensus methods | Research & Evidence | 11 | todo |
| R16 | Diagnostic accuracy studies (STARD): sensitivity, specificity, likelihood ratios, spectrum bias | Research & Evidence | 11 | todo |
| R17 | Prognostic studies and prediction models | Research & Evidence | 11 | todo |
| R18 | Measurement properties: reliability, validity, responsiveness (COSMIN basics), ICC, kappa, SEM, MDC vs MCID | Research & Evidence | 11 | todo |
| R19 | Clinical audit, service evaluation and quality improvement (PDSA cycles) | Research & Evidence | 11 | todo |
| R20 | Registries and routine outcome data | Research & Evidence | 11 | todo |
| R21 | Implementation science: why good evidence does not reach patients | Research & Evidence | 11 | todo |
| R22 | Effect sizes, confidence intervals and p-values: what they do and do not mean | Research & Evidence | 11 | todo |
| R23 | Absolute vs relative risk, NNT and NNH | Research & Evidence | 12 | todo |
| R24 | Sample size and power: intuition first, calculation second | Research & Evidence | 12 | todo |
| R25 | Choosing a statistical test (t-test, Mann-Whitney, ANOVA, chi-square, correlation, regression), with Jamovi, SPSS or R | Research & Evidence | 12 | todo |
| R26 | Regression basics, confounders and adjustment | Research & Evidence | 12 | todo |
| R27 | Missing data, drop-outs and bias | Research & Evidence | 12 | todo |
| R28 | Subgroups, multiple testing and p-hacking | Research & Evidence | 12 | todo |
| R29 | Bayesian thinking for clinicians | Research & Evidence | 12 | todo |
| R30 | Meta-analysis: forest plots, heterogeneity, publication bias | Research & Evidence | 12 | todo |
| R31 | Systematic and scoping reviews: PRISMA, risk of bias (RoB 2, ROBINS-I), GRADE | Research & Evidence | 12 | todo |
| R32 | Interpreting patient-reported outcomes: floor and ceiling effects, MCID by anchor vs distribution | Research & Evidence | 12 | todo |
| R33 | Honest graphs: data visualisation for therapists | Research & Evidence | 12 | todo |
| R34 | Choosing a research question that matters (FINER) | Research & Evidence | 13 | todo |
| R35 | Writing a research proposal: aims, hypothesis, methods, timeline, budget | Research & Evidence | 13 | todo |
| R36 | Research ethics: Helsinki principles, informed consent, vulnerable groups, data protection, submitting to an ethics committee | Research & Evidence | 13 | todo |
| R37 | Trial registration, pre-registration and open science | Research & Evidence | 13 | todo |
| R38 | Data management: spreadsheets, coding, cleaning, backup | Research & Evidence | 13 | todo |
| R39 | The reporting-guidelines map: CONSORT, STROBE, PRISMA, CARE, STARD, SRQR or COREQ | Research & Evidence | 13 | todo |
| R40 | Describing interventions so others can repeat them (TIDieR) | Research & Evidence | 13 | todo |
| R41 | Writing IMRaD: from abstract to discussion | Research & Evidence | 13 | todo |
| R42 | Choosing a journal, predatory journals, peer review, answering reviewers | Research & Evidence | 13 | todo |
| R43 | Posters and conference talks | Research & Evidence | 13 | todo |
| R44 | Thesis and supervisor management | Research & Evidence | 13 | todo |
| R45 | Research integrity, authorship and misconduct | Research & Evidence | 14 | todo |
| R46 | Clinical practice guidelines: how they are made, AGREE II, using them well | Research & Evidence | 14 | todo |
| R47 | Research in low-resource settings and community-based participatory research [PK] | Research & Evidence | 14 | todo |
| R48 | Health economics for therapists: cost-effectiveness basics | Research & Evidence | 14 | todo |
| R49 | AI in research: literature tools, risks, verifying every claim | Research & Evidence | 14 | todo |
| R50 | Becoming a clinician-researcher: a 12-month plan (small audit, case report, pilot study, publication) | Research & Evidence | 14 | todo |
| R51 | "What the evidence says" myth-busting: posture and pain, core stability, ergonomics, stretching, foam rolling, "alignment" | Research & Evidence | 14 | todo |
| R52 | Judging a physio claim on social media or an advert: 7 red flags | Research & Evidence | 14 | todo |
| G31 | Dry needling: mechanisms, evidence, safety [!] | Treatments & Evidence | 15 | todo |
| G32 | Taping and kinesiology tape | Treatments & Evidence | 15 | todo |
| G33 | Shockwave, laser, TECAR, PEMF | Treatments & Evidence | 15 | todo |
| G34 | Cupping, IASTM, myofascial release: a claims audit | Treatments & Evidence | 15 | todo |
| G35 | Traction: cervical and lumbar evidence | Treatments & Evidence | 15 | todo |

Total: 10 + 52 + 5 = 67 lessons.
