---
title: "Tool description and safety dossier"
subtitle: "PNA RehabVerse Form Check — version 0.1 DRAFT — what the tool is, what it does, what it cannot do and how it is kept safe"
---

*For the ethics committee and for any later regulatory assessment. It describes the software as built; where a statement depends on something not yet built or measured it says so. Figures about the tests are those at the time of writing.*

# 1. Intended use and claims

**Intended use (study and supervised pilot).** Optional, camera-based exercise guidance for adults doing neck, mid-back or low-back exercises that a physiotherapist has assigned: it counts repetitions, times holds, checks that the person is in a position the camera can judge, and gives short written or spoken cues. For movement types that have passed the pre-specified validation rules it may also show an estimated angle, always with an indication of confidence.

**What it does not do.** It does not diagnose; it does not judge whether a movement is medically correct, safe or abnormal; it does not measure spinal curvature, pelvic tilt or whether deep muscles are working; it does not change or decide the exercise prescription; it does not replace the physiotherapist. These statements are shown to the user.

**Users.** Adult patients and healthy volunteers; physiotherapists (set-up, oversight, the validation mode).

**Use environment.** A phone, tablet or computer with a front or rear camera and a modern browser, in a room with enough light, with the device on a stand or shelf at a stated distance.

# 2. How it works

1. **Camera and model.** After an explicit tap and the browser's permission, the page opens the camera. The **MediaPipe Pose Landmarker** (Apache-2.0 licence) finds 33 body landmarks in each frame; for head turn and nod the **Face Landmarker** (same licence) gives the head's orientation. Both run **in the browser on the user's device**, from model files hosted with the application; the video never leaves the device and is not recorded.
2. **Geometry.** Angles and distances are computed from the landmarks in **pixels** (never in the normalised square, which distorts angles on a wide frame). Side views are signed by the way the person faces. The side nearest the camera is selected by landmark visibility.
3. **Smoothing.** A One Euro filter removes jitter without lagging real movement.
4. **Set-up check.** Before an exercise starts, and while it runs, the tool checks that the needed body parts are visible with enough confidence, that the person is a sensible size and in the middle of the frame, that the light is neither too dark nor washed out, and that the view is the one the exercise needs. It says what to change ("move back a little"); if it cannot judge, it says so and gives **no number**.
5. **The person's own neutral position.** Small movements (a chin tuck, a head lift) are judged against where this person started, taken while they stay still for under a second.
6. **Counting and timing.** A repetition counts only when the movement goes a set fraction of the way to the target **and** comes back (hysteresis); movements too quick to be real are ignored; movements that do not reach the target are shown as "partial", never counted; a gap in tracking drops the repetition in progress rather than inventing one. Holds are timed while the position is held, forgiving brief tracking blips.
7. **Cues.** Short fixed sentences, English and Roman Urdu, tied to a measured condition lasting a minimum time (for example "Keep your shoulders level" when the shoulder line tilts for half a second). No free-text generation, no artificial-intelligence text.
8. **Display.** A live mirrored view with a skeleton, one or two angle arcs (only for validated movement types), counters and the cue; a "simple view" shows only the skeleton.

# 3. The 27 exercises

Each of the 27 neck (9), mid-back (6) and low-back (12) exercises of the library has a camera specification: where the phone goes, what must be visible, what is counted or timed (from the library's own dosage), how **every** joint that moves in the exercise is covered, which cues apply, and what is **not** measurable. The specification is checked against the library's own 3D motion data in the build so that no moving joint can be left out. The full, generated table is document 03. In summary: of 117 joint decisions, 71 are "measured" (a metric reads the joint angle or a direct stand-in), 19 are "tracked" (followed, not read as an angle) and 27 are "not measurable" (for example the far limb in a side view, the toes, forearm rotation, spinal curvature, pelvic tilt, deep muscle activity); in each case the tool says so rather than guess. All thresholds and distances are provisional until the validation study and feasibility trial replace them with measured values.

# 4. Safety by design

| Principle | How it is built |
|---|---|
| Never ask for more | Every cue sentence, in both languages, is tested automatically against banned patterns (more range, deeper, further, push, force, strain, "a bit more", Roman Urdu equivalents). Cues that tell a person to stop or ease off exist; none asks for more |
| Never ride over pain | Banned patterns include "through the pain" and equivalents; "Stop if anything hurts, feels dizzy or tingles" is on every set-up screen and summary |
| No medical judgement | Banned patterns include diagnose, abnormal, damage, injury, slipped disc, "weak back", "bad posture", "your problem" and equivalents |
| Short | A cue is at most 70 characters so it can be said in one breath |
| Refuse rather than guess | If landmarks are missing or the set-up check fails, no number is shown |
| No number before validation | A list of validated movement types is empty by default and enforced by a test; until a type is recorded there as passing the pre-specified rules, only counts, timers and position cues are shown |
| No recording | No video, image, audio or landmark coordinates are stored or sent; the camera is opened only by an explicit tap |
| Physiotherapist in charge | The physiotherapist can switch the feature off per patient; the tool does not change the prescription |

# 5. Known limitations and failure modes

| Limitation | Effect | What the tool does |
|---|---|---|
| One camera sees a 2D picture of a 3D body | Angles are those in the picture plane; movements toward or away from the camera are under-read | The phone is placed in the plane of the movement for each exercise (front, side, feet end, head end); the limitation is stated |
| The pose model was built for upright people | Lying, face-down, end-on and all-fours views are weaker; some may not work | These are marked "to confirm" and tier B: counts, timers and position cues only; a feasibility trial decides whether each is offered at all |
| The spine, pelvis and deep muscles are not landmarks | Spinal curvature, pelvic tilt and muscle activity cannot be measured | Said to the user; stand-ins are named as stand-ins |
| Small movements (a few degrees) | Below the model's resolution | Counted or timed from position; no angle |
| Clothing, head covering, lighting, background, body size | May change landmark accuracy | Recorded as conditions in the validation study; the set-up check refuses poor light; limits reported |
| More than one person in the frame | The model may follow the wrong person | The set-up check expects one person; the user is asked to clear the frame |
| Rotation from a width ratio cannot tell left from right | A turn's size is read, not its direction | The person says which side; used only where the direction is known |
| Old or slow phones | Lag or heat | The model loads only when the camera opens; the tool stops and says so |
| In-app browsers that block the camera | The feature cannot open | The page offers to open in the phone's own browser |

# 6. Verification done so far

- **Engine tests** (`npm run validate:formcheck`): 115 checks of the geometry (pixel angles, signs for left- and right-facing people, near and far side selection, tested side, head pose, differences, distances, rotation from a width ratio), smoothing, repetition counting (noise, partial movements, flicker, dropouts, holds), the calibration to the person's own neutral position, the set-up check and the wording rules; and 1,682 checks that the 27 specifications agree with the library (every moving joint covered, every metric and landmark consistent, every hold equal to the library's dosage, every cue obeying the wording rules, no movement type marked validated, the decisions document current). These run on every deploy.
- **Feasibility:** the pose model was shown to run in a headless browser on a CPU. **Not yet done:** a trial on real phones, a trial of lying and end-on views, and any measurement of accuracy. **No accuracy claim is made.**
- **Accuracy:** to be measured in Part A (document 01) against a blinded reference.

# 7. Software control

Semantic version of the engine; the model files' SHA-256 hashes, the library version and every threshold are recorded before enrolment and stored with every trial; any change after that is a new, separately reported dataset. Releases pass the automated checks above before deployment. [TO COMPLETE: repository tag and hashes at freeze.]

# 8. Third-party components

MediaPipe Tasks Vision (Pose Landmarker and Face Landmarker models and WebAssembly runtime), Apache-2.0, hosted as static files with the application (the application's own server does not run them). [TO COMPLETE: model file names, versions and hashes at freeze.]

# 9. Regulatory statement

In the studies the software is used for exercise guidance and research, not for diagnosis or treatment decisions. Before any wider release, any display of an angle outside a study, or any claim about measurement or outcome, the investigators will determine whether the software is a medical device under the rules that apply in [TO COMPLETE: jurisdiction] and what is required. This dossier does not assume the answer.
