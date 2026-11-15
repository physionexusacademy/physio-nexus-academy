"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Bell, ChevronRight, CornerDownLeft, ExternalLink, LogOut, Menu, PanelLeftClose, PanelLeftOpen, Search, X } from "lucide-react";
import { ADMIN_NAV, ADMIN_NAV_FLAT, totalWaiting, type AdminNavItem } from "@/lib/admin/nav";
import type { AdminCounts } from "@/lib/admin/types";
import "./admin.css";

const COLLAPSE_KEY = "pna-admin-collapsed";

const isActive = (pathname: string, href: string) => (href === "/admin" ? pathname === "/admin" : pathname === href || pathname.startsWith(href + "/"));

type PaletteEntry = { label: string; hint: string; href?: string; external?: boolean; icon: AdminNavItem["icon"]; keywords: string; badge?: number; action?: "signout" };

/**
 * The admin workspace: a full-screen app shell (grouped sidebar with live "waiting for you" badges, a top bar with the clock and a command
 * palette on Ctrl/⌘ K). It only changes how the admin looks and moves; every page and action inside it is untouched.
 */
export function AdminShell({ email, counts, signOut, children }: { email: string; counts: AdminCounts; signOut: () => Promise<void>; children: React.ReactNode }) {
  const pathname = usePathname() ?? "/admin";
  const [collapsed, setCollapsed] = useState(false);
  const [drawer, setDrawer] = useState(false);
  const [palette, setPalette] = useState(false);
  const [now, setNow] = useState<string>("");
  const waiting = totalWaiting(counts);
  const current = ADMIN_NAV_FLAT.find((item) => isActive(pathname, item.href) && item.href !== "/admin") ?? ADMIN_NAV_FLAT[0];

  useEffect(() => {
    try {
      setCollapsed(localStorage.getItem(COLLAPSE_KEY) === "1");
    } catch {
      /* default */
    }
  }, []);
  useEffect(() => {
    const format = new Intl.DateTimeFormat("en-GB", { timeZone: "Asia/Karachi", weekday: "short", hour: "2-digit", minute: "2-digit" });
    const tick = () => setNow(format.format(new Date()));
    tick();
    const id = window.setInterval(tick, 30_000);
    return () => window.clearInterval(id);
  }, []);
  useEffect(() => setDrawer(false), [pathname]);
  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "k") {
        event.preventDefault();
        setPalette((value) => !value);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  const toggleCollapse = () => {
    setCollapsed((value) => {
      try {
        localStorage.setItem(COLLAPSE_KEY, value ? "0" : "1");
      } catch {
        /* ignore */
      }
      return !value;
    });
  };

  const entries: PaletteEntry[] = useMemo(
    () => [
      ...ADMIN_NAV_FLAT.map((item): PaletteEntry => ({ label: item.label, hint: item.blurb, href: item.href, icon: item.icon, keywords: `${item.label} ${item.blurb} ${item.keywords ?? ""}`.toLowerCase(), badge: item.badge ? counts[item.badge] : undefined })),
      { label: "Open the live website", hint: "View physionexusacademy.com in a new tab", href: "/", external: true, icon: ExternalLink, keywords: "website public site live home" },
      { label: "Sign out", hint: "End this admin session", icon: LogOut, keywords: "logout sign out exit", action: "signout" },
    ],
    [counts],
  );

  return (
    <div className="ad-root" data-collapsed={collapsed ? "1" : "0"} data-drawer={drawer ? "1" : "0"}>
      <a href="#ad-content" className="ad-skip">Skip to content</a>
      <button type="button" className="ad-scrim" aria-label="Close menu" onClick={() => setDrawer(false)} tabIndex={drawer ? 0 : -1} />

      <aside className="ad-side" aria-label="Admin navigation">
        <div className="ad-brand">
          <span className="ad-logo"><Image src="/images/pna-logo.png" alt="" width={36} height={36} /></span>
          <span className="ad-brand-text"><strong>PNA Admin</strong><small>Mission control</small></span>
          <button type="button" className="ad-collapse" onClick={toggleCollapse} aria-label={collapsed ? "Expand the sidebar" : "Collapse the sidebar"}>
            {collapsed ? <PanelLeftOpen className="h-4 w-4" aria-hidden="true" /> : <PanelLeftClose className="h-4 w-4" aria-hidden="true" />}
          </button>
          <button type="button" className="ad-drawer-close" onClick={() => setDrawer(false)} aria-label="Close menu"><X className="h-5 w-5" aria-hidden="true" /></button>
        </div>

        <button type="button" className="ad-find" onClick={() => setPalette(true)} aria-label="Search and jump to a section (Ctrl K)">
          <Search className="h-4 w-4" aria-hidden="true" />
          <span className="ad-find-text">Jump to…</span>
          <kbd>Ctrl K</kbd>
        </button>

        <nav className="ad-nav">
          {ADMIN_NAV.map((group) => (
            <div key={group.id} className="ad-group">
              <p className="ad-group-label">{group.label}</p>
              {group.items.map((item) => {
                const active = isActive(pathname, item.href);
                const badge = item.badge ? counts[item.badge] : 0;
                return (
                  <Link key={item.href} href={item.href} prefetch={false} className="ad-link" aria-current={active ? "page" : undefined} title={item.label}>
                    <span className="ad-ico"><item.icon className="h-[18px] w-[18px]" aria-hidden="true" /></span>
                    <span className="ad-link-text">{item.label}</span>
                    {badge > 0 ? <span className="ad-badge" aria-label={`${badge} waiting`}>{badge > 99 ? "99+" : badge}</span> : null}
                  </Link>
                );
              })}
            </div>
          ))}
        </nav>

        <div className="ad-user">
          <span className="ad-avatar" aria-hidden="true">{(email || "A").slice(0, 1).toUpperCase()}</span>
          <span className="ad-user-text"><strong>Administrator</strong><small title={email}>{email}</small></span>
          <form action={signOut}>
            <button type="submit" className="ad-signout" aria-label="Sign out" title="Sign out"><LogOut className="h-4 w-4" aria-hidden="true" /></button>
          </form>
        </div>
      </aside>

      <div className="ad-col">
        <header className="ad-top">
          <button type="button" className="ad-burger" onClick={() => setDrawer(true)} aria-label="Open menu"><Menu className="h-5 w-5" aria-hidden="true" /></button>
          <nav className="ad-crumbs" aria-label="Breadcrumb">
            <span>Admin</span>
            <ChevronRight className="h-3.5 w-3.5" aria-hidden="true" />
            <strong>{current.label}</strong>
          </nav>
          <span className="ad-spacer" />
          <button type="button" className="ad-search" onClick={() => setPalette(true)} aria-label="Search and jump to a section (Ctrl K)">
            <Search className="h-4 w-4" aria-hidden="true" />
            <span>Search or jump to…</span>
            <kbd>Ctrl K</kbd>
          </button>
          {now ? <span className="ad-clock" title="Pakistan time"><i />{now}</span> : null}
          <Link href="/admin" prefetch={false} className="ad-bell" aria-label={waiting ? `${waiting} items waiting for you` : "Nothing is waiting for you"} title={waiting ? `${waiting} waiting` : "All clear"}>
            <Bell className="h-[18px] w-[18px]" aria-hidden="true" />
            {waiting > 0 ? <b>{waiting > 99 ? "99+" : waiting}</b> : null}
          </Link>
          <a href="/" target="_blank" rel="noopener noreferrer" className="ad-live"><ExternalLink className="h-4 w-4" aria-hidden="true" /><span>Live site</span></a>
        </header>

        <div id="ad-content" className="ad-main" tabIndex={-1}>
          <div className="ad-content" key={pathname}>{children}</div>
        </div>
      </div>

      {palette ? <Palette entries={entries} onClose={() => setPalette(false)} signOut={signOut} /> : null}
    </div>
  );
}

function Palette({ entries, onClose, signOut }: { entries: PaletteEntry[]; onClose: () => void; signOut: () => Promise<void> }) {
  const [query, setQuery] = useState("");
  const [active, setActive] = useState(0);
  const input = useRef<HTMLInputElement>(null);
  const signOutForm = useRef<HTMLFormElement>(null);
  const list = useMemo(() => {
    const words = query.toLowerCase().split(/\s+/).filter(Boolean);
    return entries.filter((entry) => words.every((word) => entry.keywords.includes(word)));
  }, [entries, query]);

  useEffect(() => input.current?.focus(), []);
  useEffect(() => setActive(0), [query]);

  const run = useCallback(
    (entry: PaletteEntry | undefined) => {
      if (!entry) return;
      if (entry.action === "signout") {
        signOutForm.current?.requestSubmit();
        return;
      }
      onClose();
      if (entry.external && entry.href) window.open(entry.href, "_blank", "noopener,noreferrer");
      else if (entry.href) window.location.assign(entry.href);
    },
    [onClose],
  );

  const onKey = (event: React.KeyboardEvent) => {
    if (event.key === "Escape") onClose();
    else if (event.key === "ArrowDown") {
      event.preventDefault();
      setActive((value) => Math.min(value + 1, Math.max(list.length - 1, 0)));
    } else if (event.key === "ArrowUp") {
      event.preventDefault();
      setActive((value) => Math.max(value - 1, 0));
    } else if (event.key === "Enter") {
      event.preventDefault();
      run(list[active]);
    }
  };

  return (
    <div className="ad-pal-wrap" role="presentation" onMouseDown={(event) => event.target === event.currentTarget && onClose()}>
      <div className="ad-pal" role="dialog" aria-modal="true" aria-label="Search the admin" onKeyDown={onKey}>
        <div className="ad-pal-head">
          <Search className="h-5 w-5" aria-hidden="true" />
          <input ref={input} value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Type to find a section: orders, workshops, messages…" aria-label="Search the admin" aria-controls="ad-pal-list" />
          <kbd>Esc</kbd>
        </div>
        <ul id="ad-pal-list" className="ad-pal-list" role="listbox">
          {list.map((entry, index) => (
            <li key={entry.label} role="option" aria-selected={index === active}>
              <button type="button" className="ad-pal-item" data-active={index === active ? "1" : "0"} onMouseEnter={() => setActive(index)} onClick={() => run(entry)}>
                <span className="ad-ico"><entry.icon className="h-[18px] w-[18px]" aria-hidden="true" /></span>
                <span className="ad-pal-text"><strong>{entry.label}</strong><small>{entry.hint}</small></span>
                {entry.badge ? <span className="ad-badge">{entry.badge}</span> : null}
                {index === active ? <CornerDownLeft className="h-4 w-4 ad-pal-enter" aria-hidden="true" /> : null}
              </button>
            </li>
          ))}
          {!list.length ? <li className="ad-pal-empty">Nothing matches “{query}”.</li> : null}
        </ul>
        <p className="ad-pal-foot"><span><kbd>↑</kbd><kbd>↓</kbd> move</span><span><kbd>Enter</kbd> open</span><span><kbd>Esc</kbd> close</span></p>
        <form ref={signOutForm} action={signOut} className="hidden" />
      </div>
    </div>
  );
}
