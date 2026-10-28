import type {Metadata} from "next";
import {ResearchCaseLibrary} from "./ResearchCaseLibrary";
import {publishedCaseReports} from "@/lib/case-report-library";
import "./research-library.css";
export const dynamic="force-static";
export const revalidate=false;
export const metadata:Metadata={
 title:"PNA Research Case Library | Published Physiotherapy Case Reports",
 description:"Learn from published physiotherapy and rehabilitation case reports with original source links, plain-English summaries, reported interventions, outcomes and limitations.",
 alternates:{canonical:"https://physionexusacademy.com/case-lab"},
 openGraph:{title:"PNA Research Case Library",description:"Published clinical rehabilitation case reports explained in plain English, with links to the original research.",url:"https://physionexusacademy.com/case-lab",type:"website"}
};
export default function CaseLabPage(){return <ResearchCaseLibrary reports={publishedCaseReports}/>;}
