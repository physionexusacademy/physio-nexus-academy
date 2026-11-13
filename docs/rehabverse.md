# PNA RehabVerse

Guided digital rehabilitation for Physio Nexus Academy: patients describe symptoms, a physiotherapist
builds and approves an individual programme, a 3D virtual physio guide demonstrates every exercise, and
each day opens only after feedback **and** the physiotherapist's approval.

Everything here reuses what already exists on the site (the Virtual Patient 3D engine and rigged model,
Supabase Auth + RLS, the admin shell, Resend e-mail). No new paid services, APIs or 3D engines.

## Map

| Area | Where |
| --- | --- |
| Public: home with the guide, 3D exercise library | `/rehabverse`, `/rehabverse/library` |
| Patient: register, sign in, assessment, dashboard, day session | `/rehabverse/register`, `/login`, `/start`, `/me`, `/me/day/[id]` |
| Clinician: inbox, patients, patient record | `/admin/rehabverse`, `/admin/rehabverse/patients[/id]` |
| Database | `supabase/migrations/20261114120000_rehabverse.sql` |
| Exercise content (EN + Roman Urdu) | authored in `src/lib/rehabverse/library/*.ts`, published as static JSON in `public/rehabverse-data/` (`npm run build:rehabverse-data`) and fetched by the browser — it never enters the Cloudflare worker |
| Movement engine | `src/lib/rehabverse/motion.ts`, `src/components/rehabverse/ExercisePlayer.tsx` |
| Guide | `src/components/rehabverse/PhysioGuide.tsx`, scripts in `src/lib/rehabverse/guide.ts` |
| Decision support | `src/lib/rehabverse/rules.ts` |
| Shared 3D room (one patient model per page) | `src/lib/virtual-patient/shared-room.ts` |

## Safety model

* **Red-flag screening first.** Any "yes" on the intake safety questions sets the assessment to
  *needs clinical assessment*: no programme can be created from it until the physiotherapist records a
  clearance note. The patient sees plain guidance and emergency advice.
* **The physiotherapist decides.** Nothing opens the next day except (a) the clinician's review or (b) a
  programme rule the clinician chose (*auto-release after safe feedback*: everything done, no warning
  signs, no unusual symptoms, pain at or below their limit). Overrides need a written reason.
* **Concerning feedback pauses the programme.** Warning signs (chest pain, dizziness, new neurology,
  hot calf, severe pain, injury, joint) pause the programme, lock unopened days, record an adverse
  event and alert the clinician.
* **No AI diagnosis or prescription.** The guide is scripted (not a chatbot) and says it is a virtual
  guide. Decision support is a fixed, listed set of rules the reviewer can inspect.
* **Audit.** Every clinical action writes to an append-only log (updates and deletes are blocked).

## Data protection

* RLS on every table; API roles have read-only grants where reads are needed and **no write grants**.
  Every write is a `SECURITY DEFINER` function with a pinned `search_path` that checks
  `auth.uid()` / `is_admin()` itself.
* Patients can read only their own rows; exercises of a day are readable only while that day is open.
* Public pages (home, library) contain no patient data. Private pages are `noindex`, excluded from
  prefetching and the sitemap. Alert e-mails contain no patient details.
* Patients must be 18+ and tick a consent statement; the consent version is stored.

## Decision-support rules (starting point — review before use)

`rules.ts` lists rules R1–R10. They follow the pain-monitoring approach (pain up to about 5/10 during
exercise is acceptable if it settles within 24 h and does not build from day to day). The most cautious
fired rule wins. They are **predefined, not clinically validated**, and each suggestion is shown with the
rules that fired, what was found, which check-ins are missing and a disclaimer. The supervising
physiotherapist should read and adopt (or change) them before patient use.

## Content review checklist (owner action)

* Every exercise (indications, contraindications, dosage, progressions, references) is a **draft**.
  The supervising physiotherapist should review the library, especially dosage and precautions.
* References are widely cited guidelines; confirm each before relying on it.
* Supabase Auth: confirm sign-up / e-mail confirmation / SMTP settings, and enable leaked-password protection.
* Confirm the emergency number text in the guide (1122 is used as an example for much of Pakistan).

## Running it locally (no production access)

```bash
npm install
npm run rehabverse:backend                     # local Supabase-lite on :54321 (PGlite, real migration)
NEXT_PUBLIC_SUPABASE_URL=http://127.0.0.1:54321 NEXT_PUBLIC_SUPABASE_ANON_KEY=local-anon-key \
  NEXT_PUBLIC_SITE_URL=http://127.0.0.1:3100 PNA_SKIP_CF_DEV=1 npx next dev -p 3100
node scripts/rehabverse-local/e2e.cjs          # full end-to-end walk-through with screenshots
npm run validate:rehabverse-db                 # RLS / roles / unlock rules (144 checks)
npm run build:rehabverse-data                  # regenerate the static exercise JSON after editing exercises
npm run validate:rehabverse-library            # exercise content, EN + Roman Urdu, 3D motion, JSON is fresh
npm run validate:rehabverse-rules              # decision-support scenarios
```

Staff login for the local backend: `admin@pna.test` / `AdminPass#2026` (local only).

## Performance notes

* One WebGL context per page: the guide and the exercise player share one patient model
  (`shared-room.ts`). The guide draws at ~30 fps while talking and ~15 fps while idle, and stops when
  scrolled out of view.
* Devices that struggle with 3D can set `localStorage["pna-rv-no3d"] = "1"`: the guide's script then plays as text.
* Heavy interactive screens (clinician record, intake form) render in the browser only, to keep the
  worker under its size limit.

## Applying to production

The migration is additive (new `rehab_*` tables, functions and policies only). Apply it with the
Supabase CLI or the dashboard SQL editor on the main project, then deploy as usual.
