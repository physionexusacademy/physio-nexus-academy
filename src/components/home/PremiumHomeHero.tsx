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
  const [query,setQuery] = useState("");
  const results = useMemo(() => {
    const needle=query.trim().toLowerCase();
    if(!needle) return [];
    return destinations.filter(item => (item.title+" "+item.description).toLowerCase().includes(needle)).slice(0,6);
  },[query]);
  const onSearch=(event:FormEvent<HTMLFormElement>)=>{
    event.preventDefault();
    if(results.length) window.location.assign(results[0].href);
    else if(!query.trim()) window.location.assign("/knowledge-hub");
  };

  return (
    <section className="pna-vision-hero" aria-label="Welcome to Physio Nexus Academy">
      <div className="container-content">
        <div className="pna-vision-banner">
          <div className="pna-vision-orbits" aria-hidden="true"/>
          <div className="pna-vision-copy">
            <p className="pna-vision-eyebrow"><Sparkles size={15} aria-hidden="true"/> LEARN · PRACTICE · GROW</p>
            <h1>Physio Nexus <span>Academy</span></h1>
            <p className="pna-vision-subtitle">Evidence-Based Learning<br/>for Real-World Practice</p>
            <p className="pna-vision-description">Knowledge, clinical reasoning, professional training and patient care — beautifully connected.</p>
            <div className="pna-vision-banner-actions">
              <a href="#explore-pna" className="pna-vision-primary">Explore PNA <ArrowRight size={17} aria-hidden="true"/></a>
              <a href="/founder" className="pna-vision-founder-cta">Meet the founder <ArrowRight size={15} aria-hidden="true"/></a>
            </div>
          </div>
          <a href="/founder" className="pna-vision-founder-photo" aria-label="Meet Dr. Sajjad Raza PT, founder of Physio Nexus Academy">
            <Image src="/images/pna-founder-hero.avif" alt="Dr. Sajjad Raza PT in navy PNA physiotherapy scrubs, arms folded"
              fill priority unoptimized sizes="(max-width: 600px) 240px, (max-width: 1024px) 360px, 510px" />
            <span className="pna-vision-founder-label">Dr. Sajjad Raza PT <small>Founder, PNA</small></span>
          </a>
          <div className="pna-vision-promise" aria-label="Our platform focus">
            <span><BookOpen size={20} aria-hidden="true"/> Clinical Learning</span>
            <span><BrainCircuit size={20} aria-hidden="true"/> Real Cases</span>
            <span><Trophy size={20} aria-hidden="true"/> Workshops & CPD</span>
          </div>
        </div>

        <div className="pna-vision-search-block">
          <form className="pna-vision-search" role="search" onSubmit={onSearch}>
            <Search size={20} aria-hidden="true"/>
            <input type="search" value={query} onChange={event=>setQuery(event.target.value)}
              aria-label="Find a PNA feature" autoComplete="off"
              placeholder="Find a topic, clinical case, technique or service..." />
            <button type="submit" aria-label="Open first matching result"><ArrowRight size={18} aria-hidden="true"/></button>
          </form>
          {query.trim() && <div className="pna-vision-search-results" role="status" aria-live="polite">
            {results.length ? results.map(result=>{
              const Icon=result.icon;
              return <a key={result.href} href={result.href}><Icon size={17} aria-hidden="true"/>
                <span><strong>{result.title}</strong><small>{result.description}</small></span>
                <ArrowRight size={15} aria-hidden="true"/></a>;
            }) : <p>No direct feature match. Try “manual therapy,” “case” or “workshop.”</p>}
          </div>}
          <div className="pna-vision-shortcuts" aria-label="Popular starting points">
            <a href="/symptom-checker"><Stethoscope aria-hidden="true"/><span>Explore a Condition</span><ArrowRight aria-hidden="true"/></a>
            <a href="/manual-therapy"><Hand aria-hidden="true"/><span>Find a Technique</span><ArrowRight aria-hidden="true"/></a>
            <a href="/case-lab"><ClipboardList aria-hidden="true"/><span>Clinical Cases</span><ArrowRight aria-hidden="true"/></a>
          </div>
        </div>


      </div>
    </section>
  );
}
