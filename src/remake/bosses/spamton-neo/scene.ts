/** NEO's actual track/cityscape and party coaster presentation. Menu practice
 * enters at the documented native battle snapshot, after the world introduction. */
import {type GmInstance,type GmObjectDef,type GmRuntime} from '../../gm/runtime';
import {createNeoSourceObject,type NeoSourceHost} from './body-source';
import {neoEnemyUtilityScriptSources} from './enemy-source-data';
import {neoSceneScriptSources,neoSceneSourceData} from './source-scene-data';
import {createNeoBattleScene,enterNeoBattleSnapshot,NEO_BATTLE_SCENE_SNAPSHOT,type NeoBattleSceneHost} from './battle-scene';

export interface NeoSceneHost extends NeoSourceHost{
 /** Called at the source's forcend/con13 postbattle boundary. The host must complete
  * the practice battle here; the world actor/dialogue sequence follows afterward. */
 battleBoundary(scene:GmInstance,rt:GmRuntime):void;
}
function withScripts(host:NeoSourceHost):NeoSourceHost{return {...host,scripts:{...neoEnemyUtilityScriptSources,...neoSceneScriptSources,...host.scripts}};}

export function createNeoSceneObjects(external:NeoSceneHost):Record<string,GmObjectDef>{
 const objects:Record<string,GmObjectDef>={};
 const host=withScripts({...external,object:name=>objects[name]??external.object(name)});
 for(const [name,record] of Object.entries(neoSceneSourceData))objects[name]=createNeoSourceObject(host,record.metadata,record.sources);
 const sourceScene=objects.obj_ch2_sceneex2;
 const bridge:NeoBattleSceneHost={...external,object:host.object,
  worldCreate:(s,rt)=>sourceScene.events!.create!(s,rt),worldStep:(s,rt)=>sourceScene.events!.step!(s,rt),
  finishBattleAudio:(s,rt)=>{
   host.call!('snd_free',s,rt,[rt.globals.batmusic[0]]);
   host.call!('snd_volume',s,rt,[rt.globals.currentsong[1],0,0]);
   host.call!('snd_resume',s,rt,[rt.globals.currentsong[1]]);
   host.call!('snd_volume',s,rt,[rt.globals.currentsong[1],1,20]);
  },
 };
 for(const def of createNeoBattleScene(bridge))objects[def.name]=def;
 return objects;
}

export const NEO_SCENE_BATTLE_SNAPSHOT=NEO_BATTLE_SCENE_SNAPSHOT;

/** Practice enters the documented source battle snapshot; world source paths retain the explicit callbacks above. */
export function enterNeoBattleScene(rt:GmRuntime,external:NeoSceneHost,enemy:GmInstance):GmInstance{
 return enterNeoBattleSnapshot(rt,{...external,finishBattleAudio:()=>{throw Error('Snapshot setup must not finish battle audio');}},enemy);
}
