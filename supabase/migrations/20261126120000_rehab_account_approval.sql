-- RehabVerse account approval (26 Nov 2026).
--
-- A new RehabVerse account is a REQUEST that the clinic approves, instead of an e-mail confirmation link.
--   * The server creates the sign-in (already confirmed, no e-mail is sent) and the patient record with status 'pending'.
--   * Every patient function already requires status = 'active' (rehab__require_patient), so a pending or rejected
--     person can do nothing except see that their request is waiting; no clinical data exists for them.
--   * The admin sees the waiting requests (name, phone, city, age) in rehab_admin_registrations() and approves or
--     rejects with rehab_admin_decide_patient(); both decisions are written to the audit log.
-- Existing patients are active and are not touched.

alter table public.rehab_patients drop constraint if exists rehab_patients_status_check;
alter table public.rehab_patients
  add constraint rehab_patients_status_check check (status in ('pending', 'active', 'rejected', 'archived'));
alter table public.rehab_patients add column if not exists decided_by uuid references auth.users (id) on delete set null;
alter table public.rehab_patients add column if not exists decided_at timestamptz;
alter table public.rehab_patients add column if not exists decision_note text check (decision_note is null or char_length(decision_note) <= 500);

-- New accounts start as pending and the clinic is told. An existing record (the same person registering again) keeps its status.
create or replace function public.rehab_register_patient(p_payload jsonb)
returns jsonb language plpgsql security definer set search_path = public, pg_temp as $$
declare uid uuid := auth.uid(); age int; mail text; rec_id uuid; rec_code text; rec_lang text; rec_status text; is_new boolean; person text;
begin
  if uid is null then raise exception 'rehab: not authorised' using errcode = '42501'; end if;
  if public.is_admin() then raise exception 'rehab: staff accounts cannot be patients' using errcode = '42501'; end if;
  age := public.rehab__int(p_payload, 'age_years', 0, 120, true);
  if age < 18 then raise exception 'rehab: under_18' using errcode = '22023'; end if;
  if not public.rehab__bool(p_payload, 'consent', false) then
    raise exception 'rehab: consent is required' using errcode = '22023';
  end if;
  mail := nullif(btrim(coalesce(auth.jwt() ->> 'email', '')), '');
  person := public.rehab__text(p_payload, 'full_name', 100, true);
  insert into public.rehab_patients (user_id, full_name, email, age_years, sex, phone, city, preferred_language, consent_version, status)
  values (
    uid,
    person,
    mail,
    age,
    public.rehab__text(p_payload, 'sex', 20),
    public.rehab__text(p_payload, 'phone', 30, true),
    public.rehab__text(p_payload, 'city', 80),
    coalesce(public.rehab__text(p_payload, 'preferred_language', 2), 'ru'),
    coalesce(public.rehab__text(p_payload, 'consent_version', 40), 'v1'),
    'pending'
  )
  on conflict (user_id) do update
    set full_name = excluded.full_name, age_years = excluded.age_years, sex = excluded.sex, phone = excluded.phone,
        city = excluded.city, preferred_language = excluded.preferred_language, email = coalesce(excluded.email, public.rehab_patients.email)
  returning id, reference_code, preferred_language, status, (xmax = 0) into rec_id, rec_code, rec_lang, rec_status, is_new;
  if is_new then
    perform public.rehab__audit('patient.registration_requested', 'patient', rec_id, rec_id, jsonb_build_object('reference_code', rec_code));
    perform public.rehab__notify_admin('registration', 'info', 'New account request: ' || person, 'Waiting for your approval in Account requests.', rec_id,
      jsonb_build_object('reference_code', rec_code), '/admin/rehabverse');
  end if;
  return jsonb_build_object('id', rec_id, 'reference_code', rec_code, 'preferred_language', rec_lang, 'status', rec_status);
end $$;

-- The overview now says whether the account is waiting, active or rejected (and why), so the app can show the right screen.
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
                                  'preferred_language', pat.preferred_language, 'age_years', pat.age_years, 'ai_assist', pat.ai_assist,
                                  'status', pat.status, 'decision_note', case when pat.status = 'rejected' then pat.decision_note else null end),
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

-- The waiting requests (with the contact details the clinic needs to check who it is) and the last decisions.
create or replace function public.rehab_admin_registrations()
returns jsonb language plpgsql stable security definer set search_path = public, pg_temp as $$
begin
  perform public.rehab__require_admin();
  return jsonb_build_object(
    'pending', coalesce((select jsonb_agg(jsonb_build_object('id', p.id, 'reference_code', p.reference_code, 'full_name', p.full_name,
        'email', p.email, 'phone', p.phone, 'city', p.city, 'age_years', p.age_years, 'sex', p.sex,
        'preferred_language', p.preferred_language, 'created_at', p.created_at) order by p.created_at)
        from public.rehab_patients p where p.status = 'pending'), '[]'::jsonb),
    'recent', coalesce((select jsonb_agg(x order by (x ->> 'decided_at') desc) from (
        select jsonb_build_object('id', p.id, 'reference_code', p.reference_code, 'full_name', p.full_name, 'phone', p.phone,
               'preferred_language', p.preferred_language, 'status', p.status, 'decided_at', p.decided_at, 'decision_note', p.decision_note) x
        from public.rehab_patients p where p.decided_at is not null order by p.decided_at desc limit 8) t), '[]'::jsonb)
  );
end $$;

-- Approve (the person can sign in and start) or reject (with a reason the person can read). A rejected request can be approved later.
create or replace function public.rehab_admin_decide_patient(p_patient_id uuid, p_decision text, p_note text default null)
returns jsonb language plpgsql security definer set search_path = public, pg_temp as $$
declare pat public.rehab_patients%rowtype; next_status text;
begin
  perform public.rehab__require_admin();
  if p_decision not in ('approve', 'reject') then raise exception 'rehab: unknown decision' using errcode = '22023'; end if;
  select * into pat from public.rehab_patients where id = p_patient_id for update;
  if not found then raise exception 'rehab: patient not found' using errcode = 'P0002'; end if;
  if pat.status not in ('pending', 'rejected') then
    raise exception 'rehab: this account is not waiting for a decision' using errcode = '22023';
  end if;
  next_status := case p_decision when 'approve' then 'active' else 'rejected' end;
  update public.rehab_patients
     set status = next_status, decided_by = auth.uid(), decided_at = now(), decision_note = nullif(btrim(coalesce(p_note, '')), '')
   where id = pat.id;
  perform public.rehab__audit('patient.' || p_decision, 'patient', pat.id, pat.id, jsonb_build_object('note', left(coalesce(p_note, ''), 500)));
  return jsonb_build_object('id', pat.id, 'status', next_status, 'full_name', pat.full_name, 'phone', pat.phone, 'preferred_language', pat.preferred_language);
end $$;

-- The admin patient list shows the status, so waiting and rejected people are easy to tell apart.
create or replace function public.rehab_admin_patients()
returns jsonb language plpgsql stable security definer set search_path = public, pg_temp as $$
begin
  perform public.rehab__require_admin();
  return coalesce((select jsonb_agg(jsonb_build_object('id', p.id, 'reference_code', p.reference_code, 'full_name', p.full_name,
      'city', p.city, 'created_at', p.created_at, 'ai_assist', p.ai_assist, 'status', p.status,
      'programme_status', (select pr.status from public.rehab_programmes pr where pr.patient_id = p.id order by pr.created_at desc limit 1))
      order by p.created_at desc) from public.rehab_patients p), '[]'::jsonb);
end $$;

do $$
declare f text;
begin
  foreach f in array array['rehab_admin_registrations()', 'rehab_admin_decide_patient(uuid, text, text)'] loop
    execute format('revoke all on function public.%s from public, anon', f);
    execute format('grant execute on function public.%s to authenticated', f);
  end loop;
end $$;
