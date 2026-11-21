"use client";

import { Volume2 } from "lucide-react";
import { useVoice } from "@/lib/speech/preference";

/**
 * Shown by a speaking 3D model only while its voice is on but the browser is still blocking sound (browsers start sound after the first tap
 * or key press on a page). Any tap on the page, this button included, starts the voice; the hint then goes away by itself.
 */
export function VoiceHint({ ur = false, className = "" }: { ur?: boolean; className?: string }) {
  const { locked, unlock } = useVoice();
  if (!locked) return null;
  return (
    <button
      type="button"
      onClick={unlock}
      role="status"
      className={"inline-flex items-center gap-1.5 rounded-full border border-teal-300 bg-teal-50 px-2.5 py-1 text-xs font-bold text-teal-800 motion-safe:animate-pulse " + className}
    >
      <Volume2 className="h-3.5 w-3.5" aria-hidden="true" />
      {ur ? "Awaaz sunne ke liye tap karein" : "Tap to hear the guide"}
    </button>
  );
}
