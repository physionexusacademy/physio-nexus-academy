"use client";

import dynamic from "next/dynamic";

/**
 * The arena (cases, examinations, patient dialogue) is ~600 KiB of data and
 * logic that only makes sense in the browser. Loading it client-side keeps it
 * out of the Cloudflare Worker bundle; the server sends a light shell.
 */
const ClinicalArenaClient = dynamic(() => import("./ClinicalArenaClient"), {
  ssr: false,
  // Sent by the server (and read by search engines) until the arena loads in the browser.
  loading: () => (
    <div className="container-content py-12">
      <h1 className="text-3xl font-extrabold text-navy-800 sm:text-4xl">Interactive clinical reasoning cases for physiotherapy</h1>
      <p className="mt-3 max-w-2xl text-base leading-7 text-slate-600">
        Take the history, examine, choose a diagnosis and plan treatment for realistic patients — a six-stage clinical
        reasoning challenge for physiotherapy students and clinicians, with safety screening and evidence-informed feedback.
      </p>
      <div className="nx-loader-card mt-6" role="status" aria-live="polite">
        <span className="nx-loader-orb" aria-hidden="true" />
        <p className="text-sm font-bold text-teal-800">Preparing your clinical challenge…</p>
      </div>
    </div>
  ),
});

export function ClinicalArenaLoader() {
  return <ClinicalArenaClient />;
}
