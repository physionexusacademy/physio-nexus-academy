"use client";

import { useMemo, useState, type FormEvent } from "react";
import Image from "next/image";
import {
  ArrowRight, BookOpen, BrainCircuit, CalendarDays, CheckCircle2,
  ClipboardList, HeartPulse, Search, ShieldCheck, Stethoscope,
  Trophy, Hand, Eye, LibraryBig, FlaskConical, FileBadge2, Sparkles
} from "lucide-react";

const destinations = [
  { title:"Knowledge Hub", description:"MSK, neurology, cardiopulmonary, sports and more", href:"/knowledge-hub", icon:LibraryBig },
  { title:"Clinical Visual Atlas", description:"Anatomy, pathology and visual learning", href:"/clinical-visual-atlas", icon:Eye },
  { title:"Manual Therapy Mastery", description:"Maitland, Mulligan and manual therapy", href:"/manual-therapy", icon:Hand },
  { title:"Treatment Plans", description:"Condition-based assessment and rehabilitation", href:"/treatment-plans", icon:ClipboardList },
  { title:"Clinical Challenge Arena", description:"Practice differential diagnosis and clinical decisions", href:"/clinical-arena", icon:BrainCircuit },
  { title:"Clinical Case Lab", description:"Clinical cases and treatment reasoning", href:"/case-lab", icon:Stethoscope },
  { title:"Daily Clinical Challenge", description:"Five clinical questions every day", href:"/daily-challenge", icon:Trophy },
  { title:"Weekly Clinical Quiz", description:"Timed questions and leaderboards", href:"/clinical-quiz", icon:CheckCircle2 },
  { title:"Workshops & CPD", description:"Hands-on physiotherapy training", href:"/workshops", icon:CalendarDays },
  { title:"Research Support", description:"Evidence and academic learning", href:"/research", icon:FlaskConical },
  { title:"Books & Resources", description:"Learning material and clinical books", href:"/resources", icon:BookOpen },
  { title:"MSK Symptom Checker", description:"Screen possible musculoskeletal symptom patterns", href:"/symptom-checker", icon:Stethoscope },
  { title:"Patient Care", description:"Appointments and physiotherapy services", href:"/patient-services", icon:HeartPulse },
  { title:"Verify Certificate", description:"Check a PNA verification ID", href:"/verify", icon:FileBadge2 },
  { title:"Book an Appointment", description:"Request a physiotherapy consultation", href:"/appointment", icon:CalendarDays },
  { title:"Request a Home Visit", description:"Physiotherapy support in eligible service areas", href:"/home-visit", icon:HeartPulse },
] as const;

export function PremiumHomeHero() {
  const [query,setQuery]=useState("");
  const results=useMemo(()=>{
    const needle=query.trim().toLowerCase();
    if(!needle) return [] as typeof destinations[number][];
    return destinations.filter(item => (item.title+" "+item.description).toLowerCase().includes(needle)).slice(0,6);
  },[query]);

  function onSearch(event:FormEvent<HTMLFormElement>){
    event.preventDefault();
    if(results.length) window.location.assign(results[0].href);
  }

  return (
    <section className="pna-vision-hero" aria-label="Welcome to Physio Nexus Academy">
      <div className="pna-vision-shell">
        <div className="pna-vision-copy">
          <p className="pna-vision-kicker"><Sparkles size={14} aria-hidden="true"/> Learn · Practice · Grow</p>
          <div className="pna-vision-title-block">
            <h1>Clinical Confidence<br/><span>Starts Here</span></h1>
            <div className="pna-vision-promise" aria-label="What you get with PNA">
              <p>Evidence-based learning.</p>
              <p>Real clinical skills.</p>
              <p>Built for Pakistan.</p>
            </div>
            <p className="pna-vision-lead">
              The practice-focused physiotherapy platform for students, clinicians and patients —
              knowledge, cases, workshops and care in one place.
            </p>
            <div className="pna-vision-actions">
              <a href="#explore-pna" className="pna-vision-primary">Start Exploring <ArrowRight size={17} aria-hidden="true"/></a>
              <a href="/founder" className="pna-vision-founder-cta">Meet the Founder <ArrowRight size={15} aria-hidden="true"/></a>
            </div>
          </div>
          <a href="/founder" className="pna-vision-founder-photo" aria-label="Meet Dr. Sajjad Raza PT, founder of Physio Nexus Academy">
            <Image src="/images/pna-founder-hero-sharp-v2.avif" alt="Dr. Sajjad Raza PT, founder of Physio Nexus Academy" fill priority unoptimized sizes="(max-width: 900px) 88vw, 420px"/>
          </a>
        </div>

        <div className="pna-vision-rail" aria-label="Quick access">
          <div className="pna-vision-rail-links">
            <a href="/knowledge-hub" aria-label="Explore Clinical Learning"><BookOpen size={20} aria-hidden="true"/> Clinical Learning</a>
            <a href="/case-lab" aria-label="Explore Real Clinical Cases"><BrainCircuit size={20} aria-hidden="true"/> Real Cases</a>
            <a href="/workshops" aria-label="Explore Workshops and CPD"><Trophy size={20} aria-hidden="true"/> Workshops & CPD</a>
          </div>
        </div>

        <div className="pna-vision-search-wrap" id="explore-pna">
          <form className="pna-vision-search" role="search" onSubmit={onSearch}>
            <Search aria-hidden="true"/>
            <input
              value={query}
              onChange={(e)=>setQuery(e.target.value)}
              aria-label="Find a PNA feature" autoComplete="off"
              placeholder="Search topics, techniques, cases or services..." />
            <button type="submit" aria-label="Open first matching result"><ArrowRight size={18} aria-hidden="true"/></button>
          </form>
          {query.trim() && <div className="pna-vision-results" role="listbox" aria-label="Matching features">
            {results.length ? results.map((result)=>{
              const Icon=result.icon;
              return <a key={result.href} href={result.href}><Icon size={17} aria-hidden="true"/>
                <span><strong>{result.title}</strong><small>{result.description}</small></span>
                <ArrowRight size={15} aria-hidden="true"/></a>;
            }) : <p>No direct feature match. Try “manual therapy,” “case” or “workshop.”</p>}
          </div>}
          <div className="pna-vision-shortcuts" aria-label="Popular starting points">
            <a href="/appointment"><CalendarDays aria-hidden="true"/><span>Book Physiotherapy Appointment</span><ArrowRight aria-hidden="true"/></a>
            <a href="/manual-therapy"><Hand aria-hidden="true"/><span>Learn Manual Therapy</span><ArrowRight aria-hidden="true"/></a>
            <a href="/knowledge-hub"><LibraryBig aria-hidden="true"/><span>Knowledge Hub</span><ArrowRight aria-hidden="true"/></a>
          </div>
        </div>


      </div>
    </section>
  );
}
