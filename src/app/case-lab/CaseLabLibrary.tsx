"use client";

import {useMemo,useState} from "react";
import Link from "next/link";
import {ArrowRight,BookOpen,Clock3,Search,ShieldAlert,Stethoscope} from "lucide-react";
import type {LabCaseCard} from "@/lib/case-lab-catalog";
import {RomanUrduHelp} from "./RomanUrduHelp";

type Props={cases:LabCaseCard[];categories:string[]};

const descriptions:Record<string,string>={
 "MSK & Sports":"Spine, joint, tendon and sports-related presentations.",
 "Neurological Rehabilitation":"Neurological assessment, function and rehabilitation decisions.",
 "Pediatric Rehabilitation":"Child development, movement and family-centred care.",
 "Cardiopulmonary Rehabilitation":"Exercise response, breathing symptoms and medical safety.",
 "Geriatrics & Falls":"Mobility, falls, frailty and independence.",
 "Vestibular Rehabilitation":"Dizziness, balance and vestibular presentations.",
 "Pelvic Health":"Pelvic-floor symptoms and function-focused rehabilitation.",
 "Oncology Rehabilitation":"Function, treatment-related effects and coordinated care.",
 "Critical Care & ICU":"Physiological stability and safe rehabilitation readiness.",
 "Clinical Red Flags":"Warning signs that may require urgent medical assessment."
};

function inCategory(item:LabCaseCard,category:string){
 if(category==="All cases")return true;
 if(category==="Clinical Red Flags")return item.safety||item.category==="Clinical Red Flags";
 return item.category===category;
}

function CaseRow({item,index}:{item:LabCaseCard;index:number}){
 const title=item.title||item.hook||item.patient;
 return <Link href={item.href} className="cl-case-row group" aria-label={"Open case: "+title}>
  <div className="cl-case-row-number">{String(index+1).padStart(2,"0")}</div>
  <div className="min-w-0 flex-1">
   <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
    <span className="cl-case-row-category">{item.category}</span>
    {item.safety&&<span className="cl-case-row-alert"><ShieldAlert className="h-3.5 w-3.5"/> Safety-critical</span>}
   </div>
   <h3 className="cl-case-row-title mt-1.5">{title}</h3>
   <p className="mt-1 text-sm leading-6 text-slate-600">{item.patientName?item.patientName+" · ":""}{item.patient}</p>
   {item.voiceUrdu&&<div className="mt-1"><RomanUrduHelp text={item.voiceUrdu} compact/></div>}
   <div className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-slate-500">
    <span>{item.focus}</span><span aria-hidden="true">·</span><span>{item.difficulty}</span>
    <span aria-hidden="true">·</span><span className="inline-flex items-center gap-1"><Clock3 className="h-3.5 w-3.5"/>{item.minutes}</span>
   </div>
  </div>
  <ArrowRight className="cl-case-row-arrow h-5 w-5 shrink-0" aria-hidden="true"/>
 </Link>;
}

export function CaseLabLibrary({cases,categories}:Props){
 const [category,setCategory]=useState("All cases");
 const [query,setQuery]=useState("");
 const categoryCounts=useMemo(()=>new Map(categories.map(name=>[
  name,cases.filter(item=>inCategory(item,name)).length
 ])),[cases,categories]);
 const visibleCategories=categories.filter(name=>(categoryCounts.get(name)||0)>0);
 const filtered=useMemo(()=>{
  const needle=query.trim().toLocaleLowerCase();
  return cases.filter(item=>{
   if(!inCategory(item,category))return false;
   if(!needle)return true;
   return [item.title,item.hook,item.patient,item.patientName,item.lifeLine,item.voice,item.voiceUrdu,
    item.category,item.focus,item.keywords,item.difficulty]
    .filter(Boolean).join(" ").toLocaleLowerCase().includes(needle);
  });
 },[cases,category,query]);

 return <main className="case-lab-v3 min-h-screen pb-16" data-pna-case-lab="curated-clinical-files-v2">
  <div className="container-content pt-6 sm:pt-10">
   <header className="cl-library-heading">
    <p className="cl-eyebrow"><Stethoscope className="h-4 w-4"/> PHYSIO NEXUS ACADEMY · CLINICAL LEARNING</p>
    <h1 className="mt-3 font-serif text-3xl font-bold tracking-tight text-slate-950 sm:text-4xl">Clinical Case Library</h1>
    <p className="mt-3 max-w-2xl text-sm leading-7 text-slate-600 sm:text-base">
     Follow each simulated patient from the first conversation through history, examination, clinical reasoning and the final management decision.
    </p>
    <div className="mt-4 flex flex-wrap items-center gap-x-4 gap-y-2 text-sm text-slate-500">
     <span className="inline-flex items-center gap-1.5"><BookOpen className="h-4 w-4 text-teal-700"/><strong className="text-slate-800">{cases.length}</strong> curated cases</span>
     <span>{visibleCategories.length} clinical categories</span>
     <span>Complete case narratives · No scoring or timer</span>
    </div>
   </header>

   <section className="mt-7" aria-label="Find a clinical case">
    <label htmlFor="case-library-search" className="sr-only">Search cases by condition, symptom or patient story</label>
    <div className="cl-library-search-wrap">
     <Search className="h-5 w-5 text-teal-700" aria-hidden="true"/>
     <input id="case-library-search" type="search" value={query} onChange={event=>setQuery(event.target.value)}
      placeholder="Search a condition, symptom or patient story…" className="cl-library-search"/>
     {query&&<button type="button" onClick={()=>setQuery("")} className="cl-library-clear">Clear</button>}
    </div>
    <div className="mt-4 flex flex-wrap gap-2" aria-label="Filter by clinical category">
     <button type="button" onClick={()=>setCategory("All cases")} aria-pressed={category==="All cases"}
      className="cl-library-filter" data-active={category==="All cases"}>All cases <span>{cases.length}</span></button>
     {visibleCategories.map(name=><button key={name} type="button" onClick={()=>setCategory(name)}
      aria-pressed={category===name} className="cl-library-filter" data-active={category===name}>
      {name}<span>{categoryCounts.get(name)||0}</span>
     </button>)}
    </div>
   </section>

   <section className="mt-7" aria-labelledby="case-list-heading">
    <div className="mb-3 flex flex-wrap items-end justify-between gap-2">
     <div>
      <h2 id="case-list-heading" className="text-lg font-bold text-slate-900">{category==="All cases"?"All clinical cases":category}</h2>
      {category!=="All cases"&&<p className="mt-1 text-sm text-slate-500">{descriptions[category]||"Explore complete clinical case narratives."}</p>}
     </div>
     <p className="text-sm text-slate-500" aria-live="polite">{filtered.length} {filtered.length===1?"case":"cases"}</p>
    </div>
    {filtered.length>0?<div className="cl-case-list">
     {filtered.map((item,index)=><CaseRow key={item.id} item={item} index={index}/>)}
    </div>:<div className="py-12 text-center">
     <Search className="mx-auto h-7 w-7 text-slate-400"/>
     <h3 className="mt-3 font-semibold text-slate-800">No cases found</h3>
     <p className="mt-1 text-sm text-slate-500">Try a different symptom or select another category.</p>
     <button type="button" onClick={()=>{setQuery("");setCategory("All cases")}} className="mt-3 text-sm font-semibold text-teal-800 underline underline-offset-4">Reset search</button>
    </div>}
   </section>

   <footer className="mt-8 border-t border-slate-200 pt-4 text-xs leading-6 text-slate-500">
    <p><strong className="text-slate-700">Educational use:</strong> these are simulated teaching cases, not real patient records or a substitute for clinical supervision. Follow local referral pathways and current clinical guidance.</p>
   </footer>
  </div>
 </main>;
}
