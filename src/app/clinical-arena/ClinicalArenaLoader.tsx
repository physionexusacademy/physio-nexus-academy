"use client";

import dynamic from "next/dynamic";

/**
 * The arena (cases, examinations, patient dialogue) is ~600 KiB of data and
 * logic that only makes sense in the browser. Loading it client-side keeps it
 * out of the Cloudflare Worker bundle; the server sends a light shell.
 */
const ClinicalArenaClient = dynamic(() => import("./ClinicalArenaClient"), {
  ssr: false,
  loading: () => (
    <div className="container-content py-12" role="status" aria-live="polite">
      <div className="nx-loader-card">
        <span className="nx-loader-orb" aria-hidden="true" />
        <p className="text-sm font-bold text-teal-800">Preparing your clinical challenge…</p>
      </div>
    </div>
  ),
});

export function ClinicalArenaLoader() {
  return <ClinicalArenaClient />;
}
