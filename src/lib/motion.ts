/**
 * Motion policy of the whole site, in one place.
 *
 * The site's animations and 3D demonstrations (the feature tour, the cards, the Skills Lab, the PNA Teacher and its patient, RehabVerse's guide)
 * are part of what it teaches with, so they PLAY BY DEFAULT, also on computers whose system setting asks for "reduced motion" (many Windows PCs
 * and laptops have it on without anybody having chosen it, and every demonstration then froze or lost the patient). A visitor who wants calm
 * says so once: with the footer switch, or with the small note shown the first time a device asks for less motion. That choice is kept in the
 * browser and is the ONLY thing that turns motion down (`data-motion="reduced"` on <html>); the system setting alone no longer does.
 *
 * Both the stylesheets (every "prefers-reduced-motion" rule follows the choice: see MotionGovernor) and the scripts (`motionReduced()`)
 * read the same choice, so CSS and 3D never disagree.
 */
export type Motion = "full" | "reduced";

export const MOTION_KEY = "pna-motion-v1";
export const MOTION_EVENT = "pna-motion-change";

/** Runs in <head> before first paint (layout.tsx). Anything but a saved "reduced" means full motion. */
export const MOTION_INIT_SCRIPT = `(function(){try{var s=localStorage.getItem("${MOTION_KEY}");document.documentElement.setAttribute("data-motion",s==="reduced"?"reduced":"full")}catch(e){}})();`;

/** True only when the visitor chose reduced motion (never because of the system setting alone). Safe on the server (false). */
export function motionReduced(): boolean {
  return typeof document !== "undefined" && document.documentElement.getAttribute("data-motion") === "reduced";
}

/** The device's own "reduce motion" setting: used only to decide whether to show the one-time note, never to turn motion off. */
export function deviceAsksForLessMotion(): boolean {
  return typeof window !== "undefined" && Boolean(window.matchMedia?.("(prefers-reduced-motion: reduce)").matches);
}

/** Has the visitor already chosen (either way)? */
export function motionChosen(): boolean {
  try {
    const stored = window.localStorage.getItem(MOTION_KEY);
    return stored === "full" || stored === "reduced";
  } catch {
    return true; // storage blocked: do not nag
  }
}

export function setMotion(choice: Motion) {
  document.documentElement.setAttribute("data-motion", choice);
  try {
    window.localStorage.setItem(MOTION_KEY, choice);
  } catch {
    /* blocked storage: the choice lasts for this page only */
  }
  window.dispatchEvent(new CustomEvent(MOTION_EVENT, { detail: choice }));
}
