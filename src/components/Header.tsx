"use client";

import { useState } from "react";
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
          <span className="font-heading text-lg font-semibold leading-tight text-navy-800 sm:text-xl">
            Physio Nexus Academy
          </span>
        </Link>

        {/* Desktop nav */}
        <nav className="hidden items-center gap-6 lg:flex" aria-label="Main navigation">
          {mainNav.slice(0, 8).map((item) => (
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

        <div className="hidden items-center gap-3 lg:flex">
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
