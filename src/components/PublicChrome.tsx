"use client";

import { usePathname } from "next/navigation";

/** The public site's header, footer and floating buttons: not shown inside the admin app, which is a full-screen workspace of its own. */
export function PublicChrome({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  if (pathname === "/admin" || pathname?.startsWith("/admin/")) return null;
  return <>{children}</>;
}
