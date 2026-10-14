/** NEO's actual track/cityscape and party coaster presentation. Menu practice
 * enters at the documented native battle snapshot, after the world introduction. */
import {resolveEvent,type GmInstance,type GmObjectDef,type GmRuntime} from '../../gm/runtime';
import {createNeoSourceObject,executeNeoSource,type NeoSourceHost} from './body-source';
import {neoEnemyUtilityScriptSources} from './enemy-source-data';
import {neoSceneScriptSources,neoSceneSourceData} from './source-scene-data';

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
 const scene=objects.obj_ch2_sceneex2,sourceStep=scene.events!.step!;
 scene.events!.step=(s,rt)=>{
  if(s.con===13&&s.forcend===1){external.battleBoundary(s,rt);return;}
  sourceStep(s,rt);
 };
 return objects;
}

export const NEO_SCENE_BATTLE_SNAPSHOT={
 viewX:1640,viewY:0,con:8,fightmode:1,trackspeed:-15,trackY:[70,150,230],alarm0:120,
 coasters:[[1721,60,.1],[1718,125,.08],[1727,215,.09]],
} as const;

/** Restores scene state reached after Step's con7/customcon1 branch and the
 * preceding con6 cutscene commands (source lines390-428, 508-552). Engine battle
 * setup owns scr_battle(61); no intro/dialogue commands are fabricated here.
 * Sprite controller Create/Step still run exactly, preserving actual origins. */
export function enterNeoBattleScene(rt:GmRuntime,external:NeoSceneHost,enemy:GmInstance):GmInstance{
 if(rt.view.x!==1640||rt.view.y!==0)throw Error('Native NEO coaster snapshot requires camera (1640,0)');
 const host=withScripts(external),snapshot=NEO_SCENE_BATTLE_SNAPSHOT;
 const scene=rt.restore(host.object('obj_ch2_sceneex2'),rt.nextId++,rt.view.x,0);
 // Source Create's unconditional initial state; the following conditional starts
 // the world intro, which a battle-only practice snapshot has already passed.
 const createPrelude=neoSceneSourceData.obj_ch2_sceneex2.sources.Create_0.split('if (global.chapter != 2')[0];
 executeNeoSource(createPrelude,scene,rt,host,undefined,'create');
 Object.assign(scene,{con:snapshot.con,customcon:1,fightmode:1,trackspeed:snapshot.trackspeed,tracky0:70,tracky1:150,tracky2:230,cityscape_active:true,sneo:enemy.id,shortened:false,special_scene:false});
 scene.alarm[0]=snapshot.alarm0;
 const characterSprites=['spr_krisb_defeat','spr_susie_shock_r','spr_ralsei_surprised_down'];
 for(let i=0;i<3;i++){
  const [x,y,sinerAdd]=snapshot.coasters[i],coaster=rt.create(host.object('obj_coaster'),x,y);
  coaster.type=i;
  // Native intro has already run each coaster's first Step, which creates its
  // real hidden character marker and initializes the type's source offsets.
  resolveEvent(coaster.object,'step')!(coaster,rt);
  coaster.character_sprite=characterSprites[i];coaster.siner_add0=sinerAdd;coaster.visible=false;
  coaster.depth=[90000,80000,70000][i];if(i===2)coaster.character_offset_x=-10;
  scene[['coaster_kris','coaster_susie','coaster_ralsei'][i]]=coaster.id;
 }
 rt.create(host.object('o_coaster_controller_sneo'),scene.x,scene.y);
 rt.globals.tempflag[32]=1;rt.globals.flag[54]=571;rt.globals.flag[9]=1;
 return scene;
}
