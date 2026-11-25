/**
 * The camera permission, as far as the browser lets a page see it. Browser only; nothing is stored.
 *
 * A page cannot make a browser ask again once the person has blocked the camera for the site: the only way back is the browser's own site settings. What the page CAN do is
 * (1) say beforehand that the browser is about to ask and what to press, (2) notice that the camera is already blocked and show the steps to allow it, with a button that checks again,
 * and (3) tell a block by the person's settings apart from a block by the site's own policy.
 */
export type CameraPermission = "granted" | "prompt" | "denied" | "unknown";
export type Platform = "android" | "ios" | "other";

export async function cameraPermission(): Promise<CameraPermission> {
  try {
    const status = await navigator.permissions.query({ name: "camera" as PermissionName });
    return status.state === "granted" || status.state === "prompt" || status.state === "denied" ? status.state : "unknown";
  } catch {
    return "unknown"; // Safari and some in-app browsers do not offer the question
  }
}

/** Calls `onChange` when the person changes the camera setting while the page is open (Chrome and Edge tell the page). Returns the function that stops listening. */
export function watchCameraPermission(onChange: (state: CameraPermission) => void): () => void {
  let stopped = false;
  let status: PermissionStatus | null = null;
  const handler = () => { if (status && !stopped) onChange(status.state === "granted" || status.state === "prompt" || status.state === "denied" ? status.state : "unknown"); };
  navigator.permissions?.query({ name: "camera" as PermissionName }).then((s) => {
    if (stopped) return;
    status = s;
    s.addEventListener("change", handler);
  }).catch(() => undefined);
  return () => { stopped = true; status?.removeEventListener("change", handler); };
}

/** false when this page's own Permissions-Policy forbids the camera (a site problem the person cannot fix), null when the browser cannot say. */
export function policyAllowsCamera(): boolean | null {
  const doc = document as Document & { permissionsPolicy?: { allowsFeature?: (f: string) => boolean }; featurePolicy?: { allowsFeature?: (f: string) => boolean } };
  const policy = doc.permissionsPolicy ?? doc.featurePolicy;
  if (!policy?.allowsFeature) return null;
  try { return policy.allowsFeature("camera"); } catch { return null; }
}

export function platform(userAgent: string = typeof navigator === "undefined" ? "" : navigator.userAgent): Platform {
  if (/iPhone|iPad|iPod/i.test(userAgent)) return "ios";
  if (/Android/i.test(userAgent)) return "android";
  return "other";
}
