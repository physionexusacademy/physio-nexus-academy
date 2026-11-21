-- RehabVerse: the symptom-checker snapshot, and the study setting that decides when a patient sees the screening (27 Nov 2026).
--
-- A patient can now fill the assessment with the same body pictures, history and symptom clues as the public symptom checker. The
-- server works out the screening patterns from the raw answers with the checker engine (never trusting numbers from the browser) and
-- stores ONE snapshot with the assessment:
--   * the exact answers, the engine version that scored them and the patterns it found (a research record that can be re-read later);
--   * the study arm in force when it was saved ('immediate' = the patient sees the screening straight away, 'after_review' = only once
--     the physiotherapist has reviewed the assessment), so changing the setting later never changes an earlier participant's record;
--   * when the screening was first shown to the patient (exposure is logged, never inferred).
-- Snapshots are written only by the server (service role), cannot be edited afterwards (only the "first shown" time is filled in) and are
-- read by the treating physiotherapist (rehab_admin_patient) or by the patient herself/himself (rehab_my_screening, when allowed).

create table if not exists public.rehab_study_settings (
  id boolean primary key default true check (id),
  screening_visibility text not null default 'immediate' check (screening_visibility in ('immediate', 'after_review')),
  updated_by uuid references auth.users (id) on delete set null,
  updated_at timestamptz not null default now()
);
insert into public.rehab_study_settings (id) values (true) on conflict (id) do nothing;
alter table public.rehab_study_settings enable row level security;
revoke all on public.rehab_study_settings from anon, authenticated;

create table if not exists public.rehab_checker_snapshots (
  id uuid primary key default gen_random_uuid(),
  patient_id uuid not null references public.rehab_patients (id) on delete restrict,
  assessment_id uuid not null unique references public.rehab_assessments (id) on delete cascade,
  engine_version text not null check (char_length(engine_version) between 3 and 40),
  source text not null default 'checker' check (source in ('checker', 'handover')),
  region text not null check (char_length(region) between 2 and 30),
  language text not null default 'en' check (language in ('en', 'ru')),
  answers jsonb not null check (jsonb_typeof(answers) = 'array' and jsonb_array_length(answers) <= 60),
  pain_now smallint check (pain_now between 0 and 10),
  top_patterns jsonb not null default '[]'::jsonb check (jsonb_typeof(top_patterns) = 'array' and jsonb_array_length(top_patterns) <= 3),
  priority smallint not null default 0 check (priority between 0 and 2),
  fracture_screen boolean not null default false,
  nerve_hint text check (nerve_hint is null or char_length(nerve_hint) <= 120),
  arm text not null check (arm in ('immediate', 'after_review')),
  shown_to_patient_at timestamptz,
  created_at timestamptz not null default now()
);
create index if not exists rehab_checker_snapshots_patient_idx on public.rehab_checker_snapshots (patient_id, created_at desc);
alter table public.rehab_checker_snapshots enable row level security;
revoke all on public.rehab_checker_snapshots from anon, authenticated;

-- A snapshot is a record: nothing but the "first shown" time can change.
create or replace function public.rehab_checker_snapshots_guard() returns trigger
language plpgsql set search_path = public, pg_temp as $$
begin
  if (to_jsonb(new) - 'shown_to_patient_at') is distinct from (to_jsonb(old) - 'shown_to_patient_at') then
    raise exception 'rehab: a screening snapshot cannot be changed' using errcode = '55000';
  end if;
  if old.shown_to_patient_at is not null and new.shown_to_patient_at is distinct from old.shown_to_patient_at then
    raise exception 'rehab: the first time shown cannot be changed' using errcode = '55000';
  end if;
  return new;
end $$;
drop trigger if exists rehab_checker_snapshots_guard on public.rehab_checker_snapshots;
create trigger rehab_checker_snapshots_guard before update on public.rehab_checker_snapshots
  for each row execute function public.rehab_checker_snapshots_guard();
revoke all on function public.rehab_checker_snapshots_guard() from public, anon, authenticated;

-- Server only: the action works the patterns out and calls this once, right after the assessment is saved.
create or replace function public.rehab_checker_snapshot_save(p_patient_id uuid, p_assessment_id uuid, p_snapshot jsonb)
returns jsonb language plpgsql security definer set search_path = public, pg_temp as $$
declare arm_now text; new_id uuid; pain smallint;
begin
  if not exists (select 1 from public.rehab_assessments where id = p_assessment_id and patient_id = p_patient_id) then
    raise exception 'rehab: assessment not found' using errcode = 'P0002';
  end if;
  if jsonb_typeof(p_snapshot) is distinct from 'object' then raise exception 'rehab: invalid snapshot' using errcode = '22023'; end if;
  select screening_visibility into arm_now from public.rehab_study_settings where id;
  pain := case when p_snapshot ->> 'pain_now' is null then null else (p_snapshot ->> 'pain_now')::smallint end;
  insert into public.rehab_checker_snapshots (patient_id, assessment_id, engine_version, source, region, language, answers, pain_now, top_patterns,
                                              priority, fracture_screen, nerve_hint, arm)
  values (p_patient_id, p_assessment_id,
          p_snapshot ->> 'engine_version',
          coalesce(nullif(p_snapshot ->> 'source', ''), 'checker'),
          p_snapshot ->> 'region',
          coalesce(nullif(p_snapshot ->> 'language', ''), 'en'),
          coalesce(p_snapshot -> 'answers', '[]'::jsonb),
          pain,
          coalesce(p_snapshot -> 'top', '[]'::jsonb),
          coalesce((p_snapshot ->> 'priority')::smallint, 0),
          coalesce((p_snapshot ->> 'fracture_screen')::boolean, false),
          nullif(p_snapshot ->> 'nerve_hint', ''),
          coalesce(arm_now, 'immediate'))
  on conflict (assessment_id) do nothing
  returning id into new_id;
  if new_id is not null then
    perform public.rehab__audit('screening.saved', 'rehab_checker_snapshots', new_id, p_patient_id,
      jsonb_build_object('engine_version', p_snapshot ->> 'engine_version', 'arm', coalesce(arm_now, 'immediate')));
  end if;
  return jsonb_build_object('saved', new_id is not null);
end $$;

-- What the patient may see of her/his own screening. Showing it is logged the first time (that is the exposure record); asking only whether
-- there is something to show (p_mark_shown = false, used to decide whether to draw the panel) logs nothing.
create or replace function public.rehab_my_screening(p_mark_shown boolean default true)
returns jsonb language plpgsql security definer set search_path = public, pg_temp as $$
declare pid uuid; a public.rehab_assessments%rowtype; s public.rehab_checker_snapshots%rowtype; can_see boolean;
begin
  pid := public.rehab__require_patient();
  select * into a from public.rehab_assessments where patient_id = pid order by submitted_at desc limit 1;
  if not found then return jsonb_build_object('assessment_id', null, 'visible', false); end if;
  select * into s from public.rehab_checker_snapshots where assessment_id = a.id;
  if not found then return jsonb_build_object('assessment_id', a.id, 'visible', false); end if;
  -- Never when a safety warning was raised: those patients are routed to a clinician, not shown a list of patterns.
  can_see := a.red_flag_level = 'none' and (s.arm = 'immediate' or a.reviewed_at is not null);
  if not can_see then return jsonb_build_object('assessment_id', a.id, 'visible', false, 'waiting_for_review', a.red_flag_level = 'none'); end if;
  if p_mark_shown and s.shown_to_patient_at is null then
    update public.rehab_checker_snapshots set shown_to_patient_at = now() where id = s.id;
    perform public.rehab__audit('screening.shown', 'rehab_checker_snapshots', s.id, pid, jsonb_build_object('arm', s.arm));
  end if;
  return jsonb_build_object('assessment_id', a.id, 'visible', true,
    'snapshot', jsonb_build_object('engine_version', s.engine_version, 'region', s.region, 'language', s.language, 'answers', s.answers,
                                   'pain_now', s.pain_now, 'top', s.top_patterns, 'priority', s.priority,
                                   'fracture_screen', s.fracture_screen, 'nerve_hint', s.nerve_hint));
end $$;

create or replace function public.rehab_admin_study_settings()
returns jsonb language plpgsql stable security definer set search_path = public, pg_temp as $$
begin
  perform public.rehab__require_admin();
  return (select jsonb_build_object('screening_visibility', screening_visibility, 'updated_at', updated_at) from public.rehab_study_settings where id);
end $$;

create or replace function public.rehab_admin_set_screening_visibility(p_value text)
returns jsonb language plpgsql security definer set search_path = public, pg_temp as $$
begin
  perform public.rehab__require_admin();
  if p_value not in ('immediate', 'after_review') then raise exception 'rehab: unknown setting' using errcode = '22023'; end if;
  update public.rehab_study_settings set screening_visibility = p_value, updated_by = auth.uid(), updated_at = now() where id;
  perform public.rehab__audit('study.screening_visibility', 'rehab_study_settings', null, null, jsonb_build_object('value', p_value));
  return jsonb_build_object('screening_visibility', p_value);
end $$;

-- The physiotherapist's record of a patient carries the screening snapshots too (the answers, the patterns, the engine version, the study arm
-- and whether and when the patient was shown them).
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
    'audit', coalesce((select jsonb_agg(to_jsonb(l) order by l.at desc) from (select * from public.rehab_audit_log where patient_id = pat.id order by at desc limit 60) l), '[]'::jsonb),
    'ai_conversations', coalesce((select jsonb_agg(to_jsonb(c) - 'patient_id' order by c.created_at desc) from public.rehab_ai_conversations c where c.patient_id = pat.id), '[]'::jsonb),
    'checker_snapshots', coalesce((select jsonb_agg(to_jsonb(k) - 'patient_id' order by k.created_at desc) from public.rehab_checker_snapshots k where k.patient_id = pat.id), '[]'::jsonb)
  );
end $$;

do $$
begin
  revoke all on function public.rehab_checker_snapshot_save(uuid, uuid, jsonb) from public, anon, authenticated;
  grant execute on function public.rehab_checker_snapshot_save(uuid, uuid, jsonb) to service_role;
  revoke all on function public.rehab_my_screening(boolean) from public, anon;
  grant execute on function public.rehab_my_screening(boolean) to authenticated;
  revoke all on function public.rehab_admin_study_settings() from public, anon;
  grant execute on function public.rehab_admin_study_settings() to authenticated;
  revoke all on function public.rehab_admin_set_screening_visibility(text) from public, anon;
  grant execute on function public.rehab_admin_set_screening_visibility(text) to authenticated;
end $$;
