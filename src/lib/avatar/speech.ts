/**
 * Speaking for the teaching avatar (browser only). Voice is the browser's own free text-to-speech (English only — an English
 * voice reads Roman Urdu wrongly, so in Roman Urdu the lines are shown as subtitles while the mouth still moves). The mouth is
 * driven from the text on a timeline (vowel shapes, closed lips on b/m/p, pauses at punctuation) that starts when the voice starts and
 * is re-synchronised on every word-boundary event the browser reports. Where boundary events do not exist (most phones) the timeline
 * simply runs at the speaking rate. No microphone, no camera, no network.
 */
import type { FaceAnimator, MouthShape } from "./face";
import { CLOSED } from "./face";

export type Lang = "en" | "ur";

const VOWEL: Record<string, MouthShape> = {
  a: { open: 0.85, wide: 0.25, round: 0, smile: 0 },
  e: { open: 0.5, wide: 0.65, round: 0, smile: 0 },
  i: { open: 0.3, wide: 0.9, round: 0, smile: 0 },
  o: { open: 0.6, wide: 0, round: 0.85, smile: 0 },
  u: { open: 0.3, wide: 0, round: 1, smile: 0 },
  w: { open: 0.2, wide: 0, round: 0.9, smile: 0 },
};
const SOFT: MouthShape = { open: 0.22, wide: 0.1, round: 0, smile: 0 };
const TEETH: MouthShape = { open: 0.14, wide: 0.45, round: 0, smile: 0 };

function shapeFor(ch: string): MouthShape {
  const c = ch.toLowerCase();
  if (VOWEL[c]) return VOWEL[c];
  if (c === "y") return VOWEL.i;
  if ("bmp".includes(c)) return CLOSED;
  if ("fv".includes(c)) return TEETH;
  if ("sz".includes(c)) return TEETH;
  if (/[a-z]/.test(c)) return SOFT;
  return CLOSED;
}

/** Plain speaking text: markdown emphasis removed, whitespace collapsed. */
export function speakable(text: string) {
  return text.replace(/\*\*/g, "").replace(/[`_]/g, "").replace(/\s+/g, " ").trim();
}

type Timeline = { total: number; starts: Float32Array; text: string };

function buildTimeline(text: string, charsPerSecond: number): Timeline {
  const starts = new Float32Array(text.length + 1);
  let t = 0;
  for (let i = 0; i < text.length; i++) {
    starts[i] = t;
    const ch = text[i];
    t += 1 / charsPerSecond;
    if (ch === "," || ch === ";" || ch === ":") t += 0.16;
    else if (ch === "." || ch === "?" || ch === "!") t += 0.34;
  }
  starts[text.length] = t;
  return { total: t, starts, text };
}

function pickVoice(): SpeechSynthesisVoice | null {
  if (typeof window === "undefined" || !("speechSynthesis" in window)) return null;
  const voices = window.speechSynthesis.getVoices().filter((voice) => voice.lang.toLowerCase().startsWith("en"));
  return (
    voices.find((voice) => /en-(in|pk)/i.test(voice.lang)) ??
    voices.find((voice) => /en-gb/i.test(voice.lang)) ??
    voices.find((voice) => voice.default) ??
    voices[0] ??
    null
  );
}

export class Speaker {
  private timeline: Timeline | null = null;
  private clock = 0;
  private paused = false;
  private resolve: (() => void) | null = null;
  private utterance: SpeechSynthesisUtterance | null = null;
  private voiceHeard = false;
  /** Mouth openness scale (reduced in light mode / reduced motion). */
  intensity = 1;
  /** Speaking-rate multiplier for the whole player. */
  rate = 1;

  constructor(private face: FaceAnimator) {}

  get speaking() {
    return this.timeline !== null;
  }

  /** 0–1 progress through the current line. */
  get progress() {
    return this.timeline ? Math.min(1, this.clock / Math.max(0.001, this.timeline.total)) : 0;
  }

  /** Speaks (and/or lip-syncs) one line. Resolves when finished or cancelled. Voice only in English and only if `voice` is true. */
  speak(raw: string, options: { lang: Lang; voice: boolean }): Promise<void> {
    this.cancel();
    const text = speakable(raw);
    const cps = 14.5 * this.rate;
    this.timeline = buildTimeline(text, cps);
    this.clock = 0;
    this.voiceHeard = false;
    return new Promise<void>((resolve) => {
      this.resolve = resolve;
      if (options.voice && options.lang === "en" && typeof window !== "undefined" && "speechSynthesis" in window && typeof SpeechSynthesisUtterance !== "undefined") {
        try {
          const synth = window.speechSynthesis;
          synth.cancel();
          const utterance = new SpeechSynthesisUtterance(text);
          const voice = pickVoice();
          if (voice) utterance.voice = voice;
          utterance.lang = voice?.lang ?? "en-GB";
          utterance.rate = 0.97 * this.rate;
          utterance.onstart = () => {
            this.voiceHeard = true;
            this.clock = 0;
          };
          utterance.onboundary = (event) => {
            const tl = this.timeline;
            if (!tl || event.name === "sentence") return;
            const at = tl.starts[Math.min(event.charIndex, tl.text.length)] ?? this.clock;
            // Re-sync the lips to the voice, but never jump backwards by more than a word.
            if (Math.abs(at - this.clock) > 0.12) this.clock = at;
          };
          utterance.onend = () => this.finish();
          utterance.onerror = () => this.finish();
          this.utterance = utterance;
          synth.speak(utterance);
        } catch {
          /* silent timeline only */
        }
      }
    });
  }

  pause() {
    this.paused = true;
    try {
      window.speechSynthesis?.pause();
    } catch {
      /* ignore */
    }
    this.face.mouth = { ...CLOSED };
  }

  resume() {
    this.paused = false;
    try {
      window.speechSynthesis?.resume();
    } catch {
      /* ignore */
    }
  }

  cancel() {
    try {
      window.speechSynthesis?.cancel();
    } catch {
      /* ignore */
    }
    this.utterance = null;
    this.finish();
  }

  private finish() {
    this.timeline = null;
    this.face.mouth = { ...CLOSED };
    const done = this.resolve;
    this.resolve = null;
    done?.();
  }

  /** Call every frame. Moves the mouth along the timeline. */
  tick(dt: number) {
    const tl = this.timeline;
    if (!tl || this.paused) return;
    this.clock += dt;
    if (this.clock >= tl.total + 0.15) {
      // A voice may run a little longer than the estimate: wait for it unless it never started.
      if (!this.utterance || !this.voiceHeard || this.clock > tl.total + 4) this.finish();
      else this.face.mouth = { ...CLOSED };
      return;
    }
    // Find the character at the clock (starts is monotonic).
    let lo = 0, hi = tl.text.length;
    while (lo < hi) {
      const mid = (lo + hi) >> 1;
      if (tl.starts[mid + 1] <= this.clock) lo = mid + 1;
      else hi = mid;
    }
    const shape = shapeFor(tl.text[Math.min(lo, tl.text.length - 1)] ?? " ");
    const k = this.intensity;
    this.face.mouth = { open: shape.open * k, wide: shape.wide * k, round: shape.round * k, smile: 0.08 };
  }
}
