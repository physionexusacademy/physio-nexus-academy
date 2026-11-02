import type {Metadata} from "next";
import Link from "next/link";
import {ArrowLeft,ArrowRight,BookOpen,CalendarClock,BarChart3,CheckCircle2,Flame,ShieldCheck,Sparkles,Trophy} from "lucide-react";
import {DailyChallengeClient} from "./DailyChallengeClient";
import { UnifiedProgressCard } from "@/components/learning/UnifiedProgressCard";
import {DailyHallOfFame,DailyLeaderboard} from "@/components/daily-challenge/DailyLeaderboard";
import "./daily-challenge.css";

export const dynamic="force-dynamic";
export const revalidate=0;
export const metadata:Metadata={
 title:"Daily Clinical Challenge | PNA Champions Leaderboard",
 description:"Return every day for five clinical knowledge questions, compete for a public ranking, and explore monthly and yearly physiotherapy champions.",
 alternates:{canonical:"https://physionexusacademy.com/daily-challenge"}
};
export default function DailyChallengePage(){
 return <main className="dc-page">
  <div className="container-content py-7 sm:py-10">
   <nav aria-label="Breadcrumb" className="flex flex-wrap items-center gap-2 text-xs font-semibold text-slate-500">
    <Link href="/knowledge-hub" className="inline-flex items-center gap-1 text-teal-800 hover:underline"><ArrowLeft className="h-4 w-4"/> Knowledge Hub</Link>
    <span aria-hidden="true">/</span><span>Daily Clinical Challenge</span>
   </nav>
   <header className="dc-hero mt-6 p-6 sm:p-9">
    <div className="relative max-w-4xl">
     <span className="dc-hero-logo"><Flame className="h-4 w-4"/> PNA DAILY CLINICAL CHALLENGE</span>
     <h1 className="dc-hero-heading mt-5">A new mission every day.<br/><span>A new chance to lead.</span></h1>
     <p className="mt-5 max-w-2xl text-sm leading-8 text-slate-600 sm:text-base">
      Five practical physiotherapy questions. One attempt each day.
      Earn up to 100 points, challenge your clinical knowledge and see how you rank against other PNA learners.
     </p>
     <div className="dc-hero-banner mt-6">
      <span className="dc-hero-chip"><CalendarClock className="h-5 w-5"/> New quiz at 12:00 AM PKT</span>
      <span className="dc-hero-chip"><Trophy className="h-5 w-5"/> All scores visible</span>
      <span className="dc-hero-chip"><BarChart3 className="h-5 w-5"/> Monthly & yearly champions</span>
     </div>
    </div>
   </header>
   <UnifiedProgressCard />
   <section className="mt-6 grid items-start gap-5 xl:grid-cols-[minmax(0,1.35fr)_minmax(340px,.8fr)]">
    <div id="play-daily"><DailyChallengeClient/></div>
    <div id="full-leaderboard" className="scroll-mt-28"><DailyLeaderboard title="Public leaderboard"/></div>
   </section>
   <DailyHallOfFame/>
   <section className="mt-8 grid gap-4 md:grid-cols-3">
    {[
      {icon:BookOpen,title:"Learn while you compete",text:"After the submission, get explanations for every question and continue learning through PNA Knowledge Hub."},
      {icon:ShieldCheck,title:"A fairer challenge",text:"One attempt per Gmail per day. Questions are scored on the server; the 30-second timer applies to each question. Identity verification is not yet enabled."},
      {icon:Sparkles,title:"Your score lives on",text:"Every midnight brings a fresh set. Today's ranking resets, but monthly and yearly totals remain, and previous periods can be viewed."}
    ].map(item=><div key={item.title} className="rounded-2xl border border-[#dbece7] bg-white p-5">
     <item.icon className="h-5 w-5 text-teal-700"/>
     <h2 className="mt-3 text-sm font-bold text-[#193e50]">{item.title}</h2>
     <p className="mt-2 text-sm leading-7 text-slate-600">{item.text}</p>
    </div>)}
   </section>
   <section className="mt-8 rounded-2xl border border-[#dbece7] bg-[#f4faf8] p-5 sm:p-6">
    <div className="flex flex-wrap items-start justify-between gap-4">
     <div className="max-w-2xl">
      <h2 className="font-serif text-xl font-bold text-[#193d4d]">Knowledge earns the points. Practice builds the skill.</h2>
      <p className="mt-2 text-sm leading-7 text-slate-600">
       Today's competition is a learning activity, not professional certification or a substitute for patient assessment.
       The public leaderboard shows opted-in display names and scores, never email addresses.
      </p>
     </div>
     <Link className="dc-secondary" href="/knowledge-hub">Explore learning topics <ArrowRight className="h-4 w-4"/></Link>
    </div>
   </section>
   <p className="dc-footnote mt-7 text-center">Challenge dates follow Pakistan Standard Time (Asia/Karachi). Scores are retained for historical rankings. If a challenge is started near midnight, it must finish before that day's cutoff.</p>
  </div>
 </main>;
}
