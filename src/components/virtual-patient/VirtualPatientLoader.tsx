"use client";

import dynamic from "next/dynamic";

/** three.js and the patient model load only in the browser, never in the Worker. */
const VirtualPatientApp = dynamic(() => import("./VirtualPatientApp").then((module) => module.VirtualPatientApp), {
  ssr: false,
  loading: () => (
    <div className="vp-shell grid min-h-[70vh] place-items-center rounded-[28px] bg-[#0a1f3d] text-[#a9bfd6]">
      <p className="text-sm font-semibold">Preparing the exam room…</p>
    </div>
  ),
});

export function VirtualPatientLoader() {
  return <VirtualPatientApp />;
}
