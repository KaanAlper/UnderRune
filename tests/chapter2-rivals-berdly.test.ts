import fs from 'node:fs';
import {describe,it,expect} from 'vitest';
import {GmInstance,GmRuntime,type GmObjectDef} from '../src/remake/gm/runtime';
import {spriteBank} from '../src/remake/gm/sprites';
import {createBerdlyRematch} from '../src/remake/bosses/chapter2-rivals/berdly-rematch';
import {createBerdlyCoasterEnemy} from '../src/remake/bosses/chapter2-rivals/berdly-coaster-enemy';
import {berdlyRematchActs} from '../src/remake/bosses/chapter2-rivals/berdly-acts';
import {speaker,anyFaceNext,terminateWriter,enemyObjectInit,priorityTarget,heroBlcon,monsterPop} from '../src/remake/deltarune/chapter2-enemy';
import {darkener} from '../src/remake/deltarune/battle';
import {randomTarget} from '../src/remake/deltarune/controller';
import {enemyBlcon2,battleBalloon2} from '../src/remake/deltarune/chapter2-objects';
import {battleText,battleTextDefault,writer} from '../src/remake/deltarune/writer';
import {msgSet,msgNext,mercyAdd2,isPhase,blconSkip} from '../src/remake/deltarune/chapter2-battle';
import {setSourceText} from '../src/remake/host/text';
import {executeNeoSource,type NeoSourceHost} from '../src/remake/bosses/spamton-neo/body-source';
const path='extracted/chapter2_windows/code/gml_Object_obj_berdlyb2_enemy_';
const dialogue={speaker,faceNext:anyFaceNext,terminateWriter:(s:GmInstance,rt:GmRuntime)=>!!terminateWriter(s,rt)};
function fixture(route=0,seed=11,coaster=false){
 const rt=new GmRuntime(spriteBank({atLeast2022_1:false,optionsInfo:0,sprites:[]}),{seed});
 const flag=Array(1000).fill(0);flag[915]=route?5:0;
 rt.globals={chapter:2,flag,hp:[0,120,0,0,90],fighting:1,darkzone:1,lang:'en',typer:4,fc:0,fe:0,msg:Array(100).fill(''),monsterdf:[0],battlemag:[0,9,0],mercymod:[0],mercymax:[100],monsterx:[480],monstery:[144],hittarget:[0]};
 Object.assign(rt.globals,{monster:[1,0,0],monsterhp:[900],monstermaxhp:[900],myfight:0,mnfight:1,charcantarget:[1,1,0],targeted:[0,0,0],turntimer:0,bmenuno:0});
 const objects=new Map<string,GmObjectDef>([[writer.name,writer],[darkener.name,darkener],[battleBalloon2.name,battleBalloon2]]);const object=(name:string)=>{let v=objects.get(name);if(!v){v={name,index:4000+objects.size};objects.set(name,v);}return v;};
 const def=coaster?createBerdlyCoasterEnemy(object):createBerdlyRematch(object,{dialogue,monsterAdd:()=>{throw Error('Unexpected summon');},snowgraveScene:()=>{}});objects.set(def.name,def);
 const host:NeoSourceHost={object,text:k=>k,call:(name,s,r,args)=>{
  switch(name){
   case 'scr_enemy_object_init':return enemyObjectInit(s,r);
   case 'scr_speaker':return speaker(s,r,args[0]);
   case 'scr_anyface_next':return anyFaceNext(s,r,args[0],args[1]);
   case 'scr_battletext':return battleText(r,s).id;
   case 'scr_battletext_default':return battleTextDefault(r,s).id;
   case 'msgset':return msgSet(r,args[0],args[1]);
   case 'msgnext':return msgNext(r,args[0]);
   case 'scr_mercyadd':return mercyAdd2(s,r,args[0],args[1]);
   case 'scr_isphase':return isPhase(r,args[0],s);
   case 'scr_prioritytarget':return priorityTarget(s,r,...args);
   case 'scr_randomtarget':return randomTarget(s,r);
   case 'scr_monsterpop':return monsterPop(r);
   case 'scr_enemyblcon':return enemyBlcon2(s,r,args[0],args[1],args[2])!.id;
   case 'scr_heroblcon':{const b=heroBlcon(s,r,args[0]);return b?b.id:false;}
   case 'scr_blconskip':return blconSkip(s,r,args[0]);
   case 'scr_debug':return 0;
   default:throw Error(`Unexpected source script ${name}`);
  }
 }};
 return {rt,def,host};
}
function state(s:GmInstance){return Object.fromEntries(Object.entries(s).filter(([k])=>k!=='layerEntry'&&k!=='frameCount').map(([k,v])=>[k,k==='object'?v.name:v]));}
function source(event:string){return fs.readFileSync(path+event+'.gml','utf8');}
describe.skipIf(!fs.existsSync(path+'Create_0.gml'))('Berdly rematch compared with installed original',()=>{
 it('lets the coaster ending own defeat instead of the ordinary enemy disappearance',()=>{
  expect((fixture(0,11,true).def as import('../src/remake/deltarune/rules').HookedDef).hooks?.defeatedByDamage).toBe(false);
 });
 const step=fs.existsSync(path+'Step_0.gml')?source('Step_0'):'';
 const textKeys=[...step.matchAll(/"(obj_berdlyb2_enemy_slash_Step_0_gml_[^"]+)"/g)].map(m=>m[1]);
 const faceKeys=['scr_anyface_slash_scr_anyface_gml_23_0','scr_noface_slash_scr_noface_gml_1_0','scr_noeface_slash_scr_noeface_gml_1_0'];
 const texts=Object.fromEntries([...textKeys,...faceKeys].map(k=>[k,k]));
 for(const route of [0,1])it(`matches Create fields and RNG on route ${route}`,()=>{
  const a=fixture(route),b=fixture(route),actual=a.rt.create(a.def,470,144),expected=b.rt.restore(b.def,actual.id,470,144);
  executeNeoSource(source('Create_0').replaceAll('scr_sideb_get_phase()',String(route)),expected,b.rt,b.host,undefined,'create');
  expect(state(actual)).toEqual(state(expected));expect(a.rt.random.snapshot()).toEqual(b.rt.random.snapshot());
 });
 it('matches coaster enemy Create without overworld intro actors',()=>{
  const a=fixture(0,11,true),b=fixture(0,11,true),actual=a.rt.create(a.def,480,100),expected=b.rt.restore(b.def,actual.id,480,100);
  executeNeoSource(fs.readFileSync('extracted/chapter2_windows/code/gml_Object_obj_berdlyb_enemy_Create_0.gml','utf8'),expected,b.rt,b.host,undefined,'create');
  expect(state(actual)).toEqual(state(expected));expect(a.rt.random.snapshot()).toEqual(b.rt.random.snapshot());
 });
 for(const order of [0,1,2,3,4,5,6])for(const mercy of [0,25,75])it(`matches coaster talk order ${order}, mercy ${mercy}`,()=>{
  const original=fs.readFileSync('extracted/chapter2_windows/code/gml_Object_obj_berdlyb_enemy_Step_0.gml','utf8');
  setSourceText({...texts,...Object.fromEntries([...original.matchAll(/"(obj_berdlyb_enemy_slash_Step_0_gml_[^"]+)"/g)].map(m=>[m[1],m[1]]))});
  const a=fixture(0,11,true),b=fixture(0,11,true),actual=a.rt.create(a.def,480,100),expected=b.rt.create(b.def,480,100);
  for(const s of [actual,expected])Object.assign(s,{myself:0,init:1,balloonorder:order});a.rt.globals.mercymod[0]=mercy;b.rt.globals.mercymod[0]=mercy;
  actual.object.events!.step!(actual,a.rt);executeNeoSource(original,expected,b.rt,b.host,undefined,'step');
  expect(a.rt.instances.map(state)).toEqual(b.rt.instances.map(state));expect(a.rt.globals).toEqual(b.rt.globals);expect(a.rt.random.snapshot()).toEqual(b.rt.random.snapshot());
 });
 for(const [turn,con] of [[0,0],[1,0],[1,2],[2,0],[3,0],[3,2],[3,3],[3,5],[4,0],[4,2],[5,0],[5,2],[6,0]])it(`matches normal talk turn ${turn}, balloon state ${con}`,()=>{
  setSourceText(texts);const a=fixture(),b=fixture();const actual=a.rt.create(a.def,470,144),expected=b.rt.create(b.def,470,144);
  for(const s of [actual,expected])Object.assign(s,{myself:0,turns:turn,balloon_con:con});
  actual.object.events!.step!(actual,a.rt);executeNeoSource(step,expected,b.rt,b.host,undefined,'step');
  expect(a.rt.instances.map(state)).toEqual(b.rt.instances.map(state));expect(a.rt.globals).toEqual(b.rt.globals);expect(a.rt.random.snapshot()).toEqual(b.rt.random.snapshot());
 });
 for(const route of [0,1])for(const action of [1,2,3,4])for(const count of [0,1,2,10])it(`matches ACT ${action}, prior count ${count}, route ${route}`,()=>{
  setSourceText(texts);const a=fixture(route),b=fixture(route);const actual=a.rt.create(a.def,470,144),expected=b.rt.create(b.def,470,144);
  for(const s of [actual,expected])Object.assign(s,{myself:0,acting:action===4?0:action,actingnoe:action===4?1:0,actconnoe:action===4?1:0,kact_count:count,nact_count:count,naction_count:count,spill:count>1});
  a.rt.globals.myfight=3;b.rt.globals.myfight=3;
  berdlyRematchActs(actual,a.rt,dialogue,route);
  const start=step.indexOf('if (global.myfight == 3)'),end=step.indexOf('if (scr_debug())',start);
  executeNeoSource(step.slice(start,end).replaceAll('scr_sideb_get_phase()',String(route)),expected,b.rt,b.host,undefined,'step');
  expect(a.rt.instances.map(state)).toEqual(b.rt.instances.map(state));expect(a.rt.globals).toEqual(b.rt.globals);expect(a.rt.random.snapshot()).toEqual(b.rt.random.snapshot());
 });
});
