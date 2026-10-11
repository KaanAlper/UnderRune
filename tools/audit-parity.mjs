import fs from 'node:fs/promises';
import path from 'node:path';
import {createHash} from 'node:crypto';
import {fileURLToPath} from 'node:url';
const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
const sourceFolder='extracted/chapter1_windows/code/';
const findings=[
 ['command-queue',['gml_GlobalScript_scr_nexthero.gml','gml_GlobalScript_scr_endturn.gml','gml_GlobalScript_scr_attackphase.gml'],'src/game/battle.ts','Original selects party commands before resolving attacks; prototype resolves each command immediately.'],
 ['attack-timing',['gml_GlobalScript_scr_boltcheck_onebutton.gml','gml_Object_obj_attackpress_Create_0.gml','gml_Object_obj_attackpress_Draw_0.gml'],'src/game/battle.ts','Original has per-character bolts and discrete timing points; prototype uses a single linear precision curve.'],
 ['player-damage',['gml_Object_obj_heroparent_Alarm_1.gml'],'src/game/battle.ts','Original uses battle AT, timing points, special monster cases and allows zero damage; prototype uses its own formula and minimum one damage.'],
 ['party-stats',['gml_GlobalScript_scr_gamestart.gml'],'src/game/battle.ts','Chapter 1 base AT is 10/14/8 in source; prototype uses 16/21/16 before equipment or encounter state. Later chapter stats are synthesized.'],
 ['actor-menus',['gml_Object_obj_battlecontroller_Step_0.gml'],'src/game/battle.ts','Original command slots depend on character; prototype offers the same six commands and Kris healing magic.'],
 ['graze',['gml_Object_obj_grazebox_Collision_obj_collidebullet.gml'],'src/game/battle.ts','Original uses per-bullet graze/time points, repeated grazing and turn timer reduction; prototype gives one fixed TP reward.'],
 ['enemy-damage-guard-downed',['gml_GlobalScript_scr_damage.gml'],'src/game/battle.ts','Original preserves bullet target, battle DF, two-thirds guard rule, negative downed HP and source invulnerability; prototype picks a random living member, scales guard by 0.55 and clamps HP to zero.'],
 ['heart-movement',['gml_Object_obj_heart_Create_0.gml','gml_Object_obj_heart_Step_0.gml'],'src/game/battle.ts','Original has speed 4, source slow-input rounding and solid-mask collision; prototype has normalized movement and rectangular clamping.'],
 ['boss-phases',['gml_Object_obj_joker_Step_0.gml'],'src/bosses/registry.ts','Prototype cycles a fixed sequence of attacks; original boss event state and transitions have not been integrated.'],
];
const records=[];
for(const [id,files,application,description] of findings){
 const sources=[];
 for(const name of files){const file=sourceFolder+name,content=await fs.readFile(path.join(root,file));sources.push({file,sha256:createHash('sha256').update(content).digest('hex')});}
 const applicationContent=await fs.readFile(path.join(root,application));
 records.push({id,status:'confirmed-different',description,sources,application:{file:application,sha256:createHash('sha256').update(applicationContent).digest('hex')}});
}
const catalog=JSON.parse(await fs.readFile(path.join(root,'src/bosses/catalog.json'),'utf8'));
const report={scope:'Source audit against this installed build. Findings are component-level; no complete boss encounter has established original-game equivalence.',fullParityVerified:0,catalogRecords:catalog.length,findings:records};
await fs.writeFile(path.join(root,'extracted/parity-audit.json'),JSON.stringify(report,null,2));
console.log(`${catalog.length} source encounter records; 0 complete original-parity verifications.`);
for(const finding of records)console.log(`${finding.id}: ${finding.status}`);
console.log('Source hashes and evidence: extracted/parity-audit.json');
