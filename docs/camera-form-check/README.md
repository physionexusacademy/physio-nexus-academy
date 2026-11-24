# RehabVerse Form Check (camera) — design brief and status

Scope (owner's decisions, Nov 2026): every neck and back exercise in the library (cervical 9, thoracic 6, lumbar 12 = 27); levels 0 to 2 only (set-up check, repetition/hold counting, angle estimate with confidence); no video, image or landmark is ever stored; validation with 8 to 10 volunteers; supervised patient pilot of 8 to 10; new cue recordings in English and Roman Urdu; the screens use calm wording (no privacy-fear language).

## How it is built
- `src/lib/formcheck/` is the engine: pure TypeScript (no camera, no model, no DOM), so every rule is tested with plain numbers. `npm run validate:formcheck` runs those tests (a deploy gate).
  - `geometry.ts` works in pixels (never the normalised square), reads angles and distances from landmarks, signs side views by the way the person faces.
  - `filter.ts` One Euro smoothing. `reps.ts` repetition counting with hysteresis, partial repetitions, no repetition invented from missing data, hold timing. `quality.ts` the set-up check (visible, size, centred, light, front or side). `cuelint.ts` the wording rules for every cue (never more range or effort, never over pain, no medical judgement).
- The pose model (MediaPipe Pose Landmarker, Apache-2.0) runs in the browser, loaded only when the camera is opened, from our own static assets (not the worker).
- What the screen shows: the person's own live view with a skeleton and one or two angle arcs, a small 3D demonstration as the target, an angle gauge, repetition and hold counters and a short cue; a "simple view" shows only the skeleton.

## Ethics pack
Documents 00 to 16 in this folder are DRAFTS with `[TO COMPLETE]` fields for the principal investigator: start with `00-READ-ME-FIRST-ethics-pack.md`. They are the protocol (01), participant information and consent (02, 06), the generated camera decisions annex (03), cover letter and lay summary (04), the Part B patient-pilot protocol (05), data management plan (07), statistical analysis plan (08), risk management file (09), forms (10), tool dossier (11), declarations and letters (12), pre-registration summary (13), recruitment materials (14), an optional module for storing landmarks or video (15) and a generated checklist with every field to complete (16). `python3 docs/camera-form-check/tools/build-ethics-pack.py OUTPUT_DIR` regenerates document 16 and builds Word versions and a zip. Numeric angles are shown to patients only for movement types that meet the pre-specified decision rules in section 10.7 of the protocol; until then the tool shows counts, timers and position cues only (or nothing).

## The per-exercise camera decisions
`03-exercise-camera-decisions.md` is generated (`npm run build:formcheck-decisions`) from `src/lib/formcheck/specs-*.ts` and the library's own motion data. For each of the 27 neck and back exercises it records the phone's view, orientation, distance and height, what must be visible, what is counted or timed (hold times are the library's own dosage), how every joint that moves is covered (measured, tracked, or said to be not measurable), the cues and the limits. `npm run validate:formcheck` fails if a moving joint is left out, a metric or landmark is missing, a cue breaks the wording rules, a hold disagrees with the dosage, or the document is out of date. Movement types (`movement-types.ts`) group the measurements that share one validation decision; none is validated until the study says so.

## Status
Done: engine core with tests; ethics pack draft; feasibility; the 27 camera specifications with the coverage check; the browser runtime (pose and face models and the wasm from our own static files, every file checked against `src/lib/formcheck/assets.lock.json`); the patient panel (set-up, the person's own neutral position, live skeleton, gauge, repetition counter or hold timer, cues, summary, a short second check where the spec asks for one); the save of the finished set's numbers; the clinician's list of a patient's camera sets; the camera permission for the patient pages only.

## Where it appears and who sees it
* **Patient:** `/rehabverse/me/day/[id]`, under the exercise player, only when the physiotherapist has switched AI assistance on for that patient, the day is open and the exercise is one of the 27. A card says it is optional; "Try it" opens the panel. The page code, the pose library and the models load only then.
* **Camera permission:** `Permissions-Policy: camera=(self)` is sent only for `/rehabverse/me/*` (`next.config.js`); every other page keeps `camera=()`; the microphone is off everywhere.
* **Saved:** numbers only (repetitions, hold time, share of the time the person was visible, tips given, ranges reached, the engine and model hashes). `src/app/rehabverse/formcheck-actions.ts` checks the AI switch on the server, takes the patient from the signed-in session, rebuilds the record from a whitelist of numeric fields and calls `rehab_formcheck_save_patient_set`, which checks the switch again in the database. A failed save never disturbs the exercise.
* **Clinician:** the patient's record (`/admin/rehabverse/patients/[id]`) lists the camera sets under "Camera form checks". The list stays hidden until the migration is live.
* **Not shown to patients:** any angle. Until a movement type passes its pre-specified rules (protocol section 10.7), patients see counts, timers and position cues only.

## Putting it live (order matters)
1. Apply `supabase/migrations/20261201120000_rehab_formcheck.sql` to the production Supabase project (SQL editor or CLI). It is additive: new `rehab_formcheck_*` tables and functions only.
2. Merge to `cloudflare-deploy`. The deploy fetches and verifies the pose library and the three models (`npm run fetch:formcheck-assets`), runs `validate:formcheck` (engine, specs, sessions, wiring) and `validate:formcheck-db`, builds, and then checks that the model files answer and that the camera policy is right.
3. Switch AI assistance on for one patient (the pilot) and try an exercise on a real phone.
Deploying before step 1 is safe: the camera still works, saving fails quietly ("The numbers could not be saved this time"), and the clinician list stays hidden.

## Not built yet (separate, later increments)
The therapist-only validation mode (assessor's reference value entered before the camera value is revealed; the database functions for it exist), the recorded voice cues in English and Roman Urdu (cues are on-screen text and the browser's own voice when the voice setting is on), the 3D demonstration beside the live view, and the supervised pilot itself. These wait for the ethics committee's decision on the study.
