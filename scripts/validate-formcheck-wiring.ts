import fs from "node:fs";
import path from "node:path";

/**
 * How the camera Form Check is wired into the site, checked from the source: the camera is allowed only on the signed-in patient pages and only for this site, the check is offered
 * only when the admin switched AI on for the patient, the save is done on the server with a second check, nothing identifying or recorded can be stored, the heavy parts are
 * loaded only on demand (never into the Cloudflare worker's pages), and the deploy fetches and verifies the pinned model files.
 */
const root = process.cwd();
const read = (file: string) => fs.readFileSync(path.join(root, file), "utf8");
let checks = 0;
const failures: string[] = [];
const ok = (condition: unknown, message: string) => { checks++; if (!condition) failures.push(message); };

// 1. headers: camera off everywhere except /rehabverse/me, never "*", microphone always off
const config = read("next.config.js");
ok(!/camera=\(\*\)|camera=\*/.test(config), "the camera must never be allowed for every origin");
ok(/camera=\(self\), microphone=\(\)/.test(config), "next.config.js: /rehabverse/me needs camera=(self), microphone=()");
ok((config.match(/camera=\(self\)/g) ?? []).length === 1, "next.config.js: camera=(self) must appear exactly once (the patient pages only)");
ok(/source: '\/rehabverse\/me\/:path\*'/.test(config), "next.config.js: the camera header must be scoped to /rehabverse/me/:path*");
ok(/source: '\/\(\(\?!rehabverse\/me\(\?:\/\|\$\)\)\.\*\)'/.test(config), "next.config.js: every other path must keep camera=()");
ok(!/microphone=\((?!\))/.test(config), "the microphone must stay off");

// 2. the day page offers the check only for AI-enabled patients and only when the day is open
const day = read("src/components/rehabverse/DaySession.tsx");
ok(/ai && access === "open" && hasFormCheck\(exercise\.exercise_id\)/.test(day), "DaySession: the camera check must be offered only when ai is on, the day is open and the exercise has a spec");
ok(!/from "@\/lib\/formcheck"/.test(day), "DaySession must not import the engine or specs (they load on demand)");
const slot = read("src/components/rehabverse/formcheck/FormCheckSlot.tsx");
ok(/dynamic\(\(\) => import\("\.\/FormCheckPanel"\)/.test(slot) && /ssr: false/.test(slot), "FormCheckSlot: the panel must load on demand, in the browser only");
const hook = read("src/components/rehabverse/formcheck/useFormCheck.ts");
ok(/closeCamera/.test(hook) && /visibilitychange/.test(hook), "useFormCheck: the camera must close when the page is hidden");
const runtime = read("src/lib/formcheck/browser/runtime.ts");
ok(/await import\("@mediapipe\/tasks-vision"\)/.test(runtime), "the pose library must be imported on demand");
ok(!/https?:\/\//.test(runtime.replace(/\/\*[\s\S]*?\*\//g, "")), "the runtime must load only files hosted with the site");

// 3. the server action
const action = read("src/app/rehabverse/formcheck-actions.ts");
ok(/aiAssistAllowed\(\)/.test(action), "the save action must check the AI switch on the server");
ok(/getOverview\(\)/.test(action) && !/patientId|patient_id:\s*input/.test(action), "the patient must come from the signed-in session, never from the request");
ok(/specFor\(input\.specId\)/.test(action), "the save action must check the exercise has a spec");
ok(!/landmark|video|image|blob|base64/i.test(action.replace(/\/\*[\s\S]*?\*\//g, "").replace(/\/\/.*$/gm, "").replace(/No video[^\n]*/g, "")), "the save action must not handle pictures, video or landmarks");

// 4. no recording, no upload from the browser code
for (const file of ["src/components/rehabverse/formcheck/useFormCheck.ts", "src/components/rehabverse/formcheck/FormCheckPanel.tsx", "src/lib/formcheck/browser/camera.ts", "src/lib/formcheck/browser/hud.ts", "src/lib/formcheck/browser/level.ts", "src/components/rehabverse/formcheck/AlignmentOverlay.tsx", "src/lib/formcheck/browser/runtime.ts"]) {
  const code = read(file).replace(/\/\*[\s\S]*?\*\//g, "").replace(/\/\/.*$/gm, "");
  ok(!/MediaRecorder|toDataURL|toBlob|captureStream|createImageBitmap|fetch\(|XMLHttpRequest|sendBeacon|WebSocket|localStorage|sessionStorage|indexedDB/.test(code), `${file}: the camera code must not record, store or send anything`);
}

// 4b. the HUD follows the site's motion choice and never asks the device itself
const hook2 = read("src/components/rehabverse/formcheck/useFormCheck.ts");
ok(/motionReduced\(\)/.test(hook2) && !/matchMedia/.test(hook2 + read("src/lib/formcheck/browser/hud.ts")), "the HUD follows the visitor's motion choice (motionReduced) and does not ask the device");
ok(/reducedMotion/.test(read("src/lib/formcheck/browser/hud.ts")), "the HUD has a calm mode");

// 5. the deploy: model files fetched and verified at build, database check, header and file smoke test
const deploy = read(".github/workflows/deploy-cloudflare-production.yml");
ok(/npm run validate:formcheck-db/.test(deploy), "the deploy must run validate:formcheck-db");
ok(/npm run fetch:formcheck-assets/.test(deploy), "the deploy must verify the Form Check model files");
const pkg = JSON.parse(read("package.json"));
ok(/fetch-formcheck-assets\.mjs && opennextjs-cloudflare build && opennextjs-cloudflare deploy/.test(pkg.scripts.deploy), "npm run deploy must fetch the model files before the build");
ok(/\/public\/formcheck\//.test(read(".gitignore")), "the downloaded model files must not be committed");
ok(/\/formcheck\/\*/.test(read("public/_headers")), "public/_headers needs a cache rule for /formcheck/*");

if (failures.length) { console.error("Form Check wiring FAILED:\n - " + failures.join("\n - ")); process.exit(1); }
console.log(`Form Check wiring: ${checks} checks passed.`);
