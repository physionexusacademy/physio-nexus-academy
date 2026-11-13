import Link from "next/link";
import { PatientList } from "@/components/rehabverse/admin/PatientList";
import { getPatients } from "@/lib/rehabverse/api";
import { requireAdmin } from "@/lib/supabase/require-admin";

export const dynamic = "force-dynamic";
export const metadata = { title: "RehabVerse — patients" };

export default async function RehabVersePatients() {
  await requireAdmin();
  const patients = await getPatients();
  return (
    <div className="space-y-4">
      <div>
        <Link href="/admin/rehabverse" className="text-[13px] font-bold text-teal-700 hover:underline">← Inbox</Link>
        <h1 className="mt-1 font-heading text-2xl font-bold text-navy-800">RehabVerse patients</h1>
      </div>
      <PatientList patients={patients} />
    </div>
  );
}
