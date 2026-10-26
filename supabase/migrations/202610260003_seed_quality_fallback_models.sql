-- Register the quality-preserving and emergency fallback models so the admin
-- model catalog documents the production generation chain.
insert into public.llm_models (provider_id, model_id, name, description, is_default)
select id, 'gemini-3.6-flash', 'Gemini 3.6 Flash', 'Stable quality-preserving fallback for Sidequests generation', false
from public.llm_providers where slug = 'google'
on conflict (model_id) do update set
  provider_id = excluded.provider_id,
  name = excluded.name,
  description = excluded.description;

insert into public.llm_models (provider_id, model_id, name, description, is_default)
select id, 'gemini-3.5-flash-lite', 'Gemini 3.5 Flash-Lite', 'Emergency high-availability fallback for Sidequests generation', false
from public.llm_providers where slug = 'google'
on conflict (model_id) do update set
  provider_id = excluded.provider_id,
  name = excluded.name,
  description = excluded.description;
