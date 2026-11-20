import { requireAdmin } from "@/lib/supabase/require-admin";
import { DashboardView } from "./dashboard";
import { ReviewView } from "./review-view";

// One route for the pilot dashboard and the review pack (?view=review): every extra page adds its own compiled code and client manifest to the Cloudflare worker.
export const dynamic = "force-dynamic";
export const metadata = { title: "RehabVerse — AI pilot and review pack" };

export default async function AiPilotPage({ searchParams }: { searchParams: Promise<{ view?: string }> }) {
  await requireAdmin();
  const { view } = await searchParams;
  return view === "review" ? <ReviewView /> : <DashboardView />;
}
