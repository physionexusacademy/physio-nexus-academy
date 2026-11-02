-- PNA Daily Clinical Challenge: server-owned score storage and ranking.
-- Daily reset is date-driven in Asia/Karachi; no nightly cron or data deletion.
create table if not exists public.daily_challenge_attempts (
  id uuid primary key default gen_random_uuid(),
  challenge_date date not null,
  full_name text not null check (char_length(full_name) between 2 and 80),
  email text not null,
  email_key text not null,
  attempt_token uuid not null default gen_random_uuid(),
  started_at timestamptz not null default now(),
  submitted_at timestamptz,
  status text not null default 'started' check (status in ('started','submitted','expired')),
  correct_count smallint check (correct_count between 0 and 5),
  score smallint check (score between 0 and 100),
  elapsed_ms integer,
  constraint daily_challenge_one_attempt_per_day unique (challenge_date, email_key),
  constraint daily_challenge_score_pair check (
    (status = 'started' and score is null and correct_count is null)
    or (status in ('submitted','expired') and score is not null and correct_count is not null)
  )
);
create index if not exists daily_challenge_period_ranking
  on public.daily_challenge_attempts (challenge_date, status, score desc, submitted_at asc);
create index if not exists daily_challenge_email_history
  on public.daily_challenge_attempts (email_key, challenge_date desc);
alter table public.daily_challenge_attempts enable row level security;
revoke all on public.daily_challenge_attempts from anon, authenticated;
-- The web server's service-role client submits attempts and requests sanitized rankings.
create or replace function public.pna_daily_challenge_leaderboard(
  p_period text, p_anchor date, p_limit integer default 50, p_offset integer default 0
)
returns table (
  place bigint, display_name text, points bigint, challenges bigint, most_recent timestamptz
)
language sql
security definer
set search_path = public
as $$
  with period_boundary as (
    select case
      when p_period = 'today' then p_anchor
      when p_period = 'month' then date_trunc('month',p_anchor::timestamp)::date
      when p_period = 'year' then date_trunc('year',p_anchor::timestamp)::date
    end as from_date,
    case
      when p_period = 'today' then p_anchor + 1
      when p_period = 'month' then (date_trunc('month',p_anchor::timestamp) + interval '1 month')::date
      when p_period = 'year' then (date_trunc('year',p_anchor::timestamp) + interval '1 year')::date
    end as to_date
  ), totals as (
    select a.email_key, max(a.full_name) as display_name,
      sum(a.score)::bigint as points, count(*)::bigint as challenges,
      max(a.submitted_at) as most_recent, min(a.submitted_at) as first_finish
    from public.daily_challenge_attempts a
    cross join period_boundary b
    where p_period in ('today','month','year')
      and a.status = 'submitted'
      and a.challenge_date >= b.from_date and a.challenge_date < b.to_date
    group by a.email_key
  ), ranked as (
    select row_number() over(
      order by t.points desc,t.challenges desc,t.first_finish asc,t.email_key asc
    ) as place, t.display_name,t.points,t.challenges,t.most_recent
    from totals t
  )
  select r.place,r.display_name,r.points,r.challenges,r.most_recent from ranked r
  order by r.place
  limit least(greatest(coalesce(p_limit,50),1),100)
  offset greatest(coalesce(p_offset,0),0);
$$;
revoke all on function public.pna_daily_challenge_leaderboard(text,date,integer,integer) from public, anon, authenticated;
grant execute on function public.pna_daily_challenge_leaderboard(text,date,integer,integer) to service_role;
