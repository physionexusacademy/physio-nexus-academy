import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import vm from "node:vm";
import { PRIMARY_ORIGIN, backupRobotsTxt, isBackupHost, withBackupHeaders } from "../src/lib/host-policy.ts";

/**
 * Stability against a connection that is cut on the way (a filter or a router resetting it): the service worker keeps public pages the person has opened,
 * never anything private; the offline page tells what to try; the backup (workers.dev) address answers but is never indexed; the real address is untouched.
 * (The service worker's behaviour in a real browser is tested by scripts/sw-resilience-test.cjs.)
 */
let checks = 0;
const ok = (condition: boolean, message: string) => { checks++; assert.ok(condition, message); };
const read = (path: string) => readFileSync(new URL("../" + path, import.meta.url), "utf8");

// --- the service worker: load it in a sandbox and ask its own patterns
const source = read("public/sw.js");
ok(source.includes("PNA update-first service worker."), "sw.js: keeps the marker the deploy's smoke test looks for");
ok(/const VERSION = "[^"]+";/.test(source), "sw.js: has a VERSION that old caches are named by");
ok(/const OFFLINE = "\/offline";/.test(source) && !/OFFLINE = "\/offline\.html"/.test(source), "sw.js: keeps the offline page at /offline (Cloudflare redirects /offline.html, and a redirected answer cannot be shown to a navigation)");
ok(/const clean = \(response\) => \(response\.redirected/.test(source) && /return clean\(offline\)/.test(source) && /return clean\(saved\)/.test(source), "sw.js: a saved or offline answer that came through a redirect is rebuilt before it is shown");
const sandbox: Record<string, unknown> = { self: { location: { origin: "https://physionexusacademy.com" }, addEventListener() {}, skipWaiting() {}, clients: { claim() {} } }, URL, Request, Response, caches: {}, fetch() {}, setTimeout, Promise };
vm.createContext(sandbox);
vm.runInContext(source, sandbox);
const test = (pattern: string, path: string) => vm.runInContext(`${pattern}.test(${JSON.stringify(path)})`, sandbox) as boolean;

for (const path of ["/", "/learn", "/learn/gait-cycle", "/learn/paths/knee-rehab-mastery", "/skills", "/skills/goniometry", "/manual-therapy/mckenzie-mdt", "/conditions/lateral-ankle-sprain", "/virtual-patient", "/rehabverse", "/rehabverse/library", "/symptom-checker", "/faq", "/workshops/some-workshop"]) {
  ok(test("SAVEABLE_PAGE", path), `sw.js: a public page is saved: ${path}`);
}
for (const path of ["/account", "/account/reset", "/admin", "/admin/login", "/api/daily-challenge/status", "/rehabverse/me", "/rehabverse/me/day/123", "/rehabverse/login", "/rehabverse/register", "/rehabverse/start", "/rehabverse/forgot", "/rehabverse/reset", "/rehabverse/auth/callback", "/daily-challenge", "/leagues", "/verify"]) {
  ok(!test("SAVEABLE_PAGE", path), `sw.js: a signed-in, live or private page is never saved: ${path}`);
}
ok(test("DATA_FILE", "/teacher-data/lessons/gait-cycle.json") && test("DATA_FILE", "/skills-data/goniometry.json") && test("DATA_FILE", "/virtual-patient/patient.glb"), "sw.js: lesson, skills and patient data are kept");
ok(!test("DATA_FILE", "/api/x.json") && !test("DATA_FILE", "/voice/george/a.mp3") && !test("DATA_FILE", "/account/export.json"), "sw.js: API answers and the large voice files are not kept");
ok(/!url\.search/.test(source) && /!response\.redirected/.test(source) && /no-store\|private/.test(source), "sw.js: never saves a URL with a query, a redirected answer, or a private/no-store response");
ok(/request\.method !== "GET"/.test(source) && /headers\.has\("authorization"\)/.test(source) && /url\.origin !== self\.location\.origin/.test(source), "sw.js: only plain same-origin GET requests are touched");
ok(/const BACKUP = "https:\/\/physio-nexus-academy\.physionexusacademypk\.workers\.dev";/.test(source) && /const ON_BACKUP = \/\\\.workers\\\.dev\$\/i\.test\(self\.location\.hostname\)/.test(source) && /Response\.redirect\(BACKUP \+ url\.pathname \+ url\.search, 302\)/.test(source) && /if \(ON_BACKUP \|\| !SAVEABLE_PAGE\.test\(url\.pathname\)\) return null/.test(source) && /const live = await viaBackup\(url\);\s*if \(live\) return live;/.test(source), "sw.js: when the main address fails and the backup answers, a public page opens there (never from the backup itself, never a signed-in page)");
ok(/for \(const name of await caches\.keys\(\)\) if \(name\.startsWith\("pna-"\)/.test(source), "sw.js: a new version removes the old PNA caches and no one else's");

// --- the page that registers it
const runtime = read("src/components/PwaRuntime.tsx");
ok(/process\.env\.NODE_ENV !== "production"/.test(runtime) && /getRegistrations/.test(runtime), "PwaRuntime: the worker is not registered in development (and an old one is removed there)");
ok(/pna-save-page/.test(runtime) && /firstVisit/.test(runtime), "PwaRuntime: the first page a person opens is saved too");

// --- the offline page
const offline = read("public/offline.html");
ok(/We can't reach the site right now/.test(offline) && /Dobara koshish/.test(offline), "offline page: says what happened in English and Roman Urdu");
ok(/fetch\("\/offline\?ping=/.test(offline) && !/fetch\("\/offline\.html/.test(offline), "offline page: asks /offline (not the redirecting /offline.html) whether the connection is back");
ok(/automatic DNS/i.test(offline) && /one\.one\.one\.one/.test(offline) && /Private DNS/.test(offline) && /DNS over HTTPS/i.test(offline), "offline page: names the usual cause (the network's automatic DNS) and how to change it on Android, iPhone, Chrome and Windows");
ok(/https:\/\/physio-nexus-academy\.physionexusacademypk\.workers\.dev/.test(offline) && /secure DNS/i.test(offline) && /1\.1\.1\.1/.test(offline) && /https:\/\//.test(offline), "offline page: names the backup address, Secure DNS, 1.1.1.1 and typing https://");
ok(/mode: "no-cors"/.test(offline) && /location\.replace\(target\)/.test(offline) && /var onBackup = \/\\\.workers\\\.dev\$\/i\.test\(location\.hostname\)/.test(offline) && /SIGNED_IN = \/\^\\\/\(\?:account\|admin\|api\|rehabverse/.test(offline), "offline page: when the backup address answers it opens a public page there by itself (never from the backup address itself, never a signed-in page) and a button lets the visitor stay; and only when the main address really does not answer");
ok(/fetch\("\/offline\?check=/.test(offline), "offline page: asks the main address first, so a page opened on purpose while the connection works stays put");
ok(!/<(?:script|img|link)[^>]+(?:src|href)="https?:\/\/(?!physionexusacademy)/.test(offline), "offline page: loads nothing from other sites");
const config = read("src/lib/site-config.ts");
const phone = /phoneDisplay: "([^"]+)"/.exec(config)?.[1] ?? "";
ok(phone !== "" && offline.includes(phone), `offline page: shows the real contact number from the site config (${phone})`);

// --- the backup address
const wrangler = read("wrangler.jsonc");
ok(/"workers_dev": true/.test(wrangler) && /"custom_domain": true/.test(wrangler) && /"pattern": "physionexusacademy\.com"/.test(wrangler) && /"preview_urls": false/.test(wrangler), "wrangler: answers on workers.dev too, the real custom domain is kept, preview URLs stay off");
ok(isBackupHost("physio-nexus-academy.physionexusacademypk.workers.dev") && isBackupHost("X.WORKERS.DEV"), "host policy: workers.dev is the backup host");
ok(!isBackupHost("physionexusacademy.com") && !isBackupHost("www.physionexusacademy.com") && !isBackupHost("localhost") && !isBackupHost("workers.dev.evil.com"), "host policy: the real address (and anything else) is not touched");
const answered = withBackupHeaders(new Response("<html></html>", { status: 200, headers: { "content-type": "text/html", "cache-control": "public, max-age=60" } }), new URL("https://physio-nexus-academy.physionexusacademypk.workers.dev/learn/gait-cycle?x=1"));
ok(answered.headers.get("x-robots-tag") === "noindex, nofollow", "host policy: every answer on the backup address says noindex, nofollow");
ok(answered.headers.get("link") === `<${PRIMARY_ORIGIN}/learn/gait-cycle>; rel="canonical"`, "host policy: and points to the same page on the real address");
ok(answered.status === 200 && answered.headers.get("content-type") === "text/html" && answered.headers.get("cache-control") === "public, max-age=60", "host policy: nothing else about the answer changes");
const robots = backupRobotsTxt();
ok((await robots.text()).includes("Disallow: /") && robots.headers.get("x-robots-tag") === "noindex, nofollow", "host policy: robots.txt of the backup address disallows everything");
const worker = read("custom-worker.ts");
ok(/isBackupHost\(url\.hostname\)/.test(worker) && /return handle\(request, url, env, ctx\);/.test(worker), "worker: only the backup host goes through the policy; the real address goes straight to the page logic as before");

// --- the deploy checks the backup address and keeps the smoke test marker
const deploy = read(".github/workflows/deploy-cloudflare-production.yml");
ok(/settings\/ech/.test(deploy) && /DESIRED_ECH: "(?:on|off)"/.test(deploy), "deploy: keeps Encrypted Client Hello at the chosen state (DESIRED_ECH), so a test of it is not undone by the next deploy");
const monitor = read(".github/workflows/uptime-monitor.yml");
ok(/DNS of \$name/.test(monitor) && /HTTPS record/.test(monitor) && /ech=/.test(monitor), "monitor: checks that every public resolver answers and reports whether the HTTPS record carries ECH");
ok(/offline-live:/.test(deploy) && deploy.includes("scripts/verify-offline-production.cjs"), "deploy: a real browser checks the offline behaviour on the live site after every release");
ok(deploy.includes("PNA update-first service worker.") && /physio-nexus-academy\.physionexusacademypk\.workers\.dev/.test(deploy), "deploy: still checks the service worker and now checks the backup address too");

console.log(`Resilience: ${checks} checks passed (public pages are saved and nothing private is; the offline page helps; the backup address answers but is never indexed; the real address is untouched).`);
