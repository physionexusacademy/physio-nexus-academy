"use client";

import { useState } from "react";
import type { TeacherLang } from "@/lib/teacher/types";
import { cn } from "@/lib/utils";
import { t } from "../ui";
import { Seg, WidgetFrame } from "./kit";

type Ear = "R" | "L";
type Step = {
  short: { en: string; ur: string };
  /** where the crystal sits along the long arc of the posterior canal: 0 = ampulla end, 1 = the opening into the vestibule */
  s: number;
  /** direction gravity pulls, in degrees (90 = straight down the screen) */
  gravity: number;
  hold: boolean;
};

const STEPS: Step[] = [
  { short: { en: "Sit", ur: "Baithein" }, s: 0.5, gravity: 90, hold: false },
  { short: { en: "Lie back", ur: "Peeche lete" }, s: 0.12, gravity: 130, hold: true },
  { short: { en: "Turn head", ur: "Sar ghumayein" }, s: 0.5, gravity: 70, hold: true },
  { short: { en: "Roll", ur: "Karwat" }, s: 0.86, gravity: 40, hold: true },
  { short: { en: "Sit up", ur: "Uth baithein" }, s: 1.02, gravity: 90, hold: false },
];

const R = 58;
const CX = 110;
const CY = 100;
// The long arc runs from the ampulla (upper left) round the bottom to the common crus (upper right).
const angleAt = (s: number) => ((230 - 290 * Math.min(s, 1)) * Math.PI) / 180;
const pointAt = (s: number) => ({ x: CX + R * Math.cos(angleAt(s)), y: CY + R * Math.sin(angleAt(s)) });

function Pictogram({ step }: { step: number }) {
  // Very small side-view pictograms: the bed, the body and the head. The head is the filled circle; the arrow is where the nose points.
  return (
    <svg viewBox="0 0 150 90" className="h-auto w-full max-w-[220px]" role="img" aria-hidden="true">
      <rect x="0" y="0" width="150" height="90" rx="10" fill="#f8fafc" />
      {step === 0 || step === 4 ? (
        <>
          <rect x="30" y="66" width="90" height="8" rx="3" fill="#cbd5e1" />
          <line x1="75" y1="64" x2="75" y2="34" stroke="#475569" strokeWidth="9" strokeLinecap="round" />
          <circle cx="75" cy="22" r="10" fill="#0f766e" />
          <path d={step === 0 ? "M85 20 L96 14" : "M85 25 L96 30"} stroke="#0f766e" strokeWidth="3" strokeLinecap="round" />
        </>
      ) : null}
      {step === 1 || step === 2 ? (
        <>
          <rect x="60" y="46" width="90" height="8" rx="3" fill="#cbd5e1" />
          <line x1="64" y1="42" x2="140" y2="42" stroke="#475569" strokeWidth="9" strokeLinecap="round" />
          <circle cx="44" cy="52" r="10" fill="#0f766e" />
          <path d={step === 1 ? "M38 62 L30 70" : "M50 62 L58 70"} stroke="#0f766e" strokeWidth="3" strokeLinecap="round" />
          <text x="8" y="22" fontSize="11" fontWeight="800" fill="#64748b">20°</text>
        </>
      ) : null}
      {step === 3 ? (
        <>
          <rect x="40" y="64" width="100" height="8" rx="3" fill="#cbd5e1" />
          <ellipse cx="96" cy="56" rx="38" ry="9" fill="#475569" />
          <circle cx="50" cy="52" r="10" fill="#0f766e" />
          <path d="M44 60 L40 70" stroke="#0f766e" strokeWidth="3" strokeLinecap="round" />
        </>
      ) : null}
    </svg>
  );
}

export function BppvEpley({ lang }: { lang: TeacherLang }) {
  const [ear, setEar] = useState<Ear>("R");
  const [step, setStep] = useState(0);
  const side = ear === "R" ? t(lang, "RIGHT", "RIGHT") : t(lang, "LEFT", "LEFT");
  const other = ear === "R" ? t(lang, "LEFT", "LEFT") : t(lang, "RIGHT", "RIGHT");
  const cur = STEPS[step];
  const crystal = cur.s > 1 ? { x: CX + 86, y: CY - 80 } : pointAt(cur.s);
  const g = (cur.gravity * Math.PI) / 180;

  const text: { title: string; what: string; feel: string }[] = [
    {
      title: t(lang, `Sit up, head turned 45° toward the ${side} (affected) ear`, `Baithein, sar 45° ${side} (mutasir) kaan ki taraf`),
      what: t(lang, "Sit across the bed so that when the patient lies back their head will hang over the end. The loose crystals rest at the low point of the posterior canal.", "Bed par aise baithayein ke lete hue sar bed ke kinare se bahar latke. Dheelay crystals posterior canal ke sab se neechay hissay mein rehte hain."),
      feel: t(lang, "Nothing yet. Warn them: they may feel dizzy and that is expected.", "Abhi kuch nahi. Pehle bata dein: chakkar aa sakta hai aur yeh umeed ke mutabiq hai."),
    },
    {
      title: t(lang, `Lie back quickly, head hanging about 20°, still turned toward the ${side} ear`, `Jaldi se lete, sar taqreeban 20° latka hua, ab bhi ${side} kaan ki taraf`),
      what: t(lang, "This is the Dix-Hallpike position and the first step of the Epley. Gravity pulls the crystals toward the ampulla, they drag the fluid and push the sensor.", "Yeh Dix-Hallpike position hai aur Epley ka pehla qadam. Gravity crystals ko ampulla ki taraf kheenchti hai, woh fluid ko kheenchte hain aur sensor ko dhakelte hain."),
      feel: t(lang, "Spinning vertigo after a short delay and up-beating, twisting (torsional) nystagmus. It builds, then fades in under a minute. Hold until it settles (usually 30–60 s).", "Thori der baad ghoomta chakkar aur upar ki taraf jhatkay lene wala, ghoomta hua (torsional) nystagmus. Barhta hai phir ek minute se kam mein khatam. Settle hone tak (aam taur par 30–60 s) rokein."),
    },
    {
      title: t(lang, `Turn the head 90° to the ${other}, still hanging`, `Sar 90° ${other} ki taraf ghumayein, ab bhi latka hua`),
      what: t(lang, "The head is now about 45° toward the unaffected side. The crystals travel along the canal toward the common opening. Hold 30–60 s, or until the dizziness settles.", "Ab sar taqreeban 45° theek side ki taraf hai. Crystals canal mein common opening ki taraf safar karte hain. 30–60 s ya chakkar settle hone tak rokein."),
      feel: t(lang, "A second, usually weaker wave of dizziness.", "Chakkar ki doosri, aam taur par kamzor lehr."),
    },
    {
      title: t(lang, `Roll the head and body another 90° to the ${other}: nose pointing down about 45°`, `Sar aur jism ko mazeed 90° ${other} ki taraf ghumayein: naak taqreeban 45° neechay`),
      what: t(lang, "The crystals reach the end of the canal, the common crus. Hold 30–60 s.", "Crystals canal ke aakhir, common crus, tak pohanch jate hain. 30–60 s rokein."),
      feel: t(lang, "Often a mild or no dizziness now.", "Ab aksar halka ya koi chakkar nahi."),
    },
    {
      title: t(lang, "Sit up slowly, head forward", "Aahista uth baithein, sar aage"),
      what: t(lang, "The crystals fall out of the canal into the vestibule (the utricle), where they no longer disturb the sensor. Stay seated for a few minutes; keep the patient safe while the dizziness clears.", "Crystals canal se nikal kar vestibule (utricle) mein gir jate hain, jahan woh sensor ko pareshan nahi karte. Chand minute baithe rahein; chakkar jane tak patient ko mehfooz rakhein."),
      feel: t(lang, "A little unsteadiness is possible. Then retest the Dix-Hallpike: it should now be negative.", "Thori larkharahat ho sakti hai. Phir Dix-Hallpike dobara karein: ab negative hona chahiye."),
    },
  ];
  const info = text[step];
  const ampulla = pointAt(0);
  const crus = pointAt(1);

  return (
    <WidgetFrame id="bppv-epley">
      <div className="flex flex-wrap items-center gap-3">
        <p className="text-sm font-bold text-navy-800">{t(lang, "Affected ear (from the Dix-Hallpike test):", "Mutasir kaan (Dix-Hallpike test se):")}</p>
        <Seg value={ear} onChange={(next) => setEar(next)} label={t(lang, "Affected ear", "Mutasir kaan")} options={[{ id: "R", label: t(lang, "Right ear", "Right kaan") }, { id: "L", label: t(lang, "Left ear", "Left kaan") }]} />
      </div>

      <div className="mt-3 flex flex-wrap gap-1.5" role="group" aria-label={t(lang, "Epley steps", "Epley ke qadam")}>
        {STEPS.map((entry, index) => (
          <button
            key={entry.short.en}
            type="button"
            aria-pressed={step === index}
            onClick={() => setStep(index)}
            className={cn("min-h-10 rounded-xl border px-3 py-1.5 text-sm font-bold transition", step === index ? "border-navy-800 bg-navy-800 text-white" : "border-slate-200 bg-white text-slate-700 hover:border-teal-300")}
          >
            {index + 1}. {lang === "ur" ? entry.short.ur : entry.short.en}
          </button>
        ))}
      </div>

      <div className="mt-3 grid gap-3 sm:grid-cols-[minmax(0,230px)_1fr] sm:items-start">
        <div className="grid gap-2">
          <svg viewBox="0 0 220 200" className="h-auto w-full max-w-[230px] rounded-xl bg-slate-50" role="img" aria-label={t(lang, "The posterior semicircular canal with one loose crystal moving round it", "Posterior semicircular canal aur us mein ghoomta ek dheela crystal")}>
            <path d={`M ${ampulla.x} ${ampulla.y} A ${R} ${R} 0 1 0 ${crus.x} ${crus.y}`} fill="none" stroke="#94a3b8" strokeWidth="14" strokeLinecap="round" />
            <path d={`M ${ampulla.x} ${ampulla.y} A ${R} ${R} 0 1 0 ${crus.x} ${crus.y}`} fill="none" stroke="#e2e8f0" strokeWidth="9" strokeLinecap="round" />
            <circle cx={ampulla.x} cy={ampulla.y} r="12" fill="#c4b5fd" stroke="#7c3aed" strokeWidth="2" />
            <text x="6" y={ampulla.y + 2} fontSize="11" fontWeight="800" fill="#6d28d9">ampulla</text>
            <text x="6" y={ampulla.y + 14} fontSize="11" fontWeight="800" fill="#6d28d9">{t(lang, "(sensor)", "(sensor)")}</text>
            <ellipse cx={CX + 82} cy={CY - 78} rx="26" ry="16" fill="#bae6fd" stroke="#0284c7" strokeWidth="2" />
            <text x={CX + 82} y={CY - 52} textAnchor="middle" fontSize="11" fontWeight="800" fill="#075985">{t(lang, "vestibule", "vestibule")}</text>
            <line x1={crus.x} y1={crus.y} x2={CX + 68} y2={CY - 70} stroke="#94a3b8" strokeWidth="9" strokeLinecap="round" />
            <g style={{ transform: `translate(${crystal.x}px, ${crystal.y}px)`, transition: "transform 0.7s ease" }}>
              <circle cx="0" cy="0" r="8" fill="#f59e0b" stroke="#92400e" strokeWidth="2" />
            </g>
            <text x={CX} y={CY + 4} textAnchor="middle" fontSize="11" fontWeight="700" fill="#64748b">{t(lang, "posterior canal", "posterior canal")}</text>
            <g transform="translate(184 146)">
              <line x1="0" y1="0" x2={Math.cos(g) * 26} y2={Math.sin(g) * 26} stroke="#dc2626" strokeWidth="3" markerEnd="url(#arrow)" />
              <circle cx="0" cy="0" r="3" fill="#dc2626" />
              <text x="-14" y="-10" fontSize="11" fontWeight="800" fill="#dc2626">{t(lang, "gravity", "gravity")}</text>
            </g>
            <defs>
              <marker id="arrow" markerWidth="8" markerHeight="8" refX="5" refY="4" orient="auto">
                <path d="M0 0 L8 4 L0 8 Z" fill="#dc2626" />
              </marker>
            </defs>
          </svg>
          <Pictogram step={step} />
        </div>

        <div className="grid gap-2" aria-live="polite">
          <div className="rounded-xl bg-slate-50 p-3">
            <p className="text-sm font-extrabold text-navy-800">
              {step + 1}. {info.title}
            </p>
            <p className="mt-1 text-sm leading-6 text-slate-600">{info.what}</p>
            <p className="mt-2 text-sm leading-6 text-slate-700">
              <b>{t(lang, "What you see and the patient feels: ", "Aap kya dekhte hain aur patient kya mehsoos karta hai: ")}</b>
              {info.feel}
            </p>
          </div>
          <div className="flex gap-2">
            <button type="button" disabled={step === 0} onClick={() => setStep(step - 1)} className="min-h-10 flex-1 rounded-xl border border-slate-200 bg-white px-3 text-sm font-bold text-slate-700 disabled:opacity-40">
              {t(lang, "Back", "Peeche")}
            </button>
            <button type="button" disabled={step === STEPS.length - 1} onClick={() => setStep(step + 1)} className="min-h-10 flex-1 rounded-xl bg-navy-800 px-3 text-sm font-bold text-white disabled:opacity-40">
              {t(lang, "Next step", "Agla qadam")}
            </button>
          </div>
          <div className="rounded-xl border border-rose-200 bg-rose-50 p-3 text-xs leading-5 text-rose-900">
            <b>{t(lang, "Stop and refer (do not treat) if: ", "Ruk jayein aur refer karein (ilaaj na karein) agar: ")}</b>
            {t(
              lang,
              "the nystagmus beats DOWN, has no delay, does not fade, or comes with new weakness, double vision, slurred speech, severe headache or neck pain, or gait ataxia. These point to a central cause. Take extra care with a painful or unstable neck, severe back problems or unstable heart disease.",
              "nystagmus NEECHAY ki taraf ho, koi delay na ho, khatam na ho, ya saath naye kamzori, double vision, lukhnat, shadeed sar dard ya gardan dard, ya chaal ki ataxia ho. Yeh central wajah dikhate hain. Dard wali ya ghair mustahkam gardan, shadeed kamar ke masail ya ghair mustahkam dil ki bimari mein khaas ehtiyat.",
            )}
          </div>
        </div>
      </div>
    </WidgetFrame>
  );
}
