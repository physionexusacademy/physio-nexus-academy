/**
 * Reading text aloud in English, Urdu and Roman Urdu (free, nothing is sent anywhere). The therapist is a man, so the voice is always male.
 *
 *  - Voice: a voice the device is *known* to offer as male and that is installed on the device (so it starts at once). Phones and many
 *    computers have none, so there is always Dr. Sajjad's own built-in male voice (builtin.ts), the same on every device. A female voice,
 *    or one whose name does not say it is male, is never used; neither is a voice that is streamed from the internet (it would lag).
 *  - English: Indian/Pakistani/British English first. Urdu / Roman Urdu: the site's Urdu is Roman Urdu mixed with English terms. Urdu
 *    words are converted (roman-urdu.ts) to Devanagari (a Hindi voice reads it reliably) or Urdu script; English terms in the same line
 *    stay with the English voice.
 *  - When neither exists, the plan says so and the caller shows subtitles only.
 * Browser only: import it from client code (the helpers are safe to import on the server, they just do nothing there).
 */
import { convertRun, splitRuns, type Lexicon, type Run } from "./roman-urdu";
import { BUILTIN_VOICE, builtinSupported, cancelBuiltin, speakBuiltin, unlockAudio, warmBuiltin, type BuiltinLang, type BuiltinPlayback } from "./builtin";
export { BUILTIN_LABEL, BUILTIN_VOICE, builtinSupported, unlockAudio, warmBuiltin } from "./builtin";

export type SpeechLang = "en" | "ur";
export type Segment = { text: string; voice: SpeechSynthesisVoice | null; lang: string; builtin?: BuiltinLang };
export type VoicePlan = {
  mode: "english" | "hindi" | "urdu" | "none";
  /** Which speaker reads it: a male voice installed on the device, or Dr. Sajjad's built-in male voice. */
  engine: "device" | "builtin" | "none";
  segments: Segment[];
  /** Plain-language note for the person when something is missing (shown next to the voice button). */
  note: string | null;
  /** True when the spoken text is the displayed text (so word-boundary events can be used to keep the lips in sync). */
  sameText: boolean;
};
export type VoicePrefs = {
  en?: string | null;
  ur?: string | null;
  /** Whose voice to use. Default "male": the therapist is a man. (`null` lifts the restriction; nothing on the site does that.) */
  gender?: "male" | null;
  /** Read English terms inside Urdu lines with the English voice (several short utterances) instead of one code-mixed utterance. */
  split?: boolean;
};

const supportsDeviceSpeech = () => typeof window !== "undefined" && "speechSynthesis" in window && typeof SpeechSynthesisUtterance !== "undefined";
/** True when something can speak here: the device's own synthesiser or the built-in male voice. */
export const supportsSpeech = () => supportsDeviceSpeech() || builtinSupported();

/** Voice names that identify a man's or a woman's voice (Windows/Edge, macOS, Chrome desktop). Phones often give no gender in the name: those voices are not used (the built-in male voice covers them). */
const MALE =
  /\b(male|david|mark|guy|ryan|ravi|prabhat|hemant|madhur|asad|rishi|daniel|alex|fred|james|george|thomas|oliver|aaron|arthur|eric|davis|brian|christopher|roger|steffan|liam|connor|william|jorge|diego|male voice|google uk english male)\b/i;
const FEMALE =
  /\b(female|zira|hazel|susan|swara|kalpana|uzma|heera|samantha|karen|moira|lekha|tessa|veena|fiona|kate|serena|neerja|aria|jenny|ava|emma|libby|sonia|michelle|monica|paulina|google us english|google (\u0939\u093f\u0928\u094d\u0926\u0940|hindi)|google \u0627\u0631\u062f\u0648)\b|google (\u0939\u093f\u0928\u094d\u0926\u0940|hindi|\u0627\u0631\u062f\u0648)/i;

export type Gender = "male" | "female" | null;
/** The gender a voice's name tells us, if any. */
export function genderOf(voice: { name: string }): Gender {
  if (MALE.test(voice.name) && !/female/i.test(voice.name)) return "male";
  if (FEMALE.test(voice.name)) return "female";
  return null;
}

function allVoices(): SpeechSynthesisVoice[] {
  return supportsDeviceSpeech() ? window.speechSynthesis.getVoices() : [];
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
  // The therapist is a man: only a voice known to be male, installed on the device (a streamed one would lag), is eligible.
  if (gender === "male" && (genderOf(voice) !== "male" || voice.localService === false)) return -1;
  return s;
}

/** Device voices that can speak this kind of text, best first. With `"male"` only male voices installed on the device are listed. */
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

const NO_MALE_VOICE =
  "No male voice is available in this browser, so the lines are shown as text only. (The therapist's voice is always male; the built-in voice needs a current browser.)";

/**
 * Chooses the voice for a line and prepares the text. The saved choice (the built-in voice, or the name of a male voice installed on the
 * device) wins; otherwise the best male device voice for the language; otherwise Dr. Sajjad's built-in male voice. Never a female voice.
 */
export async function planSpeech(text: string, lang: SpeechLang, prefs: VoicePrefs = {}): Promise<VoicePlan> {
  const gender: "male" | null = prefs.gender === null ? null : "male";
  const saved = lang === "en" ? prefs.en : prefs.ur;
  const builtinChosen = saved === BUILTIN_VOICE;
  const builtinOk = builtinSupported();

  if (lang === "en") {
    const english = builtinChosen ? null : pick("en", prefs.en, gender);
    if (english) return { mode: "english", engine: "device", segments: [{ text, voice: english, lang: english.lang }], note: null, sameText: true };
    if (builtinOk) return { mode: "english", engine: "builtin", segments: [{ text, voice: null, lang: "en-us", builtin: "en-us" }], note: null, sameText: true };
    return { mode: "none", engine: "none", segments: [], note: NO_MALE_VOICE, sameText: true };
  }

  // Urdu / Roman Urdu: Hindi voices read Devanagari reliably (explicit vowels); Urdu voices need Urdu script. A saved choice wins.
  const hindi = builtinChosen ? null : pick("hi", prefs.ur, gender);
  const urdu = builtinChosen ? null : pick("ur", prefs.ur, gender);
  const savedIsUrdu = Boolean(prefs.ur && urdu && urdu.name === prefs.ur);
  const target = savedIsUrdu ? "urdu" : hindi ? "hindi" : urdu ? "urdu" : null;
  const lexicon = await loadLexicon();
  const runs: Run[] = splitRuns(text, lexicon);
  if (!target) {
    if (!builtinOk) return { mode: "none", engine: "none", segments: [], note: NO_MALE_VOICE, sameText: false };
    // One line, one voice: the built-in Hindi voice reads the Urdu words (as Devanagari) and switches by itself to English for the
    // English terms left in Latin letters (eSpeak NG changes language per word), so a mixed line flows like one speaker.
    const mixed = runs.map((run) => (run.kind === "ur" ? convertRun(run.text, "devanagari") : run.text)).join("");
    return { mode: "hindi", engine: "builtin", segments: [{ text: mixed, voice: null, lang: "hi", builtin: "hi" }], note: null, sameText: false };
  }
  const voice = target === "hindi" ? hindi! : urdu!;
  const english = pick("en", prefs.en, gender);
  const script = target === "hindi" ? "devanagari" : "urdu";
  if (!prefs.split || !english) {
    // One utterance per line in the Urdu/Hindi voice, English terms left in Latin letters: how South Asian speakers mix the languages,
    // and it avoids a choppy line of one-word utterances.
    const mixed = runs.map((run) => (run.kind === "ur" ? convertRun(run.text, script) : run.text)).join("");
    return { mode: target, engine: "device", segments: [{ text: mixed, voice, lang: voice.lang }], note: null, sameText: false };
  }
  const segments: Segment[] = [];
  for (const run of runs) {
    if (!/[A-Za-z]/.test(run.text)) continue;
    if (run.kind === "ur") segments.push({ text: convertRun(run.text, script), voice, lang: voice.lang });
    else segments.push({ text: run.text, voice: english, lang: english.lang });
  }
  return { mode: target, engine: "device", segments, note: null, sameText: false };
}

/** Stops all speech: the device synthesiser and the built-in voice. */
export function stopSpeaking() {
  try {
    if (supportsDeviceSpeech()) window.speechSynthesis.cancel();
  } catch {
    /* ignore */
  }
  cancelBuiltin();
}

export type Playback = {
  cancel: () => void;
  done: Promise<void>;
  /** Present for the built-in voice (the device synthesiser is paused through `speechSynthesis`). */
  pause?: () => void;
  resume?: () => void;
};

/**
 * Speaks a plan. `onStart` fires when the first segment starts (to start the lips); `onBoundary` (device voices) re-syncs the lips on
 * every word; `onDuration` (built-in voice) gives the real length of the line in seconds once it is known.
 */
export function speakPlan(
  plan: VoicePlan,
  options: { rate?: number; onStart?: () => void; onBoundary?: (charIndex: number) => void; onDuration?: (seconds: number) => void } = {},
): Playback {
  if (plan.engine === "builtin") {
    const parts = plan.segments.filter((s) => s.text.trim()).map((s) => ({ text: s.text, lang: s.builtin ?? "en-us" }));
    const playback: BuiltinPlayback = speakBuiltin(parts, { rate: options.rate, onStart: options.onStart, onDuration: options.onDuration });
    return playback;
  }
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
  // Called straight from a tap (listen / voice button): this is the moment a browser lets the built-in voice make sound.
  unlockAudio();
  warmBuiltin();
  const plan = await planSpeech(text, lang, { ...readPrefs(), gender: options.gender === null ? null : "male" });
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
