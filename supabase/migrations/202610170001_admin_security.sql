-- Admin-role bootstrap and least-privilege profile writes.

alter table public.profiles
  add column if not exists is_superadmin boolean not null default false;

comment on column public.profiles.is_superadmin is
  'Server-managed authorization flag for the separate admin application.';

-- The original table-level grants allowed a signed-in user to update every
-- profile column. Replace them with column grants so is_superadmin cannot be
-- changed through the public client, even on the user''s own row.
revoke insert, update on public.profiles from authenticated;
grant insert (id, first_name, last_name, avatar_url) on public.profiles to authenticated;
grant update (first_name, last_name, avatar_url) on public.profiles to authenticated;

-- Bootstrap the first administrator through database-owner access. If the
-- account has not signed in yet, this is a safe no-op and can be rerun later.
insert into public.profiles (id, is_superadmin)
select id, true
from auth.users
where lower(email) = 'aai2139@columbia.edu'
on conflict (id) do update set is_superadmin = excluded.is_superadmin;

create index if not exists profiles_superadmin_idx
  on public.profiles (id)
  where is_superadmin = true;

-- Permit the new attributed photo provider while retaining existing covers.
alter table public.sidequests
  drop constraint if exists sidequests_cover_image_source_check;

alter table public.sidequests
  add constraint sidequests_cover_image_source_check
    check (cover_image_source is null or cover_image_source in ('local', 'wikimedia', 'pexels'));

create index if not exists sidequests_status_created_idx
  on public.sidequests (status, created_at desc);

create index if not exists votes_created_at_idx
  on public.votes (created_at desc);
