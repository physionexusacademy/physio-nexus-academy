-- Hardening follow-up to 20261115120000_student_accounts.sql (apply together with the next student migration).
-- The Supabase security check flags the two SQL helper functions for not pinning their search_path. They touch no tables
-- and nobody but the function owner can execute them, so this is hygiene only. Idempotent.
alter function public.student__pk_day(timestamptz) set search_path = public;
alter function public.student__xp_cap(text) set search_path = public;
