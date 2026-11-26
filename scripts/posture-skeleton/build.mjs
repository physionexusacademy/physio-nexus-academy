/**
 * Builds the web skeleton of the Full Posture Scan from the open anatomy model (BodyParts3D, CC BY 4.0), once, offline. The result is committed as static files.
 *
 *   node scripts/posture-skeleton/build.mjs <anatomy-male.glb> <out-dir> [catalog.json]
 *
 * The input is `models/anatomy-male.glb` of the npm package `open-anatomy-3d` (see ATTRIBUTION below). This script needs @gltf-transform/{core,extensions,functions}
 * and meshoptimizer, which are not dependencies of the site: set GLTF_TOOLS to a folder that has them in node_modules (default: the local realistic-human-model project).
 *
 * What it does: keeps only the bones; applies each node's scale and position so every vertex is in metres (y up, the person faces +z, the person's left is +x);
 * splits the spine and the ribs into their separate bones (each vertebra piece, each rib) so the page can pose them one by one; centres every piece on its own centroid
 * (the centroid becomes the node position); and writes skeleton-male.glb (compressed) and skeleton-meta.json (the centroids, the joint centres, the spine's rest axis).
 */
import fs from "node:fs";
import path from "node:path";
import { createRequire } from "node:module";

const tools = createRequire(path.join(process.env.GLTF_TOOLS ?? "/home/user/physio-nexus-academy/realistic-human-model", "package.json"));
const { Document, NodeIO } = tools("@gltf-transform/core");
const { EXTMeshoptCompression, KHRMeshQuantization } = tools("@gltf-transform/extensions");
const { quantize, meshopt, weld } = tools("@gltf-transform/functions");
const { MeshoptDecoder, MeshoptEncoder } = tools("meshoptimizer");

const [input, outDir, catalogPath] = process.argv.slice(2);
if (!input || !outDir) { console.error("usage: build.mjs <anatomy-male.glb> <out-dir> [catalog.json]"); process.exit(1); }

const KEEP = ["skull", "mandible", "teeth", "spine_cervical", "spine_thoracic", "spine_lumbar", "pelvis", "ribs_l", "ribs_r", "sternum", "clavicle_l", "clavicle_r", "scapula_l", "scapula_r",
  "humerus_l", "humerus_r", "forearm_l", "forearm_r", "hand_l", "hand_r", "femur_l", "femur_r", "patella_l", "patella_r", "lower_leg_l", "lower_leg_r", "foot_l", "foot_r"];
const SPLIT = new Set(["spine_cervical", "spine_thoracic", "spine_lumbar", "ribs_l", "ribs_r"]);
const MIN_PIECE_TRIS = 40; // the few 4-triangle shards of the source are dropped

await MeshoptDecoder.ready; await MeshoptEncoder.ready;
const io = new NodeIO().registerExtensions([EXTMeshoptCompression, KHRMeshQuantization]).registerDependencies({ "meshopt.decoder": MeshoptDecoder, "meshopt.encoder": MeshoptEncoder });
const src = await io.read(input);

const out = new Document();
const buffer = out.createBuffer();
const scene = out.createScene("bones");
const material = out.createMaterial("bone").setBaseColorFactor([0.89, 0.84, 0.73, 1]).setRoughnessFactor(0.6).setMetallicFactor(0);

/** Vertices of a node in metres (its own scale and position applied). */
function worldVertices(node) {
  const m = node.getWorldMatrix();
  const prim = node.getMesh().listPrimitives()[0];
  const pos = prim.getAttribute("POSITION"), nor = prim.getAttribute("NORMAL"), idx = prim.getIndices().getArray();
  const n = pos.getCount(), P = new Float32Array(n * 3), N = nor ? new Float32Array(n * 3) : null, a = [0, 0, 0];
  for (let i = 0; i < n; i++) {
    pos.getElement(i, a);
    P[i * 3] = m[0] * a[0] + m[4] * a[1] + m[8] * a[2] + m[12];
    P[i * 3 + 1] = m[1] * a[0] + m[5] * a[1] + m[9] * a[2] + m[13];
    P[i * 3 + 2] = m[2] * a[0] + m[6] * a[1] + m[10] * a[2] + m[14];
    if (nor) { nor.getElement(i, a); const x = m[0] * a[0] + m[4] * a[1] + m[8] * a[2], y = m[1] * a[0] + m[5] * a[1] + m[9] * a[2], z = m[2] * a[0] + m[6] * a[1] + m[10] * a[2], l = Math.hypot(x, y, z) || 1; N[i * 3] = x / l; N[i * 3 + 1] = y / l; N[i * 3 + 2] = z / l; }
  }
  return { P, N, I: Uint32Array.from(idx) };
}

/** Connected pieces of a mesh (vertices at the same place count as one). Returns arrays of triangle indices. */
function pieces({ P, I }) {
  const n = P.length / 3, key = new Map(), rep = new Int32Array(n);
  for (let i = 0; i < n; i++) { const k = `${Math.round(P[i * 3] * 20000)},${Math.round(P[i * 3 + 1] * 20000)},${Math.round(P[i * 3 + 2] * 20000)}`; if (!key.has(k)) key.set(k, i); rep[i] = key.get(k); }
  const parent = Int32Array.from({ length: n }, (_, i) => i);
  const find = (x) => { while (parent[x] !== x) { parent[x] = parent[parent[x]]; x = parent[x]; } return x; };
  const join = (x, y) => { x = find(x); y = find(y); if (x !== y) parent[x] = y; };
  for (let t = 0; t < I.length; t += 3) { join(rep[I[t]], rep[I[t + 1]]); join(rep[I[t]], rep[I[t + 2]]); }
  const groups = new Map();
  for (let t = 0; t < I.length; t += 3) { const g = find(rep[I[t]]); if (!groups.has(g)) groups.set(g, []); groups.get(g).push(t); }
  return [...groups.values()];
}

const meta = { source: path.basename(input), units: "metres, y up, the person faces +z, the person's left is +x", pieces: [], joints: {}, axis: [] };
let totalTris = 0;

function addPiece(name, group, geo, tris) {
  // re-index to the vertices this piece uses, and centre it on its own centroid
  const used = new Map(), P = [], N = [], I = [];
  for (const t of tris) for (let k = 0; k < 3; k++) {
    const v = geo.I[t + k];
    if (!used.has(v)) { used.set(v, P.length / 3); P.push(geo.P[v * 3], geo.P[v * 3 + 1], geo.P[v * 3 + 2]); if (geo.N) N.push(geo.N[v * 3], geo.N[v * 3 + 1], geo.N[v * 3 + 2]); }
    I.push(used.get(v));
  }
  const n = P.length / 3, c = [0, 0, 0];
  for (let i = 0; i < n; i++) { c[0] += P[i * 3]; c[1] += P[i * 3 + 1]; c[2] += P[i * 3 + 2]; }
  c[0] /= n; c[1] /= n; c[2] /= n;
  for (let i = 0; i < n; i++) { P[i * 3] -= c[0]; P[i * 3 + 1] -= c[1]; P[i * 3 + 2] -= c[2]; }
  const posAcc = out.createAccessor().setType("VEC3").setArray(new Float32Array(P)).setBuffer(buffer);
  const idxAcc = out.createAccessor().setType("SCALAR").setArray(new Uint32Array(I)).setBuffer(buffer);
  const prim = out.createPrimitive().setAttribute("POSITION", posAcc).setIndices(idxAcc).setMaterial(material);
  if (geo.N) prim.setAttribute("NORMAL", out.createAccessor().setType("VEC3").setArray(new Float32Array(N)).setBuffer(buffer));
  const mesh = out.createMesh(name).addPrimitive(prim);
  const node = out.createNode(name).setMesh(mesh).setTranslation(c);
  scene.addChild(node);
  meta.pieces.push({ name, group, centroid: c.map((x) => +x.toFixed(5)), tris: tris.length });
  totalTris += tris.length;
}

for (const node of src.getRoot().listNodes()) {
  const name = node.getName();
  if (!KEEP.includes(name) || !node.getMesh()) continue;
  const geo = worldVertices(node);
  if (!SPLIT.has(name)) { addPiece(name, name, geo, Array.from({ length: geo.I.length / 3 }, (_, i) => i * 3)); continue; }
  const list = pieces(geo)
    .filter((tris) => tris.length >= MIN_PIECE_TRIS)
    .map((tris) => { let y = 0, c = 0; for (const t of tris) for (let k = 0; k < 3; k++) { y += geo.P[geo.I[t + k] * 3 + 1]; c++; } return { tris, y: y / c }; })
    .sort((a, b) => a.y - b.y);
  list.forEach((p, i) => addPiece(`${name}_${String(i).padStart(2, "0")}`, name, geo, p.tris));
}

// the joint centres, and the spine's rest axis (the centroids of the vertebral bodies, which are the large pieces)
if (catalogPath) {
  const catalog = JSON.parse(fs.readFileSync(catalogPath, "utf8"));
  for (const j of catalog.filter((x) => x.system === "joints")) meta.joints[j.key] = j.anchor;
}
const spinePieces = meta.pieces.filter((p) => p.group.startsWith("spine_") && p.tris > 300).sort((a, b) => a.centroid[1] - b.centroid[1]);
meta.axis = spinePieces.map((p) => [p.centroid[1], p.centroid[2]]);

await out.transform(weld(), quantize({ quantizePosition: 14, quantizeNormal: 10 }), meshopt({ encoder: MeshoptEncoder, level: "medium" }));
fs.mkdirSync(outDir, { recursive: true });
await io.write(path.join(outDir, "skeleton-male.glb"), out);
fs.writeFileSync(path.join(outDir, "skeleton-meta.json"), JSON.stringify(meta));
const size = fs.statSync(path.join(outDir, "skeleton-male.glb")).size;
console.log(`pieces: ${meta.pieces.length}, triangles: ${totalTris}, skeleton-male.glb: ${(size / 1024).toFixed(0)} KiB, joints: ${Object.keys(meta.joints).length}, axis points: ${meta.axis.length}`);
