/**
 * Reading text aloud: the PNA Teacher's recorded voice (see recorded.ts). The therapist is a man, so the voice is a man's (George).
 *
 * There is no speech synthesiser any more, neither the device's nor a built-in one: a synthetic voice sounded robotic, and a neural voice
 * is too heavy to run on a visitor's phone. So a line is spoken only when it was recorded (the 3D guide and demonstrations, the RehabVerse
 * guide and exercise cues, and lessons as they are recorded); otherwise it is shown as text. Roman Urdu is shown as text (no Urdu recording).
 * Everything here is safe to import on the server: the helpers simply do nothing there.
 */
import { toSpoken } from "./spoken";
import { cancelRecorded, findRecording, playRecording, recordedSupported, unlockRecorded, type Part } from "./recorded";

export type SpeechLang = "en" | "ur";

export const NOTE_ROMAN_URDU = "The voice is in English for now. Roman Urdu is shown as text.";
export const NOTE_NO_RECORDING = "This line has no recording yet, so it is shown as text.";

export type VoicePlan = {
  mode: "english" | "none";
  engine: "recorded" | "none";
  parts: Part[];
  /** Plain-language note for the person when a line is not spoken (shown next to the voice button). */
  note: string | null;
};

/** True when this browser can play the recorded voice. */
export const supportsSpeech = () => recordedSupported();
/** Lets the browser play sound: call it from the tap that turns the voice on or starts a line. */
export const unlockAudio = unlockRecorded;

const none = (note: string | null): VoicePlan => ({ mode: "none", engine: "none", parts: [], note });

/** Finds the recording of a line (English only). */
export async function planSpeech(written: string, lang: SpeechLang): Promise<VoicePlan> {
  if (lang !== "en") return none(NOTE_ROMAN_URDU);
  const parts = await findRecording(toSpoken(written, "en"));
  return parts ? { mode: "english", engine: "recorded", parts, note: null } : none(NOTE_NO_RECORDING);
}

/** Stops all speech. */
export function stopSpeaking() {
  cancelRecorded();
}

export type Playback = {
  cancel: () => void;
  done: Promise<void>;
  pause?: () => void;
  resume?: () => void;
};

/** Speaks a plan. `onStart` fires when sound starts; `onDuration` gives the real length of the line in seconds (to spread the lips over it). */
export function speakPlan(plan: VoicePlan, options: { rate?: number; onStart?: () => void; onDuration?: (seconds: number) => void } = {}): Playback {
  return playRecording(plan.parts, options);
}

/**
 * Reads one text aloud with the recorded voice. Returns the playback, or null when the line is not recorded (then `onNote` receives the
 * reason and `onEnd` is called). `onStart` / `onEnd` bracket the speech so callers can pace themselves.
 */
export async function speakText(
  text: string,
  lang: SpeechLang,
  options: { rate?: number; onStart?: () => void; onEnd?: () => void; onNote?: (note: string | null) => void; isCurrent?: () => boolean } = {},
): Promise<Playback | null> {
  if (!supportsSpeech()) {
    options.onEnd?.();
    return null;
  }
  // Called straight from a tap (listen / voice button): this is the moment a browser lets sound play.
  unlockAudio();
  const plan = await planSpeech(text, lang);
  options.onNote?.(plan.note);
  if (options.isCurrent && !options.isCurrent()) return null; // a newer line started while the recording was being looked up
  if (plan.mode === "none") {
    options.onEnd?.();
    return null;
  }
  const playback = speakPlan(plan, { rate: options.rate, onStart: options.onStart });
  void playback.done.then(() => options.onEnd?.());
  return playback;
}
