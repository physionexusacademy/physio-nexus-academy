/**
 * The PNA Teacher's voice: recordings, not a synthesiser (browser only).
 *
 * Every fixed line the site can read aloud, in English and in Roman Urdu (the 3D guide and demonstrations, the RehabVerse guide and
 * exercise cues, and lessons as they are recorded), was read once, offline, with a free neural voice (Kokoro: "George" for English,
 * "Psi" for Urdu; Apache-2.0; see scripts/voice/README.md and public/voice/george/README.txt) and saved as small MP3 packs. Playing a line is only playing the
 * sentences' recordings one after another: nothing is generated on the visitor's device, so it starts at once on any phone, uses no
 * processor to speak of, and sounds the same everywhere. There is no robotic fallback: a line that has no recording is not spoken (the
 * subtitles are always shown).
 *
 * Files (public/voice/george/): packs.json (the names of the packs, tiny), clips.json (every sentence's key -> pack, start, length in
 * ms; loaded the first time something is spoken) and <pack>.<hash>.mp3 (a pack is decoded once and kept for the next lines; its file
 * name carries a hash of its content, so a browser keeps it for ever).
 * Sentences are found by sentenceKey (clip-key.ts), the same function the script that makes the recordings uses; Urdu sentences have
 * their own keys and packs ("ur-<pack>").
 */
import { sentenceKey, splitSentences } from "./clip-key";

export const VOICE_BASE = "/voice/george/";
export const VOICE_NAME = "George";

type Clips = { v: number; voice: string; packs: string[]; clips: Record<string, [number, number, number]> };
/** One piece of a pack to play, in seconds. */
export type Part = { pack: string; start: number; dur: number };
export type RecordedPlayback = { cancel: () => void; pause: () => void; resume: () => void; done: Promise<void> };

type AudioContextClass = typeof AudioContext;
const audioContextClass = (): AudioContextClass | null =>
  typeof window === "undefined" ? null : window.AudioContext ?? (window as unknown as { webkitAudioContext?: AudioContextClass }).webkitAudioContext ?? null;

/** True when this browser can play the recordings (Web Audio and fetch). */
export const recordedSupported = () => typeof window !== "undefined" && typeof fetch === "function" && audioContextClass() !== null;

/* ---------------- what is recorded ---------------- */

let packNames: Promise<string[]> | null = null;
/** The names of the packs ("avatar", "rehab", "lesson-<slug>" ...): a tiny file, so a page can find out cheaply whether its lines are recorded. */
export function recordedPacks(): Promise<string[]> {
  if (!packNames) {
    packNames = fetch(VOICE_BASE + "packs.json")
      .then((response) => (response.ok ? (response.json() as Promise<string[]>) : []))
      .catch(() => [] as string[])
      .then((names) => {
        if (!names.length) packNames = null; // try again next time (offline, or not deployed yet)
        return names;
      });
  }
  return packNames;
}

let clipIndex: Promise<Clips | null> | null = null;
function loadClips(): Promise<Clips | null> {
  if (!clipIndex) {
    clipIndex = fetch(VOICE_BASE + "clips.json")
      .then((response) => (response.ok ? (response.json() as Promise<Clips>) : null))
      .catch(() => null)
      .then((index) => {
        if (!index) clipIndex = null;
        return index;
      });
  }
  return clipIndex;
}

/**
 * The recordings that make up a line of speakable text (see toSpoken), or null when any of its sentences has none (a line is spoken
 * completely or not at all: half a line would sound like a fault).
 */
export async function findRecording(spoken: string, lang: "en" | "ur" = "en"): Promise<Part[] | null> {
  const sentences = splitSentences(spoken);
  if (!sentences.length) return null;
  const index = await loadClips();
  if (!index) return null;
  const parts: Part[] = [];
  for (const sentence of sentences) {
    const clip = index.clips[sentenceKey(sentence, lang)];
    if (!clip) return null;
    const pack = index.packs[clip[0]];
    const part = { pack, start: clip[1] / 1000, dur: clip[2] / 1000 };
    const last = parts[parts.length - 1];
    // neighbours in the same pack play as one piece (no seam)
    if (last && last.pack === pack && Math.abs(last.start + last.dur - part.start) < 0.002) last.dur += part.dur;
    else parts.push(part);
  }
  return parts;
}

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
export function unlockRecorded() {
  const c = audio();
  if (c && c.state !== "running") void c.resume().catch(() => undefined);
}
function resumeIfCreated() {
  if (context && context.state !== "running") void context.resume().catch(() => undefined);
}
if (typeof window !== "undefined") {
  // The first tap or key press anywhere on the page lets the browser start the voice (iOS wants a click or touchend, others a pointerdown).
  for (const type of ["pointerdown", "click", "keydown", "touchend"] as const) window.addEventListener(type, resumeIfCreated, { capture: true, passive: true });
}

/** Makes the audio output now (it stays "suspended" until the browser allows sound), so the first tap only has to resume it. Safe to call often. */
export function prepareAudio() {
  audio();
}

/** True when sound can play right now (the browser has allowed it). */
export function audioRunning(): boolean {
  return context !== null && context.state === "running";
}

/** Calls `onChange` whenever the audio output starts or stops being allowed to play. Returns the function that stops listening. */
export function onAudioState(onChange: () => void): () => void {
  const c = audio();
  if (!c) return () => undefined;
  c.addEventListener("statechange", onChange);
  return () => c.removeEventListener("statechange", onChange);
}

/* ---------------- packs (downloaded and decoded once) ---------------- */

const KEEP_PACKS = 2;
const decoded = new Map<string, Promise<AudioBuffer>>();
function decodePack(pack: string, c: AudioContext): Promise<AudioBuffer> {
  const known = decoded.get(pack);
  if (known) {
    decoded.delete(pack); // move to the end: most recently used
    decoded.set(pack, known);
    return known;
  }
  const promise = fetch(`${VOICE_BASE}${pack}.mp3`)
    .then((response) => {
      if (!response.ok) throw new Error(`voice pack ${pack}: ${response.status}`);
      return response.arrayBuffer();
    })
    .then((bytes) => new Promise<AudioBuffer>((resolve, reject) => c.decodeAudioData(bytes, resolve, reject)));
  decoded.set(pack, promise);
  promise.catch(() => decoded.delete(pack));
  while (decoded.size > KEEP_PACKS) decoded.delete(decoded.keys().next().value as string);
  return promise;
}

/** Starts downloading and decoding the packs a line needs (its parts), so that its first playing does not start late. Safe to call often. */
export function warmParts(parts: Part[]) {
  const c = audio();
  if (!c) return;
  for (const pack of new Set(parts.map((part) => part.pack))) void decodePack(pack, c).catch(() => undefined);
}

/** Starts downloading a pack in the background by its name (for example "avatar-site-tour", when the voice is switched on). Safe to call often. */
export async function warmPack(name: string) {
  const c = audio();
  const index = await loadClips();
  const stem = index?.packs.find((pack) => pack.startsWith(name + "."));
  if (c && stem) void decodePack(stem, c).catch(() => undefined);
}

/* ---------------- playing ---------------- */

const active = new Set<RecordedPlayback>();
/** Stops whatever is being said. */
export function cancelRecorded() {
  for (const playback of [...active]) playback.cancel();
}

/**
 * Plays the parts one after another. `onStart` fires when sound starts; `onDuration` gives the length of the whole line in seconds
 * (at the speed asked for) so the lips can be spread over it.
 */
export function playRecording(parts: Part[], options: { rate?: number; onStart?: () => void; onDuration?: (seconds: number) => void } = {}): RecordedPlayback {
  cancelRecorded(); // one speaker at a time: a new line ends the previous one
  const c = audio();
  const sources: AudioBufferSourceNode[] = [];
  let cancelled = false;
  let finished = false;
  let resolveDone: () => void = () => undefined;
  const done = new Promise<void>((resolve) => (resolveDone = resolve));
  const finish = () => {
    if (finished) return;
    finished = true;
    active.delete(handle);
    resolveDone();
  };
  const handle: RecordedPlayback = {
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
  if (!c || !parts.length) {
    finish();
    return handle;
  }
  active.add(handle);
  void (async () => {
    try {
      if (c.state === "suspended") {
        // No tap yet (a browser rule): give it a moment, then stay silent rather than wait forever.
        await Promise.race([c.resume().catch(() => undefined), new Promise((resolve) => setTimeout(resolve, 1200))]);
        if (c.state === "suspended") {
          finish();
          return;
        }
      }
      const buffers = await Promise.all(parts.map((part) => decodePack(part.pack, c)));
      if (cancelled) return;
      // The recording is only sped up or slowed a little (a bigger change would change the pitch too); the lips follow the real length.
      const rate = Math.min(1.12, Math.max(0.9, options.rate ?? 1));
      let when = c.currentTime + 0.04;
      let last: AudioBufferSourceNode | null = null;
      parts.forEach((part, i) => {
        const source = c.createBufferSource();
        source.buffer = buffers[i];
        source.playbackRate.value = rate;
        source.connect(c.destination);
        source.start(when, part.start, part.dur);
        sources.push(source);
        last = source;
        when += part.dur / rate;
      });
      options.onStart?.();
      options.onDuration?.(when - c.currentTime);
      if (last) (last as AudioBufferSourceNode).onended = finish;
      else finish();
    } catch {
      finish();
    }
  })();
  return handle;
}
