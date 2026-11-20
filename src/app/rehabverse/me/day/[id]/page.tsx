import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { DaySessionLoader } from "@/components/rehabverse/DaySessionLoader";
import { RehabError, getSession } from "@/lib/rehabverse/api";
import { requirePatient } from "@/lib/rehabverse/guard";
import { aiAssistAllowed } from "@/lib/rehabverse/ai-access";

export const metadata: Metadata = { title: "Today's session", robots: { index: false, follow: false } };
export const dynamic = "force-dynamic";

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export default async function DayPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  if (!UUID.test(id)) notFound();
  await requirePatient();
  try {
    // The database only returns a day that belongs to the signed-in patient.
    const data = await getSession(id);
    // the exercise coach and the check-in assistant are offered only when the admin has switched AI on for this patient (checked again on the server for every message)
    return <DaySessionLoader data={data} ai={await aiAssistAllowed()} />;
  } catch (error) {
    if (error instanceof RehabError) notFound();
    throw error;
  }
}
