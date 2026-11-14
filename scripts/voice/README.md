# The PNA Teacher's recorded voice

The site does not synthesise speech. Every fixed English line it can read aloud was read **once, offline**, by a free neural voice
(Kokoro, voice `bm_george`, Apache-2.0) and saved as small MP3 packs under `public/voice/george/`. In the browser
(`src/lib/speech/recorded.ts`) a line is cut into sentences, each sentence is looked up by key (`src/lib/speech/clip-key.ts`) and the
recordings are played one after another with Web Audio. A line without a recording is not spoken (subtitles only); Roman Urdu is not spoken.

Why not run the model in the visitor's browser: measured, it is about 3x slower than real time on a laptop (single thread, WebAssembly) and a
92 MB download, so it is unusable on a phone. Recording once and playing files costs the visitor almost nothing.

## What is recorded

`collect.mts` lists the sentences (the same path the site takes: `toSpoken`, then `splitSentences`):

| Group | Source |
|---|---|
| `avatar-*` | `public/teacher/choreo/*.json` (the Guide-me tour, each technique) |
| `rehab-*` | `src/lib/rehabverse/guide.ts`, the default cues in `ExercisePlayer.tsx`, each region's `say` cues in `public/rehabverse-data/*.json` |
| `lesson-<slug>` | every English beat text of a lesson (`collect.mts <out> lessons`); about 5,600 sentences, 7 hours of speech |

`npm run validate:speech` fails if a listed sentence has no recording (so changing a line means re-running the steps below), if a pack or clip
is missing or out of range, or if a synthesiser sneaks back into the code.

## Steps

You need Node 22, Python 3 with numpy, `ffmpeg` with libmp3lame, Playwright's Chromium, and (not in the repo) the model files:
`onnx-community/Kokoro-82M-v1.0-ONNX` -> `onnx/model_quantized.onnx`, `config.json`, `tokenizer.json`, `tokenizer_config.json`,
`voices/bm_george.bin`, plus `onnxruntime-web` and `kokoro-js` from npm to bundle `page.js`.

1. List the sentences: `node --experimental-strip-types scripts/voice/collect.mts /tmp/sentences.json` (add `lessons` for the lessons).
2. Make a web folder `www/` containing `index.html` (`<script type="module" src="/page.js">`), `page.js` (esbuild bundle of `scripts/voice/page.js`
   with `kokoro-js`), `ort/` (the onnxruntime-web `.wasm` and `.mjs` files), `models/kokoro/` (the model files above).
3. Read them: `node scripts/voice/generate.cjs /tmp/sentences.json /tmp/cache www bm_george 4` (4 browser workers; resumable; everything
   outside the machine is blocked, the voice file is served from disk). About 3 seconds of work per second of speech per worker.
4. Pack them: `python3 scripts/voice/pack.py /tmp/sentences.json /tmp/cache public/voice/george` (trims silence, evens out loudness, writes the
   MP3 packs, `clips.json` and `packs.json`). Delete the old `*.mp3` files of packs that changed (their names carry a content hash).
5. `npm run validate:speech`, then commit `public/voice/george/`.

Credit and licence: `public/voice/george/README.txt` (shown next to the voice button in the 3D demonstrations).
