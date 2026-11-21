"use client";

import { useEffect } from "react";

export function PwaRuntime() {
  useEffect(() => {
    if (!("serviceWorker" in navigator)) return;

    // Local development: the worker keeps hash-named files, which a development server does not have. Never register it there, and drop an old one.
    if (process.env.NODE_ENV !== "production") {
      void navigator.serviceWorker.getRegistrations().then((all) => all.forEach((one) => void one.unregister())).catch(() => {});
      return;
    }

    let registration: ServiceWorkerRegistration | null = null;
    let cancelled = false;
    // The very first page a person opens loads before the worker controls it: it asks the worker to keep a copy (see public/sw.js).
    const firstVisit = !navigator.serviceWorker.controller;

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
      .then(async (nextRegistration) => {
        if (cancelled) return;
        registration = nextRegistration;
        document.addEventListener("visibilitychange", updateWhenVisible);
        if (firstVisit) {
          const ready = await navigator.serviceWorker.ready;
          ready.active?.postMessage({ type: "pna-save-page", href: window.location.href });
        }
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
