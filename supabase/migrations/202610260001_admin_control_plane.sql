-- Administrative control plane for prompts, models, generation audit data,
-- and sign-up access rules. These tables are server-only: the public apps
-- reach them through authenticated server code using the service role.

create table if not exists public.llm_providers (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  name text not null,
  base_url text,
  credential_env_var text not null,
  is_enabled boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.llm_models (
  id uuid primary key default gen_random_uuid(),
  provider_id uuid not null references public.llm_providers(id) on delete cascade,
  model_id text not null unique,
  name text not null,
  description text,
  is_enabled boolean not null default true,
  is_default boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create unique index if not exists llm_models_one_default_idx
  on public.llm_models (is_default) where is_default = true;

create table if not exists public.prompt_chains (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  name text not null,
  description text,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.prompt_chain_steps (
  id uuid primary key default gen_random_uuid(),
  chain_id uuid not null references public.prompt_chains(id) on delete cascade,
  step_order integer not null check (step_order > 0),
  name text not null,
  template text not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (chain_id, step_order)
);

create table if not exists public.prompt_chain_mix (
  id uuid primary key default gen_random_uuid(),
  chain_id uuid not null unique references public.prompt_chains(id) on delete cascade,
  model_id uuid references public.llm_models(id) on delete set null,
  weight integer not null default 100 check (weight between 0 and 100),
  is_enabled boolean not null default true,
  updated_at timestamptz not null default now()
);

create table if not exists public.terms (
  id uuid primary key default gen_random_uuid(),
  phrase text not null unique,
  category text not null default 'guidance',
  notes text,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.ai_generation_examples (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  input jsonb not null default '{}'::jsonb,
  output jsonb not null default '{}'::jsonb,
  notes text,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.generation_requests (
  id uuid primary key default gen_random_uuid(),
  generation_attempt_id uuid references public.generation_attempts(id) on delete set null,
  user_id uuid references auth.users(id) on delete set null,
  prompt_chain_id uuid references public.prompt_chains(id) on delete set null,
  model_id uuid references public.llm_models(id) on delete set null,
  status text not null default 'pending' check (status in ('pending', 'succeeded', 'failed')),
  request_input jsonb not null default '{}'::jsonb,
  selected_stop_count integer check (selected_stop_count between 2 and 5),
  error_message text,
  started_at timestamptz not null default now(),
  completed_at timestamptz
);

create index if not exists generation_requests_started_idx
  on public.generation_requests (started_at desc);
create index if not exists generation_requests_user_idx
  on public.generation_requests (user_id, started_at desc);

create table if not exists public.llm_responses (
  id uuid primary key default gen_random_uuid(),
  generation_request_id uuid not null references public.generation_requests(id) on delete cascade,
  model_id uuid references public.llm_models(id) on delete set null,
  response_kind text not null default 'generation',
  raw_text text,
  parsed_output jsonb,
  latency_ms integer check (latency_ms is null or latency_ms >= 0),
  created_at timestamptz not null default now()
);

create index if not exists llm_responses_request_idx
  on public.llm_responses (generation_request_id, created_at);

create table if not exists public.allowed_signup_domains (
  id uuid primary key default gen_random_uuid(),
  domain text not null unique,
  is_enabled boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  check (domain = lower(domain) and domain !~ '@' and length(domain) > 2)
);

create table if not exists public.whitelisted_emails (
  id uuid primary key default gen_random_uuid(),
  email text not null unique,
  is_enabled boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  check (email = lower(email) and email ~ '^[^@[:space:]]+@[^@[:space:]]+$')
);

do $$
declare table_name text;
begin
  foreach table_name in array array[
    'llm_providers', 'llm_models', 'prompt_chains', 'prompt_chain_steps',
    'prompt_chain_mix', 'terms', 'ai_generation_examples',
    'generation_requests', 'llm_responses', 'allowed_signup_domains',
    'whitelisted_emails'
  ] loop
    execute format('alter table public.%I enable row level security', table_name);
    execute format('alter table public.%I force row level security', table_name);
    execute format('revoke all on public.%I from anon, authenticated', table_name);
    execute format('grant all on public.%I to service_role', table_name);
  end loop;
end $$;

insert into public.llm_providers (slug, name, base_url, credential_env_var)
values ('google', 'Google Gemini', 'https://generativelanguage.googleapis.com', 'GEMINI_API_KEY')
on conflict (slug) do update set
  name = excluded.name,
  base_url = excluded.base_url,
  credential_env_var = excluded.credential_env_var;

insert into public.llm_models (provider_id, model_id, name, description, is_default)
select id, 'gemini-3.8-flash', 'Gemini 3.8 Flash', 'Primary Sidequests generation model', true
from public.llm_providers where slug = 'google'
on conflict (model_id) do update set
  provider_id = excluded.provider_id,
  name = excluded.name,
  description = excluded.description,
  is_default = excluded.is_default;

insert into public.prompt_chains (slug, name, description)
values ('sidequest-v1', 'Sidequest itinerary', 'Generate and rank cohesive NYC itineraries with a model-selected number of stops.')
on conflict (slug) do update set name = excluded.name, description = excluded.description;

insert into public.prompt_chain_steps (chain_id, step_order, name, template)
select id, 1, 'Generate candidates', 'Create distinct, compact NYC itinerary candidates with 2–5 stops. Choose only as many stops as improve quality, cohesion, budget fit, and walkability.'
from public.prompt_chains where slug = 'sidequest-v1'
on conflict (chain_id, step_order) do update set name = excluded.name, template = excluded.template;

insert into public.prompt_chain_steps (chain_id, step_order, name, template)
select id, 2, 'Rank candidates', 'Rank valid candidates for real destinations, route cohesion, request fit, practicality, and originality.'
from public.prompt_chains where slug = 'sidequest-v1'
on conflict (chain_id, step_order) do update set name = excluded.name, template = excluded.template;

insert into public.prompt_chain_mix (chain_id, model_id, weight)
select chains.id, models.id, 100
from public.prompt_chains chains
cross join public.llm_models models
where chains.slug = 'sidequest-v1' and models.model_id = 'gemini-3.8-flash'
on conflict (chain_id) do update set model_id = excluded.model_id, weight = excluded.weight;

insert into public.allowed_signup_domains (domain)
values ('columbia.edu')
on conflict (domain) do nothing;

insert into public.whitelisted_emails (email)
values ('aai2139@columbia.edu')
on conflict (email) do nothing;
