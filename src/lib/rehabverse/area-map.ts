/**
 * The bridge from "where does it hurt?" to the 3D exercise library: which RehabVerse region belongs to a body area on the homepage body map,
 * a region of the symptom checker, or an area of the Conditions guide. Small and static (no exercise data), so any page can import it.
 * `REGION_COUNTS` is the number of exercises the library shows for a region; scripts/validate-rehabverse-library.ts fails when it is stale.
 */
import type { Region } from "./types";

export const REGION_COUNTS: Record<Region, number> = { cervical: 11, thoracic: 15, lumbar: 19, shoulder: 16, elbow_hand: 13, hip: 31, knee: 15, ankle_foot: 16 };

/** Plain words for each region, for a button or a heading ("Neck exercises"). */
export const REGION_PLAIN: Record<Region, string> = {
  cervical: "Neck",
  thoracic: "Upper back",
  lumbar: "Low back",
  shoulder: "Shoulder",
  elbow_hand: "Elbow, wrist and hand",
  hip: "Hip and thigh",
  knee: "Knee",
  ankle_foot: "Ankle and foot",
};

const BODY_AREA: Record<string, Region> = { neck: "cervical", shoulder: "shoulder", back: "lumbar", arm: "elbow_hand", hip: "hip", knee: "knee", foot: "ankle_foot" };
const CHECKER_REGION: Record<string, Region> = {
  neck: "cervical",
  shoulder: "shoulder",
  elbow: "elbow_hand",
  "wrist-hand": "elbow_hand",
  "upper-back-ribs": "thoracic",
  "low-back": "lumbar",
  "hip-groin": "hip",
  knee: "knee",
  "lower-leg": "ankle_foot",
  "ankle-foot": "ankle_foot",
};

/** Body-map / Conditions area to library region (null for the areas that have no exercise library: nerves, chest, whole body). */
export const regionForBodyArea = (area: string): Region | null => BODY_AREA[area] ?? null;
/** Symptom-checker region to library region. */
export const regionForChecker = (id: string): Region | null => CHECKER_REGION[id] ?? null;
/** The library, opened on one region. `from` says where the visitor came from, for the short note at the top. */
export const libraryHref = (region: Region, from?: "bodymap" | "checker" | "condition") => `/rehabverse/library?region=${region}${from ? `&from=${from}` : ""}`;
