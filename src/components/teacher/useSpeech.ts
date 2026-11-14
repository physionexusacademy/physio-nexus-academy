"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { speakText, stopSpeaking, supportsSpeech, unlockAudio, type Playback, type SpeechLang } from "@/lib/speech/voices";
import { recordedPacks } from "@/lib/speech/recorded";

/**
 * The PNA Teacher's recorded voice for a lesson (see lib/speech/recorded.ts). `supported` is true only when this browser can play it and
 * the lesson's recording exists (`pack`, for example "lesson-abpi-and-glucose-exercise-safety"), so no Listen button appears for a lesson
 * that has no recording. English only: the lesson player does not offer it in Roman Urdu. `note` says why a line was not spoken.
 */
export function useSpeech(pack?: string) {
  const [supported, setSupported] = useState(false);
  const [speakingId, setSpeakingId] = useState<string | null>(null);
  const [note, setNote] = useState<string | null>(null);
  const playback = useRef<Playback | null>(null);
  const current = useRef<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    if (!supportsSpeech()) return;
    void recordedPacks().then((packs) => {
      if (!cancelled) setSupported(pack ? packs.includes(pack) : packs.length > 0);
    });
    return () => {
      cancelled = true;
      playback.current?.cancel();
      stopSpeaking();
    };
  }, [pack]);

  const stop = useCallback(() => {
    playback.current?.cancel();
    playback.current = null;
    current.current = null;
    stopSpeaking();
    setSpeakingId(null);
  }, []);

  const speak = useCallback(
    (id: string, text: string, lang: SpeechLang = "en") => {
      if (!supported) return;
      playback.current?.cancel();
      current.current = id;
      setSpeakingId(id);
      unlockAudio();
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
        // A newer line may have started while the recording was being looked up.
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
