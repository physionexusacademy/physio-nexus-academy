/**
 * Arm inverse kinematics for the teaching avatar (browser only): puts a hand on a point with the palm and fingers facing given
 * directions. It solves the elbow analytically (two-bone IK with a pole direction) and writes bone rotations the same way the pose
 * system does — every bone rests with identity rotation, so a bone's skeleton-space orientation maps its rest directions onto the new
 * ones. It runs after the pose is applied (FK) and can be blended in and out with a weight.
 */
import * as THREE from "three";
import type { Figure } from "./figure";
import { restHead, restTail } from "./mesh";

export type Side = "L" | "R";
export type ArmGoal = {
  /** Where the wrist should be, in the figure's skeleton space. */
  wrist: THREE.Vector3;
  /** Directions in skeleton space: where the palm faces and where the fingers point. */
  palm: THREE.Vector3;
  fingers: THREE.Vector3;
  /** The elbow bends towards this direction (skeleton space), e.g. down and out. */
  pole: THREE.Vector3;
};

type RestArm = {
  upperLen: number;
  foreLen: number;
  upperDir: THREE.Vector3;
  foreDir: THREE.Vector3;
  fold: THREE.Vector3;
  handDir: THREE.Vector3;
  palmar: THREE.Vector3;
  handLen: number;
};

const perp = (v: THREE.Vector3, axis: THREE.Vector3) => v.clone().sub(axis.clone().multiplyScalar(v.dot(axis)));

/** Rotation taking the frame (a1, a2) onto (b1, b2): first axis exactly, second axis as closely as it allows. */
function frameRotation(a1: THREE.Vector3, a2: THREE.Vector3, b1: THREE.Vector3, b2: THREE.Vector3) {
  const basis = (x: THREE.Vector3, y: THREE.Vector3) => {
    const u = x.clone().normalize();
    const v = perp(y, u).normalize();
    const w = new THREE.Vector3().crossVectors(u, v);
    return new THREE.Matrix4().makeBasis(u, v, w);
  };
  return new THREE.Quaternion().setFromRotationMatrix(basis(b1, b2).multiply(basis(a1, a2).transpose()));
}

const cache = new Map<Side, RestArm>();
function restArm(side: Side): RestArm {
  const hit = cache.get(side);
  if (hit) return hit;
  const s = side;
  const shoulder = restHead(`upperarm01.${s}`);
  const elbow = restHead(`lowerarm01.${s}`);
  const wrist = restHead(`wrist.${s}`);
  const mid = restHead(`finger3-1.${s}`);
  const upper = elbow.clone().sub(shoulder);
  const fore = wrist.clone().sub(elbow);
  const upperDir = upper.clone().normalize();
  const foreDir = fore.clone().normalize();
  let fold = perp(foreDir, upperDir);
  if (fold.length() < 0.02) fold = perp(new THREE.Vector3(0, 0, 1), upperDir);
  fold.normalize();
  const handVec = mid.clone().sub(wrist);
  const handDir = handVec.clone().normalize();
  // The palm faces the way the middle finger curls at rest (the same reference the pose system uses for the grip).
  const curl = restTail(`finger3-3.${s}`).sub(restHead(`finger3-1.${s}`));
  const palmar = perp(curl, handDir).normalize();
  const arm = { upperLen: upper.length(), foreLen: fore.length(), upperDir, foreDir, fold, handDir, palmar, handLen: handVec.length() };
  cache.set(side, arm);
  return arm;
}

/** Skeleton-space world quaternion of a bone's parent chain (what the pose system calls the parent's world rotation). */
function spaceQuat(object: THREE.Object3D, space: THREE.Object3D) {
  const q = object.getWorldQuaternion(new THREE.Quaternion());
  return space.getWorldQuaternion(new THREE.Quaternion()).invert().multiply(q);
}

/**
 * Solves one arm toward `goal` and blends it over the current (forward-kinematics) pose by `weight` (0–1).
 * Returns how far the wrist ended up from the goal, in metres (0 when reachable).
 */
export function solveArm(figure: Figure, side: Side, goal: ArmGoal, weight: number): number {
  const upper = figure.bone(`upperarm01.${side}`);
  const fore = figure.bone(`lowerarm01.${side}`);
  const hand = figure.bone(`wrist.${side}`);
  if (!upper || !fore || !hand || weight <= 0) return 0;
  const space = figure.mesh.parent ?? figure.root;
  space.updateMatrixWorld(true);
  const rest = restArm(side);

  const S = space.worldToLocal(upper.getWorldPosition(new THREE.Vector3()));
  const toGoal = goal.wrist.clone().sub(S);
  const a = rest.upperLen, b = rest.foreLen;
  const reach = a + b - 0.002;
  const dist = Math.min(reach, Math.max(Math.abs(a - b) + 0.002, toGoal.length()));
  const u = toGoal.clone().normalize();
  const along = (a * a - b * b + dist * dist) / (2 * dist);
  const radius = Math.sqrt(Math.max(0, a * a - along * along));
  let orth = perp(goal.pole, u);
  if (orth.length() < 1e-4) orth = perp(new THREE.Vector3(0, -1, 0), u);
  orth.normalize();
  const E = S.clone().addScaledVector(u, along).addScaledVector(orth, radius);
  const T = S.clone().addScaledVector(u, dist);

  const upperT = E.clone().sub(S).normalize();
  const foreT = T.clone().sub(E).normalize();
  let foldT = perp(foreT, upperT);
  if (foldT.length() < 0.02) foldT = orth.clone();
  foldT.normalize();

  const qUpper = frameRotation(rest.upperDir, rest.fold, upperT, foldT);
  let palmT = perp(goal.palm, foreT);
  if (palmT.length() < 0.05) palmT = foldT.clone();
  const qFore = frameRotation(rest.foreDir, perp(rest.palmar, rest.foreDir), foreT, palmT.normalize());
  let handPalm = perp(goal.palm, goal.fingers);
  if (handPalm.length() < 0.05) handPalm = palmT.clone();
  let qHand = frameRotation(rest.handDir, rest.palmar, goal.fingers.clone().normalize(), handPalm.normalize());
  // Keep the wrist within a comfortable bend of the forearm.
  const relative = qFore.clone().invert().multiply(qHand);
  const wristAngle = 2 * Math.acos(Math.min(1, Math.abs(relative.w)));
  const limit = (80 * Math.PI) / 180;
  if (wristAngle > limit) qHand = qFore.clone().multiply(new THREE.Quaternion().slerp(relative, limit / wristAngle));

  const apply = (bone: THREE.Bone, wanted: THREE.Quaternion) => {
    const parent = bone.parent ? spaceQuat(bone.parent, space) : new THREE.Quaternion();
    const local = parent.invert().multiply(wanted);
    bone.quaternion.slerp(local, Math.min(1, weight));
    bone.updateMatrixWorld(true);
  };
  apply(upper, qUpper);
  apply(fore, qFore);
  apply(hand, qHand);
  return goal.wrist.distanceTo(T);
}

/** Skeleton-space position of a bone (the doctor's own shoulder, wrist...), for reach checks. */
export function bonePosition(figure: Figure, name: string) {
  const bone = figure.bone(name);
  const space = figure.mesh.parent ?? figure.root;
  return bone ? space.worldToLocal(bone.getWorldPosition(new THREE.Vector3())) : new THREE.Vector3();
}

export const ARM_REACH = (side: Side) => {
  const r = restArm(side);
  return r.upperLen + r.foreLen;
};
