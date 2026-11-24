import { MembersAuth } from "@/components/members/MembersAuth";
import { safeNext } from "@/lib/members/paths";

export const dynamic = "force-dynamic";
export const metadata = { title: "Sign in" };

export default async function MembersPage({ searchParams }: { searchParams: Promise<{ next?: string; error?: string }> }) {
  const { next, error } = await searchParams;
  return <MembersAuth next={safeNext(next)} error={error} />;
}
