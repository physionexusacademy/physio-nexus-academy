"use client";

import { createContext, useContext, type ReactNode } from "react";

/** Navigation between the views of the single /account route. Shared by the shell and the lazily loaded screens. */
export type AccountMode = "landing" | "login" | "register" | "forgot" | "reset";
export type AccountNavApi = { go: (mode: AccountMode, notice?: string) => void; done: () => void };

export const AccountNavContext = createContext<AccountNavApi>({ go: () => undefined, done: () => undefined });
export const useAccountNav = () => useContext(AccountNavContext);

export const accountHref = (mode: AccountMode) => (mode === "landing" ? "/account" : `/account?m=${mode}`);

/** A link that stays a normal link (works without JavaScript) but switches view without a page load. */
export function AccountLink({ mode, className, children }: { mode: AccountMode; className?: string; children: ReactNode }) {
  const nav = useAccountNav();
  return (
    <a href={accountHref(mode)} className={className} onClick={(event) => { event.preventDefault(); nav.go(mode); }}>
      {children}
    </a>
  );
}
