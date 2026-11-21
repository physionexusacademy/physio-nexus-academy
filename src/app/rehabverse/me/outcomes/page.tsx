import type { Metadata } from "next";
import { OutcomesLoader } from "@/components/rehabverse/OutcomesLoader";
import { getMyOutcomes } from "@/lib/rehabverse/api";
import { requirePatient } from "@/lib/rehabverse/guard";

export const metadata: Metadata = { title: "Questions from your physiotherapist", robots: { index: false, follow: false } };
export const dynamic = "force-dynamic";

export default async function OutcomesRoute() {
  await requirePatient();
  const outcomes = await getMyOutcomes().catch(() => ({ plan: null, responses: [] })); // until the outcomes migration is live there is simply nothing to answer
  return <OutcomesLoader outcomes={outcomes} />;
}
