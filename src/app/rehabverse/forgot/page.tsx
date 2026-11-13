import type { Metadata } from "next";
import { ForgotForm } from "@/components/rehabverse/AuthForm";

export const metadata: Metadata = { title: "Forgot password", robots: { index: false, follow: false } };

export default function ForgotPage() {
  return (
    <div className="container-content py-10 sm:py-14">
      <ForgotForm />
    </div>
  );
}
