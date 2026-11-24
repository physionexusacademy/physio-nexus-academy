import { policyAllowsCamera } from "./permission";

/** Opening and closing the device camera, and telling the person what to do when it cannot open. Browser only. */
export type CameraProblem = "denied" | "policy" | "none" | "busy" | "insecure" | "unsupported" | "in_app" | "failed";

/** Facebook, Instagram, TikTok, Line, WeChat and similar in-app browsers often block the camera: the page asks to be opened in the phone's own browser. */
export function inAppBrowser(userAgent: string = typeof navigator === "undefined" ? "" : navigator.userAgent): boolean {
  return /FBAN|FBAV|FB_IAB|Instagram|Line\/|MicroMessenger|TikTok|musical_ly|Snapchat|Twitter|GSA\/|; wv\)/i.test(userAgent);
}

export type OpenedCamera = { stream: MediaStream; width: number; height: number };

export async function openCamera(video: HTMLVideoElement, facing: "user" | "environment" = "user"): Promise<{ ok: true; camera: OpenedCamera } | { ok: false; problem: CameraProblem }> {
  if (typeof navigator === "undefined" || !navigator.mediaDevices?.getUserMedia) return { ok: false, problem: window.isSecureContext === false ? "insecure" : inAppBrowser() ? "in_app" : "unsupported" };
  try {
    const stream = await navigator.mediaDevices.getUserMedia({ audio: false, video: { facingMode: facing, width: { ideal: 1280 }, height: { ideal: 720 }, frameRate: { ideal: 30, max: 30 } } });
    video.srcObject = stream;
    video.muted = true;
    video.playsInline = true;
    await video.play();
    if (!video.videoWidth) await new Promise<void>((resolve) => video.addEventListener("loadeddata", () => resolve(), { once: true }));
    return { ok: true, camera: { stream, width: video.videoWidth, height: video.videoHeight } };
  } catch (error) {
    const name = error instanceof DOMException ? error.name : "";
    if (name === "NotAllowedError" || name === "SecurityError" || name === "PermissionDeniedError") return { ok: false, problem: inAppBrowser() ? "in_app" : policyAllowsCamera() === false ? "policy" : "denied" };
    if (name === "NotFoundError" || name === "OverconstrainedError" || name === "DevicesNotFoundError") return { ok: false, problem: "none" };
    if (name === "NotReadableError" || name === "TrackStartError") return { ok: false, problem: "busy" };
    return { ok: false, problem: "failed" };
  }
}

/** Stops every track and detaches the stream: the camera light goes off. */
export function closeCamera(video: HTMLVideoElement | null, stream: MediaStream | null) {
  stream?.getTracks().forEach((track) => track.stop());
  if (video) {
    video.pause();
    video.srcObject = null;
  }
}
