/**
 * The things the PNA Teacher puts on the patient during a treatment (browser only): a hot pack in its towel layers, an ice pack in a
 * damp towel, TENS / IFT / NMES electrodes with their leads running to the unit on the clinic trolley, and the ultrasound head moving
 * in small circles over a layer of gel. Simple shapes, made when needed and disposed after.
 */
import * as THREE from "three";
import { RoundedBoxGeometry } from "three/examples/jsm/geometries/RoundedBoxGeometry.js";
import type { ExamRoom, Side } from "./engine";
import type { PropKind } from "./treatments";
import type { TreatArea } from "./treat-points";
import { CLINIC_SPOTS } from "./clinic";
import { patientDir, resolvePoint } from "../skills/points3d";

type V3 = [number, number, number];

export class TreatProps {
  private group = new THREE.Group();
  private kind: PropKind | null = null;
  private area: TreatArea = "lumbar";
  private side: Side = "left";
  private outward: V3 = [0, 0, 1];
  private along: V3 = [0, 1, 0];
  private items: { obj: THREE.Object3D; at: string; lift: number }[] = [];
  private leads: { mesh: THREE.Mesh; from: string; to: THREE.Vector3; last: THREE.Vector3 }[] = [];
  private probe: THREE.Group | null = null;
  private disposables: { dispose(): void }[] = [];
  private clock = 0;

  constructor(private room: ExamRoom) {
    this.group.name = "vp-treatment-props";
    room.extras.add(this.group);
  }

  /** Shows the props of `kind` on `area` (nothing for null); `outward` and `along` are patient-frame directions with the side already applied. */
  show(kind: PropKind | null, area: TreatArea, side: Side, outward: V3, along: V3) {
    if (kind === this.kind && area === this.area && side === this.side) return;
    this.clear();
    this.kind = kind;
    this.area = area;
    this.side = side;
    this.outward = outward;
    this.along = along;
    if (!kind) return;
    const c = `key:tx-${area}`;
    if (kind === "hotpack") {
      const pack = new THREE.Group();
      const towel = this.mesh(new RoundedBoxGeometry(0.3, 0.04, 0.24, 3, 0.015), "#f4f6f8", 0.95);
      const stripe = this.mesh(new THREE.BoxGeometry(0.3, 0.006, 0.02), "#0db3aa", 0.8);
      stripe.position.set(0, 0.021, 0.08);
      const inner = this.mesh(new RoundedBoxGeometry(0.26, 0.02, 0.19, 2, 0.008), "#b98a56", 0.9);
      inner.position.y = 0.012;
      inner.scale.set(1, 1, 1);
      pack.add(inner, towel, stripe);
      this.add(pack, c, 0.022);
    } else if (kind === "icepack") {
      const pack = new THREE.Group();
      const towel = this.mesh(new RoundedBoxGeometry(0.26, 0.012, 0.2, 2, 0.005), "#cfdde6", 0.95);
      const gel = this.mesh(new RoundedBoxGeometry(0.2, 0.022, 0.14, 3, 0.01), "#4aa8ff", 0.25, { transparent: true, opacity: 0.85 });
      gel.position.y = 0.016;
      pack.add(towel, gel);
      this.add(pack, c, 0.008);
    } else if (kind === "tens" || kind === "ift" || kind === "nmes") {
      const pads = kind === "nmes" ? ["e1", "e2"] : ["e1", "e2", "e3", "e4"];
      const colours = kind === "ift" ? ["#e5484d", "#1f2937", "#3b82f6", "#f8fafc"] : ["#e5484d", "#1f2937", "#e5484d", "#1f2937"];
      const unit = this.unitPoint(0.98);
      pads.forEach((e, i) => {
        const size = kind === "nmes" ? [0.06, 0.09] : [0.045, 0.045];
        const pad = new THREE.Group();
        const body = this.mesh(new RoundedBoxGeometry(size[0], 0.006, size[1], 2, 0.0025), "#3a4350", 0.7);
        const edge = this.mesh(new RoundedBoxGeometry(size[0] + 0.006, 0.003, size[1] + 0.006, 2, 0.0015), "#e9eef3", 0.8);
        edge.position.y = -0.002;
        const snap = this.mesh(new THREE.CylinderGeometry(0.005, 0.005, 0.006, 10), "#c9d1d9", 0.3, { metalness: 0.7 });
        snap.position.y = 0.005;
        pad.add(edge, body, snap);
        const at = `key:tx-${area}-${e}`;
        this.add(pad, at, 0.004);
        this.lead(at, unit, colours[i]);
      });
    } else if (kind === "ultrasound") {
      const gel = this.mesh(new THREE.SphereGeometry(0.045, 20, 10), "#bfe9ff", 0.1, { transparent: true, opacity: 0.45 });
      gel.scale.set(1, 0.12, 1);
      this.add(gel, c, 0.002);
      const probe = new THREE.Group();
      const head = this.mesh(new THREE.CylinderGeometry(0.024, 0.026, 0.02, 24), "#c9d1d9", 0.25, { metalness: 0.8 });
      head.position.y = 0.01;
      const neck = this.mesh(new THREE.CylinderGeometry(0.016, 0.024, 0.03, 20), "#e2e8f0", 0.5);
      neck.position.y = 0.035;
      const handle = this.mesh(new THREE.CylinderGeometry(0.015, 0.016, 0.11, 20), "#1f6f8b", 0.5);
      handle.position.y = 0.1;
      probe.add(head, neck, handle);
      this.group.add(probe);
      this.probe = probe;
      this.lead(c, this.unitPoint(0.5), "#5b6673", true);
    }
    this.update(0);
  }

  /** Follows the patient (and moves the ultrasound head). */
  update(dt: number) {
    if (!this.kind) return;
    this.clock += dt;
    const n = patientDir(this.room, this.outward);
    const a = patientDir(this.room, this.along);
    const zAxis = a.clone().addScaledVector(n, -a.dot(n)).normalize();
    const xAxis = new THREE.Vector3().crossVectors(n, zAxis).normalize();
    const basis = new THREE.Matrix4().makeBasis(xAxis, n, zAxis);
    const q = new THREE.Quaternion().setFromRotationMatrix(basis);
    for (const item of this.items) {
      const p = resolvePoint(this.room, item.at, this.side);
      item.obj.position.copy(p).addScaledVector(n, item.lift);
      item.obj.quaternion.copy(q);
    }
    if (this.probe) {
      const c = resolvePoint(this.room, `key:tx-${this.area}`, this.side);
      const t = this.clock * 2.2;
      const offset = xAxis.clone().multiplyScalar(Math.cos(t) * 0.014).addScaledVector(zAxis, Math.sin(t) * 0.014);
      this.probe.position.copy(c).add(offset).addScaledVector(n, 0.004);
      this.probe.quaternion.copy(q);
    }
    for (const lead of this.leads) {
      const from = lead.from === "probe" && this.probe ? this.probe.position.clone().addScaledVector(n, 0.15) : resolvePoint(this.room, lead.from, this.side).addScaledVector(n, 0.006);
      if (from.distanceTo(lead.last) < 0.004) continue;
      lead.last.copy(from);
      this.buildLead(lead.mesh, from, lead.to, n);
    }
    this.room.invalidate();
  }

  clear() {
    for (const d of this.disposables) d.dispose();
    this.disposables = [];
    this.items = [];
    this.leads = [];
    this.probe = null;
    this.group.clear();
    this.kind = null;
  }

  dispose() {
    this.clear();
    this.group.removeFromParent();
  }

  /* ---------------- helpers ---------------- */

  private mesh(geometry: THREE.BufferGeometry, colour: string, roughness: number, extra: Partial<THREE.MeshStandardMaterialParameters> = {}) {
    const material = new THREE.MeshStandardMaterial({ color: colour, roughness, ...extra });
    this.disposables.push(geometry, material);
    const m = new THREE.Mesh(geometry, material);
    m.castShadow = false;
    return m;
  }

  private add(obj: THREE.Object3D, at: string, lift: number) {
    this.group.add(obj);
    this.items.push({ obj, at, lift });
  }

  /** The front of the stimulator (height 0.98) or the ultrasound unit (0.5) on the trolley. */
  private unitPoint(height: number) {
    const t = CLINIC_SPOTS.trolley;
    return new THREE.Vector3(t.x + 0.12, height, t.z + 0.12);
  }

  private lead(from: string, to: THREE.Vector3, colour: string, probe = false) {
    const material = new THREE.MeshStandardMaterial({ color: colour, roughness: 0.6 });
    this.disposables.push(material);
    const mesh = new THREE.Mesh(new THREE.BufferGeometry(), material);
    this.group.add(mesh);
    this.leads.push({ mesh, from: probe ? "probe" : from, to, last: new THREE.Vector3(1e9, 0, 0) });
  }

  private buildLead(mesh: THREE.Mesh, from: THREE.Vector3, to: THREE.Vector3, n: THREE.Vector3) {
    const lift = from.clone().addScaledVector(n, 0.06);
    const sag = from.clone().lerp(to, 0.55);
    sag.y = Math.min(from.y, to.y) - 0.12;
    const curve = new THREE.CatmullRomCurve3([from, lift, sag, to]);
    mesh.geometry.dispose();
    mesh.geometry = new THREE.TubeGeometry(curve, 32, 0.0028, 6, false);
  }
}

/** A patient-frame direction for the tested side (x points to the tested side's outside). */
export const sided = (v: V3, side: Side): V3 => [side === "left" ? v[0] : -v[0], v[1], v[2]];
