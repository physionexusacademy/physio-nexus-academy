"use client";
import {useMemo,useState} from "react";
import Link from "next/link";
import {ArrowRight,BookOpen,ExternalLink,FileText,Search,ShieldCheck} from "lucide-react";
import type {PublishedCaseReport} from "@/lib/case-report-library";

const specialties=["All specialties","Musculoskeletal","Neurological Rehabilitation","Orthopaedic Rehabilitation","Cardiorespiratory","Paediatric Rehabilitation","Critical Care & ICU"];
export function ResearchCaseLibrary({reports}:{reports:PublishedCaseReport[]}){
 const [query,setQuery]=useState("");
 const [specialty,setSpecialty]=useState("All specialties");
 const [openAccess,setOpenAccess]=useState(false);
 const filtered=useMemo(()=>reports.filter(r=>{
  const text=[r.title,r.authors,r.journal,r.specialty,...r.tags].join(" ").toLowerCase();
  return (!query.trim()||text.includes(query.toLowerCase().trim()))&&(specialty==="All specialties"||r.specialty===specialty)&&(!openAccess||r.openAccess);
 }),[reports,query,specialty,openAccess]);
 return <main className="case-library">
  <div className="cr-wrap">
   <section className="cr-hero">
    <div className="cr-eyebrow"><BookOpen size={15}/> PNA · RESEARCH CASE LIBRARY</div>
    <h1>Real cases.<br/><span>Clinical lessons.</span></h1>
    <p className="cr-lead">Learn from published rehabilitation case reports. Each file links to the original paper and separates what the authors reported from what a clinician can cautiously learn.</p>
    <div className="cr-stats"><div><strong>{reports.length}</strong><span>curated reports</span></div><div><strong>7</strong><span>clinical areas</span></div><div><strong>100%</strong><span>original source links</span></div></div>
    <div className="cr-note"><ShieldCheck size={18}/><p><strong>Evidence honesty:</strong> a case report describes one clinical story. It can teach clinical reasoning, but it cannot prove that a treatment works for everyone.</p></div>
   </section>
   <section className="cr-controls" aria-label="Search and filter published case reports">
    <label className="cr-search"><Search size={19}/><input value={query} onChange={e=>setQuery(e.target.value)} placeholder="Search condition, technique, journal or keyword…" aria-label="Search case reports"/></label>
    <div className="cr-filterrow">{specialties.map(s=><button key={s} className="cr-filter" data-active={specialty===s} onClick={()=>setSpecialty(s)}>{s}</button>)}</div>
    <label className="cr-check"><input type="checkbox" checked={openAccess} onChange={e=>setOpenAccess(e.target.checked)}/> Open-access full text only</label>
    <p className="cr-results">Showing <strong>{filtered.length}</strong> of {reports.length} published reports</p>
   </section>
   <section className="cr-grid" aria-label="Published case reports">
    {filtered.map((r,i)=><article key={r.slug} className="cr-card">
      <div className="cr-card-top"><span className="cr-number">REPORT {String(i+1).padStart(2,"0")}</span><span className="cr-year">{r.year}</span></div>
      <span className="cr-specialty">{r.specialty}</span>
      <h2><Link href={"/case-lab/research/"+r.slug}>{r.title}</Link></h2>
      <p className="cr-authors">{r.authors}</p>
      <p className="cr-summary">{r.caseSummary}</p>
      <div className="cr-tags">{r.tags.slice(0,3).map(t=><span key={t}>{t}</span>)}</div>
      <div className="cr-card-foot"><span><FileText size={15}/>{r.openAccess?"Open-access source":"Publisher/PubMed record"}</span><Link href={"/case-lab/research/"+r.slug}>Read case <ArrowRight size={15}/></Link></div>
      <a className="cr-source" href={r.sourceUrl} target="_blank" rel="noopener noreferrer">Original research <ExternalLink size={13}/></a>
    </article>)}
    {!filtered.length&&<div className="cr-empty"><h2>No reports match those filters.</h2><p>Try another specialty or search term.</p><button onClick={()=>{setQuery("");setSpecialty("All specialties");setOpenAccess(false)}}>Clear filters</button></div>}
   </section>
   <footer className="cr-disclaimer">Educational summaries written by Physio Nexus Academy in original wording. Patient details and findings are summarized from the cited paper; consult the original article for exact methods, context and references. This library is for professional learning, not individual diagnosis or treatment advice.</footer>
  </div>
 </main>;
}
