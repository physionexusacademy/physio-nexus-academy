/**
 * Face and idle life for the teaching avatar (browser only): jaw and lip shapes for speech, blinks, eyebrows, gaze and breathing.
 * It writes after the body pose is applied (Figure.onPosed), so it never fights the pose system. Values are 0–1 targets that
 * the animator eases towards each frame.
 */
import * as THREE from "three";
import type { Figure } from "./figure";
import { REST } from "./mesh";

export type MouthShape = { open: number; wide: number; round: number; smile: number };
export const CLOSED: MouthShape = { open: 0, wide: 0, round: 0, smile: 0 };

/** Bones nudged by each mouth shape: [bone, [dx, dy, dz] in metres at full strength, which control]. dx is mirrored for the right side. */
const LIPS: [string, [number, number, number], keyof MouthShape][] = [
  ["risorius03.L", [0.007, 0.006, 0.001], "wide"], ["risorius03.R", [-0.007, 0.006, 0.001], "wide"],
  ["oris06.L", [0.005, 0.002, 0], "wide"], ["oris06.R", [-0.005, 0.002, 0], "wide"],
  ["oris07.L", [0.004, 0.003, 0], "wide"], ["oris07.R", [-0.004, 0.003, 0], "wide"],
  ["oris04.L", [0.003, 0, 0], "wide"], ["oris04.R", [-0.003, 0, 0], "wide"],
  ["risorius03.L", [-0.007, 0, 0.004], "round"], ["risorius03.R", [0.007, 0, 0.004], "round"],
  ["oris06.L", [-0.0065, 0, 0.005], "round"], ["oris06.R", [0.0065, 0, 0.005], "round"],
  ["oris07.L", [-0.0055, 0, 0.005], "round"], ["oris07.R", [0.0055, 0, 0.005], "round"],
  ["oris04.L", [-0.004, 0, 0.004], "round"], ["oris04.R", [0.004, 0, 0.004], "round"],
  ["risorius03.L", [0.004, 0.009, 0.001], "smile"], ["risorius03.R", [-0.004, 0.009, 0.001], "smile"],
  ["risorius02.L", [0.003, 0.005, 0], "smile"], ["risorius02.R", [-0.003, 0.005, 0], "smile"],
  ["oris07.L", [0.002, 0.006, 0], "smile"], ["oris07.R", [-0.002, 0.006, 0], "smile"],
];

const ease = (current: number, target: number, rate: number, dt: number) => current + (target - current) * (1 - Math.exp(-rate * dt));

export class FaceAnimator {
  /** Targets (set by the speaker / player). */
  mouth: MouthShape = { ...CLOSED };
  /** Eyebrow raise 0–1 and inner-end lift ("concern") 0–1. */
  browRaise = 0;
  browConcern = 0;
  /** Gaze in −1…1 (x to the figure's left, y up). */
  gaze = { x: 0, y: 0 };
  /** Extra head turn/nod added to the pose, degrees. */
  headYaw = 0;
  headPitch = 0;
  /** Blink 0 (open) … 1 (closed) — driven by the idle scheduler unless `blinkLocked`. */
  blink = 0;
  blinkLocked = false;
  /** Breathing amplitude 0–1 (set 0 in light mode). */
  breathing = 1;

  private shown: MouthShape = { ...CLOSED };
  private restPos = new Map<string, THREE.Vector3>();
  private nextBlink = 1.5;
  private blinkPhase = -1;
  private browGroups: { left: THREE.Group; right: THREE.Group } | null = null;
  private breath = 0;
  private time = 0;
  private shownBrow = { raise: 0, concern: 0 };
  private shownGaze = { x: 0, y: 0 };
  private saccadeAt = 2;
  private saccade = { x: 0, y: 0 };

  constructor(private figure: Figure, brows?: { left: THREE.Group; right: THREE.Group }) {
    this.browGroups = brows ?? null;
    figure.onPosed = () => this.apply();
    for (const [name] of LIPS) this.remember(name);
  }

  private remember(name: string) {
    if (this.restPos.has(name)) return;
    const rest = REST.get(name);
    const bone = this.figure.bone(name);
    if (rest && bone) this.restPos.set(name, bone.position.clone());
  }

  /** Advances idle behaviour; returns true when something visible changed (so the caller re-renders). */
  update(dt: number): boolean {
    this.time += dt;
    const before = JSON.stringify([this.shown, this.blink, this.shownBrow, this.shownGaze, this.breath.toFixed(3)]);
    // Mouth eases towards the target shape quickly enough for syllable-rate speech.
    const rate = 22;
    this.shown.open = ease(this.shown.open, this.mouth.open, rate, dt);
    this.shown.wide = ease(this.shown.wide, this.mouth.wide, rate, dt);
    this.shown.round = ease(this.shown.round, this.mouth.round, rate, dt);
    this.shown.smile = ease(this.shown.smile, this.mouth.smile, 6, dt);
    this.shownBrow.raise = ease(this.shownBrow.raise, this.browRaise, 8, dt);
    this.shownBrow.concern = ease(this.shownBrow.concern, this.browConcern, 8, dt);
    // Gaze with a slow, tiny drift (micro-saccades) so the eyes are never dead.
    if (this.time > this.saccadeAt) {
      this.saccadeAt = this.time + 1.4 + Math.random() * 2.6;
      this.saccade = { x: (Math.random() - 0.5) * 0.18, y: (Math.random() - 0.5) * 0.1 };
    }
    this.shownGaze.x = ease(this.shownGaze.x, this.gaze.x + this.saccade.x, 14, dt);
    this.shownGaze.y = ease(this.shownGaze.y, this.gaze.y + this.saccade.y, 14, dt);
    // Blinks every 2.5–5 s; closing takes 70 ms and opening 110 ms.
    if (!this.blinkLocked) {
      if (this.blinkPhase < 0 && this.time > this.nextBlink) this.blinkPhase = 0;
      if (this.blinkPhase >= 0) {
        this.blinkPhase += dt;
        const close = 0.07, open = 0.11;
        this.blink = this.blinkPhase < close ? this.blinkPhase / close : Math.max(0, 1 - (this.blinkPhase - close) / open);
        if (this.blinkPhase > close + open) {
          this.blinkPhase = -1;
          this.blink = 0;
          this.nextBlink = this.time + 2.5 + Math.random() * 2.5;
        }
      }
    }
    this.breath = Math.sin((this.time / 4.4) * Math.PI * 2) * this.breathing;
    return JSON.stringify([this.shown, this.blink, this.shownBrow, this.shownGaze, this.breath.toFixed(3)]) !== before;
  }

  /** Writes the face, eyes, brows, head sway and breathing onto the bones. Called after every pose change. */
  apply() {
    const f = this.figure;
    const { open } = this.shown;
    const jaw = f.bone("jaw");
    if (jaw) jaw.rotation.x = open * 0.24;
    // Accumulate all lip contributions per bone, then write once.
    const sums = new Map<string, THREE.Vector3>();
    for (const [name, delta, key] of LIPS) {
      const amount = this.shown[key];
      if (!amount) continue;
      const sum = sums.get(name) ?? new THREE.Vector3();
      sum.x += delta[0] * amount;
      sum.y += delta[1] * amount;
      sum.z += delta[2] * amount;
      sums.set(name, sum);
    }
    for (const name of new Set(LIPS.map((l) => l[0]))) {
      const bone = f.bone(name);
      const rest = this.restPos.get(name);
      if (!bone || !rest) continue;
      const sum = sums.get(name);
      bone.position.set(rest.x + (sum?.x ?? 0), rest.y + (sum?.y ?? 0), rest.z + (sum?.z ?? 0));
    }
    // Eyelids: +blink closes the upper lid and raises the lower one; a lifted brow opens the eye a touch.
    const lid = Math.min(1, this.blink);
    const widen = this.shownBrow.raise * 0.12;
    for (const side of ["L", "R"]) {
      const up = f.bone(`orbicularis03.${side}`);
      const low = f.bone(`orbicularis04.${side}`);
      if (up) up.rotation.x = lid * 0.55 - widen * 0.55;
      if (low) low.rotation.x = -lid * 0.35 + widen * 0.2;
      const eye = f.bone(`eye.${side}`);
      if (eye) {
        eye.rotation.y = this.shownGaze.x * 0.32;
        eye.rotation.x = -this.shownGaze.y * 0.22;
      }
    }
    // Brows: the whole brow lifts up to ~5 mm; "concern" raises the inner ends.
    if (this.browGroups) {
      const { raise, concern } = this.shownBrow;
      this.browGroups.left.position.y = 0.005 * raise + 0.002 * concern;
      this.browGroups.right.position.y = 0.005 * raise + 0.002 * concern;
      this.browGroups.left.rotation.z = -0.22 * concern;
      this.browGroups.right.rotation.z = 0.22 * concern;
    }
    // Head sway with breathing and the requested head turn.
    const head = f.bone("head");
    if (head) {
      head.rotation.y += (this.headYaw * Math.PI) / 180;
      head.rotation.x += ((this.headPitch + this.breath * 0.35) * Math.PI) / 180;
    }
    // Breathing: the chest lifts a little and the shoulders rise on inhalation.
    const b = this.breath;
    for (const name of ["spine03", "spine02"]) {
      const bone = f.bone(name);
      if (bone) bone.rotation.x += (-b * 0.55 * Math.PI) / 180;
    }
  }
}
