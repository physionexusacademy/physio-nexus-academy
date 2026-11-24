import type { Landmark } from "../types";

/** The skeleton over the live picture: bones between the landmarks the model is sure of, and the points a movement is read from. Browser only. */
const BONES: [number, number][] = [
  [11, 12], [11, 13], [13, 15], [12, 14], [14, 16], [11, 23], [12, 24], [23, 24], [23, 25], [25, 27], [24, 26], [26, 28],
  [27, 29], [29, 31], [28, 30], [30, 32], [0, 7], [0, 8], [7, 8],
];

export type DrawOptions = { minVisibility?: number; mirror?: boolean; simple?: boolean; highlight?: number[] };

export function drawSkeleton(canvas: HTMLCanvasElement, landmarks: Landmark[] | null, options: DrawOptions = {}) {
  const ctx = canvas.getContext("2d");
  if (!ctx) return;
  const { width: w, height: h } = canvas;
  ctx.clearRect(0, 0, w, h);
  if (options.simple) { ctx.fillStyle = "#0b1c33"; ctx.fillRect(0, 0, w, h); }
  if (!landmarks) return;
  const minV = options.minVisibility ?? 0.5;
  const x = (p: Landmark) => (options.mirror ? 1 - p.x : p.x) * w;
  const y = (p: Landmark) => p.y * h;
  ctx.lineWidth = Math.max(2, w / 220);
  ctx.lineCap = "round";
  ctx.strokeStyle = "rgba(45, 212, 191, 0.95)";
  for (const [a, b] of BONES) {
    const pa = landmarks[a]; const pb = landmarks[b];
    if (!pa || !pb || pa.v < minV || pb.v < minV) continue;
    ctx.beginPath(); ctx.moveTo(x(pa), y(pa)); ctx.lineTo(x(pb), y(pb)); ctx.stroke();
  }
  const mark = new Set(options.highlight ?? []);
  landmarks.forEach((p, i) => {
    if (p.v < minV || (i < 11 && i !== 0 && i !== 7 && i !== 8)) return;
    ctx.beginPath();
    ctx.fillStyle = mark.has(i) ? "#fbbf24" : "#ffffff";
    ctx.arc(x(p), y(p), (mark.has(i) ? 1.6 : 1) * Math.max(3, w / 190), 0, Math.PI * 2);
    ctx.fill();
  });
}
