# Camera decisions for the 27 neck and back exercises

*Generated from `src/lib/formcheck/specs-*.ts` and the exercise library's own motion data by `npm run build:formcheck-decisions`. Do not edit by hand: `npm run validate:formcheck` fails when this file is out of date.*

## How to read this

**One decision per exercise.** For each of the 27 neck and back exercises this records where the phone goes (view, orientation, distance, lens height), what the camera must see, what it counts or times, how it covers every joint that moves in the exercise, which cues it gives, and what it cannot do. The check that no moving joint is left out runs in CI: a joint that moves by at least 5 degrees in the exercise's own 3D demonstration must be listed in its spec.

**Views.** *Side*: the person's side to the phone (nodding, bending forwards and backwards, limb angles). *Front*: facing the phone (side bends, turns). *Feet end* / *head end*: the phone on the floor beyond the feet or the head of a person lying down, looking along the body; a turn of the trunk about its long axis then shows as the shoulder line (or the knee line) turning in the picture, which is the clearest way to see it.

**Tier A / tier B.** Tier A: the person sits or stands, the view the pose model was built for. Tier B: lying, face down, on the side or on all fours: counts, timers and position cues first; an angle only if validated.

**Feasibility.** *standard*: an upright person, front or side. *to-confirm*: a lying, face-down, end-on or all-fours view. These are design decisions until the feasibility trial shows that the pose model finds the person in that view on real phones; the fall-back for each is written in its Limits line.

**Joint coverage.** *measured*: a metric reads the joint's own angle, or a simple, direct stand-in for it (the stand-in is stated). *tracked*: the movement is followed (a position, a count) but the joint's own angle is not read. *not measurable*: one camera cannot see it; the tool says so rather than guess. A 2D picture of a 3D body measures angles in the picture plane; every angle is shown only after validation (below).

**Everything is provisional.** The targets, bands and thresholds are starting values taken from each exercise's own demonstration and dosage; the validation study and the feasibility trial replace them with measured values. Hold times are the library's own dosage.

## Summary

| # | Exercise | Region | Position | Tier | Phone | Distance m | Lens cm | Face model | Counted by | Moving joints: measured / tracked / not measurable | 2nd pass |
|---|---|---|---|---|---|---|---|---|---|---|---|
| 1 | Chin tuck (neck retraction) (`chin-tuck`) | cervical | Sitting | A | side, portrait | 1 to 1.6 | 90 to 120 | optional | reps: ear_fwd | 1 / 1 / 0 |  |
| 2 | Neck rotation (active range) (`neck-rotation`) | cervical | Sitting | A | front, portrait | 1 to 1.6 | 90 to 120 | required | reps: yaw | 1 / 0 / 0 |  |
| 3 | Neck side bend (`neck-side-bend`) | cervical | Sitting | A | front, portrait | 1 to 1.6 | 90 to 120 | optional | reps: head_tilt | 1 / 0 / 0 |  |
| 4 | Upper trapezius stretch (`upper-trapezius-stretch`) | cervical | Sitting, one side at a time | A | front, portrait | 1 to 1.6 | 90 to 120 | optional | timer (reach): head_tilt | 1 / 2 / 1 |  |
| 5 | Craniocervical flexion (supine nod) (`supine-nod`) | cervical | Lying on the back | B | side, landscape | 1.8 to 2.8 | 30 to 60 | no | reps: nod_line | 1 / 0 / 0 |  |
| 6 | Chin tuck with head lift (`chin-tuck-head-lift`) | cervical | Lying on the back | B | side, landscape | 1.8 to 2.8 | 30 to 60 | no | reps: head_rise | 2 / 0 / 0 |  |
| 7 | Shoulder blade squeeze (`shoulder-blade-squeeze`) | cervical | Sitting | A | side, portrait | 1 to 1.6 | 90 to 120 | no | reps: shoulder_fwd | 1 / 2 / 0 | front |
| 8 | Levator scapulae stretch (`levator-scapulae-stretch`) | cervical | Sitting, one side at a time | A | front, portrait | 1 to 1.6 | 90 to 120 | required | timer (reach): yaw | 3 / 1 / 1 |  |
| 9 | Scalene stretch (`scalene-stretch`) | cervical | Sitting, one side at a time | A | front, portrait | 1 to 1.6 | 90 to 120 | optional | timer (reach): head_tilt | 2 / 2 / 1 |  |
| 10 | Open book (side-lying rotation) (`open-book`) | thoracic | Lying on the side, one side at a time | B | head end, landscape | 1.5 to 2.5 | 30 to 50 | no | reps: shoulder_turn | 2 / 0 / 1 |  |
| 11 | Seated thoracic rotation (`seated-thoracic-rotation`) | thoracic | Sitting, one side at a time | A | front, portrait | 1 to 1.6 | 90 to 120 | no | reps: trunk_turn | 2 / 0 / 0 |  |
| 12 | Thoracic extension over a chair (`thoracic-extension-chair`) | thoracic | Sitting | A | side, portrait | 1 to 1.6 | 90 to 120 | optional | reps: trunk_lean | 1 / 0 / 0 |  |
| 13 | Cat–camel (spinal mobility) (`cat-camel`) | thoracic | On hands and knees | B | side, landscape | 1.8 to 2.8 | 30 to 60 | no | reps: head_incline | 4 / 0 / 2 |  |
| 14 | Quadruped thoracic rotation (`quadruped-thoracic-rotation`) | thoracic | On hands and knees, one side at a time | B | front, landscape | 1.5 to 2.5 | 30 to 50 | no | reps: shoulder_turn | 2 / 2 / 1 |  |
| 15 | Prone chest lift (thoracic extension) (`prone-thoracic-extension`) | thoracic | Lying face down or in a plank | B | side, landscape | 1.8 to 2.8 | 30 to 60 | no | reps: trunk_lift | 2 / 0 / 1 |  |
| 16 | Single knee to chest (`knee-to-chest`) | lumbar | Lying on the back, one side at a time | B | side, landscape | 1.8 to 2.8 | 30 to 60 | no | reps: hip_angle | 4 / 0 / 0 |  |
| 17 | Lumbar rotation (knee rock) (`knee-rock`) | lumbar | Lying on the back, one side at a time | B | feet end, landscape | 1.5 to 2.5 | 30 to 50 | no | reps: knee_tilt | 3 / 0 / 2 |  |
| 18 | Glute bridge (`glute-bridge`) | lumbar | Lying on the back | B | side, landscape | 1.8 to 2.8 | 30 to 60 | no | reps: hip_angle | 3 / 3 / 2 | feet end |
| 19 | Single-leg bridge (`single-leg-bridge`) | lumbar | Lying on the back, one side at a time | B | side, landscape | 1.8 to 2.8 | 30 to 60 | no | reps: hip_angle | 3 / 1 / 2 | feet end |
| 20 | Dead bug (`dead-bug`) | lumbar | Lying on the back, one side at a time | B | side, landscape | 1.8 to 2.8 | 30 to 60 | no | reps: leg_hip | 3 / 0 / 0 | side |
| 21 | Bird-dog (`bird-dog`) | lumbar | On hands and knees, one side at a time | B | side, landscape | 1.8 to 2.8 | 30 to 60 | no | reps: leg_hip | 4 / 0 / 2 | feet end |
| 22 | Forearm plank (`front-plank`) | lumbar | Lying face down or in a plank | B | side, landscape | 1.8 to 2.8 | 30 to 60 | no | timer (steady): hip_line | 3 / 1 / 5 |  |
| 23 | Supine marching (core control) (`supine-marching`) | lumbar | Lying on the back, one side at a time | B | side, landscape | 1.8 to 2.8 | 30 to 60 | no | reps: hip_angle | 2 / 0 / 0 | feet end |
| 24 | Curl-up (abdominal control) (`mcgill-curl-up`) | lumbar | Lying on the back, one side at a time | B | side, landscape | 1.8 to 2.8 | 30 to 60 | no | reps: trunk_incline | 2 / 0 / 0 |  |
| 25 | Glute bridge with ball squeeze (`bridge-with-ball`) | lumbar | Lying on the back | B | side, landscape | 1.8 to 2.8 | 30 to 60 | no | reps: hip_angle | 3 / 3 / 2 | feet end |
| 26 | Standing side bend (`standing-side-bend`) | lumbar | Standing, one side at a time | A | front, portrait | 2 to 3 | 90 to 110 | no | reps: trunk_tilt | 3 / 0 / 0 |  |
| 27 | Lying on elbows (gentle back extension) (`prone-on-elbows`) | lumbar | Lying face down or in a plank | B | side, landscape | 1.8 to 2.8 | 30 to 60 | no | timer (reach): trunk_lift | 0 / 0 / 0 |  |

## Movement types and the validation battery

A number is shown to a patient only for a *movement type* that has passed the pre-specified rules of the validation study (protocol section 10.7). Exercises that measure the same type share the decision. The protocol's eight-movement battery covers the types marked below; the others stay at counts, timers and position cues until a later study adds them. **Validated today: none.**

| Movement type | In the battery (no.) | Reference | Exercises that use it (primary or measured joint) |
|---|---|---|---|
| Head over trunk, side view (ear against shoulder) (`head-trunk-sagittal`) | 1 | CROM device, or a digital inclinometer | chin-tuck, shoulder-blade-squeeze |
| Head turn from the face model, front view (`head-yaw`) | 2 | CROM device or goniometer | neck-rotation, levator-scapulae-stretch, scalene-stretch |
| Head nod from the face model, front view (`head-pitch`) | not in the battery | CROM device or inclinometer | levator-scapulae-stretch |
| Head tilt from the face model, front view (`head-roll`) | 3 | CROM device or inclinometer | (only watched or tracked) |
| Head tilt on the shoulder line, front view (ear line against shoulder line) (`head-tilt-front`) | 3 | CROM device or inclinometer | neck-side-bend, upper-trapezius-stretch, levator-scapulae-stretch, scalene-stretch |
| Head nod or lift while lying, side view (ear-to-nose line, head height) (`head-lying-line`) | not in the battery | Digital inclinometer on the forehead, and a ruler for the lift | supine-nod, chin-tuck-head-lift |
| Head against shoulder on all fours, side view (`head-incline-low-side`) | not in the battery | Digital inclinometer | cat-camel |
| Head in line with the trunk while lying, side view (`head-trunk-low-side`) | not in the battery | Digital inclinometer | mcgill-curl-up |
| Nose against the middle of the shoulders, front view (head turn on the trunk) (`nose-on-trunk`) | not in the battery | Goniometer / rotation gauge | seated-thoracic-rotation |
| Shoulder line against the horizontal, front view (`shoulder-level-front`) | not in the battery | Digital inclinometer on the shoulder line | neck-side-bend |
| Trunk rotation from the shoulder (or hip) width ratio, front view of a seated or standing person (`trunk-rotation-width`) | 6 | Goniometer / rotation gauge (exploratory) | neck-rotation, seated-thoracic-rotation, standing-side-bend |
| Trunk rotation seen along its long axis, from the head or feet end (shoulder line, hip against shoulder line) (`trunk-rotation-end-on`) | not in the battery | Digital inclinometer on the shoulder line, supine or side-lying | open-book, quadruped-thoracic-rotation, knee-rock |
| Knee line against the horizontal, from the feet end (`knee-line-end-on`) | not in the battery | Digital inclinometer across the knees | knee-rock |
| Hip line against the horizontal, from the feet end or from behind (`pelvis-level-end-on`) | not in the battery | Digital inclinometer across the iliac crests | single-leg-bridge, bird-dog, supine-marching |
| Gap between the knees against hip width, from the feet end (`knee-gap-end-on`) | not in the battery | Ruler | (only watched or tracked) |
| Arm angle against the horizontal, from the head end (`arm-open-end-on`) | not in the battery | Goniometer | open-book |
| Trunk side bend, front view of a standing person (`trunk-side-bend-front`) | 4 | Digital inclinometer | standing-side-bend |
| Trunk inclination, side view of a seated or standing person (`trunk-incline-side-upright`) | 5 | Digital inclinometer | chin-tuck, shoulder-blade-squeeze, thoracic-extension-chair |
| Trunk inclination while lying, prone or on all fours, side view from a low phone (`trunk-incline-low-side`) | not in the battery | Digital inclinometer on the sternum | cat-camel, prone-thoracic-extension, bird-dog, mcgill-curl-up, prone-on-elbows |
| Limb joint angle, front view of a standing person (`limb-joint-front-upright`) | not in the battery | Goniometer | standing-side-bend |
| Limb joint angle, side view of a seated person (`limb-joint-upright-side`) | not in the battery | Goniometer | shoulder-blade-squeeze |
| Limb joint angle while lying, side view from a low phone (`limb-joint-lying-side`) | 7 | Goniometer | prone-thoracic-extension, knee-to-chest, glute-bridge, single-leg-bridge, dead-bug, supine-marching, bridge-with-ball, prone-on-elbows |
| Limb joint angle on all fours or in a plank, side view from a low phone (`limb-joint-quadruped-side`) | 8 | Goniometer and a level | cat-camel, bird-dog, front-plank |
| Limb joint angle on all fours, front view from a low phone (`limb-joint-quadruped-front`) | not in the battery | Goniometer | quadruped-thoracic-rotation |
| Elbow height above the shoulder on all fours, front view (`elbow-height-quadruped-front`) | not in the battery | Ruler | (only watched or tracked) |
| Hip against the shoulder-to-ankle line, side view of a plank (`body-line-side`) | not in the battery | Digital inclinometer and a ruler | front-plank |
| Ear-to-nose line while lying, side view (`head-line-lying`) | not in the battery | Digital inclinometer on the forehead | (only watched or tracked) |

## What one camera cannot see, across all 27

- Pelvic tilt about the horizontal axis cannot be seen in a picture; the hip angle includes it, it is not separated. — 3 cases: glute-bridge (pelvis flex); single-leg-bridge (pelvis flex); bridge-with-ball (pelvis flex)
- The far arm is hidden behind the near one; it rests on the mat and is assumed to match. — 3 cases: glute-bridge (shoulder:o flex); single-leg-bridge (shoulder:o flex); bridge-with-ball (shoulder:o flex)
- The elbow bends in the direction pointing away from a front camera. — 2 cases: levator-scapulae-stretch (elbow flex); scalene-stretch (elbow flex)
- About 10 degrees of rotation of the thigh; it is below what a picture of the knees shows. — 2 cases: knee-rock (hip rot); knee-rock (hip:o rot)
- The toes are too small to read; only the foot index point exists. — 2 cases: front-plank (toe flex); front-plank (toe:o flex)
- The elbow bends in the direction pointing away from a front camera; it cannot be read from the front. — 1 case: upper-trapezius-stretch (elbow flex)
- The point of the exercise, the deep neck flexor muscles working, is not visible in a picture, and the head must not lift (that is the next exercise). — 1 case: supine-nod (neck flex)
- The head turns to follow the hand, seen from above and behind; the face model cannot read it. The count follows the shoulder line. — 1 case: open-book (neck:t rot)
- The far arm is hidden behind the near one in a side view; it is assumed to move like the near arm and is never measured. — 1 case: cat-camel (shoulder:o flex)
- The far leg is hidden behind the near one in a side view; it is assumed to move like the near leg and is never measured. — 1 case: cat-camel (hip:o flex)
- The wrist with the hand behind the head is too small and turned away to read. — 1 case: quadruped-thoracic-rotation (wrist:o flex)
- The far arm is hidden behind the near one in a side view; it is assumed to move like the near arm. — 1 case: prone-thoracic-extension (shoulder:o flex)
- Whether the low back stays resting on the mat is not visible in a picture. — 1 case: knee-to-chest (trunk flex)
- Whether the low back stays flat is the point of the exercise and is not visible in a picture. — 1 case: dead-bug (trunk flex)
- Rotation of the forearm about its own axis is not visible. — 1 case: bird-dog (elbow rot)
- The hand is too small to read. — 1 case: bird-dog (wrist flex)
- The far arm is hidden behind the near one; it is assumed to match. — 1 case: front-plank (shoulder:o flex)
- The far leg is hidden behind the near one; it is assumed to match. — 1 case: front-plank (knee:o flex)
- The far foot is hidden behind the near one. — 1 case: front-plank (ankle:o flex)
- Whether the low back stays still is the point of the exercise and is not visible in a picture. — 1 case: supine-marching (trunk flex)

## Per exercise

### 1. Chin tuck (neck retraction) — `chin-tuck`

*cervical, tier A, sitting, feasibility: standard. The library's own demonstration is shown from the side (standing).*

**Phone.** side view, portrait, 1 to 1.6 m away, lens 90 to 120 cm above the floor, framing: head to hips.

> Stand the phone upright on a shelf or stand about 1.5 metres away, at chest height. Sit with your side to the phone so your head, shoulders and hips are all in view.
> *Phone ko seedha shelf ya stand par taqreeban 1.5 meter door, seene ki unchai par rakhein. Phone ki taraf apna side karke baithein, sar, kandhe aur kulhe sab nazar aayein.*

**Must be visible:** near-side ear, near-side shoulder, near-side hip. Face model: optional.

**Counts or times:** repetitions of `ear_fwd` = how far the near-side ear is ahead of the near-side shoulder, as a fraction of the length near-side shoulder to near-side hip. Zero is the person's own neutral position; the target is the change from it: 0 to -0.03 (a fraction of the stated length), hold 5 s. Library dosage: 2 sets, 10 reps, 5 s hold.

**Metrics**

- `ear_fwd`: how far the near-side ear is ahead of the near-side shoulder, as a fraction of the length near-side shoulder to near-side hip
- `cva`: line from the near-side shoulder to the near-side ear against the vertical, positive towards the way the person faces
- `nod`: head pitch from the face model (size only, either way)
- `trunk_lean`: line from the near-side hip to the near-side shoulder against the vertical, positive towards the way the person faces

**Joints.** Every joint that moves in the demonstration (marked ●) and the joints watched for a compensation (○).

| | Joint | Axes | Coverage | Metric (movement type) | How / why |
|---|---|---|---|---|---|
| ● | neck | flex | measured | `cva` (`head-trunk-sagittal`) | The head glide shows as the ear moving back over the shoulder (side view). The neck's own joint angles are not read: the head and the neck move by about 13 degrees in opposite directions and nearly cancel in a picture. |
| ● | head | flex | tracked | `nod` (`head-pitch`) | A nod (chin dropping) is watched through the face model so the movement stays a glide; its angle is only a watch. |
| ○ | trunk | flex | measured | `trunk_lean` (`trunk-incline-side-upright`) | Leaning the whole body instead of gliding the head back. |

**Cues** (each is checked by the wording rules: never more range or effort, never over pain, no medical judgement)

| Id | When | English | Roman Urdu |
|---|---|---|---|
| `chin-tuck-eyes` | `nod` changes by more than 8 for 600 ms | Keep your eyes level. | Nazar barabar rakhein. |
| `chin-tuck-tall` | `trunk_lean` changes by more than 6 for 600 ms | Sit tall and keep your body still. | Seedhe baithein aur jism ko saakin rakhein. |

**Limits.** The movement is only a few centimetres, so the repetition count and the hold timer are the dependable results; an angle is shown only if this movement passes the validation rules.

*Harkat sirf chand centimetre ki hai, isliye ginti aur hold ka timer qabil-e-aitmaad nateeje hain; angle tab hi dikhaya jata hai jab yeh harkat validation ke usool par poori utre.*

### 2. Neck rotation (active range) — `neck-rotation`

*cervical, tier A, sitting, feasibility: standard. The library's own demonstration is shown from the front (standing).*

**Phone.** front view, portrait, 1 to 1.6 m away, lens 90 to 120 cm above the floor, framing: head to hips.

> Stand the phone upright on a shelf or stand about 1.5 metres away, at chest height. Sit facing the phone so your head, shoulders and hips are all in view.
> *Phone ko seedha shelf ya stand par taqreeban 1.5 meter door, seene ki unchai par rakhein. Phone ke samne baithein, sar, kandhe aur kulhe sab nazar aayein.*

**Must be visible:** nose, left ear, right ear, left shoulder, right shoulder, left hip, right hip. Face model: required.

**Counts or times:** repetitions of `yaw` = head yaw from the face model (size only, either way). Zero is the person's own neutral position; the target is the change from it: 0 to 45 (degrees, either direction). Library dosage: 2 sets, 10 reps.

**Metrics**

- `yaw`: head yaw from the face model (size only, either way)
- `trunk_turn`: turn about the long axis from how much narrower the left shoulder-to-right shoulder width looks than in the person's own neutral position (size only, either way)
- `nose_shift`: how far the nose is ahead of the middle of left shoulder and right shoulder, as a fraction of the length left shoulder to right shoulder (size only, either way)

**Joints.** Every joint that moves in the demonstration (marked ●) and the joints watched for a compensation (○).

| | Joint | Axes | Coverage | Metric (movement type) | How / why |
|---|---|---|---|---|---|
| ● | neck | rot | measured | `yaw` (`head-yaw`) | The face model gives the head's turn against the camera; with the trunk held still this is the neck's rotation. |
| ○ | trunk | rot | measured | `trunk_turn` (`trunk-rotation-width`) | A turning trunk would be counted as neck rotation, so the shoulder line is watched too. |

**Cues** (each is checked by the wording rules: never more range or effort, never over pain, no medical judgement)

| Id | When | English | Roman Urdu |
|---|---|---|---|
| `neck-rotation-head-only` | `trunk_turn` changes by more than 10 for 600 ms | Turn only your head; keep your shoulders still. | Sirf sar ghumayein; kandhe wahin rakhein. |
| `neck-rotation-enough` | `yaw` changes by more than 75 for 300 ms | That is enough. Come back slowly. | Itna kaafi hai. Aahista wapas aayein. |

**Limits.** Needs the face model. If the face model cannot find the face the tool counts turns from the nose position only (no angle).

*Face model chahiye. Agar face model chehra na dhoondh sake to tool sirf naak ki position se turns ginta hai (angle nahi).*

### 3. Neck side bend — `neck-side-bend`

*cervical, tier A, sitting, feasibility: standard. The library's own demonstration is shown from the front (standing).*

**Phone.** front view, portrait, 1 to 1.6 m away, lens 90 to 120 cm above the floor, framing: head to hips.

> Stand the phone upright on a shelf or stand about 1.5 metres away, at chest height. Sit facing the phone so your head, shoulders and hips are all in view.
> *Phone ko seedha shelf ya stand par taqreeban 1.5 meter door, seene ki unchai par rakhein. Phone ke samne baithein, sar, kandhe aur kulhe sab nazar aayein.*

**Must be visible:** left ear, right ear, left shoulder, right shoulder, left hip, right hip. Face model: optional.

**Counts or times:** repetitions of `head_tilt` = line from the left ear to the right ear against the horizontal minus line from the left shoulder to the right shoulder against the horizontal (size only, either way). Zero is the person's own neutral position; the target is the change from it: 0 to 20 (degrees, either direction), hold 5 s. Library dosage: 2 sets, 8 reps, 5 s hold.

**Metrics**

- `head_tilt`: line from the left ear to the right ear against the horizontal minus line from the left shoulder to the right shoulder against the horizontal (size only, either way)
- `shoulder_level`: line from the left shoulder to the right shoulder against the horizontal (size only, either way)
- `roll`: head roll from the face model (size only, either way)

**Joints.** Every joint that moves in the demonstration (marked ●) and the joints watched for a compensation (○).

| | Joint | Axes | Coverage | Metric (movement type) | How / why |
|---|---|---|---|---|---|
| ● | neck | abd | measured | `head_tilt` (`head-tilt-front`) | The line through the two ears against the line through the two shoulders: the head tilted on the trunk, seen from the front (the plane of the movement). |
| ○ | shoulder | elev | measured | `shoulder_level` (`shoulder-level-front`) | A raised shoulder is the usual way a side bend is faked. |

**Cues** (each is checked by the wording rules: never more range or effort, never over pain, no medical judgement)

| Id | When | English | Roman Urdu |
|---|---|---|---|
| `neck-side-bend-level` | `shoulder_level` changes by more than 5 for 500 ms | Keep your shoulders level and relaxed. | Kandhe barabar aur dheele rakhein. |
| `neck-side-bend-enough` | `head_tilt` changes by more than 45 for 300 ms | That is enough. Come back slowly. | Itna kaafi hai. Aahista wapas aayein. |

**Limits.** The ear line is a stand-in for the neck's own angle; the face model's roll is shown as a second opinion when it is on.

*Kaan ki line gardan ke apne angle ka badal hai; face model chalu ho to uska roll doosri raaye ke taur par dikhaya jata hai.*

### 4. Upper trapezius stretch — `upper-trapezius-stretch`

*cervical, tier A, sitting, one side at a time, feasibility: standard. The library's own demonstration is shown from the front (standing).*

**Phone.** front view, portrait, 1 to 1.6 m away, lens 90 to 120 cm above the floor, framing: head to hips.

> Stand the phone upright on a shelf or stand about 1.5 metres away, at chest height. Sit facing the phone so your head, shoulders and hips are all in view.
> *Phone ko seedha shelf ya stand par taqreeban 1.5 meter door, seene ki unchai par rakhein. Phone ke samne baithein, sar, kandhe aur kulhe sab nazar aayein.*

**Must be visible:** left ear, right ear, left shoulder, right shoulder, left hip, right hip. Face model: optional.

**Counts or times:** how long the position is held at or beyond the target of `head_tilt` = line from the left ear to the right ear against the horizontal minus line from the left shoulder to the right shoulder against the horizontal (size only, either way). Zero is the person's own neutral position; the target is the change from it: 0 to 15 (degrees, either direction), hold 30 s. Library dosage: 3 sets, 30 s hold.

**Metrics**

- `head_tilt`: line from the left ear to the right ear against the horizontal minus line from the left shoulder to the right shoulder against the horizontal (size only, either way)
- `shoulder_level`: line from the left shoulder to the right shoulder against the horizontal (size only, either way)
- `nod`: head pitch from the face model (size only, either way)

**Joints.** Every joint that moves in the demonstration (marked ●) and the joints watched for a compensation (○).

| | Joint | Axes | Coverage | Metric (movement type) | How / why |
|---|---|---|---|---|---|
| ● | neck:a | abd | measured | `head_tilt` (`head-tilt-front`) | Head tilted away from the stretched side, seen from the front. |
| ● | neck:a | flex | tracked | `nod` (`head-pitch`) | The forward component (about 12 degrees) is followed through the face model's nod; it is near the limit of what the camera reads. |
| ● | shoulder | flex | tracked | `shoulder_level` (`shoulder-level-front`) | The arm is held behind and low; the front view sees only whether the shoulder stays down, not the arm's own angle. |
| ● | elbow | flex | not measurable |  | The elbow bends in the direction pointing away from a front camera; it cannot be read from the front. |

**Cues** (each is checked by the wording rules: never more range or effort, never over pain, no medical judgement)

| Id | When | English | Roman Urdu |
|---|---|---|---|
| `upper-trapezius-level` | `shoulder_level` changes by more than 5 for 500 ms | Keep your shoulders level and relaxed. | Kandhe barabar aur dheele rakhein. |
| `upper-trapezius-enough` | `head_tilt` changes by more than 45 for 300 ms | That is enough. Come back slowly. | Itna kaafi hai. Aahista wapas aayein. |

**Limits.** Times how long the head stays tilted; the stretch sensation itself, and the arm's position, are not measured.

*Yeh sirf yeh naapta hai ke sar kitni der jhuka raha; stretch ka ehsaas aur bazu ki position nahi naapi jati.*

### 5. Craniocervical flexion (supine nod) — `supine-nod`

*cervical, tier B, lying on the back, feasibility: to-confirm. The library's own demonstration is shown from the side (supine).*

**Phone.** side view, landscape, 1.8 to 2.8 m away, lens 30 to 60 cm above the floor, framing: full body lying.

> Lay the phone on its long side on a low stand or the floor, about 2 metres from the mat and level with your hips, on the side you are exercising. Your whole body should be in view.
> *Phone ko lete hue side par, taqreeban 2 meter door, mat se kulhon ki unchai par, jis taraf exercise kar rahe hon us taraf rakhein. Poora jism nazar aaye.*

**Must be visible:** near-side ear, nose, near-side shoulder, near-side hip.

**Counts or times:** repetitions of `nod_line` = line from the near-side ear to the nose against the horizontal, positive towards the way the person faces (size only, either way). Zero is the person's own neutral position; the target is the change from it: 0 to 8 (degrees, either direction), hold 10 s. Library dosage: 1 sets, 10 reps, 10 s hold.

**Metrics**

- `nod_line`: line from the near-side ear to the nose against the horizontal, positive towards the way the person faces (size only, either way)

**Joints.** Every joint that moves in the demonstration (marked ●) and the joints watched for a compensation (○).

| | Joint | Axes | Coverage | Metric (movement type) | How / why |
|---|---|---|---|---|---|
| ● | head | flex | measured | `nod_line` (`head-lying-line`) | The ear-to-nose line against the horizontal, from the side. The nod is small (about 17 degrees) and the head rests on a pillow, so this is a count and timer first; an angle only if validated. |
| ○ | neck | flex | not measurable |  | The point of the exercise, the deep neck flexor muscles working, is not visible in a picture, and the head must not lift (that is the next exercise). |

**Cues:** none (a count and a timer only).

**Limits.** Counts and times the nod only. It cannot see whether the right muscles are working. If the model cannot find a lying face from the side, the tool offers no count for this exercise.

*Yeh sirf nod ginta aur waqt naapta hai. Yeh nahi dekh sakta ke sahi muscles kaam kar rahe hain ya nahi. Agar model lete hue chehra side se na dhoondh sake to is exercise ki ginti nahi di jaegi.*

### 6. Chin tuck with head lift — `chin-tuck-head-lift`

*cervical, tier B, lying on the back, feasibility: to-confirm. The library's own demonstration is shown from the side (supine).*

**Phone.** side view, landscape, 1.8 to 2.8 m away, lens 30 to 60 cm above the floor, framing: full body lying.

> Lay the phone on its long side on a low stand or the floor, about 2 metres from the mat and level with your hips, on the side you are exercising. Your whole body should be in view.
> *Phone ko lete hue side par, taqreeban 2 meter door, mat se kulhon ki unchai par, jis taraf exercise kar rahe hon us taraf rakhein. Poora jism nazar aaye.*

**Must be visible:** near-side ear, nose, near-side shoulder, near-side hip.

**Counts or times:** repetitions of `head_rise` = how far the near-side ear is above the near-side shoulder, as a fraction of the length near-side shoulder to near-side hip. Zero is the person's own neutral position; the target is the change from it: 0 to 0.05 (a fraction of the stated length), hold 10 s. Library dosage: 2 sets, 6 reps, 10 s hold.

**Metrics**

- `nod_line`: line from the near-side ear to the nose against the horizontal, positive towards the way the person faces (size only, either way)
- `head_rise`: how far the near-side ear is above the near-side shoulder, as a fraction of the length near-side shoulder to near-side hip

**Joints.** Every joint that moves in the demonstration (marked ●) and the joints watched for a compensation (○).

| | Joint | Axes | Coverage | Metric (movement type) | How / why |
|---|---|---|---|---|---|
| ● | head | flex | measured | `nod_line` (`head-lying-line`) | Ear-to-nose line against the horizontal: the chin staying tucked while the head lifts. |
| ● | neck | flex | measured | `head_rise` (`head-lying-line`) | How far the head rises above the shoulders (as a fraction of the trunk length), the visible result of the neck's flexion; the neck's own angle is not read. |

**Cues** (each is checked by the wording rules: never more range or effort, never over pain, no medical judgement)

| Id | When | English | Roman Urdu |
|---|---|---|---|
| `head-lift-enough` | `head_rise` changes by more than 0.15 for 300 ms | That is enough. Come back slowly. | Itna kaafi hai. Aahista wapas aayein. |

**Limits.** Times the lift and counts it; the angle is shown only if validated. If the model cannot find a lying face from the side, the tool offers no count for this exercise.

*Yeh uthne ka waqt aur ginti deta hai; angle tab dikhaya jata hai jab validate ho. Agar model lete hue chehra side se na dhoondh sake to is exercise ki ginti nahi di jaegi.*

### 7. Shoulder blade squeeze — `shoulder-blade-squeeze`

*cervical, tier A, sitting, feasibility: standard. The library's own demonstration is shown from the side (standing).*

**Phone.** side view, portrait, 1 to 1.6 m away, lens 90 to 120 cm above the floor, framing: head to hips.

> Stand the phone upright on a shelf or stand about 1.5 metres away, at chest height. Sit with your side to the phone so your head, shoulders and hips are all in view.
> *Phone ko seedha shelf ya stand par taqreeban 1.5 meter door, seene ki unchai par rakhein. Phone ki taraf apna side karke baithein, sar, kandhe aur kulhe sab nazar aayein.*

**Must be visible:** near-side ear, near-side shoulder, near-side elbow, near-side hip.

**Second pass (front view, portrait, 1 to 1.6 m, lens 90 to 120 cm):** A short second pass facing the phone: both shoulder blades together, and whether the shoulders stay level. Must be visible: left shoulder, right shoulder, left hip, right hip.

**Counts or times:** repetitions of `shoulder_fwd` = how far the near-side shoulder is ahead of the near-side ear, as a fraction of the length near-side shoulder to near-side hip. Zero is the person's own neutral position; the target is the change from it: 0 to -0.04 (a fraction of the stated length), hold 5 s. Library dosage: 3 sets, 10 reps, 5 s hold.

**Metrics**

- `shoulder_fwd`: how far the near-side shoulder is ahead of the near-side ear, as a fraction of the length near-side shoulder to near-side hip
- `arm_angle`: angle at the near-side shoulder between the near-side hip and the near-side elbow
- `trunk_lean`: line from the near-side hip to the near-side shoulder against the vertical, positive towards the way the person faces
- `shoulder_span` (second pass): distance left shoulder to right shoulder, as a fraction of the length middle of left shoulder and right shoulder to middle of left hip and right hip
- `shoulder_level` (second pass): line from the left shoulder to the right shoulder against the horizontal (size only, either way)

**Joints.** Every joint that moves in the demonstration (marked ●) and the joints watched for a compensation (○).

| | Joint | Axes | Coverage | Metric (movement type) | How / why |
|---|---|---|---|---|---|
| ● | shoulder | flex | measured | `arm_angle` (`limb-joint-upright-side`) | The angle between the trunk and the upper arm on the near side. |
| ● | shoulder | abd | tracked | `shoulder_fwd` (`head-trunk-sagittal`) | The blade's retraction shows as the shoulder moving back under the ear; the sideways component (about 6 degrees) is not read. |
| ● | shoulder:o | flex, abd | tracked (2nd pass) | `shoulder_span` | The far shoulder is hidden behind the near one in a side view; the second, front view watches both shoulders together. |
| ○ | trunk | flex | measured | `trunk_lean` (`trunk-incline-side-upright`) | Leaning back instead of squeezing. |

**Cues** (each is checked by the wording rules: never more range or effort, never over pain, no medical judgement)

| Id | When | English | Roman Urdu |
|---|---|---|---|
| `blade-squeeze-tall` | `trunk_lean` changes by more than 6 for 600 ms | Sit tall and keep your body still. | Seedhe baithein aur jism ko saakin rakhein. |
| `blade-squeeze-level` | `shoulder_level` changes by more than 5 for 500 ms (2nd pass) | Keep your shoulders level and relaxed. | Kandhe barabar aur dheele rakhein. |

**Limits.** A squeeze of the shoulder blades is a small movement; the count and hold timer are the dependable results, the shoulder position is shown as a position, and the angle only if validated.

*Shoulder blade squeeze chhoti harkat hai; ginti aur hold timer qabil-e-aitmaad hain, kandhe ki position dikhayi jati hai, aur angle tab jab validate ho.*

### 8. Levator scapulae stretch — `levator-scapulae-stretch`

*cervical, tier A, sitting, one side at a time, feasibility: standard. The library's own demonstration is shown from the front (standing).*

**Phone.** front view, portrait, 1 to 1.6 m away, lens 90 to 120 cm above the floor, framing: head to hips.

> Stand the phone upright on a shelf or stand about 1.5 metres away, at chest height. Sit facing the phone so your head, shoulders and hips are all in view.
> *Phone ko seedha shelf ya stand par taqreeban 1.5 meter door, seene ki unchai par rakhein. Phone ke samne baithein, sar, kandhe aur kulhe sab nazar aayein.*

**Must be visible:** nose, left ear, right ear, left shoulder, right shoulder, left hip, right hip. Face model: required.

**Counts or times:** how long the position is held at or beyond the target of `yaw` = head yaw from the face model (size only, either way). Zero is the person's own neutral position; the target is the change from it: 0 to 30 (degrees, either direction), hold 30 s. Library dosage: 3 sets, 30 s hold.

**Metrics**

- `yaw`: head yaw from the face model (size only, either way)
- `nod`: head pitch from the face model (size only, either way)
- `head_tilt`: line from the left ear to the right ear against the horizontal minus line from the left shoulder to the right shoulder against the horizontal (size only, either way)
- `shoulder_level`: line from the left shoulder to the right shoulder against the horizontal (size only, either way)

**Joints.** Every joint that moves in the demonstration (marked ●) and the joints watched for a compensation (○).

| | Joint | Axes | Coverage | Metric (movement type) | How / why |
|---|---|---|---|---|---|
| ● | neck:a | rot | measured | `yaw` (`head-yaw`) | The face model's turn of the head. |
| ● | neck:a | flex | measured | `nod` (`head-pitch`) | The face model's nod (chin towards the chest), a large movement here (about 38 degrees). |
| ● | neck:a | abd | measured | `head_tilt` (`head-tilt-front`) | A small side tilt (about 8 degrees), seen as the ear line against the shoulder line. |
| ● | shoulder | flex, abd | tracked | `shoulder_level` (`shoulder-level-front`) | The arm is held low and behind; the front view sees only whether the shoulder stays down. |
| ● | elbow | flex | not measurable |  | The elbow bends in the direction pointing away from a front camera. |

**Cues** (each is checked by the wording rules: never more range or effort, never over pain, no medical judgement)

| Id | When | English | Roman Urdu |
|---|---|---|---|
| `levator-level` | `shoulder_level` changes by more than 5 for 500 ms | Keep your shoulders level and relaxed. | Kandhe barabar aur dheele rakhein. |
| `levator-enough` | `nod` changes by more than 60 for 300 ms | That is enough. Come back slowly. | Itna kaafi hai. Aahista wapas aayein. |

**Limits.** Needs the face model. Times how long the head stays turned and bent; the stretch sensation and the arm's position are not measured.

*Face model chahiye. Yeh naapta hai ke sar kitni der ghuma aur jhuka raha; stretch ka ehsaas aur bazu ki position nahi naapi jati.*

### 9. Scalene stretch — `scalene-stretch`

*cervical, tier A, sitting, one side at a time, feasibility: standard. The library's own demonstration is shown from the front (standing).*

**Phone.** front view, portrait, 1 to 1.6 m away, lens 90 to 120 cm above the floor, framing: head to hips.

> Stand the phone upright on a shelf or stand about 1.5 metres away, at chest height. Sit facing the phone so your head, shoulders and hips are all in view.
> *Phone ko seedha shelf ya stand par taqreeban 1.5 meter door, seene ki unchai par rakhein. Phone ke samne baithein, sar, kandhe aur kulhe sab nazar aayein.*

**Must be visible:** left ear, right ear, left shoulder, right shoulder, left hip, right hip. Face model: optional.

**Counts or times:** how long the position is held at or beyond the target of `head_tilt` = line from the left ear to the right ear against the horizontal minus line from the left shoulder to the right shoulder against the horizontal (size only, either way). Zero is the person's own neutral position; the target is the change from it: 0 to 20 (degrees, either direction), hold 30 s. Library dosage: 3 sets, 30 s hold.

**Metrics**

- `head_tilt`: line from the left ear to the right ear against the horizontal minus line from the left shoulder to the right shoulder against the horizontal (size only, either way)
- `shoulder_level`: line from the left shoulder to the right shoulder against the horizontal (size only, either way)
- `yaw`: head yaw from the face model (size only, either way)
- `nod`: head pitch from the face model (size only, either way)

**Joints.** Every joint that moves in the demonstration (marked ●) and the joints watched for a compensation (○).

| | Joint | Axes | Coverage | Metric (movement type) | How / why |
|---|---|---|---|---|---|
| ● | neck:a | abd | measured | `head_tilt` (`head-tilt-front`) | Head tilted away from the stretched side, seen from the front. |
| ● | neck:a | rot | measured | `yaw` (`head-yaw`) | The face model's turn of the head (about 14 degrees). |
| ● | neck:a | flex | tracked | `nod` (`head-pitch`) | About 6 degrees, at the limit of what the camera can read; followed, not trusted. |
| ● | shoulder | flex, abd | tracked | `shoulder_level` (`shoulder-level-front`) | The arm is held low and behind; the front view sees only whether the shoulder stays down. |
| ● | elbow | flex | not measurable |  | The elbow bends in the direction pointing away from a front camera. |

**Cues** (each is checked by the wording rules: never more range or effort, never over pain, no medical judgement)

| Id | When | English | Roman Urdu |
|---|---|---|---|
| `scalene-level` | `shoulder_level` changes by more than 5 for 500 ms | Keep your shoulders level and relaxed. | Kandhe barabar aur dheele rakhein. |
| `scalene-enough` | `head_tilt` changes by more than 45 for 300 ms | That is enough. Come back slowly. | Itna kaafi hai. Aahista wapas aayein. |

**Limits.** Times how long the head stays tilted; the stretch sensation and the arm's position are not measured.

*Yeh naapta hai ke sar kitni der jhuka raha; stretch ka ehsaas aur bazu ki position nahi naapi jati.*

### 10. Open book (side-lying rotation) — `open-book`

*thoracic, tier B, lying on the side, one side at a time, feasibility: to-confirm. The library's own demonstration is shown from the front (sidelying).*

**Phone.** head end view, landscape, 1.5 to 2.5 m away, lens 30 to 50 cm above the floor, framing: shoulders to hands.

> Put the phone on its long side on the floor beyond your head, about 2 metres away and level with your shoulders. Your shoulders and arms should be in view.
> *Phone ko lete hue side par, apne sar ke aage taqreeban 2 meter door, kandhon ki unchai par rakhein. Kandhe aur bazu nazar aayein.*

**Must be visible:** left shoulder, right shoulder, exercised-side shoulder, exercised-side wrist.

**Counts or times:** repetitions of `shoulder_turn` = line from the left shoulder to the right shoulder against the horizontal (size only, either way). Zero is the person's own neutral position; the target is the change from it: 0 to 30 (degrees, either direction), hold 3 s. Library dosage: 2 sets, 10 reps, 3 s hold.

**Metrics**

- `shoulder_turn`: line from the left shoulder to the right shoulder against the horizontal (size only, either way)
- `arm_open`: line from the exercised-side shoulder to the exercised-side wrist against the horizontal (size only, either way)

**Joints.** Every joint that moves in the demonstration (marked ●) and the joints watched for a compensation (○).

| | Joint | Axes | Coverage | Metric (movement type) | How / why |
|---|---|---|---|---|---|
| ● | trunk:t | rot | measured | `shoulder_turn` (`trunk-rotation-end-on`) | Seen from the head end the trunk's turn about its long axis is the shoulder line turning in the picture; it assumes the hips stay where they are (the knees stay stacked). |
| ● | shoulder | abd | measured | `arm_open` (`arm-open-end-on`) | The opening arm's angle against the horizontal, from the head end. |
| ● | neck:t | rot | not measurable |  | The head turns to follow the hand, seen from above and behind; the face model cannot read it. The count follows the shoulder line. |

**Cues** (each is checked by the wording rules: never more range or effort, never over pain, no medical judgement)

| Id | When | English | Roman Urdu |
|---|---|---|---|
| `open-book-enough` | `shoulder_turn` changes by more than 70 for 300 ms | That is enough. Come back slowly. | Itna kaafi hai. Aahista wapas aayein. |

**Limits.** A head-end view of a person lying on their side is the least familiar picture for the pose model. If the model cannot find the shoulders there, the fall-back is a count from the wrist's path seen from the front at floor level, with no angle.

*Karwat par lete hue sar ki taraf se view pose model ke liye sab se kam jaana-pehchana hai. Agar model wahan kandhe na dhoondh sake to fall-back samne se zameen ki unchai par kalai ke raaste se ginti hai, angle ke baghair.*

### 11. Seated thoracic rotation — `seated-thoracic-rotation`

*thoracic, tier A, sitting, one side at a time, feasibility: standard. The library's own demonstration is shown from the front (standing).*

**Phone.** front view, portrait, 1 to 1.6 m away, lens 90 to 120 cm above the floor, framing: head to hips.

> Stand the phone upright on a shelf or stand about 1.5 metres away, at chest height. Sit facing the phone so your head, shoulders and hips are all in view.
> *Phone ko seedha shelf ya stand par taqreeban 1.5 meter door, seene ki unchai par rakhein. Phone ke samne baithein, sar, kandhe aur kulhe sab nazar aayein.*

**Must be visible:** nose, left ear, right ear, left shoulder, right shoulder, left hip, right hip.

**Counts or times:** repetitions of `trunk_turn` = turn about the long axis from how much narrower the left shoulder-to-right shoulder width looks than in the person's own neutral position (size only, either way). Zero is the person's own neutral position; the target is the change from it: 0 to 30 (degrees). Library dosage: 2 sets, 10 reps.

**Metrics**

- `trunk_turn`: turn about the long axis from how much narrower the left shoulder-to-right shoulder width looks than in the person's own neutral position (size only, either way)
- `hip_turn`: turn about the long axis from how much narrower the left hip-to-right hip width looks than in the person's own neutral position (size only, either way)
- `nose_shift`: how far the nose is ahead of the middle of left shoulder and right shoulder, as a fraction of the length middle of left shoulder and right shoulder to middle of left hip and right hip (size only, either way)

**Joints.** Every joint that moves in the demonstration (marked ●) and the joints watched for a compensation (○).

| | Joint | Axes | Coverage | Metric (movement type) | How / why |
|---|---|---|---|---|---|
| ● | trunk:t | rot | measured | `trunk_turn` (`trunk-rotation-width`) | How much narrower the shoulders look than they did in the person's own neutral sitting position (acos of the width ratio). The size of the turn only; the person says which way they turn. |
| ● | neck:t | rot | measured | `nose_shift` (`nose-on-trunk`) | The nose's position against the middle of the shoulders: when the head turns further than the trunk the nose leaves the chest's midline (a stand-in for the head's turn on the trunk; needs no face model). |
| ○ | pelvis | rot | measured | `hip_turn` (`trunk-rotation-width`) | The hips turning with the trunk would make the exercise a hip turn. |

**Cues** (each is checked by the wording rules: never more range or effort, never over pain, no medical judgement)

| Id | When | English | Roman Urdu |
|---|---|---|---|
| `seated-rotation-hips` | `hip_turn` changes by more than 8 for 600 ms | Keep your hips facing the phone. | Kulhe phone ki taraf seedhe rakhein. |
| `seated-rotation-enough` | `trunk_turn` changes by more than 60 for 300 ms | That is enough. Come back slowly. | Itna kaafi hai. Aahista wapas aayein. |

**Limits.** The width-ratio method cannot tell a turn to the left from a turn to the right, so the person says which side; and it is least accurate for small turns.

*Width-ratio tareeqa left aur right ka farq nahi bata sakta, isliye aap side batate hain; aur chhote turns mein yeh kam durust hai.*

### 12. Thoracic extension over a chair — `thoracic-extension-chair`

*thoracic, tier A, sitting, feasibility: standard. The library's own demonstration is shown from the side (standing).*

**Phone.** side view, portrait, 1 to 1.6 m away, lens 90 to 120 cm above the floor, framing: head to hips.

> Stand the phone upright on a shelf or stand about 1.5 metres away, at chest height. Sit with your side to the phone so your head, shoulders and hips are all in view.
> *Phone ko seedha shelf ya stand par taqreeban 1.5 meter door, seene ki unchai par rakhein. Phone ki taraf apna side karke baithein, sar, kandhe aur kulhe sab nazar aayein.*

**Must be visible:** near-side ear, near-side shoulder, near-side hip. Face model: optional.

**Counts or times:** repetitions of `trunk_lean` = line from the near-side hip to the near-side shoulder against the vertical, positive towards the way the person faces. Zero is the person's own neutral position; the target is the change from it: 0 to -10 (degrees), hold 2 s. Library dosage: 2 sets, 10 reps, 2 s hold.

**Metrics**

- `trunk_lean`: line from the near-side hip to the near-side shoulder against the vertical, positive towards the way the person faces
- `nod`: head pitch from the face model (size only, either way)

**Joints.** Every joint that moves in the demonstration (marked ●) and the joints watched for a compensation (○).

| | Joint | Axes | Coverage | Metric (movement type) | How / why |
|---|---|---|---|---|---|
| ● | trunk | flex | measured | `trunk_lean` (`trunk-incline-side-upright`) | The tilt of the whole trunk (hip to shoulder) against the vertical; the chair back is the pivot. The thoracic spine's own curve is not visible to one camera, so this is the trunk's extension, not the thoracic joint angle. |
| ○ | neck | flex | tracked | `nod` (`head-pitch`) | A head dropping back is watched through the face model's nod. |

**Cues** (each is checked by the wording rules: never more range or effort, never over pain, no medical judgement)

| Id | When | English | Roman Urdu |
|---|---|---|---|
| `thoracic-extension-enough` | `trunk_lean` changes by more than 30 for 300 ms | That is enough. Come back slowly. | Itna kaafi hai. Aahista wapas aayein. |

**Limits.** Cannot see the thoracic spine's own curve: it measures how far the whole trunk leans back over the chair.

*Thoracic spine ka apna curve nahi dekh sakta: yeh naapta hai ke poora dhad kursi par kitna peeche jhuka.*

### 13. Cat–camel (spinal mobility) — `cat-camel`

*thoracic, tier B, on hands and knees, feasibility: to-confirm. The library's own demonstration is shown from the side (quadruped).*

**Phone.** side view, landscape, 1.8 to 2.8 m away, lens 30 to 60 cm above the floor, framing: full body.

> Lay the phone on its long side on a low stand or the floor, about 2 metres from the mat and at the height of your back. Your whole body should be in view.
> *Phone ko lete hue side par, taqreeban 2 meter door, apni peeth ki unchai par rakhein. Poora jism nazar aaye.*

**Must be visible:** near-side ear, near-side shoulder, near-side elbow, near-side hip, near-side knee.

**Counts or times:** repetitions of `head_incline` = line from the near-side shoulder to the near-side ear against the horizontal, positive towards the way the person faces. Zero is the person's own neutral position; the target is the change from it: 0 to 15 (degrees, either direction), 2 movements make one repetition. Library dosage: 2 sets, 10 reps.

**Metrics**

- `head_incline`: line from the near-side shoulder to the near-side ear against the horizontal, positive towards the way the person faces
- `trunk_incline`: line from the near-side hip to the near-side shoulder against the horizontal, positive towards the way the person faces
- `hip_angle`: angle at the near-side hip between the near-side shoulder and the near-side knee
- `shoulder_angle`: angle at the near-side shoulder between the near-side hip and the near-side elbow

**Joints.** Every joint that moves in the demonstration (marked ●) and the joints watched for a compensation (○).

| | Joint | Axes | Coverage | Metric (movement type) | How / why |
|---|---|---|---|---|---|
| ● | trunk | flex | measured | `trunk_incline` (`trunk-incline-low-side`) | The tilt of the shoulder-to-hip line. The spine's own curve between those points is not visible to one camera. |
| ● | neck | flex | measured | `head_incline` (`head-incline-low-side`) | The head's rise and fall against the shoulder (side view); also what the repetitions are counted from. |
| ● | shoulder | flex | measured | `shoulder_angle` (`limb-joint-quadruped-side`) | The angle between the trunk and the upper arm on the near side. |
| ● | shoulder:o | flex | not measurable |  | The far arm is hidden behind the near one in a side view; it is assumed to move like the near arm and is never measured. |
| ● | hip | flex | measured | `hip_angle` (`limb-joint-quadruped-side`) | The angle between the trunk and the thigh on the near side. |
| ● | hip:o | flex | not measurable |  | The far leg is hidden behind the near one in a side view; it is assumed to move like the near leg and is never measured. |

**Cues** (each is checked by the wording rules: never more range or effort, never over pain, no medical judgement)

| Id | When | English | Roman Urdu |
|---|---|---|---|
| `cat-camel-enough` | `trunk_incline` changes by more than 40 for 300 ms | That is enough. Come back slowly. | Itna kaafi hai. Aahista wapas aayein. |

**Limits.** One counted repetition is one cat-and-camel cycle (two movements). It cannot see the spine's own curve, only the head, the shoulder-to-hip line and the near limbs. If the model cannot find a person on all fours from the side the tool offers no count for this exercise.

*Ek ginti ek cat-aur-camel cycle (do harkatein) hai. Yeh reerh ka apna curve nahi dekh sakta, sirf sar, kandhe-se-kulhe ki line aur qareeb ke haath-pair. Agar model haath-ghutno par side se insaan na dhoondh sake to is exercise ki ginti nahi di jaegi.*

### 14. Quadruped thoracic rotation — `quadruped-thoracic-rotation`

*thoracic, tier B, on hands and knees, one side at a time, feasibility: to-confirm. The library's own demonstration is shown from the front (quadruped).*

**Phone.** front view, landscape, 1.5 to 2.5 m away, lens 30 to 50 cm above the floor, framing: shoulders to hands.

> Put the phone on its long side on the floor about 2 metres in front of you, level with your shoulders. Your head, shoulders and arms should be in view.
> *Phone ko lete hue side par, apne samne taqreeban 2 meter door, kandhon ki unchai par rakhein. Sar, kandhe aur bazu nazar aayein.*

**Must be visible:** nose, left shoulder, right shoulder, other-side shoulder, other-side elbow, other-side wrist.

**Counts or times:** repetitions of `shoulder_turn` = line from the left shoulder to the right shoulder against the horizontal (size only, either way). Zero is the person's own neutral position; the target is the change from it: 0 to 15 (degrees, either direction), hold 2 s. Library dosage: 2 sets, 8 reps, 2 s hold.

**Metrics**

- `shoulder_turn`: line from the left shoulder to the right shoulder against the horizontal (size only, either way)
- `elbow_up`: how far the other-side elbow is above the other-side shoulder, as a fraction of the length left shoulder to right shoulder
- `elbow_angle`: angle at the other-side elbow between the other-side shoulder and the other-side wrist
- `nose_shift`: how far the nose is ahead of the middle of left shoulder and right shoulder, as a fraction of the length left shoulder to right shoulder (size only, either way)

**Joints.** Every joint that moves in the demonstration (marked ●) and the joints watched for a compensation (○).

| | Joint | Axes | Coverage | Metric (movement type) | How / why |
|---|---|---|---|---|---|
| ● | trunk:t | rot | measured | `shoulder_turn` (`trunk-rotation-end-on`) | Seen from in front at floor level the trunk's turn about its long axis is the shoulder line turning in the picture; it assumes the hips stay where they are. |
| ● | neck:t | rot | tracked | `nose_shift` (`nose-on-trunk`) | The head follows the elbow; its position against the shoulders is followed, the neck's own angle is not read. |
| ● | shoulder:o | flex, abd, rot | tracked | `elbow_up` (`elbow-height-quadruped-front`) | The reaching arm's elbow rising above its shoulder is followed; the shoulder's three separate angles cannot be told apart in one picture. |
| ● | elbow:o | flex | measured | `elbow_angle` (`limb-joint-quadruped-front`) | Shoulder-elbow-wrist angle of the reaching arm; the hand is behind the head, so the forearm is foreshortened (to confirm). |
| ● | wrist:o | flex | not measurable |  | The wrist with the hand behind the head is too small and turned away to read. |

**Cues** (each is checked by the wording rules: never more range or effort, never over pain, no medical judgement)

| Id | When | English | Roman Urdu |
|---|---|---|---|
| `quad-rotation-enough` | `shoulder_turn` changes by more than 50 for 300 ms | That is enough. Come back slowly. | Itna kaafi hai. Aahista wapas aayein. |

**Limits.** If the model cannot find a person on all fours facing the phone at floor level the tool offers no count for this exercise.

*Agar model zameen ki unchai par phone ke samne haath-ghutno par insaan na dhoondh sake to is exercise ki ginti nahi di jaegi.*

### 15. Prone chest lift (thoracic extension) — `prone-thoracic-extension`

*thoracic, tier B, lying face down or in a plank, feasibility: to-confirm. The library's own demonstration is shown from the side (prone).*

**Phone.** side view, landscape, 1.8 to 2.8 m away, lens 30 to 60 cm above the floor, framing: full body lying.

> Lay the phone on its long side on a low stand or the floor, about 2 metres from the mat and level with your hips, on the side you are exercising. Your whole body should be in view.
> *Phone ko lete hue side par, taqreeban 2 meter door, mat se kulhon ki unchai par, jis taraf exercise kar rahe hon us taraf rakhein. Poora jism nazar aaye.*

**Must be visible:** near-side ear, near-side shoulder, near-side elbow, near-side hip.

**Counts or times:** repetitions of `trunk_lift` = line from the near-side hip to the near-side shoulder against the horizontal, positive towards the way the person faces. Zero is the person's own neutral position; the target is the change from it: 0 to 8 (degrees), hold 5 s. Library dosage: 3 sets, 8 reps, 5 s hold.

**Metrics**

- `trunk_lift`: line from the near-side hip to the near-side shoulder against the horizontal, positive towards the way the person faces
- `arm_angle`: angle at the near-side shoulder between the near-side hip and the near-side elbow

**Joints.** Every joint that moves in the demonstration (marked ●) and the joints watched for a compensation (○).

| | Joint | Axes | Coverage | Metric (movement type) | How / why |
|---|---|---|---|---|---|
| ● | trunk | flex | measured | `trunk_lift` (`trunk-incline-low-side`) | The hip-to-shoulder line rising against the horizontal. It includes the lower back's share; the thoracic curve itself is not visible to one camera. |
| ● | shoulder | flex | measured | `arm_angle` (`limb-joint-lying-side`) | The angle between the trunk and the upper arm on the near side. |
| ● | shoulder:o | flex | not measurable |  | The far arm is hidden behind the near one in a side view; it is assumed to move like the near arm. |

**Cues** (each is checked by the wording rules: never more range or effort, never over pain, no medical judgement)

| Id | When | English | Roman Urdu |
|---|---|---|---|
| `prone-extension-enough` | `trunk_lift` changes by more than 35 for 300 ms | That is enough. Come back slowly. | Itna kaafi hai. Aahista wapas aayein. |

**Limits.** Counts and times the chest lift; an angle only if validated. If the model cannot find a person lying face down from the side the tool offers no count for this exercise.

*Chest lift ki ginti aur waqt deta hai; angle tab jab validate ho. Agar model pait ke bal lete insaan ko side se na dhoondh sake to is exercise ki ginti nahi di jaegi.*

### 16. Single knee to chest — `knee-to-chest`

*lumbar, tier B, lying on the back, one side at a time, feasibility: to-confirm. The library's own demonstration is shown from the side (supine).*

**Phone.** side view, landscape, 1.8 to 2.8 m away, lens 30 to 60 cm above the floor, framing: full body lying.

> Lay the phone on its long side on a low stand or the floor, about 2 metres from the mat and level with your hips, on the side you are exercising. Your whole body should be in view.
> *Phone ko lete hue side par, taqreeban 2 meter door, mat se kulhon ki unchai par, jis taraf exercise kar rahe hon us taraf rakhein. Poora jism nazar aaye.*

**Must be visible:** near-side shoulder, near-side hip, near-side knee, near-side ankle, near-side elbow, near-side wrist.

**Counts or times:** repetitions of `hip_angle` = angle at the near-side hip between the near-side shoulder and the near-side knee. Zero is the person's own neutral position; the target is the change from it: 0 to -45 (degrees), hold 20 s. Library dosage: 2 sets, 5 reps, 20 s hold.

**Metrics**

- `hip_angle`: angle at the near-side hip between the near-side shoulder and the near-side knee
- `knee_angle`: angle at the near-side knee between the near-side hip and the near-side ankle
- `shoulder_angle`: angle at the near-side shoulder between the near-side hip and the near-side elbow
- `elbow_angle`: angle at the near-side elbow between the near-side shoulder and the near-side wrist

**Joints.** Every joint that moves in the demonstration (marked ●) and the joints watched for a compensation (○).

| | Joint | Axes | Coverage | Metric (movement type) | How / why |
|---|---|---|---|---|---|
| ● | hip | flex | measured | `hip_angle` (`limb-joint-lying-side`) | The angle between the trunk and the thigh on the working side (the phone is on that side). |
| ● | knee | flex | measured | `knee_angle` (`limb-joint-lying-side`) | Hip-knee-ankle angle of the working leg. |
| ● | shoulder | flex | measured | `shoulder_angle` (`limb-joint-lying-side`) | The angle between the trunk and the upper arm that holds the knee. |
| ● | elbow | flex | measured | `elbow_angle` (`limb-joint-lying-side`) | Shoulder-elbow-wrist angle of the arm holding the knee. |
| ○ | trunk | flex | not measurable |  | Whether the low back stays resting on the mat is not visible in a picture. |

**Cues** (each is checked by the wording rules: never more range or effort, never over pain, no medical judgement)

| Id | When | English | Roman Urdu |
|---|---|---|---|
| `knee-to-chest-enough` | `hip_angle` changes by more than 90 for 300 ms | That is enough. Come back slowly. | Itna kaafi hai. Aahista wapas aayein. |

**Limits.** Measures the limb angles and times the hold. It cannot see the low back flatten or the pelvis tilt.

*Haath-pair ke angle naapta aur hold ka waqt deta hai. Kamar ka chapta hona ya pelvis ka tilt nahi dekh sakta.*

### 17. Lumbar rotation (knee rock) — `knee-rock`

*lumbar, tier B, lying on the back, one side at a time, feasibility: to-confirm. The library's own demonstration is shown from the feet (supine).*

**Phone.** feet end view, landscape, 1.5 to 2.5 m away, lens 30 to 50 cm above the floor, framing: full body lying.

> Put the phone on its long side on the floor beyond your feet, about 2 metres away and level with your knees. Your knees, hips and shoulders should be in view.
> *Phone ko lete hue side par, apne pairon ke aage taqreeban 2 meter door, ghutnon ki unchai par rakhein. Ghutne, kulhe aur kandhe nazar aayein.*

**Must be visible:** left knee, right knee, left hip, right hip, left shoulder, right shoulder.

**Counts or times:** repetitions of `knee_tilt` = line from the left knee to the right knee against the horizontal (size only, either way). Zero is the person's own neutral position; the target is the change from it: 0 to 20 (degrees, either direction). Library dosage: 2 sets, 10 reps.

**Metrics**

- `knee_tilt`: line from the left knee to the right knee against the horizontal (size only, either way)
- `lumbar_twist`: line from the left hip to the right hip against the horizontal minus line from the left shoulder to the right shoulder against the horizontal (size only, either way)
- `shoulder_level`: line from the left shoulder to the right shoulder against the horizontal (size only, either way)

**Joints.** Every joint that moves in the demonstration (marked ●) and the joints watched for a compensation (○).

| | Joint | Axes | Coverage | Metric (movement type) | How / why |
|---|---|---|---|---|---|
| ● | hip | abd | measured | `knee_tilt` (`knee-line-end-on`) | Seen from the feet, the knees falling to one side is the knee line tilting in the picture. |
| ● | hip | rot | not measurable |  | About 10 degrees of rotation of the thigh; it is below what a picture of the knees shows. |
| ● | hip:o | abd | measured | `knee_tilt` (`knee-line-end-on`) | Both knees fall together; the knee line carries both legs. |
| ● | hip:o | rot | not measurable |  | About 10 degrees of rotation of the thigh; it is below what a picture of the knees shows. |
| ● | trunk | rot | measured | `lumbar_twist` (`trunk-rotation-end-on`) | The purpose of the exercise: the hip line turning against the shoulder line. Seen from the feet it is a direct stand-in for the low back's rotation; it assumes the shoulders stay flat. |

**Cues** (each is checked by the wording rules: never more range or effort, never over pain, no medical judgement)

| Id | When | English | Roman Urdu |
|---|---|---|---|
| `knee-rock-shoulders` | `shoulder_level` changes by more than 6 for 600 ms | Keep both shoulders resting on the mat. | Dono kandhe mat par tikay rakhein. |
| `knee-rock-enough` | `knee_tilt` changes by more than 45 for 300 ms | That is enough. Come back slowly. | Itna kaafi hai. Aahista wapas aayein. |

**Limits.** Needs the knees, hips and shoulders to be seen from the feet end; blankets or loose clothes over the hips can hide them, in which case the tool counts from the knees only.

*Pairon ki taraf se ghutne, kulhe aur kandhe nazar aane chahiye; kulhon par kambal ya dheele kapde unhe chhupa sakte hain, us surat mein tool sirf ghutno se ginta hai.*

### 18. Glute bridge — `glute-bridge`

*lumbar, tier B, lying on the back, feasibility: to-confirm. The library's own demonstration is shown from the side (supine).*

**Phone.** side view, landscape, 1.8 to 2.8 m away, lens 30 to 60 cm above the floor, framing: full body lying.

> Lay the phone on its long side on a low stand or the floor, about 2 metres from the mat and level with your hips, on the side you are exercising. Your whole body should be in view.
> *Phone ko lete hue side par, taqreeban 2 meter door, mat se kulhon ki unchai par, jis taraf exercise kar rahe hon us taraf rakhein. Poora jism nazar aaye.*

**Must be visible:** near-side ear, nose, near-side shoulder, near-side elbow, near-side hip, near-side knee, near-side ankle.

**Second pass (feet end view, landscape, 1.5 to 2.5 m, lens 30 to 50 cm):** A short second pass from your feet: do both hips rise together, and do the knees stay apart? Must be visible: left hip, right hip, left knee, right knee.

**Counts or times:** repetitions of `hip_angle` = angle at the near-side hip between the near-side shoulder and the near-side knee. Zero is the person's own neutral position; the target is the change from it: 0 to 30 (degrees), hold 3 s. Library dosage: 3 sets, 10 reps, 3 s hold.

**Metrics**

- `hip_angle`: angle at the near-side hip between the near-side shoulder and the near-side knee
- `knee_angle`: angle at the near-side knee between the near-side hip and the near-side ankle
- `shoulder_angle`: angle at the near-side shoulder between the near-side hip and the near-side elbow
- `head_line`: line from the near-side ear to the nose against the horizontal, positive towards the way the person faces
- `pelvis_level` (second pass): line from the left hip to the right hip against the horizontal (size only, either way)
- `knee_gap` (second pass): distance left knee to right knee, as a fraction of the length left hip to right hip

**Joints.** Every joint that moves in the demonstration (marked ●) and the joints watched for a compensation (○).

| | Joint | Axes | Coverage | Metric (movement type) | How / why |
|---|---|---|---|---|---|
| ● | hip | flex | measured | `hip_angle` (`limb-joint-lying-side`) | The angle between the trunk and the thigh on the near side: the hip rising towards a straight line. |
| ● | knee | flex | measured | `knee_angle` (`limb-joint-lying-side`) | Hip-knee-ankle angle on the near side (a change of about 8 degrees, at the limit of what is read). |
| ● | shoulder | flex | measured | `shoulder_angle` (`limb-joint-lying-side`) | The angle between the trunk and the upper arm resting on the mat. |
| ● | neck | flex | tracked | `head_line` (`head-line-lying`) | The head resting on the mat is followed through the ear-to-nose line; about 12 degrees, not read as an angle. |
| ● | pelvis | flex | not measurable |  | Pelvic tilt about the horizontal axis cannot be seen in a picture; the hip angle includes it, it is not separated. |
| ● | hip:o | flex | tracked (2nd pass) | `pelvis_level` (`pelvis-level-end-on`) | The far hip is hidden behind the near one in a side view; the second pass from the feet shows whether both hips rise together. |
| ● | knee:o | flex | tracked (2nd pass) | `knee_gap` (`knee-gap-end-on`) | The far knee is hidden in a side view; the second pass shows whether the knees stay apart. |
| ● | shoulder:o | flex | not measurable |  | The far arm is hidden behind the near one; it rests on the mat and is assumed to match. |

**Cues** (each is checked by the wording rules: never more range or effort, never over pain, no medical judgement)

| Id | When | English | Roman Urdu |
|---|---|---|---|
| `bridge-hips-level` | `pelvis_level` changes by more than 5 for 500 ms (2nd pass) | Keep your hips level. | Kulhe barabar rakhein. |
| `bridge-knees-apart` | `knee_gap` changes by more than 0.2 for 600 ms (2nd pass) | Keep your knees hip-width apart. | Ghutne kulhon ki chaurai jitne door rakhein. |

**Limits.** Counts the bridge, times the hold and watches the hips and knees; an angle only if validated. It cannot see a tilting pelvis or the lower back arching.

*Bridge ki ginti, hold ka waqt aur kulhon-ghutno ki nigrani; angle tab jab validate ho. Pelvis ka tilt ya kamar ka arch nahi dekh sakta.*

### 19. Single-leg bridge — `single-leg-bridge`

*lumbar, tier B, lying on the back, one side at a time, feasibility: to-confirm. The library's own demonstration is shown from the side (supine).*

**Phone.** side view, landscape, 1.8 to 2.8 m away, lens 30 to 60 cm above the floor, framing: full body lying.

> Lay the phone on its long side on a low stand or the floor, about 2 metres from the mat and level with your hips, on the side you are exercising. Your whole body should be in view.
> *Phone ko lete hue side par, taqreeban 2 meter door, mat se kulhon ki unchai par, jis taraf exercise kar rahe hon us taraf rakhein. Poora jism nazar aaye.*

**Must be visible:** near-side ear, nose, exercised-side shoulder, exercised-side elbow, exercised-side hip, exercised-side knee, exercised-side ankle.

**Second pass (feet end view, landscape, 1.5 to 2.5 m, lens 30 to 50 cm):** A short second pass from your feet: do both hips rise together, and do the knees stay apart? Must be visible: left hip, right hip, left knee, right knee.

**Counts or times:** repetitions of `hip_angle` = angle at the exercised-side hip between the exercised-side shoulder and the exercised-side knee. Zero is the person's own neutral position; the target is the change from it: 0 to 30 (degrees), hold 3 s. Library dosage: 3 sets, 8 reps, 3 s hold.

**Metrics**

- `hip_angle`: angle at the exercised-side hip between the exercised-side shoulder and the exercised-side knee
- `knee_angle`: angle at the exercised-side knee between the exercised-side hip and the exercised-side ankle
- `shoulder_angle`: angle at the exercised-side shoulder between the exercised-side hip and the exercised-side elbow
- `head_line`: line from the near-side ear to the nose against the horizontal, positive towards the way the person faces
- `pelvis_level` (second pass): line from the left hip to the right hip against the horizontal (size only, either way)
- `knee_gap` (second pass): distance left knee to right knee, as a fraction of the length left hip to right hip

**Joints.** Every joint that moves in the demonstration (marked ●) and the joints watched for a compensation (○).

| | Joint | Axes | Coverage | Metric (movement type) | How / why |
|---|---|---|---|---|---|
| ● | hip | flex | measured | `hip_angle` (`limb-joint-lying-side`) | The angle between the trunk and the thigh of the supporting leg (the phone goes on that side). |
| ● | knee | flex | measured | `knee_angle` (`limb-joint-lying-side`) | Hip-knee-ankle angle of the supporting leg (about 8 degrees, at the limit of what is read). |
| ● | shoulder | flex | measured | `shoulder_angle` (`limb-joint-lying-side`) | The angle between the trunk and the upper arm resting on the mat. |
| ● | shoulder:o | flex | not measurable |  | The far arm is hidden behind the near one; it rests on the mat and is assumed to match. |
| ● | neck | flex | tracked | `head_line` (`head-line-lying`) | The head resting on the mat is followed through the ear-to-nose line; about 12 degrees, not read as an angle. |
| ● | pelvis | flex | not measurable |  | Pelvic tilt about the horizontal axis cannot be seen in a picture; the hip angle includes it, it is not separated. |
| ○ | pelvis | drop | measured (2nd pass) | `pelvis_level` (`pelvis-level-end-on`) | A hip dropping on the side of the lifted leg is the commonest fault of this exercise; seen from the feet as the hip line tilting. |

**Cues** (each is checked by the wording rules: never more range or effort, never over pain, no medical judgement)

| Id | When | English | Roman Urdu |
|---|---|---|---|
| `single-bridge-hips-level` | `pelvis_level` changes by more than 5 for 500 ms (2nd pass) | Keep your hips level. | Kulhe barabar rakhein. |

**Limits.** The second pass from the feet matters most here (a dropping hip). It cannot see a tilting pelvis or the lower back arching.

*Yahan pairon ki taraf se doosra round sab se zaroori hai (kulha girna). Pelvis ka tilt ya kamar ka arch nahi dekh sakta.*

### 20. Dead bug — `dead-bug`

*lumbar, tier B, lying on the back, one side at a time, feasibility: to-confirm. The library's own demonstration is shown from the side (supine).*

**Phone.** side view, landscape, 1.8 to 2.8 m away, lens 30 to 60 cm above the floor, framing: full body lying.

> Lay the phone on its long side on a low stand or the floor, about 2 metres from the mat and level with your hips, on the side you are exercising. Your whole body should be in view.
> *Phone ko lete hue side par, taqreeban 2 meter door, mat se kulhon ki unchai par, jis taraf exercise kar rahe hon us taraf rakhein. Poora jism nazar aaye.*

**Must be visible:** other-side shoulder, other-side hip, other-side knee, other-side ankle.

**Second pass (side view, landscape, 1.8 to 2.8 m, lens 30 to 60 cm):** For the next set put the phone on the side of the ARM that reaches, so the arm is seen. Must be visible: exercised-side shoulder, exercised-side elbow, exercised-side hip.

**Counts or times:** repetitions of `leg_hip` = angle at the other-side hip between the other-side shoulder and the other-side knee. Zero is the person's own neutral position; the target is the change from it: 0 to 50 (degrees). Library dosage: 3 sets, 8 reps.

**Metrics**

- `leg_hip`: angle at the other-side hip between the other-side shoulder and the other-side knee
- `leg_knee`: angle at the other-side knee between the other-side hip and the other-side ankle
- `arm_reach` (second pass): angle at the exercised-side shoulder between the exercised-side hip and the exercised-side elbow

**Joints.** Every joint that moves in the demonstration (marked ●) and the joints watched for a compensation (○).

| | Joint | Axes | Coverage | Metric (movement type) | How / why |
|---|---|---|---|---|---|
| ● | hip:o | flex | measured | `leg_hip` (`limb-joint-lying-side`) | The angle between the trunk and the thigh of the leg that lowers (the phone goes on that leg's side). |
| ● | knee:o | flex | measured | `leg_knee` (`limb-joint-lying-side`) | Hip-knee-ankle angle of the leg that lowers. |
| ● | shoulder | flex | measured (2nd pass) | `arm_reach` (`limb-joint-lying-side`) | The arm that reaches overhead is on the far side in this view; the second pass puts the phone on that side. |
| ○ | trunk | flex | not measurable |  | Whether the low back stays flat is the point of the exercise and is not visible in a picture. |

**Cues** (each is checked by the wording rules: never more range or effort, never over pain, no medical judgement)

| Id | When | English | Roman Urdu |
|---|---|---|---|
| `dead-bug-enough` | `leg_hip` changes by more than 100 for 300 ms | That is enough. Come back slowly. | Itna kaafi hai. Aahista wapas aayein. |

**Limits.** The arm and the leg that move are on opposite sides, so one set is seen from the leg's side and the next from the arm's side. It cannot see whether the low back stays flat.

*Haath aur pair jo hilte hain ulte taraf hote hain, isliye ek set pair ki taraf se aur agla set bazu ki taraf se dekha jata hai. Yeh nahi dekh sakta ke kamar chapti rehti hai ya nahi.*

### 21. Bird-dog — `bird-dog`

*lumbar, tier B, on hands and knees, one side at a time, feasibility: to-confirm. The library's own demonstration is shown from the side (quadruped).*

**Phone.** side view, landscape, 1.8 to 2.8 m away, lens 30 to 60 cm above the floor, framing: full body.

> Lay the phone on its long side on a low stand or the floor, about 2 metres from the mat and at the height of your back. Your whole body should be in view.
> *Phone ko lete hue side par, taqreeban 2 meter door, apni peeth ki unchai par rakhein. Poora jism nazar aaye.*

**Must be visible:** exercised-side hip, exercised-side shoulder, exercised-side elbow, other-side shoulder, other-side hip, other-side knee, other-side ankle, other-side foot index.

**Second pass (feet end view, landscape, 1.5 to 2.5 m, lens 30 to 60 cm):** A short second pass from behind: does the pelvis stay level as the leg lifts? Must be visible: left hip, right hip, left shoulder, right shoulder.

**Counts or times:** repetitions of `leg_hip` = angle at the other-side hip between the other-side shoulder and the other-side knee. Zero is the person's own neutral position; the target is the change from it: 0 to 60 (degrees), hold 5 s. Library dosage: 3 sets, 8 reps, 5 s hold.

**Metrics**

- `arm_reach`: angle at the exercised-side shoulder between the exercised-side hip and the exercised-side elbow
- `leg_hip`: angle at the other-side hip between the other-side shoulder and the other-side knee
- `leg_knee`: angle at the other-side knee between the other-side hip and the other-side ankle
- `foot_angle`: angle at the other-side ankle between the other-side knee and the other-side foot index
- `back_level`: line from the exercised-side hip to the exercised-side shoulder against the horizontal, positive towards the way the person faces (size only, either way)
- `pelvis_level` (second pass): line from the left hip to the right hip against the horizontal (size only, either way)
- `shoulder_level` (second pass): line from the left shoulder to the right shoulder against the horizontal (size only, either way)

**Joints.** Every joint that moves in the demonstration (marked ●) and the joints watched for a compensation (○).

| | Joint | Axes | Coverage | Metric (movement type) | How / why |
|---|---|---|---|---|---|
| ● | shoulder | flex | measured | `arm_reach` (`limb-joint-quadruped-side`) | The angle between the trunk and the reaching arm (the arm extends beyond the body, so it is seen even on the far side). |
| ● | elbow | rot | not measurable |  | Rotation of the forearm about its own axis is not visible. |
| ● | wrist | flex | not measurable |  | The hand is too small to read. |
| ● | hip:o | flex | measured | `leg_hip` (`limb-joint-quadruped-side`) | The angle between the trunk and the thigh of the reaching leg: the main result (the counted movement). |
| ● | knee:o | flex | measured | `leg_knee` (`limb-joint-quadruped-side`) | Hip-knee-ankle angle of the reaching leg. |
| ● | ankle:o | flex | measured | `foot_angle` (`limb-joint-quadruped-side`) | Knee-ankle-toe angle of the reaching foot; the foot is small, so low confidence is likely. |
| ○ | trunk | flex | measured | `back_level` (`trunk-incline-low-side`) | A back that stays level (the hip-to-shoulder line against the horizontal). |
| ○ | pelvis | rot | measured (2nd pass) | `pelvis_level` (`pelvis-level-end-on`) | The pelvis turning as the leg lifts, seen from behind as the hip line tilting. |

**Cues** (each is checked by the wording rules: never more range or effort, never over pain, no medical judgement)

| Id | When | English | Roman Urdu |
|---|---|---|---|
| `bird-dog-back` | `back_level` changes by more than 8 for 600 ms | Keep your back level. | Peeth ko barabar rakhein. |
| `bird-dog-hips` | `pelvis_level` changes by more than 6 for 600 ms (2nd pass) | Keep your hips level. | Kulhe barabar rakhein. |

**Limits.** The arm and the leg that reach are on opposite sides but both extend beyond the body, so one side view sees both when the model finds them. If it cannot, the tool counts from the leg only.

*Haath aur pair jo bahar jate hain ulte taraf hote hain lekin dono jism se bahar nikalte hain, isliye ek side view dono dekh leta hai jab model unhe dhoondh le. Warna tool sirf pair se ginta hai.*

### 22. Forearm plank — `front-plank`

*lumbar, tier B, lying face down or in a plank, feasibility: to-confirm. The library's own demonstration is shown from the side (quadruped).*

**Phone.** side view, landscape, 1.8 to 2.8 m away, lens 30 to 60 cm above the floor, framing: full body.

> Lay the phone on its long side on a low stand or the floor, about 2 metres from the mat and at the height of your back. Your whole body should be in view.
> *Phone ko lete hue side par, taqreeban 2 meter door, apni peeth ki unchai par rakhein. Poora jism nazar aaye.*

**Must be visible:** near-side shoulder, near-side elbow, near-side hip, near-side knee, near-side ankle, near-side foot index.

**Counts or times:** how long the position stays within the band of `hip_line` = how far the middle of near-side shoulder and near-side ankle is above the near-side hip, as a fraction of the length near-side shoulder to near-side ankle. Zero is the person's own neutral position; the target is the change from it: band of 0.06 (a fraction of the stated length), hold 20 s. Library dosage: 3 sets, 20 s.

**Metrics**

- `hip_line`: how far the middle of near-side shoulder and near-side ankle is above the near-side hip, as a fraction of the length near-side shoulder to near-side ankle
- `shoulder_angle`: angle at the near-side shoulder between the near-side hip and the near-side elbow
- `knee_angle`: angle at the near-side knee between the near-side hip and the near-side ankle
- `ankle_angle`: angle at the near-side ankle between the near-side knee and the near-side foot index

**Joints.** Every joint that moves in the demonstration (marked ●) and the joints watched for a compensation (○).

| | Joint | Axes | Coverage | Metric (movement type) | How / why |
|---|---|---|---|---|---|
| ● | pelvis | flex | tracked | `hip_line` (`body-line-side`) | A sagging or piking hip shows as the hip leaving the shoulder-to-ankle line; the pelvic tilt itself is not read. |
| ● | shoulder | flex | measured | `shoulder_angle` (`limb-joint-quadruped-side`) | The angle between the trunk and the upper arm on the near side. |
| ● | shoulder:o | flex | not measurable |  | The far arm is hidden behind the near one; it is assumed to match. |
| ● | knee | flex | measured | `knee_angle` (`limb-joint-quadruped-side`) | Hip-knee-ankle angle on the near side: straight legs. |
| ● | knee:o | flex | not measurable |  | The far leg is hidden behind the near one; it is assumed to match. |
| ● | ankle | flex | measured | `ankle_angle` (`limb-joint-quadruped-side`) | Knee-ankle-toe angle on the near side; the foot is small, so low confidence is likely. |
| ● | ankle:o | flex | not measurable |  | The far foot is hidden behind the near one. |
| ● | toe | flex | not measurable |  | The toes are too small to read; only the foot index point exists. |
| ● | toe:o | flex | not measurable |  | The toes are too small to read; only the foot index point exists. |

**Cues** (each is checked by the wording rules: never more range or effort, never over pain, no medical judgement)

| Id | When | English | Roman Urdu |
|---|---|---|---|
| `plank-line` | `hip_line` changes by more than 0.06 for 800 ms | Keep your body in one line. | Jism ek seedhi line mein rakhein. |

**Limits.** Times how long the body stays in its starting line; it cannot see whether the deep abdominal muscles are working.

*Yeh naapta hai ke jism kitni der apni shuru ki line mein raha; yeh nahi dekh sakta ke gehre pait ke muscles kaam kar rahe hain ya nahi.*

### 23. Supine marching (core control) — `supine-marching`

*lumbar, tier B, lying on the back, one side at a time, feasibility: to-confirm. The library's own demonstration is shown from the side (supine).*

**Phone.** side view, landscape, 1.8 to 2.8 m away, lens 30 to 60 cm above the floor, framing: full body lying.

> Lay the phone on its long side on a low stand or the floor, about 2 metres from the mat and level with your hips, on the side you are exercising. Your whole body should be in view.
> *Phone ko lete hue side par, taqreeban 2 meter door, mat se kulhon ki unchai par, jis taraf exercise kar rahe hon us taraf rakhein. Poora jism nazar aaye.*

**Must be visible:** exercised-side shoulder, exercised-side hip, exercised-side knee, exercised-side ankle.

**Second pass (feet end view, landscape, 1.5 to 2.5 m, lens 30 to 50 cm):** A short second pass from your feet: does the pelvis stay level as the leg lifts? Must be visible: left hip, right hip.

**Counts or times:** repetitions of `hip_angle` = angle at the exercised-side hip between the exercised-side shoulder and the exercised-side knee. Zero is the person's own neutral position; the target is the change from it: 0 to -25 (degrees), hold 2 s. Library dosage: 2 sets, 10 reps, 2 s hold.

**Metrics**

- `hip_angle`: angle at the exercised-side hip between the exercised-side shoulder and the exercised-side knee
- `knee_angle`: angle at the exercised-side knee between the exercised-side hip and the exercised-side ankle
- `pelvis_level` (second pass): line from the left hip to the right hip against the horizontal (size only, either way)

**Joints.** Every joint that moves in the demonstration (marked ●) and the joints watched for a compensation (○).

| | Joint | Axes | Coverage | Metric (movement type) | How / why |
|---|---|---|---|---|---|
| ● | hip | flex | measured | `hip_angle` (`limb-joint-lying-side`) | The angle between the trunk and the thigh of the marching leg (the phone goes on that side). |
| ● | knee | flex | measured | `knee_angle` (`limb-joint-lying-side`) | Hip-knee-ankle angle of the marching leg (about 6 degrees, at the limit of what is read). |
| ○ | pelvis | drop | measured (2nd pass) | `pelvis_level` (`pelvis-level-end-on`) | The pelvis staying level as the leg lifts, seen from the feet. |
| ○ | trunk | flex | not measurable |  | Whether the low back stays still is the point of the exercise and is not visible in a picture. |

**Cues** (each is checked by the wording rules: never more range or effort, never over pain, no medical judgement)

| Id | When | English | Roman Urdu |
|---|---|---|---|
| `marching-hips-level` | `pelvis_level` changes by more than 5 for 500 ms (2nd pass) | Keep your hips level. | Kulhe barabar rakhein. |

**Limits.** Counts the marching and watches the pelvis; it cannot see whether the low back or the deep abdominal muscles are controlling it.

*Marching ki ginti aur pelvis ki nigrani; yeh nahi dekh sakta ke kamar ya gehre pait ke muscles use control kar rahe hain ya nahi.*

### 24. Curl-up (abdominal control) — `mcgill-curl-up`

*lumbar, tier B, lying on the back, one side at a time, feasibility: to-confirm. The library's own demonstration is shown from the side (supine).*

**Phone.** side view, landscape, 1.8 to 2.8 m away, lens 30 to 60 cm above the floor, framing: full body lying.

> Lay the phone on its long side on a low stand or the floor, about 2 metres from the mat and level with your hips, on the side you are exercising. Your whole body should be in view.
> *Phone ko lete hue side par, taqreeban 2 meter door, mat se kulhon ki unchai par, jis taraf exercise kar rahe hon us taraf rakhein. Poora jism nazar aaye.*

**Must be visible:** near-side ear, near-side shoulder, near-side hip.

**Counts or times:** repetitions of `trunk_incline` = line from the near-side hip to the near-side shoulder against the horizontal, positive towards the way the person faces. Zero is the person's own neutral position; the target is the change from it: 0 to 8 (degrees), hold 7 s. Library dosage: 3 sets, 5 reps, 7 s hold.

**Metrics**

- `trunk_incline`: line from the near-side hip to the near-side shoulder against the horizontal, positive towards the way the person faces
- `neck_on_trunk`: line from the near-side shoulder to the near-side ear against the horizontal, positive towards the way the person faces minus line from the near-side hip to the near-side shoulder against the horizontal, positive towards the way the person faces (size only, either way)

**Joints.** Every joint that moves in the demonstration (marked ●) and the joints watched for a compensation (○).

| | Joint | Axes | Coverage | Metric (movement type) | How / why |
|---|---|---|---|---|---|
| ● | trunk | flex | measured | `trunk_incline` (`trunk-incline-low-side`) | The hip-to-shoulder line rising against the horizontal: the small lift of the head and shoulders. |
| ● | neck | flex | measured | `neck_on_trunk` (`head-trunk-low-side`) | The head's line against the trunk's line: a head that stays in line with the chest reads near zero, a chin poking forward reads larger. |

**Cues** (each is checked by the wording rules: never more range or effort, never over pain, no medical judgement)

| Id | When | English | Roman Urdu |
|---|---|---|---|
| `curl-up-head` | `neck_on_trunk` changes by more than 12 for 500 ms | Keep your head in line with your chest. | Sar ko seene ki seedh mein rakhein. |
| `curl-up-enough` | `trunk_incline` changes by more than 30 for 300 ms | That is enough. Come back slowly. | Itna kaafi hai. Aahista wapas aayein. |

**Limits.** Times the lift and checks the head stays in line; it cannot see the abdominal muscles or the low back's position.

*Uthne ka waqt naapta aur dekhta hai ke sar seene ki seedh mein raha; yeh pait ke muscles ya kamar ki position nahi dekh sakta.*

### 25. Glute bridge with ball squeeze — `bridge-with-ball`

*lumbar, tier B, lying on the back, feasibility: to-confirm. The library's own demonstration is shown from the side (supine).*

**Phone.** side view, landscape, 1.8 to 2.8 m away, lens 30 to 60 cm above the floor, framing: full body lying.

> Lay the phone on its long side on a low stand or the floor, about 2 metres from the mat and level with your hips, on the side you are exercising. Your whole body should be in view.
> *Phone ko lete hue side par, taqreeban 2 meter door, mat se kulhon ki unchai par, jis taraf exercise kar rahe hon us taraf rakhein. Poora jism nazar aaye.*

**Must be visible:** near-side ear, nose, near-side shoulder, near-side elbow, near-side hip, near-side knee, near-side ankle.

**Second pass (feet end view, landscape, 1.5 to 2.5 m, lens 30 to 50 cm):** A short second pass from your feet: do both hips rise together, and do the knees stay apart? Must be visible: left hip, right hip, left knee, right knee.

**Counts or times:** repetitions of `hip_angle` = angle at the near-side hip between the near-side shoulder and the near-side knee. Zero is the person's own neutral position; the target is the change from it: 0 to 30 (degrees), hold 3 s. Library dosage: 3 sets, 10 reps, 3 s hold.

**Metrics**

- `hip_angle`: angle at the near-side hip between the near-side shoulder and the near-side knee
- `knee_angle`: angle at the near-side knee between the near-side hip and the near-side ankle
- `shoulder_angle`: angle at the near-side shoulder between the near-side hip and the near-side elbow
- `head_line`: line from the near-side ear to the nose against the horizontal, positive towards the way the person faces
- `pelvis_level` (second pass): line from the left hip to the right hip against the horizontal (size only, either way)
- `knee_gap` (second pass): distance left knee to right knee, as a fraction of the length left hip to right hip

**Joints.** Every joint that moves in the demonstration (marked ●) and the joints watched for a compensation (○).

| | Joint | Axes | Coverage | Metric (movement type) | How / why |
|---|---|---|---|---|---|
| ● | hip | flex | measured | `hip_angle` (`limb-joint-lying-side`) | The angle between the trunk and the thigh on the near side: the hip rising towards a straight line. |
| ● | knee | flex | measured | `knee_angle` (`limb-joint-lying-side`) | Hip-knee-ankle angle on the near side (about 8 degrees, at the limit of what is read). |
| ● | shoulder | flex | measured | `shoulder_angle` (`limb-joint-lying-side`) | The angle between the trunk and the upper arm resting on the mat. |
| ● | neck | flex | tracked | `head_line` (`head-line-lying`) | The head resting on the mat is followed through the ear-to-nose line; about 12 degrees, not read as an angle. |
| ● | pelvis | flex | not measurable |  | Pelvic tilt about the horizontal axis cannot be seen in a picture; the hip angle includes it, it is not separated. |
| ● | hip:o | flex | tracked (2nd pass) | `pelvis_level` (`pelvis-level-end-on`) | The far hip is hidden behind the near one in a side view; the second pass from the feet shows whether both hips rise together. |
| ● | knee:o | flex | tracked (2nd pass) | `knee_gap` (`knee-gap-end-on`) | The far knee is hidden in a side view; the second pass shows whether the knees stay together on the ball. |
| ● | shoulder:o | flex | not measurable |  | The far arm is hidden behind the near one; it rests on the mat and is assumed to match. |

**Cues** (each is checked by the wording rules: never more range or effort, never over pain, no medical judgement)

| Id | When | English | Roman Urdu |
|---|---|---|---|
| `ball-bridge-hips-level` | `pelvis_level` changes by more than 5 for 500 ms (2nd pass) | Keep your hips level. | Kulhe barabar rakhein. |
| `ball-bridge-ball` | `knee_gap` changes by more than 0.2 for 600 ms (2nd pass) | Keep the ball between your knees. | Ball ko ghutnon ke darmiyan rakhein. |

**Limits.** Counts the bridge, times the hold and watches the hips and the gap between the knees; it cannot see how hard the ball is squeezed.

*Bridge ki ginti, hold ka waqt aur kulhon-ghutno ki nigrani; yeh nahi dekh sakta ke ball kitni dabayi gayi.*

### 26. Standing side bend — `standing-side-bend`

*lumbar, tier A, standing, one side at a time, feasibility: standard. The library's own demonstration is shown from the front (standing).*

**Phone.** front view, portrait, 2 to 3 m away, lens 90 to 110 cm above the floor, framing: full body.

> Stand the phone upright on a shelf or stand about 2.5 metres away, at hip height. Stand facing the phone with your whole body in view.
> *Phone ko seedha shelf ya stand par taqreeban 2.5 meter door, kulhon ki unchai par rakhein. Phone ke samne khare hon, poora jism nazar aaye.*

**Must be visible:** left shoulder, right shoulder, left hip, right hip, exercised-side hip, exercised-side shoulder, exercised-side elbow, other-side hip, other-side shoulder, other-side elbow.

**Counts or times:** repetitions of `trunk_tilt` = line from the middle of left hip and right hip to the middle of left shoulder and right shoulder against the vertical (size only, either way). Zero is the person's own neutral position; the target is the change from it: 0 to 15 (degrees, either direction). Library dosage: 2 sets, 10 reps.

**Metrics**

- `trunk_tilt`: line from the middle of left hip and right hip to the middle of left shoulder and right shoulder against the vertical (size only, either way)
- `shoulder_angle_t`: angle at the exercised-side shoulder between the exercised-side hip and the exercised-side elbow
- `shoulder_angle_o`: angle at the other-side shoulder between the other-side hip and the other-side elbow
- `chest_turn`: turn about the long axis from how much narrower the left shoulder-to-right shoulder width looks than in the person's own neutral position (size only, either way)

**Joints.** Every joint that moves in the demonstration (marked ●) and the joints watched for a compensation (○).

| | Joint | Axes | Coverage | Metric (movement type) | How / why |
|---|---|---|---|---|---|
| ● | trunk:t | abd | measured | `trunk_tilt` (`trunk-side-bend-front`) | The line from the middle of the hips to the middle of the shoulders against the vertical, seen from the front (the plane of the movement). |
| ● | shoulder | abd | measured | `shoulder_angle_t` (`limb-joint-front-upright`) | Hip-shoulder-elbow angle of the arm that slides down the leg. |
| ● | shoulder:o | abd | measured | `shoulder_angle_o` (`limb-joint-front-upright`) | Hip-shoulder-elbow angle of the other arm. |
| ○ | trunk | rot | measured | `chest_turn` (`trunk-rotation-width`) | A turning chest would mean the bend is leaving the side. |

**Cues** (each is checked by the wording rules: never more range or effort, never over pain, no medical judgement)

| Id | When | English | Roman Urdu |
|---|---|---|---|
| `side-bend-chest` | `chest_turn` changes by more than 12 for 500 ms | Keep your chest facing the phone. | Seena phone ki taraf rakhein. |
| `side-bend-enough` | `trunk_tilt` changes by more than 40 for 300 ms | That is enough. Come back slowly. | Itna kaafi hai. Aahista wapas aayein. |

**Limits.** The whole trunk's tilt is measured; the low back's own share of it cannot be separated from the chest's.

*Poore dhad ka jhukao naapa jata hai; kamar ka apna hissa seene ke hisse se alag nahi kiya ja sakta.*

### 27. Lying on elbows (gentle back extension) — `prone-on-elbows`

*lumbar, tier B, lying face down or in a plank, feasibility: to-confirm. The library's own demonstration is shown from the side (quadruped).*

**Phone.** side view, landscape, 1.8 to 2.8 m away, lens 30 to 60 cm above the floor, framing: full body lying.

> Lay the phone on its long side on a low stand or the floor, about 2 metres from the mat and level with your hips, on the side you are exercising. Your whole body should be in view.
> *Phone ko lete hue side par, taqreeban 2 meter door, mat se kulhon ki unchai par, jis taraf exercise kar rahe hon us taraf rakhein. Poora jism nazar aaye.*

**Must be visible:** near-side ear, near-side shoulder, near-side elbow, near-side hip.

**Counts or times:** how long the position is held at or beyond the target of `trunk_lift` = line from the near-side hip to the near-side shoulder against the horizontal, positive towards the way the person faces. Zero is the person's own neutral position; the target is the change from it: 0 to 10 (degrees), hold 30 s. Library dosage: 3 sets, 1 reps, 30 s hold.

**Metrics**

- `trunk_lift`: line from the near-side hip to the near-side shoulder against the horizontal, positive towards the way the person faces
- `shoulder_angle`: angle at the near-side shoulder between the near-side hip and the near-side elbow

**Joints.** Every joint that moves in the demonstration (marked ●) and the joints watched for a compensation (○).

| | Joint | Axes | Coverage | Metric (movement type) | How / why |
|---|---|---|---|---|---|
| ○ | trunk | flex | measured | `trunk_lift` (`trunk-incline-low-side`) | No joint moves in this exercise (the position is held); the propped-up trunk's tilt is the position being timed. |
| ○ | shoulder | flex | measured | `shoulder_angle` (`limb-joint-lying-side`) | The elbows stay under the shoulders (the angle between the trunk and the upper arm). |

**Cues** (each is checked by the wording rules: never more range or effort, never over pain, no medical judgement)

| Id | When | English | Roman Urdu |
|---|---|---|---|
| `prone-elbows-enough` | `trunk_lift` changes by more than 40 for 300 ms | That is enough. Come back slowly. | Itna kaafi hai. Aahista wapas aayein. |

**Limits.** Times how long the position is held; the low back's own curve and the amount of extension in it cannot be seen.

*Yeh naapta hai ke position kitni der rahi; kamar ka apna curve aur usmein extension ki miqdar nahi dekhi ja sakti.*

## Cue sentences to record

Every cue sentence, once each, for the English and Roman Urdu recordings (the same studio pipeline as the exercise voice; recordings are made when the sentences are final).

| English | Roman Urdu | Used by |
|---|---|---|
| Keep your eyes level. | Nazar barabar rakhein. | chin-tuck-eyes |
| Sit tall and keep your body still. | Seedhe baithein aur jism ko saakin rakhein. | chin-tuck-tall, blade-squeeze-tall |
| Turn only your head; keep your shoulders still. | Sirf sar ghumayein; kandhe wahin rakhein. | neck-rotation-head-only |
| That is enough. Come back slowly. | Itna kaafi hai. Aahista wapas aayein. | neck-rotation-enough, neck-side-bend-enough, upper-trapezius-enough, head-lift-enough, levator-enough, scalene-enough, open-book-enough, seated-rotation-enough, thoracic-extension-enough, cat-camel-enough, quad-rotation-enough, prone-extension-enough, knee-to-chest-enough, knee-rock-enough, dead-bug-enough, curl-up-enough, side-bend-enough, prone-elbows-enough |
| Keep your shoulders level and relaxed. | Kandhe barabar aur dheele rakhein. | neck-side-bend-level, upper-trapezius-level, blade-squeeze-level, levator-level, scalene-level |
| Keep your hips facing the phone. | Kulhe phone ki taraf seedhe rakhein. | seated-rotation-hips |
| Keep both shoulders resting on the mat. | Dono kandhe mat par tikay rakhein. | knee-rock-shoulders |
| Keep your hips level. | Kulhe barabar rakhein. | bridge-hips-level, single-bridge-hips-level, bird-dog-hips, marching-hips-level, ball-bridge-hips-level |
| Keep your knees hip-width apart. | Ghutne kulhon ki chaurai jitne door rakhein. | bridge-knees-apart |
| Keep your back level. | Peeth ko barabar rakhein. | bird-dog-back |
| Keep your body in one line. | Jism ek seedhi line mein rakhein. | plank-line |
| Keep your head in line with your chest. | Sar ko seene ki seedh mein rakhein. | curl-up-head |
| Keep the ball between your knees. | Ball ko ghutnon ke darmiyan rakhein. | ball-bridge-ball |
| Keep your chest facing the phone. | Seena phone ki taraf rakhein. | side-bend-chest |

14 distinct sentences.
