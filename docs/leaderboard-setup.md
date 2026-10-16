# Shared leaderboard setup

The frontend is ready for Supabase REST/Auth. A shared leaderboard becomes available only after this migration is applied to the owner's project and anonymous sign-in is enabled. GitHub Pages supplies the frontend, not score storage.

1. Create or open the Supabase project and run [the migration](../supabase/migrations/202610160001_leaderboard.sql) once in its SQL Editor. It creates a private score table, public read view and authenticated publication RPC in a transaction. Do not rerun a successful migration or drop existing scores.
2. Enable anonymous sign-in in Supabase Authentication. No email or password is collected by UnderRune. Keep the project Auth rate limits enabled. This integration does not include a CAPTCHA widget: enabling a CAPTCHA requirement also requires adding a supported token flow to this client before publication can work.
3. Put the project origin and its **publishable** key in `public/leaderboard-config.json`:

   ```json
   {"url":"https://YOUR_PROJECT.supabase.co","key":"sb_publishable_YOUR_PUBLIC_KEY"}
   ```

   These values are public browser configuration. Never include a secret key, service-role key, database password or personal access token. Legacy anonymous JWT keys are not required by this client.
4. Run `npm run build:pages`, publish the usual Pages artifact and open the leaderboard. Confirm a real empty response rather than a missing-table/configuration error. After winning a full battle, choose a display name and voluntarily publish. Verify the row appears from a second browser. Absent configuration reports unavailability; local records never pretend to be shared scores.

Scores are scoped by encounter and `battle-v1`. Filters combine on the server before ordering and pages of 25: damage/time bounds, no item, no armor, selected weapon/armor, starting-bag item and actually used item. Defaults order by damage, then time, then run ID. No item means no item was executed, even if the starting bag contained items. Repeated bag and used-item entries preserve quantities.

The board opens beside the selected boss after choosing a chapter. Join leaderboard stores the chosen name under `underrune.leaderboard.player.v1`, reused across boss boards and reloads; Change name is explicit. No score is published merely by joining. Victory provides Share score, then voluntary publication. Normal NEO uses `ch2-61`; a run in which the original rapid-shot enrage event actually activates uses `ch2-61-enraged`. The NEO mode filter selects between these boards; it does not modify the battle. Snowgrave is separate and is not enabled by this feature.

Configuration is loaded on demand. A genuine missing/empty file reports unavailable storage; a failed request remains a visible error and Apply filters or reopening retries it. Publication can also retry a connection failure while retaining the run. This avoids disabling the leaderboard for an entire game session after a transient startup error.

The private table is inaccessible to browser roles. The read view excludes owner identity. Only the authenticated publication RPC can insert: it obtains the owner from the user's JWT, validates bounded fields and arrays, derives challenge flags and rejects inconsistent flags. Rows cannot be edited or deleted by clients. Retries of an identical run ID by its owner are idempotent; a changed payload or another owner cannot claim that ID. Publication is limited to six new runs per minute and 100 per day per anonymous account, serialized with an advisory transaction lock.

Runs are client-reported. Validation, ownership and throttling do not prove gameplay or prevent a modified client from inventing a run. A user can create another anonymous account; per-account limits are not global anti-abuse protection. Server replay verification and stronger abuse controls are separate future work. Do not label these scores server-verified.

The browser stores its anonymous session in local storage when available, and keeps an in-memory session otherwise. Sessions are project-scoped. Expired access tokens are refreshed; one unauthorized publication is retried. A revoked refresh token creates a new anonymous identity for future runs; this cannot reclaim an existing run owned by the old identity. Network failure keeps the same run ID for an explicit retry. Do not clear the session while retrying an uncertain publication: a newly created identity cannot reclaim a run belonging to the old identity.

A missing view/RPC normally indicates that the migration was not applied. Authentication errors may indicate anonymous sign-in is disabled. Service errors and timeouts remain visible and do not block playing. Do not solve database permission errors by publishing a privileged key or granting direct table writes.

References: [Supabase publishable keys](https://supabase.com/docs/guides/getting-started/api-keys), [anonymous sign-in](https://supabase.com/docs/guides/auth/auth-anonymous), [database functions and security](https://supabase.com/docs/guides/database/functions).
