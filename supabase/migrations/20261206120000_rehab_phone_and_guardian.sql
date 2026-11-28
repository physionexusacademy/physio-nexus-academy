-- RehabVerse: easier sign-up (6 Dec 2026).
--
--   * A patient may sign up with a phone number only. The server then signs them in with an internal address
--     (p<digits>@phone.physionexusacademy.com) that is never shown and never mailed: it is not stored as the patient's e-mail.
--   * Children and teenagers (under 18) may be registered by a parent or guardian: the guardian's name and relation are
--     required and stored with the record, and the guardian gives the consent. The clinic still approves every account.

alter table public.rehab_patients add column if not exists guardian_name text check (guardian_name is null or char_length(guardian_name) <= 100);
alter table public.rehab_patients add column if not exists guardian_relation text check (guardian_relation is null or char_length(guardian_relation) <= 40);

-- children and teenagers are now allowed (with a guardian); 1 year is the lowest age a record may hold
alter table public.rehab_patients drop constraint if exists rehab_patients_age_years_check;
alter table public.rehab_patients add constraint rehab_patients_age_years_check check (age_years between 1 and 110);

create or replace function public.rehab_register_patient(p_payload jsonb)
returns jsonb language plpgsql security definer set search_path = public, pg_temp as $$
declare uid uuid := auth.uid(); age int; mail text; rec_id uuid; rec_code text; rec_lang text; rec_status text; is_new boolean; person text;
        guardian text; relation text;
begin
  if uid is null then raise exception 'rehab: not authorised' using errcode = '42501'; end if;
  if public.is_admin() then raise exception 'rehab: staff accounts cannot be patients' using errcode = '42501'; end if;
  age := public.rehab__int(p_payload, 'age_years', 1, 110, true);
  guardian := public.rehab__text(p_payload, 'guardian_name', 100);
  relation := public.rehab__text(p_payload, 'guardian_relation', 40);
  if age < 18 and (guardian is null or char_length(btrim(guardian)) < 2) then
    raise exception 'rehab: guardian_required' using errcode = '22023';
  end if;
  if age >= 18 then guardian := null; relation := null; end if;
  if not public.rehab__bool(p_payload, 'consent', false) then
    raise exception 'rehab: consent is required' using errcode = '22023';
  end if;
  mail := nullif(btrim(coalesce(auth.jwt() ->> 'email', '')), '');
  -- a phone-only sign-up: the internal sign-in address is not an e-mail the patient reads
  if mail like '%@phone.physionexusacademy.com' then mail := null; end if;
  person := public.rehab__text(p_payload, 'full_name', 100, true);
  insert into public.rehab_patients (user_id, full_name, email, age_years, sex, phone, city, preferred_language, consent_version, status, guardian_name, guardian_relation)
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
    'pending',
    guardian,
    relation
  )
  on conflict (user_id) do update
    set full_name = excluded.full_name, age_years = excluded.age_years, sex = excluded.sex, phone = excluded.phone,
        city = excluded.city, preferred_language = excluded.preferred_language, email = coalesce(excluded.email, public.rehab_patients.email),
        guardian_name = excluded.guardian_name, guardian_relation = excluded.guardian_relation
  returning id, reference_code, preferred_language, status, (xmax = 0) into rec_id, rec_code, rec_lang, rec_status, is_new;
  if is_new then
    perform public.rehab__audit('patient.registration_requested', 'patient', rec_id, rec_id, jsonb_build_object('reference_code', rec_code, 'guardian', guardian is not null));
    perform public.rehab__notify_admin('registration', 'info', 'New account request: ' || person || case when guardian is not null then ' (under 18, guardian: ' || guardian || ')' else '' end,
      'Waiting for your approval in Account requests.', rec_id, jsonb_build_object('reference_code', rec_code), '/admin/rehabverse');
  end if;
  return jsonb_build_object('id', rec_id, 'reference_code', rec_code, 'preferred_language', rec_lang, 'status', rec_status);
end $$;

-- The waiting requests now also show the parent or guardian of a child.
create or replace function public.rehab_admin_registrations()
returns jsonb language plpgsql stable security definer set search_path = public, pg_temp as $$
begin
  perform public.rehab__require_admin();
  return jsonb_build_object(
    'pending', coalesce((select jsonb_agg(jsonb_build_object('id', p.id, 'reference_code', p.reference_code, 'full_name', p.full_name,
        'email', p.email, 'phone', p.phone, 'city', p.city, 'age_years', p.age_years, 'sex', p.sex,
        'guardian_name', p.guardian_name, 'guardian_relation', p.guardian_relation,
        'preferred_language', p.preferred_language, 'created_at', p.created_at) order by p.created_at)
        from public.rehab_patients p where p.status = 'pending'), '[]'::jsonb),
    'recent', coalesce((select jsonb_agg(x order by (x ->> 'decided_at') desc) from (
        select jsonb_build_object('id', p.id, 'reference_code', p.reference_code, 'full_name', p.full_name, 'phone', p.phone,
               'preferred_language', p.preferred_language, 'status', p.status, 'decided_at', p.decided_at, 'decision_note', p.decision_note) x
        from public.rehab_patients p where p.decided_at is not null order by p.decided_at desc limit 8) t), '[]'::jsonb)
  );
end $$;
