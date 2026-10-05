-- NYC Sidequests schema, voting aggregates, quota enforcement, and RLS.

create extension if not exists pgcrypto;

create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  first_name text,
  last_name text,
  avatar_url text
);

create table if not exists public.sidequests (
  id uuid primary key default gen_random_uuid(),
  creator_id uuid not null references auth.users(id) on delete cascade,
  neighborhood text not null check (char_length(neighborhood) between 2 and 60),
  budget text not null check (budget in ('under-25', '25-50', '50-plus')),
  vibe text not null check (vibe in ('food', 'culture', 'outdoors', 'night-owl', 'surprise')),
  title text not null check (char_length(title) between 3 and 100),
  hook text not null check (char_length(hook) between 3 and 240),
  stops jsonb not null check (jsonb_typeof(stops) = 'array' and jsonb_array_length(stops) = 3),
  budget_note text not null check (char_length(budget_note) between 3 and 240),
  prompt_text text not null,
  model_name text not null,
  status text not null default 'published' check (status in ('published', 'hidden')),
  worth_it_count integer not null default 0 check (worth_it_count >= 0),
  skip_it_count integer not null default 0 check (skip_it_count >= 0),
  created_at timestamptz not null default now()
);

create table if not exists public.votes (
  sidequest_id uuid not null references public.sidequests(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  value smallint not null check (value in (-1, 1)),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  primary key (sidequest_id, user_id)
);

create table if not exists public.generation_attempts (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  succeeded boolean not null default false,
  created_at timestamptz not null default now()
);

create index if not exists sidequests_created_at_idx on public.sidequests (created_at desc);
create index if not exists sidequests_creator_created_idx on public.sidequests (creator_id, created_at desc);
create index if not exists sidequests_weekly_rank_idx on public.sidequests (status, created_at desc, worth_it_count desc, skip_it_count asc);
create index if not exists generation_attempts_user_created_idx on public.generation_attempts (user_id, created_at desc);

create or replace function public.claim_generation_slot(request_user_id uuid)
returns uuid
language plpgsql
security definer
set search_path = public
as $$
declare
  attempt_id uuid;
begin
  if request_user_id is null then
    return null;
  end if;

  perform pg_advisory_xact_lock(hashtextextended(request_user_id::text, 0));

  if (
    select count(*)
    from public.generation_attempts
    where user_id = request_user_id
      and created_at >= now() - interval '1 hour'
  ) >= 5 then
    return null;
  end if;

  insert into public.generation_attempts (user_id)
  values (request_user_id)
  returning id into attempt_id;

  return attempt_id;
end;
$$;

revoke all on function public.claim_generation_slot(uuid) from public, anon, authenticated;
grant execute on function public.claim_generation_slot(uuid) to service_role;

create or replace function public.sync_sidequest_vote_counts()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if tg_op = 'INSERT' then
    update public.sidequests
    set worth_it_count = worth_it_count + case when new.value = 1 then 1 else 0 end,
        skip_it_count = skip_it_count + case when new.value = -1 then 1 else 0 end
    where id = new.sidequest_id;
    return new;
  elsif tg_op = 'UPDATE' and old.value is distinct from new.value then
    update public.sidequests
    set worth_it_count = greatest(0, worth_it_count - case when old.value = 1 then 1 else 0 end + case when new.value = 1 then 1 else 0 end),
        skip_it_count = greatest(0, skip_it_count - case when old.value = -1 then 1 else 0 end + case when new.value = -1 then 1 else 0 end)
    where id = new.sidequest_id;
    new.updated_at = now();
    return new;
  elsif tg_op = 'DELETE' then
    update public.sidequests
    set worth_it_count = greatest(0, worth_it_count - case when old.value = 1 then 1 else 0 end),
        skip_it_count = greatest(0, skip_it_count - case when old.value = -1 then 1 else 0 end)
    where id = old.sidequest_id;
    return old;
  end if;

  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists votes_sync_sidequest_counts on public.votes;
create trigger votes_sync_sidequest_counts
after insert or update or delete on public.votes
for each row execute function public.sync_sidequest_vote_counts();

revoke all on function public.sync_sidequest_vote_counts() from public, anon, authenticated;

alter table public.profiles enable row level security;
alter table public.profiles force row level security;
alter table public.sidequests enable row level security;
alter table public.sidequests force row level security;
alter table public.votes enable row level security;
alter table public.votes force row level security;
alter table public.generation_attempts enable row level security;
alter table public.generation_attempts force row level security;

-- Remove older permissive policies before installing the least-privilege set.
do $$
declare
  policy_record record;
begin
  for policy_record in
    select schemaname, tablename, policyname
    from pg_policies
    where schemaname = 'public'
      and tablename in ('profiles', 'sidequests', 'votes', 'generation_attempts', 'tasks')
  loop
    execute format('drop policy if exists %I on %I.%I', policy_record.policyname, policy_record.schemaname, policy_record.tablename);
  end loop;
end;
$$;

create policy profiles_select_own on public.profiles for select to authenticated using (auth.uid() = id);
create policy profiles_insert_own on public.profiles for insert to authenticated with check (auth.uid() = id);
create policy profiles_update_own on public.profiles for update to authenticated using (auth.uid() = id) with check (auth.uid() = id);

create policy sidequests_select_own on public.sidequests for select to authenticated using (auth.uid() = creator_id);

create policy votes_select_own on public.votes for select to authenticated using (auth.uid() = user_id);
create policy votes_insert_own on public.votes for insert to authenticated with check (auth.uid() = user_id);
create policy votes_update_own on public.votes for update to authenticated using (auth.uid() = user_id) with check (auth.uid() = user_id);

revoke all on public.sidequests, public.votes, public.generation_attempts from anon;
revoke all on public.sidequests, public.votes, public.generation_attempts from authenticated;
grant select on public.sidequests to authenticated;
grant select, insert, update on public.votes to authenticated;
grant select, insert, update on public.profiles to authenticated;

-- The old tasks table is intentionally inaccessible after the product redesign.
do $$
declare
  policy_record record;
begin
  if to_regclass('public.tasks') is not null then
    execute 'alter table public.tasks enable row level security';
    execute 'alter table public.tasks force row level security';
    execute 'revoke all on public.tasks from anon, authenticated';
  end if;
end;
$$;

-- Keep avatar writes owner-scoped. Existing public avatar URLs remain readable.
drop policy if exists avatars_insert_own_folder on storage.objects;
drop policy if exists avatars_update_own_folder on storage.objects;
drop policy if exists avatars_delete_own_folder on storage.objects;
create policy avatars_insert_own_folder on storage.objects for insert to authenticated
with check (bucket_id = 'avatars' and (storage.foldername(name))[1] = auth.uid()::text);
create policy avatars_update_own_folder on storage.objects for update to authenticated
using (bucket_id = 'avatars' and owner_id = auth.uid()::text)
with check (bucket_id = 'avatars' and owner_id = auth.uid()::text);
create policy avatars_delete_own_folder on storage.objects for delete to authenticated
using (bucket_id = 'avatars' and owner_id = auth.uid()::text);
