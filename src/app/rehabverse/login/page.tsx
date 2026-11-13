import type { Metadata } from "next";
import { LoginForm } from "@/components/rehabverse/AuthForm";

export const metadata: Metadata = { title: "Sign in", robots: { index: false, follow: false } };

export default function LoginPage() {
  return (
    <div className="container-content py-10 sm:py-14">
      <LoginForm />
    </div>
  );
}
