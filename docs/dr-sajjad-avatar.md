# Dr. Sajjad — the 3D AI teaching assistant

Label used everywhere: **"AI teaching assistant based on Dr. Sajjad Raza PT"** (`src/lib/avatar/labels.ts`). He is an animated character
driven by the existing lesson text. He is not the real Dr. Sajjad, has no cloned voice (voice is the browser's own text-to-speech), and
uses **no camera and no microphone**.

## What exists (Phase 0–2)

| Piece | Where |
| --- | --- |
| The character (skin, scrubs with embroidered name + PNA logo, quiff, beard, brows, watch, shoes) | `src/lib/avatar/dress.ts`, built at run time from the shared CC0 body (`public/virtual-patient/patient.glb`). Only extra download: `public/teacher/pna-chest-logo.webp` (~30 KB). |
| Body, pose, face, speech | `figure.ts` (loads the body, uses the patient's pose system `applyPoseToBones`), `face.ts` (jaw, lips, blinks, brows, gaze, breathing), `speech.ts` (voice + lip-sync), `teacher.ts` (assembles it; model slot; light mode) |
| Teaching: walking, leaning, hands on landmarks | `rig.ts` (stance, gait, gestures), `ik.ts` (arm IK), `stage.ts` (plays a choreography step by step) |
| Teaching data | `src/lib/avatar/choreo/*.ts` → `npm run build:avatar-data` → `public/teacher/choreo/<slug>.json` |
| UI inside the lesson | `src/components/avatar/AvatarStage.tsx` (+ `avatar.css`), reached through the lesson's existing `demo:` beat with the key `avatar/<slug>` (`components/skills/Demo3DAny.tsx`) |

No new routes. All 3D, avatar, voice and animation code is client-only (`next/dynamic({ ssr: false })` / dynamic `import()`); the worker only
gained one extra lesson beat's metadata.

## Safety model

* He says **only existing text**. Every line is a *reference* (`TextRef`) to a beat of the technique's PNA Teacher lesson (English + Roman Urdu) or to a line of the
  regional technique guide. `npm run validate:avatar` fails if a reference does not resolve, a landmark is unknown, or the generated JSON is stale.
* Overlay labels are interface words ("Contact", "Dose"); the guide line that explains each one is shown beside the stage, never truncated.
* Hand placement, stance and movement are **choreography (geometry)**. They are marked `review: { status: "draft" }` and the stage shows a visible
  **"Draft — pending clinical review"** badge until the supervising physiotherapist signs the file off (`review: { status: "reviewed", by, date }`).
* Roman Urdu: the lesson's own Roman Urdu is shown (and mouthed). The regional guide has no Roman Urdu, so those lines stay in English and are tagged "English (guide wording)".
  Voice is **English only** (an English voice mangles Roman Urdu); in Roman Urdu the mouth still moves and subtitles are shown.

## Adding another technique (data only)

1. Copy `src/lib/avatar/choreo/maitland-shoulder-posterior-glide.ts`, change `slug` (= the regional application slug in `lib/manual-therapy-regional.ts`) and `lessonSlug`.
2. Describe the patient (`position`, starting `patient` pose), where he stands (`stand`), and per step: what he says (`say: TextRef[]`), `contacts` (hand, point, palm and finger
   directions in the **patient's frame**), `move` (a glide), `overlays` (same types as Skills Lab scenes) with `note` references, `gesture`, `look`.
   Points use the syntax in `lib/skills/points3d.ts` (`@coracoid{0.03,-0.012,0}`, `lowerarm01{0,0,-0.045}`, …).
3. List it in `choreo/index.ts`. Run `npm run build:avatar-data` and `npm run validate:avatar`. The lesson generator adds the demo beat after the lesson's "steps" beat automatically
   (`avatarDemoBeat`); run `npm run build:teacher-data` and `npm run validate:teacher`.
4. Check it in the browser (see "Testing"). Hands that cannot reach show up as `reachError` > 0 — move `stand.distance` closer or change the point.

## Swapping in a 3D artist's model

Put the file at `public/teacher/dr-sajjad.glb`. If it exists, `DrSajjad.create()` loads it **instead of** the generated character (no dressing is applied — the artist's file brings its own clothes,
hair and textures) and drives it with the same pose system, face animator and IK.

Requirements (the pose system, face animation and hand placement use the rig's bone *names* and rest pose):

* A single skinned mesh (the biggest skinned mesh is used) on the **PNA body rig** — the MakeHuman "default" skeleton used by `public/virtual-patient/patient.glb`: `root`, `spine01–05`, `neck01–03`, `head`, `clavicle.L/R`, `upperarm01/02.L/R`, `lowerarm01/02.L/R`, `wrist.L/R`, `finger1-1 … finger5-3.L/R`, `upperleg01/02`, `lowerleg01/02`, `foot`, `toe…`, plus face bones `jaw`, `eye.L/R`, `orbicularis03/04.L/R` (eyelids), `oris*`, `risorius*`. Bones rest with **identity rotation** (A-pose), as in `patient.glb`.
* Feet at y = 0, metres, +z forward, +x = the character's left.
* Compression: the existing loader supports Meshopt, KTX2-free WebP textures and `KHR_mesh_quantization`.
* If required bones are missing, the console lists them (`[dr-sajjad] … is missing N required bone(s)`); with more than 20 % missing the model is rejected and the generated character is used.

Limitation: a model on a *different* skeleton (e.g. Mixamo) is not retargeted automatically — rig it to the PNA skeleton, or ask for a bone-name map plus rest-pose correction to be added.

## Light mode

Automatically on for `prefers-reduced-motion`, data saver, ≤ 2 GB device memory or ≤ 2 CPU cores; visitors can toggle it (⚡ button, remembered in `localStorage["pna-avatar-light"]`).
Light mode = one static pose per step, **no patient and no second figure**, no idle animation, subtitles and step list still work.

## Testing

* `npm run validate:avatar` — teaching data. `npm run validate:teacher`, `validate:skills` — unchanged validators still pass.
* In the browser: open `/manual-therapy/maitland-joint-mobilization`, use "Let's start" and answer/advance to the demonstration beat, press play.
* Keyboard: **Space** play/pause, **←/→** step, **R** replay (focus the stage).
* Dev harness used for development (not committed): esbuild-bundled `ExamRoom` + `TeachingStage` with a fake clock in headless Chromium.

## Size

Measured with `opennextjs-cloudflare build` + `wrangler deploy --dry-run` (gzip, limit 3072 KiB):

| Point | Worker gzip |
| --- | --- |
| Before (branch start) | 2846.10 KiB |
| After Phase 1 (avatar code, nothing wired) | 2841.54 KiB |
| After Phase 2 (stage, data, lesson beat) | see the final report |

Static assets (not counted): `public/teacher/pna-chest-logo.webp` ~30 KB, `public/teacher/choreo/*.json` ~9 KB per technique. The body model is the existing 326 KB `patient.glb`.
