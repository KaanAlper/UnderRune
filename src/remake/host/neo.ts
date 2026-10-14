/** Chapter 2 canonical object registry and explicit common-engine boundaries.
 * Resource-only definitions may be queried but never created silently. */
import {type GmObjectDef,type GmInstance,type GmRuntime,resolveEvent} from '../gm/runtime';
import * as battle from '../deltarune/battle';
import * as controller from '../deltarune/controller';
import * as party from '../deltarune/party';
import * as effects from '../deltarune/player-effects';
import * as writer from '../deltarune/writer';
import {monsterSetup} from '../deltarune/encounter';
import {spellMenuSetupChapter2} from '../deltarune/chapter2';
import {sourceText} from './text';
import {createNeoSourceObject,executeNeoSource} from '../bosses/spamton-neo/body-source';
import {createNeoEnemy,createNeoEnemyEffects} from '../bosses/spamton-neo/enemy';
import {createNeoPlayerObjects} from '../bosses/spamton-neo/yellow-heart';
import {createNeoAttackObjects} from '../bosses/spamton-neo/controller';
import {createNeoProjectiles} from '../bosses/spamton-neo/shot';
import {createNeoSceneObjects,enterNeoBattleScene,type NeoSceneHost} from '../bosses/spamton-neo/scene';
import {neoHostScripts,neoHostObjectSources,neoWriterSmallFaceSource,neoResourceMetadata} from '../bosses/spamton-neo/host-source';
import {attackScriptSources} from '../bosses/spamton-neo/attack-script-source';
import {neoEnemyUtilityScriptSources} from '../bosses/spamton-neo/enemy-source-data';
import {installSourceSurfaces} from './surfaces';

export function installNeoHost(rt:GmRuntime){
 const objects:Record<string,GmObjectDef>={};
 const metadata=new Map(neoResourceMetadata.map(m=>[m.name,m]));
 const namesByIndex=new Map(neoResourceMetadata.map(m=>[m.index,m.name]));
 const object=(name:string)=>{const def=objects[name];if(!def)throw Error(`Chapter 2 resource not registered: ${name}`);return def;};
 const streamNames=new Map<number,string>(),pitches=new Map<number|string,number>();let nextStream=-100;
 const audioHandle=(value:number|string)=>streamNames.get(Number(value))??value;
 installSourceSurfaces(rt);
 const host:NeoSceneHost={object,objectIndex:index=>{const name=namesByIndex.get(index);return name?objects[name]:undefined;},text:sourceText,scripts:{...neoEnemyUtilityScriptSources,...neoHostScripts,...attackScriptSources},room:'room_dw_mansion_b_east',
  battleBoundary:(_s,r)=>{r.pendingRoom='battle_end';},
  call:(name,s,r,args)=>{
   const g=r.globals;
   switch(name){
    case 'array_length':return args[0].length;
    case 'variable_instance_exists':return args[1] in (r.byId(Number(args[0]))??{});
    case 'variable_global_exists':return args[0] in g;
    case 'real':return Number(args[0]);
    case 'string_length':return String(args[0]).length;
    case 'string_char_at':return String(args[0])[args[1]-1]??'';
    case 'string_hash_to_newline':return String(args[0]).replace(/#/g,'\n');
    case 'scr_84_set_draw_font':r.drawState.font='fnt_'+args[0];return;
    case 'scr_monstersetup':return monsterSetup(s,r);
    case 'scr_nextact':return controller.nextAct(r);
    case 'scr_attackphase':return controller.attackPhase(r);
    case 'scr_spellmenu_setup':return spellMenuSetupChapter2(r);
    case 'scr_randomtarget':return controller.randomTarget(s,r);
    case 'scr_battletext_default':return writer.battleTextDefault(r).id;
    case 'scr_battletext':return writer.battleText(r).id;
    case 'scr_damage_enemy':return party.damageEnemy(s,r,args[0],args[1]);
    case 'scr_gameover':return battle.gameOver(r);
    case 'scr_wincombat':return controller.winCombat(r);
    case 'scr_get_input_name':return ['LEFT','UP','RIGHT','DOWN','Z','X','C'][args[0]];
    case 'snd_init':{const id=nextStream--;streamNames.set(id,String(args[0]).replace(/\.ogg$/,''));return id;}
    case 'snd_play':case 'snd_play_x':case 'snd_play_pitch':{
     const resource=streamNames.get(args[0])??args[0];
     if(typeof resource!=='string')throw Error(`Unknown sound resource ${resource}`);
     const pitch=name==='snd_play_x'?args[2]??1:args[1]??1,volume=name==='snd_play_x'?args[1]:undefined;
     if(r.sourceAudio)return r.sourceAudio.effect(resource,pitch,volume)??resource;
     r.sound?.(resource,pitch);return resource;
    }
    case 'snd_loop':return r.soundLoop?.(args[0]);
    case 'snd_stop':case 'audio_stop_sound':return r.soundStop?.(audioHandle(args[0]));
    case 'snd_pitch':pitches.set(args[0],args[1]);return r.soundPitch?.(audioHandle(args[0]),args[1]);
    case 'audio_sound_get_pitch':return pitches.get(args[0])??1;
    case 'snd_volume':case 'mus_volume':return r.sourceAudio?.volume(audioHandle(args[0]),args[1],args[2]??0);
    case 'snd_free':r.sourceAudio?.free(audioHandle(args[0]));streamNames.delete(args[0]);return;
    case 'mus_play':return r.sourceAudio?.music(streamNames.get(args[0])??args[0])??args[0];
    case 'mus_loop':return r.sourceAudio?.loop(audioHandle(args[0]));
    case 'snd_pause':return r.sourceAudio?.pause(audioHandle(args[0]));
    case 'snd_resume':return r.sourceAudio?.resume(audioHandle(args[0]));
    case 'snd_position':return r.sourceAudio?.position(audioHandle(args[0]),args[1]);
    case 'snd_is_playing':case 'audio_is_playing':return r.sourceAudio?.playing(audioHandle(args[0]))??false;
   }
   throw Error(`Chapter 2 host operation not implemented: ${name}`);
  },
 };
 // Unsupported world/optional resources retain native identity and ancestry, but
 // cannot enter a battle as a sprite-only placeholder.
 for(const m of neoResourceMetadata)objects[m.name]=createNeoSourceObject(host,m,{Create_0:`unavailable_source_object();`});
 const original:GmObjectDef[]=[];
 const collect=(value:any)=>{if(value&&typeof value==='object'&&typeof value.index==='number'&&typeof value.name==='string'){original.push(value);if(value.parent)collect(value.parent);}};
 for(const module of [battle,writer,controller,party,effects])for(const value of Object.values(module))collect(value);
 party.HERO_DEFS.forEach(collect);
 // Merge same-name wrapper events into a single definition. The actual Chapter 2
 // ancestry replaces the implementation wrapper's same-name parent chain.
 for(const old of original){const m=metadata.get(old.name);if(!m)continue;
  const existing=objects[m.name],events={...existing.events};delete events.create;
  let chain:GmObjectDef|undefined=old;const layers:GmObjectDef[]=[];
  while(chain?.name===old.name){layers.unshift(chain);chain=chain.parent;}
  for(const layer of layers)Object.assign(events,layer.events);
  const def=createNeoSourceObject(host,m,{});def.events=events;def.collisions=old.collisions;objects[m.name]=def;
 }
 // Full wrappers take priority over their bare implementation bases.
 for(const old of [controller.battleControllerFull,...party.HERO_DEFS]){
  const def=object(old.name);let chain:GmObjectDef|undefined=old;const layers:GmObjectDef[]=[];
  while(chain?.name===old.name){layers.unshift(chain);chain=chain.parent;}
  def.events={};for(const layer of layers)Object.assign(def.events,layer.events);
 }
 Object.assign(objects,createNeoPlayerObjects(host));
 objects.obj_spamton_neo_enemy=createNeoEnemy(host);Object.assign(objects,createNeoEnemyEffects(host));
 Object.assign(objects,createNeoAttackObjects(host));
 const projectiles=createNeoProjectiles({neo:object('obj_spamton_neo_enemy'),heart:object('obj_heart'),faceAttack:object('obj_sneo_faceattack'),finalForm:object('obj_sneo_final_forme'),wireheart:object('obj_sneo_wireheart')});
 for(const def of [projectiles.shot,projectiles.impact,projectiles.trail])objects[def.name]=def;
 Object.assign(objects,createNeoSceneObjects(host));
 for(const [name,record] of Object.entries(neoHostObjectSources))objects[name]=createNeoSourceObject(host,record.metadata,record.sources);
 for(const def of Object.values(objects))def.depth=metadata.get(def.name)?.depth??def.depth;
 rt.installObjectAliases(original.filter(old=>objects[old.name]).map(old=>[old,objects[old.name]] as const));
 rt.globals.onNeoMercyTurnEnd=(enemy:GmInstance)=>{enemy.endcon=1;};
 rt.globals.onChapter2SmallFace=(s:GmInstance,code:string)=>{Object.assign(s,{nextchar:'f',nextchar2:code,faced:0});executeNeoSource(neoWriterSmallFaceSource,s,rt,host);};
 return {host,objects,enter:(enemy:GmInstance)=>enterNeoBattleScene(rt,host,enemy)};
}
