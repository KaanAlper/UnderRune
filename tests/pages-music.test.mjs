import {test} from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';

const file='dist-pages/play/generated/manifest.json';
test('the publication contains the battle and ending music for every released Chapter 2 boss',{
 skip:!fs.existsSync(file),
},()=>{
 const manifest=JSON.parse(fs.readFileSync(file,'utf8'));
 for(const name of ['battle','cyber_battle','cyber_battle_end','queen_boss','berdly_battle_heartbeat_true','boxing_boss','spamton_battle','spamton_neo_mix_ex_wip','spamton_neo_meeting','rouxls_battle','spamton_happy','knight']){
  assert.ok(manifest.music.includes(name),name+' is missing from the public music catalog');
  assert.ok(fs.existsSync('dist-pages/play/generated/music/'+name+'.ogg'),name+' is missing from the release files');
 }
});
