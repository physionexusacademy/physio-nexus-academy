"use client";

import {useCallback,useEffect,useState} from "react";
import Link from "next/link";
import {ArrowLeft,ArrowRight,Crown,Medal,RefreshCw,Trophy,Users} from "lucide-react";

type Period="today"|"month"|"year";
type RankRow={place:number;name:string;points:number;challenges:number};
type Props={compact?:boolean;initialPeriod?:Period;title?:string;preview?:boolean};
function labelPeriod(period:Period,anchor:string){
 if(period==="today")return "Today's ranking";
 if(!anchor)return period==="month"?"Monthly champions":"Yearly champions";
 const d=new Date(anchor+"T12:00:00Z");
 return period==="month"
  ?d.toLocaleDateString("en-GB",{month:"long",year:"numeric",timeZone:"UTC"})
  :d.toLocaleDateString("en-GB",{year:"numeric",timeZone:"UTC"});
}
function changeAnchor(anchor:string,period:Period,delta:number){
 const d=new Date(anchor+"T12:00:00Z");
 d.setUTCDate(1);
 if(period==="month")d.setUTCMonth(d.getUTCMonth()+delta);
 else d.setUTCFullYear(d.getUTCFullYear()+delta);
 return d.toISOString().slice(0,10);
}
export function DailyLeaderboard({compact=false,initialPeriod="today",title,preview=false}:Props){
 const [period,setPeriod]=useState<Period>(initialPeriod);
 const [anchor,setAnchor]=useState("");
 const [latestDate,setLatestDate]=useState("");
 const [rows,setRows]=useState<RankRow[]>([]);
 const [page,setPage]=useState(0);
 const [hasMore,setHasMore]=useState(false);
 const [loading,setLoading]=useState(true);
 const [error,setError]=useState("");
 const size=compact||preview?5:30;
 const load=useCallback(async(signal?:AbortSignal)=>{
  try{
   const query=new URLSearchParams({period,limit:String(size+1),offset:String(page*size)});
   if(anchor&&period!=="today")query.set("anchor",anchor);
   const response=await fetch("/api/daily-challenge/leaderboard?"+query.toString(),{cache:"no-store",signal});
   if(!response.ok)throw new Error("Could not load leaderboard.");
   const data=await response.json() as {rows:RankRow[];challengeDate:string;anchor:string};
   if(signal?.aborted)return;
   setLatestDate(data.challengeDate);
   setRows(data.rows.slice(0,size));
   setHasMore(data.rows.length>size);
   setError("");
  }catch(e){
   if(signal?.aborted)return;
   setError("Leaderboard is temporarily unavailable. Please refresh shortly.");
  }finally{if(!signal?.aborted)setLoading(false)}
 },[period,anchor,page,size]);
 useEffect(()=>{
  const c=new AbortController();
  setLoading(true);
  void load(c.signal);
  const timer=window.setInterval(()=>void load(c.signal),300000);
  const onScore=()=>void load(c.signal);
  window.addEventListener("pna-daily-score-saved",onScore);
  return()=>{c.abort();window.clearInterval(timer);window.removeEventListener("pna-daily-score-saved",onScore)}
 },[load]);
 const chosen=anchor||latestDate;
 const canNext=!!chosen&&changeAnchor(chosen,period,1).slice(0,period==="month"?7:4)<=latestDate.slice(0,period==="month"?7:4);
 function switchPeriod(next:Period){setPeriod(next);setAnchor("");setPage(0)}
 function shift(delta:number){if(chosen){setAnchor(changeAnchor(chosen,period,delta));setPage(0)}}
 return <section className={"dc-board "+(compact?"dc-board-compact":"")} aria-label="PNA public challenge leaderboard">
  <div className="dc-board-title">
   <div className="flex items-center gap-3">
    <span className="dc-hero-icon"><Trophy className="h-5 w-5"/></span>
    <div><p className="dc-eyebrow">{preview?"HALL OF FAME":compact?"LIVE LEADERBOARD":"PNA CHAMPIONS LEAGUE"}</p>
     <h2 className="font-serif text-xl font-bold text-[#163446] sm:text-2xl">{title||"Clinical champions"}</h2>
    </div>
   </div>
   <span className="dc-live"><span className="dc-live-dot"/> Live standings</span>
  </div>
  {!compact&&!preview&&<div className="dc-tabs" role="group" aria-label="Leaderboard time period">
   {(["today","month","year"] as Period[]).map(item=><button key={item} type="button" aria-pressed={period===item}
    onClick={()=>switchPeriod(item)} className={"dc-tab "+(period===item?"dc-tab-active":"")}>
    {item==="today"?"Today":item==="month"?"This month":"This year"}
   </button>)}
  </div>}
  <div className="dc-board-period">
   <div>
    <p className="text-sm font-bold text-[#25465a]">{labelPeriod(period,chosen)}</p>
    <p className="mt-1 text-xs text-slate-500">{period==="today"?"Resets nightly at 12:00 AM PKT":"Total points earned from daily challenges in this period"}</p>
   </div>
   {!compact&&period!=="today"&&<div className="flex items-center gap-1">
    <button type="button" onClick={()=>shift(-1)} className="dc-nav-btn" aria-label="Previous period"><ArrowLeft className="h-4 w-4"/></button>
    <button type="button" disabled={!canNext} onClick={()=>shift(1)} className="dc-nav-btn" aria-label="Next period"><ArrowRight className="h-4 w-4"/></button>
   </div>}
  </div>
  <div className="dc-table-wrap">
   <table className="dc-table">
    <thead><tr><th scope="col">Rank</th><th scope="col">Participant</th><th scope="col" className="text-right">Points</th>{!compact&&<th scope="col" className="text-right">Days</th>}</tr></thead>
    <tbody>
     {rows.map(row=><tr key={row.place} className={row.place===1?"dc-champion":""}>
      <td><span className={"dc-rank "+(row.place<=3?"dc-rank-medal":"")}>{row.place<=3?<Medal className="h-4 w-4"/>:row.place}</span></td>
      <td><span className="font-semibold text-[#214153]">{row.name}</span>{row.place===1&&<Crown className="ml-1.5 inline h-3.5 w-3.5 text-teal-700"/>}</td>
      <td className="text-right font-bold tabular-nums text-teal-800">{row.points}</td>
      {!compact&&<td className="text-right tabular-nums text-slate-500">{row.challenges}</td>}
     </tr>)}
     {!loading&&rows.length===0&&!error&&<tr><td colSpan={compact?3:4} className="py-8 text-center text-sm text-slate-500">
      <Users className="mx-auto mb-2 h-6 w-6 text-teal-600"/>No scores yet for this period. The first champion could be you!
     </td></tr>}
    </tbody>
   </table>
   {loading&&rows.length===0&&<p className="py-6 text-center text-sm text-slate-500">Loading the leaderboard…</p>}
   {error&&<p role="status" className="px-4 py-4 text-sm text-red-700">{error}</p>}
  </div>
  {compact?<Link href="/daily-challenge#full-leaderboard" className="dc-board-action">
   View all scores and Hall of Fame <ArrowRight className="h-4 w-4"/>
  </Link>:!preview&&<div className="flex items-center justify-between gap-3 border-t border-slate-100 p-4">
   <span className="text-xs text-slate-500">Showing {rows.length? page*size+1:0}–{page*size+rows.length} participants</span>
   <div className="flex items-center gap-2">
    <button type="button" disabled={page===0} onClick={()=>setPage(v=>Math.max(0,v-1))} className="dc-page-btn">Previous</button>
    <button type="button" disabled={!hasMore} onClick={()=>setPage(v=>v+1)} className="dc-page-btn">Next</button>
   </div>
  </div>}
 </section>;
}
export function DailyHallOfFame(){
 return <section className="mt-8" id="hall-of-fame">
  <div className="mb-4"><p className="dc-eyebrow">THE RECORD BOOK</p>
   <h2 className="font-serif text-2xl font-bold text-[#163446] sm:text-3xl">Hall of Fame</h2>
   <p className="mt-2 text-sm leading-7 text-slate-600">Current monthly and annual Top 5, plus previous periods using the arrows. All scores are accumulated from daily submissions.</p>
  </div>
  <div className="grid gap-5 lg:grid-cols-2">
   <DailyLeaderboard preview initialPeriod="month" title="Monthly Top 5"/>
   <DailyLeaderboard preview initialPeriod="year" title="Yearly Top 5"/>
  </div>
 </section>
}
