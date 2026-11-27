# Members-only website

A switch (Admin > Members access) decides whether the website is open to everyone or only to **approved members**. It is **off** until you turn it on.
New people register or sign in at `/members`; the clinic approves every new account; nobody sees the site until then.

## What the visitor sees
1. **Not signed in** → sent to `/members`: "Sign in" or "New account" (name, phone or WhatsApp, who they are, city, email, password). No confirmation e-mail: the clinic checks the person by phone or WhatsApp.
2. **Asked for access** → `/members/waiting` ("Your request is with the clinic", WhatsApp the clinic). The page checks every 20 seconds and moves on by itself when approved.
3. **Approved** → straight to the page they wanted. **Rejected or suspended** → `/members/blocked` with the clinic's written reason.

## What you do (Admin > Members access)
Tabs: Waiting, Approved, Rejected, Suspended, Everyone, with search by name, e-mail, phone or city. **Approve** (then "Tell them on WhatsApp"), **Reject** (a reason the person can read is required),
**Suspend** an approved person (reason required), **Reinstate**. A rejected request can be approved later. You cannot lock yourself out. Every decision is in the audit log.
The same page has the **Members-only mode** switch (it asks for confirmation before turning on).

## Who is approved automatically
When the migration is applied, people who already use the site are approved so nobody is locked out: staff (owner, admin, editor), every student with a profile, and every RehabVerse patient with an **active** record.
After that, a person with an active RehabVerse patient record also counts as approved, but a suspension or rejection always wins. Everyone else who signs in without a request gets a pending one.

## How the gate works (and why you can trust it)
* The **Worker** (`custom-worker.ts`) runs the gate before anything else, before the edge cache and before any page, so a prebuilt or cached page cannot be served around it. It asks the database whether the mode is on (about every 30 seconds per Worker instance); `MEMBERS_ONLY=1` in the Worker's variables forces it on.
* A request passes only if it carries the **approval cookie** `pna_ma`: signed (HMAC-SHA256) with the server's own key (the same service key the reminder job uses; nothing new to set up), `HttpOnly`, `Secure`, valid for **10 minutes**.
* Without it, a page request goes to `/members/check`, which looks at who is signed in (refreshing the sign-in), asks the database for their standing and sets the cookie only if they are approved. Anything that is not a page request gets a plain 401.
* The member table is closed to the API (row-level security and no grants); every read and write goes through database functions that check staff and the allowed transitions.
* A suspension takes effect within about 10 minutes (when the cookie runs out). Signing out clears the cookie.

## What stays open when the mode is on
`/members/*`, `/admin/*` (its own sign-in and role check), `/api/*` (each route checks who is calling: webhooks, cron, signed-in actions), `/_next/*`, `/.well-known/*`, `robots.txt`, `sitemap*.xml`, `/offline`, the icons,
and RehabVerse's own sign-in and patient pages (`/rehabverse/login|register|forgot|reset|pending|auth/*`, `/rehabverse/me/*`, `/rehabverse/start`), which the clinic already approves patient by patient. The list is in `src/lib/members/paths.ts`, one reason per line.
Files in `public/` (images, lesson and skill data, model files) are served by Cloudflare's static assets before the Worker and cannot be gated by the Worker; they are not private content.

## What it costs you (read before turning it on)
* **Search engines and first-time visitors see only the sign-in page.** Google cannot index the lessons, the Skills Lab or the conditions guide, and the Google "sitelinks" will fade. That is the point of the mode, but it is a business decision.
* **The deploy's own live checks of the public site** (smoke test, live SEO, offline behaviour, pathway photos at five widths) get through the gate with a pass, so the deploy stays green while the mode is on. The pass is derived from the server key (`scripts/ci-members-pass.sh`: HMAC-SHA256 of a fixed label), so there is no extra secret to create: the deploy stores it in the Worker as `MEMBERS_CI_TOKEN`, and each live check works out the same value and masks it in the log. curl sends it as the `pna_ci` cookie (through `CURL_HOME/.curlrc`, only after the steps that call the Cloudflare API), the browser checks add it as a cookie for this site only (`scripts/ci-members-pass.cjs`; never a header, which a browser would send to every site a page loads from), and the Worker also accepts it in the `x-pna-ci` header. Rotating the server key rotates the pass at the next deploy.
* Anyone who is not a member cannot book an appointment or send a contact message through the website pages (the pages are gated); the phone number and WhatsApp on the sign-in page remain.

## Switching it off in an emergency
Admin > Members access > "Open the website to everyone again". If the admin area itself is unreachable: remove `MEMBERS_ONLY` from the Worker's variables and set the switch in the database (`update site_access_settings set members_only = false`).

## Tests
`npm run validate:site-members` (cookie, open addresses, the Worker's decisions, the wiring; 17 safeguards broken on purpose, each caught), `npm run validate:site-members-db` (the real migration on Postgres 17), the browser run `scripts/rehabverse-local/e2e-members.cjs`, and a real Worker run (`opennextjs-cloudflare build`, then `wrangler dev`) that proves prebuilt pages cannot be reached without approval.
