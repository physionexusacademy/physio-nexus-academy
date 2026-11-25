# PNA Teacher expansion: expert topics with interactive demonstrations

The plan (Nov 2026) is 44 new expert lessons in batches of seven, each with a hands-on widget (a lab you can touch), English and Roman Urdu,
a safety beat, evidence with two PubMed-searchable sources, and four flashcards. A batch ships as: widgets + `.pna` lessons + a learning
path, then `npm run build:teacher-data`, the validators, a browser pass (phone and desktop, both languages), a worker size check, a PR to
`cloudflare-deploy`, and a live check.

## Batch 1: neuro and paediatrics (shipped)

| Lesson | Widget | Area |
| --- | --- | --- |
| `spinal-cord-syndromes-brown-sequard` | `cord-lesion-lab` (tract damage and body map) | Neurology |
| `stroke-syndromes-by-territory` | `stroke-territories` (MCA, ACA, PCA, lateral medulla, lacunar; side of lesion) | Neurology |
| `bppv-dix-hallpike-epley` | `bppv-epley` (crystal moves round the posterior canal) | Neurology |
| `spasticity-tardieu-catch-lab` | `tardieu-catch` (speed against catch; R1, R2, X) | Neurology |
| `developmental-milestones-0-5-years` | `milestone-timeline` (CDC 2022 checkpoints, corrected age) | Paediatrics |
| `primitive-reflexes-postural-reactions` | `primitive-reflexes` (windows by corrected age) | Paediatrics |
| `cerebral-palsy-gmfcs` | `gmfcs-explorer` (levels, age bands, hip risk) | Paediatrics |

Paths: `neuro-rehab-essentials`, `paediatric-physio-foundations`.

## Content rules for these lessons

* Milestones are summarised in our own words from the CDC 2022 checklists; reflex windows are typical teaching values (they differ by a month or two between sources) and the widget says so.
* The GMFCS descriptors are short paraphrases; the widget tells the reader to use the official GMFCS-E&R (CanChild) to classify a real child.
* Hip-displacement rates by GMFCS level come from Soo et al. 2006 (migration percentage over 30%).
* Every lesson names the stop signs (red flags) and never tells the reader to treat what must be referred.

## Next batches (planned)

* MSK, biomechanics and sport: shoulder painful arc, patellofemoral load, McKenzie directional preference, tendinopathy continuum, ACL return-to-sport (limb symmetry), concussion graduated return, windlass, Trendelenburg and cane, STarT Back, motor unit recruitment and force-velocity, ACWR with critical appraisal, running cadence.
* Cardiorespiratory, ward and safety: spirometry, postural drainage, burns rule of nines, frailty and falls, pelvic floor, ECG strip recognition, aquatic buoyancy, clinic emergencies drill.
* Expert thinking: Fagan nomogram and MCID, strength-duration and TENS lab, evidence toolkit, communication role-play, RA vs OA vs gout hand map.
* More neuro and paediatrics: ASIA classifier, cranial nerve lab, nerve injury and Tinel, HINTS, Duchenne and Gowers, DDH, Parkinson cueing, GCS.

The daily question pool (`public/daily-content/pool.json`) is regenerated with `node --experimental-strip-types scripts/build-daily-pool.ts`; do it once after the last batch so a day's questions do not change under learners mid-attempt.
