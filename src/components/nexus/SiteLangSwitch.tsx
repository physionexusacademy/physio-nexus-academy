"use client";

import { useEffect } from "react";
import { LANG_NAME, markLang, useLang, type Lang } from "@/lib/lang";

/**
 * The one language switch of the whole site (English / Roman Urdu). The choice is shared by the header, footer, search, PNA Teacher, Skills Lab,
 * RehabVerse and the guide (one store, src/lib/lang.ts), so a page is in one language, not a mix. `bar` is the compact form for the header
 * (EN / UR on a phone, the full names on a wide screen); `drawer` is the wide form for the mobile menu.
 */
export function SiteLangSwitch({ variant = "bar" }: { variant?: "bar" | "drawer" }) {
  const [lang, setLang] = useLang();
  useEffect(() => markLang(lang), [lang]);
  const choices: Lang[] = ["en", "ur"];
  return (
    <div className={variant === "drawer" ? "nx-lang nx-lang-wide" : "nx-lang"} role="group" aria-label="Language / Zubaan">
      {choices.map((choice) => (
        <button key={choice} type="button" aria-pressed={lang === choice} aria-label={LANG_NAME[choice]} onClick={() => setLang(choice)} lang={choice === "ur" ? "ur-Latn" : "en"} title={LANG_NAME[choice]}>
          <span className="nx-lang-long">{LANG_NAME[choice]}</span>
          <span className="nx-lang-short" aria-hidden="true">{choice === "en" ? "EN" : "UR"}</span>
        </button>
      ))}
    </div>
  );
}
