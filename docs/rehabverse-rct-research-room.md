# RehabVerse RCT: the design we decided, what is done, what is pending, and the "Research Room"

Written 24 Nov 2026 from (1) the owner's description of the study in Roman Urdu, (2) the Consensus report the owner ran ("Research development and evidence mapping", 8 pages) and (3) a check of the code.
This is a working specification, not a protocol and not ethics paperwork. Nothing here has been approved by an ethics committee.

## 1. The study (as the owner described it)

Two-arm randomised controlled trial on the SAME therapist-led RehabVerse platform. The only difference is the AI layer.

| | Group A: AI-assisted | Group B: same platform, no AI |
| --- | --- | --- |
| History taking | conversational AI helps the patient fill the history; the therapist gets an AI-organised history AND the patient's original words, to catch AI mistakes | the standard history form; the therapist reviews it by hand |
| Programme | therapist prescribes (AI cannot prescribe or change anything) | therapist prescribes |
| Exercise help | direct AI chat to explain the therapist's exercises; camera-based AI monitoring and movement feedback | pre-written instructions and prescriptions the patient reads |
| Daily feedback | AI chat clarifies and organises it into a structured report | a pre-structured manual feedback form |
| Same in both | 3D demonstrations, red-flag alerts, English and Roman Urdu, daily feedback, outcome measures, the therapist releases each next day | |

Allocation must be **systematic randomisation, not the therapist's choice**.

Intended flow: patient creates an account → the therapist is notified and approves → at that moment the AI / no-AI decision is made → the patient is notified → the patient fills the history → the therapist sees it → Day 1 programme → daily feedback and outcome measures → the therapist releases the next day, for both arms.

## 2. What the Consensus report says (and what to check before relying on it)

* The comparison "AI vs non-AI on the same platform, therapist held constant" looks like a real but **narrow** gap: the report found no randomised trial of exactly this, and the closest trials compared AI with video-only guidance, therapist-supervised care or offline exercise. Recommended framing: a **mechanistic isolation study** ("does the AI layer add value on top of therapist-led telerehabilitation?"), **no superiority claim**. Recommended title: *"AI-Assisted Versus Non-AI Telerehabilitation on the Same Therapist-Led Platform: A Two-Arm Randomized Controlled Trial."*
* Population with the strongest signals and validated outcomes: musculoskeletal, especially **chronic low back pain**. Primary outcome pain (NPRS/VAS) and/or disability (ODI or RMDQ); follow-up 8 to 12 weeks at least, ideally beyond 3 months.
* The method imperatives it lists: **arm-symmetric, objective adherence capture** (the most cited failure in this literature is objective telemetry in the AI arm against self-report in the control arm); **assessor blinding and dose matching**; a **pre-specified superiority or non-inferiority margin with confidence intervals**; **intention-to-treat** analysis with a model for repeated measures (GEE or mixed); AI-specific reporting standards; define and report the AI components explicitly; consider several centres.
* It gives no sample-size numbers: you must choose the primary outcome, the difference worth detecting, the standard deviation, power and alpha.
* **Caution.** I have not verified any of its references or DOIs. "No papers found" in a search engine is not proof that no trial exists: before claiming a gap, search PubMed, Embase, Cochrane, PEDro and the trial registers (ClinicalTrials.gov, ISRCTN, CTRI, ANZCTR) yourself. Several cited papers are marked 2026.

## 3. Done and pending, step by step

| Step in the owner's flow | Status | Notes |
| --- | --- | --- |
| Account request, therapist notified, therapist approves | **Done** | pending / active / rejected / archived accounts; no e-mail confirmation; the clinic approves |
| AI or no AI decided at approval, **by randomisation** | **Pending (the core gap)** | Today a therapist switches AI on by hand per patient (the "AI on" chip). Nothing in the schema allocates. The screening "study arm" is a clinic-wide setting, not per-patient randomisation |
| Patient told of the decision | **Pending (needs ethics wording)** | what a participant is told about the study and the arms is a consent decision |
| History: standard form (Group B) | **Done** | |
| History: AI conversation, then the patient checks and submits (Group A) | **Done** | the AI drafts; the patient submits |
| Therapist sees the AI-organised history AND the original words | **Done** | the history brief, the AI conversation transcript, and "what the patient changed after the chat" |
| Therapist formally scores whether the AI made mistakes | **Pending** | would be a new outcome: omissions, errors, invented details per intake |
| Day 1 programme from the therapist; 3D demonstrations; red-flag alerts in both arms | **Done** | the AI switch gates only the AI features |
| AI chat for exercises (A) / pre-written instructions (B) | **Done** | |
| Camera AI monitoring (A) | **Done and live** | 27 neck and back exercises, only for patients with AI on; accuracy validation study pending ethics |
| Daily feedback in both arms; AI check-in organises it for A, manual form for B; next day released by the therapist | **Done** | |
| Outcome measures in both arms | **Done for NPRS, PSFS, GROC and therapist tests** | RMDQ-24 and STarT Back wording must be compared with the official copies; NDI needs the author's permission; ODI needs a licence |
| English and Roman Urdu in both arms | **Done** | Roman Urdu is a help, not a validated translation |
| **Symmetric, objective adherence capture** | **Pending (important)** | Group B's adherence is self-report only (all / some / none and ticks); Group A also has camera records and chat logs. Needs identical server-side logging in both arms |
| Blinded outcome assessor | **Pending** | the therapist sees the arm everywhere; no assessor view hides it |
| Allocation concealment, stratification, eligibility, consent evidence, screening log | **Pending** | |
| Primary outcome, margin, sample size, analysis plan, registration, ethics approval | **Pending (your decisions)** | |
| Intention-to-treat dataset | **Pending** | the research export keeps only active, consented patients, so dropouts vanish |
| Serious adverse event reporting for a trial | **Pending** | events have severity only; no seriousness, relatedness, expectedness, outcome or dates, no reporting deadlines, no monitoring committee |
| Follow-up reminders identical in both arms | **Pending** | |
| Trial monitoring: CONSORT flow, recruitment, balance, deviations | **Pending** | |

## 4. Decisions only the owner can make

1. **Population**: one condition (the report suggests chronic non-specific low back pain; the camera covers 12 lumbar exercises) and the eligibility criteria.
2. **Primary outcome and time point**: for example RMDQ-24 or ODI (disability) or NPRS (pain) at 12 weeks. RMDQ needs only a wording check; ODI needs a Mapi licence.
3. **Hypothesis type and margin**: superiority, or non-inferiority with a margin fixed in advance and its source.
4. **Sample size inputs**: the difference worth detecting, the standard deviation, power, alpha, expected dropout. These must come from the chosen outcome's literature.
5. **Who randomises and who assesses**: an independent statistician for the sequence; who is the blinded outcome assessor.
6. **Allocation design**: ratio, strata (for example baseline pain band, age band, therapist), block sizes.
7. **Follow-up**: 12 weeks, and whether to follow beyond 3 months.
8. **Ethics committee, registry, funding and conflicts of interest**, and what participants are told.
9. **Roman Urdu**: validate the instruments, or use English wording for the primary outcome.
10. **The AI layer is a bundle** (history chat, exercise chat, check-in chat, camera). Decide whether the trial tests the bundle (simplest, honest) and report each component's use.

## 5. The Research Room (proposed)

One admin area, **/admin/research**, where everything needed to run and report the trial lives. Everything below that writes data needs a database migration and the owner's approval first.

1. **Study set-up and registry**: title, version, eligibility, ethics number and date, registration number, outcomes and time points, and the frozen analysis plan (with a hash).
2. **Enrolment**: eligibility checklist, screening log with reasons for exclusion, consent version and evidence (who, when, how), baseline captured before allocation.
3. **Randomisation service**: central, concealed, stratified permuted blocks; the sequence comes from an independent statistician; therapists never see it; the result switches the AI flag automatically; any override needs a logged reason; allocation log is append-only.
4. **Symmetric measurement**: identical server-side engagement and adherence events in both arms (day opened, exercise played, completed, time on task), identical reminders, identical outcome forms (never collected through the AI chat).
5. **Blinded assessor mode**: a view with no arm information for therapist-measured outcomes.
6. **AI accuracy review**: the therapist records omissions, errors and invented details for each AI-organised history, plus time spent reviewing (a workload outcome, logged the same way in both arms).
7. **Safety**: serious-adverse-event fields and timeline, stopping rules, a monitoring-committee report.
8. **Monitoring dashboard**: CONSORT flow counts, recruitment against target, retention, balance by arm and stratum, protocol deviations.
9. **Analysis-ready export**: intention-to-treat long format with timing from randomisation, arm shown as masked codes to the analyst, a data dictionary, a frozen dataset with a hash, and CONSORT-AI and SPIRIT-AI checklists.

Recommended build order: (0) decisions and literature check, no code; (1) enrolment, consent evidence, randomisation driving the AI flag, manual toggle locked in research mode; (2) symmetric measurement, blinded assessor view, AI accuracy review; (3) safety and monitoring; (4) analysis export and reporting.

## 6. Cautions

* The therapist cannot be blinded (they see the AI features). Use a standard script, record time and decisions the same way in both arms, and use a blinded assessor for therapist-measured outcomes.
* Patient-reported outcomes cannot be blinded; say so, and collect them with identical forms.
* Group A also receives extra *content* (chat, camera), so the trial tests the AI layer as a whole, not a single feature.
* Baseline outcomes should be collected through the same static forms in both arms, before the AI intake, so measurement itself is not part of the intervention.

## 7. Phase 1 (built, 2 Dec 2026): enrolment and randomisation

Decisions taken with the owner: the population is kept easy to reach, the **primary outcome is the RMDQ-24**, NPRS is kept, and other fitting outcomes are added (PSFS and GROC are in the default plan; AI-specific and adherence outcomes come in phase 2).

What exists (code and tests; the database migration `20261202120000_rehab_research_room.sql` is **not applied to production until the owner approves it**):

* **/admin/rehabverse/research-room**: study set-up (ethics number and date, registry, consent version, rules, outcome plan), the hidden allocation list, enrolment, flow numbers, allocation and screening logs.
* **Defaults** (all editable while the study is a draft): adults 18 to 65 with non-specific **low back** pain for 4 weeks or more, a smartphone, can read English or Roman Urdu; excluded only for red flags, spinal surgery in the last 6 months, pregnancy. Baseline NPRS of at least 3; two randomisation groups by baseline pain (3 to 5, 6 to 10); 1:1; permuted blocks of 4 and 6. Primary outcome RMDQ-24 at 12 weeks; also NPRS, PSFS, GROC at the standard schedule (start, 2, 6, 12 weeks).
* **Neck pain is off by default** because the RMDQ is a low back questionnaire; add neck pain only with a neck-specific primary measure (NDI needs the author's permission).
* **Randomisation** happens in the same database step as approval: eligibility is judged from the study rules, consent evidence is required, the group comes from the baseline pain score, the arm comes from the next unused row of the prepared list, the patient's AI switch is set from the arm, both arms get the same outcome plan, and the patient is notified. The clinician never chooses the arm and cannot read the list (the screens show only rows left per group).
* **Locked AI switch**: after allocation nothing can change a participant's AI setting except a logged override with a reason, recorded as a departure; the person stays in their allocated arm for the analysis. A database trigger enforces this, so a direct update is refused too.
* **Safe gates**: recruiting cannot start without an ethics number and date, a consent version and a complete list (at least 4 rows per group); recruiting freezes the rules with a SHA-256 fingerprint; the app also refuses to start while an instrument in the plan is not cleared for patients (the **RMDQ-24 wording is still marked "verify wording"** because the official copy at rmdq.org could not be reached from the build environment; compare it by hand, then raise it to ready).
* **Records are append-only**: screening, consent, allocation and departures cannot be edited or deleted.
* Existing patients are untouched. While a study is recruiting, a waiting account is approved by enrolment; someone who is not eligible or who declines is logged and can still be approved as an ordinary clinic patient.

Tests: `npm run validate:research-room` (95 checks), `npm run validate:research-room-db` (132 checks, real migration on Postgres 17, with ten safeguards broken on purpose to prove each test catches it), and a browser run `scripts/rehabverse-local/e2e-research-room.cjs` (24 checks).

Known limits of phase 1: the allocation list should come from an independent statistician (a list generated in the app is marked "placeholder, not independent"); people who never made an account are not in the screening log; a change to the rules after recruiting starts needs a new version (not built); baseline questionnaires are given right after allocation, before any AI intake, and the "questionnaire first" ordering is phase 2; the blinded assessor view, symmetric adherence logging, AI accuracy review, safety (SAE) forms, monitoring and the analysis export are phases 2 to 4.
