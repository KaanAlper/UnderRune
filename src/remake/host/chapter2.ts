/** The engine registry for Chapter 2 and later: every object of the chapter (from its resource table), the shared
 * engine's objects in their places, and the source host's script calls. Boss factories and scene entry belong to
 * encounter adapters. */
import {type GmObjectDef,type GmInstance,type GmRuntime} from '../gm/runtime';
import * as battle from '../deltarune/battle';
import * as controller from '../deltarune/controller';
import * as party from '../deltarune/party';
import * as effects from '../deltarune/player-effects';
import * as writer from '../deltarune/writer';
import * as choices from '../deltarune/choicer';
import * as battleEnd from '../deltarune/battle-end';
import {monsterSetup} from '../deltarune/encounter';
import {spellMenuSetupChapter2} from '../deltarune/chapter2';
import {sourceText} from './text';
import type {NeoSourceHost,NeoSourceMetadata} from '../bosses/spamton-neo/body-source';
import {installSourceSurfaces} from './surfaces';
import {spareEnemy} from '../deltarune/chapter2-enemy';
import {recruitInfo} from '../deltarune/recruit-info';
export interface Chapter2RegistryHost extends NeoSourceHost{battleBoundary(scene:GmInstance,rt:GmRuntime):void;}
export interface Chapter2RegistryOptions{
 /** The chapter whose objects these are (2 by default). */
 chapter?:number;
 metadata:readonly NeoSourceMetadata[];scripts?:Readonly<Record<string,string>>;room:string;battleBoundary?:(scene:GmInstance,rt:GmRuntime)=>void;}
/** The path resources in each chapter's data.win (path_add numbers new paths after them). */
const PATH_RESOURCES:Readonly<Record<number,number>>={2:14,3:31};
export function createChapter2Registry(rt:GmRuntime,options:Chapter2RegistryOptions){
 const chapter=options.chapter??2;
 rt.paths.reserve(PATH_RESOURCES[chapter]??0);
 const objects:Record<string,GmObjectDef>={};
 const metadata=new Map(options.metadata.map(m=>[m.name,m]));
 const namesByIndex=new Map(options.metadata.map(m=>[m.index,m.name]));
 const object=(name:string)=>{const def=objects[name];if(!def)throw Error(`Chapter ${chapter} resource not registered: ${name}`);return def;};
 const resource=(meta:NeoSourceMetadata,unavailable=false):GmObjectDef=>{
  const def:GmObjectDef={name:meta.name,index:meta.index,depth:meta.depth,visible:meta.visible,sprite:meta.sprite??undefined,mask:meta.mask??undefined,events:unavailable?{create:()=>{throw Error(`Chapter ${chapter} object ${meta.name} is not implemented`);}}:{}};
  if(meta.parent)Object.defineProperty(def,'parent',{get:()=>object(meta.parent!),configurable:true});return def;
 };
 const streamNames=new Map<number,string>(),pitches=new Map<number|string,number>();let nextStream=-100;
 const audioHandle=(value:number|string)=>streamNames.get(Number(value))??value;
 rt.soundPitch??=(handle,pitch)=>{pitches.set(audioHandle(handle),pitch);rt.sourceAudio?.pitch?.(audioHandle(handle),pitch);};
 rt.soundGetPitch??=handle=>pitches.get(audioHandle(handle))??1;
 rt.soundFree??=handle=>{rt.sourceAudio?.free(audioHandle(handle));};
 installSourceSurfaces(rt);
 const host:Chapter2RegistryHost={object,objectIndex:index=>{const name=namesByIndex.get(index);return name?objects[name]:undefined;},text:sourceText,scripts:options.scripts,room:options.room,
  battleBoundary:options.battleBoundary??((_s,r)=>{r.pendingRoom='battle_end';}),
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
    case 'scr_nextact':return controller.nextAct(r,s);
    case 'scr_attackphase':return controller.attackPhase(r);
    case 'scr_spellmenu_setup':
     // Chapter 3 renames two spells while Elnina and Lanino's controller is up.
     if(chapter===3&&r.exists(object('obj_elnina_lanino_controller')))throw Error('scr_spellmenu_setup: Chapter 3 spell names during Elnina and Lanino are not ported');
     return spellMenuSetupChapter2(r,s);
    case 'scr_randomtarget':return controller.randomTarget(s,r);
    case 'scr_battletext_default':return writer.battleTextDefault(r,s).id;
    case 'scr_battletext':return writer.battleText(r,s).id;
    case 'scr_damage_enemy':return party.damageEnemy(s,r,args[0],args[1]);
    case 'scr_gameover':return battle.gameOver(r);
    case 'scr_wincombat':return controller.winCombat(r,s);
    case 'scr_get_input_name':return ['LEFT','UP','RIGHT','DOWN','Z','X','C'][args[0]];
    case 'snd_init':{
     const id=nextStream--,file=String(args[0]);streamNames.set(id,file.replace(/\.ogg$/,''));
     s.initsongvar='mus/'+file;s._mystream=id;const holder=r.create(object('obj_astream'),0,0);s._astream=holder.id;holder.mystream=id;holder.songname=file;return id;
    }
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
    case 'snd_free':{const freed=battle.sndFree(r,s,args[0]);if(!freed&&streamNames.has(args[0]))r.soundFree?.(args[0]);streamNames.delete(args[0]);return;}
    case 'mus_play':s._xsndinstance=r.sourceAudio?.music(streamNames.get(args[0])??args[0])??args[0];return s._xsndinstance;
    case 'mus_loop':s._xsndinstance=r.sourceAudio?.loop(audioHandle(args[0]))??args[0];return s._xsndinstance;
    case 'snd_pause':return r.sourceAudio?.pause(audioHandle(args[0]));
    case 'snd_resume':return r.sourceAudio?.resume(audioHandle(args[0]));
    case 'snd_position':return r.sourceAudio?.position(audioHandle(args[0]),args[1]);
    case 'snd_is_playing':case 'audio_is_playing':return r.sourceAudio?.playing(audioHandle(args[0]))??false;
   }
   throw Error(`Chapter ${chapter} host operation not implemented: ${name}`);
  },
 };
 // Unsupported world/optional resources retain native identity and ancestry, but
 // cannot enter a battle as a sprite-only placeholder.
 for(const m of options.metadata)objects[m.name]=resource(m,true);
 const original:GmObjectDef[]=[];
 const collect=(value:any)=>{if(value&&typeof value==='object'&&typeof value.index==='number'&&typeof value.name==='string'){original.push(value);if(value.parent)collect(value.parent);}};
 for(const module of [battle,writer,controller,party,effects,choices,battleEnd])for(const value of Object.values(module))collect(value);
 party.HERO_DEFS.forEach(collect);
 // Merge same-name wrapper events into a single definition. The actual Chapter 2
 // ancestry replaces the implementation wrapper's same-name parent chain.
 for(const old of original){const m=metadata.get(old.name);if(!m)continue;
  const existing=objects[m.name],events={...existing.events};delete events.create;
  let chain:GmObjectDef|undefined=old;const layers:GmObjectDef[]=[];
  while(chain?.name===old.name){layers.unshift(chain);chain=chain.parent;}
  for(const layer of layers)Object.assign(events,layer.events);
  const def=resource(m);def.events=events;def.collisions=old.collisions;objects[m.name]=def;
 }
 // Full wrappers take priority over their bare implementation bases.
 for(const old of [controller.battleControllerFull,...party.HERO_DEFS]){
  if(!metadata.has(old.name))continue;
  const def=object(old.name);let chain:GmObjectDef|undefined=old;const layers:GmObjectDef[]=[];
  while(chain?.name===old.name){layers.unshift(chain);chain=chain.parent;}
  def.events={};for(const layer of layers)Object.assign(def.events,layer.events);
 }
 // User event 15 (scr_monster_makeinstance): what the recruit menu knows about a recruitable enemy.
 const parent=object('obj_monsterparent');parent.events={...parent.events,user10:spareEnemy,user15:(s,r)=>{if(s.recruitable){recruitInfo(s,r,r.globals.monstertype[s.myself]);s.recruitcount=s._recruitcount;}}};
 const aliases:(readonly [GmObjectDef,GmObjectDef])[]=[];
 const register=(definitions:readonly GmObjectDef[],transform?:(def:GmObjectDef)=>GmObjectDef)=>{
  for(const source of definitions){
   const previous=objects[source.name],nativeParent=metadata.get(source.name)?.parent;
   const parent=source.parent?objects[source.parent.name]??source.parent:nativeParent?objects[nativeParent]:undefined;
   // Events run in object index order (per event, as the runner does), so a shared object takes this chapter's index.
   const index=metadata.get(source.name)?.index??source.index;
   const base=parent===source.parent&&index===source.index?source:{...source,parent,index},definition=transform?transform(base):base;
   objects[source.name]=definition;
   if(previous&&previous!==definition)aliases.push([previous,definition]);
   if(definition!==source)aliases.push([source,definition]);
  }
 };
 const finalize=(extraAliases:readonly (readonly [GmObjectDef,GmObjectDef])[]=[])=>{
  const allAliases=[...aliases,...extraAliases].map(([old,target])=>[old,objects[target.name]??target] as const);
  for(const def of Object.values(objects)){
   def.depth=metadata.get(def.name)?.depth??def.depth;
   // Source metadata definitions already resolve their parent through a live getter.
   const parentField=Object.getOwnPropertyDescriptor(def,'parent');
   if(!parentField?.get&&def.parent&&def.parent.name!==def.name)def.parent=objects[def.parent.name]??def.parent;
  }
  rt.installObjectAliases([...original.filter(old=>objects[old.name]&&!allAliases.some(([o])=>o===old)).map(old=>[old,objects[old.name]] as const),...allAliases]);
 };
 return {host,objects,object,register,finalize};
}
/** The same registry for any chapter from 2 on. */
export const createChapterRegistry=(rt:GmRuntime,options:Chapter2RegistryOptions&{chapter:number})=>createChapter2Registry(rt,options);
