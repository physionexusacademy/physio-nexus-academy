"use client";

import { useEffect, useRef, useState } from "react";
import { PersonStanding } from "lucide-react";
import type { GuideBeat } from "@/lib/rehabverse/guide";
import { GuideStage } from "./GuideStage";
import { useRvLang } from "./useLang";

/**
 * The 3D welcome guide of the RehabVerse landing page, loaded with care for small phones: a capable device starts it when the browser is idle
 * (after the page is usable); a device with little memory, few cores or "save data" shows a picture and a button instead and loads the 3D
 * (three.js, the model) only after a tap. A visitor never waits for 3D before the page responds.
 * (Do not import PhysioGuide here: a plain import() in a client component puts three.js into the server bundle, +200 KiB gzip in the Worker; GuideStage loads it with next/dynamic, ssr: false.)
 */
function canAutoStart() {
  const nav = navigator as Navigator & { deviceMemory?: number; connection?: { saveData?: boolean } };
  return (nav.deviceMemory ?? 8) >= 4 && (nav.hardwareConcurrency ?? 8) >= 4 && !nav.connection?.saveData;
}

export function GuideOnDemand({ beats, className }: { beats: GuideBeat[]; className?: string }) {
  const [lang] = useRvLang();
  const [on, setOn] = useState(false);
  const boxRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (!canAutoStart()) return;
    // Starts only while the guide is on screen, once the browser is idle after the page became usable (never while a visitor scrolls past it).
    const w = window as Window & { requestIdleCallback?: (cb: () => void, o?: { timeout: number }) => number; cancelIdleCallback?: (id: number) => void };
    let idle = 0;
    let timer = 0;
    const box = boxRef.current;
    const io = new IntersectionObserver((entries) => {
      const visible = entries.some((e) => e.isIntersecting);
      window.clearTimeout(timer);
      if (idle) w.cancelIdleCallback?.(idle);
      if (!visible) return;
      timer = window.setTimeout(() => {
        if (w.requestIdleCallback) idle = w.requestIdleCallback(() => setOn(true), { timeout: 3000 });
        else setOn(true);
      }, 1000);
    }, { rootMargin: "120px" });
    if (box) io.observe(box);
    return () => {
      io.disconnect();
      window.clearTimeout(timer);
      if (idle) w.cancelIdleCallback?.(idle);
    };
  }, []);

  if (on) return <GuideStage beats={beats} className={className} />;
  return (
    <div ref={boxRef} className={"rv-glass flex aspect-[4/3] flex-col items-center justify-center gap-3 p-6 text-center sm:aspect-[16/10] " + (className ?? "")}>
      <span className="grid h-14 w-14 place-items-center rounded-2xl bg-teal-50 text-teal-700" aria-hidden="true"><PersonStanding className="h-8 w-8" /></span>
      <p className="font-heading text-lg font-bold text-navy-800">{lang === "ru" ? "Aap ka virtual physiotherapist guide" : "Your virtual physiotherapist guide"}</p>
      <p className="max-w-xs text-sm leading-6 text-slate-600">{lang === "ru" ? "Ye 3D guide aap ko RehabVerse samjhata hai. Shuru karne par hi load hota hai, taake page tez rahe." : "The 3D guide explains RehabVerse. It loads only when you start it, so the page stays fast."}</p>
      <button type="button" className="rv-btn rv-btn-primary" onClick={() => setOn(true)}>
        {lang === "ru" ? "Guide ko shuru karein" : "Start the guide"}
      </button>
    </div>
  );
}
