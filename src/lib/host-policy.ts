/**
 * The site answers on its own address, https://physionexusacademy.com, and, as a backup for networks that cut the connection to that name, on the Worker's
 * workers.dev address (wrangler.jsonc: workers_dev). The backup address must never compete with the real one: search engines are told to ignore it (a
 * noindex header, a canonical link to the same page on the real address and a robots.txt that disallows everything), so Google keeps ranking the real address.
 * Nothing here touches a response on the real address.
 */
export const PRIMARY_HOST = "physionexusacademy.com";
export const PRIMARY_ORIGIN = `https://${PRIMARY_HOST}`;

/** True for the Worker's own workers.dev address (the backup), false for the real address, www, localhost and anything else. */
export function isBackupHost(hostname: string): boolean {
  return hostname.toLowerCase().endsWith(".workers.dev");
}

export function backupRobotsTxt(): Response {
  return new Response("User-agent: *\nDisallow: /\n", {
    headers: { "content-type": "text/plain; charset=utf-8", "x-robots-tag": "noindex, nofollow", "cache-control": "public, max-age=3600" },
  });
}

/** The same response with the headers that keep the backup address out of search results and point to the real page. */
export function withBackupHeaders(response: Response, url: URL): Response {
  const out = new Response(response.body, response);
  out.headers.set("x-robots-tag", "noindex, nofollow");
  out.headers.set("link", `<${PRIMARY_ORIGIN}${url.pathname}>; rel="canonical"`);
  return out;
}
