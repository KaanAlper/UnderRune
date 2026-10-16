-- Public scores are client-reported, not authoritative gameplay verification.
begin;
create schema if not exists leaderboard_private;
revoke all on schema leaderboard_private from public, anon, authenticated;
create table leaderboard_private.runs (
 id uuid primary key,
 owner_id uuid not null references auth.users(id) on delete cascade,
 encounter_id text not null,
 rules_version text not null check (rules_version = 'battle-v1'),
 duration_ms integer not null check (duration_ms between 1 and 86400000),
 damage integer not null check (damage between 0 and 100000000),
 equipment jsonb not null,
 bag integer[] not null,
 used_items integer[] not null,
 no_armor boolean not null,
 no_item boolean not null,
 player_name text not null,
 created_at timestamptz not null default now()
);
alter table leaderboard_private.runs enable row level security;
revoke all on leaderboard_private.runs from public, anon, authenticated;
create index runs_damage_board on leaderboard_private.runs (encounter_id,rules_version,damage,duration_ms,id);
create index runs_time_board on leaderboard_private.runs (encounter_id,rules_version,duration_ms,damage,id);
create index runs_owner_rate on leaderboard_private.runs (owner_id,created_at);
create index runs_equipment on leaderboard_private.runs using gin (equipment);
create index runs_bag on leaderboard_private.runs using gin (bag);
create index runs_used_items on leaderboard_private.runs using gin (used_items);
-- Owner IDs and session details are never exposed. The definer view intentionally
-- provides public reads while the underlying private table has no client grants.
create view public.leaderboard_runs with (security_barrier = true) as
 select id,encounter_id,rules_version,duration_ms,damage,equipment,bag,used_items,
        no_armor,no_item,player_name,created_at from leaderboard_private.runs;
revoke all on public.leaderboard_runs from public, anon, authenticated;
grant select on public.leaderboard_runs to anon, authenticated;

create function public.submit_leaderboard_run(p_run jsonb,p_player_name text)
returns void language plpgsql security definer set search_path = '' as $$
declare
 actor uuid := auth.uid();
 run_id uuid;
 gear jsonb;
 member jsonb;
 field jsonb;
 members integer[] := '{}';
 initial_bag integer[] := '{}';
 executed_items integer[] := '{}';
 unarmored boolean := true;
 unused boolean;
 display_name text := btrim(p_player_name);
 existing leaderboard_private.runs%rowtype;
begin
 if actor is null then raise exception 'Sign in before publishing a score' using errcode='42501'; end if;
 if p_run is null or jsonb_typeof(p_run) <> 'object' then raise exception 'Invalid run'; end if;
 if (select count(*) from jsonb_object_keys(p_run)) <> 10 or not p_run ?& array['id','encounter_id','rules_version','duration_ms','damage','equipment','bag','used_items','no_armor','no_item'] then raise exception 'Invalid run fields'; end if;
 if display_name is null or char_length(display_name) not between 1 and 24 or display_name ~ '[[:cntrl:]]' then raise exception 'Player name must contain 1 to 24 characters'; end if;
 if jsonb_typeof(p_run->'id') <> 'string' or (p_run->>'id') !~* '^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$' then raise exception 'Invalid run ID'; end if;
 run_id := (p_run->>'id')::uuid;
 if jsonb_typeof(p_run->'encounter_id') <> 'string' or (p_run->>'encounter_id') !~ '^[a-zA-Z0-9][a-zA-Z0-9:_-]{0,79}$' or p_run->>'rules_version' <> 'battle-v1' then raise exception 'Invalid encounter or rules version'; end if;
 if jsonb_typeof(p_run->'duration_ms') <> 'number' or (p_run->>'duration_ms') !~ '^[0-9]{1,8}$' or (p_run->>'duration_ms')::bigint not between 1 and 86400000 then raise exception 'Invalid duration'; end if;
 if jsonb_typeof(p_run->'damage') <> 'number' or (p_run->>'damage') !~ '^[0-9]{1,9}$' or (p_run->>'damage')::bigint not between 0 and 100000000 then raise exception 'Invalid damage'; end if;
 gear := p_run->'equipment';
 if jsonb_typeof(gear) <> 'array' then raise exception 'Invalid equipment'; end if;
 if jsonb_array_length(gear) not between 1 and 4 then raise exception 'Invalid party size'; end if;
 for member in select value from jsonb_array_elements(gear) loop
  if jsonb_typeof(member) <> 'object' then raise exception 'Invalid party member'; end if;
  if (select count(*) from jsonb_object_keys(member)) <> 3 or not member ?& array['character','weapon','armor'] then raise exception 'Invalid equipment fields'; end if;
  if jsonb_typeof(member->'character') <> 'number' or (member->>'character') !~ '^[1-9][0-9]?$' or (member->>'character')::integer not between 1 and 16 or (member->>'character')::integer = any(members) then raise exception 'Invalid or duplicate character'; end if;
  members := array_append(members,(member->>'character')::integer);
  if jsonb_typeof(member->'weapon') <> 'number' or (member->>'weapon') !~ '^[0-9]{1,5}$' or (member->>'weapon')::integer > 65535 then raise exception 'Invalid weapon'; end if;
  if jsonb_typeof(member->'armor') <> 'array' then raise exception 'Invalid armor'; end if;
  if jsonb_array_length(member->'armor') <> 2 then raise exception 'Exactly two armor slots are required'; end if;
  for field in select value from jsonb_array_elements(member->'armor') loop
   if jsonb_typeof(field) <> 'number' or field::text !~ '^[0-9]{1,5}$' or (field::text)::integer > 65535 then raise exception 'Invalid armor ID'; end if;
   if (field::text)::integer <> 0 then unarmored := false; end if;
  end loop;
 end loop;
 if jsonb_typeof(p_run->'bag') <> 'array' or jsonb_typeof(p_run->'used_items') <> 'array' then raise exception 'Invalid items'; end if;
 if jsonb_array_length(p_run->'bag') > 12 or jsonb_array_length(p_run->'used_items') > 4096 then raise exception 'Too many items'; end if;
 for field in select value from jsonb_array_elements(p_run->'bag') loop
  if jsonb_typeof(field) <> 'number' or field::text !~ '^[1-9][0-9]{0,4}$' or (field::text)::integer > 65535 then raise exception 'Invalid bag item'; end if;
  initial_bag := array_append(initial_bag,(field::text)::integer);
 end loop;
 for field in select value from jsonb_array_elements(p_run->'used_items') loop
  if jsonb_typeof(field) <> 'number' or field::text !~ '^[1-9][0-9]{0,4}$' or (field::text)::integer > 65535 then raise exception 'Invalid used item'; end if;
  executed_items := array_append(executed_items,(field::text)::integer);
 end loop;
 unused := cardinality(executed_items) = 0;
 if jsonb_typeof(p_run->'no_armor') <> 'boolean' or jsonb_typeof(p_run->'no_item') <> 'boolean' or (p_run->>'no_armor')::boolean <> unarmored or (p_run->>'no_item')::boolean <> unused then raise exception 'Challenge flags disagree with equipment or used items'; end if;
 -- Serialize each owner's requests so concurrent submissions cannot evade rate limits.
 perform pg_advisory_xact_lock(hashtextextended(actor::text,0));
 select * into existing from leaderboard_private.runs where id=run_id;
 if found then
  if existing.owner_id <> actor then raise exception 'Run ID already belongs to another player' using errcode='42501'; end if;
  if existing.encounter_id <> p_run->>'encounter_id' or existing.rules_version <> p_run->>'rules_version' or existing.duration_ms <> (p_run->>'duration_ms')::integer or existing.damage <> (p_run->>'damage')::integer or existing.equipment <> gear or existing.bag <> initial_bag or existing.used_items <> executed_items or existing.player_name <> display_name then raise exception 'Published runs cannot be changed'; end if;
  return;
 end if;
 if (select count(*) from leaderboard_private.runs where owner_id=actor and created_at > now()-interval '1 minute') >= 6 or (select count(*) from leaderboard_private.runs where owner_id=actor and created_at > now()-interval '1 day') >= 100 then raise exception 'Score publication limit reached. Please retry later'; end if;
 insert into leaderboard_private.runs(id,owner_id,encounter_id,rules_version,duration_ms,damage,equipment,bag,used_items,no_armor,no_item,player_name)
 values(run_id,actor,p_run->>'encounter_id',p_run->>'rules_version',(p_run->>'duration_ms')::integer,(p_run->>'damage')::integer,gear,initial_bag,executed_items,unarmored,unused,display_name);
end;
$$;
revoke all on function public.submit_leaderboard_run(jsonb,text) from public, anon;
grant execute on function public.submit_leaderboard_run(jsonb,text) to authenticated;
commit;
