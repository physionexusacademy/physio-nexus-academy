"use client";
import {useEffect,useRef,useState} from "react";
import Link from "next/link";
import {ArrowLeft,ArrowRight,BookOpen,BrainCircuit,Check,CheckCircle2,ChevronDown,ClipboardList,Clock3,LockKeyhole,RotateCcw,ShieldAlert,Sparkles,Stethoscope,Target} from "lucide-react";
import type {CaseStory} from "@/lib/case-lab-story";
import {patientAnswer} from "@/lib/clinical-arena-patient-dialogue";

const chapters=["The encounter","Take the history","Examine the clues","Your working hypothesis","Clinical debrief"];
const prompts=[
 "The diagnosis is not hiding under the first sentence. Nice try, detective.",
 "A good question can save you ten unnecessary tests.",
 "Your differential needs evidence, not a dramatic entrance.",
 "This is the moment your clinical reasoning gets to earn its coffee.",
 "The answer is useful. Understanding why is the real upgrade."
];
function pickPrompt(id:string,phase:number){let h=0;for(const c of id)h=(h*31+c.charCodeAt(0))>>>0;return prompts[(h+phase)%prompts.length];}
const goTo=(node:HTMLElement|null)=>{
 if(!node)return;
 node.focus({preventScroll:true});
 node.scrollIntoView({behavior:window.matchMedia("(prefers-reduced-motion: reduce)").matches?"auto":"smooth",block:"start"});
};
export function CaseLabExperience({story}: {story:CaseStory}){
 const [step,setStep]=useState(0);
 const [opened,setOpened]=useState<number[]>([]);
 const [exam,setExam]=useState<number|null>(null);
 const [diagnosis,setDiagnosis]=useState<number|null>(null);
 const [notes,setNotes]=useState<string[]>([]);
 const [encounter,setEncounter]=useState(0);
 useEffect(()=>{
  try{
   const key="pna-case-lab-encounters-v1-"+story.id;
   const next=(Number(localStorage.getItem(key))||0)+1;
   localStorage.setItem(key,String(next));
   setEncounter(next);
  }catch{}
 },[story.id]);
 const target=useRef<HTMLElement|null>(null);
 const initial=useRef(true);
 useEffect(()=>{if(initial.current){initial.current=false;return;}const timer=window.requestAnimationFrame(()=>goTo(target.current));return()=>window.cancelAnimationFrame(timer)},[step]);
 const advance=()=>setStep(n=>Math.min(4,n+1));
 const restart=()=>{setOpened([]);setExam(null);setDiagnosis(null);setNotes([]);setStep(0);};
 const reveal=step===4;
 const playfulCategory=(story.category==="MSK & Sports"||story.category==="Vestibular Rehabilitation");
 const safePatientHumor=!story.urgent&&!story.fullyAuthored&&playfulCategory;
 const patientLine=(text:string,key:string,canAddHumor=true)=>story.fullyAuthored?text:patientAnswer({
  caseId:story.id,questionKey:key,clinicalAnswer:text,encounter,
  urgent:story.urgent,allowHumor:safePatientHumor&&canAddHumor
 });
 const questions=story.history;
 const patientLabel=story.category==="Pediatric Rehabilitation"?"Patient / caregiver":"Patient";
 const correctExam=story.examCorrect>=0&&exam!==null&&exam===story.examCorrect;
 const correctDx=story.diagnosisCorrect>=0&&diagnosis!==null&&diagnosis===story.diagnosisCorrect;
 const seriousTrack=story.urgent||["Oncology Rehabilitation","Critical Care & ICU","Clinical Red Flags"].includes(story.category);
 const safeNudge=story.urgent?"Clinical safety note: when symptoms suggest a time-critical emergency, escalation takes priority over routine exercise or provocative testing.":seriousTrack?"Pause and think: which finding changes your next action, and how can you protect this patient's goals and safety?":pickPrompt(story.id,step);
 return <article className="case-lab-v3 min-h-screen pb-20">
  <div className="container-content pt-7 sm:pt-10">
   <Link href="/case-lab" className="cl-breadcrumb"><ArrowLeft className="h-4 w-4"/> Back to patient files</Link>
   <header className="cl-hero mt-5 overflow-hidden px-6 py-9 sm:px-10 sm:py-11">
    <div className="flex flex-wrap items-center gap-2.5"><span className="cl-kicker">{story.category}</span><span className="rounded-full border border-slate-200 bg-white px-3 py-1.5 text-xs font-bold text-slate-600">{story.fullyAuthored?"Expertly structured deep dive":"Context-based teaching encounter"}</span>{story.urgent?<span className="inline-flex items-center gap-1.5 rounded-full border border-rose-200 bg-rose-50 px-3 py-1.5 text-xs font-bold text-rose-800"><ShieldAlert className="h-4 w-4"/> Safety-sensitive presentation</span>:null}</div>
    <p className="cl-eyebrow mt-7"><BrainCircuit className="h-4 w-4"/> PATIENT FILE · {story.id.replace(/^deep-/,"").toUpperCase().slice(0,36)}</p>
    <h1 className="cl-display mt-4 max-w-4xl">A patient walks in.<br/><span className="cl-gradient-word">You make the next move.</span></h1>
    <p className="mt-5 max-w-3xl text-base leading-8 text-slate-600">Read the story, interview the patient, select an examination and make a working diagnosis. Your answers and the clinical explanation stay sealed until the debrief.</p>
    <div className="mt-6 flex flex-wrap items-center gap-4 text-xs font-semibold text-slate-500"><span className="flex items-center gap-1.5"><Clock3 className="h-4 w-4"/> 7–12 minute reading experience</span><span className="flex items-center gap-1.5"><LockKeyhole className="h-4 w-4"/> Spoiler-controlled reasoning</span><span className="flex items-center gap-1.5"><BookOpen className="h-4 w-4"/> Evidence-aware learning</span></div>
   </header>
   <section ref={target} tabIndex={-1} className="mt-6 scroll-mt-28 outline-none">
    <div className="cl-paper p-5 sm:p-7">
     <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
      <span className="cl-eyebrow"><span className="h-2 w-2 rounded-full bg-teal-700"/> CLINICAL STORYLINE</span>
      <span className="rounded-full bg-slate-100 px-3 py-1.5 text-xs font-bold text-slate-600">Chapter {step+1} of 5</span>
     </div>
     <div className="cl-timeline">{chapters.map((c,i)=><span key={c} className="cl-step" data-active={step===i} data-done={step>i}>{i+1}. {c}</span>)}</div>
     <div className="mt-7 border-t border-slate-100 pt-7">
      <p className="cl-eyebrow">{step<4?"PATIENT FILE · STILL OPEN":"YOUR CASE DEBRIEF"}</p>
      <h2 className="mt-3 font-heading text-3xl font-bold tracking-tight sm:text-[2.25rem]">{chapters[step]}</h2>
      <p className="cl-nudge mt-5">{story.urgent?<ShieldAlert className="mr-2 inline h-4 w-4 text-rose-700"/>:<Sparkles className="mr-2 inline h-4 w-4 text-teal-700"/>}{safeNudge}</p>
      {step===0?<div className="mt-7 space-y-5">
       <div className="rounded-2xl border border-slate-200 bg-slate-50 px-5 py-5"><p className="cl-story-label">MEET YOUR PATIENT</p><p className="mt-2 text-sm font-bold text-slate-700">{story.patient}</p><p className="cl-story-quote mt-5 text-[1.05rem]">“{patientLine(story.opening,"opening")}”</p></div>
       <div className="space-y-4">{story.scene.map((line,i)=><div key={i} className="flex items-start gap-4"><span className="mt-1 flex h-8 w-8 flex-none items-center justify-center rounded-full border border-teal-200 bg-teal-50 text-xs font-extrabold text-teal-700">{i+1}</span><p className="text-[.96rem] leading-8 text-slate-700">{line}</p></div>)}</div>
       <div className="cl-reveal"><strong>The opening question:</strong> What details would make you change your first impression? Watch for onset, function, safety and symptom behavior.</div>
       <button className="cl-button w-full sm:w-auto" onClick={advance}>Start the patient interview <ArrowRight className="h-4 w-4"/></button>
      </div>:null}
      {step===1?<div className="mt-7">
       <p className="max-w-3xl text-sm leading-7 text-slate-600">Ask the questions in any order. The patient answers gradually—just like a real consultation. Save useful details to your clinical notes before continuing.</p>
       <div className="mt-5 space-y-3">{questions.map(([q,a],i)=><div key={i} className="rounded-2xl border border-slate-200 bg-white p-4"><button onClick={()=>setOpened(v=>v.includes(i)?v:[...v,i])} className="flex w-full items-start justify-between gap-3 text-left text-sm font-semibold leading-7 text-slate-800" aria-expanded={opened.includes(i)}><span className="flex items-start gap-3"><span className="flex h-7 w-7 flex-none items-center justify-center rounded-lg bg-slate-100 text-xs font-extrabold text-teal-800">{i+1}</span>{q}</span><ChevronDown className={"mt-1 h-4 w-4 flex-none text-teal-700 transition "+(opened.includes(i)?"rotate-180":"")}/></button>
       {opened.includes(i)?<div className="mt-4 rounded-xl bg-teal-50/70 p-4"><p className="text-sm leading-7 text-slate-700"><strong>{patientLabel}:</strong> “{patientLine(a,"history-"+i,i>0)}”</p><button type="button" className="mt-3 text-xs font-bold text-teal-800" onClick={()=>setNotes(v=>v.includes(a)?v.filter(x=>x!==a):[...v,a])}>{notes.includes(a)?"✓ Remove from notes":"+ Save clue to case notes"}</button></div>:null}</div>)}</div>
       {notes.length>0?<details className="mt-5 rounded-xl border border-teal-200 bg-white p-4"><summary className="text-sm font-semibold text-teal-800">Your notebook ({notes.length} clues)</summary><ul className="mt-3 list-disc space-y-2 pl-5 text-sm leading-6 text-slate-700">{notes.map(n=><li key={n}>{n}</li>)}</ul></details>:null}
       <button className="cl-button mt-6 w-full sm:w-auto disabled:cursor-not-allowed disabled:opacity-45" disabled={opened.length===0} onClick={advance}>Proceed to clinical examination <ArrowRight className="h-4 w-4"/></button>
      </div>:null}
      {step===2?<div className="mt-7">
       <p className="text-sm leading-7 text-slate-600">You have gathered some history. The next step is not to collect every possible test; it is to select the examination that most usefully addresses the uncertainty.</p>
       <div className="mt-5 rounded-xl border border-slate-200 bg-slate-50 p-5"><h3 className="font-bold text-slate-800">Available objective findings</h3><ul className="mt-3 space-y-2">{story.findings.map((f,i)=><li key={i} className="flex items-start gap-2 text-sm leading-7 text-slate-700"><Check className="mt-1 h-4 w-4 flex-none text-teal-700"/>{f}</li>)}</ul></div>
       <h3 className="mt-7 text-lg font-bold">{story.examPrompt}</h3>
       <div className="mt-4 space-y-3">{story.examChoices.map((v,i)=><button key={i} type="button" data-selected={exam===i} className="cl-option" aria-pressed={exam===i} onClick={()=>setExam(i)}><span className="mr-3 font-bold text-teal-800">{String.fromCharCode(65+i)}.</span>{v}</button>)}</div>
       <p className="mt-3 text-xs text-slate-500">Your examination selection is recorded. Reasoning remains hidden until the final chapter.</p>
       <button disabled={exam===null} className="cl-button mt-6 w-full sm:w-auto disabled:cursor-not-allowed disabled:opacity-45" onClick={advance}>Record examination & continue <ArrowRight className="h-4 w-4"/></button>
      </div>:null}
      {step===3?<div className="mt-7">
       <div className="cl-story-quote"><strong>Clinician's pause:</strong> You have history, findings and your examination priority. Is your leading hypothesis supported, or are you just fond of it?</div>
       <h3 className="mt-7 text-lg font-bold">{story.diagnosisPrompt}</h3>
       <div className="mt-4 space-y-3">{story.diagnosisChoices.map((v,i)=><button key={i} type="button" data-selected={diagnosis===i} aria-pressed={diagnosis===i} className="cl-option" onClick={()=>setDiagnosis(i)}><span className="mr-3 font-bold text-teal-800">{String.fromCharCode(65+i)}.</span>{v}</button>)}</div>
       <p className="mt-4 text-xs leading-6 text-slate-500">The answer and your earlier decisions unlock after submission. For complex deep dives, more than one preliminary differential may deserve consideration.</p>
       <button disabled={diagnosis===null} className="cl-button mt-6 w-full sm:w-auto disabled:cursor-not-allowed disabled:opacity-45" onClick={advance}>Submit working diagnosis & unlock debrief <LockKeyhole className="h-4 w-4"/></button>
      </div>:null}
      {reveal?<div className="mt-7 space-y-6">
       <div className="cl-feedback"><p className="mb-2 text-xs font-extrabold uppercase tracking-[.12em]">The clinical decision review</p>
        {story.examCorrect<0?<p className="text-sm leading-7">Examination choice recorded. This is a guided reflection rather than a scored question; compare your selection with the full assessment sequence below.</p>:<p className="text-sm leading-7"><strong>Examination:</strong> {correctExam?"Your choice matches the prioritized examination.":"Revisit your assessment priority."} Best-supported direction: {story.examChoices[story.examCorrect]}</p>}
        {story.diagnosisCorrect<0?<p className="mt-3 text-sm leading-7">Your differential is recorded; compare it against the case discussion without treating a complex scenario as a one-answer guessing game.</p>:<p className="mt-3 text-sm leading-7"><strong>Working diagnosis:</strong> {correctDx?"Your hypothesis fits the case's teaching pattern.":"Compare your answer with the explanation below."} Best-supported option: {story.diagnosisChoices[story.diagnosisCorrect]}</p>}
       </div>
       <section className="cl-paper p-5 sm:p-6"><p className="cl-eyebrow">01 / WHY IT MATTERS</p><h3 className="mt-3 text-xl font-bold">The reasoning behind the decision</h3><p className="mt-4 text-sm leading-8 text-slate-700">{story.examReason}</p><p className="mt-3 text-sm leading-8 text-slate-700">{story.diagnosisReason}</p></section>
       <section className="cl-paper p-5 sm:p-6"><p className="cl-eyebrow">02 / OTHER POSSIBILITIES</p><h3 className="mt-3 text-xl font-bold">Differential diagnosis: compare, don't guess</h3><div className="mt-5 space-y-3">{story.differentials.map((d,i)=><div key={i} className="rounded-xl border border-slate-200 p-4"><h4 className="text-sm font-bold">{d.diagnosis}</h4><p className="mt-2 text-sm leading-7 text-slate-600">{d.reasoning}</p></div>)}</div></section>
       <section className="cl-paper p-5 sm:p-6"><p className="cl-eyebrow">03 / PLAN THE NEXT STEP</p><h3 className="mt-3 text-xl font-bold">{story.urgent?"Safety, referral and handover":"Evidence-aware rehabilitation planning"}</h3><ul className="mt-4 space-y-3">{story.management.map((line,i)=><li key={i} className="flex gap-3 text-sm leading-8 text-slate-700"><CheckCircle2 className="mt-1 h-4 w-4 flex-none text-teal-700"/><span>{line}</span></li>)}</ul></section>
       {story.progression.length?<section className="cl-paper p-5 sm:p-6"><p className="cl-eyebrow">04 / FOLLOW-UP</p><h3 className="mt-3 text-xl font-bold">What changes your plan?</h3><ul className="mt-4 space-y-3">{story.progression.map((p,i)=><li key={i} className="text-sm leading-8 text-slate-700">{p}</li>)}</ul></section>:null}
       {story.guide?<section className="cl-paper p-5 sm:p-6"><p className="cl-eyebrow">DEEP DIVE / PRACTICAL MASTERCLASS</p><h3 className="mt-3 text-2xl font-bold">From assessment to reassessment</h3><p className="mt-3 text-sm leading-7 text-slate-600">A fuller, authored clinical guide. Read how to ask, examine, reason, plan, dose and reassess instead of remembering a single answer.</p><div className="mt-5 grid gap-4 lg:grid-cols-2">{([
       ["Key subjective questions",story.guide.keyQuestions],["Examination sequence",story.guide.examinationSequence],
       ["Decision logic",story.guide.decisionLogic],["Practical management",story.guide.practicalManagement],
       ["Treatment dose",story.guide.exerciseDose],["Reassessment",story.guide.reassessment],
       ["Common mistakes",story.guide.commonMistakes],["Master-level takeaways",story.guide.masterTakeaway]
       ] as [string,string[]][]).map(([title,lines])=><div key={title} className="rounded-2xl border border-slate-200 bg-slate-50/70 p-5"><h4 className="font-bold text-slate-800">{title}</h4><ul className="mt-3 space-y-2">{lines.map((l,i)=><li key={i} className="text-sm leading-7 text-slate-700">{l}</li>)}</ul></div>)}</div></section>:null}
       <section className="cl-paper p-5 sm:p-6"><p className="cl-eyebrow">05 / TAKE THIS WITH YOU</p><h3 className="mt-3 text-xl font-bold">Clinical lessons to remember</h3><ul className="mt-4 space-y-3">{story.learning.map((point,i)=><li key={i} className="cl-reveal text-sm">{point}</li>)}</ul></section>
       {story.references.length?<section className="cl-paper p-5 sm:p-6"><p className="cl-eyebrow">EVIDENCE DESK</p><h3 className="mt-3 text-xl font-bold">Sources and clinical guidance</h3><div className="mt-4 space-y-3">{story.references.map(r=><a key={r.url} target="_blank" rel="noopener noreferrer" href={r.url} className="block rounded-xl border border-slate-200 p-3 text-sm font-semibold text-teal-800 hover:bg-teal-50">{r.title}<span className="mt-1 block text-xs font-normal text-slate-600">{r.organization}{r.year?" · "+r.year:""}</span></a>)}</div></section>:null}
       <div className="flex flex-wrap gap-3"><button type="button" onClick={restart} className="cl-button"><RotateCcw className="h-4 w-4"/> Rethink this case</button><Link href="/case-lab" className="cl-button cl-button-secondary">Choose a different patient <ArrowRight className="h-4 w-4"/></Link></div>
      </div>:null}
     </div>
    </div>
   </section>
   <p className="mt-5 text-center text-xs leading-6 text-slate-500">Educational simulation only. Context variants are not independently validated patient records. Serious or progressive symptoms require appropriate medical evaluation; a learning score is not proof of clinical competence.</p>
  </div>
 </article>;
}
