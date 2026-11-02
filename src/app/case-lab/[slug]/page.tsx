import {redirect} from "next/navigation";
import {clinicalCaseIndex} from "@/lib/clinical-case-index";
export const dynamic="force-static";
export const revalidate=false;
export function generateStaticParams(){return clinicalCaseIndex.map(item=>({slug:item.slug}));}
export default function LegacyCaseRoute(){redirect("/case-lab");}
