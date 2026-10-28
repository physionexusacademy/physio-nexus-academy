"use client";

import { useEffect, useRef, useState } from "react";
import { usePathname } from "next/navigation";
import Image from "next/image";
import {
  Menu,
  X,
  Laugh,
  Calendar,
  Home,
  Trophy,
  ChevronDown,
  BookOpen,
  FileBadge2,
  Hand,
  Info,
  HeartPulse,
  FlaskConical,
} from "lucide-react";
import { mainNav, siteConfig } from "@/lib/site-config";
import { Button } from "@/components/ui/Button";
import { cn } from "@/lib/utils";
import { InstallApp } from "@/components/InstallApp";

/** Primary desktop links — kept short so the bar feels calm, not crowded. */
const PRIMARY_HREFS = new Set([
  "/daily-challenge",
  "/case-lab",
  "/workshops",
  "/knowledge-hub",
]);

export function Header() {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();

  const touchStart = useRef<{ x: number; y: number } | null>(null);

  useEffect(() => {
    const handleTouchStart = (event: TouchEvent) => {
      const target = event.target as HTMLElement | null;

      // Let horizontally scrollable areas handle their own swipe.
      // This prevents the mobile menu from opening while scrolling tables.
      if (target?.closest(".overflow-x-auto, [data-horizontal-scroll]")) {
        touchStart.current = null;
        return;
      }
      if (
        event.touches.length !== 1 ||
        (window.visualViewport?.scale ?? 1) > 1.05
      ) {
        touchStart.current = null;
        return;
      }

      const touch = event.touches[0];
      touchStart.current = {
        x: touch.clientX,
        y: touch.clientY,
      };
    };

    const handleTouchEnd = (event: TouchEvent) => {
      if (!touchStart.current || event.changedTouches.length !== 1) return;

      const touch = event.changedTouches[0];

      const dx = touch.clientX - touchStart.current.x;
      const dy = touch.clientY - touchStart.current.y;

      touchStart.current = null;

      // Ignore short or mostly vertical swipes
      if (Math.abs(dx) < 70 || Math.abs(dx) <= Math.abs(dy) * 1.25) {
        return;
      }

      // Right → Left = OPEN
      if (dx < 0 && !open) {
        setOpen(true);
      }

      // Left → Right = CLOSE
      if (dx > 0 && open) {
        setOpen(false);
      }
    };

    window.addEventListener("touchstart", handleTouchStart, {
      passive: true,
    });

    window.addEventListener("touchend", handleTouchEnd, {
      passive: true,
    });

    return () => {
      window.removeEventListener("touchstart", handleTouchStart);
      window.removeEventListener("touchend", handleTouchEnd);
    };
  }, [open]);

  return (
    <header
      className={cn(
        "sticky top-0 z-50 border-b border-grey-200 bg-white/95 backdrop-blur-sm",
        pathname === "/" && "pna-home-header",
      )}
    >
      <div className="container-content flex h-20 items-center justify-between gap-3">
        <a
          href="/"
          className="flex min-w-0 items-center gap-3"
          onClick={() => setOpen(false)}
        >
          <Image
            src="/images/pna-logo.png"
            alt={`${siteConfig.academyName} logo`}
            width={44}
            height={44}
            className="h-11 w-11 flex-none object-contain"
            priority
          />
          <div className="flex min-w-0 flex-col">
            <span className="font-heading truncate text-lg font-semibold leading-tight text-navy-800 sm:text-xl">
              Physio Nexus Academy
            </span>
            <span className="hidden text-[10px] font-semibold uppercase tracking-wide text-teal-600 lg:block">
              Approved CPD Provider · #791052
            </span>
          </div>
        </a>

        {/* Desktop nav — fewer primary links, clearer hierarchy */}
        <nav
          className="hidden items-center gap-1 xl:flex"
          aria-label="Main navigation"
        >
          {mainNav.filter(
              (item) =>
                item.href !== "/" &&
                item.href !== "/resources" &&
                item.href !== "/verify" &&
                PRIMARY_HREFS.has(item.href),
            ).map((item) => (
              <a
                key={item.href}
                href={item.href}
                aria-current={pathname === item.href ? "page" : undefined}
                className={cn(
                  "rounded-xl px-3 py-2 text-sm font-semibold transition-colors",
                  item.href === "/daily-challenge" &&
                    "inline-flex items-center gap-1.5 rounded-full bg-teal-700 px-3.5 py-2 font-bold text-white shadow-sm hover:bg-teal-800 hover:text-white",
                  pathname === item.href
                    ? item.href === "/daily-challenge"
                      ? "bg-teal-900 text-white"
                      : "bg-teal-50 text-teal-700"
                    : item.href === "/daily-challenge"
                      ? ""
                      : "text-navy-700 hover:bg-teal-50 hover:text-teal-800",
                )}
              >
                {item.href === "/daily-challenge" && (
                  <Trophy className="h-4 w-4" aria-hidden="true" />
                )}
                {item.label === "Learn" ? "Knowledge Hub" : item.label}
              </a>
            ))}
          <details className="group relative">
            <summary className="flex cursor-pointer list-none items-center gap-1 rounded-xl px-3 py-2 text-sm font-semibold text-navy-700 transition hover:bg-teal-50 hover:text-teal-800">
              More{" "}
              <ChevronDown
                className="h-4 w-4 transition group-open:rotate-180"
                aria-hidden="true"
              />
            </summary>
            <div className="absolute right-0 top-full z-[90] mt-2 w-64 rounded-2xl border border-[#dbeae6] bg-white p-2 shadow-[0_18px_44px_-25px_rgba(15,74,80,.35)]">
              {[
                {
                  label: "Patient Care",
                  href: "/patient-services",
                  icon: HeartPulse,
                },
                {
                  label: "Clinical Arena",
                  href: "/clinical-arena",
                  icon: FlaskConical,
                },
                {
                  label: "Stupid Intern Diaries",
                  href: "/stupid-intern-diaries",
                  icon: Laugh,
                },
                {
                  label: "Books & Resources",
                  href: "/resources",
                  icon: BookOpen,
                },
                {
                  label: "Manual Therapy",
                  href: "/manual-therapy",
                  icon: Hand,
                },
                {
                  label: "Verify Certificate",
                  href: "/verify",
                  icon: FileBadge2,
                },
                { label: "About PNA", href: "/about", icon: Info },
              ].map((item) => {
                const Icon = item.icon;
                return (
                  <a
                    key={item.href}
                    href={item.href}
                    className="flex items-center gap-2 rounded-xl px-3 py-2.5 text-sm font-semibold text-navy-700 hover:bg-teal-50 hover:text-teal-800"
                  >
                    <Icon className="h-4 w-4 text-teal-700" aria-hidden="true" />
                    {item.label}
                  </a>
                );
              })}
            </div>
          </details>
        </nav>

        <div className="hidden items-center gap-2 xl:flex">
          <InstallApp />
          <Button href="/appointment" variant="outline" size="md">
            <Calendar className="h-4 w-4" /> Book
          </Button>
          <Button href="/home-visit" variant="primary" size="md">
            <Home className="h-4 w-4" /> Home Visit
          </Button>
        </div>

        {/* Mobile toggle */}
        <button
          type="button"
          className="inline-flex items-center justify-center rounded-md p-2 text-navy-800 xl:hidden"
          aria-label={open ? "Close menu" : "Open menu"}
          aria-expanded={open}
          onClick={() => setOpen((v) => !v)}
        >
          {open ? <X className="h-7 w-7" /> : <Menu className="h-7 w-7" />}
        </button>
      </div>

      {/* Mobile drawer */}
      <div
        aria-hidden={!open}
        className={cn(
          "absolute left-0 right-0 top-full z-[60] h-[calc(100dvh-5rem)] bg-white transition-transform duration-300 xl:hidden",
          open
            ? "visible translate-x-0"
            : "invisible pointer-events-none translate-x-full",
        )}
      >
        <nav
          className="flex h-full flex-col gap-1 overflow-y-auto p-5"
          aria-label="Mobile navigation"
        >
          <a
            href="https://thecpdregister.com"
            target="_blank"
            rel="noopener noreferrer"
            className="mb-3 rounded-xl border border-grey-200 bg-grey-50 px-4 py-3"
          >
            <p className="text-xs font-bold uppercase tracking-wide text-teal-600">
              Approved CPD Provider
            </p>
            <p className="mt-1 text-xs font-semibold text-navy-800">
              The CPD Group · #791052
            </p>
          </a>
          <div className="px-3 py-2">
            <InstallApp />
          </div>

          <p className="px-3 pt-2 text-xs font-bold uppercase tracking-widest text-teal-600">
            Start here
          </p>
          {mainNav.filter((item) => PRIMARY_HREFS.has(item.href)).map((item) => (
              <a
                key={item.href}
                href={item.href}
                tabIndex={open ? 0 : -1}
                aria-current={pathname === item.href ? "page" : undefined}
                onClick={() => setOpen(false)}
                className={cn(
                  "rounded-md px-3 py-3 text-base font-medium text-navy-800 hover:bg-navy-50",
                  item.href === "/daily-challenge" &&
                    "bg-teal-50 font-bold text-teal-800",
                )}
              >
                {item.label === "Learn" ? "Knowledge Hub" : item.label}
              </a>
            ))}

          <p className="mt-3 px-3 pt-2 text-xs font-bold uppercase tracking-widest text-teal-600">
            More
          </p>
          {mainNav.filter(
              (item) => item.href !== "/" && !PRIMARY_HREFS.has(item.href),
            ).map((item) => (
              <a
                key={item.href}
                href={item.href}
                tabIndex={open ? 0 : -1}
                aria-current={pathname === item.href ? "page" : undefined}
                onClick={() => setOpen(false)}
                className="rounded-md px-3 py-3 text-base font-medium text-navy-800 hover:bg-navy-50"
              >
                {item.label}
              </a>
            ))}

          <div className="mt-4 flex flex-col gap-3 px-3">
            <Button
              href="/appointment"
              variant="secondary"
              size="lg"
              tabIndex={open ? 0 : -1}
              className="w-full"
            >
              Book Appointment
            </Button>
            <Button
              href="/home-visit"
              variant="primary"
              size="lg"
              tabIndex={open ? 0 : -1}
              className="w-full"
            >
              Request Home Visit
            </Button>
          </div>
        </nav>
      </div>
    </header>
  );
}
