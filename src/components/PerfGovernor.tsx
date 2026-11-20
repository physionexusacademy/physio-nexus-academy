"use client";

/**
 * Keeps the site smooth on every device (see lib/perf-mode.ts):
 *  - watches real frame times a few times after the page has settled (idle, and while scrolling) and, if the device clearly cannot
 *    keep up, switches the page to "lite" effects for this browser (a visitor's own choice in the footer always wins);
 *  - pauses decorative animations in sections that are scrolled out of view, so a long page never animates what nobody sees.
 */
import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { FX_EVENT, currentFx, readFxChoice, setFx, type Fx } from "@/lib/perf-mode";
import { Ur } from "@/components/Ur";

const SAMPLE_MS = 2400;
/** A frame this long (about 30 fps or worse) counts as slow; longer than 250 ms is a stall (tab switch), not a measurement. */
const SLOW_MS = 34;
const BAD_SHARE = 0.3;

function sampleFrames(): Promise<{ frames: number; slow: number }> {
  return new Promise((resolve) => {
    let last = 0;
    let frames = 0;
    let slow = 0;
    const start = performance.now();
    const step = (now: number) => {
      if (document.hidden) return resolve({ frames: 0, slow: 0 });
      if (last) {
        const gap = now - last;
        if (gap < 250) {
          frames += 1;
          if (gap > SLOW_MS) slow += 1;
        }
      }
      last = now;
      if (now - start < SAMPLE_MS) requestAnimationFrame(step);
      else resolve({ frames, slow });
    };
    requestAnimationFrame(step);
  });
}

export function PerfGovernor() {
  const pathname = usePathname();

  // 1. Frame-rate watch (once per page load; stops as soon as a decision is made).
  useEffect(() => {
    const choice = readFxChoice();
    if (choice?.how === "user" || currentFx() === "lite") return;
    let cancelled = false;
    let strikes = 0;
    let windows = 0;
    const judge = async () => {
      if (cancelled || currentFx() === "lite") return;
      const { frames, slow } = await sampleFrames();
      if (cancelled || frames < 40) return;
      windows += 1;
      const share = slow / frames;
      if (share > BAD_SHARE) strikes += share > 0.6 ? 2 : 1;
      if (strikes >= 2) {
        setFx("lite", "auto");
        cancelled = true;
      }
    };
    const timers: number[] = [];
    // The page has hydrated and settled: look at the idle frame rate twice.
    timers.push(window.setTimeout(judge, 4500), window.setTimeout(judge, 16000));
    // The first scroll is the best test of paint cost.
    let scrolled = false;
    const onScroll = () => {
      if (scrolled) return;
      scrolled = true;
      timers.push(window.setTimeout(judge, 150));
    };
    window.addEventListener("scroll", onScroll, { passive: true, once: true });
    return () => {
      cancelled = true;
      timers.forEach((t) => window.clearTimeout(t));
      window.removeEventListener("scroll", onScroll);
      void windows;
    };
  }, []);

  // 2. Pause decorative animations in sections that are not on screen.
  useEffect(() => {
    if (typeof IntersectionObserver === "undefined") return;
    const io = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) entry.target.removeAttribute("data-offscreen");
          else entry.target.setAttribute("data-offscreen", "");
        }
      },
      { rootMargin: "160px 0px" },
    );
    const watch = () => document.querySelectorAll("main section, main > div > div[class*='lobby'], footer").forEach((node) => io.observe(node));
    watch();
    // client-rendered sections appear a moment after hydration
    const later = window.setTimeout(watch, 2500);
    return () => {
      window.clearTimeout(later);
      io.disconnect();
      document.querySelectorAll("[data-offscreen]").forEach((node) => node.removeAttribute("data-offscreen"));
    };
  }, [pathname]);

  return null;
}

/** Footer switch for the effects mode: a visitor's own choice is kept and never overridden by the automatic check. */
export function FxToggle() {
  const [fx, setMode] = useState<Fx>("full");
  useEffect(() => {
    setMode(currentFx());
    const sync = () => setMode(currentFx());
    window.addEventListener(FX_EVENT, sync);
    return () => window.removeEventListener(FX_EVENT, sync);
  }, []);
  const lite = fx === "lite";
  return (
    <button
      type="button"
      onClick={() => setFx(lite ? "full" : "lite", "user")}
      aria-pressed={lite}
      title={lite ? "Light mode is on: fewer animations and effects. Click to switch them back on." : "Slow or hot device? Switch to light mode: fewer animations and effects, same content."}
      className="inline-flex items-center gap-1.5 rounded-full border border-[var(--nx-line)] px-3 py-1 text-xs font-semibold !text-[var(--nx-dim)] hover:!text-white"
    >
      <span aria-hidden="true">{lite ? "◐" : "◑"}</span>
      {lite ? <Ur en="Light mode: on" ur="Light mode: on" /> : <Ur en="Smooth mode" ur="Smooth mode" />}
    </button>
  );
}
