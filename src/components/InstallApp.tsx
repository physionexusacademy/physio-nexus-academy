"use client";

import { useEffect, useState } from "react";

type InstallPrompt = Event & {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
};

type PromptSubscriber = (prompt: InstallPrompt | null) => void;

let deferredPrompt: InstallPrompt | null = null;
let promptInProgress = false;
const promptSubscribers = new Set<PromptSubscriber>();

function publishPrompt(nextPrompt: InstallPrompt | null) {
  deferredPrompt = nextPrompt;
  promptSubscribers.forEach((subscriber) => subscriber(nextPrompt));
}

// Capture the event as early as this client module loads so a quick browser
// installability event is not missed while React effects are mounting.
if (typeof window !== "undefined") {
  const installWindow = window as Window & { __pnaInstallPromptListener?: boolean };

  if (!installWindow.__pnaInstallPromptListener) {
    installWindow.__pnaInstallPromptListener = true;

    window.addEventListener("beforeinstallprompt", (event) => {
      event.preventDefault();
      publishPrompt(event as InstallPrompt);
    });

    window.addEventListener("appinstalled", () => {
      publishPrompt(null);
    });
  }
}

function isStandaloneMode() {
  if (typeof window === "undefined") return false;
  return (
    window.matchMedia("(display-mode: standalone)").matches ||
    window.matchMedia("(display-mode: fullscreen)").matches ||
    (navigator as Navigator & { standalone?: boolean }).standalone === true
  );
}

function isIOSDevice() {
  if (typeof navigator === "undefined") return false;
  return (
    /iPad|iPhone|iPod/.test(navigator.userAgent) ||
    (navigator.platform === "MacIntel" && navigator.maxTouchPoints > 1)
  );
}

export function InstallApp() {
  const [prompt, setPrompt] = useState<InstallPrompt | null>(deferredPrompt);
  const [installed, setInstalled] = useState(false);
  const [ios, setIos] = useState(false);
  const [helpOpen, setHelpOpen] = useState(false);
  const [installing, setInstalling] = useState(false);

  useEffect(() => {
    const syncInstalledState = () => setInstalled(isStandaloneMode());
    const syncPrompt = (nextPrompt: InstallPrompt | null) => setPrompt(nextPrompt);
    const onInstalled = () => {
      setInstalled(true);
      setHelpOpen(false);
      setPrompt(null);
    };

    setIos(isIOSDevice());
    syncInstalledState();
    promptSubscribers.add(syncPrompt);
    syncPrompt(deferredPrompt);

    window.addEventListener("appinstalled", onInstalled);
    window.addEventListener("pageshow", syncInstalledState);

    const standaloneQuery = window.matchMedia("(display-mode: standalone)");
    standaloneQuery.addEventListener?.("change", syncInstalledState);

    return () => {
      promptSubscribers.delete(syncPrompt);
      window.removeEventListener("appinstalled", onInstalled);
      window.removeEventListener("pageshow", syncInstalledState);
      standaloneQuery.removeEventListener?.("change", syncInstalledState);
    };
  }, []);

  const handleInstall = async () => {
    if (installed || installing || promptInProgress) return;

    const availablePrompt = deferredPrompt ?? prompt;
    if (availablePrompt) {
      promptInProgress = true;
      setInstalling(true);
      try {
        await availablePrompt.prompt();
        const choice = await availablePrompt.userChoice;
        // The browser prompt is one-shot. Clear it for every responsive
        // InstallApp instance so a stale component cannot reuse the event.
        publishPrompt(null);
        if (choice.outcome === "accepted") setInstalled(true);
      } catch {
        publishPrompt(null);
        setHelpOpen(true);
      } finally {
        promptInProgress = false;
        setInstalling(false);
      }
      return;
    }

    // iOS and browsers that do not expose beforeinstallprompt cannot be
    // triggered programmatically; show platform-specific guidance instead.
    setHelpOpen(true);
  };

  if (installed) return null;

  return (
    <>
      <button
        type="button"
        className="inline-flex items-center justify-center rounded-lg bg-teal-600 px-4 py-2 text-xs font-semibold text-white shadow-sm transition hover:bg-teal-700 disabled:cursor-wait disabled:opacity-70 sm:text-sm"
        onClick={handleInstall}
        disabled={installing}
        aria-haspopup="dialog"
      >
        {installing ? "Opening install…" : "Install PNA App"}
      </button>

      {helpOpen && (
        <div
          className="fixed inset-0 z-[120] flex items-center justify-center bg-navy-950/50 p-4"
          role="presentation"
          onClick={(event) => {
            if (event.target === event.currentTarget) setHelpOpen(false);
          }}
        >
          <section
            role="dialog"
            aria-modal="true"
            aria-labelledby="pna-install-title"
            className="w-full max-w-md rounded-2xl border border-teal-100 bg-white p-5 text-navy-900 shadow-2xl"
          >
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-xs font-bold uppercase tracking-wider text-teal-700">
                  Physio Nexus Academy
                </p>
                <h2 id="pna-install-title" className="mt-1 text-lg font-bold">
                  Add PNA to your device
                </h2>
              </div>
              <button
                type="button"
                onClick={() => setHelpOpen(false)}
                className="rounded-lg px-2 py-1 text-xl leading-none text-navy-600 hover:bg-grey-100"
                aria-label="Close installation instructions"
              >
                ×
              </button>
            </div>

            {ios ? (
              <ol className="mt-4 list-decimal space-y-2 pl-5 text-sm leading-6">
                <li>Open this website in Safari.</li>
                <li>Tap the Share button.</li>
                <li>Choose <strong>Add to Home Screen</strong>, then tap Add.</li>
              </ol>
            ) : (
              <ol className="mt-4 list-decimal space-y-2 pl-5 text-sm leading-6">
                <li>
                  If your browser supports app installation, look for the install
                  icon in the address bar or open the browser menu.
                </li>
                <li>
                  Choose <strong>Install app</strong> or <strong>Add to Home screen</strong>.
                </li>
                <li>Confirm the browser prompt to finish adding PNA.</li>
              </ol>
            )}

            <p className="mt-4 rounded-xl bg-teal-50 p-3 text-xs leading-5 text-navy-700">
              Your browser controls installation for security. If no install
              option is available, update your browser or try Chrome/Edge on
              desktop and Android, or Safari on iPhone.
            </p>
            <button
              type="button"
              onClick={() => setHelpOpen(false)}
              className="mt-4 w-full rounded-xl bg-teal-700 px-4 py-3 text-sm font-semibold text-white hover:bg-teal-800"
            >
              Got it
            </button>
          </section>
        </div>
      )}
    </>
  );
}
