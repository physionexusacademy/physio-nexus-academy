"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { ArrowRight, BrainCircuit, CheckCircle2, RotateCcw, ShieldAlert, Sparkles, Trophy } from "lucide-react";

type Case = { id:string; specialty:string; title:string; patient:string; history:string; findings:string[]; question:string; options:string[]; correct:number; explanation:string; clue:string; safety?:boolean };
const cases: Case[] = [
{id:"shoulder-01",specialty:"MSK & Orthopedic",title:"The Frozen Shoulder Mystery",patient:"52-year-old man",history:"Progressive shoulder pain and stiffness for four months, without major trauma. Difficulty dressing and reaching behind the back.",findings:["Active AND passive glenohumeral movements are restricted.","External rotation is particularly limited.","No obvious focal neurological deficit."],question:"What is the most likely working diagnosis?",options:["Rotator cuff-related shoulder pain","Adhesive capsulitis","Cervical radiculopathy","Acromioclavicular sprain"],correct:1,explanation:"Progressive loss of both active and passive shoulder movement, especially external rotation, is characteristic of adhesive capsulitis. Consider glenohumeral osteoarthritis and other causes of a stiff shoulder; imaging and further assessment may be appropriate when indicated.",clue:"Compare active and passive ROM, not pain alone."},
{id:"knee-01",specialty:"Sports Injuries",title:"The Pivot-and-Pop Case",patient:"24-year-old football player",history:"Twisted his knee while cutting, heard a pop and developed marked swelling within hours. Reports giving way during pivoting.",findings:["Early joint effusion.","Lachman test shows increased anterior translation and soft endpoint.","No fracture identified on initial radiographs."],question:"Which injury is most strongly suggested?",options:["Iliotibial band syndrome","Patellofemoral pain","Anterior cruciate ligament injury","Isolated pes anserine tendinopathy"],correct:2,explanation:"Pivoting mechanism, pop, rapid effusion and positive Lachman test strongly suggest ACL injury. Associated meniscal or other ligament injuries are possible and merit appropriate assessment.",clue:"The injury mechanism and Lachman findings matter together."},
{id:"hand-01",specialty:"MSK & Orthopedic",title:"The Night-Time Numbness",patient:"46-year-old office worker",history:"Night-time tingling in thumb, index and middle fingers, sometimes eased by shaking the hand.",findings:["Median nerve distribution of symptoms.","Possible thumb abduction weakness.","Wrist flexion reproduces symptoms."],question:"What is the most likely diagnosis?",options:["Ulnar neuropathy at elbow","Carpal tunnel syndrome","De Quervain tenosynovitis","Lateral epicondylalgia"],correct:1,explanation:"Median-distribution nocturnal paresthesia and possible thenar weakness suggest carpal tunnel syndrome. No single provocative test confirms it; assess history, sensation, strength and possible alternative causes.",clue:"Identify the nerve territory."},
{id:"back-01",specialty:"MSK & Orthopedic",title:"The Directional Preference",patient:"35-year-old warehouse worker",history:"Low back pain with intermittent pain extending into the buttock after lifting. Repeated movement testing is performed.",findings:["Repeated lumbar extension centralizes the buttock pain toward the lower back.","No progressive neurological deficit.","No red flags on screening."],question:"Which clinical finding is demonstrated?",options:["Peripheralization","Centralization","Cauda equina syndrome","A positive Trendelenburg sign"],correct:1,explanation:"Centralization means distal symptoms retreat proximally toward the spine during repeated movement or positioning. It can help guide classification and exercise direction, but does not independently identify a specific anatomical lesion.",clue:"Symptoms move toward the spine."},
{id:"ankle-01",specialty:"Sports Injuries",title:"The Inversion Injury",patient:"21-year-old basketball player",history:"Rolled ankle into inversion and plantarflexion on landing. Lateral ankle swelling and tenderness.",findings:["Tenderness over anterior talofibular ligament region.","Pain with inversion stress.","No neurovascular compromise."],question:"Which ligament is most commonly injured with this mechanism?",options:["Deltoid ligament","Anterior talofibular ligament","Posterior talofibular ligament","Spring ligament"],correct:1,explanation:"The ATFL is commonly injured during plantarflexion-inversion ankle sprains. Screen for fracture using appropriate decision rules and assess syndesmosis or other injuries when indicated.",clue:"Think lateral ankle anatomy and plantarflexion."},
{id:"hip-01",specialty:"MSK & Orthopedic",title:"The Lateral Hip Pain",patient:"49-year-old woman",history:"Gradual lateral hip pain, worse when lying on the affected side and climbing stairs.",findings:["Focal tenderness over greater trochanter.","Pain with resisted hip abduction.","No significant groin-dominant pain."],question:"What is the most likely clinical syndrome?",options:["Greater trochanteric pain syndrome","Femoral neck fracture","Hip osteoarthritis as the only possibility","Lumbar spinal stenosis"],correct:0,explanation:"Lateral hip pain, trochanteric tenderness and pain with abductor loading are consistent with greater trochanteric pain syndrome, often involving gluteal tendons. Examine hip and lumbar contributions and relevant red flags.",clue:"Pain location plus tendon loading is useful."},
{id:"neck-01",specialty:"MSK & Orthopedic",title:"Neck Pain Into the Arm",patient:"41-year-old man",history:"Neck pain radiates into the right arm with tingling. Symptoms increase with certain neck positions.",findings:["Reduced sensation in a dermatomal pattern.","Myotomal weakness on examination.","Symptoms reproduced by a compatible cervical provocation maneuver."],question:"Which condition is most consistent with the pattern?",options:["Isolated upper trapezius soreness","Cervical radiculopathy","Adhesive capsulitis","Carpal tunnel syndrome only"],correct:1,explanation:"Radiating arm symptoms with corresponding sensory and motor findings support cervical radiculopathy. Assess reflexes, progressive weakness, myelopathy signs and other neurological or peripheral nerve causes.",clue:"Look for matching neurological deficits."},
{id:"safety-01",specialty:"MSK & Orthopedic",title:"The Urgent Back Pain Case",patient:"57-year-old man",history:"Severe new low back pain with bilateral leg symptoms and new difficulty urinating.",findings:["Altered saddle-area sensation.","New bladder dysfunction.","Bilateral neurological symptoms."],question:"What is the most appropriate immediate action?",options:["Start routine lumbar stretching","Provide massage and review next week","Urgent emergency assessment for possible cauda equina syndrome","Reassure and discharge without further action"],correct:2,explanation:"New bladder dysfunction and saddle sensory disturbance with back/leg symptoms are red flags for possible cauda equina syndrome. Arrange immediate emergency evaluation. Do not delay referral for routine treatment.",clue:"Recognize neurological emergency red flags.",safety:true}
];
const positive = [
"Clinical reasoning just got promoted to consultant! 😂",
"Even the textbook said: okay, this one knows the assignment. 🧠",
"Sherlock Holmes called. He wants his diagnostic skills back! 🔍",
"Excellent! Your neurons finally formed a multidisciplinary team. 😎",
"Evidence-based practice is giving you a standing ovation. 👏",
"Your differential list just gave you a high five. 🏆",
"That was cleaner than a freshly documented SOAP note! ✨",
"Diagnosis secured. The examiner can put the red pen away! 😂"
];
const roast = [
"Doctor, your confidence is consultant-level; the diagnosis is still on internship! 😂",
"That answer took a wrong turn before the clinical round even started. 🧭",
"The patient gave you clues, not a lucky-draw ticket! 🎟️",
"Your neurons held a meeting, but nobody read the agenda. 🧠",
"The differential diagnosis list is requesting a second opinion on you! 😭",
"Clinical reasoning has left the chat. Please invite it back. 😂",
"Even the goniometer is asking you to measure your reasoning first! 📐",
"That diagnosis traveled farther than the patient's symptoms. 🌍",
"The textbook saw your answer and quietly closed itself. 📚",
"Your assessment was good; the conclusion went on an unscheduled holiday. 🏖️",
"Doctor, this isn't MCQ roulette. Follow the clinical clues! 🎯",
"That was a bold choice. The evidence would like a word. 😅"
];
function pick(pool:string[],used:string[]):string {
 const available=pool.filter(v=>!used.includes(v));
 return (available.length?available:pool)[Math.floor(Math.random()*(available.length?available:pool).length)];
}
export default function ClinicalArenaPage(){
 const [specialty,setSpecialty]=useState("All specialties");
 const [position,setPosition]=useState(0);
 const [selected,setSelected]=useState<number|null>(null);
 const [revealed,setRevealed]=useState(false);
 const [line,setLine]=useState("");
 const [seen,setSeen]=useState<string[]>([]);
 const [correctCount,setCorrectCount]=useState(0);
 const [finished,setFinished]=useState(false);
 const specialties=["All specialties",...Array.from(new Set(cases.map(c=>c.specialty)))];
 const filtered=useMemo(()=>cases.filter(c=>specialty==="All specialties"||c.specialty===specialty),[specialty]);
 const item=filtered[position];
 function reset(next:string){setSpecialty(next);setPosition(0);setSelected(null);setRevealed(false);setLine("");setCorrectCount(0);setFinished(false);}
 function submit(){
  if(selected===null||revealed)return;
  const ok=selected===item.correct;
  const bank=item.safety?[]:ok?positive:roast;
  const chosen=item.safety?(ok?"Correct. You recognized an urgent safety concern.":"Safety alert: This presentation needs urgent emergency evaluation, not routine treatment."):pick(bank,seen);
  setLine(chosen);setSeen(v=>[...v,chosen]);setRevealed(true);
  if(ok)setCorrectCount(v=>v+1);
 }
 function next(){if(position+1>=filtered.length){setFinished(true)}else{setPosition(v=>v+1);setSelected(null);setRevealed(false);setLine("");}}
 return <div className="min-h-screen bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950 py-12 text-white">
 <div className="container-content max-w-4xl">
 <Link href="/" className="text-sm text-teal-300 hover:text-teal-200">← Back to PNA</Link>
 <div className="mt-7 rounded-3xl border border-teal-400/20 bg-gradient-to-br from-slate-800 to-slate-900 p-6 shadow-2xl sm:p-9">
 <div className="flex flex-wrap items-center gap-2 text-xs font-bold uppercase tracking-widest text-teal-300"><BrainCircuit className="h-5 w-5"/> Physio Nexus Academy <span className="rounded-full bg-teal-400/10 px-3 py-1">Clinical Challenge Arena · Beta</span></div>
 <h1 className="mt-4 text-3xl font-extrabold sm:text-4xl">Think like a clinician. Get roasted like a student. 😂</h1>
 <p className="mt-3 text-slate-300">Realistic educational cases, instant reasoning feedback and friendly roasts when your diagnosis goes on vacation.</p>
 <div className="mt-6 flex flex-wrap items-center gap-3">
 <label htmlFor="specialty" className="text-sm font-semibold">Specialty</label>
 <select id="specialty" value={specialty} onChange={e=>reset(e.target.value)} className="max-w-full rounded-xl border border-slate-600 bg-slate-800 px-4 py-3 text-sm text-white">{specialties.map(s=><option key={s} value={s}>{s}</option>)}</select>
 <span className="text-xs text-slate-400">{filtered.length} reviewed starter cases · more coming</span>
 </div>
 </div>
 <div className="mt-6 rounded-3xl border border-slate-700 bg-white p-6 text-slate-900 shadow-xl sm:p-9">
 {!finished&&item?<div>
 <div className="flex items-center justify-between gap-3 text-sm font-semibold"><span className="text-teal-700">Case {position+1} / {filtered.length}</span><span className="flex items-center gap-1 text-slate-600"><Trophy className="h-4 w-4"/> {correctCount} correct</span></div>
 <div className="mt-4 h-2 overflow-hidden rounded-full bg-slate-100"><div className="h-full rounded-full bg-teal-600 transition-all" style={{width:((position+1)/filtered.length*100)+"%"}}/></div>
 <div className="mt-7 flex flex-wrap items-center gap-2"><span className="rounded-full bg-teal-50 px-3 py-1 text-xs font-bold text-teal-700">{item.specialty}</span>{item.safety&&<span className="flex items-center gap-1 rounded-full bg-amber-50 px-3 py-1 text-xs font-bold text-amber-800"><ShieldAlert className="h-4 w-4"/> Safety case</span>}</div>
 <h2 className="mt-3 text-2xl font-bold">{item.title}</h2>
 <div className="mt-5 space-y-4 rounded-2xl bg-slate-50 p-5">
 <div><div className="text-xs font-bold uppercase tracking-wide text-slate-500">Patient</div><p className="mt-1 font-semibold">{item.patient}</p></div>
 <div><div className="text-xs font-bold uppercase tracking-wide text-slate-500">History</div><p className="mt-1 text-sm leading-7">{item.history}</p></div>
 <div><div className="text-xs font-bold uppercase tracking-wide text-slate-500">Examination findings</div><ul className="mt-2 list-disc space-y-2 pl-5 text-sm leading-6">{item.findings.map(f=><li key={f}>{f}</li>)}</ul></div>
 </div>
 <h3 className="mt-7 text-lg font-bold">{item.question}</h3>
 <div className="mt-4 grid gap-3">{item.options.map((o,i)=><button key={o} disabled={revealed} onClick={()=>setSelected(i)} aria-pressed={selected===i} className={"rounded-xl border p-4 text-left text-sm font-medium transition focus-visible:outline focus-visible:outline-2 focus-visible:outline-teal-500 "+(selected===i?"border-teal-600 bg-teal-50 text-teal-950":"border-slate-200 bg-white hover:border-teal-400")}>{String.fromCharCode(65+i)}. {o}</button>)}</div>
 {!revealed?<button onClick={submit} disabled={selected===null} className="mt-6 flex w-full items-center justify-center gap-2 rounded-xl bg-teal-700 px-5 py-4 font-bold text-white hover:bg-teal-800 disabled:cursor-not-allowed disabled:opacity-50">Check my answer <ArrowRight className="h-5 w-5"/></button>:<div aria-live="polite" className="mt-6 space-y-4">
 <div className={"rounded-2xl border p-5 "+(selected===item.correct?"border-emerald-200 bg-emerald-50":"border-amber-200 bg-amber-50")}>
 <div className="flex items-center gap-2 font-bold">{selected===item.correct?<CheckCircle2 className="h-5 w-5 text-emerald-700"/>:<Sparkles className="h-5 w-5 text-amber-700"/>}{selected===item.correct?"Correct!":"Not quite — here's the clinical clue"}</div>
 <p className="mt-3 font-semibold">{line}</p>
 <p className="mt-4 text-sm"><strong>Best answer:</strong> {item.options[item.correct]}</p>
 <p className="mt-3 text-sm leading-7"><strong>Why:</strong> {item.explanation}</p>
 <p className="mt-3 rounded-lg bg-white/70 p-3 text-sm"><strong>Remember:</strong> {item.clue}</p>
 </div>
 <button onClick={next} className="flex w-full items-center justify-center gap-2 rounded-xl bg-slate-900 px-5 py-4 font-bold text-white hover:bg-slate-800">{position+1===filtered.length?"View results":"Next case"} <ArrowRight className="h-5 w-5"/></button>
 </div>}
 </div>:<div className="py-12 text-center"><Trophy className="mx-auto h-14 w-14 text-amber-500"/><h2 className="mt-4 text-3xl font-bold">Round complete!</h2><p className="mt-3 text-xl font-semibold">{correctCount} / {filtered.length} correct</p><p className="mt-3 text-slate-600">Great effort. Revisit the reasoning, not just the answer.</p><button onClick={()=>reset(specialty)} className="mt-6 inline-flex items-center gap-2 rounded-xl bg-teal-700 px-6 py-3 font-semibold text-white"><RotateCcw className="h-4 w-4"/> Play again</button></div>}
 </div>
 <p className="mt-5 text-center text-xs leading-6 text-slate-400">For physiotherapy education only. Cases are simplified and do not replace patient assessment, clinical judgment, or emergency referral. Roast lines avoid serious safety cases. No account or AI calls required.</p>
 </div></div>;
}
