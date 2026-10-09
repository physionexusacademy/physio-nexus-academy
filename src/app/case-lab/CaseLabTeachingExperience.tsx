"use client";
import {useEffect,useMemo,useRef,useState} from "react";
import Link from "next/link";
import {
 ArrowLeft,ArrowRight,BookOpen,BrainCircuit,CheckCircle2,ChevronDown,
 ClipboardList,HeartPulse,Eye,EyeOff,BookmarkCheck,Lightbulb,RotateCcw,ShieldAlert,Sparkles,Stethoscope,
 Target
} from "lucide-react";
import type {CaseStory} from "@/lib/case-lab-story";
import {buildCaseLearningGuide} from "@/lib/case-lab-learning";
import {buildClinicalEpisodes} from "@/lib/case-lab-narrative";
import {patientAnswer} from "@/lib/clinical-arena-patient-dialogue";

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
 return <ol className="mt-5 space-y-3">
  {items.map((item,i)=><li key={i} className="flex items-start gap-3 rounded-xl border border-slate-100 bg-[#f9fcfc] p-4">
   <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-teal-50 text-xs font-extrabold text-teal-800">{String(i+1).padStart(2,"0")}</span>
   <p className="pt-0.5 text-[.93rem] leading-7 text-slate-700">{item}</p>
  </li>)}
 </ol>;
}
function LearningCard({label,title,items}:{label:string;title:string;items:string[]}){
 return <section className="cl-paper p-5 sm:p-6">
  <p className="cl-eyebrow">{label}</p>
  <h3 className="mt-3 font-serif text-xl font-bold text-[#102e40] sm:text-2xl">{title}</h3>
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
 return <article className="case-lab-v3 min-h-screen pb-20" data-pna-case-lab-lesson="clinical-novel-v2">
  <div className="container-content pt-6 sm:pt-10">
   <Link href="/case-lab" className="cl-breadcrumb"><ArrowLeft className="h-4 w-4"/> Back to specialties and patient files</Link>
   <header className="cl-hero cl-novel-hero mt-5 p-6 sm:p-9">
    <div className="flex flex-wrap items-center gap-2">
     <span className="cl-kicker">{story.category}</span>
     <span className="cl-kicker">{lesson.isFullyAuthored?"Authored clinical masterclass":"Case-guided clinical lesson"}</span>
     {story.urgent&&<span className="cl-kicker"><ShieldAlert className="h-3.5 w-3.5"/> Urgent safety priority</span>}
    </div>
    <p className="cl-eyebrow mt-7"><BookOpen className="h-4 w-4"/> PNA CASE LAB / READ · UNDERSTAND · APPLY</p>
    <h1 className="cl-display mt-4 max-w-4xl">A real-world style patient story.<br/><span className="cl-gradient-word">Learn the clinical reasoning.</span></h1>
    <p className="mt-5 max-w-3xl text-sm leading-8 text-slate-600 sm:text-base">
     This is your clinical reading room, not an exam. Follow the patient from first complaint through
     assessment, differential reasoning, management, dosage and follow-up. Think along the way—no score or timer.
    </p>
    <div className="mt-6 flex flex-wrap gap-2">
     <span className="cl-kicker"><Stethoscope className="h-4 w-4"/> Realistic simulated patient</span>
     <span className="cl-kicker"><BrainCircuit className="h-4 w-4"/> {chapters.length} learning chapters</span>
     <span className="cl-kicker"><Target className="h-4 w-4"/> Clinical reasoning & practical steps</span>
    </div>
   </header>

   <div className={"mt-5 grid gap-5 "+(focusMode?"cl-reading-focus lg:grid-cols-1":"lg:grid-cols-[235px_minmax(0,1fr)]")}>
    <aside className={"cl-paper self-start p-4 lg:sticky lg:top-28 "+(focusMode?"hidden":"")} aria-label="Case Lab learning chapters">
     <p className="px-2 pt-2 text-xs font-bold uppercase tracking-widest text-teal-800">Reading chapters</p>
     <div className="mt-4 flex gap-2 overflow-x-auto pb-2 lg:flex-col lg:overflow-visible">
      {chapters.map((item,i)=><button key={item.name} type="button"
       aria-current={chapter===i?"step":undefined} onClick={()=>jump(i)}
       className={"flex shrink-0 items-center gap-2 rounded-xl px-3 py-3 text-left text-xs font-bold transition sm:text-sm lg:w-full "+(chapter===i?"bg-teal-700 text-white shadow-sm":"text-slate-600 hover:bg-teal-50 hover:text-teal-800")}>
       <span className={"flex h-7 w-7 shrink-0 items-center justify-center rounded-lg text-xs "+(chapter===i?"bg-white/20":"bg-slate-100")}>{i+1}</span>
       <span>{item.name}</span>
      </button>)}
     </div>
     <p className="mt-3 border-t border-slate-100 px-2 pt-4 text-xs leading-6 text-slate-500">You've explored {Math.round((maxRead+1)/chapters.length*100)}% of chapters. This is a simulation, not a real patient's medical record.</p>
    </aside>

    <section ref={chapterRef} tabIndex={-1} className="min-w-0 scroll-mt-28 outline-none">
     <div className="cl-paper cl-novel-page p-5 sm:p-7">
      <div className="cl-novel-readerbar flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 pb-4">
       <span className="cl-eyebrow"><BookmarkCheck className="h-4 w-4"/> CLINICAL STORYBOOK · {story.category}</span>
       <button type="button" onClick={()=>setFocusMode(v=>!v)} aria-pressed={focusMode}
        className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-bold text-teal-800 hover:bg-teal-50">
        {focusMode?<><Eye className="h-4 w-4"/> Show menu</>:<><EyeOff className="h-4 w-4"/> Focus reading</>}
       </button>
      </div>
      <div className="flex flex-wrap items-center justify-between gap-3">
       <p className="cl-eyebrow">{chapters[chapter].label}</p>
       <span className="rounded-full bg-teal-50 px-3 py-1.5 text-xs font-bold text-teal-800">Chapter {chapter+1} / {chapters.length}</span>
      </div>
      <div className="mt-4 flex gap-1.5" aria-label={"Reading chapter "+(chapter+1)+" of "+chapters.length}>
       {chapters.map((_,i)=><div key={i} className={"h-1.5 flex-1 rounded-full "+(i<=chapter?"bg-teal-700":"bg-slate-100")}/>)}
      </div>
      <p className="cl-novel-act mt-6">{scene.act}</p>
      <h2 className="mt-3 font-serif text-3xl font-bold leading-tight text-[#102e40] sm:text-[2.55rem]">{scene.sceneTitle}</h2>
      <p className="mt-2 text-sm font-semibold text-slate-500">{chapters[chapter].name}</p>
      <div className={"cl-nudge mt-5 "+(story.urgent?"border-amber-200 bg-amber-50 text-amber-950":"")}>
       {story.urgent?<ShieldAlert className="mr-2 inline h-4 w-4"/>:<Sparkles className="mr-2 inline h-4 w-4"/>}
       {safeNote}
      </div>
      <section className="cl-novel-scene mt-6" aria-label="Patient story scene">
       <div className="cl-novel-scene-head"><span className="cl-novel-mark">“</span><span>AN EPISODE FROM THE PATIENT FILE · EDUCATIONAL SIMULATION</span></div>
       <div className="cl-novel-prose mt-4">
        {scene.narrative.map((paragraph,i)=><p key={i}>{paragraph}</p>)}
       </div>
       <p className="cl-novel-beat mt-5">{scene.moment}</p>
      </section>
      <section className="cl-novel-decision mt-5" aria-label="Think about the clinical turning point">
       <div className="flex items-start gap-3">
        <Lightbulb className="mt-1 h-5 w-5 shrink-0 text-teal-800"/>
        <div className="min-w-0 flex-1">
         <p className="text-xs font-extrabold uppercase tracking-widest text-teal-800">PAUSE THE STORY</p>
         <p className="mt-2 font-serif text-xl font-bold leading-7 text-slate-900">{scene.question}</p>
         <p className="mt-2 text-sm leading-7 text-slate-600">{scene.tension}</p>
        </div>
       </div>
       <details key={chapter} className="cl-novel-insight mt-4 rounded-xl border border-teal-100 bg-white p-4">
        <summary className="flex cursor-pointer items-center justify-between gap-3 text-sm font-bold text-teal-800">Reveal the clinical insight <ChevronDown className="h-4 w-4"/></summary>
        <p className="mt-3 text-sm leading-7 text-slate-700">{scene.insight}</p>
       </details>
      </section>

      {chapter===0&&<div className="mt-6 space-y-5">
       <div className="rounded-2xl border border-teal-100 bg-[#f4fbfa] p-5">
        <p className="cl-story-label">MEET YOUR PATIENT</p>
        <p className="mt-2 text-sm font-bold text-slate-700">{story.patient}</p>
        {story.fullyAuthored?
         <p className="cl-story-quote mt-4 text-base"><strong>From the documented vignette:</strong> {story.opening}</p>:
         <blockquote className="cl-story-quote mt-4 text-base">“{story.opening}”</blockquote>}
       </div>
       <details className="cl-novel-facts rounded-xl border border-slate-200 p-4">
        <summary className="flex cursor-pointer items-center justify-between gap-2 text-sm font-bold text-teal-800">Read the documented case facts <ChevronDown className="h-4 w-4"/></summary>
        <div className="mt-4 space-y-3">{lesson.chapters.context.filter(x=>x!==story.opening).map((line,i)=><p key={i} className="text-sm leading-7 text-slate-700">{line}</p>)}</div>
       </details>
       <div className="cl-reveal"><strong>On the next page:</strong> The interview begins—and the clinical picture becomes clearer.</div>
      </div>}

      {chapter===1&&<div className="mt-6 space-y-5">
       <p className="text-sm leading-8 text-slate-700">Good history taking feels like a conversation, not a checklist. Open each question to hear the patient's response, and notice how the clinical picture develops.</p>
       <div className="space-y-3">{lesson.patientDialogue.map(({question,answer},i)=>(
        <div key={i} className="rounded-2xl border border-slate-200 bg-white p-4">
         <button type="button" aria-expanded={asked.includes(i)}
          onClick={()=>setAsked(before=>before.includes(i)?before.filter(x=>x!==i):[...before,i])}
          className="flex w-full items-start justify-between gap-3 text-left text-sm font-bold leading-7 text-slate-800">
          <span className="flex gap-3"><span className="text-teal-700">{i+1}.</span>{question}</span>
          <ChevronDown className={"mt-1 h-4 w-4 shrink-0 text-teal-700 transition "+(asked.includes(i)?"rotate-180":"")}/>
         </button>
         {asked.includes(i)&&<div className="cl-story-quote mt-3 text-sm">
          {story.fullyAuthored?
           <><strong>Case history:</strong> {answer}</>:
           <><strong>{patientLabel}:</strong> “{reply(answer,i)}”</>}
         </div>}
        </div>
       ))}</div>
       <LearningCard label="SUBJECTIVE ASSESSMENT" title="How to interpret the story" items={lesson.chapters.subjective}/>
      </div>}

      {chapter===2&&<div className="mt-6 space-y-5">
       <div className="cl-reveal"><strong>Clinical question:</strong> {story.examPrompt}</div>
       <LearningCard label="OBJECTIVE ASSESSMENT" title="What to examine—and why" items={lesson.chapters.examination}/>
       <button onClick={()=>setShowThinking(v=>!v)} type="button" aria-expanded={showThinking}
        className="cl-button cl-button-secondary">
        <Lightbulb className="h-4 w-4"/> {showThinking?"Hide clinical explanation":"Why prioritize this examination?"}
       </button>
       {showThinking&&<div className="cl-feedback"><strong>Teaching explanation:</strong> {lesson.practiceAnswer}</div>}
       {story.category==="MSK & Sports"&&<Link href="/msk-special-tests" className="inline-flex items-center gap-2 text-sm font-bold text-teal-800 hover:underline">Study hands, stabilization and force directions in MSK Special Tests <ArrowRight className="h-4 w-4"/></Link>}
      </div>}

      {chapter===3&&<div className="mt-6 space-y-5">
       <div className="cl-reveal"><strong>Most-supported working explanation:</strong> {lesson.condition}</div>
       <p className="text-sm leading-8 text-slate-700">A working diagnosis is not a final label based on one sign. Compare the timing, positive findings, alternative explanations and safety risks. The next findings may change your mind.</p>
       <LearningCard label="THE REASONING" title="Compare each clinical possibility" items={lesson.chapters.differential}/>
      </div>}

      {chapter===4&&<div className="mt-6 space-y-5">
       <LearningCard label={story.urgent?"SAFETY & REFERRAL":"CLINICAL MANAGEMENT"} title={story.urgent?"Why urgent evaluation comes first":"Build an individualized treatment plan"} items={lesson.chapters.management}/>
       {story.urgent&&<p className="rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm leading-7 text-amber-950">These warning signs are not a cue to try exercises and see what happens. Follow the appropriate urgent medical pathway.</p>}
      </div>}

      {chapter===5&&<div className="mt-6 space-y-5">
       <LearningCard label="HOW MUCH & HOW OFTEN" title={story.urgent?"When exercise must wait":"Choose dosage and progression intelligently"} items={lesson.chapters.dosage}/>
       <LearningCard label="REASSESSMENT" title="What tells you the plan is working?" items={lesson.chapters.followUp}/>
      </div>}

      {chapter===6&&<div className="mt-6 space-y-5">
       <LearningCard label="CLINICAL PITFALLS" title="Mistakes that can change the outcome" items={lesson.chapters.pitfalls}/>
       <LearningCard label="TAKE-HOME LEARNING" title="Your clinical reasoning checklist" items={lesson.chapters.takeaways}/>
       {story.references.length>0&&<section className="cl-paper p-5 sm:p-6"><p className="cl-eyebrow">READ FURTHER</p><h3 className="mt-3 font-serif text-xl font-bold">Sources and guidelines</h3><div className="mt-4 space-y-3">{story.references.map(r=><a key={r.url} target="_blank" rel="noopener noreferrer" href={r.url} className="block text-sm font-semibold leading-7 text-teal-800 hover:underline">{r.title} · {r.organization}</a>)}</div></section>}
       <div className="rounded-2xl border border-teal-200 bg-teal-50 p-5">
        <p className="text-xs font-bold uppercase tracking-widest text-teal-800">FROM READING TO CLINICAL CHALLENGE</p>
        <h3 className="mt-3 font-serif text-xl font-bold text-slate-900">Now test what you've learned.</h3>
        <p className="mt-2 text-sm leading-7 text-slate-700">Case Lab teaches the reasoning. Clinical Arena challenges you to make decisions without seeing the answers first.</p>
        <Link href="/clinical-arena" className="cl-button mt-4">Open Clinical Challenge Arena <ArrowRight className="h-4 w-4"/></Link>
       </div>
      </div>}

      <div className="cl-novel-next mt-8 flex flex-wrap items-center justify-between gap-3 border-t border-slate-100 pt-5">
       <button type="button" disabled={chapter===0} onClick={()=>jump(Math.max(0,chapter-1))}
        className="cl-button cl-button-secondary disabled:cursor-not-allowed disabled:opacity-40"><ArrowLeft className="h-4 w-4"/> Previous chapter</button>
       {chapter<chapters.length-1?<button type="button" onClick={next} className="cl-button">Continue reading <ArrowRight className="h-4 w-4"/></button>:
        <button type="button" onClick={()=>{setAsked([]);jump(0)}} className="cl-button"><RotateCcw className="h-4 w-4"/> Review from the beginning</button>}
      </div>
     </div>
    </section>
   </div>
   <p className="mt-6 text-center text-xs leading-6 text-slate-500">
    Educational simulation—not a real patient's medical record or individual medical advice.
    Scenario variants share clinical teaching blueprints. Decisions and exercise prescriptions require patient-specific assessment and professional supervision.
   </p>
  </div>
 </article>;
}
