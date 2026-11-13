"use client";

import { SCENES } from "@/lib/skills/scenes";
import Demo3DPlayer from "./Demo3DPlayer";
import Scene3DPlayer from "./Scene3DPlayer";

/** Chooses the player for a demonstration: a scene (dermatome, nerve, reflex, vitals, posture…) or a joint movement. Loaded in the browser only. */
export default function Demo3DAny(props: { demoKey: string; title: string; say?: string; onFail: () => void }) {
  return SCENES[props.demoKey] ? <Scene3DPlayer {...props} /> : <Demo3DPlayer {...props} />;
}
