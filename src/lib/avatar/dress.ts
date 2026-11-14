/**
 * Dresses the shared CC0 body as "Dr. Sajjad Raza PT" (browser only): medium-light skin, navy scrubs with the embroidered
 * name and the PNA logo, a textured quiff with faded sides, a full trimmed beard, brows, a black smartwatch and shoes.
 * Everything is generated at run time from the body's own geometry (shells skinned to the same skeleton) and small canvas
 * textures; the only downloads are the body that the Virtual Patient already loads and one 15 KB logo image.
 */
import * as THREE from "three";
import type { Figure } from "./figure";
import { REST, boneInfluence, makeShell, restHead, restTail, smooth, type BodyData } from "./mesh";

export const LOOK = {
  skin: "#f0c8ae",
  hair: "#17120f",
  beard: "#271d18",
  scrubs: "#14284a",
  scrubsTrim: "#1c3a66",
  teal: "#01828B",
  name: "Dr. Sajjad Raza PT",
  logoUrl: "/teacher/pna-chest-logo.webp",
};

type Dressed = {
  /** Eyebrow groups (moved up and tilted for expression). */
  brows: { left: THREE.Group; right: THREE.Group };
  /** Everything added to the body, for visibility toggles and disposal. */
  parts: THREE.Object3D[];
};

/* ---------------- small helpers ---------------- */

const hash = (x: number, y: number, z: number) => {
  const s = Math.sin(x * 127.1 + y * 311.7 + z * 74.7) * 43758.5453;
  return s - Math.floor(s);
};
const noise3 = (x: number, y: number, z: number) => {
  // Value noise: smooth, deterministic.
  const xi = Math.floor(x), yi = Math.floor(y), zi = Math.floor(z);
  const f = (t: number) => t * t * (3 - 2 * t);
  const xf = f(x - xi), yf = f(y - yi), zf = f(z - zi);
  let out = 0;
  for (let dx = 0; dx < 2; dx++) for (let dy = 0; dy < 2; dy++) for (let dz = 0; dz < 2; dz++) {
    const w = (dx ? xf : 1 - xf) * (dy ? yf : 1 - yf) * (dz ? zf : 1 - zf);
    out += w * hash(xi + dx, yi + dy, zi + dz);
  }
  return out;
};

function canvas(w: number, h: number) {
  const c = document.createElement("canvas");
  c.width = w;
  c.height = h;
  return c;
}

/** Cells per geometry unit for noise of `cellMetres` size. */
const cellsFor = (body: BodyData, cellMetres: number) => body.scale / cellMetres;

/**
 * Cloth/hair/beard material: a standard material that follows the shell's per-vertex "field" (positive inside the garment or
 * hair region). `soft` fades the edge out over that many metres with a little noise (hair and beard); otherwise the edge is a clean cut.
 */
function shellMaterial(base: THREE.MeshStandardMaterial, options: { soft?: number; noiseCells?: number } = {}) {
  base.side = THREE.FrontSide;
  const soft = options.soft ?? 0;
  if (soft) {
    base.transparent = true;
    base.alphaTest = 0.04;
  }
  base.onBeforeCompile = (shader) => {
    shader.vertexShader = shader.vertexShader
      .replace("#include <common>", "#include <common>\nattribute float field;\nvarying float vField;\nvarying vec3 vObjPos;")
      .replace("#include <begin_vertex>", "#include <begin_vertex>\nvField = field;\nvObjPos = position;");
    const cells = (options.noiseCells ?? 0).toFixed(2);
    shader.fragmentShader = shader.fragmentShader
      .replace("#include <common>", "#include <common>\nvarying float vField;\nvarying vec3 vObjPos;\nfloat h31(vec3 p){ return fract(sin(dot(p, vec3(127.1,311.7,74.7))) * 43758.5453); }\nfloat vn(vec3 p){ vec3 i = floor(p); vec3 f = fract(p); f = f * f * (3.0 - 2.0 * f); return mix(mix(mix(h31(i), h31(i + vec3(1,0,0)), f.x), mix(h31(i + vec3(0,1,0)), h31(i + vec3(1,1,0)), f.x), f.y), mix(mix(h31(i + vec3(0,0,1)), h31(i + vec3(1,0,1)), f.x), mix(h31(i + vec3(0,1,1)), h31(i + vec3(1,1,1)), f.x), f.y), f.z); }")
      .replace("void main() {", "void main() {\n  if (vField < " + (soft ? "-0.002" : "0.0") + ") discard;")
      .replace(
        "#include <alphamap_fragment>",
        soft
          ? `#include <alphamap_fragment>\n  float soft = smoothstep(0.0, ${soft.toFixed(4)}, vField + ((0.6 * vn(vObjPos * ${cells}) + 0.4 * vn(vObjPos * ${cells} * 2.7)) - 0.5) * ${(soft * 1.1).toFixed(4)});\n  diffuseColor.a *= soft;`
          : "#include <alphamap_fragment>",
      );
  };
  base.customProgramCacheKey = () => `avatar-shell-${soft.toFixed(4)}-${(options.noiseCells ?? 0).toFixed(1)}`;
  return base;
}

/* ---------------- skin ---------------- */

/** Re-colours the body's baked skin texture to Dr. Sajjad's complexion, keeping the painted hair, brows, lips and shading. */
function recolourSkin(figure: Figure) {
  const material = figure.mesh.material as THREE.MeshStandardMaterial;
  const image = material.map?.image as CanvasImageSource & { width: number; height: number } | undefined;
  const skin = new THREE.Color(LOOK.skin);
  const target = [skin.r, skin.g, skin.b].map((c) => c * 255);
  const next = new THREE.MeshPhysicalMaterial({
    roughness: 0.58,
    metalness: 0,
    sheen: 0.15,
    sheenRoughness: 0.6,
    sheenColor: new THREE.Color("#ffd2c0"),
    specularIntensity: 0.35,
  });
  if (image) {
    const c = canvas(image.width, image.height);
    const ctx = c.getContext("2d", { willReadFrequently: true })!;
    ctx.drawImage(image, 0, 0);
    const data = ctx.getImageData(0, 0, c.width, c.height);
    const px = data.data;
    // The painted base colour is the most common one; estimate it from a sparse sample.
    const base = [0, 0, 0];
    let n = 0;
    for (let i = 0; i < px.length; i += 4 * 97) {
      if (Math.abs(px[i] - px[i + 2]) > 30 && px[i] > 110) { base[0] += px[i]; base[1] += px[i + 1]; base[2] += px[i + 2]; n++; }
    }
    base[0] /= n || 1; base[1] /= n || 1; base[2] /= n || 1;
    const lumBase = 0.299 * base[0] + 0.587 * base[1] + 0.114 * base[2];
    for (let i = 0; i < px.length; i += 4) {
      const r = px[i], g = px[i + 1], b = px[i + 2];
      const d = Math.hypot(r - base[0], g - base[1], b - base[2]);
      const w = 1 - Math.min(1, Math.max(0, (d - 18) / 70)); // 1 = skin, 0 = painted feature
      const lum = (0.299 * r + 0.587 * g + 0.114 * b) / lumBase;
      px[i] = r + (target[0] * lum - r) * w;
      px[i + 1] = g + (target[1] * lum - g) * w;
      px[i + 2] = b + (target[2] * lum - b) * w;
    }
    ctx.putImageData(data, 0, 0);
    const map = new THREE.CanvasTexture(c);
    map.flipY = false;
    map.colorSpace = THREE.SRGBColorSpace;
    map.anisotropy = 4;
    next.map = map;
  } else {
    next.color = skin;
  }
  figure.mesh.material = next;
  figure.own(next);
}

/* ---------------- scrubs ---------------- */

const TORSO = /^(spine|breast|clavicle|shoulder01|root|pelvis)/;
const ARM = /^upperarm/;
const LEG = /^(upperleg|lowerleg)/;

const NECKISH = /^(neck|head|special|levator|oris|jaw|temporalis|oculi|orbicularis|risorius|tongue|eye)/;
const HANDISH = /^(lowerarm|wrist|finger|metacarpal)/;

function scrubsFields(body: BodyData) {
  const { bind, boneOf, count } = body;
  const shirt = new Float32Array(count).fill(-1);
  const pants = new Float32Array(count).fill(-1);
  const shoulder = restHead("upperarm01.L");
  const elbow = restHead("lowerarm01.L");
  const armAxis = elbow.clone().sub(shoulder);
  const armLength = armAxis.length();
  armAxis.normalize();
  const HEM = 0.86, NECK = 1.49, SLEEVE = 0.52, WAIST = 1.03, ANKLE = 0.075;
  for (let i = 0; i < count; i++) {
    const x = bind[i * 3], y = bind[i * 3 + 1], z = bind[i * 3 + 2];
    const name = boneOf[i];
    if (TORSO.test(name) || NECKISH.test(name)) {
      let f = Math.min(y - HEM, NECK - y);
      if (z > -0.01 && y > 1.2) {
        // V-neck: the opening is a triangle from the notch up to the shoulders.
        const vTop = 1.33 + 0.16 * Math.min(1, Math.abs(x) / 0.1);
        f = Math.min(f, vTop - y);
      }
      if (f > -0.05) shirt[i] = f;
    } else if (ARM.test(name)) {
      const sx = Math.sign(x || 1);
      const origin = new THREE.Vector3(sx * Math.abs(shoulder.x), shoulder.y, shoulder.z);
      const dir = new THREE.Vector3(sx * armAxis.x, armAxis.y, armAxis.z);
      const along = new THREE.Vector3(x, y, z).sub(origin).dot(dir) / armLength;
      shirt[i] = (SLEEVE - along) * armLength;
    }
    // Trousers: everything below the waist except the arms and hands that hang beside the hips.
    if (y < WAIST + 0.03 && !ARM.test(name) && !HANDISH.test(name) && !NECKISH.test(name)) {
      const f = Math.min(y - ANKLE, WAIST + 0.02 - y);
      if (f > -0.05) pants[i] = f;
    }
  }
  return { shirt, pants };
}

function weaveTexture() {
  const c = canvas(128, 128);
  const ctx = c.getContext("2d")!;
  ctx.fillStyle = "#808080";
  ctx.fillRect(0, 0, 128, 128);
  for (let i = 0; i < 2600; i++) {
    const v = 110 + Math.random() * 60;
    ctx.fillStyle = `rgb(${v},${v},${v})`;
    ctx.fillRect(Math.random() * 128, Math.random() * 128, 1, Math.random() < 0.5 ? 3 : 1);
  }
  const t = new THREE.CanvasTexture(c);
  t.wrapS = t.wrapT = THREE.RepeatWrapping;
  return t;
}

function dressScrubs(figure: Figure, parts: THREE.Object3D[]) {
  const body = figure.body;
  const { shirt, pants } = scrubsFields(body);
  const bump = figure.own(weaveTexture());
  const make = (field: Float32Array, color: string, offsetAt: (p: THREE.Vector3) => number, wobble: number) => {
    const material = shellMaterial(new THREE.MeshStandardMaterial({ color, roughness: 0.88, metalness: 0, bumpMap: bump, bumpScale: 0.6 }));
    const mesh = makeShell(body, material, {
      keep: field.map((f) => (f > -0.03 ? 1 : 0)) as unknown as Float32Array,
      attributes: { field },
      planarUv: { u: "x", v: "y", su: 14, sv: 14, ou: 0, ov: 0 },
      offset: (_i, p) => offsetAt(p) + wobble * (noise3(p.x * 22, p.y * 22, p.z * 22) - 0.5),
    });
    if (mesh) {
      figure.mesh.parent?.add(mesh);
      parts.push(mesh);
      figure.own(material);
    }
    return mesh;
  };
  // Relaxed scrub fit: the trousers hang a little away from the legs and flare slightly at the hem; the top is looser than skin.
  make(pants, LOOK.scrubs, (p) => 0.016 + 0.012 * smooth(0.95, 0.55, p.y) + 0.004 * smooth(0.25, 0.1, p.y), 0.0035);
  make(shirt, LOOK.scrubs, (p) => 0.0095 + 0.007 * smooth(1.2, 0.9, p.y), 0.0035);
  return { shirt };
}

/** A thread-like decal on the chest: a skinned patch of the shirt carrying a transparent canvas texture. */
function chestDecal(figure: Figure, shirt: Float32Array, centre: [number, number], size: [number, number], texture: THREE.Texture, parts: THREE.Object3D[]) {
  const body = figure.body;
  const [cx, cy] = centre;
  const [w, h] = size;
  const field = new Float32Array(body.count).fill(-1);
  for (let i = 0; i < body.count; i++) {
    const x = body.bind[i * 3], y = body.bind[i * 3 + 1];
    if (shirt[i] > 0.01 && body.restNormal[i * 3 + 2] > 0.2 && Math.abs(x - cx) < w / 2 + 0.012 && Math.abs(y - cy) < h / 2 + 0.012) field[i] = 1;
  }
  const material = new THREE.MeshStandardMaterial({ map: texture, transparent: true, roughness: 0.75, metalness: 0, polygonOffset: true, polygonOffsetFactor: -2, polygonOffsetUnits: -2, depthWrite: false });
  const mesh = makeShell(body, material, {
    keep: field,
    offset: (_i, p) => 0.0095 + 0.007 * smooth(1.2, 0.9, p.y) + 0.0036,
    planarUv: { u: "x", v: "y", su: 1 / w, sv: 1 / h, ou: cx - w / 2, ov: cy - h / 2 },
  });
  if (mesh) {
    mesh.castShadow = false;
    figure.mesh.parent?.add(mesh);
    parts.push(mesh);
    figure.own(material);
  }
}

function nameTexture() {
  const c = canvas(512, 112);
  const ctx = c.getContext("2d")!;
  ctx.clearRect(0, 0, 512, 112);
  ctx.fillStyle = "#f4f7fb";
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.font = "600 56px 'Segoe UI', Helvetica, Arial, sans-serif";
  ctx.shadowColor = "rgba(0,0,0,0.35)";
  ctx.shadowBlur = 1.5;
  ctx.fillText(LOOK.name, 256, 58);
  const t = new THREE.CanvasTexture(c);
  t.colorSpace = THREE.SRGBColorSpace;
  t.anisotropy = 4;
  return t;
}

async function logoTexture(url: string) {
  const loader = new THREE.TextureLoader();
  try {
    const t = await loader.loadAsync(url);
    t.colorSpace = THREE.SRGBColorSpace;
    t.anisotropy = 4;
    return t;
  } catch {
    return null;
  }
}

/* ---------------- hair and beard ---------------- */

const angleOf = (x: number, z: number) => Math.abs(Math.atan2(x, z - 0.045)); // 0 = straight ahead, π = behind

/** Distance-like value that is < 1 inside an ellipsoid round the ear (used to keep ears clear). */
const earD = (x: number, y: number, z: number) => Math.hypot((Math.abs(x) - 0.083) / 0.024, (y - 1.636) / 0.045, (z - 0.045) / 0.032);

function hairFields(body: BodyData) {
  const { bind, count, boneOf } = body;
  const field = new Float32Array(count).fill(-1);
  for (let i = 0; i < count; i++) {
    const x = bind[i * 3], y = bind[i * 3 + 1], z = bind[i * 3 + 2];
    if (y < 1.55 || !/^(head|neck03|special|temporalis|levator)/.test(boneOf[i])) continue;
    const phi = angleOf(x, z);
    const deg = (phi * 180) / Math.PI;
    // Hairline height all round: forehead, temples (faded sides), nape.
    const hairline = 1.697 - 0.044 * smooth(32, 85, deg) - 0.06 * smooth(105, 150, deg);
    let f = y - hairline;
    // The ears stay clear.
    f = Math.min(f, (earD(x, y, z) - 1.0) * 0.02);
    if (f > -0.03) field[i] = f;
  }
  return field;
}

function strandTexture(color: string) {
  const c = canvas(256, 256);
  const ctx = c.getContext("2d")!;
  ctx.fillStyle = "#808080";
  ctx.fillRect(0, 0, 256, 256);
  for (let i = 0; i < 1400; i++) {
    const x = Math.random() * 256;
    const y = Math.random() * 256;
    const len = 30 + Math.random() * 80;
    const v = 70 + Math.random() * 130;
    ctx.strokeStyle = `rgba(${v},${v},${v},0.55)`;
    ctx.lineWidth = 0.8 + Math.random() * 1.2;
    ctx.beginPath();
    ctx.moveTo(x, y);
    ctx.bezierCurveTo(x + (Math.random() - 0.5) * 10, y + len * 0.3, x + (Math.random() - 0.5) * 14, y + len * 0.7, x + (Math.random() - 0.5) * 8, y + len);
    ctx.stroke();
  }
  void color;
  const t = new THREE.CanvasTexture(c);
  t.wrapS = t.wrapT = THREE.RepeatWrapping;
  return t;
}

function dressHair(figure: Figure, parts: THREE.Object3D[]) {
  const body = figure.body;
  const field = hairFields(body);
  const strands = figure.own(strandTexture(LOOK.hair));
  const material = shellMaterial(new THREE.MeshStandardMaterial({ color: LOOK.hair, roughness: 0.66, metalness: 0, bumpMap: strands, bumpScale: 1.0 }), { soft: 0.012, noiseCells: cellsFor(body, 0.006) });
  const mesh = makeShell(body, material, {
    keep: field.map((f) => (f > -0.015 ? 1 : 0)) as unknown as Float32Array,
    attributes: { field },
    planarUv: { u: "x", v: "z", su: 9, sv: 9, ou: 0, ov: 0 },
    offset: (i, p, n) => {
      const deg = (angleOf(p.x, p.z) * 180) / Math.PI;
      // Short, faded sides and back; fuller crown; a lifted, swept-back quiff rising from the front hairline.
      const fade = smooth(1.665, 1.72, p.y);
      let d = 0.0022 + 0.011 * fade + 0.005 * smooth(1.72, 1.75, p.y);
      d += (noise3(p.x * 40, p.y * 40, p.z * 40) - 0.5) * 0.0035 * fade;
      const out = new THREE.Vector3(n.x, n.y, n.z).multiplyScalar(d);
      const front = smooth(-0.01, 0.1, p.z) * smooth(95, 40, deg);
      const f = field[i];
      // Volume rises from the hairline, peaks about 4 cm back, then eases into the crown; the edge itself pushes slightly forward.
      const bump = smooth(0.0, 0.04, f) * smooth(0.1, 0.05, f);
      out.y += 0.028 * bump * front;
      out.z += 0.007 * smooth(0.02, 0.0, f) * front + 0.012 * bump * front;
      return out;
    },
  });
  if (mesh) {
    figure.mesh.parent?.add(mesh);
    parts.push(mesh);
    figure.own(material);
  }
}

function beardField(body: BodyData) {
  const { bind, count, boneOf } = body;
  const field = new Float32Array(count).fill(-1);
  const mouth = { x: 0, y: 1.5495 };
  for (let i = 0; i < count; i++) {
    const x = bind[i * 3], y = bind[i * 3 + 1], z = bind[i * 3 + 2];
    if (y < 1.48 || y > 1.66 || z < 0.05) continue;
    if (!/^(head|jaw|neck|special|oris|risorius|levator|temporalis|tongue|orbicularis)/.test(boneOf[i])) continue;
    const ax = Math.abs(x);
    if (ax > 0.082) continue;
    // Upper edge: under the cheekbone, rising to the sideburn in front of the ear.
    const top = 1.587 + 0.012 * smooth(0.025, 0.055, ax) + 0.05 * smooth(0.055, 0.074, ax);
    // Lower edge: under the chin, a short way down the neck.
    const bottom = 1.492 + 0.014 * smooth(0.0, 0.07, ax);
    let f = Math.min(top - y, y - bottom, (0.076 - ax) * 1.2, (z - 0.07) * 0.9);
    // The nostril / philtrum area stays clear above the moustache.
    if (y > 1.568 && ax < 0.03) f = Math.min(f, (1.582 - y) * 0.9);
    // The mouth opening stays clear.
    const ex = (x - mouth.x) / 0.029, ey = (y - mouth.y) / 0.0125;
    const inside = Math.hypot(ex, ey);
    if (inside < 1.22) f = Math.min(f, (inside - 1.0) * 0.012);
    f = Math.min(f, (earD(x, y, z) - 1.0) * 0.02);
    if (f > -0.02) field[i] = f;
  }
  return field;
}

function dressBeard(figure: Figure, parts: THREE.Object3D[]) {
  const body = figure.body;
  const field = beardField(body);
  const strands = figure.own(strandTexture(LOOK.beard));
  const material = shellMaterial(new THREE.MeshStandardMaterial({ color: LOOK.beard, roughness: 0.68, metalness: 0, bumpMap: strands, bumpScale: 0.8 }), { soft: 0.016, noiseCells: cellsFor(body, 0.005) });
  const mesh = makeShell(body, material, {
    keep: field.map((f) => (f > -0.012 ? 1 : 0)) as unknown as Float32Array,
    attributes: { field },
    planarUv: { u: "x", v: "y", su: 12, sv: 12, ou: 0, ov: 0 },
    offset: (_i, p) => 0.0032 + 0.002 * smooth(1.52, 1.5, p.y) + (noise3(p.x * 55, p.y * 55, p.z * 55) - 0.5) * 0.0016,
  });
  if (mesh) {
    figure.mesh.parent?.add(mesh);
    parts.push(mesh);
    figure.own(material);
  }
}

/* ---------------- eyebrows ---------------- */

function dressBrows(figure: Figure, parts: THREE.Object3D[]) {
  const head = figure.bone("head");
  const make = (side: 1 | -1) => {
    const group = new THREE.Group();
    const origin = restHead("head");
    // Centreline of the brow in rest coordinates; the surface depth is read from the skin.
    const pts: THREE.Vector3[] = [];
    const eye = restHead("eye.L");
    const body = figure.body;
    const surfaceZ = (x: number, y: number) => {
      let best = -Infinity;
      for (let i = 0; i < body.count; i++) {
        if (Math.abs(body.bind[i * 3] - x) < 0.006 && Math.abs(body.bind[i * 3 + 1] - y) < 0.006 && body.restNormal[i * 3 + 2] > 0.2) best = Math.max(best, body.bind[i * 3 + 2]);
      }
      return Number.isFinite(best) ? best : 0.14;
    };
    const steps = 9;
    for (let k = 0; k <= steps; k++) {
      const t = k / steps; // 0 = inner end, 1 = outer end
      const x = side * (0.013 + 0.05 * t);
      const y = eye.y + 0.0205 + 0.0075 * Math.sin(Math.PI * Math.min(1, t * 0.9 + 0.1)) - 0.004 * t * t;
      pts.push(new THREE.Vector3(x, y, surfaceZ(x, y) + 0.0022));
    }
    const positions: number[] = [];
    const uvs: number[] = [];
    const indices: number[] = [];
    pts.forEach((p, k) => {
      const t = k / steps;
      const width = 0.0043 * (0.6 + 0.8 * Math.sin(Math.PI * (0.08 + 0.84 * t)) ** 0.7) * (1 - 0.4 * t * t);
      const local = p.clone().sub(origin);
      positions.push(local.x, local.y + width, local.z, local.x, local.y - width, local.z);
      uvs.push(t, 1, t, 0);
      if (k < steps) indices.push(k * 2, k * 2 + 1, k * 2 + 2, k * 2 + 1, k * 2 + 3, k * 2 + 2);
    });
    const geo = new THREE.BufferGeometry();
    geo.setAttribute("position", new THREE.Float32BufferAttribute(positions, 3));
    geo.setAttribute("uv", new THREE.Float32BufferAttribute(uvs, 2));
    geo.setIndex(indices);
    geo.computeVertexNormals();
    const c = canvas(64, 16);
    const ctx = c.getContext("2d")!;
    const g = ctx.createLinearGradient(0, 0, 0, 16);
    g.addColorStop(0, "rgba(22,17,15,0)");
    g.addColorStop(0.3, "rgba(22,17,15,0.95)");
    g.addColorStop(0.7, "rgba(22,17,15,0.95)");
    g.addColorStop(1, "rgba(22,17,15,0)");
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, 64, 16);
    const tex = new THREE.CanvasTexture(c);
    const material = new THREE.MeshStandardMaterial({ color: "#1b1512", map: tex, transparent: true, roughness: 0.7, side: THREE.DoubleSide, depthWrite: false, polygonOffset: true, polygonOffsetFactor: -2, polygonOffsetUnits: -2 });
    const mesh = new THREE.Mesh(geo, material);
    mesh.frustumCulled = false;
    group.add(mesh);
    group.userData.rest = new THREE.Vector3();
    figure.own(geo);
    figure.own(material);
    figure.own(tex);
    return group;
  };
  const left = make(1);
  const right = make(-1);
  head?.add(left, right);
  parts.push(left, right);
  return { left, right };
}

/* ---------------- accessories ---------------- */

function dressWatch(figure: Figure, parts: THREE.Object3D[]) {
  const forearm = figure.bone("lowerarm01.L");
  if (!forearm) return;
  const elbow = restHead("lowerarm01.L");
  const wrist = restHead("wrist.L");
  const dir = wrist.clone().sub(elbow);
  const length = dir.length();
  dir.normalize();
  const group = new THREE.Group();
  const at = elbow.clone().add(dir.clone().multiplyScalar(length * 0.9));
  group.position.copy(at.clone().sub(elbow));
  group.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), dir);
  const black = new THREE.MeshStandardMaterial({ color: "#101214", roughness: 0.4, metalness: 0.35 });
  const glass = new THREE.MeshStandardMaterial({ color: "#05070a", roughness: 0.08, metalness: 0.2 });
  const strap = new THREE.Mesh(new THREE.CylinderGeometry(0.0305, 0.0305, 0.021, 28, 1, true), new THREE.MeshStandardMaterial({ color: "#16181b", roughness: 0.75, side: THREE.DoubleSide }));
  const body = new THREE.Mesh(new THREE.CylinderGeometry(0.0225, 0.0225, 0.0095, 36), black);
  const face = new THREE.Mesh(new THREE.CylinderGeometry(0.0195, 0.0195, 0.0012, 36), glass);
  // The face looks away from the body (+x for the left arm), in the rest pose's lateral direction.
  body.rotation.z = -Math.PI / 2;
  face.rotation.z = -Math.PI / 2;
  body.position.x = 0.0345;
  face.position.x = 0.0345 + 0.0054;
  group.add(strap, body, face);
  forearm.add(group);
  parts.push(group);
  for (const m of [black, glass]) figure.own(m);
  figure.own(strap.geometry);
  figure.own(body.geometry);
  figure.own(face.geometry);
}

function dressShoes(figure: Figure, parts: THREE.Object3D[]) {
  const body = figure.body;
  const { bind, boneOf, count } = body;
  const field = new Float32Array(count).fill(-1);
  const colors = new Float32Array(count * 3);
  const upper = new THREE.Color("#e9eef3");
  const sole = new THREE.Color("#10233f");
  for (let i = 0; i < count; i++) {
    const y = bind[i * 3 + 1];
    if (/^(foot|toe)/.test(boneOf[i]) || (boneOf[i].startsWith("lowerleg") && y < 0.09)) {
      const f = 0.082 - y;
      if (f > -0.03) {
        field[i] = f;
        const c = y < 0.014 ? sole : upper;
        colors.set([c.r, c.g, c.b], i * 3);
      }
    }
  }
  const material = shellMaterial(new THREE.MeshStandardMaterial({ roughness: 0.55, metalness: 0, vertexColors: true }));
  const mesh = makeShell(body, material, {
    keep: field.map((f) => (f > -0.02 ? 1 : 0)) as unknown as Float32Array,
    attributes: { field },
    colors,
    offset: () => 0.0075,
  });
  if (mesh) {
    figure.mesh.parent?.add(mesh);
    parts.push(mesh);
    figure.own(material);
  }
}

/* ---------------- public ---------------- */

export async function dressDrSajjad(figure: Figure): Promise<Dressed> {
  const parts: THREE.Object3D[] = [];
  recolourSkin(figure);
  const { shirt } = dressScrubs(figure, parts);
  dressHair(figure, parts);
  dressBeard(figure, parts);
  dressShoes(figure, parts);
  dressWatch(figure, parts);
  const brows = dressBrows(figure, parts);
  // Embroidery as photographed: the name on the wearer's right chest (viewer's left, −x), the PNA logo on the left chest (+x).
  const name = figure.own(nameTexture());
  chestDecal(figure, shirt, [-0.092, 1.318], [0.118, 0.026], name, parts);
  const logo = await logoTexture(LOOK.logoUrl);
  if (logo) {
    figure.own(logo);
    const aspect = (logo.image as { width: number; height: number }).height / (logo.image as { width: number; height: number }).width;
    chestDecal(figure, shirt, [0.085, 1.312], [0.074, 0.074 * aspect], logo, parts);
  }
  // Keep unused imports honest for the bundler.
  void REST;
  void restTail;
  void boneInfluence;
  figure.root.updateMatrixWorld(true);
  return { brows, parts };
}

export async function install(h: { figure: Figure }) {
  (h as unknown as { dressed: Dressed }).dressed = await dressDrSajjad(h.figure);
}
