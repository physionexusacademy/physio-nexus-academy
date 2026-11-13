"use client";

import dynamic from "next/dynamic";

// The questionnaire is browser-only (it holds form state), so it is not rendered on the server.
const IntakeWizard = dynamic(() => import("./IntakeWizard").then((m) => m.IntakeWizard), {
  ssr: false,
  loading: () => <div className="mx-auto h-96 max-w-5xl animate-pulse rounded-3xl bg-white/70" aria-busy="true" aria-label="Loading questionnaire" />,
});

export function IntakeWizardLoader() {
  return <IntakeWizard />;
}
