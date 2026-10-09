"use client";
import {useMemo,useState} from "react";
import Link from "next/link";
import {ArrowRight,ArrowUpRight,BookOpen,BrainCircuit,Check,ChevronRight,Clock3,Compass,Search,ShieldAlert,Sparkles,Stethoscope} from "lucide-react";
import type {LabCaseCard} from "@/lib/case-lab-catalog";

type Props={cases:LabCaseCard[]; categories:string[]};
const intros=[
 "The patient's first sentence rarely tells the whole story.",
 "A good examination can save ten unnecessary questions.",
 "Your first diagnosis is a hypothesis, not a trophy.",
 "The next clue might change the whole treatment plan."
];
export function CaseLabLibrary({cases,categories}:Props){
 const [category,setCategory]=useState("All cases");
 const [search,setSearch]=useState("");
 const [type,setType]=useState("All experiences");
 const [limit,setLimit]=useState(18);
 const totals=useMemo(()=>new Map(categories.map(c=>[c,cases.filter(x=>x.category===c).length])),[categories,cases]);
 const filtered=useMemo(()=>cases.filter(c=>{
  if(category!=="All cases"&&c.category!==category)return false;
  if(type==="Deep dives"&&c.kind!=="Clinical deep dive")return false;
  if(type==="Story challenges"&&c.kind!=="Interactive scenario")return false;
  const needle=search.toLocaleLowerCase().trim();
  return !needle||[c.patient,c.hook,c.category,c.kind].join(" ").toLocaleLowerCase().includes(needle);
 }),[cases,category,search,type]);
 const shown=filtered.slice(0,limit);
 const setCategorySafe=(c:string)=>{setCategory(c);setLimit(18);};
 return <div className="case-lab-v3 min-h-screen pb-20">
  <div className="container-content pt-7 sm:pt-12">
   <header className="cl-hero px-6 py-8 sm:px-10 sm:py-12 lg:px-12">
    <div className="grid items-center gap-8 lg:grid-cols-[1.2fr_.8fr]">
     <div>
      <div className="cl-eyebrow"><BrainCircuit className="h-4 w-4"/> PHYSIO NEXUS ACADEMY <span className="cl-kicker">CASE LAB / 03</span></div>
      <h1 className="cl-display mt-5 max-w-3xl">Every patient<br/>has a <span className="cl-gradient-word">story.</span><br/>Can you solve it?</h1>
      <p className="mt-5 max-w-2xl text-[.97rem] leading-8 text-slate-600 sm:text-lg">Step inside a clinical encounter, collect the clues, challenge your first instinct and reveal the reasoning. Learn like a clinician. Stay curious like a detective.</p>
      <div className="mt-7 flex flex-wrap gap-3">
       <a href="#case-lab-library" className="cl-button">Explore patient files <ArrowRight className="h-4 w-4"/></a>
       <Link href="/clinical-arena" className="cl-button cl-button-secondary">Practice in Clinical Arena <ArrowUpRight className="h-4 w-4"/></Link>
      </div>
      <p className="mt-6 flex items-center gap-2 text-xs font-semibold text-slate-500"><Check className="h-4 w-4 text-teal-700"/> Evidence-informed simulations · Not real patient records</p>
     </div>
     <aside className="cl-overview p-6 sm:p-7">
      <div className="mb-5 flex items-center justify-between"><span className="text-xs font-bold uppercase tracking-[.16em] text-teal-100">Today's caseboard</span><Compass className="h-5 w-5 text-teal-200"/></div>
      <div className="space-y-4">
       {["Listen to the story","Spot the pattern","Make your decision","Unlock the debrief"].map((step,i)=><div key={step} className="flex items-center gap-4 rounded-xl border border-white/15 bg-white/5 p-3"><span className="flex h-10 w-10 flex-none items-center justify-center rounded-xl border border-white/20 text-sm font-extrabold text-white">{String(i+1).padStart(2,"0")}</span><div className="min-w-0"><p className="text-sm font-semibold text-white">{step}</p><p className="mt-1 text-xs">{intros[i]}</p></div></div>)}
      </div>
      <p className="mt-6 border-t border-white/15 pt-4 text-xs leading-6 text-teal-100">No more endless pages with the answer staring at you before you even think.</p>
     </aside>
    </div>
   </header>
   <div className="mt-5 grid gap-3 sm:grid-cols-3">
    <div className="cl-ministat flex items-center gap-4 p-5"><div className="rounded-xl bg-teal-50 p-3 text-teal-800"><BookOpen className="h-5 w-5"/></div><div><p className="text-2xl font-extrabold">{cases.length}</p><p className="text-xs font-semibold text-slate-500">Patient encounters</p></div></div>
    <div className="cl-ministat flex items-center gap-4 p-5"><div className="rounded-xl bg-slate-100 p-3 text-slate-700"><Stethoscope className="h-5 w-5"/></div><div><p className="text-2xl font-extrabold">{categories.filter(c=>totals.get(c)).length}</p><p className="text-xs font-semibold text-slate-500">Clinical categories</p></div></div>
    <div className="cl-ministat flex items-center gap-4 p-5"><div className="rounded-xl bg-teal-50 p-3 text-teal-800"><Sparkles className="h-5 w-5"/></div><div><p className="text-lg font-extrabold">Think → Reveal</p><p className="text-xs font-semibold text-slate-500">Interactive learning pathway</p></div></div>
   </div>
   <section id="case-lab-library" className="mt-12 scroll-mt-24">
    <div className="flex flex-wrap items-end justify-between gap-4"><div><p className="cl-eyebrow"><span className="h-2 w-2 rounded-full bg-teal-600"/> THE CLINICAL FILES</p><h2 className="mt-3 font-heading text-3xl font-bold tracking-tight sm:text-4xl">Choose your next patient</h2><p className="mt-2 text-sm leading-7 text-slate-600">Not memorizing conditions. Learning how to make better decisions.</p></div><span className="cl-kicker">{filtered.length} matching encounters</span></div>
    <div className="cl-paper mt-7 p-4 sm:p-5">
     <div className="grid gap-3 lg:grid-cols-[1fr_auto]">
      <label className="relative block"><span className="sr-only">Search patient cases</span><Search className="absolute left-4 top-[17px] h-5 w-5 text-slate-400"/><input value={search} onChange={e=>{setSearch(e.target.value);setLimit(18)}} placeholder="Search symptoms, specialty or a patient story..." className="cl-search"/></label>
      <div className="flex items-center gap-2">{["All experiences","Deep dives","Story challenges"].map(t=><button key={t} type="button" onClick={()=>{setType(t);setLimit(18)}} className="cl-filter" data-active={type===t}>{t}</button>)}</div>
     </div>
     <div className="mt-5 flex flex-wrap gap-2">
      <button type="button" data-active={category==="All cases"} onClick={()=>setCategorySafe("All cases")} className="cl-filter">All cases <span className="text-xs opacity-75">{cases.length}</span></button>
      {categories.filter(c=>(totals.get(c)||0)>0).map(c=><button key={c} type="button" data-active={category===c} onClick={()=>setCategorySafe(c)} className="cl-filter">{c}<span className="text-xs opacity-75">{totals.get(c)}</span></button>)}
     </div>
    </div>
    {shown.length>0?<div className="mt-5 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
     {shown.map((c,i)=><Link className="cl-story" key={c.id} href={c.href}>
      <div className="flex items-center justify-between gap-3"><span className="cl-number">CASE {String(i+1).padStart(3,"0")}</span><span className="cl-category">{c.category}</span></div>
      <div className="mt-7"><p className="cl-story-label">{c.kind==="Clinical deep dive"?"FEATURED CLINICAL STORY":"PATIENT INTERVIEW"}</p><h3 className="cl-case-title mt-3 line-clamp-3">{c.hook}</h3><p className="mt-3 line-clamp-2 text-sm leading-6 text-slate-500">{c.patient}</p></div>
      <div className="mt-auto flex items-center justify-between gap-3 border-t border-slate-100 pt-5 text-xs font-semibold text-slate-500"><span className="flex items-center gap-1.5"><Clock3 className="h-3.5 w-3.5"/>{c.minutes}</span><span className="flex items-center gap-1 text-teal-800">Open case <ChevronRight className="h-4 w-4"/></span></div>
     </Link>)}
    </div>:<div className="cl-paper mt-5 p-9 text-center"><Search className="mx-auto h-7 w-7 text-teal-700"/><h3 className="mt-3 font-semibold">No patient files matched</h3><p className="mt-2 text-sm text-slate-500">Try a different symptom or clinical category.</p><button onClick={()=>{setCategory("All cases");setSearch("");setType("All experiences");setLimit(18)}} className="cl-button mt-5">Clear filters</button></div>}
    {shown.length<filtered.length?<div className="mt-9 text-center"><button type="button" onClick={()=>setLimit(n=>n+18)} className="cl-button cl-button-secondary">Load more patient files <ArrowRight className="h-4 w-4"/></button></div>:null}
   </section>
   <aside className="mt-11 flex items-start gap-3 rounded-2xl border border-teal-100 bg-white p-5 text-sm leading-7 text-slate-600"><ShieldAlert className="mt-1 h-5 w-5 flex-none text-teal-700"/> Cases are educational simulations; several share a clinical condition but use different functional contexts. Urgent warning signs always take priority over exercises or entertaining dialogue.</aside>
  </div>
 </div>;
}
