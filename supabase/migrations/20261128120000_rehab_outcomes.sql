-- RehabVerse outcome measures (28 Nov 2026).
--
-- A physiotherapist chooses which outcome measures to follow for a patient and how often (a plan). The patient answers the questionnaires that are due; the
-- physiotherapist records the measurements they take themselves. Every answer is stored with the instrument, its version, the time point, the language the
-- words were shown in, who collected it, and a score that the SERVER worked out from the raw answers (the browser never supplies a score). Stored answers cannot be
-- edited afterwards, so a research record is exactly what was answered.
--
--   rehab_outcome_plans      what is followed for a patient (each new plan is a new row; the latest is the live one; earlier ones stay as history)
--   rehab_outcome_responses  one answer set per patient, instrument and time point (never edited)
--
-- Which instruments exist, their wording and their scoring live in code (src/lib/outcomes) and are versioned; the database only keeps the data and enforces who
-- may write and read it.

create table if not exists public.rehab_outcome_plans (
  id uuid primary key default gen_random_uuid(),
  patient_id uuid not null references public.rehab_patients (id) on delete restrict,
  items jsonb not null check (jsonb_typeof(items) = 'array' and jsonb_array_length(items) between 1 and 8),
  anchor_at timestamptz not null default now(),
  note text check (note is null or char_length(note) <= 500),
  created_by uuid references auth.users (id) on delete set null,
  created_at timestamptz not null default now()
);
create index if not exists rehab_outcome_plans_patient_idx on public.rehab_outcome_plans (patient_id, created_at desc);
alter table public.rehab_outcome_plans enable row level security;
revoke all on public.rehab_outcome_plans from anon, authenticated;

create table if not exists public.rehab_outcome_responses (
  id uuid primary key default gen_random_uuid(),
  patient_id uuid not null references public.rehab_patients (id) on delete restrict,
  plan_id uuid references public.rehab_outcome_plans (id) on delete set null,
  instrument text not null check (instrument ~ '^[a-z0-9_]{2,30}$'),
  instrument_version smallint not null check (instrument_version >= 1),
  timepoint text not null check (timepoint in ('baseline', 'w1', 'w2', 'w4', 'w6', 'w12', 'discharge')),
  answers jsonb not null check (jsonb_typeof(answers) = 'object' and pg_column_size(answers) <= 20000),
  score jsonb not null check (jsonb_typeof(score) = 'object' and pg_column_size(score) <= 4000),
  language text not null check (language in ('en', 'ru')),
  collected_by text not null check (collected_by in ('patient', 'therapist')),
  taken_at timestamptz not null default now(),
  unique (patient_id, instrument, timepoint)
);
create index if not exists rehab_outcome_responses_patient_idx on public.rehab_outcome_responses (patient_id, taken_at);
alter table public.rehab_outcome_responses enable row level security;
revoke all on public.rehab_outcome_responses from anon, authenticated;

-- An answer is a record: it cannot be changed afterwards.
create or replace function public.rehab_outcome_responses_guard() returns trigger
language plpgsql set search_path = public, pg_temp as $$
begin
  raise exception 'rehab: an outcome record cannot be changed' using errcode = '55000';
end $$;
drop trigger if exists rehab_outcome_responses_guard on public.rehab_outcome_responses;
create trigger rehab_outcome_responses_guard before update on public.rehab_outcome_responses
  for each row execute function public.rehab_outcome_responses_guard();
revoke all on function public.rehab_outcome_responses_guard() from public, anon, authenticated;

-- The physiotherapist chooses what to follow. The shape is checked here; whether each instrument is available and at its current version is checked by the app.
create or replace function public.rehab_admin_set_outcome_plan(p_patient_id uuid, p_items jsonb, p_note text default null)
returns jsonb language plpgsql security definer set search_path = public, pg_temp as $$
declare uid uuid := public.rehab__require_admin(); e jsonb; seen text[] := '{}'; new_id uuid;
begin
  if not exists (select 1 from public.rehab_patients where id = p_patient_id and status = 'active') then
    raise exception 'rehab: patient not found' using errcode = 'P0002';
  end if;
  if jsonb_typeof(p_items) is distinct from 'array' or jsonb_array_length(p_items) not between 1 and 8 then
    raise exception 'rehab: choose between 1 and 8 instruments' using errcode = '22023';
  end if;
  for e in select * from jsonb_array_elements(p_items) loop
    if jsonb_typeof(e) is distinct from 'object'
       or coalesce(e ->> 'instrument', '') !~ '^[a-z0-9_]{2,30}$'
       or coalesce(e ->> 'version', '') !~ '^[0-9]{1,3}$'
       or coalesce(e ->> 'schedule', '') not in ('standard', 'intensive', 'single') then
      raise exception 'rehab: invalid plan entry' using errcode = '22023';
    end if;
    if (e ->> 'instrument') = any (seen) then raise exception 'rehab: an instrument is chosen twice' using errcode = '22023'; end if;
    seen := seen || (e ->> 'instrument');
  end loop;
  insert into public.rehab_outcome_plans (patient_id, items, note, created_by)
  values (p_patient_id, p_items, nullif(btrim(coalesce(p_note, '')), ''), uid) returning id into new_id;
  perform public.rehab__audit('outcomes.plan_set', 'rehab_outcome_plans', new_id, p_patient_id,
    jsonb_build_object('instruments', (select jsonb_agg(x ->> 'instrument') from jsonb_array_elements(p_items) x)));
  perform public.rehab__notify_patient(p_patient_id, 'outcomes_assigned', 'info', 'Questions from your physiotherapist',
    'Your physiotherapist has chosen a few short questionnaires to follow your progress. You will find them on your dashboard.', '{}'::jsonb);
  return jsonb_build_object('id', new_id);
end $$;

-- Server only: the action works the score out from the raw answers and calls this once per answer set.
create or replace function public.rehab_outcome_save(
  p_patient_id uuid, p_plan_id uuid, p_instrument text, p_version int, p_timepoint text, p_answers jsonb, p_score jsonb, p_language text, p_collected_by text)
returns jsonb language plpgsql security definer set search_path = public, pg_temp as $$
declare plan_row public.rehab_outcome_plans%rowtype; new_id uuid;
begin
  if not exists (select 1 from public.rehab_patients where id = p_patient_id and status = 'active') then
    raise exception 'rehab: patient not found' using errcode = 'P0002';
  end if;
  -- Only what the physiotherapist chose (in the live plan, at the version chosen) can be recorded.
  select * into plan_row from public.rehab_outcome_plans where patient_id = p_patient_id order by created_at desc limit 1;
  if not found or plan_row.id is distinct from p_plan_id
     or not exists (select 1 from jsonb_array_elements(plan_row.items) x where x ->> 'instrument' = p_instrument and (x ->> 'version')::int = p_version) then
    raise exception 'rehab: this instrument is not in the patient''s plan' using errcode = '22023';
  end if;
  insert into public.rehab_outcome_responses (patient_id, plan_id, instrument, instrument_version, timepoint, answers, score, language, collected_by)
  values (p_patient_id, p_plan_id, p_instrument, p_version, p_timepoint, p_answers, p_score, p_language, p_collected_by)
  on conflict (patient_id, instrument, timepoint) do nothing
  returning id into new_id;
  if new_id is not null then
    perform public.rehab__audit('outcomes.recorded', 'rehab_outcome_responses', new_id, p_patient_id,
      jsonb_build_object('instrument', p_instrument, 'timepoint', p_timepoint, 'collected_by', p_collected_by));
    if p_collected_by = 'patient' then
      perform public.rehab__notify_admin('outcomes_answered', 'info', 'Outcome questionnaire answered',
        p_instrument || ' (' || p_timepoint || ') was answered.', p_patient_id, jsonb_build_object('instrument', p_instrument), '/admin/rehabverse/patients/' || p_patient_id::text);
    end if;
  end if;
  return jsonb_build_object('saved', new_id is not null, 'id', new_id);
end $$;

-- What the patient may see of her/his own outcomes: the live plan and every answer given.
create or replace function public.rehab_my_outcomes()
returns jsonb language plpgsql stable security definer set search_path = public, pg_temp as $$
declare pid uuid := public.rehab__require_patient(); plan_row public.rehab_outcome_plans%rowtype;
begin
  select * into plan_row from public.rehab_outcome_plans where patient_id = pid order by created_at desc limit 1;
  if not found then return jsonb_build_object('plan', null, 'responses', '[]'::jsonb); end if;
  return jsonb_build_object(
    'plan', jsonb_build_object('id', plan_row.id, 'items', plan_row.items, 'anchor_at', plan_row.anchor_at),
    'responses', coalesce((select jsonb_agg(jsonb_build_object('instrument', r.instrument, 'version', r.instrument_version, 'timepoint', r.timepoint,
        'answers', r.answers, 'score', r.score, 'language', r.language, 'collected_by', r.collected_by, 'taken_at', r.taken_at) order by r.taken_at)
        from public.rehab_outcome_responses r where r.patient_id = pid), '[]'::jsonb));
end $$;

-- The physiotherapist's view: the live plan, the plans before it, and every answer.
create or replace function public.rehab_admin_outcomes(p_patient_id uuid)
returns jsonb language plpgsql stable security definer set search_path = public, pg_temp as $$
declare plan_row public.rehab_outcome_plans%rowtype;
begin
  perform public.rehab__require_admin();
  select * into plan_row from public.rehab_outcome_plans where patient_id = p_patient_id order by created_at desc limit 1;
  return jsonb_build_object(
    'plan', case when plan_row.id is null then null else jsonb_build_object('id', plan_row.id, 'items', plan_row.items, 'anchor_at', plan_row.anchor_at,
                                                                            'note', plan_row.note, 'created_at', plan_row.created_at) end,
    'earlier_plans', (select count(*) from public.rehab_outcome_plans where patient_id = p_patient_id) - case when plan_row.id is null then 0 else 1 end,
    'responses', coalesce((select jsonb_agg(jsonb_build_object('id', r.id, 'instrument', r.instrument, 'version', r.instrument_version, 'timepoint', r.timepoint,
        'answers', r.answers, 'score', r.score, 'language', r.language, 'collected_by', r.collected_by, 'taken_at', r.taken_at) order by r.taken_at)
        from public.rehab_outcome_responses r where r.patient_id = p_patient_id), '[]'::jsonb));
end $$;

do $$
begin
  revoke all on function public.rehab_outcome_save(uuid, uuid, text, int, text, jsonb, jsonb, text, text) from public, anon, authenticated;
  grant execute on function public.rehab_outcome_save(uuid, uuid, text, int, text, jsonb, jsonb, text, text) to service_role;
  revoke all on function public.rehab_my_outcomes() from public, anon;
  grant execute on function public.rehab_my_outcomes() to authenticated;
  revoke all on function public.rehab_admin_set_outcome_plan(uuid, jsonb, text) from public, anon;
  grant execute on function public.rehab_admin_set_outcome_plan(uuid, jsonb, text) to authenticated;
  revoke all on function public.rehab_admin_outcomes(uuid) from public, anon;
  grant execute on function public.rehab_admin_outcomes(uuid) to authenticated;
end $$;
