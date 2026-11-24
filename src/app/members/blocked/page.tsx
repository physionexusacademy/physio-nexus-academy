import { redirect } from "next/navigation";
import { MemberWaiting } from "@/components/members/MemberWaiting";
import { createClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";
export const metadata = { title: "blocked" };

export default async function MemberBlockedPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/members");
  const { data } = await supabase.rpc("site_member_status");
  const s = (data ?? {}) as { status?: string; full_name?: string | null; note?: string | null };
  if (s.status === "approved") redirect("/members/check?next=/");
  const status = s.status === "rejected" || s.status === "suspended" ? s.status : "pending";
  return <MemberWaiting name={s.full_name || user.email || ""} status={status} note={s.note ?? null} />;
}
