/**
 * Where things are on the 3D patient — shared by the Skills Lab demo players (browser only).
 *
 * Point syntax (see demo3d.ts for the original goniometer/MMT subset):
 *   "upperarm01"          bone head (joint centre) on the tested side; ":o" = the other side
 *   "wrist>"              bone tail (far end of the segment)
 *   "lowerarm01[0,0,0.03]" a point offset from a bone head, in metres, in the bone's rest frame
 *                          (x towards the patient's left on the left side, y up the limb, z to the front)
 *   "@lateral-epicondyle" palpation landmark (":o" other side, ":m" midline)
 *   "@nose" "@ear" "@chin" "@forehead"   face points
 *   "key:C6" "key:median" ISNCSCI dermatome key point / nerve zone on the skin (ids from virtual-patient/points.ts)
 *   "zone"                a skin point near the middle of the glowing zone
 *   "a+b" / "a+b*0.8"     midpoint of two points / a point 80 % of the way from a to b
 *   "a{x,y,z}"            a point offset from a, in metres in the patient's frame (x outwards on the tested side, y towards the head, z to the front)
 *   "a|floor"             the point straight below a on the floor
 *   "a|z=-0.19"           the point a with its world z (or x, y) replaced, e.g. its place on a wall
 *   "^up" "^down" "^front" "^back" "^head" "^feet" "^lat" "^med"   a reference direction from an axis point
 */
import * as THREE from "three";
import { KEY_POINTS } from "../virtual-patient/points";
import type { ExamRoom, Side } from "../virtual-patient/engine";

export const otherSide = (side: Side): Side => (side === "left" ? "right" : "left");

/** A direction in the patient's frame (x: towards the patient's left, y: towards the head, z: to the front) in world space. */
export function patientDir(room: ExamRoom, local: [number, number, number]) {
  return new THREE.Vector3(...local).applyQuaternion(room.patientRoot.quaternion).normalize();
}

type Anchor = { bone: string; local: THREE.Vector3 };
const anchors = new WeakMap<ExamRoom, Map<string, Anchor | null>>();

/** A skin key point, found once and then followed on its bone as the patient moves. */
function keyPoint(room: ExamRoom, id: string, side: Side): THREE.Vector3 {
  let cache = anchors.get(room);
  if (!cache) anchors.set(room, (cache = new Map()));
  const key = `${id}|${side}`;
  let anchor = cache.get(key);
  if (anchor === undefined) {
    const found = KEY_POINTS.find((k) => k.id === id);
    const pick = found ? room.probeSkin(found.probe, side) : null;
    anchor = pick ? room.skinAnchor(pick) : null;
    cache.set(key, anchor);
  }
  return anchor ? room.anchorPoint(anchor.bone, anchor.local) : new THREE.Vector3();
}

/** Forget cached skin points (call when a new scene starts, or the model is reloaded). */
export function clearPointCache(room: ExamRoom) {
  anchors.delete(room);
}

/** Remember the middle of the glowing zone (found once, on its bone) so "zone" is cheap to follow. */
export function setZoneAnchor(room: ExamRoom) {
  let cache = anchors.get(room);
  if (!cache) anchors.set(room, (cache = new Map()));
  const z = room.zoneBounds();
  cache.set("zone", z ? room.skinAnchor({ bone: z.bone, point: z.centre }) : null);
}

function facePoint(room: ExamRoom, name: string, side: Side): THREE.Vector3 {
  const sign = side === "left" ? 1 : -1;
  const up = patientDir(room, [0, 1, 0]);
  const front = patientDir(room, [0, 0, 1]);
  const lat = patientDir(room, [sign, 0, 0]);
  const eyes = room.jointWorld("eye.L").add(room.jointWorld("eye.R")).multiplyScalar(0.5);
  switch (name) {
    case "nose":
      return eyes.addScaledVector(front, 0.045).addScaledVector(up, -0.035);
    case "chin":
      return eyes.addScaledVector(front, 0.03).addScaledVector(up, -0.115);
    case "forehead":
      return eyes.addScaledVector(front, 0.03).addScaledVector(up, 0.045);
    case "ear":
      return room.jointWorld("head").addScaledVector(up, 0.045).addScaledVector(lat, 0.078);
    default:
      return room.jointWorld("head");
  }
}

const FACE = new Set(["nose", "chin", "forehead", "ear"]);

export function resolvePoint(room: ExamRoom, spec: string, side: Side, axis?: THREE.Vector3): THREE.Vector3 {
  const sign = side === "left" ? 1 : -1;
  const shifted = /^(.*)\{([-\d.,\s]+)\}$/.exec(spec);
  if (shifted) {
    const [x, y, z] = shifted[2].split(",").map(Number);
    return resolvePoint(room, shifted[1], side, axis)
      .addScaledVector(patientDir(room, [sign, 0, 0]), x)
      .addScaledVector(patientDir(room, [0, 1, 0]), y)
      .addScaledVector(patientDir(room, [0, 0, 1]), z);
  }
  const setAxis = /^(.*)\|([xyz])=(-?[\d.]+)$/.exec(spec);
  if (setAxis) {
    const p = resolvePoint(room, setAxis[1], side, axis);
    p[setAxis[2] as "x" | "y" | "z"] = Number(setAxis[3]);
    return p;
  }
  if (spec.includes("|floor")) {
    const p = resolvePoint(room, spec.replace("|floor", ""), side, axis);
    p.y = 0.004;
    return p;
  }
  if (spec.startsWith("^")) {
    const base = axis ?? new THREE.Vector3();
    const ref: Record<string, THREE.Vector3> = {
      up: new THREE.Vector3(0, 1, 0),
      down: new THREE.Vector3(0, -1, 0),
      front: patientDir(room, [0, 0, 1]),
      back: patientDir(room, [0, 0, -1]),
      head: patientDir(room, [0, 1, 0]),
      feet: patientDir(room, [0, -1, 0]),
      lat: patientDir(room, [sign, 0, 0]),
      med: patientDir(room, [-sign, 0, 0]),
    };
    return base.clone().addScaledVector(ref[spec.slice(1)] ?? ref.up, 0.25);
  }
  const [pair, weight] = spec.split("*");
  if (pair.includes("+") && !/\[[^\]]*\+/.test(pair)) {
    const [a, b] = pair.split("+");
    return resolvePoint(room, a, side).lerp(resolvePoint(room, b, side), weight ? Number(weight) : 0.5);
  }
  if (pair === "zone") {
    const anchor = anchors.get(room)?.get("zone");
    return anchor ? room.anchorPoint(anchor.bone, anchor.local) : new THREE.Vector3();
  }
  if (pair.startsWith("key:")) {
    const [id, flag] = pair.slice(4).split(":");
    return keyPoint(room, id, flag === "o" ? otherSide(side) : side);
  }
  const offset = /^(.*)\[([-\d.,\s]+)\]$/.exec(pair);
  if (offset) {
    const [name, flag] = offset[1].split(":");
    const o = offset[2].split(",").map(Number) as [number, number, number];
    return room.boneOffset(name, flag === "o" ? otherSide(side) : side, o);
  }
  const tail = pair.endsWith(">");
  const [name, flag] = pair.replace(/>$/, "").split(":");
  const which: Side = flag === "o" ? otherSide(side) : side;
  if (name.startsWith("@")) {
    const id = name.slice(1);
    if (FACE.has(id)) return facePoint(room, id, which);
    try {
      return room.landmarkWorld(id, flag === "m" ? "mid" : which);
    } catch {
      return new THREE.Vector3();
    }
  }
  return tail ? room.boneEnd(name, which) : room.boneWorld(name, which);
}

/** Names that are valid in a point spec, for the validator (no three.js needed there — this file is browser-only). */
export const FACE_POINTS = [...FACE];
