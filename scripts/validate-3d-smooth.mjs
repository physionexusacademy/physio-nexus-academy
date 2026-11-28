import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

/**
 * Smooth 3D: every 3D view (Skills Lab demonstrations, the PNA Teacher, RehabVerse's exercise player and guide, the Virtual Patient) should play like a
 * recorded video. Static checks for the causes of choppy movement that were found and removed:
 *  - the picture adapts its RESOLUTION to the device (never by rebuilding shaders in the middle of a movement, which froze the picture for a moment);
 *  - shaders and textures are prepared before the first movement;
 *  - nothing blurs the live canvas from above (a blurred overlay is re-blurred by the browser on every frame);
 *  - the guide and the overlay lines are updated on every screen refresh, not at half or a quarter of it;
 *  - the page around a 3D view is not re-rendered by React on every frame;
 *  - the PNA Teacher eases into and out of a walk and turns his head gradually; moves ease with no jump in speed or acceleration.
 */
let checks = 0;
const ok = (condition, message) => { checks++; assert.ok(condition, message); };
const read = (path) => readFileSync(new URL("../" + path, import.meta.url), "utf8");

// --- the engine: resolution-only quality governor
const engine = read("src/lib/virtual-patient/engine.ts");
ok(/import \{ RATIOS, ResolutionGovernor \} from "\.\/quality"/.test(engine) && /private setRatioLevel\(/.test(engine) && /setPixelRatio\(ratio\)/.test(engine), "engine: the drawing resolution has levels (lib/virtual-patient/quality.ts) and a step moves between them with setPixelRatio");
ok(!/applyQuality|qualityTier|watchFrameTime/.test(engine), "engine: the old tiered quality scheme is gone");
// (a geometry attribute's needsUpdate re-uploads vertex data; only a MATERIAL's needsUpdate rebuilds a shader)
const rebuilds = engine.split("\n").filter((line) => /\bm\.needsUpdate\s*=\s*true|material\.needsUpdate\s*=\s*true/.test(line) && !/^\s*\/\//.test(line));
ok(rebuilds.length === 1, `engine: a shader is rebuilt in exactly one place (lastResort), found ${rebuilds.length}`);
const lastResort = engine.slice(engine.indexOf("private lastResort()"), engine.indexOf("warm() {"));
ok(/needsUpdate\s*=\s*true/.test(lastResort) && /action === "last-resort"\) this\.lastResort\(\)/.test(engine), "engine: the shader rebuild is only ever the governor's last resort");
const quality = read("src/lib/virtual-patient/quality.ts");
ok(/FAR_TOO_SLOW_MS = 45/.test(quality) && /this\.winMs < 1000/.test(quality) && /this\.slowSeconds >= 2/.test(quality) && /settleUntil/.test(quality), "governor: the picture is judged by the real frames per second over whole seconds (a single stall lowers nothing; steady slowness is caught within two seconds); the first moments after a change or a load are not judged");
ok(/lockedFrom/.test(quality) && /trial: true/.test(quality), "governor: a step up is a trial that is taken back (and not repeated) if it cannot hold");
ok(!/three|window|document/.test(quality.replace(/\/\*[\s\S]*?\*\//g, "")), "governor: no three.js and no DOM, so it is tested in node (validate:3d-governor)");
ok(/this\.renderer\.render\(this\.scene, this\.camera\)/.test(engine.slice(engine.indexOf("private setRatioLevel("), engine.indexOf("private rememberRatio("))), "engine: a resized canvas is redrawn in the same frame, never shown empty");
ok(/RATIOS\[this\.governor\.level\] >= 0\.9/.test(engine), "engine: only a level worth starting from is remembered between visits");
ok(/warm\(\) \{/.test(engine) && /compileAsync/.test(engine) && /initTexture/.test(engine) && /this\.warm\(\);/.test(engine), "engine: shaders (off the main thread) and textures are prepared when the patient has loaded");
ok(/t \* t \* t \* \(t \* \(6 \* t - 15\) \+ 10\)/.test(engine.slice(engine.indexOf("private stepTween("))), "engine: moves between poses ease with no jump in speed or acceleration (smootherstep)");
ok(/Math\.max\(0, Math\.min\(1, \(now - this\.tween!\.start\)/.test(engine), "engine: a move never runs backwards on its first frame");
ok(/idleLast > this\.idleStep\(\)/.test(engine) && /\? 40 : 14;/.test(engine), "engine: the idle breathing is drawn at the screen's frame rate (25 fps only in lite mode on a phone)");
ok(/floor = computer \?/.test(engine) && /this\.floor/.test(quality), "engine: a computer never draws below its own screen density (no blurred, stretched picture)");

// --- nothing blurs a live canvas from above
for (const file of [
  "src/components/skills/scene3d.css",
  "src/components/skills/Scene3DPlayer.tsx",
  "src/components/skills/Demo3DPlayer.tsx",
  "src/components/skills/SceneHud.tsx",
  "src/components/virtual-patient/VirtualPatientApp.tsx",
  "src/components/avatar/AvatarStage.tsx",
  "src/components/avatar/guide-me.css",
  "src/components/rehabverse/ExercisePlayer.tsx",
  "src/components/rehabverse/PhysioGuide.tsx",
]) ok(!/backdrop-filter|backdrop-blur/.test(read(file)), `${file}: no blurred overlay on a live 3D canvas`);

// --- the guide and the overlays run at the screen's rate
const guide = read("src/components/rehabverse/PhysioGuide.tsx");
ok(/if \(!busy && now - lastDraw < 30\) return;/.test(guide) && !/busy \? 30 : 64/.test(guide), "RehabVerse guide: drawn on every refresh while he gestures or talks (it used to be 30 a second, 15 when idle)");
ok(/lastUi\.current > 15/.test(read("src/components/skills/Scene3DPlayer.tsx")), "Skills Lab scenes: overlay lines follow the moving limb on every refresh");
const stage = read("src/lib/avatar/stage.ts");
ok(/lastView < 15/.test(stage), "PNA Teacher stage: overlay lines follow the moving body on every refresh");
ok(/room\.warm\(\)/.test(stage), "PNA Teacher stage: his shaders and textures are prepared before he moves");
const avatar = read("src/components/avatar/AvatarStage.tsx");
ok(/const key = \[v\.step, v\.lineIndex/.test(avatar) && /if \(key !== viewKey\.current\)/.test(avatar), "PNA Teacher stage: the page around the picture is re-rendered only when something on it changes, not on every frame");

// --- the PNA Teacher moves like a person
const rig = read("src/lib/avatar/rig.ts");
ok(/Math\.sqrt\(2 \* 1\.1 \* dist\)/.test(rig) && /wanted < this\.speed \? 18 : 5/.test(rig), "PNA Teacher: he eases into a walk and brakes to stop at the goal (no instant start or stop)");
ok(/this\.gait = damp\(this\.gait/.test(rig) && /gait \* Math\.sin\(this\.phase\)/.test(rig), "PNA Teacher: the stride follows his pace, so a step never pops in or out");
ok(/headYawShown = damp\(/.test(rig) && /headPitchShown = damp\(/.test(rig), "PNA Teacher: his head turns gradually towards what he looks at (no snap)");
ok(/dist < 0\.006/.test(rig), "PNA Teacher: he arrives within 6 mm of where he was sent");

console.log(`Smooth 3D: ${checks} checks passed (resolution adapts without rebuilding shaders; shaders ready before the first movement; no blur over the canvas; the guide and overlays run at the screen's rate; the Teacher moves like a person).`);
