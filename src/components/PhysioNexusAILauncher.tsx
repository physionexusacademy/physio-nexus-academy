"use client";

import dynamic from "next/dynamic";
import { useEffect, useState } from "react";
import { Sparkles } from "lucide-react";

/**
 * The floating "Ask Physio Nexus AI" button on every page. The chat itself (messages,
 * answer formatting, profile reading) is loaded only when someone opens it or asks a
 * question from search, so it adds nothing to the first load of a page.
 */
const PhysioNexusAI = dynamic(() => import("./PhysioNexusAI").then((m) => m.PhysioNexusAI), {
  ssr: false,
  loading: () => <LauncherButton busy />,
});

function LauncherButton({ onOpen, busy = false }: { onOpen?: () => void; busy?: boolean }) {
  return (
    <button
      type="button"
      onClick={onOpen}
      onPointerEnter={() => void import("./PhysioNexusAI")}
      onFocus={() => void import("./PhysioNexusAI")}
      aria-label="Open Physio Nexus AI"
      aria-expanded={false}
      aria-busy={busy || undefined}
      className="group fixed bottom-40 right-3 z-[91] inline-flex h-14 w-14 items-center justify-center rounded-full bg-gradient-to-br from-[#041E3F] to-[#01828B] text-white shadow-[0_10px_30px_rgba(4,30,63,0.3)] transition duration-200 hover:-translate-y-0.5 hover:shadow-[0_12px_34px_rgba(4,30,63,0.38)] focus:outline-none focus-visible:ring-4 focus-visible:ring-teal-500/30 sm:bottom-40 sm:right-5 lg:bottom-24"
    >
      <Sparkles className={"h-6 w-6" + (busy ? " animate-pulse" : "")} aria-hidden="true" />
      <span className="pointer-events-none absolute left-full ml-3 hidden whitespace-nowrap rounded-lg bg-[#041E3F] px-3 py-2 text-xs font-semibold text-white shadow-lg group-hover:block group-focus-visible:block">
        Ask Physio Nexus AI
      </span>
    </button>
  );
}

export function PhysioNexusAILauncher() {
  const [wake, setWake] = useState<{ question?: string } | null>(null);

  // Search and the command palette can ask a question before the chat has loaded.
  useEffect(() => {
    if (wake) return;
    const onAsk = (event: Event) => {
      const detail = (event as CustomEvent<unknown>).detail;
      setWake({ question: typeof detail === "string" ? detail : undefined });
    };
    window.addEventListener("pna-ai:ask", onAsk);
    return () => window.removeEventListener("pna-ai:ask", onAsk);
  }, [wake]);

  if (wake) return <PhysioNexusAI initialOpen initialQuestion={wake.question} />;
  return <LauncherButton onOpen={() => setWake({})} />;
}
