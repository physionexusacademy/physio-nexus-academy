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

## Slow phones (engine formcheck-0.3.1)

Measured first, with the real pose model in headless Chromium (software graphics, so slower than any phone): the full model takes 290 ms a picture (3.4 a second), the lite model 187 ms (5.3 a second), with the face model 432 and 325 ms. The lite model is about 1.5 times faster but its jitter is 1.5 to 2 times larger and its landmarks sit 5 to 30 px from the full model's, so **it is not switched to automatically**: it would trade steadiness for speed. Instead the counter was made to work on few pictures a second.

The weakness: the counter's filters were counted in readings, not time. At 3 pictures a second a median of three readings spans a second and erased a quick repetition; the glitch guard's window of five spanned 1.7 s; a stretch of readings above half-height was measured as n minus 1 gaps, so one or two pictures lasted 0 ms. Before: flowing repetitions lost at 6 pictures a second (0 of 20 exact sets), quick ones at 10, very fast ones at 15, and at 3 to 4 almost everything.

Now the median, the persistence rule, the guard's look-back and the width of a repetition all follow the actual time between pictures (a running average from the first interval measured). On a slow phone one picture past a threshold is enough, the guard steps aside below three readings in its look-back, and a stretch of n pictures counts as n gaps (but at least two pictures above half-height, so one picture of glitch is not a repetition). Exact sets of 20 with 25 true repetitions: discrete, flowing, shallow and one-side-weaker are exact down to 3 pictures a second; quick ones to 6; very fast (about 0.7 s) to 10; a slow phone never over-counts by more than one.

What the person is told (`health.ts`, shown under the gauge): the phone's speed is measured from the video clock (the median of the last twenty gaps, after the model has warmed up). 15 pictures a second or more: nothing. 8 to 14: "counting works; for very quick repetitions take at least N s each". 2.5 to 8: "take at least N s for each repetition so none is missed, and close other apps". Under 2.5: "too slow to follow your repetitions; do your exercise as usual". N is **about seven pictures a repetition and never under 0.7 s**: measured, every style of movement is counted exactly from five pictures, flowing repetitions that do not return to rest need seven, and a repetition must stay above half its height for a quarter of a second. A test checks that repetitions of exactly the advised length are counted at 10, 6, 4 and 3 pictures a second.

## The ghost coach

While a set is running the screen draws a ghost: where the moving part of the person's body has to be for the exercise's measurement to read its target. A dashed light-line figure for the part that moves, a target ring on the part the measurement reads, a dotted link from where that part is to where it should be, and (when the exercise asks for a hold) the ring fills as the hold is kept. An exercise that works either way (a side bend) shows a ghost each way, brightest for the one the person is heading to. It can be switched off with "Hide the target".

How it is made (`ghost.ts`): it is SOLVED with the same `readMetric` the repetition counter uses, on a copy of the person's current pose with the moving part turned (or slid) until the measurement reads the target. So it is never a drawing of what the exercise "should look like": when the body reaches the ghost, the counter reaches the target, by construction. It follows the person if they shift in the picture and is made fresh from every other picture. Which part moves follows from the measurement (a joint angle turns its distal end about the joint; an incline turns the far end about the near one; a shoulder or knee line turns, with what hangs on it, about the hips; a head tilt turns the head about the neck; an offset slides one landmark and what hangs on it; a trunk rotation narrows the shoulders).

Tested for all 27 exercises (`validate-formcheck-ghost.ts`, 394 checks): the ghost pose reads the target on the exercise's own measurement; the right body part moves, as a whole (a wrong end of a joint, or one detached landmark, fails the test); nothing else moves; the ghost follows a shifted person; there is none when the parts it needs cannot be seen; and through a whole session the person's ear lands on the marker when they reach the target.

No ghost for the two exercises measured by the face model's head turn (neck rotation, levator scapulae stretch: a yaw angle has no skeleton equivalent) and for the front plank (a position held steady has no target to move to); they keep the gauge.

## Repetition counting (engine formcheck-0.3.0)

A patient did 25 repetitions and the tool counted 12 or 13; it sometimes missed one side; and it did not notice that the exercise had begun. Each cause was reproduced in a simulation of how people really move (`scripts/formcheck-replab.ts`, 25-repetition sets played into the counter) before anything was changed:

| How the person moves (25 true repetitions) | Old counter | Now |
| --- | --- | --- |
| full range, back to rest each time | 25 | 25 |
| flowing: the next repetition starts before they are back at rest | **0** | 25 |
| shallow: 60% of the target range every time | **0** | 25 (all labelled shallow) |
| one side weaker: every second repetition reaches 55% of the range | **13** | 25 (the 12 shallow ones labelled) |
| every repetition different (range, return, speed) | **median 14** (8 to 17) | 25 median; 98% of repetitions found one by one |
| noisy tracking with glitches | **1 to 8** | 25 |
| about 0.7 s a repetition | 25 | 25 |

Causes: a repetition had to reach 70% of one fixed population target and come back to within 30% of rest; and nothing counted until a "stay still" step had finished, which moving kept restarting.

What the counter does now (`reps.ts`): a repetition is a **peak and a valley, wherever they are**. It counts every deliberate movement of at least a quarter of the way to the target (never less than four times the measured jitter) and reports how many of them were shallower than the full range (`partial` = "shallow"; the database and the server are unchanged). A person counting by eye counts the same way, which is also how the validation study's manual count is made. Safeguards, each with a test that fails without it: a movement must stay above half its own height for 250 ms and two repetitions must be at least 0.5 s apart (a flickering track is not a repetition); a fall or a rise must last two readings (one dip of the noise in the middle of a 5 s hold does not end it); the counter sees the median of its last three readings; a bad burst of readings can never pull the remembered valley more than 2.5 ranges below the top (it heals after one repetition); a gap longer than 1.5 s drops the repetition in progress, and one that resumes at the top is not counted twice.

Starting: if the person starts exercising during the neutral-position step, after 2.5 s the set begins from their first good readings (flagged `forcedStart`) and **the frames of the set-up and of that step are replayed through the counter**, so the first repetitions are not lost. The set-up check forgives a lapse of 0.3 s. The glitch guard's size follows the exercise's own range (a chin tuck is 0.03 of a trunk length). The jitter used by the counter is measured in the neutral position.

Not counted as repetitions (tested): standing still, breathing, a tremor, a restless person, a flickering track. A slow sway of a third of the range every 10 s IS counted (it looks like a slow repetition). Cat-camel's two movements per repetition are rounded, not cut down.

Limits: all of this is the counter's LOGIC against simulated people (and the real pose model on one still person); counting accuracy on real patients is for the validation study (tool count against manual count).

## Accuracy and the alignment screen (engine formcheck-0.2.0)

What changed, why, and what was measured. Everything below the "real model" line was measured on the real pose model on one real person (a stock photo played as a camera feed, with camera-like sensor noise); everything else is a simulation of the tool's logic with faults added on purpose. **None of it is accuracy on patients: that is the validation study.**

| Change | Why | Evidence |
| --- | --- | --- |
| Glitch guard (`guard.ts`, a causal Hampel filter on every measured quantity before smoothing) | a pose model sometimes gets one frame badly wrong (a limb taken for another, left and right swapped); smoothing spread it, and it could count a false repetition or restart the wait | simulation, 60 sets each, ordinary glitches: chin tucks counted exactly 24 -> 58 of 60 (false extra repetitions 36 -> 2); glute bridges 28 -> 60 of 60 (32 -> 0). With clean input nothing changes (60 of 60 either way) |
| Stillness judged by the spread of the readings, not the worst frame (`isStill` in `calibrate.ts`) | on the real model one frame in 150 put a knee angle 4 degrees out, which restarted "stay still" under the old rule | real model; unit tests; the neutral position is taken within 3 s in the simulation |
| The neutral position no longer needs a fixed 8 readings per second | the sandbox runs the real model at 3 pictures a second and the old rule could never finish | real model's own frames replayed: never ready -> ready at 5.6 s; simulation at 3, 5, 8, 15 and 30 pictures a second: ready in time and five of five repetitions counted |
| Frames stamped with the video's own clock (`requestVideoFrameCallback` media time), never processed twice | a busy phone made the time between frames uneven, which unsettles smoothing and repetition timing | by construction; not measured separately |
| Phone-level dial (`browser/level.ts`) | a phone that leans back or sideways skews every angle | by construction; shows only how far from level, never which way (axis signs differ between phones); not tested on a real phone's sensor |

Real model, one still person, 1280 x 720, camera noise: landmark jitter 0.2 to 0.7 pixels (a knee angle varies 0.1 to 0.4 degrees); no glitch larger than 5 pixels in 150 frames. A moving person, a dim room or a cheap phone will be worse; the simulation's faults (`scripts/formcheck-faults.ts`) are set 3 to 10 times above the measured jitter on purpose.

The alignment screen (`alignment.ts`, `AlignmentOverlay.tsx`, `browser/hud.ts`) shows the same judgement as the set-up check in six parts (in view, distance, centred, light, angle, steady) with one score. `assessSetup` stays the only authority on whether a set may start; the screen is display and is tested to agree with it. The HUD follows the site's motion choice (`motionReduced`) and never reads the camera picture back.

`npm run validate:formcheck` now also runs `validate-formcheck-robust.ts` (53 checks: the guard, stillness, the alignment screen, sets with a misbehaving pose model, slow phones). Mutation checks confirmed it fails when the guard is off by default, when the worst-frame rule returns, and when the fixed 8-reading rule returns.

Known limits: the neutral position can still take long when a metric is built from a very short segment (ear to nose) and the jitter is about ten times the measured level (median 24 s in that simulation); the next step is a tolerance that follows the segment's length in pixels. The heavy pose model is more accurate but about 29 MB, over Cloudflare's 25 MiB static-file limit.

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


## Made for everyone: the camera studio and RehabVerse design (Dec 2026)

The camera is now built so that a patient who reads little can use it alone. The engine, the accuracy and the data stored are unchanged; this is the screen and the voice.

* **One huge glowing button** in the day ("Camera se check karein", at least 96px tall, nearly full width) replaces the small card. "Today's session" is now the first and biggest card on the dashboard, in the same look.
* **A full-screen camera studio** that sits above every floating button (the AI coach, WhatsApp and the bottom bar used to cover "Start camera"). The page behind is locked; Escape or the X closes it and stops the camera.
* **Set-up in one screen**: a picture of where the phone goes (2 metres, level with the hips), one instruction in large type, a big "Listen" button, giant Left/Right buttons when the exercise is one-sided, and one 76px start button. The small options (start position again, the target pose, hide the camera picture) are in one "More" sheet with big buttons.
* **Live**: a 76px counter ("5 / 8"), a big red Finish button, one line saying whether the camera can see you, and the site's voice switch.
* **Spoken help, on by default in Roman Urdu** (English for a patient who chose English): the set-up instruction is read when the studio opens; every repetition is counted aloud (never cutting over a longer sentence); a hold is counted every 5 seconds; "Ab shuru karein" at the start and "Shabash! Set mukammal." at the end; tips are spoken as well as shown. It is the site's one voice setting; turning it off anywhere turns it off here.
* **Honest finish**: "Shabash!" only when something was counted; otherwise "Kuch ginti nahi hua" with a plain tip to try again.
* **Roman Urdu from the first screen**: a patient who chose Roman Urdu at sign-up starts in it on any phone (only when that browser has no language choice yet; a choice made on the switch always wins).
* Tests: `npm run validate:camera-design` (44 checks, each safeguard broken on purpose to prove the test catches it) and `scripts/rehabverse-local/e2e-camera-ui.cjs` (16 checks on a 390x844 phone with a fake camera showing a real person: sizes, nothing covering the start button, Roman Urdu text, spoken lines, the finish screen).
* Not yet done: a trial with real low-literacy patients. Please watch two or three people use it alone and note where they hesitate.
