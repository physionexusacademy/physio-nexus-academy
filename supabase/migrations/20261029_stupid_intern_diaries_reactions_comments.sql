create table if not exists public.stupid_intern_reactions (
  id uuid primary key default gen_random_uuid(),
  episode_id integer not null check (episode_id > 0),
  visitor_id uuid not null,
  reaction text not null check (reaction in ('laugh', 'cry', 'fire')),
  created_at timestamptz not null default now(),
  unique (episode_id, visitor_id)
);

create index if not exists stupid_intern_reactions_episode_idx
  on public.stupid_intern_reactions (episode_id);

alter table public.stupid_intern_reactions enable row level security;

grant select, insert, update on public.stupid_intern_reactions to anon, authenticated;

drop policy if exists "Public can read Stupid Intern reactions" on public.stupid_intern_reactions;
create policy "Public can read Stupid Intern reactions"
  on public.stupid_intern_reactions for select to anon, authenticated
  using (true);

drop policy if exists "Public can add Stupid Intern reactions" on public.stupid_intern_reactions;
create policy "Public can add Stupid Intern reactions"
  on public.stupid_intern_reactions for insert to anon, authenticated
  with check (episode_id > 0 and reaction in ('laugh', 'cry', 'fire'));

drop policy if exists "Public can change Stupid Intern reactions" on public.stupid_intern_reactions;
create policy "Public can change Stupid Intern reactions"
  on public.stupid_intern_reactions for update to anon, authenticated
  using (true)
  with check (episode_id > 0 and reaction in ('laugh', 'cry', 'fire'));

create table if not exists public.stupid_intern_comments (
  id uuid primary key default gen_random_uuid(),
  episode_id integer not null check (episode_id > 0),
  display_name text not null check (char_length(trim(display_name)) between 2 and 40),
  comment text not null check (char_length(trim(comment)) between 1 and 500),
  created_at timestamptz not null default now()
);

create index if not exists stupid_intern_comments_episode_created_idx
  on public.stupid_intern_comments (episode_id, created_at desc);

alter table public.stupid_intern_comments enable row level security;

grant select, insert on public.stupid_intern_comments to anon, authenticated;

drop policy if exists "Public can read Stupid Intern comments" on public.stupid_intern_comments;
create policy "Public can read Stupid Intern comments"
  on public.stupid_intern_comments for select to anon, authenticated
  using (true);

drop policy if exists "Public can post Stupid Intern comments" on public.stupid_intern_comments;
create policy "Public can post Stupid Intern comments"
  on public.stupid_intern_comments for insert to anon, authenticated
  with check (
    char_length(trim(display_name)) between 2 and 40
    and char_length(trim(comment)) between 1 and 500
  );
