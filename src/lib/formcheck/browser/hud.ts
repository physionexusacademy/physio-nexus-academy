import type { SessionState } from "../session";
import type { Landmark } from "../types";

/**
 * The picture drawn over the live view: the skeleton as a glowing light-line figure, and, while the person is getting into position, a lock-on frame that follows their body, a
 * target zone, a scanning line and a ring that fills while the neutral position is taken. Everything is drawn from the engine's own state, so what is on the screen is exactly
 * what the engine judged. Drawn in the camera's pixel coordinates (the canvas is the size of the camera picture and scaled with the video). Browser only; nothing is read
 * back from the canvas, recorded or sent.
 *
 * Calm by design: nothing flashes (no more than a slow breathing of the frame and one soft pulse per repetition), every ambient movement stops when the visitor chose calm
 * motion (`reducedMotion`), and the figure itself, which carries information, always follows the person.
 */
const BONES: [number, number][] = [
  [11, 12], [11, 13], [13, 15], [12, 14], [14, 16], [11, 23], [12, 24], [23, 24], [23, 25], [25, 27], [24, 26], [26, 28],
  [27, 29], [29, 31], [28, 30], [30, 32], [0, 7], [0, 8], [7, 8],
];
const NODES = [0, 7, 8, 11, 12, 13, 14, 15, 16, 23, 24, 25, 26, 27, 28, 29, 30, 31, 32];

const TEAL = "45, 212, 191";
const CYAN = "103, 232, 249";
const AMBER = "251, 191, 36";

export type HudMemo = { box: { x0: number; y0: number; x1: number; y1: number } | null; reps: number; pulseAt: number; lock: number };
export const createHudMemo = (): HudMemo => ({ box: null, reps: 0, pulseAt: -1e9, lock: 0 });
export type HudOptions = { mirror: boolean; simple: boolean; reducedMotion: boolean; now: number; minVisibility?: number; /** draw the ghost of the target (default true) */ ghost?: boolean };

const clamp01 = (n: number) => Math.max(0, Math.min(1, n));

function brackets(ctx: CanvasRenderingContext2D, x0: number, y0: number, x1: number, y1: number, len: number, rgb: string, alpha: number, width: number) {
  ctx.strokeStyle = `rgba(${rgb}, ${alpha})`;
  ctx.lineWidth = width;
  ctx.lineCap = "round";
  ctx.lineJoin = "round";
  ctx.beginPath();
  ctx.moveTo(x0, y0 + len); ctx.lineTo(x0, y0); ctx.lineTo(x0 + len, y0);
  ctx.moveTo(x1 - len, y0); ctx.lineTo(x1, y0); ctx.lineTo(x1, y0 + len);
  ctx.moveTo(x1, y1 - len); ctx.lineTo(x1, y1); ctx.lineTo(x1 - len, y1);
  ctx.moveTo(x0 + len, y1); ctx.lineTo(x0, y1); ctx.lineTo(x0, y1 - len);
  ctx.stroke();
}

export function drawHud(canvas: HTMLCanvasElement, state: SessionState | null, landmarks: Landmark[] | null, options: HudOptions, memo: HudMemo) {
  const ctx = canvas.getContext("2d");
  if (!ctx) return;
  const { width: w, height: h } = canvas;
  const unit = Math.max(w, h) / 720; // line widths scale with the picture
  ctx.clearRect(0, 0, w, h);
  if (options.simple) { ctx.fillStyle = "#0b1c33"; ctx.fillRect(0, 0, w, h); }
  const fx = (x: number) => (options.mirror ? 1 - x : x) * w;
  const fy = (y: number) => y * h;
  const aligning = state?.phase === "setup" || state?.phase === "calibrating";
  const score = state?.alignment?.score ?? 0;
  const locked = aligning && score >= 90;
  const colour = locked ? TEAL : AMBER;
  const breathe = options.reducedMotion ? 1 : 0.82 + 0.18 * Math.sin(options.now / 520);

  /* alignment mode: the target zone, the lock-on frame, the scan line and the calibration ring */
  if (aligning) {
    const portrait = h >= w;
    const zx0 = (portrait ? 0.14 : 0.1) * w, zx1 = (portrait ? 0.86 : 0.9) * w, zy0 = (portrait ? 0.05 : 0.1) * h, zy1 = (portrait ? 0.95 : 0.9) * h;
    brackets(ctx, zx0, zy0, zx1, zy1, 34 * unit, colour, 0.35 * breathe + 0.15, 2 * unit);
    ctx.setLineDash([2 * unit, 10 * unit]);
    ctx.strokeStyle = `rgba(${colour}, 0.22)`;
    ctx.lineWidth = 1.5 * unit;
    ctx.strokeRect(zx0, zy0, zx1 - zx0, zy1 - zy0);
    ctx.setLineDash([]);

    // the frame wraps the whole visible person (not just the landmarks this exercise reads), so it reads as "I have found you"; the engine's box is the fallback
    let target = state?.alignment?.box ?? null;
    if (landmarks) {
      const seen = NODES.map((i) => landmarks[i]).filter((p) => p && p.v >= (options.minVisibility ?? 0.5));
      if (seen.length >= 4) target = { x0: Math.min(...seen.map((p) => p.x)), x1: Math.max(...seen.map((p) => p.x)), y0: Math.min(...seen.map((p) => p.y)), y1: Math.max(...seen.map((p) => p.y)) };
    }
    if (target) {
      const t = { x0: fx(options.mirror ? target.x1 : target.x0), x1: fx(options.mirror ? target.x0 : target.x1), y0: fy(target.y0), y1: fy(target.y1) };
      const padX = (t.x1 - t.x0) * 0.12 + 14 * unit, padY = (t.y1 - t.y0) * 0.1 + 14 * unit;
      // kept inside the picture (a person whose arms reach the edge must still see the whole frame)
      const edge = 10 * unit;
      const goal = { x0: Math.max(edge, t.x0 - padX), y0: Math.max(edge, t.y0 - padY), x1: Math.min(w - edge, t.x1 + padX), y1: Math.min(h - edge, t.y1 + padY) };
      const b = memo.box ?? goal;
      const k = options.reducedMotion ? 1 : 0.22; // the frame glides to the body instead of jumping
      memo.box = { x0: b.x0 + k * (goal.x0 - b.x0), y0: b.y0 + k * (goal.y0 - b.y0), x1: b.x1 + k * (goal.x1 - b.x1), y1: b.y1 + k * (goal.y1 - b.y1) };
      const m = memo.box;
      memo.lock += ((locked ? 1 : 0) - memo.lock) * 0.12;
      const len = Math.min(m.x1 - m.x0, m.y1 - m.y0) * 0.16 + 10 * unit;
      brackets(ctx, m.x0 - 6 * unit, m.y0 - 6 * unit, m.x1 + 6 * unit, m.y1 + 6 * unit, len * (1 - 0.25 * memo.lock), colour, 0.95, (2.4 + memo.lock) * unit);
      // soft fill that deepens as the lock tightens
      ctx.fillStyle = `rgba(${colour}, ${0.04 + 0.05 * memo.lock})`;
      ctx.fillRect(m.x0, m.y0, m.x1 - m.x0, m.y1 - m.y0);
      if (!options.reducedMotion) {
        // the scan line: one slow sweep from head to foot, fading behind itself
        const phase = (options.now / 2400) % 1;
        const y = m.y0 + phase * (m.y1 - m.y0);
        const band = Math.max(26 * unit, (m.y1 - m.y0) * 0.12);
        const grad = ctx.createLinearGradient(0, y - band, 0, y);
        grad.addColorStop(0, `rgba(${CYAN}, 0)`);
        grad.addColorStop(1, `rgba(${CYAN}, ${locked ? 0.2 : 0.26})`);
        ctx.fillStyle = grad;
        ctx.fillRect(m.x0, Math.max(m.y0, y - band), m.x1 - m.x0, Math.min(band, y - m.y0));
        ctx.strokeStyle = `rgba(${CYAN}, 0.85)`;
        ctx.lineWidth = 1.6 * unit;
        ctx.beginPath(); ctx.moveTo(m.x0, y); ctx.lineTo(m.x1, y); ctx.stroke();
      }
      if (state?.phase === "calibrating") {
        // the ring that fills while the neutral position is taken
        const cx = (m.x0 + m.x1) / 2, cy = (m.y0 + m.y1) / 2, r = Math.min(m.x1 - m.x0, m.y1 - m.y0) * 0.36 + 18 * unit;
        ctx.lineCap = "round";
        ctx.strokeStyle = `rgba(${TEAL}, 0.2)`;
        ctx.lineWidth = 6 * unit;
        ctx.beginPath(); ctx.arc(cx, cy, r, 0, Math.PI * 2); ctx.stroke();
        ctx.strokeStyle = `rgba(${TEAL}, 0.95)`;
        ctx.beginPath(); ctx.arc(cx, cy, r, -Math.PI / 2, -Math.PI / 2 + Math.PI * 2 * clamp01(state.calibration)); ctx.stroke();
      }
    } else {
      memo.box = null;
      memo.lock *= 0.9;
    }
  } else {
    memo.box = null;
    memo.lock = 0;
  }

  /* repetition pulse: one soft brightening of the figure each time a repetition is counted */
  if (state && state.reps > memo.reps) memo.pulseAt = options.now;
  memo.reps = state?.reps ?? 0;
  const pulse = options.reducedMotion ? 0 : clamp01(1 - (options.now - memo.pulseAt) / 600);

  /* the ghost: where the moving part has to go. Dashed light-line figure for the part that moves, a target ring on the part the measurement reads, a dotted link to it, and the
     ring fills while the hold is kept. Brightest for the direction the person is going (an either-way exercise has one ghost each way). */
  if (state?.phase === "active" && state.ghost?.length && landmarks && options.ghost !== false) drawGhost(ctx, state, landmarks, options, { w, h, unit, fx, fy });

  /* the figure */
  if (!landmarks) return;
  const minV = options.minVisibility ?? 0.5;
  const fade = (v: number) => clamp01((v - (minV - 0.2)) / 0.4);
  const line = Math.max(2, 3.2 * unit) * (1 + 0.6 * pulse);
  ctx.lineCap = "round";
  for (const pass of [0, 1]) {
    for (const [a, b] of BONES) {
      const pa = landmarks[a], pb = landmarks[b];
      if (!pa || !pb) continue;
      const alpha = Math.min(fade(pa.v), fade(pb.v));
      if (alpha <= 0) continue;
      ctx.strokeStyle = pass === 0 ? `rgba(${TEAL}, ${0.2 * alpha + 0.2 * pulse})` : `rgba(${pulse > 0.2 ? CYAN : TEAL}, ${0.95 * alpha})`;
      ctx.lineWidth = pass === 0 ? line * 3.4 : line;
      ctx.beginPath(); ctx.moveTo(fx(pa.x), fy(pa.y)); ctx.lineTo(fx(pb.x), fy(pb.y)); ctx.stroke();
    }
  }
  for (const i of NODES) {
    const p = landmarks[i];
    if (!p) continue;
    const alpha = fade(p.v);
    if (alpha <= 0) continue;
    const r = Math.max(2.6, 3.6 * unit);
    ctx.fillStyle = `rgba(${CYAN}, ${0.25 * alpha})`;
    ctx.beginPath(); ctx.arc(fx(p.x), fy(p.y), r * 2.3, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = `rgba(255, 255, 255, ${0.95 * alpha})`;
    ctx.beginPath(); ctx.arc(fx(p.x), fy(p.y), r, 0, Math.PI * 2); ctx.fill();
  }
}


type Space = { w: number; h: number; unit: number; fx: (x: number) => number; fy: (y: number) => number };
const GHOST_BONES = BONES;

function drawGhost(ctx: CanvasRenderingContext2D, state: SessionState, landmarks: Landmark[], options: HudOptions, { unit, fx, fy }: Space) {
  const ghosts = state.ghost!;
  const reached = state.progress >= 0.95;
  const near = state.progress >= 0.6;
  const tone = reached ? "94, 234, 212" : near ? TEAL : CYAN;
  // the ghost the person is heading for: the one whose target marker is nearest to where that body part is now
  const here = (g: (typeof ghosts)[number]) => landmarks[g.main];
  const gap = (g: (typeof ghosts)[number]) => { const a = here(g); const b = g.lm[g.main]; return a ? Math.hypot(a.x - b.x, a.y - b.y) : Number.POSITIVE_INFINITY; };
  const chosen = ghosts.reduce((best, g) => (gap(g) < gap(best) ? g : best), ghosts[0]);
  const pulse = options.reducedMotion ? 0.5 : 0.5 + 0.5 * Math.sin(options.now / 380);
  const holdFraction = state.holdTargetMs > 0 ? clamp01(state.holdMs / state.holdTargetMs) : 0;

  for (const g of ghosts) {
    const lead = g === chosen;
    const alpha = (lead ? 0.95 : 0.4) * (reached ? 1 : 0.75 + 0.2 * (1 - clamp01(state.progress)));
    const moved = new Set(g.moved);
    ctx.lineCap = "round";
    // a dark line under the bright dashed one, so the ghost reads over a bright or busy picture (sea, sky, a white wall)
    for (const pass of [0, 1]) {
      ctx.setLineDash(pass === 0 ? [] : [8 * unit, 7 * unit]);
      ctx.lineWidth = pass === 0 ? Math.max(4, 6 * unit) : Math.max(2.4, 3.6 * unit);
      ctx.strokeStyle = pass === 0 ? `rgba(4, 18, 36, ${alpha * 0.45})` : `rgba(${tone}, ${Math.min(1, alpha * 1.05)})`;
      for (const [a, b] of GHOST_BONES) {
        if (!moved.has(a) && !moved.has(b)) continue;
        const pa = g.lm[a], pb = g.lm[b];
        if (!pa || !pb || (landmarks[a]?.v ?? 0) < 0.3 || (landmarks[b]?.v ?? 0) < 0.3) continue;
        ctx.beginPath(); ctx.moveTo(fx(pa.x), fy(pa.y)); ctx.lineTo(fx(pb.x), fy(pb.y)); ctx.stroke();
      }
    }
    ctx.setLineDash([]);
    for (const i of g.moved) {
      if (!NODES.includes(i)) continue;
      const p = g.lm[i];
      ctx.strokeStyle = `rgba(${tone}, ${alpha})`;
      ctx.lineWidth = Math.max(1.6, 2 * unit);
      ctx.beginPath(); ctx.arc(fx(p.x), fy(p.y), Math.max(3.4, 4.2 * unit), 0, Math.PI * 2); ctx.stroke();
    }
    // the target marker on the part the measurement reads
    const t = g.lm[g.main];
    const cx = fx(t.x), cy = fy(t.y);
    const r = (21 + 4 * pulse * (lead && !reached ? 1 : 0)) * unit;
    ctx.strokeStyle = `rgba(${tone}, ${alpha})`;
    ctx.lineWidth = Math.max(2, 2.6 * unit);
    ctx.beginPath(); ctx.arc(cx, cy, r, 0, Math.PI * 2); ctx.stroke();
    ctx.beginPath(); // four ticks: a sight
    for (const [dx, dy] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) { ctx.moveTo(cx + dx * (r + 3 * unit), cy + dy * (r + 3 * unit)); ctx.lineTo(cx + dx * (r + 11 * unit), cy + dy * (r + 11 * unit)); }
    ctx.stroke();
    if (lead) {
      // a dotted link from where the part is to where it should be
      const now = landmarks[g.main];
      if (now && now.v >= 0.3) {
        ctx.setLineDash([2 * unit, 8 * unit]);
        ctx.strokeStyle = `rgba(${tone}, ${alpha * 0.8})`;
        ctx.lineWidth = Math.max(2, 3 * unit);
        ctx.beginPath(); ctx.moveTo(fx(now.x), fy(now.y)); ctx.lineTo(cx, cy); ctx.stroke();
        ctx.setLineDash([]);
      }
      if (reached) {
        // reached: a solid ring, and while a hold is asked for it fills as the hold is kept
        ctx.fillStyle = `rgba(${tone}, 0.18)`;
        ctx.beginPath(); ctx.arc(cx, cy, r, 0, Math.PI * 2); ctx.fill();
        if (holdFraction > 0) {
          ctx.strokeStyle = `rgba(255, 255, 255, 0.95)`;
          ctx.lineWidth = Math.max(3, 4.2 * unit);
          ctx.beginPath(); ctx.arc(cx, cy, r + 9 * unit, -Math.PI / 2, -Math.PI / 2 + Math.PI * 2 * holdFraction); ctx.stroke();
        }
      }
    }
  }
}
