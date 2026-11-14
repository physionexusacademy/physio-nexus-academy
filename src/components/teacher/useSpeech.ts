"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { speakText, supportsSpeech, type Playback, type SpeechLang } from "@/lib/speech/voices";

/**
 * Browser text-to-speech (no network, no cost). English with an English voice; Roman Urdu with a Hindi or Urdu voice if the device has
 * one (see lib/speech), otherwise `note` explains that only the text is shown.
 */
export function useSpeech() {
  const [supported, setSupported] = useState(false);
  const [speakingId, setSpeakingId] = useState<string | null>(null);
  const [note, setNote] = useState<string | null>(null);
  const playback = useRef<Playback | null>(null);
  const current = useRef<string | null>(null);

  useEffect(() => {
    setSupported(supportsSpeech());
    return () => {
      playback.current?.cancel();
      try {
        window.speechSynthesis?.cancel();
      } catch {
        /* ignore */
      }
    };
  }, []);

  const stop = useCallback(() => {
    playback.current?.cancel();
    playback.current = null;
    current.current = null;
    try {
      window.speechSynthesis?.cancel();
    } catch {
      /* ignore */
    }
    setSpeakingId(null);
  }, []);

  const speak = useCallback(
    (id: string, text: string, lang: SpeechLang = "en") => {
      if (!supported) return;
      playback.current?.cancel();
      current.current = id;
      setSpeakingId(id);
      void speakText(text, lang, {
        onNote: setNote,
        isCurrent: () => current.current === id,
        onEnd: () => {
          if (current.current === id) {
            current.current = null;
            setSpeakingId((now) => (now === id ? null : now));
          }
        },
      }).then((p) => {
        // A newer line may have started while the voice was being chosen.
        if (current.current === id) playback.current = p;
        else p?.cancel();
      });
    },
    [supported],
  );

  const toggle = useCallback(
    (id: string, text: string, lang: SpeechLang = "en") => {
      if (speakingId === id) stop();
      else speak(id, text, lang);
    },
    [speak, speakingId, stop],
  );

  return { supported, speakingId, speak, stop, toggle, note };
}
