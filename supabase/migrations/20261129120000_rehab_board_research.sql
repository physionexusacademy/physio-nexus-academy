-- RehabVerse therapist board and research record (29 Nov 2026).
--
-- * rehab_admin_board(): one row per active patient with what the physiotherapist needs to see at a glance (the assessment, the programme, how many days were
--   done, what is waiting for review, the last activity, open safety events, the outcome measures and their answers). The traffic lights are worked out
--   from these rows by fixed rules in the app (src/lib/board), so they can be tested and explained.
-- * Research consent: a patient is part of the research record only when the physiotherapist has recorded that research consent was obtained
--   (rehab_patients.research_consent). Registration consent is for the service and is NOT research consent.
-- * rehab_admin_research_export(table): de-identified rows (study id instead of name, age band, month instead of date, no free text, no contact details) for the
--   patients who consented. Every export is written to the audit log.

alter table public.rehab_patients add column if not exists research_consent boolean not null default false;
alter table public.rehab_patients add column if not exists research_consent_at timestamptz;
alter table public.rehab_patients add column if not exists research_consent_note text check (research_consent_note is null or char_length(research_consent_note) <= 300);

-- Only the physiotherapist records it (consent is taken in person or on paper; the note says how). Every change is in the audit log.
create or replace function public.rehab_admin_set_research_consent(p_patient_id uuid, p_consent boolean, p_note text default null)
returns jsonb language plpgsql security definer set search_path = public, pg_temp as $$
begin
  perform public.rehab__require_admin();
  if p_consent and char_length(btrim(coalesce(p_note, ''))) < 5 then
    raise exception 'rehab: say how research consent was obtained (a few words)' using errcode = '22023';
  end if;
  update public.rehab_patients
     set research_consent = p_consent, research_consent_at = case when p_consent then now() else null end,
         research_consent_note = case when p_consent then left(btrim(p_note), 300) else research_consent_note end
   where id = p_patient_id and status = 'active';
  if not found then raise exception 'rehab: patient not found' using errcode = 'P0002'; end if;
  perform public.rehab__audit(case when p_consent then 'research.consent_recorded' else 'research.consent_withdrawn' end, 'patient', p_patient_id, p_patient_id,
    jsonb_build_object('note', left(coalesce(p_note, ''), 300)));
  return jsonb_build_object('research_consent', p_consent);
end $$;

create or replace function public.rehab_admin_board()
returns jsonb language plpgsql stable security definer set search_path = public, pg_temp as $$
begin
  perform public.rehab__require_admin();
  return coalesce((select jsonb_agg(to_jsonb(t) order by t.created_at desc) from (
    select p.id, p.reference_code, p.full_name, p.age_years, p.sex, p.city, p.created_at, p.research_consent, p.ai_assist,
           a.id as assessment_id, a.status as assessment_status, a.red_flag_level, a.regions, a.pain_now as baseline_pain, a.submitted_at as assessment_submitted_at, a.reviewed_at as assessment_reviewed_at,
           pr.id as programme_id, pr.status as programme_status, pr.pause_reason, pr.approved_at as programme_approved_at,
           (select count(*)::int from public.rehab_sessions s where s.programme_id = pr.id and s.status <> 'cancelled') as days_total,
           (select count(*)::int from public.rehab_sessions s where s.programme_id = pr.id and s.status not in ('cancelled', 'locked')) as days_released,
           (select count(*)::int from public.rehab_feedback f join public.rehab_sessions s on s.id = f.session_id where s.programme_id = pr.id and f.completion <> 'none') as days_done,
           (select count(*)::int from public.rehab_sessions s where s.programme_id = pr.id and s.status = 'awaiting_review') as days_awaiting_review,
           (select min(f.submitted_at) from public.rehab_feedback f join public.rehab_sessions s on s.id = f.session_id where s.programme_id = pr.id and s.status = 'awaiting_review') as awaiting_since,
           (select max(f.submitted_at) from public.rehab_feedback f where f.patient_id = p.id) as last_feedback_at,
           (select f.pain_after from public.rehab_feedback f where f.patient_id = p.id order by f.submitted_at desc limit 1) as last_pain_after,
           (select count(*)::int from public.rehab_adverse_events e where e.patient_id = p.id and e.status = 'open') as open_adverse_events,
           (select jsonb_build_object('items', op.items, 'anchor_at', op.anchor_at) from public.rehab_outcome_plans op where op.patient_id = p.id order by op.created_at desc limit 1) as outcome_plan,
           coalesce((select jsonb_agg(jsonb_build_object('instrument', r.instrument, 'timepoint', r.timepoint, 'primary', r.score -> 'primary', 'collected_by', r.collected_by) order by r.taken_at)
                     from public.rehab_outcome_responses r where r.patient_id = p.id), '[]'::jsonb) as outcome_responses
      from public.rehab_patients p
      left join lateral (select * from public.rehab_assessments x where x.patient_id = p.id order by x.submitted_at desc limit 1) a on true
      left join lateral (select * from public.rehab_programmes y where y.patient_id = p.id and y.status <> 'draft'
                          order by case y.status when 'active' then 0 when 'paused' then 1 else 2 end, y.created_at desc limit 1) pr on true
     where p.status = 'active') t), '[]'::jsonb);
end $$;

create or replace function public.rehab__age_band(a int) returns text language sql immutable set search_path = public, pg_temp as $$
  select case when a is null then null when a >= 70 then '70+' else (a / 10 * 10)::text || '-' || (a / 10 * 10 + 9)::text end
$$;
revoke all on function public.rehab__age_band(int) from public, anon, authenticated;

-- De-identified rows for the patients who consented to research. `p_table` is one of participants, screening, outcomes, daily_feedback, adverse_events.
create or replace function public.rehab_admin_research_export(p_table text)
returns jsonb language plpgsql security definer set search_path = public, pg_temp as $$
declare out jsonb;
begin
  perform public.rehab__require_admin();
  if p_table = 'participants' then
    select coalesce(jsonb_agg(jsonb_build_object(
        'study_id', p.reference_code, 'age_band', public.rehab__age_band(p.age_years), 'sex', p.sex, 'enrolled_month', to_char(p.created_at, 'YYYY-MM'),
        'areas', (select array_to_string(a.regions, '|') from public.rehab_assessments a where a.patient_id = p.id order by a.submitted_at desc limit 1),
        'red_flag_level', (select a.red_flag_level from public.rehab_assessments a where a.patient_id = p.id order by a.submitted_at desc limit 1),
        'baseline_pain_now', (select a.pain_now from public.rehab_assessments a where a.patient_id = p.id order by a.submitted_at desc limit 1),
        'duration_band', (select a.duration from public.rehab_assessments a where a.patient_id = p.id order by a.submitted_at desc limit 1),
        'programme_status', (select pr.status from public.rehab_programmes pr where pr.patient_id = p.id and pr.status <> 'draft' order by pr.created_at desc limit 1),
        'days_planned', (select count(*)::int from public.rehab_sessions s join public.rehab_programmes pr on pr.id = s.programme_id where pr.patient_id = p.id and s.status <> 'cancelled'),
        'days_done', (select count(*)::int from public.rehab_feedback f where f.patient_id = p.id and f.completion <> 'none'),
        'ai_assist', p.ai_assist) order by p.reference_code), '[]'::jsonb)
      into out from public.rehab_patients p where p.status = 'active' and p.research_consent;
  elsif p_table = 'screening' then
    select coalesce(jsonb_agg(jsonb_build_object(
        'study_id', p.reference_code, 'engine_version', k.engine_version, 'source', k.source, 'region', k.region, 'language', k.language,
        'answers', (select string_agg(x, '|' order by x) from jsonb_array_elements_text(k.answers) x),
        'pattern_1', k.top_patterns -> 0 ->> 'id', 'pattern_1_score', (k.top_patterns -> 0 ->> 'score')::int,
        'pattern_2', k.top_patterns -> 1 ->> 'id', 'pattern_2_score', (k.top_patterns -> 1 ->> 'score')::int,
        'pattern_3', k.top_patterns -> 2 ->> 'id', 'pattern_3_score', (k.top_patterns -> 2 ->> 'score')::int,
        'priority', k.priority, 'fracture_screen', k.fracture_screen, 'study_arm', k.arm, 'shown_to_patient', k.shown_to_patient_at is not null,
        'shown_month', to_char(k.shown_to_patient_at, 'YYYY-MM')) order by p.reference_code, k.created_at), '[]'::jsonb)
      into out from public.rehab_checker_snapshots k join public.rehab_patients p on p.id = k.patient_id where p.research_consent and p.status = 'active';
  elsif p_table = 'outcomes' then
    select coalesce(jsonb_agg(jsonb_build_object(
        'study_id', p.reference_code, 'instrument', r.instrument, 'instrument_version', r.instrument_version, 'timepoint', r.timepoint,
        'score_primary', r.score -> 'primary', 'score_parts', r.score -> 'parts', 'band', r.score ->> 'band', 'language_shown', r.language, 'collected_by', r.collected_by,
        'days_from_plan_start', greatest(0, floor(extract(epoch from (r.taken_at - (select op.anchor_at from public.rehab_outcome_plans op where op.id = r.plan_id))) / 86400))::int)
        order by p.reference_code, r.taken_at), '[]'::jsonb)
      into out from public.rehab_outcome_responses r join public.rehab_patients p on p.id = r.patient_id where p.research_consent and p.status = 'active';
  elsif p_table = 'daily_feedback' then
    select coalesce(jsonb_agg(jsonb_build_object(
        'study_id', p.reference_code, 'day_number', s.day_number, 'completion', f.completion, 'pain_before', f.pain_before, 'pain_during', f.pain_during,
        'pain_after', f.pain_after, 'difficulty', f.difficulty, 'unusual_symptoms', f.unusual_symptoms, 'safety_flags', cardinality(f.safety_flag_ids))
        order by p.reference_code, s.day_number), '[]'::jsonb)
      into out from public.rehab_feedback f join public.rehab_sessions s on s.id = f.session_id join public.rehab_patients p on p.id = f.patient_id
     where p.research_consent and p.status = 'active';
  elsif p_table = 'adverse_events' then
    select coalesce(jsonb_agg(jsonb_build_object(
        'study_id', p.reference_code, 'severity', e.severity, 'source', e.source, 'status', e.status, 'flag_count', cardinality(e.flag_ids), 'month', to_char(e.created_at, 'YYYY-MM'))
        order by p.reference_code, e.created_at), '[]'::jsonb)
      into out from public.rehab_adverse_events e join public.rehab_patients p on p.id = e.patient_id where p.research_consent and p.status = 'active';
  else
    raise exception 'rehab: unknown export table' using errcode = '22023';
  end if;
  perform public.rehab__audit('research.export', 'research_export', null, null, jsonb_build_object('table', p_table, 'rows', jsonb_array_length(out)));
  return jsonb_build_object('table', p_table, 'rows', out);
end $$;

do $$
begin
  revoke all on function public.rehab_admin_board() from public, anon;
  grant execute on function public.rehab_admin_board() to authenticated;
  revoke all on function public.rehab_admin_set_research_consent(uuid, boolean, text) from public, anon;
  grant execute on function public.rehab_admin_set_research_consent(uuid, boolean, text) to authenticated;
  revoke all on function public.rehab_admin_research_export(text) from public, anon;
  grant execute on function public.rehab_admin_research_export(text) to authenticated;
end $$;
