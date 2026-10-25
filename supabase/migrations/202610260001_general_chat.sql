-- Apply as project owner in Supabase SQL Editor. Requires existing anonymous Auth.
begin;
create schema if not exists chat_private;
revoke all on schema chat_private from public, anon, authenticated;
create table chat_private.messages (
 id uuid primary key,
 sequence bigint generated always as identity unique,
 owner_id uuid not null references auth.users(id) on delete cascade,
 room text not null check (room in ('undertale','deltarune')),
 player_name text not null check (char_length(player_name) between 1 and 24 and player_name !~ '[[:cntrl:]]'),
 content text not null check (char_length(content) between 1 and 500 and octet_length(content)<=2000 and content !~ '[[:cntrl:]]'),
 created_at timestamptz not null default now()
);
create index chat_room_page on chat_private.messages(room,sequence desc);
create table chat_private.throttle (
 owner_id uuid primary key references auth.users(id) on delete cascade,
 last_sent timestamptz not null,
 minute_start timestamptz not null,
 minute_count integer not null,
 day_start timestamptz not null,
 day_count integer not null
);
alter table chat_private.messages enable row level security;
alter table chat_private.throttle enable row level security;
revoke all on all tables in schema chat_private from public, anon, authenticated;
revoke all on all sequences in schema chat_private from public, anon, authenticated;

-- Public RPC provides only a bounded page; owner IDs are never exposed.
create function public.read_chat_messages(p_room text,p_before bigint default null)
returns table(id uuid,sequence bigint,room text,player_name text,content text,created_at timestamptz)
language plpgsql security definer set search_path='' as $$
begin
 if p_room is null or p_room not in ('undertale','deltarune') or (p_before is not null and p_before<1) then raise exception 'Invalid chat room or page'; end if;
 return query select m.id,m.sequence,m.room,m.player_name,m.content,m.created_at
 from chat_private.messages m where m.room=p_room and (p_before is null or m.sequence<p_before)
 order by m.sequence desc limit 50;
end;
$$;
revoke all on function public.read_chat_messages(text,bigint) from public, anon, authenticated;
grant execute on function public.read_chat_messages(text,bigint) to anon, authenticated;

create function public.send_chat_message(p_id uuid,p_room text,p_player_name text,p_content text)
returns void language plpgsql security definer set search_path='' as $$
declare
 actor uuid:=auth.uid();
 display_name text:=btrim(p_player_name);
 message text:=btrim(p_content);
 previous chat_private.messages%rowtype;
 rate chat_private.throttle%rowtype;
 instant timestamptz:=clock_timestamp();
begin
 if actor is null then raise exception 'Sign in before sending a message' using errcode='42501'; end if;
 if p_id is null or p_room is null or p_room not in ('undertale','deltarune') then raise exception 'Invalid message ID or room'; end if;
 if display_name is null or char_length(display_name) not between 1 and 24 or display_name ~ '[[:cntrl:]]' then raise exception 'Player name must contain 1 to 24 characters'; end if;
 if message is null or char_length(message) not between 1 and 500 or octet_length(message)>2000 or message ~ '[[:cntrl:]]' then raise exception 'Message must contain 1 to 500 characters without control characters'; end if;
 -- Serialize one identity across both rooms; concurrent requests cannot bypass limits.
 perform pg_advisory_xact_lock(hashtextextended(actor::text,73211));
 select * into previous from chat_private.messages where id=p_id;
 if found then
  if previous.owner_id<>actor then raise exception 'Message belongs to another player' using errcode='42501'; end if;
  if previous.room<>p_room or previous.player_name<>display_name or previous.content<>message then raise exception 'A sent message cannot be changed'; end if;
  return;
 end if;
 select * into rate from chat_private.throttle where owner_id=actor;
 if found then
  if instant-rate.last_sent<interval '2 seconds' then raise exception 'Please wait 2 seconds between messages'; end if;
  if instant-rate.minute_start>=interval '1 minute' then rate.minute_start:=instant;rate.minute_count:=0; end if;
  if instant-rate.day_start>=interval '1 day' then rate.day_start:=instant;rate.day_count:=0; end if;
  if rate.minute_count>=10 or rate.day_count>=100 then raise exception 'Chat limit reached. Please try later'; end if;
 else
  rate.minute_start:=instant;rate.minute_count:=0;rate.day_start:=instant;rate.day_count:=0;
 end if;
 insert into chat_private.messages(id,owner_id,room,player_name,content) values(p_id,actor,p_room,display_name,message);
 insert into chat_private.throttle values(actor,instant,rate.minute_start,rate.minute_count+1,rate.day_start,rate.day_count+1)
 on conflict(owner_id) do update set last_sent=excluded.last_sent,minute_start=excluded.minute_start,minute_count=excluded.minute_count,day_start=excluded.day_start,day_count=excluded.day_count;
end;
$$;
revoke all on function public.send_chat_message(uuid,text,text,text) from public, anon, authenticated;
grant execute on function public.send_chat_message(uuid,text,text,text) to authenticated;
commit;

-- Enable pg_cron in Dashboard > Database > Extensions before this section.
-- Monday 00:00 UTC: reset BOTH rooms, retain recent rate-limit records.
-- Owner-only cron execution; no browser delete privilege or service-role key.
create extension if not exists pg_cron with schema pg_catalog;
grant usage on schema cron to postgres;
grant all privileges on all tables in schema cron to postgres;
select cron.schedule('underrune-chat-weekly-reset','0 0 * * 1',
 $$delete from chat_private.messages; delete from chat_private.throttle where last_sent < now()-interval '1 day';$$);
