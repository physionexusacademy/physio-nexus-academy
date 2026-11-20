/**
 * Visual-effects mode: "full" (everything) or "lite" (no live blur, no decorative loops, cheaper 3D). The page asks for lite when
 * the device cannot keep up (PerfGovernor measures real frame times), or the visitor picks it in the footer, or the link has ?fx=lite.
 * The choice is stored in the browser and written to <html data-fx="..."> before the first paint (FX_INIT_SCRIPT), where the CSS
 * (motion.css) and the 3D engine (lib/virtual-patient/engine.ts) read it. Content, layout and colours never change.
 */
export type Fx = "full" | "lite";
export type FxChoice = { mode: Fx; how: "auto" | "user"; at: number };

export const FX_KEY = "pna-fx-v1";
export const FX_EVENT = "pna-fx-change";
/** An automatic "lite" is re-checked after this long (devices and browsers change). */
export const FX_AUTO_TTL_MS = 30 * 24 * 3600 * 1000;

/**
 * Runs in <head> before first paint. Order: ?fx= in the link, then the stored choice, then obvious hints (data saver, 2 GB of memory
 * or fewer, 2 cores or fewer). Anything else stays "full" until PerfGovernor has watched the real frame rate.
 */
export const FX_INIT_SCRIPT = `(function(){try{var d=document.documentElement,n=navigator,m=null,q=/[?&]fx=(lite|full)\\b/.exec(location.search);if(q){m=q[1];try{localStorage.setItem("${FX_KEY}",JSON.stringify({mode:m,how:"user",at:Date.now()}))}catch(e){}}else{var s=localStorage.getItem("${FX_KEY}");if(s){var c=JSON.parse(s);if(c&&(c.how==="user"||Date.now()-c.at<${FX_AUTO_TTL_MS}))m=c.mode}}if(!m){var k=n.connection||{};if(k.saveData||(n.deviceMemory&&n.deviceMemory<=2)||(n.hardwareConcurrency&&n.hardwareConcurrency<=2))m="lite"}d.setAttribute("data-fx",m==="lite"?"lite":"full")}catch(e){}})();`;

export function readFxChoice(): FxChoice | null {
  try {
    const raw = window.localStorage.getItem(FX_KEY);
    if (!raw) return null;
    const value = JSON.parse(raw) as Partial<FxChoice>;
    if ((value.mode === "lite" || value.mode === "full") && typeof value.at === "number") return { mode: value.mode, how: value.how === "user" ? "user" : "auto", at: value.at };
  } catch {
    /* private mode or blocked storage: the page just keeps the default */
  }
  return null;
}

export function currentFx(): Fx {
  return typeof document !== "undefined" && document.documentElement.getAttribute("data-fx") === "lite" ? "lite" : "full";
}

export function setFx(mode: Fx, how: "auto" | "user") {
  document.documentElement.setAttribute("data-fx", mode);
  try {
    window.localStorage.setItem(FX_KEY, JSON.stringify({ mode, how, at: Date.now() } satisfies FxChoice));
  } catch {
    /* blocked storage */
  }
  window.dispatchEvent(new CustomEvent(FX_EVENT, { detail: mode }));
}
