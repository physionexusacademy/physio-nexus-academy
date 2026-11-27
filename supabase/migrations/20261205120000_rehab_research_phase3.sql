-- RehabVerse Research Room, phase 3: trial safety reporting, protocol deviations and the monitoring dashboard.
--
-- 1. Safety reports: every adverse event can carry the trial assessment an ethics committee asks for:
--    - whether it is serious (and by which criterion), how related it is to the intervention, whether it was expected, and its outcome;
--    - the date of onset and the date the team became aware;
--    - when it was reported to the ethics committee.
--    Each change is a new version, and nothing is edited. The report deadline is worked out here:
--    - 7 days from awareness for a fatal or life-threatening event that is unexpected and at least possibly related;
--    - 15 days for any other serious event.
--    A serious event that is at least possibly related raises a safety review alarm (the threshold is in the study rules, 'safety_review_after', default 1).
-- 2. Protocol deviations other than the AI override (already recorded in phase 1): wrong eligibility, an outcome outside its window, a missed or
--    extra contact, unblinding of the assessor, and other.
-- 3. Monitoring: CONSORT flow, recruitment against the target, follow-up completeness of the primary outcome by time point, baseline balance,
--    discontinuations, deviations and safety. Outcome scores are never shown by arm (that is for the final analysis), only whether they were collected.

-- ---------- 1. safety reports ----------
create table if not exists public.rehab_safety_reports (
  id uuid primary key default gen_random_uuid(),
  adverse_event_id uuid not null references public.rehab_adverse_events (id) on delete restrict,
  patient_id uuid not null references public.rehab_patients (id) on delete restrict,
  version int not null check (version >= 1),
  serious boolean not null,
  criteria text[] not null default '{}' check (criteria <@ array['death', 'life_threatening', 'hospitalisation', 'disability', 'other_important']::text[]),
  relatedness text not null check (relatedness in ('unrelated', 'unlikely', 'possible', 'probable', 'definite')),
  expectedness text not null check (expectedness in ('expected', 'unexpected')),
  outcome text not null check (outcome in ('recovering', 'recovered', 'recovered_with_sequelae', 'not_recovered', 'fatal', 'unknown')),
  onset_date date not null,
  aware_at timestamptz not null,
  report_due_at timestamptz,
  ethics_reported_at timestamptz,
  ethics_ref text check (char_length(ethics_ref) <= 120),
  note text check (char_length(note) <= 2000),
  recorded_by uuid not null references auth.users (id) on delete restrict,
  created_at timestamptz not null default now(),
  unique (adverse_event_id, version),
  check (serious = (cardinality(criteria) > 0)),
  check (outcome <> 'fatal' or 'death' = any (criteria)),
  check (onset_date <= (aware_at at time zone 'Asia/Karachi')::date)
);
create index if not exists rehab_safety_reports_event_idx on public.rehab_safety_reports (adverse_event_id, version desc);
alter table public.rehab_safety_reports enable row level security;
revoke all on public.rehab_safety_reports from anon, authenticated;

-- ---------- 2. protocol deviations ----------
create table if not exists public.rehab_study_protocol_deviations (
  id uuid primary key default gen_random_uuid(),
  study_id uuid not null references public.rehab_studies (id) on delete restrict,
  patient_id uuid not null references public.rehab_patients (id) on delete restrict,
  kind text not null check (kind in ('eligibility', 'outcome_window', 'missed_contact', 'extra_contact', 'assessor_unblinded', 'other')),
  description text not null check (char_length(btrim(description)) between 10 and 1000),
  occurred_on date not null,
  recorded_by uuid not null references auth.users (id) on delete restrict,
  recorded_at timestamptz not null default now()
);
alter table public.rehab_study_protocol_deviations enable row level security;
revoke all on public.rehab_study_protocol_deviations from anon, authenticated;

do $$
declare t text;
begin
  foreach t in array array['rehab_safety_reports', 'rehab_study_protocol_deviations'] loop
    execute format('drop trigger if exists %I_append_only on public.%I', t, t);
    execute format('create trigger %I_append_only before update or delete on public.%I for each row execute function public.rehab_study_append_only()', t, t);
  end loop;
end $$;

-- the deadline for reporting a serious event to the ethics committee (null when the event is not serious)
create or replace function public.rehab__safety_due(p_serious boolean, p_criteria text[], p_relatedness text, p_expectedness text, p_aware_at timestamptz)
returns timestamptz language sql immutable as $$
  select case
    when not p_serious then null
    when (p_criteria && array['death', 'life_threatening']) and p_expectedness = 'unexpected' and p_relatedness in ('possible', 'probable', 'definite')
      then p_aware_at + interval '7 days'
    else p_aware_at + interval '15 days' end
$$;

create or replace function public.rehab_admin_safety_report(p_adverse_event_id uuid, p_payload jsonb)
returns jsonb language plpgsql security definer set search_path = public, pg_temp as $$
declare uid uuid := public.rehab__require_admin(); ev public.rehab_adverse_events%rowtype; crit text[]; serious boolean; rel text; exp text; outc text;
  onset date; aware timestamptz; reported timestamptz; next_version int; due timestamptz; new_id uuid; prev public.rehab_safety_reports%rowtype;
begin
  select * into ev from public.rehab_adverse_events where id = p_adverse_event_id;
  if not found then raise exception 'rehab: adverse event not found' using errcode = 'P0002'; end if;
  if jsonb_typeof(p_payload) is distinct from 'object' then raise exception 'rehab: the report is incomplete' using errcode = '22023'; end if;
  crit := public.rehab__list(p_payload, 'criteria', array['death', 'life_threatening', 'hospitalisation', 'disability', 'other_important'], 0, 5);
  serious := cardinality(crit) > 0;
  rel := p_payload ->> 'relatedness';
  exp := p_payload ->> 'expectedness';
  outc := p_payload ->> 'outcome';
  if rel is null or rel not in ('unrelated', 'unlikely', 'possible', 'probable', 'definite') then raise exception 'rehab: say how related the event is to the intervention' using errcode = '22023'; end if;
  if exp is null or exp not in ('expected', 'unexpected') then raise exception 'rehab: say whether the event was expected' using errcode = '22023'; end if;
  if outc is null or outc not in ('recovering', 'recovered', 'recovered_with_sequelae', 'not_recovered', 'fatal', 'unknown') then raise exception 'rehab: give the outcome of the event' using errcode = '22023'; end if;
  if outc = 'fatal' and not ('death' = any (crit)) then raise exception 'rehab: a fatal outcome must be marked serious (death)' using errcode = '22023'; end if;
  if coalesce(p_payload ->> 'onset_date', '') !~ '^\d{4}-\d{2}-\d{2}$' then raise exception 'rehab: give the date the event began' using errcode = '22023'; end if;
  onset := (p_payload ->> 'onset_date')::date;
  if coalesce(p_payload ->> 'aware_at', '') = '' then raise exception 'rehab: give when the team became aware' using errcode = '22023'; end if;
  aware := (p_payload ->> 'aware_at')::timestamptz;
  if aware > now() + interval '5 minutes' then raise exception 'rehab: the awareness time is in the future' using errcode = '22023'; end if;
  if onset > (aware at time zone 'Asia/Karachi')::date then raise exception 'rehab: the event cannot begin after the team became aware of it' using errcode = '22023'; end if;
  reported := nullif(p_payload ->> 'ethics_reported_at', '')::timestamptz;
  if reported is not null and reported > now() + interval '5 minutes' then raise exception 'rehab: the report time is in the future' using errcode = '22023'; end if;

  select * into prev from public.rehab_safety_reports where adverse_event_id = ev.id order by version desc limit 1;
  next_version := coalesce(prev.version, 0) + 1;
  -- awareness cannot move later in a follow-up report: the clock starts when the team first knew
  if found and aware > prev.aware_at then aware := prev.aware_at; end if;
  due := public.rehab__safety_due(serious, crit, rel, exp, aware);
  insert into public.rehab_safety_reports (adverse_event_id, patient_id, version, serious, criteria, relatedness, expectedness, outcome, onset_date, aware_at,
                                           report_due_at, ethics_reported_at, ethics_ref, note, recorded_by)
  values (ev.id, ev.patient_id, next_version, serious, crit, rel, exp, outc, onset, aware, due, reported,
          nullif(left(btrim(coalesce(p_payload ->> 'ethics_ref', '')), 120), ''), nullif(left(btrim(coalesce(p_payload ->> 'note', '')), 2000), ''), uid)
  returning id into new_id;
  perform public.rehab__audit('safety.reported', 'rehab_safety_reports', new_id, ev.patient_id,
    jsonb_build_object('version', next_version, 'serious', serious, 'relatedness', rel, 'expectedness', exp, 'outcome', outc));
  if serious and rel in ('possible', 'probable', 'definite') and next_version = 1 then
    perform public.rehab__notify_admin('safety_review', 'urgent', 'Serious adverse event, possibly related',
      'A serious adverse event that may be related to the intervention was recorded. Report it to the ethics committee by the deadline and review the study safety.',
      ev.patient_id, jsonb_build_object('due', due), '/admin/rehabverse/research-room');
  end if;
  return jsonb_build_object('id', new_id, 'version', next_version, 'serious', serious, 'report_due_at', due);
end $$;

create or replace function public.rehab_admin_safety_reports(p_patient_id uuid)
returns jsonb language plpgsql stable security definer set search_path = public, pg_temp as $$
begin
  perform public.rehab__require_admin();
  return coalesce((select jsonb_agg(to_jsonb(r) - 'recorded_by' order by r.adverse_event_id, r.version) from public.rehab_safety_reports r where r.patient_id = p_patient_id), '[]'::jsonb);
end $$;

create or replace function public.rehab_admin_study_log_deviation(p_patient_id uuid, p_kind text, p_description text, p_occurred_on date)
returns jsonb language plpgsql security definer set search_path = public, pg_temp as $$
declare uid uuid := public.rehab__require_admin(); a public.rehab_study_allocations%rowtype; new_id uuid;
begin
  select * into a from public.rehab_study_allocations where patient_id = p_patient_id;
  if not found then raise exception 'rehab: not a study participant' using errcode = 'P0002'; end if;
  if p_kind is null or p_kind not in ('eligibility', 'outcome_window', 'missed_contact', 'extra_contact', 'assessor_unblinded', 'other') then
    raise exception 'rehab: unknown kind of deviation' using errcode = '22023';
  end if;
  if char_length(btrim(coalesce(p_description, ''))) < 10 then raise exception 'rehab: describe the deviation (at least 10 characters)' using errcode = '22023'; end if;
  if p_occurred_on is null or p_occurred_on > current_date or p_occurred_on < (a.allocated_at at time zone 'Asia/Karachi')::date - 1 then
    raise exception 'rehab: the date must be between enrolment and today' using errcode = '22023';
  end if;
  insert into public.rehab_study_protocol_deviations (study_id, patient_id, kind, description, occurred_on, recorded_by)
  values (a.study_id, p_patient_id, p_kind, left(btrim(p_description), 1000), p_occurred_on, uid) returning id into new_id;
  perform public.rehab__audit('study.deviation', 'rehab_study_protocol_deviations', new_id, p_patient_id, jsonb_build_object('kind', p_kind));
  return jsonb_build_object('id', new_id);
end $$;

-- ---------- 3. monitoring ----------
create or replace function public.rehab_admin_study_monitor()
returns jsonb language plpgsql stable security definer set search_path = public, pg_temp as $$
declare st public.rehab_studies%rowtype; prim text; prim_tp text; tps jsonb := '{"baseline":0,"w1":7,"w2":14,"w4":28,"w6":42,"w12":84}'::jsonb; threshold int;
begin
  perform public.rehab__require_admin();
  select * into st from public.rehab_studies order by case status when 'recruiting' then 0 when 'draft' then 1 else 2 end, created_at desc limit 1;
  if not found then return jsonb_build_object('study', null); end if;
  prim := coalesce(st.config -> 'primary' ->> 'instrument', 'rmdq24');
  prim_tp := coalesce(st.config -> 'primary' ->> 'timepoint', 'w12');
  threshold := greatest(1, coalesce((st.config ->> 'safety_review_after')::int, 1));
  return (
    with alloc as (
      select a.patient_id, a.arm, a.stratum, a.allocated_at, s.baseline_nprs, p.age_years, p.sex
        from public.rehab_study_allocations a
        join public.rehab_study_screening s on s.id = a.screening_id
        join public.rehab_patients p on p.id = a.patient_id
       where a.study_id = st.id),
    latest_sr as (
      select distinct on (r.adverse_event_id) r.* from public.rehab_safety_reports r join alloc on alloc.patient_id = r.patient_id
       order by r.adverse_event_id, r.version desc),
    tp_list as (select key as tp, (value #>> '{}')::int as days from jsonb_each(tps) where key in ('baseline', 'w2', 'w6', 'w12') or key = prim_tp)
    select jsonb_build_object(
      'study', jsonb_build_object('code', st.code, 'status', st.status, 'primary', prim, 'primary_timepoint', prim_tp, 'target_per_arm', coalesce((st.config ->> 'target_per_arm')::int, 0)),
      'recruitment', jsonb_build_object(
        'allocated', (select count(*) from alloc),
        'by_arm', jsonb_build_object('ai', (select count(*) from alloc where arm = 'ai'), 'no_ai', (select count(*) from alloc where arm = 'no_ai')),
        'first_at', (select min(allocated_at) from alloc), 'last_at', (select max(allocated_at) from alloc),
        'by_month', coalesce((select jsonb_agg(jsonb_build_object('month', m, 'n', n) order by m)
                              from (select to_char(allocated_at at time zone 'Asia/Karachi', 'YYYY-MM') as m, count(*) as n from alloc group by 1) x), '[]'::jsonb)),
      -- follow-up completeness of the primary outcome: due (its window has opened) and collected, by arm; never the scores
      'followup', coalesce((select jsonb_agg(jsonb_build_object('timepoint', t.tp,
          'ai_due', (select count(*) from alloc where arm = 'ai' and allocated_at + make_interval(days => t.days) <= now()),
          'ai_done', (select count(*) from alloc join public.rehab_outcome_responses r on r.patient_id = alloc.patient_id and r.instrument = prim and r.timepoint = t.tp where arm = 'ai'),
          'no_ai_due', (select count(*) from alloc where arm = 'no_ai' and allocated_at + make_interval(days => t.days) <= now()),
          'no_ai_done', (select count(*) from alloc join public.rehab_outcome_responses r on r.patient_id = alloc.patient_id and r.instrument = prim and r.timepoint = t.tp where arm = 'no_ai')
        ) order by t.days) from tp_list t), '[]'::jsonb),
      -- missing the primary outcome two weeks after its window opened
      'lost_primary', jsonb_build_object(
        'ai', (select count(*) from alloc where arm = 'ai' and allocated_at + make_interval(days => (tps ->> prim_tp)::int + 14) <= now()
                 and not exists (select 1 from public.rehab_outcome_responses r where r.patient_id = alloc.patient_id and r.instrument = prim and r.timepoint = prim_tp)),
        'no_ai', (select count(*) from alloc where arm = 'no_ai' and allocated_at + make_interval(days => (tps ->> prim_tp)::int + 14) <= now()
                 and not exists (select 1 from public.rehab_outcome_responses r where r.patient_id = alloc.patient_id and r.instrument = prim and r.timepoint = prim_tp))),
      'discontinued', jsonb_build_object(
        'ai', (select count(distinct alloc.patient_id) from alloc join public.rehab_programmes pr on pr.patient_id = alloc.patient_id where arm = 'ai' and pr.status = 'discontinued'),
        'no_ai', (select count(distinct alloc.patient_id) from alloc join public.rehab_programmes pr on pr.patient_id = alloc.patient_id where arm = 'no_ai' and pr.status = 'discontinued')),
      'balance', coalesce((select jsonb_agg(jsonb_build_object('arm', arm, 'n', n, 'age_mean', age_mean, 'age_sd', age_sd, 'nprs_mean', nprs_mean, 'nprs_sd', nprs_sd,
            'female', female, 'male', male, 'strata', strata) order by arm)
          from (select arm, count(*) as n, round(avg(age_years)::numeric, 1) as age_mean, round(stddev_samp(age_years)::numeric, 1) as age_sd,
                       round(avg(baseline_nprs)::numeric, 1) as nprs_mean, round(stddev_samp(baseline_nprs)::numeric, 1) as nprs_sd,
                       count(*) filter (where sex = 'female') as female, count(*) filter (where sex = 'male') as male,
                       (select jsonb_object_agg(stratum, k) from (select stratum, count(*) as k from alloc a2 where a2.arm = alloc.arm group by stratum) z) as strata
                  from alloc group by arm) b), '[]'::jsonb),
      'deviations', jsonb_build_object(
        'ai_override', (select count(*) from public.rehab_study_deviations where study_id = st.id),
        'other', coalesce((select jsonb_object_agg(kind, n) from (select kind, count(*) as n from public.rehab_study_protocol_deviations where study_id = st.id group by kind) d), '{}'::jsonb)),
      'safety', jsonb_build_object(
        'adverse_events', jsonb_build_object(
          'ai', (select count(*) from public.rehab_adverse_events e join alloc on alloc.patient_id = e.patient_id where arm = 'ai' and e.created_at >= alloc.allocated_at),
          'no_ai', (select count(*) from public.rehab_adverse_events e join alloc on alloc.patient_id = e.patient_id where arm = 'no_ai' and e.created_at >= alloc.allocated_at)),
        'serious', jsonb_build_object(
          'ai', (select count(*) from latest_sr r join alloc on alloc.patient_id = r.patient_id where arm = 'ai' and r.serious),
          'no_ai', (select count(*) from latest_sr r join alloc on alloc.patient_id = r.patient_id where arm = 'no_ai' and r.serious)),
        'serious_related', (select count(*) from latest_sr r where r.serious and r.relatedness in ('possible', 'probable', 'definite')),
        'not_assessed', (select count(*) from public.rehab_adverse_events e join alloc on alloc.patient_id = e.patient_id
                          where e.created_at >= alloc.allocated_at and not exists (select 1 from public.rehab_safety_reports r where r.adverse_event_id = e.id)),
        'overdue', (select count(*) from latest_sr r where r.report_due_at is not null and r.ethics_reported_at is null and r.report_due_at < now()),
        'due_soon', (select count(*) from latest_sr r where r.report_due_at is not null and r.ethics_reported_at is null and r.report_due_at >= now() and r.report_due_at < now() + interval '3 days'),
        'review_threshold', threshold,
        'review_needed', (select count(*) from latest_sr r where r.serious and r.relatedness in ('possible', 'probable', 'definite')) >= threshold)
    ));
end $$;

revoke all on function public.rehab__safety_due(boolean, text[], text, text, timestamptz) from public, anon, authenticated;
revoke all on function public.rehab_admin_safety_report(uuid, jsonb) from public, anon;
revoke all on function public.rehab_admin_safety_reports(uuid) from public, anon;
revoke all on function public.rehab_admin_study_log_deviation(uuid, text, text, date) from public, anon;
revoke all on function public.rehab_admin_study_monitor() from public, anon;
grant execute on function public.rehab_admin_safety_report(uuid, jsonb) to authenticated;
grant execute on function public.rehab_admin_safety_reports(uuid) to authenticated;
grant execute on function public.rehab_admin_study_log_deviation(uuid, text, text, date) to authenticated;
grant execute on function public.rehab_admin_study_monitor() to authenticated;
