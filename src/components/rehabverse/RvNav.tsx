"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Activity, BookOpen, Home, UserRound } from "lucide-react";
import { LangToggle, T } from "./useLang";

const LINKS = [
  { href: "/rehabverse", icon: Home, en: "Home", ru: "Home" },
  { href: "/rehabverse/library", icon: BookOpen, en: "3D library", ru: "3D library" },
  { href: "/rehabverse/me", icon: Activity, en: "My programme", ru: "Mera programme" },
];

/** Slim section bar: where am I, and the one language choice for the whole area. */
export function RvNav() {
  const path = usePathname() ?? "";
  return (
    <nav className="border-b border-slate-200/80 bg-white/70 backdrop-blur" aria-label="RehabVerse">
      <div className="container-content flex flex-wrap items-center gap-x-1 gap-y-1.5 py-2">
        <Link href="/rehabverse" className="mr-2 inline-flex items-center gap-1.5 text-sm font-extrabold tracking-tight text-navy-800">
          <span className="grid h-6 w-6 place-items-center rounded-lg bg-gradient-to-br from-[#0a1f3d] to-[#0db3aa] text-white"><UserRound className="h-3.5 w-3.5" aria-hidden="true" /></span>
          PNA RehabVerse
        </Link>
        {LINKS.slice(1).map((l) => {
          const active = path === l.href || path.startsWith(l.href + "/");
          return (
            <Link key={l.href} href={l.href} prefetch={false} aria-current={active ? "page" : undefined} className={"inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-[13px] font-bold " + (active ? "bg-[#0a1f3d] text-white" : "text-slate-600 hover:bg-slate-100")}>
              <l.icon className="h-3.5 w-3.5" aria-hidden="true" /> <T en={l.en} ru={l.ru} />
            </Link>
          );
        })}
        <LangToggle className="ml-auto" />
      </div>
    </nav>
  );
}
