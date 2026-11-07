"use client";

import dynamic from "next/dynamic";

/** The interactive checker (and its screening rules) loads in the browser only — it keeps the Worker small. */
export const SymptomCheckerClient = dynamic(
  () => import("./SymptomCheckerClient").then((module) => module.SymptomCheckerClient),
  {
    ssr: false,
    loading: () => (
      <div className="nx-loader-card" role="status" aria-live="polite">
        <span className="nx-loader-orb" aria-hidden="true" />
        <p className="text-sm font-bold text-teal-800">Loading the symptom checker…</p>
      </div>
    ),
  },
);
