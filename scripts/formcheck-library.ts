import fs from "node:fs";
import path from "node:path";

/** The neck and back exercises of the RehabVerse library, read from the generated data files (public/rehabverse-data), with the joints that really move. */
export type LibraryExercise = {
  id: string;
  region: "cervical" | "thoracic" | "lumbar";
  name: string;
  position: string;
  sided: boolean;
  view: string;
  /** joint key (the library's own: "neck", "neck:a", "shoulder:o", "trunk:t") -> axes that move by at least 5 degrees from the start pose */
  moving: Record<string, string[]>;
  dosage: { sets?: number; reps?: number; holdSeconds?: number; durationSeconds?: number };
};

export const MOVE_THRESHOLD_DEG = 5;

/**
 * Neck and back exercises that have no camera form check, because what they train cannot be seen by a camera: breathing control and the
 * pelvic floor squeeze (the 3D model only shows the breath that goes with them).
 */
export const NO_CAMERA_CHECK = new Set(["diaphragmatic-breathing", "pursed-lip-breathing", "thoracic-expansion-arm-raise", "pelvic-floor-lying", "pelvic-floor-sitting"]);

export function loadLibrary(root = process.cwd()): LibraryExercise[] {
  const out: LibraryExercise[] = [];
  for (const region of ["cervical", "thoracic", "lumbar"] as const) {
    const raw = JSON.parse(fs.readFileSync(path.join(root, "public/rehabverse-data", `${region}.json`), "utf8"));
    const list: any[] = Array.isArray(raw) ? raw : raw.exercises ?? Object.values(raw);
    for (const e of list) {
      if (NO_CAMERA_CHECK.has(e.id)) continue;
      const motion = e.motion ?? {};
      const start: Record<string, Record<string, number>> = motion.start ?? {};
      const moving: Record<string, Set<string>> = {};
      for (const move of motion.moves ?? []) {
        for (const [joint, axes] of Object.entries<Record<string, number>>(move.to ?? {})) {
          for (const [axis, value] of Object.entries(axes)) {
            const from = start[joint]?.[axis] ?? 0;
            if (Math.abs(value - from) >= MOVE_THRESHOLD_DEG) (moving[joint] ??= new Set()).add(axis);
          }
        }
      }
      out.push({
        id: e.id, region, name: e.name?.en ?? e.id, position: motion.position ?? "", sided: !!motion.sided, view: motion.view ?? "",
        moving: Object.fromEntries(Object.entries(moving).map(([joint, axes]) => [joint, [...axes].sort()])),
        dosage: e.dosage ?? {},
      });
    }
  }
  return out;
}
