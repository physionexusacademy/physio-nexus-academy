"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import Image from "next/image";
import { Menu, X, Calendar, Home } from "lucide-react";
import { mainNav, siteConfig } from "@/lib/site-config";
import { Button } from "@/components/ui/Button";
import { cn } from "@/lib/utils";

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
      if (
        Math.abs(dx) < 70 ||
        Math.abs(dx) <= Math.abs(dy) * 1.25
      ) {
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
    <header className="sticky top-0 z-50 border-b border-grey-200 bg-white/95 backdrop-blur-sm">
      <div className="container-content flex h-20 items-center justify-between">
        <Link href="/" className="flex items-center gap-3" onClick={() => setOpen(false)}>
          <Image
            src="/images/pna-logo.png"
            alt={`${siteConfig.academyName} logo`}
            width={44}
            height={44}
            className="h-11 w-11 object-contain"
            priority
          />
         <div className="flex flex-col">
  <span className="font-heading text-lg font-semibold leading-tight text-navy-800 sm:text-xl">
    Physio Nexus Academy
  </span>

  <span className="hidden text-[10px] font-semibold uppercase tracking-wide text-teal-600 lg:block">
    Approved CPD Provider · #791052
  </span>
</div>
        </Link>

        {/* Desktop nav */}
        <nav className="hidden items-center gap-4 lg:flex" aria-label="Main navigation">
          {mainNav.filter((item) => item.href !== "/").map((item) => (
            <Link
              key={item.href}
              href={item.href}
              aria-current={pathname === item.href ? "page" : undefined}
              className={cn(
                "text-sm font-medium transition-colors hover:text-teal-600",
                pathname === item.href ? "text-teal-600" : "text-navy-700"
              )}
            >
              {item.label}
            </Link>
          ))}
        </nav>

        <div className="hidden items-center gap-2 lg:flex">
          <Button href="/appointment" variant="outline" size="md">
            <Calendar className="h-4 w-4" /> Book Appointment
          </Button>
          <Button href="/home-visit" variant="primary" size="md">
            <Home className="h-4 w-4" /> Home Visit
          </Button>
        </div>

        {/* Mobile toggle */}
        <button
          type="button"
          className="inline-flex items-center justify-center rounded-md p-2 text-navy-800 lg:hidden"
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
          "absolute left-0 right-0 top-full z-[60] h-[calc(100dvh-5rem)] bg-white transition-transform duration-300 lg:hidden",
          open ? "visible translate-x-0" : "invisible pointer-events-none translate-x-full"
        )}
      >
        <nav className="flex h-full flex-col gap-1 overflow-y-auto p-5" aria-label="Mobile navigation">
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
          {mainNav.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              tabIndex={open ? 0 : -1}
              aria-current={pathname === item.href ? "page" : undefined}
              onClick={() => setOpen(false)}
              className="rounded-md px-3 py-3 text-base font-medium text-navy-800 hover:bg-navy-50"
            >
              {item.label}
            </Link>
          ))}
          <div className="mt-4 flex flex-col gap-3 px-3">
            <Button href="/appointment" variant="secondary" size="lg" tabIndex={open ? 0 : -1} className="w-full">
              Book Appointment
            </Button>
            <Button href="/home-visit" variant="primary" size="lg" tabIndex={open ? 0 : -1} className="w-full">
              Request Home Visit
            </Button>
          </div>
        </nav>
      </div>
    </header>
  );
}
