"use client";

import { usePathname } from "next/navigation";

/** The public site's header, footer and floating buttons: not shown inside the admin app, which is a full-screen workspace of its own, nor on the members' door (sign in, ask for access, wait for approval), which must show nothing else. */
export function PublicChrome({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  if (pathname === "/admin" || pathname?.startsWith("/admin/") || pathname === "/members" || pathname?.startsWith("/members/")) return null;
  return <>{children}</>;
}
