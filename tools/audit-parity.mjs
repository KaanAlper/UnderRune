import fs from 'node:fs/promises';
import path from 'node:path';
import {createHash} from 'node:crypto';
import {fileURLToPath} from 'node:url';
const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
const sourceFolder='extracted/chapter1_windows/code/';
// This indexes current source-port evidence. Test outcomes and complete fidelity are separate assertions.
const components=[
 ['command-queue',['gml_GlobalScript_scr_nexthero.gml','gml_GlobalScript_scr_endturn.gml','gml_GlobalScript_scr_attackphase.gml'],['src/remake/deltarune/controller.ts','tests/remake-engine-parity.test.ts']],
 ['attack-timing',['gml_GlobalScript_scr_boltcheck_onebutton.gml','gml_Object_obj_attackpress_Create_0.gml','gml_Object_obj_attackpress_Draw_0.gml'],['src/remake/deltarune/party.ts','tests/remake-engine-parity.test.ts']],
 ['player-damage',['gml_Object_obj_heroparent_Alarm_1.gml'],['src/remake/deltarune/party.ts','tests/remake-engine-parity.test.ts']],
 ['party-stats',['gml_GlobalScript_scr_gamestart.gml'],['src/remake/host/engine.ts','src/remake/deltarune/encounter.ts','tests/remake-engine.test.ts']],
 ['actor-menus',['gml_Object_obj_battlecontroller_Step_0.gml'],['src/remake/deltarune/controller.ts','tests/remake-engine-parity.test.ts']],
 ['graze',['gml_Object_obj_grazebox_Collision_obj_collidebullet.gml'],['src/remake/deltarune/battle.ts','tests/remake-parity-movement.test.ts']],
 ['enemy-damage-guard-downed',['gml_GlobalScript_scr_damage.gml'],['src/remake/deltarune/battle.ts','tests/remake-parity-movement.test.ts']],
 ['heart-movement',['gml_Object_obj_heart_Create_0.gml','gml_Object_obj_heart_Step_0.gml'],['src/remake/deltarune/battle.ts','tests/remake-parity-movement.test.ts']],
 ['boss-phases',['gml_Object_obj_joker_Step_0.gml'],['src/remake/bosses/jevil/enemy.ts','src/remake/host/engine.ts','tests/remake-parity-jevil.test.ts']],
];
async function evidence(file){const content=await fs.readFile(path.join(root,file));return {file,sha256:createHash('sha256').update(content).digest('hex')};}
const records=[];
for(const [id,files,application] of components)records.push({id,status:'source-port-evidence',sources:await Promise.all(files.map(name=>evidence(sourceFolder+name))),application:await Promise.all(application.map(evidence))});
const catalog=JSON.parse(await fs.readFile(path.join(root,'src/bosses/catalog.json'),'utf8'));
const report={scope:'Current faithful-source component evidence. This tool hashes source, implementation and tests; it does not execute tests or establish complete encounter equivalence.',fullParityVerified:0,catalogRecords:catalog.length,findings:records};
await fs.writeFile(path.join(root,'extracted/parity-audit.json'),JSON.stringify(report,null,2));
console.log(`${catalog.length} source encounter records; ${records.length} source-port component evidence groups; no full-parity claim.`);
for(const finding of records)console.log(`${finding.id}: ${finding.status}`);
console.log('Source hashes and evidence: extracted/parity-audit.json');