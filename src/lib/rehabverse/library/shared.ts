import type { Parts } from "../../virtual-patient/parts.ts";
import type { Prop } from "../types.ts";

/** Sitting on a chair (the demonstrator stands on the floor with hips and knees at 90°). */
export const SIT: Parts = {
  hip: { flex: 90 }, "hip:o": { flex: 90 }, knee: { flex: 90 }, "knee:o": { flex: 90 },
  shoulder: { flex: 12 }, "shoulder:o": { flex: 12 }, elbow: { flex: 45 }, "elbow:o": { flex: 45 },
};
export const CHAIR: Prop = { kind: "chair" };

/** Lying on the back with both knees bent (hook-lying). */
export const HOOK: Parts = { hip: { flex: 52 }, knee: { flex: 98 }, "hip:o": { flex: 52 }, "knee:o": { flex: 98 } };

/** On hands and knees (the body is face-down in the model, so "forward" for the arms points down). */
export const QUAD: Parts = {
  shoulder: { flex: 90 }, "shoulder:o": { flex: 90 }, hip: { flex: 90 }, "hip:o": { flex: 90 },
  knee: { flex: 90 }, "knee:o": { flex: 90 }, ankle: { flex: -20 }, "ankle:o": { flex: -20 },
};
