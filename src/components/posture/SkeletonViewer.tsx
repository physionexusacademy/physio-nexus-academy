"use client";

/**
 * The illustrative 3D skeleton of the Full Posture Scan: drag to turn it, or use the Front / Side / Back buttons. It draws only while it is on screen and the tab is
 * visible, never spins when the person has asked for reduced motion, and frees its graphics memory when it closes. See skeleton-build.ts for what it is (and is not).
 */
import { useCallback, useEffect, useRef, useState } from "react";
import * as THREE from "three";
import type { SkeletonPose } from "@/lib/posture/scan";
import { buildSkeleton, disposeSkeleton, type Severities } from "./skeleton-build";
import { motionReduced } from "@/lib/motion";

export type ViewerLabels = { front: string; side: string; back: string; spin: string; stop: string; noGl: string; hint: string };
const PRESETS = { front: 0, side: 90, back: 180 } as const;

export default function SkeletonViewer({ pose, severities, labels }: { pose: SkeletonPose; severities: Severities; labels: ViewerLabels }) {
  const host = useRef<HTMLDivElement>(null);
  const state = useRef<{ renderer: THREE.WebGLRenderer; scene: THREE.Scene; camera: THREE.PerspectiveCamera; group: THREE.Group | null; yaw: number; pitch: number; dirty: boolean; spin: boolean } | null>(null);
  const [failed, setFailed] = useState(false);
  const [spin, setSpin] = useState(false);

  // one renderer for the life of the component
  useEffect(() => {
    const el = host.current;
    if (!el) return;
    let renderer: THREE.WebGLRenderer;
    try {
      renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, powerPreference: "low-power", preserveDrawingBuffer: true });
    } catch {
      setFailed(true);
      return;
    }
    renderer.setPixelRatio(Math.min(2, window.devicePixelRatio || 1));
    renderer.domElement.className = "sv-canvas";
    el.appendChild(renderer.domElement);
    const scene = new THREE.Scene();
    scene.add(new THREE.HemisphereLight(0xffffff, 0x4a5c6a, 1.15));
    const key = new THREE.DirectionalLight(0xffffff, 1.5);
    key.position.set(2, 3, 3);
    scene.add(key);
    const rim = new THREE.DirectionalLight(0x8fe8ff, 0.7);
    rim.position.set(-3, 2, -2);
    scene.add(rim);
    const floor = new THREE.Mesh(new THREE.RingGeometry(0.42, 0.45, 64), new THREE.MeshBasicMaterial({ color: 0x2ee6d6, transparent: true, opacity: 0.35, side: THREE.DoubleSide }));
    floor.rotation.x = -Math.PI / 2;
    floor.position.y = 0.002;
    scene.add(floor);
    const camera = new THREE.PerspectiveCamera(30, 1, 0.1, 50);
    const s = { renderer, scene, camera, group: null as THREE.Group | null, yaw: 0, pitch: 0, dirty: true, spin: false };
    state.current = s;

    const fit = () => {
      const w = el.clientWidth || 300, h = el.clientHeight || 420;
      renderer.setSize(w, h, false);
      camera.aspect = w / h;
      // keep the whole figure (about 1.8 m tall) in view on any shape of box
      const dist = Math.max(3.6, (1.05 / Math.tan((camera.fov * Math.PI) / 360)) / Math.min(1, camera.aspect * 1.25));
      camera.position.set(0, 0.95, dist);
      camera.lookAt(0, 0.9, 0);
      camera.updateProjectionMatrix();
      s.dirty = true;
    };
    fit();
    const ro = new ResizeObserver(fit);
    ro.observe(el);

    let visible = true;
    const io = new IntersectionObserver((entries) => { visible = entries[0]?.isIntersecting ?? true; }, { threshold: 0.05 });
    io.observe(el);
    let raf = 0;
    const tick = () => {
      raf = requestAnimationFrame(tick);
      if (!visible || document.hidden) return;
      if (s.spin) { s.yaw += 0.6; s.dirty = true; }
      if (!s.dirty) return;
      if (s.group) { s.group.rotation.y = (s.yaw * Math.PI) / 180; s.group.rotation.x = (s.pitch * Math.PI) / 180; }
      renderer.render(scene, camera);
      s.dirty = false;
    };
    raf = requestAnimationFrame(tick);

    // drag to turn: sideways turns the figure, up and down tips it a little
    let down: { x: number; y: number; yaw: number; pitch: number } | null = null;
    const onDown = (e: PointerEvent) => { down = { x: e.clientX, y: e.clientY, yaw: s.yaw, pitch: s.pitch }; el.setPointerCapture(e.pointerId); s.spin = false; setSpin(false); };
    const onMove = (e: PointerEvent) => {
      if (!down) return;
      s.yaw = down.yaw + (e.clientX - down.x) * 0.6;
      s.pitch = Math.max(-25, Math.min(25, down.pitch + (e.clientY - down.y) * 0.25));
      s.dirty = true;
    };
    const onUp = () => { down = null; };
    el.addEventListener("pointerdown", onDown); el.addEventListener("pointermove", onMove); el.addEventListener("pointerup", onUp); el.addEventListener("pointercancel", onUp);
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "ArrowLeft") { s.yaw -= 10; s.dirty = true; e.preventDefault(); }
      if (e.key === "ArrowRight") { s.yaw += 10; s.dirty = true; e.preventDefault(); }
    };
    el.addEventListener("keydown", onKey);

    return () => {
      cancelAnimationFrame(raf);
      ro.disconnect(); io.disconnect();
      el.removeEventListener("pointerdown", onDown); el.removeEventListener("pointermove", onMove); el.removeEventListener("pointerup", onUp); el.removeEventListener("pointercancel", onUp); el.removeEventListener("keydown", onKey);
      if (s.group) { scene.remove(s.group); disposeSkeleton(s.group); }
      floor.geometry.dispose(); (floor.material as THREE.Material).dispose();
      renderer.dispose();
      renderer.domElement.remove();
      state.current = null;
    };
  }, []);

  // rebuild the figure whenever the pose or the tints change
  useEffect(() => {
    const s = state.current;
    if (!s) return;
    if (s.group) { s.scene.remove(s.group); disposeSkeleton(s.group); }
    s.group = buildSkeleton(pose, severities);
    s.scene.add(s.group);
    s.dirty = true;
  }, [pose, severities]);

  const turn = useCallback((yaw: number) => { const s = state.current; if (!s) return; s.yaw = yaw; s.pitch = 0; s.spin = false; s.dirty = true; setSpin(false); }, []);
  const toggleSpin = () => { const s = state.current; if (!s || motionReduced()) return; s.spin = !s.spin; setSpin(s.spin); };

  if (failed) return <p className="sv-fail" role="status">{labels.noGl}</p>;
  return (
    <div className="sv">
      <div ref={host} className="sv-host" role="img" tabIndex={0} aria-label={labels.hint} />
      <div className="sv-bar" role="group" aria-label={labels.hint}>
        <button type="button" onClick={() => turn(PRESETS.front)}>{labels.front}</button>
        <button type="button" onClick={() => turn(PRESETS.side)}>{labels.side}</button>
        <button type="button" onClick={() => turn(PRESETS.back)}>{labels.back}</button>
        <button type="button" onClick={toggleSpin} aria-pressed={spin}>{spin ? labels.stop : labels.spin}</button>
      </div>
    </div>
  );
}
