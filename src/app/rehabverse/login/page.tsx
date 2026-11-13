import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { AuthShell } from "@/components/rehabverse/AuthForm";
import { currentUser, isStaff } from "@/lib/rehabverse/api";

export const metadata: Metadata = { title: "Sign in", robots: { index: false, follow: false } };
export const dynamic = "force-dynamic";

export default async function LoginPage({ searchParams }: { searchParams: Promise<{ notice?: string }> }) {
  const params = await searchParams;
  // Someone who is already signed in does not need this page.
  if (await currentUser()) redirect((await isStaff()) ? "/admin/rehabverse" : "/rehabverse/me");
  return (
    <div className="container-content py-8 sm:py-12">
      <AuthShell mode="login" notice={params.notice} />
    </div>
  );
}
