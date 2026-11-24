"use client";

import { useCallback, useEffect, useRef } from "react";
import { speakText, type Playback } from "@/lib/speech/voices";

/**
 * What the camera says out loud, one thing at a time. A count never interrupts a longer sentence (it is skipped), a tip waits its turn, and a "now" line (the set is
 * finished) replaces whatever is queued. Nothing is spoken when the voice is off. The same speech service as the rest of the site, in Roman Urdu or English.
 */
export function useSay(on: boolean, lang: "en" | "ru") {
  const busy = useRef(false);
  const current = useRef<Playback | null>(null);
  const pending = useRef<string | null>(null);
  const alive = useRef(true);
  const langRef = useRef(lang);
  langRef.current = lang;
  useEffect(() => { alive.current = true; return () => { alive.current = false; pending.current = null; current.current?.cancel(); }; }, []);

  const run = useCallback(async (text: string) => {
    busy.current = true;
    (window as unknown as { __pnaSpoken?: string[] }).__pnaSpoken?.push(text); // (a test can ask to see what was said; nothing else reads it)
    try {
      const playback = await speakText(text, langRef.current === "ru" ? "ur" : "en");
      current.current = playback;
      await playback?.done;
    } catch {
      /* a speech failure never disturbs the exercise: the text is always on screen */
    } finally {
      busy.current = false;
      current.current = null;
      const next = pending.current;
      pending.current = null;
      if (next && alive.current) void run(next);
    }
  }, []);

  const say = useCallback((text: string, mode: "queue" | "now" | "skip" = "queue") => {
    if (!on || !text) return;
    if (!busy.current) { void run(text); return; }
    if (mode === "skip") return;
    if (mode === "now") current.current?.cancel();
    pending.current = text;
  }, [on, run]);

  const stop = useCallback(() => { pending.current = null; current.current?.cancel(); }, []);
  return { say, stop };
}
