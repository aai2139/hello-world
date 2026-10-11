-- Actionable destinations, unique attributed covers, and a resumable content upgrade marker.

alter table public.sidequests
  add column if not exists cover_image_url text,
  add column if not exists cover_image_alt text,
  add column if not exists cover_image_credit text,
  add column if not exists cover_image_credit_url text,
  add column if not exists cover_image_source text,
  add column if not exists cover_image_key text,
  add column if not exists content_version smallint not null default 1;

alter table public.sidequests
  drop constraint if exists sidequests_cover_image_source_check,
  drop constraint if exists sidequests_content_version_check;

alter table public.sidequests
  add constraint sidequests_cover_image_source_check
    check (cover_image_source is null or cover_image_source in ('local', 'wikimedia')),
  add constraint sidequests_content_version_check
    check (content_version >= 1);

create unique index if not exists sidequests_cover_image_key_unique
  on public.sidequests (cover_image_key)
  where cover_image_key is not null;

comment on column public.sidequests.content_version is
  'Version 2 stores actionable named destinations in stops and a unique attributed cover image.';
