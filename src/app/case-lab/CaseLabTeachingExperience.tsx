"use client";

import Link from "next/link";
import {ArrowLeft,BookOpen,ShieldAlert,Stethoscope} from "lucide-react";
import type {CaseStory} from "@/lib/case-lab-story";
import {RomanUrduHelp} from "./RomanUrduHelp";

function SectionTitle({number,title,caption}:{number:string;title:string;caption?:string}){
 return <div className="cl-case-section-title">
  <span>{number}</span>
  <div><h2>{title}</h2>{caption&&<p>{caption}</p>}</div>
 </div>;
}

function BulletList({items}:{items:string[]}){
 const clean=items.map(x=>x.trim()).filter(Boolean);
 if(!clean.length)return null;
 return <ul className="cl-case-bullets">{clean.map((item,index)=><li key={index}>{item}</li>)}</ul>;
}

function GuideDetails({story}:{story:CaseStory}){
 const guide=story.guide;
 if(!guide)return null;
 const sections=[
  ["Questions that change the decision",guide.keyQuestions],
  ["Examination sequence",guide.examinationSequence],
  ["Decision logic",guide.decisionLogic],
  ["Practical management detail",guide.practicalManagement],
  ["Exercise dosage and precautions",guide.exerciseDose],
  ["Reassessment plan",guide.reassessment],
  ["Common clinical mistakes",guide.commonMistakes],
  ["Master takeaway",guide.masterTakeaway],
 ] as const;
 return <section className="mt-7" aria-labelledby="clinical-notes-heading">
  <h2 id="clinical-notes-heading" className="text-lg font-bold text-slate-900">Clinical notes</h2>
  <p className="mt-1 text-sm leading-6 text-slate-600">Additional case-specific teaching detail. Open only the section you need; the patient narrative remains uninterrupted above.</p>
  <div className="mt-2 divide-y divide-slate-200 border-y border-slate-200">
   {sections.filter(([,items])=>items?.length).map(([title,items])=><details key={title} className="cl-case-detail">
    <summary>{title}<span aria-hidden="true">+</span></summary>
    <BulletList items={[...items]}/>
   </details>)}
  </div>
 </section>;
}

export function CaseLabTeachingExperience({story}:{story:CaseStory}){
 const workingDiagnosis=story.teachingDiagnosis||story.diagnosisChoices[story.diagnosisCorrect]||"Working diagnosis under review";
 const title=story.teachingDiagnosis||story.diagnosisChoices[story.diagnosisCorrect]||story.category;
 return <main className="case-lab-v3 min-h-screen pb-16" data-pna-case-lab-lesson="continuous-clinical-file-v3">
  <div className="container-content pt-5 sm:pt-8">
   <Link href="/case-lab" className="cl-breadcrumb"><ArrowLeft className="h-4 w-4"/> All clinical cases</Link>

   <header className="cl-case-file-header mt-5">
    <p className="cl-eyebrow"><BookOpen className="h-4 w-4"/> PNA CASE LAB <span aria-hidden="true">/</span> {story.category}</p>
    <h1 className="mt-3 font-serif text-3xl font-bold tracking-tight text-slate-950 sm:text-4xl">{title}</h1>
    <p className="mt-3 max-w-3xl text-sm leading-7 text-slate-600 sm:text-base">
     A complete simulated clinical encounter. Follow what the patient reports, what the physiotherapist asks, what the examination shows and why the management decision follows.
    </p>
    <div className="mt-4 flex flex-wrap items-center gap-x-4 gap-y-2 text-xs text-slate-500">
     <span className="inline-flex items-center gap-1.5"><Stethoscope className="h-4 w-4 text-teal-700"/> {story.category}</span>
     <span>Simulated teaching case</span>
     {story.urgent&&<span className="cl-case-urgent-label"><ShieldAlert className="h-3.5 w-3.5"/> Urgent safety decision</span>}
    </div>
   </header>

   {story.urgent&&<aside className="cl-case-safety-note mt-5" role="note">
    <ShieldAlert className="mt-0.5 h-5 w-5 shrink-0"/>
    <p><strong>Safety priority.</strong> This case includes a potential urgent referral decision. Do not delay escalation to complete routine testing or start routine physiotherapy when serious pathology is suspected.</p>
   </aside>}

   <article className="cl-case-narrative mt-6">
    <section aria-label="Patient arrival">
     <SectionTitle number="01" title="The patient arrives" caption="Start with the person's own words, not a diagnosis label."/>
     <div className="cl-case-opening">
      <p className="cl-case-speaker">PATIENT · {story.patient}</p>
      <blockquote>“{story.opening}”</blockquote>
      {story.openingUrdu&&<div className="mt-2"><RomanUrduHelp text={story.openingUrdu} compact/></div>}
     </div>
    </section>

    <section className="mt-8" aria-label="Clinical history">
     <SectionTitle number="02" title="The consultation" caption="A focused history helps the clinician understand symptoms, function and safety."/>
     {story.history.length>0?<div className="cl-case-dialogue">
      {story.history.map(([question,answer],index)=><div className="cl-case-dialogue-turn" key={index}>
       <div className="cl-case-doctor"><span>PHYSIOTHERAPIST</span><p>{question}</p></div>
       <div className="cl-case-patient"><span>PATIENT</span><p>{answer}</p></div>
      </div>)}
     </div>:<p className="text-sm leading-7 text-slate-600">The detailed question-and-answer history is not provided in this case record. Do not infer missing answers.</p>}
    </section>

    <section className="mt-8" aria-label="Physical examination">
     <SectionTitle number="03" title="Physical examination" caption="Only documented findings are shown; a test name alone is not a result."/>
     {story.examPrompt&&<p className="cl-case-clinician-note"><strong>Clinical question:</strong> {story.examPrompt}</p>}
     <BulletList items={story.findings}/>
     {story.examReason&&<p className="cl-case-interpretation"><strong>Why this examination matters:</strong> {story.examReason}</p>}
    </section>

    <section className="mt-8" aria-label="Clinical reasoning">
     <SectionTitle number="04" title="Clinical reasoning" caption="A working diagnosis must fit the history and findings—and remain open to revision."/>
     <div className="cl-case-working-diagnosis">
      <p className="cl-case-overline">WORKING IMPRESSION</p>
      <h2>{workingDiagnosis}</h2>
      <p>{story.diagnosisReason}</p>
     </div>
     {story.differentials.length>0&&<div className="mt-5">
      <h3 className="text-sm font-bold text-slate-900">What else should be considered?</h3>
      <div className="cl-case-differentials">
       {story.differentials.filter(item=>item.diagnosis!==workingDiagnosis).map((item,index)=><div className="cl-case-differential" key={item.diagnosis+"-"+index}>
        <h4>{item.diagnosis}</h4><p>{item.reasoning}</p>
       </div>)}
      </div>
     </div>}
    </section>

    <section className="mt-8" aria-label="Management decision">
     <SectionTitle number="05" title={story.urgent?"The referral decision":"Management decision"} caption="The plan must follow the evidence, safety screen and patient's functional goals."/>
     <BulletList items={story.management}/>
     {story.urgent&&<p className="cl-case-interpretation"><strong>Do not substitute routine treatment for escalation.</strong> Use the appropriate local urgent or emergency pathway and document the handover.</p>}
    </section>

    <section className="mt-8" aria-label="Follow-up and reassessment">
     <SectionTitle number="06" title="Follow-up and reassessment" caption="Record what will be checked; do not invent an outcome that was never documented."/>
     <BulletList items={story.progression}/>
     <p className="cl-case-interpretation"><strong>Outcome status:</strong> {story.progression.length?"A follow-up plan is described in the teaching record; no measured recovery outcome is assumed here.":"No follow-up information is supplied in this case record."}</p>
    </section>

    {story.learning.length>0&&<section className="mt-8" aria-label="Clinical takeaways">
     <SectionTitle number="07" title="What this case teaches"/>
     <BulletList items={story.learning}/>
    </section>}

    <GuideDetails story={story}/>

    <section className="mt-7 border-t border-slate-200 pt-5" aria-label="Evidence and references">
     <h2 id="case-references" className="text-base font-bold text-slate-900">Evidence and references</h2>
     {story.references.length>0?<ol className="mt-3 space-y-2">
      {story.references.map((reference,index)=><li key={reference.url+"-"+index} className="text-sm leading-6 text-slate-600">
       <span>{reference.title}</span>{reference.organization&&<span> · {reference.organization}</span>}{reference.year&&<span> · {reference.year}</span>}
       {" "}<a href={reference.url} target="_blank" rel="noopener noreferrer" className="font-semibold text-teal-800 underline underline-offset-4">Open source</a>
      </li>)}
     </ol>:<p className="mt-2 text-sm leading-6 text-slate-500">This case record does not currently include case-specific references. Do not treat that as evidence verification; consult current clinical guidelines and a qualified supervisor before applying recommendations.</p>}
    </section>
   </article>

   <footer className="mt-8 border-t border-slate-200 pt-4 text-xs leading-6 text-slate-500">
    Educational simulation only—not a real patient's record or a substitute for clinical assessment, supervision or local referral protocols. Findings and outcomes are not added when the source case does not document them.
   </footer>
  </div>
 </main>;
}
