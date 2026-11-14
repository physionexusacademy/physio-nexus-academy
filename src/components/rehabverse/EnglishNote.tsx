"use client";

import { useRvLang } from "./useLang";

/**
 * The RehabVerse landing page opens in Roman Urdu for patients. Search engines read the server-rendered (Roman Urdu) page, so this
 * one English sentence keeps the page clear for English searches ("guided home rehabilitation Pakistan"). It disappears when the
 * visitor already reads English, so nobody sees the same text twice.
 */
export function EnglishNote() {
  const [lang] = useRvLang();
  if (lang !== "ru") return null;
  return (
    <p lang="en" className="mt-2 max-w-xl text-[13px] leading-6 text-slate-500">
      In English: RehabVerse is Physio Nexus Academy&apos;s guided home rehabilitation service — describe your symptoms, a physiotherapist approves your programme, and a 3D virtual guide shows every exercise.
    </p>
  );
}
