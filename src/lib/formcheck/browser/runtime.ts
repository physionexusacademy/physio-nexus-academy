import type { Frame, Landmark } from "../types";
import { softwareRecord, type SoftwareRecord } from "../version";
import { headPoseFromMatrix } from "./head-pose";

/**
 * The pose model in the browser. Loaded only when the camera is opened (the library, the wasm and the model files are static files under /formcheck/, never part of the
 * Cloudflare worker), run on the person's own device, frame by frame; nothing is recorded or sent. `detect` turns one video frame into the engine's `Frame`.
 */
const BASE = "/formcheck";
export type ModelSize = "full" | "lite";
export type RuntimeOptions = { model?: ModelSize; face?: boolean; delegate?: "GPU" | "CPU" };

type PoseLandmarkerLike = { detectForVideo: (video: HTMLVideoElement, timestamp: number) => { landmarks: { x: number; y: number; z: number; visibility?: number }[][] }; close: () => void };
type FaceLandmarkerLike = { detectForVideo: (video: HTMLVideoElement, timestamp: number) => { facialTransformationMatrixes?: { data: ArrayLike<number> }[] }; close: () => void };

export class PoseRuntime {
  readonly software: SoftwareRecord;
  readonly loadMs: number;
  private pose: PoseLandmarkerLike;
  private face: FaceLandmarkerLike | null;
  private lastStamp = 0;
  private frames = 0;
  private luma = 130;
  private canvas: HTMLCanvasElement | null = null;
  private slow = { count: 0, total: 0 };

  private constructor(pose: PoseLandmarkerLike, face: FaceLandmarkerLike | null, software: SoftwareRecord, loadMs: number) {
    this.pose = pose;
    this.face = face;
    this.software = software;
    this.loadMs = loadMs;
  }

  static async create(options: RuntimeOptions = {}): Promise<PoseRuntime> {
    const started = performance.now();
    const model = options.model ?? "full";
    const { FilesetResolver, PoseLandmarker, FaceLandmarker } = await import("@mediapipe/tasks-vision");
    const fileset = await FilesetResolver.forVisionTasks(`${BASE}/wasm`);
    const make = async (delegate: "GPU" | "CPU") => {
      const pose = await PoseLandmarker.createFromOptions(fileset, {
        baseOptions: { modelAssetPath: `${BASE}/models/pose_landmarker_${model}.task`, delegate },
        runningMode: "VIDEO", numPoses: 1, minPoseDetectionConfidence: 0.5, minPosePresenceConfidence: 0.5, minTrackingConfidence: 0.5,
      });
      const face = options.face
        ? await FaceLandmarker.createFromOptions(fileset, { baseOptions: { modelAssetPath: `${BASE}/models/face_landmarker.task`, delegate }, runningMode: "VIDEO", numFaces: 1, outputFacialTransformationMatrixes: true })
        : null;
      return { pose, face, delegate };
    };
    let built: Awaited<ReturnType<typeof make>>;
    try {
      built = await make(options.delegate ?? "GPU");
    } catch {
      built = await make("CPU");
    }
    return new PoseRuntime(built.pose as unknown as PoseLandmarkerLike, built.face as unknown as FaceLandmarkerLike | null, softwareRecord(model, !!options.face, built.delegate), Math.round(performance.now() - started));
  }

  /** Mean brightness of the picture, 0..255, from a tiny copy of the frame (refreshed every few frames). */
  private measureLuma(video: HTMLVideoElement) {
    this.canvas ??= Object.assign(document.createElement("canvas"), { width: 32, height: 24 });
    const ctx = this.canvas.getContext("2d", { willReadFrequently: true });
    if (!ctx) return;
    ctx.drawImage(video, 0, 0, 32, 24);
    const { data } = ctx.getImageData(0, 0, 32, 24);
    let sum = 0;
    for (let i = 0; i < data.length; i += 4) sum += 0.2126 * data[i] + 0.7152 * data[i + 1] + 0.0722 * data[i + 2];
    this.luma = sum / (data.length / 4);
  }

  /** One frame in, the engine's frame (and the raw landmarks, for drawing) out; null when no person is found. */
  detect(video: HTMLVideoElement): { frame: Frame; landmarks: Landmark[] | null } {
    const now = performance.now();
    const stamp = Math.max(now, this.lastStamp + 1);
    this.lastStamp = stamp;
    if (this.frames++ % 12 === 0) this.measureLuma(video);
    const result = this.pose.detectForVideo(video, stamp);
    const spent = performance.now() - now;
    this.slow.count += 1; this.slow.total += spent;
    const raw = result.landmarks[0];
    const landmarks: Landmark[] | null = raw ? raw.map((p) => ({ x: p.x, y: p.y, z: p.z, v: p.visibility ?? 0 })) : null;
    let head: Frame["head"];
    if (this.face) {
      const matrix = this.face.detectForVideo(video, stamp).facialTransformationMatrixes?.[0]?.data;
      const pose = matrix ? headPoseFromMatrix(matrix) : null;
      if (pose) head = { ...pose, v: 0.9 };
    }
    const frame: Frame = { t: stamp, w: video.videoWidth, h: video.videoHeight, lm: landmarks ?? Array.from({ length: 33 }, () => ({ x: 0.5, y: 0.5, v: 0 })), luma: this.luma, head };
    return { frame, landmarks };
  }

  /** The average time one detection took so far, ms (the page offers the lighter model when a phone is slow). */
  get averageMs() { return this.slow.count ? this.slow.total / this.slow.count : 0; }

  close() {
    this.pose.close();
    this.face?.close();
  }
}
