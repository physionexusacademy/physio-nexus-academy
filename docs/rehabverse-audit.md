# RehabVerse — audit after launch

Reported by the owner: (1) RehabVerse was not visible on the homepage; (2) a new visitor saw only "Sign in" — account
creation was hidden behind the wording "Mera account pehle se hai" and had no guidance. I then audited the whole feature
for further weaknesses. This file lists what was found, what changed, and what is still open.

## 1. Findings and what was done

| # | Weakness | Why it mattered | Status |
| --- | --- | --- | --- |
| 1 | Not on the homepage (only in menus/footer) | Patients could not find it | **Fixed.** Dedicated homepage section (with a still from the 3D guide, no 3D engine on the homepage), first button in "I need physiotherapy", clinic menu/footer, sitemap |
| 2 | Account creation not obvious or explained | New visitors thought only existing users could enter | **Fixed.** Every entry point says "Create your account"; landing page, homepage and nav have a primary create-account button; a 3-step "what happens next" explainer; sign-up and sign-in share one page with a clear switch |
| 3 | No guidance while signing up | Dropped sign-ups | **Fixed.** Step indicator, "what you need", live password rules with show/hide, hints for each field, consent in plain language |
| 4 | E-mail confirmation not handled | If Supabase requires confirmation, people were stuck on a message and landed on the homepage | **Fixed.** Confirmation screen with 3 clear steps, resend, a callback route that signs them in and continues to the assessment, plain message when a link is expired or opened on another device |
| 5 | No "forgot password" | Locked-out patients could not recover | **Fixed.** Forgot + reset flow, same answer whether or not the account exists |
| 6 | Registering an address that already has an account looked like success | Confusing ("where is my email?") | **Fixed.** Detected and explained, pointing to Sign in / Forgot password |
| 7 | Patients were never e-mailed | The next day could open without them knowing | **Fixed.** Plain e-mails (programme ready, next day open, paused, stopped, completed) in their language; they never contain health details. Needs `RESEND_API_KEY` (already used by the site) |
| 8 | Alert e-mails sent without waiting (could be dropped on Cloudflare Workers once the response returns) | Missed safety alerts | **Fixed.** Awaited before the action returns |
| 9 | Clinician starts every programme from scratch | Slow; inconsistent | **Fixed.** 8 starter programmes built from real library exercises (low back, neck, shoulder, knee, hip, ankle, wrist/elbow, balance). Marked as drafts to review; validated against the library |
| 10 | Patient list had no search | Does not scale | **Fixed.** Search by name/reference/city and filter by programme state |
| 11 | No way for a patient to get or delete their data | Data-protection expectation | **Added.** Download my data (JSON); "ask to delete" sends the clinic a reference-only request (deletion itself stays a clinician decision because of record-keeping duties) |
| 12 | New patients saw a bare card before the assessment | Unclear next step | **Fixed.** 4-step progress list on the first dashboard visit |
| 13 | Landing page had no FAQ / unanswered questions | Trust and search visibility | **Added.** 7 questions in English and Roman Urdu, with FAQ structured data |
| 14 | Consent text did not mention e-mail updates | Consent must match behaviour | **Fixed.** Consent v2 mentions programme e-mails |

## 2. Still open (needs you, or a decision)

* **Supabase Auth settings** (dashboard → Authentication):
  * *URL configuration → Redirect URLs*: add `https://physionexusacademy.com/rehabverse/auth/callback`. Without it, confirmation and
    reset links open the site root instead of RehabVerse (the screens tell people what to do, but the link experience is worse).
  * Decide whether *Confirm email* stays on (recommended) and set a proper SMTP sender (default Supabase mail is rate-limited).
  * Turn on *leaked password protection*; consider CAPTCHA on sign-up.
* **Rate limiting** of the public forms is per server instance only. The database limits assessments to 5 per day, but add a
  Cloudflare rate-limit rule on `/rehabverse/*` POSTs for real protection.
* **Clinical review** of every exercise, the starter programmes and rules R1–R10 (all drafts).
* **No automatic reminders** (for example "your check-in is due"): needs a scheduled job; the dashboard shows due check-ins when the patient visits.
* **Library breadth**: 75 exercises (44 beginner, 26 intermediate, 5 advanced). No gait, neuro-rehab or advanced progressions yet, and the engine cannot model some movements (scapular, side plank, lunges).
* **One avatar** (male). Voice is English only; Roman Urdu is subtitles.
* **Accessibility**: keyboard and labels are in place but a screen-reader pass on real devices has not been done.
* **Worker size** is close to the plan limit: 3014 KiB of 3072 gzip after this round (private screens render in the browser to keep it down).

## 3. How it is tested

* `scripts/rehabverse-local/e2e.cjs` — full patient ↔ clinician walk-through (acceptance criteria, isolation, mobile, data rights, starter programmes).
* `scripts/rehabverse-local/e2e-auth.cjs` — homepage visibility, sign-up guidance, e-mail confirmation, resend, expired links, taken e-mail, forgot/reset password. Run it against the local backend started with `REHAB_LOCAL_CONFIRM=1`.
* `npm run validate:rehabverse-db | -library | -rules` — database, content and decision-support checks (run in CI before every deploy).
