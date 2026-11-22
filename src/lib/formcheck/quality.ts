import { LM, type Frame, type LandmarkName } from "./types.ts";

/**
 * The set-up check shown before an exercise starts (and watched while it runs): is the person where the camera can judge the movement?
 * The tool prefers saying "I cannot judge this yet, move the phone" to guessing, so every reason it gives is something the person can fix.
 */
export type SetupIssue = "no_person" | "body_not_visible" | "too_far" | "too_close" | "off_centre" | "too_dark" | "too_bright" | "wrong_view";
export type SetupOptions = {
  need: LandmarkName[];
  view: "front" | "side";
  /** the height of the body parts that must be in frame, as a fraction of the image height: [smallest, largest] */
  size?: [number, number];
  minVisibility?: number;
};
export type SetupResult = { ok: boolean; issues: SetupIssue[]; missing: LandmarkName[] };

const VIEW_RATIO_FRONT_MIN = 0.55;
const VIEW_RATIO_SIDE_MAX = 0.45;

export function assessSetup(frame: Frame, opts: SetupOptions): SetupResult {
  const minVis = opts.minVisibility ?? 0.5;
  const [minSize, maxSize] = opts.size ?? [0.4, 0.97];
  const issues = new Set<SetupIssue>();
  const missing: LandmarkName[] = [];
  const seen = frame.lm.filter((p) => p && p.v >= 0.2);
  if (frame.lm.length < 33 || seen.length === 0) return { ok: false, issues: ["no_person"], missing: opts.need };

  for (const name of opts.need) {
    const p = frame.lm[LM[name]];
    if (!p || p.v < minVis) missing.push(name);
  }
  if (missing.length) issues.add("body_not_visible");

  const needed = opts.need.map((name) => frame.lm[LM[name]]).filter((p) => p && p.v >= minVis);
  if (needed.length >= 2) {
    const ys = needed.map((p) => p.y);
    const xs = needed.map((p) => p.x);
    const height = Math.max(...ys) - Math.min(...ys);
    if (height < minSize) issues.add("too_far");
    if (height > maxSize || Math.min(...ys) < 0.01 || Math.max(...ys) > 0.99) issues.add("too_close");
    const centre = (Math.min(...xs) + Math.max(...xs)) / 2;
    if (centre < 0.25 || centre > 0.75) issues.add("off_centre");
  }

  if (frame.luma !== undefined) {
    if (frame.luma < 60) issues.add("too_dark");
    if (frame.luma > 215) issues.add("too_bright");
  }

  // Front or side: the width of the shoulders against the length of the trunk (needs both shoulders and both hips).
  const names: LandmarkName[] = ["leftShoulder", "rightShoulder", "leftHip", "rightHip"];
  const pts = names.map((n) => frame.lm[LM[n]]);
  if (pts.every((p) => p && p.v >= minVis)) {
    const [ls, rs, lh, rh] = pts.map((p) => ({ x: p.x * frame.w, y: p.y * frame.h }));
    const shoulderWidth = Math.hypot(ls.x - rs.x, ls.y - rs.y);
    const trunk = Math.hypot((ls.x + rs.x) / 2 - (lh.x + rh.x) / 2, (ls.y + rs.y) / 2 - (lh.y + rh.y) / 2);
    if (trunk > 0) {
      const ratio = shoulderWidth / trunk;
      if (opts.view === "front" && ratio < VIEW_RATIO_FRONT_MIN) issues.add("wrong_view");
      if (opts.view === "side" && ratio > VIEW_RATIO_SIDE_MAX) issues.add("wrong_view");
    }
  }
  return { ok: issues.size === 0, issues: [...issues], missing };
}
