"use client";
import {FormEvent,useCallback,useEffect,useRef,useState} from "react";
import Link from "next/link";
import {ArrowRight,BookOpen,CheckCircle2,ChevronDown,Clock3,Flame,LockKeyhole,Play,RotateCcw,ShieldCheck,Sparkles,Timer,Trophy} from "lucide-react";
import {startDailyChallenge,submitDailyChallenge} from "./actions";

type PublicQuestion={id:string;topic:string;question:string;options:{value:string;label:string}[]};
type ActiveChallenge={attemptId:string;token:string;date:string;expiresAt:string;resetAt:string;questions:PublicQuestion[];timePerQuestionSeconds:number};
type Completed={expired:boolean;score:number;correctCount:number;total:number;elapsedMs:number;explanations:{id:string;correctValue:string;explanation:string}[]};
const motivational=[
 "Clinical reasoning activated. The diagnosis is in the details.",
 "Nice work. The best clinicians are curious, not just quick.",
 "You've completed today's learning mission. Come back tomorrow for a new challenge."
];
export function DailyChallengeClient(){
 const [name,setName]=useState("");
 const [email,setEmail]=useState("");
 const [consent,setConsent]=useState(false);
 const [active,setActive]=useState<ActiveChallenge|null>(null);
 const [step,setStep]=useState(0);
 const [selected,setSelected]=useState<Record<string,string>>({});
 const answersRef=useRef<Record<string,string>>({});
 const [deadline,setDeadline]=useState(0);
 const [seconds,setSeconds]=useState(30);
 const [result,setResult]=useState<Completed|null>(null);
 const [loading,setLoading]=useState(false);
 const [error,setError]=useState("");
 const [reviewOpen,setReviewOpen]=useState(false);
 const inFlight=useRef(false);
 const current=active?.questions[step];
 useEffect(()=>{
  if(!active)return;
  const interval=window.setInterval(()=>{
   const parts=new Intl.DateTimeFormat("en-US",{timeZone:"Asia/Karachi",year:"numeric",month:"2-digit",day:"2-digit"}).formatToParts(new Date());
   const get=(type:string)=>parts.find(x=>x.type===type)?.value||"";
   const today=get("year")+"-"+get("month")+"-"+get("day");
   if(today!==active.date&&result){
    setActive(null);setResult(null);setSelected({});answersRef.current={};
    setError("A new daily challenge has arrived! You can enter again.");
   }
  },5000);
  return()=>window.clearInterval(interval);
 },[active,result]);
 const finish=useCallback(async()=>{
  if(!active||inFlight.current)return;
  inFlight.current=true;
  setLoading(true);setError("");
  try{
   const saved=await submitDailyChallenge({
    attemptId:active.attemptId,token:active.token,answers:answersRef.current
   });
   setResult(saved);
   window.dispatchEvent(new Event("pna-daily-score-saved"));
  }catch{
   setError("Your attempt couldn't be saved. Please check your connection and contact PNA if this continues.");
  }finally{setLoading(false);inFlight.current=false;}
 },[active]);
 const advance=useCallback(async()=>{
  if(!active||inFlight.current||result)return;
  if(step===active.questions.length-1){
   await finish();
  }else{
   setStep(v=>v+1);
   const next=Date.now()+active.timePerQuestionSeconds*1000;
   setDeadline(Math.min(next,Date.parse(active.expiresAt)));
   setSeconds(active.timePerQuestionSeconds);
  }
 },[active,step,result,finish]);
 const advancing=useRef(false);
 useEffect(()=>{
  if(!active||result||!deadline)return;
  const timer=window.setInterval(()=>{
   const left=Math.max(0,Math.ceil((deadline-Date.now())/1000));
   setSeconds(left);
   if(left===0&&!advancing.current){
    advancing.current=true;
    void advance().finally(()=>{advancing.current=false});
   }
  },200);
  return()=>window.clearInterval(timer);
 },[active,deadline,result,advance]);
 async function start(e:FormEvent<HTMLFormElement>){
  e.preventDefault();
  if(loading)return;
  setError("");setLoading(true);
  try{
   const outcome=await startDailyChallenge({fullName:name,email,consent});
   if(!outcome.ok){setError(outcome.error);return;}
   const session=outcome.challenge;
   setActive(session);setStep(0);setSelected({});answersRef.current={};
   setResult(null);
   setError("");
   setDeadline(Math.min(Date.now()+session.timePerQuestionSeconds*1000,Date.parse(session.expiresAt)));
   setSeconds(session.timePerQuestionSeconds);
  }catch{setError("Could not begin the challenge. Please try again.");}
  finally{setLoading(false)}
 }
 function pick(value:string){
  if(!current||loading||result||seconds<=0)return;
  const newAnswers={...answersRef.current,[current.id]:value};
  answersRef.current=newAnswers;
  setSelected(newAnswers);
 }
 function replayReview(){setReviewOpen(v=>!v)}
 const currentSelection=current?selected[current.id]:undefined;
 return <div className="dc-play" data-pna-daily-challenge="v1">
  {!active?<div className="dc-onboarding">
   <div className="dc-mission-mast">
    <span className="dc-mission-stamp"><Flame className="h-4 w-4"/> A NEW MISSION EVERY DAY</span>
    <h2 className="mt-4 font-serif text-3xl font-bold leading-tight text-[#163446]">Five questions.<br/><span className="text-teal-700">One shot at the leaderboard.</span></h2>
    <p className="mt-4 max-w-xl text-sm leading-7 text-slate-600">Complete today's physiotherapy knowledge challenge. Each correct answer earns 20 points. Scores go straight to the public daily, monthly and yearly rankings.</p>
    <div className="mt-5 grid grid-cols-3 gap-2">
     {[{value:"05",text:"Questions",icon:BookOpen},{value:"30s",text:"Each question",icon:Clock3},{value:"100",text:"Max points",icon:Trophy}].map(item=>
      <div key={item.text} className="dc-mission-stat"><item.icon className="h-5 w-5 text-teal-700"/><strong>{item.value}</strong><span>{item.text}</span></div>)}
    </div>
   </div>
   <form onSubmit={start} className="dc-signup">
    <p className="dc-eyebrow"><Play className="mr-1 inline h-4 w-4"/> YOUR MISSION PASS</p>
    <h3 className="mt-2 text-lg font-bold text-[#163446]">Enter the Daily Challenge</h3>
    <label htmlFor="dc-name" className="dc-label">Leaderboard display name</label>
    <input id="dc-name" autoComplete="name" required minLength={2} maxLength={60} placeholder="Your full name" className="dc-input" value={name} onChange={e=>setName(e.target.value)}/>
    <label htmlFor="dc-email" className="dc-label">Gmail address</label>
    <input id="dc-email" autoComplete="email" type="email" required placeholder="you@gmail.com" className="dc-input" value={email} onChange={e=>setEmail(e.target.value)}/>
    <label className="mt-5 flex items-start gap-2 text-xs leading-6 text-slate-600">
     <input type="checkbox" required checked={consent} onChange={e=>setConsent(e.target.checked)} className="mt-1 h-4 w-4 accent-teal-700"/>
     <span>I agree to publish my display name, earned score and completed challenge count on the public leaderboard. My email will not appear publicly.</span>
    </label>
    <p className="mt-3 text-xs leading-6 text-slate-500"><LockKeyhole className="mr-1 inline h-3.5 w-3.5"/> One attempt per Gmail per day. Once started, your timer runs and the challenge cannot be restarted. Email ownership is not verified in this version.</p>
    {error&&<p role="alert" className="mt-3 rounded-lg bg-rose-50 p-3 text-sm text-rose-700">{error}</p>}
    <button type="submit" disabled={loading} className="dc-primary mt-5 w-full">
     {loading?"Preparing mission…":"START TODAY'S CHALLENGE"} <ArrowRight className="h-4 w-4"/>
    </button>
   </form>
  </div>:result?<div className="dc-result">
   <div className="dc-result-orbit"><Trophy className="h-10 w-10 text-teal-700"/></div>
   <p className="dc-eyebrow mt-5">MISSION {result.expired?"TIMED OUT":"COMPLETE"}</p>
   <h2 className="mt-2 font-serif text-3xl font-bold text-[#163446]">Your clinical score</h2>
   <div className="dc-score-number" aria-live="polite">{result.score}<span>/100</span></div>
   <p className="text-sm font-semibold text-[#274c60]">{result.correctCount} of {result.total} questions correct</p>
   <p className="mx-auto mt-3 max-w-md text-sm leading-7 text-slate-600">{result.expired?"The challenge window expired, so today's competitive score is zero. You can still review the clinical explanations.":motivational[result.score>=80?2:result.score>=40?1:0]}</p>
   <div className="mt-6 flex flex-wrap justify-center gap-3">
    <button className="dc-primary" type="button" onClick={replayReview}>{reviewOpen?"Hide answers":"Review all answers"} <ChevronDown className="h-4 w-4"/></button>
    <a href="#full-leaderboard" className="dc-secondary">View my competition <Trophy className="h-4 w-4"/></a>
   </div>
   {reviewOpen&&<div className="mt-6 space-y-3 text-left">
    {active.questions.map((q,i)=>{
     const explanation=result.explanations.find(x=>x.id===q.id);
     const matched=selected[q.id]===explanation?.correctValue;
     return <div key={q.id} className="dc-review-item">
      <p className="mb-1 text-xs font-bold uppercase tracking-wider text-teal-800">QUESTION {i+1} · {matched?"ANSWERED CORRECTLY":"LEARNING OPPORTUNITY"}</p>
      <h3 className="text-sm font-bold leading-6 text-[#17384d]">{q.question}</h3>
      <p className="mt-2 text-sm leading-6 text-slate-600"><strong>Correct answer:</strong> {q.options.find(o=>o.value===explanation?.correctValue)?.label}</p>
      <p className="mt-2 text-sm leading-7 text-slate-600">{explanation?.explanation}</p>
     </div>;
    })}
   </div>}
   <p className="mt-6 text-xs text-slate-500">A fresh question set unlocks at midnight Pakistan time. Your monthly and yearly points are retained.</p>
   <Link className="mt-4 inline-flex items-center gap-2 text-sm font-bold text-teal-800 hover:underline" href="/knowledge-hub">Explore Knowledge Hub <ArrowRight className="h-4 w-4"/></Link>
  </div>:<div className="dc-question-panel">
   <div className="flex flex-wrap items-center justify-between gap-3">
    <span className="dc-mission-stamp"><Sparkles className="h-4 w-4"/> LIVE MISSION</span>
    <span className={"dc-timer "+(seconds<=8?"dc-timer-urgent":"")} aria-live="off"><Timer className="h-4 w-4"/> {seconds}s</span>
   </div>
   <div className="mt-5 flex gap-1.5" aria-label={"Question "+(step+1)+" of "+active.questions.length}>
    {active.questions.map((_,i)=><div key={i} className={"dc-progress-segment "+(i<=step?"dc-progress-on":"")}/>)}
   </div>
   <div className="mt-2 h-1 overflow-hidden rounded-full bg-slate-100"><div className="h-full rounded-full bg-teal-600 transition-[width] duration-200" style={{width:Math.max(0,seconds/active.timePerQuestionSeconds*100)+"%"}}/></div>
   <div className="mt-7">
    <p className="dc-eyebrow">QUESTION {String(step+1).padStart(2,"0")} / 05 · {current?.topic}</p>
    <h2 className="mt-3 font-serif text-2xl font-bold leading-snug text-[#163446] sm:text-3xl">{current?.question}</h2>
   </div>
   <div className="mt-7 space-y-3">
    {current?.options.map((option)=><button type="button" key={option.value} onClick={()=>pick(option.value)}
     className={"dc-option "+(currentSelection===option.value?"dc-option-selected":"")}>
     <span className="dc-option-letter">{option.value}</span>
     <span className="flex-1 text-left text-sm font-medium leading-6">{option.label}</span>
     {currentSelection===option.value&&<CheckCircle2 className="h-5 w-5 shrink-0 text-teal-700"/>}
    </button>)}
   </div>
   {error&&<p role="alert" className="mt-4 rounded-lg bg-rose-50 p-3 text-sm text-rose-700">{error}</p>}
   <div className="mt-7 flex flex-wrap items-center justify-between gap-3 border-t border-slate-100 pt-5">
    <p className="text-xs text-slate-500"><ShieldCheck className="mr-1 inline h-4 w-4 text-teal-700"/> Answer is locked after advancing.</p>
    <button className="dc-primary" type="button" disabled={loading} onClick={()=>void advance()}>
     {loading?"Saving score…":step===active.questions.length-1?"Finish mission":"Next question"} <ArrowRight className="h-4 w-4"/>
    </button>
   </div>
  </div>}
 </div>;
}
