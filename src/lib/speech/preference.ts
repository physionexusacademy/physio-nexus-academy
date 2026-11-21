/**
 * The one voice setting of the whole site: every 3D model that can speak (the RehabVerse exercise player and guide, the PNA Teacher's
 * demonstrations) is ON by default and follows this setting, so nobody has to find a small speaker button first. Turning the speaker off
 * on any model is remembered (this browser) and applies to all of them; turning it on again does the same.
 *
 * Browsers only let sound start after a tap or key press on the page. When the voice is on but the browser is still blocking sound, `locked`
 * is true: the model shows a small "tap to hear" hint, and the first tap anywhere starts the voice (see lib/speech/recorded.ts).
 * Safe to import on the server: the server snapshot is "on", and nothing touches the browser until a component using the hook is shown.
 */
import { useSyncExternalStore } from "react";
import { audioRunning, onAudioState, prepareAudio, recordedSupported, unlockRecorded } from "./recorded";

const KEY = "pna-voice";
/** Where the 3D demonstrations kept their own switch before there was one setting: "0" was a deliberate "off", so it still is. */
const LEGACY_KEY = "pna-avatar-voice";

const listeners = new Set<() => void>();
/** The choice, when this browser does not let the page store it. */
let memory: boolean | null = null;

/** True unless this person has turned the voice off. */
export function readVoicePreference(): boolean {
  try {
    const stored = window.localStorage.getItem(KEY);
    if (stored === "0") return false;
    if (stored === "1") return true;
    return window.localStorage.getItem(LEGACY_KEY) !== "0";
  } catch {
    return true; // storage blocked (private mode): the default
  }
}

export function setVoicePreference(on: boolean) {
  try {
    window.localStorage.setItem(KEY, on ? "1" : "0");
    window.localStorage.setItem(LEGACY_KEY, on ? "1" : "0");
  } catch {
    /* storage blocked: the choice lasts until the page is closed, in every component that listens */
    memory = on;
  }
  listeners.forEach((listener) => listener());
}

const read = () => (memory !== null ? memory : readVoicePreference());

function subscribePreference(onChange: () => void) {
  listeners.add(onChange);
  const onStorage = (event: StorageEvent) => {
    if (event.key === KEY || event.key === null) onChange();
  };
  window.addEventListener("storage", onStorage);
  return () => {
    listeners.delete(onChange);
    window.removeEventListener("storage", onStorage);
  };
}

/** [voice on?, set it]: the shared setting. On by default. */
export function useVoicePreference(): [boolean, (on: boolean) => void] {
  const on = useSyncExternalStore(subscribePreference, read, () => true);
  return [on, setVoicePreference];
}

const subscribeSupport = () => () => undefined;
/** The audio output is made as soon as a model that could speak is shown, so the first tap only has to resume it. */
function subscribeAudio(onChange: () => void) {
  if (!recordedSupported()) return () => undefined;
  prepareAudio();
  return onAudioState(onChange);
}

/**
 * What a model needs to speak: `voice` (the shared setting), `supported` (this browser can play the recordings), `locked` (voice is on and
 * supported, but the browser still blocks sound until the next tap) and `speaking` = voice on, supported and not locked: speak only then.
 */
export function useVoice() {
  const [voice, setVoice] = useVoicePreference();
  const supported = useSyncExternalStore(subscribeSupport, recordedSupported, () => false);
  const running = useSyncExternalStore(subscribeAudio, audioRunning, () => false);
  const locked = voice && supported && !running;
  return { voice, setVoice, supported, locked, speaking: voice && supported && running, unlock: unlockRecorded };
}
