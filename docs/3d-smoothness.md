# Smooth 3D (Skills Lab, PNA Teacher, RehabVerse, Virtual Patient)

Every 3D view shares one engine (`src/lib/virtual-patient/engine.ts`, class `ExamRoom`). Movement should look like a recorded video, so these rules hold everywhere
(checked in CI by `npm run validate:3d-smooth` and `npm run validate:3d-governor`):

- **The picture adapts its resolution, never its shaders.** `src/lib/virtual-patient/quality.ts` (`ResolutionGovernor`, no DOM, tested in node) judges whole
  seconds of drawn frames: slow seconds step the resolution down, a run of clean seconds tries one step up (a supersampled, smoother-edged picture on a
  good computer), a step that cannot hold is taken back and not repeated in that visit, one stall or a pause lowers nothing. A step is only a canvas resize
  (redrawn in the same frame). The level that held up (0.9 or more) is remembered in `localStorage` (`pna-3d-ratio-v1`, 14 days). The only shader rebuild is
  the one-time last resort for a device under about 22 frames a second at the lowest level. The old scheme rebuilt every shader in the middle of a movement.
- **Shaders and textures are warmed** (`ExamRoom.warm()`: `compileAsync` + `initTexture`) when the patient has loaded and when the PNA Teacher is added.
- **No blur over a live canvas** (`backdrop-filter` is re-computed by the browser on every frame): the Skills Lab labels/cards and the Virtual Patient toolbar
  use solid backgrounds.
- **Display-rate drawing**: the RehabVerse guide draws on every refresh while he gestures or talks; overlay lines (Skills Lab scenes, PNA Teacher stage) follow the
  moving body on every refresh. The page around the PNA Teacher's picture is re-rendered only when something on it changes (`AvatarStage` `viewKey`).
- **Movement like a person**: pose-to-pose moves use smootherstep (no jump in speed or acceleration); the PNA Teacher eases into a walk, brakes to stop, shows a
  stride that follows his pace, and turns his head gradually (`src/lib/avatar/rig.ts`); idle breathing is drawn about 25 times a second.

Measuring: software GL (SwiftShader) is far slower than a graphics card, so judge relative numbers only. A dev-only hook `window.__pnaStage` (not in production)
exposes the teaching stage for frame-by-frame checks of the walk and the head.
