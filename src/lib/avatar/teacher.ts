/**
 * "Dr. Sajjad" the AI teaching assistant, assembled (browser only): the figure, his look, his face, his voice and the light mode.
 *
 * Model slot: if `/teacher/dr-sajjad.glb` exists it is used instead of the generated character (see docs/dr-sajjad-avatar.md for
 * the rig it must use); otherwise the character is generated from the shared CC0 body. Either way the same pose system drives it.
 */
import type * as THREE from "three";
import { Figure } from "./figure";
import { dressDrSajjad } from "./dress";
import { FaceAnimator } from "./face";
import { Speaker } from "./speech";
import { REST } from "./mesh";

export const CUSTOM_MODEL_URL = "/teacher/dr-sajjad.glb";
export { AVATAR_LABEL as LABEL } from "./labels";

/** Bones the pose system and the hand placement rely on; a custom model must have (nearly) all of them. */
const REQUIRED = [
  "root", "spine01", "spine02", "spine03", "spine04", "spine05", "neck01", "neck02", "neck03", "head", "clavicle.L", "clavicle.R",
  "upperarm01.L", "lowerarm01.L", "wrist.L", "upperarm01.R", "lowerarm01.R", "wrist.R",
  "finger1-1.L", "finger2-1.L", "finger3-1.L", "finger4-1.L", "finger5-1.L", "finger1-1.R", "finger2-1.R", "finger3-1.R", "finger4-1.R", "finger5-1.R",
  "upperleg01.L", "lowerleg01.L", "foot.L", "upperleg01.R", "lowerleg01.R", "foot.R",
];

/** True on low-end devices and for visitors who prefer less motion: the avatar then shows one static pose and no second figure. */
export function detectLightMode(): boolean {
  if (typeof window === "undefined") return true;
  try {
    const stored = window.localStorage.getItem("pna-avatar-light");
    if (stored === "1") return true;
    if (stored === "0") return false;
  } catch {
    /* storage blocked */
  }
  const nav = navigator as Navigator & { deviceMemory?: number; connection?: { saveData?: boolean } };
  if (window.matchMedia?.("(prefers-reduced-motion: reduce)").matches) return true;
  if (nav.connection?.saveData) return true;
  if (typeof nav.deviceMemory === "number" && nav.deviceMemory <= 2) return true;
  if (typeof nav.hardwareConcurrency === "number" && nav.hardwareConcurrency <= 2) return true;
  return false;
}

async function modelExists(url: string) {
  try {
    const response = await fetch(url, { method: "HEAD" });
    const type = response.headers.get("content-type") ?? "";
    return response.ok && !type.includes("text/html");
  } catch {
    return false;
  }
}

/** Reports which required bones a loaded figure lacks (names as in the rig). */
export function missingBones(figure: Figure) {
  return REQUIRED.filter((name) => !figure.bone(name) && REST.has(name));
}

export type TeacherOptions = { light?: boolean; modelUrl?: string; onProgress?: (fraction: number) => void };

export class DrSajjad {
  readonly custom: boolean;
  readonly light: boolean;
  readonly figure: Figure;
  readonly face: FaceAnimator;
  readonly speaker: Speaker;

  private constructor(figure: Figure, face: FaceAnimator, speaker: Speaker, custom: boolean, light: boolean) {
    this.figure = figure;
    this.face = face;
    this.speaker = speaker;
    this.custom = custom;
    this.light = light;
  }

  get root(): THREE.Group {
    return this.figure.root;
  }

  static async create(options: TeacherOptions = {}): Promise<DrSajjad> {
    const light = options.light ?? detectLightMode();
    const url = options.modelUrl ?? CUSTOM_MODEL_URL;
    let figure: Figure | null = null;
    let custom = false;
    if (await modelExists(url)) {
      try {
        figure = await Figure.load({ url, onProgress: options.onProgress, custom: true });
        const missing = missingBones(figure);
        if (missing.length) {
          console.error(`[dr-sajjad] ${url} is missing ${missing.length} required bone(s): ${missing.join(", ")}. It must use the PNA body rig (see docs/dr-sajjad-avatar.md).`);
          if (missing.length > REQUIRED.length * 0.2) {
            figure.dispose();
            figure = null;
          }
        }
        custom = Boolean(figure);
      } catch (error) {
        console.error(`[dr-sajjad] could not load ${url}; using the generated character.`, error);
        figure = null;
      }
    }
    let brows: { left: THREE.Group; right: THREE.Group } | undefined;
    if (!figure) {
      figure = await Figure.load({ onProgress: options.onProgress });
      const dressed = await dressDrSajjad(figure, { light });
      brows = dressed.brows;
    }
    const face = new FaceAnimator(figure, brows);
    if (light) face.breathing = 0;
    const speaker = new Speaker(face);
    if (light) speaker.intensity = 0.6;
    figure.setPose({});
    return new DrSajjad(figure, face, speaker, custom, light);
  }

  /** Advances speech and idle life. Returns true when the picture changed. */
  update(dt: number) {
    this.speaker.tick(dt);
    const changed = this.face.update(dt);
    if (changed || this.speaker.speaking) this.figure.setPose(this.figure.pose, true);
    return changed || this.speaker.speaking;
  }

  dispose() {
    this.speaker.cancel();
    this.figure.dispose();
  }
}
