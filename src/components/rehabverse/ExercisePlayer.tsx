"use client";

/**
 * RehabVerse 3D exercise demonstration. The PNA virtual physiotherapist guide performs the real
 * movement (poses over time on the Virtual Patient model): starting position, controlled movement,
 * end position, return, with views, slow motion, replay, optional "common mistake" and subtitles.
 * Reuses the shared exam-room engine (one patient model per page).
 */
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import * as THREE from "three";
import { speakText, supportsSpeech } from "@/lib/speech/voices";
import { AlertTriangle, Pause, Play, RotateCcw, Volume2, VolumeX } from "lucide-react";
import type { ExamRoom, Side } from "@/lib/virtual-patient/engine";
import { claimRoom, releaseRoom, shared, type Owner } from "@/lib/virtual-patient/shared-room";
import { buildCycle, sampleCycle, type Segment } from "@/lib/rehabverse/motion";
import type { ExerciseDef, Motion, View } from "@/lib/rehabverse/types";
import { P } from "@/lib/virtual-patient/parts";

export type Lang = "en" | "ru";

const VIEW_DIRS: Record<View, [number, number, number]> = {
  front: [0, 0.14, 1],
  side: [1, 0.14, 0],
  back: [0, 0.14, -1],
  angle: [0.72, 0.3, 0.78],
  feet: [0.1, -1, 0.42],
};
const VIEW_LABEL: Record<View, { en: string; ru: string }> = {
  front: { en: "Front", ru: "Samne" },
  side: { en: "Side", ru: "Side" },
  back: { en: "Back", ru: "Peeche" },
  angle: { en: "3/4", ru: "3/4" },
  feet: { en: "Feet end", ru: "Paon ki taraf" },
};
const PLINTH_TOP = 0.66;
const MAT_TOP = 0.018;

const text = (lang: Lang, value: { en: string; ru: string }) => (lang === "ru" ? value.ru : value.en);

const DEFAULT_LINES = {
  start: { en: "Get into the starting position.", ru: "Pehle starting position mein aa jayein." },
  move: { en: "Move slowly and with control.", ru: "Aahista aahista, control ke saath harkat karein." },
  hold: { en: "Hold it steady.", ru: "Is position ko stable rakhein." },
  return: { en: "Come back slowly — do not drop.", ru: "Aahista wapis aayein — jhatka na dein." },
  rest: { en: "Relax, then go again.", ru: "Thora relax karein, phir dobara." },
};
const BREATH_LABEL = {
  in: { en: "Breathe in", ru: "Saans andar lein" },
  out: { en: "Breathe out", ru: "Saans bahar chhodein" },
  hold: { en: "Breathe normally", ru: "Normal saans lete rahein" },
};

function dirInPatientFrame(room: ExamRoom, local: [number, number, number], side: Side) {
  const sign = side === "left" ? 1 : -1;
  return new THREE.Vector3(local[0] * sign, local[1], local[2]).applyQuaternion(room.patientRoot.quaternion).normalize();
}

/** Where a focus spec points: a bone ("hip"), "a+b" (midpoint) or "@landmark". */
function focusPoint(room: ExamRoom, spec: string | undefined, side: Side): THREE.Vector3 | null {
  if (!spec) return null;
  const one = (name: string) => {
    if (name.startsWith("@")) {
      try {
        return room.landmarkWorld(name.slice(1), side);
      } catch {
        return null;
      }
    }
    const [bone, flag] = name.split(":");
    return room.boneWorld(bone, flag === "o" ? (side === "left" ? "right" : "left") : side);
  };
  if (spec.includes("+")) {
    const [a, b] = spec.split("+");
    const pa = one(a);
    const pb = one(b);
    return pa && pb ? pa.lerp(pb, 0.5) : null;
  }
  return one(spec);
}

type Rig = {
  segments: Segment[];
  /** Applies a pose and keeps the body planted / resting on its surface. */
  apply: (pose: ReturnType<typeof sampleCycle>["pose"]) => void;
  frame: (view: View) => void;
  /** Moves the props, glow and arrows for the current moment. */
  update: (kind: Segment["kind"], f: number) => void;
  dispose: () => void;
};

/** Builds the 3D set for one exercise: position, props, ground/anchor solver and camera framing. */
function buildRig(room: ExamRoom, exercise: ExerciseDef, side: Side, faulty: boolean): Rig {
  const motion: Motion = exercise.motion;
  const moves = faulty && motion.mistake ? motion.mistake.moves : motion.moves;
  const startParts = faulty && motion.mistake?.start ? { ...motion.start, ...motion.mistake.start } : motion.start;
  const segments = buildCycle({ ...motion, start: startParts }, side, moves);
  const pos = motion.position;
  const lying = pos === "supine" || pos === "prone" || pos === "sidelying" || pos === "quadruped";
  const engineMode = pos === "quadruped" ? "prone" : pos === "kneeling" ? "standing" : pos;
  const surface = motion.surface ?? (pos === "sitting" ? "plinth" : "floor");
  const onPlinth = surface === "plinth" && (pos === "supine" || pos === "prone" || pos === "sidelying" || pos === "sitting");
  const surfaceY = onPlinth ? PLINTH_TOP : lying || pos === "kneeling" ? MAT_TOP : 0;

  const group = new THREE.Group();
  group.name = "rv-props";
  room.extras.add(group);
  const plinth = room.scene.getObjectByName("plinth");
  if (plinth) plinth.visible = onPlinth;
  const updaters: (() => void)[] = [];
  const disposables: { dispose(): void }[] = [];
  const mesh = (geometry: THREE.BufferGeometry, colour: string, rough = 0.85) => {
    const material = new THREE.MeshStandardMaterial({ color: colour, roughness: rough });
    disposables.push(geometry, material);
    const m = new THREE.Mesh(geometry, material);
    m.castShadow = true;
    m.receiveShadow = true;
    group.add(m);
    return m;
  };

  // Position the guide (engine placement), then pose 0 and settle onto the surface.
  room.setCasePosture(undefined);
  const down: Side | undefined = engineMode === "sidelying" ? (side === "left" ? "right" : "left") : undefined;
  room.setPosition(engineMode, false, down ? { down } : {});
  const root = room.patientRoot;
  const pose0 = segments[0].from;
  const apply = (pose: Rig["segments"][number]["from"]) => {
    room.setPose(pose, { animate: false, replace: true });
    solve();
  };

  const anchorSpec = motion.anchor === false ? null : motion.anchor ?? (pos === "standing" ? { bone: "foot", stance: "both" as const } : null);
  const anchorBone = anchorSpec?.bone ?? "foot";
  const other: Side = side === "left" ? "right" : "left";
  const anchorSides: Side[] = !anchorSpec ? [] : anchorSpec.stance === "tested" ? [side] : anchorSpec.stance === "other" ? [other] : [side, other];
  const anchorPoint = () => {
    const p = new THREE.Vector3();
    anchorSides.forEach((s) => p.add(room.boneWorld(anchorBone, s)));
    return p.multiplyScalar(1 / Math.max(1, anchorSides.length));
  };
  let a0: THREE.Vector3 | null = null;
  function settleY() {
    root.updateMatrixWorld(true);
    const box = room.bounds();
    root.position.y += surfaceY - box.min.y;
    root.updateMatrixWorld(true);
  }
  function solve() {
    if (a0 && anchorSides.length) {
      const p = anchorPoint();
      root.position.x += a0.x - p.x;
      root.position.z += a0.z - p.z;
      root.position.y += a0.y - p.y;
      root.updateMatrixWorld(true);
    } else if ((lying || pos === "kneeling") && motion.settle !== "start") {
      settleY();
    }
  }

  room.setPose(pose0, { animate: false, replace: true });
  if (motion.shift) {
    root.position.addScaledVector(new THREE.Vector3(0, -1, 0).applyQuaternion(root.quaternion), motion.shift);
    root.updateMatrixWorld(true);
  }
  settleY();
  if (motion.raise) {
    root.position.y += motion.raise;
    root.updateMatrixWorld(true);
  }
  a0 = anchorSides.length ? anchorPoint() : null;

  // Props.
  const front = new THREE.Vector3(0, 0, 1).applyQuaternion(root.quaternion);
  const rootPos = room.boneWorld("root");
  const lateral = (s: number) => new THREE.Vector3(s * (side === "left" ? 1 : -1), 0, 0).applyQuaternion(root.quaternion);
  if (lying) {
    const box = room.bounds();
    const mat = mesh(new THREE.BoxGeometry(0.64, 0.016, 1.8), "#0db3aa", 0.7);
    mat.position.set((box.min.x + box.max.x) / 2, 0.008, (box.min.z + box.max.z) / 2);
    mat.visible = !onPlinth;
  } else if (pos === "kneeling") {
    const mat = mesh(new THREE.BoxGeometry(0.62, 0.016, 0.9), "#0db3aa", 0.7);
    mat.position.set(rootPos.x, 0.008, rootPos.z);
  }
  for (const prop of motion.props ?? []) {
    if (prop.kind === "wall") {
      const wall = mesh(new THREE.BoxGeometry(2.4, 2.4, 0.05), "#dbe5ec", 0.95);
      const facing = prop.at === "front" ? 1 : -1;
      const plane = rootPos.clone().addScaledVector(front, facing * ((prop.at === "front" ? 0.1 : 0.12) + (prop.gap ?? 0.08)));
      wall.position.set(plane.x, 1.2, plane.z).addScaledVector(front, facing * 0.025);
      wall.quaternion.setFromUnitVectors(new THREE.Vector3(0, 0, 1), front);
    } else if (prop.kind === "step") {
      const foot = room.boneWorld("foot", side);
      const height = prop.height > 0 ? prop.height : motion.raise ?? Math.max(0.04, foot.y - 0.068);
      const box = mesh(new THREE.BoxGeometry(0.55, height, 0.32), "#b9c6d1", 0.8);
      const centre = foot.clone().addScaledVector(front, 0.04 + (prop.gap ?? 0));
      if (prop.at === "side") centre.addScaledVector(lateral(1), -0.0);
      box.position.set(centre.x, height / 2, centre.z);
      box.quaternion.copy(root.quaternion);
    } else if (prop.kind === "table") {
      const top = prop.height ?? 0.78;
      const slab = mesh(new THREE.BoxGeometry(0.9, 0.04, 0.5), "#c9a46e", 0.7);
      const centre = rootPos.clone().addScaledVector(front, prop.reach ?? 0.5);
      slab.position.set(centre.x, top, centre.z);
      slab.quaternion.copy(root.quaternion);
      for (const sx of [-1, 1]) {
        const leg = mesh(new THREE.BoxGeometry(0.05, top - 0.02, 0.45), "#8d9aa6", 0.5);
        leg.position.set(centre.x, (top - 0.02) / 2, centre.z).addScaledVector(new THREE.Vector3(sx * 0.4, 0, 0).applyQuaternion(root.quaternion), 1);
        leg.quaternion.copy(root.quaternion);
      }
    } else if (prop.kind === "bolster") {
      const bolster = mesh(new THREE.CylinderGeometry(0.085, 0.085, 0.3, 18), "#1f6f8b", 0.8);
      const knee = room.boneWorld("lowerleg01", side);
      bolster.position.set(knee.x, knee.y - 0.08, knee.z + 0.005);
      bolster.quaternion.copy(root.quaternion).multiply(new THREE.Quaternion().setFromAxisAngle(new THREE.Vector3(0, 0, 1), Math.PI / 2));
    } else if (prop.kind === "wand") {
      const wand = mesh(new THREE.CylinderGeometry(0.014, 0.014, 1, 10), "#c9a46e", 0.6);
      updaters.push(() => {
        const a = room.boneWorld("wrist", "left");
        const b = room.boneWorld("wrist", "right");
        const delta = b.clone().sub(a);
        wand.position.copy(a).addScaledVector(delta, 0.5);
        wand.scale.set(1, delta.length() + 0.5, 1);
        wand.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), delta.clone().normalize());
      });
    } else if (prop.kind === "chair") {
      const seatY = room.landmarkWorld("ischial-tuberosity", "left").y - 0.004;
      const chair = new THREE.Group();
      group.add(chair);
      const wood = "#c9a46e";
      const seat = mesh(new THREE.BoxGeometry(0.44, 0.04, 0.44), wood, 0.7);
      seat.position.set(0, seatY - 0.02, 0);
      const back = mesh(new THREE.BoxGeometry(0.44, 0.42, 0.03), wood, 0.7);
      back.position.set(0, seatY + 0.21, -0.215);
      for (const sx of [-1, 1]) for (const sz of [-1, 1]) {
        const leg = mesh(new THREE.BoxGeometry(0.04, seatY - 0.04, 0.04), "#8d9aa6", 0.5);
        leg.position.set(sx * 0.19, (seatY - 0.04) / 2, sz * 0.19);
        chair.add(leg);
      }
      chair.add(seat, back);
      chair.position.set(rootPos.x, 0, rootPos.z).addScaledVector(front, -0.06);
      chair.quaternion.copy(root.quaternion);
    } else if (prop.kind === "weight") {
      const dumbbell = new THREE.Group();
      group.add(dumbbell);
      const bar = mesh(new THREE.CylinderGeometry(0.01, 0.01, 0.13, 10), "#6b7782", 0.4);
      bar.rotation.z = Math.PI / 2;
      const a = mesh(new THREE.SphereGeometry(0.03, 14, 10), "#1f2d3d", 0.5);
      const b = mesh(new THREE.SphereGeometry(0.03, 14, 10), "#1f2d3d", 0.5);
      a.position.x = -0.065;
      b.position.x = 0.065;
      dumbbell.add(bar, a, b);
      updaters.push(() => {
        const at = prop.at === "wrist" ? room.boneWorld("finger3-1", side) : room.boneWorld("foot", side).addScaledVector(front, 0.1);
        dumbbell.position.copy(at);
        dumbbell.quaternion.copy(root.quaternion);
      });
    } else if (prop.kind === "ball") {
      if (prop.at === "knees") {
        const ball = mesh(new THREE.SphereGeometry(0.085, 20, 16), "#e5484d", 0.6);
        updaters.push(() => ball.position.copy(room.boneWorld("lowerleg01", "left")).lerp(room.boneWorld("lowerleg01", "right"), 0.5));
      } else {
        const ball = mesh(new THREE.SphereGeometry(0.037, 18, 14), "#e5484d", 0.6);
        updaters.push(() => {
          const medial = new THREE.Vector3(side === "left" ? -1 : 1, 0, 0).applyQuaternion(root.quaternion);
          ball.position.copy(room.boneWorld("wrist", side)).lerp(room.boneWorld("finger3-1", side), 0.7).addScaledVector(medial, 0.045);
        });
      }
    } else if (prop.kind === "roller") {
      const roller = mesh(new THREE.CylinderGeometry(0.075, 0.075, 0.5, 20), "#1f6f8b", 0.7);
      const target = room.boneWorld(prop.along === "thoracic" ? "spine03" : "spine05");
      const back = new THREE.Vector3(0, 0, -1).applyQuaternion(root.quaternion);
      roller.position.copy(target).addScaledVector(back, 0.1);
      roller.quaternion.copy(root.quaternion).multiply(new THREE.Quaternion().setFromAxisAngle(new THREE.Vector3(0, 0, 1), Math.PI / 2));
    } else if (prop.kind === "band") {
      const sides: Side[] = prop.both ? [side, other] : [side];
      for (const s of sides) {
        const attach = () => (prop.from === "wrist" ? room.boneWorld("wrist", s) : prop.from === "ankle" ? room.boneWorld("foot", s) : prop.from === "knee" ? room.boneWorld("lowerleg01", s) : room.boneWorld("upperleg01", s).lerp(room.boneWorld("lowerleg01", s), 0.8));
        const start = attach();
        const lat = new THREE.Vector3(prop.anchor[0] * (s === "left" ? 1 : -1), prop.anchor[1], prop.anchor[2]);
        const anchor = start.clone().add(lat.applyQuaternion(root.quaternion));
        const tube = mesh(new THREE.CylinderGeometry(0.006, 0.006, 1, 8), "#e5484d", 0.5);
        const knob = mesh(new THREE.SphereGeometry(0.02, 12, 10), "#3a4756", 0.5);
        knob.position.copy(anchor);
        updaters.push(() => {
          const from = attach();
          const delta = anchor.clone().sub(from);
          tube.position.copy(from).addScaledVector(delta, 0.5);
          tube.scale.set(1, Math.max(0.01, delta.length()), 1);
          tube.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), delta.clone().normalize());
        });
      }
    } else if (prop.kind === "towel") {
      const towel = mesh(new THREE.BoxGeometry(0.34, 0.012, 0.5), "#f4f7fa", 0.95);
      const foot = room.boneWorld("foot", side);
      towel.position.set(foot.x, 0.007, foot.z + 0.12);
    }
  }
  updaters.forEach((u) => u());

  // Working muscles glow; force / resistance arrows point the way.
  const glowSides: Side[] = motion.glow ? (motion.glow.sides === "tested" ? [side] : motion.glow.sides === "other" ? [other] : [side, other]) : [];
  const glows: { mesh: THREE.Mesh; bone: string; side: Side }[] = [];
  for (const bone of motion.glow?.bones ?? []) {
    for (const s of glowSides) {
      const material = new THREE.MeshBasicMaterial({ color: "#12c4b4", transparent: true, opacity: 0, depthWrite: false });
      const radius = /^upperleg/.test(bone) ? 0.1 : /^lowerleg|^foot/.test(bone) ? 0.075 : /^spine/.test(bone) ? 0.15 : /^upperarm/.test(bone) ? 0.062 : /^lowerarm|^wrist/.test(bone) ? 0.052 : /^neck|^head/.test(bone) ? 0.07 : 0.06;
      const geometry = new THREE.CapsuleGeometry(radius, 1, 6, 14);
      disposables.push(geometry, material);
      const glow = new THREE.Mesh(geometry, material);
      glow.renderOrder = 5;
      group.add(glow);
      glows.push({ mesh: glow, bone, side: s });
    }
  }
  const arrows = (motion.arrows ?? []).map((a) => {
    const arrow = new THREE.ArrowHelper(new THREE.Vector3(0, 1, 0), new THREE.Vector3(), 0.3, 0xf5c542, 0.09, 0.07);
    arrow.visible = false;
    group.add(arrow);
    disposables.push({ dispose: () => { arrow.line.geometry.dispose(); (arrow.line.material as THREE.Material).dispose(); arrow.cone.geometry.dispose(); (arrow.cone.material as THREE.Material).dispose(); } });
    return { arrow, spec: a };
  });
  const update = (kind: Segment["kind"], f: number) => {
    updaters.forEach((u) => u());
    const strength = kind === "hold" ? 0.4 + 0.12 * Math.sin(performance.now() / 180) : kind === "move" ? 0.1 + 0.28 * f : kind === "return" ? 0.2 * (1 - f) : 0;
    for (const g of glows) {
      const head = room.boneWorld(g.bone, g.side);
      const tail = room.boneEnd(g.bone, g.side);
      const delta = tail.clone().sub(head);
      const length = Math.max(0.05, delta.length() - 0.1);
      g.mesh.position.copy(head).addScaledVector(delta, 0.5);
      g.mesh.scale.set(1, length, 1);
      g.mesh.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), delta.clone().normalize());
      (g.mesh.material as THREE.MeshBasicMaterial).opacity = strength;
    }
    for (const { arrow, spec } of arrows) {
      const on = spec.when === "always" || (spec.when === "move" ? kind === "move" : kind === "hold" || (spec.when === undefined && kind === "move"));
      arrow.visible = on;
      if (!on) continue;
      const s = spec.side === "other" ? other : side;
      const sign = s === "left" ? 1 : -1;
      const dir = new THREE.Vector3(spec.dir[0] * sign, spec.dir[1], spec.dir[2]).applyQuaternion(root.quaternion).normalize();
      const length = 0.28 + 0.05 * Math.sin(performance.now() / 160);
      arrow.position.copy(room.boneWorld(spec.bone, s)).addScaledVector(dir, -length - 0.03);
      arrow.setDirection(dir);
      arrow.setLength(length, 0.09, 0.07);
    }
  };

  const dispose = () => {
    group.removeFromParent();
    disposables.forEach((d) => d.dispose());
    if (plinth) plinth.visible = true;
  };

  // Camera: frame everything the body does across a cycle, from the chosen view.
  const frame = (view: View) => {
    const box = new THREE.Box3();
    const samples = 14;
    const total = segments.reduce((sum, s) => sum + s.ms, 0);
    for (let i = 0; i <= samples; i++) {
      const state = sampleCycle(segments, (i / samples) * total * 0.999);
      room.setPose(state.pose, { animate: false, replace: true });
      solve();
      box.union(room.bounds());
    }
    room.setPose(pose0, { animate: false, replace: true });
    solve();
    updaters.forEach((u) => u());
    const centre = box.getCenter(new THREE.Vector3());
    const point = focusPoint(room, motion.focus, side);
    if (point) centre.lerp(point, motion.close ? 1 : 0.35);
    const radius = box.getBoundingSphere(new THREE.Sphere()).radius;
    const vfov = (room.camera.fov * Math.PI) / 180;
    const hfov = 2 * Math.atan(Math.tan(vfov / 2) * room.camera.aspect);
    const distance = motion.close ?? Math.max(1.25, (radius / Math.sin(Math.min(vfov, hfov) / 2)) * 1.02 * (motion.zoom ?? 1));
    const dir = dirInPatientFrame(room, VIEW_DIRS[view], side);
    if (dir.y < 0.08) dir.setY(0.08).normalize();
    room.frameCamera(false, centre, distance, dir);
  };

  return { segments, apply, frame, update, dispose };
}

export type ExercisePlayerProps = {
  exercise: ExerciseDef;
  lang: Lang;
  side?: Side;
  /** Number of repetitions shown in the counter (defaults to the exercise's dosage). */
  reps?: number;
  autoPlay?: boolean;
  onFail?: () => void;
  className?: string;
};

export default function ExercisePlayer({ exercise, lang, side: sideProp, reps, autoPlay = true, onFail, className }: ExercisePlayerProps) {
  const hostRef = useRef<HTMLDivElement>(null);
  const roomRef = useRef<ExamRoom | null>(null);
  const rigRef = useRef<Rig | null>(null);
  const [status, setStatus] = useState<"idle" | "loading" | "active">("idle");
  const [progress, setProgress] = useState(shared.progress);
  const [side, setSide] = useState<Side>(sideProp ?? "right");
  const [view, setView] = useState<View>(exercise.motion.view ?? "angle");
  const [playing, setPlaying] = useState(autoPlay);
  const [speed, setSpeed] = useState(1);
  const [showMistake, setShowMistake] = useState(false);
  const [voice, setVoice] = useState(false);
  const [line, setLine] = useState<string>("");
  const [breath, setBreath] = useState<"in" | "out" | "hold" | null>(null);
  const [rep, setRep] = useState(1);
  const clock = useRef({ elapsed: 0, last: 0 });
  const speakingRef = useRef(false);
  const ownerRef = useRef<Owner>({ lost: () => undefined, reload: () => undefined, activate: () => undefined, isVisible: () => true, hasRoom: () => roomRef.current !== null });
  const lang_ = useRef(lang);
  lang_.current = lang;

  useEffect(() => setSide(sideProp ?? "right"), [sideProp]);

  const activate = useCallback(() => {
    const host = hostRef.current;
    if (!host) return;
    setStatus("loading");
    const listener = (p: number) => setProgress(p);
    shared.listeners.add(listener);
    claimRoom(host, ownerRef.current, "stage")
      .then((room) => {
        shared.listeners.delete(listener);
        if (shared.owner !== ownerRef.current) return;
        roomRef.current = room;
        if (process.env.NODE_ENV !== "production") (window as unknown as { __pnaRvRoom?: ExamRoom }).__pnaRvRoom = room;
        room.setOutfit("scrubs");
        setStatus("active");
      })
      .catch(() => {
        shared.listeners.delete(listener);
        onFail?.();
      });
  }, [onFail]);

  ownerRef.current.lost = () => {
    rigRef.current?.dispose();
    rigRef.current = null;
    roomRef.current = null;
    setStatus("idle");
  };
  ownerRef.current.reload = () => {
    rigRef.current = null;
    roomRef.current = null;
    if (shared.losses > 2) onFail?.();
    else ownerRef.current.activate();
  };
  ownerRef.current.activate = activate;

  useEffect(() => {
    const owner = ownerRef.current;
    activate();
    return () => {
      rigRef.current?.dispose();
      rigRef.current = null;
      releaseRoom(owner);
    };
  }, [activate]);

  useEffect(() => {
    if (typeof window !== "undefined" && window.matchMedia?.("(prefers-reduced-motion: reduce)").matches) setPlaying(false);
  }, []);

  // Development hook for visual checks: freeze the movement at any moment.
  useEffect(() => {
    if (process.env.NODE_ENV === "production") return;
    (window as unknown as Record<string, unknown>).__rvPlayer = {
      seek: (ms: number) => {
        clock.current.elapsed = ms;
        setPlaying(false);
      },
      cycle: () => (rigRef.current ? rigRef.current.segments.map((seg) => ({ kind: seg.kind, ms: seg.ms })) : []),
    };
  });

  // Build the set whenever the exercise, side or version (correct / mistake) changes.
  useEffect(() => {
    const room = roomRef.current;
    if (status !== "active" || !room) return;
    rigRef.current?.dispose();
    const rig = buildRig(room, exercise, side, showMistake && Boolean(exercise.motion.mistake));
    rigRef.current = rig;
    rig.frame(view);
    clock.current = { elapsed: 0, last: performance.now() };
    setRep(1);
    return () => {
      rig.dispose();
      if (rigRef.current === rig) rigRef.current = null;
    };
    // The view has its own effect so changing it does not restart the movement.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [status, exercise, side, showMistake]);

  useEffect(() => {
    rigRef.current?.frame(view);
  }, [view]);

  // Animation loop.
  useEffect(() => {
    const room = roomRef.current;
    if (status !== "active" || !room) return;
    let raf = 0;
    let lastLine = "";
    let lastBreath: "in" | "out" | "hold" | null = null;
    let lastRep = 1;
    clock.current.last = performance.now();
    const tick = (now: number) => {
      raf = requestAnimationFrame(tick);
      const rig = rigRef.current;
      if (!rig) return;
      const dt = now - clock.current.last;
      clock.current.last = now;
      if (playing) clock.current.elapsed += dt * speed;
      const state = sampleCycle(rig.segments, clock.current.elapsed);
      rig.apply(state.pose);
      rig.update(state.segment.kind, state.f);
      // Guide: breathing sway while idle, a nod and mouth movement when speaking.
      const t = now / 1000;
      const speaking = speakingRef.current;
      room.setFace({ jaw: speaking ? 0.22 + 0.22 * Math.abs(Math.sin(t * 11)) : 0, smile: speaking ? 0.5 : 0.28 });
      // Subtitle for the current stage.
      const segment = state.segment;
      const base = segment.say ?? (segment.kind === "move" ? DEFAULT_LINES.move : segment.kind === "hold" ? DEFAULT_LINES.hold : segment.kind === "return" ? DEFAULT_LINES.return : DEFAULT_LINES.rest);
      const nextLine = text(lang_.current, base);
      if (nextLine !== lastLine) {
        lastLine = nextLine;
        setLine(nextLine);
      }
      const nextBreath = segment.kind === "rest" ? null : segment.breath ?? (segment.kind === "return" ? "in" : null);
      if (nextBreath !== lastBreath) {
        lastBreath = nextBreath;
        setBreath(nextBreath);
      }
      if (state.rep + 1 !== lastRep) {
        lastRep = state.rep + 1;
        setRep(lastRep);
      }
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [status, playing, speed, exercise, side, showMistake]);

  // Optional spoken guidance: English voice, or a Hindi/Urdu voice for Roman Urdu when the device has one (subtitles always stay).
  useEffect(() => {
    if (!voice || !line || !supportsSpeech()) {
      speakingRef.current = false;
      return;
    }
    let cancelled = false;
    let playback: { cancel: () => void } | null = null;
    void speakText(line, lang === "ru" ? "ur" : "en", {
      rate: 0.98,
      isCurrent: () => !cancelled,
      onStart: () => (speakingRef.current = true),
      onEnd: () => (speakingRef.current = false),
    }).then((p) => {
      if (cancelled) p?.cancel();
      else playback = p;
    });
    return () => {
      cancelled = true;
      speakingRef.current = false;
      playback?.cancel();
      window.speechSynthesis.cancel();
    };
  }, [voice, line, lang]);

  const replay = () => {
    clock.current.elapsed = 0;
    setPlaying(true);
  };
  const reps_ = reps ?? exercise.dosage.reps;
  const hasMistake = Boolean(exercise.motion.mistake);
  const lyingDown = ["supine", "prone", "sidelying", "quadruped"].includes(exercise.motion.position);
  const views = useMemo(() => (Object.keys(VIEW_LABEL) as View[]).filter((v) => v !== "feet" || lyingDown), [lyingDown]);
  const title = text(lang, exercise.name);

  return (
    <figure className={"overflow-hidden rounded-3xl border border-slate-200 bg-[#e8eef3] shadow-[0_24px_60px_-40px_rgba(10,60,90,0.5)] " + (className ?? "")} data-rv-player={exercise.id}>
      <div className="relative aspect-[4/3] w-full sm:aspect-[16/10]">
        <div ref={hostRef} className="absolute inset-0" role="img" aria-label={`3D physiotherapist demonstrating ${exercise.name.en}`} />
        {status !== "active" ? (
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 bg-[#e8eef3]" role="status">
            <span className="text-sm font-bold text-navy-800">{lang === "ru" ? "Physio guide aa rahi hai…" : "Bringing in your physio guide…"} {Math.round(progress * 100)}%</span>
            <span className="h-1.5 w-40 overflow-hidden rounded-full bg-white">
              <span className="block h-full rounded-full bg-teal-500 transition-[width]" style={{ width: `${Math.max(6, progress * 100)}%` }} />
            </span>
          </div>
        ) : (
          <>
            <div className="pointer-events-none absolute left-2.5 top-2.5 max-w-[68%] rounded-2xl bg-white/90 px-3 py-1.5 shadow-sm">
              <p className="text-[10px] font-extrabold uppercase tracking-[0.12em] text-teal-700">
                {showMistake && hasMistake ? (lang === "ru" ? "Aam ghalti" : "Common mistake") : lang === "ru" ? "Sahi tareeqa" : "Correct technique"}
              </p>
              <p className="text-sm font-bold leading-5 text-navy-800">{title}</p>
            </div>
            <div className="pointer-events-none absolute right-2.5 top-2.5 flex flex-col items-end gap-1.5">
              {reps_ ? <span className="rounded-full bg-[#0a1f3d]/90 px-2.5 py-1 text-xs font-bold text-white">{lang === "ru" ? "Rep" : "Rep"} {Math.min(rep, reps_)}/{reps_}</span> : null}
              {breath ? <span className="rounded-full bg-white/90 px-2.5 py-1 text-[11px] font-bold text-teal-800">{text(lang, BREATH_LABEL[breath])}</span> : null}
            </div>
            {showMistake && hasMistake ? (
              <p className="pointer-events-none absolute inset-x-2.5 top-16 rounded-xl bg-[#e5484d]/90 px-3 py-1.5 text-xs font-bold text-white shadow">
                <AlertTriangle className="mr-1 inline h-3.5 w-3.5" aria-hidden="true" /> {text(lang, exercise.motion.mistake!.text)}
              </p>
            ) : null}
            <div className="pointer-events-none absolute inset-x-2.5 bottom-2.5 rounded-2xl rounded-bl-sm bg-[#0a1f3d]/90 px-3 py-2 text-[13px] font-semibold leading-5 text-white shadow-lg" aria-live="polite">
              <span className="mr-1 text-teal-300">{lang === "ru" ? "Guide:" : "Guide:"}</span> {line}
            </div>
          </>
        )}
      </div>
      <figcaption className="space-y-2 border-t border-slate-200 bg-white px-2.5 py-2">
        <div className="flex flex-wrap items-center gap-1.5">
          <button type="button" onClick={() => setPlaying((p) => !p)} className="d3-btn" aria-label={playing ? "Pause" : "Play"}>
            {playing ? <Pause className="h-4 w-4" aria-hidden="true" /> : <Play className="h-4 w-4" aria-hidden="true" />}
          </button>
          <button type="button" onClick={replay} className="d3-btn" aria-label="Replay" title="Replay">
            <RotateCcw className="h-4 w-4" aria-hidden="true" />
          </button>
          <div className="inline-flex rounded-full border border-slate-200 p-0.5" role="group" aria-label="Speed">
            {[1, 0.5, 0.25].map((s) => (
              <button key={s} type="button" onClick={() => setSpeed(s)} aria-pressed={speed === s} className={"rounded-full px-2.5 py-1 text-xs font-bold " + (speed === s ? "bg-[#0a1f3d] text-white" : "text-slate-600")}>
                {s === 1 ? "1×" : s === 0.5 ? "½×" : "¼×"}
              </button>
            ))}
          </div>
          <div className="inline-flex rounded-full border border-slate-200 p-0.5" role="group" aria-label="View">
            {views.map((v) => (
              <button key={v} type="button" onClick={() => setView(v)} aria-pressed={view === v} className={"rounded-full px-2.5 py-1 text-xs font-bold " + (view === v ? "bg-[#0a1f3d] text-white" : "text-slate-600")}>
                {text(lang, VIEW_LABEL[v])}
              </button>
            ))}
          </div>
          {exercise.motion.sided ? (
            <div className="inline-flex rounded-full border border-slate-200 p-0.5" role="group" aria-label="Side">
              {(["left", "right"] as Side[]).map((s) => (
                <button key={s} type="button" onClick={() => setSide(s)} aria-pressed={side === s} className={"rounded-full px-2.5 py-1 text-xs font-bold capitalize " + (side === s ? "bg-[#0a1f3d] text-white" : "text-slate-600")}>
                  {lang === "ru" ? (s === "left" ? "Left" : "Right") : s}
                </button>
              ))}
            </div>
          ) : null}
          {hasMistake ? (
            <button type="button" onClick={() => setShowMistake((m) => !m)} aria-pressed={showMistake} className={"inline-flex items-center gap-1 rounded-full border px-2.5 py-1 text-xs font-bold " + (showMistake ? "border-[#e5484d] bg-[#e5484d] text-white" : "border-slate-200 text-slate-600")}>
              <AlertTriangle className="h-3.5 w-3.5" aria-hidden="true" /> {lang === "ru" ? "Ghalti dekhein" : "Show mistake"}
            </button>
          ) : null}
          {lang === "en" ? (
            <button type="button" onClick={() => setVoice((v) => !v)} aria-pressed={voice} className={"d3-btn ml-auto " + (voice ? "d3-on" : "")} aria-label="Spoken guidance" title="Spoken guidance (English, or Urdu/Hindi voice if your device has one)">
              {voice ? <Volume2 className="h-4 w-4" aria-hidden="true" /> : <VolumeX className="h-4 w-4" aria-hidden="true" />}
            </button>
          ) : null}
        </div>
      </figcaption>
    </figure>
  );
}
