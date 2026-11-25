"use client";

import dynamic from "next/dynamic";

/**
 * The posture screen loads in the browser only (the same way the RehabVerse camera does), so the camera code and the pose library never become part of the
 * Cloudflare Worker, which has a size limit. The words above it are rendered on the server so search engines and slow phones see them at once.
 */
const PostureScreen = dynamic(() => import("./PostureScreen"), {
  ssr: false,
  loading: () => <div className="ps-shell"><div className="ps-card" aria-busy="true">Loading the posture screen…</div></div>,
});

export default function PostureLoader() {
  return <PostureScreen />;
}
