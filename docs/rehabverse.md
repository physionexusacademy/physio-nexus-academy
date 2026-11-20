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

## The history brief (AI assistant, Phase C)

The first thing the treating physiotherapist sees on a patient's record is the **History brief**
(`src/lib/rehabverse/brief.ts`, shown by `admin/HistoryBrief.tsx`). It is built by fixed rules from the
submitted assessment and, when there is one, the AI intake conversation that produced it. **No model writes
any of it**: every sentence is a template filled with the patient's own answers, free text is quoted exactly,
and it never diagnoses or suggests treatment. It shows, in order:

1. **Safety**: the ticked red flags, any safety stop in the AI conversation, and **wording the screening tick
   missed** (the patient's own text, and what they typed in the chat, is run through the same English and
   Roman Urdu alert rules as PNA AI; a hit is listed when its screening question was not ticked).
2. **The story**: age, sex, areas, symptoms, duration, pain now / worst / best, onset, and the patient's
   quoted answers (cause, worse with, eased by, what it limits, treatment so far, conditions, medicines).
3. **Mentioned in the history**: conditions and medicines that matter when choosing exercise or hands-on
   techniques (diabetes, blood thinners, steroids, osteoporosis, pregnancy, ...), found by words.
4. **Changed by the patient after the chat**: the assistant's last draft against what the patient finally
   submitted, field by field (also a direct measure of how accurate the AI intake was).
5. **Check these answers** (scores that do not fit together) and **Worth asking at the first visit**: each gap
   or trigger becomes a question with its reason (rules H1-H12, listed in `brief.ts`).

"Copy as text" puts the whole brief on the clipboard for the clinical notes. It is shown for every patient's
latest assessment, AI or not (it is plain code, not AI). `npm run validate:rehabverse-brief` (79 checks) tests
that nothing is invented (every number comes from the assessment), the output contains no diagnosis wording,
quotes are exact (including Roman Urdu), corrections and missed safety wording are surfaced, and the library
never calls a model or the network.

## The exercise coach (AI assistant, Phase D)

On an **open exercise day**, a patient whose physiotherapist switched AI on sees an **exercise coach** under the exercise details
(`components/rehabverse/CoachChat.tsx`, text only). It explains today's prescribed exercises; it does **not** change them.

How it answers (`lib/rehabverse/ai/coach-turn.ts`, in this order; the model is called only at step 4):

1. **Safety first** (`coach-safety.ts`): the site-wide English and Roman Urdu alert rules plus what matters mid-exercise (a pop or tear, a joint
   giving way, sharp or worsening pain, dizziness, new numbness or weakness, a swollen or hot limb, a fall, a racing heart). The coach stops, says so
   with 1122, and the **physiotherapist is alerted** (urgent). The coach then stays quiet for that day (the feedback form still works).
2. **Questions only the physiotherapist can answer** (changing the plan, skipping or swapping, medicines, ice or heat, diagnosis, outcome): routed to
   them, noted for them (attention), not answered.
3. **Everyday questions** (how to do it, how many, breathing, common mistakes, equipment, what if it hurts, what is in today's plan): answered from the
   physiotherapist's prescription and the reviewed library text (`coach-spec.ts`): exact, instant, free, identical every time. Quick-question buttons
   for the open exercise send these. "What if it hurts?" reuses the guide's own wording and states no pain score.
4. **A free-form technique question** goes to the model (the same free Workers AI chain as the intake assistant), grounded in today's plan and library
   text (never the clinician-only fields), and its reply is used only if the guard passes it (`coach-guard.ts`): no diagnosis, medicines, heat or
   ice, reassurance, claim to be a person, link or identifier, **no change to the prescription** (no extra, fewer, harder or swapped exercises, no
   amount that is not in the plan, no exercise outside today's, no "push through the pain", no pain threshold). Otherwise the scripted menu answers.

Every call checks the admin's switch on the server, the day must be open for the signed-in patient, and the conversation belongs to one day. Stored
like the intake conversations (`rehab_ai_conversations`, kind `coach`): the admin reads them on the patient's record, scripted replies are marked, and
alerts appear in the admin inbox (`ai_coach_safety` urgent, `ai_coach_question` attention; at most one of each per conversation).
Database: `20261122120000_rehab_ai_coach.sql` (two server-only functions, `rehab_ai_coach_notify` and `rehab_ai_coach_hold`).
The library is read from the static assets (not bundled into the worker), only the patient-facing fields.

`npm run validate:rehabverse-coach` (2,000+ checks, including **every library exercise x 2 languages x 5 quick questions**, so an exercise name
can never set off an alarm or be misread) and `scripts/rehabverse-local/e2e-coach.cjs` (24 browser steps against the local backend).

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

## How an exercise is shown (poses, contact, voice)

* An exercise is data (`src/lib/rehabverse/library/*.ts`): a start pose and moves in clinical angles for the tested side (`hip`) and the
  other side (`hip:o`), plus props. The player (`ExercisePlayer.tsx`) rests the body on its surface (plinth, mat or floor) and, for
  standing exercises, keeps the feet planted (`anchor`).
* **All fours and planks**: the body is tipped head-up about the hips (`pelvis` in the pose; `tiltAbout: "shoulders"` for a plank) so
  hands and knees (or forearms and toes) both rest on the mat, and rests there once (`settle: "start"`). `QUAD` in
  `library/shared.ts` is the base pose (hands flat under the shoulders, knees under the hips). A cat-camel adds `tiltWith`, so the pelvis
  tips with the spine and the hands and knees stay where they are. The validator checks that every quadruped exercise sets `pelvis`
  and `settle`.
* Angles that put one body part on another (the ankle on the opposite knee in the figure-4) were solved on the real model with the
  development hook below and stored as plain numbers.
* **Voice**: with the voice on, `paceForVoice` (`motion.ts`) gives every spoken line the time its recording needs (extra time goes
  into the hold or the rest), so a line is never cut off by the next one; the packs a cycle needs are decoded before it starts
  (`warmPlan`). A line without a recording is not spoken.
* **Development hooks** (not in production builds), in the browser console on `/rehabverse/library?id=<exercise>`:
  `window.__rvWide = true` before loading shows the whole body from a distance (to check contact); `window.__rvPlayer` has `seek(ms)`,
  `cycle()`, `probe(parts, [[bone, side]], tilt?)` (where bones are, in metres), `lowest()` and `box()`.

## The pose quality gate (every exercise is checked on the real model)

`npm run validate:rehabverse-poses` (and `.github/workflows/rehabverse-pose-gate.yml` on every pull request that touches the exercises, the player
or the 3D model) opens the library in a browser, shows every exercise on the real patient model, **both sides and its "common mistake" version**,
poses it at 48 moments of the repetition (`window.__rvPlayer.check`, `src/lib/rehabverse/pose-check.ts`) and fails on:

* a body part sunk into the mat, bed or floor, or a body that floats (nothing touches its surface);
* feet that should stay planted but lift (a step is understood);
* a jump between two moments, or a repetition that does not come back to where it started;
* a declared contact that does not happen (`motion.touch`, for example the ankle on the opposite knee, or the hands on the back of the thigh);
* a left side that differs from the right (heights of every key joint are compared; this catches `trunk: {rot}` that should have been `"trunk:t"`).

It also saves one picture of each exercise as a build artifact, for a person to look through. `npm run validate:rehabverse-library` additionally
checks every joint angle against generous limits. To add an exercise: write it in `src/lib/rehabverse/library/` (batch 1 is `more.ts`), run
`npm run build:rehabverse-data`, run the gate for it (`RV_URL=http://127.0.0.1:3100 RV_ONLY=<id> node --experimental-strip-types scripts/rehabverse-pose-gate.mjs`
against a running dev server), then record its cues (`scripts/voice/README.md`). Angles that put one limb on another were solved on the model
with `window.__rvPlayer.probe` and stored as plain numbers. Every stretch in which a hand holds a limb (the knee hugged to the chest, the fingers
drawn back, the arm pulled across) declares that contact, so a hand that floats in the air fails the gate; a towel or strap is drawn with
`props: [{ kind: "strap" }]` (from the ball of the tested foot to both hands).

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
