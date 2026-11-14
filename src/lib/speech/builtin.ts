/**
 * The built-in male reading voice (browser only).
 *
 * Most phones and many computers only have female voices, and a voice that is downloaded from a speech service is slow to start. So
 * The PNA Teacher has his own voice that works the same everywhere: eSpeak NG, a small open-source speech synthesiser (GPL-3.0, see
 * /teacher/espeak/README.txt) that runs inside the visitor's browser in a Web Worker. Nothing is sent anywhere, it works offline once
 * loaded and it is fast (about twenty times faster than real time), so a line starts speaking a fraction of a second after it is asked for.
 *
 * Text is cut into sentences; the worker speaks them in order and each is played the moment it is ready (Web Audio, gapless), so a
 * long line starts as soon as its first sentence is done. English is read with the English voice; Urdu / Roman Urdu is converted to
 * Devanagari by roman-urdu.ts and read with the Hindi voice (the same sounds). eSpeak NG switches language word by word, so English
 * terms left in Latin letters inside the same line are pronounced in English by the same speaker.
 * Measured on the output: median pitch about 103 Hz, the range of an adult male voice.
 */

export const BUILTIN_VOICE = "pna-builtin-male";
export const BUILTIN_LABEL = "PNA Teacher — built-in male voice";
export type BuiltinLang = "en-us" | "hi";
export type BuiltinPart = { text: string; lang: BuiltinLang };
export type BuiltinPlayback = { cancel: () => void; pause: () => void; resume: () => void; done: Promise<void> };

const WORKER_URL = "/teacher/espeak/worker.js";
/** eSpeak settings for an adult male that is not flat: pitch 48 (median about 106 Hz), and a wide intonation range (72 instead of the default 50 widens the pitch movement of a sentence by about a third), a calm 152 words a minute, and a short breath between sentences. */
const PITCH = 48;
const RANGE = 72;
const WORDS_PER_MINUTE = 152;
const SENTENCE_GAP = 0.14;

type AudioContextClass = typeof AudioContext;
const audioContextClass = (): AudioContextClass | null =>
  typeof window === "undefined" ? null : window.AudioContext ?? (window as unknown as { webkitAudioContext?: AudioContextClass }).webkitAudioContext ?? null;

let broken = false;
export const builtinSupported = () => !broken && typeof window !== "undefined" && typeof Worker !== "undefined" && audioContextClass() !== null;

/* ---------------- audio output (created on the first tap so the browser lets it play) ---------------- */

let context: AudioContext | null = null;
function audio(): AudioContext | null {
  if (context) return context;
  const Ctor = audioContextClass();
  if (!Ctor) return null;
  try {
    context = new Ctor();
  } catch {
    context = null;
  }
  return context;
}

/**
 * Lets the browser play sound. Browsers only allow it from a tap or key press, so this is called from the click handlers that turn the
 * voice on or start a line (it creates the audio output on first use); any later tap also resumes it if the browser paused it.
 */
export function unlockAudio() {
  const c = audio();
  if (c && c.state === "suspended") void c.resume().catch(() => undefined);
}
function resumeIfCreated() {
  if (context && context.state === "suspended") void context.resume().catch(() => undefined);
}
if (typeof window !== "undefined") {
  for (const type of ["pointerdown", "keydown", "touchend"] as const) window.addEventListener(type, resumeIfCreated, { capture: true, passive: true });
}

/* ---------------- the engine (loaded once, on the first line or when warmed) ---------------- */

type Pending = { resolve: (samples: Int16Array) => void; reject: (error: Error) => void };
let worker: Worker | null = null;
let ready: Promise<number> | null = null;
let sampleRate = 22050;
let nextId = 1;
const pending = new Map<number, Pending>();

function failAll(error: Error) {
  for (const job of pending.values()) job.reject(error);
  pending.clear();
}

function start(): Promise<number> {
  if (ready) return ready;
  ready = new Promise<number>((resolve, reject) => {
    try {
      worker = new Worker(WORKER_URL, { type: "module" });
    } catch (error) {
      broken = true;
      reject(error instanceof Error ? error : new Error(String(error)));
      return;
    }
    worker.onmessage = (event: MessageEvent) => {
      const msg = event.data as { type: string; id?: number; samples?: Int16Array; sampleRate?: number; error?: string };
      if (msg.type === "ready") {
        sampleRate = msg.sampleRate ?? sampleRate;
        resolve(sampleRate);
      } else if (msg.type === "audio" && msg.id !== undefined) {
        pending.get(msg.id)?.resolve(msg.samples ?? new Int16Array(0));
        pending.delete(msg.id);
      } else if (msg.type === "error") {
        if (msg.id !== undefined) {
          pending.get(msg.id)?.reject(new Error(msg.error));
          pending.delete(msg.id);
        } else {
          reject(new Error(msg.error));
        }
      }
    };
    worker.onerror = () => {
      broken = true;
      const error = new Error("The built-in voice could not start.");
      reject(error);
      failAll(error);
    };
    worker.postMessage({ type: "init" });
  });
  return ready;
}

/** Starts loading the voice in the background (about 0.8 MB, once) so the first line is spoken without waiting. Safe to call often. */
export function warmBuiltin() {
  if (!builtinSupported()) return;
  unlockAudio();
  void start().catch(() => undefined);
}

function synth(text: string, lang: BuiltinLang, rate: number): Promise<Int16Array> {
  return new Promise((resolve, reject) => {
    if (!worker) return reject(new Error("The built-in voice is not running."));
    const id = nextId++;
    pending.set(id, { resolve, reject });
    worker.postMessage({
      type: "speak",
      id,
      text,
      voice: lang,
      lang,
      pitch: PITCH,
      range: RANGE,
      rate: Math.round(Math.max(90, Math.min(350, WORDS_PER_MINUTE * rate * (lang === "hi" ? 0.95 : 1)))),
    });
  });
}

/* ---------------- sentences ---------------- */

/** Cuts text into sentences (a full stop inside a number like 3.5 is not an end), and long sentences at commas. */
export function splitForSpeech(text: string): string[] {
  const sentences: string[] = [];
  const end = /[.!?।؟…]+(?=\s|$)/gu;
  let last = 0;
  let match: RegExpExecArray | null;
  while ((match = end.exec(text))) {
    sentences.push(text.slice(last, match.index + match[0].length));
    last = match.index + match[0].length;
  }
  sentences.push(text.slice(last));
  const out: string[] = [];
  for (const raw of sentences) {
    let sentence = raw.trim();
    while (sentence.length > 220) {
      const at = Math.max(sentence.lastIndexOf(", ", 200), sentence.lastIndexOf("; ", 200), sentence.lastIndexOf("، ", 200));
      const cut = at > 60 ? at + 1 : sentence.lastIndexOf(" ", 200);
      if (cut < 40) break;
      out.push(sentence.slice(0, cut).trim());
      sentence = sentence.slice(cut).trim();
    }
    if (/[\p{L}\p{N}]/u.test(sentence)) out.push(sentence);
  }
  return out;
}

/**
 * The first piece of a line is kept short (about 70 characters, cut at a comma or other clause end when there is one) so that sound
 * starts as early as possible even on a slow phone; the rest follows while it plays.
 */
export function shortFirst(sentences: string[]): string[] {
  const first = sentences[0];
  if (!first || first.length <= 90) return sentences;
  const window = first.slice(0, 90);
  let cut = Math.max(window.lastIndexOf(", ", 80), window.lastIndexOf("; ", 80), window.lastIndexOf(": ", 80), window.lastIndexOf(" — ", 80), window.lastIndexOf("، ", 80));
  if (cut < 30) cut = window.lastIndexOf(" ", 72);
  if (cut < 30) return sentences;
  const keep = /[,;:،]/.test(first[cut]) ? cut + 1 : cut; // keep the comma so the voice carries on instead of ending the sentence
  return [first.slice(0, keep).trim(), first.slice(keep).trim(), ...sentences.slice(1)];
}

/* ---------------- speaking ---------------- */

const active = new Set<BuiltinPlayback>();
/** Stops whatever the built-in voice is saying. */
export function cancelBuiltin() {
  for (const playback of [...active]) playback.cancel();
}

/**
 * Speaks the parts in order. `onStart` fires when the first sentence starts playing; `onDuration` gives the whole length in seconds once
 * every sentence is ready (so the lips can be spread over the real length).
 */
export function speakBuiltin(parts: BuiltinPart[], options: { rate?: number; onStart?: () => void; onDuration?: (seconds: number) => void } = {}): BuiltinPlayback {
  const rate = options.rate ?? 1;
  let cancelled = false;
  let finished = false;
  let resolveDone: () => void = () => undefined;
  const done = new Promise<void>((resolve) => (resolveDone = resolve));
  const sources: AudioBufferSourceNode[] = [];
  const finish = () => {
    if (finished) return;
    finished = true;
    active.delete(handle);
    resolveDone();
  };
  const jobs = parts.flatMap((part, partIndex) => (partIndex === 0 ? shortFirst(splitForSpeech(part.text)) : splitForSpeech(part.text)).map((text) => ({ text, lang: part.lang })));
  cancelBuiltin(); // one speaker at a time: a new line ends the previous one
  const c = audio();
  const handle: BuiltinPlayback = {
    cancel: () => {
      cancelled = true;
      for (const source of sources) {
        try {
          source.onended = null;
          source.stop();
        } catch {
          /* already stopped */
        }
      }
      finish();
    },
    pause: () => void c?.suspend().catch(() => undefined),
    resume: () => void c?.resume().catch(() => undefined),
    done,
  };
  if (!jobs.length || !c) {
    finish();
    return handle;
  }
  active.add(handle);
  void (async () => {
    try {
      await start();
      if (cancelled) return;
      if (c.state === "suspended") {
        // No tap yet (a browser rule): give it a moment, then stay silent rather than wait forever.
        await Promise.race([c.resume().catch(() => undefined), new Promise((resolve) => setTimeout(resolve, 1200))]);
        if (c.state === "suspended") {
          finish();
          return;
        }
      }
      // The worker is about twenty times faster than speech, so two sentences ahead is plenty; asking for no more keeps a cancelled
      // line from leaving work in the queue in front of the next one.
      const requests: Promise<Int16Array>[] = [];
      const ask = (index: number) => {
        if (index < jobs.length && !requests[index]) requests[index] = synth(jobs[index].text, jobs[index].lang, rate);
      };
      let when = 0;
      let total = 0;
      let lastSource: AudioBufferSourceNode | null = null;
      for (let index = 0; index < jobs.length; index++) {
        ask(index);
        ask(index + 1);
        const samples = await requests[index];
        if (cancelled) return;
        if (!samples.length) continue;
        const buffer = c.createBuffer(1, samples.length, sampleRate);
        const channel = buffer.getChannelData(0);
        for (let i = 0; i < samples.length; i++) channel[i] = samples[i] / 32768;
        const source = c.createBufferSource();
        source.buffer = buffer;
        source.connect(c.destination);
        const at = Math.max(c.currentTime + 0.03, when);
        source.start(at);
        sources.push(source);
        lastSource = source;
        when = at + buffer.duration + SENTENCE_GAP;
        total += buffer.duration + SENTENCE_GAP;
        if (sources.length === 1) options.onStart?.();
      }
      if (cancelled) return;
      options.onDuration?.(total);
      if (lastSource) lastSource.onended = finish;
      else finish();
    } catch {
      finish();
    }
  })();
  return handle;
}
