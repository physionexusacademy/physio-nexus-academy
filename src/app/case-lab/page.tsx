import type {Metadata} from "next";
import {CaseLabLibrary} from "./CaseLabLibrary";
import {labCaseCards,labCategories} from "@/lib/case-lab-catalog";
import "./case-lab.css";

export const dynamic="force-static";
export const revalidate=false;
export const metadata:Metadata={
 title:"PNA Clinical Case Lab | Patient Stories & Clinical Reasoning",
 description:"Explore clinical patient stories across musculoskeletal, neurological, pediatric, cardiopulmonary and advanced physiotherapy rehabilitation. Learn through clues, decisions and debriefs.",
 alternates:{canonical:"https://physionexusacademy.com/case-lab"}
};

export default function CaseLabPage(){
 return <CaseLabLibrary cases={labCaseCards} categories={[...labCategories]}/>;
}
