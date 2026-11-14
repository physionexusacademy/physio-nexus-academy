-- =====================================================================================
-- PNA Leagues + reminder e-mails.   ADDITIVE migration (no drops, existing functions are only extended).
--
-- Leagues
--   * Weekly (Monday–Sunday, Pakistan time), seven tiers, cohorts of up to 30 students per tier.
--   * Weekly XP is ALWAYS read from student_activity (itself capped server-side: per-activity caps, 800 XP/day,
--     idempotent event keys). The browser never sends a league score, so there is nothing to forge.
--   * At the end of a week the top 30 % of a cohort (with at least 100 XP) move up and the bottom 20 % move down.
--     A cohort with fewer than 5 students is a "practice" league: nobody moves. Settlement is lazy and idempotent
--     (it runs, under a lock, the first time anybody opens their league after the week has ended), so no cron is needed.
--   * Students who switch leagues off disappear from the standings of the current week at once.
--
-- Reminders (sent by the Cloudflare cron in custom-worker.ts through Resend)
--   * Daily Clinical Challenge reminder: only for signed-in students with a confirmed e-mail who switched it on.
--   * RehabVerse follow-up: a recovery check-in window is open, or a released day has not been started.
--     At most one RehabVerse reminder per patient per 20 hours; none at night; never any health detail in the e-mail.
--   * Every reminder carries its own random unsubscribe token; every claim is logged once (idempotent, bounded retries).
--
-- Security model: RLS on, API roles have NO direct table access; everything is SECURITY DEFINER with auth.uid(),
-- and the three job functions are callable by service_role only.
-- =====================================================================================

-- ─────────────────────────────── leagues: tables ─────────────
create table if not exists public.league_members (
  user_id uuid primary key references auth.users (id) on delete cascade,
  tier smallint not null default 1 check (tier between 1 and 7),
  best_tier smallint not null default 1 check (best_tier between 1 and 7),
  joined_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.league_cohorts (
  id uuid primary key default gen_random_uuid(),
  week_start date not null,
  tier smallint not null check (tier between 1 and 7),
  settled_at timestamptz,
  created_at timestamptz not null default now()
);
create index if not exists league_cohorts_week_idx on public.league_cohorts (week_start, tier) where settled_at is null;

create table if not exists public.league_entries (
  cohort_id uuid not null references public.league_cohorts (id) on delete cascade,
  user_id uuid not null references auth.users (id) on delete cascade,
  week_start date not null,
  tier smallint not null check (tier between 1 and 7),
  joined_at timestamptz not null default now(),
  xp integer,
  rank smallint,
  cohort_size smallint,
  result text check (result in ('promoted', 'stayed', 'demoted', 'practice')),
  primary key (cohort_id, user_id),
  unique (user_id, week_start)
);
create index if not exists league_entries_user_idx on public.league_entries (user_id, week_start desc);

alter table public.league_members enable row level security;
alter table public.league_cohorts enable row level security;
alter table public.league_entries enable row level security;
revoke all on public.league_members, public.league_cohorts, public.league_entries from anon, authenticated;

-- ─────────────────────────────── reminders: tables ─────────────
create table if not exists public.pna_reminder_log (
  id bigint generated always as identity primary key,
  kind text not null check (kind in ('daily_challenge', 'rehab_checkin', 'rehab_day')),
  subject uuid not null,
  ref text not null,
  token uuid not null default gen_random_uuid() unique,
  status text not null default 'claimed' check (status in ('claimed', 'sent', 'failed')),
  attempts smallint not null default 1,
  claimed_at timestamptz not null default now(),
  sent_at timestamptz,
  unique (kind, subject, ref)
);
create index if not exists pna_reminder_log_subject_idx on public.pna_reminder_log (subject, claimed_at desc);

create table if not exists public.pna_job_runs (
  id bigint generated always as identity primary key,
  job text not null,
  ran_at timestamptz not null default now(),
  claimed integer not null default 0,
  sent integer not null default 0,
  failed integer not null default 0,
  note text
);

alter table public.pna_reminder_log enable row level security;
alter table public.pna_job_runs enable row level security;
revoke all on public.pna_reminder_log, public.pna_job_runs from anon, authenticated;
grant all on public.pna_reminder_log, public.pna_job_runs, public.league_members, public.league_cohorts, public.league_entries to service_role;

alter table public.rehab_patients add column if not exists remind_email boolean not null default true;

-- ─────────────────────────────── leagues: helpers ─────────────
-- Monday of the Pakistan week that contains ts.
create or replace function public.pna__week_start(ts timestamptz default now())
returns date language sql stable set search_path = public, pg_temp as $$
  select date_trunc('week', ts at time zone 'Asia/Karachi')::date
$$;

-- A student's XP in the Pakistan week starting on w. Read from the capped activity log, never from the browser.
create or replace function public.pna__league_xp(u uuid, w date)
returns integer language sql stable set search_path = public, pg_temp as $$
  select coalesce(sum(xp), 0)::int from public.student_activity
   where user_id = u and day between w and w + 6 and source <> 'imported'
$$;

-- Closes every finished week that is still open: ranks each cohort, writes the result and moves students between tiers.
-- Idempotent (a cohort is settled once) and always called under the league advisory lock.
create or replace function public.pna__league_settle(this_week date)
returns void language plpgsql security definer set search_path = public, pg_temp as $$
declare c record;
begin
  for c in select id, week_start, tier from public.league_cohorts
            where settled_at is null and week_start < this_week order by week_start, tier, created_at loop
    with ranked as (
      select e.user_id, public.pna__league_xp(e.user_id, c.week_start) as xp,
             row_number() over (order by public.pna__league_xp(e.user_id, c.week_start) desc, e.joined_at, e.user_id) as rk,
             count(*) over () as n
        from public.league_entries e where e.cohort_id = c.id
    )
    update public.league_entries e set
      xp = r.xp, rank = r.rk, cohort_size = r.n,
      result = case
        when r.n < 5 then 'practice'
        when r.rk <= ceil(r.n * 0.3) and r.xp >= 100 and c.tier < 7 then 'promoted'
        when r.rk > r.n - floor(r.n * 0.2) and c.tier > 1 then 'demoted'
        else 'stayed' end
    from ranked r where e.cohort_id = c.id and e.user_id = r.user_id;

    update public.league_members m set
      tier = case e.result when 'promoted' then least(7, m.tier + 1) when 'demoted' then greatest(1, m.tier - 1) else m.tier end,
      best_tier = greatest(m.best_tier, case e.result when 'promoted' then least(7, m.tier + 1) else m.tier end),
      updated_at = now()
    from public.league_entries e where e.cohort_id = c.id and e.user_id = m.user_id;

    update public.league_cohorts set settled_at = now() where id = c.id;
  end loop;
end $$;

-- ─────────────────────────────── leagues: what a student calls ─────────────
create or replace function public.student_league_my()
returns jsonb language plpgsql security definer set search_path = public, pg_temp as $$
declare
  uid uuid := auth.uid();
  prof public.student_profiles%rowtype;
  mem public.league_members%rowtype;
  ent public.league_entries%rowtype;
  w date := public.pna__week_start();
  cid uuid;
  stand jsonb; hist jsonb; n int; my_rank int; my_xp int;
begin
  if uid is null then raise exception 'Sign in first' using errcode = '28000'; end if;
  select * into prof from public.student_profiles where user_id = uid;
  if not found then return jsonb_build_object('enabled', false, 'reason', 'no_profile'); end if;
  if not prof.league_opt_in then return jsonb_build_object('enabled', false, 'reason', 'opted_out'); end if;

  -- Only take the lock when there is something to settle or this student still needs a place this week.
  if exists (select 1 from public.league_cohorts where settled_at is null and week_start < w)
     or not exists (select 1 from public.league_entries where user_id = uid and week_start = w) then
    perform pg_advisory_xact_lock(7431001);
    perform public.pna__league_settle(w);
    insert into public.league_members (user_id) values (uid) on conflict (user_id) do nothing;
    select * into mem from public.league_members where user_id = uid;
    if not exists (select 1 from public.league_entries where user_id = uid and week_start = w) then
      select c.id into cid from public.league_cohorts c
       where c.week_start = w and c.tier = mem.tier and c.settled_at is null
         and (select count(*) from public.league_entries e where e.cohort_id = c.id) < 30
       order by (select count(*) from public.league_entries e where e.cohort_id = c.id) desc, c.created_at
       limit 1;
      if cid is null then
        insert into public.league_cohorts (week_start, tier) values (w, mem.tier) returning id into cid;
      end if;
      insert into public.league_entries (cohort_id, user_id, week_start, tier) values (cid, uid, w, mem.tier);
    end if;
  end if;

  select * into mem from public.league_members where user_id = uid;
  select * into ent from public.league_entries where user_id = uid and week_start = w;

  select coalesce(jsonb_agg(jsonb_build_object('rank', t.rk, 'name', t.display_name, 'xp', t.xp, 'me', t.user_id = uid) order by t.rk), '[]'::jsonb),
         count(*)::int,
         max(t.rk) filter (where t.user_id = uid)::int,
         max(t.xp) filter (where t.user_id = uid)::int
    into stand, n, my_rank, my_xp
    from (
      select e.user_id, sp.display_name, public.pna__league_xp(e.user_id, w) as xp,
             row_number() over (order by public.pna__league_xp(e.user_id, w) desc, e.joined_at, e.user_id) as rk
        from public.league_entries e
        join public.student_profiles sp on sp.user_id = e.user_id and sp.league_opt_in
       where e.cohort_id = ent.cohort_id
    ) t;

  select coalesce(jsonb_agg(jsonb_build_object('week_start', h.week_start, 'tier', h.tier, 'rank', h.rank, 'xp', h.xp,
           'size', h.cohort_size, 'result', h.result) order by h.week_start desc), '[]'::jsonb)
    into hist
    from (select * from public.league_entries where user_id = uid and result is not null order by week_start desc limit 8) h;

  return jsonb_build_object(
    'enabled', true,
    'week_start', w,
    'ends_at', ((w + 7)::timestamp at time zone 'Asia/Karachi'),
    'tier', mem.tier, 'best_tier', mem.best_tier,
    'size', n, 'rank', my_rank, 'xp', coalesce(my_xp, 0),
    'practice', n < 5,
    'promote_n', case when n >= 5 and mem.tier < 7 then ceil(n * 0.3)::int else 0 end,
    'demote_n', case when n >= 5 and mem.tier > 1 then floor(n * 0.2)::int else 0 end,
    'promote_min_xp', 100,
    'standings', stand,
    'history', hist
  );
end $$;

create or replace function public.student_set_league(p_opt_in boolean)
returns jsonb language plpgsql security definer set search_path = public, pg_temp as $$
declare uid uuid := auth.uid();
begin
  if uid is null then raise exception 'Sign in first' using errcode = '28000'; end if;
  update public.student_profiles set league_opt_in = coalesce(p_opt_in, true), updated_at = now() where user_id = uid;
  if not found then raise exception 'Create your student profile first' using errcode = '22023'; end if;
  if not coalesce(p_opt_in, true) then
    delete from public.league_entries e using public.league_cohorts c
     where e.user_id = uid and c.id = e.cohort_id and c.settled_at is null;
  end if;
  return jsonb_build_object('league_opt_in', coalesce(p_opt_in, true));
end $$;

create or replace function public.student_set_reminders(p_enabled boolean, p_hour int default null)
returns jsonb language plpgsql security definer set search_path = public, pg_temp as $$
declare uid uuid := auth.uid(); row_out public.student_profiles;
begin
  if uid is null then raise exception 'Sign in first' using errcode = '28000'; end if;
  update public.student_profiles set
    remind_email = coalesce(p_enabled, false),
    remind_hour = least(21, greatest(6, coalesce(p_hour, remind_hour))),
    updated_at = now()
  where user_id = uid returning * into row_out;
  if not found then raise exception 'Create your student profile first' using errcode = '22023'; end if;
  return jsonb_build_object('remind_email', row_out.remind_email, 'remind_hour', row_out.remind_hour);
end $$;

create or replace function public.student_my_prefs()
returns jsonb language sql stable security definer set search_path = public, pg_temp as $$
  select coalesce((select jsonb_build_object('remind_email', remind_email, 'remind_hour', remind_hour, 'league_opt_in', league_opt_in)
                     from public.student_profiles where user_id = auth.uid()), 'null'::jsonb)
$$;

-- Patient side of the RehabVerse follow-up e-mails.
create or replace function public.rehab_set_reminders(p_enabled boolean)
returns jsonb language plpgsql security definer set search_path = public, pg_temp as $$
declare pid uuid := public.rehab__require_patient();
begin
  update public.rehab_patients set remind_email = coalesce(p_enabled, true), updated_at = now() where id = pid;
  return jsonb_build_object('remind_email', coalesce(p_enabled, true));
end $$;

create or replace function public.rehab_my_followup()
returns jsonb language plpgsql stable security definer set search_path = public, pg_temp as $$
declare pid uuid := public.rehab__require_patient();
begin
  return jsonb_build_object(
    'remind_email', (select remind_email from public.rehab_patients where id = pid),
    'has_email', (select email is not null from public.rehab_patients where id = pid),
    'last_reminder_at', (select max(sent_at) from public.pna_reminder_log where subject = pid and kind in ('rehab_checkin', 'rehab_day') and status = 'sent')
  );
end $$;

-- ─────────────────────────────── reminders: the job (service_role only) ─────────────
create or replace function public.pna__student_streak(uid uuid)
returns integer language sql stable set search_path = public, pg_temp as $$
  with d as (select distinct day from public.student_activity where user_id = uid and day <= public.student__pk_day(now())),
       grp as (select day, day - (row_number() over (order by day))::int as g from d),
       runs as (select max(day) as e, count(*) as len from grp group by g)
  select coalesce(max(len) filter (where e >= public.student__pk_day(now()) - 1), 0)::int from runs
$$;

-- Reserves every reminder that is due right now and returns what to send. Reserving is what makes the job safe to repeat:
-- one row per (kind, subject, ref); a failed one is retried at most twice; a claim that never finished is retried after 30 minutes.
create or replace function public.pna_reminders_claim(p_now timestamptz default now(), p_limit integer default 100)
returns jsonb language plpgsql security definer set search_path = public, pg_temp as $$
declare
  v_today date := public.student__pk_day(p_now);
  v_hour int := extract(hour from p_now at time zone 'Asia/Karachi')::int;
  v_out jsonb := '[]'::jsonb;
  v_max int := least(200, greatest(1, coalesce(p_limit, 100)));
  r record;
  v_id bigint; v_tok uuid;
begin
  -- 1. Daily Clinical Challenge — signed-in students who switched it on and have not played today.
  if v_hour between 6 and 21 then
    for r in
      select sp.user_id, u.email, sp.display_name
        from public.student_profiles sp
        join auth.users u on u.id = sp.user_id
       where sp.remind_email and u.email is not null and u.email_confirmed_at is not null
         and v_hour >= sp.remind_hour
         and not exists (select 1 from public.student_activity a where a.user_id = sp.user_id and a.day = v_today and a.source = 'daily-challenge')
         -- keep the sender reputation clean: nothing for people who have been away for three weeks
         and (sp.created_at > p_now - interval '7 days'
              or exists (select 1 from public.student_activity a where a.user_id = sp.user_id and a.source <> 'imported' and a.occurred_at > p_now - interval '21 days'))
       order by sp.remind_hour, sp.user_id
       limit v_max
    loop
      v_id := null;
      insert into public.pna_reminder_log as l (kind, subject, ref) values ('daily_challenge', r.user_id, v_today::text)
      on conflict (kind, subject, ref) do update set status = 'claimed', attempts = l.attempts + 1, claimed_at = now()
        where l.attempts < 3 and (l.status = 'failed' or (l.status = 'claimed' and l.claimed_at < now() - interval '30 minutes'))
      returning l.id, l.token into v_id, v_tok;
      if v_id is not null then
        v_out := v_out || jsonb_build_object('id', v_id, 'token', v_tok, 'kind', 'daily_challenge', 'to', r.email,
                   'name', r.display_name, 'lang', 'mix', 'streak', public.pna__student_streak(r.user_id));
      end if;
    end loop;
  end if;

  -- 2. RehabVerse follow-up — one reminder per patient, daytime only, health details never included.
  if v_hour between 8 and 20 then
    for r in
      with cand as (
        select pat.id as pid, pat.email, pat.full_name, pat.preferred_language as lang, 1 as prio, 'rehab_checkin' as kind, s.id::text || ':' || t as ref
          from public.rehab_patients pat
          join public.rehab_programmes pr on pr.patient_id = pat.id and pr.status = 'active'
          join public.rehab_sessions s on s.programme_id = pr.id
          join public.rehab_feedback f on f.session_id = s.id and f.completion <> 'none'
          cross join lateral unnest(pr.errp_schedule) as t
         where pat.remind_email and pat.status = 'active' and pat.email is not null
           and p_now >= f.submitted_at + (case t when 'later_same_day' then interval '2 hours' when '24h' then interval '18 hours' else interval '40 hours' end)
           and p_now <= f.submitted_at + (case t when 'later_same_day' then interval '20 hours' when '24h' then interval '72 hours' else interval '120 hours' end) - interval '3 hours'
           and not exists (select 1 from public.rehab_errp_observations o where o.session_id = s.id and o.timepoint = t)
        union all
        select pat.id, pat.email, pat.full_name, pat.preferred_language, 2, 'rehab_day',
               s.id::text || (case when coalesce(s.available_from, s.released_at) <= p_now - interval '4 days' then ':open2' else ':open1' end)
          from public.rehab_patients pat
          join public.rehab_programmes pr on pr.patient_id = pat.id and pr.status = 'active'
          join public.rehab_sessions s on s.programme_id = pr.id and s.status = 'unlocked'
         where pat.remind_email and pat.status = 'active' and pat.email is not null
           and coalesce(s.available_from, s.released_at) <= p_now - interval '20 hours'
           and coalesce(s.available_from, s.released_at) >= p_now - interval '10 days'
           and not exists (select 1 from public.rehab_feedback f where f.session_id = s.id)
      )
      select distinct on (c.pid) c.* from cand c
       where not exists (select 1 from public.pna_reminder_log l
                          where l.subject = c.pid and l.kind in ('rehab_checkin', 'rehab_day') and l.status <> 'failed'
                            and l.claimed_at > now() - interval '20 hours' and not (l.kind = c.kind and l.ref = c.ref))
       order by c.pid, c.prio, c.ref
       limit v_max
    loop
      v_id := null;
      insert into public.pna_reminder_log as l (kind, subject, ref) values (r.kind, r.pid, r.ref)
      on conflict (kind, subject, ref) do update set status = 'claimed', attempts = l.attempts + 1, claimed_at = now()
        where l.attempts < 3 and (l.status = 'failed' or (l.status = 'claimed' and l.claimed_at < now() - interval '30 minutes'))
      returning l.id, l.token into v_id, v_tok;
      if v_id is not null then
        v_out := v_out || jsonb_build_object('id', v_id, 'token', v_tok, 'kind', r.kind, 'to', r.email,
                   'name', r.full_name, 'lang', case when r.lang = 'en' then 'en' else 'ru' end);
      end if;
    end loop;
  end if;
  return v_out;
end $$;

-- Records what happened to each claimed reminder and keeps a heartbeat so the cron can be checked from the database.
create or replace function public.pna_reminders_finish(p_results jsonb, p_note text default null)
returns jsonb language plpgsql security definer set search_path = public, pg_temp as $$
declare x jsonb; sent int := 0; failed int := 0;
begin
  if jsonb_typeof(coalesce(p_results, '[]'::jsonb)) <> 'array' then raise exception 'results must be an array' using errcode = '22023'; end if;
  for x in select * from jsonb_array_elements(coalesce(p_results, '[]'::jsonb)) loop
    if coalesce((x ->> 'ok')::boolean, false) then
      update public.pna_reminder_log set status = 'sent', sent_at = now() where id = (x ->> 'id')::bigint;
      sent := sent + 1;
    else
      update public.pna_reminder_log set status = 'failed' where id = (x ->> 'id')::bigint and status = 'claimed';
      failed := failed + 1;
    end if;
  end loop;
  insert into public.pna_job_runs (job, claimed, sent, failed, note) values ('reminders', sent + failed, sent, failed, left(p_note, 300));
  delete from public.pna_job_runs where ran_at < now() - interval '45 days';
  return jsonb_build_object('sent', sent, 'failed', failed);
end $$;

-- One-click opt-out from any reminder e-mail. The token is random and unique to that e-mail.
create or replace function public.pna_reminder_unsubscribe(p_token uuid)
returns jsonb language plpgsql security definer set search_path = public, pg_temp as $$
declare l public.pna_reminder_log%rowtype;
begin
  select * into l from public.pna_reminder_log where token = p_token;
  if not found then return jsonb_build_object('ok', false); end if;
  if l.kind = 'daily_challenge' then
    update public.student_profiles set remind_email = false, updated_at = now() where user_id = l.subject;
  else
    update public.rehab_patients set remind_email = false, updated_at = now() where id = l.subject;
  end if;
  return jsonb_build_object('ok', true, 'kind', l.kind);
end $$;

-- Clinician view: patients on a live programme who have gone quiet. Phone is included because the follow-up is usually a call.
create or replace function public.rehab_admin_followups()
returns jsonb language plpgsql stable security definer set search_path = public, pg_temp as $$
begin
  perform public.rehab__require_admin();
  return coalesce((
    select jsonb_agg(x order by (x ->> 'since')) from (
      select jsonb_build_object(
        'patient_id', p.id, 'reference_code', p.reference_code, 'full_name', p.full_name, 'phone', p.phone,
        'reason', w.reason, 'since', w.since, 'day_number', w.day_number,
        'reminders', (select count(*) from public.pna_reminder_log l where l.subject = p.id and l.kind in ('rehab_checkin', 'rehab_day') and l.status = 'sent' and l.sent_at > now() - interval '14 days'),
        'last_reminder_at', (select max(l.sent_at) from public.pna_reminder_log l where l.subject = p.id and l.kind in ('rehab_checkin', 'rehab_day') and l.status = 'sent'),
        'can_email', (p.remind_email and p.email is not null)
      ) as x
      from public.rehab_patients p
      join lateral (
        select * from (
          select 'open_day_waiting'::text as reason, coalesce(s.available_from, s.released_at) as since, s.day_number
            from public.rehab_programmes pr
            join public.rehab_sessions s on s.programme_id = pr.id and s.status = 'unlocked'
           where pr.patient_id = p.id and pr.status = 'active'
             and coalesce(s.available_from, s.released_at) <= now() - interval '48 hours'
             and not exists (select 1 from public.rehab_feedback f where f.session_id = s.id)
          union all
          select 'checkin_missed'::text,
                 f.submitted_at + (case t when 'later_same_day' then interval '20 hours' when '24h' then interval '72 hours' else interval '120 hours' end),
                 s.day_number
            from public.rehab_programmes pr
            join public.rehab_sessions s on s.programme_id = pr.id
            join public.rehab_feedback f on f.session_id = s.id and f.completion <> 'none'
            cross join lateral unnest(pr.errp_schedule) as t
           where pr.patient_id = p.id and pr.status = 'active'
             and now() > f.submitted_at + (case t when 'later_same_day' then interval '20 hours' when '24h' then interval '72 hours' else interval '120 hours' end)
             and now() <= f.submitted_at + (case t when 'later_same_day' then interval '20 hours' when '24h' then interval '72 hours' else interval '120 hours' end) + interval '7 days'
             and not exists (select 1 from public.rehab_errp_observations o where o.session_id = s.id and o.timepoint = t)
        ) r order by since limit 1
      ) w on true
      where p.status = 'active'
    ) t), '[]'::jsonb);
end $$;

-- ─────────────────────────────── export / delete now include the league ─────────────
create or replace function public.student_export_my_data()
returns jsonb language sql stable security definer set search_path = public, pg_temp as $$
  select jsonb_build_object(
    'exported_at', now(),
    'profile', (select to_jsonb(sp) from public.student_profiles sp where sp.user_id = auth.uid()),
    'activity', coalesce((select jsonb_agg(to_jsonb(a) - 'user_id' order by a.occurred_at) from public.student_activity a where a.user_id = auth.uid()), '[]'::jsonb),
    'league', jsonb_build_object(
      'tier', (select tier from public.league_members where user_id = auth.uid()),
      'weeks', coalesce((select jsonb_agg(jsonb_build_object('week_start', e.week_start, 'tier', e.tier, 'rank', e.rank, 'xp', e.xp, 'result', e.result) order by e.week_start)
                           from public.league_entries e where e.user_id = auth.uid()), '[]'::jsonb))
  )
  where auth.uid() is not null
$$;

create or replace function public.student_delete_my_data()
returns jsonb language plpgsql security definer set search_path = public, pg_temp as $$
declare uid uuid := auth.uid();
begin
  if uid is null then raise exception 'Sign in first' using errcode = '28000'; end if;
  delete from public.league_entries where user_id = uid;
  delete from public.league_members where user_id = uid;
  delete from public.pna_reminder_log where subject = uid;
  delete from public.student_activity where user_id = uid;
  delete from public.student_profiles where user_id = uid;
  return jsonb_build_object('deleted', true);
end $$;

-- ─────────────────────────────── permissions ─────────────
revoke all on function public.pna__week_start(timestamptz), public.pna__league_xp(uuid, date), public.pna__league_settle(date),
  public.pna__student_streak(uuid) from public, anon, authenticated;
revoke all on function public.student_my_prefs(), public.student_league_my(), public.student_set_league(boolean), public.student_set_reminders(boolean, int),
  public.rehab_set_reminders(boolean), public.rehab_my_followup(), public.rehab_admin_followups(),
  public.pna_reminders_claim(timestamptz, integer), public.pna_reminders_finish(jsonb, text), public.pna_reminder_unsubscribe(uuid)
  from public, anon;
revoke all on function public.pna_reminders_claim(timestamptz, integer), public.pna_reminders_finish(jsonb, text), public.pna_reminder_unsubscribe(uuid)
  from authenticated;
grant execute on function public.student_my_prefs(), public.student_league_my(), public.student_set_league(boolean), public.student_set_reminders(boolean, int),
  public.rehab_set_reminders(boolean), public.rehab_my_followup(), public.rehab_admin_followups(), public.student_export_my_data(), public.student_delete_my_data() to authenticated;
grant execute on function public.pna_reminders_claim(timestamptz, integer), public.pna_reminders_finish(jsonb, text), public.pna_reminder_unsubscribe(uuid) to service_role;
