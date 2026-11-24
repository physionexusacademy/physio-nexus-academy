import Link from "next/link";
import { UserCheck } from "lucide-react";
import { MembersPanel } from "@/components/members/MembersPanel";
import { rpc } from "@/lib/rehabverse/api";
import type { MemberStatus, MembersList } from "@/lib/members/types";
import { requireAdmin } from "@/lib/supabase/require-admin";

export const dynamic = "force-dynamic";
export const metadata = { title: "Members access" };

const STATUSES: MemberStatus[] = ["pending", "approved", "rejected", "suspended"];

export default async function MembersAdminPage({ searchParams }: { searchParams: Promise<{ status?: string; q?: string }> }) {
  await requireAdmin();
  const { status, q } = await searchParams;
  const filter = STATUSES.includes(status as MemberStatus) ? (status as MemberStatus) : status === "all" ? null : "pending";
  const list = await rpc<MembersList>("site_admin_members", { p_status: filter, p_search: (q ?? "").trim().slice(0, 100) || null }).catch(() => null);
  return (
    <div className="space-y-5">
      <div>
        <Link href="/admin" className="text-[13px] font-bold text-teal-700 hover:underline">← Overview</Link>
        <p className="rv-h mt-2">PNA</p>
        <h1 className="flex items-center gap-2 font-heading text-2xl font-bold text-navy-800"><UserCheck className="h-6 w-6 text-teal-600" aria-hidden="true" /> Members access</h1>
        <p className="text-[13.5px] text-slate-600">Decide who can enter the website. New people register or sign in at <b>/members</b>; nobody sees the site until you approve them while members-only mode is on.</p>
      </div>
      {list ? <MembersPanel list={list} filter={filter} query={q ?? ""} /> : <p className="rv-error">Members access is not set up in the database yet. It is added by a database migration that you approve first.</p>}
    </div>
  );
}
