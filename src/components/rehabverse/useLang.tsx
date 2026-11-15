"use client";

import { useCallback, useMemo } from "react";
import { useLang } from "@/lib/lang";
import type { Lang } from "./ExercisePlayer";

/**
 * RehabVerse follows the one language switch of the whole site (src/lib/lang.ts): "ru" here is "ur" (Roman Urdu) there. A choice saved by the
 * RehabVerse-only switch of the earlier versions is still honoured (see lang.ts).
 */
export function useRvLang(_initial: Lang = "en") {
  const [site, setSite] = useLang();
  const lang: Lang = site === "ur" ? "ru" : "en";
  const setLang = useCallback((next: Lang) => setSite(next === "ru" ? "ur" : "en"), [setSite]);
  return useMemo(() => [lang, setLang] as const, [lang, setLang]);
}

/** Kept so the layout needs no change: the language lives in the site-wide store, not in this provider. */
export function RvLangProvider({ children }: { children: React.ReactNode; initial?: Lang }) {
  return <>{children}</>;
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
