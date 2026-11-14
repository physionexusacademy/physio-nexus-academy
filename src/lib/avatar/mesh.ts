/**
 * Geometry helpers for the teaching avatar (browser only): rest-pose vertex positions of the shared CC0 body,
 * skin weights, and "shells" — sub-meshes cut from the body, skinned to the same skeleton and pushed out along the
 * normals (scrubs, hair, beard, shoes, decals). Runtime geometry only: nothing here is downloaded.
 */
import * as THREE from "three";
import rig from "@/lib/virtual-patient/generated/rig.json";

type RigBone = { name: string; parent: string | null; head: number[]; tail: number[] };
const RIG_BONES = (rig as { bones: RigBone[] }).bones;
export const REST = new Map(RIG_BONES.map((b) => [b.name, b]));
/** GLTFLoader strips dots from bone names ("foot.L" → "footL"); this maps both spellings. */
export const sanitize = (name: string) => THREE.PropertyBinding.sanitizeNodeName(name);
const RIG_NAME = new Map(RIG_BONES.map((b) => [sanitize(b.name), b.name]));
export const restHead = (name: string) => new THREE.Vector3(...(REST.get(name)!.head as [number, number, number]));
export const restTail = (name: string) => new THREE.Vector3(...(REST.get(name)!.tail as [number, number, number]));

export type BodyData = {
  mesh: THREE.SkinnedMesh;
  count: number;
  /** Rest-pose position of every vertex in body metres (y up, +x = the figure's left, +z = front). */
  bind: Float32Array;
  /** Rest-pose normal in the same space. */
  restNormal: Float32Array;
  /** The vertex's strongest bone (rig name) and weight. */
  boneOf: string[];
  weightOf: Float32Array;
  /** Metres per geometry unit (the mesh is stored quantised). */
  scale: number;
  names: string[];
};

/** Reads the skinned body once: rest positions, normals, weights. */
export function readBody(mesh: THREE.SkinnedMesh): BodyData {
  const geometry = mesh.geometry;
  const skeleton = mesh.skeleton;
  const rootName = RIG_NAME.get(skeleton.bones[0]?.name ?? "") ?? "root";
  const restFromGeometry = new THREE.Matrix4().makeTranslation(restHead(rootName)).multiply(skeleton.boneInverses[0]).multiply(mesh.bindMatrix);
  const position = geometry.getAttribute("position");
  const normal = geometry.getAttribute("normal");
  const index = geometry.getAttribute("skinIndex");
  const weight = geometry.getAttribute("skinWeight");
  const count = position.count;
  const bind = new Float32Array(count * 3);
  const restNormal = new Float32Array(count * 3);
  const names = skeleton.bones.map((b) => RIG_NAME.get(b.name) ?? b.name);
  const boneOf: string[] = new Array(count);
  const weightOf = new Float32Array(count);
  const v = new THREE.Vector3();
  const n = new THREE.Vector3();
  const normalMatrix = new THREE.Matrix3().setFromMatrix4(restFromGeometry);
  for (let i = 0; i < count; i++) {
    v.fromBufferAttribute(position, i).applyMatrix4(restFromGeometry);
    bind.set([v.x, v.y, v.z], i * 3);
    n.fromBufferAttribute(normal, i).applyMatrix3(normalMatrix).normalize();
    restNormal.set([n.x, n.y, n.z], i * 3);
    let best = 0;
    let bestW = -1;
    for (let k = 0; k < 4; k++) {
      const w = weight.getComponent(i, k);
      if (w > bestW) {
        bestW = w;
        best = index.getComponent(i, k);
      }
    }
    boneOf[i] = names[best] ?? "root";
    weightOf[i] = bestW;
  }
  // Metres per geometry unit: compare a few vertex pairs in both spaces.
  let scale = 0;
  for (const j of [Math.floor(count / 3), Math.floor(count / 2), count - 1, Math.floor(count / 5)]) {
    const g = new THREE.Vector3().fromBufferAttribute(position, 0).sub(new THREE.Vector3().fromBufferAttribute(position, j)).length();
    const m = new THREE.Vector3(bind[0], bind[1], bind[2]).sub(new THREE.Vector3(bind[j * 3], bind[j * 3 + 1], bind[j * 3 + 2])).length();
    if (g > 1e-6 && m / g > scale) scale = m / g;
  }
  return { mesh, count, bind, restNormal, boneOf, weightOf, scale: scale || 1, names };
}

/** Per-vertex strength of influence of the bones whose rig name matches `pattern` (0–1). */
export function boneInfluence(mesh: THREE.SkinnedMesh, body: BodyData, pattern: RegExp): Float32Array {
  const index = mesh.geometry.getAttribute("skinIndex");
  const weight = mesh.geometry.getAttribute("skinWeight");
  const hit = body.names.map((n) => pattern.test(n));
  const out = new Float32Array(body.count);
  for (let i = 0; i < body.count; i++) {
    let sum = 0;
    for (let k = 0; k < 4; k++) if (hit[index.getComponent(i, k)]) sum += weight.getComponent(i, k);
    out[i] = Math.min(1, sum);
  }
  return out;
}

export type ShellOptions = {
  /** Vertices to include, 0–1 (a triangle is kept when all three vertices are > 0.5). */
  keep: ArrayLike<number>;
  /** Push-out in metres for vertex i (default 0). May return a displacement in body space instead of a plain distance along the normal. */
  offset?: (i: number, bind: THREE.Vector3, normal: THREE.Vector3) => number | THREE.Vector3;
  /** Extra per-vertex attributes copied into the shell geometry (name → values). */
  attributes?: Record<string, Float32Array>;
  /** Per-vertex colours (r, g, b per vertex of the body), copied as the shell's `color` attribute. */
  colors?: Float32Array;
  /** Planar UVs from rest positions: [axisU, axisV, scaleU, scaleV, originU, originV]. Defaults to the body's own UVs. */
  planarUv?: { u: "x" | "y" | "z"; v: "x" | "y" | "z"; su: number; sv: number; ou: number; ov: number };
};

/** Cuts a sub-mesh out of the body (same skeleton and weights), optionally displaced, and returns it ready to add next to the body. */
export function makeShell(body: BodyData, material: THREE.Material, options: ShellOptions): THREE.SkinnedMesh | null {
  const src = body.mesh.geometry;
  const indexAttr = src.getIndex();
  if (!indexAttr) return null;
  const used = new Map<number, number>();
  const order: number[] = [];
  const tris: number[] = [];
  const keep = options.keep;
  for (let t = 0; t < indexAttr.count; t += 3) {
    const a = indexAttr.getX(t), b = indexAttr.getX(t + 1), c = indexAttr.getX(t + 2);
    if (keep[a] > 0.5 && keep[b] > 0.5 && keep[c] > 0.5) {
      for (const v of [a, b, c]) {
        if (!used.has(v)) {
          used.set(v, order.length);
          order.push(v);
        }
        tris.push(used.get(v)!);
      }
    }
  }
  if (!tris.length) return null;
  const n = order.length;
  const position = src.getAttribute("position");
  const normal = src.getAttribute("normal");
  const skinIndex = src.getAttribute("skinIndex");
  const skinWeight = src.getAttribute("skinWeight");
  const geo = new THREE.BufferGeometry();
  const pos = new Float32Array(n * 3);
  const nor = new Float32Array(n * 3);
  const sIdx = new Uint16Array(n * 4);
  const sWt = new Float32Array(n * 4);
  const uv = new Float32Array(n * 2);
  const srcUv = src.getAttribute("uv");
  const tmp = new THREE.Vector3();
  const tn = new THREE.Vector3();
  const rn = new THREE.Vector3();
  const axis = (c: "x" | "y" | "z") => ({ x: 0, y: 1, z: 2 })[c];
  for (let k = 0; k < n; k++) {
    const i = order[k];
    tmp.fromBufferAttribute(position, i);
    tn.fromBufferAttribute(normal, i);
    if (options.offset) {
      rn.set(body.restNormal[i * 3], body.restNormal[i * 3 + 1], body.restNormal[i * 3 + 2]);
      const o = options.offset(i, new THREE.Vector3(body.bind[i * 3], body.bind[i * 3 + 1], body.bind[i * 3 + 2]), rn);
      if (typeof o === "number") tmp.addScaledVector(tn, o / body.scale);
      else tmp.addScaledVector(o, 1 / body.scale);
    }
    pos.set([tmp.x, tmp.y, tmp.z], k * 3);
    nor.set([tn.x, tn.y, tn.z], k * 3);
    for (let w = 0; w < 4; w++) {
      sIdx[k * 4 + w] = skinIndex.getComponent(i, w);
      sWt[k * 4 + w] = skinWeight.getComponent(i, w);
    }
    if (options.planarUv) {
      const p = options.planarUv;
      uv[k * 2] = (body.bind[i * 3 + axis(p.u)] - p.ou) * p.su;
      uv[k * 2 + 1] = (body.bind[i * 3 + axis(p.v)] - p.ov) * p.sv;
    } else if (srcUv) {
      uv[k * 2] = srcUv.getX(i);
      uv[k * 2 + 1] = srcUv.getY(i);
    }
  }
  geo.setAttribute("position", new THREE.BufferAttribute(pos, 3));
  geo.setAttribute("normal", new THREE.BufferAttribute(nor, 3));
  geo.setAttribute("uv", new THREE.BufferAttribute(uv, 2));
  geo.setAttribute("skinIndex", new THREE.BufferAttribute(sIdx, 4));
  geo.setAttribute("skinWeight", new THREE.BufferAttribute(sWt, 4));
  for (const [name, values] of Object.entries(options.attributes ?? {})) {
    const out = new Float32Array(n);
    for (let k = 0; k < n; k++) out[k] = values[order[k]];
    geo.setAttribute(name, new THREE.BufferAttribute(out, 1));
  }
  if (options.colors) {
    const col = new Float32Array(n * 3);
    for (let k = 0; k < n; k++) col.set([options.colors[order[k] * 3], options.colors[order[k] * 3 + 1], options.colors[order[k] * 3 + 2]], k * 3);
    geo.setAttribute("color", new THREE.BufferAttribute(col, 3));
  }
  geo.setIndex(tris);
  const mesh = new THREE.SkinnedMesh(geo, material);
  mesh.bind(body.mesh.skeleton, body.mesh.bindMatrix);
  mesh.position.copy(body.mesh.position);
  mesh.quaternion.copy(body.mesh.quaternion);
  mesh.scale.copy(body.mesh.scale);
  mesh.frustumCulled = false;
  mesh.castShadow = true;
  return mesh;
}

/** Smooth 0→1 between a and b. */
export const smooth = (a: number, b: number, x: number) => {
  const t = Math.min(1, Math.max(0, (x - a) / (b - a)));
  return t * t * (3 - 2 * t);
};
