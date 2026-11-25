import { policyAllowsCamera } from "./permission";

const RELOAD_KEY = "pna-camera-policy-reload";

/**
 * A page reached by in-app navigation (a Next.js link from another page) keeps the Permissions-Policy of the document the browser first loaded, not its own:
 * coming from a page with `camera=()`, the camera is blocked on a page whose own header allows it, and the person is told to "tell the clinic".
 * One full reload fetches the page as its own document with its own header. Returns true when a reload was started. It never reloads twice within 30 seconds
 * (a page that is blocked after a reload really is blocked) and never without somewhere to remember that (no loops).
 */
export function reloadIfPolicyBlocksCamera(): boolean {
  if (policyAllowsCamera() !== false) return false;
  try {
    const last = Number(window.sessionStorage.getItem(RELOAD_KEY) ?? 0);
    if (Date.now() - last < 30_000) return false;
    window.sessionStorage.setItem(RELOAD_KEY, String(Date.now()));
  } catch {
    return false;
  }
  window.location.reload();
  return true;
}
