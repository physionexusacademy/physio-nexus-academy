import type { Metadata } from "next";
import { RegisterForm } from "@/components/rehabverse/AuthForm";

export const metadata: Metadata = { title: "Create account", robots: { index: false, follow: false } };

export default function RegisterPage() {
  return (
    <div className="container-content py-10 sm:py-14">
      <RegisterForm />
    </div>
  );
}
