import type { Metadata } from "next";
import Link from "next/link";
import { UserRound } from "lucide-react";
import { LangToggle } from "@/components/rehabverse/useLang";
import "@/app/rehabverse/rehabverse.css";

export const metadata: Metadata = {
  title: { default: "Members — Physio Nexus Academy", template: "%s | Physio Nexus Academy" },
  robots: { index: false, follow: false },
};

/** The members' door: sign in, ask for access, wait for the clinic's approval. Same look as RehabVerse so it feels like one product. */
export default function MembersLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="rv-root">
      <nav className="rv-nav" aria-label="Members">
        <div className="container-content flex items-center gap-2 py-2">
          <Link href="/members" className="rv-nav-brand mr-2 inline-flex items-center gap-1.5 text-sm font-extrabold tracking-tight">
            <span className="grid h-6 w-6 place-items-center rounded-lg bg-gradient-to-br from-[#0a1f3d] to-[#0db3aa] text-white"><UserRound className="h-3.5 w-3.5" aria-hidden="true" /></span>
            Physio Nexus Academy
          </Link>
          <span className="ml-auto"><LangToggle /></span>
        </div>
      </nav>
      <main className="container-content pb-20 pt-6 sm:pt-10">{children}</main>
    </div>
  );
}
