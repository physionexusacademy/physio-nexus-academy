"use client";

import { useMemo, useState, type ReactNode } from "react";
import Link from "next/link";
import { Activity, Dumbbell, Flame, HeartPulse, LineChart, Ruler, ShieldCheck } from "lucide-react";
import { activityFactors, dailyEnergy, heartRateZones, loadAtPercent, maxHeartRate, mic, oneRepMax, outcomeChange, waistHipRatio, type OutcomeMeasure } from "@/lib/calculators";
import "./clinical.css";

type Tab = "heart" | "whr" | "rm" | "energy" | "change";

const tabs: { id: Tab; label: string; icon: typeof HeartPulse; blurb: string }[] = [
  { id: "heart", label: "Heart rate zones", icon: HeartPulse, blurb: "Target heart rates for exercise" },
  { id: "whr", label: "Waist-hip ratio", icon: Ruler, blurb: "A quick check of belly-fat risk" },
  { id: "rm", label: "One-rep max", icon: Dumbbell, blurb: "Estimate strength and plan loads" },
  { id: "energy", label: "Daily energy", icon: Flame, blurb: "Resting and daily calories" },
  { id: "change", label: "Outcome change", icon: LineChart, blurb: "Did the score change enough to matter?" },
];

const num = (value: string) => (value.trim() === "" ? NaN : Number(value));

function Field({ label, children, hint }: { label: string; children: ReactNode; hint?: string }) {
  return (
    <label className="cc-field">
      <span>{label}</span>
      {children}
      {hint ? <small>{hint}</small> : null}
    </label>
  );
}

function Result({ children, tone = "ok" }: { children: ReactNode; tone?: "ok" | "warn" }) {
  return (
    <div className="cc-result" data-tone={tone} role="status" aria-live="polite">
      {children}
    </div>
  );
}

function safe<T>(run: () => T): { value?: T; error?: string } {
  try {
    return { value: run() };
  } catch (error) {
    return { error: error instanceof RangeError ? error.message : "Check the numbers you entered." };
  }
}

function HeartRate() {
  const [age, setAge] = useState("40");
  const [rest, setRest] = useState("65");
  const [formula, setFormula] = useState<"tanaka" | "fox">("tanaka");
  const out = useMemo(() => {
    const a = num(age);
    const r = num(rest);
    return safe(() => {
      const max = maxHeartRate(a, formula);
      return { max, zones: heartRateZones(max, r) };
    });
  }, [age, rest, formula]);
  return (
    <div className="cc-grid">
      <div className="cc-form">
        <Field label="Age (years)"><input inputMode="numeric" value={age} onChange={(e) => setAge(e.target.value)} /></Field>
        <Field label="Resting heart rate (beats a minute)" hint="Count the pulse for a full minute after resting, seated."><input inputMode="numeric" value={rest} onChange={(e) => setRest(e.target.value)} /></Field>
        <Field label="Maximum heart rate formula">
          <select value={formula} onChange={(e) => setFormula(e.target.value as "tanaka" | "fox")}>
            <option value="tanaka">Tanaka: 208 - 0.7 x age (suits adults better)</option>
            <option value="fox">Fox: 220 - age (older, simpler)</option>
          </select>
        </Field>
      </div>
      <div>
        {out.error ? <Result tone="warn">{out.error}</Result> : (
          <Result>
            <p className="cc-big">{out.value!.max} <span>estimated maximum</span></p>
            <ul className="cc-list">
              {out.value!.zones.map((z) => (
                <li key={z.label}><strong>{z.lowBpm} to {z.highBpm}</strong> beats a minute <span>{z.label}</span></li>
              ))}
            </ul>
            <p className="cc-note">The zones use the heart-rate reserve (Karvonen) method. Medicines such as a beta-blocker keep the heart rate low, and age formulas can be 10 beats or more off for one person, so use effort and symptoms as well, and follow the cardiac team&apos;s range after a heart event.</p>
          </Result>
        )}
      </div>
    </div>
  );
}

function Whr() {
  const [waist, setWaist] = useState("88");
  const [hip, setHip] = useState("100");
  const [sex, setSex] = useState<"male" | "female">("female");
  const out = useMemo(() => safe(() => waistHipRatio(num(waist), num(hip), sex)), [waist, hip, sex]);
  return (
    <div className="cc-grid">
      <div className="cc-form">
        <Field label="Waist (cm)" hint="Measured at the narrowest point or the midpoint between the ribs and the hip bone."><input inputMode="decimal" value={waist} onChange={(e) => setWaist(e.target.value)} /></Field>
        <Field label="Hip (cm)" hint="Measured at the widest part of the buttocks."><input inputMode="decimal" value={hip} onChange={(e) => setHip(e.target.value)} /></Field>
        <Field label="Sex">
          <select value={sex} onChange={(e) => setSex(e.target.value as "male" | "female")}>
            <option value="female">Female</option>
            <option value="male">Male</option>
          </select>
        </Field>
      </div>
      <div>
        {out.error ? <Result tone="warn">{out.error}</Result> : (
          <Result tone={out.value!.raised ? "warn" : "ok"}>
            <p className="cc-big">{out.value!.ratio.toFixed(2)} <span>waist-hip ratio</span></p>
            <p>{out.value!.raised ? `At or above ${out.value!.threshold.toFixed(2)}, the World Health Organization level for abdominal obesity. It raises the chance of heart and metabolic disease.` : `Below ${out.value!.threshold.toFixed(2)}, the World Health Organization level for abdominal obesity.`}</p>
            <p className="cc-note">A ratio is one clue only. Combine it with blood pressure, blood sugar, fitness and family history, and talk to a doctor about the whole picture.</p>
          </Result>
        )}
      </div>
    </div>
  );
}

function OneRm() {
  const [weight, setWeight] = useState("60");
  const [reps, setReps] = useState("5");
  const [formula, setFormula] = useState<"epley" | "brzycki">("epley");
  const out = useMemo(() => safe(() => {
    const r = num(reps);
    const rm = oneRepMax(num(weight), r, formula);
    return { rm, r, rows: [60, 70, 80, 90].map((p) => ({ p, load: loadAtPercent(rm, p) })) };
  }), [weight, reps, formula]);
  return (
    <div className="cc-grid">
      <div className="cc-form">
        <Field label="Weight lifted (kg)"><input inputMode="decimal" value={weight} onChange={(e) => setWeight(e.target.value)} /></Field>
        <Field label="Repetitions done to near-failure" hint="Use a set of 10 repetitions or fewer: above that the estimate becomes unreliable."><input inputMode="numeric" value={reps} onChange={(e) => setReps(e.target.value)} /></Field>
        <Field label="Formula">
          <select value={formula} onChange={(e) => setFormula(e.target.value as "epley" | "brzycki")}>
            <option value="epley">Epley</option>
            <option value="brzycki">Brzycki</option>
          </select>
        </Field>
      </div>
      <div>
        {out.error ? <Result tone="warn">{out.error}</Result> : (
          <Result tone={out.value!.r > 10 ? "warn" : "ok"}>
            <p className="cc-big">{out.value!.rm} kg <span>estimated one-rep max</span></p>
            <ul className="cc-list">
              {out.value!.rows.map((row) => (<li key={row.p}><strong>{row.load} kg</strong> <span>{row.p} percent of the maximum</span></li>))}
            </ul>
            {out.value!.r > 10 ? <p className="cc-note">More than 10 repetitions: treat this as a rough guide only.</p> : null}
            <p className="cc-note">Estimates are for planning gym or rehabilitation loads in healthy, supervised people. Do not test a true maximum in someone with an acute injury, a recent operation, heart disease or uncontrolled blood pressure.</p>
          </Result>
        )}
      </div>
    </div>
  );
}

function Energy() {
  const [sex, setSex] = useState<"male" | "female">("female");
  const [weight, setWeight] = useState("65");
  const [height, setHeight] = useState("163");
  const [age, setAge] = useState("30");
  const [activity, setActivity] = useState<keyof typeof activityFactors>("light");
  const out = useMemo(() => safe(() => dailyEnergy(sex, num(weight), num(height), num(age), activity)), [sex, weight, height, age, activity]);
  return (
    <div className="cc-grid">
      <div className="cc-form">
        <Field label="Sex">
          <select value={sex} onChange={(e) => setSex(e.target.value as "male" | "female")}>
            <option value="female">Female</option>
            <option value="male">Male</option>
          </select>
        </Field>
        <Field label="Weight (kg)"><input inputMode="decimal" value={weight} onChange={(e) => setWeight(e.target.value)} /></Field>
        <Field label="Height (cm)"><input inputMode="decimal" value={height} onChange={(e) => setHeight(e.target.value)} /></Field>
        <Field label="Age (15 and over)"><input inputMode="numeric" value={age} onChange={(e) => setAge(e.target.value)} /></Field>
        <Field label="Usual activity">
          <select value={activity} onChange={(e) => setActivity(e.target.value as keyof typeof activityFactors)}>
            <option value="sedentary">Sedentary: little or no exercise</option>
            <option value="light">Light: exercise 1 to 3 days a week</option>
            <option value="moderate">Moderate: exercise 3 to 5 days a week</option>
            <option value="active">Active: hard exercise 6 to 7 days a week</option>
            <option value="veryActive">Very active: hard daily exercise or a physical job</option>
          </select>
        </Field>
      </div>
      <div>
        {out.error ? <Result tone="warn">{out.error}</Result> : (
          <Result>
            <p className="cc-big">{out.value!.maintenance} <span>calories a day to maintain weight</span></p>
            <p>Resting energy (Mifflin-St Jeor equation): <strong>{out.value!.bmr}</strong> calories a day.</p>
            <p className="cc-note">An estimate, usually within about 10 percent for healthy adults. For weight change, illness, pregnancy or sport, ask a dietitian.</p>
          </Result>
        )}
      </div>
    </div>
  );
}

function Change() {
  const [measure, setMeasure] = useState<OutcomeMeasure>("nprs");
  const [base, setBase] = useState("7");
  const [follow, setFollow] = useState("4");
  const out = useMemo(() => safe(() => outcomeChange(measure, num(base), num(follow))), [measure, base, follow]);
  const spec = mic[measure];
  return (
    <div className="cc-grid">
      <div className="cc-form">
        <Field label="Measure">
          <select value={measure} onChange={(e) => setMeasure(e.target.value as OutcomeMeasure)}>
            {(Object.keys(mic) as OutcomeMeasure[]).map((key) => (<option key={key} value={key}>{mic[key].label}</option>))}
          </select>
        </Field>
        <Field label="First score (baseline)" hint={`0 to ${spec.max}. Lower is better.`}><input inputMode="decimal" value={base} onChange={(e) => setBase(e.target.value)} /></Field>
        <Field label="Latest score" hint={`0 to ${spec.max}.`}><input inputMode="decimal" value={follow} onChange={(e) => setFollow(e.target.value)} /></Field>
      </div>
      <div>
        {out.error ? <Result tone="warn">{out.error}</Result> : (
          <Result tone={out.value!.worsened ? "warn" : "ok"}>
            <p className="cc-big">{out.value!.change > 0 ? "+" : ""}{out.value!.change} <span>points ({out.value!.percent > 0 ? "+" : ""}{out.value!.percent} percent)</span></p>
            <p>
              {out.value!.worsened ? "The score has gone up (worse). " : out.value!.improved ? "The score has gone down (better). " : "No change. "}
              {out.value!.important ? `This reaches the usual minimal important change (${spec.points} points or ${spec.percent} percent), so the patient is likely to feel the difference.` : `This is below the usual minimal important change (${spec.points} points or ${spec.percent} percent), so it may be within normal variation.`}
            </p>
            <p className="cc-note">Thresholds are from Ostelo and colleagues (Spine 2008) for low back pain. Other conditions and measures have their own thresholds. Always ask the patient how they feel as well.</p>
          </Result>
        )}
      </div>
    </div>
  );
}

export default function ClinicalCalculators() {
  const [tab, setTab] = useState<Tab>("heart");
  const current = tabs.find((t) => t.id === tab)!;
  return (
    <div className="cc-page">
      <header className="cc-hero">
        <p className="cc-eyebrow"><Activity aria-hidden="true" /> Clinical calculators</p>
        <h1>Numbers you use in the clinic, worked out for you</h1>
        <p>Five free tools for exercise, fitness and outcome tracking. Everything is calculated in your browser: nothing is sent or stored.</p>
      </header>
      <div className="cc-shell">
        <div className="cc-tabs" role="tablist" aria-label="Calculators">
          {tabs.map((t) => (
            <button key={t.id} role="tab" type="button" id={`tab-${t.id}`} aria-selected={tab === t.id} aria-controls="cc-panel" onClick={() => setTab(t.id)} className="cc-tab" data-active={tab === t.id}>
              <t.icon aria-hidden="true" />
              <span>{t.label}</span>
            </button>
          ))}
        </div>
        <section id="cc-panel" role="tabpanel" aria-labelledby={`tab-${tab}`} className="cc-card">
          <h2>{current.label}</h2>
          <p className="cc-sub">{current.blurb}</p>
          {tab === "heart" ? <HeartRate /> : tab === "whr" ? <Whr /> : tab === "rm" ? <OneRm /> : tab === "energy" ? <Energy /> : <Change />}
        </section>
        <p className="cc-safe"><ShieldCheck aria-hidden="true" /> These calculators are teaching and screening aids. They never replace a clinician&apos;s judgement, and they do not diagnose. See also the <Link href="/health-calculators/bmi">BMI calculator</Link> and the <Link href="/learn/outcome-measures-minimal-important-change">outcome measures lesson</Link>.</p>
      </div>
    </div>
  );
}
