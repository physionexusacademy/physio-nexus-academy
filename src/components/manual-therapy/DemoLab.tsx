"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";
import { AlertTriangle, Check, GitFork, Gauge, Hand, ListChecks, Pause, Play, ShieldCheck, TrendingUp, Workflow } from "lucide-react";
import { useLang } from "@/lib/lang";
import "./demo-lab.css";
import { motionReduced } from "@/lib/motion";

export type DemoLabData = {
  /** The existing step-by-step hands-and-tissue demonstration with its "why" panel. */
  doIt: ReactNode;
  how: string[];
  parameters: [string, string][];
  measure: string[];
  choose: string[];
  screen: string[];
  pitfalls: string[];
  ladder: string[];
};

type TabId = "do" | "how" | "dose" | "test" | "choose" | "safety" | "ladder";
const TABS: { id: TabId; icon: typeof Hand; en: string; ur: string; enHint: string; urHint: string }[] = [
  { id: "do", icon: Hand, en: "Do it", ur: "Karke dekhein", enHint: "Watch the hands and the tissue, step by step.", urHint: "Haath aur tissue ko qadam ba qadam dekhein." },
  { id: "how", icon: Workflow, en: "How it works", ur: "Kaise kaam karta hai", enHint: "The chain of events from the hands to the patient's change. It lights up one link at a time.", urHint: "Haathon se patient ki tabdeeli tak ki zanjeer. Ek ek kari roshan hoti hai." },
  { id: "dose", icon: Gauge, en: "How much", ur: "Kitna", enHint: "The dose dials: every setting a clinician chooses before starting.", urHint: "Dose ke dials: shuru karne se pehle clinician jo settings chunta hai." },
  { id: "test", icon: ListChecks, en: "Did it work?", ur: "Kya fayda hua?", enHint: "Measure, treat, measure again: the same test both times, so the result is a fact and not a feeling.", urHint: "Naapein, treat karein, dobara naapein: dono dafa wahi test, taake nateeja haqeeqat ho, ehsaas nahi." },
  { id: "choose", icon: GitFork, en: "Should I use it?", ur: "Kya yeh use karoon?", enHint: "The decision rules an experienced clinician runs through.", urHint: "Woh decision rules jo tajurbakaar clinician sochta hai." },
  { id: "safety", icon: ShieldCheck, en: "Safety gate", ur: "Safety gate", enHint: "Every check must pass before the technique starts. Common traps are below.", urHint: "Technique shuru karne se pehle har check pass hona chahiye. Aam ghaltiyan neeche hain." },
  { id: "ladder", icon: TrendingUp, en: "Easier or harder", ur: "Aasan ya mushkil", enHint: "How to make it easier or harder as the patient responds.", urHint: "Patient ke response ke mutabiq ise aasan ya mushkil kaise karein." },
];

/** Steps through a list on a timer while it is on screen (never when the visitor asked for reduced motion). */
export function useCycle(length: number, ms: number) {
  const [i, setI] = useState(0);
  const [playing, setPlaying] = useState(true);
  const [visible, setVisible] = useState(false);
  const [reduced, setReduced] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    setReduced(motionReduced());
    const node = ref.current;
    if (!node || typeof IntersectionObserver === "undefined") return setVisible(true);
    const observer = new IntersectionObserver(([entry]) => setVisible(entry.isIntersecting), { threshold: 0.3 });
    observer.observe(node);
    return () => observer.disconnect();
  }, []);
  useEffect(() => {
    if (!playing || !visible || reduced || length < 2) return;
    const id = window.setInterval(() => setI((current) => (current + 1) % length), ms);
    return () => window.clearInterval(id);
  }, [playing, visible, reduced, length, ms]);
  return { i, setI, playing, setPlaying, ref, reduced };
}

export function Controls({ cycle, length, label }: { cycle: ReturnType<typeof useCycle>; length: number; label: string }) {
  return (
    <div className="dl-controls">
      <button type="button" onClick={() => cycle.setPlaying((value) => !value)} aria-pressed={cycle.playing} aria-label={cycle.playing ? "Pause" : "Play"}>
        {cycle.playing ? <Pause className="h-4 w-4" aria-hidden="true" /> : <Play className="h-4 w-4" aria-hidden="true" />}
      </button>
      <ol aria-label={label}>
        {Array.from({ length }, (_, n) => (
          <li key={n}><button type="button" aria-current={n === cycle.i} aria-label={`${label} ${n + 1}`} onClick={() => { cycle.setPlaying(false); cycle.setI(n); }}>{n + 1}</button></li>
        ))}
      </ol>
    </div>
  );
}

/** A chain of events, lit one link at a time. */
export function Chain({ items, label }: { items: string[]; label: string }) {
  const cycle = useCycle(items.length, 3200);
  return (
    <div ref={cycle.ref} className="dl-stage" data-reduced={cycle.reduced ? "1" : "0"}>
      <ol className="dl-chain">
        {items.map((text, n) => (
          <li key={n} data-s={cycle.reduced || n < cycle.i ? "done" : n === cycle.i ? "now" : "next"} onClick={() => { cycle.setPlaying(false); cycle.setI(n); }}>
            <span className="dl-dot">{n + 1}</span>
            <span className="dl-text">{text}</span>
          </li>
        ))}
      </ol>
      <Controls cycle={cycle} length={items.length} label={label} />
    </div>
  );
}

/** Dials: one scanning ring per setting. The ring does not show a quantity; the written value does. */
function Dials({ items }: { items: [string, string][] }) {
  return (
    <div className="dl-stage dl-dials">
      {items.map(([label, value], n) => (
        <div key={label} className="dl-dial" style={{ ["--n" as string]: n }}>
          <svg viewBox="0 0 64 64" aria-hidden="true">
            <circle cx="32" cy="32" r="26" className="dl-ring-bg" />
            <circle cx="32" cy="32" r="26" className="dl-ring" />
            <circle cx="32" cy="32" r="3.5" className="dl-ring-dot" />
          </svg>
          <p className="dl-dial-label">{label}</p>
          <p className="dl-dial-value">{value}</p>
        </div>
      ))}
    </div>
  );
}

/** Measure, treat, measure again. */
function Retest({ items, ur }: { items: string[]; ur: boolean }) {
  const cycle = useCycle(3, 3800);
  const phases = ur ? ["1 · Pehle naapein", "2 · Treat karein", "3 · Dobara naapein"] : ["1 · Measure before", "2 · Treat", "3 · Measure again"];
  return (
    <div ref={cycle.ref} className="dl-stage">
      <ol className="dl-phases">
        {phases.map((phase, n) => <li key={phase} data-on={n === cycle.i ? "1" : "0"}>{phase}</li>)}
      </ol>
      <ul className="dl-ticks" data-phase={cycle.i}>
        {items.map((text, n) => (
          <li key={n} style={{ ["--n" as string]: n }}>
            <span className="dl-tick"><Check className="h-3.5 w-3.5" aria-hidden="true" /></span>
            <span>{text}</span>
          </li>
        ))}
      </ul>
      <p className="dl-banner" data-phase={cycle.i}>
        {cycle.i === 0 ? (ur ? "Har test likh lein, taake baad mein muqabla ho sake." : "Write each result down so there is something to compare with.")
          : cycle.i === 1 ? (ur ? "Ab technique karein, aur kuch bhi nayi cheez na badlein." : "Now the technique. Change nothing else.")
          : ur ? "Wahi tests, wahi tareeqa. Farq ab haqeeqat hai." : "The same tests, done the same way. Now the difference is a fact."}
      </p>
      <Controls cycle={cycle} length={3} label={ur ? "Marhala" : "Phase"} />
    </div>
  );
}

/** Decision rules split into "choose it" and "prefer something else". */
function Fork({ items, ur }: { items: string[]; ur: boolean }) {
  const other = items.filter((text) => /\b(prefer|instead|avoid|rather|not\b|unless|if .* (fails|unsuitable))/i.test(text));
  const yes = items.filter((text) => !other.includes(text));
  const lane = (list: string[], tone: string, title: string) => (
    <div className={`dl-lane dl-${tone}`}>
      <p className="dl-lane-title">{title}</p>
      {list.map((text, n) => <p key={n} className="dl-rule" style={{ ["--n" as string]: n }}>{text}</p>)}
    </div>
  );
  return (
    <div className="dl-stage">
      <p className="dl-root"><GitFork className="h-4 w-4" aria-hidden="true" /> {ur ? "Patient saamne hai. Ab kya?" : "The patient is in front of you. Now what?"}</p>
      <div className="dl-lanes">
        {lane(yes.length ? yes : items, "yes", ur ? "Choose it when…" : "Choose it when…")}
        {other.length ? lane(other, "no", ur ? "Kuch aur behtar hai jab…" : "Prefer something else when…") : null}
      </div>
    </div>
  );
}

/** Safety checks, passed one by one, then the common traps. */
export function Gate({ screen, pitfalls, ur, prefix = true }: { screen: string[]; pitfalls: string[]; ur: boolean; prefix?: boolean }) {
  const cycle = useCycle(screen.length + 1, 2600);
  return (
    <div ref={cycle.ref} className="dl-stage">
      <ol className="dl-gates">
        {screen.map((text, n) => (
          <li key={n} data-s={cycle.reduced || n < cycle.i ? "pass" : n === cycle.i ? "scan" : "wait"}>
            <span className="dl-gate-ico">{n < cycle.i || cycle.reduced ? <Check className="h-4 w-4" aria-hidden="true" /> : <ShieldCheck className="h-4 w-4" aria-hidden="true" />}</span>
            <span>{prefix ? <b>{ur ? "Ruk jayein ya refer karein agar: " : "Stop or refer if: "}</b> : null}{text}</span>
          </li>
        ))}
        <li className="dl-go" data-s={cycle.reduced || cycle.i === screen.length ? "pass" : "wait"}>
          <span className="dl-gate-ico"><Check className="h-4 w-4" aria-hidden="true" /></span>
          <span><b>{prefix ? (ur ? "Sab checks pass: technique shuru kar sakte hain." : "All checks passed: you can begin.") : ur ? "Yeh sab yaad rakhein, phir aage barhein." : "Keep all of this in mind, then go on."}</b></span>
        </li>
      </ol>
      <Controls cycle={cycle} length={screen.length + 1} label={ur ? "Check" : "Check"} />
      {pitfalls.length ? (<>
      <p className="dl-traps-title"><AlertTriangle className="h-4 w-4" aria-hidden="true" /> {ur ? "Aam ghaltiyan jo tajurbakaar bhi karte hain" : "Traps even experienced clinicians fall into"}</p>
      <div className="dl-traps">
        {pitfalls.map((text, n) => <p key={n} style={{ ["--n" as string]: n }}>{text}</p>)}
      </div>
      </>) : null}
    </div>
  );
}

/** Regress and progress as a staircase. */
export function Ladder({ items, ur }: { items: string[]; ur: boolean }) {
  const cycle = useCycle(items.length, 3200);
  return (
    <div ref={cycle.ref} className="dl-stage">
      <p className="dl-ladder-axis"><span>{ur ? "↓ Aasan karein" : "↓ Easier"}</span><span>{ur ? "Mushkil karein ↑" : "Harder ↑"}</span></p>
      <ol className="dl-ladder">
        {items.map((text, n) => (
          <li key={n} style={{ ["--n" as string]: items.length - 1 - n }} data-s={n === cycle.i ? "now" : n < cycle.i || cycle.reduced ? "done" : "next"} onClick={() => { cycle.setPlaying(false); cycle.setI(n); }}>
            <span className="dl-dot">{n + 1}</span><span className="dl-text">{text}</span>
          </li>
        ))}
      </ol>
      <Controls cycle={cycle} length={items.length} label={ur ? "Zeena" : "Step"} />
    </div>
  );
}

/** Seven demonstrations for one technique, one idea each. */
export function DemoLab({ data }: { data: DemoLabData }) {
  const [lang] = useLang();
  const ur = lang === "ur";
  const [tab, setTab] = useState<TabId>("do");
  const current = TABS.find((item) => item.id === tab) ?? TABS[0];
  const panel =
    tab === "how" ? <Chain items={data.how} label={ur ? "Kari" : "Link"} /> :
    tab === "dose" ? <Dials items={data.parameters} /> :
    tab === "test" ? <Retest items={data.measure} ur={ur} /> :
    tab === "choose" ? <Fork items={data.choose} ur={ur} /> :
    tab === "safety" ? <Gate screen={data.screen} pitfalls={data.pitfalls} ur={ur} /> :
    tab === "ladder" ? <Ladder items={data.ladder} ur={ur} /> :
    data.doIt;
  return (
    <div className="dl">
      <div className="dl-tabs" role="tablist" aria-label={ur ? "Demonstrations" : "Demonstrations"}>
        {TABS.map((item, n) => (
          <button key={item.id} type="button" role="tab" aria-selected={tab === item.id} onClick={() => setTab(item.id)} className="dl-tab">
            <item.icon className="h-4 w-4" aria-hidden="true" />
            <span className="dl-tab-n">{n + 1}</span>
            <span>{ur ? item.ur : item.en}</span>
          </button>
        ))}
      </div>
      <p className="dl-hint">{ur ? current.urHint : current.enHint}{ur && tab !== "do" ? " (Neeche ke points English mein hain; upar ka Roman Urdu guide dekhein.)" : ""}</p>
      <div key={`${tab}-${lang}`} role="tabpanel" className="dl-panel">{panel}</div>
    </div>
  );
}
