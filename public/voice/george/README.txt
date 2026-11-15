The PNA Teacher's recorded voice ("George")
===========================================

These files are recordings of synthetic male voices reading the lines of Physio Nexus Academy in English ("George") and in Roman Urdu
("Psi"): the 3D guide and demonstrations, the RehabVerse guide and exercise cues, and (as they are recorded) the PNA Teacher lessons.
No real person's voice was recorded or cloned.
Nothing is generated on the visitor's device: the browser only plays these small files, sentence by sentence.

  packs.json            the names of the recorded packs (tiny)
  clips.json            for every recorded sentence: which pack file, where it starts and how long it is
  <name>.<hash>.mp3     one pack (mono, 24 kHz, 32 kbit/s). The hash is part of the file name so a browser can keep a pack for ever.
                        Packs named ur-* are the Roman Urdu recordings.

The recordings were made offline with Kokoro-82M, a free open-source text-to-speech model (Apache License 2.0): English with the voice
"bm_george" (George), Roman Urdu with the Hindi/Urdu male voice "hm_psi" (Psi):
  Model            https://huggingface.co/hexgrad/Kokoro-82M   (copyright hexgrad and contributors, Apache License 2.0)
  ONNX version     https://huggingface.co/onnx-community/Kokoro-82M-v1.0-ONNX
  Browser runtime  kokoro-js and transformers.js (Hugging Face, Apache License 2.0) with ONNX Runtime Web (MIT)
  Licence text     https://www.apache.org/licenses/LICENSE-2.0
Roman Urdu is first written in Devanagari by a hand-checked word list (scripts/voice/urdu-words.txt) and rules, because a Hindi/Urdu voice
reads that script reliably; English terms inside an Urdu line keep their English reading. The sounds come from eSpeak NG (GNU GPL v3,
https://github.com/espeak-ng/espeak-ng) for the Urdu words and from the phonemizer's English rules for the English terms, while the recordings
are made; no eSpeak code or data ships with the website. Pronunciation is Hindustani-style: Urdu words that use the sounds q, kh, gh, z, f
are given them where the word list says so.

How they were made, and how to add a line or a lesson: scripts/voice/README.md in the website repository.
