# The PNA Teacher's recorded voice

The site does not synthesise speech. Every fixed line it can read aloud, in English and in Roman Urdu, was read **once, offline**, by a free
neural voice (Kokoro, Apache-2.0: `bm_george` for English, `hm_psi` for Roman Urdu) and saved as small MP3 packs under `public/voice/george/`.
In the browser (`src/lib/speech/recorded.ts`) a line is cut into sentences, each sentence is looked up by key (`src/lib/speech/clip-key.ts`;
Urdu keys are kept apart) and the recordings are played one after another with Web Audio. A line without a recording is not spoken (subtitles only).

Why not run the model in the visitor's browser: measured, it is about 3x slower than real time on a laptop (single thread, WebAssembly) and a
92 MB download, so it is unusable on a phone. Recording once and playing files costs the visitor almost nothing.

## What is recorded

`collect.mts` lists the sentences (the same path the site takes: `toSpoken`, then `splitSentences`):

| Group | Source |
|---|---|
| `avatar-*` | `public/teacher/choreo/*.json` (the Guide-me tour, each technique) |
| `rehab-*` | `src/lib/rehabverse/guide.ts` (fixed text only: no numbers or functions), the default cues in `src/lib/rehabverse/lines.ts`, each region's `say` cues in `public/rehabverse-data/*.json` |
| `lesson-<slug>` | every English beat text of a lesson (`collect.mts <out> lessons`); about 5,600 sentences, 7 hours of speech |
| `ur-avatar-*`, `ur-rehab-*`, `ur-lesson-<slug>` | the same sources in Roman Urdu (`collect.mts <out> urdu`, with `lessons` for the lessons) |

### Roman Urdu

Roman Urdu has no standard spelling and does not write the long "a", so it cannot be read straight from the Latin letters. `urdu.mts` turns
each sentence into runs: Urdu words are written in Devanagari (the Hindi/Urdu voice reads that reliably) and English terms stay English
("Shoulder ko posterior glide karein"). Urdu words come from `urdu-words.txt` (the ~700 most frequent words, written by hand with the
Urdu sounds q kh gh z f) or, for rarer words, from the rules in `src/lib/speech/roman-urdu.ts` plus the ending rules in `urdu.mts`.
A word is English if the site's English texts use it (or it looks English). If a word is read wrongly, add it to `urdu-words.txt`
(`roman reading`, one per line) and re-record that sentence (delete its `.pcm` from the cache and run steps 3-5).
`page.js` gives the Urdu sounds to Kokoro: eSpeak NG's Hindi rules (from the npm package `@echogarden/espeak-ng-emscripten`, put
`espeak-ng.js` and `espeak-ng.data` in `www/espeak/`) for Urdu runs, the phonemizer's English rules for English runs.

`npm run validate:speech` fails if a listed sentence has no recording (so changing a line means re-running the steps below), if a pack or clip
is missing or out of range, or if a synthesiser sneaks back into the code.

## Steps

You need Node 22, Python 3 with numpy, `ffmpeg` with libmp3lame, Playwright's Chromium, and (not in the repo) the model files:
`onnx-community/Kokoro-82M-v1.0-ONNX` -> `onnx/model_quantized.onnx`, `config.json`, `tokenizer.json`, `tokenizer_config.json`,
`voices/bm_george.bin` and `voices/hm_psi.bin`, plus `onnxruntime-web` and `kokoro-js` from npm to bundle `page.js`.

1. List the sentences: `node --experimental-strip-types scripts/voice/collect.mts /tmp/sentences.json` (add `lessons` for the lessons).
2. Make a web folder `www/` containing `index.html` (`<script type="module" src="/page.js">`), `page.js` (esbuild bundle of `scripts/voice/page.js`
   with `kokoro-js`), `ort/` (the onnxruntime-web `.wasm` and `.mjs` files), `models/kokoro/` (the model files above).
3. Read them: `node scripts/voice/generate.cjs /tmp/sentences.json /tmp/cache www bm_george 4 hm_psi` (4 browser workers; resumable; everything
   outside the machine is blocked, the voice file is served from disk). About 3 seconds of work per second of speech per worker.
4. Pack them: `python3 scripts/voice/pack.py /tmp/sentences.json /tmp/cache public/voice/george` (trims silence, evens out loudness, writes the
   MP3 packs, `clips.json` and `packs.json`). Delete the old `*.mp3` files of packs that changed (their names carry a content hash).
5. `npm run validate:speech`, then commit `public/voice/george/`.

Credit and licence: `public/voice/george/README.txt` (shown next to the voice button in the 3D demonstrations).
