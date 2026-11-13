# Student accounts ("My PNA")

A free account that keeps a private record of every learning activity and shows the student their own progress and insights.
Everything runs in the browser against Supabase — there are **no new worker API routes**, and the whole feature is a
single route (`/account`), because each extra route adds about 15 KiB gzip to the Cloudflare worker.

## What the student sees
- `/account` for a visitor: a server-rendered landing page (indexable) with *Create your free account* / *Sign in*.
- `/account?m=login|register|forgot|reset`: the forms (`noindex` via robots `Disallow: /account?m=`, canonical stays `/account`).
- `/account` for a signed-in student: **My PNA** — level ring, totals, "What PNA noticed", learning-balance radar,
  five-week activity map, recent activity, levels, edit details, download and delete my record.

## How activity is recorded
1. Every module already calls `recordLearningActivity(source, xp, eventId, label, scorePercent?)` (`src/lib/unified-progress.ts`).
2. When a Supabase session cookie exists (`hasStudentSession()` in `src/lib/student/outbox.ts`), the same call also queues the
   activity in a localStorage **outbox**. Visitors queue nothing and never load the Supabase client.
3. `StudentSync` (mounted in the root layout) and My PNA flush the outbox to `student_record_activities` (50 per call) and show a
   "Saved to your PNA record" toast. A failed flush stays queued and retries (online event, next page).
4. On the first visit after sign-up, `student_import_local` brings over the XP and active days already on the device (once).

## Database (`supabase/migrations/20261115120000_student_accounts.sql`)
- `student_profiles`, `student_activity` — RLS on; students can only `select` their own rows; no direct writes.
- All writes are `SECURITY DEFINER` RPCs using `auth.uid()`; `anon` has no execute rights.
- Server-side limits: per-source XP caps, 800 XP/day, idempotent `event_key`, future timestamps clamped, one malformed
  event never blocks the rest of a batch, `imported` source refused from the browser.
- `student_export_my_data()` / `student_delete_my_data()` give the student full control.

## Tests
- `npm run validate:student` — outbox gating, de-duplication, session-cookie detection, levels, insights, **and** the 21 database checks
  (`scripts/student-local/test-db.mjs`, run on PGlite with the real migration).
- Browser flow: run `node scripts/rehabverse-local/server.mjs` (local Supabase-lite) and the dev server with
  `NEXT_PUBLIC_SUPABASE_URL=http://127.0.0.1:54321`, then sign up at `/account?m=register`.

## Privacy
`/legal/privacy` has a "Student Accounts (My PNA)" section. Patients using RehabVerse sign in separately; clinical data is never mixed
with the learning record.
