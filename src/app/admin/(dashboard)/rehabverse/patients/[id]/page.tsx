import Link from "next/link";
import { notFound } from "next/navigation";
import { AdminPatientRecordLoader } from "@/components/rehabverse/admin/AdminPatientRecordLoader";
import { RehabError, getAdminOutcomes, getPatient } from "@/lib/rehabverse/api";
import { requireAdmin } from "@/lib/supabase/require-admin";

export const dynamic = "force-dynamic";
export const metadata = { title: "RehabVerse — patient record" };
const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export default async function RehabVersePatient({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  if (!UUID.test(id)) notFound();
  await requireAdmin();
  try {
    const [data, outcomes] = await Promise.all([getPatient(id), getAdminOutcomes(id).catch(() => null)]); // outcomes: null until its migration is live
    return (
      <div className="space-y-3">
        <Link href="/admin/rehabverse" className="text-[13px] font-bold text-teal-700 hover:underline">← Inbox</Link>
        <AdminPatientRecordLoader data={data} outcomes={outcomes} />
      </div>
    );
  } catch (error) {
    if (error instanceof RehabError) notFound();
    throw error;
  }
}
