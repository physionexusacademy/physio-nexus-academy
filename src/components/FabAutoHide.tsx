"use client";

import { useEffect } from "react";

/**
 * On phones and tablets the floating help buttons (PNA AI, WhatsApp) slide out of the way while the reader scrolls down through a page,
 * so they never sit on top of the text, and come back as soon as the reader scrolls up or stops (about a second). Computers keep them in place.
 * Only an attribute on <html> changes; the CSS (.pna-fab in easy-touch.css) does the rest.
 */
export function FabAutoHide() {
  useEffect(() => {
    const root = document.documentElement;
    const narrow = window.matchMedia("(max-width: 1023px)");
    let last = window.scrollY;
    let timer = 0;
    let frame = 0;
    // only the reader's own scrolling (finger, wheel, keys) hides the buttons; a scroll the page makes itself (a tapped card or link
    // bringing a section into view, a jump to a section) leaves them in place
    let input = 0;
    const touched = () => { input = performance.now(); };
    const show = () => root.removeAttribute("data-fab-hidden");
    const onScroll = () => {
      if (frame) return;
      frame = requestAnimationFrame(() => {
        frame = 0;
        const y = window.scrollY;
        const dy = y - last;
        last = y;
        if (!narrow.matches) return show();
        if (performance.now() - input > 900 || Math.abs(dy) > window.innerHeight * 0.6) return show();
        if (dy > 6 && y > 160) root.setAttribute("data-fab-hidden", "");
        else if (dy < -6) show();
        window.clearTimeout(timer);
        timer = window.setTimeout(show, 1100);
      });
    };
    const inputs = ["touchmove", "wheel", "keydown"] as const;
    for (const type of inputs) window.addEventListener(type, touched, { passive: true });
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      for (const type of inputs) window.removeEventListener(type, touched);
      window.removeEventListener("scroll", onScroll);
      window.clearTimeout(timer);
      cancelAnimationFrame(frame);
      show();
    };
  }, []);
  return null;
}
