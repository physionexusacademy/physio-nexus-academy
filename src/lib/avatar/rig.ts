/**
 * Body control for the teaching avatar (browser only): where he stands and walks, how he leans and bends his knees to reach, his
 * gestures, where he looks, and which hands are on the patient. One `update(dt)` per frame builds the pose (forward kinematics through
 * the shared pose system), then lets arm IK put the hands on their targets.
 */
import * as THREE from "three";
import type { JointAngles, Pose } from "@/lib/virtual-patient/engine";
import { P } from "@/lib/virtual-patient/parts";
import { gestureParts } from "@/lib/rehabverse/guide-motion";
import type { PnaTeacher } from "./teacher";
import { ARM_REACH, bonePosition, solveArm, type ArmGoal, type Side } from "./ik";
import { restHead } from "./mesh";

export type Gesture = "none" | "open" | "point" | "care" | "nod" | "wave";
export type HandShape = "flat" | "relaxed" | "cupped";
const GRIP: Record<HandShape, number> = { flat: 2, relaxed: 14, cupped: 30 };

/** A hand target in WORLD space; the rig converts it. `from` etc. are re-evaluated every frame by the caller. */
export type WorldHand = { point: THREE.Vector3; palm: THREE.Vector3; fingers: THREE.Vector3; shape: HandShape };

/** The Teacher's gestures are the guide's natural ones (lib/rehabverse/guide-motion.ts), so the whole site moves like the same kind of person. */
const NATURAL = { none: "calm", open: "open", point: "point_left", care: "care", nod: "calm", wave: "wave" } as const;
const ARM_KEYS = ["shoulder.left", "shoulder.right", "elbow.left", "elbow.right", "wrist.left", "wrist.right", "hand.left", "hand.right"] as const;

const DEG = Math.PI / 180;
const damp = (current: number, target: number, rate: number, dt: number) => current + (target - current) * (1 - Math.exp(-rate * dt));
const angleDelta = (a: number, b: number) => Math.atan2(Math.sin(b - a), Math.cos(b - a));

export class DoctorRig {
  /** World position of the feet centre and heading (radians; 0 faces +z). */
  x = 0;
  z = 0;
  yaw = 0;
  private goal: { x: number; z: number } | null = null;
  private faceYaw: number | null = null;
  walkSpeed = 0.95;
  private phase = 0;
  walking = false;

  lean = 0;
  leanTarget = 0;
  crouch = 0;
  crouchTarget = 0;
  gesture: Gesture = "none";
  /** 1 while he is speaking: the hands drift a little and the head moves, as a person's do. */
  talk = 0;
  private gestureSeen: Gesture = "none";
  private gestureStart = 0;
  /** The arms as they were drawn last frame, so a change of gesture glides instead of jumping. */
  private armPose: Pose = {};
  /** Where he looks (world point) or null = straight ahead. */
  lookAt: THREE.Vector3 | null = null;
  /** Hands on the patient: world targets (or null) and how strongly IK holds them. */
  hands: { L: WorldHand | null; R: WorldHand | null } = { L: null, R: null };
  private weight = { L: 0, R: 0 };
  private nodClock = 0;
  /** Extra displacement of the hand targets (the glide), world space. */
  push = new THREE.Vector3();
  /** Pose entries the player adds (e.g. a stance for a different technique). */
  extra: Pose = {};
  private groundTable: number[] = [];
  /** Largest gap between a hand and its target on the last frame (metres). */
  reachError = 0;

  constructor(private doc: PnaTeacher) {
    this.measureGround();
  }

  private get figure() {
    return this.doc.figure;
  }

  /** Root height for each crouch level so the soles stay on the floor (measured once). */
  private measureGround() {
    const f = this.figure;
    this.groundTable = [];
    for (let i = 0; i <= 4; i++) {
      f.root.position.set(0, 0, 0);
      f.root.rotation.set(0, 0, 0);
      f.setPose(this.basePose(i / 4, 0, "none", 0, false));
      f.root.updateMatrixWorld(true);
      f.mesh.computeBoundingBox();
      const box = f.mesh.boundingBox!.clone().applyMatrix4(f.mesh.matrixWorld);
      this.groundTable.push(-box.min.y);
    }
  }
  private groundY(crouch: number) {
    const t = Math.min(0.9999, Math.max(0, crouch)) * 4;
    const i = Math.floor(t);
    return this.groundTable[i] + (this.groundTable[i + 1] - this.groundTable[i]) * (t - i);
  }

  /** Teleports (no walking). */
  place(x: number, z: number, yaw: number) {
    this.x = x;
    this.z = z;
    this.yaw = yaw;
    this.goal = null;
    this.faceYaw = null;
    this.walking = false;
  }

  /** Walks to (x, z), then turns to face `finalYaw`. */
  walkTo(x: number, z: number, finalYaw?: number) {
    this.goal = { x, z };
    this.faceYaw = finalYaw ?? null;
  }

  /** Turns on the spot to face `yaw`. */
  turnTo(yaw: number) {
    this.faceYaw = yaw;
  }

  get arrived() {
    return !this.goal && (this.faceYaw === null || Math.abs(angleDelta(this.yaw, this.faceYaw)) < 0.03);
  }

  /** True when the hands have reached their targets and the lean/crouch have settled. */
  get settled() {
    const want = (side: Side) => (this.hands[side] ? 1 : 0);
    return (
      this.arrived &&
      Math.abs(this.weight.L - want("L")) < 0.02 &&
      Math.abs(this.weight.R - want("R")) < 0.02 &&
      Math.abs(this.lean - this.leanTarget) < 0.8 &&
      Math.abs(this.crouch - this.crouchTarget) < 0.03
    );
  }

  /** The pose before IK: stance (knees), lean, gesture and gait. */
  private basePose(crouch: number, lean: number, gesture: Gesture, t: number, walking: boolean, since = 0): Pose {
    const pose: Pose = {};
    const swing = walking ? Math.sin(this.phase) : 0;
    const hipFlex = (side: 1 | -1) => (walking ? 26 * swing * side : 0) + 46 * crouch;
    const kneeFlex = (side: 1 | -1) => (walking ? 34 * Math.max(0, Math.sin(this.phase * side + 1.1)) + 6 : 0) + 78 * crouch;
    pose["hip.left"] = { flex: hipFlex(1) };
    pose["hip.right"] = { flex: hipFlex(-1) };
    pose["knee.left"] = { flex: kneeFlex(1) };
    pose["knee.right"] = { flex: kneeFlex(-1) };
    pose["ankle.left"] = { flex: 24 * crouch };
    pose["ankle.right"] = { flex: 24 * crouch };
    const armSwing = walking ? 14 * swing : 0;
    // arms: the natural gesture for what he is doing (calm, open hands, care, a presenting palm, a wave), with the walking swing added
    const arms = P("right", gestureParts(NATURAL[gesture], t, this.talk, since));
    for (const key of ARM_KEYS) {
      const angles = arms[key] as JointAngles | undefined;
      if (angles) pose[key] = { ...angles };
    }
    if (walking) {
      pose["shoulder.left"] = { ...pose["shoulder.left"], flex: (pose["shoulder.left"]?.flex ?? 3) + armSwing };
      pose["shoulder.right"] = { ...pose["shoulder.right"], flex: (pose["shoulder.right"]?.flex ?? 3) - armSwing };
    }
    pose["hand.left"] = { flex: this.hands.L ? GRIP[this.hands.L.shape] : arms["hand.left"]?.flex ?? 12 };
    pose["hand.right"] = { flex: this.hands.R ? GRIP[this.hands.R.shape] : arms["hand.right"]?.flex ?? 12 };
    pose.trunk = { flex: lean + (walking ? 1.5 : 0.8 * Math.sin(t * 1.4)), rot: walking ? 3 * swing : 0 };
    pose.neck = { flex: 0 };
    return { ...pose, ...this.extra };
  }

  /** Eases the arms from where they were to where the gesture wants them (about a seventh of a second), so a new gesture never snaps. */
  private smoothArms(pose: Pose, dt: number): Pose {
    const k = dt <= 0.002 ? 1 : 1 - Math.exp(-dt / 0.14);
    const out: Pose = { ...pose };
    for (const key of ARM_KEYS) {
      const target = pose[key] as JointAngles | undefined;
      if (!target) continue;
      const previous = this.armPose[key] as JointAngles | undefined;
      const next: JointAngles = {};
      for (const axis of ["flex", "abd", "rot"] as const) {
        const to = target[axis] ?? 0;
        const from = previous ? previous[axis] ?? 0 : to;
        next[axis] = from + (to - from) * k;
      }
      (this.armPose as Record<string, JointAngles>)[key] = next;
      (out as Record<string, JointAngles>)[key] = next;
    }
    return out;
  }

  /** Skeleton-space shoulder position for a candidate lean/crouch, to decide how far he must lean to reach. */
  private shoulderFor(side: Side, lean: number, crouch: number) {
    const f = this.figure;
    f.root.position.y = this.groundY(crouch);
    f.root.updateMatrixWorld(true);
    f.setPose(this.basePose(crouch, lean, "none", 0, false));
    return bonePosition(f, `upperarm01.${side}`);
  }

  /** Smallest lean (degrees) that lets both hands reach their targets, given his current stance. Targets are in skeleton space. */
  solveLean(targets: Partial<Record<Side, THREE.Vector3>>, crouch: number) {
    for (let lean = 0; lean <= 55; lean += 3) {
      let ok = true;
      for (const side of ["L", "R"] as Side[]) {
        const goal = targets[side];
        if (!goal) continue;
        const shoulder = this.shoulderFor(side, lean, crouch);
        if (shoulder.distanceTo(goal) > ARM_REACH(side) * 0.95) ok = false;
      }
      if (ok) return lean;
    }
    return 55;
  }

  /** World → skeleton space of this figure (used to express hand targets). */
  toSpace(world: THREE.Vector3) {
    const space = this.figure.mesh.parent ?? this.figure.root;
    return space.worldToLocal(world.clone());
  }
  dirToSpace(world: THREE.Vector3) {
    const space = this.figure.mesh.parent ?? this.figure.root;
    return world.clone().applyQuaternion(space.getWorldQuaternion(new THREE.Quaternion()).invert()).normalize();
  }

  private wristGoal(h: WorldHand, side: Side): ArmGoal {
    const handLen = restHead(`finger3-1.${side}`).distanceTo(restHead(`wrist.${side}`));
    const palm = h.palm.clone().normalize();
    const fingers = h.fingers.clone().normalize();
    const point = h.point.clone().add(this.push);
    // The palm centre rests on the point; the wrist is behind it along the fingers, and a palm's thickness above the skin.
    const wrist = point.addScaledVector(palm, -0.012).addScaledVector(fingers, -0.5 * handLen);
    return {
      wrist: this.toSpace(wrist),
      palm: this.dirToSpace(palm),
      fingers: this.dirToSpace(fingers),
      pole: new THREE.Vector3(side === "L" ? 0.55 : -0.55, -0.8, -0.25),
    };
  }

  /** Per-frame update. `t` is the running clock in seconds. */
  update(dt: number, t: number) {
    // Walking: head for the goal, then turn.
    this.walking = false;
    if (this.goal) {
      const dx = this.goal.x - this.x, dz = this.goal.z - this.z;
      const dist = Math.hypot(dx, dz);
      if (dist < 0.02) {
        this.x = this.goal.x;
        this.z = this.goal.z;
        this.goal = null;
      } else {
        const heading = Math.atan2(dx, dz);
        this.yaw += angleDelta(this.yaw, heading) * (1 - Math.exp(-9 * dt));
        const step = Math.min(dist, this.walkSpeed * dt * (Math.abs(angleDelta(this.yaw, heading)) < 0.7 ? 1 : 0.25));
        this.x += (dx / dist) * step;
        this.z += (dz / dist) * step;
        this.phase += (2 * Math.PI * this.walkSpeed * dt) / 1.4;
        this.walking = true;
      }
    } else if (this.faceYaw !== null) {
      this.yaw += angleDelta(this.yaw, this.faceYaw) * (1 - Math.exp(-6 * dt));
    }
    this.lean = damp(this.lean, this.leanTarget, 4, dt);
    this.crouch = damp(this.crouch, this.crouchTarget, 4, dt);
    for (const side of ["L", "R"] as Side[]) this.weight[side] = damp(this.weight[side], this.hands[side] ? 1 : 0, 5, dt);

    const f = this.figure;
    f.root.position.set(this.x, this.groundY(this.crouch), this.z);
    f.root.rotation.set(0, this.yaw, 0);
    f.root.updateMatrixWorld(true);

    // Head and eyes follow what he is looking at (uses last frame's head position: one frame of lag is invisible).
    const face = this.doc.face;
    if (this.lookAt) {
      const head = bonePosition(f, "head");
      const local = this.toSpace(this.lookAt).sub(head);
      const yaw = Math.atan2(local.x, local.z) / DEG;
      const pitch = Math.atan2(local.y, Math.hypot(local.x, local.z)) / DEG;
      face.headYaw = Math.max(-45, Math.min(45, yaw)) * 0.6;
      face.headPitch = -Math.max(-25, Math.min(25, pitch)) * 0.5;
      face.gaze = { x: Math.max(-1, Math.min(1, (yaw - face.headYaw) / 25)), y: Math.max(-1, Math.min(1, (pitch + face.headPitch) / 18)) };
    } else {
      face.headYaw = 0;
      face.headPitch = 0;
      face.gaze = { x: 0, y: 0 };
    }
    if (this.gesture === "nod") {
      this.nodClock += dt;
      face.headPitch += 9 * Math.abs(Math.sin(this.nodClock * 3.2));
    }
    if (this.gesture !== this.gestureSeen) { this.gestureSeen = this.gesture; this.gestureStart = t; }
    f.setPose(this.smoothArms(this.basePose(this.crouch, this.lean, this.gesture, t, this.walking, t - this.gestureStart), dt));

    // Hands on the patient.
    this.reachError = 0;
    for (const side of ["L", "R"] as Side[]) {
      const hand = this.hands[side];
      if (!hand || this.weight[side] < 0.01) continue;
      const error = solveArm(f, side, this.wristGoal(hand, side), this.weight[side]);
      this.reachError = Math.max(this.reachError, error);
    }
    f.root.updateMatrixWorld(true);
  }
}
