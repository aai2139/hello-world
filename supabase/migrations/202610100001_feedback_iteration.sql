-- Flexible per-person budgets, party size, and private preference context.

alter table public.sidequests
  add column if not exists budget_min_cents integer,
  add column if not exists budget_max_cents integer,
  add column if not exists party_size smallint not null default 1,
  add column if not exists preferences text;

alter table public.sidequests
  drop constraint if exists sidequests_budget_min_cents_check,
  drop constraint if exists sidequests_budget_max_cents_check,
  drop constraint if exists sidequests_budget_range_check,
  drop constraint if exists sidequests_party_size_check,
  drop constraint if exists sidequests_preferences_check;

alter table public.sidequests
  add constraint sidequests_budget_min_cents_check
    check (budget_min_cents is null or budget_min_cents between 0 and 50000),
  add constraint sidequests_budget_max_cents_check
    check (budget_max_cents is null or budget_max_cents between 0 and 50000),
  add constraint sidequests_budget_range_check
    check (
      (budget_min_cents is null and budget_max_cents is null)
      or
      (budget_min_cents is not null and budget_max_cents is not null and budget_min_cents <= budget_max_cents)
    ),
  add constraint sidequests_party_size_check
    check (party_size between 1 and 12),
  add constraint sidequests_preferences_check
    check (preferences is null or char_length(preferences) <= 500);

comment on column public.sidequests.preferences is
  'Private creator context used for generation; excluded from public data transfer objects.';
