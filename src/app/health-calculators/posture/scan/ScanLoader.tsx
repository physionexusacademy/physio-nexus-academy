"use client";

import dynamic from "next/dynamic";

/**
 * The scan loads in the browser only (as the posture screen does), so the camera code, the pose library and the 3D code never become part of the Cloudflare Worker,
 * which has a size limit. The words above it are rendered on the server so search engines and slow phones see them at once.
 */
const ScanScreen = dynamic(() => import("./ScanScreen"), {
  ssr: false,
  loading: () => <div className="ps-shell"><div className="ps-card" aria-busy="true">Loading the posture scan…</div></div>,
});

export default function ScanLoader() {
  return <ScanScreen />;
}
