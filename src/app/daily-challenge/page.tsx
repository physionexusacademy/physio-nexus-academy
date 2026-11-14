import type {Metadata} from "next";
import Link from "next/link";
import {ArrowLeft,ArrowRight,CalendarClock,BarChart3,Flame,Trophy} from "lucide-react";
import {DailyChallengeClient} from "./DailyChallengeClient";
import { UnifiedProgressCard } from "@/components/learning/UnifiedProgressCard";
import {DailyHallOfFame,DailyLeaderboard} from "@/components/daily-challenge/DailyLeaderboard";
import "./daily-challenge.css";

export const dynamic="force-dynamic";
export const revalidate=0;

export const metadata:Metadata={
 title:"Daily Clinical Challenge — Free Physiotherapy Quiz",
 description:"Take the free Daily Clinical Challenge: five physiotherapy questions a day, a live leaderboard and monthly champions from Physio Nexus Academy.",
 keywords:[
  "daily physiotherapy quiz",
  "physiotherapy clinical challenge",
  "physiotherapy quiz Pakistan",
  "clinical reasoning quiz",
  "physiotherapy leaderboard",
  "free physiotherapy quiz",
  "daily clinical challenge",
  "Physio Nexus Academy quiz",
  "physiotherapy knowledge test",
  "CPD physiotherapy quiz",
 ],
 alternates:{canonical:"https://physionexusacademy.com/daily-challenge"},
 openGraph:{
  title:"Daily Clinical Challenge — Free Physiotherapy Quiz | PNA",
  description:"Take the free Daily Clinical Challenge: five physiotherapy questions a day, a live leaderboard and monthly champions from Physio Nexus Academy.",
  url:"https://physionexusacademy.com/daily-challenge",
  siteName:"Physio Nexus Academy",
  locale:"en_PK",
  type:"website",
  images:[{url:"https://physionexusacademy.com/images/founder-dr-sajjad.jpg",width:1200,height:630,alt:"PNA Daily Clinical Challenge"}],
 },
 twitter:{
  card:"summary_large_image",
  title:"Daily Clinical Challenge — Free Physiotherapy Quiz | PNA",
  description:"Take the free Daily Clinical Challenge: five physiotherapy questions a day, a live leaderboard and monthly champions from Physio Nexus Academy.",
  images:["https://physionexusacademy.com/images/founder-dr-sajjad.jpg"],
 },
 robots:{index:true,follow:true},
};

const quizJsonLd = {
  "@context": "https://schema.org",
  "@type": "Quiz",
  "name": "PNA Daily Clinical Challenge",
  "description": "A free daily physiotherapy clinical knowledge challenge with five questions, timed scoring and a public leaderboard for students and clinicians.",
  "url": "https://physionexusacademy.com/daily-challenge",
  "educationalLevel": "Professional",
  "learningResourceType": "Quiz",
  "inLanguage": "en",
  "isAccessibleForFree": true,
  "provider": {
    "@type": "Organization",
    "name": "Physio Nexus Academy",
    "url": "https://physionexusacademy.com"
  },
  "about": ["Physiotherapy", "Clinical Reasoning", "Musculoskeletal", "Rehabilitation"]
};

export default function DailyChallengePage(){
 return <main className="dc-page">
  <script
    type="application/ld+json"
    dangerouslySetInnerHTML={{
      __html: JSON.stringify(quizJsonLd).replace(/</g, "\\u003c"),
    }}
  />
  <div className="container-content py-7 sm:py-10">
   <nav aria-label="Breadcrumb" className="flex flex-wrap items-center gap-2 text-xs font-semibold text-slate-500">
    <Link href="/learn" className="inline-flex items-center gap-1 text-teal-800 hover:underline"><ArrowLeft className="h-4 w-4"/> Learn</Link>
    <span aria-hidden="true">/</span><span>Daily Clinical Challenge</span>
   </nav>
   <header className="dc-hero mt-6 p-5 sm:p-7">
    <div className="relative max-w-3xl">
     <span className="dc-hero-logo"><Flame className="h-4 w-4"/> PNA DAILY CLINICAL CHALLENGE</span>
     <h1 className="dc-hero-heading mt-4">A new mission every day.<br/><span>A new chance to lead.</span></h1>
     <p className="mt-4 max-w-2xl text-sm leading-7 text-slate-600">
      Five practical questions. One attempt per day. Earn up to 100 points and climb the public leaderboard.
     </p>
     <div className="dc-hero-banner mt-5">
      <span className="dc-hero-chip"><CalendarClock className="h-5 w-5"/> Resets 12:00 AM PKT</span>
      <span className="dc-hero-chip"><Trophy className="h-5 w-5"/> Live scores</span>
      <span className="dc-hero-chip"><BarChart3 className="h-5 w-5"/> Monthly & yearly</span>
     </div>
    </div>
   </header>
   <UnifiedProgressCard />
   <section className="mt-6 grid items-start gap-5 xl:grid-cols-[minmax(0,1.35fr)_minmax(340px,.8fr)]">
    <div id="play-daily"><DailyChallengeClient/></div>
    <div id="full-leaderboard" className="scroll-mt-28"><DailyLeaderboard title="Public leaderboard"/></div>
   </section>
   <DailyHallOfFame/>
   <p className="dc-footnote mt-6 text-center">
    One attempt per day · Answers scored on the server · Learning activity only (not certification) · PKT timezone
    {" · "}
    <Link href="/conditions" className="font-semibold text-teal-800 hover:underline">Conditions &amp; Treatment <ArrowRight className="inline h-3.5 w-3.5"/></Link>
   </p>
  </div>
 </main>;
}
