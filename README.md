# Physio Nexus Academy — Website

Next.js 14 + TypeScript + Tailwind CSS + Supabase. Built for **Dr. Sajjad Raza PT**, Founder
of Physio Nexus Academy.

## Current status: all 4 stages complete

| Stage | Scope | Status |
|---|---|---|
| 1 | Design system, all public pages, navigation, SEO basics | ✅ Done |
| 2 | Supabase schema, RLS, auth, admin dashboard CRUD, form wiring | ✅ Done |
| 3 | Remaining public pages read from DB, signed-URL PDF downloads | ✅ Done |
| 4 | Accessibility fixes, About page content wiring, deployment + backup guides | ✅ Done (this delivery) |

The build is functionally complete for launch. See "What I'd still double-check before
launch" below — mainly real-world verification (an a11y audit with actual assistive tech, a
live deploy smoke test, a legal review) rather than missing code.

## Local setup

```bash
npm install
cp .env.example .env.local
```

Then fill in `.env.local`:

1. Create a free project at [supabase.com](https://supabase.com)
2. Settings → API → copy the Project URL and `anon` `public` key into `NEXT_PUBLIC_SUPABASE_URL`
   and `NEXT_PUBLIC_SUPABASE_ANON_KEY`
3. Run `supabase/schema.sql` in the Supabase SQL Editor
4. Run the storage bucket SQL in `supabase/storage-setup.md`
5. Follow `supabase/creating-first-admin.md` to create your login

```bash
npm run dev
```

Open http://localhost:3000 for the public site, `/admin/login` for the dashboard.

## What's wired to the database right now

- **Public → DB (write)**: Appointment requests, Home Visit requests, Contact messages, and
  Workshop registrations all insert directly into Supabase.
- **Public → DB (read)**: Homepage, Workshops (list + detail), Resources, Founder page,
  Gallery, Updates and FAQ all query Supabase live. Every one of these falls back gracefully
  to a "nothing here yet" message (or, for Founder/Homepage, to the original shipped content)
  if the relevant table is still empty — nothing ever renders broken.
- **Resource downloads work end-to-end**: `/api/resources/[id]/download` checks the resource
  is actually public (via the normal RLS-respecting client), then uses a service-role client
  *only* to mint a 60-second signed URL for that one file and redirects to it. The PDF bucket
  itself stays private the whole time.
- **Admin dashboard**: Full CRUD for Workshops (+ poster upload + CSV export of registrations),
  Resources (+ PDF/cover upload), Gallery, Updates, Testimonials, FAQs, Site Settings (founder
  profile incl. photo upload, qualifications, contact info) — plus status/notes workflows for
  Appointments and Home Visit requests, and a Contact message inbox.

## What's NOT wired to the database yet

Nothing structural — every content area named in the original spec now has a working
admin-to-public data path (or, where noted, a clearly-scoped exception below).

## What I'd still double-check before launch

- **Accessibility**: I added skip-to-content, proper label/input association on every public
  form, `aria-live` regions on form success/error states, `aria-current` on active nav links,
  and fixed a real keyboard-trap bug (mobile menu links stayed tab-focusable while visually
  hidden). I have not tested this with an actual screen reader — a manual pass with VoiceOver
  or NVDA before launch is worth doing, since automated reasoning about accessibility can miss
  things real assistive tech catches.
- **No live deployment has happened.** Everything above has been reasoned through carefully
  and checked for syntax/structural correctness, but this environment has no network access,
  so `npm install` and a real build have never actually run here. Follow `DEPLOYMENT.md`, then
  do the smoke-test checklist at the bottom of it before treating this as production-ready.
- **Legal review** of Privacy Policy, Terms, Refund Policy and Medical Disclaimer — these are
  reasonable first drafts, not a substitute for actual legal review.
- Admin dashboard hasn't had its own accessibility pass — reasonable given it's used by one or
  two people who chose to use it, but worth a look if that changes.

## Project structure

```
supabase/
  schema.sql               → run this first
  storage-setup.md         → bucket creation + policies
  creating-first-admin.md  → how to get your own login working
DEPLOYMENT.md               → Vercel + Supabase production deployment steps
BACKUP.md                   → database + storage backup guide
middleware.ts               → protects /admin routes, refreshes Supabase session
src/
  lib/supabase/             → browser + server Supabase clients
  app/
    admin/
      login/                → public login page
      (dashboard)/          → everything behind auth (sidebar layout + all CRUD modules)
    workshops/, resources/, appointment/, home-visit/, contact/
                             → public pages, some now DB-backed, forms call ./actions.ts
  components/
    admin/ConfirmSubmitButton.tsx  → the one client-side bit admin forms need
```

## Brand tokens

Colors sampled directly from your logo: Navy `#041E3F`, Teal `#01828B`.
Typography: Cambria (headings) / Calibri (body).

## Information still needed before public launch

- [ ] Verified official academy email address
- [ ] Final official website domain
- [ ] Verified business/clinic address (only if it should be public)
- [ ] Final social media profile links
- [ ] Exact wording and issuing bodies for any certifications to display publicly
- [ ] Final workshop fee/payment details when paid registration is enabled
- [ ] Final patient service areas and home-visit availability
- [ ] Legal review of Privacy Policy, Terms, Refund Policy and Medical Disclaimer
- [ ] Any formal accreditation/CPD-provider status, only after documentary confirmation

## Non-negotiables already respected

- No fake testimonials, statistics, accreditation badges or partner logos
- No invented certificate numbers, awarding bodies, or dates
- "Clinical Supervisor at Indus University" does not appear anywhere on the public site
- Patient address and admin notes are enforced private by real Row-Level Security policies,
  not just hidden in the UI — verified in `supabase/schema.sql`
