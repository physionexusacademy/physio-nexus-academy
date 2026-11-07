/**
 * PNA Virtual Patient — 3D exam room (browser only).
 *
 * Loads the CC0 patient model, places him in a treatment room, moves his joints
 * in anatomical terms ("left knee flexion 90°") and answers "what did the student
 * touch?" (landmark, dermatome, nerve territory, region). Everything runs in the
 * browser; this module is only ever imported through a client-side dynamic import,
 * so three.js never enters the Cloudflare Worker bundle.
 */
import * as THREE from "three";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";
import { MeshoptDecoder } from "three/examples/jsm/libs/meshopt_decoder.module.js";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";
import { RoomEnvironment } from "three/examples/jsm/environments/RoomEnvironment.js";
import { RoundedBoxGeometry } from "three/examples/jsm/geometries/RoundedBoxGeometry.js";
import rig from "./generated/rig.json";
import { classifySurface, type SurfaceInfo } from "./anatomy";

export type Side = "left" | "right";
export type PatientPosition = "standing" | "supine" | "prone" | "sitting" | "sidelying";
export type JointId = "shoulder" | "elbow" | "wrist" | "hip" | "knee" | "ankle" | "toe";
/**
 * Degrees. flex: flexion(+)/extension(−) — for the ankle dorsiflexion(+), for the great toe extension(+);
 * abd: abduction(+)/adduction(−) — for the wrist radial deviation(+); rot: internal rotation(+) — for the ankle inversion(+).
 */
export type JointAngles = { flex?: number; abd?: number; rot?: number };
export type Pose = Partial<Record<`${JointId}.${Side}`, JointAngles>> & {
  neck?: JointAngles; // flex: flexion, abd: side-flexion to the right(+), rot: rotation to the right(+)
  trunk?: JointAngles;
};

type Anchor = { p: number[]; b: string[]; w: number[] };
type RigData = {
  bones: { name: string; parent: string | null; head: number[]; tail: number[] }[];
  landmarks: Record<string, { mid?: Anchor; left?: Anchor; right?: Anchor }>;
  height: number;
};
const RIG = rig as RigData;
const DEG = Math.PI / 180;
const V = (a: number[]) => new THREE.Vector3(a[0], a[1], a[2]);
const sanitize = (name: string) => THREE.PropertyBinding.sanitizeNodeName(name);
const sideKey = (side: Side) => (side === "left" ? "L" : "R");
const sideSign = (side: Side) => (side === "left" ? 1 : -1);

export const PLINTH = { length: 1.95, width: 0.68, height: 0.66 };

/* ------------------------------------------------------------------ */
/* Anatomical alignment: rest (A-pose) → anatomical "arms at sides"     */
/* ------------------------------------------------------------------ */

const restBone = new Map(RIG.bones.map((b) => [b.name, b]));
const head = (name: string) => V(restBone.get(name)!.head);

/** Rotation taking frame (a1, a2) onto frame (b1, b2): long axis + a reference direction. */
function frameRotation(a1: THREE.Vector3, a2: THREE.Vector3, b1: THREE.Vector3, b2: THREE.Vector3) {
  const basis = (x: THREE.Vector3, y: THREE.Vector3) => {
    const u = x.clone().normalize();
    const v = y.clone().sub(u.clone().multiplyScalar(y.dot(u))).normalize();
    const w = new THREE.Vector3().crossVectors(u, v);
    return new THREE.Matrix4().makeBasis(u, v, w);
  };
  const from = basis(a1, a2);
  const to = basis(b1, b2);
  return new THREE.Quaternion().setFromRotationMatrix(to.multiply(from.transpose()));
}

function alignments(side: Side) {
  const s = sideKey(side);
  const sign = sideSign(side);
  const shoulder = head(`upperarm01.${s}`);
  const elbow = head(`lowerarm01.${s}`);
  const wrist = head(`wrist.${s}`);
  const thumb = head(`finger1-1.${s}`);
  const middle = head(`finger3-1.${s}`);
  const hip = head(`upperleg01.${s}`);
  const knee = head(`lowerleg01.${s}`);
  const ankle = head(`foot.${s}`);
  const down = new THREE.Vector3(0.06 * sign, -1, 0).normalize();
  const armDir = elbow.clone().sub(shoulder);
  const foreDir = wrist.clone().sub(elbow);
  // Upper arm: long axis down, elbow hinge so the forearm flexes forwards.
  const hingeRest = new THREE.Vector3().crossVectors(armDir, foreDir);
  const hingeTarget = new THREE.Vector3().crossVectors(down, new THREE.Vector3(0, -1, 0.3));
  const upperarm = frameRotation(armDir, hingeRest, down, hingeTarget);
  // Forearm and hand: straight down, thumb pointing forwards (mid-prone, palms facing the thighs).
  const forward = new THREE.Vector3(0, 0, 1);
  const forearm = frameRotation(foreDir, thumb.clone().sub(wrist), new THREE.Vector3(0, -1, 0), forward);
  const hand = frameRotation(middle.clone().sub(wrist), thumb.clone().sub(wrist), new THREE.Vector3(0, -1, 0), forward);
  // Legs: straight and nearly vertical.
  const legDown = new THREE.Vector3(0.025 * sign, -1, 0).normalize();
  const thigh = new THREE.Quaternion().setFromUnitVectors(knee.clone().sub(hip).normalize(), legDown);
  const shank = new THREE.Quaternion().setFromUnitVectors(ankle.clone().sub(knee).normalize(), legDown);
  return { upperarm, forearm, hand, thigh, shank };
}
const ALIGN = { left: alignments("left"), right: alignments("right") };

/* ------------------------------------------------------------------ */
/* Exam room                                                          */
/* ------------------------------------------------------------------ */

export type PickResult = SurfaceInfo & {
  point: THREE.Vector3;
  normal: THREE.Vector3;
  landmark: { id: string; side: Side | "mid"; distance: number } | null;
};

type Listener = () => void;

export class ExamRoom {
  readonly renderer: THREE.WebGLRenderer;
  readonly scene = new THREE.Scene();
  readonly camera: THREE.PerspectiveCamera;
  readonly controls: OrbitControls;
  readonly patientRoot = new THREE.Group();
  private skinned: THREE.SkinnedMesh | null = null;
  private bones = new Map<string, THREE.Bone>();
  private pose: Pose = {};
  private target: Pose = {};
  private from: Pose = {};
  private tween: { start: number; duration: number } | null = null;
  private position: PatientPosition = "standing";
  private listeners = new Set<Listener>();
  private needsRender = true;
  private frame = 0;
  private resizeObserver: ResizeObserver;
  readonly extras = new THREE.Group(); // tools (goniometer, tape, markers) live here
  private disposed = false;
  private boundsDirty = true;

  constructor(private container: HTMLElement) {
    this.renderer = new THREE.WebGLRenderer({ antialias: true, alpha: false, powerPreference: "high-performance" });
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 1.75));
    this.renderer.outputColorSpace = THREE.SRGBColorSpace;
    this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
    this.renderer.toneMappingExposure = 1.05;
    this.renderer.shadowMap.enabled = true;
    this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    this.renderer.domElement.style.display = "block";
    this.renderer.domElement.style.touchAction = "none";
    container.appendChild(this.renderer.domElement);

    this.camera = new THREE.PerspectiveCamera(35, 1, 0.05, 40);
    this.camera.position.set(1.9, 1.55, 2.6);
    this.controls = new OrbitControls(this.camera, this.renderer.domElement);
    this.controls.target.set(0, 0.95, 0);
    this.controls.enableDamping = true;
    this.controls.dampingFactor = 0.12;
    this.controls.minDistance = 0.35;
    this.controls.maxDistance = 5.5;
    this.controls.maxPolarAngle = Math.PI * 0.53;
    this.controls.addEventListener("change", () => this.invalidate());

    this.buildRoom();
    this.scene.add(this.patientRoot, this.extras);
    this.resizeObserver = new ResizeObserver(() => this.resize());
    this.resizeObserver.observe(container);
    this.resize();
    this.loop = this.loop.bind(this);
    this.frame = requestAnimationFrame(this.loop);
  }

  private buildRoom() {
    const pmrem = new THREE.PMREMGenerator(this.renderer);
    this.scene.environment = pmrem.fromScene(new RoomEnvironment(), 0.04).texture;
    this.scene.background = new THREE.Color("#e8eef3");
    this.scene.fog = new THREE.Fog("#e8eef3", 7, 14);

    const hemi = new THREE.HemisphereLight("#ffffff", "#c9d3dc", 0.55);
    const key = new THREE.DirectionalLight("#fff6ee", 1.55);
    key.position.set(2.2, 3.6, 2.4);
    key.castShadow = true;
    key.shadow.mapSize.set(1024, 1024);
    key.shadow.camera.left = -2;
    key.shadow.camera.right = 2;
    key.shadow.camera.top = 2.4;
    key.shadow.camera.bottom = -1;
    key.shadow.bias = -0.0004;
    key.shadow.normalBias = 0.02;
    const rim = new THREE.DirectionalLight("#cfe7ff", 0.55);
    rim.position.set(-2.5, 2.2, -2.5);
    this.scene.add(hemi, key, rim);

    // Floor and walls.
    const floor = new THREE.Mesh(new THREE.CircleGeometry(7, 48), new THREE.MeshStandardMaterial({ color: "#d9dfe4", roughness: 0.92 }));
    floor.rotation.x = -Math.PI / 2;
    floor.receiveShadow = true;
    const wallMaterial = new THREE.MeshStandardMaterial({ color: "#eef2f5", roughness: 0.95 });
    const back = new THREE.Mesh(new THREE.PlaneGeometry(14, 4), wallMaterial);
    back.position.set(0, 2, -3.2);
    const stripe = new THREE.Mesh(new THREE.PlaneGeometry(14, 0.06), new THREE.MeshStandardMaterial({ color: "#0db3aa", roughness: 0.6 }));
    stripe.position.set(0, 1.05, -3.19);
    this.scene.add(floor, back, stripe);

    // Treatment plinth (long axis along z).
    const plinth = new THREE.Group();
    const pad = new THREE.Mesh(
      new RoundedBoxGeometry(PLINTH.width, 0.09, PLINTH.length, 4, 0.035),
      new THREE.MeshStandardMaterial({ color: "#123a63", roughness: 0.6 }),
    );
    pad.position.y = PLINTH.height - 0.045;
    pad.castShadow = pad.receiveShadow = true;
    const frameMaterial = new THREE.MeshStandardMaterial({ color: "#b9c3cc", metalness: 0.6, roughness: 0.35 });
    const base = new THREE.Mesh(new THREE.BoxGeometry(PLINTH.width * 0.8, 0.05, PLINTH.length * 0.85), frameMaterial);
    base.position.y = PLINTH.height - 0.115;
    plinth.add(pad, base);
    for (const x of [-1, 1]) for (const z of [-1, 1]) {
      const leg = new THREE.Mesh(new THREE.CylinderGeometry(0.022, 0.022, PLINTH.height - 0.12, 12), frameMaterial);
      leg.position.set(x * PLINTH.width * 0.36, (PLINTH.height - 0.12) / 2, z * PLINTH.length * 0.4);
      leg.castShadow = true;
      plinth.add(leg);
    }
    const pillow = new THREE.Mesh(new RoundedBoxGeometry(0.42, 0.07, 0.26, 4, 0.03), new THREE.MeshStandardMaterial({ color: "#f4f7fa", roughness: 0.85 }));
    pillow.position.set(0, PLINTH.height + 0.03, -PLINTH.length / 2 + 0.2);
    pillow.name = "pillow";
    pillow.castShadow = true;
    plinth.add(pillow);
    plinth.name = "plinth";
    this.scene.add(plinth);
  }

  async load(url: string, onProgress?: (fraction: number) => void) {
    const loader = new GLTFLoader().setMeshoptDecoder(MeshoptDecoder);
    const gltf = await loader.loadAsync(url, (event) => {
      if (event.total) onProgress?.(event.loaded / event.total);
    });
    if (this.disposed) return;
    gltf.scene.traverse((object) => {
      if ((object as THREE.Bone).isBone) this.bones.set(object.name, object as THREE.Bone);
      const mesh = object as THREE.SkinnedMesh;
      if (mesh.isSkinnedMesh) {
        mesh.castShadow = true;
        mesh.frustumCulled = false;
        const material = mesh.material as THREE.MeshStandardMaterial;
        if (material.name === "skin" && !this.skinned) {
          this.skinned = mesh;
          mesh.material = new THREE.MeshPhysicalMaterial({
            map: material.map,
            roughness: 0.56,
            metalness: 0,
            sheen: 0.35,
            sheenRoughness: 0.55,
            sheenColor: new THREE.Color("#ffb59a"),
            specularIntensity: 0.45,
          });
        }
      }
    });
    // The three primitives (skin, eyes) share one skeleton; the skin is the pick target.
    this.patientRoot.add(gltf.scene);
    this.setPosition("standing", false);
    this.invalidate();
  }

  /* ---------------- events / render ---------------- */

  onChange(listener: Listener) {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }
  invalidate() {
    this.needsRender = true;
  }
  private resize() {
    const width = this.container.clientWidth || 1;
    const height = this.container.clientHeight || 1;
    this.renderer.setSize(width, height, false);
    this.renderer.domElement.style.width = "100%";
    this.renderer.domElement.style.height = "100%";
    this.camera.aspect = width / height;
    this.camera.updateProjectionMatrix();
    this.invalidate();
  }
  private loop(now: number) {
    if (this.disposed) return;
    this.frame = requestAnimationFrame(this.loop);
    const controlsMoved = this.controls.update();
    if (this.tween) this.stepTween(now);
    if (this.needsRender || controlsMoved) {
      this.needsRender = false;
      this.renderer.render(this.scene, this.camera);
      this.listeners.forEach((listener) => listener());
    }
  }
  dispose() {
    this.disposed = true;
    cancelAnimationFrame(this.frame);
    this.resizeObserver.disconnect();
    this.controls.dispose();
    this.renderer.dispose();
    this.renderer.domElement.remove();
  }

  /* ---------------- posing ---------------- */

  getPose(): Pose {
    return structuredClone(this.pose);
  }
  getPosition() {
    return this.position;
  }

  /** Moves to a pose (merged over the current target), smoothly unless `animate` is false. */
  setPose(pose: Pose, { animate = true, replace = false, duration = 650 }: { animate?: boolean; replace?: boolean; duration?: number } = {}) {
    const next: Pose = replace ? structuredClone(pose) : { ...structuredClone(this.target), ...structuredClone(pose) };
    this.from = structuredClone(this.pose);
    this.target = next;
    if (!animate) {
      this.pose = structuredClone(next);
      this.tween = null;
      this.applyPose();
      return Promise.resolve();
    }
    this.tween = { start: performance.now(), duration };
    return new Promise<void>((resolve) => {
      const check = () => (this.tween ? requestAnimationFrame(check) : resolve());
      requestAnimationFrame(check);
    });
  }
  setJoint(joint: JointId, side: Side, angles: JointAngles, options?: { animate?: boolean; duration?: number }) {
    const key = `${joint}.${side}` as const;
    return this.setPose({ [key]: { ...(this.target[key] ?? {}), ...angles } } as Pose, options);
  }
  getJoint(joint: JointId, side: Side): Required<JointAngles> {
    const angles = this.pose[`${joint}.${side}`] ?? {};
    return { flex: angles.flex ?? 0, abd: angles.abd ?? 0, rot: angles.rot ?? 0 };
  }

  private stepTween(now: number) {
    const t = Math.min(1, (now - this.tween!.start) / this.tween!.duration);
    const e = t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2;
    const keys = new Set([...Object.keys(this.from), ...Object.keys(this.target)]) as Set<keyof Pose>;
    const blended: Pose = {};
    for (const key of keys) {
      const a = (this.from[key] ?? {}) as JointAngles;
      const b = (this.target[key] ?? {}) as JointAngles;
      blended[key] = {
        flex: (a.flex ?? 0) + ((b.flex ?? 0) - (a.flex ?? 0)) * e,
        abd: (a.abd ?? 0) + ((b.abd ?? 0) - (a.abd ?? 0)) * e,
        rot: (a.rot ?? 0) + ((b.rot ?? 0) - (a.rot ?? 0)) * e,
      } as JointAngles & never;
    }
    this.pose = blended;
    if (t >= 1) {
      this.pose = structuredClone(this.target);
      this.tween = null;
    }
    this.applyPose();
  }

  private bone(name: string) {
    return this.bones.get(sanitize(name));
  }

  /**
   * Converts the anatomical pose into bone rotations. All bones rest with identity
   * rotation, so each controlled bone's skeleton-space orientation is
   * A = (clinical rotation, chained from its parent segment) × (rest→anatomical alignment).
   */
  private applyPose() {
    if (!this.bones.size) return;
    const q = (axis: THREE.Vector3, deg: number) => new THREE.Quaternion().setFromAxisAngle(axis, deg * DEG);
    const X = new THREE.Vector3(1, 0, 0), Y = new THREE.Vector3(0, 1, 0), Z = new THREE.Vector3(0, 0, 1);
    const targets = new Map<string, THREE.Quaternion>();

    // Trunk and neck (flexion forwards, side-flexion, rotation), spread over the segments.
    const trunk = this.pose.trunk ?? {};
    const trunkQ = (share: number) => q(X, (trunk.flex ?? 0) * share).multiply(q(Z, (trunk.abd ?? 0) * share)).multiply(q(Y, -(trunk.rot ?? 0) * share));
    const neck = this.pose.neck ?? {};
    const neckQ = (share: number) => q(X, (neck.flex ?? 0) * share).multiply(q(Z, (neck.abd ?? 0) * share)).multiply(q(Y, -(neck.rot ?? 0) * share));
    const spine = ["spine05", "spine04", "spine03", "spine02", "spine01"];
    let trunkWorld = new THREE.Quaternion();
    spine.forEach((name) => {
      trunkWorld = trunkWorld.clone().multiply(trunkQ(1 / spine.length));
      targets.set(name, trunkWorld.clone());
    });
    let neckWorld = trunkWorld.clone();
    ["neck01", "neck02", "neck03", "head"].forEach((name) => {
      neckWorld = neckWorld.clone().multiply(neckQ(0.25));
      targets.set(name, neckWorld.clone());
    });

    for (const side of ["left", "right"] as Side[]) {
      const s = sideKey(side);
      const sign = sideSign(side);
      const align = ALIGN[side];
      const j = (joint: JointId) => this.pose[`${joint}.${side}`] ?? {};
      // Upper limb (chained from the trunk).
      const sh = j("shoulder");
      const arm = trunkWorld.clone()
        .multiply(q(X, -(sh.flex ?? 0)))
        .multiply(q(Z, sign * (sh.abd ?? 0)))
        .multiply(q(Y, -sign * (sh.rot ?? 0)));
      targets.set(`upperarm01.${s}`, arm.clone().multiply(align.upperarm));
      const fore = arm.clone().multiply(q(X, -(j("elbow").flex ?? 0))).multiply(q(Y, sign * (j("elbow").rot ?? 0)));
      targets.set(`lowerarm01.${s}`, fore.clone().multiply(align.forearm));
      const wr = j("wrist");
      const hand = fore.clone().multiply(q(Z, -sign * (wr.flex ?? 0))).multiply(q(X, -(wr.abd ?? 0)));
      targets.set(`wrist.${s}`, hand.clone().multiply(align.hand));
      // Lower limb (pelvis is not part of the trunk chain).
      const hp = j("hip");
      const thigh = new THREE.Quaternion()
        .multiply(q(X, -(hp.flex ?? 0)))
        .multiply(q(Z, sign * (hp.abd ?? 0)))
        .multiply(q(Y, -sign * (hp.rot ?? 0)));
      targets.set(`upperleg01.${s}`, thigh.clone().multiply(align.thigh));
      const shank = thigh.clone().multiply(q(X, j("knee").flex ?? 0));
      targets.set(`lowerleg01.${s}`, shank.clone().multiply(align.shank));
      const an = j("ankle");
      // flex = dorsiflexion(+); rot = inversion(+)
      const foot = shank.clone().multiply(q(X, -(an.flex ?? 0))).multiply(q(Z, -sign * (an.rot ?? 0)));
      targets.set(`foot.${s}`, foot);
      const toe = j("toe");
      targets.set(`toe1-1.${s}`, foot.clone().multiply(q(X, -(toe.flex ?? 0))));
    }

    // Convert skeleton-space orientations into local quaternions, parents first.
    const world = new Map<string, THREE.Quaternion>();
    for (const b of RIG.bones) {
      const bone = this.bone(b.name);
      if (!bone) continue;
      const parentWorld = b.parent ? world.get(b.parent) ?? new THREE.Quaternion() : new THREE.Quaternion();
      const wanted = targets.get(b.name);
      if (wanted) bone.quaternion.copy(parentWorld.clone().invert().multiply(wanted));
      else bone.quaternion.identity();
      world.set(b.name, parentWorld.clone().multiply(bone.quaternion));
    }
    this.patientRoot.updateMatrixWorld(true);
    this.boundsDirty = true;
    this.invalidate();
  }

  /* ---------------- patient positions ---------------- */

  /** Places the patient: standing beside the plinth, or on it (supine, prone, sitting, side-lying). */
  setPosition(position: PatientPosition, animate = true) {
    this.position = position;
    const base: Pose = {};
    const root = this.patientRoot;
    root.rotation.set(0, 0, 0);
    root.position.set(0, 0, 0);
    if (position === "sitting") {
      Object.assign(base, {
        "hip.left": { flex: 88 }, "hip.right": { flex: 88 }, "knee.left": { flex: 85 }, "knee.right": { flex: 85 },
        "shoulder.left": { flex: 18 }, "shoulder.right": { flex: 18 }, "elbow.left": { flex: 55 }, "elbow.right": { flex: 55 },
      });
    }
    if (position === "sidelying") {
      // Lying on the left side: lower leg slightly bent for stability, top (right) leg free for testing.
      Object.assign(base, { "hip.left": { flex: 30 }, "knee.left": { flex: 45 }, "hip.right": { flex: 10 }, "knee.right": { flex: 10 }, "shoulder.left": { flex: 80 }, "elbow.left": { flex: 70 }, "shoulder.right": { flex: 10 } });
    }
    this.setPose(base, { animate: false, replace: true });
    // Orientation bases: where the patient's left (x), head (y) and face (z) point.
    const basis = (x: number[], y: number[], z: number[]) =>
      root.quaternion.setFromRotationMatrix(new THREE.Matrix4().makeBasis(V(x), V(y), V(z)));
    if (position === "supine") basis([1, 0, 0], [0, 0, -1], [0, 1, 0]); // head on the pillow, face up
    if (position === "prone") basis([-1, 0, 0], [0, 0, -1], [0, -1, 0]); // face down
    if (position === "sidelying") basis([0, -1, 0], [0, 0, -1], [1, 0, 0]); // lying on the left side, facing the examiner
    if (position === "sitting") basis([0, 0, -1], [0, 1, 0], [1, 0, 0]); // sitting over the long side, facing the examiner
    this.placeOnSupport();
    this.frameCamera(animate);
  }

  /** Lowers the patient so his lowest point rests on the plinth (or the floor when standing). */
  placeOnSupport() {
    const root = this.patientRoot;
    root.updateMatrixWorld(true);
    const box = this.bodyBox();
    if (this.position === "standing") {
      root.position.x += -0.9 - (box.min.x + box.max.x) / 2;
      root.position.y += -box.min.y;
      root.position.z += -(box.min.z + box.max.z) / 2 + 0.15;
    } else if (this.position === "sitting") {
      // Buttocks on the plinth, knees just past the long edge, lower legs hanging.
      const seat = this.landmarkWorld("ischial-tuberosity", "left");
      const knee = this.jointWorld("lowerleg01.L");
      root.position.y += PLINTH.height + 0.02 - seat.y;
      root.position.x += PLINTH.width / 2 + 0.06 - knee.x;
      root.position.z += -(box.min.z + box.max.z) / 2;
    } else {
      // Lying: head at the pillow end (−z), body centred across the plinth.
      root.position.y += PLINTH.height + 0.005 - box.min.y;
      root.position.x += -(box.min.x + box.max.x) / 2;
      root.position.z += -PLINTH.length / 2 + 0.05 - box.min.z;
    }
    root.updateMatrixWorld(true);
    this.boundsDirty = true;
    this.invalidate();
  }

  private bodyBox() {
    if (!this.skinned) return new THREE.Box3(new THREE.Vector3(-0.3, 0, -0.2), new THREE.Vector3(0.3, 1.75, 0.2));
    this.skinned.computeBoundingBox();
    return this.skinned.boundingBox!.clone().applyMatrix4(this.skinned.matrixWorld);
  }

  /** Points the camera at the whole patient, or at a body part. */
  frameCamera(animate = true, focus?: THREE.Vector3, distance?: number) {
    const box = this.bodyBox();
    const centre = focus ?? box.getCenter(new THREE.Vector3());
    // Fit the whole patient: distance from the bounding-sphere radius and the narrower field of view.
    const radius = box.getBoundingSphere(new THREE.Sphere()).radius;
    const vfov = this.camera.fov * DEG;
    const hfov = 2 * Math.atan(Math.tan(vfov / 2) * this.camera.aspect);
    const size = distance ?? Math.max(1.2, (radius / Math.sin(Math.min(vfov, hfov) / 2)) * 0.95);
    const lying = this.position === "supine" || this.position === "prone" || this.position === "sidelying";
    const dir = lying ? new THREE.Vector3(1.15, 0.85, 0.45).normalize() : new THREE.Vector3(0.55, 0.22, 1).normalize();
    const goal = centre.clone().add(dir.multiplyScalar(size));
    if (!animate) {
      this.camera.position.copy(goal);
      this.controls.target.copy(centre);
      this.invalidate();
      return;
    }
    const startPos = this.camera.position.clone();
    const startTarget = this.controls.target.clone();
    const start = performance.now();
    const step = (now: number) => {
      const t = Math.min(1, (now - start) / 600);
      const e = 1 - Math.pow(1 - t, 3);
      this.camera.position.lerpVectors(startPos, goal, e);
      this.controls.target.lerpVectors(startTarget, centre, e);
      this.invalidate();
      if (t < 1 && !this.disposed) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  }

  /* ---------------- landmarks, joints and picking ---------------- */

  private anchorWorld(anchor: Anchor) {
    const out = new THREE.Vector3();
    anchor.b.forEach((name, k) => {
      const bone = this.bone(name);
      if (!bone) return;
      const local = V(anchor.p).sub(head(name)).applyMatrix4(bone.matrixWorld);
      out.addScaledVector(local, anchor.w[k]);
    });
    return out;
  }

  /** World position of a palpation landmark in the current pose and position. */
  landmarkWorld(id: string, side: Side | "mid" = "left") {
    const lm = RIG.landmarks[id];
    const anchor = (side === "mid" ? lm?.mid : lm?.[side]) ?? lm?.mid ?? lm?.left;
    if (!anchor) throw new Error(`Unknown landmark ${id}`);
    return this.anchorWorld(anchor);
  }
  landmarkIds() {
    return Object.keys(RIG.landmarks);
  }

  /** World position of a joint centre (bone head). */
  jointWorld(boneName: string) {
    const bone = this.bone(boneName);
    return bone ? new THREE.Vector3().setFromMatrixPosition(bone.matrixWorld) : new THREE.Vector3();
  }

  /** Screen position (CSS pixels within the container) of a world point. */
  project(point: THREE.Vector3) {
    const v = point.clone().project(this.camera);
    return {
      x: ((v.x + 1) / 2) * this.container.clientWidth,
      y: ((1 - v.y) / 2) * this.container.clientHeight,
      visible: v.z > -1 && v.z < 1,
    };
  }

  /** What is under the pointer: surface point, region, dermatome, nerve territory, nearest landmark. */
  pick(clientX: number, clientY: number): PickResult | null {
    if (!this.skinned) return null;
    if (this.boundsDirty) {
      this.skinned.computeBoundingBox();
      this.skinned.computeBoundingSphere();
      this.boundsDirty = false;
    }
    const rect = this.renderer.domElement.getBoundingClientRect();
    const ndc = new THREE.Vector2(((clientX - rect.left) / rect.width) * 2 - 1, -((clientY - rect.top) / rect.height) * 2 + 1);
    const raycaster = new THREE.Raycaster();
    raycaster.setFromCamera(ndc, this.camera);
    const hit = raycaster.intersectObject(this.skinned, false)[0];
    if (!hit || !hit.face) return null;

    // Bind-pose (anatomical rest) position of the hit, for dermatome and region lookup.
    const mesh = this.skinned;
    const { a, b, c } = hit.face;
    const posed = [a, b, c].map((i) => mesh.getVertexPosition(i, new THREE.Vector3()));
    const local = hit.point.clone().applyMatrix4(mesh.matrixWorld.clone().invert());
    const bary = new THREE.Triangle(posed[0], posed[1], posed[2]).getBarycoord(local, new THREE.Vector3()) ?? new THREE.Vector3(1 / 3, 1 / 3, 1 / 3);
    const position = mesh.geometry.getAttribute("position");
    const bind = [a, b, c]
      .map((i) => new THREE.Vector3().fromBufferAttribute(position, i).applyMatrix4(mesh.bindMatrix))
      .reduce((sum, p, k) => sum.addScaledVector(p, [bary.x, bary.y, bary.z][k]), new THREE.Vector3());
    const skinIndex = mesh.geometry.getAttribute("skinIndex");
    const skinWeight = mesh.geometry.getAttribute("skinWeight");
    const weights = new Map<number, number>();
    for (const i of [a, b, c]) for (let k = 0; k < 4; k++) {
      const j = skinIndex.getComponent(i, k);
      weights.set(j, (weights.get(j) ?? 0) + skinWeight.getComponent(i, k));
    }
    const dominant = [...weights.entries()].sort((x, y) => y[1] - x[1])[0][0];
    const boneName = mesh.skeleton.bones[dominant]?.name ?? "";
    const info = classifySurface([bind.x, bind.y, bind.z], boneName);

    let landmark: PickResult["landmark"] = null;
    for (const id of Object.keys(RIG.landmarks)) {
      for (const side of Object.keys(RIG.landmarks[id]) as (Side | "mid")[]) {
        const d = this.landmarkWorld(id, side).distanceTo(hit.point);
        if (d < 0.045 && (!landmark || d < landmark.distance)) landmark = { id, side, distance: d };
      }
    }
    const normal = (hit.normal ?? new THREE.Vector3(0, 1, 0)).clone().transformDirection(mesh.matrixWorld);
    return { ...info, point: hit.point.clone(), normal, landmark };
  }
}

export function webglAvailable() {
  try {
    const canvas = document.createElement("canvas");
    return Boolean(canvas.getContext("webgl2") || canvas.getContext("webgl"));
  } catch {
    return false;
  }
}
