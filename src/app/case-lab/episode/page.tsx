import type {Metadata} from "next";
import {Suspense} from "react";
import {EpisodeByQuery} from "./EpisodeByQuery";
import "../case-lab.css";

export const dynamic="force-static";
export const metadata:Metadata={
 title:"Interactive Patient Story | PNA Case Lab",
 description:"Learn physiotherapy clinical reasoning through patient stories, history taking, examination decisions and structured debriefs.",
 robots:{index:false,follow:true}
};
export default function PatientEpisodePage(){
 return <Suspense fallback={<div className="case-lab-v3 min-h-screen"><div className="container-content py-16"><div className="cl-paper p-8 text-sm font-semibold text-teal-800">Opening your patient file…</div></div></div>}><EpisodeByQuery/></Suspense>;
}
