/** Adds ?path=<slug> to a lesson link, keeping any #anchor at the end. Client-safe. */
export function withPath(href: string, pathSlug?: string | null): string {
  if (!pathSlug) return href;
  const [base, hash] = href.split("#");
  const joiner = base.includes("?") ? "&" : "?";
  return `${base}${joiner}path=${encodeURIComponent(pathSlug)}${hash ? `#${hash}` : ""}`;
}
