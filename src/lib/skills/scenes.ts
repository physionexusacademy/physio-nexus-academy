/**
 * Every Skills Lab 3D scene, keyed "<skill>/<atlas item id>" (concept demos "<skill>/concept:<id>"). Joint-movement demos with a
 * goniometer / muscle test live in demo3d.ts; everything else (dermatomes, nerves, reflexes, tone, vitals, posture, tape
 * measures, landmarks, balance tests) is here. No three.js import, so the skills build and validator can read it.
 */
import type { Scene } from "./scene-types.ts";
import { dermatomeScenes, DERMATOME_2D_ONLY } from "./scenes/dermatomes.ts";
import { reflexScenes } from "./scenes/reflexes.ts";
import { nerveScenes } from "./scenes/nerves.ts";
import { toneScenes } from "./scenes/tone.ts";
import { palpationScenes } from "./scenes/palpation.ts";
import { vitalScenes } from "./scenes/vitals.ts";
import { postureScenes } from "./scenes/posture.ts";
import { measureScenes } from "./scenes/measures.ts";
import { balanceScenes, BALANCE_2D_ONLY } from "./scenes/balance.ts";

export const SCENES: Record<string, Scene> = {
  ...dermatomeScenes,
  ...reflexScenes,
  ...nerveScenes,
  ...toneScenes,
  ...palpationScenes,
  ...vitalScenes,
  ...postureScenes,
  ...measureScenes,
  ...balanceScenes,
};

/** Items that stay as 2D diagrams on purpose. */
export const SCENES_2D_ONLY: string[] = [...DERMATOME_2D_ONLY, ...BALANCE_2D_ONLY];

export const hasScene = (key: string) => key in SCENES;
