// Bundles scripts/speech-checks.ts and runs it (voice choice with a mocked synthesiser, Roman Urdu preparation).
import { build } from "esbuild";
import { pathToFileURL } from "node:url";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
const dir = fs.mkdtempSync(path.join(os.tmpdir(), "pna-speech-"));
const outfile = path.join(dir, "checks.mjs");
await build({ entryPoints: ["scripts/speech-checks.ts"], bundle: true, format: "esm", platform: "node", outfile, logLevel: "error", target: "node22" });
try {
  await import(pathToFileURL(outfile).href);
} finally {
  fs.rmSync(dir, { recursive: true, force: true });
}

// The built-in male voice (eSpeak NG): files present, data list consistent and small, no female variant, licence and source credit, long cache,
// and nothing on the site talks to the device synthesiser directly any more (everything goes through lib/speech so a female voice cannot slip in).
const assert = (await import("node:assert/strict")).default;
const voiceDir = "public/teacher/espeak";
for (const name of ["espeak-ng.js", "espeak-ng-data.json", "worker.js", "LICENSE.txt", "README.txt"]) assert(fs.existsSync(`${voiceDir}/${name}`), `Built-in voice file missing: ${name}`);
const espeakJs = fs.readFileSync(`${voiceDir}/espeak-ng.js`, "latin1");
const data = fs.statSync(`${voiceDir}/espeak-ng-data.json`).size;
const manifest = /files:\[(.*?)\],remote_package_size:(\d+)/s.exec(espeakJs);
assert(manifest, "eSpeak data manifest not found");
assert.equal(Number(manifest[2]), data, "eSpeak data size must match its manifest");
const entries = [...manifest[1].matchAll(/\{filename:"([^"]+)",start:(\d+),end:(\d+)\}/g)].map((m) => ({ name: m[1].replace("/usr/share/espeak-ng-data/", ""), start: Number(m[2]), end: Number(m[3]) }));
assert(entries.length > 15 && entries.every((e) => e.end <= data && e.start < e.end), "eSpeak data entries must fit the data file");
for (const need of ["phondata", "phonindex", "phontab", "intonations", "en_dict", "hi_dict", "lang/gmw/en-US", "lang/inc/hi"]) assert(entries.some((e) => e.name === need), `eSpeak data must contain ${need}`);
assert(!entries.some((e) => /^voices\/!v\/(f\d|female|linda|belinda|anika|annie|steph|alicia|grandma|whisperf)/i.test(e.name)), "No female voice variant may be shipped");
assert(data < 1_300_000 && espeakJs.length < 900_000, "The built-in voice must stay small (data < 1.3 MB, script < 0.9 MB)");
assert(espeakJs.includes("espeak-ng-data.json") && !espeakJs.includes('"espeak-ng.data"'), "eSpeak script must point at the renamed (compressible) data file");
assert(fs.readFileSync(`${voiceDir}/worker.js`, "utf8").includes('from "./espeak-ng.js"'), "The voice worker must import the engine");
assert(/GNU GENERAL PUBLIC LICENSE/.test(fs.readFileSync(`${voiceDir}/LICENSE.txt`, "utf8")), "The GPL text must ship with eSpeak");
assert(/github\.com\/espeak-ng\/espeak-ng/.test(fs.readFileSync(`${voiceDir}/README.txt`, "utf8")), "The README must credit and link the eSpeak source");
assert(/\/teacher\/espeak\/\*\s*\n\s*Cache-Control: public,max-age=\d{6,}/.test(fs.readFileSync("public/_headers", "utf8")), "The built-in voice files must be cached for a long time");
assert(fs.readFileSync("src/lib/speech/builtin.ts", "utf8").includes('"/teacher/espeak/worker.js"'), "builtin.ts must load /teacher/espeak/worker.js");
const stage = fs.readFileSync("src/components/avatar/AvatarStage.tsx", "utf8");
assert(!stage.includes("♀") && stage.includes("BUILTIN_VOICE") && stage.includes('voicesFor(kind, "male")'), "The voice list offers the built-in voice and male voices only");
for (const f of ["src/components/rehabverse/ExercisePlayer.tsx", "src/components/rehabverse/PhysioGuide.tsx", "src/components/PhysioNexusAI.tsx", "src/components/teacher/useSpeech.ts"]) {
  assert(!/speechSynthesis/.test(fs.readFileSync(f, "utf8")), `${f} must not use the device synthesiser directly (use lib/speech)`);
}
console.log("Built-in voice checks passed: files, data list, no female variant, licence and credit, cache, no direct synthesiser use.");
