/**
 * Live SEO check (run after every deploy; also usable locally with SEO_BASE=http://127.0.0.1:3100):
 *   node scripts/verify-seo-production.mjs
 *
 * Fails on what search engines punish: a non-200 page, noindex on a page that is meant to rank, a canonical that is not the page itself,
 * a missing title / description / single H1, duplicate titles, no structured data. Length problems are reported as warnings.
 * Checks every hub and feature page plus a sample of each content section, and the sitemap, robots.txt, favicon and llms.txt.
 */
const BASE = (process.env.SEO_BASE ?? "https://physionexusacademy.com").replace(/\/$/, "");
const PUBLIC = "https://physionexusacademy.com";

const HUBS = ["/", "/learn", "/skills", "/virtual-patient", "/rehabverse", "/rehabverse/library", "/conditions", "/symptom-checker", "/daily-challenge", "/leagues", "/account",
  "/case-lab", "/manual-therapy", "/manual-therapy/regions", "/msk-special-tests", "/clinical-visual-atlas", "/workshops", "/training", "/resources", "/about", "/founder", "/faculty",
  "/contact", "/appointment", "/home-visit", "/patient-services", "/reviews", "/faq", "/research", "/stupid-intern-diaries", "/locations/karachi", "/locations/hyderabad"];
// pages that legitimately have no Breadcrumb/entity block of their own beyond the site-wide graph
const NO_PAGE_SCHEMA = new Set(["/"]);

const errors = [];
const warnings = [];
const pick = (html, re) => (html.match(re) || [])[1]?.replace(/\s+/g, " ").trim() ?? "";
const decode = (s) => s.replace(/&amp;/g, "&").replace(/&#x27;|&#39;/g, "'").replace(/&quot;/g, '"');

async function get(path) {
  for (let attempt = 1; attempt <= 3; attempt++) {
    try {
      const response = await fetch(`${BASE}${path}${path.includes("?") ? "&" : "?"}seo=${Date.now()}`, { redirect: "follow", signal: AbortSignal.timeout(30000) });
      return { status: response.status, type: response.headers.get("content-type") ?? "", text: await response.text() };
    } catch (error) {
      if (attempt === 3) return { status: 0, type: "", text: String(error) };
      await new Promise((r) => setTimeout(r, 1500 * attempt));
    }
  }
}

function inspect(path, html) {
  const title = decode(pick(html, /<title[^>]*>([\s\S]*?)<\/title>/i));
  const desc = decode(pick(html, /<meta[^>]+name="description"[^>]+content="([^"]*)"/i) || pick(html, /<meta[^>]+content="([^"]*)"[^>]+name="description"/i));
  const canonical = pick(html, /<link[^>]+rel="canonical"[^>]+href="([^"]*)"/i) || pick(html, /<link[^>]+href="([^"]*)"[^>]+rel="canonical"/i);
  const robots = pick(html, /<meta[^>]+name="robots"[^>]+content="([^"]*)"/i);
  const h1s = [...html.matchAll(/<h1[\s>]/gi)].length;
  const ld = [...html.matchAll(/<script type="application\/ld\+json"[^>]*>([\s\S]*?)<\/script>/gi)].length;
  const expected = `${PUBLIC}${path === "/" ? "" : path}`.replace(/\/$/, "");
  const where = path;
  if (!title) errors.push(`${where}: no <title>`);
  else if (title.length > 66) warnings.push(`${where}: title is ${title.length} chars (Google shows ~60): ${title}`);
  else if (title.length < 20) warnings.push(`${where}: title only ${title.length} chars`);
  if (!desc) errors.push(`${where}: no meta description`);
  else if (desc.length < 70 || desc.length > 170) warnings.push(`${where}: description is ${desc.length} chars`);
  if (!canonical) errors.push(`${where}: no canonical`);
  else if (canonical.replace(/\/$/, "") !== expected) errors.push(`${where}: canonical is ${canonical}, expected ${expected}`);
  if (/noindex/i.test(robots)) errors.push(`${where}: noindex`);
  if (h1s !== 1) errors.push(`${where}: ${h1s} <h1> elements (expected 1)`);
  if (!NO_PAGE_SCHEMA.has(path) && ld < 2) warnings.push(`${where}: no page-level structured data`);
  return { title };
}

const titles = new Map();
async function check(path) {
  const page = await get(path);
  if (page.status !== 200) return errors.push(`${path}: HTTP ${page.status}`);
  const { title } = inspect(path, page.text);
  if (title) titles.set(title, [...(titles.get(title) ?? []), path]);
}

// 1. sitemap → sample of every section
const sitemap = await get("/sitemap.xml");
let sampled = [];
if (sitemap.status !== 200) errors.push(`/sitemap.xml: HTTP ${sitemap.status}`);
else {
  const urls = [...sitemap.text.matchAll(/<loc>([^<]+)<\/loc>/g)].map((m) => m[1].replace(PUBLIC, ""));
  if (urls.length < 300) errors.push(`/sitemap.xml lists only ${urls.length} URLs`);
  if (!/<lastmod>/.test(sitemap.text)) errors.push("/sitemap.xml has no <lastmod> dates");
  const withDate = (sitemap.text.match(/<lastmod>/g) ?? []).length;
  if (withDate < urls.length * 0.95) warnings.push(`/sitemap.xml: only ${withDate} of ${urls.length} URLs have <lastmod>`);
  for (const hub of HUBS) if (!urls.includes(hub === "/" ? "" : hub) && !urls.includes(hub)) errors.push(`${hub}: missing from the sitemap`);
  const bySection = new Map();
  for (const url of urls) {
    const segments = url.split("/").filter(Boolean);
    if (segments.length < 2) continue;
    const key = segments.slice(0, segments[0] === "manual-therapy" && segments[1] === "regions" ? 2 : 1).join("/");
    bySection.set(key, [...(bySection.get(key) ?? []), url]);
  }
  for (const list of bySection.values()) sampled.push(...[list[0], list[Math.floor(list.length / 2)], list[list.length - 1]]);
  sampled = [...new Set(sampled)];
}

const paths = [...new Set([...HUBS, ...sampled])];
let next = 0;
await Promise.all(Array.from({ length: 4 }, async () => { while (next < paths.length) await check(paths[next++]); }));
for (const [title, list] of titles) if (list.length > 1) errors.push(`duplicate title "${title}" on ${list.join(", ")}`);

// 2. site files
const robots = await get("/robots.txt");
if (robots.status !== 200 || !/Sitemap:\s*https:\/\/physionexusacademy\.com\/sitemap\.xml/.test(robots.text)) errors.push("/robots.txt must be 200 and point at the sitemap");
if (/^Disallow:\s*\/\s*$/m.test(robots.text)) errors.push("/robots.txt blocks the whole site");
for (const file of ["/favicon.ico", "/llms.txt", "/manifest.webmanifest"]) { const r = await get(file); if (r.status !== 200) errors.push(`${file}: HTTP ${r.status}`); }
const home = await get("/");
for (const needle of ['"SiteNavigationElement"', '"alternateName"', '"WebSite"', '"SearchAction"']) if (!home.text.includes(needle)) errors.push(`home page structured data lacks ${needle}`);

console.log(`Checked ${paths.length} pages on ${BASE}`);
if (warnings.length) { console.log(`\n${warnings.length} warning(s):`); warnings.slice(0, 40).forEach((w) => console.log("  - " + w)); }
if (errors.length) { console.log(`\n${errors.length} ERROR(S):`); errors.forEach((e) => console.log("  ✗ " + e)); process.exit(1); }
console.log("\nSEO checks passed.");
