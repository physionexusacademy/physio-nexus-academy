# PNA Daily Clinical Challenge — Production handoff
Date: 2026-10-09

## Features
- The /daily-challenge page offers five 30-second physiotherapy knowledge questions per day, 20 points per correct answer, max 100 points.
- 30 curated draft questions are stored at src/lib/daily-challenge.ts; source edits require clinical review. Challenge questions rotate deterministically with the calendar date.
- The Pakistan calendar date (Asia/Karachi) is derived server-side; a new five-question set and fresh daily ranking become available at 00:00 PKT. **No cron job and no destructive nightly reset are required.**
- The daily scoreboard includes all opted-in participants (30 per page) with public display name, points, rank and days completed. A compact Top 5 leaderboard is shown on the homepage.
- Monthly and yearly tables aggregate scores across completed days. The Hall of Fame supports navigation to earlier months and years using stored historical attempts.
- Supabase stores attempts and server-validated scores in daily_challenge_attempts. SQL migration: supabase/migrations/20261009_pna_daily_challenge.sql; the migration was applied successfully.
- Server-only Supabase service role queries the restricted leaderboard function. Emails and attempt tokens are never returned by the public leaderboard API.
- If a participant refreshes in the same browser tab, an active challenge can be resumed from sessionStorage without extending its server-side deadline.
- Once a challenge closes, server submission returns score zero for expired attempts. Near-midnight starts are blocked if insufficient time remains for all five questions.
- Homepage and Knowledge Hub link directly to Daily Challenge. The existing weekly quiz is unchanged.

## Required deploy and smoke checks
CI: scripts/validate-daily-challenge.mjs; .github/workflows/deploy-cloudflare-production.yml tests /daily-challenge and /api/daily-challenge/leaderboard.
Static code checks and a database schema/API function inspection passed in the development conversation; do **not** interpret these as proof of a successful live Next.js production build or browser run.

## Open hardening items
1. One-attempt restriction currently relies on a canonicalized **unverified Gmail address**, matching the existing weekly quiz approach. It does not establish email ownership; impersonation and multiple-email abuse are possible. Before award-bearing competitions, add verified login/email OTP, anti-bot controls and moderation.
2. Score and total elapsed time are enforced server-side; the 30-second **individual-question** countdown remains client-controlled. For prize-bearing competitions use per-question server timestamps and signed answer submissions.
3. Questions should receive documented clinical/editorial review, ongoing evidence updates, and a substantially larger rotating bank to avoid frequent repeats.
4. Verify the complete live deployment, accessibility, auth limits, real-client score submission and historical pagination end to end before announcing awards.
5. Publish a clear participant privacy notice covering display-name publication, email retention and data-rights contact details.

## Key routes
- /daily-challenge
- /api/daily-challenge/leaderboard?period=today
- /api/daily-challenge/leaderboard?period=month
- /api/daily-challenge/leaderboard?period=year
All periods support anchor=YYYY-MM-DD where appropriate, limit, and offset for pagination.
