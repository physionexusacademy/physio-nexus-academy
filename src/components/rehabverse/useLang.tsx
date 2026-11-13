"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import type { Lang } from "./ExercisePlayer";

const KEY = "pna-rv-lang";
type Ctx = readonly [Lang, (next: Lang) => void];
const LangContext = createContext<Ctx | null>(null);

function useLocalLang(initial: Lang): Ctx {
  const [lang, setLangState] = useState<Lang>(initial);
  useEffect(() => {
    const saved = typeof window !== "undefined" ? window.localStorage.getItem(KEY) : null;
    if (saved === "en" || saved === "ru") setLangState(saved);
  }, []);
  const setLang = useCallback((next: Lang) => {
    setLangState(next);
    try {
      window.localStorage.setItem(KEY, next);
    } catch {
      // private mode: the choice just is not remembered
    }
  }, []);
  return useMemo(() => [lang, setLang] as const, [lang, setLang]);
}

/** One language choice for the whole RehabVerse area (English / Roman Urdu), remembered on this device. */
export function RvLangProvider({ children, initial = "ru" }: { children: React.ReactNode; initial?: Lang }) {
  const value = useLocalLang(initial);
  return <LangContext.Provider value={value}>{children}</LangContext.Provider>;
}

/** The shared choice when inside the provider; otherwise a local one (for standalone use). */
export function useRvLang(initial: Lang = "ru") {
  const shared = useContext(LangContext);
  const local = useLocalLang(initial);
  return shared ?? local;
}

/** Inline bilingual text: `<T en="Hello" ru="Assalam-o-alaikum" />`. */
export function T({ en, ru }: { en: React.ReactNode; ru: React.ReactNode }) {
  const [lang] = useRvLang();
  return <>{lang === "ru" ? ru : en}</>;
}

export function LangToggle({ lang, onChange, className }: { lang?: Lang; onChange?: (lang: Lang) => void; className?: string }) {
  const [shared, setShared] = useRvLang();
  const value = lang ?? shared;
  const change = onChange ?? setShared;
  return (
    <div className={"inline-flex rounded-full border border-slate-200 bg-white p-0.5 " + (className ?? "")} role="group" aria-label="Language">
      {(["ru", "en"] as Lang[]).map((l) => (
        <button key={l} type="button" onClick={() => change(l)} aria-pressed={value === l} className={"rounded-full px-3 py-1 text-xs font-bold " + (value === l ? "bg-[#0a1f3d] text-white" : "text-slate-600")}>
          {l === "ru" ? "Roman Urdu" : "English"}
        </button>
      ))}
    </div>
  );
}
