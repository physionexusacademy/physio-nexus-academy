"use client";

import dynamic from "next/dynamic";

// The conversation is browser-only (it holds chat state), so it is not rendered on the server.
const IntakeChat = dynamic(() => import("./IntakeChat").then((m) => m.IntakeChat), {
  ssr: false,
  loading: () => <div className="mx-auto h-96 max-w-5xl animate-pulse rounded-3xl bg-white/70" aria-busy="true" aria-label="Loading" />,
});

export function IntakeAssistantLoader({ ageYears }: { ageYears?: number }) {
  return <IntakeChat ageYears={ageYears} />;
}
