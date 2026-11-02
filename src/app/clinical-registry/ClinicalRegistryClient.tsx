"use client";

import Image from "next/image";
import { useMemo, useState } from "react";
import {
  Activity, ArrowDownRight, ArrowUpRight, Bell, CalendarDays, ChevronDown,
  ChevronRight, ClipboardList, FileText, Filter, LayoutDashboard, Menu,
  MoreHorizontal, Plus, Search, ShieldCheck, Users, X, ChartNoAxesCombined,
  Clock3, LockKeyhole, HeartPulse, BookOpen, UserRound, Settings, Printer
} from "lucide-react";

type CaseItem = { id: string; patient: string; condition: string; category: string; date: string; status: "In progress" | "Follow-up due" | "Completed" };

const cases: CaseItem[] = [
  { id: "PNA-00124", patient: "Patient A · 42 yrs", condition: "Mechanical neck pain", category: "Musculoskeletal", date: "30 Oct 2026", status: "In progress" },
  { id: "PNA-00123", patient: "Patient B · 29 yrs", condition: "Lateral ankle sprain", category: "Sports Rehabilitation", date: "29 Oct 2026", status: "Follow-up due" },
  { id: "PNA-00122", patient: "Patient C · 56 yrs", condition: "Knee osteoarthritis", category: "Musculoskeletal", date: "28 Oct 2026", status: "Completed" },
  { id: "PNA-00121", patient: "Patient D · 35 yrs", condition: "Lumbar radicular pain", category: "Musculoskeletal", date: "26 Oct 2026", status: "In progress" },
];

const navItems = [
  { label: "Overview", icon: LayoutDashboard },
  { label: "Patient records", icon: Users },
  { label: "Clinical assessments", icon: ClipboardList },
  { label: "Interventions", icon: Activity },
  { label: "Outcomes & follow-ups", icon: ChartNoAxesCombined },
  { label: "Clinical reports", icon: FileText },
  { label: "Case registry", icon: BookOpen },
  { label: "Contributions", icon: HeartPulse },
];

type OutcomePoint = { label: string; value: number };

function TrendChart({ points }: { points: OutcomePoint[] }) {
  if (points.length < 2) {
    return (
      <div className="mt-5 flex min-h-[170px] flex-col items-center justify-center rounded-xl border border-dashed border-slate-200 bg-slate-50/70 px-4 text-center">
        <ChartNoAxesCombined size={24} className="text-teal-600" />
        <p className="mt-3 text-xs font-semibold text-slate-700">No saved outcome trend yet</p>
        <p className="mt-1 max-w-sm text-[11px] leading-5 text-slate-500">The graph is designed to plot each patient's actual recorded outcome measurements as follow-ups are saved. No illustrative values are shown.</p>
      </div>
    );
  }
  const min = Math.min(0, ...points.map((p) => p.value));
  const max = Math.max(10, ...points.map((p) => p.value));
  const coords = points.map((p, i) => {
    const x = 44 + (i * 570) / Math.max(1, points.length - 1);
    const y = 150 - ((p.value - min) / Math.max(1, max - min)) * 120;
    return { x, y, ...p };
  });
  const line = coords.map((p) => `${p.x},${p.y}`).join(" ");
  return (
    <div className="mt-5">
      <svg viewBox="0 0 640 190" role="img" aria-label="Recorded clinical outcome measurements over time" className="h-auto max-h-44 w-full">
        {[30, 70, 110, 150].map((y) => <line key={y} x1="42" y1={y} x2="620" y2={y} stroke="#e8eef3" strokeDasharray="4 5" />)}
        <polyline points={line} fill="none" stroke="#0d9488" strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round" />
        {coords.map((p, i) => <g key={`${p.label}-${i}`}><circle cx={p.x} cy={p.y} r="5" fill="white" stroke="#0d9488" strokeWidth="3" /><text x={p.x} y="178" textAnchor="middle" fill="#64748b" fontSize="10">{p.label}</text></g>)}
      </svg>
      <p className="mt-1 text-[10px] text-slate-500">Values plotted from saved clinical outcome entries.</p>
    </div>
  );
}

export function ClinicalRegistryClient() {
  const [activeNav, setActiveNav] = useState("Overview");
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("All records");
  const [reportOpen, setReportOpen] = useState(false);
  const [mobileNav, setMobileNav] = useState(false);
  const [activeSlide, setActiveSlide] = useState("slide-overview");
  const goToSlide = (id: string) => { setActiveSlide(id); document.getElementById(id)?.scrollIntoView({ behavior: "smooth", block: "start" }); };
  const filteredCases = useMemo(() => cases.filter((item) => (status === "All records" || item.status === status) && (item.patient + item.condition + item.id).toLowerCase().includes(search.toLowerCase())), [search, status]);

  return (
    <main className="min-h-screen w-full overflow-x-hidden bg-[#f5f8fb] text-slate-800">
      <style jsx global>{`@media print { body * { visibility: hidden !important; } .pna-report-print, .pna-report-print * { visibility: visible !important; } .pna-report-print { position: absolute !important; inset: 0 !important; width: 100% !important; max-height: none !important; overflow: visible !important; box-shadow: none !important; } .pna-report-actions { display: none !important; } @page { margin: 14mm; size: A4; } }`}</style>
      <div className="flex min-h-screen w-full min-w-0">
        <aside className={`fixed inset-y-0 left-0 z-40 flex w-[268px] flex-col border-r border-slate-200 bg-white transition-transform lg:static lg:translate-x-0 ${mobileNav ? "translate-x-0" : "-translate-x-full"}`}>
          <div className="flex h-[78px] items-center gap-3 border-b border-slate-100 px-5">
            <Image src="/images/pna-logo.png" alt="Physio Nexus Academy logo" width={43} height={43} className="h-11 w-11 object-contain"/>
            <div className="min-w-0"><p className="text-[15px] font-bold leading-tight text-[#173653]">Physio Nexus Academy</p><p className="mt-1 text-[10px] font-semibold uppercase tracking-[.13em] text-teal-700">Clinical Registry</p></div>
            <button onClick={()=>setMobileNav(false)} className="ml-auto rounded-lg p-2 text-slate-500 lg:hidden" aria-label="Close navigation"><X size={18}/></button>
          </div>
          <div className="px-4 pt-6"><p className="px-3 text-[10px] font-bold uppercase tracking-[.16em] text-slate-400">Workspace</p>
            <nav className="mt-3 space-y-1">{navItems.map(({label,icon:Icon})=><button key={label} onClick={()=>{setActiveNav(label);setMobileNav(false)}} className={`flex w-full items-center gap-3 rounded-xl px-3 py-3 text-left text-[13px] font-semibold transition ${activeNav===label?"bg-[#eaf7f5] text-[#087e78]":"text-slate-600 hover:bg-slate-50 hover:text-slate-900"}`}><Icon size={17}/><span>{label}</span>{label==="Clinical reports"&&<span className="ml-auto rounded-full bg-teal-100 px-2 py-0.5 text-[10px] text-teal-800">New</span>}</button>)}</nav>
          </div>
          <div className="mt-auto p-4">
            <div className="rounded-2xl border border-teal-100 bg-gradient-to-br from-[#f0fbf9] to-white p-4"><div className="flex items-center gap-2 text-teal-800"><ShieldCheck size={17}/><span className="text-xs font-bold">Privacy-first workspace</span></div><p className="mt-2 text-[11px] leading-5 text-slate-500">Patient records are private. Public case sharing requires separate consent and review.</p></div>
            <button className="mt-4 flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-xs font-semibold text-slate-500 hover:bg-slate-50"><Settings size={16}/> Workspace settings <ChevronRight size={14} className="ml-auto"/></button>
          </div>
        </aside>
        {mobileNav&&<button aria-label="Close menu overlay" onClick={()=>setMobileNav(false)} className="fixed inset-0 z-30 bg-slate-900/30 lg:hidden"/>}
        <section className="min-w-0 w-full flex-1 overflow-x-hidden">
          <header className="sticky top-0 z-20 flex h-[78px] items-center justify-between border-b border-slate-200/80 bg-white/90 px-4 backdrop-blur-md sm:px-7 lg:px-9">
            <div className="flex items-center gap-3"><button onClick={()=>setMobileNav(true)} className="rounded-xl border border-slate-200 p-2 text-slate-600 lg:hidden" aria-label="Open navigation"><Menu size={19}/></button><div><p className="text-[11px] font-medium text-slate-400">Workspace / <span className="text-teal-700">{activeNav}</span></p><h1 className="mt-0.5 text-lg font-bold tracking-tight text-[#173653] sm:text-xl">{activeNav}</h1></div></div>
            <div className="flex items-center gap-2 sm:gap-3"><button className="relative rounded-xl border border-slate-200 p-2.5 text-slate-500 hover:bg-slate-50" aria-label="Notifications"><Bell size={17}/><i className="absolute right-2 top-2 h-1.5 w-1.5 rounded-full bg-orange-400"/></button><div className="hidden h-8 w-px bg-slate-200 sm:block"/><div className="flex items-center gap-2.5"><div className="flex h-9 w-9 items-center justify-center rounded-full bg-[#e5f4f2] text-xs font-bold text-teal-800">DR</div><div className="hidden sm:block"><p className="text-xs font-bold text-slate-700">Dr. Therapist Name</p><p className="text-[10px] text-slate-400">Verification pending</p></div><ChevronDown size={14} className="hidden text-slate-400 sm:block"/></div></div>
          </header>
          <div className="mx-auto w-full max-w-[1440px] min-w-0 px-3 py-5 sm:px-7 sm:py-8 lg:px-9">
            <div className="mb-5 flex w-full items-center gap-2 overflow-x-auto pb-1 lg:hidden" aria-label="Slide navigation">{[{label:"Overview",id:"slide-overview"},{label:"Outcomes",id:"slide-outcomes"},{label:"Patient records",id:"slide-records"},{label:"Workspace",id:"slide-workspace"}].map((item)=><button key={item.id} onClick={()=>goToSlide(item.id)} className={`shrink-0 rounded-full border px-4 py-2 text-xs font-semibold transition ${activeSlide===item.id?"border-teal-700 bg-teal-700 text-white":"border-slate-200 bg-white text-slate-600"}`}>{item.label}</button>)}</div>
            <div id="slide-overview" className="scroll-mt-28 mb-7 flex min-w-0 flex-col justify-between gap-4 sm:flex-row sm:items-end"><div><div className="inline-flex items-center gap-2 rounded-full border border-teal-100 bg-white px-3 py-1 text-[10px] font-bold uppercase tracking-[.12em] text-teal-800"><Activity size={12}/> Clinical workspace preview</div><h2 className="mt-3 text-2xl font-bold tracking-tight text-[#173653] sm:text-[30px]">Good morning, Dr. Therapist</h2><p className="mt-1.5 max-w-2xl text-sm leading-6 text-slate-500">Your clinical documentation, patient progress and professional contributions — in one organised workspace.</p></div><button onClick={()=>setActiveNav("Clinical assessments")} className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#087f79] px-4 py-3 text-xs font-bold text-white shadow-sm shadow-teal-900/10 transition hover:bg-[#066b67]"><Plus size={16}/> New clinical assessment</button></div>
            <div className="mb-6 grid grid-cols-2 gap-3 xl:grid-cols-4">
              {[
                {label:"Patient records",value:"24",sub:"Private records",icon:Users,trend:"+3 this month",up:true},
                {label:"Assessments",value:"38",sub:"Documented visits",icon:ClipboardList,trend:"+8 this month",up:true},
                {label:"Follow-ups due",value:"5",sub:"Require review",icon:CalendarDays,trend:"2 due this week",up:false},
                {label:"Approved contributions",value:"12",sub:"Public cases",icon:BookOpen,trend:"3 awaiting review",up:true},
              ].map(({label,value,sub,icon:Icon,trend,up})=><article key={label} className="rounded-2xl border border-slate-200/80 bg-white p-4 shadow-[0_4px_18px_-14px_rgba(15,44,67,.22)] sm:p-5"><div className="flex items-center justify-between"><span className="text-[11px] font-semibold text-slate-500 sm:text-xs">{label}</span><span className="rounded-xl bg-[#eef8f7] p-2 text-teal-700"><Icon size={17}/></span></div><div className="mt-3 flex items-end justify-between gap-2"><div><p className="text-2xl font-bold tracking-tight text-[#173653] sm:text-[29px]">{value}</p><p className="mt-0.5 text-[10px] text-slate-400">{sub}</p></div><span className={`mb-1 inline-flex items-center gap-1 text-[10px] font-semibold ${up?"text-teal-700":"text-amber-700"}`}>{up?<ArrowUpRight size={13}/>:<ArrowDownRight size={13}/>} {trend}</span></div></article>)}
            </div>
            <div className="grid min-w-0 gap-5 2xl:grid-cols-[minmax(0,1.55fr)_minmax(310px,.85fr)]">
              <div className="space-y-5">
                <article id="slide-outcomes" className="scroll-mt-28 min-w-0 rounded-2xl border border-slate-200/80 bg-white p-4 shadow-[0_4px_18px_-14px_rgba(15,44,67,.22)] sm:p-6"><div className="flex flex-wrap items-start justify-between gap-3"><div><h3 className="text-sm font-bold text-[#173653]">Clinical outcomes overview</h3><p className="mt-1 text-xs text-slate-400">A visual example of how documented patient outcomes may be presented</p></div><button className="inline-flex items-center gap-1 rounded-lg border border-slate-200 px-3 py-2 text-[10px] font-semibold text-slate-600">Last 6 weeks <ChevronDown size={13}/></button></div><TrendChart points={[]}/><p className="mt-2 rounded-lg bg-amber-50 px-3 py-2 text-[10px] leading-4 text-amber-800">No live clinical data is connected in this preview. The chart will update from actual saved measurements after secure record storage and follow-up entry are implemented.</p></article>
                <article id="slide-records" className="scroll-mt-28 min-w-0 rounded-2xl border border-slate-200/80 bg-white p-4 shadow-[0_4px_18px_-14px_rgba(15,44,67,.22)] sm:p-6"><div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-center"><div><h3 className="text-sm font-bold text-[#173653]">Recent patient records</h3><p className="mt-1 text-xs text-slate-400">Private records visible only to authorised users</p></div><button onClick={()=>setActiveNav("Patient records")} className="text-left text-xs font-bold text-teal-700 hover:text-teal-900">View all records <ChevronRight size={13} className="inline"/></button></div><div className="mt-4 flex flex-col gap-2 sm:flex-row"><label className="relative flex-1"><Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"/><input value={search} onChange={e=>setSearch(e.target.value)} placeholder="Search by patient ID or condition" className="h-10 w-full rounded-xl border border-slate-200 bg-white pl-9 pr-3 text-xs outline-none transition focus:border-teal-500 focus:ring-2 focus:ring-teal-100"/></label><label className="relative"><Filter size={14} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"/><select value={status} onChange={e=>setStatus(e.target.value)} className="h-10 w-full appearance-none rounded-xl border border-slate-200 bg-white pl-9 pr-8 text-xs text-slate-600 outline-none focus:border-teal-500 sm:w-44"><option>All records</option><option>In progress</option><option>Follow-up due</option><option>Completed</option></select></label></div><div className="mt-3 overflow-x-auto"><table className="w-full min-w-[560px] text-left"><thead><tr className="border-b border-slate-100 text-[10px] font-semibold uppercase tracking-wide text-slate-400"><th className="py-3 pr-3">Patient / ID</th><th className="py-3 pr-3">Condition</th><th className="py-3 pr-3">Last updated</th><th className="py-3 pr-3">Status</th><th className="py-3"/></tr></thead><tbody>{filteredCases.map(item=><tr key={item.id} className="border-b border-slate-50 last:border-0"><td className="py-3 pr-3"><p className="text-xs font-semibold text-slate-700">{item.patient}</p><p className="mt-0.5 text-[10px] text-slate-400">{item.id}</p></td><td className="py-3 pr-3"><p className="text-xs font-medium text-slate-600">{item.condition}</p><p className="mt-0.5 text-[10px] text-slate-400">{item.category}</p></td><td className="py-3 pr-3 text-[11px] text-slate-500">{item.date}</td><td className="py-3 pr-3"><span className={`whitespace-nowrap rounded-full px-2.5 py-1 text-[10px] font-semibold ${item.status==="Completed"?"bg-emerald-50 text-emerald-700":item.status==="Follow-up due"?"bg-amber-50 text-amber-700":"bg-sky-50 text-sky-700"}`}>{item.status}</span></td><td className="py-3 text-right"><button onClick={()=>setReportOpen(true)} aria-label={`Preview report for ${item.id}`} className="rounded-lg p-2 text-slate-400 hover:bg-teal-50 hover:text-teal-700"><ChevronRight size={16}/></button></td></tr>)}</tbody></table>{filteredCases.length===0&&<p className="py-8 text-center text-xs text-slate-400">No matching records in this preview.</p>}</div></article>
              </div>
              <div className="space-y-5">
                <article className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-[0_4px_18px_-14px_rgba(15,44,67,.22)]"><div className="flex items-center justify-between"><h3 className="text-sm font-bold text-[#173653]">Quick actions</h3><MoreHorizontal size={17} className="text-slate-400"/></div><div className="mt-4 grid grid-cols-2 gap-2.5">{[{label:"Register patient",icon:UserRound},{label:"New assessment",icon:ClipboardList},{label:"Record intervention",icon:Activity},{label:"Create report",icon:FileText}].map(({label,icon:Icon})=><button key={label} onClick={()=>label==="Create report"?setReportOpen(true):setActiveNav(label==="Register patient"?"Patient records":label==="New assessment"?"Clinical assessments":"Interventions")} className="flex min-h-[94px] flex-col items-start justify-between rounded-xl border border-slate-100 bg-[#fbfdfd] p-3 text-left transition hover:border-teal-200 hover:bg-teal-50/50"><span className="rounded-lg bg-[#eaf7f5] p-2 text-teal-700"><Icon size={17}/></span><span className="text-[11px] font-bold text-slate-700">{label}</span></button>)}</div></article>
                <article className="overflow-hidden rounded-2xl border border-[#d6ece8] bg-gradient-to-br from-[#f0fbf9] via-white to-[#f7fbff] p-5"><div className="flex items-center gap-2"><ShieldCheck size={17} className="text-teal-700"/><h3 className="text-sm font-bold text-[#173653]">Professional contribution</h3></div><p className="mt-2 text-xs leading-5 text-slate-500">Share approved, anonymised clinical cases to support peer learning.</p><div className="mt-4 flex items-end justify-between"><div><p className="text-2xl font-bold text-[#173653]">12 <span className="text-xs font-medium text-slate-400">cases</span></p><p className="mt-1 text-[10px] text-teal-700">Clinical Contributor · preview</p></div><div className="flex h-12 w-12 items-center justify-center rounded-full border-[5px] border-teal-100 border-t-teal-600 text-[10px] font-bold text-teal-800">12%</div></div><div className="mt-4 h-1.5 overflow-hidden rounded-full bg-teal-100"><div className="h-full w-[24%] rounded-full bg-teal-600"/></div><p className="mt-2 text-[10px] text-slate-400">Contribution designations reflect approved case count, not clinical seniority.</p><button onClick={()=>setActiveNav("Case registry")} className="mt-4 inline-flex items-center gap-1 text-xs font-bold text-teal-800">Explore case registry <ChevronRight size={14}/></button></article>
                <article className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-[0_4px_18px_-14px_rgba(15,44,67,.22)]"><div className="flex items-center gap-2"><Clock3 size={16} className="text-amber-600"/><h3 className="text-sm font-bold text-[#173653]">Upcoming follow-ups</h3></div><div className="mt-4 space-y-3">{[{name:"Patient B · Ankle sprain",date:"Tomorrow · 10:30 AM"},{name:"Patient D · Lumbar pain",date:"02 Nov · 4:00 PM"},{name:"Patient E · Shoulder pain",date:"04 Nov · 12:00 PM"}].map(item=><div key={item.name} className="flex items-center justify-between gap-2 border-b border-slate-50 pb-3 last:border-0 last:pb-0"><div><p className="text-xs font-semibold text-slate-700">{item.name}</p><p className="mt-1 text-[10px] text-slate-400">{item.date}</p></div><CalendarDays size={15} className="text-slate-300"/></div>)}</div></article>
              </div>
            </div>
            <footer className="mt-8 flex flex-col items-center justify-between gap-2 border-t border-slate-200 pt-5 text-center text-[10px] text-slate-400 sm:flex-row sm:text-left"><span>© {new Date().getFullYear()} Physio Nexus Academy. All rights reserved.</span><span className="inline-flex items-center gap-1.5"><LockKeyhole size={11}/> Private clinical workspace · Preview interface</span></footer>
          </div>
        </section>
      </div>
      {reportOpen&&<div role="dialog" aria-modal="true" aria-labelledby="report-title" className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/45 p-3 sm:p-6"><div className="pna-report-print max-h-[92dvh] w-full max-w-3xl overflow-x-hidden overflow-y-auto rounded-2xl bg-white shadow-2xl"><div className="flex items-center justify-between border-b border-slate-100 px-5 py-4"><div><p className="text-[10px] font-bold uppercase tracking-[.15em] text-teal-700">Report preview</p><h2 id="report-title" className="mt-1 text-lg font-bold text-[#173653]">Clinical Progress Report</h2></div><button onClick={()=>setReportOpen(false)} aria-label="Close report preview" className="rounded-lg p-2 text-slate-500 hover:bg-slate-100"><X size={18}/></button></div><div className="p-5 sm:p-8"><div className="flex flex-col items-center border-b-2 border-teal-600 pb-5 text-center"><Image src="/images/pna-logo.png" alt="Original Physio Nexus Academy logo" width={68} height={68} className="h-16 w-16 object-contain"/><h3 className="mt-2 text-xl font-bold tracking-wide text-[#173653]">PHYSIO NEXUS ACADEMY</h3><p className="mt-1 text-[10px] font-semibold uppercase tracking-[.16em] text-teal-700">Clinical Progress & Outcome Report</p></div><div className="mt-6 grid gap-4 sm:grid-cols-2"><div><p className="text-[10px] uppercase text-slate-400">Patient reference</p><p className="mt-1 text-sm font-bold text-slate-700">PNA-00124 · Sample record</p></div><div><p className="text-[10px] uppercase text-slate-400">Report date</p><p className="mt-1 text-sm font-bold text-slate-700">30 October 2026</p></div><div><p className="text-[10px] uppercase text-slate-400">Prepared by</p><p className="mt-1 text-sm font-bold text-slate-700">Dr. [Therapist Full Name]</p><p className="text-xs text-slate-500">Verified professional credentials</p></div><div><p className="text-[10px] uppercase text-slate-400">Clinical category</p><p className="mt-1 text-sm font-bold text-slate-700">Musculoskeletal Physiotherapy</p></div></div><div className="mt-7 rounded-xl bg-slate-50 p-4"><h4 className="text-xs font-bold text-[#173653]">Outcome summary · illustrative data</h4><TrendChart points={[]}/></div><div className="mt-6 grid gap-3 sm:grid-cols-2"><div className="rounded-xl border border-slate-200 p-4"><p className="text-xs font-bold text-[#173653]">Initial assessment</p><p className="mt-2 text-xs leading-5 text-slate-500">Baseline findings, symptom profile, functional limitations and documented clinical impression.</p></div><div className="rounded-xl border border-slate-200 p-4"><p className="text-xs font-bold text-[#173653]">Follow-up & discharge</p><p className="mt-2 text-xs leading-5 text-slate-500">Recorded progress, outcome measure comparison and discharge recommendations.</p></div></div><div className="mt-7 border-t border-slate-200 pt-4 text-center"><p className="text-xs font-bold text-[#173653]">Physio Nexus Academy</p><p className="mt-1 text-[10px] text-slate-400">Prepared for clinical documentation. Patient data must be handled confidentially.</p></div></div><div className="pna-report-actions flex flex-wrap justify-end gap-2 border-t border-slate-100 bg-slate-50 px-5 py-4"><button onClick={()=>window.print()} className="inline-flex items-center gap-2 rounded-xl bg-[#087f79] px-4 py-2.5 text-xs font-bold text-white hover:bg-[#066b67]"><Printer size={14}/> Print / Save PDF</button><button onClick={()=>setReportOpen(false)} className="rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-xs font-semibold text-slate-600">Close preview</button></div></div></div>}
    </main>
  );
}
