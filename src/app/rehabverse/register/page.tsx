import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { AuthShell } from "@/components/rehabverse/AuthForm";
import { currentUser, isStaff } from "@/lib/rehabverse/api";

export const metadata: Metadata = { title: "Create your account", robots: { index: false, follow: false } };
export const dynamic = "force-dynamic";

export default async function RegisterPage() {
  if (await currentUser()) redirect((await isStaff()) ? "/admin/rehabverse" : "/rehabverse/start");
  return (
    <div className="container-content py-8 sm:py-12">
      <AuthShell mode="register" />
    </div>
  );
}
