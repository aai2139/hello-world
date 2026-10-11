-- All published content has been upgraded; new writes must include complete cover metadata.

alter table public.sidequests
  alter column cover_image_url set not null,
  alter column cover_image_alt set not null,
  alter column cover_image_credit set not null,
  alter column cover_image_credit_url set not null,
  alter column cover_image_source set not null,
  alter column cover_image_key set not null;
