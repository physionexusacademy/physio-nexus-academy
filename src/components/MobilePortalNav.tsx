"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { BookOpen, BrainCircuit, CalendarDays, HeartPulse, Home } from "lucide-react";
import { cn } from "@/lib/utils";

const items = [
  { label: "Home", href: "/", icon: Home },
  { label: "Learn", href: "/knowledge-hub", icon: BookOpen },
  { label: "Cases", href: "/case-lab", icon: BrainCircuit },
  { label: "Workshops", href: "/workshops", icon: CalendarDays },
  { label: "Care", href: "/patient-services", icon: HeartPulse },
];

export function MobilePortalNav() {
  const pathname = usePathname();

  return (
    <nav
      aria-label="Mobile quick navigation"
      className="fixed inset-x-0 bottom-0 z-[80] border-t border-grey-200 bg-white/95 px-2 pb-[max(0.35rem,env(safe-area-inset-bottom))] pt-1.5 shadow-[0_-8px_25px_rgba(2,20,44,0.08)] backdrop-blur lg:hidden"
    >
      <div className="mx-auto grid max-w-lg grid-cols-5">
        {items.map((item) => {
          const Icon = item.icon;
          const active =
            item.href === "/"
              ? pathname === "/"
              : pathname === item.href || pathname.startsWith(item.href + "/");

          return (
            <Link
              key={item.href}
              href={item.href}
              aria-current={active ? "page" : undefined}
              className={cn(
                "flex min-h-14 flex-col items-center justify-center gap-1 rounded-xl px-1 text-[10px] font-bold transition",
                active
                  ? "bg-teal-50 text-teal-700"
                  : "text-navy-500 hover:bg-grey-50 hover:text-navy-800"
              )}
            >
              <Icon className="h-5 w-5" />
              <span>{item.label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
