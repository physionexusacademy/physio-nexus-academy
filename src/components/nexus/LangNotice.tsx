"use client";

import { usePathname } from "next/navigation";
import { useLang, writeLang } from "@/lib/lang";

/** Pages whose own content follows the language switch (the rest of the page text is English only, which this bar says honestly). */
const TRANSLATED = ["/learn", "/skills", "/rehabverse", "/admin"];

/**
 * A slim note under the header, only when Roman Urdu is chosen on a page whose main text is not translated yet: the menus, the footer and
 * the search are in Roman Urdu on every page, so without this a visitor would wonder why the page text is English.
 */
export function LangNotice() {
  const pathname = usePathname() ?? "/";
  const [lang] = useLang();
  if (lang !== "ur") return null;
  if (TRANSLATED.some((prefix) => pathname === prefix || pathname.startsWith(prefix + "/"))) return null;
  return (
    <div className="nx-lang-notice" role="note">
      <p>
        Is page ka asal content abhi sirf English mein hai. Roman Urdu mein poora ye hain: <a href="/learn">PNA Teacher</a>, <a href="/skills">Clinical Skills Lab</a> aur <a href="/rehabverse">RehabVerse</a>.{" "}
        <button type="button" onClick={() => writeLang("en")}>English par wapas</button>
      </p>
    </div>
  );
}
