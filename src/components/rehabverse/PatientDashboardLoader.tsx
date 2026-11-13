"use client";

import dynamic from "next/dynamic";
import type { ComponentProps } from "react";
import type { PatientDashboard as Dashboard } from "./PatientDashboard";

// Private, interactive screen: it renders in the browser, which keeps the Cloudflare worker small.
const PatientDashboard = dynamic(() => import("./PatientDashboard").then((m) => m.PatientDashboard), {
  ssr: false,
  loading: () => (
    <div className="container-content pb-20 pt-6 sm:pt-9" aria-busy="true" aria-label="Loading your programme">
      <div className="h-24 max-w-md animate-pulse rounded-2xl bg-white/70" />
      <div className="mt-6 grid gap-6 lg:grid-cols-[1.15fr_0.85fr]"><div className="h-80 animate-pulse rounded-3xl bg-white/70" /><div className="h-72 animate-pulse rounded-3xl bg-white/70" /></div>
    </div>
  ),
});

export function PatientDashboardLoader(props: ComponentProps<typeof Dashboard>) {
  return <PatientDashboard {...props} />;
}
