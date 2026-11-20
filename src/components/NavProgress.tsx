"use client";

/**
 * A thin progress line at the top of the page while another page loads, like the one on YouTube: the moment a link is clicked something
 * moves, so the site never feels stuck while the next page arrives. It starts on a click on a link to another page of this site and
 * finishes when the address changes (or after 10 seconds at the latest, whatever happens). It never blocks anything: it is a decoration
 * with no pointer events, hidden from screen readers.
 */
import { useEffect, useRef } from "react";
import { usePathname } from "next/navigation";

const GIVE_UP_MS = 10_000;

export function NavProgress() {
  const pathname = usePathname();
  const bar = useRef<HTMLDivElement>(null);
  const busy = useRef(false);
  const timers = useRef<number[]>([]);
  const clear = () => {
    timers.current.forEach((id) => window.clearTimeout(id));
    timers.current = [];
  };

  const start = useRef(() => {});
  const finish = useRef(() => {});
  start.current = () => {
    const el = bar.current;
    if (!el || busy.current) return;
    busy.current = true;
    clear();
    el.style.transition = "none";
    el.style.opacity = "1";
    el.style.width = "0%";
    void el.offsetWidth; // let the browser see the empty bar before it starts to grow
    el.style.transition = "width 9s cubic-bezier(0.08, 0.6, 0.2, 1)";
    el.style.width = "86%";
    timers.current.push(window.setTimeout(() => finish.current(), GIVE_UP_MS));
  };
  finish.current = () => {
    const el = bar.current;
    if (!el || !busy.current) return;
    busy.current = false;
    clear();
    el.style.transition = "width 0.18s ease-out";
    el.style.width = "100%";
    timers.current.push(
      window.setTimeout(() => {
        el.style.transition = "opacity 0.3s ease-out";
        el.style.opacity = "0";
      }, 200),
      window.setTimeout(() => {
        el.style.transition = "none";
        el.style.width = "0%";
      }, 520),
    );
  };

  // The page changed: the new one has arrived.
  useEffect(() => {
    finish.current();
  }, [pathname]);

  useEffect(() => {
    const onClick = (event: MouseEvent) => {
      if (event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
      const link = (event.target as Element | null)?.closest?.("a[href]") as HTMLAnchorElement | null;
      if (!link || (link.target && link.target !== "_self") || link.hasAttribute("download")) return;
      let url: URL;
      try {
        url = new URL(link.href, window.location.href);
      } catch {
        return;
      }
      if (url.origin !== window.location.origin || url.pathname === window.location.pathname) return; // another site, or the same page (a hash, a query)
      start.current();
    };
    // After the click's own handlers: a link a script cancelled (nothing will load) must not start the bar.
    const listener = (event: MouseEvent) => window.setTimeout(() => onClick(event), 0);
    document.addEventListener("click", listener);
    const onBack = () => start.current();
    // A page restored from the browser's back/forward cache was frozen mid-load: put the bar away at once instead of leaving it half way.
    const onShow = (event: PageTransitionEvent) => {
      const el = bar.current;
      if (!event.persisted || !el) return;
      clear();
      busy.current = false;
      el.style.transition = "none";
      el.style.opacity = "0";
      el.style.width = "0%";
    };
    window.addEventListener("popstate", onBack);
    window.addEventListener("pageshow", onShow);
    return () => {
      document.removeEventListener("click", listener);
      window.removeEventListener("popstate", onBack);
      window.removeEventListener("pageshow", onShow);
      clear();
    };
  }, []);

  return (
    <div aria-hidden="true" className="pointer-events-none fixed inset-x-0 top-0 z-[130] h-[3px]">
      <div
        ref={bar}
        className="h-full w-0 rounded-r-full bg-gradient-to-r from-teal-400 via-cyan-300 to-teal-500 opacity-0 shadow-[0_0_10px_rgba(45,212,191,0.8)]"
      />
    </div>
  );
}
