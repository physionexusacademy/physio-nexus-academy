-- =====================================================================================
-- Daily Clinical Challenge reminder for EVERY past participant.   ADDITIVE migration.
--
-- Who gets it: each distinct participant (by normalised Gmail) who ever started a challenge, addressed by the full name they
-- typed, once a day in the evening (17:00–21:59 Pakistan time) — unless they already played today, have unsubscribed, or are a
-- My PNA student who switched reminders on (they receive that version instead, never both).
--
-- Safeguards:
--   * one-click unsubscribe in every e-mail; an unsubscribe is permanent (daily_reminder_optouts) and checked before every send;
--   * a daily cap (pna_feature_flags.int_value, default 60) so participant mail can never use up the e-mail plan's daily
--     allowance that RehabVerse and workshop e-mails share; most recently active participants come first;
--   * a pause switch: update public.pna_feature_flags set enabled = false where key = 'daily_participant_reminders';
--   * the same idempotent claim log as the other reminders (one row per person per day, failed sends retried at most twice).
-- Security model unchanged: RLS on, no API-role access, job functions callable by service_role only.
-- =====================================================================================

create table if not exists public.pna_feature_flags (
  key text primary key,
  enabled boolean not null default true,
  int_value integer,
  updated_at timestamptz not null default now()
);
insert into public.pna_feature_flags (key, enabled, int_value) values ('daily_participant_reminders', true, 60) on conflict (key) do nothing;

create table if not exists public.daily_reminder_optouts (
  email_key text primary key,
  unsubscribed_at timestamptz not null default now()
);

alter table public.pna_feature_flags enable row level security;
alter table public.daily_reminder_optouts enable row level security;
revoke all on public.pna_feature_flags, public.daily_reminder_optouts from anon, authenticated;
grant all on public.pna_feature_flags, public.daily_reminder_optouts to service_role;

alter table public.pna_reminder_log add column if not exists email_key text;
alter table public.pna_reminder_log drop constraint if exists pna_reminder_log_kind_check;
alter table public.pna_reminder_log add constraint pna_reminder_log_kind_check
  check (kind in ('daily_challenge', 'daily_participant', 'rehab_checkin', 'rehab_day'));

-- The same Gmail normalisation the challenge uses when it stores email_key (dots and +tags do not matter).
create or replace function public.pna__gmail_key(e text)
returns text language sql immutable set search_path = public, pg_temp as $$
  select case when lower(split_part(btrim(e), '@', 2)) in ('gmail.com', 'googlemail.com')
              then replace(split_part(split_part(lower(btrim(e)), '@', 1), '+', 1), '.', '') || '@gmail.com'
              else lower(btrim(e)) end
$$;

create or replace function public.pna_participant_reminders_claim(p_now timestamptz default now(), p_limit integer default 100)
returns jsonb language plpgsql security definer set search_path = public, pg_temp as $$
declare
  v_today date := public.student__pk_day(p_now);
  v_hour int := extract(hour from p_now at time zone 'Asia/Karachi')::int;
  v_flag public.pna_feature_flags%rowtype;
  v_cap int; v_used int; v_room int;
  v_out jsonb := '[]'::jsonb;
  r record; v_id bigint; v_tok uuid;
begin
  select * into v_flag from public.pna_feature_flags where key = 'daily_participant_reminders';
  if not found or not v_flag.enabled then return v_out; end if;
  if v_hour < 17 or v_hour > 21 then return v_out; end if;

  v_cap := greatest(0, coalesce(v_flag.int_value, 60));
  select count(*) into v_used from public.pna_reminder_log where kind = 'daily_participant' and ref = v_today::text and status in ('claimed', 'sent');
  v_room := least(100, greatest(1, coalesce(p_limit, 100)), greatest(0, v_cap - v_used));
  if v_room <= 0 then return v_out; end if;

  for r in
    with att as (
      select email_key, full_name, email, challenge_date, status, score, started_at from public.daily_challenge_attempts
    ),
    latest as (
      select distinct on (email_key) email_key, full_name, email from att order by email_key, started_at desc
    ),
    totals as (
      select email_key,
             count(*) filter (where status = 'submitted')::int as missions,
             coalesce(sum(score) filter (where status = 'submitted'), 0)::int as points,
             coalesce(max(score) filter (where status = 'submitted'), 0)::int as best,
             min(challenge_date) as first_day, max(challenge_date) as last_day
        from att group by email_key
    ),
    ranked as (
      select t.*, rank() over (order by points desc) as pos, count(*) over () as n from totals t
    ),
    d as (select distinct email_key, challenge_date from att where status = 'submitted'),
    grp as (select email_key, challenge_date, challenge_date - (row_number() over (partition by email_key order by challenge_date))::int as g from d),
    runs as (select email_key, max(challenge_date) as e, count(*) as len from grp group by email_key, g),
    streaks as (select email_key, coalesce(max(len) filter (where e >= v_today - 1), 0)::int as streak from runs group by email_key)
    select l.email_key, l.full_name, l.email, k.missions, k.points, k.best, k.first_day, k.last_day,
           coalesce(s.streak, 0) as streak, k.n::int as participants, ceil(100.0 * k.pos / nullif(k.n, 0))::int as top_percent
      from latest l
      join ranked k on k.email_key = l.email_key
      left join streaks s on s.email_key = l.email_key
     where not exists (select 1 from public.daily_reminder_optouts o where o.email_key = l.email_key)
       and not exists (select 1 from att a where a.email_key = l.email_key and a.challenge_date = v_today)
       and not exists (select 1 from public.student_profiles sp join auth.users u on u.id = sp.user_id
                        where sp.remind_email and u.email is not null and public.pna__gmail_key(u.email) = l.email_key)
     order by k.last_day desc, k.points desc, l.email_key
     limit v_room
  loop
    v_id := null;
    insert into public.pna_reminder_log as lg (kind, subject, ref, email_key)
      values ('daily_participant', md5(r.email_key)::uuid, v_today::text, r.email_key)
    on conflict (kind, subject, ref) do update set status = 'claimed', attempts = lg.attempts + 1, claimed_at = now()
      where lg.attempts < 3 and (lg.status = 'failed' or (lg.status = 'claimed' and lg.claimed_at < now() - interval '30 minutes'))
    returning lg.id, lg.token into v_id, v_tok;
    if v_id is not null then
      v_out := v_out || jsonb_build_object('id', v_id, 'token', v_tok, 'kind', 'daily_participant', 'to', r.email, 'name', r.full_name, 'lang', 'mix',
                 'streak', r.streak,
                 'stats', jsonb_build_object('missions', r.missions, 'points', r.points, 'best', r.best, 'first_day', r.first_day, 'last_day', r.last_day,
                                             'participants', r.participants, 'top_percent', r.top_percent));
    end if;
  end loop;
  return v_out;
end $$;

-- One-click opt-out now also understands participant reminders (permanent, keyed by the normalised Gmail).
create or replace function public.pna_reminder_unsubscribe(p_token uuid)
returns jsonb language plpgsql security definer set search_path = public, pg_temp as $$
declare l public.pna_reminder_log%rowtype;
begin
  select * into l from public.pna_reminder_log where token = p_token;
  if not found then return jsonb_build_object('ok', false); end if;
  if l.kind = 'daily_challenge' then
    update public.student_profiles set remind_email = false, updated_at = now() where user_id = l.subject;
  elsif l.kind = 'daily_participant' then
    if l.email_key is not null then
      insert into public.daily_reminder_optouts (email_key) values (l.email_key) on conflict (email_key) do nothing;
    end if;
  else
    update public.rehab_patients set remind_email = false, updated_at = now() where id = l.subject;
  end if;
  return jsonb_build_object('ok', true, 'kind', l.kind);
end $$;

revoke all on function public.pna__gmail_key(text) from public, anon, authenticated;
revoke all on function public.pna_participant_reminders_claim(timestamptz, integer) from public, anon, authenticated;
grant execute on function public.pna_participant_reminders_claim(timestamptz, integer) to service_role;
