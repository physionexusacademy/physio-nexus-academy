import type { Parts } from "../virtual-patient/parts.ts";
import type { Gesture } from "./guide.ts";

/**
 * How the virtual physiotherapist guide moves while it talks. Pure functions of time, so the browser, the development lab page and the
 * validator all use the same numbers. The guide's right arm is "shoulder" (it appears on the viewer's left), the other arm is "shoulder:o".
 *
 * What a person does, and what this reproduces:
 *   - a hello wave is the arm raised with the elbow bent and the forearm upright; the forearm sways side to side (elbow) and the hand flicks
 *     (wrist). The shoulder does NOT rotate in and out: that is a shoulder rotation test, not a greeting;
 *   - while talking the hands drift, the elbows breathe, the head nods and tilts a little, and the fingers are loosely curled, never ruler-straight;
 *   - to direct attention a presenter opens a palm (palm up) towards the thing, rather than holding an arm out stiffly at shoulder height.
 */
export const RELAXED: Parts = { hand: { flex: 14 }, "hand:o": { flex: 14 } };
export const IDLE: Parts = { shoulder: { flex: 4, abd: 8 }, "shoulder:o": { flex: 4, abd: 8 }, elbow: { flex: 20 }, "elbow:o": { flex: 20 }, ...RELAXED };

/** Radians per second of the hello wave (about 1.7 waves a second, like a friendly hand). */
export const WAVE_RATE = 10.5;

/** A hello is a couple of seconds, not a whole sentence: after this long the hand comes down and he simply keeps talking. */
export const WAVE_SECONDS = 3;

/**
 * Target pose for a gesture at time t (seconds); `talk` is 1 while the guide is speaking, 0 otherwise.
 * `since` is how long this gesture has been going (a wave ends by itself).
 */
export function gestureParts(gesture: Gesture, t: number, talk: number, since = 0): Parts {
  const s = (rate: number, phase = 0) => Math.sin(t * rate + phase);
  // breathing, a slow weight shift and, while talking, small head movements and drifting hands
  const base: Parts = {
    ...IDLE,
    trunk: { flex: 1 + 0.8 * s(1.4), rot: 1.2 * s(0.45), abd: 0.8 * s(0.33) },
    neck: { flex: 1.5 * talk * s(2.4), rot: 3 * s(0.55), abd: 1.6 * s(0.8, 1) },
    shoulder: { flex: 4 + talk * 2.2 * s(1.9), abd: 8 + talk * 1.5 * s(1.3) },
    "shoulder:o": { flex: 4 + talk * 2.2 * s(1.7, 1.4), abd: 8 + talk * 1.5 * s(1.1, 0.6) },
    elbow: { flex: 20 + talk * 5 * s(2.3) },
    "elbow:o": { flex: 20 + talk * 5 * s(2.1, 0.9) },
    hand: { flex: 14 + talk * 4 * s(3.1) },
    "hand:o": { flex: 14 + talk * 4 * s(2.9, 1.1) },
  };
  // a talking hand lifts a little on every beat of speech
  const beat = talk * Math.max(0, s(2.6)) ** 3;
  if (gesture === "wave" && since > WAVE_SECONDS) gesture = "calm";
  switch (gesture) {
    case "wave": {
      const w = s(WAVE_RATE);
      return {
        ...base,
        shoulder: { abd: 58, flex: 32, rot: -72 + 4 * w },
        elbow: { flex: 108 + 17 * w },
        wrist: { abd: -14 * w },
        hand: { flex: 0 },
        neck: { flex: 1, rot: 3 * s(0.55), abd: 3 + 1.2 * s(0.8) },
      };
    }
    case "open": {
      // both hands open in front, palms up and slightly towards each other: "let me explain"
      const open = (p: number) => ({ flex: 22 + 3 * s(2.2, p) + 4 * beat, abd: 16 });
      return {
        ...base,
        shoulder: open(0), "shoulder:o": open(1),
        elbow: { flex: 88 + 6 * s(2.6) - 6 * beat, rot: 40 }, "elbow:o": { flex: 88 + 6 * s(2.6, 0.8) - 6 * beat, rot: 40 },
        hand: { flex: 6 }, "hand:o": { flex: 6 },
      };
    }
    case "care":
      // both hands gently in front of the chest: "I understand", "take your time"
      return {
        ...base,
        shoulder: { flex: 28 + 1.5 * s(1.6), abd: 2 }, "shoulder:o": { flex: 28 + 1.5 * s(1.6, 0.7), abd: 2 },
        elbow: { flex: 102 + 3 * s(1.9), rot: 20 }, "elbow:o": { flex: 102 + 3 * s(1.9, 0.7), rot: 20 },
        hand: { flex: 10 }, "hand:o": { flex: 10 },
        neck: { flex: 2 + 1.5 * s(1.1), rot: 2 * s(0.5), abd: 2.5 },
      };
    case "nod":
      return { ...base, neck: { flex: 11 * Math.abs(s(3.2)), rot: 0 } };
    case "point_left":
      // an open palm presented towards the viewer's left
      return { ...base, shoulder: { flex: 24 + 2 * s(1.8), abd: 42 }, elbow: { flex: 40 + 3 * s(2.2), rot: 40 }, hand: { flex: 6 } };
    case "point_right":
      return { ...base, "shoulder:o": { flex: 24 + 2 * s(1.8), abd: 42 }, "elbow:o": { flex: 40 + 3 * s(2.2), rot: 40 }, "hand:o": { flex: 6 } };
    case "point_down":
      // both palms up, lower in front: "look at this below"
      return {
        ...base,
        shoulder: { flex: 36, abd: 12 }, "shoulder:o": { flex: 36, abd: 12 },
        elbow: { flex: 60 + 2 * s(1.8), rot: 40 }, "elbow:o": { flex: 60 + 2 * s(1.8, 0.5), rot: 40 },
        hand: { flex: 6 }, "hand:o": { flex: 6 },
      };
    default:
      return { ...base, elbow: { flex: 20 + talk * 5 * s(2.3) - 5 * beat }, shoulder: { flex: 4 + talk * 2.2 * s(1.9) + 4 * beat, abd: 8 } };
  }
}
