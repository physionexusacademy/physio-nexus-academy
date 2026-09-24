"use client";

// Homepage-only PWA install control. Keep this component button-only.

import { useEffect, useState } from "react";

type InstallPrompt = Event & {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
};

export function InstallApp() {
  const [prompt, setPrompt] = useState<InstallPrompt | null>(null);
  const [ios, setIos] = useState(false);
  const [installed, setInstalled] = useState(false);

  useEffect(() => {
    if ("serviceWorker" in navigator && location.protocol === "https:") {
      navigator.serviceWorker.register("/sw.js").catch(() => {});
    }

    const standalone = window.matchMedia("(display-mode: standalone)");
    const isInstalled = () =>
      standalone.matches ||
      (navigator as Navigator & { standalone?: boolean }).standalone === true;

    setInstalled(isInstalled());
    setIos(/iPad|iPhone|iPod/.test(navigator.userAgent));

    const beforeInstall = (event: Event) => {
      event.preventDefault();
      setPrompt(event as InstallPrompt);
    };

    const onInstalled = () => {
      setInstalled(true);
      setPrompt(null);
    };

    window.addEventListener("beforeinstallprompt", beforeInstall);
    window.addEventListener("appinstalled", onInstalled);

    return () => {
      window.removeEventListener("beforeinstallprompt", beforeInstall);
      window.removeEventListener("appinstalled", onInstalled);
    };
  }, []);

  if (installed) return null;

  const handleInstall = async () => {
    if (prompt) {
      try {
        await prompt.prompt();
        await prompt.userChoice;
      } finally {
        setPrompt(null);
      }
      return;
    }

    window.alert(
      ios
        ? "Open this page in Safari, tap Share, then Add to Home Screen."
        : "Open the browser menu (⋮), then choose Install app or Add to Home screen."
    );
  };

  return (
    <button
      type="button"
      className="rounded-lg bg-teal-500 px-4 py-2 text-xs font-semibold text-white shadow-sm transition hover:bg-teal-600 sm:text-sm"
      onClick={handleInstall}
    >
      Install PNA App
    </button>
  );
}
