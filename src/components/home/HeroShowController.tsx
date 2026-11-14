"use client";

import { useEffect } from "react";

const SWIPE_PX = 44;

/**
 * Makes the server-rendered hero slideshow (HeroSlideshow) move. It renders nothing: it finds the markup by id and keeps its
 * state in `data-*` attributes that home-hero.css reacts to, so React never has to hydrate (or receive twice) the cards.
 *
 *   data-playing  the slideshow plays by itself (not paused by the visitor, not "reduce motion")
 *   data-run      the progress bar is running right now (playing, and nothing is holding it: pointer, keyboard focus, touch,
 *                 hidden tab, hero off screen)
 *   data-awake    the hero is on screen in a visible tab (everything animated pauses when not)
 *   data-ready    script is attached (the progress bar starts only now, so a first card that finished early is never stuck)
 *   data-moved    a card has changed at least once (cards animate in and out only after that)
 */
export function HeroShowController() {
  useEffect(() => {
    const root = document.getElementById("hero-show");
    return root ? mountHeroShow(root) : undefined;
  }, []);
  return null;
}

function mountHeroShow(root: HTMLElement) {
  const stage = root.querySelector<HTMLElement>(".hs-stage");
  const slides = Array.from(root.querySelectorAll<HTMLElement>(".hs-slide"));
  const dots = Array.from(root.querySelectorAll<HTMLElement>(".hs-dot"));
  const now = root.querySelector<HTMLElement>("[data-hs-now]");
  const playButton = root.querySelector<HTMLElement>('[data-hs="play"]');
  const count = slides.length;
  if (!stage || count < 2) return undefined;

  const abort = new AbortController();
  const { signal } = abort;
  const flag = (value: boolean) => (value ? "1" : "0");

  let index = 0;
  let leaving = -1;
  let direction: 1 | -1 = 1;
  let auto = true;
  let reduced = false;
  let hover = false;
  let focus = false;
  let press = false;
  let hidden = document.hidden;
  let offscreen = false;
  let swipeFrom: { x: number; y: number } | null = null;
  let swiped = false;
  let leaveTimer: ReturnType<typeof setTimeout> | undefined;

  const paint = () => {
    slides.forEach((slide, i) => {
      const active = i === index;
      slide.dataset.pos = active ? "active" : i === leaving ? "leaving" : "idle";
      slide.toggleAttribute("inert", !active);
      if (active) slide.removeAttribute("aria-hidden");
      else slide.setAttribute("aria-hidden", "true");
    });
    dots.forEach((dot, i) => {
      if (i === index) dot.setAttribute("aria-current", "true");
      else dot.removeAttribute("aria-current");
    });
    if (now) now.textContent = String(index + 1).padStart(2, "0");
    root.style.setProperty("--dir", String(direction));
    root.style.setProperty("--hs-cur", slides[index].dataset.accent ?? "");
  };

  const sync = () => {
    const playing = auto && !reduced;
    const running = playing && !hover && !focus && !press && !hidden && !offscreen;
    root.dataset.playing = flag(playing);
    root.dataset.run = flag(running);
    root.dataset.awake = flag(!hidden && !offscreen);
    stage.setAttribute("aria-live", running ? "off" : "polite");
    if (playButton) {
      playButton.setAttribute("aria-label", playing ? "Pause the slideshow" : "Play the slideshow");
      playButton.setAttribute("aria-pressed", String(!playing));
    }
  };

  const go = (to: number, way?: 1 | -1) => {
    const target = ((to % count) + count) % count;
    if (target === index) return;
    direction = way ?? (target > index ? 1 : -1);
    leaving = index;
    index = target;
    root.dataset.moved = "1";
    paint();
    clearTimeout(leaveTimer);
    leaveTimer = setTimeout(() => {
      leaving = -1;
      paint();
    }, 720);
  };

  // buttons and dots
  root.addEventListener(
    "click",
    (event) => {
      const control = (event.target as Element).closest<HTMLElement>("[data-hs]");
      if (!control || !root.contains(control)) return;
      switch (control.dataset.hs) {
        case "prev":
          go(index - 1, -1);
          break;
        case "next":
          go(index + 1, 1);
          break;
        case "dot":
          go(Number(control.dataset.i));
          break;
        case "play":
          auto = !auto;
          sync();
          break;
      }
    },
    { signal },
  );

  // the progress bar is the timer: when it fills, the next card shows
  root.addEventListener(
    "animationend",
    (event) => {
      const target = event.target as HTMLElement;
      if (target.classList.contains("hs-fill") && event.animationName === "hs-fill" && root.dataset.playing === "1") go(index + 1, 1);
    },
    { signal },
  );

  // keyboard
  root.addEventListener(
    "keydown",
    (event) => {
      if (event.key === "ArrowRight") go(index + 1, 1);
      else if (event.key === "ArrowLeft") go(index - 1, -1);
      else if (event.key === "Home") go(0, -1);
      else if (event.key === "End") go(count - 1, 1);
      else return;
      event.preventDefault();
    },
    { signal },
  );

  // holds: a mouse over it, keyboard focus inside it, a finger on it
  root.addEventListener("pointerenter", (event) => { if (event.pointerType === "mouse") { hover = true; sync(); } }, { signal });
  root.addEventListener("pointerleave", (event) => { if (event.pointerType === "mouse") { hover = false; sync(); } }, { signal });
  root.addEventListener("focusin", (event) => { focus = (event.target as HTMLElement).matches(":focus-visible"); sync(); }, { signal });
  root.addEventListener("focusout", () => { focus = false; sync(); }, { signal });

  // swipe
  stage.addEventListener(
    "pointerdown",
    (event) => {
      swipeFrom = { x: event.clientX, y: event.clientY };
      swiped = false;
      if (event.pointerType !== "mouse") { press = true; sync(); }
    },
    { signal },
  );
  stage.addEventListener(
    "pointerup",
    (event) => {
      press = false;
      sync();
      const from = swipeFrom;
      swipeFrom = null;
      if (!from) return;
      const dx = event.clientX - from.x;
      const dy = event.clientY - from.y;
      if (Math.abs(dx) > SWIPE_PX && Math.abs(dx) > Math.abs(dy) * 1.4) {
        swiped = true;
        go(index + (dx < 0 ? 1 : -1), dx < 0 ? 1 : -1);
      }
    },
    { signal },
  );
  stage.addEventListener("pointercancel", () => { press = false; swipeFrom = null; sync(); }, { signal });
  // a swipe that started on a card's link must not also open it
  stage.addEventListener(
    "click",
    (event) => {
      if (!swiped) return;
      event.preventDefault();
      event.stopPropagation();
      swiped = false;
    },
    { signal, capture: true },
  );

  // device settings and visibility
  const motion = window.matchMedia("(prefers-reduced-motion: reduce)");
  const onMotion = () => { reduced = motion.matches; sync(); };
  motion.addEventListener("change", onMotion, { signal });
  document.addEventListener("visibilitychange", () => { hidden = document.hidden; sync(); }, { signal });
  const watcher = new IntersectionObserver(([entry]) => { offscreen = !entry.isIntersecting; sync(); }, { threshold: 0.12 });
  watcher.observe(root);

  reduced = motion.matches;
  paint();
  sync();
  root.dataset.ready = "1";

  return () => {
    abort.abort();
    watcher.disconnect();
    clearTimeout(leaveTimer);
  };
}
