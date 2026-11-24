"use client";

import { Camera, RefreshCw, RotateCw, Volume2 } from "lucide-react";
import { platform } from "@/lib/formcheck/browser/permission";
import { T, useRvLang } from "../useLang";

type Step = { en: string; ru: string };

/** The steps to allow the camera again once the browser has blocked it. A web page cannot ask again, so the steps are shown in big type, one per line, and can be read aloud. */
export const GUIDE_STEPS: Record<"android" | "ios" | "other", Step[]> = {
  android: [
    { en: "Tap the small icon at the left of the web address (a lock or two lines).", ru: "Web address ke left mein chhota icon dabayein (taala ya do lakeerein)." },
    { en: "Tap “Permissions”, then “Camera”.", ru: "“Permissions” dabayein, phir “Camera”." },
    { en: "Choose “Allow”.", ru: "“Allow” chunein." },
    { en: "Come back here and tap “Check again”.", ru: "Yahan wapas aayein aur “Dobara check karein” dabayein." },
  ],
  ios: [
    { en: "Tap “aA” at the left of the web address.", ru: "Web address ke left mein “aA” dabayein." },
    { en: "Tap “Website Settings”, then “Camera”.", ru: "“Website Settings” dabayein, phir “Camera”." },
    { en: "Choose “Allow”.", ru: "“Allow” chunein." },
    { en: "Come back here and tap “Check again”.", ru: "Yahan wapas aayein aur “Dobara check karein” dabayein." },
  ],
  other: [
    { en: "Click the lock or settings icon at the left of the web address.", ru: "Web address ke left mein taale ya settings ka icon dabayein." },
    { en: "Find “Camera” and choose “Allow”.", ru: "“Camera” dhoondein aur “Allow” chunein." },
    { en: "Come back here and click “Check again”.", ru: "Yahan wapas aayein aur “Dobara check karein” dabayein." },
  ],
};

export const GUIDE_PHONE_NOTE: Step = {
  en: "Still blocked? Open the phone’s Settings, then Apps, then your browser, then Permissions, and allow the Camera.",
  ru: "Phir bhi band hai? Phone ki Settings kholein, phir Apps, phir apna browser, phir Permissions, aur Camera allow karein.",
};

export function guideSpeech(lang: "en" | "ru", steps: Step[]): string {
  const head = lang === "ru" ? "Camera band hai. Ise chalane ke liye yeh karein." : "The camera is blocked. To turn it on, do this.";
  return [head, ...steps.map((s, i) => `${lang === "ru" ? ["Pehla", "Doosra", "Teesra", "Chautha"][i] ?? String(i + 1) : ["First", "Second", "Third", "Fourth"][i] ?? String(i + 1)}: ${s[lang]}`)].join(" ");
}

export function CameraPermissionGuide({ stillBlocked, onCheck, onReload, onListen }: { stillBlocked: boolean; onCheck: () => void; onReload: () => void; onListen: (text: string) => void }) {
  const [lang] = useRvLang();
  const steps = GUIDE_STEPS[platform()];
  return (
    <section className="fc-guide" aria-labelledby="fc-guide-h" data-pna-formcheck-guide>
      <h3 id="fc-guide-h"><Camera aria-hidden="true" /> <T en="The camera is switched off" ru="Camera band hai" /></h3>
      <p className="fc-lead"><T en="Your browser is blocking the camera. Allow it once and it will work." ru="Aap ka browser camera ko rok raha hai. Ek baar allow kar dein, phir chalega." /></p>
      <ol className="fc-guide-steps">
        {steps.map((s, i) => (<li key={i}><span className="fc-step-n">{i + 1}</span><span>{s[lang]}</span></li>))}
      </ol>
      <button type="button" className="fc-soft" onClick={() => onListen(guideSpeech(lang, steps))} data-pna-formcheck-guide-listen><Volume2 aria-hidden="true" /> <T en="Listen" ru="Suniye" /></button>
      <button type="button" className="fc-go" onClick={onCheck} data-pna-formcheck-guide-check><RefreshCw aria-hidden="true" /> <T en="Check again" ru="Dobara check karein" /></button>
      {stillBlocked ? <p className="fc-problem" role="alert"><T en="Still blocked. Follow the steps above, then tap “Check again”." ru="Abhi bhi band hai. Upar ke qadam karein, phir “Dobara check karein” dabayein." /></p> : null}
      <p className="fc-note">{GUIDE_PHONE_NOTE[lang]}</p>
      <button type="button" className="fc-soft" onClick={onReload} data-pna-formcheck-guide-reload><RotateCw aria-hidden="true" /> <T en="Reload this page" ru="Page dobara kholein" /></button>
    </section>
  );
}
