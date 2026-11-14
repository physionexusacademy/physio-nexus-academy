The PNA Teacher's recorded voice ("George")
===========================================

These files are recordings of a synthetic male voice reading the English lines of Physio Nexus Academy: the 3D guide and demonstrations,
the RehabVerse guide and exercise cues, and (as they are recorded) the PNA Teacher lessons. No real person's voice was recorded or cloned.
Nothing is generated on the visitor's device: the browser only plays these small files, sentence by sentence.

  packs.json            the names of the recorded packs (tiny)
  clips.json            for every recorded sentence: which pack file, where it starts and how long it is
  <name>.<hash>.mp3     one pack (mono, 24 kHz, 32 kbit/s). The hash is part of the file name so a browser can keep a pack for ever.

The recordings were made offline with Kokoro-82M, a free open-source text-to-speech model (Apache License 2.0), voice "bm_george":
  Model            https://huggingface.co/hexgrad/Kokoro-82M   (copyright hexgrad and contributors, Apache License 2.0)
  ONNX version     https://huggingface.co/onnx-community/Kokoro-82M-v1.0-ONNX
  Browser runtime  kokoro-js and transformers.js (Hugging Face, Apache License 2.0) with ONNX Runtime Web (MIT)
  Licence text     https://www.apache.org/licenses/LICENSE-2.0
Kokoro's text-to-phoneme step uses eSpeak NG (GNU GPL v3, https://github.com/espeak-ng/espeak-ng) while the recordings are made; no eSpeak code
or data ships with the website.

How they were made, and how to add a line or a lesson: scripts/voice/README.md in the website repository.
