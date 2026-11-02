-- Fix: Daily Challenge API was returning HTTP 403 when starting a quiz.
-- Service role bypasses RLS but still requires PostgreSQL table privileges.
-- Grant only necessary access to server-side service_role; public roles remain blocked.
grant usage on schema public to service_role;
grant select, insert, update on table public.daily_challenge_attempts to service_role;
revoke all on table public.daily_challenge_attempts from anon, authenticated;
alter table public.daily_challenge_attempts enable row level security;
-- Do not grant API clients access to participant emails or unsubmitted answer tokens.
