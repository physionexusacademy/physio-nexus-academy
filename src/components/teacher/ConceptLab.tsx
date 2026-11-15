"use client";

import { useEffect, useMemo, useState } from "react";
import { BookOpenCheck, ClipboardList, GitCompareArrows, Lightbulb, ShieldCheck, Stethoscope, Workflow } from "lucide-react";
import { useLang } from "@/lib/lang";
import { labData, labTabs, type LabData, type LabTab } from "@/lib/teacher/concept-lab";
import type { BiText, TeacherLesson } from "@/lib/teacher/types";
import { Chain, Controls, Gate, Ladder, useCycle } from "@/components/manual-therapy/DemoLab";

const TAB_INFO: Record<LabTab, { icon: typeof Workflow; en: string; ur: string; enHint: string; urHint: string }> = {
  how: { icon: Workflow, en: "How it works", ur: "Kaise kaam karta hai", enHint: "The idea as a chain, lit one link at a time. Tap any link.", urHint: "Idea ek zanjeer ki tarah, ek ek kari roshan hoti hai. Kisi bhi kari par tap karein." },
  picture: { icon: Lightbulb, en: "Picture it", ur: "Tasveer banayein", enHint: "An everyday comparison and a memory trick, so it sticks.", urHint: "Rozmarra ki misal aur yaad rakhne ka tareeqa, taake yaad reh jaye." },
  clinic: { icon: Stethoscope, en: "In the clinic", ur: "Clinic mein", enHint: "One patient from first look to re-check, and what changes in your practice.", urHint: "Ek patient pehli nazar se dobara check tak, aur aap ki practice mein kya badalta hai." },
  steps: { icon: ClipboardList, en: "Step by step", ur: "Qadam ba qadam", enHint: "The procedure as a staircase, one step at a time.", urHint: "Tareeqa zeene ki tarah, ek ek qadam." },
  safety: { icon: ShieldCheck, en: "Stop signs & traps", ur: "Ruknay ke nishan aur ghaltiyan", enHint: "What must be checked first, and where students usually go wrong.", urHint: "Pehle kya check karna zaroori hai, aur students aam taur par kahan ghalti karte hain." },
  compare: { icon: GitCompareArrows, en: "Compare", ur: "Muqabla", enHint: "Side by side, so the difference is obvious.", urHint: "Saath saath, taake farq saaf nazar aaye." },
  quiz: { icon: BookOpenCheck, en: "Test yourself", ur: "Khud ko parkhein", enHint: "Pick an answer: every option tells you why.", urHint: "Jawab chunein: har option batata hai kyun." },
};

const plain = (text: string) => text.replace(/\*\*/g, "").trim();

function Picture({ data, ur }: { data: LabData; ur: boolean }) {
  const text = (value: BiText) => plain(ur ? value.ur : value.en);
  return (
    <div className="dl-stage cl-picture">
      {data.picture.slice(0, 4).map((item, n) => (
        <div key={n} className="cl-card" data-k={item.kind} style={{ ["--n" as string]: n }}>
          <b className="cl-tag">{item.kind === "analogy" ? (ur ? "Aise socheein" : "Think of it like this") : ur ? "Yaad rakhein" : "Remember it"}</b>
          <br />
          {text(item.text)}
        </div>
      ))}
    </div>
  );
}

function CaseFlow({ data, ur }: { data: LabData; ur: boolean }) {
  const flow = data.caseFlow;
  const nodes = flow
    ? [
        { label: ur ? "1 · Patient" : "1 · The patient", text: flow.patient },
        { label: ur ? "2 · Assessment" : "2 · What you find", text: flow.assessment },
        { label: ur ? "3 · Treatment" : "3 · What you do", text: flow.treatment },
        { label: ur ? "4 · Dobara check" : "4 · What changed", text: flow.reassess },
      ]
    : [];
  const cycle = useCycle(nodes.length || 1, 3600);
  return (
    <div ref={cycle.ref} className="dl-stage">
      {flow ? (
        <>
          <div className="cl-flow">
            {nodes.map((node, n) => (
              <button key={node.label} type="button" data-on={n === cycle.i ? "1" : "0"} onClick={() => { cycle.setPlaying(false); cycle.setI(n); }}>{node.label}</button>
            ))}
          </div>
          <p key={cycle.i} className="cl-flow-card">{ur && flow.ur && cycle.i === 0 ? flow.ur : nodes[Math.min(cycle.i, nodes.length - 1)].text}</p>
          {ur && flow.ur && cycle.i !== 0 ? <p className="dl-hint" style={{ color: "#9fb7d1" }}>Poora case Roman Urdu mein: pehle step par dekhein.</p> : null}
          <Controls cycle={cycle} length={nodes.length} label={ur ? "Marhala" : "Phase"} />
        </>
      ) : null}
      {data.clinic.length ? (
        <div className="cl-clinic">
          <p className="dl-traps-title" style={{ marginTop: flow ? "1.2rem" : 0 }}><Stethoscope className="h-4 w-4" aria-hidden="true" /> {ur ? "Aap ki practice mein kya badalta hai" : "What changes in your practice"}</p>
          {data.clinic.map((item, n) => <p key={n}>{plain(ur ? item.ur : item.en)}</p>)}
        </div>
      ) : null}
    </div>
  );
}

function Compare({ data, ur }: { data: LabData; ur: boolean }) {
  const compare = data.compare;
  if (!compare) return null;
  const t = (value: BiText) => plain(ur ? value.ur : value.en);
  return (
    <div className="dl-stage">
      <p className="dl-lane-title" style={{ color: "#8ff3ea", marginBottom: "0.7rem" }}>{t(compare.title)}</p>
      <div className="cl-table">
        <div className="cl-row cl-h">{compare.headers.map((header, n) => <p key={n}>{t(header)}</p>)}</div>
        {compare.rows.map((row, n) => (
          <div key={n} className="cl-row" style={{ ["--n" as string]: n + 1 }}>{row.map((cell, m) => <p key={m}>{t(cell)}</p>)}</div>
        ))}
      </div>
    </div>
  );
}

function Quiz({ data, ur }: { data: LabData; ur: boolean }) {
  const [picked, setPicked] = useState<Record<number, number>>({});
  const [shown, setShown] = useState<Record<number, boolean>>({});
  const t = (value: BiText) => plain(ur ? value.ur : value.en);
  return (
    <div className="dl-stage">
      {data.checks.slice(0, 4).map((check, q) => (
        <div key={q} className="cl-q">
          <p>{q + 1}. {t(check.question)}</p>
          {check.options.map((option, o) => {
            const chosen = picked[q] === o;
            return (
              <button key={o} type="button" className="cl-opt" data-r={chosen ? (option.correct ? "ok" : "no") : picked[q] !== undefined && option.correct ? "ok" : "x"} onClick={() => setPicked((value) => ({ ...value, [q]: o }))}>
                {t(option.text)}
              </button>
            );
          })}
          {picked[q] !== undefined ? <p className="cl-fb">{t(check.options[picked[q]].feedback)}</p> : null}
        </div>
      ))}
      {data.reveals.slice(0, 3).map((item, r) => (
        <div key={`r${r}`} className="cl-q">
          <p>{ur ? "Pehle khud sochein: " : "Think first: "}{t(item.question)}</p>
          {shown[r] ? <p className="cl-fb">{t(item.answer)}</p> : <button type="button" className="cl-reveal" onClick={() => setShown((value) => ({ ...value, [r]: true }))}>{ur ? "Jawab dikhayein" : "Show the answer"}</button>}
        </div>
      ))}
    </div>
  );
}

/** Tabbed, animated demonstrations of a concept, built from the lesson's own beats, in English or Roman Urdu. */
export function ConceptLab({ slug }: { slug: string }) {
  const [lang] = useLang();
  const ur = lang === "ur";
  const [lesson, setLesson] = useState<TeacherLesson | null>(null);
  const [tab, setTab] = useState<LabTab | null>(null);

  useEffect(() => {
    let cancelled = false;
    fetch(`/teacher-data/lessons/${encodeURIComponent(slug)}.json`)
      .then((response) => (response.ok ? (response.json() as Promise<TeacherLesson>) : null))
      .then((data) => { if (!cancelled && data && Array.isArray(data.beats)) setLesson(data); })
      .catch(() => undefined);
    return () => { cancelled = true; };
  }, [slug]);

  const data = useMemo(() => (lesson ? labData(lesson) : null), [lesson]);
  const tabs = useMemo(() => (data ? labTabs(data) : []), [data]);
  if (!data || tabs.length < 2) return null;
  const active = tab && tabs.includes(tab) ? tab : tabs[0];
  const info = TAB_INFO[active];
  const t = (value: BiText) => plain(ur ? value.ur : value.en);

  const panel =
    active === "how" ? <Chain items={data.how.slice(0, 6).map(t)} label={ur ? "Kari" : "Link"} /> :
    active === "picture" ? <Picture data={data} ur={ur} /> :
    active === "clinic" ? <CaseFlow data={data} ur={ur} /> :
    active === "steps" ? <Ladder items={(ur && data.stepsUr.length >= 2 ? data.stepsUr : data.steps.map((step) => `${step.title}: ${step.detail}`)).slice(0, 8).map(plain)} ur={ur} /> :
    active === "safety" ? <Gate screen={(data.safety.length ? data.safety : data.mistakes).slice(0, 6).map(t)} pitfalls={data.safety.length ? data.mistakes.slice(0, 4).map(t) : []} ur={ur} prefix={false} /> :
    active === "compare" ? <Compare data={data} ur={ur} /> :
    <Quiz data={data} ur={ur} />;

  return (
    <section className="dl mx-auto max-w-3xl" aria-label={ur ? "Concept Lab" : "Concept Lab"} data-pna-concept-lab="v1">
      <div className="cl-head">
        <p className="cl-kicker">{ur ? "Concept Lab · tasveer aur animation se samjhein" : "Concept Lab · see it, don't just read it"}</p>
        <h2 className="cl-title">{ur ? `${tabs.length} demonstrations, ek hi concept` : `${tabs.length} demonstrations of one concept`}</h2>
      </div>
      <div className="dl-tabs mt-3" role="tablist" aria-label="Demonstrations">
        {tabs.map((id, n) => {
          const item = TAB_INFO[id];
          return (
            <button key={id} type="button" role="tab" aria-selected={active === id} onClick={() => setTab(id)} className="dl-tab">
              <item.icon className="h-4 w-4" aria-hidden="true" />
              <span className="dl-tab-n">{n + 1}</span>
              <span>{ur ? item.ur : item.en}</span>
            </button>
          );
        })}
      </div>
      <p className="dl-hint">{ur ? info.urHint : info.enHint}</p>
      <div key={`${active}-${lang}`} role="tabpanel" className="dl-panel">{panel}</div>
    </section>
  );
}
