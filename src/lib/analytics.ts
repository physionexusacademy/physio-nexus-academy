/**
 * Google Analytics 4 settings: the ONE place to change your measurement ID.
 * Find it in GA4: Admin → Data streams → your website → "Measurement ID" (starts with G-).
 */
export const GA_MEASUREMENT_ID: string = process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID || "G-FY98RYN1GP";

/** Only IDs that look like a real GA4 ID are ever put into the page. */
export const GA_ID_IS_VALID = /^G-[A-Z0-9]{6,20}$/.test(GA_MEASUREMENT_ID);

type EventParams = Record<string, string | number | boolean | undefined>;

/** Send a custom event to Google Analytics. Safe to call anywhere in the browser: never throws, does nothing if GA is blocked. */
export function trackEvent(name: string, params: EventParams = {}): void {
  try {
    const w = window as unknown as { gtag?: (...args: unknown[]) => void };
    w.gtag?.("event", name, params);
  } catch {
    /* analytics must never break the website */
  }
}
