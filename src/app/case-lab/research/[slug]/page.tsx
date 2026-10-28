import type {Metadata} from "next";
import {notFound} from "next/navigation";
import Link from "next/link";
import {ArrowLeft,ExternalLink,BookOpen,CheckCircle2,AlertTriangle} from "lucide-react";
import {getPublishedCaseReport,publishedCaseReports} from "@/lib/case-report-library";
import "../../case-lab.css";
import "./research-report.css";
const base="https://physionexusacademy.com";
export const dynamic="force-static";
export const revalidate=false;
export function generateStaticParams(){return publishedCaseReports.map(r=>({slug:r.slug}));}
export async function generateMetadata({params}:{params:Promise<{slug:string}>}):Promise<Metadata>{
 const {slug}=await params; const report=getPublishedCaseReport(slug); if(!report)return {};
 return {title:report.title+" | PNA Research Case Library",description:report.caseSummary,alternates:{canonical:base+"/case-lab/research/"+report.slug},openGraph:{title:report.title,description:report.caseSummary,url:base+"/case-lab/research/"+report.slug,type:"article"}};
}
function Section({title,items,kind="normal"}:{title:string;items:string[];kind?:"normal"|"lesson"|"limit"}){return <section className={"rr-section "+(kind==="lesson"?"rr-lesson":kind==="limit"?"rr-limit":"")}><h2>{title}</h2><ul>{items.map((x,i)=><li key={i}>{x}</li>)}</ul></section>}
export default async function PublishedReportPage({params}:{params:Promise<{slug:string}>}){
 const {slug}=await params; const r=getPublishedCaseReport(slug); if(!r)notFound();
 return <main className="rr-page"><div className="rr-wrap">
  <Link className="rr-back" href="/case-lab"><ArrowLeft size={16}/> All published case reports</Link>
  <header className="rr-hero"><span className="rr-kicker"><BookOpen size={14}/> PNA RESEARCH CASE LIBRARY</span><span className="rr-specialty">{r.specialty} · {r.year}</span><h1>{r.title}</h1><p className="rr-authors">{r.authors}</p><p className="rr-journal"><em>{r.journal}</em> · {r.year}{r.doi?" · DOI: "+r.doi:""}</p>
   <div className="rr-actions"><a className="rr-primary" href={r.sourceUrl} target="_blank" rel="noopener noreferrer">Read original paper <ExternalLink size={16}/></a>{r.doi&&<a className="rr-secondary" href={"https://doi.org/"+r.doi} target="_blank" rel="noopener noreferrer">Open DOI <ExternalLink size={15}/></a>}</div>
   <p className="rr-license"><CheckCircle2 size={16}/>{r.openAccess?"Free full text available":"Publisher/PubMed source record available"} · {r.licenseNote}</p>
  </header>
  <div className="rr-layout"><article className="rr-article">
   <section className="rr-section rr-overview"><span className="rr-label">THE CASE IN PLAIN ENGLISH</span><h2>What happened?</h2><p>{r.caseSummary}</p></section>
   <Section title="Clinical findings" items={r.clinicalFindings}/>
   <Section title="Rehabilitation described in the report" items={r.intervention}/>
   <Section title="Reported outcomes" items={r.outcomes}/>
   <Section title="Clinical lessons to consider" items={r.clinicalLessons} kind="lesson"/>
   <Section title="Limitations — what this case cannot tell us" items={r.limitations} kind="limit"/>
   <div className="rr-sourcebox"><h2>Original source</h2><p>{r.authors}. “{r.title}.” <em>{r.journal}</em>, {r.year}.{r.doi?" DOI: "+r.doi:""} </p><a href={r.sourceUrl} target="_blank" rel="noopener noreferrer">View the original publication <ExternalLink size={15}/></a><p className="rr-small">This page is an independently written educational summary, not a reproduction of the full paper. Check the original article for complete methods, outcome tables, references and licensing.</p></div>
  </article><aside className="rr-aside"><div><span>READ WITH A CLINICIAN'S EYE</span><h3>Ask three questions</h3><ol><li>What impairment or participation problem was targeted?</li><li>Which changes were measured, and when?</li><li>What else could explain the outcome?</li></ol></div><div className="rr-warning"><AlertTriangle size={18}/><p>One case is a learning example, not proof of treatment effectiveness. Never copy a protocol without checking diagnosis, precautions and the full paper.</p></div><Link href="/case-lab" className="rr-library-link">Explore more reports <ArrowLeft size={15}/></Link></aside></div>
 </div></main>;
}
