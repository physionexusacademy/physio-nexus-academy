-- RehabVerse camera Form Check: the records it leaves behind.
--
-- NUMBERS ONLY. No video, no image, no landmark coordinates and no audio are ever stored or sent (the pose model runs in the browser). A record holds the finished
-- set's counts, times, ranges and cue counts (patient sets), or, in the therapist-only validation mode, one trial per hold with the blinded reference value
-- next to the camera value (the research study of how accurate the camera is).
--
--   rehab_formcheck_sets    one finished exercise set. kind 'patient': saved for a patient whose AI assistance the admin switched ON (the database checks that, not only
--                           the page). kind 'validation': a study participant, identified by a study code only (never a name); saved by staff.
--   rehab_formcheck_trials  validation mode only: one reading per hold. A trial is written once the assessor's reference value has been entered; the camera value
--                           was captured before and stayed hidden from the assessor until this row was saved (camera_captured_at <= recorded_at).
--   rehab_formcheck_study   one row: when the analysis was locked. Until then a withdrawing participant's records can be removed; after, they cannot.
--
-- Records are immutable (a correction is a new trial that points at the one it corrects). Everything is written through functions: the tables have no
-- privileges for the browser roles, and every change is in the audit log.

create table if not exists public.rehab_formcheck_study (
  id boolean primary key default true check (id),
  analysis_locked_at timestamptz
);
insert into public.rehab_formcheck_study (id) values (true) on conflict do nothing;
alter table public.rehab_formcheck_study enable row level security;
revoke all on public.rehab_formcheck_study from anon, authenticated;

create table if not exists public.rehab_formcheck_sets (
  id uuid primary key default gen_random_uuid(),
  kind text not null check (kind in ('patient', 'validation')),
  patient_id uuid references public.rehab_patients (id) on delete restrict,
  study_code text check (study_code ~ '^[A-Za-z0-9-]{3,24}$'),
  spec_id text not null check (spec_id ~ '^[a-z0-9-]{3,40}$'),
  pass smallint not null default 1 check (pass in (1, 2)),
  side text check (side in ('left', 'right')),
  session_no smallint check (session_no in (1, 2)),
  software jsonb not null check (jsonb_typeof(software) = 'object' and pg_column_size(software) <= 2000),
  device jsonb not null default '{}'::jsonb check (jsonb_typeof(device) = 'object' and pg_column_size(device) <= 3000),
  conditions jsonb not null default '{}'::jsonb check (jsonb_typeof(conditions) = 'object' and pg_column_size(conditions) <= 3000),
  summary jsonb not null check (jsonb_typeof(summary) = 'object' and pg_column_size(summary) <= 12000),
  created_by uuid references auth.users (id) on delete set null,
  created_at timestamptz not null default now(),
  check ((kind = 'patient' and patient_id is not null and study_code is null) or (kind = 'validation' and study_code is not null and patient_id is null))
);
create index if not exists rehab_formcheck_sets_patient_idx on public.rehab_formcheck_sets (patient_id, created_at) where patient_id is not null;
create index if not exists rehab_formcheck_sets_code_idx on public.rehab_formcheck_sets (study_code, created_at) where study_code is not null;
alter table public.rehab_formcheck_sets enable row level security;
revoke all on public.rehab_formcheck_sets from anon, authenticated;

create table if not exists public.rehab_formcheck_trials (
  id uuid primary key default gen_random_uuid(),
  set_id uuid not null references public.rehab_formcheck_sets (id) on delete restrict,
  seq smallint not null check (seq between 1 and 400),
  movement_id text not null check (movement_id ~ '^[a-z0-9-]{3,40}$'),
  movement_type text check (movement_type is null or movement_type ~ '^[a-z0-9-]{3,50}$'),
  repetition smallint check (repetition between 1 and 20),
  camera_value real,
  camera_confidence real check (camera_confidence between 0 and 1),
  reference_value real,
  reference_instrument text check (char_length(reference_instrument) <= 60),
  refused boolean not null default false,
  refused_reason text check (char_length(refused_reason) <= 60),
  instructed_error boolean not null default false,
  cue_fired text check (char_length(cue_fired) <= 60),
  count_tool smallint check (count_tool between 0 and 500),
  count_manual smallint check (count_manual between 0 and 500),
  hold_tool_s real check (hold_tool_s between 0 and 600),
  hold_stopwatch_s real check (hold_stopwatch_s between 0 and 600),
  corrects_id uuid references public.rehab_formcheck_trials (id) on delete restrict,
  camera_captured_at timestamptz,
  recorded_at timestamptz not null default now(),
  unique (set_id, seq),
  -- a reading the camera made must come with its reference value; a count check or a hold timing carries its own pair; a refusal carries only its reason
  check (refused or (camera_value is not null and reference_value is not null) or (count_tool is not null and count_manual is not null) or (hold_tool_s is not null and hold_stopwatch_s is not null)),
  check (camera_captured_at is null or camera_captured_at <= recorded_at)
);
create index if not exists rehab_formcheck_trials_set_idx on public.rehab_formcheck_trials (set_id, seq);
alter table public.rehab_formcheck_trials enable row level security;
revoke all on public.rehab_formcheck_trials from anon, authenticated;

-- A record cannot be changed. Deleting is possible only through rehab_admin_formcheck_withdraw (it switches a local flag on), and never after the analysis is locked.
create or replace function public.rehab_formcheck_guard() returns trigger
language plpgsql set search_path = public, pg_temp as $$
begin
  if tg_op = 'UPDATE' then
    raise exception 'rehab: a camera record cannot be changed' using errcode = '55000';
  end if;
  if coalesce(current_setting('rehab.formcheck_withdrawal', true), '') <> 'on' then
    raise exception 'rehab: a camera record can only be removed by a withdrawal' using errcode = '55000';
  end if;
  return old;
end $$;
revoke all on function public.rehab_formcheck_guard() from public, anon, authenticated;
drop trigger if exists rehab_formcheck_sets_guard on public.rehab_formcheck_sets;
create trigger rehab_formcheck_sets_guard before update or delete on public.rehab_formcheck_sets for each row execute function public.rehab_formcheck_guard();
drop trigger if exists rehab_formcheck_trials_guard on public.rehab_formcheck_trials;
create trigger rehab_formcheck_trials_guard before update or delete on public.rehab_formcheck_trials for each row execute function public.rehab_formcheck_guard();

create or replace function public.rehab_formcheck_study_guard() returns trigger
language plpgsql set search_path = public, pg_temp as $$
begin
  if tg_op = 'DELETE' then raise exception 'rehab: the study record cannot be removed' using errcode = '55000'; end if;
  if old.analysis_locked_at is not null and new.analysis_locked_at is distinct from old.analysis_locked_at then
    raise exception 'rehab: the analysis lock cannot be changed' using errcode = '55000';
  end if;
  return new;
end $$;
revoke all on function public.rehab_formcheck_study_guard() from public, anon, authenticated;
drop trigger if exists rehab_formcheck_study_guard on public.rehab_formcheck_study;
create trigger rehab_formcheck_study_guard before update or delete on public.rehab_formcheck_study for each row execute function public.rehab_formcheck_study_guard();

-- Server only: the page's server action saves a patient's finished set. The database itself refuses unless the admin switched AI assistance ON for this patient.
create or replace function public.rehab_formcheck_save_patient_set(p_patient_id uuid, p_payload jsonb)
returns jsonb language plpgsql security definer set search_path = public, pg_temp as $$
declare new_id uuid; spec text; pass_no int; side_text text;
begin
  if not exists (select 1 from public.rehab_patients where id = p_patient_id and status = 'active' and ai_assist = 'on') then
    raise exception 'rehab: the camera check is not enabled for this patient' using errcode = '42501';
  end if;
  if jsonb_typeof(p_payload) is distinct from 'object' or jsonb_typeof(p_payload -> 'summary') is distinct from 'object' or jsonb_typeof(p_payload -> 'software') is distinct from 'object' then
    raise exception 'rehab: invalid camera record' using errcode = '22023';
  end if;
  spec := p_payload ->> 'spec_id';
  pass_no := coalesce((p_payload ->> 'pass')::int, 1);
  side_text := nullif(p_payload ->> 'side', '');
  insert into public.rehab_formcheck_sets (kind, patient_id, spec_id, pass, side, software, device, summary)
  values ('patient', p_patient_id, spec, pass_no, side_text, p_payload -> 'software', coalesce(p_payload -> 'device', '{}'::jsonb), p_payload -> 'summary')
  returning id into new_id;
  perform public.rehab__audit('formcheck.set_saved', 'rehab_formcheck_sets', new_id, p_patient_id, jsonb_build_object('spec', spec, 'pass', pass_no));
  return jsonb_build_object('id', new_id);
end $$;

-- Staff only (validation mode): one set for a study participant, by study code.
create or replace function public.rehab_admin_formcheck_save_set(p_payload jsonb)
returns jsonb language plpgsql security definer set search_path = public, pg_temp as $$
declare uid uuid := public.rehab__require_admin(); new_id uuid;
begin
  if jsonb_typeof(p_payload) is distinct from 'object' or jsonb_typeof(p_payload -> 'summary') is distinct from 'object' or jsonb_typeof(p_payload -> 'software') is distinct from 'object' then
    raise exception 'rehab: invalid camera record' using errcode = '22023';
  end if;
  if (select analysis_locked_at from public.rehab_formcheck_study) is not null then
    raise exception 'rehab: the analysis is locked, no more records can be added' using errcode = '55000';
  end if;
  insert into public.rehab_formcheck_sets (kind, study_code, spec_id, pass, side, session_no, software, device, conditions, summary, created_by)
  values ('validation', p_payload ->> 'study_code', p_payload ->> 'spec_id', coalesce((p_payload ->> 'pass')::int, 1), nullif(p_payload ->> 'side', ''),
          nullif(p_payload ->> 'session_no', '')::int, p_payload -> 'software', coalesce(p_payload -> 'device', '{}'::jsonb), coalesce(p_payload -> 'conditions', '{}'::jsonb), p_payload -> 'summary', uid)
  returning id into new_id;
  perform public.rehab__audit('formcheck.validation_set_saved', 'rehab_formcheck_sets', new_id, null, jsonb_build_object('spec', p_payload ->> 'spec_id', 'session_no', p_payload ->> 'session_no'));
  return jsonb_build_object('id', new_id);
end $$;

-- Staff only: one trial. The reference value is entered first; the camera value (captured earlier and hidden) is saved with it, so the row exists before anyone saw both.
create or replace function public.rehab_admin_formcheck_add_trial(p_set_id uuid, p_trial jsonb)
returns jsonb language plpgsql security definer set search_path = public, pg_temp as $$
declare uid uuid := public.rehab__require_admin(); next_seq int; new_id uuid; refused_flag boolean := coalesce((p_trial ->> 'refused')::boolean, false);
begin
  if not exists (select 1 from public.rehab_formcheck_sets where id = p_set_id and kind = 'validation') then
    raise exception 'rehab: validation set not found' using errcode = 'P0002';
  end if;
  if (select analysis_locked_at from public.rehab_formcheck_study) is not null then
    raise exception 'rehab: the analysis is locked, no more records can be added' using errcode = '55000';
  end if;
  if jsonb_typeof(p_trial) is distinct from 'object' then raise exception 'rehab: invalid trial' using errcode = '22023'; end if;
  select coalesce(max(seq), 0) + 1 into next_seq from public.rehab_formcheck_trials where set_id = p_set_id;
  insert into public.rehab_formcheck_trials (set_id, seq, movement_id, movement_type, repetition, camera_value, camera_confidence, reference_value, reference_instrument,
      refused, refused_reason, instructed_error, cue_fired, count_tool, count_manual, hold_tool_s, hold_stopwatch_s, corrects_id, camera_captured_at)
  values (p_set_id, next_seq, p_trial ->> 'movement_id', p_trial ->> 'movement_type', nullif(p_trial ->> 'repetition', '')::int,
      nullif(p_trial ->> 'camera_value', '')::real, nullif(p_trial ->> 'camera_confidence', '')::real, nullif(p_trial ->> 'reference_value', '')::real, p_trial ->> 'reference_instrument',
      refused_flag, p_trial ->> 'refused_reason', coalesce((p_trial ->> 'instructed_error')::boolean, false), p_trial ->> 'cue_fired',
      nullif(p_trial ->> 'count_tool', '')::int, nullif(p_trial ->> 'count_manual', '')::int, nullif(p_trial ->> 'hold_tool_s', '')::real, nullif(p_trial ->> 'hold_stopwatch_s', '')::real,
      nullif(p_trial ->> 'corrects_id', '')::uuid, nullif(p_trial ->> 'camera_captured_at', '')::timestamptz)
  returning id into new_id;
  perform public.rehab__audit('formcheck.trial_saved', 'rehab_formcheck_trials', new_id, null, jsonb_build_object('set', p_set_id, 'seq', next_seq));
  return jsonb_build_object('id', new_id, 'seq', next_seq);
end $$;

-- Staff only: a patient's camera sets (numbers), newest first.
create or replace function public.rehab_admin_formcheck_patient_sets(p_patient_id uuid)
returns jsonb language plpgsql stable security definer set search_path = public, pg_temp as $$
begin
  perform public.rehab__require_admin();
  return coalesce((select jsonb_agg(jsonb_build_object('id', s.id, 'spec_id', s.spec_id, 'pass', s.pass, 'side', s.side, 'created_at', s.created_at,
      'reps', s.summary -> 'reps', 'partial', s.summary -> 'partial', 'best_hold_ms', s.summary -> 'bestHoldMs', 'coverage', s.summary -> 'coverage', 'cues', s.summary -> 'cues',
      'duration_ms', s.summary -> 'durationMs') order by s.created_at desc)
    from (select * from public.rehab_formcheck_sets where patient_id = p_patient_id order by created_at desc limit 200) s), '[]'::jsonb);
end $$;

-- Staff only: the validation study's de-identified export (study code, no names, no dates finer than the month), one row per trial.
create or replace function public.rehab_admin_formcheck_validation_export()
returns jsonb language plpgsql stable security definer set search_path = public, pg_temp as $$
begin
  perform public.rehab__require_admin();
  return coalesce((select jsonb_agg(jsonb_build_object(
      'study_code', s.study_code, 'session', s.session_no, 'spec_id', s.spec_id, 'pass', s.pass, 'side', s.side, 'month', to_char(s.created_at, 'YYYY-MM'),
      'engine', s.software ->> 'engine', 'pose_model_sha256', s.software ->> 'poseModelSha256', 'device', s.device, 'conditions', s.conditions,
      'seq', t.seq, 'movement_id', t.movement_id, 'movement_type', t.movement_type, 'repetition', t.repetition,
      'camera_value', t.camera_value, 'camera_confidence', t.camera_confidence, 'reference_value', t.reference_value, 'reference_instrument', t.reference_instrument,
      'refused', t.refused, 'refused_reason', t.refused_reason, 'instructed_error', t.instructed_error, 'cue_fired', t.cue_fired,
      'count_tool', t.count_tool, 'count_manual', t.count_manual, 'hold_tool_s', t.hold_tool_s, 'hold_stopwatch_s', t.hold_stopwatch_s, 'corrects', t.corrects_id is not null)
      order by s.study_code, s.session_no, t.movement_id, t.seq)
    from public.rehab_formcheck_trials t join public.rehab_formcheck_sets s on s.id = t.set_id where s.kind = 'validation'), '[]'::jsonb);
end $$;

-- Staff only: the study codes and how many trials each has (to run the visit and to answer a withdrawal).
create or replace function public.rehab_admin_formcheck_codes()
returns jsonb language plpgsql stable security definer set search_path = public, pg_temp as $$
begin
  perform public.rehab__require_admin();
  return jsonb_build_object(
    'locked_at', (select analysis_locked_at from public.rehab_formcheck_study),
    'codes', coalesce((select jsonb_agg(jsonb_build_object('study_code', c.study_code, 'sets', c.sets, 'trials', c.trials, 'sessions', c.sessions) order by c.study_code)
      from (select s.study_code, count(distinct s.id) as sets, count(t.id) as trials, array_agg(distinct s.session_no) filter (where s.session_no is not null) as sessions
              from public.rehab_formcheck_sets s left join public.rehab_formcheck_trials t on t.set_id = s.id where s.kind = 'validation' group by s.study_code) c), '[]'::jsonb));
end $$;

-- Staff only: a participant withdraws. Their records are removed from the working dataset, but only before the analysis is locked.
create or replace function public.rehab_admin_formcheck_withdraw(p_study_code text)
returns jsonb language plpgsql security definer set search_path = public, pg_temp as $$
declare uid uuid := public.rehab__require_admin(); removed_trials int; removed_sets int;
begin
  if (select analysis_locked_at from public.rehab_formcheck_study) is not null then
    raise exception 'rehab: the analysis is locked, records can no longer be removed' using errcode = '55000';
  end if;
  perform set_config('rehab.formcheck_withdrawal', 'on', true);
  delete from public.rehab_formcheck_trials t using public.rehab_formcheck_sets s where t.set_id = s.id and s.kind = 'validation' and s.study_code = p_study_code;
  get diagnostics removed_trials = row_count;
  delete from public.rehab_formcheck_sets where kind = 'validation' and study_code = p_study_code;
  get diagnostics removed_sets = row_count;
  perform set_config('rehab.formcheck_withdrawal', 'off', true);
  perform public.rehab__audit('formcheck.withdrawal', 'rehab_formcheck_sets', null, null, jsonb_build_object('study_code', p_study_code, 'sets', removed_sets, 'trials', removed_trials));
  return jsonb_build_object('sets', removed_sets, 'trials', removed_trials);
end $$;

-- Staff only: lock the analysis (one way). After this no record can be added or removed.
create or replace function public.rehab_admin_formcheck_lock_analysis()
returns jsonb language plpgsql security definer set search_path = public, pg_temp as $$
declare uid uuid := public.rehab__require_admin(); at timestamptz;
begin
  update public.rehab_formcheck_study set analysis_locked_at = coalesce(analysis_locked_at, now()) returning analysis_locked_at into at;
  perform public.rehab__audit('formcheck.analysis_locked', 'rehab_formcheck_study', null, null, jsonb_build_object('locked_at', at));
  return jsonb_build_object('locked_at', at);
end $$;

do $$
begin
  revoke all on function public.rehab_formcheck_save_patient_set(uuid, jsonb) from public, anon, authenticated;
  grant execute on function public.rehab_formcheck_save_patient_set(uuid, jsonb) to service_role;
  revoke all on function public.rehab_admin_formcheck_save_set(jsonb) from public, anon;
  grant execute on function public.rehab_admin_formcheck_save_set(jsonb) to authenticated;
  revoke all on function public.rehab_admin_formcheck_add_trial(uuid, jsonb) from public, anon;
  grant execute on function public.rehab_admin_formcheck_add_trial(uuid, jsonb) to authenticated;
  revoke all on function public.rehab_admin_formcheck_patient_sets(uuid) from public, anon;
  grant execute on function public.rehab_admin_formcheck_patient_sets(uuid) to authenticated;
  revoke all on function public.rehab_admin_formcheck_validation_export() from public, anon;
  grant execute on function public.rehab_admin_formcheck_validation_export() to authenticated;
  revoke all on function public.rehab_admin_formcheck_codes() from public, anon;
  grant execute on function public.rehab_admin_formcheck_codes() to authenticated;
  revoke all on function public.rehab_admin_formcheck_withdraw(text) from public, anon;
  grant execute on function public.rehab_admin_formcheck_withdraw(text) to authenticated;
  revoke all on function public.rehab_admin_formcheck_lock_analysis() from public, anon;
  grant execute on function public.rehab_admin_formcheck_lock_analysis() to authenticated;
end $$;
