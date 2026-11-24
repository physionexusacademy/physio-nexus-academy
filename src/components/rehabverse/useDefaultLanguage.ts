"use client";

import { useEffect } from "react";
import { hasLangChoice, markLang, writeLang } from "@/lib/lang";

/**
 * A patient who chose Roman Urdu when they signed up sees Roman Urdu from the first screen, on any phone they sign in on. Only when this browser has no language choice yet:
 * a choice made on the language switch always wins, and nothing is changed for a patient who prefers English.
 */
export function useDefaultLanguage(preferred: "en" | "ru" | undefined) {
  useEffect(() => {
    if (preferred !== "ru" || hasLangChoice()) return;
    writeLang("ur");
    markLang("ur");
  }, [preferred]);
}
