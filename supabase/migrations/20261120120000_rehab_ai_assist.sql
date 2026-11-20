-- RehabVerse: the AI-assistance switch (Phase 0).
--
-- Each patient has a switch that only the clinician/admin can turn ON. Default OFF for everyone, including existing patients.
--   off        nothing changes: RehabVerse works exactly as it did before.
--   requested  the patient asked for AI assistance (a tick at sign-up, or a button on the dashboard); the admin decides.
--   on         the admin enabled it. AI features check this on the SERVER (rehab_ai_enabled) before doing anything.
-- Patients can ask for it and can withdraw from it, but can never switch themselves on. Every change is audited
-- (the row trigger on rehab_patients records it, and an explicit audit entry says who and why).
-- This migration adds no AI: it is only the switch and the checks that later AI features will rely on.

alter table public.rehab_patients
  add column if not exists ai_assist text not null default 'off' check (ai_assist in ('off', 'requested', 'on')),
  add column if not exists ai_assist_changed_at timestamptz,
  add column if not exists ai_assist_changed_by uuid references auth.users (id) on delete set null;

-- Sign-up: an optional request. It only ever sets 'requested' on a brand-new profile; re-registering never touches the switch.
create or replace function public.rehab_register_patient(p_payload jsonb)
returns jsonb language plpgsql security definer set search_path = public, pg_temp as $$
declare uid uuid := auth.uid(); age int; rec public.rehab_patients%rowtype; mail text; existed boolean; wants_ai boolean;
begin
  if uid is null then raise exception 'rehab: not authorised' using errcode = '42501'; end if;
  if public.is_admin() then raise exception 'rehab: staff accounts cannot be patients' using errcode = '42501'; end if;
  age := public.rehab__int(p_payload, 'age_years', 0, 120, true);
  if age < 18 then raise exception 'rehab: under_18' using errcode = '22023'; end if;
  if not public.rehab__bool(p_payload, 'consent', false) then
    raise exception 'rehab: consent is required' using errcode = '22023';
  end if;
  mail := nullif(btrim(coalesce(auth.jwt() ->> 'email', '')), '');
  existed := exists (select 1 from public.rehab_patients where user_id = uid);
  wants_ai := public.rehab__bool(p_payload, 'ai_requested', false);
  insert into public.rehab_patients (user_id, full_name, email, age_years, sex, phone, city, preferred_language, consent_version, ai_assist, ai_assist_changed_at)
  values (
    uid,
    public.rehab__text(p_payload, 'full_name', 100, true),
    mail,
    age,
    public.rehab__text(p_payload, 'sex', 20),
    public.rehab__text(p_payload, 'phone', 30),
    public.rehab__text(p_payload, 'city', 80),
    coalesce(public.rehab__text(p_payload, 'preferred_language', 2), 'ru'),
    coalesce(public.rehab__text(p_payload, 'consent_version', 40), 'v1'),
    case when wants_ai then 'requested' else 'off' end,
    case when wants_ai then now() else null end
  )
  on conflict (user_id) do update
    set full_name = excluded.full_name, age_years = excluded.age_years, sex = excluded.sex, phone = excluded.phone,
        city = excluded.city, preferred_language = excluded.preferred_language, email = coalesce(excluded.email, public.rehab_patients.email)
  returning * into rec;
  if not existed and rec.ai_assist = 'requested' then
    perform public.rehab__notify_admin('ai_requested', 'info', 'AI assistance requested',
      rec.reference_code || ' asked for AI assistance when creating an account. Open the patient to turn it on or leave it off.',
      rec.id, '{}'::jsonb, '/admin/rehabverse/patients/' || rec.id);
  end if;
  return jsonb_build_object('id', rec.id, 'reference_code', rec.reference_code, 'preferred_language', rec.preferred_language);
end $$;

-- The patient's own choice: ask for AI assistance (off -> requested) or withdraw (requested/on -> off). Never 'on'.
create or replace function public.rehab_patient_ai_choice(p_want boolean)
returns jsonb language plpgsql security definer set search_path = public, pg_temp as $$
declare pid uuid := public.rehab__require_patient(); cur text; nxt text; ref text;
begin
  select ai_assist, reference_code into cur, ref from public.rehab_patients where id = pid;
  nxt := case when p_want then (case when cur = 'off' then 'requested' else cur end)
              else 'off' end;
  if nxt <> cur then
    update public.rehab_patients set ai_assist = nxt, ai_assist_changed_at = now(), ai_assist_changed_by = auth.uid() where id = pid;
    perform public.rehab__audit(case when nxt = 'requested' then 'ai_assist_requested' else 'ai_assist_withdrawn' end,
      'rehab_patients', pid, pid, jsonb_build_object('from', cur, 'to', nxt, 'by', 'patient'));
    if nxt = 'requested' then
      perform public.rehab__notify_admin('ai_requested', 'info', 'AI assistance requested',
        ref || ' asked for AI assistance. Open the patient to turn it on or leave it off.', pid, '{}'::jsonb, '/admin/rehabverse/patients/' || pid);
    end if;
  end if;
  return jsonb_build_object('ai_assist', nxt);
end $$;

-- The admin's decision. Only the admin can turn it ON; turning it off stops AI features at once (they check the switch on every call).
create or replace function public.rehab_admin_set_ai_assist(p_patient_id uuid, p_enabled boolean)
returns jsonb language plpgsql security definer set search_path = public, pg_temp as $$
declare actor uuid := public.rehab__require_admin(); cur text; nxt text;
begin
  select ai_assist into cur from public.rehab_patients where id = p_patient_id;
  if not found then raise exception 'rehab: patient not found' using errcode = 'P0002'; end if;
  nxt := case when p_enabled then 'on' else 'off' end;
  if nxt <> cur then
    update public.rehab_patients set ai_assist = nxt, ai_assist_changed_at = now(), ai_assist_changed_by = actor where id = p_patient_id;
    perform public.rehab__audit(case when p_enabled then 'ai_assist_enabled' else 'ai_assist_disabled' end,
      'rehab_patients', p_patient_id, p_patient_id, jsonb_build_object('from', cur, 'to', nxt, 'by', 'admin'));
    perform public.rehab__notify_patient(p_patient_id, 'ai_assist', 'info',
      case when p_enabled then 'AI assistance is now on for you' else 'AI assistance is now off for you' end,
      case when p_enabled then 'Your physiotherapist switched on AI assistance for your RehabVerse. It will appear on your dashboard when it is ready.'
           else 'Your physiotherapist switched off AI assistance. RehabVerse works as usual.' end,
      '{}'::jsonb, '/rehabverse/me');
  end if;
  return jsonb_build_object('ai_assist', nxt);
end $$;

-- The single check AI features make on the server: is AI assistance ON for the signed-in patient right now?
create or replace function public.rehab_ai_enabled()
returns boolean language sql stable security definer set search_path = public, pg_temp as $$
  select coalesce((select ai_assist = 'on' and status = 'active' from public.rehab_patients where user_id = auth.uid()), false)
$$;

-- Show the switch to the patient and to the admin.
create or replace function public.rehab_admin_patients()
returns jsonb language plpgsql stable security definer set search_path = public, pg_temp as $$
begin
  perform public.rehab__require_admin();
  return coalesce((select jsonb_agg(jsonb_build_object('id', p.id, 'reference_code', p.reference_code, 'full_name', p.full_name,
      'city', p.city, 'created_at', p.created_at, 'ai_assist', p.ai_assist,
      'programme_status', (select pr.status from public.rehab_programmes pr where pr.patient_id = p.id order by pr.created_at desc limit 1))
      order by p.created_at desc) from public.rehab_patients p), '[]'::jsonb);
end $$;

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
                                  'preferred_language', pat.preferred_language, 'age_years', pat.age_years, 'ai_assist', pat.ai_assist),
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

do $$
declare f text;
begin
  foreach f in array array['rehab_patient_ai_choice(boolean)', 'rehab_admin_set_ai_assist(uuid, boolean)', 'rehab_ai_enabled()'] loop
    execute format('revoke all on function public.%s from public, anon', f);
    execute format('grant execute on function public.%s to authenticated', f);
  end loop;
end $$;
