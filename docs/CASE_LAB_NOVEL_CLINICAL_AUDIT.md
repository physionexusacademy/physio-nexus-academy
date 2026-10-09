# PNA Case Lab — Content Integrity & Novel Reader Audit
Date: 9 October 2026
Status: Source/data audit and code-level integration. **Not a claim of clinical expert review of every encounter or a verified production deployment.**

## Source inventory
- **509 unique encounter links**: 9 authored case studies, 20 original MSK patient cases, 180 structured MSK variants from 36 conditions, and 300 multidisciplinary variants from 60 clinical templates.
- The 500 practice encounters are **not 500 independent diagnoses or real patient records**.
- Existing eight-part guides support nine authored teaching cases. Other scenarios inherit condition-specific clinical findings/decisions plus specialty-specific educational guidance.
- Five higher-urgency multidisciplinary template families identified: pulmonary vascular presyncope, suspected pulmonary embolism, acute central vestibular concern, metastatic spinal cord compression warning, and unstable ICU mobilization. Other MSK emergency cases remain included.

## Knowledge findings and editorial rules
1. The previous reader relied heavily on numbered notes and repeated generic guidance. The new seven-act story engine builds prose from the original patient, history, examination, decision reasoning and functional goal; clinical notes remain accessible.
2. The source has limited objective measurements and no documented post-treatment responses in most practice encounters. **Do not invent vitals, imaging, additional symptoms, doses, treatment success, dates, personal identities or follow-up outcomes** to make a story exciting.
3. The 180 expanded MSK Arena cases contained some trivial unrelated quiz distractors. Case Lab already replaces those diagnosis options with 36 curated sets of plausible differentials; Arena should receive a separate question-quality audit.
4. The original data sometimes contains third-person patient summaries. Present these as **case history** rather than invented literal patient speech.
5. A list of red flags for screening is not equivalent to an ongoing emergency. Author-specific warning cases and positive safety presentations must be distinguished.
6. In cardio, oncology, vestibular and critical-care encounters, serious safety presentations belong in their home specialty **and** the cross-specialty Red Flags browser.
7. Humor is secondary to clinical accuracy. No novelty quips for suspected emergency, critical care and oncology encounters; avoid making patients objects of jokes.
8. For MSK special tests, readers who need exact performance details should follow the separately maintained MSK Special Tests teaching resource. General case blueprints do not justify inventing hand placement or test positivity.
9. Progressive exercise dosage is individualized to clinical tolerance, medical status and goals; avoid universal numbers absent patient-specific information.
10. Non-featured case variants are still structured teaching simulations, **not individually peer reviewed**. Before marketing the whole library as evidence-verified, the clinical team should review condition-specific examination instructions, exclusions, sources and each safety pathway.

## UI and learning experience
- Preserve MSK Special Tests-style specialty-first browsing, counts, search and regional filters.
- Seven editorial episodes: arrival, interview, examination, competing explanations, intervention or escalation, unobserved follow-up, takeaways.
- Each episode has evidence-preserving narrative prose, a reflective question and an optional clinician insight.
- Paper-like typography, chapter navigation, focus reading, browser-session progress, accessible reveal/summary controls and reduced-motion aware scrolling.
- Keep Case Lab **reading-first**, separate from scored Clinical Challenge Arena.
- Direct Arena → exact Case Lab encounter is shown only after the Stage 4 diagnosis submission; the new tab preserves Arena progress.

## Testing boundaries
Static source checks cover 509 unique IDs, presence of 60 multidisciplinary templates, 36 expanded MSK conditions, seven clinical acts, interview attribution, Red Flags browsing and UI integration. The repository CI includes the Case Lab validator and deployment smoke tests. Actual Node/Next build execution, live interaction, clinical peer review and Cloudflare production deployment require separate verification.
