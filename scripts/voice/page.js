// Entry of the page that makes the recordings: Kokoro (a neural voice) running in the browser (WASM, one thread). Bundled by the steps in
// README.md. English sentences are read straight from text (voice bm_george). Roman Urdu is given as runs of Hindi-script Urdu ("hi")
// and English ("en") (scripts/voice/urdu.mts): the Urdu runs are turned into sounds by eSpeak NG's Hindi rules, the English runs by
// the phonemizer's English rules, and Kokoro reads the sounds with a Hindi voice (hm_psi).
import { KokoroTTS } from "kokoro-js";
import { env } from "@huggingface/transformers";
import { phonemize } from "phonemizer";

env.allowRemoteModels = false;
env.allowLocalModels = true;
env.localModelPath = "/models/";
env.useBrowserCache = false;
env.backends.onnx.wasm.wasmPaths = "/ort/";
env.backends.onnx.wasm.numThreads = 1;

const RATE = 24000;
const GAP = Math.round(0.12 * RATE);
const PUNCT = /([;:,.!?¡¿—…"«»“”(){}\[\]।]+\s*)/;
let tts = null;
let esp = null;

/** Cuts a long English sentence at commas / semicolons into parts of at most `max` characters (the model reads about 500 sounds at a time). */
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

function toBase64(chunks) {
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
}

window.init = async (voice) => {
  tts = await KokoroTTS.from_pretrained("kokoro", { dtype: "q8", device: "wasm" });
  window.voice = voice;
  return true;
};

/** English: reads one sentence; returns 16-bit little-endian PCM at 24 kHz as base64. */
window.synth = async (text) => {
  const chunks = [];
  for (const part of parts(text)) {
    const audio = await tts.generate(part, { voice: window.voice });
    chunks.push(audio.audio, new Float32Array(GAP));
  }
  chunks.pop();
  return toBase64(chunks);
};

/* ---------------- Roman Urdu ---------------- */

async function espeak(text) {
  if (!esp) {
    const url = "/espeak/espeak-ng.js";
    const mod = await import(/* webpackIgnore: true */ url);
    const m = await mod.default();
    esp = new m.eSpeakNGWorker();
  }
  esp.set_voice("hi", "hi");
  const r = esp.synthesize_ipa(text);
  // eSpeak separates sounds with "_" and writes nasal vowels as one character; Kokoro wants plain IPA with combining marks
  return (r.ipa || "").replace(/_/g, "").replace(/\s*\n+\s*/g, " ").normalize("NFD").replace(/ɦ/g, "h").replace(/ɭ/g, "l").replace(/ɲ/g, "n").trim();
}

/** The sounds of one clause (keeps punctuation: it shapes the intonation). */
async function clause(lang, text, enLang) {
  const out = [];
  for (const piece of text.split(PUNCT)) {
    if (!piece) continue;
    if (!/[\p{L}\p{N}]/u.test(piece)) {
      out.push(piece.trim() ? piece.replace("।", ".") : " ");
      continue;
    }
    out.push(lang === "hi" ? await espeak(piece) : (await phonemize(piece, enLang)).join(" "));
  }
  return out.join("").replace(/\s+/g, " ").trim();
}

/** Roman Urdu: segments [["hi"|"en", text], ...] read with a Hindi voice; returns PCM as base64. */
window.synthMixed = async (segments, voice, enLang = "en-us") => {
  const sounds = [];
  for (const [lang, text] of segments) {
    const s = await clause(lang, text, enLang);
    if (s) sounds.push(s);
  }
  // pack into parts the model can read (about 380 characters of sounds), cutting between runs
  const packed = [];
  let cur = "";
  for (const s of sounds) {
    if (cur && (cur + " " + s).length > 380) {
      packed.push(cur);
      cur = s;
    } else cur = cur ? cur + " " + s : s;
  }
  if (cur) packed.push(cur);
  const chunks = [];
  for (const p of packed) {
    const sounds2 = p.replace(/ʲ/g, "j").replace(/x/g, "k").replace(/ɬ/g, "l");
    const { input_ids } = tts.tokenizer(sounds2, { truncation: true });
    const audio = await tts.generate_from_ids(input_ids, { voice, speed: 1 });
    chunks.push(audio.audio, new Float32Array(GAP));
  }
  chunks.pop();
  return toBase64(chunks);
};
