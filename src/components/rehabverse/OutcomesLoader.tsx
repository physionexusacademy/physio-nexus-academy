"use client";

import dynamic from "next/dynamic";
import type { ComponentProps } from "react";
import type { OutcomesPage as Page } from "./OutcomesPage";

// A private, interactive screen: it renders in the browser, which keeps the Cloudflare worker small.
const OutcomesPage = dynamic(() => import("./OutcomesPage").then((m) => m.OutcomesPage), {
  ssr: false,
  loading: () => <div className="container-content pb-20 pt-6" aria-busy="true" aria-label="Loading"><div className="mx-auto h-72 max-w-3xl animate-pulse rounded-3xl bg-white/70" /></div>,
});

export function OutcomesLoader(props: ComponentProps<typeof Page>) {
  return <OutcomesPage {...props} />;
}
