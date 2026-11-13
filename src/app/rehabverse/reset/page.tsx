import type { Metadata } from "next";
import Link from "next/link";
import { ResetForm } from "@/components/rehabverse/AuthForm";
import { currentUser } from "@/lib/rehabverse/api";

export const metadata: Metadata = { title: "New password", robots: { index: false, follow: false } };
export const dynamic = "force-dynamic";

export default async function ResetPage() {
  const user = await currentUser();
  return (
    <div className="container-content py-10 sm:py-14">
      {user ? (
        <ResetForm />
      ) : (
        <div className="rv-glass mx-auto max-w-md space-y-3 p-6 text-center">
          <h1 className="font-heading text-xl font-bold text-navy-800">This reset link is no longer valid</h1>
          <p className="text-sm text-slate-600">It may have expired, been used already, or been opened on a different device. Please ask for a new one.</p>
          <Link href="/rehabverse/forgot" className="rv-btn rv-btn-primary">Ask for a new link</Link>
        </div>
      )}
    </div>
  );
}
