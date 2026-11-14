// Built-in male reading voice: eSpeak NG (open source, GPL-3.0, see LICENSE.txt and README.txt) running off the main thread.
// Messages in : { type: "init" } | { type: "speak", id, text, voice, lang, pitch, rate, range }
// Messages out: { type: "ready", sampleRate } | { type: "audio", id, samples: Int16Array } | { type: "error", id?, error }
import Module from "./espeak-ng.js";

let engine = null;
let booting = null;

function boot() {
  booting ??= Module().then((m) => {
    engine = new m.eSpeakNGWorker();
    return engine;
  });
  return booting;
}

self.onmessage = async (event) => {
  const msg = event.data;
  try {
    if (msg.type === "init") {
      const w = await boot();
      self.postMessage({ type: "ready", sampleRate: w.get_samplerate() });
    } else if (msg.type === "speak") {
      const w = await boot();
      w.set_voice(msg.voice, msg.lang);
      w.pitch = msg.pitch;
      w.rate = msg.rate;
      w.range = msg.range;
      const parts = [];
      let total = 0;
      w.synthesize(msg.text, (audio) => {
        if (audio && audio.length) {
          const copy = Int16Array.from(audio);
          parts.push(copy);
          total += copy.length;
        }
        return 0;
      });
      const samples = new Int16Array(total);
      let at = 0;
      for (const part of parts) {
        samples.set(part, at);
        at += part.length;
      }
      self.postMessage({ type: "audio", id: msg.id, samples }, [samples.buffer]);
    }
  } catch (error) {
    self.postMessage({ type: "error", id: msg.id, error: String(error && error.message ? error.message : error) });
  }
};
