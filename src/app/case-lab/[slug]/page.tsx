import type {Metadata} from "next";
import {notFound} from "next/navigation";
import {getClinicalCase} from "@/lib/all-clinical-cases";
import {clinicalCaseIndex} from "@/lib/clinical-case-index";
import {clinicalCaseGuides} from "@/lib/clinical-case-guides";
import {supplementalCaseGuides} from "@/lib/case-lab-extra-guides";
import {adaptDetailedCase} from "@/lib/case-lab-story";
import {CaseLabExperience} from "../CaseLabExperience";
import "../case-lab.css";

const base="https://physionexusacademy.com";
export const dynamic="force-static";
export const revalidate=false;
export function generateStaticParams(){
 return clinicalCaseIndex.map(item=>({slug:item.slug}));
}
export async function generateMetadata({params}:{params:Promise<{slug:string}>}):Promise<Metadata>{
 const {slug}=await params;
 const item=getClinicalCase(slug);
 if(!item)return {};
 return {
  title:item.title+" | PNA Case Lab",
  description:item.summary,
  alternates:{canonical:base+"/case-lab/"+item.slug}
 };
}
export default async function ClinicalCasePage({params}:{params:Promise<{slug:string}>}){
 const {slug}=await params;
 const item=getClinicalCase(slug);
 if(!item)notFound();
 return <CaseLabExperience story={adaptDetailedCase(item,clinicalCaseGuides[slug]||supplementalCaseGuides[slug])}/>;
}
