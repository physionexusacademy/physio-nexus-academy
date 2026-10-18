import Script from "next/script";
import { GA_ID_IS_VALID, GA_MEASUREMENT_ID } from "@/lib/analytics";

/**
 * Loads Google Analytics 4 on every public page.
 * - Visits to /admin are never counted (so your own work does not distort the numbers).
 * - Page views are recorded automatically, including when visitors move between pages.
 */
export function GoogleAnalytics() {
  if (!GA_ID_IS_VALID) return null;
  const id = JSON.stringify(GA_MEASUREMENT_ID);

  return (
    <>
      <Script src={`https://www.googletagmanager.com/gtag/js?id=${GA_MEASUREMENT_ID}`} strategy="afterInteractive" />
      <Script id="google-analytics" strategy="afterInteractive">
        {`window.dataLayer = window.dataLayer || [];
function gtag(){dataLayer.push(arguments);}
window.gtag = gtag;
if (location.pathname.indexOf('/admin') === 0) { window['ga-disable-' + ${id}] = true; }
gtag('js', new Date());
gtag('config', ${id});`}
      </Script>
    </>
  );
}
