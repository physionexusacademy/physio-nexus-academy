"use client";

import {useEffect,useMemo,useRef,useState} from "react";
import Link from "next/link";
import {useRouter} from "next/navigation";
import {
  Accessibility, Activity, ArrowRight, ArrowUpRight, Baby, BookOpen,
  BrainCircuit, Check, ChevronRight, Clock3, Compass, Ear, HeartPulse,
  Hospital, RotateCcw, Search, ShieldAlert, Sparkles, Stethoscope, User,
  type LucideIcon
} from "lucide-react";
import type {LabCaseCard} from "@/lib/case-lab-catalog";
import {RomanUrduHelp} from "./RomanUrduHelp";

type Props={cases:LabCaseCard[];categories:string[]};
type Level="All levels"|"Clinical"|"Advanced";
type Mode="All experiences"|"Case lessons"|"Deep dives";

const icons:Record<string,LucideIcon>={
 "MSK & Sports":Activity,
 "Neurological Rehabilitation":BrainCircuit,
 "Pediatric Rehabilitation":Baby,
 "Cardiopulmonary Rehabilitation":HeartPulse,
 "Geriatrics & Falls":Accessibility,
 "Vestibular Rehabilitation":Ear,
 "Pelvic Health":Stethoscope,
 "Oncology Rehabilitation":Sparkles,
 "Critical Care & ICU":Hospital,
 "Clinical Red Flags":ShieldAlert,
};
const descriptions:Record<string,string>={
 "MSK & Sports":"Joint, spinal and sport-related clinical reasoning.",
 "Neurological Rehabilitation":"Movement, function and neurological recovery.",
 "Pediatric Rehabilitation":"Developmental care and child-focused rehabilitation.",
 "Cardiopulmonary Rehabilitation":"Heart, lungs and safe activity tolerance.",
 "Geriatrics & Falls":"Mobility, independence and falls prevention.",
 "Vestibular Rehabilitation":"Dizziness, balance and gaze stability.",
 "Pelvic Health":"Pelvic-floor concerns and meaningful function.",
 "Oncology Rehabilitation":"Recovery and function during cancer care.",
 "Critical Care & ICU":"Bedside safety and staged mobilization.",
 "Clinical Red Flags":"Safety-critical stories across specialties, including emergencies requiring escalation.",
};

function isInClinicalCategory(caseFile:LabCaseCard, selected:string){
 if(selected==="All cases")return true;
 if(selected==="Clinical Red Flags")return caseFile.safety||caseFile.category==="Clinical Red Flags";
 return caseFile.category===selected;
}

function pickDefaultSpecialty(categories:string[], cases:LabCaseCard[]){
 const counts=categories.map(name=>{
  const count=cases.filter(c=>isInClinicalCategory(c,name)).length;
  return {name,count};
 }).filter(x=>x.count>0).sort((a,b)=>b.count-a.count);
 return counts[0]?.name ?? (categories[0] || null);
}

function PatientCard({patient,index}:{patient:LabCaseCard;index:number}){
 const hasIdentity=!!patient.patientName;
 return (
  <Link href={patient.href} className="cl-story cl-patient-file cl-storybook-card" aria-label={hasIdentity?`Open case: ${patient.patientName}`:`Open case: ${patient.hook}`}>
   <div className="flex flex-wrap items-center justify-between gap-2">
    <span className="cl-number">{hasIdentity?"YOUR PATIENT":"PATIENT STORY"} {String(index+1).padStart(3,"0")}</span>
    {patient.safety
      ?<span className="cl-category">SAFETY FIRST</span>
      :<span className="cl-category">{patient.kind==="Clinical deep dive"?"MASTERCLASS":"CLINICAL LESSON"}</span>}
   </div>
   {hasIdentity&&(
    <div className="mt-4 flex items-start gap-3">
     <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-teal-100 text-teal-800">
      <User className="h-5 w-5" aria-hidden="true"/>
     </div>
     <div className="min-w-0">
      <p className="font-serif text-lg font-bold leading-snug text-slate-900">{patient.patientName}</p>
      {patient.lifeLine&&(
       <p className="mt-0.5 text-xs font-medium leading-5 text-teal-800">{patient.lifeLine}</p>
      )}
     </div>
    </div>
   )}
   <div className={hasIdentity?"mt-4":"mt-6"}>
    <p className="cl-story-label">{patient.focus} · {patient.difficulty} · 7 CHAPTERS</p>
    <h4 className="cl-case-title mt-3 line-clamp-3">{patient.hook}</h4>
    {patient.voiceUrdu&&(
     <RomanUrduHelp text={patient.voiceUrdu} compact />
    )}
    {!hasIdentity&&(
     <p className="mt-3 line-clamp-2 text-sm leading-6 text-slate-500">{patient.patient}</p>
    )}
   </div>
   <div className="mt-auto flex items-center justify-between gap-3 border-t border-slate-100 pt-5">
    <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500"><Clock3 className="h-4 w-4"/>{patient.minutes}</span>
    <span className="inline-flex items-center gap-1.5 text-xs font-bold text-teal-800">
     {hasIdentity?"Meet the patient":"Read the story"} <ArrowRight className="h-4 w-4"/>
    </span>
   </div>
  </Link>
 );
}

export function CaseLabLibrary({cases,categories}:Props){
 const router=useRouter();
 const defaultSpecialty=useMemo(()=>pickDefaultSpecialty(categories,cases),[categories,cases]);
 const [category,setCategory]=useState<string|null>(null);
 const [hydrated,setHydrated]=useState(false);
 const [query,setQuery]=useState("");
 const [focus,setFocus]=useState("All focuses");
 const [level,setLevel]=useState<Level>("All levels");
 const [mode,setMode]=useState<Mode>("All experiences");
 const [limit,setLimit]=useState(12);
 const resultRef=useRef<HTMLElement|null>(null);

 useEffect(()=>{
  let next:string|null=null;
  try{
   const saved=window.sessionStorage.getItem("pna-case-lab-specialty-v4");
   if(saved&&(saved==="All cases"||categories.includes(saved)))next=saved;
  }catch{}
  if(!next)next=defaultSpecialty;
  setCategory(next);
  setHydrated(true);
 },[categories,defaultSpecialty]);

 const totals=useMemo(()=>new Map<string,number>(categories.map(name=>[
  name,cases.filter(c=>isInClinicalCategory(c,name)).length
 ])),[categories,cases]);

 const focusOptions=useMemo(()=>{
  if(!category)return [] as {name:string;count:number}[];
  const inCategory=cases.filter(c=>isInClinicalCategory(c,category));
  const counts=new Map<string,number>();
  for(const item of inCategory)counts.set(item.focus,(counts.get(item.focus)||0)+1);
  return [...counts.entries()].sort((a,b)=>a[0].localeCompare(b[0]))
   .map(([name,count])=>({name,count}));
 },[cases,category]);

 const matches=useMemo(()=>{
  if(!category)return [];
  const needle=query.trim().toLocaleLowerCase();
  return cases.filter(c=>{
   if(!isInClinicalCategory(c,category))return false;
   if(focus!=="All focuses"&&c.focus!==focus)return false;
   if(level!=="All levels"&&c.difficulty!==level)return false;
   if(mode==="Case lessons"&&c.kind!=="Interactive scenario")return false;
   if(mode==="Deep dives"&&c.kind!=="Clinical deep dive")return false;
   return !needle||[c.patient,c.patientName,c.lifeLine,c.hook,c.voiceUrdu,c.category,c.kind,c.keywords,c.focus]
    .filter(Boolean).join(" ").toLocaleLowerCase().includes(needle);
  });
 },[cases,category,query,focus,level,mode]);

 const orderedMatches=useMemo(()=>{
  if(query||focus!=="All focuses"||level!=="All levels"||mode!=="All experiences")return matches;
  const withName=matches.filter(c=>c.patientName);
  const without=matches.filter(c=>!c.patientName);
  return [...withName,...without];
 },[matches,query,focus,level,mode]);

 const visible=orderedMatches.slice(0,limit);
 const deepDives=cases.filter(c=>c.kind==="Clinical deep dive").length;
 const selectedTotal=category==="All cases"?cases.length:totals.get(category||"")||0;
 const realCount=cases.filter(c=>c.patientName).length;

 const starterCases=useMemo(()=>{
  const named=cases.filter(c=>c.patientName);
  const deep=named.filter(c=>c.kind==="Clinical deep dive").slice(0,3);
  const clinical=named.filter(c=>c.kind==="Interactive scenario"&&!c.safety).slice(0,4);
  const safety=named.filter(c=>c.safety).slice(0,2);
  const seen=new Set<string>();
  const out:LabCaseCard[]=[];
  for(const c of [...deep,...clinical,...safety]){
   if(seen.has(c.id))continue;
   seen.add(c.id);
   out.push(c);
   if(out.length>=8)break;
  }
  return out;
 },[cases]);

 function chooseSpecialty(next:string){
  setCategory(next);
  try{window.sessionStorage.setItem("pna-case-lab-specialty-v4",next)}catch{}
  setQuery("");
  setFocus("All focuses");
  setLevel("All levels");
  setMode("All experiences");
  setLimit(12);
  window.requestAnimationFrame(()=>{
   if(!window.matchMedia("(max-width: 1023px)").matches)return;
   const node=resultRef.current;
   if(!node)return;
   node.focus({preventScroll:true});
   node.scrollIntoView({
    behavior:window.matchMedia("(prefers-reduced-motion: reduce)").matches?"auto":"smooth",
    block:"start"
   });
  });
 }
 function clearFilters(){
  setQuery("");setFocus("All focuses");setLevel("All levels");
  setMode("All experiences");setLimit(12);
 }
 function surprise(){
  const pool=orderedMatches.length?orderedMatches:cases;
  if(pool.length)router.push(pool[Math.floor(Math.random()*pool.length)].href);
 }

 const showResults=hydrated && category;

 return (
  <div className="case-lab-v3 min-h-screen pb-20" data-pna-case-lab="real-patients-v1">
   <div className="container-content pt-7 sm:pt-10">
    <header className="cl-hero cl-novel-hero p-6 sm:p-9">
     <div className="relative">
      <div className="flex flex-wrap items-center gap-2">
       <span className="cl-eyebrow"><BrainCircuit className="h-4 w-4"/> PHYSIO NEXUS ACADEMY</span>
       <span className="cl-kicker">THE CLINICAL STORY COLLECTION</span>
      </div>
      <h1 className="cl-display mt-5 max-w-4xl">Every patient has a story.<br/><span className="cl-gradient-word">Meet them by name.</span></h1>
      <p className="mt-5 max-w-3xl text-[15px] leading-8 text-slate-600 sm:text-base">
       Open a real-style clinic encounter — a named patient, their life context, history, examination and safe plan.
       Practice the reasoning you will use with the next person who walks into your clinic.
      </p>
      <div className="mt-6 flex flex-wrap items-center gap-2.5 text-xs font-bold">
       <span className="cl-kicker"><User className="h-3.5 w-3.5"/> {realCount} named patients (Phase 1)</span>
       <span className="cl-kicker"><BookOpen className="h-3.5 w-3.5"/> {cases.length} total encounters</span>
       <span className="cl-kicker"><Stethoscope className="h-3.5 w-3.5"/> {categories.filter(c=>(totals.get(c)||0)>0).length} specialties</span>
       <span className="cl-kicker"><BrainCircuit className="h-3.5 w-3.5"/> {deepDives} masterclasses</span>
      </div>
      <div className="mt-7 flex flex-wrap gap-2">
       <a href="#case-lab-explorer" className="cl-button">Meet your patients <ArrowRight className="h-4 w-4"/></a>
       <button type="button" className="cl-button cl-button-secondary" onClick={surprise}>
        Surprise patient <Sparkles className="h-4 w-4"/>
       </button>
       <Link href="/clinical-arena" className="cl-button cl-button-secondary">
        Clinical Arena <ArrowUpRight className="h-4 w-4"/>
       </Link>
      </div>
     </div>
    </header>

    <div className="mt-5 grid gap-3 sm:grid-cols-3">
     {[
      {icon:User,label:"01 / Meet",text:"Open a named patient with a real life context — not a generic textbook label."},
      {icon:BrainCircuit,label:"02 / Reason",text:"History, examination, differential and a safe plan — the way you think in clinic."},
      {icon:Check,label:"03 / Apply",text:"Take the same skills into Clinical Arena when you are ready for an independent challenge."},
     ].map(({icon:Icon,label,text})=>(
      <div key={label} className="cl-ministat p-4 sm:p-5">
       <Icon className="h-5 w-5 text-teal-700"/>
       <h2 className="mt-3 text-sm font-bold text-slate-900">{label}</h2>
       <p className="mt-1 text-sm leading-6 text-slate-600">{text}</p>
      </div>
     ))}
    </div>

    <div className="mt-8 lg:hidden" aria-label="Quick specialty picker">
     <p className="cl-eyebrow"><Compass className="h-4 w-4"/> JUMP TO A SPECIALTY</p>
     <div className="mt-3 flex gap-2 overflow-x-auto pb-2 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
      <button type="button" onClick={()=>chooseSpecialty("All cases")} aria-pressed={category==="All cases"} data-active={category==="All cases"}
       className="cl-specialty-choice shrink-0 rounded-full border border-teal-200 bg-teal-50 px-4 py-2 text-xs font-bold text-teal-800 data-[active=true]:border-teal-700 data-[active=true]:bg-teal-700 data-[active=true]:text-white">
       All ({cases.length})
      </button>
      {categories.filter(c=>(totals.get(c)||0)>0).map(name=>{
       const active=category===name;
       return (
        <button type="button" key={`chip-${name}`} onClick={()=>chooseSpecialty(name)} aria-pressed={active} data-active={active}
         className="cl-specialty-choice shrink-0 rounded-full border border-slate-200 bg-white px-4 py-2 text-xs font-semibold text-slate-700 data-[active=true]:border-teal-700 data-[active=true]:bg-teal-700 data-[active=true]:text-white">
         {name.split(" &")[0].split(" ")[0]} ({totals.get(name)})
        </button>
       );
      })}
     </div>
    </div>

    <section id="case-lab-explorer" className="mt-10 scroll-mt-28" aria-labelledby="case-lab-specialties">
     <div className="mb-5 flex flex-wrap items-end justify-between gap-4">
      <div>
       <p className="cl-eyebrow"><Compass className="h-4 w-4"/> CLINIC WAITING ROOM</p>
       <h2 id="case-lab-specialties" className="mt-2 font-serif text-2xl font-bold text-slate-900 sm:text-3xl">Who is next?</h2>
       <p className="mt-2 text-sm leading-7 text-slate-600">
        Choose a specialty, then open a named patient. Phase 1 identities lead the list so every session starts with a real person.
       </p>
      </div>
      <span className="cl-kicker">{realCount} named · {cases.length} total</span>
     </div>

     <div className="grid items-start gap-6 lg:grid-cols-[260px_minmax(0,1fr)]">
      <aside className="cl-specialty-panel hidden rounded-3xl border border-slate-200 bg-white p-4 shadow-[0_12px_45px_-36px_rgba(10,47,62,0.4)] lg:sticky lg:top-28 lg:block" aria-label="Filter patient files by specialty">
       <div className="flex items-center justify-between px-2 pt-2">
        <p className="text-xs font-bold uppercase tracking-[.14em] text-teal-800">Clinical specialties</p>
        <span className="text-xs font-bold text-slate-400">{categories.length}</span>
       </div>
       <div className="cl-specialty-options mt-3 flex flex-col gap-1">
        {categories.filter(c=>(totals.get(c)||0)>0).map(name=>{
         const Icon=icons[name]||Stethoscope;
         const active=category===name;
         return (
          <button type="button" key={name} onClick={()=>chooseSpecialty(name)} aria-pressed={active} data-active={active}
           className="cl-specialty-choice group flex min-w-0 flex-row items-center gap-2 rounded-xl border border-transparent px-3 py-3 text-left transition hover:border-teal-300 hover:bg-teal-50">
           <Icon className="h-5 w-5 shrink-0 text-teal-700 group-data-[active=true]:text-white" aria-hidden="true"/>
           <span className="min-w-0 flex-1 text-sm font-semibold leading-5">{name}</span>
           <span className="cl-specialty-count rounded-md bg-slate-100 px-1.5 py-1 text-xs font-bold tabular-nums">{totals.get(name)}</span>
          </button>
         );
        })}
       </div>
       <button type="button" onClick={()=>chooseSpecialty("All cases")} aria-pressed={category==="All cases"} data-active={category==="All cases"}
        className="cl-all-specialties mt-4 flex w-full items-center justify-between rounded-xl border border-teal-200 bg-teal-50 px-3 py-3 text-left text-sm font-bold text-teal-800">
        <span>Browse all patient files</span><span className="rounded-md bg-white px-2 py-1 text-xs tabular-nums">{cases.length}</span>
       </button>
      </aside>

      <section ref={resultRef} tabIndex={-1} id="case-lab-results" className="min-w-0 scroll-mt-28 outline-none" aria-label="Cases for selected specialty" aria-live="polite">
       {!showResults?(
        <div className="cl-paper flex min-h-[280px] flex-col items-center justify-center px-6 py-10 text-center">
         <Stethoscope className="h-8 w-8 animate-pulse text-teal-700"/>
         <p className="mt-4 text-sm font-semibold text-slate-600">Loading patient files…</p>
        </div>
       ):(
        <>
         <div className="cl-paper p-4 sm:p-6">
          <div className="flex flex-wrap items-start justify-between gap-4">
           <div className="min-w-0 flex-1">
            <p className="cl-eyebrow">NOW EXPLORING</p>
            <h3 className="mt-2 font-serif text-2xl font-bold text-slate-900 sm:text-3xl">
             {category==="All cases"?"All patient files":category}
            </h3>
            <p className="mt-2 text-sm leading-7 text-slate-600">
             {descriptions[category||""]||"Browse patient stories from every clinical specialty."}
            </p>
           </div>
           <span className="cl-kicker shrink-0">{selectedTotal} cases</span>
          </div>
          <div className="mt-5 border-t border-slate-100 pt-5">
           <label htmlFor="pna-case-search" className="mb-2 block text-xs font-bold uppercase tracking-[.11em] text-slate-600">
            Search by name, city, symptom or condition
           </label>
           <div className="relative">
            <Search className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-teal-700"/>
            <input id="pna-case-search" type="search" value={query}
             onChange={e=>{setQuery(e.target.value);setLimit(12)}}
             placeholder="e.g. Ayesha, Karachi, shoulder, postpartum…"
             className="cl-search pl-12"/>
           </div>
           <div className="mt-4 grid gap-3 sm:grid-cols-3">
            <label className="text-xs font-bold text-slate-600">Body region / focus
             <select className="cl-select mt-2" value={focus} onChange={e=>{setFocus(e.target.value);setLimit(12)}}>
              <option value="All focuses">All focuses</option>
              {focusOptions.map(item=><option key={item.name} value={item.name}>{item.name} ({item.count})</option>)}
             </select>
            </label>
            <label className="text-xs font-bold text-slate-600">Clinical level
             <select className="cl-select mt-2" value={level} onChange={e=>{setLevel(e.target.value as Level);setLimit(12)}}>
              <option>All levels</option><option>Clinical</option><option>Advanced</option>
             </select>
            </label>
            <label className="text-xs font-bold text-slate-600">Learning format
             <select className="cl-select mt-2" value={mode} onChange={e=>{setMode(e.target.value as Mode);setLimit(12)}}>
              <option>All experiences</option><option>Case lessons</option><option>Deep dives</option>
             </select>
            </label>
           </div>
           <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
            <p className="text-sm text-slate-600"><strong className="text-teal-800">{orderedMatches.length}</strong> matching patient {orderedMatches.length===1?"file":"files"}</p>
            {(query||focus!=="All focuses"||level!=="All levels"||mode!=="All experiences")&&(
             <button type="button" onClick={clearFilters} className="inline-flex items-center gap-1.5 text-xs font-bold text-teal-800 hover:underline">
              <RotateCcw className="h-4 w-4"/> Clear filters
             </button>
            )}
           </div>
          </div>
         </div>

         {!query && focus==="All focuses" && level==="All levels" && mode==="All experiences" && starterCases.length>0 && (
          <div className="mt-4 rounded-2xl border border-teal-100 bg-gradient-to-br from-teal-50/80 to-white p-4 sm:p-5">
           <p className="text-xs font-bold uppercase tracking-[.12em] text-teal-800">Today’s clinic — start here</p>
           <p className="mt-1 text-sm text-slate-600">Named patients with unique life context. Open one and treat them as your next appointment.</p>
           <div className="mt-3 flex gap-3 overflow-x-auto pb-1 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
            {starterCases.map(p=>(
             <Link key={`starter-${p.id}`} href={p.href}
              className="min-w-[260px] max-w-[280px] shrink-0 rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
              <span className="cl-category text-[10px]">{p.safety?"SAFETY FIRST":p.kind==="Clinical deep dive"?"MASTERCLASS":"LESSON"}</span>
              <p className="mt-2 font-serif text-base font-bold text-slate-900">{p.patientName}</p>
              <p className="mt-0.5 text-[11px] font-medium text-teal-800">{p.lifeLine}</p>
              <p className="mt-2 line-clamp-2 text-xs leading-5 text-slate-700">{p.hook}</p>
              {p.voiceUrdu&& <RomanUrduHelp text={p.voiceUrdu} compact />}
              <span className="mt-3 inline-flex items-center gap-1 text-xs font-bold text-teal-800">Meet patient <ArrowRight className="h-3.5 w-3.5"/></span>
             </Link>
            ))}
           </div>
          </div>
         )}

         {visible.length?(
          <div className="mt-4 grid gap-4 md:grid-cols-2">
           {visible.map((patient,i)=>(
            <PatientCard key={patient.id} patient={patient} index={i}/>
           ))}
          </div>
         ):(
          <div className="cl-paper mt-4 px-6 py-12 text-center">
           <Search className="mx-auto h-8 w-8 text-teal-700"/>
           <h3 className="mt-4 font-serif text-xl font-bold text-slate-900">No matching patients</h3>
           <p className="mt-2 text-sm text-slate-600">Try another name, city, focus or search phrase.</p>
           <button type="button" className="cl-button mt-5" onClick={clearFilters}>Clear filters</button>
          </div>
         )}

         {visible.length<orderedMatches.length&&(
          <div className="mt-6 text-center">
           <button type="button" onClick={()=>setLimit(n=>n+12)} className="cl-button cl-button-secondary">
            Load 12 more patients <ChevronRight className="h-4 w-4"/>
           </button>
           <p className="mt-2 text-xs text-slate-500">Showing {visible.length} of {orderedMatches.length}</p>
          </div>
         )}
        </>
       )}
      </section>
     </div>
    </section>

    <footer className="mt-10 flex items-start gap-3 rounded-2xl border border-slate-200 bg-white p-5 text-sm leading-7 text-slate-600">
     <ShieldAlert className="mt-1 h-5 w-5 shrink-0 text-teal-700"/>
     Educational simulations with realistic South Asian names. Complaints are in clear English; tap <strong>Roman Urdu</strong> on a card when you want the patient-style meaning. Escalate urgent warning signs rather than continuing routine treatment.
    </footer>
   </div>
  </div>
 );
}
