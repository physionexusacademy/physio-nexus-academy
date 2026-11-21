"use client";

import { useEffect, useRef, useState } from "react";
import { Square, Volume2 } from "lucide-react";
import { planSpeech, speakText, supportsSpeech, unlockAudio, type Playback } from "@/lib/speech/voices";

/**
 * A small "Listen" button for a line of guide text that is shown on the page without a 3D model (for example the guide's note above a
 * day's exercises): it plays the recorded male voice for that line. It appears only when the line has a recording in the language shown,
 * so it never stays silent. It stops only its own speech when the page changes (the 3D models keep theirs).
 */
export function ListenLine({ text, lang, className = "" }: { text: string; lang: "en" | "ru"; className?: string }) {
  const [available, setAvailable] = useState(false);
  const [playing, setPlaying] = useState(false);
  const playback = useRef<Playback | null>(null);
  const turn = useRef(0);

  useEffect(() => {
    let cancelled = false;
    setAvailable(false);
    if (!supportsSpeech()) return;
    void planSpeech(text, lang === "ru" ? "ur" : "en").then((plan) => {
      if (!cancelled) setAvailable(plan.mode !== "none");
    });
    return () => {
      cancelled = true;
      turn.current++;
      playback.current?.cancel();
      playback.current = null;
    };
  }, [text, lang]);

  if (!available) return null;

  const toggle = () => {
    if (playing) {
      turn.current++;
      playback.current?.cancel();
      playback.current = null;
      setPlaying(false);
      return;
    }
    unlockAudio(); // this tap is what lets the browser play sound
    const mine = ++turn.current;
    setPlaying(true);
    void speakText(text, lang === "ru" ? "ur" : "en", {
      rate: 0.98,
      isCurrent: () => turn.current === mine,
      onEnd: () => {
        if (turn.current === mine) setPlaying(false);
      },
    }).then((p) => {
      if (turn.current === mine) playback.current = p;
      else p?.cancel();
    });
  };

  return (
    <button
      type="button"
      onClick={toggle}
      aria-pressed={playing}
      className={"inline-flex shrink-0 items-center gap-1 rounded-full border border-teal-300 bg-white px-2.5 py-1 text-xs font-bold text-teal-800 hover:bg-teal-50 " + className}
    >
      {playing ? <Square className="h-3 w-3" aria-hidden="true" /> : <Volume2 className="h-3.5 w-3.5" aria-hidden="true" />}
      {playing ? (lang === "ru" ? "Roken" : "Stop") : lang === "ru" ? "Suniye" : "Listen"}
    </button>
  );
}
