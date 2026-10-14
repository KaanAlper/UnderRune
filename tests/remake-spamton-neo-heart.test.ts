import {describe,it,expect} from 'vitest';
import fs from 'node:fs';
import {GmRuntime,resolveEvent,type GmObjectDef} from '../src/remake/gm/runtime';
import {createNeoPlayerObjects} from '../src/remake/bosses/spamton-neo/yellow-heart';
import {createNeoProjectiles} from '../src/remake/bosses/spamton-neo/shot';
import {neoPlayerSources} from '../src/remake/bosses/spamton-neo/player-source';
import {loadSprites} from './parity/reference';
import type {NeoSourceHost} from '../src/remake/bosses/spamton-neo/body-source';

function setup(bigshotcount=0){
 const rt=new GmRuntime(loadSprites(2),{seed:17});rt.globals={chapter:2,flag:Array(1000).fill(0),inv:-1,heartx:0,hearty:0,tension:0,maxtension:250,turntimer:500};
 const definitions:Record<string,GmObjectDef>={};for(const [n,index]of [['obj_spamton_neo_enemy',702],['obj_battlesolid',361],['obj_collidebullet',366],['obj_sneo_faceattack',634],['obj_sneo_final_forme',643],['obj_sneo_wireheart',640],['obj_battlecontroller',360]] as const)definitions[n]={name:n,index};
 const neo=rt.create(definitions.obj_spamton_neo_enemy,460,80);Object.assign(neo,{upgrade:0,bigshotcount,bigshotused:0});
 const audio:{name:string,args:any[]}[]=[];
 const host:NeoSourceHost={object:n=>{if(!definitions[n])throw Error('Missing test object '+n);return definitions[n];},text:()=>{throw Error('No player text expected');},call:(name,_s,_r,args)=>{
  if(name==='scr_armorcheck_equipped_party')return 0;
  if(name==='snd_loop'){audio.push({name,args});return 77;}
  if(['snd_play','snd_stop','snd_pitch','snd_volume'].includes(name)){audio.push({name,args});return;}
  throw Error('Unsupported test integration '+name);
 }};
 Object.assign(definitions,createNeoPlayerObjects(host));
 const shots=createNeoProjectiles({neo:definitions.obj_spamton_neo_enemy,heart:definitions.obj_heart,faceAttack:definitions.obj_sneo_faceattack,finalForm:definitions.obj_sneo_final_forme,wireheart:definitions.obj_sneo_wireheart});
 Object.assign(definitions,{obj_yheart_shot:shots.shot,obj_yshot_anim:shots.impact,obj_yheart_shot_afterimage:shots.trail});
 const heart=rt.create(definitions.obj_heart,200,160);heart.color=1;heart.sprite='spr_yellowheart';
 const frame=()=>{resolveEvent(heart.object,'step')!(heart,rt);resolveEvent(heart.object,'draw')!(heart,rt);rt.input.pressed.clear();rt.input.released.clear();};
 return {rt,heart,neo,definitions,audio,frame};
}
describe.skipIf(!fs.existsSync('extracted/chapter2_windows/sprites.json'))('original Chapter2 yellow soul',()=>{
 it('retains the complete archived events including actual cleanup and collision scripts',()=>{
  for(const r of neoPlayerSources)for(const [event,source]of Object.entries(r.sources))expect(source).toBe(fs.readFileSync(`extracted/chapter2_windows/code/gml_Object_${r.metadata.name}_${event}.gml`,'utf8'));
 });
 it('charges in twenty held frames, releases a big shot, then respects the five-frame delay',()=>{
  const {rt,heart,neo,definitions,frame,audio}=setup();rt.input.held.add(90);rt.input.pressed.add(90);
  for(let i=0;i<19;i++)frame();expect(heart.z_hold).toBe(38);expect(rt.count(definitions.obj_yheart_shot)).toBe(1);
  frame();expect(heart.z_hold).toBe(40);rt.input.held.clear();rt.input.released.add(90);frame();
  const shot=rt.all(definitions.obj_yheart_shot).at(-1)!;
  expect([shot.big,shot.hspeed,shot.imageXscale,shot.imageYscale,heart.chargeshot_delay,neo.bigshotused]).toEqual([1,8,Math.fround(.1),2,5,1]);
  expect(shot.friction).toBeCloseTo(-.4);expect(audio.some(a=>a.name==='snd_play'&&a.args[0]==='snd_chargeshot_fire')).toBe(true);
  rt.input.pressed.add(90);frame();expect(rt.count(definitions.obj_yheart_shot)).toBe(2);
  for(let i=0;i<3;i++)frame();rt.input.pressed.add(90);frame();expect(rt.count(definitions.obj_yheart_shot)).toBe(3);
 });
 it('caps regular shots at three and allows a release shot only inside the source hold range',()=>{
  const {rt,heart,definitions,frame}=setup();for(let i=0;i<4;i++){rt.input.pressed.add(90);frame();}expect(rt.count(definitions.obj_yheart_shot)).toBe(3);
  for(const s of rt.all(definitions.obj_yheart_shot))rt.destroy(s);heart.z_hold=8;rt.input.released.add(90);frame();expect(rt.count(definitions.obj_yheart_shot)).toBe(0);
  heart.z_hold=10;rt.input.released.add(90);frame();expect(rt.count(definitions.obj_yheart_shot)).toBe(1);
 });
 it('supercharge doubles charge speed, exhausts its counter and creates eight actual particles',()=>{
  const {rt,heart,neo,definitions,frame}=setup(1);rt.input.held.add(90);for(let i=0;i<10;i++)frame();expect(heart.z_hold).toBe(40);
  rt.input.held.clear();rt.input.released.add(90);frame();const shot=rt.all(definitions.obj_yheart_shot).at(-1)!;
  expect([shot.hspeed,shot.trail,neo.bigshotcount]).toEqual([20,1,0]);expect(rt.count(definitions.obj_yheart_sneo_particle)).toBe(8);expect(rt.count(definitions.obj_supercharge_end)).toBe(1);
  expect(rt.all(definitions.obj_yheart_sneo_particle).every(p=>p.speed===16&&p.imageXscale>=2&&p.imageYscale>=2)).toBe(true);
 });
 it('keeps movement gates, the delayed yellow speed change and cancel slowdown flag',()=>{
  const {rt,heart,frame}=setup();rt.input.held.add(39);frame();expect(heart.x).toBe(204);frame();expect(heart.x).toBe(209);
  heart.canmove=0;frame();expect(heart.x).toBe(209);heart.canmove=1;rt.input.held.add(88);frame();expect(heart.x).toBe(212);
  rt.globals.flag[22]=1;frame();expect(heart.x).toBe(217);
 });
 it('uses source voice charging pitch and volume ramps, and stops the charge loop on release',()=>{
  const {rt,audio,frame}=setup();rt.input.held.add(90);for(let i=0;i<12;i++)frame();
  expect(audio.find(a=>a.name==='snd_loop')!.args).toEqual(['snd_chargeshot_charge']);expect(audio.filter(a=>a.name==='snd_volume').map(a=>a.args)).toEqual([[77,0,0],[77,.3,20]]);
  expect(audio.some(a=>a.name==='snd_pitch'&&a.args[1]>.1)).toBe(true);rt.input.held.clear();frame();expect(audio.at(-1)).toEqual({name:'snd_stop',args:[77]});
 });
});
