/**
 * Packs PNA's own skeleton (the raw pieces written by build_parts.py) into the two static files the Full Posture Scan loads:
 * public/posture-skeleton/skeleton-male.glb (compressed) and skeleton-meta.json (each piece's group and centroid, and the joint centres).
 *
 *   python3 scripts/posture-skeleton/own/build_parts.py <parts-dir>
 *   node scripts/posture-skeleton/own/assemble.mjs <parts-dir> public/posture-skeleton
 *
 * Needs @gltf-transform/{core,extensions,functions} and meshoptimizer, which are not dependencies of the site: set GLTF_TOOLS to a folder that has them in node_modules.
 * Every piece is centred on its own centroid (the centroid becomes the node position) so the page can turn it about its middle. The baked ambient occlusion
 * (darker in holes and creases) goes in COLOR_0.
 */
import fs from "node:fs";
import path from "node:path";
import { createRequire } from "node:module";

const tools = createRequire(path.join(process.env.GLTF_TOOLS ?? "/home/user/physio-nexus-academy/realistic-human-model", "package.json"));
const { Document, NodeIO } = tools("@gltf-transform/core");
const { EXTMeshoptCompression, KHRMeshQuantization } = tools("@gltf-transform/extensions");
const { quantize, meshopt, weld } = tools("@gltf-transform/functions");
const { MeshoptDecoder, MeshoptEncoder } = tools("meshoptimizer");

const [partsDir, outDir] = process.argv.slice(2);
if (!partsDir || !outDir) { console.error("usage: assemble.mjs <parts-dir> <out-dir>"); process.exit(1); }
const manifest = JSON.parse(fs.readFileSync(path.join(partsDir, "manifest.json"), "utf8"));

await MeshoptDecoder.ready; await MeshoptEncoder.ready;
const io = new NodeIO().registerExtensions([EXTMeshoptCompression, KHRMeshQuantization]).registerDependencies({ "meshopt.decoder": MeshoptDecoder, "meshopt.encoder": MeshoptEncoder });
const doc = new Document();
const buffer = doc.createBuffer();
const scene = doc.createScene("bones");
const mats = {
  bone: doc.createMaterial("bone").setBaseColorFactor([0.9, 0.85, 0.75, 1]).setRoughnessFactor(0.6).setMetallicFactor(0),
  cartilage: doc.createMaterial("cartilage").setBaseColorFactor([0.79, 0.84, 0.85, 1]).setRoughnessFactor(0.45).setMetallicFactor(0),
  tooth: doc.createMaterial("tooth").setBaseColorFactor([0.96, 0.94, 0.88, 1]).setRoughnessFactor(0.35).setMetallicFactor(0),
};

const read = (name, ext, T) => { const b = fs.readFileSync(path.join(partsDir, `${name}.${ext}`)); return new T(b.buffer, b.byteOffset, b.byteLength / T.BYTES_PER_ELEMENT); };
const meta = { source: "PNA's own anatomical model (scripts/posture-skeleton/own)", units: "metres, y up, the person faces +z, the person's left is +x", pieces: [], joints: manifest.joints };
let total = 0;

// a stable order: the spine top to bottom, then the rest by name
const names = Object.keys(manifest.pieces).sort();
for (const name of names) {
  const info = manifest.pieces[name];
  const P = Float32Array.from(read(name, "pos", Float32Array));
  const I = Uint32Array.from(read(name, "idx", Uint32Array));
  const n = P.length / 3;
  let ao;
  try { ao = read(name, "ao", Uint8Array); if (ao.length !== n) ao = null; } catch { ao = null; }
  const c = [0, 0, 0];
  for (let i = 0; i < n; i++) for (let k = 0; k < 3; k++) c[k] += P[i * 3 + k];
  for (let k = 0; k < 3; k++) c[k] /= n;
  for (let i = 0; i < n; i++) for (let k = 0; k < 3; k++) P[i * 3 + k] -= c[k];
  // smooth vertex normals (area weighted)
  const N = new Float32Array(n * 3);
  for (let t = 0; t < I.length; t += 3) {
    const a = I[t] * 3, b = I[t + 1] * 3, d = I[t + 2] * 3;
    const ux = P[b] - P[a], uy = P[b + 1] - P[a + 1], uz = P[b + 2] - P[a + 2], vx = P[d] - P[a], vy = P[d + 1] - P[a + 1], vz = P[d + 2] - P[a + 2];
    const nx = uy * vz - uz * vy, ny = uz * vx - ux * vz, nz = ux * vy - uy * vx;
    for (const v of [a, b, d]) { N[v] += nx; N[v + 1] += ny; N[v + 2] += nz; }
  }
  for (let i = 0; i < n; i++) { const l = Math.hypot(N[i * 3], N[i * 3 + 1], N[i * 3 + 2]) || 1; N[i * 3] /= l; N[i * 3 + 1] /= l; N[i * 3 + 2] /= l; }
  const C = new Float32Array(n * 3);
  for (let i = 0; i < n; i++) { const a = ao ? ao[i] / 255 : 1; C[i * 3] = C[i * 3 + 1] = C[i * 3 + 2] = a; }
  const prim = doc.createPrimitive()
    .setAttribute("POSITION", doc.createAccessor().setType("VEC3").setArray(P).setBuffer(buffer))
    .setAttribute("NORMAL", doc.createAccessor().setType("VEC3").setArray(N).setBuffer(buffer))
    .setAttribute("COLOR_0", doc.createAccessor().setType("VEC3").setArray(C).setBuffer(buffer))
    .setIndices(doc.createAccessor().setType("SCALAR").setArray(I).setBuffer(buffer))
    .setMaterial(mats[info.material] ?? mats.bone);
  scene.addChild(doc.createNode(name).setMesh(doc.createMesh(name).addPrimitive(prim)).setTranslation(c));
  meta.pieces.push({ name, group: info.group, material: info.material, centroid: c.map((x) => +x.toFixed(5)), tris: I.length / 3 });
  total += I.length / 3;
}

await doc.transform(weld(), quantize({ quantizePosition: 14, quantizeNormal: 10, quantizeColor: 8 }), meshopt({ encoder: MeshoptEncoder, level: "medium" }));
fs.mkdirSync(outDir, { recursive: true });
await io.write(path.join(outDir, "skeleton-male.glb"), doc);
fs.writeFileSync(path.join(outDir, "skeleton-meta.json"), JSON.stringify(meta));
const size = fs.statSync(path.join(outDir, "skeleton-male.glb")).size;
console.log(`pieces: ${meta.pieces.length}, triangles: ${total}, skeleton-male.glb: ${(size / 1024).toFixed(0)} KiB, joints: ${Object.keys(meta.joints).length}`);
