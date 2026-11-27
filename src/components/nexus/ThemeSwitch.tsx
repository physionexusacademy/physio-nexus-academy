"use client";

import { useEffect, useState } from "react";
import { Moon, Sun } from "lucide-react";
import { currentTheme, setTheme, THEME_EVENT, type Theme } from "@/lib/theme";
import { useLang } from "@/lib/lang";

/**
 * Dark / light switch for the whole site (src/lib/theme.ts). `bar`: one round button in the header that flips the look;
 * `drawer`: two wide choices in the mobile menu, like the language switch. Purely in the browser: no request to the server.
 */
export function ThemeSwitch({ variant = "bar" }: { variant?: "bar" | "drawer" }) {
  const [lang] = useLang();
  const [theme, setLocal] = useState<Theme>("dark");
  useEffect(() => {
    setLocal(currentTheme());
    const sync = (event: Event) => setLocal((event as CustomEvent<Theme>).detail ?? currentTheme());
    window.addEventListener(THEME_EVENT, sync);
    return () => window.removeEventListener(THEME_EVENT, sync);
  }, []);
  const ur = lang === "ur";
  const name = (t: Theme) => (t === "dark" ? "Dark mode" : "Light mode");

  if (variant === "drawer") {
    return (
      <div className="nx-lang nx-lang-wide" role="group" aria-label={ur ? "Website ka rang" : "Website look"}>
        {(["dark", "light"] as Theme[]).map((choice) => (
          <button key={choice} type="button" aria-pressed={theme === choice} onClick={() => setTheme(choice)}>
            <span className="inline-flex items-center gap-2">
              {choice === "dark" ? <Moon className="h-4 w-4" aria-hidden="true" /> : <Sun className="h-4 w-4" aria-hidden="true" />}
              {name(choice)}
            </span>
          </button>
        ))}
      </div>
    );
  }

  const next: Theme = theme === "dark" ? "light" : "dark";
  const label = ur ? `${name(next)} par jayein` : `Switch to ${name(next).toLowerCase()}`;
  return (
    <button type="button" className="nx-icon-btn nx-theme-btn" onClick={() => setTheme(next)} aria-label={label} title={label}>
      {theme === "dark" ? <Sun className="h-[18px] w-[18px]" aria-hidden="true" /> : <Moon className="h-[18px] w-[18px]" aria-hidden="true" />}
    </button>
  );
}
