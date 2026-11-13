/**
 * Pose helper shared by the Skills Lab demos and the RehabVerse exercises: describe a pose in
 * clinical terms for "the tested side" and "the other side" and turn it into engine joint angles.
 * Types only from the engine, so this file can be read by the build scripts and validators.
 */
import type { JointAngles, JointId, Pose, Side } from "./engine.ts";

type Axial = "neck" | "trunk" | "head";
/** "trunk:t" / "neck:t" turn or bend towards the tested side; ":a" away from it (abd and rot flip with the side). */
export type PartKey = JointId | `${JointId}:o` | Axial | `${Axial}:t` | `${Axial}:a`;
export type Parts = Partial<Record<PartKey, JointAngles>>;

/** +1 when moving towards the patient's right (neck/trunk side-flexion and rotation). */
export const toward = (side: Side) => (side === "right" ? 1 : -1);

/** Pose from parts named for the tested side ("hip"), the other side ("hip:o"), neck, head and trunk. */
export function P(side: Side, parts: Parts): Pose {
  const other: Side = side === "left" ? "right" : "left";
  const out: Pose = {};
  for (const [key, angles] of Object.entries(parts)) {
    if (!angles) continue;
    const [name, flag] = key.split(":");
    if (name === "neck" || name === "trunk" || name === "head") {
      const sign = flag === "t" ? toward(side) : flag === "a" ? -toward(side) : 1;
      const next: JointAngles = {};
      if (angles.flex !== undefined) next.flex = angles.flex;
      if (angles.abd !== undefined) next.abd = angles.abd * sign;
      if (angles.rot !== undefined) next.rot = angles.rot * sign;
      out[name] = next;
    } else {
      out[`${name}.${flag ? other : side}` as `${JointId}.${Side}`] = angles;
    }
  }
  return out;
}
