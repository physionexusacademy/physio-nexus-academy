import {permanentRedirect} from "next/navigation";
import {clinicalCaseIndex} from "@/lib/clinical-case-index";
export const dynamic="force-static";
export const revalidate=false;
export function generateStaticParams(){return clinicalCaseIndex.map(item=>({slug:item.slug}));}
// Old case URLs moved into the Case Lab library: a permanent (308) redirect passes their search ranking on.
export default function LegacyCaseRoute(){permanentRedirect("/case-lab");}
