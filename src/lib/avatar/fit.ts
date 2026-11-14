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
import { readBody } from "./mesh";

export const FIT_URL = "/teacher/dr-sajjad-fit.bin";
/** The photographed eyes are wider than the generic ones; the eyeballs grow to fill the openings (front plane only). */
const EYE_SCALE = 1.08;

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
  const k = 1e-5 / figure.body.scale;
  for (let n = 0; n < count; n++) {
    const i = index[n];
    positions[i * 3] += delta[n * 2] * k;
    positions[i * 3 + 1] += delta[n * 2 + 1] * k;
  }
  mesh.geometry.setAttribute("position", new THREE.BufferAttribute(positions, 3));
  mesh.geometry.computeBoundingBox();
  mesh.geometry.computeBoundingSphere();
  scaleEyes(figure);
  figure.body = readBody(mesh);
  return true;
}

/** Scales each eyeball about its own centre in the front plane. */
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
    for (const i of members) {
      positions[i * 3] = centre.x + (positions[i * 3] - centre.x) * EYE_SCALE;
      positions[i * 3 + 1] = centre.y + (positions[i * 3 + 1] - centre.y) * EYE_SCALE;
    }
  }
  eyes.geometry.setAttribute("position", new THREE.BufferAttribute(positions, 3));
  eyes.geometry.computeBoundingBox();
  eyes.geometry.computeBoundingSphere();
}
