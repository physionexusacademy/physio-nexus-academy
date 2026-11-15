import assert from "node:assert/strict";
import { readdirSync, existsSync, readFileSync } from "node:fs";

/**
 * The admin workspace: the redesign must not weaken access control, must not leak the service-role client into the browser, and must keep every
 * admin section reachable from the sidebar and the command palette.
 */
const read = (path: string) => readFileSync(new URL("../" + path, import.meta.url), "utf8");

/* 1. Access control is unchanged: the layout checks the user and is_admin before anything renders; the overview page checks again before it
   reads with the service-role client; the sidebar counts are read only after that check. */
const layout = read("src/app/admin/(dashboard)/layout.tsx");
assert(layout.includes("auth.getUser()") && layout.includes('rpc("is_admin")') && layout.includes('redirect("/admin/login'), "the admin layout must verify the user and is_admin");
assert(layout.indexOf('rpc("is_admin")') < layout.indexOf("getAdminCounts()"), "the badge counts must be read only after the admin check");
const overviewPage = read("src/app/admin/(dashboard)/page.tsx");
assert(overviewPage.includes("await requireAdmin()") && overviewPage.indexOf("await requireAdmin()") < overviewPage.indexOf("getAdminOverview()"), "the overview page must call requireAdmin() before the service-role reads");
assert(overviewPage.includes('export const dynamic = "force-dynamic"'), "the overview must never be prerendered");

/* 2. Nothing server-only reaches the browser: the shell and the nav list import neither the service-role client nor the data module. */
for (const file of ["src/components/admin/AdminShell.tsx", "src/lib/admin/nav.ts", "src/lib/admin/types.ts"]) {
  const text = read(file);
  assert(!/supabase\/admin|lib\/admin\/overview|SERVICE_ROLE/.test(text), `${file} must not import the service-role client or the data module`);
}
assert(read("src/components/admin/AdminShell.tsx").startsWith('"use client"'), "the shell is a client component");
assert(!/NEXT_PUBLIC_[A-Z_]*SERVICE|SERVICE_ROLE/.test(read("src/lib/admin/overview.ts").replace(/createAdminClient/g, "")), "the data module must not read the service-role key itself");

/* 3. Every admin section is reachable: each folder with a page under (dashboard) has an item in the nav list. */
const nav = read("src/lib/admin/nav.ts");
const sections = readdirSync(new URL("../src/app/admin/(dashboard)", import.meta.url), { withFileTypes: true })
  .filter((entry) => entry.isDirectory() && existsSync(new URL(`../src/app/admin/(dashboard)/${entry.name}/page.tsx`, import.meta.url)))
  .map((entry) => entry.name);
assert(sections.length >= 10, "could not read the admin sections");
for (const section of sections) assert(nav.includes(`"/admin/${section}"`), `the admin section /admin/${section} is missing from the sidebar and palette`);

/* 4. The public header, footer and floating buttons are not shown inside the admin; motion respects the visitor's setting. */
const root = read("src/app/layout.tsx");
assert(/<PublicChrome>\s*<Header/.test(root) && /<PublicChrome>\s*<Footer/.test(root), "the root layout must wrap the public chrome in PublicChrome");
assert(read("src/components/PublicChrome.tsx").includes('"/admin"'), "PublicChrome must hide the public chrome on admin routes");
assert(/prefers-reduced-motion/.test(read("src/components/admin/admin.css")), "admin motion must respect reduced motion");
assert(read("src/components/admin/AdminShell.tsx").includes("aria-current"), "the sidebar must mark the current page for assistive technology");

console.log(`admin: ${sections.length} sections in the sidebar, access checks intact, service-role client kept out of the browser`);
