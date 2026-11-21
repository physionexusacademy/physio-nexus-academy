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
4. **A free-form technique question** goes to the model (the same chain as the intake assistant: Claude Haiku when its key is set, then the free Workers AI chain), grounded in today's plan and library
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

## The recovery check-in chat (AI assistant, Phase E)

When a recovery check-in is open (for example the **24 h** one, the day after a session; the windows are the database's own, `checkin-shared.ts`
`CHECKIN_WINDOWS`), a patient whose physiotherapist switched AI on sees **"Answer by chat instead"** above the normal check-in form
(`components/rehabverse/CheckinChat.tsx`, text only). The assistant asks the check-in questions one at a time and **fills in the form below as the
patient answers**. It never saves anything: the patient reads the form, **ticks the safety list themselves** (the chat never ticks "None of these"),
and presses Save, so the saved check-in (`rehab_submit_followup`) is always the patient's own. Without the switch, or when the patient prefers it,
the form works exactly as before.

How a turn works (`lib/rehabverse/ai/checkin-turn.ts`):

1. **Safety first** (`checkin-safety.ts`): the same alert rules as the coach, after removing **plain denials**: the chat itself asks about warning
   signs, so "no chest pain, no dizziness or numbness" is the normal answer and the shared screen has no idea about negation. Only a negator directly
   followed by the symptom ("no chest pain", "chakkar nahi aaya", "not swollen") is removed; "no feeling in my foot", "no but my knee gave way" and
   "no chest pain, sharp pain at night" still alarm. A hit stops the chat (the model is never called), says what to do (1122 when it is an emergency),
   **pre-ticks the matching warning sign** of the form's own list, and alerts the physiotherapist (urgent). The chat then stays quiet for that
   check-in for 24 h; the pre-ticked form is still there.
2. **The safety question is asked and read by code** (second question, so it is never at the end of a chat that stops early). A "yes", even a bare
   one, stops the chat. An answer it cannot read is asked again once, then left for the patient's own tick-list.
3. **Pain, daily activities, comparison with before, new symptoms and a note** are read by code first (a 0 to 10 number, better/same/worse in
   English and Roman Urdu, yes/no, skip). **The model never sets a number**: it only helps with free wording of the comparison and new symptoms (code
   wins on conflict) and writes **one short acknowledgement sentence**, which `checkin-guard.ts` checks: no diagnosis, reassurance, prediction, advice,
   medicine, question, claim to be a person, speculation about a cause, or a number the patient did not say. Otherwise a scripted sentence is used.
   What is asked next, and when the chat is finished, is decided by code (`checkin-spec.ts`).
4. **Routing**: a question only the physiotherapist can answer (medicine, scans, "should I stop") and a pain of 8 or more are noted for them
   (attention), at most once per conversation. The model can add a note for the physiotherapist (`needs_therapist`) but can never remove one.

Stored like the other conversations (`rehab_ai_conversations`, kind `feedback`, the draft holds the day, the check-in and the chat's own answers).
On the physiotherapist's day review, next to the recovery results, an **"AI check-in chat"** line says whether the chat was used, whether the patient
**changed an answer on the form after the chat** (for example pain chat 3, form 4), or whether it **stopped on a warning sign**, with a link to the
transcript. Alerts reach the admin inbox as `ai_checkin_safety` (urgent) and `ai_checkin_question` (attention).
Database: `20261123120000_rehab_ai_checkin.sql` (`rehab_ai_coach_notify` now serves both coach and check-in conversations; new
`rehab_ai_checkin_held`; both server-only).

`npm run validate:rehabverse-checkin` (400+ checks: about 90 denials and warning-sign phrases in English and Roman Urdu, readers, whole
conversations, guard, routing, privacy, windows, wiring), `scripts/rehabverse-local/e2e-checkin.cjs` (34 browser steps against the local backend), and
`/api/rehabverse/ai/selftest?kind=checkin` (admin only) to judge the real models' acknowledgements.

## AI pilot and sign-off (AI assistant, Phase F)

Before the assistants are opened to everyone, a physiotherapist reviews them and a small pilot runs. Admin → RehabVerse → **AI pilot**
(`/admin/rehabverse/ai-pilot`, admin only) has:

- **Review pack** (`/admin/rehabverse/ai-pilot?view=review`, built by `lib/rehabverse/ai/review-pack.ts` from the live code, so it cannot drift from what
  patients meet): the notices patients are told (one file, `lib/rehabverse/ai/notices.ts`, shared by the three chats), what stops each assistant
  (30 sample sentences in English and Roman Urdu put through the three safety screens, plus the exact wording shown when one stops), sample
  conversations of each assistant (run **without** the model, so they show the prepared wording that carries a chat when the model is down), all fixed
  wording, the exact instructions sent to the model, and the rules a model reply must pass. It can be printed or saved as PDF. The self-tests
  (`/api/rehabverse/ai/selftest`, `?kind=checkin`) let the reviewer hear the real models.
- **Sign-off record** (`rehab_ai_signoffs`, append-only): reviewer, decision (approved / approved with changes / not approved), notes, and the
  **version** of the pack that was read (a hash of the whole pack). Any later change to a prompt, sentence, rule or sample changes the version, so a
  sign-off never silently covers text nobody read; the server builds the version itself and refuses a sign-off made on a page that has gone stale.
- **Pilot limit** (`rehab_ai_pilot`, default **no limit**, stored as 100000; the physiotherapist can set 1–99,999 on the AI pilot page): when a limit is set, the database refuses to switch AI on for one more patient once the limit is reached
  (switching off is never refused; patients who have it keep it). **Open to all patients** is allowed only when the *latest* sign-off is "approved"
  for the *current* pack version. You still switch AI on patient by patient.
- **Dashboard**: patients with AI on, chats per assistant, scripted-reply share (a warning at 50% or more: the model is often unavailable or refused
  by the guard), safety stops, notices routed to the physiotherapist, models used, and how often a patient changed a check-in answer on the form after the
  chat.

What the review pack itself found (fixed in this phase): **loss of bladder or bowel control on its own** stopped no assistant (the site-wide screen wants
it together with back or leg symptoms; inside RehabVerse it is a red flag by itself, in English and Roman Urdu, with the cauda equina wording and the
bladder red flag pre-ticked); **"no chest pain" or "no heart problems"** falsely stopped the intake and the coach (plain denials are now removed before
screening, `ai/denials.ts`, in all three assistants); a Roman Urdu racing heart ("dil bohat tez dhadak raha hai") was missed; and the check-in's safety
question left out bladder or bowel control, which the form's own list has.

Database: `20261124120000_rehab_ai_pilot.sql` (two admin-only tables, three admin functions, and a replaced `rehab_admin_set_ai_assist` with the limit).
`npm run validate:rehabverse-pilot` (139 checks), the DB validator (258 checks) and `scripts/rehabverse-local/e2e-pilot.cjs` (26 browser steps).

How to run the pilot: read the pack and record your decision; run both self-tests; switch AI on for one test patient and try each assistant in both
languages; then a few real patients up to the limit, reading their conversations every day at first; watch the dashboard; turn AI off for a patient
(immediate) or set `REHAB_AI_ENABLED=0` (every assistant at once) if anything worries you; when satisfied, sign off as approved and open to all.

## Data protection

* RLS on every table; API roles have read-only grants where reads are needed and **no write grants**.
  Every write is a `SECURITY DEFINER` function with a pinned `search_path` that checks
  `auth.uid()` / `is_admin()` itself.
* Patients can read only their own rows; exercises of a day are readable only while that day is open.
* Public pages (home, library) contain no patient data. Private pages are `noindex`, excluded from
  prefetching and the sitemap. Alert e-mails contain no patient details.
* Patients must be 18+ and tick a consent statement; the consent version is stored.

### The AI model behind the chats (Claude Haiku, Groq, Workers AI)

The three chats (intake, exercise coach, recovery check-in) and the site assistant's written answers use these routes, **in this order, each only when it is set up** (`src/lib/rehabverse/ai/model.ts`):

1. **Claude Haiku 5.5** (`claude-haiku-5-5`, Anthropic's API, prepaid credit) when the Worker secret `ANTHROPIC_API_KEY` exists. Far more natural replies, and much better Roman Urdu than the free models. One plain `fetch` to `https://api.anthropic.com/v1/messages` (`claude-request.ts` builds the request, `claude.ts` is the server-only wrapper); the official SDK is not used because the Worker has a hard size limit (it would add about 100 KiB gzip and Node-only modules).
2. **Groq** (free tier, OpenAI-compatible; `groq-request.ts` and `groq.ts`, model `llama-3.3-70b-versatile` unless `GROQ_CHAT_MODEL` says otherwise) when the Worker secret `GROQ_API_KEY` exists.
3. **Cloudflare Workers AI** (the free daily allowance), the models in `DEFAULT_MODELS`, as before (chats only).

If neither answers (timeout, outage, no credit, a refusal) the scripted conversation carries on, so a patient is never left without a reply. A rejected key (wrong, revoked, or no credit left) pauses that service for 10 minutes (Groq's free-limit answer, 429, for the seconds Groq asks for) so a dead key or a full allowance is not called on every message; the next route answers meanwhile.

| Setting | What it does |
|---|---|
| `ANTHROPIC_API_KEY`, `GROQ_API_KEY` (Worker secrets) | Switch Claude / Groq on. Set each once as a GitHub repository secret of the same name; the deploy workflow puts it into the Worker (`wrangler secret put`). Never in the repository (a validator scans for key-shaped strings), never in a `NEXT_PUBLIC_` variable, never in the browser. A key that was ever pasted into a chat or a ticket must be revoked and replaced. |
| `CLAUDE_CHAT_MODEL`, `GROQ_CHAT_MODEL` | Optional model ids (defaults `claude-haiku-5-5`, `llama-3.3-70b-versatile`). |
| `REHAB_AI_PROVIDER` | `auto` (default: every service that is set up, in the order above), `claude` or `groq` (that service only: nothing goes anywhere else) or `workers-ai` (the free chain only: every keyed service off, useful as a switch). |

Cost and safety: replies are short (the prompts ask for 2 to 5 sentences; `max_tokens` is 1024 to 4096 because the model may think first), conversations and message lengths are capped as before, no sampling parameters are sent (the API rejects them), and the logs carry only sizes (`CLAUDE_AI_USAGE <model> <input tokens> <output tokens>`) and failure types, never text or keys. Set a **monthly spend limit in the Anthropic Console** (Settings, Limits) so the postpaid bill has a ceiling. Every safety rule above still holds: the plain-code safety screen runs first and the model is not consulted on a hit, a reply must pass the guard (no diagnosis, no medicine, no new numbers) and the language check (a reply in the wrong language is never shown), and the model never sets a number in the check-in form.

**Privacy:** with Claude or Groq switched on, the chat text (without the patient's name, e-mail or phone number, which are never sent; phone numbers and e-mails typed into the chat are removed first) goes to that provider to write the reply. The three patient notices (`notices.ts`) say so in plain words. The provider's API and data terms apply (Groq's free tier especially: read what it keeps and whether it may use inputs); review them and, if the research use needs it, the data-processing terms, before the pilot grows. The review pack in Admin reads the same notice text.

**The site assistant's written answers** (`src/lib/pna-ai/grounded.ts`, used by `/api/physio-nexus-ai`): when Claude or Groq is set up, the assistant's text is written by that service **only from PNA's own content** the brain found (the same sources the cards show), in the language of the question (English in, English out; Roman Urdu in, Roman Urdu out). It never reaches the model for an emergency, for a question about the person's own symptoms, or for a question the site cannot match with confidence; the free Workers AI models are never used for it. Every answer is checked before it is shown: right language, no number / medicine / link / diagnosis that is not in PNA's text, no leaked instructions, and it must stay with the content (a polite refusal for anything else). If a check fails, or no service answers, the site's own fixed answer is shown, as before. `npm run validate:pna-ai-grounded` tests all of this without a model.

Check the live quality after a deploy with `/api/rehabverse/ai/selftest` (it lists the keyed models first and runs the same scenarios on them).

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
* **A lying body rests on what is under it** (`lib/rehabverse/resting.ts`). Every lying exercise starts from a resting pose and its own
  movements are laid on top: on the back both arms lie behind the body with the palms down and the hands on the bed (not "in the
  fundamental position", 12 cm above it); face down the arms and legs rest on the mat (feet pointing); on the side the top leg lies on the bottom
  leg (adducted and turned so the knee, shin and heel rest on it). A joint is the exercise's own, and left exactly as written, when any
  movement (or the faulty version) mentions it or its start pose sets it more than 25° from neutral; a small start angle only meant "by the
  sides" and is replaced. On the side the body is placed on its ribs, hip and legs: the shoulder underneath, the widest part of the body, may
  sink a few cm into the mattress (`lowestY(skipArm)` in the 3D engine); counting it held the bottom leg 8 cm in the air. The numbers were
  solved on the real model by measuring the lowest vertex of every limb against the bed.
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
* a limb that should lie still on what is under it but hovers (`limb-floats`: the hands in the air on the back, the top leg hanging over the bottom
  leg on the side; `restingLimbs` in `resting.ts` decides which limbs, namely those the exercise neither moves nor holds);
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

## Easy chats and easy touch

The three AI chats (intake, exercise coach, check-in) are built from one kit, `src/components/rehabverse/ChatKit.tsx` (look: `chat-kit.css`).
Each screen says in one line what will happen, shows three steps (read the question, tap an answer or write, press Send), highlights the question that
waits for an answer, and offers "Your turn": one instruction, an example, answers to tap and a big box with a big Send button. What is offered for
each question lives in `src/lib/rehabverse/ai/chat-quick.ts` (English and Roman Urdu). A tap sends the same words a person would type, so
the assistant reads it like any answer; `npm run validate:rehabverse-chat-ui` proves every tap is understood without any AI service, and that the
warning-sign taps stop the check-in and tick the matching sign on the form.

The whole site follows `src/app/easy-touch.css` (loaded last): 44px tap targets on phones and tablets, 16px text in form fields, the footer directory in
two columns on a phone, no text under 11px (12px for words that carry information). `npm run validate:easy-touch` checks it.
