/**
 * Which addresses stay open to everyone when the website is members-only. Everything else needs an approved member.
 * Kept short on purpose: each line is a hole in the gate, so each has a reason.
 */
const PREFIXES: [string, string][] = [
  ["/members", "the sign-in, registration, waiting and check pages themselves"],
  ["/admin", "the admin area has its own sign-in and role check (middleware)"],
  ["/api/", "API routes check who is calling themselves (webhooks, cron, signed-in actions)"],
  ["/_next/", "the site's own scripts and styles"],
  ["/.well-known/", "standard machine-readable files"],
  ["/rehabverse/login", "RehabVerse sign-in (the clinic approves patients itself)"],
  ["/rehabverse/register", "RehabVerse account request"],
  ["/rehabverse/forgot", "RehabVerse password reset"],
  ["/rehabverse/reset", "RehabVerse password reset"],
  ["/rehabverse/pending", "RehabVerse waiting-for-the-clinic screen"],
  ["/rehabverse/auth/", "RehabVerse e-mail link landing"],
  ["/rehabverse/me", "the patient's own pages check the patient themselves"],
  ["/rehabverse/start", "the patient's first assessment checks the patient themselves"],
  ["/auth/", "e-mail link landing"],
];
const EXACT = new Set(["/favicon.ico", "/robots.txt", "/sitemap.xml", "/manifest.webmanifest", "/offline", "/sw.js", "/icon.png", "/apple-icon.png"]);

export const PUBLIC_PREFIXES = PREFIXES.map(([prefix]) => prefix);

export function isPublicPath(pathname: string): boolean {
  if (EXACT.has(pathname) || /^\/sitemap[^/]*\.xml$/.test(pathname)) return true;
  return PREFIXES.some(([prefix]) => (prefix.endsWith("/") ? pathname.startsWith(prefix) : pathname === prefix || pathname.startsWith(prefix + "/")));
}

/** Only an address on this site: never another site, never a protocol-relative link. */
export function safeNext(value: string | null | undefined, fallback = "/"): string {
  if (!value || value.length > 500 || !value.startsWith("/") || value.startsWith("//") || value.includes("\\") || /[\u0000-\u001f]/.test(value)) return fallback;
  return value;
}
