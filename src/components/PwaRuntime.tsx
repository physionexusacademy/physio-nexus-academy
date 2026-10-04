"use client";

import { useEffect } from "react";

export function PwaRuntime() {
  useEffect(() => {
    if (!("serviceWorker" in navigator) || window.location.protocol !== "https:") {
      return;
    }

    let registration: ServiceWorkerRegistration | null = null;

    navigator.serviceWorker
      .register("/sw.js", {
        scope: "/",
        updateViaCache: "none",
      })
      .then((reg) => {
        registration = reg;

        // Check for a newer worker whenever the app starts.
        void reg.update();

        if (reg.waiting) {
          reg.waiting.postMessage({ type: "SKIP_WAITING" });
        }

        reg.addEventListener("updatefound", () => {
          const worker = reg.installing;
          if (!worker) return;

          worker.addEventListener("statechange", () => {
            if (
              worker.state === "installed" &&
              navigator.serviceWorker.controller
            ) {
              // Activate the update without forcing a hard reload.
              // A forced reload during a flaky edge response can surface ERR_FAILED
              // inside an installed PWA.
              worker.postMessage({ type: "SKIP_WAITING" });
            }
          });
        });
      })
      .catch(() => {
        // The website must continue to work even if PWA registration fails.
      });

    const handleOnline = () => {
      if (registration) void registration.update();
    };

    window.addEventListener("online", handleOnline);

    return () => {
      window.removeEventListener("online", handleOnline);
    };
  }, []);

  return null;
}
