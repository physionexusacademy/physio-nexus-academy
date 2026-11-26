# Next features: prepared queue (nothing here is built or deployed yet)

Written 26 Nov 2026 while GitHub Actions is blocked (spending limit). **Rule while blocked: no merge, no deploy.** Work is prepared and tested locally only.
Priority = (impact on students/patients) / (effort + risk). Each item says what it needs from the owner before it starts.

## Standing rules for every item (so each one is safe to ship later)
1. One branch and one pull request per item; never bundle items.
2. Before opening the PR: run ALL deploy-workflow validation commands (58 offline ones; see the "Run every validation command" list kept in the session notes: extract the `run:` lines of `.github/workflows/deploy-cloudflare-production.yml`), not only the npm `validate:*` scripts (this missed a gate once).
3. Worker size: `npx opennextjs-cloudflare build` + `npx wrangler deploy --dry-run`. Keep three.js, camera/pose code, large data and anything that imports the Supabase browser client out of the Worker (`next/dynamic(..., { ssr: false })`, static files in `public/`). Budget: stay under 3,000 KiB gzip (limit 3,072; last measured 2,836).
4. Prerendered pages must stay byte-identical unless the item is meant to change them (compare the build's HTML before/after).
5. After merge: watch BOTH deploys (our workflow and Cloudflare "Workers Builds"), then test production with a real browser. Do not trust the workflow smoke test alone.
6. Any new database table: migration in `supabase/migrations`, RLS on, a `validate:*-db` check, and the owner's approval before production.

## A. Small fixes already known (do first, each is a tiny PR)
| # | Item | Why |
|---|---|---|
| A1 | Daily Challenge: second submit returns 503 "Unable to save", should be 409 "already submitted" | clearer message |
| A2 | `locations/hyderabad` and `locations/[city]` both generate Hyderabad/Karachi: exclude the two static cities from `[city]` params | the page title changes between builds |
| A3 | Unknown `/learn/<slug>` and `/skills/<slug>` return HTTP 200 (noindex) with the not-found page: return a real 404 | SEO hygiene |
| A4 | Re-record the site-tour voice line (says 48 conditions; there are 63), then update `site-guide.ts` | voice/text mismatch |
| A5 | Re-verify production after the next deploy: `/formcheck/*` files return 200 and the posture camera opens (fixed in #269, not yet confirmed live) | camera |
| A6 | Decide: switch off Cloudflare "Workers Builds" so only the checked workflow deploys | it deploys without our gates |

## B. Feature ideas, ranked
| Rank | Feature | What the user gets | Effort | Risk | Needs from owner |
|---|---|---|---|---|---|
| 1 | **Mock OSCE / viva simulator** (timed stations, AI "examiner" asks and scores against a checklist, English + Roman Urdu) | Students rehearse exams; a real differentiator (an audit found no mock OSCE) | M-L | Medium: AI safety and answer quality | Station list and marking checklists written/reviewed by a clinician |
| 2 | **Exercise programme builder** (pick exercises, sets/reps, print or share a clean PDF/WhatsApp card with 3D demo links, Urdu) | Clinicians and patients get a ready programme in one minute | M | Low | Approved exercise list and wording (RehabVerse library exists) |
| 3 | **WhatsApp-first sharing and reminders** (share lesson/handout cards; opt-in appointment and exercise reminders) | Fits how people in Pakistan communicate | M | Medium: WhatsApp Business rules, consent | WhatsApp Business account and message templates |
| 4 | **Offline lesson packs** (download a learning path for use with no data) | Saves mobile data, works on weak connections | M | Low | Size limits per pack |
| 5 | **Personal study dashboard** (streaks, weak topics, spaced-repetition due list across lessons, flashcards and Daily Challenge) | Keeps students coming back | M | Low | none |
| 6 | **Online payment for workshops/consultations** (JazzCash / Easypaisa / card) | Fewer manual bookings | L | High: payments, refunds, compliance | Provider choice and legal review |
| 7 | **Urdu-script option for lessons** (not only Roman Urdu) | Reaches many more readers | L | Medium: translation quality | A human translator; pilot on 5 lessons first |
| 8 | **Therapist/admin analytics** (which lessons are used, where learners drop off, Daily Challenge cohorts) | Shows what content to improve | M | Low | Privacy rules: aggregate only |
| 9 | **Interactive 3D anatomy layers** (bones, muscles, nerves around a joint, tied to lessons) | Makes anatomy lessons visual | L | Medium: size and phone speed | Licensed or in-house anatomy model; local 3D work is paused in `realistic-human-model/` |
| 10 | **Moderated case-discussion community** | Peer learning | L | High: moderation load, misinformation | A moderation plan |
| 11 | **Camera range-of-motion tool** (joint angle from a phone camera) | Useful in practice | L | High: accuracy claims need a validation study first | Study protocol and ethics approval |

## C. Research items (documents, no website risk)
Ethics application draft, participant information sheet and consent form, statistician's randomisation request, posture validation study protocol. Status of the study software: see `docs/rehabverse-rct-research-room.md` and `docs/posture-validation.md`.

## D. Suggested order when GitHub opens
A5 → A1 → A2 → A3 → A6 decision → A4 → B2 (programme builder) → B5 (study dashboard) → B4 (offline packs) → B1 (mock OSCE) → the rest as decided.
