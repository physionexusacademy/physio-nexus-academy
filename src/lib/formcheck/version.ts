import lock from "./assets.lock.json";

/**
 * The software identification stored with every trial and shown on the validation screen: the engine's version, the library version and the SHA-256 of the model files
 * (from assets.lock.json, which scripts/fetch-formcheck-assets.mjs checks against the files that are actually served). Bump ENGINE_VERSION whenever geometry, thresholds,
 * specs or cue rules change; a study freezes it before the first participant (docs/camera-form-check/13-preregistration-summary.md).
 */
export const ENGINE_VERSION = "formcheck-0.2.0";

export type SoftwareRecord = { engine: string; library: string; poseModel: string; poseModelSha256: string; faceModel: string | null; faceModelSha256: string | null; delegate: string };

export function softwareRecord(model: "full" | "lite", face: boolean, delegate: string): SoftwareRecord {
  const pose = lock.models[model === "full" ? "pose_landmarker_full.task" : "pose_landmarker_lite.task"];
  return {
    engine: ENGINE_VERSION,
    library: `${lock.library.name}@${lock.library.version}`,
    poseModel: model === "full" ? "pose_landmarker_full.task" : "pose_landmarker_lite.task",
    poseModelSha256: pose.sha256,
    faceModel: face ? "face_landmarker.task" : null,
    faceModelSha256: face ? lock.models["face_landmarker.task"].sha256 : null,
    delegate,
  };
}
