"use client";

import dynamic from "next/dynamic";
import { useCallback, useEffect, useRef, useState, type ReactNode } from "react";
import { Box, Shapes } from "lucide-react";

/**
 * A Skills Lab demonstration on the 3D Virtual Patient, with the simple 2D diagram one tap
 * away (and used automatically without WebGL). three.js and the patient model load only
 * when a demo is first opened and scrolled into view.
 */
const Demo3DPlayer = dynamic(() => import("./Demo3DAny"), {
  ssr: false,
  loading: () => (
    <div className="flex aspect-[4/3] w-full items-center justify-center rounded-3xl border border-slate-200 bg-[#e8eef3] text-sm font-bold text-navy-800 sm:aspect-[16/10]" role="status">
      Preparing the 3D patient…
    </div>
  ),
});

/**
 * Checked once per page and the test context is released at once: browsers allow only about
 * 16 WebGL contexts, and a page with dozens of demos would otherwise make the browser drop the
 * real 3D view (the patient vanishes while the goniometer overlay stays).
 */
let webglSupport: boolean | null = null;
function webgl() {
  if (webglSupport !== null) return webglSupport;
  try {
    const canvas = document.createElement("canvas");
    const context = (canvas.getContext("webgl2") || canvas.getContext("webgl")) as WebGLRenderingContext | null;
    webglSupport = Boolean(context);
    context?.getExtension("WEBGL_lose_context")?.loseContext();
  } catch {
    webglSupport = false;
  }
  return webglSupport;
}

export function Demo3D({ demoKey, title, say, fallback }: { demoKey: string; title: string; say?: string; fallback?: ReactNode }) {
  const ref = useRef<HTMLDivElement>(null);
  const [mode, setMode] = useState<"3d" | "2d">("3d");
  const [supported, setSupported] = useState<boolean | null>(null);
  const [near, setNear] = useState(false);

  useEffect(() => setSupported(webgl()), []);

  // Mount the player only once the demo is (nearly) on screen — closed items never load it.
  useEffect(() => {
    const node = ref.current;
    if (!node || near) return;
    const observer = new IntersectionObserver(([entry]) => entry.isIntersecting && setNear(true), { rootMargin: "200px 0px" });
    observer.observe(node);
    return () => observer.disconnect();
  }, [near]);

  const fail = useCallback(() => setSupported(false), []);
  const use3d = supported !== false && mode === "3d";

  return (
    <div ref={ref} className="space-y-2">
      {use3d ? (
        near && supported ? (
          <Demo3DPlayer demoKey={demoKey} title={title} say={say} onFail={fail} />
        ) : (
          <div className="aspect-[4/3] w-full rounded-3xl border border-slate-200 bg-[#e8eef3] sm:aspect-[16/10]" aria-hidden="true" />
        )
      ) : (
        fallback ?? <p className="rounded-2xl bg-slate-50 px-3 py-2 text-sm text-slate-600">The 3D demonstration needs a browser with WebGL.</p>
      )}
      {supported !== false && fallback ? (
        <div className="flex justify-end">
          <button type="button" onClick={() => setMode((m) => (m === "3d" ? "2d" : "3d"))} className="inline-flex items-center gap-1.5 rounded-full border border-slate-200 bg-white px-3 py-1 text-xs font-bold text-slate-600 hover:border-teal-300 hover:text-teal-700">
            {mode === "3d" ? <Shapes className="h-3.5 w-3.5" aria-hidden="true" /> : <Box className="h-3.5 w-3.5" aria-hidden="true" />}
            {mode === "3d" ? "Simple diagram" : "3D patient"}
          </button>
        </div>
      ) : null}
    </div>
  );
}
