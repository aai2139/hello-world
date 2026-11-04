-- Prompt Chain Studio: executable chain metadata, run history, and private media.

alter table public.prompt_chains
  add column if not exists created_by uuid references auth.users(id) on delete set null,
  add column if not exists input_type text not null default 'text'
    check (input_type in ('text', 'image', 'text_and_image'));

alter table public.prompt_chain_steps
  add column if not exists output_type text not null default 'text'
    check (output_type in ('text', 'image')),
  add column if not exists model_name text;

create table if not exists public.prompt_chain_runs (
  id uuid primary key default gen_random_uuid(),
  chain_id uuid references public.prompt_chains(id) on delete set null,
  chain_name text not null,
  started_by uuid references auth.users(id) on delete set null,
  status text not null default 'running'
    check (status in ('running', 'succeeded', 'failed')),
  input_text text,
  input_media_path text,
  final_output_text text,
  final_output_media_path text,
  error_message text,
  started_at timestamptz not null default now(),
  completed_at timestamptz
);

create index if not exists prompt_chain_runs_chain_started_idx
  on public.prompt_chain_runs (chain_id, started_at desc);

create table if not exists public.prompt_chain_run_steps (
  id uuid primary key default gen_random_uuid(),
  run_id uuid not null references public.prompt_chain_runs(id) on delete cascade,
  step_id uuid references public.prompt_chain_steps(id) on delete set null,
  step_order integer not null check (step_order > 0),
  step_name text not null,
  output_type text not null check (output_type in ('text', 'image')),
  model_name text not null,
  input_text text,
  input_media_path text,
  output_text text,
  output_media_path text,
  latency_ms integer check (latency_ms is null or latency_ms >= 0),
  created_at timestamptz not null default now(),
  unique (run_id, step_order)
);

create index if not exists prompt_chain_run_steps_run_idx
  on public.prompt_chain_run_steps (run_id, step_order);

alter table public.prompt_chain_runs enable row level security;
alter table public.prompt_chain_runs force row level security;
alter table public.prompt_chain_run_steps enable row level security;
alter table public.prompt_chain_run_steps force row level security;
revoke all on public.prompt_chain_runs, public.prompt_chain_run_steps from anon, authenticated;
grant all on public.prompt_chain_runs, public.prompt_chain_run_steps to service_role;

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'prompt-chain-media',
  'prompt-chain-media',
  false,
  10485760,
  array['image/jpeg', 'image/png', 'image/webp', 'image/gif']
)
on conflict (id) do update set
  public = excluded.public,
  file_size_limit = excluded.file_size_limit,
  allowed_mime_types = excluded.allowed_mime_types;

create or replace function public.reorder_prompt_chain_steps(
  target_chain_id uuid,
  ordered_step_ids uuid[]
) returns void
language plpgsql
security invoker
set search_path = public
as $$
declare
  existing_count integer;
  requested_count integer;
begin
  select count(*) into existing_count
  from public.prompt_chain_steps
  where chain_id = target_chain_id;

  select count(distinct step_id) into requested_count
  from unnest(ordered_step_ids) as ordered(step_id);

  if existing_count <> coalesce(array_length(ordered_step_ids, 1), 0)
     or existing_count <> requested_count
     or exists (
       select 1 from unnest(ordered_step_ids) as ordered(step_id)
       where not exists (
         select 1 from public.prompt_chain_steps
         where id = step_id and chain_id = target_chain_id
       )
     ) then
    raise exception 'The ordered step list must contain every chain step exactly once.';
  end if;

  update public.prompt_chain_steps
  set step_order = step_order + 1000000
  where chain_id = target_chain_id;

  update public.prompt_chain_steps as steps
  set step_order = ordered.position,
      updated_at = now()
  from unnest(ordered_step_ids) with ordinality as ordered(step_id, position)
  where steps.id = ordered.step_id and steps.chain_id = target_chain_id;
end;
$$;

revoke all on function public.reorder_prompt_chain_steps(uuid, uuid[]) from public, anon, authenticated;
grant execute on function public.reorder_prompt_chain_steps(uuid, uuid[]) to service_role;
