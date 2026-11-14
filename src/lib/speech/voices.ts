/**
 * Reading text aloud in English, Urdu and Roman Urdu with the browser's own voices (free, nothing is sent anywhere).
 *
 * Voices differ a lot between phones and computers, so this module only *chooses* and *prepares*; it never promises a voice:
 *  - English: the best English voice (Indian/Pakistani/British English first, natural or online voices first).
 *  - Urdu / Roman Urdu: the site's Urdu is Roman Urdu mixed with English terms. Urdu words are converted (roman-urdu.ts) to Devanagari for
 *    a Hindi voice, or to Urdu script for an Urdu voice; English terms in the same line stay with the English voice.
 *  - If the device has no suitable voice, the plan says so and the caller shows subtitles only.
 * Browser only: import it from client code (the helpers are safe to import on the server, they just do nothing there).
 */
import { convertRun, splitRuns, type Lexicon, type Run } from "./roman-urdu";

export type SpeechLang = "en" | "ur";
export type Segment = { text: string; voice: SpeechSynthesisVoice | null; lang: string };
export type VoicePlan = {
  mode: "english" | "hindi" | "urdu" | "none";
  segments: Segment[];
  /** Plain-language note for the person when something is missing (shown next to the voice button). */
  note: string | null;
  /** True when the spoken text is the displayed text (so word-boundary events can be used to keep the lips in sync). */
  sameText: boolean;
};
export type VoicePrefs = {
  en?: string | null;
  ur?: string | null;
  gender?: "male" | null;
  /** Read English terms inside Urdu lines with the English voice (several short utterances) instead of one code-mixed utterance. */
  split?: boolean;
};

export const supportsSpeech = () => typeof window !== "undefined" && "speechSynthesis" in window && typeof SpeechSynthesisUtterance !== "undefined";

const MALE = /\b(male|david|mark|guy|ryan|ravi|prabhat|hemant|asad|rishi|daniel|alex|fred|james|george|thomas|oliver|rishi|aaron|arthur|google uk english male)\b/i;
const FEMALE = /\b(female|zira|hazel|susan|swara|kalpana|uzma|heera|samantha|karen|moira|lekha|tessa|veena|fiona|kate|serena|neerja|aria|jenny|ava)\b/i;

function allVoices(): SpeechSynthesisVoice[] {
  return supportsSpeech() ? window.speechSynthesis.getVoices() : [];
}

const norm = (lang: string) => lang.toLowerCase().replace("_", "-");

function score(voice: SpeechSynthesisVoice, kind: "en" | "hi" | "ur", gender: "male" | null): number {
  const lang = norm(voice.lang);
  const name = voice.name;
  let s = 0;
  if (kind === "en") {
    if (/^en-(in|pk)/.test(lang)) s += 40;
    else if (/^en-gb/.test(lang)) s += 34;
    else if (/^en-(us|au|ca|za)/.test(lang)) s += 26;
    else if (lang.startsWith("en")) s += 15;
    else return -1;
  } else if (kind === "hi") {
    if (/^hi/.test(lang)) s += 40;
    else return -1;
  } else {
    if (/^ur-pk/.test(lang)) s += 45;
    else if (/^ur/.test(lang)) s += 40;
    else if (/urdu|اردو/i.test(name)) s += 35;
    else return -1;
  }
  if (/natural|neural|online/i.test(name)) s += 30;
  if (/google/i.test(name)) s += 14;
  if (/microsoft/i.test(name)) s += 10;
  if (voice.localService) s += 3;
  if (voice.default) s += 2;
  if (gender === "male") {
    if (MALE.test(name)) s += 22;
    if (FEMALE.test(name)) s -= 12;
  }
  return s;
}

/** Voices that can speak this kind of text, best first. */
export function voicesFor(kind: "en" | "hi" | "ur", gender: "male" | null = null): SpeechSynthesisVoice[] {
  return allVoices()
    .map((voice) => ({ voice, s: score(voice, kind, gender) }))
    .filter((x) => x.s >= 0)
    .sort((a, b) => b.s - a.s)
    .map((x) => x.voice);
}

function pick(kind: "en" | "hi" | "ur", preferred: string | null | undefined, gender: "male" | null): SpeechSynthesisVoice | null {
  const list = voicesFor(kind, gender);
  return (preferred ? list.find((v) => v.name === preferred) : undefined) ?? list[0] ?? null;
}

export type Availability = { supported: boolean; en: number; hi: number; ur: number };
export function availability(): Availability {
  return { supported: supportsSpeech(), en: voicesFor("en").length, hi: voicesFor("hi").length, ur: voicesFor("ur").length };
}

/** Runs `callback` now and whenever the browser finishes loading its voice list (many browsers load voices late). */
export function onVoices(callback: () => void): () => void {
  if (!supportsSpeech()) return () => undefined;
  const synth = window.speechSynthesis;
  callback();
  synth.addEventListener?.("voiceschanged", callback);
  return () => synth.removeEventListener?.("voiceschanged", callback);
}

/* ---------------- Urdu lexicon (fetched once, only when Urdu is spoken) ---------------- */

let lexiconPromise: Promise<Lexicon> | null = null;
export function loadLexicon(): Promise<Lexicon> {
  lexiconPromise ??= fetch("/teacher/ur-lexicon.json")
    .then((r) => (r.ok ? (r.json() as Promise<string[]>) : []))
    .then((words) => new Set(words))
    .catch(() => new Set<string>());
  return lexiconPromise;
}

/* ---------------- planning ---------------- */

const NO_URDU_VOICE =
  "This device has no Urdu or Hindi voice, so Roman Urdu is shown as text only. On Android install the Urdu (or Hindi) voice in Settings → Text-to-speech; on Windows add an Urdu or Hindi voice in Settings → Time & language → Speech. English voice still works.";
const NO_ENGLISH_VOICE = "This browser has no English voice, so the lesson is shown as text only.";

export async function planSpeech(text: string, lang: SpeechLang, prefs: VoicePrefs = {}): Promise<VoicePlan> {
  const gender = prefs.gender ?? null;
  const english = pick("en", prefs.en, gender);
  if (lang === "en") {
    if (!english) return { mode: "none", segments: [], note: NO_ENGLISH_VOICE, sameText: true };
    return { mode: "english", segments: [{ text, voice: english, lang: english.lang }], note: null, sameText: true };
  }
  // Urdu / Roman Urdu: Hindi voices read Devanagari reliably (explicit vowels); Urdu voices need Urdu script. A saved choice wins.
  const hindi = pick("hi", prefs.ur, gender);
  const urdu = pick("ur", prefs.ur, gender);
  const savedIsUrdu = Boolean(prefs.ur && urdu && urdu.name === prefs.ur);
  const target = savedIsUrdu ? "urdu" : hindi ? "hindi" : urdu ? "urdu" : null;
  if (!target) {
    // No Urdu-language voice: the English parts can still be spoken, but a half-spoken line is confusing, so stay silent.
    return { mode: "none", segments: [], note: NO_URDU_VOICE, sameText: false };
  }
  const voice = target === "hindi" ? hindi! : urdu!;
  const lexicon = await loadLexicon();
  const runs: Run[] = splitRuns(text, lexicon);
  const script = target === "hindi" ? "devanagari" : "urdu";
  if (!prefs.split || !english) {
    // One utterance per line in the Urdu/Hindi voice, English terms left in Latin letters: how South Asian speakers mix the languages,
    // and it avoids a choppy line of one-word utterances.
    const mixed = runs.map((run) => (run.kind === "ur" ? convertRun(run.text, script) : run.text)).join("");
    return { mode: target, segments: [{ text: mixed, voice, lang: voice.lang }], note: null, sameText: false };
  }
  const segments: Segment[] = [];
  for (const run of runs) {
    if (!/[A-Za-z]/.test(run.text)) continue;
    if (run.kind === "ur") segments.push({ text: convertRun(run.text, script), voice, lang: voice.lang });
    else segments.push({ text: run.text, voice: english, lang: english.lang });
  }
  return { mode: target, segments, note: null, sameText: false };
}

export type Playback = { cancel: () => void; done: Promise<void> };

/** Queues every segment of a plan on the browser's synthesiser. `onStart` fires when the first segment starts (to start the lips). */
export function speakPlan(plan: VoicePlan, options: { rate?: number; onStart?: () => void; onBoundary?: (charIndex: number) => void } = {}): Playback {
  const synth = window.speechSynthesis;
  const rate = options.rate ?? 1;
  let finished = false;
  let resolveDone: () => void = () => undefined;
  const done = new Promise<void>((resolve) => (resolveDone = resolve));
  const finish = () => {
    if (finished) return;
    finished = true;
    resolveDone();
  };
  const segments = plan.segments.filter((s) => s.text.trim());
  if (!segments.length) {
    finish();
    return { cancel: finish, done };
  }
  synth.cancel();
  segments.forEach((segment, index) => {
    const utterance = new SpeechSynthesisUtterance(segment.text);
    if (segment.voice) utterance.voice = segment.voice;
    utterance.lang = segment.voice?.lang ?? segment.lang;
    utterance.rate = Math.max(0.5, Math.min(2, (plan.mode === "english" ? 0.97 : 0.92) * rate));
    if (index === 0) utterance.onstart = () => options.onStart?.();
    if (plan.sameText) utterance.onboundary = (event) => (event.name === "sentence" ? undefined : options.onBoundary?.(event.charIndex));
    if (index === segments.length - 1) {
      utterance.onend = finish;
    }
    utterance.onerror = (event) => {
      // "canceled"/"interrupted" are what cancel() causes; anything else must not leave the lesson waiting.
      if (index === segments.length - 1 || (event as SpeechSynthesisErrorEvent).error !== "interrupted") finish();
    };
    synth.speak(utterance);
  });
  return {
    cancel: () => {
      try {
        synth.cancel();
      } catch {
        /* ignore */
      }
      finish();
    },
    done,
  };
}

/* ---------------- remembered choices ---------------- */

const KEY = { en: "pna-voice-en", ur: "pna-voice-ur", split: "pna-voice-split" } as const;
export function readPrefs(): VoicePrefs {
  try {
    return { en: window.localStorage.getItem(KEY.en), ur: window.localStorage.getItem(KEY.ur), split: window.localStorage.getItem(KEY.split) === "1" };
  } catch {
    return {};
  }
}
export function savePref(kind: "en" | "ur" | "split", value: string | null) {
  try {
    if (value) window.localStorage.setItem(KEY[kind], value);
    else window.localStorage.removeItem(KEY[kind]);
  } catch {
    /* storage blocked */
  }
}

/* ---------------- one call for the simple readers ---------------- */

/**
 * Reads one text aloud in the given language with the best voice (see planSpeech). Returns the playback, or null when the device has no
 * suitable voice (then `onNote` receives the reason). `onStart` / `onEnd` bracket the speech so callers can pace themselves.
 */
export async function speakText(
  text: string,
  lang: SpeechLang,
  options: { rate?: number; gender?: "male" | null; onStart?: () => void; onEnd?: () => void; onNote?: (note: string | null) => void; isCurrent?: () => boolean } = {},
): Promise<Playback | null> {
  if (!supportsSpeech()) {
    options.onEnd?.();
    return null;
  }
  const plan = await planSpeech(text, lang, { ...readPrefs(), gender: options.gender ?? null });
  options.onNote?.(plan.note);
  if (options.isCurrent && !options.isCurrent()) return null; // a newer line started while the voice was being chosen
  if (plan.mode === "none") {
    options.onEnd?.();
    return null;
  }
  const playback = speakPlan(plan, { rate: options.rate, onStart: options.onStart });
  void playback.done.then(() => options.onEnd?.());
  return playback;
}
