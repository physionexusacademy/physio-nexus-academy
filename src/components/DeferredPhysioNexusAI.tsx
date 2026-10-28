"use client";

import { useState, type ComponentType } from "react";
import { Sparkles } from "lucide-react";

type WidgetProps = { initialOpen?: boolean };
type WidgetComponent = ComponentType<WidgetProps>;

/**
 * Keep the learning navigator's full chat UI out of every page's initial
 * JavaScript. The small launcher stays available; the chat loads on demand.
 */
export function DeferredPhysioNexusAI() {
  const [Widget, setWidget] = useState<WidgetComponent | null>(null);
  const [loading, setLoading] = useState(false);

  async function openAssistant() {
    if (loading) return;
    setLoading(true);
    try {
      const module = await import("./PhysioNexusAI");
      setWidget(() => module.PhysioNexusAI);
    } catch {
      // Leave the launcher available so the user can retry if the chunk fails.
    } finally {
      setLoading(false);
    }
  }

  if (Widget) return <Widget initialOpen />;

  return (
    <button
      type="button"
      onClick={() => void openAssistant()}
      aria-label="Open Physio Nexus AI"
      aria-expanded={false}
      aria-busy={loading}
      className="group fixed bottom-40 right-3 z-[91] inline-flex h-14 w-14 items-center justify-center rounded-full bg-gradient-to-br from-[#041E3F] to-[#01828B] text-white shadow-[0_10px_30px_rgba(4,30,63,0.3)] transition duration-200 hover:-translate-y-0.5 hover:shadow-[0_12px_34px_rgba(4,30,63,0.38)] focus:outline-none focus-visible:ring-4 focus-visible:ring-teal-500/30 sm:bottom-40 sm:right-5 lg:bottom-24"
    >
      <Sparkles className={loading ? "h-6 w-6 animate-pulse" : "h-6 w-6"} aria-hidden="true" />
      <span className="pointer-events-none absolute left-full ml-3 hidden whitespace-nowrap rounded-lg bg-[#041E3F] px-3 py-2 text-xs font-semibold text-white shadow-lg group-hover:block group-focus-visible:block">
        {loading ? "Loading Physio Nexus AI…" : "Ask Physio Nexus AI"}
      </span>
    </button>
  );
}
