// Entry of the page that runs Kokoro in the browser (WASM, one thread). Bundled by build.sh; see README.md.
import { KokoroTTS } from "kokoro-js";
import { env } from "@huggingface/transformers";

env.allowRemoteModels = false;
env.allowLocalModels = true;
env.localModelPath = "/models/";
env.useBrowserCache = false;
env.backends.onnx.wasm.wasmPaths = "/ort/";
env.backends.onnx.wasm.numThreads = 1;

const RATE = 24000;
const GAP_PARTS = Math.round(0.12 * RATE);
let tts = null;

/** Cuts a long sentence at commas / semicolons into parts of at most `max` characters (the model reads about 500 phonemes at a time). */
function parts(text, max = 300) {
  if (text.length <= max) return [text];
  const pieces = text.split(/(?<=[,;:])\s+/);
  const out = [];
  let cur = "";
  for (const piece of pieces) {
    if (cur && (cur + " " + piece).length > max) {
      out.push(cur);
      cur = piece;
    } else cur = cur ? cur + " " + piece : piece;
  }
  if (cur) out.push(cur);
  return out;
}

window.init = async (voice) => {
  tts = await KokoroTTS.from_pretrained("kokoro", { dtype: "q8", device: "wasm" });
  window.voice = voice;
  return true;
};

/** Reads one sentence; returns 16-bit little-endian PCM at 24 kHz as base64. */
window.synth = async (text) => {
  const chunks = [];
  for (const part of parts(text)) {
    const audio = await tts.generate(part, { voice: window.voice });
    chunks.push(audio.audio);
    chunks.push(new Float32Array(GAP_PARTS));
  }
  chunks.pop();
  const total = chunks.reduce((n, c) => n + c.length, 0);
  const pcm = new Int16Array(total);
  let at = 0;
  for (const c of chunks) {
    for (let i = 0; i < c.length; i++) pcm[at + i] = Math.max(-32768, Math.min(32767, Math.round(c[i] * 32767)));
    at += c.length;
  }
  const bytes = new Uint8Array(pcm.buffer);
  let bin = "";
  for (let i = 0; i < bytes.length; i += 0x8000) bin += String.fromCharCode(...bytes.subarray(i, i + 0x8000));
  return btoa(bin);
};
