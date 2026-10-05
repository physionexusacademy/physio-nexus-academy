"use client";

import { useEffect } from "react";

export function PwaRuntime() {
  useEffect(() => {
    const cleanup = async () => {
      if ("serviceWorker" in navigator) {
        try {
          const registrations = await navigator.serviceWorker.getRegistrations();
          await Promise.all(registrations.map((registration) => registration.unregister()));
        } catch {}
      }

      if ("caches" in window) {
        try {
          const keys = await caches.keys();
          await Promise.all(
            keys.filter((key) => key.startsWith("pna-")).map((key) => caches.delete(key))
          );
        } catch {}
      }
    };

    void cleanup();
  }, []);

  return null;
}
