"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import { AccountForm } from "@/components/student/AccountForms";
import { MyPna } from "@/components/student/MyPna";
import { hasStudentSession, SESSION_EVENT } from "@/lib/student/outbox";

/**
 * One route (/account) for everything a student does with their account, so the site ships a single
 * page instead of six. The server-rendered landing page is the default view; ?m=login|register|forgot|reset
 * shows a form; and a signed-in student sees their My PNA record instead of the landing page.
 */
export type AccountMode = "landing" | "login" | "register" | "forgot" | "reset";
const modes: AccountMode[] = ["login", "register", "forgot", "reset"];

type Nav = { go: (mode: AccountMode, notice?: string) => void; done: () => void };
const AccountNav = createContext<Nav>({ go: () => undefined, done: () => undefined });
export const useAccountNav = () => useContext(AccountNav);

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

const bannerText: Record<string, string> = { deleted: "Your PNA record has been deleted. Your learning on this device is unchanged." };

export function AccountApp({ children }: { children: ReactNode }) {
  const [view, setView] = useState<{ mode: AccountMode; signedIn: boolean; notice: string } | null>(null);

  const read = useCallback(() => {
    const params = new URLSearchParams(window.location.search);
    const m = params.get("m") as AccountMode | null;
    setView({ mode: m && modes.includes(m) ? m : "landing", signedIn: hasStudentSession(), notice: params.get("notice") ?? "" });
    window.dispatchEvent(new Event(SESSION_EVENT));
  }, []);

  useEffect(() => {
    read();
    window.addEventListener("popstate", read);
    return () => window.removeEventListener("popstate", read);
  }, [read]);

  const nav = useMemo<Nav>(() => ({
    go: (mode, notice) => {
      const query = [mode === "landing" ? "" : `m=${mode}`, notice ? `notice=${notice}` : ""].filter(Boolean).join("&");
      window.history.pushState(null, "", `/account${query ? `?${query}` : ""}`);
      window.scrollTo(0, 0);
      read();
    },
    done: () => {
      window.history.replaceState(null, "", "/account");
      window.scrollTo(0, 0);
      read();
    },
  }), [read]);

  let body: ReactNode = children; // before the browser has checked who is here, show the server-rendered landing page
  if (view) {
    if (view.mode === "reset") {
      body = <main className="acct-page acct-center"><div className="container-content"><AccountForm key="reset" mode="reset" /></div></main>;
    } else if (view.signedIn) {
      body = <main className="acct-page"><div className="container-content"><MyPna /></div></main>;
    } else if (view.mode !== "landing") {
      body = <main className="acct-page acct-center"><div className="container-content"><AccountForm key={view.mode} mode={view.mode} /></div></main>;
    } else if (bannerText[view.notice]) {
      body = <><div className="container-content"><p className="acct-notice acct-banner" role="status">{bannerText[view.notice]}</p></div>{children}</>;
    }
  }
  return <AccountNav.Provider value={nav}>{body}</AccountNav.Provider>;
}
