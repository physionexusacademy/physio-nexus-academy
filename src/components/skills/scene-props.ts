/** Simple 3D props for Skills Lab scenes (browser only): a chair, a wall, a foam pad, cones, a walkway, a block. Removed when the scene changes. */
import * as THREE from "three";
import type { ExamRoom } from "@/lib/virtual-patient/engine";
import type { Prop } from "@/lib/skills/scene-types";

const NAME = "scene-prop";

export function clearProps(room: ExamRoom) {
  room.extras.children.filter((c) => c.name === NAME).forEach((c) => {
    c.traverse((o) => {
      const m = o as THREE.Mesh;
      m.geometry?.dispose();
      (m.material as THREE.Material | undefined)?.dispose();
    });
    c.removeFromParent();
  });
  room.invalidate();
}

const std = (color: string, extra: Partial<THREE.MeshStandardMaterialParameters> = {}) => new THREE.MeshStandardMaterial({ color, roughness: 0.7, metalness: 0.05, ...extra });

/** Props are placed relative to where the patient starts (`origin`: world x and z). */
export function addProps(room: ExamRoom, props: Prop[] | undefined, origin: { x: number; z: number } = { x: 0, z: 0 }) {
  clearProps(room);
  for (const prop of props ?? []) {
    const group = new THREE.Group();
    group.name = NAME;
    const [x, y, z] = prop.at ?? [0, 0, 0];
    const size = prop.size ?? 1;
    if (prop.kind === "chair") {
      const seat = new THREE.Mesh(new THREE.BoxGeometry(0.42, 0.04, 0.42), std("#1d4f7c"));
      seat.position.set(0, 0.46, 0);
      const back = new THREE.Mesh(new THREE.BoxGeometry(0.42, 0.42, 0.035), std("#1d4f7c"));
      back.position.set(0, 0.7, -0.2);
      group.add(seat, back);
      for (const dx of [-0.19, 0.19]) for (const dz of [-0.19, 0.19]) {
        const leg = new THREE.Mesh(new THREE.CylinderGeometry(0.015, 0.015, 0.44, 8), std("#b9c3cc", { metalness: 0.6, roughness: 0.4 }));
        leg.position.set(dx, 0.22, dz);
        group.add(leg);
      }
    } else if (prop.kind === "wall") {
      const wall = new THREE.Mesh(new THREE.BoxGeometry(1.4 * size, 2.2, 0.04), std("#f1f5f8", { roughness: 0.9 }));
      wall.position.set(0, 1.1, 0);
      group.add(wall);
    } else if (prop.kind === "foam") {
      const foam = new THREE.Mesh(new THREE.BoxGeometry(0.5 * size, 0.08, 0.45 * size), std("#2ee6d6", { roughness: 0.95, transparent: true, opacity: 0.85 }));
      foam.position.set(0, 0.04, 0);
      group.add(foam);
    } else if (prop.kind === "block") {
      const block = new THREE.Mesh(new THREE.BoxGeometry(0.3, 0.02 * size, 0.3), std("#ffc65c"));
      block.position.set(0, 0.01 * size, 0);
      group.add(block);
    } else if (prop.kind === "cones") {
      for (const dz of [-1.5 * size, 1.5 * size]) {
        const cone = new THREE.Mesh(new THREE.ConeGeometry(0.07, 0.2, 16), std("#ff7a3d"));
        cone.position.set(0, 0.1, dz);
        group.add(cone);
      }
    } else if (prop.kind === "cane") {
      const cane = new THREE.Mesh(new THREE.CylinderGeometry(0.02, 0.02, 0.9 * size, 12), std("#ffb02e", { roughness: 0.45, emissive: "#ff9d00", emissiveIntensity: 0.25 }));
      cane.rotation.x = Math.PI / 2;
      cane.position.set(0, 0.02, 0);
      group.add(cane);
    } else if (prop.kind === "walkway") {
      const half = 1.6 * size;
      const strip = new THREE.Mesh(new THREE.BoxGeometry(0.5, 0.006, half * 2), new THREE.MeshBasicMaterial({ color: "#2ee6d6", transparent: true, opacity: 0.28 }));
      strip.position.set(0, 0.004, 0);
      group.add(strip);
      for (let k = -4; k <= 4; k++) {
        const tick = new THREE.Mesh(new THREE.BoxGeometry(0.62, 0.008, 0.012), new THREE.MeshBasicMaterial({ color: "#2ee6d6" }));
        tick.position.set(0, 0.006, (k / 4) * half);
        group.add(tick);
      }
    }
    group.position.set(origin.x + x, y, origin.z + z);
    if (prop.rot) group.rotation.y = (prop.rot * Math.PI) / 180;
    room.extras.add(group);
  }
  room.invalidate();
}
