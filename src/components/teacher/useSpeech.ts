"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { speakText, stopSpeaking, supportsSpeech, unlockAudio, type Playback, type SpeechLang } from "@/lib/speech/voices";
import { recordedPacks } from "@/lib/speech/recorded";

/**
 * The PNA Teacher's recorded voice for a lesson (see lib/speech/recorded.ts). `has(lang)` is true only when this browser can play it and
 * the lesson's recording exists in that language (`pack`, for example "lesson-abpi-and-glucose-exercise-safety"; the Roman Urdu pack is
 * "ur-" + pack), so no Listen button appears for a lesson that has no recording. `note` says why a line was not spoken.
 */
export function useSpeech(pack?: string) {
  const [packs, setPacks] = useState<string[]>([]);
  const [speakingId, setSpeakingId] = useState<string | null>(null);
  const [note, setNote] = useState<string | null>(null);
  const playback = useRef<Playback | null>(null);
  const current = useRef<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    if (!supportsSpeech()) return;
    void recordedPacks().then((packs) => {
      if (!cancelled) setPacks(packs);
    });
    return () => {
      cancelled = true;
      playback.current?.cancel();
      stopSpeaking();
    };
  }, [pack]);

  const has = useCallback(
    (lang: SpeechLang) => (pack ? packs.includes(lang === "ur" ? `ur-${pack}` : pack) : packs.length > 0),
    [pack, packs],
  );
  const supported = packs.length > 0 && (has("en") || has("ur"));

  const stop = useCallback(() => {
    playback.current?.cancel();
    playback.current = null;
    current.current = null;
    stopSpeaking();
    setSpeakingId(null);
  }, []);

  const speak = useCallback(
    (id: string, text: string, lang: SpeechLang = "en") => {
      if (!has(lang)) return;
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
    [has],
  );

  const toggle = useCallback(
    (id: string, text: string, lang: SpeechLang = "en") => {
      if (speakingId === id) stop();
      else speak(id, text, lang);
    },
    [speak, speakingId, stop],
  );

  return { supported, has, speakingId, speak, stop, toggle, note };
}
