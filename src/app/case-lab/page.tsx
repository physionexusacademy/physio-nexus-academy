import type {Metadata} from "next";
import {ResearchCaseLibrary} from "./ResearchCaseLibrary";
import {publishedCaseReports} from "@/lib/case-report-library";
import "./research-library.css";
export const dynamic="force-static";
export const revalidate=false;
export const metadata:Metadata={
 title:"PNA Research Case Library | Published Physiotherapy Case Reports & Clinical Lessons",
 description:"Learn from published, evidence-based physiotherapy and rehabilitation case reports. Plain-English summaries, original source links, reported interventions, outcomes, clinical lessons and limitations — curated for students and clinicians.",
 keywords:[
  "physiotherapy case reports",
  "published physiotherapy cases",
  "rehabilitation case studies",
  "evidence based physiotherapy",
  "clinical case library",
  "physiotherapy research cases",
  "MSK case reports",
  "neurological physiotherapy cases",
  "cardiorespiratory case reports",
  "paediatric physiotherapy cases",
  "Physio Nexus Academy",
  "clinical reasoning physiotherapy",
 ],
 alternates:{canonical:"https://physionexusacademy.com/case-lab"},
 openGraph:{
  title:"PNA Research Case Library | Published Physiotherapy Case Reports",
  description:"Published clinical rehabilitation case reports explained in plain English, with links to the original research, outcomes and clinical lessons.",
  url:"https://physionexusacademy.com/case-lab",
  siteName:"Physio Nexus Academy",
  locale:"en_PK",
  type:"website",
  images:[
   {
    url:"https://physionexusacademy.com/images/founder-dr-sajjad.jpg",
    width:1200,
    height:630,
    alt:"PNA Research Case Library — Physio Nexus Academy",
   },
  ],
 },
 twitter:{
  card:"summary_large_image",
  title:"PNA Research Case Library | Physiotherapy Case Reports",
  description:"Evidence-based published physiotherapy case reports with plain-English summaries, original sources and clinical lessons.",
  images:["https://physionexusacademy.com/images/founder-dr-sajjad.jpg"],
 },
 robots:{index:true,follow:true},
};

const libraryJsonLd = {
  "@context": "https://schema.org",
  "@type": "CollectionPage",
  "name": "PNA Research Case Library",
  "description": "A curated library of published physiotherapy and rehabilitation case reports with plain-English summaries, original source links, clinical lessons and limitations.",
  "url": "https://physionexusacademy.com/case-lab",
  "isPartOf": {
    "@type": "WebSite",
    "name": "Physio Nexus Academy",
    "url": "https://physionexusacademy.com"
  },
  "about": ["Physiotherapy", "Rehabilitation", "Case Reports", "Evidence-based practice"],
  "numberOfItems": publishedCaseReports.length,
  "provider": {
    "@type": "Organization",
    "name": "Physio Nexus Academy",
    "url": "https://physionexusacademy.com"
  }
};

export default function CaseLabPage(){
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(libraryJsonLd).replace(/</g, "\\u003c"),
        }}
      />
      <ResearchCaseLibrary reports={publishedCaseReports}/>
    </>
  );
}
