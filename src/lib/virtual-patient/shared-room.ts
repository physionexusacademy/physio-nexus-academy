/**
 * One loaded 3D patient, shared by every demo on a page (Skills Lab demos, RehabVerse exercise
 * players). Whichever demo is in sight owns the 3D view; the others keep a still picture. If the
 * browser drops the GPU context the view is rebuilt, and after repeated losses the demo falls
 * back to its simple diagram. Client-side only.
 */
import { ExamRoom } from "./engine";

export const MODEL_URL = "/virtual-patient/patient.glb";

export type Owner = {
  /** Another demo took the 3D view. */
  lost: () => void;
  /** The browser dropped the 3D view: load it again. */
  reload: () => void;
  isVisible: () => boolean;
  hasRoom: () => boolean;
  activate: () => void;
};

export const shared: {
  room: ExamRoom | null;
  ready: Promise<ExamRoom> | null;
  owner: Owner | null;
  progress: number;
  listeners: Set<(p: number) => void>;
  idle: number;
  losses: number;
  claimedAt: number;
} = { room: null, ready: null, owner: null, progress: 0, listeners: new Set(), idle: 0, losses: 0, claimedAt: 0 };

/** Every mounted demo, so the 3D view can move to the one in sight. */
export const players = new Set<Owner>();

/** Gives the 3D view to a demo that is on screen but showing its still picture. */
export function handOff(from: Owner) {
  for (const player of players) {
    if (player !== from && player.isVisible() && !player.hasRoom()) {
      player.activate();
      return;
    }
  }
}

/**
 * "inline": inside a scrolling page (no wheel zoom or panning; touch scrolls the page until the
 * viewer turns the view). "stage": a dedicated viewer where drag, pinch and wheel move the camera.
 */
export type RoomMode = "inline" | "stage";

function configure(room: ExamRoom, mode: RoomMode) {
  const stage = mode === "stage";
  room.controls.enableZoom = stage;
  room.controls.enablePan = false;
  room.controls.enabled = stage;
  room.renderer.domElement.style.touchAction = stage ? "none" : "pan-y";
}

export function claimRoom(container: HTMLElement, owner: Owner, mode: RoomMode = "inline"): Promise<ExamRoom> {
  window.clearTimeout(shared.idle);
  if (shared.owner && shared.owner !== owner) shared.owner.lost();
  shared.owner = owner;
  shared.claimedAt = performance.now();
  if (!shared.room) {
    const room = new ExamRoom(container);
    configure(room, mode);
    // If the browser drops the GPU context (memory pressure, too many contexts), rebuild the view.
    room.renderer.domElement.addEventListener("webglcontextlost", (event) => {
      event.preventDefault();
      if (shared.room !== room) return;
      shared.losses += 1;
      const lostOwner = shared.owner;
      shared.room = null;
      shared.ready = null;
      shared.owner = null;
      try {
        room.dispose();
      } catch {
        // The context is already gone.
      }
      lostOwner?.reload();
    });
    shared.room = room;
    shared.ready = room
      .load(MODEL_URL, (p) => {
        shared.progress = p;
        shared.listeners.forEach((listener) => listener(p));
      })
      .then(() => room)
      .catch((error) => {
        room.dispose();
        shared.room = null;
        shared.ready = null;
        throw error;
      });
  } else {
    shared.room.attach(container);
    configure(shared.room, mode);
  }
  return shared.ready!;
}

export function releaseRoom(owner: Owner) {
  if (shared.owner !== owner) return;
  shared.owner = null;
  handOff(owner);
  if (shared.owner) return;
  // Free the GPU a while after the last demo closes (the next one would reload the model).
  shared.idle = window.setTimeout(() => {
    if (shared.owner || !shared.room) return;
    shared.room.dispose();
    shared.room = null;
    shared.ready = null;
  }, 90_000);
}

/** The last frame as a picture, for a demo that has handed the 3D view to another. */
export function snapshot(room: ExamRoom) {
  try {
    room.renderer.render(room.scene, room.camera);
    return room.renderer.domElement.toDataURL("image/jpeg", 0.82);
  } catch {
    return null;
  }
}
