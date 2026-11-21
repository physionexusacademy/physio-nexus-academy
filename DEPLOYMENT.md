# Deploying to production

This assumes the free tiers of Vercel (hosting) and Supabase (database) — enough for a site
this size, upgradeable later without changing any code.

## 1. Supabase — production project

1. Create a new project at [supabase.com](https://supabase.com) (use a separate one from any
   project you used for local testing — don't reuse a dev project for production data).
2. SQL Editor → run `supabase/schema.sql` in full.
3. SQL Editor → run the bucket-creation and policy SQL from `supabase/storage-setup.md`.
4. Follow `supabase/creating-first-admin.md` to create your real admin login.
5. Settings → API → note down:
   - Project URL
   - `anon` `public` key
   - `service_role` key (⚠️ keep this secret — never put it in anything client-side)

## 2. Domain

Decide the final domain now if possible (e.g. `physionexusacademy.com`) — it's used in a few
places in code (`src/app/layout.tsx` metadataBase, `src/app/sitemap.ts`, `src/app/robots.ts`).
If you don't have the final domain yet, deploy anyway and do a find-and-replace for
`physionexusacademy.com` once you do.

## 3. Vercel — hosting

1. Push this project to a GitHub repository (Vercel deploys from Git).
2. At [vercel.com](https://vercel.com) → **Add New → Project** → import that repository.
3. Framework preset: Next.js (auto-detected).
4. **Environment Variables** — add every key from `.env.example`:

   | Key | Value |
   |---|---|
   | `NEXT_PUBLIC_SUPABASE_URL` | from Supabase step 5 |
   | `NEXT_PUBLIC_SUPABASE_ANON_KEY` | from Supabase step 5 |
   | `SUPABASE_SERVICE_ROLE_KEY` | from Supabase step 5 — mark it **sensitive** in Vercel |
   | `NEXT_PUBLIC_SITE_URL` | your final domain, e.g. `https://physionexusacademy.com` |

5. Click **Deploy**.

## 4. Connect your domain

Vercel project → Settings → Domains → add your domain → follow the DNS instructions Vercel
shows you (usually one CNAME or A record at your domain registrar). Propagation can take up
to 24–48 hours, though it's often much faster.

## 5. Supabase Auth URL settings

Supabase → Authentication → URL Configuration:
- **Site URL**: your production domain
- **Redirect URLs**: add your production domain too (needed for the admin login flow to work
  correctly once deployed)

## 6. Smoke test after deploy

Once live, check:
- [ ] Homepage loads, logo/founder photo show correctly
- [ ] Submit a test appointment request → confirm it appears in `/admin/appointments`
- [ ] Log into `/admin/login` with your real admin account
- [ ] Publish a test workshop → confirm it appears on `/workshops`
- [ ] Upload a test PDF as a Public resource → confirm the Download link on `/resources` works
- [ ] Delete your test data once confirmed working

## Costs at this scale

Both Vercel's and Supabase's free tiers comfortably cover a single-clinic/academy site like
this (low thousands of monthly visitors, a handful of admin users). You'll only need to
upgrade if traffic or storage grows significantly — Supabase's dashboard shows current usage
against the free-tier limits at any time.

## "This site can't be reached" / ERR_QUIC_PROTOCOL_ERROR in Chrome

Cloudflare tells browsers to use HTTP/3 (QUIC, over UDP) with an `alt-svc: h3` header. On networks, VPNs or security software that mishandle QUIC, Chrome then
cannot connect and shows `ERR_QUIC_PROTOCOL_ERROR`, often on the first visit of the day. HTTP/2 over TCP works everywhere, so every deploy switches HTTP/3 **off**
for the zone (workflow step "Turn off HTTP/3 (QUIC) …", through the Cloudflare API, idempotent, never blocks a deploy).

- If the deploy log says the token may not edit zone settings: give the API token `Zone > Zone Settings > Edit` (and `Zone > Zone > Read`) for physionexusacademy.com, or switch it off by
  hand: Cloudflare dashboard > physionexusacademy.com > Speed > Settings (older menu: Network) > HTTP/3 (with QUIC) > Off.
- Check: `curl -sI https://physionexusacademy.com/ | grep -i alt-svc` prints nothing once it is off.
- A visitor who still sees the error right now can open `chrome://flags/#enable-quic`, set it to Disabled and restart Chrome; Chrome also forgets the old advice after 24 hours.
