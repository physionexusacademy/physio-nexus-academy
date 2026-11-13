-- =====================================================================================
-- PNA Student accounts — a personal record of every learning activity.   ADDITIVE migration
-- (no drops, no changes to existing tables). Safe to re-run.
--
-- Security model (same as RehabVerse)
--   * Row level security ON for every table; API roles (anon / authenticated) have NO direct write access.
--   * All changes go through SECURITY DEFINER functions that use auth.uid() — nobody can write for someone else.
--   * A student can read only their own rows. Nothing here is visible to other students or the public.
--   * XP written by the browser is bounded server-side (per-activity caps, a daily cap, idempotent event keys),
--     so a record is a learning log, never a certificate.
-- =====================================================================================

-- ─────────────────────────────── profile ─────────────
create table if not exists public.student_profiles (
  user_id uuid primary key references auth.users (id) on delete cascade,
  display_name text not null check (char_length(display_name) between 2 and 40),
  stage text check (stage in ('year1-2', 'year3-4', 'final-intern', 'graduate', 'other')),
  goal text check (goal in ('understand', 'exams', 'clinic', 'manual')),
  university text check (university is null or char_length(university) <= 80),
  city text check (city is null or char_length(city) <= 60),
  league_opt_in boolean not null default true,
  remind_email boolean not null default false,
  remind_hour smallint not null default 18 check (remind_hour between 0 and 23),
  imported_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- ─────────────────────────────── activity log ─────────────
create table if not exists public.student_activity (
  id bigint generated always as identity primary key,
  user_id uuid not null references auth.users (id) on delete cascade,
  source text not null check (source in ('daily-challenge', 'clinical-arena', 'pna-teacher', 'skills-lab', 'virtual-patient', 'imported')),
  event_key text not null check (char_length(event_key) between 3 and 160),
  label text not null check (char_length(label) between 1 and 160),
  xp integer not null check (xp between 0 and 5000),
  score smallint check (score is null or score between 0 and 100),
  occurred_at timestamptz not null default now(),
  day date not null,
  created_at timestamptz not null default now(),
  unique (user_id, event_key)
);
create index if not exists student_activity_user_time_idx on public.student_activity (user_id, occurred_at desc);
create index if not exists student_activity_user_day_idx on public.student_activity (user_id, day);

alter table public.student_profiles enable row level security;
alter table public.student_activity enable row level security;

drop policy if exists student_profiles_own_select on public.student_profiles;
create policy student_profiles_own_select on public.student_profiles for select to authenticated using (user_id = auth.uid());
drop policy if exists student_activity_own_select on public.student_activity;
create policy student_activity_own_select on public.student_activity for select to authenticated using (user_id = auth.uid());

revoke all on public.student_profiles, public.student_activity from anon, authenticated;
grant select on public.student_profiles, public.student_activity to authenticated;

-- ─────────────────────────────── helpers ─────────────
create or replace function public.student__pk_day(ts timestamptz) returns date
language sql stable as $$ select (ts at time zone 'Asia/Karachi')::date $$;

-- Largest XP one activity may carry, by source (the app awards less; this is the safety ceiling).
create or replace function public.student__xp_cap(src text) returns integer
language sql immutable as $$
  select case src
    when 'pna-teacher' then 80
    when 'skills-lab' then 150
    when 'virtual-patient' then 200
    when 'daily-challenge' then 120
    when 'clinical-arena' then 100
    when 'imported' then 5000
    else 0 end
$$;

-- ─────────────────────────────── profile functions ─────────────
create or replace function public.student_upsert_profile(p jsonb)
returns jsonb language plpgsql security definer set search_path = public as $$
declare
  uid uuid := auth.uid();
  v_name text := btrim(coalesce(p ->> 'display_name', ''));
  v_stage text := nullif(p ->> 'stage', '');
  v_goal text := nullif(p ->> 'goal', '');
  v_uni text := nullif(btrim(coalesce(p ->> 'university', '')), '');
  v_city text := nullif(btrim(coalesce(p ->> 'city', '')), '');
  row_out public.student_profiles;
begin
  if uid is null then raise exception 'Sign in first' using errcode = '28000'; end if;
  if char_length(v_name) < 2 or char_length(v_name) > 40 then raise exception 'Name must be 2–40 characters' using errcode = '22023'; end if;
  insert into public.student_profiles as sp (user_id, display_name, stage, goal, university, city, league_opt_in, remind_email, remind_hour)
  values (
    uid, v_name, v_stage, v_goal, left(v_uni, 80), left(v_city, 60),
    coalesce((p ->> 'league_opt_in')::boolean, true),
    coalesce((p ->> 'remind_email')::boolean, false),
    least(23, greatest(0, coalesce((p ->> 'remind_hour')::int, 18)))
  )
  on conflict (user_id) do update set
    display_name = excluded.display_name,
    stage = excluded.stage,
    goal = excluded.goal,
    university = excluded.university,
    city = excluded.city,
    league_opt_in = case when p ? 'league_opt_in' then excluded.league_opt_in else sp.league_opt_in end,
    remind_email = case when p ? 'remind_email' then excluded.remind_email else sp.remind_email end,
    remind_hour = case when p ? 'remind_hour' then excluded.remind_hour else sp.remind_hour end,
    updated_at = now()
  returning * into row_out;
  return to_jsonb(row_out);
end $$;

-- ─────────────────────────────── recording activity ─────────────
-- p = {"events":[{"source","event_key","label","xp","score","occurred_at"}]}  (at most 50 per call)
create or replace function public.student_record_activities(p jsonb)
returns jsonb language plpgsql security definer set search_path = public as $$
declare
  uid uuid := auth.uid();
  ev jsonb;
  v_source text; v_key text; v_label text; v_xp int; v_score int; v_at timestamptz; v_day date;
  v_today_xp int; v_room int; v_cap int;
  inserted int := 0; skipped int := 0;
begin
  if uid is null then raise exception 'Sign in first' using errcode = '28000'; end if;
  if not exists (select 1 from public.student_profiles where user_id = uid) then raise exception 'Create your student profile first' using errcode = '22023'; end if;
  if jsonb_typeof(p -> 'events') <> 'array' or jsonb_array_length(p -> 'events') > 50 then raise exception 'Send up to 50 events' using errcode = '22023'; end if;
  for ev in select * from jsonb_array_elements(p -> 'events') loop
    -- each event is isolated: one malformed event is skipped and can never block the rest of the queue
    begin
      v_source := ev ->> 'source';
      v_key := left(coalesce(ev ->> 'event_key', ''), 160);
      v_label := left(btrim(coalesce(ev ->> 'label', '')), 160);
      v_cap := public.student__xp_cap(v_source);
      if v_source = 'imported' or v_cap = 0 or char_length(v_key) < 3 or char_length(v_label) < 1 then skipped := skipped + 1; continue; end if;
      v_xp := least(v_cap, greatest(0, round(coalesce((ev ->> 'xp')::numeric, 0))::int));
      v_score := case when ev ? 'score' and ev ->> 'score' ~ '^\d+(\.\d+)?$' then least(100, round((ev ->> 'score')::numeric)::int) else null end;
      v_at := coalesce((ev ->> 'occurred_at')::timestamptz, now());
      if v_at > now() + interval '1 day' or v_at < now() - interval '400 days' then v_at := now(); end if;
      v_day := public.student__pk_day(v_at);
      -- daily XP ceiling (imported history does not count)
      select coalesce(sum(xp), 0) into v_today_xp from public.student_activity where user_id = uid and day = v_day and source <> 'imported';
      v_room := greatest(0, 800 - v_today_xp);
      v_xp := least(v_xp, v_room);
      insert into public.student_activity (user_id, source, event_key, label, xp, score, occurred_at, day)
      values (uid, v_source, v_key, v_label, v_xp, v_score, v_at, v_day)
      on conflict (user_id, event_key) do nothing;
      if found then inserted := inserted + 1; else skipped := skipped + 1; end if;
    exception when others then
      skipped := skipped + 1;
    end;
  end loop;
  return jsonb_build_object(
    'inserted', inserted, 'skipped', skipped,
    'total_xp', (select coalesce(sum(xp), 0) from public.student_activity where user_id = uid)
  );
end $$;

-- One-time bring-over of what the browser already knew before the account existed.
-- p = {"total_xp": int, "active_dates": ["YYYY-MM-DD", ...]}
create or replace function public.student_import_local(p jsonb)
returns jsonb language plpgsql security definer set search_path = public as $$
declare
  uid uuid := auth.uid();
  v_xp int := least(5000, greatest(0, round(coalesce((p ->> 'total_xp')::numeric, 0))::int));
  d text; n int := 0;
begin
  if uid is null then raise exception 'Sign in first' using errcode = '28000'; end if;
  if not exists (select 1 from public.student_profiles where user_id = uid) then raise exception 'Create your student profile first' using errcode = '22023'; end if;
  if (select imported_at from public.student_profiles where user_id = uid) is not null then
    return jsonb_build_object('imported', false);
  end if;
  update public.student_profiles set imported_at = now() where user_id = uid;
  if v_xp > 0 then
    insert into public.student_activity (user_id, source, event_key, label, xp, occurred_at, day)
    values (uid, 'imported', 'imported:xp', 'Progress saved on this device before you signed in', v_xp, now() - interval '1 second', public.student__pk_day(now() - interval '1 day'))
    on conflict do nothing;
  end if;
  if jsonb_typeof(p -> 'active_dates') = 'array' then
    for d in select * from jsonb_array_elements_text(p -> 'active_dates') loop
      exit when n >= 120;
      if d ~ '^\d{4}-\d{2}-\d{2}$' and d::date between current_date - 400 and current_date + 1 then
        insert into public.student_activity (user_id, source, event_key, label, xp, occurred_at, day)
        values (uid, 'imported', 'imported:day:' || d, 'Active day', 0, (d::date)::timestamptz + interval '12 hours', d::date)
        on conflict do nothing;
        n := n + 1;
      end if;
    end loop;
  end if;
  return jsonb_build_object('imported', true, 'xp', v_xp, 'days', n);
end $$;

-- ─────────────────────────────── reading it back ─────────────
create or replace function public.student_my_summary(p_days int default 30)
returns jsonb language plpgsql stable security definer set search_path = public as $$
declare
  uid uuid := auth.uid();
  days int := least(120, greatest(7, coalesce(p_days, 30)));
  prof jsonb;
  streak_now int := 0; streak_best int := 0;
begin
  if uid is null then raise exception 'Sign in first' using errcode = '28000'; end if;
  select to_jsonb(sp) into prof from public.student_profiles sp where sp.user_id = uid;
  if prof is null then return jsonb_build_object('profile', null); end if;

  -- streaks over distinct active days (a day with any activity counts)
  with d as (select distinct day from public.student_activity where user_id = uid),
       grp as (select day, day - (row_number() over (order by day))::int as g from d),
       runs as (select min(day) as s, max(day) as e, count(*) as len from grp group by g)
  select coalesce(max(len), 0)::int,
         coalesce(max(case when e >= public.student__pk_day(now()) - 1 then len end), 0)::int
    into streak_best, streak_now from runs;

  return jsonb_build_object(
    'profile', prof,
    'totals', (select jsonb_build_object(
        'xp', coalesce(sum(xp), 0), 'events', count(*) filter (where source <> 'imported'),
        'active_days', count(distinct day), 'first_day', min(day))
       from public.student_activity where user_id = uid),
    'streak', jsonb_build_object('current', streak_now, 'best', streak_best),
    'by_day', (select coalesce(jsonb_agg(jsonb_build_object('day', day, 'xp', xp, 'events', ev) order by day), '[]'::jsonb)
       from (select day, sum(xp)::int as xp, count(*)::int as ev from public.student_activity
              where user_id = uid and day >= public.student__pk_day(now()) - days + 1 group by day) t),
    'by_source', (select coalesce(jsonb_agg(jsonb_build_object('source', source, 'xp', xp, 'events', ev, 'xp_7d', xp7, 'last_day', last_day, 'avg_score', avg_score) order by xp desc), '[]'::jsonb)
       from (select source, sum(xp)::int as xp, count(*)::int as ev,
                    coalesce(sum(xp) filter (where day >= public.student__pk_day(now()) - 6), 0)::int as xp7,
                    max(day) as last_day, round(avg(score))::int as avg_score
               from public.student_activity where user_id = uid and source <> 'imported' group by source) s),
    'recent', (select coalesce(jsonb_agg(jsonb_build_object('source', source, 'label', label, 'xp', xp, 'score', score, 'at', occurred_at) order by occurred_at desc), '[]'::jsonb)
       from (select * from public.student_activity where user_id = uid and source <> 'imported' order by occurred_at desc limit 25) r)
  );
end $$;

create or replace function public.student_export_my_data()
returns jsonb language sql stable security definer set search_path = public as $$
  select jsonb_build_object(
    'exported_at', now(),
    'profile', (select to_jsonb(sp) from public.student_profiles sp where sp.user_id = auth.uid()),
    'activity', coalesce((select jsonb_agg(to_jsonb(a) - 'user_id' order by a.occurred_at) from public.student_activity a where a.user_id = auth.uid()), '[]'::jsonb)
  )
  where auth.uid() is not null
$$;

create or replace function public.student_delete_my_data()
returns jsonb language plpgsql security definer set search_path = public as $$
declare uid uuid := auth.uid();
begin
  if uid is null then raise exception 'Sign in first' using errcode = '28000'; end if;
  delete from public.student_activity where user_id = uid;
  delete from public.student_profiles where user_id = uid;
  return jsonb_build_object('deleted', true);
end $$;

-- ─────────────────────────────── permissions ─────────────
revoke all on function public.student_upsert_profile(jsonb), public.student_record_activities(jsonb), public.student_import_local(jsonb),
  public.student_my_summary(int), public.student_export_my_data(), public.student_delete_my_data(),
  public.student__pk_day(timestamptz), public.student__xp_cap(text) from public, anon;
grant execute on function public.student_upsert_profile(jsonb), public.student_record_activities(jsonb), public.student_import_local(jsonb),
  public.student_my_summary(int), public.student_export_my_data(), public.student_delete_my_data() to authenticated;
