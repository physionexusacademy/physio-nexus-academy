/**
 * The PNA clinic around the plinth (browser only): PNA's own treatment room for the Virtual Patient, built from simple shapes and
 * a few small canvas textures. The only download is the 18 KB wall sign (public/virtual-patient/clinic-logo.webp), served as a
 * static file, so the Cloudflare Worker does no work for it.
 *
 * Layout (metres; the plinth is at the origin, long axis along z, head end at −z; the camera looks from +x/+z):
 *   back wall z = −3.2 (PNA sign, cabinet and counter with the hot-pack heater, clock), left wall x = −3.6 (window, wall bars),
 *   exercise corner on the left (mat, Swiss ball, steps, dumbbells), and the modality trolley at the head end (TENS / IFT unit and the
 *   ultrasound unit) that the Treatment stage uses. Nothing stands within 1.4 m of the plinth's long sides, where the therapist works.
 */
import * as THREE from "three";
import { RoundedBoxGeometry } from "three/examples/jsm/geometries/RoundedBoxGeometry.js";

export const CLINIC_LOGO_URL = "/virtual-patient/clinic-logo.webp";

/** Where the treatment props live in the room (the Treatment stage picks them up from here). */
export const CLINIC_SPOTS = {
  trolley: new THREE.Vector3(-2.05, 0, -2.25),
  heater: new THREE.Vector3(2.0, 0.9, -2.88),
  freezer: new THREE.Vector3(2.7, 0.9, -2.88),
};

const NAVY = "#123a63";
const TEAL = "#0db3aa";
const WALL = "#eef2f5";

function canvasTexture(w: number, h: number, draw: (g: CanvasRenderingContext2D) => void, repeat?: [number, number]) {
  const canvas = document.createElement("canvas");
  canvas.width = w;
  canvas.height = h;
  const g = canvas.getContext("2d")!;
  draw(g);
  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  texture.anisotropy = 4;
  if (repeat) {
    texture.wrapS = texture.wrapT = THREE.RepeatWrapping;
    texture.repeat.set(repeat[0], repeat[1]);
  }
  return texture;
}

/** Light oak-coloured vinyl planks. */
function floorTexture() {
  return canvasTexture(512, 512, (g) => {
    g.fillStyle = "#d8cdbd";
    g.fillRect(0, 0, 512, 512);
    const rows = 8;
    for (let r = 0; r < rows; r++) {
      const y = (r * 512) / rows;
      const offset = (r % 2) * 170 + (r % 3) * 40;
      for (let x = -offset; x < 512; x += 340) {
        const tone = 200 + ((r * 37 + x) % 23);
        g.fillStyle = `rgb(${tone + 16}, ${tone + 6}, ${tone - 10})`;
        g.fillRect(x + 2, y + 2, 336, 512 / rows - 4);
        g.strokeStyle = "rgba(120, 95, 70, 0.08)";
        for (let k = 0; k < 6; k++) {
          g.beginPath();
          const gy = y + 6 + k * 9 + ((x + k * 13) % 5);
          g.moveTo(x + 6, gy);
          g.bezierCurveTo(x + 110, gy + 3, x + 220, gy - 3, x + 330, gy + 1);
          g.stroke();
        }
      }
    }
  }, [3, 3]);
}

function clockTexture() {
  return canvasTexture(256, 256, (g) => {
    g.fillStyle = "#ffffff";
    g.beginPath();
    g.arc(128, 128, 120, 0, Math.PI * 2);
    g.fill();
    g.strokeStyle = NAVY;
    g.lineWidth = 10;
    g.stroke();
    g.fillStyle = NAVY;
    for (let i = 0; i < 12; i++) {
      const a = (i / 12) * Math.PI * 2;
      g.fillRect(128 + Math.sin(a) * 96 - 3, 128 - Math.cos(a) * 96 - 3, 6, 6);
    }
    g.lineCap = "round";
    g.lineWidth = 8;
    g.beginPath();
    g.moveTo(128, 128);
    g.lineTo(128 + 50, 128 - 30);
    g.stroke();
    g.lineWidth = 5;
    g.beginPath();
    g.moveTo(128, 128);
    g.lineTo(128 - 20, 128 - 80);
    g.stroke();
    g.fillStyle = TEAL;
    g.font = "bold 22px sans-serif";
    g.textAlign = "center";
    g.fillText("PNA", 128, 182);
  });
}

/** The screen of the electrotherapy unit. */
function screenTexture(title: string, lines: string[]) {
  return canvasTexture(256, 160, (g) => {
    g.fillStyle = "#04121f";
    g.fillRect(0, 0, 256, 160);
    g.fillStyle = "#2ee6d6";
    g.font = "bold 26px sans-serif";
    g.fillText(title, 16, 38);
    g.font = "18px sans-serif";
    g.fillStyle = "#a7fff4";
    lines.forEach((line, i) => g.fillText(line, 16, 74 + i * 26));
  });
}

const mat = (color: string, roughness = 0.7, metalness = 0) => new THREE.MeshStandardMaterial({ color, roughness, metalness });

function box(w: number, h: number, d: number, material: THREE.Material, radius = 0) {
  const geometry = radius > 0 ? new RoundedBoxGeometry(w, h, d, 2, radius) : new THREE.BoxGeometry(w, h, d);
  return new THREE.Mesh(geometry, material);
}

export function buildClinic(): THREE.Group {
  const clinic = new THREE.Group();
  clinic.name = "clinic";
  const steel = mat("#c4ccd4", 0.35, 0.6);
  const white = mat("#f7f9fb", 0.6);
  const navy = mat(NAVY, 0.6);
  const teal = mat(TEAL, 0.5);

  /* ---- floor, walls ---- */
  const floor = new THREE.Mesh(new THREE.PlaneGeometry(7.2, 6.4), new THREE.MeshStandardMaterial({ map: floorTexture(), roughness: 0.8 }));
  floor.rotation.x = -Math.PI / 2;
  floor.position.set(0, 0.002, 0);
  floor.receiveShadow = true;
  clinic.add(floor);

  const wallMat = mat(WALL, 0.95);
  const left = new THREE.Mesh(new THREE.PlaneGeometry(6.4, 4), wallMat);
  left.rotation.y = Math.PI / 2;
  left.position.set(-3.6, 2, 0);
  clinic.add(left);
  // navy wainscot with a teal line on both walls
  const panelMat = mat("#d6e4ea", 0.85);
  const wainBack = box(7.2, 1.0, 0.02, panelMat);
  wainBack.position.set(0, 0.5, -3.18);
  const wainLeft = box(0.02, 1.0, 6.4, panelMat);
  wainLeft.position.set(-3.58, 0.5, 0);
  const skirtBack = box(7.2, 0.12, 0.03, navy);
  skirtBack.position.set(0, 0.06, -3.17);
  const skirtLeft = box(0.03, 0.12, 6.4, navy);
  skirtLeft.position.set(-3.57, 0.06, 0);
  clinic.add(skirtBack, skirtLeft);
  const lineLeft = box(0.02, 0.06, 6.4, teal);
  lineLeft.position.set(-3.57, 1.05, 0);
  clinic.add(wainBack, wainLeft, lineLeft);

  /* ---- the PNA sign: a back-lit panel with the real logo ---- */
  const sign = new THREE.Group();
  const panel = box(1.62, 1.28, 0.05, white, 0.02);
  const glow = new THREE.Mesh(new THREE.PlaneGeometry(1.74, 1.4), new THREE.MeshBasicMaterial({ color: "#7ff3e4", transparent: true, opacity: 0.35 }));
  glow.position.z = -0.03;
  const logoTexture = new THREE.TextureLoader().load(CLINIC_LOGO_URL);
  logoTexture.colorSpace = THREE.SRGBColorSpace;
  logoTexture.anisotropy = 4;
  const logo = new THREE.Mesh(new THREE.PlaneGeometry(1.5, 1.146), new THREE.MeshBasicMaterial({ map: logoTexture, toneMapped: false }));
  logo.position.z = 0.027;
  sign.add(glow, panel, logo);
  sign.position.set(-0.55, 1.95, -3.15);
  sign.name = "pna-sign";
  clinic.add(sign);
  // the same sign, smaller, on the left wall (seen behind the plinth when the patient lies down)
  const side = sign.clone();
  side.scale.setScalar(0.78);
  side.rotation.y = Math.PI / 2;
  side.position.set(-3.55, 2.1, -0.55);
  clinic.add(side);

  /* ---- window with blinds on the left wall ---- */
  const windowGroup = new THREE.Group();
  const pane = new THREE.Mesh(new THREE.PlaneGeometry(1.5, 1.2), new THREE.MeshBasicMaterial({ color: "#dff1ff" }));
  const frame = box(1.62, 1.32, 0.05, white);
  frame.position.z = -0.03;
  windowGroup.add(frame, pane);
  for (let i = 0; i < 9; i++) {
    const slat = box(1.48, 0.03, 0.01, mat("#ffffff", 0.5));
    slat.position.set(0, 0.5 - i * 0.12, 0.02);
    windowGroup.add(slat);
  }
  windowGroup.rotation.y = Math.PI / 2;
  windowGroup.position.set(-3.56, 1.85, 1.75);
  clinic.add(windowGroup);

  /* ---- wall bars (exercise corner) ---- */
  const bars = new THREE.Group();
  for (const z of [-0.45, 0.45]) {
    const rail = box(0.06, 2.3, 0.08, mat("#c9a77c", 0.6));
    rail.position.set(0, 1.15, z);
    bars.add(rail);
  }
  for (let i = 0; i < 12; i++) {
    const rung = new THREE.Mesh(new THREE.CylinderGeometry(0.018, 0.018, 0.9, 8), mat("#d8b98d", 0.5));
    rung.rotation.x = Math.PI / 2;
    rung.position.set(0, 0.18 + i * 0.18, 0);
    bars.add(rung);
  }
  bars.position.set(-3.5, 0, -2.2);
  clinic.add(bars);

  /* ---- exercise mat, Swiss ball, step, dumbbells ---- */
  const exerciseMat = box(0.62, 0.02, 1.8, mat("#1aa39b", 0.85), 0.008);
  exerciseMat.position.set(-2.75, 0.011, 0.35);
  exerciseMat.receiveShadow = true;
  clinic.add(exerciseMat);
  const ball = new THREE.Mesh(new THREE.SphereGeometry(0.32, 32, 20), mat("#2f6fb3", 0.35));
  ball.position.set(-3.05, 0.32, 2.0);
  ball.castShadow = true;
  clinic.add(ball);
  const step = box(0.7, 0.15, 0.32, mat("#3a4a5c", 0.8), 0.03);
  step.position.set(-2.2, 0.075, -2.65);
  clinic.add(step);
  const rack = new THREE.Group();
  const rackBase = box(0.5, 0.05, 0.24, steel);
  rackBase.position.y = 0.32;
  rack.add(rackBase);
  for (const [i, colour] of ["#e85d75", "#f2a541", "#2ee6d6"].entries()) {
    for (const z of [-0.06, 0.06]) {
      const bell = new THREE.Group();
      const grip = new THREE.Mesh(new THREE.CylinderGeometry(0.012, 0.012, 0.14, 8), steel);
      grip.rotation.z = Math.PI / 2;
      bell.add(grip);
      for (const x of [-0.06, 0.06]) {
        const end = new THREE.Mesh(new THREE.CylinderGeometry(0.035, 0.035, 0.04, 6), mat(colour, 0.5));
        end.rotation.z = Math.PI / 2;
        end.position.x = x;
        bell.add(end);
      }
      bell.position.set(-0.15 + i * 0.15, 0.38, z);
      rack.add(bell);
    }
  }
  for (const x of [-0.22, 0.22]) {
    const leg = box(0.03, 0.32, 0.2, steel);
    leg.position.set(x, 0.16, 0);
    rack.add(leg);
  }
  rack.position.set(-3.25, 0, -1.25);
  rack.rotation.y = Math.PI / 2;
  clinic.add(rack);

  /* ---- cabinet and counter on the back wall: towels, the hot-pack heater, the cold-pack freezer ---- */
  const counter = new THREE.Group();
  const base = box(1.6, 0.86, 0.56, white, 0.01);
  base.position.y = 0.43;
  const top = box(1.64, 0.04, 0.6, mat("#dfe6ec", 0.4));
  top.position.y = 0.88;
  counter.add(base, top);
  for (const x of [-0.4, 0.4]) {
    const door = box(0.76, 0.76, 0.012, mat("#f2f5f8", 0.5));
    door.position.set(x, 0.45, 0.285);
    const handle = box(0.012, 0.16, 0.02, steel);
    handle.position.set(x + (x < 0 ? 0.3 : -0.3), 0.55, 0.3);
    counter.add(door, handle);
  }
  const shelf = box(1.5, 0.03, 0.26, white);
  shelf.position.set(0, 1.62, -0.12);
  counter.add(shelf);
  for (let i = 0; i < 5; i++) {
    const towel = box(0.22, 0.09, 0.2, mat(i % 2 ? "#ffffff" : "#bfeee9", 0.95), 0.03);
    towel.position.set(-0.6 + i * 0.25, 1.68, -0.12);
    counter.add(towel);
  }
  counter.position.set(2.35, 0, -2.88);
  clinic.add(counter);
  // hydrocollator (hot-pack heater): a steel tank with a lid, on the counter
  const heater = new THREE.Group();
  const tank = box(0.46, 0.42, 0.34, steel, 0.02);
  tank.position.y = 0.21;
  const lid = box(0.48, 0.03, 0.36, mat("#aab4be", 0.3, 0.7));
  lid.position.y = 0.43;
  const knob = new THREE.Mesh(new THREE.CylinderGeometry(0.025, 0.025, 0.02, 12), mat("#e85d75", 0.4));
  knob.rotation.x = Math.PI / 2;
  knob.position.set(0.15, 0.12, 0.175);
  heater.add(tank, lid, knob);
  heater.position.copy(CLINIC_SPOTS.heater);
  heater.name = "heater";
  clinic.add(heater);
  // a small cold-pack freezer next to it
  const freezer = box(0.4, 0.38, 0.34, mat("#eaf6ff", 0.4), 0.02);
  freezer.position.copy(CLINIC_SPOTS.freezer).add(new THREE.Vector3(0, 0.19, 0));
  const freezerLine = box(0.4, 0.02, 0.005, mat("#3cc8ff", 0.4));
  freezerLine.position.copy(freezer.position).add(new THREE.Vector3(0, 0.1, 0.171));
  clinic.add(freezer, freezerLine);

  /* ---- modality trolley at the head end: TENS / IFT unit on top, ultrasound unit below ---- */
  const trolley = new THREE.Group();
  for (const y of [0.42, 0.86]) {
    const tray = box(0.56, 0.03, 0.42, steel, 0.01);
    tray.position.y = y;
    trolley.add(tray);
  }
  for (const x of [-0.26, 0.26]) for (const z of [-0.19, 0.19]) {
    const post = new THREE.Mesh(new THREE.CylinderGeometry(0.012, 0.012, 0.88, 8), steel);
    post.position.set(x, 0.46, z);
    const wheel = new THREE.Mesh(new THREE.SphereGeometry(0.03, 10, 8), mat("#333b44", 0.6));
    wheel.position.set(x, 0.03, z);
    trolley.add(post, wheel);
  }
  const unit = box(0.36, 0.16, 0.26, mat("#e8edf2", 0.45), 0.02);
  unit.position.set(0, 0.96, 0);
  const screen = new THREE.Mesh(new THREE.PlaneGeometry(0.2, 0.11), new THREE.MeshBasicMaterial({ map: screenTexture("PNA Stim", ["TENS · IFT", "Ready"]), toneMapped: false }));
  screen.rotation.x = -0.35;
  screen.position.set(-0.04, 1.01, 0.12);
  const dial = new THREE.Mesh(new THREE.CylinderGeometry(0.03, 0.03, 0.02, 16), navy);
  dial.rotation.x = Math.PI / 2 - 0.35;
  dial.position.set(0.12, 0.99, 0.125);
  const us = box(0.3, 0.12, 0.24, mat("#dfe8f0", 0.45), 0.02);
  us.position.set(0, 0.5, 0);
  const usScreen = new THREE.Mesh(new THREE.PlaneGeometry(0.16, 0.07), new THREE.MeshBasicMaterial({ map: screenTexture("Ultrasound", ["1 MHz · 3 MHz"]), toneMapped: false }));
  usScreen.position.set(0, 0.52, 0.121);
  trolley.add(unit, screen, dial, us, usScreen);
  trolley.position.copy(CLINIC_SPOTS.trolley);
  trolley.rotation.y = Math.PI / 4;
  trolley.name = "trolley";
  clinic.add(trolley);

  /* ---- clock, plant ---- */
  const clock = new THREE.Mesh(new THREE.CircleGeometry(0.22, 40), new THREE.MeshBasicMaterial({ map: clockTexture() }));
  clock.position.set(1.15, 2.55, -3.17);
  clinic.add(clock);
  const plant = new THREE.Group();
  const pot = new THREE.Mesh(new THREE.CylinderGeometry(0.18, 0.14, 0.36, 20), navy);
  pot.position.y = 0.18;
  plant.add(pot);
  for (let i = 0; i < 7; i++) {
    const leaf = new THREE.Mesh(new THREE.SphereGeometry(0.17, 12, 10), mat(i % 2 ? "#2f8f5b" : "#3fae6e", 0.8));
    const a = (i / 7) * Math.PI * 2;
    leaf.scale.set(0.7, 1.4, 0.7);
    leaf.position.set(Math.cos(a) * 0.14, 0.62 + (i % 3) * 0.12, Math.sin(a) * 0.14);
    plant.add(leaf);
  }
  plant.position.set(-3.25, 0, -2.9);
  clinic.add(plant);

  clinic.traverse((o) => {
    if ((o as THREE.Mesh).isMesh && o !== floor) (o as THREE.Mesh).castShadow = false;
  });
  return clinic;
}
