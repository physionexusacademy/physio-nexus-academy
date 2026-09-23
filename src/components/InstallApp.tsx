"use client";

import { useEffect, useState } from "react";

type InstallPrompt = Event & { prompt: () => Promise<void>; userChoice: Promise<{ outcome: "accepted" | "dismissed" }> };

export function InstallApp() {
  const [prompt, setPrompt] = useState<InstallPrompt | null>(null);
  const [ios, setIos] = useState(false);
  const [installed, setInstalled] = useState(false);
  const [instructions, setInstructions] = useState(false);

  useEffect(() => {
    if ("serviceWorker" in navigator && location.protocol === "https:") {
      navigator.serviceWorker.register("/sw.js").catch(() => {});
    }
    const standalone = window.matchMedia("(display-mode: standalone)");
    const isInstalled = () => standalone.matches || (navigator as Navigator & { standalone?: boolean }).standalone === true;
    setInstalled(isInstalled());
    setIos(/iPad|iPhone|iPod/.test(navigator.userAgent));
    const beforeInstall = (event: Event) => {
      event.preventDefault();
      setPrompt(event as InstallPrompt);
    };
    const onInstalled = () => { setInstalled(true); setPrompt(null); setInstructions(false); };
    window.addEventListener("beforeinstallprompt", beforeInstall);
    window.addEventListener("appinstalled", onInstalled);
    return () => {
      window.removeEventListener("beforeinstallprompt", beforeInstall);
      window.removeEventListener("appinstalled", onInstalled);
    };
  }, []);

  if (installed) return null;

  return (
    <div className="border-b border-teal-200 bg-teal-50">
      <div className="container-content flex flex-wrap items-center justify-between gap-3 py-3 text-sm text-navy-800">
        <p><strong>Physio Nexus Academy on your phone</strong><span className="ml-2">Quick access from your home screen.</span></p>
        <button type="button" className="rounded-lg bg-navy-800 px-4 py-2 font-semibold text-white hover:bg-navy-700" onClick={async () => {
          if (prompt) {
            try { await prompt.prompt(); await prompt.userChoice; } finally { setPrompt(null); }
          } else {
            setInstructions(true);
          }
        }}>Install PNA App</button>
        {instructions && <div role="status" className="w-full rounded-lg bg-white p-3 text-navy-700">
          {ios ? "On iPhone: open this page in Safari, tap Share, then Add to Home Screen and Add." : "In Chrome: open the browser menu (⋮), then tap Install app or Add to Home screen. If that option is missing, update Chrome and reload this page."}
          <button type="button" onClick={() => setInstructions(false)} className="ml-3 font-semibold text-teal-700 underline">Close</button>
        </div>}
      </div>
    </div>
  );
}
