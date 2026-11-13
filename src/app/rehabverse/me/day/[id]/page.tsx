import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { DaySessionLoader } from "@/components/rehabverse/DaySessionLoader";
import { RehabError, getSession } from "@/lib/rehabverse/api";
import { requirePatient } from "@/lib/rehabverse/guard";

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
    return <DaySessionLoader data={data} />;
  } catch (error) {
    if (error instanceof RehabError) notFound();
    throw error;
  }
}
