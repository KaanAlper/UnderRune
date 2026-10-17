import fs from 'node:fs';
import {describe,it,expect} from 'vitest';
import {GmRuntime,type GmObjectDef,type GmInstance} from '../src/remake/gm/runtime';
import {spriteBank} from '../src/remake/gm/sprites';
import {createCapnEnemy} from '../src/remake/bosses/chapter2-rivals/trio-capn';
import {createMusicalScore} from '../src/remake/bosses/chapter2-rivals/musical-score';
import {createMusicalBullets} from '../src/remake/bosses/chapter2-rivals/musical-bullets';
import {enemyObjectInit} from '../src/remake/deltarune/chapter2-enemy';
import {darkener,growtangle,moveHeart,moveHeartIn} from '../src/remake/deltarune/battle';
import {randomTarget} from '../src/remake/deltarune/controller';
import {isPhase,blconSkip,turnTimer} from '../src/remake/deltarune/chapter2-battle';
import {battleBalloon2,enemyBlcon2} from '../src/remake/deltarune/chapter2-objects';
import {writer} from '../src/remake/deltarune/writer';
import {setSourceText} from '../src/remake/host/text';
import {executeNeoSource,type NeoSourceHost} from '../src/remake/bosses/spamton-neo/body-source';
const path='extracted/chapter2_windows/code/gml_Object_obj_hatguy_enemy_';
const state=(s:GmInstance)=>Object.fromEntries(Object.entries(s).filter(([k])=>!['layerEntry','frameCount'].includes(k)).map(([k,v])=>[k,k==='object'?v.name:v]));
function fixture(seed=11){
 const rt=new GmRuntime(spriteBank({atLeast2022_1:false,optionsInfo:0,sprites:[]}),{seed});
 rt.globals={chapter:2,flag:Array(1000).fill(0),fighting:1,darkzone:1,lang:'en',typer:4,fc:0,fe:0,msg:Array(100).fill(''),monster:[1,1,1],monsterhp:[120,120,120],monstermaxhp:[120,120,120],monstercomment:[' ',' ',' '],monsterstatus:[0,0,0],monsterat:[8,8,8],monstery:[40,90,200],battlemsg:['' ],monsterattackname:['','',''],myfight:0,mnfight:1,charcantarget:[1,1,1],targeted:[0,0,0],turntimer:0,bmenuno:0};
 const defs=new Map<string,GmObjectDef>([writer,darkener,growtangle,moveHeart,battleBalloon2].map(d=>[d.name,d]));const object=(name:string)=>{let d=defs.get(name);if(!d){d={name,index:5000+defs.size,depth:0};defs.set(name,d);}return d;};
 const def=createCapnEnemy(object);defs.set(def.name,def);const score=createMusicalScore(object);defs.set(score.name,score);for(const d of createMusicalBullets(object))defs.set(d.name,d);
 rt.restore(object('obj_battlecontroller'),99000,0,0,{depth:100});rt.restore(object('obj_sweet_enemy'),99001,460,40,{myself:0,dancing:false,actCounter:0,simultotal_funny:0,endcon:0,musical_bullet_difficulty:0});rt.restore(object('obj_kk_enemy'),99002,500,90,{myself:1,dancing:false});rt.restore(object('obj_musical_controller'),99003,460,40,{scon:0});
 const host:NeoSourceHost={object,text:k=>k,call:(name,s,r,args)=>{
  if(name==='scr_enemy_object_init')return enemyObjectInit(s,r);if(name==='scr_randomtarget')return randomTarget(s,r);if(name==='scr_isphase')return isPhase(r,args[0],s);if(name==='scr_blconskip')return blconSkip(s,r,args[0]);if(name==='scr_enemyblcon')return enemyBlcon2(s,r,args[0],args[1],args[2])!.id;if(name==='scr_turntimer')return turnTimer(r,args[0]);if(name==='scr_moveheart')return moveHeartIn(r);throw Error('Unexpected '+name);
 }};
 return {rt,object,def,host};
}
describe.skipIf(!fs.existsSync(path+'Create_0.gml'))('Capn source event comparisons',()=>{
 const step=fs.existsSync(path+'Step_0.gml')?fs.readFileSync(path+'Step_0.gml','utf8'):'';
 const texts=Object.fromEntries([...step.matchAll(/"(obj_hatguy_enemy_slash_Step_0_gml_[^"]+)"/g)].map(m=>[m[1],m[1]]));
 for(const seed of [0,11,9182]){
  it(`matches Create ${seed}`,()=>{const a=fixture(seed),b=fixture(seed),actual=a.rt.create(a.def,480,200),expected=b.rt.restore(b.def,actual.id,480,200);executeNeoSource(fs.readFileSync(path+'Create_0.gml','utf8'),expected,b.rt,b.host,undefined,'create');expect(a.rt.instances.map(state)).toEqual(b.rt.instances.map(state));});
  for(const dancing of [0,1])for(const susie of [0,1])it(`matches talk dancing ${dancing} Susie ${susie} seed ${seed}`,()=>{
   setSourceText(texts);try{const a=fixture(seed),b=fixture(seed),actual=a.rt.create(a.def,480,200),expected=b.rt.create(b.def,480,200);for(const s of [actual,expected])Object.assign(s,{myself:2,dancing,dancedwithsusie:susie});actual.object.events!.step!(actual,a.rt);executeNeoSource(step,expected,b.rt,b.host,undefined,'step');expect(a.rt.instances.map(state)).toEqual(b.rt.instances.map(state));expect(a.rt.globals).toEqual(b.rt.globals);expect(a.rt.random.snapshot()).toEqual(b.rt.random.snapshot());}finally{setSourceText({});}
  });
  for(const dancing of [0,1])for(const heal of [0,1])it(`matches attack dancing ${dancing} heal ${heal} seed ${seed}`,()=>{
   setSourceText(texts);try{const a=fixture(seed),b=fixture(seed),actual=a.rt.create(a.def,480,200),expected=b.rt.create(b.def,480,200);for(const [s,f] of [[actual,a],[expected,b]] as const){Object.assign(s,{myself:2,dancing,heal,rtimer:11});f.rt.globals.mnfight=2;f.rt.restore(growtangle,99004,320,206);}actual.object.events!.step!(actual,a.rt);executeNeoSource(step,expected,b.rt,b.host,undefined,'step');expect(a.rt.instances.map(state)).toEqual(b.rt.instances.map(state));expect(a.rt.globals).toEqual(b.rt.globals);expect(a.rt.random.snapshot()).toEqual(b.rt.random.snapshot());}finally{setSourceText({});}
  });
 }
});

