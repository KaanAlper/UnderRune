import {test} from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';

const original=fs.readFileSync(new URL('../supabase/migrations/202610160001_leaderboard.sql',import.meta.url),'utf8');
const upgrade=()=>fs.readFileSync(new URL('../supabase/migrations/202610220001_battle_v2.sql',import.meta.url),'utf8');
const rpc=sql=>sql.match(/create(?: or replace)? function public\.submit_leaderboard_run\(p_run jsonb,p_player_name text\)[\s\S]+?\$\$;/i)?.[0];
test('v2 migration preserves historical rows and only expands the named version constraint',()=>{
 const sql=upgrade();
 assert.match(sql,/alter table leaderboard_private\.runs\s+drop constraint runs_rules_version_check;/i);
 assert.match(sql,/add constraint runs_rules_version_check check \(rules_version in \('battle-v1','battle-v2'\)\)/i);
 assert.doesNotMatch(sql,/\b(?:delete from|truncate|drop table|update leaderboard_private\.runs)\b/i);
 assert.match(sql,/\bbegin;/i);assert.match(sql,/\bcommit;/i);
 assert.match(original,/rules_version text not null check \(rules_version = 'battle-v1'\)/);
});
test('v2 RPC retains authentication, ownership, immutability and all validation except the version allowlist',()=>{
 const expected=rpc(original).replace('create function','create or replace function').replace("p_run->>'rules_version' <> 'battle-v1'","p_run->>'rules_version' not in ('battle-v1','battle-v2')");
 assert.equal(rpc(upgrade()),expected);
});
