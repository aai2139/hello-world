-- Match the model-selected itinerary length supported by both applications.
alter table public.sidequests
  drop constraint if exists sidequests_stops_check;

alter table public.sidequests
  add constraint sidequests_stops_check
  check (
    jsonb_typeof(stops) = 'array'
    and jsonb_array_length(stops) between 2 and 5
  );
