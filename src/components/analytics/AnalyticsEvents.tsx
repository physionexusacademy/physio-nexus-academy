"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";
import { GA_MEASUREMENT_ID, trackEvent } from "@/lib/analytics";

const LESSON_PATH = /^\/manual-therapy\/([a-z0-9-]+)\/?$/;

/**
 * Sends the custom events that show how visitors respond to your content.
 * Renders nothing. Events (GA4 → Reports → Engagement → Events):
 *   lesson_view       a Manual Therapy chapter was opened         (chapter)
 *   lesson_scroll     reader got through 50% / 90% of the lesson  (chapter, percent)
 *   lesson_self_test  reader opened a self-test answer            (chapter)
 *   contact_click     phone, email or WhatsApp link was tapped    (method)
 */
export function AnalyticsEvents() {
  const pathname = usePathname();

  // 1. Never count your own admin visits, even when moving between pages without a reload.
  useEffect(() => {
    (window as unknown as Record<string, unknown>)["ga-disable-" + GA_MEASUREMENT_ID] = pathname.startsWith("/admin");
  }, [pathname]);

  // 2. Lesson engagement on /manual-therapy/<chapter>.
  useEffect(() => {
    const match = LESSON_PATH.exec(pathname);
    if (!match) return;
    const chapter = match[1];

    trackEvent("lesson_view", { chapter });

    const fired = new Set<number>();
    const onScroll = () => {
      const el = document.getElementById("mastery") ?? document.getElementById("main-content");
      if (!el) return;
      const rect = el.getBoundingClientRect();
      if (rect.height <= 0) return;
      const seen = Math.min(Math.max(window.innerHeight - rect.top, 0), rect.height);
      const percent = Math.round((seen / rect.height) * 100);
      for (const mark of [50, 90]) {
        if (percent >= mark && !fired.has(mark)) {
          fired.add(mark);
          trackEvent("lesson_scroll", { chapter, percent: mark });
        }
      }
    };
    const onToggle = (event: Event) => {
      const target = event.target;
      if (target instanceof HTMLDetailsElement && target.open && target.closest("#mastery")) {
        trackEvent("lesson_self_test", { chapter });
      }
    };

    window.addEventListener("scroll", onScroll, { passive: true });
    document.addEventListener("toggle", onToggle, true); // "toggle" does not bubble, so listen in the capture phase
    return () => {
      window.removeEventListener("scroll", onScroll);
      document.removeEventListener("toggle", onToggle, true);
    };
  }, [pathname]);

  // 3. Phone / email / WhatsApp taps anywhere on the site.
  useEffect(() => {
    const onClick = (event: MouseEvent) => {
      const link = (event.target as HTMLElement | null)?.closest?.("a[href]") as HTMLAnchorElement | null;
      if (!link) return;
      const href = link.getAttribute("href") ?? "";
      if (href.startsWith("tel:")) trackEvent("contact_click", { method: "phone" });
      else if (href.startsWith("mailto:")) trackEvent("contact_click", { method: "email" });
      else if (/^https?:\/\/(wa\.me|api\.whatsapp\.com|chat\.whatsapp\.com|www\.whatsapp\.com)\//.test(href)) {
        trackEvent("contact_click", { method: "whatsapp" });
      }
    };
    document.addEventListener("click", onClick, true);
    return () => document.removeEventListener("click", onClick, true);
  }, []);

  return null;
}
