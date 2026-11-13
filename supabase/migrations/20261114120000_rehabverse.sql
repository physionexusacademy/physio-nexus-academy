-- =====================================================================================
-- PNA RehabVerse — guided digital rehabilitation.   ADDITIVE migration (no drops, no
-- changes to existing tables). Safe to re-run.
--
-- Security model
--   * Every table has row level security ON and no direct write access for API roles
--     (anon / authenticated). All changes go through the SECURITY DEFINER functions below,
--     which check auth.uid() / is_admin() themselves.
--   * A patient can only ever read rows that belong to their own patient record.
--   * Admins (public.is_admin(): profiles.role in owner/admin) review and prescribe.
--   * Exercises of a day are readable by the patient only while that day is released
--     (enforced by RLS, not just by the app).
--   * rehab_audit_log is append-only (trigger blocks UPDATE/DELETE) and admin-readable.
--
-- Assumes the existing objects: auth.users, auth.uid(), public.is_admin().
-- The exercise library itself lives in the app code (typed, versioned); the database
-- stores the exercise id and a title snapshot with each prescription.
-- =====================================================================================

-- ─────────────────────────────── reference: safety flags ───────────────────────────────
create table if not exists public.rehab_safety_flags (
  id text primary key,
  context text not null check (context in ('intake', 'feedback')),
  level text not null check (level in ('urgent', 'emergency')),
  sort_order smallint not null default 0
);
insert into public.rehab_safety_flags (id, context, level, sort_order) values
  ('rf_bladder',               'intake',   'emergency', 1),
  ('rf_chest',                 'intake',   'emergency', 2),
  ('rf_vascular',              'intake',   'emergency', 3),
  ('rf_dvt',                   'intake',   'emergency', 4),
  ('rf_neck_cad',              'intake',   'emergency', 5),
  ('rf_progressive_neuro',     'intake',   'urgent',    6),
  ('rf_major_trauma',          'intake',   'urgent',    7),
  ('rf_hot_joint',             'intake',   'urgent',    8),
  ('rf_cancer',                'intake',   'urgent',    9),
  ('rf_recent_surgery_fracture','intake',  'urgent',   10),
  ('rf_cardiac_exercise_unsafe','intake',  'urgent',   11),
  ('rf_falls_blackouts',       'intake',   'urgent',   12),
  ('fb_chest',                 'feedback', 'emergency', 1),
  ('fb_dizzy',                 'feedback', 'emergency', 2),
  ('fb_neuro',                 'feedback', 'emergency', 3),
  ('fb_calf',                  'feedback', 'emergency', 4),
  ('fb_severe_pain',           'feedback', 'urgent',    5),
  ('fb_injury',                'feedback', 'urgent',    6),
  ('fb_joint',                 'feedback', 'urgent',    7)
on conflict (id) do update set context = excluded.context, level = excluded.level, sort_order = excluded.sort_order;

-- ─────────────────────────────────── patients ───────────────────────────────────
create table if not exists public.rehab_patients (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null unique references auth.users (id) on delete restrict,
  reference_code text not null unique default ('RV-' || upper(substr(replace(gen_random_uuid()::text, '-', ''), 1, 6))),
  full_name text not null check (char_length(btrim(full_name)) between 2 and 100),
  email text check (email is null or char_length(email) <= 254),
  age_years smallint not null check (age_years between 18 and 110),
  sex text check (sex in ('female', 'male', 'other', 'prefer_not_to_say')),
  phone text check (phone is null or char_length(phone) between 7 and 30),
  city text check (city is null or char_length(city) <= 80),
  preferred_language text not null default 'ru' check (preferred_language in ('en', 'ru')),
  consent_version text not null,
  consented_at timestamptz not null default now(),
  status text not null default 'active' check (status in ('active', 'archived')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- ───────────────────────────── assessments (symptom intake) ─────────────────────────────
create table if not exists public.rehab_assessments (
  id uuid primary key default gen_random_uuid(),
  patient_id uuid not null references public.rehab_patients (id) on delete restrict,
  client_token uuid not null default gen_random_uuid(),
  status text not null default 'submitted'
    check (status in ('submitted', 'needs_clinical_assessment', 'in_review', 'cleared_for_programme', 'programme_created', 'closed')),
  regions text[] not null check (cardinality(regions) between 1 and 10),
  symptoms text[] not null check (cardinality(symptoms) between 0 and 10),
  pain_now smallint not null check (pain_now between 0 and 10),
  pain_worst smallint check (pain_worst between 0 and 10),
  pain_best smallint check (pain_best between 0 and 10),
  duration text check (duration in ('lt_1w', '1_4w', '1_3m', '3_6m', 'gt_6m')),
  onset text check (char_length(onset) <= 2000),
  possible_cause text check (char_length(possible_cause) <= 2000),
  aggravating text check (char_length(aggravating) <= 2000),
  relieving text check (char_length(relieving) <= 2000),
  functional_limitations text check (char_length(functional_limitations) <= 2000),
  previous_treatment text check (char_length(previous_treatment) <= 2000),
  medical_conditions text check (char_length(medical_conditions) <= 2000),
  medications text check (char_length(medications) <= 2000),
  other_symptoms text check (char_length(other_symptoms) <= 2000),
  own_words text check (char_length(own_words) <= 4000),
  red_flag_ids text[] not null default '{}',
  red_flag_level text not null default 'none' check (red_flag_level in ('none', 'urgent', 'emergency')),
  clearance_note text check (char_length(clearance_note) <= 2000),
  admin_notes text check (char_length(admin_notes) <= 4000),
  reviewed_by uuid references auth.users (id) on delete set null,
  reviewed_at timestamptz,
  submitted_at timestamptz not null default now(),
  unique (patient_id, client_token)
);
create index if not exists rehab_assessments_patient_idx on public.rehab_assessments (patient_id, submitted_at desc);
create index if not exists rehab_assessments_status_idx on public.rehab_assessments (status, submitted_at desc);

-- ─────────────────────────────── programmes, days, prescriptions ───────────────────────────────
create table if not exists public.rehab_programmes (
  id uuid primary key default gen_random_uuid(),
  patient_id uuid not null references public.rehab_patients (id) on delete restrict,
  assessment_id uuid references public.rehab_assessments (id) on delete set null,
  title text not null check (char_length(btrim(title)) between 2 and 120),
  goal text check (char_length(goal) <= 1000),
  status text not null default 'draft' check (status in ('draft', 'active', 'paused', 'completed', 'discontinued')),
  pause_reason text check (char_length(pause_reason) <= 2000),
  -- Configurable unlock rules. 'admin_approval' (default): the next day opens only after the
  -- patient's feedback AND a clinician decision. 'auto_after_feedback': the clinician has
  -- pre-authorised continuing as written when feedback is complete, every pain rating is at or
  -- below auto_unlock_max_pain and nothing concerning was reported.
  unlock_mode text not null default 'admin_approval' check (unlock_mode in ('admin_approval', 'auto_after_feedback')),
  min_hours_between_sessions smallint not null default 0 check (min_hours_between_sessions between 0 and 168),
  auto_unlock_max_pain smallint not null default 5 check (auto_unlock_max_pain between 0 and 10),
  errp_schedule text[] not null default '{later_same_day,24h}'
    check (errp_schedule <@ array['later_same_day', '24h', '48h']::text[]),
  errp_params jsonb not null default '{"pain_acceptable_max":5,"settle_within_hours":24}'::jsonb,
  approved_by uuid references auth.users (id) on delete set null,
  approved_at timestamptz,
  created_by uuid references auth.users (id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index if not exists rehab_programmes_patient_idx on public.rehab_programmes (patient_id, created_at desc);
create unique index if not exists rehab_one_live_programme_per_patient
  on public.rehab_programmes (patient_id) where status in ('active', 'paused');

create table if not exists public.rehab_sessions (
  id uuid primary key default gen_random_uuid(),
  programme_id uuid not null references public.rehab_programmes (id) on delete cascade,
  day_number smallint not null check (day_number between 1 and 120),
  title text not null check (char_length(btrim(title)) between 1 and 120),
  patient_note text check (char_length(patient_note) <= 1500),
  status text not null default 'locked' check (status in ('locked', 'unlocked', 'awaiting_review', 'reviewed', 'cancelled')),
  available_from timestamptz,
  released_at timestamptz,
  release_mode text check (release_mode in ('first_day', 'clinician', 'auto_rule', 'override')),
  released_by uuid references auth.users (id) on delete set null,
  reviewed_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint rehab_sessions_day_unique unique (programme_id, day_number) deferrable initially deferred
);
create index if not exists rehab_sessions_programme_idx on public.rehab_sessions (programme_id, day_number);

create table if not exists public.rehab_session_exercises (
  id uuid primary key default gen_random_uuid(),
  session_id uuid not null references public.rehab_sessions (id) on delete cascade,
  position smallint not null default 1 check (position between 1 and 40),
  exercise_id text not null check (exercise_id ~ '^[a-z0-9][a-z0-9-]{1,79}$'),
  exercise_title text not null check (char_length(exercise_title) between 2 and 160),
  sets smallint check (sets between 1 and 10),
  reps smallint check (reps between 1 and 100),
  hold_seconds smallint check (hold_seconds between 0 and 300),
  rest_seconds smallint check (rest_seconds between 0 and 600),
  duration_seconds smallint check (duration_seconds between 0 and 3600),
  side text not null default 'both' check (side in ('both', 'left', 'right', 'alternate')),
  frequency text check (char_length(frequency) <= 120),
  precautions text check (char_length(precautions) <= 1000),
  notes text check (char_length(notes) <= 1000),
  created_at timestamptz not null default now()
);
create index if not exists rehab_session_exercises_session_idx on public.rehab_session_exercises (session_id, position);

-- ─────────────────────────────── feedback, completion, ERRP ───────────────────────────────
create table if not exists public.rehab_feedback (
  id uuid primary key default gen_random_uuid(),
  session_id uuid not null unique references public.rehab_sessions (id) on delete cascade,
  patient_id uuid not null references public.rehab_patients (id) on delete restrict,
  completion text not null check (completion in ('all', 'partial', 'none')),
  pain_before smallint check (pain_before between 0 and 10),
  pain_during smallint check (pain_during between 0 and 10),
  pain_after smallint check (pain_after between 0 and 10),
  difficulty smallint check (difficulty between 0 and 10),
  unusual_symptoms boolean not null default false,
  unusual_text text check (char_length(unusual_text) <= 1000),
  safety_flag_ids text[] not null default '{}',
  notes text check (char_length(notes) <= 2000),
  submitted_at timestamptz not null default now()
);
create index if not exists rehab_feedback_patient_idx on public.rehab_feedback (patient_id, submitted_at desc);

create table if not exists public.rehab_exercise_completions (
  id uuid primary key default gen_random_uuid(),
  feedback_id uuid not null references public.rehab_feedback (id) on delete cascade,
  session_id uuid not null references public.rehab_sessions (id) on delete cascade,
  session_exercise_id uuid not null references public.rehab_session_exercises (id) on delete cascade,
  patient_id uuid not null references public.rehab_patients (id) on delete restrict,
  done boolean not null default false,
  sets_done smallint check (sets_done between 0 and 10),
  reps_done smallint check (reps_done between 0 and 100),
  difficulty smallint check (difficulty between 0 and 10),
  pain_during smallint check (pain_during between 0 and 10),
  note text check (char_length(note) <= 500),
  unique (feedback_id, session_exercise_id)
);

create table if not exists public.rehab_errp_observations (
  id uuid primary key default gen_random_uuid(),
  patient_id uuid not null references public.rehab_patients (id) on delete restrict,
  session_id uuid not null references public.rehab_sessions (id) on delete cascade,
  timepoint text not null check (timepoint in ('before', 'during', 'immediately_after', 'later_same_day', '24h', '48h')),
  pain smallint not null check (pain between 0 and 10),
  function_score smallint check (function_score between 0 and 10),
  symptom_response text check (symptom_response in ('better', 'same', 'worse')),
  new_symptoms boolean not null default false,
  flag_ids text[] not null default '{}',
  note text check (char_length(note) <= 1000),
  recorded_at timestamptz not null default now(),
  unique (session_id, timepoint)
);
create index if not exists rehab_errp_patient_idx on public.rehab_errp_observations (patient_id, recorded_at);

-- ─────────────────────────────── clinical decisions, safety, comms, audit ───────────────────────────────
create table if not exists public.rehab_reviews (
  id uuid primary key default gen_random_uuid(),
  session_id uuid not null references public.rehab_sessions (id) on delete cascade,
  programme_id uuid not null references public.rehab_programmes (id) on delete cascade,
  patient_id uuid not null references public.rehab_patients (id) on delete restrict,
  reviewer_id uuid references auth.users (id) on delete set null,   -- null = automatic rule
  decision text not null check (decision in ('progress', 'maintain', 'regress', 'modify', 'reassess', 'pause', 'discontinue', 'auto_continue')),
  notes text check (char_length(notes) <= 3000),                      -- clinician-only
  patient_message text check (char_length(patient_message) <= 1000),  -- shown to the patient
  suggestion jsonb,                                                   -- what the rule engine suggested at the time
  created_at timestamptz not null default now()
);
create index if not exists rehab_reviews_session_idx on public.rehab_reviews (session_id, created_at desc);

create table if not exists public.rehab_adverse_events (
  id uuid primary key default gen_random_uuid(),
  patient_id uuid not null references public.rehab_patients (id) on delete restrict,
  session_id uuid references public.rehab_sessions (id) on delete set null,
  source text not null check (source in ('patient', 'admin')),
  severity text not null check (severity in ('mild', 'moderate', 'severe')),
  flag_ids text[] not null default '{}',
  description text check (char_length(description) <= 3000),
  status text not null default 'open' check (status in ('open', 'reviewed', 'closed')),
  action_taken text check (char_length(action_taken) <= 3000),
  created_by uuid references auth.users (id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index if not exists rehab_adverse_status_idx on public.rehab_adverse_events (status, created_at desc);

create table if not exists public.rehab_notifications (
  id uuid primary key default gen_random_uuid(),
  audience text not null check (audience in ('patient', 'admin')),
  patient_id uuid references public.rehab_patients (id) on delete cascade,
  kind text not null check (char_length(kind) between 2 and 60),
  severity text not null default 'info' check (severity in ('info', 'attention', 'urgent')),
  title text not null check (char_length(title) <= 160),
  body text check (char_length(body) <= 1000),
  data jsonb not null default '{}'::jsonb,
  link text check (char_length(link) <= 200),
  read_at timestamptz,
  created_at timestamptz not null default now(),
  check ((audience = 'patient' and patient_id is not null) or audience = 'admin')
);
create index if not exists rehab_notifications_patient_idx on public.rehab_notifications (patient_id, created_at desc) where audience = 'patient';
create index if not exists rehab_notifications_admin_idx on public.rehab_notifications (created_at desc) where audience = 'admin';

create table if not exists public.rehab_audit_log (
  id bigint generated always as identity primary key,
  at timestamptz not null default now(),
  actor_id uuid,
  actor_role text not null default 'system' check (actor_role in ('admin', 'patient', 'system')),
  action text not null,
  entity text not null,
  entity_id uuid,
  patient_id uuid,
  details jsonb not null default '{}'::jsonb
);
create index if not exists rehab_audit_patient_idx on public.rehab_audit_log (patient_id, at desc);

-- ─────────────────────────────────────── row level security ───────────────────────────────────────
do $$
declare t text;
begin
  foreach t in array array[
    'rehab_safety_flags', 'rehab_patients', 'rehab_assessments', 'rehab_programmes', 'rehab_sessions',
    'rehab_session_exercises', 'rehab_feedback', 'rehab_exercise_completions', 'rehab_errp_observations',
    'rehab_reviews', 'rehab_adverse_events', 'rehab_notifications', 'rehab_audit_log'
  ] loop
    execute format('alter table public.%I enable row level security', t);
    -- Supabase grants new tables to the API roles by default: remove everything, then add back read only.
    execute format('revoke all on public.%I from anon, authenticated', t);
    execute format('grant select on public.%I to authenticated', t);
  end loop;
end $$;
revoke all on sequence public.rehab_audit_log_id_seq from anon, authenticated;

-- Helper: the signed-in user's patient id (null for admins / anonymous).
create or replace function public.rehab_my_patient_id()
returns uuid language sql stable security definer set search_path = public, pg_temp as $$
  select id from public.rehab_patients where user_id = auth.uid()
$$;
revoke all on function public.rehab_my_patient_id() from public, anon;
grant execute on function public.rehab_my_patient_id() to authenticated;

drop policy if exists rehab_safety_flags_read on public.rehab_safety_flags;
create policy rehab_safety_flags_read on public.rehab_safety_flags for select to authenticated using (true);

drop policy if exists rehab_patients_read on public.rehab_patients;
create policy rehab_patients_read on public.rehab_patients for select to authenticated
  using (user_id = auth.uid() or public.is_admin());

drop policy if exists rehab_assessments_read on public.rehab_assessments;
create policy rehab_assessments_read on public.rehab_assessments for select to authenticated
  using (patient_id = public.rehab_my_patient_id() or public.is_admin());

drop policy if exists rehab_programmes_read on public.rehab_programmes;
create policy rehab_programmes_read on public.rehab_programmes for select to authenticated
  using (public.is_admin() or (patient_id = public.rehab_my_patient_id() and status <> 'draft'));

-- Days the patient may read directly: released (and due) or already done. Locked / scheduled days are not
-- readable here; the dashboard learns that they exist (day number + title only) through rehab_my_overview().
drop policy if exists rehab_sessions_read on public.rehab_sessions;
create policy rehab_sessions_read on public.rehab_sessions for select to authenticated
  using (
    public.is_admin()
    or (
      (status in ('awaiting_review', 'reviewed') or (status = 'unlocked' and available_from <= now()))
      and exists (
        select 1 from public.rehab_programmes p
        where p.id = rehab_sessions.programme_id
          and p.patient_id = public.rehab_my_patient_id()
          and p.status <> 'draft'
      )
    )
  );

-- Exercises of a day: only while the day is released (or after it has been completed).
drop policy if exists rehab_session_exercises_read on public.rehab_session_exercises;
create policy rehab_session_exercises_read on public.rehab_session_exercises for select to authenticated
  using (
    public.is_admin()
    or exists (
      select 1
      from public.rehab_sessions s
      join public.rehab_programmes p on p.id = s.programme_id
      where s.id = rehab_session_exercises.session_id
        and p.patient_id = public.rehab_my_patient_id()
        and (
          (s.status = 'unlocked' and p.status = 'active' and s.available_from <= now())
          or s.status in ('awaiting_review', 'reviewed')
        )
    )
  );

drop policy if exists rehab_feedback_read on public.rehab_feedback;
create policy rehab_feedback_read on public.rehab_feedback for select to authenticated
  using (patient_id = public.rehab_my_patient_id() or public.is_admin());
drop policy if exists rehab_completions_read on public.rehab_exercise_completions;
create policy rehab_completions_read on public.rehab_exercise_completions for select to authenticated
  using (patient_id = public.rehab_my_patient_id() or public.is_admin());
drop policy if exists rehab_errp_read on public.rehab_errp_observations;
create policy rehab_errp_read on public.rehab_errp_observations for select to authenticated
  using (patient_id = public.rehab_my_patient_id() or public.is_admin());

-- Clinician-only: reviews (the patient sees patient_message through rehab_my_* functions), adverse events, audit.
drop policy if exists rehab_reviews_read on public.rehab_reviews;
create policy rehab_reviews_read on public.rehab_reviews for select to authenticated using (public.is_admin());
drop policy if exists rehab_adverse_read on public.rehab_adverse_events;
create policy rehab_adverse_read on public.rehab_adverse_events for select to authenticated using (public.is_admin());
drop policy if exists rehab_audit_read on public.rehab_audit_log;
create policy rehab_audit_read on public.rehab_audit_log for select to authenticated using (public.is_admin());

drop policy if exists rehab_notifications_read on public.rehab_notifications;
create policy rehab_notifications_read on public.rehab_notifications for select to authenticated
  using (
    (audience = 'patient' and patient_id = public.rehab_my_patient_id())
    or (audience = 'admin' and public.is_admin())
  );

-- ───────────────────────────────── internal helpers (not callable through the API) ─────────────────────────────────
create or replace function public.rehab__touch() returns trigger language plpgsql as $$
begin new.updated_at := now(); return new; end $$;

do $$
declare t text;
begin
  foreach t in array array['rehab_patients', 'rehab_programmes', 'rehab_sessions', 'rehab_adverse_events'] loop
    execute format('drop trigger if exists %I on public.%I', t || '_touch', t);
    execute format('create trigger %I before update on public.%I for each row execute function public.rehab__touch()', t || '_touch', t);
  end loop;
end $$;

create or replace function public.rehab__text(p jsonb, k text, maxlen int default 2000, required boolean default false)
returns text language plpgsql immutable as $$
declare v text;
begin
  if p is null or jsonb_typeof(p) <> 'object' then
    raise exception 'rehab: invalid request' using errcode = '22023';
  end if;
  if p -> k is not null and jsonb_typeof(p -> k) not in ('string', 'null') then
    raise exception 'rehab: % must be text', k using errcode = '22023';
  end if;
  v := nullif(btrim(coalesce(p ->> k, '')), '');
  if v is null then
    if required then raise exception 'rehab: % is required', k using errcode = '22023'; end if;
    return null;
  end if;
  if char_length(v) > maxlen then raise exception 'rehab: % is too long', k using errcode = '22023'; end if;
  return v;
end $$;

create or replace function public.rehab__int(p jsonb, k text, lo int, hi int, required boolean default false)
returns int language plpgsql immutable as $$
declare v numeric;
begin
  if p is null or jsonb_typeof(p) <> 'object' then
    raise exception 'rehab: invalid request' using errcode = '22023';
  end if;
  if p -> k is null or jsonb_typeof(p -> k) = 'null' then
    if required then raise exception 'rehab: % is required', k using errcode = '22023'; end if;
    return null;
  end if;
  if jsonb_typeof(p -> k) <> 'number' then raise exception 'rehab: % must be a number', k using errcode = '22023'; end if;
  v := (p ->> k)::numeric;
  if v <> trunc(v) or v < lo or v > hi then raise exception 'rehab: % is out of range', k using errcode = '22023'; end if;
  return v::int;
end $$;

create or replace function public.rehab__bool(p jsonb, k text, dflt boolean default false)
returns boolean language plpgsql immutable as $$
begin
  if p is null or p -> k is null or jsonb_typeof(p -> k) = 'null' then return dflt; end if;
  if jsonb_typeof(p -> k) <> 'boolean' then raise exception 'rehab: % must be true or false', k using errcode = '22023'; end if;
  return (p ->> k)::boolean;
end $$;

create or replace function public.rehab__list(p jsonb, k text, allowed text[] default null, min_items int default 0, max_items int default 20)
returns text[] language plpgsql immutable as $$
declare result text[] := '{}'; el jsonb; v text;
begin
  if p is not null and p -> k is not null and jsonb_typeof(p -> k) <> 'null' then
    if jsonb_typeof(p -> k) <> 'array' then raise exception 'rehab: % must be a list', k using errcode = '22023'; end if;
    for el in select * from jsonb_array_elements(p -> k) loop
      if jsonb_typeof(el) <> 'string' then raise exception 'rehab: % must contain text', k using errcode = '22023'; end if;
      v := el #>> '{}';
      if allowed is not null and not (v = any (allowed)) then raise exception 'rehab: unknown value in %', k using errcode = '22023'; end if;
      if not (v = any (result)) then result := result || v; end if;
    end loop;
  end if;
  if coalesce(cardinality(result), 0) < min_items or coalesce(cardinality(result), 0) > max_items then
    raise exception 'rehab: % has the wrong number of items', k using errcode = '22023';
  end if;
  return result;
end $$;

create or replace function public.rehab__require_admin() returns uuid
language plpgsql stable security definer set search_path = public, pg_temp as $$
begin
  if auth.uid() is null or not public.is_admin() then
    raise exception 'rehab: not authorised' using errcode = '42501';
  end if;
  return auth.uid();
end $$;

create or replace function public.rehab__require_patient() returns uuid
language plpgsql stable security definer set search_path = public, pg_temp as $$
declare pid uuid;
begin
  if auth.uid() is null then raise exception 'rehab: not authorised' using errcode = '42501'; end if;
  select id into pid from public.rehab_patients where user_id = auth.uid() and status = 'active';
  if pid is null then raise exception 'rehab: patient profile required' using errcode = '42501'; end if;
  return pid;
end $$;

create or replace function public.rehab__audit(p_action text, p_entity text, p_entity_id uuid, p_patient_id uuid, p_details jsonb default '{}'::jsonb)
returns void language plpgsql security definer set search_path = public, pg_temp as $$
begin
  insert into public.rehab_audit_log (actor_id, actor_role, action, entity, entity_id, patient_id, details)
  values (
    auth.uid(),
    case when auth.uid() is null then 'system' when public.is_admin() then 'admin' else 'patient' end,
    p_action, p_entity, p_entity_id, p_patient_id, coalesce(p_details, '{}'::jsonb)
  );
end $$;

create or replace function public.rehab__notify_admin(p_kind text, p_severity text, p_title text, p_body text, p_patient_id uuid, p_data jsonb default '{}'::jsonb, p_link text default null)
returns void language sql security definer set search_path = public, pg_temp as $$
  insert into public.rehab_notifications (audience, patient_id, kind, severity, title, body, data, link)
  values ('admin', p_patient_id, p_kind, p_severity, p_title, p_body, coalesce(p_data, '{}'::jsonb), p_link)
$$;

create or replace function public.rehab__notify_patient(p_patient_id uuid, p_kind text, p_severity text, p_title text, p_body text, p_data jsonb default '{}'::jsonb, p_link text default '/rehabverse/me')
returns void language sql security definer set search_path = public, pg_temp as $$
  insert into public.rehab_notifications (audience, patient_id, kind, severity, title, body, data, link)
  values ('patient', p_patient_id, p_kind, p_severity, p_title, p_body, coalesce(p_data, '{}'::jsonb), p_link)
$$;

-- Highest level among a list of safety flag ids ('none' when empty).
create or replace function public.rehab__flag_level(p_ids text[], p_context text)
returns text language sql stable set search_path = public, pg_temp as $$
  select case
           when count(*) = 0 then 'none'
           when bool_or(level = 'emergency') then 'emergency'
           else 'urgent'
         end
    from public.rehab_safety_flags where id = any (coalesce(p_ids, '{}')) and context = p_context
$$;

-- Opens the next locked day (lowest day number). Returns its id or null.
create or replace function public.rehab__release_next(p_programme_id uuid, p_mode text, p_gap_hours int)
returns uuid language plpgsql security definer set search_path = public, pg_temp as $$
declare nxt uuid;
begin
  select id into nxt from public.rehab_sessions
   where programme_id = p_programme_id and status = 'locked'
   order by day_number limit 1 for update;
  if nxt is null then return null; end if;
  update public.rehab_sessions
     set status = 'unlocked', released_at = now(), release_mode = p_mode, released_by = auth.uid(),
         available_from = now() + make_interval(hours => greatest(coalesce(p_gap_hours, 0), 0))
   where id = nxt;
  return nxt;
end $$;

-- A concerning symptom was reported: record an adverse event, pause the programme, alert the clinician.
create or replace function public.rehab__raise_safety(p_patient_id uuid, p_session_id uuid, p_programme_id uuid, p_flags text[], p_description text)
returns text language plpgsql security definer set search_path = public, pg_temp as $$
declare lvl text; ref text; sev text;
begin
  lvl := public.rehab__flag_level(p_flags, 'feedback');
  if lvl = 'none' then return 'none'; end if;
  sev := case when lvl = 'emergency' then 'severe' else 'moderate' end;
  select reference_code into ref from public.rehab_patients where id = p_patient_id;
  insert into public.rehab_adverse_events (patient_id, session_id, source, severity, flag_ids, description, created_by)
  values (p_patient_id, p_session_id, 'patient', sev, p_flags, p_description, auth.uid());
  update public.rehab_programmes
     set status = 'paused', pause_reason = 'Concerning symptoms reported by the patient — clinical review needed before progressing.'
   where id = p_programme_id and status = 'active';
  perform public.rehab__notify_admin('safety_flag', 'urgent', 'Concerning symptoms reported (' || ref || ')',
    'The programme has been paused automatically. Review the patient now.', p_patient_id,
    jsonb_build_object('flags', to_jsonb(p_flags), 'level', lvl), '/admin/rehabverse/patients/' || p_patient_id::text);
  perform public.rehab__notify_patient(p_patient_id, 'programme_paused_safety', 'urgent', 'Please pause exercising',
    'Your programme is paused until your physiotherapist reviews your symptoms.', jsonb_build_object('level', lvl));
  perform public.rehab__audit('safety_flag_raised', 'rehab_programmes', p_programme_id, p_patient_id,
    jsonb_build_object('flags', to_jsonb(p_flags), 'level', lvl, 'session_id', p_session_id));
  return lvl;
end $$;

revoke all on function
  public.rehab__touch(), public.rehab__text(jsonb, text, int, boolean), public.rehab__int(jsonb, text, int, int, boolean),
  public.rehab__bool(jsonb, text, boolean), public.rehab__list(jsonb, text, text[], int, int),
  public.rehab__require_admin(), public.rehab__require_patient(),
  public.rehab__audit(text, text, uuid, uuid, jsonb),
  public.rehab__notify_admin(text, text, text, text, uuid, jsonb, text),
  public.rehab__notify_patient(uuid, text, text, text, text, jsonb, text),
  public.rehab__flag_level(text[], text), public.rehab__release_next(uuid, text, int),
  public.rehab__raise_safety(uuid, uuid, uuid, text[], text)
from public, anon, authenticated;

-- ───────────────────────────────────── audit triggers (catch every write path) ─────────────────────────────────────
create or replace function public.rehab__audit_row() returns trigger
language plpgsql security definer set search_path = public, pg_temp as $$
declare rec jsonb; old_rec jsonb; pid uuid; eid uuid; changed jsonb;
begin
  rec := to_jsonb(coalesce(new, old));
  eid := (rec ->> 'id')::uuid;
  pid := (rec ->> 'patient_id')::uuid;
  if pid is null and tg_table_name = 'rehab_sessions' then
    select patient_id into pid from public.rehab_programmes where id = (rec ->> 'programme_id')::uuid;
  elsif pid is null and tg_table_name = 'rehab_session_exercises' then
    select p.patient_id into pid from public.rehab_sessions s join public.rehab_programmes p on p.id = s.programme_id
     where s.id = (rec ->> 'session_id')::uuid;
  end if;
  if tg_op = 'UPDATE' then
    old_rec := to_jsonb(old);
    select coalesce(jsonb_object_agg(key, jsonb_build_object('from', old_rec -> key, 'to', value)), '{}'::jsonb)
      into changed from jsonb_each(rec) where old_rec -> key is distinct from value and key not in ('updated_at');
    if changed = '{}'::jsonb then return new; end if;
  elsif tg_op = 'INSERT' then
    changed := rec;
  else
    changed := rec;
  end if;
  insert into public.rehab_audit_log (actor_id, actor_role, action, entity, entity_id, patient_id, details)
  values (
    auth.uid(),
    case when auth.uid() is null then 'system' when public.is_admin() then 'admin' else 'patient' end,
    lower(tg_op), tg_table_name, eid, pid, jsonb_build_object('changes', changed)
  );
  return coalesce(new, old);
end $$;
revoke all on function public.rehab__audit_row() from public, anon, authenticated;

do $$
declare t text;
begin
  foreach t in array array['rehab_assessments', 'rehab_programmes', 'rehab_sessions', 'rehab_session_exercises', 'rehab_reviews', 'rehab_adverse_events'] loop
    execute format('drop trigger if exists %I on public.%I', t || '_audit', t);
    execute format('create trigger %I after insert or update or delete on public.%I for each row execute function public.rehab__audit_row()', t || '_audit', t);
  end loop;
end $$;

create or replace function public.rehab__audit_immutable() returns trigger language plpgsql as $$
begin raise exception 'rehab: the audit log is append-only' using errcode = '42501'; end $$;
drop trigger if exists rehab_audit_log_immutable on public.rehab_audit_log;
create trigger rehab_audit_log_immutable before update or delete on public.rehab_audit_log
  for each row execute function public.rehab__audit_immutable();
revoke all on function public.rehab__audit_immutable() from public, anon, authenticated;

-- ═════════════════════════════════════════ PATIENT FUNCTIONS ═════════════════════════════════════════

-- Creates (or updates) the signed-in user's patient profile. One profile per account.
create or replace function public.rehab_register_patient(p_payload jsonb)
returns jsonb language plpgsql security definer set search_path = public, pg_temp as $$
declare uid uuid := auth.uid(); age int; rec public.rehab_patients%rowtype; mail text;
begin
  if uid is null then raise exception 'rehab: not authorised' using errcode = '42501'; end if;
  if public.is_admin() then raise exception 'rehab: staff accounts cannot be patients' using errcode = '42501'; end if;
  age := public.rehab__int(p_payload, 'age_years', 0, 120, true);
  if age < 18 then raise exception 'rehab: under_18' using errcode = '22023'; end if;
  if not public.rehab__bool(p_payload, 'consent', false) then
    raise exception 'rehab: consent is required' using errcode = '22023';
  end if;
  mail := nullif(btrim(coalesce(auth.jwt() ->> 'email', '')), '');
  insert into public.rehab_patients (user_id, full_name, email, age_years, sex, phone, city, preferred_language, consent_version)
  values (
    uid,
    public.rehab__text(p_payload, 'full_name', 100, true),
    mail,
    age,
    public.rehab__text(p_payload, 'sex', 20),
    public.rehab__text(p_payload, 'phone', 30),
    public.rehab__text(p_payload, 'city', 80),
    coalesce(public.rehab__text(p_payload, 'preferred_language', 2), 'ru'),
    coalesce(public.rehab__text(p_payload, 'consent_version', 40), 'v1')
  )
  on conflict (user_id) do update
    set full_name = excluded.full_name, age_years = excluded.age_years, sex = excluded.sex, phone = excluded.phone,
        city = excluded.city, preferred_language = excluded.preferred_language, email = coalesce(excluded.email, public.rehab_patients.email)
  returning * into rec;
  return jsonb_build_object('id', rec.id, 'reference_code', rec.reference_code, 'preferred_language', rec.preferred_language);
end $$;

create or replace function public.rehab_set_language(p_language text)
returns void language plpgsql security definer set search_path = public, pg_temp as $$
declare pid uuid := public.rehab__require_patient();
begin
  if p_language not in ('en', 'ru') then raise exception 'rehab: unknown language' using errcode = '22023'; end if;
  update public.rehab_patients set preferred_language = p_language where id = pid;
end $$;

-- Symptom intake. Concerning answers route the case to clinical assessment instead of exercise.
create or replace function public.rehab_submit_assessment(p_payload jsonb)
returns jsonb language plpgsql security definer set search_path = public, pg_temp as $$
declare
  pid uuid := public.rehab__require_patient();
  token uuid; existing public.rehab_assessments%rowtype; flags text[]; lvl text; st text; new_id uuid; ref text;
begin
  begin
    token := coalesce(nullif(p_payload ->> 'client_token', '')::uuid, gen_random_uuid());
  exception when others then
    raise exception 'rehab: invalid client_token' using errcode = '22023';
  end;
  -- Double-click / retry protection: the same token returns the original submission.
  select * into existing from public.rehab_assessments where patient_id = pid and client_token = token;
  if found then
    return jsonb_build_object('id', existing.id, 'status', existing.status, 'red_flag_level', existing.red_flag_level,
                              'red_flag_ids', to_jsonb(existing.red_flag_ids), 'duplicate', true);
  end if;
  if exists (select 1 from public.rehab_assessments where patient_id = pid
              and status in ('submitted', 'needs_clinical_assessment', 'in_review', 'cleared_for_programme')) then
    raise exception 'rehab: open_assessment_exists' using errcode = '55000';
  end if;
  if (select count(*) from public.rehab_assessments where patient_id = pid and submitted_at > now() - interval '24 hours') >= 5 then
    raise exception 'rehab: too many submissions' using errcode = '54000';
  end if;

  flags := public.rehab__list(p_payload, 'red_flags',
            (select array_agg(id) from public.rehab_safety_flags where context = 'intake'), 0, 20);
  lvl := public.rehab__flag_level(flags, 'intake');
  st := case when lvl = 'none' then 'submitted' else 'needs_clinical_assessment' end;

  insert into public.rehab_assessments (
    patient_id, client_token, status, regions, symptoms, pain_now, pain_worst, pain_best, duration, onset, possible_cause,
    aggravating, relieving, functional_limitations, previous_treatment, medical_conditions, medications, other_symptoms,
    own_words, red_flag_ids, red_flag_level
  ) values (
    pid, token, st,
    public.rehab__list(p_payload, 'regions', array['cervical','thoracic','lumbar','shoulder','elbow','wrist_hand','hip','knee','ankle_foot','multiple'], 1, 10),
    public.rehab__list(p_payload, 'symptoms', array['pain','stiffness','weakness','restricted_movement','tightness','walking_difficulty','balance','reduced_endurance','functional_limitation','other'], 0, 10),
    public.rehab__int(p_payload, 'pain_now', 0, 10, true),
    public.rehab__int(p_payload, 'pain_worst', 0, 10),
    public.rehab__int(p_payload, 'pain_best', 0, 10),
    public.rehab__text(p_payload, 'duration', 10),
    public.rehab__text(p_payload, 'onset'), public.rehab__text(p_payload, 'possible_cause'),
    public.rehab__text(p_payload, 'aggravating'), public.rehab__text(p_payload, 'relieving'),
    public.rehab__text(p_payload, 'functional_limitations'), public.rehab__text(p_payload, 'previous_treatment'),
    public.rehab__text(p_payload, 'medical_conditions'), public.rehab__text(p_payload, 'medications'),
    public.rehab__text(p_payload, 'other_symptoms'), public.rehab__text(p_payload, 'own_words', 4000),
    flags, lvl
  ) returning id into new_id;

  select reference_code into ref from public.rehab_patients where id = pid;
  perform public.rehab__notify_admin(
    case when lvl = 'none' then 'assessment_submitted' else 'assessment_flagged' end,
    case when lvl = 'none' then 'attention' else 'urgent' end,
    case when lvl = 'none' then 'New RehabVerse assessment (' || ref || ')' else 'Assessment with red flags (' || ref || ')' end,
    case when lvl = 'none' then 'Awaiting your review.' else 'Routed for clinical assessment — no exercise programme should be started yet.' end,
    pid, jsonb_build_object('assessment_id', new_id, 'level', lvl), '/admin/rehabverse/patients/' || pid::text);
  perform public.rehab__notify_patient(pid, case when lvl = 'none' then 'assessment_received' else 'assessment_flagged' end,
    case when lvl = 'none' then 'info' else 'urgent' end,
    case when lvl = 'none' then 'Assessment received' else 'Please get a clinical assessment' end,
    case when lvl = 'none' then 'Your physiotherapist will review it and prepare your programme.' else 'Some of your answers need a clinician before any exercise.' end,
    jsonb_build_object('level', lvl));
  perform public.rehab__audit('assessment_submitted', 'rehab_assessments', new_id, pid, jsonb_build_object('red_flag_level', lvl));
  return jsonb_build_object('id', new_id, 'status', st, 'red_flag_level', lvl, 'red_flag_ids', to_jsonb(flags),
                            'reference_code', ref, 'duplicate', false);
end $$;

-- Everything the patient dashboard needs in one call.
create or replace function public.rehab_my_overview()
returns jsonb language plpgsql stable security definer set search_path = public, pg_temp as $$
declare pat public.rehab_patients%rowtype; prog public.rehab_programmes%rowtype; result jsonb;
begin
  if auth.uid() is null then raise exception 'rehab: not authorised' using errcode = '42501'; end if;
  select * into pat from public.rehab_patients where user_id = auth.uid();
  if not found then return jsonb_build_object('patient', null); end if;
  select * into prog from public.rehab_programmes where patient_id = pat.id and status <> 'draft'
   order by case status when 'active' then 0 when 'paused' then 1 else 2 end, created_at desc limit 1;

  result := jsonb_build_object(
    'patient', jsonb_build_object('id', pat.id, 'reference_code', pat.reference_code, 'full_name', pat.full_name,
                                  'preferred_language', pat.preferred_language, 'age_years', pat.age_years),
    'assessments', coalesce((select jsonb_agg(jsonb_build_object('id', a.id, 'status', a.status, 'red_flag_level', a.red_flag_level,
                      'regions', a.regions, 'pain_now', a.pain_now, 'submitted_at', a.submitted_at) order by a.submitted_at desc)
                     from (select * from public.rehab_assessments where patient_id = pat.id order by submitted_at desc limit 5) a), '[]'::jsonb),
    'unread_notifications', (select count(*) from public.rehab_notifications where audience = 'patient' and patient_id = pat.id and read_at is null)
  );
  if prog.id is not null then
    result := result || jsonb_build_object(
      'programme', jsonb_build_object('id', prog.id, 'title', prog.title, 'goal', prog.goal, 'status', prog.status,
          'pause_reason', prog.pause_reason, 'errp_schedule', to_jsonb(prog.errp_schedule), 'approved_at', prog.approved_at,
          'unlock_mode', prog.unlock_mode, 'min_hours_between_sessions', prog.min_hours_between_sessions),
      'sessions', coalesce((
        select jsonb_agg(jsonb_build_object(
          'id', s.id, 'day_number', s.day_number, 'title', s.title,
          'status', s.status, 'available_from', s.available_from, 'released_at', s.released_at,
          'patient_note', case when s.status = 'locked' then null else s.patient_note end,
          'exercise_count', case when s.status = 'locked' then null else (select count(*) from public.rehab_session_exercises e where e.session_id = s.id) end,
          'feedback_submitted_at', f.submitted_at,
          'review_message', (select r.patient_message from public.rehab_reviews r where r.session_id = s.id and r.patient_message is not null order by r.created_at desc limit 1)
        ) order by s.day_number)
        from public.rehab_sessions s left join public.rehab_feedback f on f.session_id = s.id
        where s.programme_id = prog.id and s.status <> 'cancelled'), '[]'::jsonb)
    );
  end if;
  return result;
end $$;

-- One day: exercises are returned only while the day is open (same rule as RLS, but explicit).
create or replace function public.rehab_my_session(p_session_id uuid)
returns jsonb language plpgsql stable security definer set search_path = public, pg_temp as $$
declare pid uuid := public.rehab__require_patient(); s public.rehab_sessions%rowtype; pr public.rehab_programmes%rowtype;
        access text; fb public.rehab_feedback%rowtype;
begin
  select * into s from public.rehab_sessions where id = p_session_id;
  if not found then raise exception 'rehab: session not found' using errcode = 'P0002'; end if;
  select * into pr from public.rehab_programmes where id = s.programme_id;
  if pr.patient_id <> pid or pr.status = 'draft' then raise exception 'rehab: session not found' using errcode = 'P0002'; end if;
  select * into fb from public.rehab_feedback where session_id = s.id;

  access := case
    when s.status = 'cancelled' then 'locked'
    when s.status = 'locked' then 'locked'
    when s.status in ('awaiting_review', 'reviewed') then 'done'
    when pr.status <> 'active' then 'paused'
    when s.available_from > now() then 'scheduled'
    else 'open' end;

  return jsonb_build_object(
    'access', access,
    'programme', jsonb_build_object('id', pr.id, 'title', pr.title, 'status', pr.status, 'errp_schedule', to_jsonb(pr.errp_schedule)),
    'session', jsonb_build_object('id', s.id, 'day_number', s.day_number, 'title', s.title, 'status', s.status,
        'available_from', s.available_from, 'patient_note', case when access in ('open', 'done') then s.patient_note end),
    'exercises', case when access in ('open', 'done') then coalesce((
        select jsonb_agg(jsonb_build_object('id', e.id, 'position', e.position, 'exercise_id', e.exercise_id,
          'exercise_title', e.exercise_title, 'sets', e.sets, 'reps', e.reps, 'hold_seconds', e.hold_seconds,
          'rest_seconds', e.rest_seconds, 'duration_seconds', e.duration_seconds, 'side', e.side,
          'frequency', e.frequency, 'precautions', e.precautions, 'notes', e.notes) order by e.position)
        from public.rehab_session_exercises e where e.session_id = s.id), '[]'::jsonb) else '[]'::jsonb end,
    'feedback', case when fb.id is not null then jsonb_build_object('submitted_at', fb.submitted_at, 'completion', fb.completion,
        'pain_before', fb.pain_before, 'pain_during', fb.pain_during, 'pain_after', fb.pain_after, 'difficulty', fb.difficulty) end,
    'followups', coalesce((select jsonb_agg(jsonb_build_object('timepoint', o.timepoint, 'pain', o.pain, 'recorded_at', o.recorded_at))
                 from public.rehab_errp_observations o where o.session_id = s.id and o.timepoint in ('later_same_day', '24h', '48h')), '[]'::jsonb),
    'review_message', (select r.patient_message from public.rehab_reviews r where r.session_id = s.id and r.patient_message is not null order by r.created_at desc limit 1)
  );
end $$;

-- Day feedback: saved against the right patient and day, then the unlock rule is applied.
create or replace function public.rehab_submit_feedback(p_session_id uuid, p_payload jsonb)
returns jsonb language plpgsql security definer set search_path = public, pg_temp as $$
declare
  pid uuid := public.rehab__require_patient();
  s public.rehab_sessions%rowtype; pr public.rehab_programmes%rowtype; existing public.rehab_feedback%rowtype;
  completion text; pb int; pd int; pa int; diff int; unusual boolean; flags text[]; fid uuid; lvl text;
  item jsonb; ex record; ref text; clean boolean; auto_ok boolean; new_status text; next_id uuid; max_pain int;
begin
  select * into s from public.rehab_sessions where id = p_session_id for update;
  if not found then raise exception 'rehab: session not found' using errcode = 'P0002'; end if;
  select * into pr from public.rehab_programmes where id = s.programme_id;
  if pr.patient_id <> pid then raise exception 'rehab: session not found' using errcode = 'P0002'; end if;
  select * into existing from public.rehab_feedback where session_id = s.id;
  if found then return jsonb_build_object('ok', true, 'duplicate', true, 'status', s.status); end if;
  if pr.status <> 'active' then raise exception 'rehab: programme_not_active' using errcode = '55000'; end if;
  if s.status <> 'unlocked' or s.available_from > now() then raise exception 'rehab: session_not_open' using errcode = '55000'; end if;

  completion := public.rehab__text(p_payload, 'completion', 10, true);
  if completion not in ('all', 'partial', 'none') then raise exception 'rehab: invalid completion' using errcode = '22023'; end if;
  pb := public.rehab__int(p_payload, 'pain_before', 0, 10, completion <> 'none');
  pd := public.rehab__int(p_payload, 'pain_during', 0, 10, completion <> 'none');
  pa := public.rehab__int(p_payload, 'pain_after', 0, 10, completion <> 'none');
  diff := public.rehab__int(p_payload, 'difficulty', 0, 10, completion <> 'none');
  unusual := public.rehab__bool(p_payload, 'unusual_symptoms', false);
  flags := public.rehab__list(p_payload, 'safety_flags',
            (select array_agg(id) from public.rehab_safety_flags where context = 'feedback'), 0, 10);

  insert into public.rehab_feedback (session_id, patient_id, completion, pain_before, pain_during, pain_after, difficulty,
                                     unusual_symptoms, unusual_text, safety_flag_ids, notes)
  values (s.id, pid, completion, pb, pd, pa, diff, unusual, public.rehab__text(p_payload, 'unusual_text', 1000),
          flags, public.rehab__text(p_payload, 'notes', 2000))
  returning id into fid;

  -- Per-exercise completion: every prescribed exercise gets a row (defaults to not done).
  for ex in select id from public.rehab_session_exercises where session_id = s.id loop
    item := null;
    if p_payload -> 'exercises' is not null and jsonb_typeof(p_payload -> 'exercises') = 'array' then
      select e into item from jsonb_array_elements(p_payload -> 'exercises') e where e ->> 'session_exercise_id' = ex.id::text limit 1;
    end if;
    insert into public.rehab_exercise_completions (feedback_id, session_id, session_exercise_id, patient_id, done, sets_done, reps_done, difficulty, pain_during, note)
    values (fid, s.id, ex.id, pid,
      case when item is null then false else public.rehab__bool(item, 'done', false) end,
      case when item is null then null else public.rehab__int(item, 'sets_done', 0, 10) end,
      case when item is null then null else public.rehab__int(item, 'reps_done', 0, 100) end,
      case when item is null then null else public.rehab__int(item, 'difficulty', 0, 10) end,
      case when item is null then null else public.rehab__int(item, 'pain_during', 0, 10) end,
      case when item is null then null else public.rehab__text(item, 'note', 500) end);
  end loop;

  -- ERRP observations: before / during / immediately after.
  if completion <> 'none' then
    insert into public.rehab_errp_observations (patient_id, session_id, timepoint, pain, flag_ids)
    values (pid, s.id, 'before', pb, '{}'), (pid, s.id, 'during', pd, '{}'), (pid, s.id, 'immediately_after', pa, flags);
  end if;

  lvl := public.rehab__raise_safety(pid, s.id, pr.id, flags, 'Reported after the day ' || s.day_number || ' session: ' || array_to_string(flags, ', '));
  select reference_code into ref from public.rehab_patients where id = pid;
  next_id := null;
  new_status := 'awaiting_review';

  if lvl = 'none' then
    max_pain := greatest(coalesce(pb, 0), coalesce(pd, 0), coalesce(pa, 0));
    clean := (not unusual) and completion = 'all';
    auto_ok := pr.unlock_mode = 'auto_after_feedback' and clean and max_pain <= pr.auto_unlock_max_pain;
    if auto_ok then
      new_status := 'reviewed';
      insert into public.rehab_reviews (session_id, programme_id, patient_id, reviewer_id, decision, notes, suggestion)
      values (s.id, pr.id, pid, null, 'auto_continue',
              'Released by the programme rule set by the clinician (complete feedback, no concerning symptoms, pain at or below ' || pr.auto_unlock_max_pain || '/10).',
              jsonb_build_object('rule', 'auto_after_feedback', 'max_pain', max_pain));
      next_id := public.rehab__release_next(pr.id, 'auto_rule', pr.min_hours_between_sessions);
      if next_id is null then
        update public.rehab_programmes set status = 'completed' where id = pr.id;
        perform public.rehab__notify_patient(pid, 'programme_completed', 'info', 'Programme completed', 'Well done — you have completed every day of this programme.');
      else
        perform public.rehab__notify_patient(pid, 'session_unlocked', 'info', 'Your next day is ready', 'Open your dashboard to see the next session.');
      end if;
      perform public.rehab__notify_admin('feedback_auto_released', 'info', 'Day ' || s.day_number || ' feedback received (' || ref || ')',
        'Released automatically by the programme rule.', pid, jsonb_build_object('session_id', s.id), '/admin/rehabverse/patients/' || pid::text);
    end if;
  end if;

  update public.rehab_sessions set status = new_status, reviewed_at = case when new_status = 'reviewed' then now() end where id = s.id;
  if lvl = 'none' and new_status = 'awaiting_review' then
    perform public.rehab__notify_admin('feedback_received', 'attention', 'Day ' || s.day_number || ' feedback to review (' || ref || ')',
      'Awaiting your decision before the next day opens.', pid, jsonb_build_object('session_id', s.id), '/admin/rehabverse/patients/' || pid::text);
  end if;
  perform public.rehab__audit('feedback_submitted', 'rehab_feedback', fid, pid, jsonb_build_object('session_id', s.id, 'flag_level', lvl, 'auto_released', next_id is not null));
  return jsonb_build_object('ok', true, 'duplicate', false, 'status', new_status, 'flag_level', lvl,
                            'auto_released', next_id is not null, 'reference_code', ref);
end $$;

-- Later-the-same-day / 24 h / 48 h recovery check-ins.
create or replace function public.rehab_submit_followup(p_session_id uuid, p_timepoint text, p_payload jsonb)
returns jsonb language plpgsql security definer set search_path = public, pg_temp as $$
declare
  pid uuid := public.rehab__require_patient();
  s public.rehab_sessions%rowtype; pr public.rehab_programmes%rowtype; fb public.rehab_feedback%rowtype;
  lo interval; hi interval; flags text[]; resp text; pain int; fn int; lvl text; ref text;
begin
  if p_timepoint not in ('later_same_day', '24h', '48h') then raise exception 'rehab: invalid timepoint' using errcode = '22023'; end if;
  select * into s from public.rehab_sessions where id = p_session_id;
  if not found then raise exception 'rehab: session not found' using errcode = 'P0002'; end if;
  select * into pr from public.rehab_programmes where id = s.programme_id;
  if pr.patient_id <> pid then raise exception 'rehab: session not found' using errcode = 'P0002'; end if;
  select * into fb from public.rehab_feedback where session_id = s.id;
  if not found then raise exception 'rehab: feedback_first' using errcode = '55000'; end if;
  if not (p_timepoint = any (pr.errp_schedule)) then raise exception 'rehab: timepoint_not_scheduled' using errcode = '55000'; end if;
  if exists (select 1 from public.rehab_errp_observations where session_id = s.id and timepoint = p_timepoint) then
    return jsonb_build_object('ok', true, 'duplicate', true);
  end if;
  -- Windows (approximate by design): later the same day ≥ 2 h after exercising; 24 h ≥ 18 h; 48 h ≥ 40 h.
  lo := case p_timepoint when 'later_same_day' then interval '2 hours' when '24h' then interval '18 hours' else interval '40 hours' end;
  hi := case p_timepoint when 'later_same_day' then interval '20 hours' when '24h' then interval '72 hours' else interval '120 hours' end;
  if now() < fb.submitted_at + lo then raise exception 'rehab: too_early' using errcode = '55000'; end if;
  if now() > fb.submitted_at + hi then raise exception 'rehab: window_closed' using errcode = '55000'; end if;

  pain := public.rehab__int(p_payload, 'pain', 0, 10, true);
  fn := public.rehab__int(p_payload, 'function_score', 0, 10);
  resp := public.rehab__text(p_payload, 'symptom_response', 10, true);
  if resp not in ('better', 'same', 'worse') then raise exception 'rehab: invalid symptom_response' using errcode = '22023'; end if;
  flags := public.rehab__list(p_payload, 'safety_flags', (select array_agg(id) from public.rehab_safety_flags where context = 'feedback'), 0, 10);

  insert into public.rehab_errp_observations (patient_id, session_id, timepoint, pain, function_score, symptom_response, new_symptoms, flag_ids, note)
  values (pid, s.id, p_timepoint, pain, fn, resp, public.rehab__bool(p_payload, 'new_symptoms', false), flags, public.rehab__text(p_payload, 'note', 1000));

  lvl := public.rehab__raise_safety(pid, s.id, pr.id, flags, 'Reported at the ' || p_timepoint || ' check-in after day ' || s.day_number || ': ' || array_to_string(flags, ', '));
  if lvl <> 'none' then
    -- A concerning report must not leave a released day open.
    update public.rehab_sessions set status = 'locked', available_from = null
     where programme_id = pr.id and status = 'unlocked' and id <> s.id
       and not exists (select 1 from public.rehab_feedback f where f.session_id = rehab_sessions.id);
  elsif resp = 'worse' then
    select reference_code into ref from public.rehab_patients where id = pid;
    perform public.rehab__notify_admin('recovery_worse', 'attention', 'Symptoms worse at ' || p_timepoint || ' (' || ref || ')',
      'Reported after day ' || s.day_number || '. Consider this before progressing.', pid, jsonb_build_object('session_id', s.id), '/admin/rehabverse/patients/' || pid::text);
  end if;
  return jsonb_build_object('ok', true, 'duplicate', false, 'flag_level', lvl);
end $$;

-- Charts: everything the patient's progress view needs.
create or replace function public.rehab_my_history()
returns jsonb language plpgsql stable security definer set search_path = public, pg_temp as $$
declare pid uuid := public.rehab__require_patient();
begin
  return jsonb_build_object(
    'days', coalesce((
      select jsonb_agg(jsonb_build_object('session_id', s.id, 'day_number', s.day_number, 'title', s.title, 'status', s.status,
        'released_at', s.released_at, 'completion', f.completion, 'submitted_at', f.submitted_at, 'difficulty', f.difficulty,
        'observations', coalesce((select jsonb_agg(jsonb_build_object('timepoint', o.timepoint, 'pain', o.pain, 'function_score', o.function_score,
              'symptom_response', o.symptom_response, 'recorded_at', o.recorded_at) order by o.recorded_at)
              from public.rehab_errp_observations o where o.session_id = s.id), '[]'::jsonb)) order by s.day_number)
      from public.rehab_programmes p
      join public.rehab_sessions s on s.programme_id = p.id
      left join public.rehab_feedback f on f.session_id = s.id
      where p.patient_id = pid and p.status <> 'draft' and s.status <> 'cancelled'
        and p.id = (select id from public.rehab_programmes where patient_id = pid and status <> 'draft'
                     order by case status when 'active' then 0 when 'paused' then 1 else 2 end, created_at desc limit 1)), '[]'::jsonb),
    'baseline_pain', (select pain_now from public.rehab_assessments where patient_id = pid order by submitted_at desc limit 1)
  );
end $$;

create or replace function public.rehab_my_notifications()
returns jsonb language plpgsql stable security definer set search_path = public, pg_temp as $$
declare pid uuid := public.rehab__require_patient();
begin
  return coalesce((select jsonb_agg(jsonb_build_object('id', n.id, 'kind', n.kind, 'severity', n.severity, 'title', n.title, 'body', n.body,
            'data', n.data, 'link', n.link, 'read_at', n.read_at, 'created_at', n.created_at) order by n.created_at desc)
          from (select * from public.rehab_notifications where audience = 'patient' and patient_id = pid order by created_at desc limit 30) n), '[]'::jsonb);
end $$;

create or replace function public.rehab_mark_notifications_read()
returns void language plpgsql security definer set search_path = public, pg_temp as $$
declare pid uuid := public.rehab__require_patient();
begin
  update public.rehab_notifications set read_at = now() where audience = 'patient' and patient_id = pid and read_at is null;
end $$;

-- ═════════════════════════════════════════ ADMIN FUNCTIONS ═════════════════════════════════════════

create or replace function public.rehab_admin_inbox()
returns jsonb language plpgsql stable security definer set search_path = public, pg_temp as $$
begin
  perform public.rehab__require_admin();
  return jsonb_build_object(
    'assessments', coalesce((select jsonb_agg(x order by (x ->> 'submitted_at') desc) from (
        select jsonb_build_object('id', a.id, 'patient_id', p.id, 'reference_code', p.reference_code, 'full_name', p.full_name,
               'status', a.status, 'red_flag_level', a.red_flag_level, 'regions', a.regions, 'pain_now', a.pain_now,
               'submitted_at', a.submitted_at) x
        from public.rehab_assessments a join public.rehab_patients p on p.id = a.patient_id
        where a.status in ('submitted', 'needs_clinical_assessment', 'in_review', 'cleared_for_programme')) t), '[]'::jsonb),
    'awaiting_review', coalesce((select jsonb_agg(x order by (x ->> 'submitted_at')) from (
        select jsonb_build_object('session_id', s.id, 'programme_id', pr.id, 'patient_id', p.id, 'reference_code', p.reference_code,
               'full_name', p.full_name, 'day_number', s.day_number, 'title', s.title, 'programme_status', pr.status,
               'submitted_at', f.submitted_at, 'pain_after', f.pain_after) x
        from public.rehab_sessions s join public.rehab_programmes pr on pr.id = s.programme_id
        join public.rehab_patients p on p.id = pr.patient_id join public.rehab_feedback f on f.session_id = s.id
        where s.status = 'awaiting_review') t), '[]'::jsonb),
    'programmes', coalesce((select jsonb_agg(x order by (x ->> 'created_at') desc) from (
        select jsonb_build_object('id', pr.id, 'patient_id', p.id, 'reference_code', p.reference_code, 'full_name', p.full_name,
               'title', pr.title, 'status', pr.status, 'created_at', pr.created_at,
               'days_total', (select count(*) from public.rehab_sessions s where s.programme_id = pr.id),
               'days_done', (select count(*) from public.rehab_sessions s where s.programme_id = pr.id and s.status = 'reviewed')) x
        from public.rehab_programmes pr join public.rehab_patients p on p.id = pr.patient_id
        where pr.status in ('draft', 'active', 'paused')) t), '[]'::jsonb),
    'adverse_events', coalesce((select jsonb_agg(x order by (x ->> 'created_at') desc) from (
        select jsonb_build_object('id', e.id, 'patient_id', p.id, 'reference_code', p.reference_code, 'full_name', p.full_name,
               'severity', e.severity, 'status', e.status, 'flag_ids', e.flag_ids, 'created_at', e.created_at) x
        from public.rehab_adverse_events e join public.rehab_patients p on p.id = e.patient_id where e.status = 'open') t), '[]'::jsonb),
    'notifications', coalesce((select jsonb_agg(jsonb_build_object('id', n.id, 'kind', n.kind, 'severity', n.severity, 'title', n.title,
            'body', n.body, 'link', n.link, 'read_at', n.read_at, 'created_at', n.created_at) order by n.created_at desc)
          from (select * from public.rehab_notifications where audience = 'admin' order by created_at desc limit 25) n), '[]'::jsonb),
    'unread_notifications', (select count(*) from public.rehab_notifications where audience = 'admin' and read_at is null)
  );
end $$;

create or replace function public.rehab_admin_patients()
returns jsonb language plpgsql stable security definer set search_path = public, pg_temp as $$
begin
  perform public.rehab__require_admin();
  return coalesce((select jsonb_agg(jsonb_build_object('id', p.id, 'reference_code', p.reference_code, 'full_name', p.full_name,
      'city', p.city, 'created_at', p.created_at,
      'programme_status', (select pr.status from public.rehab_programmes pr where pr.patient_id = p.id order by pr.created_at desc limit 1))
      order by p.created_at desc) from public.rehab_patients p), '[]'::jsonb);
end $$;

-- Full clinical record of one patient.
create or replace function public.rehab_admin_patient(p_patient_id uuid)
returns jsonb language plpgsql stable security definer set search_path = public, pg_temp as $$
declare pat public.rehab_patients%rowtype;
begin
  perform public.rehab__require_admin();
  select * into pat from public.rehab_patients where id = p_patient_id;
  if not found then raise exception 'rehab: patient not found' using errcode = 'P0002'; end if;
  return jsonb_build_object(
    'patient', to_jsonb(pat) - 'user_id',
    'assessments', coalesce((select jsonb_agg(to_jsonb(a) order by a.submitted_at desc) from public.rehab_assessments a where a.patient_id = pat.id), '[]'::jsonb),
    'programmes', coalesce((select jsonb_agg(jsonb_build_object(
        'programme', to_jsonb(pr),
        'sessions', coalesce((select jsonb_agg(jsonb_build_object(
            'session', to_jsonb(s),
            'exercises', coalesce((select jsonb_agg(to_jsonb(e) order by e.position) from public.rehab_session_exercises e where e.session_id = s.id), '[]'::jsonb),
            'feedback', (select to_jsonb(f) from public.rehab_feedback f where f.session_id = s.id),
            'completions', coalesce((select jsonb_agg(to_jsonb(c)) from public.rehab_exercise_completions c where c.session_id = s.id), '[]'::jsonb),
            'observations', coalesce((select jsonb_agg(to_jsonb(o) order by o.recorded_at) from public.rehab_errp_observations o where o.session_id = s.id), '[]'::jsonb),
            'reviews', coalesce((select jsonb_agg(to_jsonb(r) order by r.created_at) from public.rehab_reviews r where r.session_id = s.id), '[]'::jsonb)
          ) order by s.day_number) from public.rehab_sessions s where s.programme_id = pr.id), '[]'::jsonb)
      ) order by pr.created_at desc) from public.rehab_programmes pr where pr.patient_id = pat.id), '[]'::jsonb),
    'adverse_events', coalesce((select jsonb_agg(to_jsonb(e) order by e.created_at desc) from public.rehab_adverse_events e where e.patient_id = pat.id), '[]'::jsonb),
    'audit', coalesce((select jsonb_agg(to_jsonb(l) order by l.at desc) from (select * from public.rehab_audit_log where patient_id = pat.id order by at desc limit 60) l), '[]'::jsonb)
  );
end $$;

create or replace function public.rehab_admin_set_assessment_status(p_assessment_id uuid, p_status text, p_note text default null)
returns void language plpgsql security definer set search_path = public, pg_temp as $$
declare uid uuid := public.rehab__require_admin(); a public.rehab_assessments%rowtype;
begin
  if p_status not in ('in_review', 'cleared_for_programme', 'closed', 'needs_clinical_assessment') then
    raise exception 'rehab: invalid status' using errcode = '22023';
  end if;
  select * into a from public.rehab_assessments where id = p_assessment_id for update;
  if not found then raise exception 'rehab: assessment not found' using errcode = 'P0002'; end if;
  if p_status = 'cleared_for_programme' and (p_note is null or char_length(btrim(p_note)) < 10) then
    raise exception 'rehab: a clinical clearance note is required' using errcode = '22023';
  end if;
  update public.rehab_assessments
     set status = p_status, reviewed_by = uid, reviewed_at = now(),
         clearance_note = case when p_status = 'cleared_for_programme' then left(p_note, 2000) else clearance_note end,
         admin_notes = case when p_status <> 'cleared_for_programme' and p_note is not null then left(p_note, 4000) else admin_notes end
   where id = a.id;
  perform public.rehab__audit('assessment_status', 'rehab_assessments', a.id, a.patient_id, jsonb_build_object('status', p_status, 'note', left(p_note, 300)));
end $$;

-- Creates or edits a programme as a draft. Days that are already released or reviewed are immutable
-- (clinical history); everything else can be rebuilt.
create or replace function public.rehab_admin_save_plan(p_assessment_id uuid, p_programme_id uuid, p_payload jsonb)
returns jsonb language plpgsql security definer set search_path = public, pg_temp as $$
declare
  uid uuid := public.rehab__require_admin();
  a public.rehab_assessments%rowtype; pr public.rehab_programmes%rowtype;
  d jsonb; e jsonb; sid uuid; keep uuid[] := '{}'; day int; n_days int := 0; pos int; existing public.rehab_sessions%rowtype; sched text[];
begin
  if p_programme_id is not null then
    select * into pr from public.rehab_programmes where id = p_programme_id for update;
    if not found then raise exception 'rehab: programme not found' using errcode = 'P0002'; end if;
    if pr.status in ('completed', 'discontinued') then raise exception 'rehab: programme is closed' using errcode = '55000'; end if;
  else
    select * into a from public.rehab_assessments where id = p_assessment_id for update;
    if not found then raise exception 'rehab: assessment not found' using errcode = 'P0002'; end if;
    if a.status in ('needs_clinical_assessment', 'closed') then
      raise exception 'rehab: assessment_not_cleared' using errcode = '55000';
    end if;
    if exists (select 1 from public.rehab_programmes where patient_id = a.patient_id and status in ('draft', 'active', 'paused')) then
      raise exception 'rehab: patient_has_programme' using errcode = '55000';
    end if;
  end if;

  sched := public.rehab__list(p_payload, 'errp_schedule', array['later_same_day', '24h', '48h'], 0, 3);
  if p_programme_id is null then
    insert into public.rehab_programmes (patient_id, assessment_id, title, goal, unlock_mode, min_hours_between_sessions, auto_unlock_max_pain, errp_schedule, created_by)
    values (a.patient_id, a.id, public.rehab__text(p_payload, 'title', 120, true), public.rehab__text(p_payload, 'goal', 1000),
            coalesce(public.rehab__text(p_payload, 'unlock_mode', 30), 'admin_approval'),
            coalesce(public.rehab__int(p_payload, 'min_hours_between_sessions', 0, 168), 0),
            coalesce(public.rehab__int(p_payload, 'auto_unlock_max_pain', 0, 10), 5),
            case when p_payload ? 'errp_schedule' then sched else '{later_same_day,24h}' end, uid)
    returning * into pr;
    update public.rehab_assessments set status = 'programme_created', reviewed_by = uid, reviewed_at = now() where id = a.id;
  else
    update public.rehab_programmes set
      title = public.rehab__text(p_payload, 'title', 120, true), goal = public.rehab__text(p_payload, 'goal', 1000),
      unlock_mode = coalesce(public.rehab__text(p_payload, 'unlock_mode', 30), unlock_mode),
      min_hours_between_sessions = coalesce(public.rehab__int(p_payload, 'min_hours_between_sessions', 0, 168), min_hours_between_sessions),
      auto_unlock_max_pain = coalesce(public.rehab__int(p_payload, 'auto_unlock_max_pain', 0, 10), auto_unlock_max_pain),
      errp_schedule = case when p_payload ? 'errp_schedule' then sched else errp_schedule end
    where id = pr.id returning * into pr;
  end if;

  if p_payload -> 'sessions' is null or jsonb_typeof(p_payload -> 'sessions') <> 'array' or jsonb_array_length(p_payload -> 'sessions') not between 1 and 120 then
    raise exception 'rehab: sessions must be a list of 1-120 days' using errcode = '22023';
  end if;

  for d in select * from jsonb_array_elements(p_payload -> 'sessions') loop
    n_days := n_days + 1;
    day := public.rehab__int(d, 'day_number', 1, 120, true);
    sid := null;
    if d ->> 'id' is not null then
      select * into existing from public.rehab_sessions where id = (d ->> 'id')::uuid and programme_id = pr.id for update;
      if not found then raise exception 'rehab: session does not belong to this programme' using errcode = '22023'; end if;
      sid := existing.id;
      if existing.status in ('awaiting_review', 'reviewed', 'cancelled') or exists (select 1 from public.rehab_feedback f where f.session_id = existing.id) then
        keep := keep || sid;   -- history is immutable
        continue;
      end if;
      update public.rehab_sessions set day_number = day, title = public.rehab__text(d, 'title', 120, true),
             patient_note = public.rehab__text(d, 'patient_note', 1500) where id = sid;
      delete from public.rehab_session_exercises where session_id = sid;
    else
      insert into public.rehab_sessions (programme_id, day_number, title, patient_note)
      values (pr.id, day, public.rehab__text(d, 'title', 120, true), public.rehab__text(d, 'patient_note', 1500)) returning id into sid;
    end if;
    keep := keep || sid;
    pos := 0;
    if d -> 'exercises' is null or jsonb_typeof(d -> 'exercises') <> 'array' or jsonb_array_length(d -> 'exercises') not between 1 and 40 then
      raise exception 'rehab: every day needs 1-40 exercises' using errcode = '22023';
    end if;
    for e in select * from jsonb_array_elements(d -> 'exercises') loop
      pos := pos + 1;
      insert into public.rehab_session_exercises (session_id, position, exercise_id, exercise_title, sets, reps, hold_seconds, rest_seconds,
                                                  duration_seconds, side, frequency, precautions, notes)
      values (sid, pos, public.rehab__text(e, 'exercise_id', 80, true), public.rehab__text(e, 'exercise_title', 160, true),
              public.rehab__int(e, 'sets', 1, 10), public.rehab__int(e, 'reps', 1, 100), public.rehab__int(e, 'hold_seconds', 0, 300),
              public.rehab__int(e, 'rest_seconds', 0, 600), public.rehab__int(e, 'duration_seconds', 0, 3600),
              coalesce(public.rehab__text(e, 'side', 10), 'both'), public.rehab__text(e, 'frequency', 120),
              public.rehab__text(e, 'precautions', 1000), public.rehab__text(e, 'notes', 1000));
    end loop;
  end loop;

  -- Remove draft days that were taken out of the plan (never released / reviewed ones).
  delete from public.rehab_sessions where programme_id = pr.id and status = 'locked' and not (id = any (keep))
     and not exists (select 1 from public.rehab_feedback f where f.session_id = rehab_sessions.id);
  perform public.rehab__audit('plan_saved', 'rehab_programmes', pr.id, pr.patient_id, jsonb_build_object('days', n_days, 'status', pr.status));
  return jsonb_build_object('id', pr.id, 'status', pr.status, 'days', n_days);
end $$;

-- approve | pause | resume | discontinue | complete
create or replace function public.rehab_admin_programme_action(p_programme_id uuid, p_action text, p_reason text default null)
returns jsonb language plpgsql security definer set search_path = public, pg_temp as $$
declare uid uuid := public.rehab__require_admin(); pr public.rehab_programmes%rowtype; first_id uuid;
begin
  select * into pr from public.rehab_programmes where id = p_programme_id for update;
  if not found then raise exception 'rehab: programme not found' using errcode = 'P0002'; end if;
  if p_action not in ('approve', 'pause', 'resume', 'discontinue', 'complete') then raise exception 'rehab: invalid action' using errcode = '22023'; end if;
  if p_action in ('pause', 'resume', 'discontinue') and (p_reason is null or char_length(btrim(p_reason)) < 5) then
    raise exception 'rehab: a reason is required' using errcode = '22023';
  end if;

  if p_action = 'approve' then
    if pr.status <> 'draft' then raise exception 'rehab: only a draft can be approved' using errcode = '55000'; end if;
    if not exists (select 1 from public.rehab_sessions where programme_id = pr.id and status = 'locked') then
      raise exception 'rehab: the programme has no days' using errcode = '55000';
    end if;
    update public.rehab_programmes set status = 'active', approved_by = uid, approved_at = now() where id = pr.id;
    first_id := public.rehab__release_next(pr.id, 'first_day', 0);
    perform public.rehab__notify_patient(pr.patient_id, 'programme_approved', 'info', 'Your programme is ready',
      'Your physiotherapist approved your programme. Day 1 is open.', jsonb_build_object('programme_id', pr.id));
  elsif p_action = 'pause' then
    if pr.status <> 'active' then raise exception 'rehab: programme is not active' using errcode = '55000'; end if;
    update public.rehab_programmes set status = 'paused', pause_reason = left(p_reason, 2000) where id = pr.id;
    perform public.rehab__notify_patient(pr.patient_id, 'programme_paused', 'attention', 'Programme paused', 'Your physiotherapist paused your programme for now.');
  elsif p_action = 'resume' then
    if pr.status <> 'paused' then raise exception 'rehab: programme is not paused' using errcode = '55000'; end if;
    update public.rehab_programmes set status = 'active', pause_reason = null where id = pr.id;
    perform public.rehab__notify_patient(pr.patient_id, 'programme_resumed', 'info', 'Programme resumed', 'You can continue your programme.');
  elsif p_action = 'discontinue' then
    if pr.status in ('completed', 'discontinued') then raise exception 'rehab: programme is closed' using errcode = '55000'; end if;
    update public.rehab_programmes set status = 'discontinued', pause_reason = left(p_reason, 2000) where id = pr.id;
    perform public.rehab__notify_patient(pr.patient_id, 'programme_discontinued', 'attention', 'Programme stopped', 'Your physiotherapist has stopped this programme. Please contact the clinic.');
  elsif p_action = 'complete' then
    if pr.status not in ('active', 'paused') then raise exception 'rehab: programme is not live' using errcode = '55000'; end if;
    update public.rehab_programmes set status = 'completed' where id = pr.id;
    perform public.rehab__notify_patient(pr.patient_id, 'programme_completed', 'info', 'Programme completed', 'Well done — your programme is complete.');
  end if;
  perform public.rehab__audit('programme_' || p_action, 'rehab_programmes', pr.id, pr.patient_id, jsonb_build_object('reason', left(p_reason, 300)));
  return jsonb_build_object('ok', true, 'first_session_id', first_id);
end $$;

-- The clinician's decision on a day's feedback. Only this (or an override) opens the next day in 'admin_approval' mode.
create or replace function public.rehab_admin_review_session(
  p_session_id uuid, p_decision text, p_notes text default null, p_patient_message text default null,
  p_repeat_current boolean default false, p_suggestion jsonb default null)
returns jsonb language plpgsql security definer set search_path = public, pg_temp as $$
declare
  uid uuid := public.rehab__require_admin();
  s public.rehab_sessions%rowtype; pr public.rehab_programmes%rowtype; next_id uuid; new_id uuid; live int;
begin
  if p_decision not in ('progress', 'maintain', 'regress', 'modify', 'reassess', 'pause', 'discontinue') then
    raise exception 'rehab: invalid decision' using errcode = '22023';
  end if;
  select * into s from public.rehab_sessions where id = p_session_id for update;
  if not found then raise exception 'rehab: session not found' using errcode = 'P0002'; end if;
  if s.status <> 'awaiting_review' then raise exception 'rehab: session_not_awaiting_review' using errcode = '55000'; end if;
  select * into pr from public.rehab_programmes where id = s.programme_id for update;
  if p_decision in ('progress', 'maintain', 'regress', 'modify') and pr.status <> 'active' then
    raise exception 'rehab: programme_not_active_resume_first' using errcode = '55000';
  end if;

  insert into public.rehab_reviews (session_id, programme_id, patient_id, reviewer_id, decision, notes, patient_message, suggestion)
  values (s.id, pr.id, pr.patient_id, uid, p_decision, left(p_notes, 3000), left(p_patient_message, 1000), p_suggestion);
  update public.rehab_sessions set status = 'reviewed', reviewed_at = now() where id = s.id;

  if p_decision in ('progress', 'maintain', 'regress', 'modify') then
    if p_repeat_current then
      update public.rehab_sessions set day_number = day_number + 1 where programme_id = pr.id and day_number > s.day_number;
      insert into public.rehab_sessions (programme_id, day_number, title, patient_note)
      values (pr.id, s.day_number + 1, left(s.title, 100) || ' (repeat)', s.patient_note) returning id into new_id;
      insert into public.rehab_session_exercises (session_id, position, exercise_id, exercise_title, sets, reps, hold_seconds, rest_seconds,
                                                  duration_seconds, side, frequency, precautions, notes)
      select new_id, position, exercise_id, exercise_title, sets, reps, hold_seconds, rest_seconds, duration_seconds, side, frequency, precautions, notes
        from public.rehab_session_exercises where session_id = s.id;
    end if;
    next_id := public.rehab__release_next(pr.id, 'clinician', pr.min_hours_between_sessions);
    if next_id is null then
      update public.rehab_programmes set status = 'completed' where id = pr.id;
      perform public.rehab__notify_patient(pr.patient_id, 'programme_completed', 'info', 'Programme completed', 'Well done — you have completed every day of this programme.');
    else
      perform public.rehab__notify_patient(pr.patient_id, 'session_unlocked', 'info', 'Your next day is ready', coalesce(left(p_patient_message, 300), 'Open your dashboard to see the next session.'));
    end if;
  elsif p_decision in ('reassess', 'pause') then
    update public.rehab_programmes set status = 'paused',
           pause_reason = coalesce(left(p_notes, 2000), case p_decision when 'reassess' then 'Reassessment needed.' else 'Paused by your physiotherapist.' end)
     where id = pr.id and status in ('active', 'paused');
    perform public.rehab__notify_patient(pr.patient_id, 'programme_paused', 'attention',
      case p_decision when 'reassess' then 'Please book a reassessment' else 'Programme paused' end,
      coalesce(left(p_patient_message, 300), 'Your physiotherapist wants to review you before the next day.'));
  elsif p_decision = 'discontinue' then
    update public.rehab_programmes set status = 'discontinued', pause_reason = coalesce(left(p_notes, 2000), 'Stopped by your physiotherapist.') where id = pr.id;
    perform public.rehab__notify_patient(pr.patient_id, 'programme_discontinued', 'attention', 'Programme stopped',
      coalesce(left(p_patient_message, 300), 'Please contact the clinic.'));
  end if;
  perform public.rehab__audit('session_reviewed', 'rehab_sessions', s.id, pr.patient_id,
    jsonb_build_object('decision', p_decision, 'released_next', next_id is not null, 'repeat', p_repeat_current));
  return jsonb_build_object('ok', true, 'released_session_id', next_id);
end $$;

-- Opens a specific locked day immediately. Always needs a written reason; always audited.
create or replace function public.rehab_admin_override_unlock(p_session_id uuid, p_reason text)
returns void language plpgsql security definer set search_path = public, pg_temp as $$
declare uid uuid := public.rehab__require_admin(); s public.rehab_sessions%rowtype; pr public.rehab_programmes%rowtype;
begin
  if p_reason is null or char_length(btrim(p_reason)) < 10 then raise exception 'rehab: a reason is required' using errcode = '22023'; end if;
  select * into s from public.rehab_sessions where id = p_session_id for update;
  if not found then raise exception 'rehab: session not found' using errcode = 'P0002'; end if;
  if s.status <> 'locked' then raise exception 'rehab: only a locked day can be opened' using errcode = '55000'; end if;
  select * into pr from public.rehab_programmes where id = s.programme_id;
  if pr.status <> 'active' then raise exception 'rehab: programme_not_active_resume_first' using errcode = '55000'; end if;
  update public.rehab_sessions set status = 'unlocked', released_at = now(), release_mode = 'override', released_by = uid, available_from = now() where id = s.id;
  perform public.rehab__notify_patient(pr.patient_id, 'session_unlocked', 'info', 'A day was opened for you', 'Your physiotherapist opened Day ' || s.day_number || '.');
  perform public.rehab__audit('session_override_unlock', 'rehab_sessions', s.id, pr.patient_id, jsonb_build_object('reason', left(p_reason, 300)));
end $$;

create or replace function public.rehab_admin_log_adverse_event(p_patient_id uuid, p_session_id uuid, p_severity text, p_description text, p_action_taken text default null)
returns uuid language plpgsql security definer set search_path = public, pg_temp as $$
declare uid uuid := public.rehab__require_admin(); new_id uuid;
begin
  if p_severity not in ('mild', 'moderate', 'severe') then raise exception 'rehab: invalid severity' using errcode = '22023'; end if;
  if p_description is null or char_length(btrim(p_description)) < 5 then raise exception 'rehab: a description is required' using errcode = '22023'; end if;
  if not exists (select 1 from public.rehab_patients where id = p_patient_id) then raise exception 'rehab: patient not found' using errcode = 'P0002'; end if;
  insert into public.rehab_adverse_events (patient_id, session_id, source, severity, description, action_taken, created_by)
  values (p_patient_id, p_session_id, 'admin', p_severity, left(p_description, 3000), left(p_action_taken, 3000), uid) returning id into new_id;
  return new_id;
end $$;

create or replace function public.rehab_admin_update_adverse_event(p_id uuid, p_status text, p_action_taken text default null)
returns void language plpgsql security definer set search_path = public, pg_temp as $$
begin
  perform public.rehab__require_admin();
  if p_status not in ('open', 'reviewed', 'closed') then raise exception 'rehab: invalid status' using errcode = '22023'; end if;
  update public.rehab_adverse_events set status = p_status, action_taken = coalesce(left(p_action_taken, 3000), action_taken) where id = p_id;
  if not found then raise exception 'rehab: event not found' using errcode = 'P0002'; end if;
end $$;

create or replace function public.rehab_admin_mark_notifications_read()
returns void language plpgsql security definer set search_path = public, pg_temp as $$
begin
  perform public.rehab__require_admin();
  update public.rehab_notifications set read_at = now() where audience = 'admin' and read_at is null;
end $$;

-- ─────────────────────────────────── API permissions for the public functions ───────────────────────────────────
do $$
declare f text;
begin
  foreach f in array array[
    'rehab_register_patient(jsonb)', 'rehab_set_language(text)', 'rehab_submit_assessment(jsonb)', 'rehab_my_overview()',
    'rehab_my_session(uuid)', 'rehab_submit_feedback(uuid, jsonb)', 'rehab_submit_followup(uuid, text, jsonb)', 'rehab_my_history()',
    'rehab_my_notifications()', 'rehab_mark_notifications_read()',
    'rehab_admin_inbox()', 'rehab_admin_patients()', 'rehab_admin_patient(uuid)', 'rehab_admin_set_assessment_status(uuid, text, text)',
    'rehab_admin_save_plan(uuid, uuid, jsonb)', 'rehab_admin_programme_action(uuid, text, text)',
    'rehab_admin_review_session(uuid, text, text, text, boolean, jsonb)', 'rehab_admin_override_unlock(uuid, text)',
    'rehab_admin_log_adverse_event(uuid, uuid, text, text, text)', 'rehab_admin_update_adverse_event(uuid, text, text)',
    'rehab_admin_mark_notifications_read()'
  ] loop
    execute format('revoke all on function public.%s from public, anon', f);
    execute format('grant execute on function public.%s to authenticated', f);
  end loop;
end $$;
