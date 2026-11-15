import { requireAdmin } from "@/lib/supabase/require-admin";
import { getAdminOverview } from "@/lib/admin/overview";
import { OverviewView } from "@/components/admin/OverviewView";

// This authenticated dashboard depends on request cookies and must never be prerendered.
export const dynamic = "force-dynamic";

function greetingFor(now: Date) {
  const hour = Number(new Intl.DateTimeFormat("en-GB", { timeZone: "Asia/Karachi", hour: "numeric", hour12: false }).format(now)) % 24;
  return hour < 5 ? "Good night" : hour < 12 ? "Good morning" : hour < 17 ? "Good afternoon" : hour < 21 ? "Good evening" : "Good night";
}

export default async function AdminOverviewPage() {
  // The admin layout also checks, but a page must never rely on that: the data below is read with the service-role client.
  await requireAdmin();
  const now = new Date();
  const data = await getAdminOverview();
  const dateLabel = new Intl.DateTimeFormat("en-GB", { timeZone: "Asia/Karachi", weekday: "long", day: "numeric", month: "long" }).format(now);
  return <OverviewView data={data} greeting={greetingFor(now)} dateLabel={dateLabel} now={now.getTime()} />;
}
