"use client";

import { useState } from "react";
import type { TeacherLang } from "@/lib/teacher/types";
import { cn } from "@/lib/utils";
import { t } from "../ui";

type Phase = {
  name: string;
  from: number;
  to: number;
  stance: boolean;
  what: { en: string; ur: string };
  muscles: { en: string; ur: string };
  weak: { en: string; ur: string };
};

/** Rancho Los Amigos phases, percentages of one gait cycle (Perry & Burnfield). */
const phases: Phase[] = [
  {
    name: "Initial contact",
    from: 0,
    to: 2,
    stance: true,
    what: { en: "The heel meets the ground; the leg is reaching forward.", ur: "Aedi zameen se milti hai; taang aage ki taraf phaili hui." },
    muscles: { en: "Dorsiflexors hold the ankle; hip extensors and hamstrings get ready to absorb.", ur: "Dorsiflexors ankle thamte hain; hip extensors aur hamstrings jhatka jazb karne ko tayyar." },
    weak: { en: "Weak dorsiflexors → flat-foot or toe-first contact.", ur: "Kamzor dorsiflexors → poore paon ya ungliyon se pehle contact." },
  },
  {
    name: "Loading response",
    from: 2,
    to: 10,
    stance: true,
    what: { en: "Weight is accepted; the foot lowers to the floor and the knee bends a little to absorb shock. Both feet are down (double support).", ur: "Wazan qubool hota hai; paon farsh par aata hai aur ghutna thora murta hai taake jhatka jazb ho. Dono paon neeche (double support)." },
    muscles: { en: "Dorsiflexors (eccentric), quadriceps (eccentric), hip extensors and abductors.", ur: "Dorsiflexors (eccentric), quadriceps (eccentric), hip extensors aur abductors." },
    weak: { en: "Foot slap (dorsiflexors); knee buckling or \"quad avoidance\" (quadriceps).", ur: "Foot slap (dorsiflexors); ghutna murna ya \"quad avoidance\" (quadriceps)." },
  },
  {
    name: "Mid stance",
    from: 10,
    to: 30,
    stance: true,
    what: { en: "The body travels over a single, stable leg while the other leg swings.", ur: "Jism ek mazboot taang ke upar se guzarta hai jabke doosri taang jhoolti hai." },
    muscles: { en: "Calf (plantarflexors) controls the shin moving forward; hip abductors keep the pelvis level.", ur: "Calf (plantarflexors) shin ke aage jaane ko control karta hai; hip abductors pelvis seedha rakhte hain." },
    weak: { en: "Trendelenburg — the pelvis drops on the other side (weak hip abductors).", ur: "Trendelenburg — doosri side ka pelvis girta hai (kamzor hip abductors)." },
  },
  {
    name: "Terminal stance",
    from: 30,
    to: 50,
    stance: true,
    what: { en: "The heel rises and the body moves ahead of the foot.", ur: "Aedi uthti hai aur jism paon se aage nikal jata hai." },
    muscles: { en: "Calf (gastrocnemius–soleus) — its peak activity.", ur: "Calf (gastrocnemius–soleus) — sab se zyada activity." },
    weak: { en: "Weak push-off and a short step on the other side.", ur: "Kamzor push-off aur doosri taraf chhota qadam." },
  },
  {
    name: "Pre-swing",
    from: 50,
    to: 60,
    stance: true,
    what: { en: "Toe-off: weight shifts to the other leg (double support again).", ur: "Toe-off: wazan doosri taang par jata hai (phir double support)." },
    muscles: { en: "Calf finishes push-off; hip flexors start pulling the leg forward.", ur: "Calf push-off mukammal karta hai; hip flexors taang ko aage kheenchna shuru karte hain." },
    weak: { en: "Reduced push-off and slow walking.", ur: "Kam push-off aur dheema chalna." },
  },
  {
    name: "Initial swing",
    from: 60,
    to: 73,
    stance: false,
    what: { en: "The foot leaves the ground; the knee bends to clear the toes.", ur: "Paon zameen chhorta hai; ungliyan bachane ke liye ghutna murta hai." },
    muscles: { en: "Hip flexors; dorsiflexors lift the toes.", ur: "Hip flexors; dorsiflexors ungliyan uthate hain." },
    weak: { en: "Toe drag / foot drop (weak dorsiflexors); poor clearance.", ur: "Ungliyan ghasitna / foot drop (kamzor dorsiflexors); paon na uthna." },
  },
  {
    name: "Mid swing",
    from: 73,
    to: 87,
    stance: false,
    what: { en: "The leg swings forward; the shin is vertical and the foot clears the floor.", ur: "Taang aage jhoolti hai; shin seedhi hoti hai aur paon farsh se upar." },
    muscles: { en: "Hip flexors; dorsiflexors keep the ankle neutral.", ur: "Hip flexors; dorsiflexors ankle ko neutral rakhte hain." },
    weak: { en: "Steppage or circumduction to clear a dropped foot.", ur: "Gire paon ko uthane ke liye steppage ya circumduction." },
  },
  {
    name: "Terminal swing",
    from: 87,
    to: 100,
    stance: false,
    what: { en: "The leg slows down and straightens, ready for the heel to land.", ur: "Taang dheemi ho kar seedhi hoti hai, aedi utarne ko tayyar." },
    muscles: { en: "Hamstrings (eccentric) decelerate the leg; quadriceps extend the knee.", ur: "Hamstrings (eccentric) taang ko dheema karte hain; quadriceps ghutna seedha karte hain." },
    weak: { en: "Poor control — an abrupt or short step.", ur: "Kam control — jhatke wala ya chhota qadam." },
  },
];

export function GaitCycleWidget({ lang }: { lang: TeacherLang }) {
  const [position, setPosition] = useState(20);
  const phase = phases.find((item) => position >= item.from && position < item.to) ?? phases[phases.length - 1];
  const doubleSupport = position < 10 || (position >= 50 && position < 60);

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-3 sm:p-4" data-pna-widget="gait-cycle">
      <div className="relative" aria-hidden="true">
        <div className="flex h-9 overflow-hidden rounded-xl">
          {phases.map((item) => (
            <div
              key={item.name}
              className={cn(
                "flex items-center justify-center border-r border-white/70 text-[10px] font-extrabold transition",
                item.stance ? "bg-teal-200 text-teal-900" : "bg-amber-200 text-amber-900",
                item === phase && (item.stance ? "bg-teal-600 text-white" : "bg-amber-500 text-white"),
              )}
              style={{ width: `${item.to - item.from}%` }}
              title={item.name}
            >
              {item.to - item.from >= 10 ? item.name.split(" ").map((word) => word[0]).join("") : ""}
            </div>
          ))}
        </div>
        <div className="pointer-events-none absolute -bottom-1 -top-1 w-0.5 -translate-x-1/2 rounded bg-navy-800" style={{ left: `${position}%` }} />
        <div className="mt-1.5 flex text-[11px] font-bold">
          <span className="text-teal-800" style={{ width: "60%" }}>
            {t(lang, "Stance ~60%", "Stance ~60%")}
          </span>
          <span className="text-amber-800">{t(lang, "Swing ~40%", "Swing ~40%")}</span>
        </div>
      </div>

      <label className="mt-3 block">
        <span className="flex items-baseline justify-between gap-2">
          <span className="text-sm font-bold text-navy-800">{t(lang, "Right leg — % of the gait cycle", "Right taang — gait cycle ka %")}</span>
          <span className="rounded-full bg-navy-800 px-3 py-1 text-xs font-extrabold tabular-nums text-white">{position}%</span>
        </span>
        <input
          type="range"
          min={0}
          max={99}
          value={position}
          onChange={(event) => setPosition(Number(event.target.value))}
          className="mt-2 w-full accent-teal-700"
          aria-valuetext={`${position}% — ${phase.name}`}
        />
      </label>

      <div className="mt-3 rounded-xl border border-slate-100 bg-slate-50 p-3" aria-live="polite">
        <div className="flex flex-wrap items-center gap-2">
          <p className="text-base font-extrabold text-navy-800">{phase.name}</p>
          <span className={cn("rounded-full px-2.5 py-0.5 text-[11px] font-extrabold", phase.stance ? "bg-teal-100 text-teal-800" : "bg-amber-100 text-amber-800")}>
            {phase.stance ? t(lang, "Foot on the ground", "Paon zameen par") : t(lang, "Foot in the air", "Paon hawa mein")}
          </span>
          {doubleSupport ? (
            <span className="rounded-full bg-violet-100 px-2.5 py-0.5 text-[11px] font-extrabold text-violet-800">{t(lang, "Double support", "Double support")}</span>
          ) : null}
          <span className="text-xs font-semibold text-slate-500">
            {phase.from}–{phase.to}%
          </span>
        </div>
        <dl className="mt-2 grid gap-2 sm:grid-cols-3">
          <div className="rounded-lg bg-white p-2.5">
            <dt className="text-[11px] font-extrabold uppercase tracking-wider text-slate-500">{t(lang, "What's happening", "Kya ho raha hai")}</dt>
            <dd className="mt-1 text-sm leading-6 text-slate-700">{lang === "ur" ? phase.what.ur : phase.what.en}</dd>
          </div>
          <div className="rounded-lg bg-white p-2.5">
            <dt className="text-[11px] font-extrabold uppercase tracking-wider text-slate-500">{t(lang, "Muscles at work", "Kaam karne wale muscles")}</dt>
            <dd className="mt-1 text-sm leading-6 text-slate-700">{lang === "ur" ? phase.muscles.ur : phase.muscles.en}</dd>
          </div>
          <div className="rounded-lg bg-rose-50 p-2.5">
            <dt className="text-[11px] font-extrabold uppercase tracking-wider text-rose-700">{t(lang, "If they're weak", "Agar kamzor hon")}</dt>
            <dd className="mt-1 text-sm font-semibold leading-6 text-rose-900">{lang === "ur" ? phase.weak.ur : phase.weak.en}</dd>
          </div>
        </dl>
      </div>
      <p className="mt-2 text-xs text-slate-500">
        {t(lang, "Percentages are typical for comfortable walking speed and change with speed.", "Percentages aaram ki raftaar ke liye aam hain aur raftaar ke saath badalte hain.")}
      </p>
    </div>
  );
}
