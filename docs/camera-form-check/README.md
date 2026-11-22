# RehabVerse Form Check (camera) — design brief and status

Scope (owner's decisions, Nov 2026): every neck and back exercise in the library (cervical 9, thoracic 6, lumbar 12 = 27); levels 0 to 2 only (set-up check, repetition/hold counting, angle estimate with confidence); no video, image or landmark is ever stored; validation with 8 to 10 volunteers; supervised patient pilot of 8 to 10; new cue recordings in English and Roman Urdu; the screens use calm wording (no privacy-fear language).

## How it is built
- `src/lib/formcheck/` is the engine: pure TypeScript (no camera, no model, no DOM), so every rule is tested with plain numbers. `npm run validate:formcheck` runs those tests (a deploy gate).
  - `geometry.ts` works in pixels (never the normalised square), reads angles and distances from landmarks, signs side views by the way the person faces.
  - `filter.ts` One Euro smoothing. `reps.ts` repetition counting with hysteresis, partial repetitions, no repetition invented from missing data, hold timing. `quality.ts` the set-up check (visible, size, centred, light, front or side). `cuelint.ts` the wording rules for every cue (never more range or effort, never over pain, no medical judgement).
- The pose model (MediaPipe Pose Landmarker, Apache-2.0) runs in the browser, loaded only when the camera is opened, from our own static assets (not the worker).
- What the screen shows: the person's own live view with a skeleton and one or two angle arcs, a small 3D demonstration as the target, an angle gauge, repetition and hold counters and a short cue; a "simple view" shows only the skeleton.

## Ethics pack
`01-study-protocol.md` (protocol with analysis plan, data management plan, risk register, case report form, checklist) and `02-participant-information-and-consent.md` (English and Roman Urdu) are DRAFTS with `[TO COMPLETE]` fields for the principal investigator. Numeric angles are shown to patients only for movement types that meet the pre-specified decision rules in section 10.7 of the protocol; until then the tool shows counts and timers only (or nothing).

## The per-exercise camera decisions
`03-exercise-camera-decisions.md` is generated (`npm run build:formcheck-decisions`) from `src/lib/formcheck/specs-*.ts` and the library's own motion data. For each of the 27 neck and back exercises it records the phone's view, orientation, distance and height, what must be visible, what is counted or timed (hold times are the library's own dosage), how every joint that moves is covered (measured, tracked, or said to be not measurable), the cues and the limits. `npm run validate:formcheck` fails if a moving joint is left out, a metric or landmark is missing, a cue breaks the wording rules, a hold disagrees with the dosage, or the document is out of date. Movement types (`movement-types.ts`) group the measurements that share one validation decision; none is validated until the study says so.

## Status
Done: engine core with tests (geometry in pixels, side-aware landmarks, face-model head pose, calibration to the person's own neutral position, rep and hold counting, set-up check, wording rules); ethics pack draft; feasibility (the model runs in headless Chromium on CPU); the 27 camera specifications with the coverage check.
Next: the screens (consent line, camera permission, set-up check, live view, summary), the therapist-only validation mode (the assessor's reading is entered before the camera reading is revealed), storage of numbers only, the voice cues, and the supervised pilot.
