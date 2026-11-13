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
import { SOFT_SITES, mirrorProbe, type SkinProbe } from "./points";

export type Side = "left" | "right";
export type PatientPosition = "standing" | "supine" | "prone" | "sitting" | "sidelying";
export type JointId = "shoulder" | "elbow" | "wrist" | "hand" | "fingers" | "thumb" | "hip" | "knee" | "ankle" | "toe";
/**
 * Degrees. flex: flexion(+)/extension(−) — for the ankle dorsiflexion(+), for the great toe extension(+);
 * abd: abduction(+)/adduction(−) — for the wrist radial deviation(+), for the knee the lower leg angled outwards (valgus, +) or inwards (varus, −); rot: internal rotation(+) — for the ankle inversion(+);
 * elbow rot: forearm rotation.
 * hand: flex = grip (0–100 %), abd = thumb flexion (0–100 %).
 * fingers (index to little, degrees, added to the grip): flex = MCP, abd = PIP, rot = DIP flexion.
 * thumb (degrees): flex = MCP flexion, abd = CMC palmar abduction, rot = IP flexion.
 */
export type JointAngles = { flex?: number; abd?: number; rot?: number };
export type Pose = Partial<Record<`${JointId}.${Side}`, JointAngles>> & {
  neck?: JointAngles; // flex: flexion, abd: side-flexion to the right(+), rot: rotation to the right(+)
  trunk?: JointAngles;
  /** The head on the neck (upper cervical): same axes as neck. Lets a chin tuck retract the head without tilting the gaze. */
  head?: JointAngles;
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
export type Outfit = "none" | "scrubs" | "sport";
export type FaceState = { jaw: number; smile: number; blink: number; brow: number };
/** Facial bones moved by each expression: [bone, offset in metres at full strength, which control]. */
const FACE_RIG: [string, [number, number, number], keyof FaceState][] = [
  ["risorius03.L", [0.004, 0.006, 0.001], "smile"],
  ["risorius03.R", [-0.004, 0.006, 0.001], "smile"],
  ["risorius02.L", [0.003, 0.004, 0], "smile"],
  ["risorius02.R", [-0.003, 0.004, 0], "smile"],
];
const sideKey = (side: Side) => (side === "left" ? "L" : "R");
const sideSign = (side: Side) => (side === "left" ? 1 : -1);

export const PLINTH = { length: 1.95, width: 0.68, height: 0.66 };

/* ------------------------------------------------------------------ */
/* Anatomical alignment: rest (A-pose) → anatomical "arms at sides"     */
/* ------------------------------------------------------------------ */

const restBone = new Map(RIG.bones.map((b) => [b.name, b]));
/** GLTFLoader strips dots from bone names ("foot.L" → "footL"); map them back to the rig names. */
const rigName = new Map(RIG.bones.map((b) => [sanitize(b.name), b.name]));
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

/** Finger bones and the rest-pose axis each one flexes about (towards the palm). */
function fingerAxes(side: Side) {
  const s = sideKey(side);
  const wrist = head(`wrist.${s}`);
  const handDir = head(`finger3-1.${s}`).clone().sub(wrist).normalize();
  const curl = V(restBone.get(`finger3-3.${s}`)!.tail).sub(head(`finger3-1.${s}`));
  const palmar = curl.sub(handDir.clone().multiplyScalar(curl.dot(handDir))).normalize();
  // Thumb flexion bends the tip across the palm, towards the little finger.
  const ulnar = head(`finger5-1.${s}`).clone().sub(head(`finger2-1.${s}`)).normalize();
  const across = ulnar.clone().add(palmar.clone().multiplyScalar(0.6)).normalize();
  const out: { name: string; axis: THREE.Vector3; flexAxis: THREE.Vector3; max: number; thumb: boolean; finger: number; segment: number }[] = [];
  for (let f = 1; f <= 5; f++) {
    for (let k = 1; k <= 3; k++) {
      const name = `finger${f}-${k}.${s}`;
      const b = restBone.get(name);
      if (!b) continue;
      const dir = V(b.tail).sub(V(b.head)).normalize();
      const axis = new THREE.Vector3().crossVectors(dir, palmar).normalize();
      const flexAxis = f === 1 ? new THREE.Vector3().crossVectors(dir, across).normalize() : axis;
      out.push({ name, axis, flexAxis, max: f === 1 ? 35 : [0, 75, 90, 55][k], thumb: f === 1, finger: f, segment: k });
    }
  }
  return out;
}
const FINGERS = { left: fingerAxes("left"), right: fingerAxes("right") };

/* ------------------------------------------------------------------ */
/* Exam room                                                          */
/* ------------------------------------------------------------------ */

export type PickResult = SurfaceInfo & {
  /** Bone that carries this skin point (markers attach to it). */
  bone: string;
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
  /** Colour and pulse of the glowing skin zone (see highlightZone). */
  readonly zoneUniforms = { uZoneColor: { value: new THREE.Color("#2ee6d6") }, uZonePulse: { value: 0 }, uZoneTime: { value: 0 } };
  private zoneWeld: { id: Uint32Array; start: Uint32Array; list: Uint32Array; count: number } | null = null;
  private zoneClass: { derm: string[]; nerve: string[]; side: Uint8Array; covered: Uint8Array } | null = null;
  private zoneActive: Uint8Array | null = null;
  private bones = new Map<string, THREE.Bone>();
  private pose: Pose = {};
  /** The posture that defines the current position (e.g. hips and knees bent in sitting). */
  private basePose: Pose = {};
  /** How this patient holds himself in each position (set per case). */
  private casePosture: Partial<Record<PatientPosition, Pose>> = {};
  private target: Pose = {};
  private from: Pose = {};
  private tween: { start: number; duration: number } | null = null;
  private position: PatientPosition = "standing";
  /** In side-lying, the side the patient lies on. */
  downSide: Side = "left";
  private listeners = new Set<Listener>();
  private needsRender = true;
  private frame = 0;
  private resizeObserver: ResizeObserver;
  readonly extras = new THREE.Group(); // tools (goniometer, tape, markers) live here
  private disposed = false;
  private boundsDirty = true;
  /** Bony landmarks from the rig plus soft-tissue sites found on the mesh at load. */
  private landmarks: RigData["landmarks"] = { ...RIG.landmarks };
  /** Rest-pose (bind) position of every skin vertex, for surface lookup. */
  private bindPositions: Float32Array | null = null;
  /**
   * Geometry → rest-pose body coordinates. The model's vertices are stored quantised
   * (KHR_mesh_quantization folds the de-quantisation into the inverse bind matrices),
   * so raw positions must go through a bone's inverse bind matrix and back out by that
   * bone's rest position (every bone rests with identity rotation).
   */
  private restFromGeometry = new THREE.Matrix4();
  /** Height (CSS px) of the toolbar laid over the top of the view; framing keeps the patient below it. */
  viewInsetTop = 0;
  /** Each framing cancels any camera move still in progress. */
  private frameToken = 0;

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
    const environment = new RoomEnvironment();
    this.scene.environment = pmrem.fromScene(environment, 0.04).texture;
    environment.dispose();
    pmrem.dispose();
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
    const originals: THREE.Material[] = [];
    gltf.scene.traverse((object) => {
      if ((object as THREE.Bone).isBone) this.bones.set(object.name, object as THREE.Bone);
      const mesh = object as THREE.SkinnedMesh;
      if (mesh.isSkinnedMesh) {
        mesh.castShadow = true;
        mesh.frustumCulled = false;
        const material = mesh.material as THREE.MeshStandardMaterial;
        if (material.name === "skin" && !this.skinned) {
          originals.push(material);
          this.skinned = mesh;
          const skinMaterial = new THREE.MeshPhysicalMaterial({
            map: material.map,
            roughness: 0.56,
            metalness: 0,
            sheen: 0.35,
            sheenRoughness: 0.55,
            sheenColor: new THREE.Color("#ffb59a"),
            specularIntensity: 0.45,
          });
          // A glowing skin zone (a dermatome or nerve territory): vertices with zone = 1 are tinted and made emissive.
          skinMaterial.onBeforeCompile = (shader) => {
            shader.uniforms.uZoneColor = this.zoneUniforms.uZoneColor;
            shader.uniforms.uZonePulse = this.zoneUniforms.uZonePulse;
            shader.uniforms.uZoneTime = this.zoneUniforms.uZoneTime;
            shader.vertexShader = shader.vertexShader
              .replace("#include <common>", "#include <common>\nattribute float zone;\nvarying float vZone;\nvarying float vZoneY;")
              .replace("#include <begin_vertex>", "#include <begin_vertex>\nvZone = zone;")
              .replace("#include <project_vertex>", "vZoneY = (modelMatrix * vec4(transformed, 1.0)).y;\n#include <project_vertex>");
            shader.fragmentShader = shader.fragmentShader
              .replace("#include <common>", "#include <common>\nvarying float vZone;\nvarying float vZoneY;\nuniform vec3 uZoneColor;\nuniform float uZonePulse;\nuniform float uZoneTime;")
              .replace("#include <emissivemap_fragment>", "#include <emissivemap_fragment>\nfloat zoneScan = 0.8 + 0.2 * sin(vZoneY * 170.0 - uZoneTime * 4.0);\ndiffuseColor.rgb = mix(diffuseColor.rgb, uZoneColor, vZone * 0.5);\ntotalEmissiveRadiance += uZoneColor * vZone * (0.42 + 0.34 * uZonePulse) * zoneScan;");
          };
          skinMaterial.customProgramCacheKey = () => "skin-zone";
          mesh.geometry.setAttribute("zone", new THREE.BufferAttribute(new Float32Array(mesh.geometry.getAttribute("position").count), 1));
          mesh.material = skinMaterial;
        }
      }
    });
    // The three primitives (skin, eyes) share one skeleton; the skin is the pick target.
    this.patientRoot.add(gltf.scene);
    this.originalMaterials = originals;
    if (this.skinned) {
      const skeleton = this.skinned.skeleton;
      const rootName = rigName.get(skeleton.bones[0]?.name ?? "") ?? "root";
      this.restFromGeometry = new THREE.Matrix4()
        .makeTranslation(head(rootName))
        .multiply(skeleton.boneInverses[0])
        .multiply(this.skinned.bindMatrix);
    }
    for (const site of SOFT_SITES) {
      const left = this.findSkin(site.probe);
      const right = this.findSkin(mirrorProbe(site.probe));
      if (left >= 0 && right >= 0) this.landmarks[site.id] = { left: this.vertexAnchor(left), right: this.vertexAnchor(right) };
    }
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
  /** Moves the view into another container (one loaded patient shared by many demos). */
  attach(container: HTMLElement) {
    if (container === this.container) return;
    this.resizeObserver.unobserve(this.container);
    this.container = container;
    container.appendChild(this.renderer.domElement);
    this.resizeObserver.observe(container);
    this.resize();
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
  private originalMaterials: THREE.Material[] = [];
  dispose() {
    this.disposed = true;
    cancelAnimationFrame(this.frame);
    this.resizeObserver.disconnect();
    this.controls.dispose();
    // Free GPU memory: geometries, materials and their textures, the environment map.
    const textures = new Set<THREE.Texture>();
    const materials = new Set<THREE.Material>(this.originalMaterials);
    this.scene.traverse((object) => {
      const mesh = object as THREE.Mesh;
      mesh.geometry?.dispose();
      const list = Array.isArray(mesh.material) ? mesh.material : mesh.material ? [mesh.material] : [];
      list.forEach((m) => materials.add(m));
    });
    materials.forEach((material) => {
      Object.values(material).forEach((value) => {
        if ((value as THREE.Texture)?.isTexture) textures.add(value as THREE.Texture);
      });
      material.dispose();
    });
    if (this.scene.environment) textures.add(this.scene.environment);
    textures.forEach((texture) => texture.dispose());
    this.outfitMeshes.forEach((mesh) => (mesh.material as THREE.Material).dispose());
    this.skinned?.skeleton.dispose();
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

  /**
   * Moves to a pose, smoothly unless `animate` is false. `replace` starts again from the
   * position's base posture; otherwise the pose is merged over the current target.
   */
  setPose(pose: Pose, { animate = true, replace = false, duration = 650 }: { animate?: boolean; replace?: boolean; duration?: number } = {}) {
    const next: Pose = replace ? { ...structuredClone(this.basePose), ...structuredClone(pose) } : { ...structuredClone(this.target), ...structuredClone(pose) };
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
    const headOnNeck = this.pose.head;
    if (headOnNeck && (headOnNeck.flex || headOnNeck.abd || headOnNeck.rot)) {
      targets.set("head", neckWorld.clone().multiply(q(X, headOnNeck.flex ?? 0)).multiply(q(Z, headOnNeck.abd ?? 0)).multiply(q(Y, -(headOnNeck.rot ?? 0))));
    }

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
      const shank = thigh.clone().multiply(q(Z, sign * (j("knee").abd ?? 0))).multiply(q(X, j("knee").flex ?? 0));
      targets.set(`lowerleg01.${s}`, shank.clone().multiply(align.shank));
      const an = j("ankle");
      // flex = dorsiflexion(+); rot = inversion(+)
      const foot = shank.clone().multiply(q(X, -(an.flex ?? 0))).multiply(q(Z, -sign * (an.rot ?? 0)));
      targets.set(`foot.${s}`, foot);
      const toe = j("toe");
      targets.set(`toe1-1.${s}`, foot.clone().multiply(q(X, -(toe.flex ?? 0))));
    }

    // Fingers: local curls about each bone's own flexion axis.
    const locals = new Map<string, THREE.Quaternion>();
    for (const side of ["left", "right"] as Side[]) {
      const hand = this.pose[`hand.${side}`] ?? {};
      const grip = Math.max(0, Math.min(100, hand.flex ?? 0)) / 100;
      const thumb = Math.max(0, Math.min(100, hand.abd ?? 0)) / 100;
      const digits = this.pose[`fingers.${side}`] ?? {};
      const thumbJoints = this.pose[`thumb.${side}`] ?? {};
      for (const finger of FINGERS[side]) {
        const amount = finger.thumb ? Math.max(thumb, grip * 0.6) : grip;
        let local = amount > 0 ? q(finger.axis, finger.max * amount) : null;
        // Single-joint movements (goniometry of the fingers and thumb).
        const extra = finger.thumb
          ? [0, 0, thumbJoints.flex ?? 0, thumbJoints.rot ?? 0][finger.segment]
          : [0, digits.flex ?? 0, digits.abd ?? 0, digits.rot ?? 0][finger.segment];
        if (extra) local = (local ?? new THREE.Quaternion()).multiply(q(finger.flexAxis, extra));
        if (finger.thumb && finger.segment === 1 && thumbJoints.abd) local = (local ?? new THREE.Quaternion()).multiply(q(finger.axis, thumbJoints.abd));
        if (local) locals.set(finger.name, local);
      }
    }

    // Convert skeleton-space orientations into local quaternions, parents first.
    const world = new Map<string, THREE.Quaternion>();
    for (const b of RIG.bones) {
      const bone = this.bone(b.name);
      if (!bone) continue;
      const parentWorld = b.parent ? world.get(b.parent) ?? new THREE.Quaternion() : new THREE.Quaternion();
      const wanted = targets.get(b.name);
      if (wanted) bone.quaternion.copy(parentWorld.clone().invert().multiply(wanted));
      else if (locals.has(b.name)) bone.quaternion.copy(locals.get(b.name)!);
      else bone.quaternion.identity();
      world.set(b.name, parentWorld.clone().multiply(bone.quaternion));
    }
    this.applyFace();
    this.patientRoot.updateMatrixWorld(true);
    this.boundsDirty = true;
    this.invalidate();
  }

  /* ---------------- face (talking guide) ---------------- */

  private face: FaceState = { jaw: 0, smile: 0, blink: 0, brow: 0 };
  private faceRest = new Map<string, THREE.Vector3>();

  /** Mouth, smile, eyelids and brows, each 0–1. Cheap: only moves a few facial bones. */
  setFace(next: Partial<FaceState>) {
    let changed = false;
    for (const key of Object.keys(next) as (keyof FaceState)[]) {
      const value = Math.max(0, Math.min(1, next[key] ?? 0));
      if (Math.abs(this.face[key] - value) > 0.002) {
        this.face[key] = value;
        changed = true;
      }
    }
    if (changed) {
      this.applyFace();
      this.patientRoot.updateMatrixWorld(true);
      this.invalidate();
    }
  }

  private applyFace() {
    if (!this.bones.size) return;
    const { jaw, smile, blink, brow } = this.face;
    const jawBone = this.bone("jaw");
    if (jawBone) jawBone.quaternion.setFromAxisAngle(new THREE.Vector3(1, 0, 0), jaw * 0.36);
    for (const [name, delta, key] of FACE_RIG) {
      const bone = this.bone(name);
      if (!bone) continue;
      let rest = this.faceRest.get(name);
      if (!rest) {
        rest = bone.position.clone();
        this.faceRest.set(name, rest);
      }
      const amount = this.face[key];
      bone.position.set(rest.x + delta[0] * amount, rest.y + delta[1] * amount, rest.z + delta[2] * amount);
    }
    void blink;
    void brow;
    void smile;
  }

  /* ---------------- clothing ---------------- */

  private outfitMeshes: THREE.SkinnedMesh[] = [];
  private clothMasks = false;
  private geometryScale = 1;

  /**
   * Dresses the model: a thin cloth shell (skinned to the same skeleton, offset along the normals)
   * over the regions a shirt and trousers/shorts cover. "scrubs" = clinician's top and long trousers;
   * "sport" = t-shirt and knee-length shorts. Pure runtime geometry — no extra download.
   */
  setOutfit(kind: Outfit, colours?: { top?: string; bottom?: string }) {
    for (const mesh of this.outfitMeshes) {
      mesh.removeFromParent();
      (mesh.material as THREE.Material).dispose();
    }
    this.outfitMeshes = [];
    if (kind === "none" || !this.skinned) {
      this.invalidate();
      return;
    }
    const skin = this.skinned;
    const geometry = skin.geometry;
    if (!this.clothMasks) this.buildClothMasks(kind);
    else if (this.maskKind !== kind) this.buildClothMasks(kind);
    const palette = kind === "scrubs"
      ? { top: colours?.top ?? "#0e8f95", bottom: colours?.bottom ?? "#16304d" }
      : { top: colours?.top ?? "#e9f1f7", bottom: colours?.bottom ?? "#1b3a5c" };
    const make = (kindId: number, colour: string, offsetMetres: number) => {
      const material = new THREE.MeshStandardMaterial({ color: colour, roughness: 0.9, metalness: 0 });
      material.onBeforeCompile = (shader) => {
        shader.uniforms.uOffset = { value: offsetMetres / this.geometryScale };
        shader.uniforms.uKind = { value: kindId };
        shader.vertexShader = shader.vertexShader
          .replace("#include <common>", "#include <common>\nattribute float clothShirt;\nattribute float clothPants;\nuniform float uOffset;\nuniform float uKind;\nvarying float vCloth;")
          .replace("#include <skinning_vertex>", "#include <skinning_vertex>\ntransformed += normalize(objectNormal) * uOffset;\nvCloth = uKind < 1.5 ? clothShirt : clothPants;");
        shader.fragmentShader = shader.fragmentShader
          .replace("#include <common>", "#include <common>\nvarying float vCloth;")
          .replace("void main() {", "void main() {\n  if (vCloth < 0.5) discard;");
      };
      material.customProgramCacheKey = () => `cloth-${kindId}`;
      const mesh = new THREE.SkinnedMesh(geometry, material);
      mesh.bind(skin.skeleton, skin.bindMatrix);
      mesh.position.copy(skin.position);
      mesh.quaternion.copy(skin.quaternion);
      mesh.scale.copy(skin.scale);
      mesh.frustumCulled = false;
      mesh.name = kindId === 1 ? "outfit-top" : "outfit-bottom";
      skin.parent?.add(mesh);
      this.outfitMeshes.push(mesh);
    };
    make(2, palette.bottom, 0.0042);
    make(1, palette.top, 0.0066);
    this.invalidate();
  }

  private maskKind: Outfit = "none";

  private buildClothMasks(kind: Outfit) {
    const skin = this.skinned!;
    const geometry = skin.geometry;
    const bind = this.bindPositionsOf()!;
    const count = geometry.getAttribute("position").count;
    const names = skin.skeleton.bones.map((b) => b.name);
    const shirt = new Float32Array(count);
    const pants = new Float32Array(count);
    const shoulder = new THREE.Vector3(...(RIG.bones.find((b) => b.name === "upperarm01.L")!.head as [number, number, number]));
    const elbow = new THREE.Vector3(...(RIG.bones.find((b) => b.name === "lowerarm01.L")!.head as [number, number, number]));
    const armAxis = elbow.clone().sub(shoulder);
    const armLength = armAxis.length();
    armAxis.normalize();
    const sleeve = kind === "scrubs" ? 0.5 : 0.42;
    const hem = 0.855; // shirt hem, a little below the hip joint
    const waist = 1.0;
    const ankleHem = 0.085;
    const shortsHem = 0.6;
    const v = new THREE.Vector3();
    for (let i = 0; i < count; i++) {
      v.set(bind[i * 3], bind[i * 3 + 1], bind[i * 3 + 2]);
      const joint = this.skinOf(i)[0]?.joint ?? 0;
      const name = names[joint] ?? "";
      const arm = /^upperarm/.test(name);
      const torso = /^(spine|breast|clavicle|shoulder01|root|pelvis)/.test(name);
      if (torso && v.y >= hem && v.y <= 1.47) shirt[i] = 1;
      if (arm) {
        const along = v.clone().sub(new THREE.Vector3(Math.abs(shoulder.x), shoulder.y, shoulder.z).setX(Math.sign(v.x || 1) * Math.abs(shoulder.x))).dot(new THREE.Vector3(Math.sign(v.x || 1) * armAxis.x, armAxis.y, armAxis.z)) / armLength;
        if (along <= sleeve) shirt[i] = 1;
      }
      const leg = /^(upperleg|lowerleg)/.test(name);
      const hip = /^(root|pelvis)/.test(name) && v.y < waist;
      const lowest = kind === "scrubs" ? ankleHem : shortsHem;
      if ((leg || hip) && v.y >= lowest && v.y <= waist + 0.02) pants[i] = 1;
    }
    geometry.setAttribute("clothShirt", new THREE.BufferAttribute(shirt, 1));
    geometry.setAttribute("clothPants", new THREE.BufferAttribute(pants, 1));
    // Metres per geometry unit (the mesh is stored quantised).
    const position = geometry.getAttribute("position");
    let best = 0;
    for (const j of [Math.floor(count / 3), Math.floor(count / 2), count - 1, Math.floor(count / 5)]) {
      const g = new THREE.Vector3().fromBufferAttribute(position, 0).sub(new THREE.Vector3().fromBufferAttribute(position, j)).length();
      const m = new THREE.Vector3(bind[0], bind[1], bind[2]).sub(new THREE.Vector3(bind[j * 3], bind[j * 3 + 1], bind[j * 3 + 2])).length();
      if (g > 1e-6 && m / g > best) best = m / g;
    }
    this.geometryScale = best || 1;
    this.clothMasks = true;
    this.maskKind = kind;
  }

  /* ---------------- patient positions ---------------- */

  /** Places the patient: standing beside the plinth, or on it (supine, prone, sitting, side-lying). */
  /** Case-specific resting posture (merged under each position's own posture). */
  setCasePosture(posture: Partial<Record<PatientPosition, Pose>> | undefined) {
    this.casePosture = structuredClone(posture ?? {});
  }

  setPosition(position: PatientPosition, animate = true, options: { down?: Side } = {}) {
    this.position = position;
    if (options.down) this.downSide = options.down;
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
      // Lower leg bent for stability, top leg free for testing.
      const down = this.downSide;
      const up: Side = down === "left" ? "right" : "left";
      Object.assign(base, {
        [`hip.${down}`]: { flex: 30 }, [`knee.${down}`]: { flex: 45 }, [`hip.${up}`]: { flex: 10 }, [`knee.${up}`]: { flex: 10 },
        [`shoulder.${down}`]: { flex: 80 }, [`elbow.${down}`]: { flex: 70 }, [`shoulder.${up}`]: { flex: 10 },
      });
    }
    const merged: Pose = { ...structuredClone(this.casePosture[position] ?? {}), ...base };
    this.basePose = merged;
    this.setPose(merged, { animate: false, replace: true });
    // Orientation bases: where the patient's left (x), head (y) and face (z) point.
    const basis = (x: number[], y: number[], z: number[]) =>
      root.quaternion.setFromRotationMatrix(new THREE.Matrix4().makeBasis(V(x), V(y), V(z)));
    if (position === "supine") basis([1, 0, 0], [0, 0, -1], [0, 1, 0]); // head on the pillow, face up
    if (position === "prone") basis([-1, 0, 0], [0, 0, -1], [0, -1, 0]); // face down
    if (position === "sidelying") {
      if (this.downSide === "left") basis([0, -1, 0], [0, 0, -1], [1, 0, 0]); // on the left side, facing the examiner (+x)
      else basis([0, 1, 0], [0, 0, -1], [-1, 0, 0]); // on the right side, facing away
    }
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

  /** World-space bounds of the body in the current pose. */
  bounds() {
    return this.bodyBox();
  }

  private bodyBox() {
    if (!this.skinned) return new THREE.Box3(new THREE.Vector3(-0.3, 0, -0.2), new THREE.Vector3(0.3, 1.75, 0.2));
    this.skinned.computeBoundingBox();
    return this.skinned.boundingBox!.clone().applyMatrix4(this.skinned.matrixWorld);
  }

  /** Points the camera at the whole patient, or at a body part (optionally from a given direction). */
  frameCamera(animate = true, focus?: THREE.Vector3, distance?: number, from?: THREE.Vector3) {
    const box = this.bodyBox();
    const lying = this.position === "supine" || this.position === "prone" || this.position === "sidelying";
    const height = this.container.clientHeight || 1;
    // The part of the view not covered by the toolbar (phones wrap it onto two rows).
    const free = Math.min(1, Math.max(0.6, (height - this.viewInsetTop) / height));
    const centre = focus ?? box.getCenter(new THREE.Vector3());
    // Fit the whole patient: distance from the bounding-sphere radius and the narrower free field of view.
    const radius = box.getBoundingSphere(new THREE.Sphere()).radius;
    const vfov = this.camera.fov * DEG;
    const freeVfov = 2 * Math.atan(Math.tan(vfov / 2) * free);
    const hfov = 2 * Math.atan(Math.tan(vfov / 2) * this.camera.aspect);
    const size = distance ?? Math.max(1.2, (radius / Math.sin(Math.min(freeVfov, hfov) / 2)) * (lying ? 0.95 : 1.05));
    // Centre him in the free area: raise the aim point by half the toolbar height (in world units at that distance).
    const worldPerPixel = (2 * size * Math.tan(vfov / 2)) / height;
    const target = centre.clone().add(new THREE.Vector3(0, (this.viewInsetTop / 2) * worldPerPixel + (lying || focus ? 0 : 0.03), 0));
    const dir = from
      ? from.clone().normalize()
      : lying
      ? new THREE.Vector3(this.position === "sidelying" && this.downSide === "right" ? -1.15 : 1.15, 0.85, 0.45).normalize()
      : new THREE.Vector3(0.55, 0.22, 1).normalize();
    const goal = target.clone().add(dir.multiplyScalar(size));
    const token = ++this.frameToken;
    if (!animate) {
      this.camera.position.copy(goal);
      this.controls.target.copy(target);
      this.invalidate();
      return;
    }
    const startPos = this.camera.position.clone();
    const startTarget = this.controls.target.clone();
    const start = performance.now();
    const step = (now: number) => {
      if (token !== this.frameToken) return;
      const t = Math.min(1, (now - start) / 600);
      const e = 1 - Math.pow(1 - t, 3);
      this.camera.position.lerpVectors(startPos, goal, e);
      this.controls.target.lerpVectors(startTarget, target, e);
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
    const lm = this.landmarks[id];
    const anchor = (side === "mid" ? lm?.mid : lm?.[side]) ?? lm?.mid ?? lm?.left;
    if (!anchor) throw new Error(`Unknown landmark ${id}`);
    return this.anchorWorld(anchor);
  }
  landmarkIds() {
    return Object.keys(this.landmarks);
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
      .map((i) => new THREE.Vector3().fromBufferAttribute(position, i).applyMatrix4(this.restFromGeometry))
      .reduce((sum, p, k) => sum.addScaledVector(p, [bary.x, bary.y, bary.z][k]), new THREE.Vector3());
    const skinIndex = mesh.geometry.getAttribute("skinIndex");
    const skinWeight = mesh.geometry.getAttribute("skinWeight");
    const weights = new Map<number, number>();
    for (const i of [a, b, c]) for (let k = 0; k < 4; k++) {
      const j = skinIndex.getComponent(i, k);
      weights.set(j, (weights.get(j) ?? 0) + skinWeight.getComponent(i, k));
    }
    const dominant = [...weights.entries()].sort((x, y) => y[1] - x[1])[0][0];
    const normal = (hit.normal ?? new THREE.Vector3(0, 1, 0)).clone().transformDirection(mesh.matrixWorld);
    return this.surface(bind, dominant, hit.point.clone(), normal);
  }

  /** Builds a pick result for a skin point: region, dermatome, nerve and the nearest landmark. */
  private surface(bind: THREE.Vector3, dominantJoint: number, point: THREE.Vector3, normal: THREE.Vector3, landmark?: PickResult["landmark"]): PickResult {
    const boneName = this.skinned?.skeleton.bones[dominantJoint]?.name ?? "";
    const info = classifySurface([bind.x, bind.y, bind.z], boneName);
    let nearest: PickResult["landmark"] = landmark ?? null;
    if (landmark === undefined) {
      for (const id of Object.keys(this.landmarks)) {
        for (const side of Object.keys(this.landmarks[id]) as (Side | "mid")[]) {
          const d = this.landmarkWorld(id, side).distanceTo(point);
          if (d < 0.045 && (!nearest || d < nearest.distance)) nearest = { id, side, distance: d };
        }
      }
    }
    return { ...info, bone: boneName, point, normal, landmark: nearest };
  }

  /* ---------------- named skin points (no tap needed) ---------------- */

  private bindPositionsOf() {
    if (this.bindPositions || !this.skinned) return this.bindPositions;
    const mesh = this.skinned;
    const position = mesh.geometry.getAttribute("position");
    const out = new Float32Array(position.count * 3);
    const v = new THREE.Vector3();
    for (let i = 0; i < position.count; i++) {
      v.fromBufferAttribute(position, i).applyMatrix4(this.restFromGeometry);
      out[i * 3] = v.x;
      out[i * 3 + 1] = v.y;
      out[i * 3 + 2] = v.z;
    }
    this.bindPositions = out;
    return out;
  }
  /** The outermost skin vertex along a rest-pose probe ray (−1 if none). */
  private findSkin(probe: SkinProbe) {
    const bind = this.bindPositionsOf();
    if (!bind) return -1;
    const [ox, oy, oz] = probe.origin;
    const [dx, dy, dz] = probe.dir;
    const tolerance = Math.min(probe.radius, 0.022);
    let best = -1;
    let score = -Infinity;
    for (let i = 0; i < bind.length / 3; i++) {
      const rx = bind[i * 3] - ox, ry = bind[i * 3 + 1] - oy, rz = bind[i * 3 + 2] - oz;
      const along = rx * dx + ry * dy + rz * dz;
      if (along <= 0 || along > 0.25) continue;
      const off = Math.hypot(rx - dx * along, ry - dy * along, rz - dz * along);
      if (off <= tolerance && along > score) {
        score = along;
        best = i;
      }
    }
    return best;
  }
  private nearestVertex(p: number[]) {
    const bind = this.bindPositionsOf();
    if (!bind) return -1;
    let best = -1;
    let d = Infinity;
    for (let i = 0; i < bind.length / 3; i++) {
      const e = (bind[i * 3] - p[0]) ** 2 + (bind[i * 3 + 1] - p[1]) ** 2 + (bind[i * 3 + 2] - p[2]) ** 2;
      if (e < d) {
        d = e;
        best = i;
      }
    }
    return best;
  }
  private skinOf(i: number) {
    const geometry = this.skinned!.geometry;
    const index = geometry.getAttribute("skinIndex");
    const weight = geometry.getAttribute("skinWeight");
    const out: { joint: number; weight: number }[] = [];
    for (let k = 0; k < 4; k++) {
      const w = weight.getComponent(i, k);
      if (w > 0) out.push({ joint: index.getComponent(i, k), weight: w });
    }
    return out.sort((a, b) => b.weight - a.weight);
  }
  private vertexAnchor(i: number): Anchor {
    const bind = this.bindPositionsOf()!;
    const skin = this.skinOf(i);
    const names = skin.map((s) => rigName.get(this.skinned!.skeleton.bones[s.joint]?.name ?? "") ?? "");
    const total = skin.reduce((sum, s) => sum + s.weight, 0) || 1;
    return {
      p: [bind[i * 3], bind[i * 3 + 1], bind[i * 3 + 2]],
      b: names.filter(Boolean),
      w: skin.filter((_, k) => names[k]).map((s) => s.weight / total),
    };
  }
  /** Pick result for skin vertex i in the current pose. */
  private vertexPick(i: number, landmark?: PickResult["landmark"]): PickResult | null {
    const mesh = this.skinned;
    const bind = this.bindPositionsOf();
    if (!mesh || !bind || i < 0) return null;
    this.patientRoot.updateMatrixWorld(true);
    mesh.skeleton.update();
    const point = mesh.getVertexPosition(i, new THREE.Vector3()).applyMatrix4(mesh.matrixWorld);
    const skin = this.skinOf(i);
    const bone = mesh.skeleton.bones[skin[0]?.joint ?? 0];
    const normal = bone ? point.clone().sub(new THREE.Vector3().setFromMatrixPosition(bone.matrixWorld)).normalize() : new THREE.Vector3(0, 1, 0);
    return this.surface(new THREE.Vector3(bind[i * 3], bind[i * 3 + 1], bind[i * 3 + 2]), skin[0]?.joint ?? 0, point, normal, landmark);
  }
  /** The skin point a rest-pose probe finds on one side (e.g. a dermatome key point). */
  probeSkin(probe: SkinProbe, side: Side) {
    return this.vertexPick(this.findSkin(side === "left" ? probe : mirrorProbe(probe)));
  }
  /** A pick result for a named landmark, as if the student had tapped exactly on it. */
  landmarkPick(id: string, side: Side) {
    const lm = this.landmarks[id];
    const key: Side | "mid" = lm?.[side] ? side : "mid";
    const anchor = lm?.[key];
    if (!anchor) return null;
    return this.vertexPick(this.nearestVertex(anchor.p), { id, side: key, distance: 0 });
  }

  /* ---------------- glowing skin zones (dermatomes, nerve territories) ---------------- */

  /** Dermatome, nerve territory and side of every skin vertex (the patient's left is +x at rest). Worked out once, on first use. */
  private zoneClassification() {
    if (this.zoneClass) return this.zoneClass;
    const mesh = this.skinned!;
    const bind = this.bindPositionsOf()!;
    const count = bind.length / 3;
    const bones = mesh.skeleton.bones;
    const derm: string[] = new Array(count);
    const nerve: string[] = new Array(count);
    const side = new Uint8Array(count);
    const covered = new Uint8Array(count);
    const cache = new Map<number, string>();
    for (let i = 0; i < count; i++) {
      const joint = this.skinOf(i)[0]?.joint ?? 0;
      let name = cache.get(joint);
      if (name === undefined) {
        name = bones[joint]?.name ?? "";
        cache.set(joint, name);
      }
      const info = classifySurface([bind[i * 3], bind[i * 3 + 1], bind[i * 3 + 2]], name);
      derm[i] = info.dermatome ?? "";
      nerve[i] = info.nerve ?? "";
      side[i] = info.side === "left" ? 1 : 0;
      covered[i] = info.covered ? 1 : 0;
    }
    this.zoneClass = { derm, nerve, side, covered };
    return this.zoneClass;
  }

  /** Rounds the ragged vertex-level edge of a zone: averages over neighbouring vertices (seam duplicates welded), then sharpens. */
  private smoothZone(mask: Uint8Array): Float32Array {
    const mesh = this.skinned!;
    if (!this.zoneWeld) {
      const bind = this.bindPositionsOf()!;
      const count = bind.length / 3;
      const keys = new Map<string, number>();
      const id = new Uint32Array(count);
      for (let i = 0; i < count; i++) {
        const key = `${Math.round(bind[i * 3] * 4000)},${Math.round(bind[i * 3 + 1] * 4000)},${Math.round(bind[i * 3 + 2] * 4000)}`;
        let w = keys.get(key);
        if (w === undefined) {
          w = keys.size;
          keys.set(key, w);
        }
        id[i] = w;
      }
      const n = keys.size;
      const index = mesh.geometry.getIndex();
      const neighbours: Set<number>[] = Array.from({ length: n }, () => new Set<number>());
      if (index) {
        for (let t = 0; t < index.count; t += 3) {
          const a = id[index.getX(t)], b = id[index.getX(t + 1)], c = id[index.getX(t + 2)];
          neighbours[a].add(b).add(c);
          neighbours[b].add(a).add(c);
          neighbours[c].add(a).add(b);
        }
      }
      const start = new Uint32Array(n + 1);
      neighbours.forEach((set, k) => (start[k + 1] = start[k] + set.size));
      const list = new Uint32Array(start[n]);
      neighbours.forEach((set, k) => {
        let at = start[k];
        set.forEach((v) => (list[at++] = v));
      });
      this.zoneWeld = { id, start, list, count: n };
    }
    const { id, start, list, count } = this.zoneWeld;
    let a = new Float32Array(count);
    for (let i = 0; i < id.length; i++) if (mask[i]) a[id[i]] = 1;
    let b = new Float32Array(count);
    for (let pass = 0; pass < 3; pass++) {
      for (let k = 0; k < count; k++) {
        let sum = a[k] * 2;
        for (let e = start[k]; e < start[k + 1]; e++) sum += a[list[e]];
        b[k] = sum / (2 + start[k + 1] - start[k]);
      }
      [a, b] = [b, a];
    }
    const out = new Float32Array(id.length);
    for (let i = 0; i < id.length; i++) {
      const t = Math.min(1, Math.max(0, (a[id[i]] - 0.3) / 0.4));
      out[i] = t * t * (3 - 2 * t);
    }
    return out;
  }

  private zoneMatches(spec: { dermatomes?: string[]; nerves?: string[]; side: Side }) {
    const cls = this.zoneClassification();
    const want = spec.side === "left" ? 1 : 0;
    const out = new Uint8Array(cls.derm.length);
    for (let i = 0; i < out.length; i++) {
      if (cls.side[i] !== want || cls.covered[i]) continue;
      if ((spec.dermatomes && cls.derm[i] && spec.dermatomes.includes(cls.derm[i])) || (spec.nerves && cls.nerve[i] && spec.nerves.includes(cls.nerve[i]))) out[i] = 1;
    }
    return out;
  }

  /** Makes a dermatome or nerve territory glow on the skin of one side (null clears it). `amount` fades it in (0–1). */
  highlightZone(spec: { dermatomes?: string[]; nerves?: string[]; side: Side } | null, color = "#2ee6d6") {
    const mesh = this.skinned;
    const attribute = mesh?.geometry.getAttribute("zone") as THREE.BufferAttribute | undefined;
    if (!mesh || !attribute) return;
    const array = attribute.array as Float32Array;
    if (!spec) {
      if (this.zoneActive) {
        array.fill(0);
        attribute.needsUpdate = true;
        this.zoneActive = null;
        this.invalidate();
      }
      return;
    }
    const matches = this.zoneMatches(spec);
    const smooth = this.smoothZone(matches);
    for (let i = 0; i < array.length; i++) array[i] = smooth[i];
    this.zoneActive = matches;
    this.zoneUniforms.uZoneColor.value.set(color);
    attribute.needsUpdate = true;
    this.invalidate();
  }
  /** Brightness pulse of the glowing zone (0–1). */
  pulseZone(value: number, time = 0) {
    this.zoneUniforms.uZonePulse.value = value;
    this.zoneUniforms.uZoneTime.value = time;
    this.invalidate();
  }
  /** World-space box round the glowing zone in the current pose (to aim the camera), and a skin point near its middle. */
  zoneBounds(): { box: THREE.Box3; centre: THREE.Vector3; bone: string } | null {
    const mesh = this.skinned;
    const active = this.zoneActive;
    if (!mesh || !active) return null;
    this.patientRoot.updateMatrixWorld(true);
    mesh.skeleton.update();
    const box = new THREE.Box3();
    const points: THREE.Vector3[] = [];
    const indices: number[] = [];
    const v = new THREE.Vector3();
    for (let i = 0; i < active.length; i++) {
      if (!active[i]) continue;
      mesh.getVertexPosition(i, v).applyMatrix4(mesh.matrixWorld);
      points.push(v.clone());
      indices.push(i);
      box.expandByPoint(v);
    }
    if (!points.length) return null;
    const middle = box.getCenter(new THREE.Vector3());
    let best = 0;
    for (let k = 1; k < points.length; k++) if (points[k].distanceToSquared(middle) < points[best].distanceToSquared(middle)) best = k;
    const joint = this.skinOf(indices[best])[0]?.joint ?? 0;
    return { box, centre: points[best].clone(), bone: mesh.skeleton.bones[joint]?.name ?? "" };
  }
  /** Where a named skin point (a dermatome key point or nerve zone from points.ts) is, in the current pose. */
  skinPointWorld(probe: SkinProbe, side: Side) {
    return this.probeSkin(probe, side)?.point ?? null;
  }

  /* ---------------- tool props: markers, tape ---------------- */

  /** A small coloured dot stuck to the skin (it follows the body as he moves). */
  addMarker(pick: PickResult, color: string) {
    const bone = this.bones.get(pick.bone) ?? this.bones.get(sanitize(pick.bone));
    const dot = new THREE.Mesh(new THREE.SphereGeometry(0.011, 14, 10), new THREE.MeshBasicMaterial({ color }));
    dot.name = "marker";
    const offset = pick.point.clone().add(pick.normal.clone().multiplyScalar(0.004));
    if (bone) {
      bone.add(dot);
      dot.position.copy(bone.worldToLocal(offset));
    } else {
      this.extras.add(dot);
      dot.position.copy(offset);
    }
    this.markers.push(dot);
    this.invalidate();
  }
  clearMarkers() {
    this.markers.forEach((m) => m.removeFromParent());
    this.markers = [];
    this.invalidate();
  }
  private markers: THREE.Object3D[] = [];

  /** A tape measure between two points, or wrapped round a limb. */
  showTape(from: THREE.Vector3, to: THREE.Vector3) {
    this.clearTape();
    const length = from.distanceTo(to);
    const tape = new THREE.Mesh(new THREE.BoxGeometry(0.012, length, 0.002), new THREE.MeshStandardMaterial({ color: "#f5c542", roughness: 0.5 }));
    tape.position.copy(from).add(to).multiplyScalar(0.5);
    tape.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), to.clone().sub(from).normalize());
    tape.name = "tape";
    this.extras.add(tape);
    this.invalidate();
  }
  showRing(centre: THREE.Vector3, axis: THREE.Vector3, radius: number) {
    this.clearTape();
    const ring = new THREE.Mesh(new THREE.TorusGeometry(radius, 0.004, 8, 48), new THREE.MeshStandardMaterial({ color: "#f5c542", roughness: 0.5 }));
    ring.position.copy(centre);
    ring.quaternion.setFromUnitVectors(new THREE.Vector3(0, 0, 1), axis.clone().normalize());
    ring.name = "tape";
    this.extras.add(ring);
    this.invalidate();
  }
  clearTape() {
    this.extras.children.filter((c) => c.name === "tape").forEach((c) => c.removeFromParent());
    this.invalidate();
  }

  /** Bone head position by rig name, with ".L"/".R" chosen by side when given. */
  boneWorld(name: string, side?: Side) {
    return this.jointWorld(side && !/\.[LR]$/.test(name) && !/^(spine|neck|head|root)/.test(name) ? `${name}.${sideKey(side)}` : name);
  }
  /** Bone tail (the far end of the segment) in the current pose. */
  boneEnd(name: string, side?: Side) {
    const full = side && !/\.[LR]$/.test(name) && !/^(spine|neck|head|root|jaw)/.test(name) ? `${name}.${sideKey(side)}` : name;
    const bone = this.bone(full);
    const rest = restBone.get(full);
    if (!bone || !rest) return this.jointWorld(full);
    // Rest bones have identity rotation, so the rest head→tail vector turns with the bone (as in headWorld).
    return this.jointWorld(full).add(V(rest.tail).sub(V(rest.head)).applyQuaternion(bone.getWorldQuaternion(new THREE.Quaternion())));
  }
  /** A point offset from a bone's head, in the bone's rest frame (x towards the patient's left on the left side, y up the limb, z to the front), so it follows the bone. */
  boneOffset(name: string, side: Side, offset: [number, number, number]) {
    const full = !/\.[LR]$/.test(name) && !/^(spine|neck|head|root|jaw)/.test(name) ? `${name}.${sideKey(side)}` : name;
    const bone = this.bone(full);
    const origin = this.jointWorld(full);
    if (!bone) return origin;
    const v = new THREE.Vector3(offset[0] * (side === "right" && !/^(spine|neck|head|root|jaw)/.test(name) ? -1 : 1), offset[1], offset[2]).applyQuaternion(bone.getWorldQuaternion(new THREE.Quaternion()));
    return origin.add(v);
  }
  /** Where a bone-attached skin point sits now: `local` is expressed in that bone's space (see skinAnchor). */
  anchorPoint(bone: string, local: THREE.Vector3) {
    const b = this.bone(bone);
    return b ? local.clone().applyMatrix4(b.matrixWorld) : local.clone();
  }
  /** Fixes a skin point (a pick result) to its bone so it can be followed cheaply as the patient moves. */
  skinAnchor(pick: { bone: string; point: THREE.Vector3 }) {
    const b = this.bone(pick.bone);
    return { bone: pick.bone, local: b ? b.worldToLocal(pick.point.clone()) : pick.point.clone() };
  }
  /** Top of the head, for the patient's speech bubble. */
  headWorld() {
    const head = this.jointWorld("head");
    const tip = this.bone("head") ? new THREE.Vector3(...restBone.get("head")!.tail).sub(V(restBone.get("head")!.head)).applyQuaternion(this.bone("head")!.getWorldQuaternion(new THREE.Quaternion())) : new THREE.Vector3(0, 0.2, 0);
    return head.add(tip);
  }
}

export function webglAvailable() {
  try {
    const canvas = document.createElement("canvas");
    const context = (canvas.getContext("webgl2") || canvas.getContext("webgl")) as WebGLRenderingContext | null;
    // Release the test context straight away (browsers cap the number of live WebGL contexts).
    context?.getExtension("WEBGL_lose_context")?.loseContext();
    return Boolean(context);
  } catch {
    return false;
  }
}
