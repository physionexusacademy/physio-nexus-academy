# When "the site does not open" — outage runbook

Physio Nexus Academy runs on Cloudflare Workers (`physionexusacademy.com`). Two very different things look the same to a visitor
("This site can't be reached", `ERR_CONNECTION_RESET`):

| | The **server side** is down | The **visitor's network** cuts the connection |
|---|---|---|
| Who sees it | Everyone, everywhere | Some people, on some networks, on and off |
| The hourly **Uptime monitor** | goes red | stays green |
| Other sites on the same phone | work | work |
| Who can fix it | us (deploy, Cloudflare) | the visitor's ISP / router; we can only give them ways around |

Since `ERR_CONNECTION_RESET` with a healthy server has been seen on PCs and phones in Pakistan, the second row is the usual case.

## Confirmed cause on 21 Nov 2026: the network's automatic DNS

The owner's PC and phone could not open the site on the provider's **automatic DNS** and opened it at once after DNS was set by hand. The checks of the same day show the site's own DNS is healthy:
every public resolver (1.1.1.1, 1.0.0.1, 8.8.8.8, 8.8.4.4, 9.9.9.9, 208.67.222.222, 94.140.14.14) and both Cloudflare name servers answer with the same two addresses
(104.21.8.143, 172.67.188.121), the answers do not change with a Pakistani client subnet (PTCL, Jazz, Nayatel), and every Cloudflare address (also 188.114.96.6 and 188.114.97.6) answers the site
with status 200 and a valid certificate. The HTTPS record with Encrypted Client Hello (`ech=`) is published. So the fault is in the provider's resolver/path, which only the visitor or the provider can change:

- With automatic DNS the browser may not learn the site's Encrypted Client Hello from DNS (many provider and router resolvers drop the HTTPS record), so the site's name travels in the clear and a filter can reset the connection (`ERR_CONNECTION_RESET`).
  With Secure DNS (DNS over HTTPS) or a public DNS the browser gets that record, hides the name, and the site opens. This is why Encrypted Client Hello is kept **on** (the deploy re-checks it) and why HTTP/3 stays off.
- The server side cannot change a visitor's resolver. What it does: keeps the DNS records healthy (the hourly monitor checks them), keeps the backup address, and the offline page tells the visitor how to change DNS.

**Confirmed on 21 Nov 2026:** with the provider's automatic DNS the main address fails on the owner's PC, while the backup address (workers.dev) opens. So the backup address is the answer for students who cannot change DNS: give them that address first.

**Automatic route to the backup address (worker 2026-11-21-4 and 2026-11-21-5).** The worker itself (2026-11-21-5) moves a public page to the same path on the backup address as soon as the main address fails and the backup answers (a live page beats a saved one). Anything else gets `/offline` instead (2026-11-21-4): When the connection to the main name is cut, a visitor who has opened the site before gets `/offline`. That page tests the backup address in the background; if it answers, a green box appears and, for a public page, the browser is moved to the same page there after 4 seconds ("Stay here" cancels it). Signed-in pages (account, RehabVerse patient pages, admin) are not moved on their own: the box offers the backup home page. If the backup address is cut as well, the page stays and shows the DNS steps. A first-time visitor never gets this page, so the backup address and the DNS steps must reach them another way (the shareable card, WhatsApp, Instagram).

How to change DNS (the steps are also on `/offline`):

| Device | Steps |
|---|---|
| Android | Settings > Network > Private DNS > Private DNS provider hostname > `one.one.one.one` |
| iPhone | Install the free **1.1.1.1** app and turn it on |
| Chrome (PC or phone) | Settings > Privacy and security > Security > Use secure DNS > Cloudflare |
| Windows 11 | Settings > Network & internet > Wi-Fi (or Ethernet) > Hardware properties > DNS server assignment > Manual > IPv4 on > Preferred `1.1.1.1`, Alternate `1.0.0.1`, DNS over HTTPS On (automatic template) |
| Router (helps every device at home) | Router page > Internet / WAN > DNS > Manual > `1.1.1.1` and `1.0.0.1` |

To prove it on one computer (automatic DNS on): `nslookup physionexusacademy.com` and `nslookup -type=HTTPS physionexusacademy.com`, then the same with ` 1.1.1.1` at the end. If the answers differ (other addresses, or no HTTPS answer), the provider's resolver is the cause and this is the evidence to give the provider.

## 1. First two minutes (owner)

1. **Actions > Uptime monitor** (runs every hour; "Run workflow" runs it now). Open the run summary table:
   - all rows *up* → the server side is healthy; go to section 3 (it is the visitor's network).
   - a row *DOWN* → go to section 2.
2. Open the site on your own phone **on mobile data** and then **on Wi-Fi**. If one works and the other does not, it is that network's filter (section 3).

## 2. The server side is down

1. **Actions > Deploy PNA to Cloudflare**: did the last deploy fail? A red deploy never replaces the live site, so look at the live version rather than the red run.
2. **Actions > Diagnose Cloudflare (read-only) > Run workflow**. It prints the zone, certificate, custom domain, recent changes and how the site answers from a GitHub machine.
3. Cloudflare dashboard > **Workers & Pages > physio-nexus-academy**: look at *Metrics* (errors, requests) and *Deployments* (which version is live). The Free plan allows 100,000 requests a day; going over shows as errors until the next day. Usage has been about 11,000 a day.
4. A bad release: Deployments > pick the previous version > **Rollback**.
5. Only after that, ask for help with the run link and the time the monitor went red.

## 3. The visitor's network cuts the connection (monitor green)

The site is healthy; the visitor's mobile network, Wi-Fi router or ISP resets the connection to this name. What helps, easiest first:

1. **Wait a minute and press reload.** It is often on and off.
2. **Switch network**: mobile data <-> Wi-Fi. If one works, nothing is wrong with the phone.
3. **Type `https://` in front**: `https://physionexusacademy.com` (the site also sends plain `http://` visits to `https://`).
4. **Use the backup address**: <https://physio-nexus-academy.physionexusacademypk.workers.dev> (same site, different name, so a filter on the main name does not catch it; it is never shown in Google).
5. **Change the DNS** (the confirmed cause; see the table above). Chrome: Settings > Privacy and security > Security > *Use secure DNS* > Cloudflare; Android: Settings > Network > Private DNS > `one.one.one.one`; iPhone: install the free 1.1.1.1 app.
6. A **VPN** or the free **1.1.1.1 / WARP** app.
7. A visitor who has opened the site once before still sees the pages they visited, and a page with these tips (`/offline`), even when the connection is cut (the browser keeps those copies; it works only for pages opened before, in a browser that allows service workers).

Send students this (WhatsApp-ready):

> Agar Physio Nexus Academy na khule, wajah aksar aap ke internet ka "automatic DNS" hota hai. Isay badal dein:
> Android: Settings > Network > Private DNS > "Private DNS provider hostname" > one.one.one.one
> iPhone: free "1.1.1.1" app install karke on karein
> Chrome: Settings > Privacy and security > Security > Use secure DNS > Cloudflare
> Phir bhi na khule to backup address: https://physio-nexus-academy.physionexusacademypk.workers.dev
> Help ke liye WhatsApp: 0348 900 9028

## 4. Ask the ISP (or PTA) to stop cutting the connection

Only if one provider's customers are affected over days. Collect first: the provider name, the city, the time, a screenshot of the error, and the result of the same site on another provider. Then send (e.g. through the provider's complaint line or PTA's complaint portal):

> Subject: Our educational website physionexusacademy.com is reset on your network
>
> Our website https://physionexusacademy.com (physiotherapy education, no restricted content) is served through Cloudflare. Customers on your network (provider ..., city ..., since ...) get ERR_CONNECTION_RESET when opening it, while the same site opens on other networks and the server shows no errors. Please check whether the connection to the name physionexusacademy.com, or to Cloudflare's addresses, is being reset by a filter or a middlebox on your network and, if so, whitelist it. Contact: Dr. Sajjad Raza PT, WhatsApp 0348 900 9028, physionexusacademypk@gmail.com.

## What the server already does for stability

- **Always Use HTTPS** is on (every `http://` visit is sent to `https://`); the deploy re-checks and re-applies it.
- **HTTP/3 (QUIC) is off**, so every browser uses plain TLS over TCP, which more networks let through than QUIC.
- **Service worker + the offline page (`/offline`)** (see `public/sw.js`): public pages a visitor has opened keep working when the connection is cut; nothing private is ever saved (tested by `scripts/sw-resilience-test.cjs`, checked on every deploy by `npm run validate:resilience`).
- **Backup address** on `workers.dev` (`src/lib/host-policy.ts`): answers like the real site, marked `noindex`, canonical to the real address, `robots.txt` disallows everything, so Google keeps ranking the real address.
- **Uptime monitor** (`.github/workflows/uptime-monitor.yml`): hourly check of the real address, the backup address, the offline page and the http→https redirect.

What the server **cannot** do: change what a visitor's own ISP or router does, or help a visitor who has never opened the site and cannot reach either address.

## If the backup address is used for sign-in

Signing in on the backup address works only if Supabase allows it: Supabase dashboard > Authentication > URL Configuration > add `https://physio-nexus-academy.physionexusacademypk.workers.dev/**` to *Redirect URLs*. Browsing the site needs nothing.
