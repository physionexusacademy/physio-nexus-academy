"use client";

import { usePathname } from "next/navigation";
import { BookOpen, Trophy, CalendarDays, HeartPulse, Home } from "lucide-react";
import { cn } from "@/lib/utils";

const items = [
  { label: "Home", href: "/", icon: Home },
  { label: "Learn", href: "/knowledge-hub", icon: BookOpen },
  { label: "Challenge", href: "/daily-challenge", icon: Trophy },
  { label: "Workshops", href: "/workshops", icon: CalendarDays },
  { label: "Care", href: "/patient-services", icon: HeartPulse },
];

export function MobilePortalNav() {
  const pathname = usePathname();

  return (
    <nav
      aria-label="Mobile quick navigation"
      className="pna-mobile-dock lg:hidden"
    >
      <div className="pna-mobile-dock-grid mx-auto grid max-w-lg grid-cols-5">
        {items.map((item) => {
          const Icon = item.icon;
          const active =
            item.href === "/"
              ? pathname === "/"
              : pathname === item.href || pathname.startsWith(item.href + "/");

          return (
            <a
              key={item.href}
              href={item.href}
              aria-current={active ? "page" : undefined}
              className={cn(
                "pna-mobile-dock-item flex min-h-14 flex-col items-center justify-center gap-1 rounded-xl px-1 text-[10px] font-bold transition",
                active
                  ? "is-active text-teal-800"
                  : "text-navy-500 hover:bg-grey-50 hover:text-navy-800"
              )}
            >
              <Icon className="pna-mobile-dock-icon h-5 w-5" aria-hidden="true" />
              <span className="pna-mobile-dock-label">{item.label}</span>
            </a>
          );
        })}
      </div>
    </nav>
  );
}
