"use client";

import { ArrowRight } from "lucide-react";
import { AccountLink } from "@/components/student/AccountApp";

/** Landing buttons for visitors (a signed-in student never sees the landing page: they get My PNA). */
export function AccountCta() {
  return (
    <div className="acct-cta">
      <AccountLink mode="register" className="nx-btn nx-btn-primary">Create your free account <ArrowRight className="h-4 w-4" aria-hidden="true" /></AccountLink>
      <AccountLink mode="login" className="nx-btn nx-btn-ghost">Sign in</AccountLink>
    </div>
  );
}
