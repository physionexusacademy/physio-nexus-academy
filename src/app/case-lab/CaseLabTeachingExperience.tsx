"use client";
import {useEffect,useMemo,useRef,useState} from "react";
import Link from "next/link";
import {
 ArrowLeft,ArrowRight,BookOpen,BrainCircuit,ChevronDown,
 Eye,EyeOff,BookmarkCheck,Lightbulb,RotateCcw,ShieldAlert,Sparkles,Stethoscope,
 Target,User
} from "lucide-react";
import type {CaseStory} from "@/lib/case-lab-story";
import {buildCaseLearningGuide} from "@/lib/case-lab-learning";
import {buildClinicalEpisodes} from "@/lib/case-lab-narrative";
import {patientAnswer} from "@/lib/clinical-arena-patient-dialogue";
import {RomanUrduHelp} from "./RomanUrduHelp";

const chapters=[
 {name:"Meet the patient",label:"THE STORY"},
 {name:"Take the history",label:"THE INTERVIEW"},
 {name:"Examine & understand",label:"THE ASSESSMENT"},
 {name:"Think through the diagnosis",label:"THE REASONING"},
 {name:"Treat or refer",label:"THE CLINICAL PLAN"},
 {name:"Dosage & reassessment",label:"THE FOLLOW-UP"},
 {name:"Key lessons",label:"THE TAKEAWAYS"}
];
const prompts=[
 "The patient gives you a story, not a textbook chapter title.",
 "A better question can change the whole treatment plan.",
 "Your test should answer a clinical question—not just look impressive.",
 "Two diagnoses may sound alike. Which finding separates them?",
 "Treatment is a plan for this person, not a shopping list of techniques.",
 "Did it help? The reassessment has the final vote.",
 "You came for a clinical case. Your brain came for the plot twist."
];

function LessonBullets({items}:{items:string[]}){
 return <ol className="mt-4 space-y-2.5">
  {items.map((item,i)=><li key={i} className="flex items-start gap-3">
   <span className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-teal-100 text-[11px] font-bold text-teal-800">{String(i+1).padStart(2,"0")}</span>
   <p className="text-[.92rem] leading-7 text-slate-700">{item}</p>
  </li>)}
 </ol>;
}
function LearningCard({label,title,items}:{label:string;title:string;items:string[]}){
 return <section className="mt-6 rounded-2xl border border-slate-100 bg-white p-5 sm:p-6">
  <p className="text-[11px] font-bold uppercase tracking-widest text-teal-700">{label}</p>
  <h3 className="mt-2 font-serif text-xl font-bold text-[#102e40]">{title}</h3>
  <LessonBullets items={items}/>
 </section>;
}

export function CaseLabTeachingExperience({story}:{story:CaseStory}){
 const lesson=useMemo(()=>buildCaseLearningGuide(story),[story]);
 const episodes=useMemo(()=>buildClinicalEpisodes(story,lesson),[story,lesson]);
 const [chapter,setChapter]=useState(0);
 const [asked,setAsked]=useState<number[]>([]);
 const [showThinking,setShowThinking]=useState(false);
 const [focusMode,setFocusMode]=useState(false);
 const [maxRead,setMaxRead]=useState(0);
 const [encounter,setEncounter]=useState(0);
 const chapterRef=useRef<HTMLElement|null>(null);

 useEffect(()=>{
  try{
   const saved=Number(sessionStorage.getItem("pna-lab-read-v2-"+story.id));
   if(Number.isInteger(saved)&&saved>=0&&saved<chapters.length){setChapter(saved);setMaxRead(saved);}
  }catch{}
 },[story.id]);
 useEffect(()=>{
  try{sessionStorage.setItem("pna-lab-read-v2-"+story.id,String(chapter));}catch{}
  setMaxRead(n=>Math.max(n,chapter));
 },[story.id,chapter]);
 const first=useRef(true);
 useEffect(()=>{
  try{
   const key="pna-case-lab-lesson-visit-"+story.id;
   const n=(Number(sessionStorage.getItem(key))||0)+1;
   sessionStorage.setItem(key,String(n));setEncounter(n);
  }catch{}
 },[story.id]);
 useEffect(()=>{
  if(first.current){first.current=false;return}
  const f=requestAnimationFrame(()=>{
   if(!chapterRef.current)return;
   chapterRef.current.focus({preventScroll:true});
   chapterRef.current.scrollIntoView({
    behavior:window.matchMedia("(prefers-reduced-motion: reduce)").matches?"auto":"smooth",
    block:"start"
   });
  });
  return()=>cancelAnimationFrame(f);
 },[chapter]);

 const clinicalGroup=story.category==="MSK & Sports"||story.category==="Vestibular Rehabilitation";
 const canBePlayful=!story.urgent&&clinicalGroup&&!["Oncology Rehabilitation","Critical Care & ICU"].includes(story.category);
 const patientLabel=story.category==="Pediatric Rehabilitation"?"Patient / caregiver":"Patient";

 function reply(answer:string,index:number){
  return patientAnswer({
   caseId:story.id,questionKey:"lesson-"+index,clinicalAnswer:answer,
   encounter,urgent:story.urgent,
   allowHumor:canBePlayful&&index>0&&!story.fullyAuthored
  });
 }
 function next(){
  setShowThinking(false);
  setChapter(i=>Math.min(chapters.length-1,i+1));
 }
 function jump(to:number){
  setShowThinking(false);setChapter(to);
 }

 const scene=episodes[chapter];
 const safeNote=story.urgent
  ?"Safety first: recognize the danger signs and arrange appropriate urgent medical assessment before routine physiotherapy."
  :story.category==="Oncology Rehabilitation"||story.category==="Critical Care & ICU"
   ?"Clinical safety and dignity take priority. Use the person's medical status and goals to guide every step."
   :prompts[chapter];

 return <article className="case-lab-v3 min-h-screen pb-20" data-pna-case-lab-lesson="clinical-novel-v3-immersive">
  <div className="container-content pt-5 sm:pt-8">
   <Link href="/case-lab" className="cl-breadcrumb"><ArrowLeft className="h-4 w-4"/> Back to specialties and patient files</Link>

   {/* Compact header */}
   <div className="mt-4 flex flex-wrap items-center gap-2">
    <span className="cl-kicker">{story.category}</span>
    {story.urgent&&<span className="cl-kicker"><ShieldAlert className="h-3.5 w-3.5"/> Urgent safety</span>}
    <span className="cl-kicker">{lesson.isFullyAuthored?"Authored masterclass":"Clinical lesson"}</span>
   </div>

   <div className={"mt-5 grid gap-5 "+(focusMode?"cl-reading-focus lg:grid-cols-1":"lg:grid-cols-[220px_minmax(0,1fr)]")}>
    {/* Chapter nav */}
    <aside className={"self-start lg:sticky lg:top-24 "+(focusMode?"hidden":"")} aria-label="Case Lab learning chapters">
     <div className="rounded-2xl border border-slate-100 bg-white p-3 shadow-sm">
      <p className="px-2 pt-1 text-[11px] font-bold uppercase tracking-widest text-teal-700">Chapters</p>
      <div className="mt-3 flex gap-1.5 overflow-x-auto pb-1 lg:flex-col lg:overflow-visible">
       {chapters.map((item,i)=><button key={item.name} type="button"
        aria-current={chapter===i?"step":undefined} onClick={()=>jump(i)}
        className={"flex shrink-0 items-center gap-2 rounded-xl px-2.5 py-2.5 text-left text-xs font-semibold transition sm:text-sm lg:w-full "+(chapter===i?"bg-teal-700 text-white":"text-slate-600 hover:bg-teal-50 hover:text-teal-800")}>
        <span className={"flex h-6 w-6 shrink-0 items-center justify-center rounded-lg text-[11px] "+(chapter===i?"bg-white/20":"bg-slate-100")}>{i+1}</span>
        <span className="leading-tight">{item.name}</span>
       </button>)}
      </div>
      <p className="mt-3 border-t border-slate-100 px-2 pt-3 text-[11px] leading-5 text-slate-500">{Math.round((maxRead+1)/chapters.length*100)}% explored · Simulation only</p>
     </div>
    </aside>

    <section ref={chapterRef} tabIndex={-1} className="min-w-0 scroll-mt-24 outline-none">
     {/* Sticky Patient Chart */}
     <div className="sticky top-16 z-10 mb-4 rounded-2xl border border-teal-100 bg-gradient-to-r from-[#f0faf8] to-white p-4 shadow-sm sm:p-5">
      <div className="flex items-start gap-3">
       <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-teal-100 text-teal-800">
        <User className="h-5 w-5"/>
       </div>
       <div className="min-w-0 flex-1">
        <p className="text-[11px] font-bold uppercase tracking-widest text-teal-700">Patient</p>
        <p className="mt-0.5 font-semibold text-slate-900">{story.patient}</p>
        <p className="mt-1 text-sm leading-6 text-slate-600 line-clamp-2">“{story.opening}”</p>
        {story.openingUrdu && <div className="mt-2"><RomanUrduHelp text={story.openingUrdu}/></div>}
       </div>
      </div>
     </div>

     <div className="rounded-2xl border border-slate-100 bg-white p-5 shadow-sm sm:p-7">
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 pb-4">
       <div>
        <p className="text-[11px] font-bold uppercase tracking-widest text-teal-700">{chapters[chapter].label}</p>
        <p className="mt-1 text-sm font-medium text-slate-500">Chapter {chapter+1} of {chapters.length}</p>
       </div>
       <button type="button" onClick={()=>setFocusMode(v=>!v)} aria-pressed={focusMode}
        className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-bold text-teal-800 hover:bg-teal-50">
        {focusMode?<><Eye className="h-4 w-4"/> Show menu</>:<><EyeOff className="h-4 w-4"/> Focus</>}
       </button>
      </div>

      {/* Progress dots */}
      <div className="mt-4 flex gap-1.5" aria-label={`Chapter ${chapter+1} of ${chapters.length}`}>
       {chapters.map((_,i)=><div key={i} className={`h-1.5 flex-1 rounded-full ${i<=chapter?"bg-teal-600":"bg-slate-100"}`}/>)}
      </div>

      <p className="mt-6 text-[11px] font-bold uppercase tracking-[0.18em] text-teal-700">{scene.act}</p>
      <h2 className="mt-2 font-serif text-2xl font-bold leading-tight text-[#102e40] sm:text-3xl">{scene.sceneTitle}</h2>

      {/* Soft clinical note instead of heavy box */}
      <p className={`mt-4 text-sm leading-7 ${story.urgent?"text-amber-900":"text-slate-600"}`}>
       {story.urgent?<ShieldAlert className="mr-1.5 inline h-4 w-4"/>:<Sparkles className="mr-1.5 inline h-4 w-4 text-teal-600"/>}
       {safeNote}
      </p>

      {/* Clean narrative - no heavy bordered scene box */}
      <div className="mt-6 space-y-4 font-serif text-[1.05rem] leading-[1.85] text-slate-800 sm:text-[1.1rem]">
       {scene.narrative.map((paragraph,i)=><p key={i}>{paragraph}</p>)}
      </div>
      <p className="mt-5 border-t border-slate-100 pt-4 text-sm italic leading-7 text-teal-800">{scene.moment}</p>

      {/* Decision / Critical thinking - cleaner */}
      <div className="mt-7 rounded-2xl bg-[#f4fbfa] p-5">
       <div className="flex items-start gap-3">
        <Lightbulb className="mt-0.5 h-5 w-5 shrink-0 text-teal-700"/>
        <div className="min-w-0 flex-1">
         <p className="text-[11px] font-bold uppercase tracking-widest text-teal-700">Think clinically</p>
         <p className="mt-2 font-serif text-lg font-bold leading-7 text-slate-900">{scene.question}</p>
         <p className="mt-1.5 text-sm leading-6 text-slate-600">{scene.tension}</p>
        </div>
       </div>
       <details key={chapter} className="mt-4">
        <summary className="flex cursor-pointer items-center justify-between gap-3 rounded-xl border border-teal-100 bg-white px-4 py-3 text-sm font-semibold text-teal-800">
         Reveal clinical insight <ChevronDown className="h-4 w-4"/>
        </summary>
        <p className="mt-3 px-1 text-sm leading-7 text-slate-700">{scene.insight}</p>
       </details>
      </div>

      {/* Chapter-specific content */}
      {chapter===0&&<div className="mt-6 space-y-4">
       <details className="rounded-xl border border-slate-200 p-4">
        <summary className="flex cursor-pointer items-center justify-between gap-2 text-sm font-semibold text-teal-800">
         Documented case facts <ChevronDown className="h-4 w-4"/>
        </summary>
        <div className="mt-3 space-y-2.5">{lesson.chapters.context.filter(x=>x!==story.opening).map((line,i)=><p key={i} className="text-sm leading-7 text-slate-700">{line}</p>)}</div>
       </details>
       <p className="text-sm text-slate-600"><strong>Next:</strong> The interview begins — the clinical picture becomes clearer.</p>
      </div>}

      {chapter===1&&<div className="mt-6 space-y-4">
       <p className="text-sm leading-7 text-slate-700">Open each question to hear the patient’s response. Notice how the clinical picture develops.</p>
       <div className="space-y-2.5">{lesson.patientDialogue.map(({question,answer},i)=>(
        <div key={i} className="rounded-xl border border-slate-150 bg-white">
         <button type="button" aria-expanded={asked.includes(i)}
          onClick={()=>setAsked(before=>before.includes(i)?before.filter(x=>x!==i):[...before,i])}
          className="flex w-full items-start justify-between gap-3 px-4 py-3.5 text-left text-sm font-semibold leading-6 text-slate-800">
          <span className="flex gap-2.5"><span className="text-teal-600">{i+1}.</span>{question}</span>
          <ChevronDown className={`mt-0.5 h-4 w-4 shrink-0 text-teal-600 transition ${asked.includes(i)?"rotate-180":""}`}/>
         </button>
         {asked.includes(i)&&<div className="border-t border-slate-100 px-4 pb-4 pt-3 text-sm leading-7 text-slate-700">
          {story.fullyAuthored?
           <><strong className="text-slate-900">Case history:</strong> {answer}</>:
           <><strong className="text-slate-900">{patientLabel}:</strong> “{reply(answer,i)}”</>}
         </div>}
        </div>
       ))}</div>
       <LearningCard label="SUBJECTIVE ASSESSMENT" title="How to interpret the story" items={lesson.chapters.subjective}/>
      </div>}

      {chapter===2&&<div className="mt-6 space-y-4">
       <p className="rounded-xl bg-slate-50 px-4 py-3 text-sm leading-7 text-slate-700"><strong>Clinical question:</strong> {story.examPrompt}</p>
       <LearningCard label="OBJECTIVE ASSESSMENT" title="What to examine — and why" items={lesson.chapters.examination}/>
       <button onClick={()=>setShowThinking(v=>!v)} type="button" aria-expanded={showThinking}
        className="cl-button cl-button-secondary">
        <Lightbulb className="h-4 w-4"/> {showThinking?"Hide explanation":"Why prioritize this examination?"}
       </button>
       {showThinking&&<div className="rounded-xl border border-teal-100 bg-teal-50/60 p-4 text-sm leading-7 text-slate-700"><strong>Teaching note:</strong> {lesson.practiceAnswer}</div>}
       {story.category==="MSK & Sports"&&<Link href="/msk-special-tests" className="inline-flex items-center gap-2 text-sm font-semibold text-teal-800 hover:underline">Study MSK Special Tests <ArrowRight className="h-4 w-4"/></Link>}
      </div>}

      {chapter===3&&<div className="mt-6 space-y-4">
       <p className="rounded-xl bg-slate-50 px-4 py-3 text-sm leading-7 text-slate-700"><strong>Working explanation:</strong> {lesson.condition}</p>
       <p className="text-sm leading-7 text-slate-600">A working diagnosis is not a final label. Compare timing, findings, alternatives and safety risks.</p>
       <LearningCard label="THE REASONING" title="Compare each clinical possibility" items={lesson.chapters.differential}/>
      </div>}

      {chapter===4&&<div className="mt-6 space-y-4">
       <LearningCard label={story.urgent?"SAFETY & REFERRAL":"CLINICAL MANAGEMENT"} title={story.urgent?"Why urgent evaluation comes first":"Build an individualized treatment plan"} items={lesson.chapters.management}/>
       {story.urgent&&<p className="rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm leading-7 text-amber-950">These warning signs are not a cue to try exercises and see what happens. Follow the appropriate urgent medical pathway.</p>}
      </div>}

      {chapter===5&&<div className="mt-6 space-y-4">
       <LearningCard label="HOW MUCH & HOW OFTEN" title={story.urgent?"When exercise must wait":"Choose dosage and progression intelligently"} items={lesson.chapters.dosage}/>
       <LearningCard label="REASSESSMENT" title="What tells you the plan is working?" items={lesson.chapters.followUp}/>
      </div>}

      {chapter===6&&<div className="mt-6 space-y-4">
       <LearningCard label="CLINICAL PITFALLS" title="Mistakes that can change the outcome" items={lesson.chapters.pitfalls}/>
       <LearningCard label="TAKE-HOME LEARNING" title="Your clinical reasoning checklist" items={lesson.chapters.takeaways}/>
       {story.references.length>0&&<section className="rounded-2xl border border-slate-100 p-5">
        <p className="text-[11px] font-bold uppercase tracking-widest text-teal-700">Read further</p>
        <h3 className="mt-2 font-serif text-xl font-bold">Sources and guidelines</h3>
        <div className="mt-3 space-y-2">{story.references.map(r=><a key={r.url} target="_blank" rel="noopener noreferrer" href={r.url} className="block text-sm font-semibold leading-7 text-teal-800 hover:underline">{r.title} · {r.organization}</a>)}</div>
       </section>}
       <div className="rounded-2xl border border-teal-200 bg-teal-50 p-5">
        <p className="text-[11px] font-bold uppercase tracking-widest text-teal-800">From reading to challenge</p>
        <h3 className="mt-2 font-serif text-xl font-bold text-slate-900">Now test what you’ve learned.</h3>
        <p className="mt-1.5 text-sm leading-7 text-slate-700">Case Lab teaches the reasoning. Clinical Arena challenges you to decide without the answers first.</p>
        <Link href="/clinical-arena" className="cl-button mt-4">Open Clinical Challenge Arena <ArrowRight className="h-4 w-4"/></Link>
       </div>
      </div>}

      {/* Navigation */}
      <div className="mt-8 flex flex-wrap items-center justify-between gap-3 border-t border-slate-100 pt-5">
       <button type="button" disabled={chapter===0} onClick={()=>jump(Math.max(0,chapter-1))}
        className="cl-button cl-button-secondary disabled:cursor-not-allowed disabled:opacity-40">
        <ArrowLeft className="h-4 w-4"/> Previous
       </button>
       {chapter<chapters.length-1?
        <button type="button" onClick={next} className="cl-button">Continue <ArrowRight className="h-4 w-4"/></button>:
        <button type="button" onClick={()=>{setAsked([]);jump(0)}} className="cl-button"><RotateCcw className="h-4 w-4"/> Review from start</button>}
      </div>
     </div>
    </section>
   </div>

   <p className="mt-6 text-center text-xs leading-6 text-slate-500">
    Educational simulation — not a real patient’s medical record or individual medical advice.
   </p>
  </div>
 </article>;
}
