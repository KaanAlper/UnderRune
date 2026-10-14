/** Complete normal-route obj_spamton_neo_enemy lifecycle. The eight anchored body
 * parts, ACT staging, wireheart release and actual ending events live in source Draw/Step. */
import type {GmInstance,GmObjectDef} from '../../gm/runtime';
import {chooseNeoAttack} from './chooser';
import {createNeoSourceObject,executeNeoSource,type NeoSourceHost} from './body-source';
import {neoEnemyUtilityScriptSources,neoEnemySourceData} from './enemy-source-data';

export interface NeoEnemyHost extends NeoSourceHost {}

/** The host must register the returned definition as obj_spamton_neo_enemy before Create runs. */
export function createNeoEnemy(host:NeoEnemyHost):GmObjectDef{
 const sourceHost:NeoSourceHost={...host,scripts:{...neoEnemyUtilityScriptSources,...host.scripts}};
 const record=neoEnemySourceData.obj_spamton_neo_enemy;
 const enemy=createNeoSourceObject(sourceHost,record.metadata,record.sources);
 enemy.events!.user0=chooseNeoAttack;
 return enemy;
}

/** Real enemy-owned support definitions; all references resolve through the same host registry. */
export function createNeoEnemyEffects(host:NeoEnemyHost):Record<string,GmObjectDef>{
 const sourceHost:NeoSourceHost={...host,scripts:{...neoEnemyUtilityScriptSources,...host.scripts}};
 const definitions:Record<string,GmObjectDef>={};
 for(const [name,record] of Object.entries(neoEnemySourceData))if(name!=='obj_spamton_neo_enemy')definitions[name]=createNeoSourceObject(sourceHost,record.metadata,record.sources);
 return definitions;
}

/** Native room cleanup invokes Cleanup without pretending that an unfinished battle was won. */
export function cleanupNeoEnemy(enemy:GmInstance,host:NeoEnemyHost,rt:Parameters<typeof executeNeoSource>[2]){
 executeNeoSource(neoEnemySourceData.obj_spamton_neo_enemy.sources.CleanUp_0,enemy,rt,host,undefined,'destroy');
}
