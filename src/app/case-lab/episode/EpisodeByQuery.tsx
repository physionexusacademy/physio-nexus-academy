"use client";
import {useSearchParams} from "next/navigation";
import Link from "next/link";
import {ArrowLeft,SearchX} from "lucide-react";
import {getLabEpisode} from "@/lib/case-lab-story";
import {CaseLabTeachingExperience} from "../CaseLabTeachingExperience";

export function EpisodeByQuery(){
 const params=useSearchParams();
 const id=params.get("id")||"";
 const story=getLabEpisode(id);
 if(!story)return <div className="case-lab-v3 min-h-[70vh]"><div className="container-content py-16"><div className="cl-paper mx-auto max-w-xl p-10 text-center"><SearchX className="mx-auto h-9 w-9 text-teal-700"/><h1 className="mt-5 text-2xl font-bold">This patient file isn't available</h1><p className="mt-3 text-sm leading-7 text-slate-600">The case may have moved, or the link may be incomplete. Choose another scenario from the case library.</p><Link className="cl-button mt-7" href="/case-lab"><ArrowLeft className="h-4 w-4"/> Back to patient files</Link></div></div></div>;
 return <CaseLabTeachingExperience key={id} story={story}/>;
}
