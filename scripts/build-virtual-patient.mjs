/**
 * Builds the PNA Virtual Patient: a rigged adult male in exam shorts, from
 * MakeHuman's CC0 (public-domain) assets. Output:
 *   public/virtual-patient/patient.glb            (compressed, served as a static file)
 *   src/lib/virtual-patient/generated/rig.json    (bones + palpation landmarks)
 *
 *   node scripts/build-virtual-patient.mjs
 *
 * Source files are fetched from a pinned MakeHuman commit into .cache/makehuman
 * (behind a proxy, run with NODE_USE_ENV_PROXY=1), or read from MH_DATA if set.
 * MakeHuman's assets — base mesh, targets, skeleton, weights, eyes — are CC0 1.0:
 * no attribution, fee or usage limit applies. The skin texture is painted here.
 */
import fs from "node:fs";
import path from "node:path";
import sharp from "sharp";
import { Document, NodeIO } from "@gltf-transform/core";
import { ALL_EXTENSIONS, EXTTextureWebP } from "@gltf-transform/extensions";
import { meshopt, prune } from "@gltf-transform/functions";
import { MeshoptEncoder } from "meshoptimizer";

const root = process.cwd();
const COMMIT = "a8bc2d54ff0ac92e78ff71431b1023eda42bf482";
const FILES = [
  "3dobjs/base.obj",
  "rigs/default.mhskel",
  "rigs/default_weights.mhw",
  "eyes/low-poly/low-poly.obj",
  "eyes/low-poly/low-poly.mhclo",
  "eyes/materials/brown_eye.png",
  "targets/macrodetails/caucasian-male-young.target",
  "targets/macrodetails/african-male-young.target",
  "targets/macrodetails/asian-male-young.target",
  "targets/macrodetails/universal-male-young-maxmuscle-averageweight.target",
  "targets/macrodetails/proportions/male-young-averagemuscle-averageweight-idealproportions.target",
  "targets/macrodetails/height/male-young-averagemuscle-averageweight-maxheight.target",
];

/* ---------------- 1. Source files ---------------- */
const dataDir = process.env.MH_DATA ?? path.join(root, ".cache/makehuman", COMMIT);
for (const file of FILES) {
  const target = path.join(dataDir, file);
  if (fs.existsSync(target)) continue;
  if (process.env.MH_DATA) throw new Error(`Missing ${target}`);
  const url = `https://raw.githubusercontent.com/makehumancommunity/makehuman/${COMMIT}/makehuman/data/${file}`;
  const response = await fetch(url);
  if (!response.ok) throw new Error(`Download failed (${response.status}): ${url}`);
  fs.mkdirSync(path.dirname(target), { recursive: true });
  fs.writeFileSync(target, Buffer.from(await response.arrayBuffer()));
}
const read = (file) => fs.readFileSync(path.join(dataDir, file));
const text = (file) => read(file).toString("utf8");

/* ---------------- 2. Base mesh + body shape ---------------- */
function parseObj(source) {
  const positions = [];
  const uvs = [];
  const faces = []; // { v: number[], t: number[], group }
  let group = "";
  for (const line of source.split("\n")) {
    if (line.startsWith("v ")) {
      const [, x, y, z] = line.trim().split(/\s+/);
      positions.push([+x, +y, +z]);
    } else if (line.startsWith("vt ")) {
      const [, u, v] = line.trim().split(/\s+/);
      uvs.push([+u, +v]);
    } else if (line.startsWith("g ")) group = line.slice(2).trim();
    else if (line.startsWith("f ")) {
      const parts = line.trim().split(/\s+/).slice(1);
      faces.push({ v: parts.map((p) => +p.split("/")[0] - 1), t: parts.map((p) => +p.split("/")[1] - 1), group });
    }
  }
  return { positions, uvs, faces };
}

const base = parseObj(text("3dobjs/base.obj"));
const P = base.positions.map((p) => [...p]);

function applyTarget(file, weight) {
  for (const line of text(file).split("\n")) {
    if (!line || line.startsWith("#")) continue;
    const [i, dx, dy, dz] = line.trim().split(/\s+/).map(Number);
    if (!Number.isFinite(i)) continue;
    P[i][0] += dx * weight;
    P[i][1] += dy * weight;
    P[i][2] += dz * weight;
  }
}
// A young adult male; ethnic mix and build chosen to resemble a typical patient in Pakistan.
applyTarget("targets/macrodetails/caucasian-male-young.target", 0.5);
applyTarget("targets/macrodetails/african-male-young.target", 0.3);
applyTarget("targets/macrodetails/asian-male-young.target", 0.2);
applyTarget("targets/macrodetails/universal-male-young-maxmuscle-averageweight.target", 0.35);
applyTarget("targets/macrodetails/proportions/male-young-averagemuscle-averageweight-idealproportions.target", 0.6);
applyTarget("targets/macrodetails/height/male-young-averagemuscle-averageweight-maxheight.target", 0);

// MakeHuman units are decimetres, y up, facing +z, the patient's left on +x. Convert to metres, feet on y = 0.
const SCALE = 0.1;
const minY = Math.min(...base.faces.filter((f) => f.group === "body").flatMap((f) => f.v.map((i) => P[i][1])));
for (const p of P) {
  p[0] *= SCALE;
  p[1] = (p[1] - minY) * SCALE;
  p[2] *= SCALE;
}

/* ---------------- 3. Skeleton ---------------- */
const skel = JSON.parse(text("rigs/default.mhskel"));
const jointPos = (name) => {
  const ids = skel.joints[name];
  const m = [0, 0, 0];
  for (const i of ids) for (let k = 0; k < 3; k++) m[k] += P[i][k];
  return m.map((value) => value / ids.length);
};
// Parents before children.
const boneNames = [];
const visit = (name) => {
  if (boneNames.includes(name)) return;
  const parent = skel.bones[name].parent;
  if (parent) visit(parent);
  boneNames.push(name);
};
Object.keys(skel.bones).forEach(visit);
const bones = boneNames.map((name) => ({
  name,
  parent: skel.bones[name].parent,
  head: jointPos(skel.bones[name].head),
  tail: jointPos(skel.bones[name].tail),
}));
const boneIndex = new Map(bones.map((bone, index) => [bone.name, index]));
const bone = (name) => bones[boneIndex.get(name)];

const weightsByVertex = Array.from({ length: P.length }, () => []);
const mhw = JSON.parse(text("rigs/default_weights.mhw")).weights;
for (const [name, list] of Object.entries(mhw)) {
  const index = boneIndex.get(name);
  if (index === undefined) continue;
  for (const [v, w] of list) weightsByVertex[v].push([index, w]);
}
function skinOf(v) {
  const top = weightsByVertex[v].sort((a, b) => b[1] - a[1]).slice(0, 4);
  const sum = top.reduce((total, [, w]) => total + w, 0) || 1;
  while (top.length < 4) top.push([0, 0]);
  return { joints: top.map(([j]) => j), weights: top.map(([, w]) => w / sum) };
}

/* ---------------- 4. Geometry helpers ---------------- */
const sub = (a, b) => [a[0] - b[0], a[1] - b[1], a[2] - b[2]];
const add = (a, b) => [a[0] + b[0], a[1] + b[1], a[2] + b[2]];
const scale = (a, s) => [a[0] * s, a[1] * s, a[2] * s];
const dot = (a, b) => a[0] * b[0] + a[1] * b[1] + a[2] * b[2];
const cross = (a, b) => [a[1] * b[2] - a[2] * b[1], a[2] * b[0] - a[0] * b[2], a[0] * b[1] - a[1] * b[0]];
const len = (a) => Math.hypot(a[0], a[1], a[2]);
const norm = (a) => scale(a, 1 / (len(a) || 1));
const mirror = (a) => [-a[0], a[1], a[2]];

function vertexNormals(faces, positions = P) {
  const normals = new Map();
  for (const face of faces) {
    const [a, b, c] = face.v.map((i) => positions[i]);
    const n = cross(sub(b, a), sub(c, a));
    if (face.v.length === 4) {
      const d = positions[face.v[3]];
      const n2 = cross(sub(c, a), sub(d, a));
      n[0] += n2[0]; n[1] += n2[1]; n[2] += n2[2];
    }
    for (const i of face.v) {
      const acc = normals.get(i) ?? [0, 0, 0];
      normals.set(i, add(acc, n));
    }
  }
  for (const [i, n] of normals) normals.set(i, norm(n));
  return normals;
}

/** Builds an indexed triangle primitive (splitting vertices at UV seams). */
function buildPart(faces, { uvs = base.uvs, offset = 0, positions = P, vertexOf = (i) => i } = {}) {
  const normals = vertexNormals(faces, positions);
  const map = new Map();
  const pos = [], nrm = [], uv = [], joints = [], weights = [], index = [], source = [];
  for (const face of faces) {
    const ids = face.v.map((v, k) => {
      const key = `${v}/${face.t[k]}`;
      let id = map.get(key);
      if (id === undefined) {
        id = source.length;
        map.set(key, id);
        const n = normals.get(v);
        pos.push(...add(positions[v], scale(n, offset)));
        nrm.push(...n);
        const t = uvs[face.t[k]] ?? [0, 0];
        uv.push(t[0], 1 - t[1]);
        const s = skinOf(vertexOf(v));
        joints.push(...s.joints);
        weights.push(...s.weights);
        source.push(v);
      }
      return id;
    });
    index.push(ids[0], ids[1], ids[2]);
    if (ids.length === 4) index.push(ids[0], ids[2], ids[3]);
  }
  return { pos, nrm, uv, joints, weights, index, source };
}

const groupFaces = (name) => base.faces.filter((face) => face.group === name);
const bodyFaces = groupFaces("body");

// Exam shorts are painted onto the skin (compression shorts): a clean, level hem at mid-thigh.
const hipY = bone("upperleg01.L").head[1];
const kneeY = bone("lowerleg01.L").head[1];
const shortsCut = kneeY + 0.58 * (hipY - kneeY);
const waistY = hipY + 0.105;

// Eyes: the CC0 low-poly eye proxy maps one-to-one onto base-mesh eye vertices.
const eyeObj = parseObj(text("eyes/low-poly/low-poly.obj"));
const eyeMap = text("eyes/low-poly/low-poly.mhclo").split("verts 0")[1].trim().split(/\s+/).map(Number);
const eyePositions = eyeMap.map((i) => P[i]);

const parts = {
  body: buildPart(bodyFaces, { offset: 0 }),
  eyes: buildPart(eyeObj.faces, { uvs: eyeObj.uvs, positions: eyePositions, vertexOf: (i) => eyeMap[i] }),
};

/* ---------------- 5. Painted skin texture (UV space) ---------------- */
const TEX = 1024;
const SKIN = [150, 101, 72]; // warm medium-brown
const eyeL = bone("eye.L").head;
const eyeR = bone("eye.R").head;
const mouth = scale(add(bone("oris01").head, bone("oris05").head), 0.5);
const chin = bone("jaw").tail;
const nippleL = bone("breast.L").tail;
const nippleR = bone("breast.R").tail;

const hash = (x, y, z) => {
  const s = Math.sin(x * 127.1 + y * 311.7 + z * 74.7) * 43758.5453;
  return s - Math.floor(s);
};
const smooth = (p, f) => {
  // cheap value noise from three sine octaves, ~[-1, 1]
  return (Math.sin(p[0] * f + 1.3) * Math.sin(p[1] * f * 0.8 + 2.1) + Math.sin(p[2] * f * 1.3 + p[1] * f * 0.5)) * 0.5;
};
const ellipsoid = (p, c, r) => Math.hypot((p[0] - c[0]) / r[0], (p[1] - c[1]) / r[1], (p[2] - c[2]) / r[2]);
const blend = (a, b, t) => a.map((value, k) => value + (b[k] - value) * Math.max(0, Math.min(1, t)));

const eyeMid = scale(add(eyeL, eyeR), 0.5);
const HAIR = [30, 23, 19];
/** Short (buzz-cut) hair painted on the scalp: hairline high at the forehead, lower at the sides and nape. */
const headCentre = [0, eyeMid[1] + 0.02, eyeMid[2] - 0.075];
function hairAmount(p) {
  const r = sub(p, headCentre);
  if (len(r) > 0.15 || p[1] < eyeMid[1] - 0.1) return 0;
  const d = norm(r);
  // Required elevation of the hairline, by how far the point faces forward (d.z).
  const line = d[2] > 0 ? 0.05 + 0.4 * d[2] : 0.05 + 0.62 * d[2];
  const ear = Math.abs(d[0]) > 0.78 && d[1] < 0.18 && d[1] > -0.5 && Math.abs(d[2]) < 0.42;
  if (ear) return 0;
  const t = Math.max(0, Math.min(1, (d[1] - line) / 0.08));
  // A soft, stubbly edge rather than a helmet line.
  return t >= 1 ? 1 : t * (0.55 + 0.45 * hash(p[0] * 3000, p[1] * 3000, p[2] * 3000));
}
const SHORTS = [18, 34, 66];

function skinColor(p) {
  let color = SKIN.map((c) => c * (1 + 0.045 * smooth(p, 9) + 0.02 * smooth(p, 31)));
  const hair = hairAmount(p);
  if (hair > 0) {
    const strand = 0.8 + 0.4 * hash(p[0] * 1500, p[1] * 1500, p[2] * 1500);
    color = blend(color, HAIR.map((c) => c * strand), hair * 0.97);
  }
  // Compression shorts: waistband and a hem with a subtle stitched edge.
  if (p[1] <= waistY && p[1] >= shortsCut && Math.abs(p[0]) < 0.215) {
    const weave = 1 + 0.06 * Math.sin(p[1] * 900) * Math.sin(p[0] * 900 + p[2] * 900);
    let fabric = SHORTS.map((c) => c * weave);
    if (waistY - p[1] < 0.03) fabric = fabric.map((c) => c * 0.72); // waistband
    if (p[1] - shortsCut < 0.012) fabric = fabric.map((c) => c * 0.8); // hem
    return fabric;
  }
  // Eyebrows: an arched band above each eye.
  for (const [eye, side] of [[eyeL, 1], [eyeR, -1]]) {
    const dx = (p[0] - eye[0]) * side; // + lateral
    const arch = 0.026 + 0.004 * Math.cos(dx * 60);
    const d = ellipsoid(p, [eye[0] + side * 0.004, eye[1] + arch, eye[2] + 0.004], [0.026, 0.0055, 0.03]);
    if (d < 1 && p[2] > eye[2] - 0.012) {
      const hair = 0.75 + 0.25 * hash(p[0] * 400, p[1] * 900, p[2] * 400);
      color = blend(color, [38, 26, 20], (1 - d) * 2.2 * hair);
    }
  }
  // Lips.
  const lip = ellipsoid(p, [mouth[0], mouth[1], mouth[2] + 0.004], [0.026, 0.0085, 0.02]);
  if (lip < 1) color = blend(color, [142, 82, 74], (1 - lip) * 1.8);
  // Short beard stubble on the chin, jaw and upper lip (not on the lips).
  const jaw = ellipsoid(p, [chin[0], chin[1] + 0.012, chin[2] - 0.035], [0.07, 0.045, 0.06]);
  const moustache = ellipsoid(p, [mouth[0], mouth[1] + 0.014, mouth[2]], [0.03, 0.008, 0.02]);
  if ((jaw < 1 || moustache < 1) && lip > 1.05 && p[1] < mouth[1] + 0.024) {
    const t = Math.max(1 - jaw, 1 - moustache);
    const dots = hash(p[0] * 2000, p[1] * 2000, p[2] * 2000) > 0.45 ? 0.82 : 0.93;
    color = color.map((c) => c * (1 - (1 - dots) * Math.min(1, t * 2.5)));
  }
  // Areolae.
  for (const n of [nippleL, nippleR]) {
    const d = len(sub(p, n));
    if (d < 0.014) color = blend(color, [120, 76, 60], (1 - d / 0.014) * 1.6);
  }
  return color;
}

function paintSkin() {
  const rgba = new Uint8ClampedArray(TEX * TEX * 4);
  const filled = new Uint8Array(TEX * TEX);
  for (const face of bodyFaces) {
    const tris = face.v.length === 4 ? [[0, 1, 2], [0, 2, 3]] : [[0, 1, 2]];
    for (const tri of tris) {
      const pts = tri.map((k) => {
        const t = base.uvs[face.t[k]];
        return { x: t[0] * TEX, y: (1 - t[1]) * TEX, p: P[face.v[k]] };
      });
      const minX = Math.max(0, Math.floor(Math.min(...pts.map((q) => q.x)) - 1));
      const maxX = Math.min(TEX - 1, Math.ceil(Math.max(...pts.map((q) => q.x)) + 1));
      const minYp = Math.max(0, Math.floor(Math.min(...pts.map((q) => q.y)) - 1));
      const maxYp = Math.min(TEX - 1, Math.ceil(Math.max(...pts.map((q) => q.y)) + 1));
      const [a, b, c] = pts;
      const area = (b.x - a.x) * (c.y - a.y) - (c.x - a.x) * (b.y - a.y);
      if (Math.abs(area) < 1e-9) continue;
      for (let y = minYp; y <= maxYp; y++) {
        for (let x = minX; x <= maxX; x++) {
          const px = x + 0.5, py = y + 0.5;
          const w0 = ((b.x - px) * (c.y - py) - (c.x - px) * (b.y - py)) / area;
          const w1 = ((c.x - px) * (a.y - py) - (a.x - px) * (c.y - py)) / area;
          const w2 = 1 - w0 - w1;
          if (w0 < -0.02 || w1 < -0.02 || w2 < -0.02) continue;
          const p = add(add(scale(a.p, w0), scale(b.p, w1)), scale(c.p, w2));
          const color = skinColor(p);
          const o = (y * TEX + x) * 4;
          rgba[o] = color[0]; rgba[o + 1] = color[1]; rgba[o + 2] = color[2]; rgba[o + 3] = 255;
          filled[y * TEX + x] = 1;
        }
      }
    }
  }
  // Dilate so bilinear filtering never samples unpainted pixels at UV seams.
  for (let pass = 0; pass < 6; pass++) {
    const next = filled.slice();
    for (let y = 0; y < TEX; y++) for (let x = 0; x < TEX; x++) {
      if (filled[y * TEX + x]) continue;
      for (const [dx, dy] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) {
        const nx = x + dx, ny = y + dy;
        if (nx < 0 || ny < 0 || nx >= TEX || ny >= TEX || !filled[ny * TEX + nx]) continue;
        const o = (y * TEX + x) * 4, n = (ny * TEX + nx) * 4;
        rgba[o] = rgba[n]; rgba[o + 1] = rgba[n + 1]; rgba[o + 2] = rgba[n + 2]; rgba[o + 3] = 255;
        next[y * TEX + x] = 1;
        break;
      }
    }
    filled.set(next);
  }
  for (let i = 0; i < TEX * TEX; i++) if (!filled[i]) { rgba[i * 4] = SKIN[0]; rgba[i * 4 + 1] = SKIN[1]; rgba[i * 4 + 2] = SKIN[2]; rgba[i * 4 + 3] = 255; }
  return sharp(Buffer.from(rgba.buffer), { raw: { width: TEX, height: TEX, channels: 4 } }).webp({ quality: 82 }).toBuffer();
}
const skinTexture = await paintSkin();
// Darker, less red iris (typical dark-brown eyes).
const eyeTexture = await sharp(read("eyes/materials/brown_eye.png")).resize(256, 256).modulate({ saturation: 0.45, brightness: 0.92 }).webp({ quality: 85 }).toBuffer();

/* ---------------- 6. Palpation landmarks ---------------- */
const bodyIds = [...new Set(bodyFaces.flatMap((face) => face.v))];
/**
 * Casts a ray from inside the body and returns the outermost skin vertex it passes
 * (within `radius` of the ray) — i.e. the bony prominence in that direction.
 */
function extreme(origin, dir, radius) {
  const d = norm(dir);
  const tolerance = Math.min(radius, 0.022);
  let best = -1, score = -Infinity;
  for (const i of bodyIds) {
    const r = sub(P[i], origin);
    const along = dot(r, d);
    if (along <= 0 || along > 0.25) continue;
    const off = len(sub(r, scale(d, along)));
    if (off > tolerance) continue;
    if (along > score) { score = along; best = i; }
  }
  if (best < 0) throw new Error(`No vertex along ${dir} from ${origin}`);
  return best;
}
const L = (name) => bone(name).head;
const T = (name) => bone(name).tail;
const knee = L("lowerleg01.L");
const ankle = L("foot.L");
const hip = L("upperleg01.L");
const elbow = L("lowerarm01.L");
const wrist = L("wrist.L");
const shoulder = L("upperarm01.L");
const neckBase = L("neck01");
const armDir = norm(sub(elbow, shoulder));
const lateralArm = norm([-armDir[1], armDir[0], 0]); // perpendicular in the frontal plane, pointing away from the body
const thumb = L("finger1-1.L");
const forearm = norm(sub(wrist, elbow));
const radialRaw = sub(thumb, wrist);
const radial = norm(sub(radialRaw, scale(forearm, dot(radialRaw, forearm))));

// [id, vertex finder for the patient's LEFT side, bilateral?]
const landmarkDefs = [
  ["suprasternal-notch", () => extreme([0, neckBase[1] - 0.03, neckBase[2]], [0, -0.15, 1], 0.05), false],
  ["sternal-angle", () => extreme([0, neckBase[1] - 0.075, neckBase[2]], [0, 0, 1], 0.045), false],
  ["xiphoid", () => extreme([0, neckBase[1] - 0.21, neckBase[2]], [0, 0, 1], 0.05), false],
  ["umbilicus", () => extreme([0, hip[1] + 0.1, hip[2]], [0, 0, 1], 0.05), false],
  ["ac-joint", () => extreme(T("clavicle.L"), [0.25, 1, 0], 0.045), true],
  ["coracoid", () => extreme(sub(T("clavicle.L"), [0.025, 0.035, 0]), [0, 0, 1], 0.035), true],
  ["medial-epicondyle", () => extreme(elbow, scale(lateralArm, -1), 0.05), true],
  ["lateral-epicondyle", () => extreme(elbow, lateralArm, 0.05), true],
  ["olecranon", () => extreme(elbow, [0, 0, -1], 0.05), true],
  ["radial-styloid", () => extreme(wrist, radial, 0.04), true],
  ["c7", () => extreme(neckBase, [0, 0.3, -1], 0.05), false],
  ["scapular-spine", () => extreme([0.075, neckBase[1] - 0.075, neckBase[2] - 0.02], [0, 0, -1], 0.045), true],
  ["inferior-angle", () => extreme([0.09, neckBase[1] - 0.2, neckBase[2] - 0.02], [0, 0, -1], 0.045), true],
  ["iliac-crest", () => extreme(add(hip, [0, 0.13, -0.03]), [1, 0.35, 0], 0.06), true],
  ["psis", () => extreme([0.045, hip[1] + 0.07, hip[2] - 0.05], [0.15, 0.1, -1], 0.05), true],
  ["asis", () => extreme(add(hip, [0.01, 0.075, 0.02]), [0.35, 0.15, 1], 0.055), true],
  ["femoral-pulse", () => extreme(add(hip, [-0.02, -0.01, 0]), [0, 0, 1], 0.05), true],
  ["greater-trochanter", () => extreme(add(hip, [0, -0.06, 0]), [1, 0, 0], 0.07), true],
  ["ischial-tuberosity", () => extreme(add(hip, [-0.035, -0.06, -0.06]), [0, -0.6, -1], 0.05), true],
  ["patella", () => extreme(knee, [0, 0.1, 1], 0.06), true],
  ["tibial-tuberosity", () => extreme(add(knee, [0, -0.07, 0]), [0, 0, 1], 0.04), true],
  ["popliteal-fossa", () => extreme(knee, [0, 0, -1], 0.06), true],
  ["fibular-head", () => extreme(add(knee, [0, -0.045, 0]), [1, 0, -0.45], 0.05), true],
  ["medial-malleolus", () => extreme(ankle, [-1, 0, 0], 0.045), true],
  ["lateral-malleolus", () => extreme(add(ankle, [0, -0.01, 0]), [1, 0, -0.1], 0.045), true],
  ["dorsalis-pedis", () => extreme(scale(add(ankle, L("toe1-1.L")), 0.5), [0, 1, 0.2], 0.04), true],
  ["calcaneus", () => extreme(add(ankle, [0, -0.04, -0.03]), [0, -0.3, -1], 0.05), true],
];

/** Finds the body vertex mirroring v across the midline. */
function mirrorVertex(v) {
  const target = mirror(P[v]);
  let best = -1, d = Infinity;
  for (const i of bodyIds) {
    const e = len(sub(P[i], target));
    if (e < d) { d = e; best = i; }
  }
  return best;
}
/**
 * A landmark is stored as its bind-pose position plus the bones that move it, so the app can
 * follow it in any pose: posed = Σ w · boneWorld · (p − boneHead). (Vertex numbers would not
 * survive mesh compression, which reorders vertices.)
 */
const anchor = (v) => {
  const s = skinOf(v);
  return {
    p: P[v].map((n) => +n.toFixed(4)),
    b: s.joints.filter((_, k) => s.weights[k] > 0).map((j) => bones[j].name),
    w: s.weights.filter((w) => w > 0).map((w) => +w.toFixed(3)),
  };
};
const landmarks = {};
for (const [id, find, bilateral] of landmarkDefs) {
  const left = find();
  landmarks[id] = bilateral ? { left: anchor(left), right: anchor(mirrorVertex(left)) } : { mid: anchor(left) };
}

/* ---------------- 7. glTF ---------------- */
await MeshoptEncoder.ready;
const doc = new Document();
doc.createExtension(EXTTextureWebP).setRequired(true);
const buffer = doc.createBuffer();
const accessor = (type, array) => doc.createAccessor().setType(type).setArray(array).setBuffer(buffer);
const scene = doc.createScene("exam-room");

const nodes = bones.map((b) => doc.createNode(b.name));
bones.forEach((b, i) => {
  const parentHead = b.parent ? bone(b.parent).head : [0, 0, 0];
  nodes[i].setTranslation(sub(b.head, parentHead));
  if (b.parent) nodes[boneIndex.get(b.parent)].addChild(nodes[i]);
  else scene.addChild(nodes[i]);
});
const ibm = new Float32Array(bones.length * 16);
bones.forEach((b, i) => {
  ibm.set([1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, -b.head[0], -b.head[1], -b.head[2], 1], i * 16);
});
const skin = doc.createSkin("patient-skin").setInverseBindMatrices(accessor("MAT4", ibm)).setSkeleton(nodes[boneIndex.get("root")]);
nodes.forEach((node) => skin.addJoint(node));

const texture = (name, image) => doc.createTexture(name).setImage(image).setMimeType("image/webp");
const materials = {
  body: doc.createMaterial("skin").setBaseColorTexture(texture("skin", skinTexture)).setRoughnessFactor(0.62).setMetallicFactor(0),
  eyes: doc.createMaterial("eyes").setBaseColorTexture(texture("eye", eyeTexture)).setRoughnessFactor(0.15).setMetallicFactor(0),
};
const mesh = doc.createMesh("patient");
for (const [name, part] of Object.entries(parts)) {
  const count = part.source.length;
  const primitive = doc
    .createPrimitive()
    .setAttribute("POSITION", accessor("VEC3", new Float32Array(part.pos)))
    .setAttribute("NORMAL", accessor("VEC3", new Float32Array(part.nrm)))
    .setAttribute("TEXCOORD_0", accessor("VEC2", new Float32Array(part.uv)))
    .setAttribute("JOINTS_0", accessor("VEC4", new Uint8Array(part.joints)))
    .setAttribute("WEIGHTS_0", accessor("VEC4", new Float32Array(part.weights)))
    .setIndices(accessor("SCALAR", count > 65535 ? new Uint32Array(part.index) : new Uint16Array(part.index)))
    .setMaterial(materials[name]);
  mesh.addPrimitive(primitive);
}
scene.addChild(doc.createNode("patient").setMesh(mesh).setSkin(skin));
doc.getRoot().getAsset().copyright = "Built from MakeHuman CC0 1.0 assets (makehumancommunity.org); skin painted by Physio Nexus Academy.";

await doc.transform(prune(), meshopt({ encoder: MeshoptEncoder, level: "medium" }));
const io = new NodeIO().registerExtensions(ALL_EXTENSIONS).registerDependencies({ "meshopt.encoder": MeshoptEncoder });
const glb = await io.writeBinary(doc);

const outDir = path.join(root, "public/virtual-patient");
fs.mkdirSync(outDir, { recursive: true });
fs.writeFileSync(path.join(outDir, "patient.glb"), glb);

const rig = {
  source: { name: "MakeHuman", license: "CC0-1.0", commit: COMMIT },
  height: Math.max(...bodyIds.map((i) => P[i][1])),
  bones: bones.map((b) => ({ name: b.name, parent: b.parent, head: b.head.map((n) => +n.toFixed(4)), tail: b.tail.map((n) => +n.toFixed(4)) })),
  landmarks,
  bodyVertexCount: parts.body.source.length,
};
fs.mkdirSync(path.join(root, "src/lib/virtual-patient/generated"), { recursive: true });
fs.writeFileSync(path.join(root, "src/lib/virtual-patient/generated/rig.json"), JSON.stringify(rig) + "\n");

const kb = (n) => `${(n / 1024).toFixed(0)} KiB`;
console.log(`Virtual patient: ${kb(glb.byteLength)} glb (skin ${kb(skinTexture.byteLength)}), body ${parts.body.source.length} verts / ${parts.body.index.length / 3} tris, ${bones.length} bones, ${Object.keys(landmarks).length} landmarks, height ${rig.height.toFixed(2)} m.`);
