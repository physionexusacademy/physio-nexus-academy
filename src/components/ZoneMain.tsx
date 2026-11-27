"use client";

import { usePathname } from "next/navigation";

/**
 * The page's <main>. Every page sits in the dark 3D zone (src/app/dark-zone.css) except the patient side of
 * RehabVerse, which keeps its light, high-contrast clinic look: patients of every age and reading level use it.
 * (The therapist screens under /admin/rehabverse stay in the zone.)
 */
export function ZoneMain({ children }: { children: React.ReactNode }) {
  const path = usePathname() ?? "";
  const light = path === "/rehabverse" || path.startsWith("/rehabverse/");
  return (
    <main id="main-content" className={light ? "flex-1" : "nx-dz flex-1"}>
      {children}
    </main>
  );
}
