"use client";

import dynamic from "next/dynamic";
import type { ComponentProps } from "react";
import type { DaySession as Session } from "./DaySession";

// Private, interactive screen: it renders in the browser, which keeps the Cloudflare worker small.
const DaySession = dynamic(() => import("./DaySession").then((m) => m.DaySession), {
  ssr: false,
  loading: () => (
    <div className="container-content pb-20 pt-6 sm:pt-9" aria-busy="true" aria-label="Loading today's session">
      <div className="h-16 max-w-md animate-pulse rounded-2xl bg-white/70" />
      <div className="mt-6 grid gap-6 lg:grid-cols-[1.1fr_0.9fr]"><div className="aspect-[16/10] animate-pulse rounded-3xl bg-white/70" /><div className="h-72 animate-pulse rounded-3xl bg-white/70" /></div>
    </div>
  ),
});

export function DaySessionLoader(props: ComponentProps<typeof Session>) {
  return <DaySession {...props} />;
}
