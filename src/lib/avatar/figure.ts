/**
 * One articulated human figure for the teaching avatar (browser only; imported only through client-side dynamic imports,
 * so three.js never enters the Cloudflare worker). It loads the CC0 body that the Virtual Patient already uses (same
 * 163-bone skeleton, fingers and face bones), keeps its own bone map, and is posed with the patient's pose system
 * (`applyPoseToBones`), so everything that poses the patient can pose the teacher.
 */
import * as THREE from "three";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";
import { MeshoptDecoder } from "three/examples/jsm/libs/meshopt_decoder.module.js";
import { applyPoseToBones, type JointAngles, type Pose } from "@/lib/virtual-patient/engine";
import { readBody, sanitize, type BodyData } from "./mesh";

export const BODY_URL = "/virtual-patient/patient.glb";

export type LoadOptions = { url?: string; onProgress?: (fraction: number) => void; /** A replacement model: pick its biggest skinned mesh instead of the one called "skin". */ custom?: boolean };

export class Figure {
  /** Add this to the scene; moving it moves the whole figure (the feet are at its origin). */
  readonly root = new THREE.Group();
  mesh!: THREE.SkinnedMesh;
  eyes: THREE.SkinnedMesh | null = null;
  body!: BodyData;
  readonly bones = new Map<string, THREE.Bone>();
  pose: Pose = {};
  /** Things that must be disposed with the figure. */
  private owned: { dispose: () => void }[] = [];
  /** Called after every pose change (face and accessories hook in here). */
  onPosed: (() => void) | null = null;

  static async load(options: LoadOptions = {}): Promise<Figure> {
    const figure = new Figure();
    const loader = new GLTFLoader().setMeshoptDecoder(MeshoptDecoder);
    const gltf = await loader.loadAsync(options.url ?? BODY_URL, (event) => {
      if (event.total) options.onProgress?.(event.loaded / event.total);
    });
    gltf.scene.traverse((object) => {
      if ((object as THREE.Bone).isBone) figure.bones.set(object.name, object as THREE.Bone);
      const mesh = object as THREE.SkinnedMesh;
      if (mesh.isSkinnedMesh) {
        mesh.frustumCulled = false;
        mesh.castShadow = true;
        const name = (mesh.material as THREE.Material).name;
        if (options.custom) {
          const count = mesh.geometry.getAttribute("position").count;
          if (!figure.mesh || count > figure.mesh.geometry.getAttribute("position").count) figure.mesh = mesh;
        } else if (name === "skin" && !figure.mesh) figure.mesh = mesh;
        else if (name === "eyes") figure.eyes = mesh;
      }
    });
    if (!figure.mesh) throw new Error("The body model has no skin mesh.");
    figure.root.add(gltf.scene);
    if (!options.custom) figure.body = readBody(figure.mesh);
    figure.setPose({});
    figure.ground();
    return figure;
  }

  bone(name: string) {
    return this.bones.get(sanitize(name));
  }

  /** Poses the figure now. `replace` starts again from the neutral standing pose; otherwise `pose` is merged over the current one. */
  setPose(pose: Pose, replace = true) {
    this.pose = replace ? { ...pose } : { ...this.pose, ...pose };
    applyPoseToBones((name) => this.bone(name), this.pose);
    this.onPosed?.();
    this.root.updateMatrixWorld(true);
  }

  /** Sets one joint's angles, keeping the rest of the pose. */
  setJoint(key: keyof Pose, angles: JointAngles) {
    this.setPose({ [key]: { ...((this.pose[key] as JointAngles | undefined) ?? {}), ...angles } } as Pose, false);
  }

  /** Puts the soles on the floor (y = 0) wherever the pose left them. */
  ground() {
    this.root.position.y = 0;
    this.root.updateMatrixWorld(true);
    this.mesh.computeBoundingBox();
    const box = this.mesh.boundingBox!.clone().applyMatrix4(this.mesh.matrixWorld);
    this.root.position.y = -box.min.y;
    this.root.updateMatrixWorld(true);
  }

  own<T extends { dispose: () => void }>(thing: T): T {
    this.owned.push(thing);
    return thing;
  }

  dispose() {
    this.root.traverse((object) => {
      const mesh = object as THREE.Mesh;
      if (mesh.isMesh) {
        mesh.geometry?.dispose();
        const materials = Array.isArray(mesh.material) ? mesh.material : [mesh.material];
        for (const material of materials) {
          for (const value of Object.values(material)) if (value && (value as THREE.Texture).isTexture) (value as THREE.Texture).dispose();
          material.dispose();
        }
      }
    });
    for (const thing of this.owned) thing.dispose();
    this.owned = [];
    this.root.removeFromParent();
  }
}
