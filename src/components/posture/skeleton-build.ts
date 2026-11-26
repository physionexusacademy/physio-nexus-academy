/**
 * The illustrative skeleton of the Full Posture Scan, built from simple solids (no model file, nothing to download).
 *
 * It is NOT a picture of the person's bones. It is a standard adult skeleton, posed through the points the phone could measure (head, shoulders, hips, knees),
 * with the spine drawn as a smooth line between them. Axes: the skeleton faces +z (the viewer, at the start); the person's LEFT is +x; y is up; units are metres.
 * A region the tool could not measure is drawn plain, never tinted, and a tilt smaller than its own uncertainty has already been set to zero by skeletonPose().
 */
import * as THREE from "three";
import type { Region, Severity, SkeletonPose } from "@/lib/posture/scan";

export type Severities = Record<Region, Severity | null>;

const IVORY = 0xe8e0cc;
const AMBER = 0xf2b134;
const CORAL = 0xe9553f;
const DEG = Math.PI / 180;

const tint = (s: Severity | null) => (s === 2 ? CORAL : s === 1 ? AMBER : IVORY);

type Mats = { get: (c: number) => THREE.MeshStandardMaterial; all: THREE.MeshStandardMaterial[] };
function materials(): Mats {
  const cache = new Map<number, THREE.MeshStandardMaterial>();
  return {
    get: (c: number) => {
      let m = cache.get(c);
      if (!m) {
        m = new THREE.MeshStandardMaterial({ color: c, roughness: 0.62, metalness: 0.02, emissive: c === IVORY ? 0x000000 : c, emissiveIntensity: c === IVORY ? 0 : 0.28 });
        cache.set(c, m);
      }
      return m;
    },
    get all() { return [...cache.values()]; },
  };
}

/** A cylinder from point a to point b. */
function bone(a: THREE.Vector3, b: THREE.Vector3, r0: number, r1: number, mat: THREE.Material): THREE.Mesh {
  const len = a.distanceTo(b);
  const geo = new THREE.CylinderGeometry(r1, r0, len, 14, 1);
  const mesh = new THREE.Mesh(geo, mat);
  mesh.position.copy(a).add(b).multiplyScalar(0.5);
  mesh.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), b.clone().sub(a).normalize());
  return mesh;
}
const ball = (p: THREE.Vector3, r: number, mat: THREE.Material, sx = 1, sy = 1, sz = 1) => {
  const m = new THREE.Mesh(new THREE.SphereGeometry(r, 18, 14), mat);
  m.position.copy(p);
  m.scale.set(sx, sy, sz);
  return m;
};
const smooth = (t: number) => t * t * (3 - 2 * t);

export function buildSkeleton(pose: SkeletonPose, sev: Severities): THREE.Group {
  const mats = materials();
  const ivory = mats.get(IVORY);
  const root = new THREE.Group();

  /* ---- the spine: sacrum up to the skull, 24 bones, on a curve through the measured points ---- */
  const HIP_Y = 0.9;
  const lumbarY0 = 1.0, lumbarStep = 0.03, thoracicY0 = 1.15, thoracicStep = 0.024, cervY0 = 1.435, cervStep = 0.018;
  const levels: { y: number; kind: "L" | "T" | "C"; i: number }[] = [];
  for (let i = 0; i < 5; i++) levels.push({ y: lumbarY0 + i * lumbarStep, kind: "L", i });
  for (let i = 0; i < 12; i++) levels.push({ y: thoracicY0 + i * thoracicStep, kind: "T", i });
  for (let i = 0; i < 7; i++) levels.push({ y: cervY0 + i * cervStep, kind: "C", i });

  const trunkLen = 0.5; // hip to shoulder, metres
  const shoulderWidth = 0.38;
  const fwd = (pose.headForward / 100) * trunkLen; // head forward of the shoulders, metres
  const shift = (pose.trunkShift / 100) * shoulderWidth; // shoulders sideways of the hips, metres (positive: to the person's left, +x)

  // the natural curves, as a front-to-back offset (metres) along the height: a gentle inward curve in the low back, outward in the upper back, inward in the neck
  const curveZ = (y: number) => {
    if (y < 1.14) return 0.018 * Math.sin(((y - 0.98) / 0.16) * Math.PI);
    if (y < 1.42) return -0.03 * Math.sin(((y - 1.14) / 0.28) * Math.PI);
    return 0.014 * Math.sin(Math.min(1, (y - 1.42) / 0.14) * Math.PI);
  };
  // where the spine is at height y: the trunk lean swings the whole upper body about the hips, the shift slides the shoulders sideways, the head sits forward at the top
  const lean = pose.trunkLean * DEG;
  const spinePoint = (y: number): THREE.Vector3 => {
    const t = Math.max(0, Math.min(1, (y - HIP_Y) / (1.435 - HIP_Y)));
    const up = y - HIP_Y;
    let z = curveZ(y) + Math.sin(lean) * up;
    let yy = HIP_Y + Math.cos(lean) * up;
    const x = shift * smooth(t);
    if (y >= 1.435) z += fwd * Math.pow((y - 1.435) / (cervY0 + 6 * cervStep - 1.435), 1.2);
    return new THREE.Vector3(x, yy, z - 0.02);
  };

  const spine = new THREE.Group();
  const points = levels.map((l) => spinePoint(l.y));
  const radius = (k: "L" | "T" | "C", i: number) => (k === "L" ? 0.026 - i * 0.0006 : k === "T" ? 0.021 - i * 0.00045 : 0.013 + (6 - i) * 0.0004);
  levels.forEach((l, n) => {
    const region: Region = l.kind === "C" ? "neck" : "trunk";
    const mat = mats.get(tint(sev[region]));
    const here = points[n], above = points[Math.min(points.length - 1, n + 1)], below = points[Math.max(0, n - 1)];
    const dir = above.clone().sub(below).normalize();
    const height = (l.kind === "L" ? lumbarStep : l.kind === "T" ? thoracicStep : cervStep) * 0.78;
    const body = new THREE.Mesh(new THREE.CylinderGeometry(radius(l.kind, l.i), radius(l.kind, l.i) * 1.05, height, 14), mat);
    body.position.copy(here);
    body.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), dir);
    spine.add(body);
    // the spinous process, pointing back and a little down
    const sp = new THREE.Mesh(new THREE.BoxGeometry(0.006, height * 0.7, l.kind === "L" ? 0.03 : l.kind === "T" ? 0.034 : 0.02), mat);
    sp.position.copy(here).add(new THREE.Vector3(0, -0.002, -(radius(l.kind, l.i) + 0.012)));
    sp.quaternion.copy(body.quaternion);
    spine.add(sp);
    // the discs between the bones, slightly darker so the spine reads as a column
    if (n > 0) {
      const disc = new THREE.Mesh(new THREE.CylinderGeometry(radius(l.kind, l.i) * 0.9, radius(l.kind, l.i) * 0.9, 0.006, 12), mats.get(0xb9ae94));
      disc.position.copy(here.clone().add(below).multiplyScalar(0.5));
      disc.quaternion.copy(body.quaternion);
      spine.add(disc);
    }
  });
  root.add(spine);

  /* ---- the pelvis: two wings, the sacrum and the pubic ring, tilted by the hip level ---- */
  const pelvis = new THREE.Group();
  pelvis.position.set(0, HIP_Y + 0.02, 0);
  const pelvisMat = mats.get(tint(sev.pelvis));
  for (const sx of [-1, 1]) {
    const wing = ball(new THREE.Vector3(sx * 0.105, 0.05, -0.01), 0.075, pelvisMat, 0.7, 1.05, 0.34);
    wing.rotation.z = sx * -0.35;
    pelvis.add(wing);
    const lower = ball(new THREE.Vector3(sx * 0.085, -0.04, 0.0), 0.05, pelvisMat, 0.8, 1, 0.5);
    pelvis.add(lower);
  }
  const sacrum = new THREE.Mesh(new THREE.CylinderGeometry(0.05, 0.022, 0.12, 14), pelvisMat);
  sacrum.position.set(0, 0.0, -0.045);
  sacrum.rotation.x = -0.25;
  sacrum.scale.z = 0.5;
  pelvis.add(sacrum);
  const ring = new THREE.Mesh(new THREE.TorusGeometry(0.045, 0.007, 8, 22), pelvisMat);
  ring.position.set(0, -0.055, 0.07);
  ring.rotation.x = Math.PI / 2.4;
  pelvis.add(ring);
  pelvis.rotation.z = pose.hipTilt * DEG;
  root.add(pelvis);

  /* ---- the rib cage: twelve pairs of ribs on the thoracic spine (rib 1 at the top), and the breastbone ---- */
  const ribs = new THREE.Group();
  const ribMat = mats.get(0xdcd3bd); // the ribs stay plain: the tint marks the spine and the joints, not the whole chest
  const TOP = 16; // index of the first thoracic bone in `levels`; the twelfth is at index 5
  const ribHalf = (r: number) => (r < 8 ? 0.062 + r * 0.0115 : 0.154 - (r - 7) * 0.016); // narrow at the top, widest low-middle
  const ribDepth = (r: number) => (r < 8 ? 0.05 + r * 0.0085 : 0.11 - (r - 7) * 0.006);
  for (let r = 0; r < 12; r++) {
    const c = points[TOP - r];
    const half = ribHalf(r), depth = ribDepth(r);
    const drop = r < 10 ? 0.075 : 0.03; // the front of a rib sits lower than its back; the floating ribs end early
    const reach = r < 10 ? 0.985 : 0.5;
    for (const sx of [-1, 1]) {
      const pts: THREE.Vector3[] = [];
      for (let k = 0; k <= 16; k++) {
        const a = (k / 16) * Math.PI * reach; // from the spine (behind) round to the front
        pts.push(new THREE.Vector3(c.x + sx * Math.sin(a) * half, c.y - Math.pow(k / 16, 1.6) * drop, c.z + depth * 0.2 - Math.cos(a) * depth));
      }
      ribs.add(new THREE.Mesh(new THREE.TubeGeometry(new THREE.CatmullRomCurve3(pts), 32, r < 10 ? 0.0062 : 0.0052, 6, false), ribMat));
    }
  }
  // breastbone: in front of the cage, from the first rib to the ninth
  const stTop = points[TOP].clone().add(new THREE.Vector3(0, 0.01, ribDepth(0) * 1.2 + 0.004)), stBot = points[TOP - 8].clone().add(new THREE.Vector3(0, -0.05, ribDepth(8) * 1.2 + 0.004));
  ribs.add(bone(stBot, stTop, 0.014, 0.02, ribMat));
  root.add(ribs);

  /* ---- the shoulder girdle: collarbones, shoulder blades and arms, tilted by the shoulder level ---- */
  const girdle = new THREE.Group();
  const shoulderC = points[TOP - 1].clone(); // the level of the second thoracic bone
  girdle.position.copy(shoulderC);
  const gMat = mats.get(tint(sev.shoulders));
  for (const sx of [-1, 1]) {
    const collarIn = new THREE.Vector3(sx * 0.018, 0.015, 0.07), collarOut = new THREE.Vector3(sx * 0.185, 0.005, 0.01);
    girdle.add(bone(collarIn, collarOut, 0.007, 0.007, gMat));
    const blade = ball(new THREE.Vector3(sx * 0.1, -0.06, -0.085), 0.07, gMat, 0.95, 1.25, 0.12);
    blade.rotation.y = sx * 0.4;
    girdle.add(blade);
    const shoulder = new THREE.Vector3(sx * 0.195, 0, 0);
    girdle.add(ball(shoulder, 0.022, gMat));
    const elbow = new THREE.Vector3(sx * 0.215, -0.29, 0.0), wrist = new THREE.Vector3(sx * 0.225, -0.54, 0.02);
    girdle.add(bone(shoulder, elbow, 0.014, 0.012, ivory));
    girdle.add(ball(elbow, 0.014, ivory));
    girdle.add(bone(elbow, wrist, 0.011, 0.008, ivory));
    girdle.add(ball(wrist, 0.012, ivory, 1.2, 0.8, 0.8));
  }
  girdle.rotation.z = pose.shoulderTilt * DEG;
  root.add(girdle);

  /* ---- the head: the skull on the top bone of the neck, tilted by the head level ---- */
  const topNeck = points[points.length - 1];
  const head = new THREE.Group();
  head.position.copy(topNeck).add(new THREE.Vector3(0, 0.02, 0));
  const skullMat = ivory; // the skull stays plain: the tint marks the neck bones
  const cranium = ball(new THREE.Vector3(0, 0.075, -0.005), 0.09, skullMat, 0.92, 1.0, 1.08);
  head.add(cranium);
  const face = ball(new THREE.Vector3(0, 0.02, 0.055), 0.062, skullMat, 0.85, 1.05, 0.9);
  head.add(face);
  const jaw = ball(new THREE.Vector3(0, -0.035, 0.05), 0.046, skullMat, 1.05, 0.55, 0.9);
  head.add(jaw);
  const dark = mats.get(0x3a3a3a);
  for (const sx of [-1, 1]) head.add(ball(new THREE.Vector3(sx * 0.03, 0.045, 0.098), 0.017, dark, 1.0, 1.0, 0.5));
  head.add(ball(new THREE.Vector3(0, 0.012, 0.112), 0.011, dark, 0.7, 1.2, 0.5));
  head.rotation.z = pose.headTilt * DEG;
  root.add(head);

  /* ---- the legs: thigh, knee and shin, with the knee shifted in or out by the knee alignment ---- */
  const legMat = ivory;
  const hipBase = new THREE.Vector3(0, HIP_Y, 0);
  for (const sx of [-1, 1]) {
    const isLeft = sx === 1;
    const region: Region = isLeft ? "leftKnee" : "rightKnee";
    const kneeMat = mats.get(tint(sev[region]));
    const hipJoint = hipBase.clone().add(new THREE.Vector3(sx * 0.09, -0.005, 0)).applyAxisAngle(new THREE.Vector3(0, 0, 1), pose.hipTilt * DEG * 0);
    const legLen = 0.82;
    const inward = ((isLeft ? pose.leftKnee : pose.rightKnee) / 100) * legLen; // positive: the knee falls towards the midline
    const knee = new THREE.Vector3(sx * 0.09 - sx * inward, 0.5, 0.0);
    const flex = pose.kneeFlex * DEG; // bends the shin backwards about the knee
    const shinLen = 0.42;
    const ankle = knee.clone().add(new THREE.Vector3(sx * inward * 0.6, -Math.cos(flex) * shinLen, -Math.sin(flex) * shinLen));
    const hipShift = new THREE.Vector3(0, 0, 0);
    root.add(bone(hipJoint.clone().add(hipShift), knee, 0.024, 0.02, legMat));
    root.add(ball(hipJoint, 0.034, legMat));
    root.add(ball(knee, 0.03, kneeMat));
    const patella = ball(knee.clone().add(new THREE.Vector3(0, 0, 0.03)), 0.017, kneeMat, 1, 1.1, 0.5);
    root.add(patella);
    root.add(bone(knee, ankle, 0.018, 0.012, legMat));
    root.add(ball(ankle, 0.018, legMat));
    const foot = new THREE.Mesh(new THREE.BoxGeometry(0.07, 0.03, 0.2), legMat);
    foot.position.copy(ankle).add(new THREE.Vector3(0, -0.04, 0.05));
    root.add(foot);
  }

  root.userData.materials = mats.all;
  return root;
}

/** Frees every geometry and material of a built skeleton. */
export function disposeSkeleton(root: THREE.Object3D) {
  root.traverse((o) => {
    const mesh = o as THREE.Mesh;
    if (mesh.geometry) mesh.geometry.dispose();
  });
  for (const m of (root.userData.materials as THREE.Material[] | undefined) ?? []) m.dispose();
}
