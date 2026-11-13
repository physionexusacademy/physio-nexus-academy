import Link from "next/link";
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
      <ul className="grid gap-2 sm:grid-cols-2">
        {patients.map((p) => (
          <li key={p.id}><Link href={`/admin/rehabverse/patients/${p.id}`} className="flex items-center justify-between gap-2 rounded-xl border border-slate-200 bg-white px-4 py-3 text-[14px] hover:border-teal-400"><span><b className="text-navy-800">{p.full_name}</b> <span className="text-slate-500">{p.reference_code}{p.city ? ` · ${p.city}` : ""}</span></span><span className={"rv-chip " + (p.programme_status === "active" ? "rv-chip-teal" : "")}>{p.programme_status ?? "no programme"}</span></Link></li>
        ))}
        {patients.length === 0 ? <li className="text-[14px] text-slate-500">No patients yet.</li> : null}
      </ul>
    </div>
  );
}
