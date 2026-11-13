"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { usePathname } from "next/navigation";
import Image from "next/image";
import { ArrowRight, CalendarDays, ChevronDown, Flame, Home, Menu, Search, Trophy, X, Zap } from "lucide-react";
import { visibleWings, wingForPath, type AcademyWing } from "@/lib/academy-map";
import { getUnifiedProgress } from "@/lib/unified-progress";
import { hasStudentSession, SESSION_EVENT } from "@/lib/student/outbox";
import { InstallApp } from "@/components/InstallApp";
import { AcademyIcon } from "@/components/nexus/AcademyIcon";
import { CommandPalette } from "@/components/nexus/CommandPalette";

/** Opens the command palette from anywhere (e.g. the homepage search). */
export const OPEN_SEARCH_EVENT = "pna:open-search";

function useStudentPass() {
  const [pass, setPass] = useState<{ xp: number; streak: number } | null>(null);
  useEffect(() => {
    const read = () => {
      try {
        const progress = getUnifiedProgress();
        setPass({ xp: progress.totalXP, streak: progress.currentStreak });
      } catch {
        setPass({ xp: 0, streak: 0 });
      }
    };
    read();
    window.addEventListener("pna-unified-progress-updated", read);
    window.addEventListener("storage", read);
    return () => {
      window.removeEventListener("pna-unified-progress-updated", read);
      window.removeEventListener("storage", read);
    };
  }, []);
  return pass;
}

export function Header({ atlasPublished = true }: { atlasPublished?: boolean }) {
  const pathname = usePathname() ?? "/";
  const wings = visibleWings(atlasPublished);
  const activeWing = wingForPath(pathname);
  const [open, setOpen] = useState(false);
  const [openWing, setOpenWing] = useState<AcademyWing["id"] | null>(null);
  const [searchOpen, setSearchOpen] = useState(false);
  const pass = useStudentPass();
  const [signedIn, setSignedIn] = useState(false);
  useEffect(() => {
    const sync = () => setSignedIn(hasStudentSession());
    sync();
    window.addEventListener(SESSION_EVENT, sync);
    return () => window.removeEventListener(SESSION_EVENT, sync);
  }, [pathname]);
  const passHref = signedIn ? "/account" : "/#student-pass";
  const headerRef = useRef<HTMLElement>(null);
  const touchStart = useRef<{ x: number; y: number } | null>(null);
  const hoverTimer = useRef<number | null>(null);

  const closeAll = useCallback(() => {
    setOpen(false);
    setOpenWing(null);
  }, []);

  // Close menus whenever the page changes.
  useEffect(() => closeAll(), [pathname, closeAll]);

  // Keyboard: Ctrl/⌘+K or "/" opens search; Escape closes menus.
  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      const target = event.target as HTMLElement | null;
      const typing = !!target && (target.isContentEditable || /^(INPUT|TEXTAREA|SELECT)$/.test(target.tagName));
      if ((event.key === "k" || event.key === "K") && (event.metaKey || event.ctrlKey)) {
        event.preventDefault();
        setSearchOpen(true);
      } else if (event.key === "/" && !typing) {
        event.preventDefault();
        setSearchOpen(true);
      } else if (event.key === "Escape") {
        closeAll();
      }
    };
    const onOpenSearch = () => setSearchOpen(true);
    window.addEventListener("keydown", onKey);
    window.addEventListener(OPEN_SEARCH_EVENT, onOpenSearch);
    return () => {
      window.removeEventListener("keydown", onKey);
      window.removeEventListener(OPEN_SEARCH_EVENT, onOpenSearch);
    };
  }, [closeAll]);

  // Click outside closes the mega menu.
  useEffect(() => {
    if (!openWing) return;
    const onDown = (event: MouseEvent) => {
      if (headerRef.current && !headerRef.current.contains(event.target as Node)) setOpenWing(null);
    };
    document.addEventListener("mousedown", onDown);
    return () => document.removeEventListener("mousedown", onDown);
  }, [openWing]);

  // While the mobile menu is open, a left→right swipe closes it. (Swiping never opens the
  // menu: sideways swipes are needed for the 3D patient, sliders and scrolling content.)
  useEffect(() => {
    if (!open) return;
    const onStart = (event: TouchEvent) => {
      if (event.touches.length !== 1 || (window.visualViewport?.scale ?? 1) > 1.05) {
        touchStart.current = null;
        return;
      }
      touchStart.current = { x: event.touches[0].clientX, y: event.touches[0].clientY };
    };
    const onEnd = (event: TouchEvent) => {
      if (!touchStart.current || event.changedTouches.length !== 1) return;
      const dx = event.changedTouches[0].clientX - touchStart.current.x;
      const dy = event.changedTouches[0].clientY - touchStart.current.y;
      touchStart.current = null;
      if (dx > 70 && Math.abs(dx) > Math.abs(dy) * 1.25) setOpen(false);
    };
    window.addEventListener("touchstart", onStart, { passive: true });
    window.addEventListener("touchend", onEnd, { passive: true });
    return () => {
      window.removeEventListener("touchstart", onStart);
      window.removeEventListener("touchend", onEnd);
    };
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const overflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    // Floating buttons and the dock step aside while the menu is open.
    document.body.dataset.nxMenu = "open";
    return () => {
      document.body.style.overflow = overflow;
      delete document.body.dataset.nxMenu;
    };
  }, [open]);

  const hoverOpen = (id: AcademyWing["id"]) => {
    if (hoverTimer.current) window.clearTimeout(hoverTimer.current);
    hoverTimer.current = window.setTimeout(() => setOpenWing(id), 120);
  };
  const hoverCancel = () => {
    if (hoverTimer.current) window.clearTimeout(hoverTimer.current);
  };

  const megaWing = wings.find((wing) => wing.id === openWing) ?? null;
  const isCurrent = (href: string) => (href === "/" ? pathname === "/" : pathname === href || pathname.startsWith(href + "/"));

  return (
    <header ref={headerRef} className="nx-bar" onMouseLeave={() => { hoverCancel(); setOpenWing(null); }}>
      <div className="container-content nx-bar-inner">
        <a href="/" className="nx-brand" onClick={closeAll} aria-label="Physio Nexus Academy — home">
          <Image src="/images/pna-logo.png" alt="Physio Nexus Academy logo" width={40} height={40} className="nx-brand-logo" priority />
          <span className="min-w-0">
            <span className="nx-brand-name">Physio Nexus Academy</span>
            <span className="nx-brand-sub">CPD Provider · #791052</span>
          </span>
        </a>

        {/* Mobile menu toggle — first expandable control in the header (kept for automation), shown last. */}
        <button
          type="button"
          className="nx-menu-btn order-last"
          aria-label={open ? "Close menu" : "Open menu"}
          aria-expanded={open}
          aria-controls="nx-mobile-drawer"
          onClick={() => setOpen((value) => !value)}
        >
          {open ? <X className="h-6 w-6" aria-hidden="true" /> : <Menu className="h-6 w-6" aria-hidden="true" />}
        </button>

        <nav className="nx-wings" aria-label="Main navigation">
          {wings.map((wing) => (
            <button
              key={wing.id}
              type="button"
              className="nx-wing-btn"
              aria-expanded={openWing === wing.id}
              aria-controls="nx-mega"
              data-active={activeWing === wing.id}
              onClick={() => setOpenWing((value) => (value === wing.id ? null : wing.id))}
              onMouseEnter={() => hoverOpen(wing.id)}
            >
              {wing.label}
              <ChevronDown className="nx-chevron" aria-hidden="true" />
            </button>
          ))}
        </nav>

        <div className="nx-bar-actions">
          <button type="button" className="nx-search-btn" onClick={() => setSearchOpen(true)} aria-label="Search the academy (Ctrl K)" aria-haspopup="dialog">
            <Search className="h-4 w-4" aria-hidden="true" />
            <span className="nx-search-label">Search academy</span>
            <kbd>Ctrl K</kbd>
          </button>
          <a href="/daily-challenge" className="nx-pill-challenge">
            <Trophy className="h-4 w-4" aria-hidden="true" /> Daily Challenge
          </a>
          <a href={passHref} className="nx-pass" aria-label={pass && pass.xp > 0 ? `Your student pass: ${pass.xp} XP, ${pass.streak}-day streak` : signedIn ? "Open My PNA" : "Open your free student pass"}>
            <span className="nx-pass-orb">{pass && pass.xp > 0 ? <Zap className="h-3.5 w-3.5" aria-hidden="true" /> : "PNA"}</span>
            {pass && pass.xp > 0 ? (
              <span className="flex items-center gap-2">
                {pass.xp} XP
                {pass.streak > 0 ? (
                  <span className="inline-flex items-center gap-0.5 text-[var(--nx-amber)]">
                    <Flame className="h-3.5 w-3.5" aria-hidden="true" />
                    {pass.streak}
                  </span>
                ) : null}
              </span>
            ) : (
              <span>Student pass</span>
            )}
          </a>
        </div>
      </div>

      {megaWing ? (
        <div id="nx-mega" className="nx-mega" onMouseEnter={hoverCancel}>
          <div className="container-content nx-mega-grid">
            <div className="nx-mega-intro">
              <p className="nx-kicker"><span className="nx-live" /> {megaWing.label} wing</p>
              <p className="nx-title mt-3 text-2xl text-white">{megaWing.tagline}</p>
              <p className="mt-2 text-sm leading-6 text-[var(--nx-mute)]">{megaWing.intro}</p>
              {megaWing.id === "academy" ? (
                <div className="mt-4">
                  <InstallApp />
                </div>
              ) : null}
            </div>
            <div className="nx-mega-links">
              {megaWing.places.map((place) => (
                <a key={place.href} href={place.href} className="nx-mega-link" aria-current={isCurrent(place.href) ? "page" : undefined} onClick={closeAll}>
                  <span className="nx-mega-icon"><AcademyIcon name={place.icon} className="h-[18px] w-[18px]" /></span>
                  <span className="min-w-0">
                    <strong>{place.label}</strong>
                    <span className="nx-desc">{place.description}</span>
                  </span>
                </a>
              ))}
            </div>
          </div>
        </div>
      ) : null}

      {/* Mobile drawer */}
      <div id="nx-mobile-drawer" className="nx-drawer" data-open={open} aria-hidden={!open} inert={!open}>
        <nav className="container-content pb-32 pt-5" aria-label="Mobile navigation">
          <button
            type="button"
            onClick={() => {
              setOpen(false);
              setSearchOpen(true);
            }}
            className="flex w-full items-center gap-3 rounded-2xl border border-[var(--nx-line-strong)] bg-white/5 px-4 py-3.5 text-left text-sm text-[var(--nx-mute)]"
          >
            <Search className="h-5 w-5 text-[var(--nx-aqua)]" aria-hidden="true" />
            Search lessons, cases, services…
          </button>

          <div className="mt-3 flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-[var(--nx-line)] bg-white/5 px-4 py-3">
            <a href="https://thecpdregister.com" target="_blank" rel="noopener noreferrer" className="min-w-0" tabIndex={open ? 0 : -1}>
              <p className="nx-kicker">Approved CPD Provider</p>
              <p className="mt-1.5 text-xs font-semibold text-[var(--nx-mute)]">The CPD Group · #791052</p>
            </a>
            <InstallApp />
          </div>

          <div className="mt-3 grid grid-cols-2 gap-2">
            <a href="/daily-challenge" className="nx-pill-challenge !flex justify-center" onClick={closeAll}>
              <Trophy className="h-4 w-4" aria-hidden="true" /> Daily Challenge
            </a>
            <a href={passHref} className="nx-btn nx-btn-ghost !min-h-[40px] !text-[0.85rem]" onClick={closeAll}>
              {signedIn ? "My PNA" : "Student pass"} <ArrowRight className="h-4 w-4" aria-hidden="true" />
            </a>
          </div>

          {wings.map((wing) => (
            <section key={wing.id} className="nx-drawer-wing" aria-label={`${wing.label} wing`}>
              <p className="nx-kicker">{wing.label} · <span className="normal-case tracking-normal text-[var(--nx-dim)]">{wing.tagline}</span></p>
              <div className="nx-drawer-grid">
                {wing.places.map((place) => (
                  <a key={place.href} href={place.href} className="nx-drawer-link" aria-current={isCurrent(place.href) ? "page" : undefined} tabIndex={open ? 0 : -1} onClick={closeAll}>
                    <AcademyIcon name={place.icon} />
                    <span>{place.label}</span>
                  </a>
                ))}
              </div>
            </section>
          ))}

          <div className="mt-6 grid gap-2 sm:grid-cols-2">
            <a href="/appointment" className="nx-btn nx-btn-primary" tabIndex={open ? 0 : -1} onClick={closeAll}>
              <CalendarDays className="h-4 w-4" aria-hidden="true" /> Book Appointment
            </a>
            <a href="/home-visit" className="nx-btn nx-btn-ghost" tabIndex={open ? 0 : -1} onClick={closeAll}>
              <Home className="h-4 w-4" aria-hidden="true" /> Request Home Visit
            </a>
          </div>
        </nav>
      </div>

      <CommandPalette open={searchOpen} onClose={() => setSearchOpen(false)} atlasPublished={atlasPublished} />
    </header>
  );
}
