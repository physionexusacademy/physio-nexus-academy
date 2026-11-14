"use client";

import dynamic from "next/dynamic";
import { SCENES } from "@/lib/skills/scenes";
import Demo3DPlayer from "./Demo3DPlayer";
import Scene3DPlayer from "./Scene3DPlayer";

/** "avatar/<slug>": Dr. Sajjad's teaching demonstrations (browser only; the 3D character code loads only when one is opened). */
const AvatarStage = dynamic(() => import("@/components/avatar/AvatarStage"), { ssr: false });

/** Chooses the player for a demonstration: a scene (dermatome, nerve, reflex, vitals, posture…) or a joint movement. Loaded in the browser only. */
export default function Demo3DAny(props: { demoKey: string; title: string; say?: string; onFail: () => void }) {
  if (props.demoKey.startsWith("avatar/")) return <AvatarStage {...props} />;
  return SCENES[props.demoKey] ? <Scene3DPlayer {...props} /> : <Demo3DPlayer {...props} />;
}
