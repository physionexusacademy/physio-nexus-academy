/**
 * Fits the shared body's head to the reference photograph of Dr. Sajjad (browser only).
 *
 * `public/teacher/dr-sajjad-fit.bin` holds, for every vertex above the neck that has to move, a small displacement in the
 * front plane (x, y), computed offline by `scripts/avatar-likeness/` from landmarks measured on the photo (eye corners and lid edges,
 * nostrils, mouth corners and lips, chin, jaw, cheeks, ears, hairline). Layout (little endian):
 *   uint32 count | uint16 vertex[count] | int16 dx, dy [count × 2]   (units of 0.01 mm)
 * The eyeballs are scaled to fill the wider eye openings. Run before the body is read for dressing, so hair, beard and clothes follow.
 */
import * as THREE from "three";
import type { Figure } from "./figure";
import { readBody, restHead, restTail, smooth } from "./mesh";

export const FIT_URL = "/teacher/dr-sajjad-fit.bin";
/** The fitted head is in photo proportions: photo pixel = mid + x·scale, eyePy + (eyeY − y)·scale (see scripts/avatar-likeness). */
export const PHOTO_FIT = { mid: 527, scale: 1887, eyeY: 1.6345, eyePy: 408.5 };
/** The hair crop of the photograph (pixels of the 1121×1403 reference) shipped as public/teacher/dr-sajjad-hair.webp. */
export const HAIR_CROP = { x0: 300, y0: 100, w: 400, h: 360 };
/** The photographed eyes are wider than the generic ones; the eyeballs grow to fill the openings (front plane only). */
const EYE_SCALE = 1.08;
/** Proportions of the real man against the generic body: a larger head (about 3:1 shoulders to head), a thicker neck, fuller arms. */
export const HEAD_SCALE = 1.1;
export const HEAD_PIVOT = new THREE.Vector3(0, 1.636, 0.05);
const NECK_THICKEN = 0.12;
/** How much fuller each part is than the generic body (radius about the bone's own line). */
const FULLER: [RegExp, number][] = [
  [/^(upperarm|lowerarm)/, 0.1],
  [/^spine0[345]/, 0.07],
  [/^spine0[12]/, 0.05],
  [/^clavicle/, 0.06],
];

/** Scale factor of the head field at height y: 1 below the neck, HEAD_SCALE from the nape of the head up. */
const headFactor = (y: number) => 1 + (HEAD_SCALE - 1) * smooth(1.5, 1.6, y);

export async function applyHeadFit(figure: Figure, url = FIT_URL): Promise<boolean> {
  let buffer: ArrayBuffer;
  try {
    const response = await fetch(url);
    if (!response.ok) return false;
    buffer = await response.arrayBuffer();
  } catch {
    return false;
  }
  if (buffer.byteLength < 4) return false;
  const count = new DataView(buffer).getUint32(0, true);
  if (buffer.byteLength !== 4 + count * 6) return false;
  const index = new Uint16Array(buffer, 4, count);
  const delta = new Int16Array(buffer.slice(4 + count * 2));
  const mesh = figure.mesh;
  const source = mesh.geometry.getAttribute("position");
  if (index.some((i) => i >= source.count)) return false;
  // The mesh is stored quantised; work on a float copy. `scale` converts metres to geometry units.
  const positions = new Float32Array(source.count * 3);
  for (let i = 0; i < source.count; i++) positions.set([source.getX(i), source.getY(i), source.getZ(i)], i * 3);
  // Work in metres on a copy of the rest positions: the photo fit first, then the body proportions.
  const bind = figure.body.bind;
  const rest = Float32Array.from(bind);
  for (let n = 0; n < count; n++) {
    const i = index[n];
    rest[i * 3] += delta[n * 2] * 1e-5;
    rest[i * 3 + 1] += delta[n * 2 + 1] * 1e-5;
  }
  shapeBody(figure, rest);
  const inv = 1 / figure.body.scale;
  for (let i = 0; i < source.count; i++) {
    for (let c = 0; c < 3; c++) {
      const d = rest[i * 3 + c] - bind[i * 3 + c];
      if (d !== 0) positions[i * 3 + c] += d * inv;
    }
  }
  mesh.geometry.setAttribute("position", new THREE.BufferAttribute(positions, 3));
  mesh.geometry.computeBoundingBox();
  mesh.geometry.computeBoundingSphere();
  scaleEyes(figure);
  figure.body = readBody(mesh);
  return true;
}

/** Head enlargement, thicker neck and fuller arms, in rest-space metres (`rest` is modified in place). */
function shapeBody(figure: Figure, rest: Float32Array) {
  const mesh = figure.mesh;
  const geometry = mesh.geometry;
  const count = rest.length / 3;
  const index = geometry.getAttribute("skinIndex");
  const weight = geometry.getAttribute("skinWeight");
  const names = figure.body.names;
  // Fuller arms, chest, abdomen and shoulders: grow the radius about each bone's own line (the pose and the hand placement use the bones,
  // which do not move, so nothing detaches when he reaches).
  const arm: { head: THREE.Vector3; axis: THREE.Vector3; length: number; amount: number }[] = names.map((name) => {
    const amount = FULLER.find(([pattern]) => pattern.test(name))?.[1] ?? 0;
    if (!amount) return { head: new THREE.Vector3(), axis: new THREE.Vector3(), length: 0, amount: 0 };
    const head = restHead(name);
    const tail = restTail(name);
    const axis = tail.clone().sub(head);
    const length = axis.length();
    return { head, axis: axis.divideScalar(length || 1), length, amount };
  });
  const v = new THREE.Vector3();
  const c = new THREE.Vector3();
  const out = new Float32Array(rest.length);
  for (let i = 0; i < count; i++) {
    v.set(rest[i * 3], rest[i * 3 + 1], rest[i * 3 + 2]);
    // fuller arms
    let ax = 0, ay = 0, az = 0;
    for (let k = 0; k < 4; k++) {
      const seg = arm[index.getComponent(i, k)];
      const w = weight.getComponent(i, k);
      if (!seg || !seg.length || w <= 0) continue;
      const t = Math.min(seg.length, Math.max(0, v.clone().sub(seg.head).dot(seg.axis)));
      c.copy(seg.head).addScaledVector(seg.axis, t);
      ax += (v.x - c.x) * seg.amount * w;
      ay += (v.y - c.y) * seg.amount * w;
      az += (v.z - c.z) * seg.amount * w;
    }
    v.x += ax; v.y += ay; v.z += az;
    // thicker neck: radial in the horizontal plane about the neck's axis, strongest mid-neck
    const bell = smooth(1.46, 1.5, v.y) * (1 - smooth(1.56, 1.6, v.y));
    if (bell > 0 && Math.abs(v.x) < 0.08) {
      v.x *= 1 + NECK_THICKEN * bell;
      v.z = 0.03 + (v.z - 0.03) * (1 + NECK_THICKEN * bell);
    }
    // larger head about the eye level
    const f = headFactor(v.y);
    if (f !== 1) {
      v.x = HEAD_PIVOT.x + (v.x - HEAD_PIVOT.x) * f;
      v.y = HEAD_PIVOT.y + (v.y - HEAD_PIVOT.y) * f;
      v.z = HEAD_PIVOT.z + (v.z - HEAD_PIVOT.z) * f;
    }
    out.set([v.x, v.y, v.z], i * 3);
  }
  rest.set(out);
}

/** Scales each eyeball about its own centre in the front plane, and moves it with the enlarged head. */
function scaleEyes(figure: Figure) {
  const eyes = figure.eyes;
  if (!eyes) return;
  const source = eyes.geometry.getAttribute("position");
  const positions = new Float32Array(source.count * 3);
  for (let i = 0; i < source.count; i++) positions.set([source.getX(i), source.getY(i), source.getZ(i)], i * 3);
  for (const side of [-1, 1]) {
    const members: number[] = [];
    const centre = new THREE.Vector3();
    for (let i = 0; i < source.count; i++) {
      if (Math.sign(positions[i * 3]) !== side) continue;
      members.push(i);
      centre.x += positions[i * 3];
      centre.y += positions[i * 3 + 1];
      centre.z += positions[i * 3 + 2];
    }
    if (!members.length) continue;
    centre.divideScalar(members.length);
    // Where the eyeball sits after the head grows (the eye bone's rest position stands in for the centre, in metres).
    const bone = restHead(side < 0 ? "eye.R" : "eye.L");
    const f = headFactor(bone.y);
    const shift = bone.clone().sub(HEAD_PIVOT).multiplyScalar(f - 1).multiplyScalar(1 / figure.body.scale);
    for (const i of members) {
      positions[i * 3] = centre.x + shift.x + (positions[i * 3] - centre.x) * EYE_SCALE * f;
      positions[i * 3 + 1] = centre.y + shift.y + (positions[i * 3 + 1] - centre.y) * EYE_SCALE * f;
      positions[i * 3 + 2] = centre.z + shift.z + (positions[i * 3 + 2] - centre.z) * f;
    }
  }
  eyes.geometry.setAttribute("position", new THREE.BufferAttribute(positions, 3));
  eyes.geometry.computeBoundingBox();
  eyes.geometry.computeBoundingSphere();
}
