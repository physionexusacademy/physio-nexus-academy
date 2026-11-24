/**
 * Shared learner language (English / Roman Urdu), the same switch the PNA Teacher uses:
 * one choice follows the learner across Skills Lab, lessons and flashcards. Tiny and dependency-free so
 * it can sit in any client component without pulling the Teacher store into the worker.
 */
import { useCallback, useSyncExternalStore } from "react";

export type Lang = "en" | "ur";

const LANG_KEY = "pna-teacher-lang-v1";
const PROFILE_KEY = "pna-teacher-profile-v1";
/** The RehabVerse area had its own choice ("en" / "ru") before there was one switch for the whole site; a saved choice is still honoured. */
const LEGACY_RV_KEY = "pna-rv-lang";
const EVENT = "pna-teacher-updated";

function read(): Lang {
  try {
    const stored = JSON.parse(window.localStorage.getItem(LANG_KEY) ?? "null");
    if (stored === "ur" || stored === "en") return stored;
    const profile = JSON.parse(window.localStorage.getItem(PROFILE_KEY) ?? "null");
    if (profile && profile.lang === "ur") return "ur";
    const legacy = window.localStorage.getItem(LEGACY_RV_KEY);
    if (legacy === "ru") return "ur";
  } catch {
    /* private mode or corrupted storage: default language */
  }
  return "en";
}

/** True when this browser already holds a language choice (made on the switch, in the Teacher profile or in the earlier RehabVerse switch). */
export function hasLangChoice(): boolean {
  try {
    return window.localStorage.getItem(LANG_KEY) !== null || window.localStorage.getItem(LEGACY_RV_KEY) !== null;
  } catch {
    return true; // storage blocked: leave the language alone
  }
}

export function writeLang(lang: Lang) {
  try {
    window.localStorage.setItem(LANG_KEY, JSON.stringify(lang));
    const profile = JSON.parse(window.localStorage.getItem(PROFILE_KEY) ?? "null");
    if (profile && typeof profile === "object" && profile.lang !== lang) window.localStorage.setItem(PROFILE_KEY, JSON.stringify({ ...profile, lang }));
  } catch {
    /* the switch still works for this page view */
  }
  window.dispatchEvent(new Event(EVENT));
}

/** Marks the page with the chosen language (for styles, tests and assistive tools). Called by the language switch and once at start. */
export function markLang(lang: Lang) {
  try {
    document.documentElement.dataset.siteLang = lang;
  } catch {
    /* no document (server) */
  }
}

function subscribe(callback: () => void) {
  window.addEventListener(EVENT, callback);
  window.addEventListener("storage", callback);
  return () => {
    window.removeEventListener(EVENT, callback);
    window.removeEventListener("storage", callback);
  };
}

/** Current language and a setter. English on the server and on first paint, then the stored choice. */
export function useLang(): [Lang, (lang: Lang) => void] {
  const lang = useSyncExternalStore(subscribe, read, () => "en" as Lang);
  const set = useCallback((next: Lang) => {
    writeLang(next);
    markLang(next);
  }, []);
  return [lang, set];
}

/** The two languages of the site, with their names in plain words. */
export const LANG_NAME: Record<Lang, string> = { en: "English", ur: "Roman Urdu" };
