// Bundles scripts/speech-checks.ts and runs it (recorded voice: sentence keys, the voice files, every fixed line recorded, planning).
import { build } from "esbuild";
import { pathToFileURL } from "node:url";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
const dir = fs.mkdtempSync(path.join(os.tmpdir(), "pna-speech-"));
const outfile = path.join(dir, "checks.mjs");
await build({ entryPoints: ["scripts/speech-checks.ts"], bundle: true, format: "esm", platform: "node", outfile, logLevel: "error", target: "node22", loader: { ".mts": "ts" } });
try {
  await import(pathToFileURL(outfile).href);
} finally {
  fs.rmSync(dir, { recursive: true, force: true });
}

// The voice is recordings only: no synthesiser (the device's or a built-in one) anywhere, the old built-in voice is gone, and the
// credit and licence for the model that made the recordings ships with them.
const assert = (await import("node:assert/strict")).default;
const read = (f) => fs.readFileSync(f, "utf8");
const walk = (d) => fs.readdirSync(d, { withFileTypes: true }).flatMap((e) => (e.isDirectory() ? walk(path.join(d, e.name)) : [path.join(d, e.name)]));
for (const f of walk("src").filter((f) => /\.(ts|tsx)$/.test(f))) {
  assert(!/speechSynthesis|SpeechSynthesisUtterance/.test(read(f)), `${f} must not use a speech synthesiser: the voice is recordings (lib/speech/recorded.ts)`);
}
assert(!fs.existsSync("src/lib/speech/builtin.ts") && !fs.existsSync("public/teacher/espeak"), "The old built-in synthesiser must stay removed");
const readme = read("public/voice/george/README.txt");
assert(/Kokoro/.test(readme) && /Apache/i.test(readme) && /huggingface\.co\/hexgrad/.test(readme) && /hm_psi/.test(readme) && /bm_george/.test(readme), "The voice README must credit Kokoro, its licence and source, and name both voices");
assert(/\/voice\/george\/\*\.mp3\s*\n\s*Cache-Control: public,max-age=\d{7,},immutable/.test(read("public/_headers")), "The hashed voice packs must be cached for a long time");
const recorded = read("src/lib/speech/recorded.ts");
assert(recorded.includes("packs.json") && recorded.includes("clips.json") && recorded.includes("decodeAudioData"), "recorded.ts plays the packs through Web Audio");
for (const f of ["src/components/rehabverse/ExercisePlayer.tsx", "src/components/rehabverse/PhysioGuide.tsx", "src/components/PhysioNexusAI.tsx", "src/components/teacher/useSpeech.ts"]) {
  assert(!/speechSynthesis/.test(read(f)), `${f} must not use the device synthesiser`);
}
assert(!/speakText|supportsSpeech/.test(read("src/components/PhysioNexusAI.tsx")), "PNA AI answers are made on the fly and have no recording: no Listen button there");
assert(read("src/components/teacher/LessonPlayer.tsx").includes("useSpeech(`lesson-${lesson.slug}`)"), "The lesson player offers the voice only for lessons that have a recording");
console.log("Voice checks passed: recordings only, no synthesiser, old built-in voice gone, credit and licence, long cache, Listen only where a recording exists.");
