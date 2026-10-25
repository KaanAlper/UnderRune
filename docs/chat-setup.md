# General chat setup

General chat has two public rooms: UNDERTALE and DELTARUNE. Reading does not create an account. Sending reuses the existing leaderboard anonymous Supabase session and the browser's saved display name. The configured public project URL and publishable key stay in `public/leaderboard-config.json`; no secret or service-role key belongs in the browser.

## Owner activation

1. Use the same Supabase project as the leaderboard. Enable anonymous sign-ins under Authentication if they are not already enabled. Existing leaderboard migrations remain required for scores, but chat tables do not depend on leaderboard tables.
2. Enable `pg_cron` under Database > Extensions. The migration also includes its SQL installation, using `pg_catalog`, with cron access granted only to the project owner role `postgres`.
3. As the project owner, run `supabase/migrations/202610260001_general_chat.sql` in SQL Editor. The core tables/RPC transaction commits before cron installation. If only cron installation fails, resolve the extension/owner access and run only the final cron section; do not repeat the table-creation section against existing tables.
4. Verify the read RPC and permissions with the read-only queries below. No QA message needs to be published to the live rooms.
5. Verify that the scheduled job exists, is active, and has the exact command below. After the first scheduled run, inspect the job run details; creating a job alone does not prove that the scheduler has executed it.

```sql
-- Bounded public read; on a new installation this returns no rows.
select * from public.read_chat_messages('undertale');
select * from public.read_chat_messages('deltarune');

-- Expected: all four false.
select has_schema_privilege('anon','chat_private','usage') as anon_private,
       has_schema_privilege('authenticated','chat_private','usage') as auth_private,
       has_function_privilege('anon','public.send_chat_message(uuid,text,text,text)','execute') as anon_send,
       has_table_privilege('authenticated','chat_private.messages','insert') as direct_insert;
-- Expected: all three true.
select has_function_privilege('anon','public.read_chat_messages(text,bigint)','execute') as public_read,
       has_function_privilege('authenticated','public.read_chat_messages(text,bigint)','execute') as auth_read,
       has_function_privilege('authenticated','public.send_chat_message(uuid,text,text,text)','execute') as auth_send;

select jobid,jobname,schedule,command,active
from cron.job where jobname='underrune-chat-weekly-reset';
-- Expected schedule: 0 0 * * 1. Both rooms reset Monday at 00:00 UTC.
-- Expected command:
-- delete from chat_private.messages; delete from chat_private.throttle where last_sent < now()-interval '1 day';

select jobid,status,return_message,start_time,end_time
from cron.job_run_details
where jobid in (select jobid from cron.job where jobname='underrune-chat-weekly-reset')
order by start_time desc limit 5;
```

The weekly job deletes all room messages rather than archiving them. It keeps recent rate-limit records so the reset cannot bypass a sender's active limits. Cron times are UTC, so Monday 00:00 UTC is Monday 03:00 in Istanbul. Do not manually execute the cleanup command on a populated live project unless that reset is intended. To pause the job, the owner can set `active=false` through Supabase Cron or call `cron.alter_job(job_id:=<actual jobid>,active:=false)` in SQL Editor.

## Behavior and limits

- The display name remains under `underrune.leaderboard.player.v1`. A shared `PlayerProfile` instance immediately updates the leaderboard and chat when either changes the name. Each message retains the name used when it was sent.
- Public reads go through a server RPC that returns at most 50 messages from one validated room. Older/newer pages use a descending sequence cursor. Only one page is rendered; refreshing replaces it. Owner IDs are never returned.
- The newest page checks every 8 seconds while the dialog and document are visible. Checks pause on older pages and while the reader has scrolled above the bottom. Hiding closes the read request and timer. Returning to a visible dialog reloads the selected page. A failed read requires Refresh or reopening to retry.
- Sending requires a nonempty display name of at most 24 Unicode characters and a nonempty message of at most 500 Unicode characters / 2000 UTF-8 bytes. Control characters and line breaks are rejected. Client and SQL both validate the payload.
- Each authenticated identity can send once every 2 seconds, at most 10 messages per minute and 100 per day window. Minute/day windows begin with that sender's first message and reset after their duration elapses. The two rooms share those limits. An advisory transaction lock serializes concurrent requests from one identity.
- A client-generated message UUID makes an uncertain send retry safe. The same UUID, room, content and original name are retried; a successful existing message returns success without inserting again or consuming another rate slot. Changing the draft starts a new send. The server rejects edits or another owner's reuse of an existing UUID. Weekly deletion also removes old message UUID records.
- Drafts survive sending/read errors and room changes in the current panel instance. They are not stored across a page reload. Sending never displays a false local message; confirmation appears only after the RPC succeeds.
- Per-identity limits do not prevent somebody from creating new anonymous identities. This implementation does not claim global spam prevention or moderation tooling. Supabase anonymous signup abuse controls and project quotas remain owner settings.
- The panel uses textContent for message/name rendering. Native modal focus, Escape, X, Z and arrow navigation are preserved; inputs keep Z/X and all editing arrows. Enter sends from the message field unless an IME composition is active. Mobile layout is browser-tested at 390px; physical phone keyboard and safe-area behavior still need hardware verification.

## Validation status

Component and API tests use isolated mock data and never post QA messages to the public project. The core SQL was additionally executed in an isolated PostgreSQL-compatible PGlite database: authentication, revoked direct access, ownership, idempotency, room isolation, payload validation, rate limits, 50-row pagination and cleanup passed. PGlite does not execute Supabase's pg_cron scheduler. The owner applied the live migration and reported cron schedule result 1. Both public room reads returned 200; unauthenticated send was denied 401/42501, and anonymous Auth plus an invalid authenticated no-write request reached RPC validation 400/P0001. No public QA messages were posted. The first actual scheduled cleanup execution remains to be inspected in cron.job_run_details; job creation alone does not prove scheduler execution.

Setup reference: [Supabase Cron installation](https://supabase.com/docs/guides/cron/install).
