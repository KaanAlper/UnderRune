import {describe,expect,it} from 'vitest';
import fs from 'node:fs';
import {GmRuntime,resolveEvent,type GmInstance,type GmObjectDef} from '../src/remake/gm/runtime';
import type {SpriteBank} from '../src/remake/gm/sprites';
import {createQueenBulletController} from '../src/remake/bosses/queen/controller';
import {executeNeoSource,type NeoSourceHost} from '../src/remake/bosses/spamton-neo/body-source';
import {heroKris,moveHeart,moveHeartIn,heart} from '../src/remake/deltarune/battle';
const directory='extracted/chapter2_windows/code/';
const bank:SpriteBank={collisionCompat:true,roomSpeed:30,get:name=>({name,width:150,height:150,frames:12,originX:0,originY:0,bboxMode:1,left:0,right:149,top:0,bottom:149,sepMasks:0,special:false,playbackSpeed:0,playbackType:0})};
const read=(file:string)=>fs.readFileSync(directory+file+'.gml','utf8');
function scene(type:number,source=false){
 const defs:Record<string,GmObjectDef>={};const object=(name:string)=>defs[name]??={name,index:Object.keys(defs).length,sprite:'spr_grazemask',events:{create:s=>{
  if(name==='obj_queen_leg')Object.assign(s,{special:0,stomplerp:.1});if(name==='obj_queen_wineglass')s.prefill=0;
  if(name==='obj_queen_finger')s.scrollSpeed=4;
  if(name==='obj_queen_buffercontroller')Object.assign(s,{buffering:0,bufferbar:0,bufferdelay:90,bufferduration:75,songtime:0});
 }}};
 const rt=new GmRuntime(bank,{seed:31});rt.installObjectAliases([[heroKris,object('obj_herokris')],[moveHeart,object('obj_moveheart')],[heart,object('obj_heart')]]);
 rt.globals={chapter:2,monster:[1,0,0],monsterattackname:['attack','',''],monsterat:[10],turntimer:400,batmusic:[0,1],inv:-1};
 const sounds:any[][]=[];rt.sound=name=>{sounds.push(['snd_play',name]);};rt.soundLoop=name=>{sounds.push(['snd_loop',name]);return 0;};rt.soundPitch=(...args)=>{sounds.push(['snd_pitch',...args]);};
 const q=rt.create(object('obj_queen_enemy'),470,120);Object.assign(q,{myself:0,difficulty:0,beatwine2nodamage:0});
 const b=rt.create(object('obj_growtangle'),320,200);b.depth=5;
 rt.create(object('obj_heart'),320,210);rt.create(object('obj_herokris'),80,60);const bird=rt.create(object('obj_berdlyplug_enemy'),512,36);bird.con=0;
 const controller=createQueenBulletController(object);
 const host:NeoSourceHost={object,text:key=>key,scripts:Object.fromEntries(['scr_monsterattacknamecount','scr_bullet_create','scr_bullet_init','scr_queen_buffercheck','randomsign'].map(name=>[name,read('gml_GlobalScript_'+name)])),call:(name,_s,r,args)=>{
  if(name==='scr_moveheart')return moveHeartIn(r);
  if(name==='variable_instance_exists')return args[1] in _s;
  if(name==='button1_p'||name==='button2_h'||name==='button3_h')return false;
  if(name==='snd_play'){sounds.push([name,...args]);return 0;}if(name==='snd_loop'||name==='snd_pitch'){sounds.push([name,...args]);return;}
  throw Error('Unexpected source call '+name);
 }};
 const chosen=source?{...controller,events:{create:(self:GmInstance,r:GmRuntime)=>executeNeoSource(read('gml_Object_obj_queen_bulletcontroller_Create_0'),self,r,host)}}:controller;
 defs[chosen.name]=chosen;const s=rt.create(chosen,470,120);
 Object.assign(s,{type,damage:50,target:4,bufferattack:type===0?1:0,special:type===8?5:0});
 return {rt,s,object,controller,host,sounds};
}
function normalized(value:any):any{
 if(value&&typeof value==='object'&&'name' in value&&'index' in value)return value.name;
 if(Array.isArray(value))return value.map(normalized);if(value&&typeof value==='object')return Object.fromEntries(Object.entries(value).filter(([k,v])=>!['frameCount','layerEntry'].includes(k)&&!(k==='droplet'&&Array.isArray(v)&&v.length===0)).map(([k,v])=>[k,normalized(v)]));
 return value;
}
describe.skipIf(!fs.existsSync(directory+'gml_Object_obj_queen_bulletcontroller_Step_0.gml'))('Queen controller scheduling against installed source',()=>{
 it.each([0,1,2,2.1,2.2,3,3.1,3.2,3.3,3.4,4,5,6,6.1,7,7.5,8,9,100,101,102,105,106,107,110,111,112,113,114,115,116])('matches type %s child scheduling, all stored fields and RNG',type=>{
  const a=scene(type),b=scene(type,true),step=read('gml_Object_obj_queen_bulletcontroller_Step_0');
  expect(normalized(a.s)).toEqual(normalized(b.s));
  for(let frame=0;frame<210;frame++){
   if(frame===40&&[2,2.1,2.2].includes(type)){a.s.init=3;b.s.init=3;}
   if(frame===70||frame===90)for(const env of [a,b]){const buffer=env.rt.first(env.object('obj_queen_buffercontroller'));if(buffer)buffer.buffering=frame===70?1:0;}
   executeNeoSource(step,b.s,b.rt,b.host);resolveEvent(a.controller,'step')!(a.s,a.rt);
   expect(normalized(a.rt.instances),`type ${type}, frame ${frame}`).toEqual(normalized(b.rt.instances));
   expect(a.rt.random.snapshot(),`type ${type}, frame ${frame}`).toEqual(b.rt.random.snapshot());expect(a.rt.globals).toEqual(b.rt.globals);expect(a.sounds).toEqual(b.sounds);
  }
 });
});
