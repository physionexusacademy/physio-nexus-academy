"use client";

import type { ReactNode } from "react";
import { useLang } from "@/lib/lang";

/**
 * One line of text in both languages, for a server component: `<Ur en="Search" ur="Dhoondein" />`. Shows English until the page has loaded
 * and then the language the visitor chose with the site switch (English by default, so crawlers and first paint always read English).
 */
export function Ur({ en, ur }: { en: ReactNode; ur: ReactNode }) {
  const [lang] = useLang();
  return <>{lang === "ur" ? ur : en}</>;
}
