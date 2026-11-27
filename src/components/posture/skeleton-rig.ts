/**
 * The 3D skeleton of the Full Posture Scan: PNA's own anatomical bone models, posed from the measured points.
 *
 * The bones are modelled bone by bone from adult male reference proportions by scripts/posture-skeleton/own/ (build_parts.py, then assemble.mjs): every vertebra and
 * every rib is its own piece, so the spine can curve and the thorax can follow it. Each vertex carries a baked ambient-occlusion shade (COLOR_0) so holes and
 * creases (the orbits, the foramina, the joint surfaces) read as such.
 *
 * It is NOT a scan of the person. It is a standard skeleton, moved through the points the phone could measure (head, shoulders, hips, knees): a lean or a sideways shift
 * is carried along the spine, the head is moved forward on the neck, the shoulder girdle and pelvis are tilted, the knees are bent or moved in or out. Every angle comes from
 * skeletonPose(), which has already set to zero any number inside its own margin of error. A region the tool could not measure is left plain.
 *
 * Axes: y up, the skeleton faces +z (the viewer at the start), the person's LEFT is +x; units are metres.
 */
import * as THREE from "three";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";
import { MeshoptDecoder } from "three/examples/jsm/libs/meshopt_decoder.module.js";
import type { Region, Severity, SkeletonPose } from "@/lib/posture/scan";

export type Severities = Record<Region, Severity | null>;
type Meta = { pieces: { name: string; group: string; material?: string; centroid: [number, number, number]; tris: number }[]; joints: Record<string, [number, number, number]> };

const BASE = "/posture-skeleton";
const DEG = Math.PI / 180;
const BONE = 0xe6dac0;
const CARTILAGE = 0xc9d6d8;
const TOOTH = 0xf4efe2;
const AMBER = 0xf2b134;
const CORAL = 0xe9553f;
const smooth = (t: number) => { const x = Math.max(0, Math.min(1, t)); return x * x * (3 - 2 * x); };

type Piece = { pivot: THREE.Group; group: string; name: string; rest: THREE.Vector3; base: number };

export type SkeletonRig = {
  root: THREE.Group;
  /** Poses the bones and tints the regions. Cheap: call it whenever the pose or the severities change. */
  apply: (pose: SkeletonPose, severities: Severities) => void;
  dispose: () => void;
};

const SPINE_PIECES = /^spine_(cervical|thoracic|lumbar)_/;

export async function loadSkeleton(url = `${BASE}/skeleton-male.glb`): Promise<SkeletonRig> {
  const [gltf, meta] = await Promise.all([
    new GLTFLoader().setMeshoptDecoder(MeshoptDecoder).loadAsync(url),
    fetch(`${BASE}/skeleton-meta.json`).then((r) => { if (!r.ok) throw new Error("skeleton meta"); return r.json() as Promise<Meta>; }),
  ]);

  const root = new THREE.Group();
  const pieces: Piece[] = [];
  const byName = new Map<string, Piece>();
  const restOf = new Map(meta.pieces.map((p) => [p.name, new THREE.Vector3(...p.centroid)]));

  // Each loaded node carries the position of its piece (the file was compressed with a scale and offset). Put every piece under a pivot at its own centroid, so that a piece
  // can be turned about its own middle, and keep the geometry exactly where it was.
  gltf.scene.updateMatrixWorld(true);
  const nodes: THREE.Object3D[] = [];
  gltf.scene.traverse((o) => { if ((o as THREE.Mesh).isMesh) nodes.push(o); });
  const mats = new Map<number, THREE.MeshStandardMaterial>();
  const material = (c: number, tinted: boolean) => {
    const key = c * 2 + (tinted ? 1 : 0);
    let m = mats.get(key);
    if (!m) { m = new THREE.MeshStandardMaterial({ color: c, roughness: 0.58, metalness: 0, vertexColors: true, emissive: tinted ? c : 0x000000, emissiveIntensity: tinted ? 0.22 : 0 }); mats.set(key, m); }
    return m;
  };
  for (const mesh of nodes) {
    const name = mesh.name || mesh.parent?.name || "";
    const rest = restOf.get(name);
    const info = meta.pieces.find((p) => p.name === name);
    if (!rest || !info) continue;
    const world = mesh.matrixWorld.clone();
    world.premultiply(new THREE.Matrix4().makeTranslation(-rest.x, -rest.y, -rest.z));
    mesh.removeFromParent();
    world.decompose(mesh.position, mesh.quaternion, mesh.scale);
    const base = info.material === "cartilage" ? CARTILAGE : info.material === "tooth" ? TOOTH : BONE;
    (mesh as THREE.Mesh).material = material(base, false);
    (mesh as THREE.Mesh).geometry.computeBoundingSphere();
    const pivot = new THREE.Group();
    pivot.position.copy(rest);
    pivot.add(mesh);
    root.add(pivot);
    const piece: Piece = { pivot, group: info.group, name, rest: rest.clone(), base };
    pieces.push(piece);
    byName.set(name, piece);
  }

  // the spine's rest curve front to back (the middle of the bone pieces at each height): the pivot the pieces turn about
  const spineRest = pieces.filter((p) => SPINE_PIECES.test(p.name)).map((p) => p.rest).sort((a, b) => a.y - b.y);
  const axisZ = (y: number) => {
    let sum = 0, w = 0;
    for (const p of spineRest) { const k = Math.exp(-((p.y - y) ** 2) / (2 * 0.02 ** 2)); sum += k * p.z; w += k; }
    return w > 0 ? sum / w : -0.03;
  };
  const J = (k: string): THREE.Vector3 => new THREE.Vector3(...(meta.joints[k] ?? [0, 0, 0]));
  const joint = { hipL: J("hip_l"), hipR: J("hip_r"), kneeL: J("knee_l"), kneeR: J("knee_r"), shoulderL: J("shoulder_l"), shoulderR: J("shoulder_r") };

  /* ---- the pose ---- */
  const Y0 = 0.9, Y1 = 1.75, STEP = 0.005, N = Math.round((Y1 - Y0) / STEP) + 1;
  const apply = (pose: SkeletonPose, sev: Severities) => {
    const lean = pose.trunkLean * DEG;
    const shiftM = (pose.trunkShift / 100) * 0.38; // shoulders sideways of the hips, metres (positive: the person's left, +x)
    const headM = (pose.headForward / 100) * 0.5; // head forward of the shoulders, metres
    const hipRoll = pose.hipTilt * DEG;
    const bendOnset = (y: number) => smooth((y - 1.0) / 0.2); // the lean is taken up between the low back and the lower ribs
    // the lean, carried up the spine: the spine's displacement is the sum of the tilts of the pieces below it
    const leanDz = new Float32Array(N), leanDy = new Float32Array(N);
    for (let i = 1; i < N; i++) { const y = Y0 + i * STEP, a = lean * bendOnset(y); leanDz[i] = leanDz[i - 1] + Math.sin(a) * STEP; leanDy[i] = leanDy[i - 1] + (Math.cos(a) - 1) * STEP; }
    const at = (arr: Float32Array, y: number) => { const f = Math.max(0, Math.min(N - 1, (y - Y0) / STEP)); const i = Math.floor(f), j = Math.min(N - 1, i + 1); return arr[i] + (arr[j] - arr[i]) * (f - i); };
    const headProfile = (y: number) => headM * Math.pow(smooth((y - 1.38) / 0.18), 1.25);
    const shiftProfile = (y: number) => shiftM * smooth((y - 1.0) / 0.4);
    const D = (y: number) => new THREE.Vector3(shiftProfile(y), at(leanDy, y), at(leanDz, y) + headProfile(y));
    const lumbarRoll = (y: number) => hipRoll * (1 - smooth((y - 0.97) / 0.3));
    // the turn of a piece at height y: forward by the lean and by how steeply the head is moving forward, sideways by the slope of the shift (and the low back's answer to a tilted pelvis)
    const eps = 0.004;
    const R = (y: number, includeHead = true) => {
      const pitch = lean * bendOnset(y) + (includeHead ? Math.atan((headProfile(y + eps) - headProfile(y - eps)) / (2 * eps)) : 0);
      const roll = -Math.atan((shiftProfile(y + eps) - shiftProfile(y - eps)) / (2 * eps)) + lumbarRoll(y);
      return new THREE.Quaternion().setFromEuler(new THREE.Euler(pitch, 0, roll, "XYZ"));
    };
    // move a point that sits at c, in a frame of height yRef, to where the spine has carried it
    const carry = (c: THREE.Vector3, yRef: number, includeHead = true) => {
      const q = R(yRef, includeHead);
      const a = new THREE.Vector3(0, yRef, axisZ(yRef));
      const p = c.clone().sub(a).applyQuaternion(q).add(a).add(D(yRef));
      if (!includeHead) p.z -= headProfile(yRef);
      return { p, q };
    };
    const place = (piece: Piece, p: THREE.Vector3, q: THREE.Quaternion) => { piece.pivot.position.copy(p); piece.pivot.quaternion.copy(q); };
    const rotAbout = (p: THREE.Vector3, q: THREE.Quaternion, pivot: THREE.Vector3, extra: THREE.Quaternion) => {
      const np = p.clone().sub(pivot).applyQuaternion(extra).add(pivot);
      return { p: np, q: extra.clone().multiply(q) };
    };

    for (const piece of pieces) {
      const g = piece.group, c = piece.rest;
      if (SPINE_PIECES.test(piece.name) || /^ribs_/.test(g)) {
        // each vertebra and each rib (with its costal cartilage) follows the spine at its own height
        const { p, q } = carry(c, c.y);
        place(piece, p, q);
        continue;
      }
      switch (g) {
        case "sternum": { const { p, q } = carry(c, 1.31); place(piece, p, q); break; }
        case "skull": case "mandible": case "teeth": {
          // the head moves forward on the neck but stays level; it tilts sideways about the top of the neck
          const { p, q } = carry(c, 1.54, false);
          const top = carry(new THREE.Vector3(0, 1.545, axisZ(1.545)), 1.545, false).p;
          const e = rotAbout(p, q, top, new THREE.Quaternion().setFromEuler(new THREE.Euler(0, 0, pose.headTilt * DEG)));
          place(piece, e.p.add(new THREE.Vector3(0, 0, headProfile(1.545))), e.q);
          break;
        }
        case "clavicle_l": case "clavicle_r": case "scapula_l": case "scapula_r": {
          // the shoulder girdle: carried with the upper spine, then tilted about the top of the breastbone
          const { p, q } = carry(c, 1.40);
          const notch = carry(new THREE.Vector3(0, 1.395, 0.04), 1.40).p;
          const e = rotAbout(p, q, notch, new THREE.Quaternion().setFromEuler(new THREE.Euler(0, 0, pose.shoulderTilt * DEG)));
          place(piece, e.p, e.q);
          break;
        }
        case "humerus_l": case "humerus_r": case "forearm_l": case "forearm_r": case "hand_l": case "hand_r": {
          // the arms hang: they move with the shoulder joint and do not turn
          const left = g.endsWith("_l");
          const sj = left ? joint.shoulderL : joint.shoulderR;
          const carried = carry(sj, 1.40).p;
          const tilted = rotAbout(carried, new THREE.Quaternion(), carry(new THREE.Vector3(0, 1.395, 0.04), 1.40).p, new THREE.Quaternion().setFromEuler(new THREE.Euler(0, 0, pose.shoulderTilt * DEG))).p;
          place(piece, c.clone().add(tilted.sub(sj)), new THREE.Quaternion());
          break;
        }
        case "pelvis": {
          const pivot = new THREE.Vector3(0, 0.9, -0.03);
          const e = rotAbout(c, new THREE.Quaternion(), pivot, new THREE.Quaternion().setFromEuler(new THREE.Euler(0, 0, hipRoll)));
          place(piece, e.p, e.q);
          break;
        }
        case "femur_l": case "femur_r": case "patella_l": case "patella_r": case "lower_leg_l": case "lower_leg_r": case "foot_l": case "foot_r": {
          const left = g.endsWith("_l"), sgn = left ? 1 : -1;
          const hip = left ? joint.hipL : joint.hipR, knee = left ? joint.kneeL : joint.kneeR;
          const f = (left ? pose.leftKnee : pose.rightKnee) / 100; // knee falling in (positive) or bowing out, share of the leg
          const dx = f * 0.82; // metres
          const kappa = pose.kneeFlex * DEG; // the knee bends: the thigh pitches forward and the shin back by half each, so the foot stays under the hip
          const thighZ = -sgn * dx / 0.445, shinZ = sgn * dx / 0.385;
          const thighQ = new THREE.Quaternion().setFromEuler(new THREE.Euler(-kappa / 2, 0, thighZ, "XYZ"));
          const upper = g.startsWith("femur") || g.startsWith("patella");
          const kneeP = knee.clone().sub(hip).applyQuaternion(thighQ).add(hip);
          if (upper) { const e = rotAbout(c, new THREE.Quaternion(), hip, thighQ); place(piece, e.p, e.q); break; }
          const shinQ = new THREE.Quaternion().setFromEuler(new THREE.Euler(kappa / 2, 0, shinZ, "XYZ"));
          if (g.startsWith("lower_leg")) { const e = rotAbout(c, new THREE.Quaternion(), knee, shinQ); place(piece, e.p.add(kneeP.clone().sub(knee)), e.q); break; }
          // the foot stays flat on the floor, carried to where the ankle now is
          const ankle = (left ? J("ankle_l") : J("ankle_r"));
          const ankleP = rotAbout(ankle, new THREE.Quaternion(), knee, shinQ).p.add(kneeP.clone().sub(knee));
          place(piece, c.clone().add(ankleP.sub(ankle)), new THREE.Quaternion());
          break;
        }
        default: break;
      }
    }

    // tint: neck and trunk vertebrae, pelvis, shoulder girdle and kneecaps; a region with no reading, or in the usual range, stays bone
    const tint = (s: Severity | null) => (s === 2 ? CORAL : s === 1 ? AMBER : null);
    const paint = (piece: Piece, s: Severity | null) => {
      const c = tint(s);
      piece.pivot.traverse((o) => { if ((o as THREE.Mesh).isMesh) (o as THREE.Mesh).material = c === null ? material(piece.base, false) : material(c, true); });
    };
    for (const piece of pieces) {
      if (/^spine_cervical_/.test(piece.name)) paint(piece, sev.neck);
      else if (/^spine_(thoracic|lumbar)_/.test(piece.name)) paint(piece, sev.trunk);
      else if (piece.group === "pelvis") paint(piece, sev.pelvis);
      else if (/^(clavicle|scapula)_/.test(piece.group)) paint(piece, sev.shoulders);
      else if (piece.group === "patella_l") paint(piece, sev.leftKnee);
      else if (piece.group === "patella_r") paint(piece, sev.rightKnee);
    }
  };

  const dispose = () => {
    root.traverse((o) => { const m = o as THREE.Mesh; if (m.isMesh) m.geometry.dispose(); });
    mats.forEach((m) => m.dispose());
  };
  return { root, apply, dispose };
}
