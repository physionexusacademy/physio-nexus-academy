# Dr. Sajjad — the 3D AI teaching assistant

Label used everywhere: **"AI teaching assistant based on Dr. Sajjad Raza PT"** (`src/lib/avatar/labels.ts`). He is an animated character
driven by the existing lesson text. He is not the real Dr. Sajjad, has no cloned voice (voice is the browser's own text-to-speech), and
uses **no camera and no microphone**.

## What exists (Phase 0–4)

| Piece | Where |
| --- | --- |
| The character (skin, scrubs with embroidered name + PNA logo, quiff, beard, brows, watch, shoes) | `src/lib/avatar/dress.ts`, built at run time from the shared CC0 body (`public/virtual-patient/patient.glb`). Only extra download: `public/teacher/pna-chest-logo.webp` (~30 KB). |
| Body, pose, face, speech | `figure.ts` (loads the body, uses the patient's pose system `applyPoseToBones`), `face.ts` (jaw, lips, blinks, brows, gaze, breathing), `speech.ts` (voice + lip-sync), `teacher.ts` (assembles it; model slot; light mode) |
| Teaching: walking, leaning, hands on landmarks | `rig.ts` (stance, gait, gestures), `ik.ts` (arm IK), `stage.ts` (plays a choreography step by step) |
| Teaching data | `src/lib/avatar/choreo/*.ts` → `npm run build:avatar-data` → `public/teacher/choreo/<slug>.json` |
| UI inside the lesson | `src/components/avatar/AvatarStage.tsx` (+ `avatar.css`), reached through the lesson's existing `demo:` beat with the key `avatar/<slug>` (`components/skills/Demo3DAny.tsx`) |
| Site guide ("Guide me") | `src/lib/avatar/choreo/site-tour.ts` (13 stops, wording taken from the existing site guide `site-guide.ts` / `academy-map.ts`), `components/avatar/GuideMe.tsx` (card on `/learn` and `/skills`, the stage opens in place, with a text version for browsers without WebGL) |
| "Ask Dr. Sajjad" (tour only) | `components/avatar/AskPanel.tsx` → the existing `/api/physio-nexus-ai`. Text box only. He reads out the answer the site's own search returns (resources + suggestions); emergency wording shows the safety box. |

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

## Site guide ("Guide me") and Ask

* `site-tour.json` is built like the technique data: each stop's line is a `TextRef` to a site-guide field (`id` + `part`). Stops that matter on the page carry a link (`href` is checked against the real app routes by `validate:avatar`).
* The tour stands the patient up or lays him down as needed (`position` per step) and uses the same overlays as Skills Lab scenes for the short demonstrations.
* **Ask Dr. Sajjad** sends the typed question (nothing else) to `/api/physio-nexus-ai`, which is deterministic and grounded in PNA's own content. His reply is only the answer text and resource titles that route returns; no model text is invented in the browser. Red-flag wording (e.g. chest pain) shows the route's safety message first. Rate limit and privacy rules are the route's own.
* Voice input is **not** offered here (no microphone).

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

## Accessibility

* The stage is one focusable figure: **Space/K** play or pause, **←/→** step, **R** replay. These keys are ignored while a button, link, select or text box inside the stage has focus, so those keep their normal keys (Space/Enter on a button, arrows in a select).
* Subtitles are a single `role="status"` / `aria-live="polite"` region. On phones it is visually hidden (the caption under the 3D view shows the same words) but stays in the accessibility tree. Screen-reader users who also have the voice on can switch the voice off (🔊 button).
* Every control has an accessible name; touch targets are ≥ 28 px high (buttons 36 px). Focus rings are visible. Light mode replaces animation with one still pose per step and turns on automatically for `prefers-reduced-motion`.
* The 3D view is `role="img"` with a label; the same information is always available as text (subtitles, step chips, the guide-wording notes, and a text step list when WebGL is missing).
* Roman Urdu is written in Latin script and read by the screen reader's English voice; this is a limitation of Roman Urdu, not of the stage.

## Privacy

* No camera, microphone, geolocation or speech-recognition API is used anywhere in `src/lib/avatar` or `src/components/avatar` (checked by search, and at run time by a test that traps `getUserMedia`, `enumerateDevices`, geolocation and `SpeechRecognition`: none called during a full tour with Ask).
* Network: static files from this site (`/teacher/choreo/*.json`, `/virtual-patient/patient.glb`, the logo, JS chunks), plus `POST /api/physio-nexus-ai` with the typed question when the visitor uses Ask. No third-party host is contacted by the avatar.
* `localStorage` holds only three preferences: `pna-avatar-light`, `pna-avatar-speed`, `pna-avatar-voice`. The voice is the browser's own text-to-speech.

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
| After Phase 2 (stage, data, lesson beat) | 2845.57 KiB (−0.53 vs the start) |
| After Phase 3 (Guide me, Ask, site tour) | 2846.84 KiB (+0.74) |
| Final (Phase 4 accessibility + light-mode timing) | 2844.08 KiB (−2.02 vs the start; limit 3072) |

Differences of a few KiB between builds are build noise (hashed chunk names); nothing avatar-related is bundled into the worker.

Static assets (not counted): `public/teacher/pna-chest-logo.webp` ~30 KB, `public/teacher/choreo/*.json` ~9 KB per technique. The body model is the existing 326 KB `patient.glb`.
Browser JS added by the avatar (production build, lazy, only when a demonstration opens): two chunks, 12.7 KB + 26.9 KB raw = **14.7 KB gzip**, on top of the three.js chunk (75 KB gzip) that the Virtual Patient and Skills Lab demos already load.

## Load time and transfer (phone profile)

Production build served with `next start`, Chromium with a Pixel 5 profile, **Slow 4G** (1.6 Mbit/s down, 150 ms RTT) and 4× CPU slowdown, on a machine with **software WebGL** (no GPU), so the 3D part is slower here than on a real phone. Fresh browser each time, no cache:

| Step | Result |
| --- | --- |
| `/learn` before the tour is opened | loads in ~2.0 s, 359 KB; **no avatar assets requested** |
| Tap "Start the tour" → poster + Play button ready | **~10 s** (unthrottled: 3.8 s) |
| Extra download for the avatar | **~596 KB**: `patient.glb` 242 KB (shared with the Virtual Patient, cached afterwards), three.js chunk 75 KB, avatar chunks ~14.7 KB gzip, other lazy chunks, logo 30 KB, tour JSON ~9 KB |
| Whole page after the avatar | ~955 KB; JS heap ~25 MB |

Very slow 3G (0.8 Mbit/s, 562 ms RTT) also completes (about 10 s to ready in the same test) because the work is CPU-bound with software GL; a real phone's GPU should do better.
The first view shows a progress bar; nothing is requested until the visitor taps Start (or the demonstration scrolls into view in a lesson).

## Known limitations

* The face is a stylised portrait on the generic CC0 head (hair, beard, scrubs), not a scan or likeness model. A 3D artist's GLB can be dropped in (see above).
* Hand placement and movement for the Maitland technique are a **draft** until the supervising physiotherapist signs them off (badge shown). The site tour uses interface wording only and needs no clinical review.
* Voice is English only; Roman Urdu is subtitles plus silent mouth movement. Regional-guide lines have no Roman Urdu and stay English (tagged).
* Per-frame time is capped at 50 ms to keep walking/IK stable, so on a device slower than ~20 fps the full demonstration plays in slow motion (light mode is not capped and follows real time).
* Tested only in headless Chromium with software WebGL. Real-phone GPU performance, battery use and the browser's actual voices have not been measured.
* `npm run lint` is not set up in this repository (no ESLint config), so linting could not be run; `tsc`, `validate:avatar`, `validate:teacher` and `validate:skills` all pass.
