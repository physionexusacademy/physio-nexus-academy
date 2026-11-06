"use client";

import { useCallback, useEffect, useRef, useState } from "react";

/**
 * Browser text-to-speech (no network, no cost). English only: Roman Urdu read
 * by an English voice sounds wrong, so the UI hides voice in Urdu mode.
 */
export function useSpeech() {
  const [supported, setSupported] = useState(false);
  const [speakingId, setSpeakingId] = useState<string | null>(null);
  const voiceRef = useRef<SpeechSynthesisVoice | null>(null);

  useEffect(() => {
    if (typeof window === "undefined" || !("speechSynthesis" in window) || typeof SpeechSynthesisUtterance === "undefined") return;
    setSupported(true);
    const synth = window.speechSynthesis;
    const chooseVoice = () => {
      const voices = synth.getVoices().filter((voice) => voice.lang.toLowerCase().startsWith("en"));
      voiceRef.current =
        voices.find((voice) => /en-(in|pk)/i.test(voice.lang)) ??
        voices.find((voice) => /en-gb/i.test(voice.lang)) ??
        voices.find((voice) => voice.default) ??
        voices[0] ??
        null;
    };
    chooseVoice();
    synth.addEventListener?.("voiceschanged", chooseVoice);
    return () => {
      synth.removeEventListener?.("voiceschanged", chooseVoice);
      try {
        synth.cancel();
      } catch {
        /* ignore */
      }
    };
  }, []);

  const stop = useCallback(() => {
    try {
      window.speechSynthesis?.cancel();
    } catch {
      /* ignore */
    }
    setSpeakingId(null);
  }, []);

  const speak = useCallback(
    (id: string, text: string) => {
      if (!supported) return;
      const synth = window.speechSynthesis;
      try {
        synth.cancel();
        const utterance = new SpeechSynthesisUtterance(text);
        if (voiceRef.current) utterance.voice = voiceRef.current;
        utterance.lang = voiceRef.current?.lang ?? "en-GB";
        utterance.rate = 0.97;
        utterance.onend = () => setSpeakingId((current) => (current === id ? null : current));
        utterance.onerror = () => setSpeakingId((current) => (current === id ? null : current));
        setSpeakingId(id);
        synth.speak(utterance);
      } catch {
        setSpeakingId(null);
      }
    },
    [supported],
  );

  const toggle = useCallback(
    (id: string, text: string) => {
      if (speakingId === id) stop();
      else speak(id, text);
    },
    [speak, speakingId, stop],
  );

  return { supported, speakingId, speak, stop, toggle };
}
