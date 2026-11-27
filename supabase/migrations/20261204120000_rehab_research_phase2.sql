-- RehabVerse Research Room, phase 2: symmetric measurement, a blinded outcome assessor, and the review of each history (AI accuracy and workload).
--
-- 1. Engagement events: the same server-side record of what each patient did (day opened, exercise opened or done with time on task, feedback and
--    outcome sent), written by the same code path in both arms. Objective adherence is then measured the same way for AI and no-AI participants.
-- 2. Assessors: a person who is NOT a clinic admin can be named an outcome assessor. Assessors see only study participants, under a participant code,
--    with their outcome plan and what has been recorded. Nothing they can call returns the arm, the AI switch or anything AI-related.
--    Outcomes they collect are stored with collected_by = 'assessor'.
-- 3. History reviews: for every assessment the physiotherapist records how long the review took (both arms, a workload outcome). When the history was
--    organised by the AI, they also count omissions, errors and invented details. Which case applies is decided here, not by the browser.
-- Every new record is append-only; nothing is readable through the API except through these functions.

-- ---------- 1. engagement events ----------
create table if not exists public.rehab_engagement_events (
  id bigint generated always as identity primary key,
  patient_id uuid not null references public.rehab_patients (id) on delete restrict,
  session_id uuid references public.rehab_sessions (id) on delete set null,
  event text not null check (event in ('day_opened', 'exercise_opened', 'exercise_done', 'day_left', 'feedback_sent', 'outcome_sent')),
  exercise text check (exercise is null or exercise ~ '^[a-z0-9_-]{1,80}$'),
  seconds int check (seconds is null or seconds between 0 and 7200),
  created_at timestamptz not null default now()
);
create index if not exists rehab_engagement_events_patient_idx on public.rehab_engagement_events (patient_id, created_at);
alter table public.rehab_engagement_events enable row level security;
revoke all on public.rehab_engagement_events from anon, authenticated;

-- ---------- 2. assessors ----------
create table if not exists public.rehab_study_assessors (
  user_id uuid primary key references auth.users (id) on delete cascade,
  active boolean not null default true,
  added_by uuid references auth.users (id) on delete set null,
  added_at timestamptz not null default now(),
  changed_at timestamptz not null default now()
);
alter table public.rehab_study_assessors enable row level security;
revoke all on public.rehab_study_assessors from anon, authenticated;

alter table public.rehab_outcome_responses drop constraint if exists rehab_outcome_responses_collected_by_check;
alter table public.rehab_outcome_responses add constraint rehab_outcome_responses_collected_by_check check (collected_by in ('patient', 'therapist', 'assessor'));

-- ---------- 3. history reviews ----------
create table if not exists public.rehab_history_reviews (
  id uuid primary key default gen_random_uuid(),
  patient_id uuid not null references public.rehab_patients (id) on delete restrict,
  assessment_id uuid not null unique references public.rehab_assessments (id) on delete restrict,
  ai_organised boolean not null,
  review_seconds int not null check (review_seconds between 1 and 7200),
  omissions smallint check (omissions between 0 and 50),
  errors smallint check (errors between 0 and 50),
  invented smallint check (invented between 0 and 50),
  note text check (char_length(note) <= 1000),
  reviewed_by uuid not null references auth.users (id) on delete restrict,
  created_at timestamptz not null default now(),
  -- the AI counts belong to AI-organised histories only, and are then all required
  check ((ai_organised and omissions is not null and errors is not null and invented is not null)
      or (not ai_organised and omissions is null and errors is null and invented is null))
);
alter table public.rehab_history_reviews enable row level security;
revoke all on public.rehab_history_reviews from anon, authenticated;

-- the new records cannot be changed or removed
do $$
declare t text;
begin
  foreach t in array array['rehab_engagement_events', 'rehab_history_reviews'] loop
    execute format('drop trigger if exists %I_append_only on public.%I', t, t);
    execute format('create trigger %I_append_only before update or delete on public.%I for each row execute function public.rehab_study_append_only()', t, t);
  end loop;
end $$;

-- ---------- patient: log an engagement event (both arms call exactly this) ----------
create or replace function public.rehab_log_engagement(p_event text, p_session_id uuid default null, p_exercise text default null, p_seconds int default null)
returns jsonb language plpgsql security definer set search_path = public, pg_temp as $$
declare pid uuid := public.rehab__require_patient(); today_count int;
begin
  if p_event is null or p_event not in ('day_opened', 'exercise_opened', 'exercise_done', 'day_left', 'feedback_sent', 'outcome_sent') then
    raise exception 'rehab: unknown event' using errcode = '22023';
  end if;
  if p_session_id is not null and not exists (
    select 1 from public.rehab_sessions s join public.rehab_programmes p on p.id = s.programme_id where s.id = p_session_id and p.patient_id = pid) then
    raise exception 'rehab: session not found' using errcode = 'P0002';
  end if;
  if p_exercise is not null and p_exercise !~ '^[a-z0-9_-]{1,80}$' then raise exception 'rehab: unknown exercise' using errcode = '22023'; end if;
  if p_seconds is not null and (p_seconds < 0 or p_seconds > 7200) then raise exception 'rehab: time out of range' using errcode = '22023'; end if;
  -- a generous daily cap keeps a stuck page from filling the table; nothing is lost from a normal day
  select count(*) into today_count from public.rehab_engagement_events where patient_id = pid and created_at > now() - interval '1 day';
  if today_count >= 1000 then return jsonb_build_object('logged', false); end if;
  insert into public.rehab_engagement_events (patient_id, session_id, event, exercise, seconds) values (pid, p_session_id, p_event, p_exercise, p_seconds);
  return jsonb_build_object('logged', true);
end $$;
revoke all on function public.rehab_log_engagement(text, uuid, text, int) from public, anon;
grant execute on function public.rehab_log_engagement(text, uuid, text, int) to authenticated;

-- ---------- admin: name or remove an assessor; read engagement and reviews ----------
create or replace function public.rehab_admin_study_set_assessor(p_email text, p_active boolean)
returns jsonb language plpgsql security definer set search_path = public, pg_temp as $$
declare uid uuid := public.rehab__require_admin(); target uuid; is_staff boolean;
begin
  select id into target from auth.users where lower(email) = lower(btrim(coalesce(p_email, ''))) limit 1;
  if target is null then raise exception 'rehab: no account with that e-mail; ask the person to make an account first' using errcode = 'P0002'; end if;
  select exists (select 1 from public.profiles where id = target and role in ('owner', 'admin')) into is_staff;
  if coalesce(p_active, false) and is_staff then
    raise exception 'rehab: a clinic admin can see every arm, so an admin cannot be the blinded assessor' using errcode = '22023';
  end if;
  if exists (select 1 from public.rehab_patients where user_id = target) then
    raise exception 'rehab: a patient account cannot be an assessor' using errcode = '22023';
  end if;
  insert into public.rehab_study_assessors (user_id, active, added_by) values (target, coalesce(p_active, false), uid)
  on conflict (user_id) do update set active = excluded.active, changed_at = now();
  perform public.rehab__audit(case when coalesce(p_active, false) then 'study.assessor_added' else 'study.assessor_removed' end, 'rehab_study_assessors', target, null,
    jsonb_build_object('email', lower(btrim(p_email))));
  return jsonb_build_object('user_id', target, 'active', coalesce(p_active, false));
end $$;

create or replace function public.rehab_admin_study_assessors()
returns jsonb language plpgsql stable security definer set search_path = public, pg_temp as $$
begin
  perform public.rehab__require_admin();
  return coalesce((select jsonb_agg(jsonb_build_object('user_id', a.user_id, 'email', u.email, 'active', a.active, 'added_at', a.added_at) order by a.added_at)
    from public.rehab_study_assessors a join auth.users u on u.id = a.user_id), '[]'::jsonb);
end $$;

-- per participant: days with activity, exercises done, minutes, feedback and outcomes sent (the same measures for every arm)
create or replace function public.rehab_admin_engagement(p_patient_id uuid)
returns jsonb language plpgsql stable security definer set search_path = public, pg_temp as $$
begin
  perform public.rehab__require_admin();
  return jsonb_build_object(
    'active_days', (select count(distinct (created_at at time zone 'Asia/Karachi')::date) from public.rehab_engagement_events where patient_id = p_patient_id),
    'days_opened', (select count(*) from public.rehab_engagement_events where patient_id = p_patient_id and event = 'day_opened'),
    'exercises_done', (select count(*) from public.rehab_engagement_events where patient_id = p_patient_id and event = 'exercise_done'),
    'minutes', (select coalesce(round(sum(seconds) / 60.0), 0) from public.rehab_engagement_events where patient_id = p_patient_id and event in ('exercise_done', 'day_left')),
    'feedback_sent', (select count(*) from public.rehab_engagement_events where patient_id = p_patient_id and event = 'feedback_sent'),
    'outcomes_sent', (select count(*) from public.rehab_engagement_events where patient_id = p_patient_id and event = 'outcome_sent'),
    'last_at', (select max(created_at) from public.rehab_engagement_events where patient_id = p_patient_id));
end $$;

-- ---------- admin: review a history ----------
create or replace function public.rehab_admin_history_review(p_assessment_id uuid, p_seconds int, p_omissions int default null, p_errors int default null, p_invented int default null, p_note text default null)
returns jsonb language plpgsql security definer set search_path = public, pg_temp as $$
declare uid uuid := public.rehab__require_admin(); a public.rehab_assessments%rowtype; via_ai boolean; new_id uuid;
begin
  select * into a from public.rehab_assessments where id = p_assessment_id;
  if not found then raise exception 'rehab: assessment not found' using errcode = 'P0002'; end if;
  if exists (select 1 from public.rehab_history_reviews where assessment_id = a.id) then
    raise exception 'rehab: this history has already been reviewed (reviews are not edited)' using errcode = '22023';
  end if;
  if p_seconds is null or p_seconds < 1 or p_seconds > 7200 then raise exception 'rehab: review time out of range' using errcode = '22023'; end if;
  via_ai := exists (select 1 from public.rehab_ai_conversations c where c.assessment_id = a.id);
  if via_ai and (p_omissions is null or p_errors is null or p_invented is null) then
    raise exception 'rehab: count the omissions, errors and invented details of the AI history (0 if none)' using errcode = '22023';
  end if;
  if not via_ai and (p_omissions is not null or p_errors is not null or p_invented is not null) then
    raise exception 'rehab: this history was not organised by the AI' using errcode = '22023';
  end if;
  insert into public.rehab_history_reviews (patient_id, assessment_id, ai_organised, review_seconds, omissions, errors, invented, note, reviewed_by)
  values (a.patient_id, a.id, via_ai, p_seconds,
          case when via_ai then p_omissions end, case when via_ai then p_errors end, case when via_ai then p_invented end,
          nullif(left(btrim(coalesce(p_note, '')), 1000), ''), uid)
  returning id into new_id;
  perform public.rehab__audit('history.reviewed', 'rehab_history_reviews', new_id, a.patient_id, jsonb_build_object('ai_organised', via_ai, 'seconds', p_seconds));
  return jsonb_build_object('id', new_id, 'ai_organised', via_ai);
end $$;

create or replace function public.rehab_admin_history_reviews(p_patient_id uuid)
returns jsonb language plpgsql stable security definer set search_path = public, pg_temp as $$
begin
  perform public.rehab__require_admin();
  return coalesce((select jsonb_agg(jsonb_build_object('assessment_id', r.assessment_id, 'ai_organised', r.ai_organised, 'review_seconds', r.review_seconds,
      'omissions', r.omissions, 'errors', r.errors, 'invented', r.invented, 'note', r.note, 'created_at', r.created_at) order by r.created_at)
    from public.rehab_history_reviews r where r.patient_id = p_patient_id), '[]'::jsonb);
end $$;

-- ---------- assessor (blinded) ----------
create or replace function public.rehab__require_assessor() returns uuid
language plpgsql stable security definer set search_path = public, pg_temp as $$
begin
  if auth.uid() is null or not exists (select 1 from public.rehab_study_assessors where user_id = auth.uid() and active)
     or exists (select 1 from public.profiles where id = auth.uid() and role in ('owner', 'admin')) then
    raise exception 'rehab: not authorised' using errcode = '42501';
  end if;
  return auth.uid();
end $$;

-- Participants of the latest study under a participant code (P001, P002, ... in order of enrolment), with what the plan asks for and what is recorded.
-- No arm, no AI switch, no stratum: the assessor only sees what is needed to collect outcomes.
create or replace function public.rehab_assessor_queue()
returns jsonb language plpgsql stable security definer set search_path = public, pg_temp as $$
declare st public.rehab_studies%rowtype;
begin
  perform public.rehab__require_assessor();
  select * into st from public.rehab_studies order by created_at desc limit 1;
  if not found then return jsonb_build_object('study', null, 'participants', '[]'::jsonb); end if;
  return jsonb_build_object(
    'study', jsonb_build_object('code', st.code, 'title', st.title, 'status', st.status),
    'participants', coalesce((
      select jsonb_agg(jsonb_build_object(
        'code', 'P' || lpad(x.n::text, 3, '0'), 'patient_id', x.patient_id, 'full_name', p.full_name, 'phone', p.phone,
        'preferred_language', p.preferred_language, 'enrolled_at', x.allocated_at,
        'plan', (select o.items from public.rehab_outcome_plans o where o.patient_id = x.patient_id order by o.created_at desc limit 1),
        'psfs_activities', coalesce((select jsonb_agg(a ->> 'name') from public.rehab_outcome_responses r, jsonb_array_elements(r.answers -> 'activities') a
                                     where r.patient_id = x.patient_id and r.instrument = 'psfs' and r.timepoint = 'baseline'), '[]'::jsonb),
        'recorded', coalesce((select jsonb_agg(jsonb_build_object('instrument', r.instrument, 'timepoint', r.timepoint, 'collected_by', r.collected_by, 'taken_at', r.taken_at))
                               from public.rehab_outcome_responses r where r.patient_id = x.patient_id), '[]'::jsonb)
      ) order by x.n)
      from (select a.patient_id, a.allocated_at, row_number() over (order by a.allocated_at, a.id) as n from public.rehab_study_allocations a where a.study_id = st.id) x
      join public.rehab_patients p on p.id = x.patient_id), '[]'::jsonb));
end $$;

-- What the server needs to save an assessor's record for one participant (the live plan); refused for anyone outside the study.
create or replace function public.rehab_assessor_plan(p_patient_id uuid)
returns jsonb language plpgsql stable security definer set search_path = public, pg_temp as $$
declare plan_row public.rehab_outcome_plans%rowtype;
begin
  perform public.rehab__require_assessor();
  if not exists (select 1 from public.rehab_study_allocations where patient_id = p_patient_id) then
    raise exception 'rehab: not a study participant' using errcode = 'P0002';
  end if;
  select * into plan_row from public.rehab_outcome_plans where patient_id = p_patient_id order by created_at desc limit 1;
  if not found then raise exception 'rehab: no outcome plan' using errcode = 'P0002'; end if;
  return jsonb_build_object('plan_id', plan_row.id, 'items', plan_row.items,
    'recorded', coalesce((select jsonb_agg(jsonb_build_object('instrument', r.instrument, 'timepoint', r.timepoint, 'answers', r.answers))
                          from public.rehab_outcome_responses r where r.patient_id = p_patient_id), '[]'::jsonb));
end $$;

revoke all on function public.rehab__require_assessor() from public, anon, authenticated;
revoke all on function public.rehab_admin_study_set_assessor(text, boolean) from public, anon;
revoke all on function public.rehab_admin_study_assessors() from public, anon;
revoke all on function public.rehab_admin_engagement(uuid) from public, anon;
revoke all on function public.rehab_admin_history_review(uuid, int, int, int, int, text) from public, anon;
revoke all on function public.rehab_admin_history_reviews(uuid) from public, anon;
revoke all on function public.rehab_assessor_queue() from public, anon;
revoke all on function public.rehab_assessor_plan(uuid) from public, anon;
grant execute on function public.rehab_admin_study_set_assessor(text, boolean) to authenticated;
grant execute on function public.rehab_admin_study_assessors() to authenticated;
grant execute on function public.rehab_admin_engagement(uuid) to authenticated;
grant execute on function public.rehab_admin_history_review(uuid, int, int, int, int, text) to authenticated;
grant execute on function public.rehab_admin_history_reviews(uuid) to authenticated;
grant execute on function public.rehab_assessor_queue() to authenticated;
grant execute on function public.rehab_assessor_plan(uuid) to authenticated;
