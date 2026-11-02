"use client";

import { useEffect } from "react";

export function PwaRuntime() {
  useEffect(() => {
    if (!("serviceWorker" in navigator)) return;

    let registration: ServiceWorkerRegistration | null = null;
    let cancelled = false;

    const updateWhenVisible = () => {
      if (!cancelled && registration && document.visibilityState === "visible") {
        // Update checks run in the background; they never block rendering.
        void registration.update().catch(() => {});
      }
    };

    void navigator.serviceWorker
      .register("/sw.js", {
        scope: "/",
        // Always fetch the worker script fresh so a CDN/browser cache cannot
        // hold an old worker implementation after a production deployment.
        updateViaCache: "none",
      })
      .then((nextRegistration) => {
        if (cancelled) return;
        registration = nextRegistration;
        document.addEventListener("visibilitychange", updateWhenVisible);
      })
      .catch(() => {
        // PNA remains usable as a normal website if service workers are blocked.
      });

    return () => {
      cancelled = true;
      document.removeEventListener("visibilitychange", updateWhenVisible);
    };
  }, []);

  return null;
}
