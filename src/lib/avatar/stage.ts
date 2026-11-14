/**
 * The teaching stage (browser only): plays one choreography on the shared 3D patient with Dr. Sajjad beside it. For each step he
 * says the existing lines (voice in English if the browser has one, always subtitles), walks, bends and leans to reach, puts his hands
 * on the patient's landmarks and performs the movement while the Skills Lab overlays mark contact, direction and angles.
 * Pause, replay, step jump, speed and language are controls on this class; the React component only draws what it reports.
 */
import * as THREE from "three";
import type { ExamRoom, Pose } from "@/lib/virtual-patient/engine";
import type { Ctx, Overlay } from "@/lib/skills/scene-types";
import { clearPointCache, patientDir, resolvePoint } from "@/lib/skills/points3d";
import type { BuiltChoreo, BuiltStep, Line, Note } from "./choreo/built";
import type { DrSajjad } from "./teacher";
import { DoctorRig, type WorldHand } from "./rig";
import type { Lang } from "./speech";
import type { Side as ArmSide } from "./ik";

export type StageView = {
  step: number;
  steps: number;
  chip: string;
  lineIndex: number;
  line: Line | null;
  notes: Note[];
  overlays: Overlay[];
  ctx: Ctx;
  /** A step has begun (false until the visitor presses play for the first time). */
  started: boolean;
  playing: boolean;
  done: boolean;
  speaking: boolean;
  /** 0–1 through the whole demonstration. */
  progress: number;
  /** Hands could not reach their targets (metres) — for tests and the log. */
  reachError: number;
};

export type StageOptions = { lang: Lang; voice: boolean; speed: number; light: boolean };

/** Overlays from JSON: labels with {deg} / {m} placeholders become the functions the scene overlay drawer expects. */
function reviveOverlays(list: BuiltStep["overlays"]): Overlay[] {
  return list.map((o) => {
    const label = (o as { label?: unknown }).label;
    if (typeof label === "string" && /\{(deg|m|cm)\}/.test(label)) {
      const fn = (_c: Ctx, n: number) => label.replace("{deg}", String(Math.round(n))).replace("{cm}", String(Math.round(n * 100))).replace("{m}", n.toFixed(2));
      return { ...o, label: fn } as unknown as Overlay;
    }
    return o as unknown as Overlay;
  });
}

const side = (c: BuiltChoreo) => c.side;
const sign = (c: BuiltChoreo) => (c.side === "left" ? 1 : -1);

export class TeachingStage {
  readonly rig: DoctorRig;
  private opt: StageOptions;
  private index = -1;
  private lineIndex = 0;
  private lineToken = 0;
  private linesDone = true;
  private hold = 0;
  private clock = 0;
  private stepClock = 0;
  playing = false;
  done = false;
  private overlays: Overlay[] = [];
  private lastView = 0;
  private glidePhase = 0;
  private disposed = false;
  private stepStandSet = false;

  constructor(
    private room: ExamRoom,
    private doc: DrSajjad,
    private choreo: BuiltChoreo,
    options: StageOptions,
    private onView: (view: StageView) => void,
  ) {
    this.opt = { ...options };
    this.rig = new DoctorRig(doc);
    this.doc.speaker.rate = this.opt.speed;
  }

  /* ---------------- set-up ---------------- */

  /** Poses the patient, places the doctor at his entrance and frames the camera. */
  init() {
    const { room, choreo } = this;
    clearPointCache(room);
    room.setCasePosture(undefined);
    room.setPosition(choreo.position, false);
    room.setPose(choreo.patient, { animate: false, replace: true });
    room.patientRoot.updateMatrixWorld(true);
    const plinth = room.scene.getObjectByName("plinth");
    if (plinth) plinth.visible = true;
    room.scene.add(this.doc.root);
    if (this.opt.light) {
      room.patientRoot.visible = false;
      if (plinth) plinth.visible = false;
      this.rig.place(0, 0.2, Math.PI * 0.12);
      this.rig.update(0.016, 0);
      this.frameLight();
      return;
    }
    const first = choreo.steps.find((s) => s.stand);
    if (first?.stand) {
      const at = this.standPoint(first.stand);
      const lateral = this.lateral(first.stand.side);
      const feet = patientDir(room, [0, -1, 0]).setY(0).normalize();
      const start = at.clone().addScaledVector(lateral, choreo.enter.away).addScaledVector(feet, choreo.enter.towardFeet);
      this.rig.place(start.x, start.z, this.yawToward(start, this.cameraWorld()));
      this.rig.lookAt = this.cameraWorld();
    }
    this.frame();
    this.rig.update(0.016, 0);
  }

  private frameLight() {
    const room = this.room;
    const target = new THREE.Vector3(0, 0.92, 0.2);
    room.frameCamera(false, target, 3.5 * Math.max(1, 1.3 / (room.camera.aspect || 1.6)), new THREE.Vector3(0.25, 0.1, 1).normalize());
  }

  private frame() {
    const { room, choreo } = this;
    const shoulder = resolvePoint(room, "upperarm01", side(choreo));
    const up = new THREE.Vector3(0, 1, 0);
    const centre = shoulder.clone().addScaledVector(this.lateral("tested"), 0.25).addScaledVector(up, 0.32);
    // From the patient's far side and foot end, a little above: the patient in front, Dr. Sajjad facing the camera behind.
    const dir = patientDir(room, [-0.75 * sign(choreo), -0.5, 0.85]).normalize();
    if (dir.y < 0.25) dir.setY(0.25).normalize();
    // Wider views fit with the same distance; a narrower one (a phone held upright) needs to back off.
    const aspect = room.camera.aspect || 1.6;
    room.frameCamera(false, centre, 3.6 * Math.max(1, 1.5 / aspect), dir);
  }

  private cameraWorld() {
    return this.room.camera.position.clone();
  }

  private lateral(which: "tested" | "other") {
    const s = which === "tested" ? sign(this.choreo) : -sign(this.choreo);
    const v = patientDir(this.room, [s, 0, 0]);
    v.y = 0;
    return v.normalize();
  }

  private standPoint(stand: NonNullable<BuiltStep["stand"]>) {
    const p = resolvePoint(this.room, stand.at, side(this.choreo));
    const out = p.clone().addScaledVector(this.lateral(stand.side), stand.distance);
    out.y = 0;
    return out;
  }

  private yawToward(from: THREE.Vector3, to: THREE.Vector3) {
    return Math.atan2(to.x - from.x, to.z - from.z);
  }

  /* ---------------- controls ---------------- */

  start() {
    this.done = false;
    this.playing = true;
    this.goto(0);
  }

  play() {
    if (this.done) return this.restart();
    this.playing = true;
    this.doc.speaker.resume();
  }

  pause() {
    this.playing = false;
    this.doc.speaker.pause();
    this.emit(true);
  }

  restart() {
    this.doc.speaker.cancel();
    this.init();
    this.clock = 0;
    this.start();
  }

  next() {
    if (this.index < this.choreo.steps.length - 1) this.goto(this.index + 1);
  }

  prev() {
    if (this.index > 0) this.goto(this.index - 1);
  }

  setSpeed(speed: number) {
    this.opt.speed = speed;
    this.doc.speaker.rate = speed;
  }

  setLang(lang: Lang) {
    if (lang === this.opt.lang) return;
    this.opt.lang = lang;
    // Say the current line again in the new language.
    this.speakLine(this.lineIndex);
    this.emit(true);
  }

  setVoice(voice: boolean) {
    this.opt.voice = voice;
    if (!voice) this.doc.speaker.cancel();
  }

  /** Jumps to a step: poses the patient and the doctor as that step needs, then speaks. */
  goto(index: number) {
    const { choreo, room } = this;
    if (index < 0 || index >= choreo.steps.length) return;
    this.lineToken++;
    this.doc.speaker.cancel();
    this.index = index;
    this.lineIndex = 0;
    this.stepClock = 0;
    this.done = false;
    this.hold = 0;
    const step = choreo.steps[index];
    this.overlays = reviveOverlays(step.overlays);
    if (this.opt.light) {
      this.rig.gesture = step.gesture ?? "none";
      this.speakLine(0);
      this.emit(true);
      return;
    }
    // Patient pose for this step (earlier steps' poses carry over).
    if (step.patient) void room.setPose(step.patient, { animate: true, duration: 1200 / this.opt.speed });
    // Where he stands.
    if (step.stand) {
      const at = this.standPoint(step.stand);
      const patientPoint = resolvePoint(room, step.stand.at, side(choreo));
      const face = step.stand.face === "patient" ? this.yawToward(at, patientPoint) : this.yawToward(at, this.cameraWorld());
      this.rig.walkTo(at.x, at.z, face);
      this.stepStandSet = true;
    }
    this.rig.gesture = step.gesture ?? "none";
    this.rig.hands = { L: null, R: null };
    this.glidePhase = 0;
    this.configureContacts(step);
    this.speakLine(0);
    this.emit(true);
  }

  /** Hands, lean and crouch for the step. */
  private configureContacts(step: BuiltStep) {
    const rig = this.rig;
    if (!step.contacts?.length) {
      rig.leanTarget = 0;
      rig.crouchTarget = 0;
      return;
    }
    rig.crouchTarget = 0.85;
    // Reach: how far he must lean from where he will be standing.
    const saved = { x: rig.x, z: rig.z, yaw: rig.yaw };
    const stand = step.stand ? this.standPoint(step.stand) : new THREE.Vector3(rig.x, 0, rig.z);
    const yaw = step.stand ? (step.stand.face === "patient" ? this.yawToward(stand, resolvePoint(this.room, step.stand.at, side(this.choreo))) : rig.yaw) : rig.yaw;
    rig.place(stand.x, stand.z, yaw);
    rig.update(0.0001, this.clock);
    const targets: Partial<Record<ArmSide, THREE.Vector3>> = {};
    for (const c of step.contacts) targets[c.hand] = rig.toSpace(resolvePoint(this.room, c.at, side(this.choreo)));
    rig.leanTarget = Math.max(step.lean ?? 0, rig.solveLean(targets, 0.85));
    rig.place(saved.x, saved.z, saved.yaw);
    if (step.stand) rig.walkTo(stand.x, stand.z, yaw);
  }

  private liveHands(step: BuiltStep): { L: WorldHand | null; R: WorldHand | null } {
    const out: { L: WorldHand | null; R: WorldHand | null } = { L: null, R: null };
    for (const c of step.contacts ?? []) {
      out[c.hand] = {
        point: resolvePoint(this.room, c.at, side(this.choreo)),
        palm: patientDir(this.room, c.palm),
        fingers: patientDir(this.room, c.fingers),
        shape: c.shape ?? "flat",
      };
    }
    return out;
  }

  /* ---------------- speech ---------------- */

  private lineText(line: Line) {
    return this.opt.lang === "ur" ? line.ur : line.en;
  }

  private speakLine(i: number) {
    const step = this.choreo.steps[this.index];
    const line = step?.say[i];
    this.lineToken++;
    const token = this.lineToken;
    this.lineIndex = i;
    this.doc.speaker.cancel();
    this.lineToken = token;
    if (!line) {
      this.linesDone = true;
      return;
    }
    this.linesDone = false;
    // The mouth runs even without sound; sound only in English.
    const voice = this.opt.voice && this.opt.lang === "en" && !line.urFallback;
    void this.doc.speaker.speak(this.lineText(line), { lang: this.opt.lang === "ur" && line.urFallback ? "en" : this.opt.lang, voice }).then(() => {
      if (token !== this.lineToken || this.disposed) return;
      if (i + 1 < step.say.length) this.speakLine(i + 1);
      else this.linesDone = true;
    });
  }

  /* ---------------- per frame ---------------- */

  tick(realDt: number) {
    if (this.disposed) return;
    const dt = Math.min(0.05, realDt);
    this.doc.face.update(dt);
    if (!this.playing) {
      if (!this.opt.light) this.rig.update(0, this.clock);
      this.emit(false);
      return;
    }
    const adt = dt * this.opt.speed;
    this.clock += adt;
    this.stepClock += adt;
    this.doc.speaker.tick(dt);
    const step = this.choreo.steps[this.index];
    if (!step) return;

    if (!this.opt.light) {
      // Hands follow their landmarks as the patient moves; the glide pushes the contact and the patient's shoulder a little.
      this.rig.hands = this.liveHands(step);
      this.rig.push.set(0, 0, 0);
      if (step.move && this.rig.hands.R) {
        this.glidePhase += adt * step.move.hz * Math.PI * 2;
        const wave = 0.5 - 0.5 * Math.cos(this.glidePhase);
        const dir = patientDir(this.room, step.move.dir).multiplyScalar((step.move.amplitudeMm / 1000) * wave);
        this.rig.push.copy(dir);
      }
      this.rig.lookAt = this.lookTarget(step);
      this.rig.update(adt, this.clock);
    } else {
      this.rig.lookAt = null;
      this.rig.update(adt, this.clock);
    }
    this.room.invalidate();

    // Advance when he has finished speaking, the body has settled and the hold has passed.
    const settled = this.opt.light ? true : this.rig.settled;
    if (this.linesDone && settled) {
      this.hold += adt;
      if (this.hold >= (step.holdSec ?? 0.6)) {
        if (this.index + 1 < this.choreo.steps.length) this.goto(this.index + 1);
        else {
          this.done = true;
          this.playing = false;
          this.rig.gesture = "none";
          this.emit(true);
        }
      }
    }
    this.emit(false);
  }

  private lookTarget(step: BuiltStep): THREE.Vector3 | null {
    if (step.look === "camera") return this.cameraWorld();
    if (step.look === "patient") return resolvePoint(this.room, "upperarm01{0,0,0.1}", side(this.choreo));
    if (step.look === "hands") return step.contacts?.length ? resolvePoint(this.room, step.contacts[0].at, side(this.choreo)) : null;
    return null;
  }

  private emit(force: boolean) {
    const now = performance.now();
    if (!force && now - this.lastView < 33) return;
    this.lastView = now;
    const step = this.choreo.steps[Math.max(0, this.index)];
    const total = this.choreo.steps.length;
    this.onView({
      step: Math.max(0, this.index),
      steps: total,
      chip: step?.chip ?? "",
      lineIndex: this.lineIndex,
      line: step?.say[this.lineIndex] ?? null,
      notes: step?.notes ?? [],
      overlays: this.overlays,
      ctx: { side: side(this.choreo), u: Math.min(1, (this.index + (this.linesDone ? 1 : this.doc.speaker.progress)) / total), ms: this.clock * 1000, opt: {} },
      started: this.index >= 0,
      playing: this.playing,
      done: this.done,
      speaking: this.doc.speaker.speaking,
      progress: this.index < 0 ? 0 : this.done ? 1 : (this.index + (this.linesDone ? 1 : this.doc.speaker.progress)) / total,
      reachError: this.rig.reachError,
    });
  }

  dispose() {
    this.disposed = true;
    this.lineToken++;
    this.doc.speaker.cancel();
    this.doc.root.removeFromParent();
    this.room.patientRoot.visible = true;
    const plinth = this.room.scene.getObjectByName("plinth");
    if (plinth) plinth.visible = true;
  }
}

export type { Pose };
